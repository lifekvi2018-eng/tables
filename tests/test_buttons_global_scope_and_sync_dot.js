/**
 * Тест: Доступность кнопок и методов app.js в глобальном объекте window (браузер)
 * и мобильный кружочек синхронизации возле буквы А.
 */

const fs = require('fs');
const assert = require('assert');

console.log('\n======================================================');
console.log(' Запуск тестов: Доступность кнопок и кружочек синхронизации');
console.log('======================================================\n');

// 1. Проверяем структуру app.js и экспорт на window
const appJs = fs.readFileSync('app.js', 'utf8');

// Симуляция браузерной среды (где window передается как root в IIFE)
const mockWindow = {
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => [],
    body: { appendChild: () => {} }
  },
  location: { pathname: '/tables/' }
};

const runInBrowserContext = new Function('window', 'document', 'self', appJs);
try {
  runInBrowserContext(mockWindow, mockWindow.document, mockWindow);
} catch (e) {
  // Ignored if DOM operations fail partially
}

console.log('Тест 1: Экспорт MyTablesIncome на глобальный window');
assert.ok(mockWindow.MyTablesIncome, 'MyTablesIncome должен быть определен на window');
assert.strictEqual(typeof mockWindow.MyTablesIncome.openAddProjectModal, 'function', 'openAddProjectModal должен быть функцией');
assert.strictEqual(typeof mockWindow.MyTablesIncome.openAddPaymentModal, 'function', 'openAddPaymentModal должен быть функцией');
console.log('  ✓ MyTablesIncome и методы добавления проектов/платежей экспортированы на window');

console.log('Тест 2: Экспорт MyTablesClients на глобальный window');
assert.ok(mockWindow.MyTablesClients, 'MyTablesClients должен быть определен на window');
assert.strictEqual(typeof mockWindow.MyTablesClients.openAddModal, 'function', 'openAddModal должен быть функцией');
assert.strictEqual(typeof mockWindow.MyTablesClients.selectClient, 'function', 'selectClient должен быть функцией');
console.log('  ✓ MyTablesClients и методы открытия карточек/модалок экспортированы на window');

console.log('Тест 3: Экспорт функций расходов на глобальный window');
assert.strictEqual(typeof mockWindow.toggleExpenseItemStatus, 'function', 'toggleExpenseItemStatus должен быть функцией на window');
assert.strictEqual(typeof mockWindow.openAddExpenseModal, 'function', 'openAddExpenseModal должен быть функцией на window');
console.log('  ✓ toggleExpenseItemStatus и openAddExpenseModal экспортированы на window');

// 4. Проверяем скрытие плашки #mytables-sync-badge на экранах <= 900px
const html = fs.readFileSync('index.html', 'utf8');
const syncJs = fs.readFileSync('sync.js', 'utf8');

console.log('Тест 4: Скрытие широкой плашки синхронизации на мобильных (<= 900px)');
const hasBadgeHideRule = html.includes('.mytables-sync-badge') && (
  html.includes('display: none !important') || syncJs.includes('display: none !important')
);
assert.ok(hasBadgeHideRule, 'Широкая плашка синхронизации должна быть скрыта на мобильном (display: none !important)');
console.log('  ✓ Плашка синхронизации скрыта на мобильном экране');

// 5. Проверяем наличие кружочка mob-sync-dot в мобильных шапках возле буквы А
console.log('Тест 5: Наличие индикатора-кружочка mob-sync-dot возле буквы А');
assert.ok(html.includes('mob-sync-dot'), 'В index.html должен присутствовать класс mob-sync-dot');
console.log('  ✓ Кружочек синхронизации присутствует в разметке');

// 6. Проверяем обновление mob-sync-dot в sync.js
console.log('Тест 6: Обновление mob-sync-dot в updateBadgeUI в sync.js');
assert.ok(syncJs.includes('mob-sync-dot'), 'sync.js должен обновлять статус кружочков .mob-sync-dot');
console.log('  ✓ sync.js обновляет цвет кружочка синхронизации');

console.log('\n======================================================');
console.log('ИТОГО: Все проверки доступности кнопок и синхронизации пройдены!');
console.log('======================================================\n');
