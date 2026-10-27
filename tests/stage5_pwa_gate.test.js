/**
 * ============================================================================
 * ТЕСТЫ СТЕЙДЖА 5: GOOGLE GATE & PWA (tests/stage5_pwa_gate.test.js)
 * ============================================================================
 * 8 изолированных тестов TDD для чистого Node.js
 * Запуск: node tests/stage5_pwa_gate.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Изолированное хранилище для тестов Node.js
let mockLocalStorage = {};
let mockSessionStorage = {};

global.localStorage = {
  getItem: (k) => (Object.prototype.hasOwnProperty.call(mockLocalStorage, k) ? mockLocalStorage[k] : null),
  setItem: (k, v) => { mockLocalStorage[k] = String(v); },
  removeItem: (k) => { delete mockLocalStorage[k]; },
  clear: () => { mockLocalStorage = {}; }
};

global.sessionStorage = {
  getItem: (k) => (Object.prototype.hasOwnProperty.call(mockSessionStorage, k) ? mockSessionStorage[k] : null),
  setItem: (k, v) => { mockSessionStorage[k] = String(v); },
  removeItem: (k) => { delete mockSessionStorage[k]; },
  clear: () => { mockSessionStorage = {}; }
};

// Загружаем модуль sync.js
let MyTablesSync = require('../sync.js');

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

async function runStage5Tests() {
  console.log('\n======================================================');
  console.log(' Запуск TDD-тестов Стейджа 5 («Google Gate & PWA»)');
  console.log('======================================================\n');

  // Тест 1: test_google_gate_auth_strict_email
  await runTest('test_google_gate_auth_strict_email: вход разрешён только для lifekvi2018@gmail.com, чужие отклоняются', () => {
    mockLocalStorage = {};
    mockSessionStorage = {};
    if (MyTablesSync.logout) MyTablesSync.logout();

    // Попытка входа с чужим email
    const res1 = MyTablesSync.login('intruder@gmail.com');
    assert.strictEqual(res1.success, false, 'Чужой email не должен проходить');
    assert.ok(res1.error && res1.error.includes('lifekvi2018@gmail.com'), 'Должно быть указано сообщение с email владелицы');
    assert.strictEqual(MyTablesSync.isAuthenticated(), false, 'Не должен быть авторизован');

    // Попытка входа с пустым email
    const res2 = MyTablesSync.login('');
    assert.strictEqual(res2.success, false, 'Пустой email должен быть отклонен');

    // Вход владелицы с разным регистром и пробелами
    const res3 = MyTablesSync.login('  LifeKVI2018@gmail.com  ');
    assert.strictEqual(res3.success, true, 'Вход владелицы должен быть успешен');
    assert.strictEqual(res3.user.email, 'lifekvi2018@gmail.com', 'Email должен быть нормализован');
    assert.strictEqual(MyTablesSync.isAuthenticated(), true, 'Статус авторизации должен быть true');

    const currentUser = MyTablesSync.getCurrentUser();
    assert.ok(currentUser, 'Текущий пользователь должен существовать');
    assert.strictEqual(currentUser.email, 'lifekvi2018@gmail.com');
    assert.strictEqual(currentUser.name, 'Аня');
  });

  // Тест 2: test_session_30_days_and_auto_expiration
  await runTest('test_session_30_days_and_auto_expiration: 30 дней сессии на десктопе и автосброс при истечении', () => {
    mockLocalStorage = {};
    mockSessionStorage = {};
    if (MyTablesSync.logout) MyTablesSync.logout();

    const now = Date.now();
    const res = MyTablesSync.login('lifekvi2018@gmail.com');
    assert.strictEqual(res.success, true);
    assert.ok(res.user.expiresAt, 'У пользователя должен быть установлен срок истечения expiresAt');

    const ttl = res.user.expiresAt - now;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    assert.ok(Math.abs(ttl - thirtyDaysMs) < 5000, `Срок сессии должен составлять 30 дней (получено: ${ttl} мс)`);

    // Симуляция истечения срока сессии (пользователь из прошлого)
    const expiredUser = {
      authorized: true,
      email: 'lifekvi2018@gmail.com',
      name: 'Аня',
      avatar: 'А',
      loginTime: now - (31 * 24 * 60 * 60 * 1000),
      expiresAt: now - 1000 // Истекло 1 секунду назад
    };

    // Записываем просроченного пользователя в активное хранилище
    if (typeof MyTablesSync.getAuthStorage === 'function') {
      MyTablesSync.getAuthStorage().setItem(MyTablesSync.CONFIG.AUTH_STORAGE_KEY, JSON.stringify(expiredUser));
    } else {
      mockLocalStorage[MyTablesSync.CONFIG.AUTH_STORAGE_KEY] = JSON.stringify(expiredUser);
      mockSessionStorage[MyTablesSync.CONFIG.AUTH_STORAGE_KEY] = JSON.stringify(expiredUser);
    }

    // Проверяем, что isAuthenticated() автосбрасывает просроченную сессию
    const authStatus = MyTablesSync.isAuthenticated();
    assert.strictEqual(authStatus, false, 'Просроченная сессия должна автоматически инвалидироваться');
    assert.strictEqual(MyTablesSync.getCurrentUser(), null, 'Текущий пользователь должен быть null после автосброса');
  });

  // Тест 3: test_storage_adapter_resilience
  await runTest('test_storage_adapter_resilience: безопасный fallback при отсутствии localStorage или приватном режиме', () => {
    assert.strictEqual(typeof MyTablesSync.getAuthStorage, 'function', 'getAuthStorage должна экспортироваться');
    const adapter = MyTablesSync.getAuthStorage();
    assert.strictEqual(typeof adapter.getItem, 'function', 'Адаптер должен иметь getItem');
    assert.strictEqual(typeof adapter.setItem, 'function', 'Адаптер должен иметь setItem');
    assert.strictEqual(typeof adapter.removeItem, 'function', 'Адаптер должен иметь removeItem');

    // Проверяем, что при недоступности localStorage нет ReferenceError
    const origLocal = global.localStorage;
    delete global.localStorage;

    try {
      const fallbackAdapter = MyTablesSync.getAuthStorage();
      assert.ok(fallbackAdapter, 'Fallback адаптер должен успешно создаваться');
      fallbackAdapter.setItem('test_resilience_key', 'test_val');
      assert.strictEqual(fallbackAdapter.getItem('test_resilience_key'), 'test_val');
      fallbackAdapter.removeItem('test_resilience_key');
    } finally {
      global.localStorage = origLocal;
    }
  });

  // Тест 4: test_manifest_structure_and_assets
  await runTest('test_manifest_structure_and_assets: парсинг manifest.json, standalone, тема #FAF2E7, наличие иконок', () => {
    const manifestPath = path.resolve(__dirname, '../manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'Файл manifest.json должен физически существовать в корне');

    const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestRaw);

    assert.strictEqual(manifest.name, 'Мои таблицы ♡', 'Имя в manifest.json должно быть «Мои таблицы ♡»');
    assert.strictEqual(manifest.short_name, 'Таблицы ♡', 'Короткое имя должно быть «Таблицы ♡»');
    assert.strictEqual(manifest.display, 'standalone', 'display должен быть "standalone"');
    assert.strictEqual(manifest.theme_color.toUpperCase(), '#FAF2E7', 'theme_color должен быть #FAF2E7');
    assert.strictEqual(manifest.background_color.toUpperCase(), '#FAF2E7', 'background_color должен быть #FAF2E7');

    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'В manifest.json должен быть массив icons');

    // Проверка физического присутствия иконок
    const icon192Path = path.resolve(__dirname, '../icons/icon-192.png');
    const icon512Path = path.resolve(__dirname, '../icons/icon-512.png');
    const iconSvgPath = path.resolve(__dirname, '../icons/icon.svg');

    assert.ok(fs.existsSync(icon192Path), 'Файл icons/icon-192.png должен физически существовать');
    assert.ok(fs.existsSync(icon512Path), 'Файл icons/icon-512.png должен физически существовать');
    assert.ok(fs.existsSync(iconSvgPath), 'Файл icons/icon.svg должен физически существовать');

    assert.ok(fs.statSync(icon192Path).size > 100, 'icon-192.png не должен быть пустым');
    assert.ok(fs.statSync(icon512Path).size > 100, 'icon-512.png не должен быть пустым');
    assert.ok(fs.statSync(iconSvgPath).size > 50, 'icon.svg не должен быть пустым');
  });

  // Тест 5: test_sw_precache_and_gas_bypass
  await runTest('test_sw_precache_and_gas_bypass: статический анализ sw.js, App Shell, пропуск GAS, отсутствие localStorage', () => {
    const swPath = path.resolve(__dirname, '../sw.js');
    assert.ok(fs.existsSync(swPath), 'Файл sw.js должен физически существовать в корне');

    const swCode = fs.readFileSync(swPath, 'utf8');

    // Проверка предкэшируемых путей
    assert.ok(swCode.includes("'./'") || swCode.includes('"./"'), 'sw.js должен кэшировать корень ./\'');
    assert.ok(swCode.includes('index.html'), 'sw.js должен кэшировать index.html');
    assert.ok(swCode.includes('manifest.json'), 'sw.js должен кэшировать manifest.json');
    assert.ok(swCode.includes('sync.js'), 'sw.js должен кэшировать sync.js');
    assert.ok(swCode.includes('icon-192.png'), 'sw.js должен кэшировать icon-192.png');

    // Проверка прямого пропуска GAS
    assert.ok(swCode.includes('script.google.com'), 'sw.js должен иметь фильтр для script.google.com');

    // Проверка фильтрации методов (поддержка Cache API только для GET)
    assert.ok(swCode.includes("event.request.method !== 'GET'") || swCode.includes('method !== "GET"'), 'sw.js должен проверять метод запроса (только GET для Cache API)');

    // Проверка отсутствия вызовов localStorage в воркере
    assert.strictEqual(swCode.includes('localStorage'), false, 'Service Worker не имеет доступа к localStorage и не должен его вызывать!');
  });

  // Тест 6: test_golden_standard_sync_styles
  await runTest('test_golden_standard_sync_styles: валидация CSS в sync.js — 0 рамок, 0 чисто белого цвета, утверждённые цвета', () => {
    const syncCode = fs.readFileSync(path.resolve(__dirname, '../sync.js'), 'utf8');

    // Находим секцию стилей injectStylesAndMarkup
    const styleMatch = syncCode.match(/textContent\s*=\s*\[([\s\S]*?)\]\.join/);
    assert.ok(styleMatch, 'sync.js должен содержать массив стилей injectStylesAndMarkup');
    const cssText = styleMatch[1];

    // 1. Проверка отсутствия числовых рамок (border: 1px..., border-radius не считается)
    const borderMatches = cssText.match(/border(?:-(?:top|bottom|left|right|width|style|color))?\s*:\s*[0-9]/gi) || [];
    assert.strictEqual(borderMatches.length, 0, `В стилях sync.js обнаружены рамки: ${borderMatches.join(', ')} — по Золотому стандарту Ани только border: none!`);

    // 2. Проверка отсутствия чисто белого цвета #FFFFFF / #FFF в CSS
    const whiteHexMatches = cssText.match(/#ffffff\b/gi) || [];
    const shortWhiteMatches = cssText.match(/#fff\b/gi) || [];
    assert.strictEqual(whiteHexMatches.length, 0, 'В стилях sync.js запрещён чисто белый цвет #FFFFFF!');
    assert.strictEqual(shortWhiteMatches.length, 0, 'В стилях sync.js запрещён чисто белый цвет #fff!');

    // 3. Проверка присутствия утверждённых цветов: небесно-голубой, мята, жёлтый/сливки
    assert.ok(cssText.toUpperCase().includes('#DCEEFE'), 'CSS должен содержать пастельный небесно-голубой #DCEEFE для профиля Ани');
    assert.ok(cssText.toUpperCase().includes('#C8E2D2'), 'CSS должен содержать нежную мяту #C8E2D2 для кнопки входа');
    assert.ok(cssText.toUpperCase().includes('#FDF1CC') || cssText.toUpperCase().includes('#FDF1C2'), 'CSS должен содержать тёплый жёлтый #FDF1C2 или сливки #FDF1CC');

    // 4. Проверка отсутствия оранжевого / персикового во входном окне Google Gate
    const gateCardMatch = cssText.match(/\.mytables-auth-card[\s\S]*?\{([\s\S]*?)\}/);
    if (gateCardMatch) {
      assert.strictEqual(gateCardMatch[1].toUpperCase().includes('#FCE8D5'), false, 'Входная карточка не должна содержать оранжевый #FCE8D5!');
    }
  });

  // Тест 7: test_offline_data_fallback_honesty
  await runTest('test_offline_data_fallback_honesty: честный откат на кэшированные данные со статусом «Нет связи с Google ✕»', async () => {
    const mockCacheData = {
      summary: [{ metric: 'Баланс', value: 120000 }],
      income: [{ ID: 'inc_test', Сумма: 50000 }],
      expenses: [{ ID: 'exp_test', Сумма: 15000 }],
      clients: [{ ID: 'cli_test', Имя: 'Тестовый клиент' }]
    };

    // Сохраняем в кэш
    const storageKey = MyTablesSync.CONFIG.CACHE_STORAGE_KEY;
    const authStore = MyTablesSync.getAuthStorage ? MyTablesSync.getAuthStorage() : global.sessionStorage;
    authStore.setItem(storageKey, JSON.stringify(mockCacheData));

    // Симулируем сетевой сбой
    const origFetch = global.fetch;
    global.fetch = () => Promise.reject(new Error('Network error: DNS failed'));

    try {
      const result = await MyTablesSync.getAllData();
      assert.strictEqual(result.success, false, 'При ошибке сети success должен быть false');
      assert.ok(result.data, 'Должны вернуться кэшированные данные');
      assert.strictEqual(result.data.income.length, 1, 'Кэшированные доходы должны быть получены');
      assert.strictEqual(result.data.income[0].ID, 'inc_test');

      const state = MyTablesSync.getState();
      assert.strictEqual(state.status, 'error', 'Статус должен быть error');
      assert.strictEqual(state.text, 'Нет связи с Google ✕', 'Текст статуса должен быть «Нет связи с Google ✕»');
    } finally {
      global.fetch = origFetch;
    }
  });

  // Тест 8: test_logout_btn_and_gate_modal_symmetry
  await runTest('test_logout_btn_and_gate_modal_symmetry: симметричный !important display модалки и клик по .mytables-logout-btn', () => {
    // Подготовка мок-элемента gate
    const gateStyle = {
      _props: {},
      setProperty: function (prop, val, priority) {
        this._props[prop] = { val: val, priority: priority || '' };
        this[prop] = val;
      },
      getPropertyValue: function (prop) {
        return this._props[prop] ? this._props[prop].val : this[prop] || '';
      },
      getPropertyPriority: function (prop) {
        return this._props[prop] ? this._props[prop].priority : '';
      }
    };
    const mockGate = { id: 'mytables-auth-gate', style: gateStyle };
    const mockEmailInput = { id: 'mytables-auth-email', value: '' };

    // Подготовка мок-кнопок выхода
    let logoutClickListeners = [];
    const mockLogoutBtn = {
      className: 'mytables-logout-btn',
      addEventListener: (evt, handler) => {
        if (evt === 'click') logoutClickListeners.push(handler);
      },
      dispatchEvent: (evt) => {
        logoutClickListeners.forEach((fn) => fn(evt));
      }
    };

    const origDoc = global.document;
    try {
      global.document = {
        createElement: (tag) => ({
          tagName: tag,
          style: {},
          appendChild: () => {},
          addEventListener: () => {}
        }),
        head: { appendChild: () => {} },
        body: { appendChild: () => {} },
        getElementById: (id) => {
          if (id === 'mytables-auth-gate') return mockGate;
          if (id === 'mytables-auth-email') return mockEmailInput;
          if (id === 'mytables-sync-styles' || id === 'mytables-sync-badge') return { style: {} };
          return null;
        },
        querySelectorAll: (sel) => {
          if (sel === '.mytables-logout-btn') return [mockLogoutBtn];
          if (sel === '.mytables-user-email' || sel === '.sidebar-user-name' || sel === '.sidebar-avatar') return [];
          return [];
        }
      };

      // Проверка симметрии showAuthModal / hideAuthModal
      MyTablesSync.showAuthModal();
      assert.strictEqual(mockGate.style.getPropertyValue('display'), 'flex');
      assert.strictEqual(mockGate.style.getPropertyPriority('display'), 'important', 'showAuthModal обязан использовать !important');

      MyTablesSync.hideAuthModal();
      assert.strictEqual(mockGate.style.getPropertyValue('display'), 'none');
      assert.strictEqual(mockGate.style.getPropertyPriority('display'), 'important', 'hideAuthModal обязан использовать !important');

      // Авторизуем пользователя перед проверкой клика
      MyTablesSync.login('lifekvi2018@gmail.com');
      assert.strictEqual(MyTablesSync.isAuthenticated(), true);

      // Привязываем слушатели через initUI
      MyTablesSync.initUI();
      assert.ok(mockLogoutBtn._hasLogoutListener, 'Кнопка .mytables-logout-btn должна получить флаг слушателя');
      assert.strictEqual(logoutClickListeners.length >= 1, true, 'Должен быть зарегистрирован обработчик клика');

      // Кликаем по кнопке выхода
      mockLogoutBtn.dispatchEvent({ preventDefault: () => {} });
      assert.strictEqual(MyTablesSync.isAuthenticated(), false, 'После клика по .mytables-logout-btn сессия должна завершиться');
      assert.strictEqual(mockGate.style.getPropertyValue('display'), 'flex', 'После логаута должно открыться окно входа');
    } finally {
      global.document = origDoc;
    }
  });

  // Тест 9: test_root_safety_and_auth_callbacks
  await runTest('test_root_safety_and_auth_callbacks: UMD-параметр root, отсутствие ReferenceError и вызов onAuthSuccess/onDataRefreshed', () => {
    const syncSource = fs.readFileSync(path.resolve(__dirname, '../sync.js'), 'utf8');

    // Проверяем сигнатуру UMD-обёртки
    assert.ok(syncSource.includes('function (root, factory)'), 'UMD должен принимать (root, factory)');
    assert.ok(syncSource.includes('module.exports = factory(root)'), 'Node экспорт должен передавать factory(root)');
    assert.ok(syncSource.includes('root.MyTablesSync = factory(root)'), 'Браузер экспорт должен передавать factory(root)');
    assert.ok(syncSource.includes('function (root) {'), 'Фабричная функция обязана объявлять параметр root');

    // Проверяем безопасный доступ
    assert.ok(syncSource.includes("typeof root !== 'undefined' && root && typeof root.onAuthSuccess === 'function'"), 'sync.js должен безопасно проверять root.onAuthSuccess');
    assert.ok(syncSource.includes("typeof root !== 'undefined' && root && typeof root.onDataRefreshed === 'function'"), 'sync.js должен безопасно проверять root.onDataRefreshed');

    // Тестируем исполнение в чистом контексте VM
    const vm = require('vm');
    const sandbox = {
      module: { exports: {} },
      exports: {},
      console: console,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout
    };
    vm.createContext(sandbox);
    assert.doesNotThrow(() => {
      vm.runInContext(syncSource, sandbox);
    }, 'Инициализация sync.js в чистом VM контексте не должна выбрасывать ReferenceError');
  });

  // Тест 10: test_regression_suite_all_stages
  await runTest('test_regression_suite_all_stages: сквозная проверка всех предыдущих стейджей (0 регрессий)', () => {
    const suites = [
      'tests/stage1_calendar.test.js',
      'tests/stage1_main.test.js',
      'tests/stage2_expenses.test.js',
      'tests/stage3_income.test.js',
      'tests/stage4_clients.test.js',
      'tests/sync.test.js',
      'tests/stage5_mockup.test.js',
      'tests/check_mockup_layout.js'
    ];

    suites.forEach((suite) => {
      try {
        execSync(`node "${suite}"`, { stdio: 'pipe' });
      } catch (err) {
        throw new Error(`Регрессия в сьюте ${suite}: ${err.message}`);
      }
    });
  });

  console.log('\n======================================================');
  console.log(`ИТОГО Стейдж 5: Пройдено: ${testsPassed}, Ошибок: ${testsFailed}`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runStage5Tests();
