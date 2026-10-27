/**
 * ============================================================================
 * TDD ТЕСТЫ СТЕЙДЖА 4: ЭКРАН «КЛИЕНТЫ ♡» (tests/stage4_clients.test.js)
 * ============================================================================
 * Запуск: node tests/stage4_clients.test.js
 * Строго по инженерному плану PLANS/STAGE_4_CLIENTS.md
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

// Подготавливаем среду для загрузки app.js и calendar.js в Node.js
const storageMock = {};
global.localStorage = {
  getItem: (k) => storageMock[k] || null,
  setItem: (k, v) => { storageMock[k] = String(v); },
  removeItem: (k) => { delete storageMock[k]; },
  clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); }
};
global.window = global;
global.document = {
  addEventListener: () => {},
  getElementById: (id) => {
    return {
      id: id,
      style: {},
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      innerHTML: '',
      innerText: '',
      textContent: '',
      querySelectorAll: () => [],
      querySelector: () => null,
      setAttribute: () => {},
      getAttribute: () => null
    };
  },
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: (tag) => ({
    tagName: tag,
    style: {},
    classList: { add: () => {}, remove: () => {} },
    setAttribute: () => {},
    innerHTML: ''
  })
};

let MyTablesCalendar;
try {
  MyTablesCalendar = require('../calendar.js');
} catch (e) {
  MyTablesCalendar = null;
}

let appExports;
try {
  appExports = require('../app.js');
} catch (e) {
  appExports = null;
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log(' Запуск TDD-тестов Стейджа 4: Экран «Клиенты ♡»');
  console.log('======================================================\n');

  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
  const appJs = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf-8');
  const clientsModule = (appExports && appExports.MyTablesClients) || global.MyTablesClients;

  // 1. test_client_creation_and_validation
  await runTest('test_client_creation_and_validation: создание клиента, валидация имени, ID cli_ и выбор цвета', () => {
    assert(clientsModule, 'Модуль MyTablesClients должен быть экспортирован');
    assert(typeof clientsModule.validateClient === 'function', 'Должна быть функция validateClient');
    
    // Пустое имя отклоняется
    const invalid1 = clientsModule.validateClient('', '+79001234567');
    assert.strictEqual(invalid1.valid, false, 'Пустое имя должно быть отклонено');
    const invalid2 = clientsModule.validateClient('   ', '+79001234567');
    assert.strictEqual(invalid2.valid, false, 'Имя из пробелов должно быть отклонено');

    // Корректный клиент
    const valid = clientsModule.validateClient('Анна Смирнова', '+7 900 123-45-67', 'Лендинг', 'work', 'mint');
    assert.strictEqual(valid.valid, true, 'Корректный клиент должен быть валиден');
    assert.strictEqual(valid.name, 'Анна Смирнова');
    assert.strictEqual(valid.status, 'work');
    assert.strictEqual(valid.color, 'mint');

    // Добавление клиента генерирует cli_ префикс
    const added = clientsModule.addClient({ name: 'Тестовый Клиент', phone: '+7 911 111-22-33', status: 'discuss' });
    assert(added.id.startsWith('cli_'), 'ID должен начинаться с cli_');
    assert.strictEqual(added.name, 'Тестовый Клиент');
    assert.strictEqual(added.status, 'discuss');
  });

  // 2. test_normalize_client_adapter (DEF-3.2)
  await runTest('test_normalize_client_adapter: универсальный адаптер Google Таблиц и фронтенда', () => {
    assert(typeof clientsModule.normalizeClient === 'function', 'Должна быть функция normalizeClient');

    // Строка Google Таблицы с русскими ключами
    const gSheetRow = {
      ID: 'cli_101',
      'Имя': 'Светлана',
      'Телефон': "'+79001234567",
      'Проект': 'Сайт',
      'Статус': 'В работе',
      'В_Архиве': 'FALSE'
    };
    const norm1 = clientsModule.normalizeClient(gSheetRow);
    assert.strictEqual(norm1.id, 'cli_101');
    assert.strictEqual(norm1.name, 'Светлана');
    assert.strictEqual(norm1.phone, "'+79001234567");
    assert.strictEqual(norm1.status, 'work');
    assert.strictEqual(norm1.isArchived, false);

    // Строка со строковым 'TRUE'
    const gSheetArchived = { ID: 'cli_102', 'Имя': 'Олег', 'Статус': 'Завершён', 'В_Архиве': 'TRUE' };
    const norm2 = clientsModule.normalizeClient(gSheetArchived);
    assert.strictEqual(norm2.status, 'done');
    assert.strictEqual(norm2.isArchived, true);

    // Фронтенд объект camelCase
    const jsObj = { id: 'cli_103', name: 'Дмитрий', status: 'waiting', isArchived: false };
    const norm3 = clientsModule.normalizeClient(jsObj);
    assert.strictEqual(norm3.id, 'cli_103');
    assert.strictEqual(norm3.name, 'Дмитрий');
    assert.strictEqual(norm3.status, 'waiting');
    assert.strictEqual(norm3.isArchived, false);
  });

  // 3. test_canonical_status_normalization (DEF-3.1)
  await runTest('test_canonical_status_normalization: 4 канонических статуса (discuss, work, waiting, done)', () => {
    assert(typeof clientsModule.canonicalStatus === 'function', 'Должна быть функция canonicalStatus');

    assert.strictEqual(clientsModule.canonicalStatus('work'), 'work');
    assert.strictEqual(clientsModule.canonicalStatus('В работе'), 'work');
    assert.strictEqual(clientsModule.canonicalStatus('  в работе  '), 'work');

    assert.strictEqual(clientsModule.canonicalStatus('done'), 'done');
    assert.strictEqual(clientsModule.canonicalStatus('Завершён'), 'done');
    assert.strictEqual(clientsModule.canonicalStatus('Завершен'), 'done');
    assert.strictEqual(clientsModule.canonicalStatus('ЗАВЕРШЕН'), 'done');

    assert.strictEqual(clientsModule.canonicalStatus('waiting'), 'waiting');
    assert.strictEqual(clientsModule.canonicalStatus('Ожидает'), 'waiting');

    assert.strictEqual(clientsModule.canonicalStatus('discuss'), 'discuss');
    assert.strictEqual(clientsModule.canonicalStatus('Обсуждение'), 'discuss');

    // Безопасный дефолт
    assert.strictEqual(clientsModule.canonicalStatus(''), 'discuss');
    assert.strictEqual(clientsModule.canonicalStatus(null), 'discuss');
    assert.strictEqual(clientsModule.canonicalStatus('неизвестно'), 'discuss');
  });

  // 4. test_phone_apostrophe_and_whatsapp_url_8_to_7 (DEF-3.4)
  await runTest('test_phone_apostrophe_and_whatsapp_url_8_to_7: экранирование + для Таблиц и ссылка WhatsApp с заменой 8 на 7', () => {
    assert(typeof clientsModule.sanitizePhoneForStorage === 'function', 'Должна быть функция sanitizePhoneForStorage');
    assert(typeof clientsModule.displayPhone === 'function', 'Должна быть функция displayPhone');
    assert(typeof clientsModule.getWhatsAppUrl === 'function', 'Должна быть функция getWhatsAppUrl');

    // Экранирование для Google Таблиц
    assert.strictEqual(clientsModule.sanitizePhoneForStorage('+7 900 123-45-67'), "'+7 900 123-45-67");
    // Не дублировать апостроф
    assert.strictEqual(clientsModule.sanitizePhoneForStorage("'+7 900 123-45-67"), "'+7 900 123-45-67");
    assert.strictEqual(clientsModule.sanitizePhoneForStorage('89001234567'), '89001234567');

    // Отображение в UI без апострофа
    assert.strictEqual(clientsModule.displayPhone("'+7 900 123-45-67"), "+7 900 123-45-67");
    assert.strictEqual(clientsModule.displayPhone("+7 900 123-45-67"), "+7 900 123-45-67");

    // WhatsApp ссылка с автозаменой 8 на 7 для РФ
    assert.strictEqual(clientsModule.getWhatsAppUrl('8 (900) 123-45-67'), 'https://wa.me/79001234567');
    assert.strictEqual(clientsModule.getWhatsAppUrl('89001234567'), 'https://wa.me/79001234567');
    assert.strictEqual(clientsModule.getWhatsAppUrl('+7 900 123-45-67'), 'https://wa.me/79001234567');
    assert.strictEqual(clientsModule.getWhatsAppUrl('9001234567'), 'https://wa.me/79001234567');
  });

  // 5. test_auto_sort_done_clients_to_bottom
  await runTest('test_auto_sort_done_clients_to_bottom: завершённые клиенты ВСЕГДА автоматически опускаются вниз', () => {
    assert(typeof clientsModule.sortClients === 'function', 'Должна быть функция sortClients');

    const sample = [
      { id: '1', name: 'Катя', status: 'done' },
      { id: '2', name: 'Анна', status: 'work' },
      { id: '3', name: 'Игорь', status: 'waiting' },
      { id: '4', name: 'Михаил', status: 'Завершен' },
      { id: '5', name: 'Елена', status: 'discuss' }
    ];

    const sorted = clientsModule.sortClients(sample);
    const sortedIds = sorted.map(c => c.id);

    // Первые 3 должны быть активными (2, 3, 5 в исходном порядке)
    assert.deepStrictEqual(sortedIds.slice(0, 3), ['2', '3', '5'], 'Активные клиенты должны оставаться вверху');
    // Последние 2 должны быть со статусом done (1, 4)
    assert.deepStrictEqual(sortedIds.slice(3), ['1', '4'], 'Завершённые клиенты должны быть внизу списка');
  });

  // 6. test_status_filter_switching
  await runTest('test_status_filter_switching: переключение фильтров Все, В работе, Ожидает, Обсуждение, Завершён', () => {
    assert(typeof clientsModule.filterClients === 'function', 'Должна быть функция filterClients');

    const sample = [
      { id: '1', name: 'Аня', status: 'work', isArchived: false },
      { id: '2', name: 'Борис', status: 'work', isArchived: false },
      { id: '3', name: 'Вера', status: 'waiting', isArchived: false },
      { id: '4', name: 'Глеб', status: 'discuss', isArchived: false },
      { id: '5', name: 'Дарья', status: 'done', isArchived: false },
      { id: '6', name: 'Архивный', status: 'work', isArchived: true }
    ];

    assert.strictEqual(clientsModule.filterClients(sample, 'all').length, 5, 'Фильтр all показывает всех неархивных');
    assert.strictEqual(clientsModule.filterClients(sample, 'work').length, 2, 'Фильтр work');
    assert.strictEqual(clientsModule.filterClients(sample, 'waiting').length, 1, 'Фильтр waiting');
    assert.strictEqual(clientsModule.filterClients(sample, 'discuss').length, 1, 'Фильтр discuss');
    assert.strictEqual(clientsModule.filterClients(sample, 'done').length, 1, 'Фильтр done');

    // Проверка с русскими именами
    assert.strictEqual(clientsModule.filterClients(sample, 'В работе').length, 2);
    assert.strictEqual(clientsModule.filterClients(sample, 'Завершён').length, 1);
  });

  // 7. test_no_search_box_in_dom
  await runTest('test_no_search_box_in_dom: полное отсутствие поисковой строки на экране клиентов в index.html', () => {
    const deskClientsSection = indexHtml.split('id="desk-view-clients"')[1]?.split('id="mob-view-main"')[0] || '';
    const mobClientsSection = indexHtml.split('id="mob-view-clients"')[1]?.split('class="tabbar-box"')[0] || '';

    assert(deskClientsSection.length > 0, 'Секция #desk-view-clients должна быть найдена');
    assert(mobClientsSection.length > 0, 'Секция #mob-view-clients должна быть найдена');

    // Проверка отсутствия строки поиска в DOM клиентов
    assert(!deskClientsSection.includes('search-box'), 'Десктопный экран клиентов не должен содержать .search-box');
    assert(!deskClientsSection.includes('search-input'), 'Десктопный экран клиентов не должен содержать .search-input');
    assert(!deskClientsSection.includes('Поиск клиента'), 'Десктопный экран клиентов не должен содержать placeholder Поиск клиента');

    assert(!mobClientsSection.includes('search-box'), 'Мобильный экран клиентов не должен содержать .search-box');
    assert(!mobClientsSection.includes('search-input'), 'Мобильный экран клиентов не должен содержать .search-input');
    assert(!mobClientsSection.includes('Поиск клиента'), 'Мобильный экран клиентов не должен содержать placeholder Поиск клиента');
  });

  // 8. test_desktop_master_detail_selection_lifecycle (DEF-3.3)
  await runTest('test_desktop_master_detail_selection_lifecycle: автовыбор первого клиента и переключение при архивации', () => {
    assert(typeof clientsModule.selectClient === 'function', 'Должна быть функция selectClient');
    assert(typeof clientsModule.getSelectedClientId === 'function', 'Должна быть функция getSelectedClientId');

    const clients = [
      { id: 'cli_1', name: 'Аня', status: 'work', isArchived: false },
      { id: 'cli_2', name: 'Максим', status: 'work', isArchived: false }
    ];

    clientsModule.setClients(clients);
    clientsModule.selectClient('cli_1');
    assert.strictEqual(clientsModule.getSelectedClientId(), 'cli_1');

    // Архивация текущего выбранного переключает выбор на следующего
    clientsModule.archiveClient('cli_1');
    assert.strictEqual(clientsModule.getSelectedClientId(), 'cli_2', 'Выбор должен переключиться на следующего клиента');

    // Архивация последнего доступного сбрасывает выбор в null
    clientsModule.archiveClient('cli_2');
    assert.strictEqual(clientsModule.getSelectedClientId(), null, 'При пустом списке выбор сбрасывается в null');
  });

  // 9. test_mobile_dossier_navigation
  await runTest('test_mobile_dossier_navigation: переключение между списком и полноэкранной анкетой на телефоне', () => {
    assert(typeof clientsModule.switchMobileView === 'function', 'Должна быть функция switchMobileView');
    assert(indexHtml.includes('mob-view-list'), 'В index.html должен быть контейнер #mob-view-list');
    assert(indexHtml.includes('mob-view-dossier'), 'В index.html должен быть контейнер #mob-view-dossier');
    assert(indexHtml.includes('mob-back-btn'), 'Должна присутствовать кнопка Назад к списку .mob-back-btn');
  });

  // 10. test_golden_standard_clients_modals
  await runTest('test_golden_standard_clients_modals: модальные окна строго по Золотому стандарту (border: none, без #FFFFFF, кнопки flex: 1)', () => {
    // Проверяем стили модальных окон
    assert(indexHtml.includes('.golden-modal') || appJs.includes('golden-modal'), 'Класс .golden-modal должен присутствовать');
    assert(indexHtml.includes('.golden-plaque') || appJs.includes('golden-plaque'), 'Класс .golden-plaque #FCE8D5 должен присутствовать');
    assert(indexHtml.includes('.btn-action-modal') || appJs.includes('btn-action-modal'), 'Класс .btn-action-modal должен присутствовать');

    // Цвета кнопок
    assert(indexHtml.includes('#FDF1CC') && (indexHtml.includes('#C8E2D2') || appJs.includes('#C8E2D2')), 'Кнопки отмены #FDF1CC и сохранения #C8E2D2');
    assert(indexHtml.includes('#FCD6CF') || appJs.includes('#FCD6CF'), 'Кнопка удаления #FCD6CF');

    // Запрет коричневой рамки на кружочках палитры
    assert(!indexHtml.includes('box-shadow: 0 0 0 2.5px #5B481D'), 'Запрещен коричневый ободок #5B481D');
    assert(!appJs.includes('box-shadow: 0 0 0 2.5px #5B481D'), 'Запрещен коричневый ободок в app.js');

    // Запрет чисто белого фона
    assert(!appJs.includes('background: #FFFFFF') && !appJs.includes('background:#FFFFFF'), 'Запрещен #FFFFFF в app.js');

    // Проверка стилей полей ввода модального окна клиента (Code Review R1)
    assert(indexHtml.includes('.field-input') && indexHtml.includes('.field-textarea'), 'Стили .field-input и .field-textarea должны присутствовать в index.html');
    assert(indexHtml.includes('.palette-row'), 'Стиль .palette-row должен присутствовать в index.html');
  });

  // 11. test_reactive_main_screen_counter_sync
  await runTest('test_reactive_main_screen_counter_sync: реактивная синхронизация счетчика «X в работе» на Главном экране', () => {
    assert(MyTablesCalendar, 'calendar.js должен быть загружен');

    const testData = {
      clients: [
        { id: 'c1', name: 'Анна', status: 'work', isArchived: false },
        { id: 'c2', name: 'Игорь', status: 'work', isArchived: false },
        { id: 'c3', name: 'Катя', status: 'done', isArchived: false },
        { id: 'c4', name: 'Ольга', status: 'waiting', isArchived: false },
        { id: 'c5', name: 'Архивный', status: 'work', isArchived: true }
      ]
    };

    const metrics = MyTablesCalendar.calcSummaryMetrics(testData, '2026-10');
    assert.strictEqual(metrics.activeClientsCount, 2, 'Только клиенты со статусом work (не в архиве) учитываются в счетчике Главной');
  });

  // 12. test_client_soft_delete_archive
  await runTest('test_client_soft_delete_archive: мягкое удаление (isArchived = true) и исключение из активных списков', () => {
    const client = { id: 'cli_archive_test', name: 'Архивный Тест', status: 'work', isArchived: false };
    clientsModule.setClients([client]);

    assert.strictEqual(clientsModule.getActiveClients().length, 1);
    clientsModule.archiveClient('cli_archive_test');
    assert.strictEqual(clientsModule.getActiveClients().length, 0, 'После архивации клиент скрыт из активного списка');

    const all = clientsModule.getAllClients();
    const archived = all.find(c => c.id === 'cli_archive_test');
    assert(archived, 'Запись сохранена в истории');
    assert.strictEqual(archived.isArchived, true, 'Флаг isArchived выставлен в true');
  });

  // 13. test_links_and_password_features
  await runTest('test_links_and_password_features: ссылки клиента, скрытие/показ паролей глазок и телефон nowrap', () => {
    assert(typeof clientsModule.togglePasswordVisibility === 'function', 'Должна быть функция togglePasswordVisibility');
    assert(typeof clientsModule.addClientLink === 'function', 'Должна быть функция addClientLink');
    assert(typeof clientsModule.editClientLink === 'function', 'Должна быть функция editClientLink');
    assert(typeof clientsModule.copyPassword === 'function', 'Должна быть безопасная функция copyPassword');
    assert(typeof clientsModule.updateCounters === 'function', 'Должна быть функция updateCounters');

    // Проверка nowrap телефона в CSS
    assert(indexHtml.includes('contact-phone-big') && indexHtml.includes('white-space: nowrap'), 'Номер телефона обязан иметь white-space: nowrap');
    assert(indexHtml.includes('link-item-main') && indexHtml.includes('text-overflow: ellipsis'), 'Ссылки должны иметь text-overflow: ellipsis');
  });

  console.log('\n======================================================');
  console.log(`ИТОГО Стейдж 4: Пройдено: ${testsPassed}, Ошибок: ${testsFailed}`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAllTests();
