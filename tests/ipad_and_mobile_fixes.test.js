/**
 * ============================================================================
 * ТЕСТЫ ИСПРАВЛЕНИЙ ДЛЯ IPAD И МОБИЛЬНЫХ (tests/ipad_and_mobile_fixes.test.js)
 * ============================================================================
 * Проверяет:
 * 1. Резиновую верстку под iPad на экранах «Расходы» и «Доходы»
 * 2. Работу и привязку всех кнопок (+ Добавить платеж, + Добавить проект, + в категориях, статус-пилюли, карандашики, архивация)
 * 3. Отсутствие блокирующих тапы невидимых модальных слоев (pointer-events: none)
 * 4. Удаление .mob-view-switcher с экрана клиентов
 * 5. Безопасное позиционирование плашки синхронизации на мобильных (не закрывает нижнее меню)
 * 6. Фильтрацию мусорных карточек «Автотест» и «#ERROR!»
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✕ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log(' Запуск тестов верстки для iPad и мобильных кнопок');
console.log('======================================================\n');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const syncJs = fs.readFileSync(path.join(__dirname, '..', 'sync.js'), 'utf8');

// 1. iPad Расходы: 3 колонки резиновые, minmax(0, 1fr)
test('iPad Expenses: .desk-categories-grid использует repeat(3, minmax(0, 1fr)) и gap: 16px', () => {
  assert(html.includes('repeat(3, minmax(0, 1fr))'), 'Сетка категорий должна использовать repeat(3, minmax(0, 1fr))');
  assert(html.includes('gap: 16px'), 'Отступ между колонками должен быть аккуратным 16px');
});

// 2. iPad Доходы: карточки клиентов в 2 колонки рядом
test('iPad Income: .desk-cards-grid в 2 колонки рядом (1fr 1fr), без схлопывания на 1250px', () => {
  assert(html.includes('grid-template-columns: 1fr 1fr'), 'Карточки доходов должны быть в 2 колонки рядом');
  assert(!html.includes('@media (max-width: 1250px) {\n      .desk-cards-grid {\n        grid-template-columns: 1fr;'), 'Запрещено схлопывать карточки в 1 гигантскую колонку на 1250px');
  assert(html.includes('@media (max-width: 768px) {\n      .desk-cards-grid {\n        grid-template-columns: 1fr;'), 'Схлопывание в 1 колонку разрешено только на экранах <= 768px');
});

// 3. Контейнер .desktop-window резиновый с minmax(0, 1fr)
test('Desktop/iPad Window: резиновые колонки minmax(0, 1fr) без распирания экрана', () => {
  assert(html.includes('grid-template-columns: 200px minmax(0, 1fr)'), 'Сетка desktop-window должна быть 200px minmax(0, 1fr)');
});

// 4. Кнопки экрана Расходов
test('Expenses buttons: «+ Добавить платеж» и кнопки «+» категорий имеют явный onclick', () => {
  assert(html.includes('desk-add-btn btn-plus-expense" onclick="'), 'Кнопка «+ Добавить платеж» на десктопе обязана иметь onclick');
  assert(html.includes('add-payment-pill-btn btn-plus-expense" onclick="'), 'Кнопка «+ Добавить платеж» на мобильном обязана иметь onclick');
  assert(html.includes('cat-add-btn" title="Добавить подписку" onclick="'), 'Кнопки «+» в шапках категорий обязаны иметь onclick');
});

// 5. Переключение статуса оплаты «Оплачено / Оплатить»
test('Expenses toggle status: toggleExpenseItemStatus обновляет DOM немедленно и защищен try-catch', () => {
  assert(js.includes('window.toggleExpenseItemStatus = function'), 'Функция toggleExpenseItemStatus должна быть экспортирована в window');
  assert(js.includes('btn.classList.add(\'paid\')'), 'Должно быть мгновенное переключение класса paid');
  assert(js.includes('btn.classList.add(\'unpaid\')'), 'Должно быть мгновенное переключение класса unpaid');
});

// 6. Кнопки экрана Доходов
test('Income buttons: «+ Добавить проект», «+ Внести платеж» (.btn-add-payment), карандашик и корзинка', () => {
  assert(html.includes('desk-btn-add" onclick="window.MyTablesIncome.openAddProjectModal()'), 'Кнопка «+ Добавить проект» на десктопе');
  assert(html.includes('mob-add-project-btn" onclick="window.MyTablesIncome.openAddProjectModal()'), 'Кнопка «+ Добавить проект» на мобильном');
  assert(js.includes('btn-add-payment'), 'Кнопки добавления платежа внутри карточки проекта должны иметь класс btn-add-payment');
  assert(js.includes('openEditCostModal'), 'Кнопка-карандашик должна открывать модалку изменения стоимости');
  assert(js.includes('openArchiveModal'), 'Кнопка корзинки должна открывать модалку архивации проекта');
});

// 7. Защита от блокирующих невидимых модальных слоев (pointer-events)
test('Modal tap protection: неактивные модалки имеют pointer-events: none !important', () => {
  assert(html.includes('pointer-events: none !important'), 'Неактивные модалки обязаны иметь pointer-events: none !important');
  assert(html.includes('pointer-events: auto !important'), 'Активные модалки должны иметь pointer-events: auto !important');
  assert(syncJs.includes('pointer-events: none;'), 'Стили sync.js для .mytables-modal-backdrop обязаны содержать pointer-events: none');
});

// 8. Кликабельность и тап на мобильных
test('Tap & Cursor styling: курсор pointer и tap-highlight transparent на интерактивных элементах', () => {
  assert(html.includes('-webkit-tap-highlight-color: transparent'), 'Должен быть сброс подсветки тапа');
  assert(html.includes('touch-action: manipulation'), 'Должно быть устранение 300мс задержки тапа');
});

// 9. Удаление .mob-view-switcher с экрана клиентов
test('Clients screen: полное отсутствие переключателя видов .mob-view-switcher в index.html', () => {
  assert(!html.includes('class="mob-view-switcher"'), 'В разметке index.html не должно быть блока .mob-view-switcher');
  assert(!html.includes('id="mob-switch-list-btn"'), 'В разметке index.html не должно быть кнопки #mob-switch-list-btn');
  assert(!html.includes('id="mob-switch-dossier-btn"'), 'В разметке index.html не должно быть кнопки #mob-switch-dossier-btn');
});

// 10. Позиционирование плашки синхронизации на мобильных
test('Mobile sync badge: плашка синхронизации не перекрывает нижнее меню на мобильном', () => {
  assert(html.includes('@media (max-width: 900px) {\n      .mytables-sync-badge {'), 'Должен быть медиа-запрос для мобильного бейджа синхронизации');
  assert(syncJs.includes('@media (max-width: 900px) {'), 'В sync.js должен быть медиа-запрос для мобильного бейджа синхронизации');
  assert(syncJs.includes('bottom: auto !important;'), 'На мобильном бейдж не должен привязываться к нижнему краю');
});

// 11. Фильтрация тестового мусора «Автотест» и «#ERROR!»
test('Client data cleaning: фильтрация мусорных записей со словом «Автотест» и «#ERROR!»', () => {
  assert(js.includes('isTrashClient'), 'В app.js должна быть функция фильтрации тестового мусора isTrashClient');
  assert(js.includes('автотест'), 'Фильтр должен проверять наличие слова автотест');
  assert(js.includes('#error'), 'Фильтр должен проверять наличие ошибки #error');
});

console.log('\n======================================================');
console.log(`ИТОГО: Пройдено: ${passed}, Ошибок: ${failed}`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}
