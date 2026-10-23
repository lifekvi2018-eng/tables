/**
 * ============================================================================
 * ТЕСТЫ СТЕЙДЖА 1: ГЛАВНЫЙ ЭКРАН И КАЛЕНДАРЬ (tests/stage1_calendar.test.js)
 * ============================================================================
 * Запуск: node tests/stage1_calendar.test.js
 * Строго по TDD-плану PLANS/STAGE_1_MAIN_SCREEN.md
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  return Promise.resolve()
    .then(() => fn())
    .then(() => {
      console.log(`  ✓ ${name}`);
      testsPassed++;
    })
    .catch((err) => {
      console.error(`  ✕ ${name}`);
      console.error('    ', err.message);
      testsFailed++;
    });
}

// Загружаем модуль календаря
let MyTablesCalendar;
try {
  MyTablesCalendar = require('../calendar.js');
} catch (e) {
  // При TDD на первом шаге файл еще может отсутствовать
  MyTablesCalendar = null;
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log(' Запуск TDD-тестов Стейджа 1 («Мои таблицы ♡»)');
  console.log('======================================================\n');

  // Тест 1: test_calendar_month_switch
  await runTest('test_calendar_month_switch: расчет дней и дня недели начала месяца при переключении < и >', () => {
    assert(MyTablesCalendar, 'Модуль calendar.js должен быть создан и экспортирован');

    // Февраль 2025 (обычный год) = 28 дней
    assert.strictEqual(MyTablesCalendar.getDaysInMonth(2025, 1), 28, 'Февраль 2025 должен иметь 28 дней');

    // Февраль 2024 (високосный год) = 29 дней
    assert.strictEqual(MyTablesCalendar.getDaysInMonth(2024, 1), 29, 'Февраль 2024 должен иметь 29 дней');

    // Ноябрь 2026 = 30 дней
    assert.strictEqual(MyTablesCalendar.getDaysInMonth(2026, 10), 30, 'Ноябрь 2026 должен иметь 30 дней');

    // Октябрь 2026 = 31 день
    assert.strictEqual(MyTablesCalendar.getDaysInMonth(2026, 9), 31, 'Октябрь 2026 должен иметь 31 день');

    // День недели начала месяца (Пн=0, Вт=1, Ср=2, Чт=3, Пт=4, Сб=5, Вс=6)
    // 1 октября 2026 года — четверг (индекс 3)
    const firstDayOct2026 = MyTablesCalendar.getFirstDayOfWeek(2026, 9);
    assert.strictEqual(firstDayOct2026, 3, '1 октября 2026 должно начинаться с четверга (индекс 3)');

    // 1 февраля 2026 года — воскресенье (индекс 6)
    const firstDayFeb2026 = MyTablesCalendar.getFirstDayOfWeek(2026, 1);
    assert.strictEqual(firstDayFeb2026, 6, '1 февраля 2026 должно начинаться с воскресенья (индекс 6)');

    // Переключение стрелочками «<» и «>»
    // Назад из января 2026 -> декабрь 2025
    const prevFromJan = MyTablesCalendar.navigateMonth(2026, 0, -1);
    assert.deepStrictEqual(prevFromJan, { year: 2025, monthIndex: 11 });

    // Вперед из декабря 2026 -> январь 2027
    const nextFromDec = MyTablesCalendar.navigateMonth(2026, 11, 1);
    assert.deepStrictEqual(nextFromDec, { year: 2027, monthIndex: 0 });

    // Шаг вперед внутри года (март -> апрель)
    const nextInYear = MyTablesCalendar.navigateMonth(2026, 2, 1);
    assert.deepStrictEqual(nextInYear, { year: 2026, monthIndex: 3 });
  });

  // Тест 2: test_recurring_payments_projection_and_short_months
  await runTest('test_recurring_payments_projection_and_short_months: проекция на короткие месяцы и 31 число', () => {
    assert(MyTablesCalendar, 'calendar.js не загружен');

    const testPayments = [
      { id: 'exp_1', title: 'VPN', dayOfMonth: 15, currentRate: 1200, isArchived: false, color: '#D3E7F8' },
      { id: 'exp_2', title: 'Сервер', dayOfMonth: 31, currentRate: 500, isArchived: false, color: '#FCE8D5' },
      { id: 'exp_3', title: 'Архивный платёж', dayOfMonth: 15, currentRate: 300, isArchived: true, color: '#DBCCE9' }
    ];

    // Октябрь 2026 (31 день)
    const octProjection = MyTablesCalendar.projectRecurringPayments(testPayments, 2026, 9);
    assert.strictEqual(octProjection[15].length, 1, '15 октября должен быть 1 активный платёж');
    assert.strictEqual(octProjection[15][0].id, 'exp_1');
    assert.strictEqual(octProjection[31].length, 1, '31 октября должен содержать платёж на 31 число');
    assert.strictEqual(octProjection[31][0].id, 'exp_2');

    // Ноябрь 2026 (30 дней) — 31 число проецируется на 30-е
    const novProjection = MyTablesCalendar.projectRecurringPayments(testPayments, 2026, 10);
    assert.strictEqual(novProjection[30].length, 1, 'В ноябре платёж на 31-е число должен попасть на 30-е');
    assert.strictEqual(novProjection[30][0].id, 'exp_2');
    assert.strictEqual(novProjection[31], undefined, 'В ноябре 30 дней, 31-го числа нет');

    // Февраль 2026 (28 дней) — 31 число проецируется на 28-е
    const feb2026Projection = MyTablesCalendar.projectRecurringPayments(testPayments, 2026, 1);
    assert.strictEqual(feb2026Projection[28].length, 1, 'В феврале 2026 платёж на 31-е число должен попасть на 28-е');
    assert.strictEqual(feb2026Projection[28][0].id, 'exp_2');

    // Февраль 2024 (29 дней) — 31 число проецируется на 29-е
    const feb2024Projection = MyTablesCalendar.projectRecurringPayments(testPayments, 2024, 1);
    assert.strictEqual(feb2024Projection[29].length, 1, 'В феврале 2024 платёж на 31-е число должен попасть на 29-е');
    assert.strictEqual(feb2024Projection[29][0].id, 'exp_2');

    // Архивный платёж (exp_3) не должен попадать ни в один день
    for (const day in octProjection) {
      assert(octProjection[day].every(p => !p.isArchived), 'Архивные платежи не должны проецироваться');
    }
  });

  // Тест 3: test_twin_dots_on_same_day
  await runTest('test_twin_dots_on_same_day: массив из двух цветов при совпадении двух платежей на одну дату', () => {
    assert(MyTablesCalendar, 'calendar.js не загружен');

    const paymentsOnSameDay = [
      { id: 'exp_1', title: 'VPN', color: '#D3E7F8' },
      { id: 'exp_2', title: 'Интернет', color: '#FCD6CF' }
    ];

    const dots = MyTablesCalendar.getDayDots(paymentsOnSameDay);
    assert.strictEqual(Array.isArray(dots), true, 'Результат должен быть массивом');
    assert.strictEqual(dots.length, 2, 'При совпадении двух платежей должно быть 2 кружочка');
    assert.strictEqual(dots[0], '#D3E7F8');
    assert.strictEqual(dots[1], '#FCD6CF');

    // Проверка для одного платежа
    const singleDot = MyTablesCalendar.getDayDots([paymentsOnSameDay[0]]);
    assert.strictEqual(singleDot.length, 1);
    assert.strictEqual(singleDot[0], '#D3E7F8');

    // Проверка для пустого дня
    const noDots = MyTablesCalendar.getDayDots([]);
    assert.strictEqual(noDots.length, 0);
  });

  // Тест 4: test_popover_multi_items
  await runTest('test_popover_multi_items: клик по дате формирует поповер со ссылкой shopUrl и кнопкой оплаты', () => {
    assert(MyTablesCalendar, 'calendar.js не загружен');

    const payments = [
      {
        id: 'exp_1',
        title: 'VPN (телефон)',
        currentRate: 1200,
        shopUrl: 'https://vpn.example.com/pay',
        paidMonths: ['2026-10']
      },
      {
        id: 'exp_2',
        title: 'Домашний интернет',
        currentRate: 800,
        shopUrl: 'https://internet.example.com',
        paidMonths: []
      }
    ];

    const popoverData = MyTablesCalendar.buildPopoverData(payments, '2026-10');
    assert.strictEqual(popoverData.length, 2, 'Поповер должен содержать 2 элемента');

    // Элемент 1 (оплачен в октябре)
    assert.strictEqual(popoverData[0].title, 'VPN (телефон)');
    assert.strictEqual(popoverData[0].amount, 1200);
    assert.strictEqual(popoverData[0].shopUrl, 'https://vpn.example.com/pay');
    assert.strictEqual(popoverData[0].isPaid, true);
    assert.strictEqual(popoverData[0].buttonText, '✓ Оплачено');

    // Элемент 2 (не оплачен в октябре)
    assert.strictEqual(popoverData[1].title, 'Домашний интернет');
    assert.strictEqual(popoverData[1].amount, 800);
    assert.strictEqual(popoverData[1].shopUrl, 'https://internet.example.com');
    assert.strictEqual(popoverData[1].isPaid, false);
    assert.strictEqual(popoverData[1].buttonText, 'Оплатить');
  });

  // Тест 5: test_mark_paid_toggle_in_viewed_month
  await runTest('test_mark_paid_toggle_in_viewed_month: переключение статуса оплаты в контексте viewedYearMonth и пересчет расходов', () => {
    assert(MyTablesCalendar, 'calendar.js не загружен');

    const item = {
      id: 'exp_1',
      title: 'VPN',
      currentRate: 1200,
      paidMonths: ['2026-09'] // оплачен в сентябре, но не в ноябре
    };

    const viewedMonth = '2026-11';

    // 1. Нажимаем «Оплатить» в контексте ноября
    const step1 = MyTablesCalendar.togglePaymentPaid(item, viewedMonth);
    assert.strictEqual(step1.isPaid, true, 'После нажатия статус должен стать оплаченным');
    assert(item.paidMonths.includes('2026-11'), 'Ноябрь должен добавиться в paidMonths');
    assert(item.paidMonths.includes('2026-09'), 'Сентябрь должен сохраниться в paidMonths');

    // 2. Повторное нажатие (toggle / отмена)
    const step2 = MyTablesCalendar.togglePaymentPaid(item, viewedMonth);
    assert.strictEqual(step2.isPaid, false, 'После повторного нажатия статус должен вернуться в неоплаченный');
    assert(!item.paidMonths.includes('2026-11'), 'Ноябрь должен быть удален из paidMonths');
    assert(item.paidMonths.includes('2026-09'), 'Сентябрь по-прежнему сохранен');

    // 3. Реактивный пересчет остатка расходов для ноября
    const sampleData = {
      expenses: [item],
      income: [],
      clients: []
    };

    // Сейчас не оплачен в ноябре -> к оплате 1200 ₽
    const metricsBefore = MyTablesCalendar.calcSummaryMetrics(sampleData, viewedMonth);
    assert.strictEqual(metricsBefore.unpaidExpenses, 1200, 'Должно быть 1200 к оплате');

    // Оплачиваем
    MyTablesCalendar.togglePaymentPaid(item, viewedMonth);
    const metricsAfter = MyTablesCalendar.calcSummaryMetrics(sampleData, viewedMonth);
    assert.strictEqual(metricsAfter.unpaidExpenses, 0, 'После оплаты сумма к оплате должна стать 0 ₽');
  });

  // Тест 6: test_summary_metrics_calc
  await runTest('test_summary_metrics_calc: расчет доходов за месяц, неоплаченных расходов и клиентов в работе', () => {
    assert(MyTablesCalendar, 'calendar.js не загружен');

    const testData = {
      income: [
        { id: 'inc_1', amount: 15000, date: '2026-10-05' },
        { id: 'inc_2', amount: 30000, date: '2026-10-20' },
        { id: 'inc_3', amount: 25000, date: '2026-09-15' } // сентябрь, не должен войти в октябрь
      ],
      expenses: [
        { id: 'exp_1', currentRate: 1200, isArchived: false, paidMonths: ['2026-10'] }, // оплачен
        { id: 'exp_2', currentRate: 800, isArchived: false, paidMonths: [] }, // не оплачен
        { id: 'exp_3', currentRate: 1900, isArchived: false, paidMonths: ['2026-09'] }, // не оплачен в октябре
        { id: 'exp_4', currentRate: 5000, isArchived: true, paidMonths: [] } // архив, игнорировать
      ],
      clients: [
        { id: 'cli_1', name: 'Анна', status: 'work' },
        { id: 'cli_2', name: 'Игорь', status: 'В работе' },
        { id: 'cli_3', name: 'Катя', status: 'waiting' },
        { id: 'cli_4', name: 'Михаил', status: 'done' }
      ]
    };

    const metrics = MyTablesCalendar.calcSummaryMetrics(testData, '2026-10');
    assert.strictEqual(metrics.totalIncome, 45000, 'Доходы за октябрь должны быть 15 000 + 30 000 = 45 000 ₽');
    assert.strictEqual(metrics.unpaidExpenses, 2700, 'Неоплаченные расходы за октябрь: 800 + 1900 = 2 700 ₽');
    assert.strictEqual(metrics.activeClientsCount, 2, 'Клиенты в работе (status work / В работе) = 2');
  });

  // Тест 7: test_summary_cards_navigation
  await runTest('test_summary_cards_navigation: клик по плашкам вызывает switchAppTab', () => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');

    // Проверяем наличие вызовов switchAppTab для трех разделов в разметке десктопа и мобилки
    assert(html.includes("switchAppTab('income')"), "Должен быть переход в Доходы через switchAppTab('income')");
    assert(html.includes("switchAppTab('expenses')"), "Должен быть переход в Расходы через switchAppTab('expenses')");
    assert(html.includes("switchAppTab('clients')"), "Должен быть переход в Клиенты через switchAppTab('clients')");
  });

  // Тест 8: test_clean_dom_no_garbage
  await runTest('test_clean_dom_no_garbage: отсутствие в DOM Главного экрана строк «Автотест», серых крестиков и корзин', () => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');

    // 1. Никаких строк «Автотест»
    assert(!html.includes('Автотест'), 'В файле index.html не должно быть строк «Автотест»');

    // 2. Проверяем главный экран десктопа (#desk-view-main)
    const deskMainMatch = html.match(/<div id="desk-view-main"[\s\S]*?<\/div>\s*<\/div>\s*<div id="desk-view-income"/);
    assert(deskMainMatch, 'Секция desk-view-main должна присутствовать в index.html');
    const deskMainHtml = deskMainMatch[0];

    // В секции desk-view-main не должно быть кнопок удаления строк item-del-btn и корзин
    assert(!deskMainHtml.includes('item-del-btn'), 'На Главном экране не должно быть кнопок item-del-btn (серых крестиков)');
    assert(!deskMainHtml.includes('btn-plus-desk'), 'Лишние кнопки плюсиков должны быть убраны с Главного экрана');
    assert(!deskMainHtml.includes('btn-plus-income'), 'Кнопки добавления дохода должны быть только в разделе Доходы');
    assert(!deskMainHtml.includes('btn-plus-expense'), 'Кнопки добавления расхода должны быть только в разделе Расходы');
    assert(!deskMainHtml.includes('btn-plus-clients'), 'Кнопки добавления клиентов должны быть только в разделе Клиенты');
  });

  // Тест 9: test_code_review_r1_fixes
  await runTest('test_code_review_r1_fixes: проверка исправлений Round 1 Code Review (сенсорные зоны, селекторы, заголовки, изоляция sync)', () => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');
    const calJsPath = path.join(__dirname, '..', 'calendar.js');
    const calJs = fs.readFileSync(calJsPath, 'utf-8');

    // 1. S1: В calendar.js нет вызова saveExpense (сохранение в Google Таблицу отложено до Стейджа 2)
    assert(!calJs.includes('saveExpense'), 'В calendar.js не должно быть преждевременного вызова saveExpense');

    // 2. M1: Мобильные стрелки календаря имеют сенсорную зону >= 44x44px
    assert(html.includes('min-width: 44px; min-height: 44px; width: 44px; height: 44px;'), 'Сенсорные зоны мобильных стрелок должны быть не менее 44x44px');
    assert(!html.includes('style="width: 28px; height: 28px;"'), 'Устаревший мелкий размер 28x28px должен отсутствовать');

    // 3. M2: Надежный селектор сетки календаря вместо хрупкого style*="grid"
    assert(!calJs.includes('style*="grid"'), 'Хрупкий селектор style*="grid" должен быть удален из calendar.js');
    assert(calJs.includes('desk-cal-table') || calJs.includes('.desk-calendar-card .cal-table'), 'Должен использоваться селектор по id или четкому классу');

    // 4. M3: Нет нечеткого перебора span с "202", заголовки обновляются через id
    assert(!calJs.includes("indexOf('202')"), 'Нечеткий поиск span по строке 202 должен быть убран');
    assert(calJs.includes("getElementById('desk-cal-title')"), 'Обновление десктопного заголовка через id');
    assert(calJs.includes("getElementById('mob-cal-title')"), 'Обновление мобильного заголовка через id');
  });

  console.log('\n======================================================');
  console.log(`ИТОГО Стейдж 1: Пройдено: ${testsPassed}, Ошибок: ${testsFailed}`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAllTests();
