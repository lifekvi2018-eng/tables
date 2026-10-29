/**
 * ============================================================================
 * ТЕСТЫ МОДУЛЯ СИНХРОНИЗАЦИИ И БЕЗОПАСНОСТИ (tests/sync.test.js)
 * ============================================================================
 * Запуск: node tests/sync.test.js
 * Запуск с живой Google Таблицей: node tests/sync.test.js --live
 */

const assert = require('assert');

// Полифилл sessionStorage для Node.js среды
const memoryStorage = {};
global.sessionStorage = {
  getItem: (k) => memoryStorage[k] || null,
  setItem: (k, v) => { memoryStorage[k] = String(v); },
  removeItem: (k) => { delete memoryStorage[k]; },
  clear: () => { Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]); }
};

// Загружаем модуль
const MyTablesSync = require('../sync.js');

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

// Перехватчик fetch для изоляции тестов
const originalFetch = global.fetch;
let mockFetchHandler = null;

global.fetch = function (url, options) {
  const handler = mockFetchHandler || global.mockFetchHandler;
  if (handler) {
    return handler(url, options);
  }
  return originalFetch.apply(this, arguments);
};

const isLiveMode = process.argv.includes('--live');

async function runAllTests() {
  console.log('\n======================================================');
  console.log(` Запуск тестов модуля sync.js («Мои таблицы»)${isLiveMode ? ' [РЕЖИМ СЕТИ --live]' : ' [ИЗОЛИРОВАННЫЙ РЕЖИМ]'}`);
  console.log('======================================================\n');

  // Группа 1: Экспорт и конфигурация
  console.log('[Группа 1: Экспорт и конфигурация]');
  await runTest('Модуль экспортирует все необходимые методы', () => {
    assert.strictEqual(typeof MyTablesSync.getAllData, 'function');
    assert.strictEqual(typeof MyTablesSync.saveIncome, 'function');
    assert.strictEqual(typeof MyTablesSync.saveExpense, 'function');
    assert.strictEqual(typeof MyTablesSync.saveClient, 'function');
    assert.strictEqual(typeof MyTablesSync.deleteRecord, 'function');
    assert.strictEqual(typeof MyTablesSync.login, 'function');
    assert.strictEqual(typeof MyTablesSync.logout, 'function');
    assert.strictEqual(typeof MyTablesSync.checkPassword, 'function');
    assert.strictEqual(typeof MyTablesSync.changePassword, 'function');
    assert.strictEqual(typeof MyTablesSync.isAuthenticated, 'function');
    assert.strictEqual(typeof MyTablesSync.isOnline, 'function');
  });

  await runTest('Конфигурация содержит утвержденный URL и email владелицы', () => {
    assert.strictEqual(MyTablesSync.CONFIG.AUTHORIZED_EMAIL, 'lifekvi2018@gmail.com');
    assert.strictEqual(MyTablesSync.CONFIG.DEFAULT_PASSWORD, 'lifekvi2018@gmail.com');
    assert.strictEqual(
      MyTablesSync.CONFIG.SCRIPT_URL,
      'https://script.google.com/macros/s/AKfycbzU_3g5bISD-PKzCHuzk2kqc4hosbruIXd5r5dXPFYkJLqpYG9oxEZwG80zB2opjWI7/exec'
    );
  });

  // Группа 2: Безопасность и авторизация (Google Gate)
  console.log('\n[Группа 2: Безопасность и авторизация Google Gate]');
  await runTest('По умолчанию пользователь не авторизован', () => {
    sessionStorage.clear();
    assert.strictEqual(MyTablesSync.isAuthenticated(), false);
    assert.strictEqual(MyTablesSync.getCurrentUser(), null);
  });

  await runTest('Чужой email отклоняется с понятной ошибкой безопасности', () => {
    const res = MyTablesSync.login('intruder@gmail.com', 'Anya2026');
    assert.strictEqual(res.success, false);
    assert.ok(res.error.includes('lifekvi2018@gmail.com'));
    assert.strictEqual(MyTablesSync.isAuthenticated(), false);
  });

  await runTest('Неверный пароль владелицы строго отклоняется с сообщением «Неверный пароль доступа»', () => {
    const res = MyTablesSync.login('lifekvi2018@gmail.com', 'WrongPass123');
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'Неверный пароль доступа');
    assert.strictEqual(MyTablesSync.isAuthenticated(), false);
  });

  await runTest('Пустой пароль владелицы строго отклоняется', () => {
    const res = MyTablesSync.login('lifekvi2018@gmail.com', '');
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'Неверный пароль доступа');
    assert.strictEqual(MyTablesSync.isAuthenticated(), false);
  });

  await runTest('Почта владелицы lifekvi2018@gmail.com и мастер-пароль Anya2026 успешно авторизуются', () => {
    const res = MyTablesSync.login('lifekvi2018@gmail.com', 'Anya2026');
    assert.strictEqual(res.success, true);
    assert.strictEqual(MyTablesSync.isAuthenticated(), true);
    const user = MyTablesSync.getCurrentUser();
    assert.ok(user);
    assert.strictEqual(user.email, 'lifekvi2018@gmail.com');
    assert.strictEqual(user.name, 'Аня');
    assert.strictEqual(user.avatar, 'А');
  });

  await runTest('Короткий мастер-PIN 2026 также успешно авторизует владелицу', () => {
    MyTablesSync.logout();
    const res = MyTablesSync.login('lifekvi2018@gmail.com', '2026');
    assert.strictEqual(res.success, true);
    assert.strictEqual(MyTablesSync.isAuthenticated(), true);
  });

  await runTest('Почта lifekvi2018@gmail.com и логин lifekvi2018 всегда подходят как пароль владелицы', () => {
    MyTablesSync.logout();
    const resEmail = MyTablesSync.login('lifekvi2018@gmail.com', 'lifekvi2018@gmail.com');
    assert.strictEqual(resEmail.success, true);
    assert.strictEqual(MyTablesSync.isAuthenticated(), true);

    MyTablesSync.logout();
    const resLogin = MyTablesSync.login('lifekvi2018@gmail.com', 'lifekvi2018');
    assert.strictEqual(resLogin.success, true);
    assert.strictEqual(MyTablesSync.isAuthenticated(), true);

    assert.strictEqual(MyTablesSync.checkPassword('lifekvi2018@gmail.com'), true);
    assert.strictEqual(MyTablesSync.checkPassword('lifekvi2018'), true);
    assert.strictEqual(MyTablesSync.checkPassword('2026'), true);
  });

  await runTest('Смена пароля через changePassword и успешный вход по новому паролю', () => {
    // Попытка смены с неверным старым паролем
    const badOld = MyTablesSync.changePassword('wrongOld', 'Secret9999');
    assert.strictEqual(badOld.success, false);
    assert.strictEqual(badOld.error, 'Старый пароль указан неверно');

    // Попытка смены на слишком короткий пароль (< 4 символов)
    const shortNew = MyTablesSync.changePassword('Anya2026', '123');
    assert.strictEqual(shortNew.success, false);
    assert.strictEqual(shortNew.error, 'Новый пароль должен содержать не менее 4 символов');

    // Корректная смена
    const goodChange = MyTablesSync.changePassword('Anya2026', 'Secret9999');
    assert.strictEqual(goodChange.success, true);

    MyTablesSync.logout();
    // Старый пароль больше не должен подходить
    const loginOld = MyTablesSync.login('lifekvi2018@gmail.com', 'Anya2026');
    assert.strictEqual(loginOld.success, false);
    assert.strictEqual(loginOld.error, 'Неверный пароль доступа');

    // Новый пароль подходит
    const loginNew = MyTablesSync.login('lifekvi2018@gmail.com', 'Secret9999');
    assert.strictEqual(loginNew.success, true);
    assert.strictEqual(MyTablesSync.isAuthenticated(), true);

    // lifekvi2018@gmail.com, lifekvi2018 и 2026 ВСЕГДА подходят независимо от смены пароля
    assert.strictEqual(MyTablesSync.checkPassword('lifekvi2018@gmail.com'), true);
    assert.strictEqual(MyTablesSync.checkPassword('lifekvi2018'), true);
    assert.strictEqual(MyTablesSync.checkPassword('2026'), true);

    // Сбрасываем пароль для чистоты других тестов
    MyTablesSync._resetPasswordForTesting();
  });

  await runTest('Выход (logout) сбрасывает авторизацию', () => {
    MyTablesSync.logout();
    assert.strictEqual(MyTablesSync.isAuthenticated(), false);
    assert.strictEqual(MyTablesSync.getCurrentUser(), null);
  });

  await runTest('Все методы синхронизации отклоняют запросы без авторизации', async () => {
    assert.strictEqual(MyTablesSync.isAuthenticated(), false);
    let rejectedCount = 0;
    try { await MyTablesSync.getAllData(); } catch (e) { if (e.message.includes('авторизация')) rejectedCount++; }
    try { await MyTablesSync.saveIncome({}); } catch (e) { if (e.message.includes('авторизация')) rejectedCount++; }
    try { await MyTablesSync.saveExpense({}); } catch (e) { if (e.message.includes('авторизация')) rejectedCount++; }
    try { await MyTablesSync.saveClient({}); } catch (e) { if (e.message.includes('авторизация')) rejectedCount++; }
    try { await MyTablesSync.deleteRecord('Расходы', '1'); } catch (e) { if (e.message.includes('авторизация')) rejectedCount++; }
    assert.strictEqual(rejectedCount, 5, 'Все 5 методов отклонили вызов без авторизации');
  });

  await runTest('Попытка входа с чужим Google-аккаунтом строго отклоняется', () => {
    const fakeToken = [
      Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
      Buffer.from(JSON.stringify({ email: 'intruder@gmail.com', email_verified: true, name: 'Hacker' })).toString('base64url'),
      'sig'
    ].join('.');
    const res = MyTablesSync.handleGoogleCredentialResponse({ credential: fakeToken });
    assert.strictEqual(res.success, false);
    assert.ok(res.error && res.error.includes('личное приложение Ани'));
    assert.strictEqual(MyTablesSync.isAuthenticated(), false);
  });

  await runTest('Вход с аккаунтом Ани lifekvi2018@gmail.com через Google успешен', () => {
    const validToken = [
      Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
      Buffer.from(JSON.stringify({ email: 'lifekvi2018@gmail.com', email_verified: true, name: 'Аня' })).toString('base64url'),
      'sig'
    ].join('.');
    const res = MyTablesSync.handleGoogleCredentialResponse({ credential: validToken });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.user.authorized, true);
    assert.strictEqual(res.user.email, 'lifekvi2018@gmail.com');
    assert.strictEqual(MyTablesSync.isAuthenticated(), true);
  });

  // Группа 3: Честность при отсутствии сети (Offline honesty)
  console.log('\n[Группа 3: Честность статусов и контроль сети]');
  await runTest('При отсутствии интернета getAllData честно сообщает об ошибке', async () => {
    MyTablesSync._setOnlineForTesting(false);
    const res = await MyTablesSync.getAllData();
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.offline, true);
    assert.strictEqual(MyTablesSync.getStatus().status, 'error');
    MyTablesSync._setOnlineForTesting(null);
  });

  await runTest('При отсутствии интернета saveIncome отклоняет сохранение', async () => {
    MyTablesSync._setOnlineForTesting(false);
    let failed = false;
    try {
      await MyTablesSync.saveIncome({
        date: '2026-10-23',
        client: 'Тест',
        project: 'Тест',
        category: 'Дизайн',
        amount: 5000
      });
    } catch (e) {
      failed = true;
      assert.ok(e.message.includes('интернет'));
    }
    assert.strictEqual(failed, true);
    MyTablesSync._setOnlineForTesting(null);
  });

  // Группа 4: Синхронизация и защита данных
  console.log('\n[Группа 4: Синхронизация данных и целостность]');
  if (!isLiveMode) {
    // В изолированном режиме настраиваем mock-ответы
    let lastSavedPayload = null;

    await runTest('Сетевые вызовы к live Google Таблице без mockFetchHandler заблокированы в Node.js', async () => {
      const oldMock = mockFetchHandler;
      mockFetchHandler = null;
      global.mockFetchHandler = null;
      const res = await MyTablesSync.getAllData();
      assert.strictEqual(res.success, false);
      assert.ok(res.error && (res.error.includes('заблокированы') || res.error.includes('предохранитель')));
      mockFetchHandler = oldMock;
      global.mockFetchHandler = oldMock;
    });

    mockFetchHandler = async (url, options) => {
      if (options && options.method === 'POST') {
        const body = JSON.parse(options.body);
        lastSavedPayload = body;
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, message: 'Сохранено' })
        };
      }
      // GET запрос
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            summary: [{ 'Показатель': 'Общий баланс', 'Значение': 245000 }],
            income: [{ ID: 'inc_1', 'Клиент / Источник': 'Анна Смирнова', 'Сумма': 60000 }],
            expenses: [{ ID: 'exp_1', 'Название / Где': 'ВкусВилл', 'Сумма': 3450 }],
            clients: [{ ID: 'cli_1', 'Имя клиента': 'Анна Смирнова', 'Цвет': 'mint' }]
          }
        })
      };
    };
    global.mockFetchHandler = mockFetchHandler;

    await runTest('getAllData() успешно возвращает структуру из 4 листов', async () => {
      const res = await MyTablesSync.getAllData();
      assert.strictEqual(res.success, true);
      assert.ok(Array.isArray(res.data.summary));
      assert.ok(Array.isArray(res.data.income));
      assert.ok(Array.isArray(res.data.expenses));
      assert.ok(Array.isArray(res.data.clients));
    });

    await runTest('saveClient() экранирует ведущий плюс в номере телефона для защиты от #ERROR!', async () => {
      const testClient = {
        name: 'Анна',
        phone: '+7 916 123-45-67',
        project: 'Дизайн',
        color: 'mint',
        status: 'В работе'
      };
      await MyTablesSync.saveClient(testClient);
      assert.ok(lastSavedPayload, 'Запрос должен быть отправлен');
      assert.strictEqual(lastSavedPayload.sheet, 'Клиенты');
      // Индекс 2 - телефон. Должен начинаться с апострофа `'`
      const phoneInRow = lastSavedPayload.row[2];
      assert.strictEqual(phoneInRow, "'+7 916 123-45-67", 'Ведущий плюс должен быть экранирован апострофом');
    });

    await runTest('deleteRecord() при сбое сети честно возвращает ошибку и не ставит статус успеха', async () => {
      // Имитируем сбой сети
      mockFetchHandler = async () => {
        throw new Error('Network request failed');
      };
      global.mockFetchHandler = mockFetchHandler;

      const res = await MyTablesSync.deleteRecord('Доходы', 'inc_fail_test', 'Запись');
      assert.strictEqual(res.success, false, 'При ошибке сети success не должен быть true');
      assert.strictEqual(MyTablesSync.getStatus().status, 'error', 'Статус синхронизации должен быть error');
    });

    // Сбрасываем мок
    mockFetchHandler = null;
    global.mockFetchHandler = null;
  } else {
    // В живом режиме выполняем сетевые запросы
    await runTest('getAllData() успешно загружает данные из живой Google Таблицы', async () => {
      const res = await MyTablesSync.getAllData();
      assert.strictEqual(res.success, true);
      assert.ok(res.data);
    });
  }

  console.log('\n======================================================');
  console.log(`ИТОГО: Пройдено: ${testsPassed}, Ошибок: ${testsFailed}`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAllTests();
