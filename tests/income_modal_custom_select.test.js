/**
 * Тест модального окна «+ Новый проект»
 * Проверка кастомного бумажного селекта, авто-наследования цвета и отсутствия чекбокса
 * Без внешних зависимостей.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('======================================================');
console.log(' Запуск тестов модалки «+ Новый проект» (Бумажный селект)');
console.log('======================================================\n');

// 1. Изолированная среда памяти
const storageMock = {};
global.localStorage = {
  getItem: (k) => (Object.prototype.hasOwnProperty.call(storageMock, k) ? storageMock[k] : null),
  setItem: (k, v) => { storageMock[k] = String(v); },
  removeItem: (k) => { delete storageMock[k]; },
  clear: () => { Object.keys(storageMock).forEach((k) => delete storageMock[k]); }
};
global.sessionStorage = global.localStorage;
global.window = global;

const createdElements = {};
function createMockElement(id, tag = 'div') {
  const el = {
    id: id,
    tagName: tag.toUpperCase(),
    value: '',
    checked: true,
    style: {
      display: 'block',
      setProperty: function (k, v) { this[k] = v; },
      removeProperty: function (k) { delete this[k]; }
    },
    classList: {
      _classes: new Set(),
      add: function (c) { this._classes.add(c); },
      remove: function (c) { this._classes.delete(c); },
      contains: function (c) { return this._classes.has(c); },
      toggle: function (c) {
        if (this._classes.has(c)) { this._classes.delete(c); return false; }
        else { this._classes.add(c); return true; }
      }
    },
    _innerHTML: '',
    get innerHTML() { return this._innerHTML; },
    set innerHTML(val) {
      this._innerHTML = val;
      // При обновлении innerHTML парсим id элементов
      const idMatches = val.matchAll(/id=["']([^"']+)["']/g);
      for (const m of idMatches) {
        if (!createdElements[m[1]]) {
          createMockElement(m[1]);
        }
      }
    },
    innerText: '',
    textContent: '',
    children: [],
    attributes: {},
    setAttribute: function (k, v) { this.attributes[k] = String(v); },
    removeAttribute: function (k) { delete this.attributes[k]; },
    getAttribute: function (k) { return this.attributes[k] || null; },
    appendChild: function (c) { this.children.push(c); return c; },
    querySelector: function (sel) {
      if (sel.startsWith('#')) {
        const targetId = sel.slice(1);
        return createdElements[targetId] || null;
      }
      return null;
    },
    querySelectorAll: function (sel) {
      return [];
    },
    addEventListener: function (evt, handler) { this['on' + evt] = handler; },
    removeEventListener: function () {},
    click: function () { if (this.onclick) this.onclick({ preventDefault: () => {}, stopPropagation: () => {} }); },
    focus: function () {}
  };
  if (id) createdElements[id] = el;
  return el;
}

global.document = {
  addEventListener: () => {},
  getElementById: (id) => createdElements[id] || createMockElement(id),
  querySelector: (sel) => {
    if (sel.startsWith('#')) return createdElements[sel.slice(1)] || null;
    return null;
  },
  querySelectorAll: () => [],
  createElement: (tag) => createMockElement(null, tag),
  body: createMockElement('body')
};

// Загружаем app.js
const appJsModule = require('../app.js');

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✕ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Проверка экспорта MyTablesIncome
test('1. MyTablesIncome экспортирован и содержит необходимые методы', () => {
  assert(global.window.MyTablesIncome, 'window.MyTablesIncome должен существовать');
  assert.strictEqual(typeof global.window.MyTablesIncome.openAddProjectModal, 'function', 'openAddProjectModal должен быть функцией');
  assert.strictEqual(typeof global.window.MyTablesIncome.getAvailableClients, 'function', 'getAvailableClients должен быть функцией');
});

// 2. Проверка сбора клиентов getAvailableClients
test('2. getAvailableClients собирает клиентов из базы MyTablesClients и projects', () => {
  global.window.MyTablesClients = {
    getActiveClients: () => [
      { name: 'Мария Соколова', color: 'peach' },
      { name: 'ООО Вектор', color: 'blue' }
    ]
  };
  global.window.allData = {
    clients: [
      { name: 'ИП Смирнов', color: 'lavender' }
    ]
  };

  const list = global.window.MyTablesIncome.getAvailableClients();
  assert(Array.isArray(list), 'list должен быть массивом');
  const names = list.map(c => c.name);
  assert(names.includes('Мария Соколова'), 'Мария Соколова должна присутствовать');
  assert(names.includes('ООО Вектор'), 'ООО Вектор должен присутствовать');
  assert(names.includes('ИП Смирнов'), 'ИП Смирнов должен присутствовать');

  const maria = list.find(c => c.name === 'Мария Соколова');
  assert.strictEqual(maria.color, 'peach', 'Цвет Марии должен быть peach');
});

// 3. Проверка верстки openAddProjectModal
test('3. openAddProjectModal генерирует верстку без нативного <select> и без чекбокса', () => {
  global.window.MyTablesIncome.openAddProjectModal();
  const overlay = createdElements['mytables-income-overlay'];
  assert(overlay, 'Оверлей должен существовать');
  const html = overlay.innerHTML;

  // Проверяем кастомный селект
  assert(html.includes('class="custom-select"'), 'Блок .custom-select должен присутствовать');
  assert(html.includes('class="custom-select-trigger"'), 'Кнопка .custom-select-trigger должна присутствовать');
  assert(html.includes('class="custom-select-val"'), 'Элемент .custom-select-val должен присутствовать');
  assert(html.includes('class="custom-select-dropdown"'), 'Список .custom-select-dropdown должен присутствовать');

  // Нативные селекты должны отсутствовать
  assert(!html.includes('<select'), 'Нативный <select> должен полностью отсутствовать');

  // Чекбокс и дата оплаты должны отсутствовать
  assert(!html.includes('inc-modal-paid-now'), 'Чекбокс #inc-modal-paid-now должен полностью отсутствовать');
  assert(!html.includes('inc-modal-date-wrap'), 'Блок даты #inc-modal-date-wrap должен полностью отсутствовать');

  // Палитра кружочков должна отсутствовать
  assert(!html.includes('palette-circle'), 'Кружочки выбора цвета должны отсутствовать');
  assert(!html.includes('golden-palette-row'), 'Контейнер палитры должен отсутствовать');

  // Поля ввода названия и стоимости
  assert(html.includes('id="inc-modal-name"'), 'Поле #inc-modal-name должно присутствовать');
  assert(html.includes('id="inc-modal-total"'), 'Поле #inc-modal-total должно присутствовать');

  // Скрытые поля для тестов и формы
  assert(html.includes('id="inc-modal-client"'), 'Скрытое поле #inc-modal-client должно присутствовать');
  assert(html.includes('id="inc-proj-color"'), 'Скрытое поле #inc-proj-color должно присутствовать');
});

// 4. Проверка создания проекта с автонаследованием цвета клиента
test('4. Создание проекта с клиентом наследует цвет', () => {
  // Добавляем проект через addProject
  const proj = global.window.MyTablesIncome.addProject({
    client: 'Мария Соколова',
    project: 'Дизайн мобильного приложения',
    totalCost: 120000,
    color: 'peach'
  });

  assert.strictEqual(proj.client, 'Мария Соколова');
  assert.strictEqual(proj.project, 'Дизайн мобильного приложения');
  assert.strictEqual(proj.totalCost, 120000);
  assert.strictEqual(proj.color, 'peach', 'Проект должен получить цвет peach');
});

console.log(`\n======================================================`);
console.log(`ИТОГО: Пройдено: ${passed}, Ошибок: 0`);
console.log(`======================================================\n`);
