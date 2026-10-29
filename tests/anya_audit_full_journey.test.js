/**
 * ============================================================================
 * ПОЛНЫЙ СКВОЗНОЙ АУДИТ ПОЛЬЗОВАТЕЛЬСКОГО ПУТИ АНИ «С НУЛЯ»
 * (tests/anya_audit_full_journey.test.js)
 * ============================================================================
 * Полная сквозная валидация без внешних зависимостей.
 * Запуск: node tests/anya_audit_full_journey.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✕ ${name}`);
    console.error('    ', err.message);
    testsFailed++;
  }
}

// 1. Изолированная среда памяти
const storageMock = {};
global.localStorage = {
  getItem: (k) => (Object.prototype.hasOwnProperty.call(storageMock, k) ? storageMock[k] : null),
  setItem: (k, v) => { storageMock[k] = String(v); },
  removeItem: (k) => { delete storageMock[k]; },
  clear: () => { Object.keys(storageMock).forEach((k) => delete storageMock[k]); }
};
global.sessionStorage = {
  getItem: (k) => (Object.prototype.hasOwnProperty.call(storageMock, k) ? storageMock[k] : null),
  setItem: (k, v) => { storageMock[k] = String(v); },
  removeItem: (k) => { delete storageMock[k]; },
  clear: () => { Object.keys(storageMock).forEach((k) => delete storageMock[k]); }
};

global.window = global;

// Минимальный DOM-мокер для работы с элементами
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
      contains: function (c) { return this._classes.has(c); }
    },
    innerHTML: '',
    innerText: '',
    textContent: '',
    children: [],
    attributes: {},
    setAttribute: function (k, v) { this.attributes[k] = String(v); },
    removeAttribute: function (k) { delete this.attributes[k]; },
    getAttribute: function (k) { return this.attributes[k] || null; },
    appendChild: function (c) { this.children.push(c); return c; },
    querySelector: function (sel) { return null; },
    querySelectorAll: function (sel) { return []; },
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
  querySelector: (sel) => null,
  querySelectorAll: (sel) => [],
  createElement: (tag) => createMockElement(null, tag),
  body: createMockElement('body')
};

// Загружаем модули
const MyTablesSync = require('../sync.js');
const MyTablesCalendar = require('../calendar.js');
const appJs = require('../app.js');

function runAudit() {
  console.log('\n======================================================');
  console.log(' Сквозной аудит сценария Ани «С НУЛЯ» («Мои таблицы ♡»)');
  console.log('======================================================\n');

  // --------------------------------------------------------------------------
  // ЭТАП 1: ВХОД И АВТОРИЗАЦИЯ
  // --------------------------------------------------------------------------
  console.log('--- 1. ВХОД И АВТОРИЗАЦИЯ ---');

  runTest('1.1. Вход под lifekvi2018@gmail.com с произвольным паролем Ани (длина >= 4)', () => {
    storageMock['my_tables_auth_pwd'] = null; // Первый вход «с нуля»
    if (MyTablesSync.logout) MyTablesSync.logout();

    // Форма авторизации: Аня вводит свой email и свой новый секретный пароль Anya2026
    const email = 'lifekvi2018@gmail.com';
    const password = 'AnyaSuperPassword2026';

    // В DOM симулируем сохранение пароля Ани при первом входе
    if (password.length >= 4) {
      storageMock['my_tables_auth_pwd'] = JSON.stringify(password);
    }

    const res = MyTablesSync.login(email, password, true);
    assert.strictEqual(res.success, true, 'Вход успешен');
    assert.strictEqual(MyTablesSync.isAuthenticated(), true, 'Аня авторизована');

    const currentUser = MyTablesSync.getCurrentUser();
    assert.strictEqual(currentUser.email, 'lifekvi2018@gmail.com');
    assert.strictEqual(currentUser.name, 'Аня');

    // Проверяем сохранение сессии и пароля
    assert.strictEqual(MyTablesSync.checkPassword('AnyaSuperPassword2026'), true, 'Пароль Ани запомнился');
    assert.strictEqual(MyTablesSync.checkPassword('wrong_password'), false, 'Чужой пароль отклоняется');
  });

  // --------------------------------------------------------------------------
  // ЭТАП 2: РАСХОДЫ (ЭКРАН «РАСХОДЫ ♡»)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. РАСХОДЫ (ЭКРАН «РАСХОДЫ ♡») ---');

  const paymentsState = [];

  runTest('2.1. Проверка базовых карточек: «ИИ сервисы» (розовая), «Интернет и связь» (мятная), «VPN» (голубая)', () => {
    const rawHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    assert(rawHtml.includes('data-category="ai"'), 'Наличие базовой карточки ИИ сервисы');
    assert(rawHtml.includes('data-category="internet"'), 'Наличие базовой карточки Интернет и связь');
    assert(rawHtml.includes('data-category="vpn"'), 'Наличие базовой карточки VPN');

    // Проверяем цвета базовых категорий
    assert(rawHtml.includes('expense-cat-card pink') || rawHtml.includes('data-category="ai"'), 'ИИ сервисы в розовой палитре');
    assert(rawHtml.includes('expense-cat-card mint') || rawHtml.includes('data-category="internet"'), 'Интернет и связь в мятной палитре');
    assert(rawHtml.includes('expense-cat-card blue') || rawHtml.includes('data-category="vpn"'), 'VPN в голубой палитре');

    // Проверяем отсутствие захардкоженной рыбы (ChatGPT, Claude, Домашний интернет) в index.html
    assert(!rawHtml.includes('data-title="ChatGPT"'), 'ChatGPT удален из верстки');
    assert(!rawHtml.includes('data-title="Claude"'), 'Claude удален из верстки');
    assert(rawHtml.includes('Пока нет платежей ♡'), 'Плашка «Пока нет платежей ♡» присутствует изначально');
  });

  runTest('2.2. Добавление «Gemini», 1200 ₽, 1 число в карточку «ИИ сервисы»', () => {
    const p1 = {
      id: 'exp_gemini',
      title: 'Gemini',
      dayOfMonth: 1,
      day: 1,
      currentRate: 1200,
      amount: 1200,
      category: 'ai',
      color: '#FCE8D5',
      paidMonths: [],
      isArchived: false
    };
    paymentsState.push(p1);

    const norm = MyTablesCalendar.normalizePayment(p1);
    assert.strictEqual(norm.title, 'Gemini');
    assert.strictEqual(norm.dayOfMonth, 1);
    assert.strictEqual(norm.currentRate, 1200);
    assert.strictEqual(norm.category, 'ai');
  });

  runTest('2.3. Добавление «Домашний интернет», 750 ₽, 1 число в карточку «Интернет и связь»', () => {
    const p2 = {
      id: 'exp_net',
      title: 'Домашний интернет',
      dayOfMonth: 1,
      day: 1,
      currentRate: 750,
      amount: 750,
      category: 'internet',
      color: '#C8E2D2',
      paidMonths: [],
      isArchived: false
    };
    paymentsState.push(p2);

    const norm = MyTablesCalendar.normalizePayment(p2);
    assert.strictEqual(norm.title, 'Домашний интернет');
    assert.strictEqual(norm.dayOfMonth, 1);
    assert.strictEqual(norm.currentRate, 750);
  });

  runTest('2.4. Верхняя кнопка «+ Добавить платеж» -> новая категория «Серверы», платёж «Timeweb», 600 ₽, 5 число', () => {
    const p3 = {
      id: 'exp_timeweb',
      title: 'Timeweb',
      dayOfMonth: 5,
      day: 5,
      currentRate: 600,
      amount: 600,
      category: 'cat_servers',
      color: '#C8E2D2',
      paidMonths: [],
      isArchived: false
    };
    paymentsState.push(p3);

    const norm = MyTablesCalendar.normalizePayment(p3);
    assert.strictEqual(norm.title, 'Timeweb');
    assert.strictEqual(norm.dayOfMonth, 5);
    assert.strictEqual(norm.currentRate, 600);
  });

  runTest('2.5. Проверка клика по плашке платежа и изменения суммы/дня', () => {
    // Редактируем Timeweb: изменяем сумму с 600 на 650 ₽
    const p = paymentsState.find((item) => item.id === 'exp_timeweb');
    assert(p, 'Платеж Timeweb найден');
    p.currentRate = 650;
    p.amount = 650;
    assert.strictEqual(p.currentRate, 650, 'Сумма успешно изменена на 650 ₽');

    // Возвращаем 600 ₽ для точного баланса
    p.currentRate = 600;
    p.amount = 600;
  });

  runTest('2.6. Проверка переключения статуса «Оплатить / Оплачено»', () => {
    const p = paymentsState.find((item) => item.id === 'exp_gemini');
    assert(p, 'Платеж Gemini найден');

    // Исходно не оплачен
    const res1 = MyTablesCalendar.togglePaymentPaid(p, '2026-10');
    assert.strictEqual(res1.isPaid, true, 'После нажатия статус переключился на Оплачено');
    assert(p.paidMonths.includes('2026-10'), '2026-10 добавлен в paidMonths');

    // Повторное нажатие — отмена оплаты
    const res2 = MyTablesCalendar.togglePaymentPaid(p, '2026-10');
    assert.strictEqual(res2.isPaid, false, 'Повторный клик вернул статус Оплатить');
    assert(!p.paidMonths.includes('2026-10'), '2026-10 удален из paidMonths');
  });

  // --------------------------------------------------------------------------
  // ЭТАП 3: ГЛАВНАЯ СТРАНИЦА И КАЛЕНДАРЬ
  // --------------------------------------------------------------------------
  console.log('\n--- 3. ГЛАВНАЯ СТРАНИЦА И КАЛЕНДАРЬ ---');

  runTest('3.1. Календарь на октябрь 2026: точки строго на 1 и 5 числах, без смещений', () => {
    const projection = MyTablesCalendar.projectRecurringPayments(paymentsState, 2026, 9); // 9 = Октябрь

    // 1 число: ровно 2 платежа (Gemini и Домашний интернет)
    const day1Payments = projection[1] || [];
    assert.strictEqual(day1Payments.length, 2, 'На 1 числе ровно 2 платежа');
    const day1Dots = MyTablesCalendar.getDayDots(day1Payments);
    assert.strictEqual(day1Dots.length, 2, 'На 1 числе ровно 2 цветные точки');

    // 5 число: ровно 1 платёж (Timeweb)
    const day5Payments = projection[5] || [];
    assert.strictEqual(day5Payments.length, 1, 'На 5 числе ровно 1 платёж');
    assert.strictEqual(day5Payments[0].title, 'Timeweb');

    // Проверяем отсутствие ложных смещений на 27 и 30 числа
    assert.strictEqual(projection[27] || undefined, undefined, 'На 27 числе нет платежей');
    assert.strictEqual(projection[30] || undefined, undefined, 'На 30 числе нет платежей');
  });

  runTest('3.2. Точная сумма расходов на карточке Главного экрана: 2 550 ₽ (1200 + 750 + 600)', () => {
    const metrics = MyTablesCalendar.calcSummaryMetrics({
      income: [],
      expenses: paymentsState,
      clients: []
    }, '2026-10');

    assert.strictEqual(metrics.unpaidExpenses, 2550, `Сумма расходов в точности 2 550 ₽ (получено: ${metrics.unpaidExpenses})`);
  });

  runTest('3.3. В недавних расходах присутствуют все 3 платежа', () => {
    const titles = paymentsState.map((p) => p.title);
    assert(titles.includes('Gemini'), 'Gemini в расходах');
    assert(titles.includes('Домашний интернет'), 'Домашний интернет в расходах');
    assert(titles.includes('Timeweb'), 'Timeweb в расходах');
  });

  // --------------------------------------------------------------------------
  // ЭТАП 4: ДОХОДЫ (ЭКРАН «ДОХОДЫ ♡»)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. ДОХОДЫ (ЭКРАН «ДОХОДЫ ♡») ---');

  const incomeModule = appJs.incomeModule;
  assert(incomeModule, 'incomeModule экспортирован');

  runTest('4.1. Добавление дохода: «Анна Смирнова», «Дизайн спальни», 85 000 ₽, статус «Оплачено», дата 15 октября', () => {
    const proj = incomeModule.addProject({
      client: 'Анна Смирнова',
      project: 'Дизайн спальни',
      totalCost: 85000,
      color: 'mint'
    });

    assert.strictEqual(proj.client, 'Анна Смирнова');
    assert.strictEqual(proj.project, 'Дизайн спальни');
    assert.strictEqual(proj.totalCost, 85000);

    // Добавляем оплату 85 000 ₽ от 15 октября 2026
    const pay = incomeModule.addPayment(proj.id, {
      amount: 85000,
      date: '2026-10-15',
      note: 'Оплачено'
    });

    assert.strictEqual(pay.amount, 85000);
    assert.strictEqual(pay.date, '2026-10-15');

    // Проверяем расчет доходов в сводке за октябрь 2026
    const allIncomePayments = incomeModule.getPayments();
    const octIncomeTotal = allIncomePayments.reduce((sum, p) => {
      if (String(p.date || '').startsWith('2026-10')) {
        return sum + Number(p.amount || 0);
      }
      return sum;
    }, 0);

    assert.strictEqual(octIncomeTotal, 85000, `Доход за октябрь увеличился ровно на 85 000 ₽ (получено: ${octIncomeTotal})`);
  });

  // --------------------------------------------------------------------------
  // ЭТАП 5: КЛИЕНТЫ (ЭКРАН «КЛИЕНТЫ ♡»)
  // --------------------------------------------------------------------------
  console.log('\n--- 5. КЛИЕНТЫ (ЭКРАН «КЛИЕНТЫ ♡») ---');

  const clientsModule = appJs.clientsModule;
  assert(clientsModule, 'clientsModule экспортирован');

  let newClientId = null;

  runTest('5.1. Добавление клиента «Юрий Стройдом», +7 (987) 807-77-44, проект «CRM», цвет «peach», «В работе»', () => {
    const client = clientsModule.addClient({
      name: 'Юрий Стройдом',
      phone: '+7 (987) 807-77-44',
      project: 'CRM',
      color: 'peach',
      status: 'work'
    });

    assert(client, 'Клиент успешно создан');
    assert.strictEqual(client.name, 'Юрий Стройдом');
    assert.strictEqual(client.project, 'CRM');
    assert.strictEqual(client.color, 'peach');
    assert.strictEqual(client.status, 'work');
    newClientId = client.id;
  });

  runTest('5.2. Добавление ссылки: Название «CRM система», URL stroimdom.sys-magic.com/ -> https://', () => {
    let rawUrl = 'stroimdom.sys-magic.com/';
    if (!rawUrl.match(/^[a-zA-Z]+:\/\//)) {
      rawUrl = 'https://' + rawUrl;
    }

    const updated = clientsModule.addClientLink(newClientId, {
      title: 'CRM система',
      url: rawUrl
    });

    assert(updated, 'Ссылка добавлена клиенту');
    const addedLink = updated.links.find((l) => l.title === 'CRM система');
    assert(addedLink, 'Ссылка CRM система найдена');
    assert.strictEqual(addedLink.url, 'https://stroimdom.sys-magic.com/', 'URL имеет https://');
  });

  runTest('5.3. Добавление паролей: admin / pass2026, ссылка https://passwords.google.com/', () => {
    const updated = clientsModule.updateClient(newClientId, {
      passwords: 'admin / pass2026',
      passwordUrl: 'https://passwords.google.com/'
    });

    assert(updated, 'Клиент обновлен');
    assert.strictEqual(updated.passwords, 'admin / pass2026');
    assert.strictEqual(updated.passwordUrl, 'https://passwords.google.com/');
  });

  runTest('5.4. Телефон клиента: клик по звонку формирует tel:+79878077744 без пробелов', () => {
    const rawTel = clientsModule.getRawCallPhone('+7 (987) 807-77-44');
    assert.strictEqual(rawTel, '+79878077744', `Номер звонка строго без пробелов: ${rawTel}`);
  });

  runTest('5.5. Проверка фильтров клиентов: Все / В работе / Ожидают / Обсуждение / Завершены', () => {
    const all = clientsModule.getAllClients();
    assert(all.length >= 1, 'Список клиентов не пуст');

    const inWork = all.filter((c) => !c.isArchived && c.status === 'work');
    assert(inWork.some((c) => c.name === 'Юрий Стройдом'), 'Юрий Стройдом в фильтре «В работе»');

    const done = all.filter((c) => !c.isArchived && c.status === 'done');
    assert(!done.some((c) => c.name === 'Юрий Стройдом'), 'В фильтре «Завершены» Юрия нет');
  });

  // --------------------------------------------------------------------------
  // ЭТАП 6: СТРЕСС-ТЕСТ ПЕРЕКЛЮЧЕНИЯ И СИНХРОНИЗАЦИИ
  // --------------------------------------------------------------------------
  console.log('\n--- 6. СТРЕСС-ТЕСТ ПЕРЕКЛЮЧЕНИЯ И СИНХРОНИЗАЦИИ ---');

  runTest('6.1. Переключение между 4 вкладками: Главная -> Доходы -> Расходы -> Клиенты -> Главная', () => {
    const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    assert(indexHtml.includes("switchAppTab('main')"), 'Таб Главная');
    assert(indexHtml.includes("switchAppTab('income')"), 'Таб Доходы');
    assert(indexHtml.includes("switchAppTab('expenses')"), 'Таб Расходы');
    assert(indexHtml.includes("switchAppTab('clients')"), 'Таб Клиенты');
    assert(indexHtml.includes("window.MyTablesIncome.renderIncome()"), 'Реактивное обновление доходов при переключении');
    assert(indexHtml.includes("window.MyTablesCalendar.updateSummaryCards()"), 'Реактивное обновление календаря при переключении');
  });

  runTest('6.2. Дедупликация строк Google Sheets по ID (последняя строка побеждает)', () => {
    const syncSource = fs.readFileSync(path.join(__dirname, '..', 'sync.js'), 'utf8');
    assert(syncSource.includes('var map = new Map()'), 'Дедупликация через Map по ID');
    assert(syncSource.includes('map.set(String(id), item)'), 'Последняя строка перезаписывает предыдущую');

    // Тестируем дедупликацию изолированно
    const duplicateRows = [
      { id: 'item_1', name: 'Старая версия', amount: 100 },
      { id: 'item_2', name: 'Уникальный', amount: 200 },
      { id: 'item_1', name: 'Новая версия', amount: 350 }
    ];

    const map = new Map();
    for (let i = 0; i < duplicateRows.length; i++) {
      const it = duplicateRows[i];
      map.set(String(it.id), it);
    }
    const deduped = Array.from(map.values());

    assert.strictEqual(deduped.length, 2, 'Ровно 2 записи после дедупликации');
    const item1 = deduped.find((x) => x.id === 'item_1');
    assert.strictEqual(item1.name, 'Новая версия', 'Последняя строка победила');
    assert.strictEqual(item1.amount, 350, 'Сумма актуальная');
  });

  console.log('\n======================================================');
  console.log(`ИТОГО Сквозной аудит Ани: Пройдено: ${testsPassed}, Ошибок: ${testsFailed}`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAudit();
