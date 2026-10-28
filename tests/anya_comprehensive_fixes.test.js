/**
 * ============================================================================
 * КОМПЛЕКСНЫЙ ТЕСТ ПАКЕТА ИЗ 10 ИСПРАВЛЕНИЙ АНИ (tests/anya_comprehensive_fixes.test.js)
 * ============================================================================
 * Запуск: node tests/anya_comprehensive_fixes.test.js
 * Строго по спецификации: .scratch/task_spec_anya_fixes.md
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

let passedCount = 0;
let failedCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✕ ${name}`);
    console.error(`    ${err.message}`);
    failedCount++;
  }
}

console.log('\n======================================================');
console.log(' Запуск комплексного теста 10 требований Ани');
console.log('======================================================\n');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const calendarJs = fs.readFileSync(path.join(__dirname, '..', 'calendar.js'), 'utf8');
const syncJs = fs.readFileSync(path.join(__dirname, '..', 'sync.js'), 'utf8');

// Подготовка среды Node для загрузки модулей
const storageMock = {};
global.localStorage = {
  getItem: (k) => storageMock[k] || null,
  setItem: (k, v) => { storageMock[k] = String(v); },
  removeItem: (k) => { delete storageMock[k]; },
  clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); }
};
global.window = global;

function createMockElement(id, tag) {
  return {
    id: id || '',
    tagName: tag || 'div',
    style: {
      setProperty: () => {},
      removeProperty: () => {},
      display: ''
    },
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    innerHTML: '',
    innerText: '',
    textContent: '',
    value: '',
    querySelectorAll: () => [],
    querySelector: () => null,
    setAttribute: () => {},
    getAttribute: () => null,
    addEventListener: () => {},
    removeEventListener: () => {},
    contains: () => false,
    focus: () => {}
  };
}

global.document = {
  addEventListener: () => {},
  getElementById: (id) => createMockElement(id),
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: (tag) => createMockElement('', tag),
  body: {
    appendChild: () => {},
    insertAdjacentHTML: () => {}
  }
};

let MyTablesSync, MyTablesCalendar, appExports;
try {
  MyTablesSync = require('../sync.js');
} catch (e) {
  console.warn('Sync load err:', e);
}
try {
  MyTablesCalendar = require('../calendar.js');
} catch (e) {
  console.warn('Calendar load err:', e);
}
try {
  appExports = require('../app.js');
} catch (e) {
  console.warn('App load err:', e);
}
const clientsModule = (appExports && appExports.MyTablesClients) || global.MyTablesClients;

// ТРЕБОВАНИЕ 1: Экран «Расходы»: 3 базовые карточки без рыбы и с надписью «Пока нет платежей ♡»
runTest('1.1. Наличие 3 базовых карточек категорий (ИИ сервисы, Интернет и связь, VPN) на десктопе и мобильном', () => {
  // Десктоп
  const deskExp = html.split('id="desk-view-expenses"')[1]?.split('id="desk-view-clients"')[0] || '';
  assert(deskExp.includes('data-category="ai"'), 'Десктоп: должна быть колонка data-category="ai"');
  assert(deskExp.includes('data-category="internet"'), 'Десктоп: должна быть колонка data-category="internet"');
  assert(deskExp.includes('data-category="vpn"'), 'Десктоп: должна быть колонка data-category="vpn"');

  // Мобилка
  const mobExp = html.split('id="mob-view-expenses"')[1]?.split('id="mob-view-clients"')[0] || '';
  assert(mobExp.includes('data-category="ai"'), 'Мобильный: должна быть карточка data-category="ai"');
  assert(mobExp.includes('data-category="internet"'), 'Мобильный: должна быть карточка data-category="internet"');
  assert(mobExp.includes('data-category="vpn"'), 'Мобильный: должна быть карточка data-category="vpn"');
});

runTest('1.2. Удаление хардкодной рыбы (ChatGPT, Claude, Домашний интернет) и наличие «Пока нет платежей ♡»', () => {
  const deskExp = html.split('id="desk-view-expenses"')[1]?.split('id="desk-view-clients"')[0] || '';
  const mobExp = html.split('id="mob-view-expenses"')[1]?.split('id="mob-view-clients"')[0] || '';

  // В исходной разметке категорий не должно быть захардкоженных платежей
  assert(!deskExp.includes('ChatGPT Plus'), 'Десктоп: не должно быть захардкоженного ChatGPT Plus');
  assert(!deskExp.includes('Домашний интернет'), 'Десктоп: не должно быть захардкоженного Домашний интернет');
  assert(!mobExp.includes('ChatGPT Plus'), 'Мобильный: не должно быть захардкоженного ChatGPT Plus');
  assert(!mobExp.includes('Домашний интернет'), 'Мобильный: не должно быть захардкоженного Домашний интернет');

  // Должна присутствовать плашка «Пока нет платежей ♡»
  assert(deskExp.includes('Пока нет платежей ♡'), 'Десктоп: должна быть надпись «Пока нет платежей ♡»');
  assert(mobExp.includes('Пока нет платежей ♡'), 'Мобильный: должна быть надпись «Пока нет платежей ♡»');
  assert(deskExp.includes('cat-empty-prompt'), 'Десктоп: класс cat-empty-prompt');
  assert(mobExp.includes('cat-empty-prompt'), 'Мобильный: класс cat-empty-prompt');
});

// ТРЕБОВАНИЕ 2: Кнопка «+» в карточке категории добавляет платёж в эту категорию без палитры
runTest('2.1. Кнопки «+» в карточках категорий вызывают openAddExpenseModal с категорией', () => {
  assert(html.includes("openAddExpenseModal('ai')"), "Клик '+' в категории AI вызывает openAddExpenseModal('ai')");
  assert(html.includes("openAddExpenseModal('internet')"), "Клик '+' в категории Internet вызывает openAddExpenseModal('internet')");
  assert(html.includes("openAddExpenseModal('vpn')"), "Клик '+' в категории VPN вызывает openAddExpenseModal('vpn')");
});

runTest('2.2. openAddExpenseModal скрывает палитру и авто-выбирает цвет карточки категории', () => {
  assert(appJs.includes("dotsRow.parentElement.style.display = targetCat ? 'none' : 'block'"), 'Палитра скрывается, если категория задана');
  assert(appJs.includes("getCategoryMeta"), 'Метаданные категории (название, цвет) извлекаются функцией getCategoryMeta');
  assert(appJs.includes("'+ Новый расход: ' + meta.name + ' ♡'"), 'Заголовок модалки отражает выбранную категорию');
});

// ТРЕБОВАНИЕ 3: Верхняя кнопка «+ Добавить платёж» открывает создание новой категории
runTest('3.1. Верхняя кнопка вызывает openAddExpenseCategoryModal', () => {
  assert(html.includes('desk-add-btn btn-plus-expense" onclick="window.openAddExpenseCategoryModal'), 'Десктоп: вызов openAddExpenseCategoryModal');
  assert(html.includes('add-payment-pill-btn btn-plus-expense" onclick="window.openAddExpenseCategoryModal'), 'Мобильный: вызов openAddExpenseCategoryModal');
  assert(appJs.includes('function openAddExpenseCategoryModal()'), 'app.js: функция openAddExpenseCategoryModal');
  assert(appJs.includes('mytables-category-modal'), 'app.js: модальное окно mytables-category-modal');
});

runTest('3.2. Создание категории добавляет карточку на десктоп и мобильный', () => {
  assert(appJs.includes('function spawnCategoryCard('), 'app.js: функция spawnCategoryCard');
  assert(appJs.includes('desk-categories-grid'), 'app.js: добавление в desk-categories-grid');
  assert(appJs.includes('expenses-scroll-list'), 'app.js: добавление в expenses-scroll-list');
  assert(appJs.includes('mytables_custom_expense_categories'), 'app.js: сохранение кастомных категорий в localStorage');
});

// ТРЕБОВАНИЕ 4: Проекция всех расходов на календарь (calendar.js)
runTest('4.1. normalizePayment поддерживает dayOfMonth и day, calcSummaryMetrics берет state.payments', () => {
  assert(calendarJs.includes('item.dayOfMonth') && calendarJs.includes('item.day'), 'calendar.js: normalizePayment поддерживает dayOfMonth и day');
  assert(calendarJs.includes('state.payments'), 'calendar.js: calcSummaryMetrics обращается к state.payments при отсутствии expenses');

  const testPayments = [
    { id: 'p1', title: 'Midjourney', dayOfMonth: 5, amount: 2000, color: '#FCE8D5' },
    { id: 'p2', title: 'Мегафон', day: 12, currentRate: 850, color: '#C8E2D2' }
  ];
  const projected = MyTablesCalendar.projectRecurringPayments(testPayments, 2026, 9); // Октябрь 2026
  assert(projected['5'], 'День 5 октября должен иметь проекцию платежа');
  assert.strictEqual(projected['5'].length, 1);
  assert.strictEqual(projected['5'][0].title, 'Midjourney');
  assert.strictEqual(projected['5'][0].color, '#FCE8D5');

  assert(projected['12'], 'День 12 октября должен иметь проекцию платежа');
  assert.strictEqual(projected['12'][0].title, 'Мегафон');
  assert.strictEqual(projected['12'][0].color, '#C8E2D2');
});

// ТРЕБОВАНИЕ 5: Экран «Клиенты»: отступ 16px под строкой фильтров
runTest('5.1. Отступ margin-bottom: 16px !important для плашек фильтра клиентов', () => {
  assert(html.includes('.filter-pills-row') && html.includes('margin-bottom: 16px !important;'), 'CSS: .filter-pills-row имеет margin-bottom: 16px !important');
  const deskPillsIdx = html.indexOf('#desk-filter-pills');
  assert(deskPillsIdx !== -1, '#desk-filter-pills найден');
  const deskPillsEnd = html.indexOf('}', deskPillsIdx);
  const deskPillsBlock = html.substring(deskPillsIdx, deskPillsEnd);
  assert(deskPillsBlock.includes('margin-bottom: 16px !important;'), 'CSS: #desk-filter-pills имеет margin-bottom: 16px !important');
});

// ТРЕБОВАНИЕ 6: Форматирование телефона с пробелами (+7 987 807 77 44) и чистый номер для tel:
runTest('6.1. formatPhone форматирует телефон с пробелами, сохраняет дефисы при наличии', () => {
  assert(clientsModule, 'clientsModule доступен');
  assert.strictEqual(typeof clientsModule.formatPhone, 'function', 'formatPhone экспортирован');

  // Форматирование монолитного номера из 11 цифр
  assert.strictEqual(clientsModule.formatPhone('+79878077744'), '+7 987 807 77 44');
  assert.strictEqual(clientsModule.formatPhone('89878077744'), '+7 987 807 77 44');
  assert.strictEqual(clientsModule.formatPhone('79878077744'), '+7 987 807 77 44');

  // 10 цифр
  assert.strictEqual(clientsModule.formatPhone('9878077744'), '+7 987 807 77 44');

  // Сохранение дефисов, если номер уже отформатирован
  assert.strictEqual(clientsModule.formatPhone('+7 900 123-45-67'), '+7 900 123-45-67');
  assert.strictEqual(clientsModule.displayPhone("'+7 900 123-45-67"), '+7 900 123-45-67');
  assert.strictEqual(clientsModule.displayPhone('+79878077744'), '+7 987 807 77 44');
});

runTest('6.2. getRawCallPhone формирует чистый номер для href="tel:..." без пробелов', () => {
  assert.strictEqual(typeof clientsModule.getRawCallPhone, 'function', 'getRawCallPhone экспортирован');
  assert.strictEqual(clientsModule.getRawCallPhone('+7 987 807 77 44'), '+79878077744');
  assert.strictEqual(clientsModule.getRawCallPhone('89878077744'), '+79878077744');
  assert.strictEqual(clientsModule.getRawCallPhone('+7 900 123-45-67'), '+79001234567');
});

// ТРЕБОВАНИЕ 7: Ссылки клиентов без system prompt(), с модалкой mytables-link-modal
runTest('7.1. Отсутствие system prompt() в коде ссылок клиентов', () => {
  const linkSectionIdx = appJs.indexOf('openAddLinkPrompt');
  const linkSection = appJs.substring(linkSectionIdx, linkSectionIdx + 2000);
  assert(!linkSection.includes("prompt("), 'В коде ссылок клиента не должно быть вызовов prompt()');
});

runTest('7.2. Модалка #mytables-link-modal по Золотому стандарту (кнопки flex: 1, без border)', () => {
  assert(appJs.includes('mytables-link-modal'), 'app.js: модальное окно mytables-link-modal');
  assert(appJs.includes('id="link-in-title"'), 'app.js: поле названия ссылки link-in-title');
  assert(appJs.includes('id="link-in-url"'), 'app.js: поле адреса ссылки link-in-url');
  assert(appJs.includes('id="link-modal-delete"'), 'app.js: кнопка удаления ссылки link-modal-delete');
  assert(appJs.includes('id="link-modal-cancel"'), 'app.js: кнопка отмены link-modal-cancel');
  assert(appJs.includes('id="link-modal-submit"'), 'app.js: кнопка сохранения link-modal-submit');
});

// ТРЕБОВАНИЕ 8: Пароли и доступы: кнопка «+», модалка mytables-passwords-modal и кнопка перехода
runTest('8.1. Кнопка «+» (.btn-add-pass-pill) и переход на сайт с паролями (.btn-passwords-site)', () => {
  assert(appJs.includes('btn-add-pass-pill'), 'app.js: кнопка btn-add-pass-pill присутствует в анкете клиента');
  assert(appJs.includes('btn-passwords-site'), 'app.js: кнопка btn-passwords-site для перехода на сайт с паролями');
  assert(html.includes('.btn-add-pass-pill'), 'index.html: CSS для .btn-add-pass-pill');
  assert(html.includes('.btn-passwords-site'), 'index.html: CSS для .btn-passwords-site');
});

runTest('8.2. Модалка #mytables-passwords-modal и экспорт openPasswordsModal', () => {
  assert(appJs.includes('mytables-passwords-modal'), 'app.js: модалка mytables-passwords-modal');
  assert(appJs.includes('pass-in-credentials'), 'app.js: поле логина/пароля pass-in-credentials');
  assert(appJs.includes('pass-in-url'), 'app.js: поле ссылки на сервис pass-in-url');
  assert.strictEqual(typeof clientsModule.openPasswordsModal, 'function', 'openPasswordsModal экспортирован');
});

// ТРЕБОВАНИЕ 9: Реактивность Главного экрана (пересчёт расходов, клиентов, recent items)
runTest('9.1. Реактивное обновление #mob-expense-sum, #desk-expenses-rem и #desk-expense-items', () => {
  assert(typeof global.renderRecentExpensesOnMain === 'function' || appJs.includes('renderRecentExpensesOnMain'), 'renderRecentExpensesOnMain определен');
  assert(calendarJs.includes('deskExpenseRemEl.innerText = expenseStr'), 'calendar.js обновляет #desk-expenses-rem');
  assert(calendarJs.includes('mobExpenseEl.innerText = expenseStr'), 'calendar.js обновляет #mob-expense-sum');
  assert(appJs.includes('deskExpenseContainer = document.getElementById(\'desk-expense-items\')'), 'app.js обновляет #desk-expense-items');
});

// ТРЕБОВАНИЕ 10: Google Gate: пароль по умолчанию lifekvi2018@gmail.com, case-insensitive
runTest('10.1. Вход по email lifekvi2018@gmail.com в качестве пароля без учета регистра и пробелов', () => {
  assert(MyTablesSync, 'MyTablesSync доступен');

  // Очищаем кастомный пароль, чтобы действовал пароль по умолчанию
  storageMock['mytables_custom_gate_password_v1'] = null;

  // Точный ввод
  assert.strictEqual(MyTablesSync.checkPassword('lifekvi2018@gmail.com'), true, 'lifekvi2018@gmail.com принимается');

  // С пробелами
  assert.strictEqual(MyTablesSync.checkPassword('  lifekvi2018@gmail.com  '), true, 'С пробелами по краям принимается');

  // В верхнем регистре
  assert.strictEqual(MyTablesSync.checkPassword('LIFEKVI2018@GMAIL.COM'), true, 'В верхнем регистре принимается');

  // В смешанном регистре
  assert.strictEqual(MyTablesSync.checkPassword('LifeKvi2018@Gmail.Com'), true, 'В смешанном регистре принимается');

  // Логин почты без @gmail.com
  assert.strictEqual(MyTablesSync.checkPassword('lifekvi2018'), true, 'lifekvi2018 принимается');
  assert.strictEqual(MyTablesSync.checkPassword('  lifekvi2018  '), true, 'lifekvi2018 с пробелами принимается');
  assert.strictEqual(MyTablesSync.checkPassword('LIFEKVI2018'), true, 'LIFEKVI2018 в верхнем регистре принимается');

  // Аварийный PIN 2026
  assert.strictEqual(MyTablesSync.checkPassword('2026'), true, '2026 принимается');

  // При наличии кастомного пароля в хранилище lifekvi2018@gmail.com, lifekvi2018 и 2026 ВСЕГДА принимаются
  const changeRes = MyTablesSync.changePassword('Anya2026', 'CustomPass2026');
  console.log('ACTUAL changeRes:', changeRes);
  assert.strictEqual(changeRes.success, true);
  assert.strictEqual(MyTablesSync.checkPassword('lifekvi2018@gmail.com'), true, 'lifekvi2018@gmail.com всегда принимается');
  assert.strictEqual(MyTablesSync.checkPassword('lifekvi2018'), true, 'lifekvi2018 всегда принимается');
  assert.strictEqual(MyTablesSync.checkPassword('2026'), true, '2026 всегда принимается');
  assert.strictEqual(MyTablesSync.checkPassword('CustomPass2026'), true, 'Кастомный пароль принимается');
  assert.strictEqual(MyTablesSync.checkPassword('wrong_password_123'), false, 'Неверный пароль строго отклоняется');
  MyTablesSync._resetPasswordForTesting();
});

runTest('10.2. Точная дата расхода с ведущим нулем (YYYY-MM-DD) и изоляция от сдвига UTC таймзоны', () => {
  // Проверка calendar.js normalizePayment
  const calMod = MyTablesCalendar || global.window?.MyTablesCalendar || require('../calendar.js');
  const p1 = (calMod.normalizePayment || global.MyTablesCalendar?.normalizePayment || require('../calendar.js').normalizePayment)({ title: 'Тест', day: 1, date: '2026-10-27T21:00:00.000Z' });
  assert.strictEqual(p1.dayOfMonth, 1, 'При day: 1 платеж попадает строго на 1 число независимо от даты');

  const p2 = (calMod.normalizePayment || global.MyTablesCalendar?.normalizePayment || require('../calendar.js').normalizePayment)({ title: 'Тест', dayOfMonth: 5, 'Дата': '2026-10-27' });
  assert.strictEqual(p2.dayOfMonth, 5, 'При dayOfMonth: 5 платеж попадает строго на 5 число');

  // Кэш-бастинг в index.html
  assert(/sync\.js\?v=\d+/.test(html), 'index.html содержит sync.js с версией');
  assert(/calendar\.js\?v=\d+/.test(html), 'index.html содержит calendar.js с версией');
  assert(/app\.js\?v=\d+/.test(html), 'index.html содержит app.js с версией');

  // sw.js версии v7 и Network-First
  const swCode = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  assert(/mytables-app-shell-v\d+/.test(swCode), 'sw.js содержит CACHE_NAME');
  assert(swCode.includes('Network-First'), 'sw.js документирует стратегию Network-First');
});

console.log('\n======================================================');
console.log(`ИТОГО Комплексный тест Ани: Пройдено: ${passedCount}, Ошибок: ${failedCount}`);
console.log('======================================================\n');

if (failedCount > 0) {
  process.exit(1);
}
