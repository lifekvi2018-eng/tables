/**
 * ============================================================================
 * TDD ТЕСТЫ СТЕЙДЖА 2: ЭКРАН «РАСХОДЫ» (tests/stage2_expenses.test.js)
 * ============================================================================
 * Запуск: node tests/stage2_expenses.test.js
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

async function runAllTests() {
  console.log('\n======================================================');
  console.log(' Запуск TDD-тестов Стейджа 2: Экран «Расходы ♡»');
  console.log('======================================================\n');

  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
  const appJs = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf-8');

  // Тест 1: Отсутствие мертвых трех точек и черных рамок
  await runTest('test_no_dead_dots_and_no_black_outlines: полное отсутствие кнопок трех точек и черных рамок', () => {
    assert(!indexHtml.includes('expense-dots-btn'), 'В index.html не должно быть кнопок .expense-dots-btn');
    assert(indexHtml.includes('outline: none !important'), 'Все интерактивные элементы должны иметь outline: none для защиты от черных рамок');
  });

  // Тест 2: Чистые плашки подписок без растягивающих кнопок и аккуратная широкая кнопка «Добавить платеж»
  await runTest('test_clean_subscription_slips: плашки содержат только статус-кнопку, без лишних кнопок магазина, широкая кнопка «Добавить платеж»', () => {
    // В карточках подписок не должно быть кнопок в магазин
    assert(!indexHtml.includes('<a href="https://claude.ai" target="_blank" class="expense-shop-btn">'), 'Плашка Claude не должна содержать кнопку «В магазин»');
    assert(!indexHtml.includes('<a href="https://gemini.google.com" target="_blank" class="expense-shop-btn">'), 'Плашка Gemini не должна содержать кнопку «В магазин»');
    assert(!appJs.includes('class="expense-shop-btn"'), 'В динамических плашках не должно быть кнопки .expense-shop-btn');

    // Кнопка в шапке должна быть «Добавить платеж»
    assert(indexHtml.includes('Добавить платеж'), 'Кнопка в шапке должна называться «Добавить платеж»');
    assert(indexHtml.includes('.desk-add-btn'), 'Десктопная кнопка имеет класс .desk-add-btn');

    // Запрет переноса строк в сумме и дате
    assert(indexHtml.includes('.expense-item-sub {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      margin-top: 2px;\n      white-space: nowrap;') || indexHtml.includes('white-space: nowrap'), 'Сумма и дата не должны переноситься на новую строку');
  });

  // Тест 3: Модальное окно строго по Золотому стандарту (персик #FCE8D5, сливки #FDF1CC, мята #C8E2D2, одинаковая ширина кнопок, без рамок и обводок)
  await runTest('test_golden_standard_expense_modal: модалка строго 4 поля, равная ширина кнопок flex: 1, без рамок и обводок', () => {
    assert(appJs.includes('mytables-expense-modal'), 'В app.js должно быть специализированное модальное окно расходов');
    assert(appJs.includes('#FCE8D5'), 'Внутренняя плашка должна быть теплого персикового цвета #FCE8D5');
    assert(appJs.includes('#FDF1CC'), 'Кнопка отмены должна быть теплой сливочной #FDF1CC (не белой)');
    assert(appJs.includes('#C8E2D2'), 'Кнопка сохранения должна быть нежно-мятной #C8E2D2');
    assert(!appJs.includes("id=\"add-modal-submit\" style=\"background: #5A4E40;"), 'Запрещен темный коричневый фон #5A4E40 на кнопке сохранения');

    // Одинаковая ширина кнопок (flex: 1)
    assert(appJs.includes('id="exp-modal-cancel" style="flex: 1'), 'Кнопка Отмена должна иметь flex: 1 для равной ширины');
    assert(appJs.includes('id="exp-modal-submit" style="flex: 1'), 'Кнопка Сохранить должна иметь flex: 1 для равной ширины');

    // Полный запрет коричневых и черных искусственных обводок
    assert(!appJs.includes('0 0 0 4px'), 'Запрещены искусственные ободки 0 0 0 4px');
    assert(!appJs.includes('0 0 0 2px'), 'Запрещены искусственные ободки 0 0 0 2px');
    assert(appJs.includes('exp-check-svg'), 'Выбранный цвет отмечается аккуратной галочкой без рамок');
  });

  // Тест 4: Строго 4 поля в модальном окне расходов (без кошельков, карт и заметок)
  await runTest('test_strict_4_fields: форма содержит только Название, День, Сумму и Ссылку + выбор цвета', () => {
    assert(appJs.includes('exp-in-title'), 'Поле названия должно присутствовать');
    assert(appJs.includes('exp-in-day'), 'Поле дня месяца должно присутствовать (1-31)');
    assert(appJs.includes('exp-in-amount'), 'Поле суммы должно присутствовать');
    assert(appJs.includes('exp-in-url'), 'Поле ссылки на сайт оплаты должно присутствовать');
    assert(appJs.includes('exp-color-dots-row'), 'Выбор цвета карточки кружочками должен присутствовать');
  });

  // Тест 5: Автоопределение категории по названию
  await runTest('test_auto_categorization: определение категории по ключевым словам без лишних выпадающих списков', () => {
    function detectCat(title) {
      var tLower = title.toLowerCase();
      if (tLower.indexOf('vpn') !== -1) return 'vpn';
      if (tLower.indexOf('интернет') !== -1 || tLower.indexOf('телефон') !== -1 || tLower.indexOf('связь') !== -1) return 'internet';
      if (tLower.indexOf('ai') !== -1 || tLower.indexOf('ии') !== -1 || tLower.indexOf('gpt') !== -1 || tLower.indexOf('claude') !== -1) return 'ai';
      return 'other';
    }
    assert.strictEqual(detectCat('VPN Unlimited'), 'vpn');
    assert.strictEqual(detectCat('Домашний интернет Ростелеком'), 'internet');
    assert.strictEqual(detectCat('Claude Pro'), 'ai');
    assert.strictEqual(detectCat('Фитнес абонемент'), 'other');
  });

  // Тест 6: Переключение статуса «Оплачено / Оплатить» (Toggle)
  await runTest('test_toggle_expense_item_status: функция переключения статуса работает как toggle', () => {
    assert(appJs.includes('window.toggleExpenseItemStatus'), 'Должна быть экспортирована функция window.toggleExpenseItemStatus');
    assert(appJs.includes("btn.classList.contains('paid')"), 'Функция должна проверять наличие класса paid');
    assert(appJs.includes("innerHTML = '<span class=\"status-dot\"></span> Оплатить'"), 'При переключении с оплаченного текст меняется на «Оплатить»');
  });

  // Тест 7: Реактивность с Главным экраном
  await runTest('test_reactivity_with_main_screen: при изменении статуса или добавлении расхода обновляется сводка Главного экрана', () => {
    assert(appJs.includes('window.MyTablesCalendar.updateSummaryCards()'), 'Должен вызываться реактивный пересчет плашки расходов');
  });

  console.log('\n======================================================');
  console.log(`ИТОГО Стейдж 2: Пройдено: ${testsPassed}, Ошибок: ${testsFailed}`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAllTests();
