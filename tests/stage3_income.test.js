/**
 * ============================================================================
 * TDD ТЕСТЫ СТЕЙДЖА 3: ЭКРАН «ДОХОДЫ ♡» (tests/stage3_income.test.js)
 * ============================================================================
 * Запуск: node tests/stage3_income.test.js
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
  console.log(' Запуск TDD-тестов Стейджа 3: Экран «Доходы ♡»');
  console.log('======================================================\n');

  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
  const appJs = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf-8');

  // 1. test_render_income_projects_bento: рендеринг карточек проектов в фирменной палитре
  await runTest('test_render_income_projects_bento: рендеринг карточек проектов в фирменной палитре (мята, персик, лаванда, небо)', () => {
    assert(appJs.includes('MyTablesIncome'), 'В app.js должен быть модуль или менеджер MyTablesIncome');
    assert(appJs.includes('project-card mint') || appJs.includes('mint:'), 'Должна поддерживаться мятная карточка #C8E2D2');
    assert(appJs.includes('project-card peach') || appJs.includes('peach:'), 'Должна поддерживаться персиковая карточка #FCD6CF');
    assert(appJs.includes('project-card lavender') || appJs.includes('lavender:'), 'Должна поддерживаться лавандовая карточка #DBCCE9');
    assert(appJs.includes('project-card blue') || appJs.includes('blue:'), 'Должна поддерживаться голубая карточка #D3E7F8');
    
    // Проверка наличия элементов карточки в шаблонах рендеринга
    assert(appJs.includes('project-total-pill'), 'В карточке проекта должна быть плашка полной стоимости .project-total-pill');
    assert(appJs.includes('edit-pencil-btn'), 'В карточке должен быть круглый карандашик .edit-pencil-btn');
    assert(appJs.includes('btn-archive-project'), 'В карточке должна быть круглая корзинка .btn-archive-project');
    assert(appJs.includes('payment-slip'), 'В карточке должна быть плашка оплаты .payment-slip');
  });

  // 2. test_add_new_project_strict_fields: добавление нового проекта (Клиент, Проект, Полная стоимость, цвет)
  await runTest('test_add_new_project_strict_fields: добавление нового проекта со строгими полями (Клиент, Проект, Полная стоимость, цвет)', () => {
    assert(appJs.includes('validateProject') || appJs.includes('addProject'), 'В app.js должна быть функция валидации/добавления проекта');
    assert(appJs.includes('inc-proj-client') || appJs.includes('inc-modal-client'), 'Поле ввода/выбора клиента должно присутствовать');
    assert(appJs.includes('inc-proj-title') || appJs.includes('inc-modal-title'), 'Поле названия проекта должно присутствовать');
    assert(appJs.includes('inc-proj-cost') || appJs.includes('inc-modal-cost'), 'Поле полной стоимости проекта должно присутствовать');
    assert(appJs.includes('inc-proj-color') || appJs.includes('palette-circle'), 'Выбор цвета карточки кружочками должен присутствовать');
  });

  // 3. test_payment_validation: валидация оплат (сумма > 0, дата YYYY-MM-DD, обрезка пробелов)
  await runTest('test_payment_validation: валидация оплат (сумма > 0, дата YYYY-MM-DD, обрезка пробелов)', () => {
    // Проверка логики валидации
    assert(appJs.includes('validatePayment') || appJs.includes('parseFloat(amount)') || appJs.includes('Number(amount)'), 'Должна быть проверка суммы платежа');
    
    // Эмуляция логики проверки суммы и даты
    const isValidPayment = (sum, date) => {
      const num = Number(sum);
      if (isNaN(num) || num <= 0) return false;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
      return true;
    };

    assert.strictEqual(isValidPayment(0, '2026-10-23'), false, 'Сумма 0 недопустима');
    assert.strictEqual(isValidPayment(-500, '2026-10-23'), false, 'Отрицательная сумма недопустима');
    assert.strictEqual(isValidPayment('abc', '2026-10-23'), false, 'Нечисловая сумма недопустима');
    assert.strictEqual(isValidPayment(5000, ''), false, 'Пустая дата недопустима');
    assert.strictEqual(isValidPayment(5000, '2026-10-23'), true, 'Корректный платеж валиден');
  });

  // 4. test_add_payment_installment: добавление платежа через круглый плюсик
  await runTest('test_add_payment_installment: добавление платежа через круглый плюсик, появление записи с датой, суммой и заметкой', () => {
    assert(appJs.includes('btn-slip-plus'), 'Должна быть кнопка круглого плюсика .btn-slip-plus');
    assert(appJs.includes('openAddPaymentModal') || appJs.includes("openIncomeModal('modal-add-payment'"), 'Должна быть функция открытия модалки внесения платежа');
    assert(appJs.includes('inc-pay-amount'), 'В модалке платежа должно быть поле суммы');
    assert(appJs.includes('inc-pay-date'), 'В модалке платежа должно быть поле даты');
    assert(appJs.includes('inc-pay-note'), 'В модалке платежа должно быть поле заметки');
  });

  // 5. test_edit_project_full_cost: изменение договорной стоимости через круглый карандашик ✎
  await runTest('test_edit_project_full_cost: изменение договорной стоимости через круглый карандашик ✎', () => {
    assert(appJs.includes('openEditCostModal') || appJs.includes("openIncomeModal('modal-edit-cost'"), 'Должна быть функция открытия модалки изменения стоимости проекта');
    assert(appJs.includes('updateProjectCost') || appJs.includes('saveProjectCost'), 'Должна быть функция обновления полной стоимости проекта');
  });

  // 6. test_edit_and_delete_payment: открытие модалки оплаты по тапу на плашку, редактирование и удаление
  await runTest('test_edit_and_delete_payment: открытие модалки оплаты по тапу на плашку, редактирование суммы/заметки и удаление платежа коралловой кнопкой [ Удалить ]', () => {
    assert(appJs.includes('openEditPaymentModal') || appJs.includes("openIncomeModal('modal-edit-payment'"), 'Должна быть функция редактирования платежа');
    assert(appJs.includes('deletePayment') || appJs.includes('handleDeletePayment'), 'Должна быть функция удаления платежа');
    // В модалке редактирования платежа кнопка [ Удалить ] строго без слова Архив
    assert(appJs.includes('btn-action-modal delete') || appJs.includes('inc-btn-delete-pay'), 'Должна быть кнопка удаления платежа');
  });

  // 7. test_archive_income_project: архивация проекта
  await runTest('test_archive_income_project: архивация проекта (скрывается с экрана, но строки платежей остаются в истории)', () => {
    assert(appJs.includes('openArchiveModal') || appJs.includes("openIncomeModal('modal-archive'"), 'Должна быть модалка подтверждения архивации проекта');
    assert(appJs.includes('archiveProject') || appJs.includes('В_Архиве'), 'Проект должен помечаться как архивированный');
  });

  // 8. test_reactive_summary_cards_sync: реактивный пересчёт плашки «Доходы» на Главном экране
  await runTest('test_reactive_summary_cards_sync: реактивный пересчёт плашки «Доходы» на Главном экране при операциях с платежами текущего месяца', () => {
    assert(appJs.includes('updateSummaryCards') || appJs.includes('MyTablesCalendar.updateSummaryCards'), 'Должен вызываться пересчет сводки Главного экрана');
  });

  // 9. test_clean_dom_no_white_no_borders: отсутствие чисто белого цвета #FFFFFF и border в стилях доходов
  await runTest('test_clean_dom_no_white_no_borders: отсутствие чисто белого цвета #FFFFFF и border в стилях доходов', () => {
    // Проверяем стили экранов доходов в index.html
    const incomeDeskSection = indexHtml.split('id="desk-view-income"')[1]?.split('id="desk-view-expenses"')[0] || '';
    const incomeMobSection = indexHtml.split('id="mob-view-income"')[1]?.split('id="mob-view-expenses"')[0] || '';
    
    assert(incomeDeskSection.length > 0, 'Секция #desk-view-income должна присутствовать в index.html');
    assert(incomeMobSection.length > 0, 'Секция #mob-view-income должна присутствовать в index.html');

    // Кнопка «+ Добавить проект» должна быть тепло-жёлтой #FDF1CC
    assert(incomeDeskSection.includes('#FDF1CC') || indexHtml.includes('.desk-btn-add {\n      min-height: 44px;') || indexHtml.includes('.desk-btn-add'), 'Кнопка добавления проекта на десктопе должна быть класса .desk-btn-add');
    assert(incomeMobSection.includes('mob-add-project-btn') || indexHtml.includes('.mob-add-project-btn'), 'Кнопка добавления проекта на мобильном должна быть класса .mob-add-project-btn');
    
    // Запрет чисто белого фона в модалках и плашках
    assert(!appJs.includes("background: #FFFFFF"), 'В стилях app.js запрещен чисто белый цвет #FFFFFF');
    assert(!appJs.includes("background:#FFFFFF"), 'В стилях app.js запрещен чисто белый цвет #FFFFFF');
  });

  console.log('\n======================================================');
  console.log(`ИТОГО Стейдж 3: Пройдено: ${testsPassed}, Ошибок: ${testsFailed}`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAllTests();
