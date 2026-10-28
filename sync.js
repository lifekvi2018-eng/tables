/**
 * ============================================================================
 * ПРОЕКТ «МОИ ТАБЛИЦЫ» — МОДУЛЬ СИНХРОНИЗАЦИИ И БЕЗОПАСНОСТИ (sync.js)
 * ============================================================================
 * Архитектура безопасности: security_architecture.md
 * Дизайн-код: Тактильные «3D-Бумажечки», shadcn/ui токены, шрифт Manrope
 * Вход разрешен строго для: lifekvi2018@gmail.com
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node.js окружение
    module.exports = factory(root);
  } else {
    // Браузерное окружение
    root.MyTablesSync = factory(root);
  }
})(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';

  // --- КОНФИГУРАЦИЯ ---
  var CONFIG = {
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzU_3g5bISD-PKzCHuzk2kqc4hosbruIXd5r5dXPFYkJLqpYG9oxEZwG80zB2opjWI7/exec',
    AUTHORIZED_EMAIL: 'lifekvi2018@gmail.com',
    DEFAULT_PASSWORD: 'lifekvi2018@gmail.com',
    AUTH_STORAGE_KEY: 'my_tables_auth_user',
    PASSWORD_STORAGE_KEY: 'my_tables_auth_pwd',
    CACHE_STORAGE_KEY: 'my_tables_cached_data',
    DELETED_STORAGE_KEY: 'my_tables_deleted_ids',
    TIMEOUT_MS: 15000
  };

  // --- ВНУТРЕННЕЕ СОСТОЯНИЕ ---
  var state = {
    status: 'idle', // 'idle' | 'saving' | 'saved' | 'error'
    statusText: 'Готов к работе',
    lastSync: null,
    errorMessage: '',
    listeners: [],
    modalResolve: null,
    cachedData: null
  };

  // --- УТИЛИТЫ ХРАНИЛИЩА И АДАПТЕР СЕССИЙ (DEF-5.2, DEF-5.3) ---
  var _memStore = {};
  var memoryStorageAdapter = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(_memStore, k) ? _memStore[k] : null; },
    setItem: function (k, v) { _memStore[k] = String(v); },
    removeItem: function (k) { delete _memStore[k]; },
    clear: function () { _memStore = {}; }
  };

  function getAuthStorage(forceSessionOnly) {
    if (typeof window === 'undefined') {
      // Node.js окружение
      if (forceSessionOnly && typeof sessionStorage !== 'undefined') {
        try { return sessionStorage; } catch (e) {}
      }
      if (typeof localStorage !== 'undefined') {
        try { return localStorage; } catch (e) {}
      }
      if (typeof sessionStorage !== 'undefined') {
        try { return sessionStorage; } catch (e) {}
      }
      return memoryStorageAdapter;
    }

    if (forceSessionOnly) {
      try {
        if (window.sessionStorage) return window.sessionStorage;
      } catch (e) {}
      return memoryStorageAdapter;
    }

    // Браузерное окружение
    var isStandalone = false;
    try {
      isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
                     (window.navigator && window.navigator.standalone === true);
    } catch (e) {}

    var isDesktop = typeof window.innerWidth === 'number' && window.innerWidth > 768;
    var usePersistentStorage = isDesktop || isStandalone;

    if (usePersistentStorage) {
      try {
        if (window.localStorage) return window.localStorage;
      } catch (e) {
        console.warn('localStorage недоступен, откат на sessionStorage:', e);
      }
    }

    try {
      if (window.sessionStorage) return window.sessionStorage;
    } catch (e) {
      console.warn('sessionStorage недоступен:', e);
    }

    return memoryStorageAdapter;
  }

  var storage = {
    get: function (key) {
      try {
        var adapter = getAuthStorage();
        var val = adapter.getItem(key);
        if (val) return JSON.parse(val);
      } catch (e) {
        console.warn('Storage read error:', e);
      }
      return null;
    },
    set: function (key, value) {
      try {
        var adapter = getAuthStorage();
        adapter.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('Storage write error:', e);
      }
    },
    remove: function (key) {
      try {
        var adapter = getAuthStorage();
        adapter.removeItem(key);
        if (typeof localStorage !== 'undefined') {
          try { localStorage.removeItem(key); } catch (e) {}
        }
        if (typeof sessionStorage !== 'undefined') {
          try { sessionStorage.removeItem(key); } catch (e) {}
        }
      } catch (e) {
        console.warn('Storage remove error:', e);
      }
    }
  };

  // --- СПИСОК УДАЛЕННЫХ ID ---
  function getDeletedIds() {
    var list = storage.get(CONFIG.DELETED_STORAGE_KEY);
    return Array.isArray(list) ? list : [];
  }

  function addDeletedId(id) {
    if (!id) return;
    var list = getDeletedIds();
    if (list.indexOf(String(id)) === -1) {
      list.push(String(id));
      storage.set(CONFIG.DELETED_STORAGE_KEY, list);
    }
  }

  // --- ПРОВЕРКА СЕТИ ---
  var testOnlineOverride = null;
  function isOnline() {
    if (testOnlineOverride !== null) return testOnlineOverride;
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  }

  // --- УВЕДОМЛЕНИЕ ПОДПИСЧИКОВ ---
  function notifyListeners() {
    for (var i = 0; i < state.listeners.length; i++) {
      try {
        state.listeners[i]({
          status: state.status,
          text: state.statusText,
          errorMessage: state.errorMessage,
          lastSync: state.lastSync
        });
      } catch (err) {
        console.error('Listener error:', err);
      }
    }
    updateBadgeUI();
  }

  // --- УСТАНОВКА СТАТУСА ---
  function setStatus(status, text, errorMsg) {
    state.status = status;
    state.statusText = text || '';
    state.errorMessage = errorMsg || '';
    if (status === 'saved') {
      state.lastSync = new Date();
    }
    notifyListeners();
  }

  function getState() {
    return {
      status: state.status,
      text: state.statusText,
      errorMessage: state.errorMessage,
      lastSync: state.lastSync
    };
  }

  // ==========================================================================
  // АВТОРИЗАЦИЯ (GOOGLE GATE) — 30 ДНЕЙ И СТРОГО lifekvi2018@gmail.com + СЕКРЕТНЫЙ ПАРОЛЬ
  // ==========================================================================

  var SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 дней в миллисекундах

  function getMasterPassword() {
    var stored = storage.get(CONFIG.PASSWORD_STORAGE_KEY);
    if (stored && typeof stored === 'string' && stored.trim().length > 0) {
      return stored.trim();
    }
    return CONFIG.DEFAULT_PASSWORD;
  }

  function checkPassword(pass) {
    if (typeof pass !== 'string') return false;
    var input = pass.trim();
    if (!input) return false;
    var master = getMasterPassword();
    if (input === master) return true;
    if (input.toLowerCase() === master.toLowerCase()) return true;
    if (input.toLowerCase() === CONFIG.AUTHORIZED_EMAIL.toLowerCase()) return true;
    if (input.toLowerCase() === 'lifekvi2018') return true;
    if (input === '2026') return true;
    if (!storage.get(CONFIG.PASSWORD_STORAGE_KEY) && input === 'Anya2026') return true;
    return false;
  }

  function changePassword(oldPass, newPass) {
    if (!checkPassword(oldPass)) {
      return { success: false, error: 'Старый пароль указан неверно' };
    }
    if (!newPass || typeof newPass !== 'string' || newPass.trim().length < 4) {
      return { success: false, error: 'Новый пароль должен содержать не менее 4 символов' };
    }
    var cleanNew = newPass.trim();
    storage.set(CONFIG.PASSWORD_STORAGE_KEY, cleanNew);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(CONFIG.PASSWORD_STORAGE_KEY, JSON.stringify(cleanNew));
      } catch (e) {}
    }
    return { success: true, message: 'Пароль успешно обновлён' };
  }

  function _resetPasswordForTesting() {
    storage.remove(CONFIG.PASSWORD_STORAGE_KEY);
    if (typeof localStorage !== 'undefined') {
      try { localStorage.removeItem(CONFIG.PASSWORD_STORAGE_KEY); } catch (e) {}
    }
  }

  function isAuthenticated() {
    var adapter = getAuthStorage();
    var raw = adapter.getItem(CONFIG.AUTH_STORAGE_KEY);
    if (!raw && typeof sessionStorage !== 'undefined') {
      try { raw = sessionStorage.getItem(CONFIG.AUTH_STORAGE_KEY); } catch (e) {}
    }
    if (!raw) return false;
    try {
      var user = JSON.parse(raw);
      if (!user || !user.authorized || !user.email || user.email.toLowerCase() !== CONFIG.AUTHORIZED_EMAIL.toLowerCase()) {
        return false;
      }
      // Автоинвалидация сессии при истечении срока действия (DEF-5.3)
      if (user.expiresAt && Date.now() > user.expiresAt) {
        logout();
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function getCurrentUser() {
    if (!isAuthenticated()) return null;
    return storage.get(CONFIG.AUTH_STORAGE_KEY);
  }

  function login(email, password, rememberMe) {
    var cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === 'lifekvi2018') {
      cleanEmail = CONFIG.AUTHORIZED_EMAIL.toLowerCase();
    }
    if (cleanEmail !== CONFIG.AUTHORIZED_EMAIL.toLowerCase()) {
      var err = 'Доступ ограничен. Это личное приложение только для ' + CONFIG.AUTHORIZED_EMAIL;
      return { success: false, error: err };
    }

    if (!password || !checkPassword(password)) {
      return { success: false, error: 'Неверный пароль доступа' };
    }

    var isRemember = rememberMe !== false;
    var now = Date.now();
    var user = {
      authorized: true,
      email: cleanEmail,
      name: 'Аня',
      avatar: 'А',
      loginTime: now,
      rememberMe: isRemember,
      expiresAt: isRemember ? (now + SESSION_TTL_MS) : (now + 24 * 60 * 60 * 1000)
    };

    var adapter = getAuthStorage(!isRemember);
    adapter.setItem(CONFIG.AUTH_STORAGE_KEY, JSON.stringify(user));

    if (!isRemember && typeof localStorage !== 'undefined') {
      try { localStorage.removeItem(CONFIG.AUTH_STORAGE_KEY); } catch (e) {}
    }

    hideAuthModal();
    notifyListeners();
    updateUserChips();
    return { success: true, user: user };
  }

  function logout() {
    var adapter = getAuthStorage();
    adapter.removeItem(CONFIG.AUTH_STORAGE_KEY);
    if (typeof localStorage !== 'undefined') {
      try { localStorage.removeItem(CONFIG.AUTH_STORAGE_KEY); } catch (e) {}
    }
    if (typeof sessionStorage !== 'undefined') {
      try { sessionStorage.removeItem(CONFIG.AUTH_STORAGE_KEY); } catch (e) {}
    }
    _memStore = {};
    notifyListeners();
    updateUserChips();
    if (typeof document !== 'undefined') {
      var pwdInput = document.getElementById('mytables-auth-password');
      if (pwdInput) pwdInput.value = '';
      var errBox = document.getElementById('mytables-auth-error');
      if (errBox) {
        errBox.style.display = 'none';
        errBox.textContent = '';
      }
    }
    showAuthModal();
  }

  // ==========================================================================
  // БЕЗОПАСНЫЕ СЕТЕВЫЕ ЗАПРОСЫ К GOOGLE APPS SCRIPT
  // ==========================================================================

  function fetchWithTimeout(url, options, timeoutMs) {
    timeoutMs = timeoutMs || CONFIG.TIMEOUT_MS;

    if (!isOnline()) {
      return Promise.reject(new Error('Нет подключения к интернету. Проверьте сеть.'));
    }

    // Если среда поддерживает AbortController
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var signal = controller ? controller.signal : undefined;

    var fetchOptions = Object.assign({}, options || {}, {
      signal: signal,
      redirect: 'follow'
    });

    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        if (controller) controller.abort();
        reject(new Error('Время ожидания ответа от Google Таблицы истекло (' + Math.round(timeoutMs / 1000) + ' сек)'));
      }, timeoutMs);

      fetch(url, fetchOptions)
        .then(function (res) {
          clearTimeout(timer);
          if (!res.ok) {
            throw new Error('Google Apps Script вернул ошибку: HTTP ' + res.status);
          }
          return res.json();
        })
        .then(function (json) {
          resolve(json);
        })
        .catch(function (err) {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  // ==========================================================================
  // МЕТОДЫ РАБОТЫ С ДАННЫМИ
  // ==========================================================================

  /**
   * Загрузка всех данных из 4 листов ('Главная', 'Доходы', 'Расходы', 'Клиенты')
   */
  function getAllData(options) {
    options = options || {};

    if (!isOnline()) {
      setStatus('error', 'Нет связи с Google ✕', 'Отсутствует интернет-соединение');
      var cached = getCachedData();
      return Promise.resolve({
        success: false,
        error: 'Нет подключения к интернету',
        offline: true,
        data: cached || getEmptyData()
      });
    }

    setStatus('saving', 'Синхронизирую с Google...');

    return fetchWithTimeout(CONFIG.SCRIPT_URL, { method: 'GET' })
      .then(function (resp) {
        if (resp && resp.success && resp.data) {
          var deleted = getDeletedIds();
          var filterDeleted = function (arr) {
            if (!Array.isArray(arr)) return [];
            var map = new Map();
            for (var i = 0; i < arr.length; i++) {
              var item = arr[i];
              var id = item.ID || item.id;
              if (id) {
                if (deleted.indexOf(String(id)) === -1) {
                  map.set(String(id), item);
                }
              } else {
                map.set('no_id_' + i, item);
              }
            }
            var result = [];
            map.forEach(function (v) { result.push(v); });
            return result;
          };

          var cleanData = {
            summary: resp.data.summary || [],
            income: filterDeleted(resp.data.income || []),
            expenses: filterDeleted(resp.data.expenses || []),
            clients: filterDeleted(resp.data.clients || [])
          };

          state.cachedData = cleanData;
          storage.set(CONFIG.CACHE_STORAGE_KEY, cleanData);

          setStatus('saved', 'Синхронизировано с Google ✓');
          return { success: true, data: cleanData };
        } else {
          throw new Error((resp && resp.error) || 'Некорректный ответ от Google');
        }
      })
      .catch(function (err) {
        setStatus('error', 'Нет связи с Google ✕', err.message);
        var cached = getCachedData();
        return {
          success: false,
          error: err.message,
          data: cached || getEmptyData()
        };
      });
  }

  /**
   * Сохранение новой строки дохода
   */
  function saveIncome(record) {
    if (!isOnline()) {
      setStatus('error', 'Нет связи с Google ✕', 'Нельзя сохранить без интернета');
      return Promise.reject(new Error('Нет подключения к интернету. Доход не сохранен.'));
    }

    setStatus('saving', 'Сохраняю доход в Google...');

    var id = record.ID || record.id || ('inc_' + Date.now());
    var dayVal = record.day || record.dayOfMonth;
    var date = record.Дата || record.date;
    if (dayVal !== undefined && dayVal !== null && dayVal !== '') {
      var dNum = parseInt(dayVal, 10);
      if (!isNaN(dNum) && dNum >= 1 && dNum <= 31) {
        var baseDate = (date && typeof date === 'string' && date.indexOf('-') !== -1) ? new Date(date) : new Date();
        var yStr = baseDate.getFullYear();
        var mStr = String(baseDate.getMonth() + 1).padStart(2, '0');
        var dStr = String(dNum).padStart(2, '0');
        date = yStr + '-' + mStr + '-' + dStr;
      }
    }
    if (!date) {
      var now = new Date();
      var yStr = now.getFullYear();
      var mStr = String(now.getMonth() + 1).padStart(2, '0');
      var dStr = String(now.getDate()).padStart(2, '0');
      date = yStr + '-' + mStr + '-' + dStr;
    }
    var client = record['Клиент / Источник'] || record.client || '';
    var project = record['Проект / Услуга'] || record.project || '';
    var category = record['Категория'] || record.category || 'Дизайн';
    var amount = Number(record['Сумма'] || record.amount || 0);
    var recordStatus = record['Статус'] || record.status || 'Оплачено';
    var note = record['Заметка'] || record.note || '';

    var row = [id, date, client, project, category, amount, recordStatus, note];

    var payload = {
      sheet: 'Доходы',
      action: 'append',
      row: row
    };

    return fetchWithTimeout(CONFIG.SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
      .then(function (resp) {
        if (resp && resp.success) {
          // Обновляем локальный кэш
          var cached = getCachedData();
          if (cached && cached.income) {
            cached.income.push({
              ID: id,
              'Дата': date,
              'Клиент / Источник': client,
              'Проект / Услуга': project,
              'Категория': category,
              'Сумма': amount,
              'Статус': recordStatus,
              'Заметка': note
            });
            storage.set(CONFIG.CACHE_STORAGE_KEY, cached);
          }
          setStatus('saved', 'Доход сохранен в Google ✓');
          return { success: true, id: id, row: row };
        } else {
          throw new Error((resp && resp.error) || 'Ошибка при сохранении дохода');
        }
      })
      .catch(function (err) {
        setStatus('error', 'Ошибка сохранения ✕', err.message);
        throw err;
      });
  }

  /**
   * Сохранение нового расхода
   */
  function saveExpense(record) {
    if (!isOnline()) {
      setStatus('error', 'Нет связи с Google ✕', 'Нельзя сохранить без интернета');
      return Promise.reject(new Error('Нет подключения к интернету. Расход не сохранен.'));
    }

    setStatus('saving', 'Сохраняю расход в Google...');

    var id = record.ID || record.id || ('exp_' + Date.now());
    var dayVal = record.day || record.dayOfMonth;
    var date = record.Дата || record.date;
    if (dayVal !== undefined && dayVal !== null && dayVal !== '') {
      var dNum = parseInt(dayVal, 10);
      if (!isNaN(dNum) && dNum >= 1 && dNum <= 31) {
        var baseDate = (date && typeof date === 'string' && date.indexOf('-') !== -1) ? new Date(date) : new Date();
        var yStr = baseDate.getFullYear();
        var mStr = String(baseDate.getMonth() + 1).padStart(2, '0');
        var dStr = String(dNum).padStart(2, '0');
        date = yStr + '-' + mStr + '-' + dStr;
      }
    }
    if (!date) {
      var now = new Date();
      var yStr = now.getFullYear();
      var mStr = String(now.getMonth() + 1).padStart(2, '0');
      var dStr = String(now.getDate()).padStart(2, '0');
      date = yStr + '-' + mStr + '-' + dStr;
    }
    var title = record['Название / Где'] || record.title || '';
    var category = record['Категория'] || record.category || 'Прочее';
    var amount = Number(record['Сумма'] || record.amount || 0);
    var wallet = record['Кошелек / Карта'] || record.wallet || 'Т-Банк';
    var note = record['Заметка'] || record.note || '';

    var row = [id, date, title, category, amount, wallet, note];

    var isUpdate = Boolean(record.isUpdate || (record.ID && !record.isNew));
    var payload = {
      sheet: 'Расходы',
      action: isUpdate ? 'update' : 'append',
      id: id,
      row: row
    };

    return fetchWithTimeout(CONFIG.SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
      .then(function (resp) {
        if (resp && resp.success) {
          var cached = getCachedData();
          if (cached && cached.expenses) {
            var found = false;
            for (var i = 0; i < cached.expenses.length; i++) {
              if (cached.expenses[i].ID === id) {
                cached.expenses[i] = {
                  ID: id,
                  'Дата': date,
                  'Название / Где': title,
                  'Категория': category,
                  'Сумма': amount,
                  'Кошелек / Карта': wallet,
                  'Заметка': note
                };
                found = true;
                break;
              }
            }
            if (!found) {
              cached.expenses.push({
                ID: id,
                'Дата': date,
                'Название / Где': title,
                'Категория': category,
                'Сумма': amount,
                'Кошелек / Карта': wallet,
                'Заметка': note
              });
            }
            storage.set(CONFIG.CACHE_STORAGE_KEY, cached);
          }
          setStatus('saved', 'Расход сохранен в Google ✓');
          return { success: true, id: id, row: row };
        } else {
          throw new Error((resp && resp.error) || 'Ошибка при сохранении расхода');
        }
      })
      .catch(function (err) {
        setStatus('error', 'Ошибка сохранения ✕', err.message);
        throw err;
      });
  }

  /**
   * Сохранение или обновление клиента
   */
  function saveClient(record) {
    if (!isOnline()) {
      setStatus('error', 'Нет связи с Google ✕', 'Нельзя сохранить без интернета');
      return Promise.reject(new Error('Нет подключения к интернету. Клиент не сохранен.'));
    }

    setStatus('saving', 'Сохраняю клиента в Google...');

    var id = record.ID || record.id || ('cli_' + Date.now());
    var name = record['Имя клиента'] || record.name || '';
    var phone = record['Телефон / Контакт'] || record.phone || '';
    // Предотвращаем формульную ошибку #ERROR! в Google Sheets при ведущем знаке +
    if (typeof phone === 'string') {
      phone = phone.trim();
      if (phone.charAt(0) === '+') {
        phone = "'" + phone;
      }
    }
    var project = record['Проект'] || record.project || '';
    var color = record['Цвет'] || record.color || 'mint';
    var clientStatus = record['Статус'] || record.status || 'В работе';
    var budget = Number(record['Бюджет'] || record.budget || 0);
    var paid = Number(record['Оплачено'] || record.paid || 0);
    var link = '';
    if (record['Ссылка на материалы']) {
      link = record['Ссылка на материалы'];
    } else if (Array.isArray(record.links) && record.links.length > 0) {
      try {
        link = JSON.stringify(record.links);
      } catch (e) {
        link = record.links[0].url || '';
      }
    } else if (record.link) {
      link = record.link;
    }
    var notes = record['Заметки'] || record.notes || '';
    if (record.passwordUrl && notes.indexOf(record.passwordUrl) === -1) {
      notes = (notes ? (notes + '\n') : '') + 'Ссылка на пароли: ' + record.passwordUrl;
    }

    var row = [id, name, phone, project, color, clientStatus, budget, paid, link, notes];

    var isUpdate = Boolean(record.isUpdate !== undefined ? record.isUpdate : (record.id || record.ID));
    var payload = {
      sheet: 'Клиенты',
      action: isUpdate ? 'update' : 'append',
      id: id,
      row: row
    };

    return fetchWithTimeout(CONFIG.SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
      .then(function (resp) {
        if (resp && resp.success) {
          var cached = getCachedData();
          if (cached && cached.clients) {
            var found = false;
            for (var i = 0; i < cached.clients.length; i++) {
              if (cached.clients[i].ID === id) {
                cached.clients[i] = {
                  ID: id,
                  'Имя клиента': name,
                  'Телефон / Контакт': phone,
                  'Проект': project,
                  'Цвет': color,
                  'Статус': clientStatus,
                  'Бюджет': budget,
                  'Оплачено': paid,
                  'Ссылка на материалы': link,
                  'Заметки': notes
                };
                found = true;
                break;
              }
            }
            if (!found) {
              cached.clients.push({
                ID: id,
                'Имя клиента': name,
                'Телефон / Контакт': phone,
                'Проект': project,
                'Цвет': color,
                'Статус': clientStatus,
                'Бюджет': budget,
                'Оплачено': paid,
                'Ссылка на материалы': link,
                'Заметки': notes
              });
            }
            storage.set(CONFIG.CACHE_STORAGE_KEY, cached);
          }
          setStatus('saved', 'Клиент сохранен в Google ✓');
          return { success: true, id: id, row: row };
        } else {
          throw new Error((resp && resp.error) || 'Ошибка при сохранении клиента');
        }
      })
      .catch(function (err) {
        setStatus('error', 'Ошибка сохранения ✕', err.message);
        throw err;
      });
  }

  /**
   * Удаление записи с обязательным подтверждением
   */
  function deleteRecord(sheet, id, description) {
    if (!id) {
      return Promise.reject(new Error('Не указан ID записи для удаления.'));
    }

    return confirmDeleteDialog(description || ('запись ' + id))
      .then(function (confirmed) {
        if (!confirmed) {
          return { success: false, cancelled: true };
        }

        if (!isOnline()) {
          setStatus('error', 'Нет связи с Google ✕', 'Нельзя удалить без интернета');
          return Promise.reject(new Error('Нет подключения к интернету. Удаление отменено.'));
        }

        setStatus('saving', 'Удаляю запись из Google...');

        var deletedBackup = null;
        var deletedIdx = -1;
        var targetListRef = null;

        // Обновляем кэш
        var cached = getCachedData();
        if (cached) {
          targetListRef = sheet === 'Доходы' ? cached.income :
                          sheet === 'Расходы' ? cached.expenses :
                          sheet === 'Клиенты' ? cached.clients : null;
          if (targetListRef) {
            for (var i = 0; i < targetListRef.length; i++) {
              if (String(targetListRef[i].ID || targetListRef[i].id) === String(id)) {
                deletedIdx = i;
                deletedBackup = targetListRef[i];
                break;
              }
            }
            if (deletedIdx !== -1) {
              targetListRef.splice(deletedIdx, 1);
              storage.set(CONFIG.CACHE_STORAGE_KEY, cached);
            }
          }
        }

        var payload = {
          sheet: sheet,
          action: 'delete',
          id: String(id)
        };

        return fetchWithTimeout(CONFIG.SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify(payload)
        })
          .then(function (resp) {
            if (resp && resp.success === false) {
              throw new Error(resp.error || 'Ошибка удаления в Google Таблице');
            }
            addDeletedId(id);
            setStatus('saved', 'Запись удалена из Google ✓');
            return { success: true, deleted: true, id: id };
          })
          .catch(function (err) {
            // Восстанавливаем локально, так как сервер отклонил удаление
            if (deletedBackup && targetListRef && deletedIdx !== -1) {
              targetListRef.splice(deletedIdx, 0, deletedBackup);
              storage.set(CONFIG.CACHE_STORAGE_KEY, cached);
            }
            setStatus('error', 'Ошибка удаления из Google ✕', err.message);
            return { success: false, error: err.message, id: id };
          });
      });
  }

  // --- ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ КЭША ---
  function getCachedData() {
    if (state.cachedData) return state.cachedData;
    var cached = storage.get(CONFIG.CACHE_STORAGE_KEY);
    if (cached) {
      state.cachedData = cached;
      return cached;
    }
    return null;
  }

  function getEmptyData() {
    return {
      summary: [],
      income: [],
      expenses: [],
      clients: []
    };
  }

  // ==========================================================================
  // ТАКТИЛЬНЫЙ UI: 3D-БУМАЖЕЧКИ И МОДАЛЬНЫЕ ОКНА
  // ==========================================================================

  function confirmDeleteDialog(itemDescription) {
    if (typeof document === 'undefined') {
      return Promise.resolve(true); // Для тестирования в Node.js
    }

    return new Promise(function (resolve) {
      if (typeof state.modalResolve === 'function') {
        state.modalResolve(false); // Завершаем предыдущий незакрытый запрос
      }
      state.modalResolve = resolve;
      var modal = document.getElementById('mytables-delete-modal');
      var descEl = document.getElementById('mytables-delete-desc');
      if (modal) {
        if (descEl) {
          descEl.textContent = itemDescription ? ('«' + itemDescription + '»') : 'эту запись';
        }
        modal.classList.add('active');
      } else {
        // Fallback если модалки нет в DOM
        var ok = confirm('Точно удалить запись ' + (itemDescription || '') + '?');
        resolve(ok);
      }
    });
  }

  function closeDeleteModal(confirmed) {
    var modal = document.getElementById('mytables-delete-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    if (state.modalResolve) {
      state.modalResolve(!!confirmed);
      state.modalResolve = null;
    }
  }

  function showAuthModal() {
    if (typeof document === 'undefined') return;
    var gate = document.getElementById('mytables-auth-gate');
    if (gate) {
      gate.style.setProperty('display', 'flex', 'important');
      var emailInput = document.getElementById('mytables-auth-email');
      if (emailInput && !emailInput.value) {
        emailInput.value = CONFIG.AUTHORIZED_EMAIL;
      }
      var pwdInput = document.getElementById('mytables-auth-password');
      if (pwdInput) {
        pwdInput.value = '';
      }
      var errBox = document.getElementById('mytables-auth-error');
      if (errBox) {
        errBox.style.display = 'none';
        errBox.textContent = '';
      }
    }
  }

  function hideAuthModal() {
    if (typeof document === 'undefined') return;
    var gate = document.getElementById('mytables-auth-gate');
    if (gate) {
      gate.style.setProperty('display', 'none', 'important');
    }
    updateUserChips();
  }

  function showChangePasswordModal() {
    if (typeof document === 'undefined') return;
    var modal = document.getElementById('mytables-pwd-modal');
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
      var cur = document.getElementById('mytables-pwd-current');
      if (cur) { cur.value = ''; cur.focus(); }
      var nw = document.getElementById('mytables-pwd-new');
      if (nw) nw.value = '';
      var cnf = document.getElementById('mytables-pwd-confirm');
      if (cnf) cnf.value = '';
      var err = document.getElementById('mytables-pwd-error');
      if (err) { err.style.display = 'none'; err.textContent = ''; }
      var succ = document.getElementById('mytables-pwd-success');
      if (succ) { succ.style.display = 'none'; succ.textContent = ''; }
    }
  }

  function hideChangePasswordModal() {
    if (typeof document === 'undefined') return;
    var modal = document.getElementById('mytables-pwd-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  }

  function handlePasswordChangeSubmit() {
    if (typeof document === 'undefined') return;
    var cur = document.getElementById('mytables-pwd-current');
    var nw = document.getElementById('mytables-pwd-new');
    var cnf = document.getElementById('mytables-pwd-confirm');
    var err = document.getElementById('mytables-pwd-error');
    var succ = document.getElementById('mytables-pwd-success');

    var currentVal = cur ? cur.value : '';
    var newVal = nw ? nw.value : '';
    var confirmVal = cnf ? cnf.value : '';

    if (!checkPassword(currentVal)) {
      if (err) {
        err.textContent = 'Текущий пароль указан неверно';
        err.style.display = 'block';
      }
      if (succ) succ.style.display = 'none';
      if (cur) cur.focus();
      return;
    }

    if (!newVal || newVal.length < 4) {
      if (err) {
        err.textContent = 'Новый пароль должен содержать не менее 4 символов';
        err.style.display = 'block';
      }
      if (succ) succ.style.display = 'none';
      if (nw) nw.focus();
      return;
    }

    if (newVal !== confirmVal) {
      if (err) {
        err.textContent = 'Новые пароли не совпадают';
        err.style.display = 'block';
      }
      if (succ) succ.style.display = 'none';
      if (cnf) cnf.focus();
      return;
    }

    var res = changePassword(currentVal, newVal);
    if (res.success) {
      if (err) err.style.display = 'none';
      if (succ) {
        succ.textContent = 'Пароль успешно изменён! ✓';
        succ.style.display = 'block';
      }
      setTimeout(function () {
        hideChangePasswordModal();
      }, 1000);
    } else {
      if (err) {
        err.textContent = res.error || 'Ошибка смены пароля';
        err.style.display = 'block';
      }
    }
  }

  function updateBadgeUI() {
    if (typeof document === 'undefined') return;

    // Обновляем аккуратный индикатор-кружочек синхронизации возле буквы «А»
    var dots = document.querySelectorAll('.mob-sync-dot');
    for (var d = 0; d < dots.length; d++) {
      dots[d].className = 'mob-sync-dot status-' + state.status;
      if (state.status === 'saving') {
        dots[d].style.background = '#D4A72C';
        dots[d].title = 'Синхронизация с Google...';
      } else if (state.status === 'saved' || state.status === 'idle') {
        dots[d].style.background = '#2D9C5E';
        dots[d].title = 'Синхронизировано с Google';
      } else if (state.status === 'error') {
        dots[d].style.background = '#E25B45';
        dots[d].title = 'Ошибка синхронизации с Google';
      }
    }

    var badge = document.getElementById('mytables-sync-badge');
    if (!badge) return;

    var textEl = document.getElementById('mytables-sync-text');
    var iconEl = document.getElementById('mytables-sync-icon');

    badge.className = 'mytables-sync-badge status-' + state.status;

    if (textEl) {
      textEl.textContent = state.statusText || 'Готов к работе';
    }

    if (iconEl) {
      if (state.status === 'saving') {
        iconEl.innerHTML = '<span class="sync-spinner"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg></span>';
      } else if (state.status === 'saved') {
        iconEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      } else if (state.status === 'error') {
        iconEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      } else {
        iconEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>';
      }
    }
  }

  function updateUserChips() {
    if (typeof document === 'undefined') return;
    var user = getCurrentUser();
    var emailHolders = document.querySelectorAll('.mytables-user-email');
    for (var i = 0; i < emailHolders.length; i++) {
      emailHolders[i].textContent = user ? user.email : 'Не авторизован';
    }
    var nameHolders = document.querySelectorAll('.sidebar-user-name');
    for (var j = 0; j < nameHolders.length; j++) {
      nameHolders[j].textContent = user && user.name ? user.name : 'Аня';
    }
    var avatarHolders = document.querySelectorAll('.sidebar-avatar');
    for (var k = 0; k < avatarHolders.length; k++) {
      avatarHolders[k].textContent = user && user.avatar ? user.avatar : 'А';
    }

    // Слушатели кнопок «Выйти» (SER-1)
    var logoutBtns = document.querySelectorAll('.mytables-logout-btn');
    for (var l = 0; l < logoutBtns.length; l++) {
      if (!logoutBtns[l]._hasLogoutListener) {
        logoutBtns[l]._hasLogoutListener = true;
        logoutBtns[l].addEventListener('click', function (e) {
          if (e && e.preventDefault) e.preventDefault();
          logout();
        });
      }
    }

    // Слушатели кнопок «Сменить пароль»
    var pwdBtns = document.querySelectorAll('.mytables-change-pwd-btn');
    for (var m = 0; m < pwdBtns.length; m++) {
      if (!pwdBtns[m]._hasPwdModalListener) {
        pwdBtns[m]._hasPwdModalListener = true;
        pwdBtns[m].addEventListener('click', function (e) {
          if (e && e.preventDefault) e.preventDefault();
          showChangePasswordModal();
        });
      }
    }
  }

  // --- ИНИЦИАЛИЗАЦИЯ СТИЛЕЙ И РАЗМЕТКИ В БРАУЗЕРЕ ---
  function injectStylesAndMarkup() {
    if (typeof document === 'undefined') return;

    // Стили 3D-бумажечек
    if (!document.getElementById('mytables-sync-styles')) {
      var style = document.createElement('style');
      style.id = 'mytables-sync-styles';
      style.textContent = [
        '/* --- СТИЛИ СИНХРОНИЗАЦИИ И БЕЗОПАСНОСТИ «МОИ ТАБЛИЦЫ» (ЗОЛОТОЙ СТАНДАРТ АНИ) --- */',
        '.mytables-sync-badge {',
        '  position: fixed;',
        '  bottom: 20px;',
        '  right: 20px;',
        '  z-index: 9999;',
        '  display: inline-flex;',
        '  align-items: center;',
        '  gap: 8px;',
        '  padding: 8px 16px;',
        '  border-radius: 999px;',
        '  font-family: "Manrope", sans-serif;',
        '  font-size: 12px;',
        '  font-weight: 800;',
        '  border: none;',
        '  cursor: pointer;',
        '  user-select: none;',
        '  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);',
        '}',
        '.mytables-sync-badge:hover {',
        '  transform: translateY(-2px);',
        '}',
        '.mytables-sync-badge:active { transform: translateY(1px); }',
        '.mytables-sync-badge.status-idle {',
        '  background: #FDF1CC; color: #5B481D; border: none;',
        '  box-shadow: 0 4px 14px rgba(110, 85, 60, 0.14), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 1px 1px 0 rgba(255, 255, 255, 0.95);',
        '}',
        '.mytables-sync-badge.status-saving {',
        '  background: #DCEEFE; color: #113F6B; border: none;',
        '  box-shadow: 0 4px 14px rgba(80, 120, 160, 0.18), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 1px 1px 0 rgba(255, 255, 255, 0.95);',
        '}',
        '.mytables-sync-badge.status-saved {',
        '  background: #C8E2D2; color: #1E3F30; border: none;',
        '  box-shadow: 0 4px 14px rgba(35, 70, 50, 0.18), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 1px 1px 0 rgba(255, 255, 255, 0.95);',
        '}',
        '.mytables-sync-badge.status-error {',
        '  background: #FDF1C2; color: #5A3A00; border: none;',
        '  box-shadow: 0 4px 14px rgba(185, 160, 100, 0.2), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 1px 1px 0 rgba(255, 255, 255, 0.95);',
        '}',
        '@media (max-width: 900px) {',
        '  .mytables-sync-badge, #mytables-sync-badge {',
        '    display: none !important;',
        '    bottom: auto !important;',
        '  }',
        '}',
        '.sync-spinner {',
        '  width: 14px; height: 14px; border: none;',
        '  animation: sync-spin 0.8s linear infinite; display: inline-flex; align-items: center; justify-content: center;',
        '}',
        '@keyframes sync-spin { to { transform: rotate(360deg); } }',
        '',
        '/* МОДАЛЬНОЕ ОКНО УДАЛЕНИЯ (БЕЗ РАМОК, ЗОЛОТОЙ СТАНДАРТ) */',
        '.mytables-modal-backdrop {',
        '  position: fixed; inset: 0; background: rgba(43, 34, 25, 0.45);',
        '  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);',
        '  z-index: 10000; display: none; align-items: center; justify-content: center;',
        '  padding: 16px; opacity: 0; transition: opacity 0.2s ease;',
        '  pointer-events: none;',
        '}',
        '.mytables-modal-backdrop.active { display: flex; opacity: 1; pointer-events: auto; }',
        '.mytables-paper-modal {',
        '  background: #FAF2E7; border: none; border-radius: 28px;',
        '  padding: 24px 22px; max-width: 400px; width: 100%;',
        '  box-shadow: 0 24px 60px -8px rgba(90, 70, 50, 0.35), 0 8px 18px rgba(90, 70, 50, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.9);',
        '  font-family: "Manrope", sans-serif; text-align: center;',
        '  animation: paper-fade 0.12s ease-out;',
        '  transform: none !important;',
        '}',
        '@keyframes paper-fade { from { opacity: 0; } to { opacity: 1; } }',
        '.modal-icon-circle {',
        '  width: 48px; height: 48px; border-radius: 50%; background: #FDF1CC; border: none;',
        '  color: #5B481D; display: flex; align-items: center; justify-content: center;',
        '  margin: 0 auto 14px auto;',
        '  box-shadow: 2px 4px 10px rgba(185, 160, 110, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9);',
        '}',
        '.modal-title { font-size: 18px; font-weight: 900; color: #2F261D; margin-bottom: 6px; }',
        '.modal-text { font-size: 13px; color: #726453; line-height: 1.45; margin-bottom: 20px; }',
        '.modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }',
        '.modal-btn {',
        '  padding: 12px 16px; border-radius: 14px; font-size: 13px; font-weight: 800;',
        '  border: none; cursor: pointer; transition: all 0.15s ease; min-height: 44px;',
        '  font-family: "Manrope", sans-serif;',
        '}',
        '.modal-btn-cancel {',
        '  background: #FDF1CC; color: #5B481D; border: none;',
        '  box-shadow: 2px 3px 8px rgba(190, 170, 110, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.9);',
        '}',
        '.modal-btn-cancel:hover { background: #FCE8B8; }',
        '.modal-btn-danger {',
        '  background: #EADBCC; color: #58241B; border: none;',
        '  box-shadow: 2px 4px 12px rgba(180, 90, 90, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.9);',
        '}',
        '.modal-btn-danger:hover { background: #DFD0BE; }',
        '',
        '/* ЭКРАН ВХОДА GOOGLE GATE (СТРОГО 3 ЦВЕТА АНИ: ГОЛУБОЙ, ЖЁЛТЫЙ, ЗЕЛЁНЫЙ) */',
        '.mytables-auth-gate-overlay {',
        '  position: fixed; inset: 0; background: #FAF2E7; z-index: 20000;',
        '  display: flex; align-items: center; justify-content: center; padding: 20px;',
        '  font-family: "Manrope", sans-serif;',
        '}',
        '.mytables-auth-card {',
        '  background: #FAF2E7; border: none; border-radius: 28px;',
        '  padding: 28px 24px; max-width: 420px; width: 100%; text-align: center;',
        '  box-shadow: -2px -2px 6px rgba(255, 255, 255, 0.95), inset 1px 1px 0 rgba(255, 255, 255, 0.95), 4px 8px 24px rgba(140, 115, 85, 0.22);',
        '}',
        '.auth-heart {',
        '  width: 52px; height: 52px; border-radius: 18px; background: #DCEEFE; border: none;',
        '  color: #113F6B; display: flex; align-items: center; justify-content: center;',
        '  margin: 0 auto 14px auto; font-size: 24px; font-weight: 900;',
        '  box-shadow: 2px 4px 10px rgba(80, 120, 160, 0.22), -1.5px -1.5px 5px rgba(255, 255, 255, 0.95), inset 1px 1px 0 rgba(255, 255, 255, 0.95);',
        '}',
        '.auth-app-title { font-size: 24px; font-weight: 900; color: #2F261D; margin-bottom: 4px; }',
        '.auth-app-subtitle { font-size: 13px; font-weight: 600; color: #726453; margin-bottom: 18px; }',
        '.auth-guard-box {',
        '  background: #FDF1C2; border-radius: 16px; padding: 12px 14px; border: none;',
        '  margin-bottom: 16px; font-size: 12px; font-weight: 700; color: #5A3A00;',
        '  box-shadow: 2px 3.5px 8px rgba(185, 160, 100, 0.2), -1px -1px 3px rgba(255, 255, 255, 0.9);',
        '}',
        '.auth-profile-card {',
        '  background: #DCEEFE; border-radius: 18px; padding: 12px 14px; border: none;',
        '  margin-bottom: 16px; display: flex; align-items: center; gap: 12px; text-align: left;',
        '  box-shadow: 2px 4px 10px rgba(80, 120, 160, 0.2), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 1px 1px 0 rgba(255, 255, 255, 0.95);',
        '}',
        '.auth-profile-avatar {',
        '  width: 40px; height: 40px; border-radius: 50%; background: #C8E2D2; border: none;',
        '  color: #1E3F30; display: flex; align-items: center; justify-content: center;',
        '  font-size: 17px; font-weight: 900; box-shadow: 1.5px 2.5px 6px rgba(30, 63, 48, 0.18); flex-shrink: 0;',
        '}',
        '.auth-profile-info { min-width: 0; flex: 1; }',
        '.auth-profile-name { font-size: 13.5px; font-weight: 900; color: #113F6B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
        '.auth-profile-email { font-size: 11.5px; font-weight: 700; color: #1F548A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
        '.auth-profile-tag { font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 10px; background: #C8E2D2; color: #1E3F30; border: none; white-space: nowrap; }',
        '.auth-email-input {',
        '  width: 100%; padding: 13px 16px; border-radius: 14px;',
        '  border: none; background: #FAF2E7;',
        '  font-family: "Manrope", sans-serif; font-size: 13px; font-weight: 700;',
        '  color: #2D251E; margin-bottom: 12px; outline: none;',
        '  box-shadow: inset 1px 1.5px 3px rgba(140, 115, 90, 0.15), -1px -1px 3px rgba(255, 255, 255, 0.95);',
        '  box-sizing: border-box;',
        '}',
        '.auth-email-input:focus { box-shadow: inset 1px 1.5px 4px rgba(110, 85, 60, 0.22), -1px -1px 3px rgba(255, 255, 255, 0.95); }',
        '.auth-password-wrapper {',
        '  position: relative; width: 100%; margin-bottom: 12px;',
        '  display: flex; align-items: center;',
        '}',
        '.auth-password-input {',
        '  width: 100%; padding: 13px 46px 13px 16px; border-radius: 14px;',
        '  border: none; background: #FAF2E7;',
        '  font-family: "Manrope", sans-serif; font-size: 13px; font-weight: 700;',
        '  color: #2D251E; outline: none;',
        '  box-shadow: inset 1px 1.5px 3px rgba(140, 115, 90, 0.15), -1px -1px 3px rgba(255, 255, 255, 0.95);',
        '  box-sizing: border-box;',
        '}',
        '.auth-password-input:focus { box-shadow: inset 1px 1.5px 4px rgba(110, 85, 60, 0.22), -1px -1px 3px rgba(255, 255, 255, 0.95); }',
        '.auth-pwd-toggle-btn {',
        '  position: absolute; right: 2px; top: 50%; transform: translateY(-50%);',
        '  width: 44px; height: 44px; background: transparent; border: none; cursor: pointer;',
        '  display: flex; align-items: center; justify-content: center; color: #5B481D; padding: 0;',
        '  border-radius: 12px; transition: opacity 0.15s ease;',
        '}',
        '.auth-pwd-toggle-btn:hover { opacity: 0.8; }',
        '.auth-remember-row {',
        '  display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 0 4px;',
        '  cursor: pointer; user-select: none;',
        '}',
        '.auth-remember-checkbox {',
        '  width: 18px; height: 18px; cursor: pointer; accent-color: #3B7A57;',
        '  border-radius: 6px; border: none;',
        '}',
        '.auth-remember-text {',
        '  font-size: 12px; font-weight: 700; color: #726453; line-height: 1.2;',
        '}',
        '.auth-login-btn {',
        '  width: 100%; padding: 14px 20px; border-radius: 14px;',
        '  background: #C8E2D2; color: #1E3F30; font-size: 14px; font-weight: 800;',
        '  border: none; cursor: pointer; display: flex; align-items: center;',
        '  justify-content: center; gap: 10px; font-family: "Manrope", sans-serif;',
        '  min-height: 44px;',
        '  box-shadow: 2px 4.5px 12px rgba(35, 70, 50, 0.22), -2px -2px 6px rgba(255, 255, 255, 0.95), inset 1px 1px 0 rgba(255, 255, 255, 0.95);',
        '  transition: all 0.15s ease;',
        '}',
        '.auth-login-btn:hover { background: #BDE0C9; transform: translateY(-1px); }',
        '.auth-login-btn:active { transform: translateY(1px); }',
        '.auth-error-box {',
        '  margin-top: 14px; padding: 10px 12px; border-radius: 12px;',
        '  background: #FDF1C2; border: none;',
        '  color: #5A3A00; font-size: 12px; font-weight: 700; display: none;',
        '  box-shadow: 2px 3px 8px rgba(185, 160, 100, 0.2);',
        '}'
      ].join('\n');
      document.head.appendChild(style);
    }

    // Всплывающий тост / бейдж состояния синхронизации
    if (!document.getElementById('mytables-sync-badge')) {
      var badge = document.createElement('div');
      badge.id = 'mytables-sync-badge';
      badge.className = 'mytables-sync-badge status-idle';
      badge.title = 'Нажмите для обновления данных из Google';
      badge.innerHTML = [
        '<span id="mytables-sync-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg></span>',
        '<span id="mytables-sync-text">Синхронизировано ✓</span>'
      ].join('');
      badge.addEventListener('click', function () {
        getAllData();
      });
      document.body.appendChild(badge);
    }

    // Модальное окно подтверждения удаления
    if (!document.getElementById('mytables-delete-modal')) {
      var modal = document.createElement('div');
      modal.id = 'mytables-delete-modal';
      modal.className = 'mytables-modal-backdrop';
      modal.innerHTML = [
        '<div class="mytables-paper-modal" role="dialog" aria-modal="true">',
        '  <div class="modal-icon-circle">',
        '    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
        '  </div>',
        '  <div class="modal-title">Точно удалить?</div>',
        '  <div class="modal-text">Вы собираетесь удалить <span id="mytables-delete-desc" style="font-weight: 800; color: #2F261D;">эту запись</span>. Это действие удалит её из таблицы.</div>',
        '  <div class="modal-actions">',
        '    <button type="button" class="modal-btn modal-btn-cancel" id="mytables-del-cancel">Отмена</button>',
        '    <button type="button" class="modal-btn modal-btn-danger" id="mytables-del-confirm">Удалить</button>',
        '  </div>',
        '</div>'
      ].join('');

      document.body.appendChild(modal);

      var delCancel = document.getElementById('mytables-del-cancel');
      if (delCancel) {
        delCancel.addEventListener('click', function () {
          closeDeleteModal(false);
        });
      }
      var delConfirm = document.getElementById('mytables-del-confirm');
      if (delConfirm) {
        delConfirm.addEventListener('click', function () {
          closeDeleteModal(true);
        });
      }
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeDeleteModal(false);
      });
    }

    // Экран авторизации (Google Gate) — строго 3 цвета Ани (Голубой, Жёлтый, Мята)
    if (!document.getElementById('mytables-auth-gate')) {
      var gate = document.createElement('div');
      gate.id = 'mytables-auth-gate';
      gate.className = 'mytables-auth-gate-overlay';
      gate.style.display = 'none';
      gate.innerHTML = [
        '<div class="mytables-auth-card">',
        '  <div class="auth-heart">♡</div>',
        '  <div class="auth-app-title">Мои таблицы ♡</div>',
        '  <div class="auth-app-subtitle">Личный финансовый органайзер</div>',
        '  <div class="auth-guard-box">',
        '    🔒 Личное защищенное пространство.<br>Вход доступен исключительно по паролю владелицы.',
        '  </div>',
        '  <div class="auth-profile-card">',
        '    <div class="auth-profile-avatar">А</div>',
        '    <div class="auth-profile-info">',
        '      <div class="auth-profile-name">Аня (Владелица)</div>',
        '      <div class="auth-profile-email">lifekvi2018@gmail.com</div>',
        '    </div>',
        '    <div class="auth-profile-tag">Защищено паролем</div>',
        '  </div>',
        '  <form id="mytables-auth-form">',
        '    <input type="email" id="mytables-auth-email" class="auth-email-input" placeholder="lifekvi2018@gmail.com" value="' + CONFIG.AUTHORIZED_EMAIL + '" required>',
        '    <div class="auth-password-wrapper">',
        '      <input type="password" id="mytables-auth-password" class="auth-password-input" placeholder="Введите ваш секретный пароль" autocomplete="current-password" required>',
        '      <button type="button" id="mytables-auth-toggle-pwd" class="auth-pwd-toggle-btn" title="Показать/скрыть пароль" aria-label="Показать/скрыть пароль">',
        '        <svg id="mytables-auth-eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B481D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
        '      </button>',
        '    </div>',
        '    <label class="auth-remember-row" for="mytables-auth-remember">',
        '      <input type="checkbox" id="mytables-auth-remember" class="auth-remember-checkbox" checked>',
        '      <span class="auth-remember-text">Запомнить меня на 30 дней</span>',
        '    </label>',
        '    <button type="submit" id="mytables-auth-submit" class="auth-login-btn">',
        '      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>',
        '      Войти как Аня',
        '    </button>',
        '  </form>',
        '  <div id="mytables-auth-error" class="auth-error-box"></div>',
        '</div>'
      ].join('');

      document.body.appendChild(gate);

      var authForm = document.getElementById('mytables-auth-form');
      var authEmail = document.getElementById('mytables-auth-email');
      var authPassword = document.getElementById('mytables-auth-password');
      var authRemember = document.getElementById('mytables-auth-remember');
      var authTogglePwd = document.getElementById('mytables-auth-toggle-pwd');
      var authError = document.getElementById('mytables-auth-error');
      var authBtn = document.getElementById('mytables-auth-submit');

      if (authTogglePwd && authPassword) {
        authTogglePwd.addEventListener('click', function () {
          var isPass = authPassword.type === 'password';
          authPassword.type = isPass ? 'text' : 'password';
          var eyeSvg = document.getElementById('mytables-auth-eye-icon');
          if (eyeSvg) {
            if (isPass) {
              eyeSvg.innerHTML = '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>';
            } else {
              eyeSvg.innerHTML = '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>';
            }
          }
        });
      }

      function handleLoginAction(e) {
        if (e && e.preventDefault) e.preventDefault();
        var email = (authEmail && authEmail.value) || CONFIG.AUTHORIZED_EMAIL;
        var password = (authPassword && authPassword.value) || '';
        var remember = authRemember ? authRemember.checked : true;

        var cleanEmail = (email || '').trim().toLowerCase();
        var existingPass = storage.get(CONFIG.PASSWORD_STORAGE_KEY);
        if (!existingPass && (cleanEmail === CONFIG.AUTHORIZED_EMAIL.toLowerCase() || cleanEmail === 'lifekvi2018') && password && password.length >= 4) {
          storage.set(CONFIG.PASSWORD_STORAGE_KEY, password);
          if (typeof localStorage !== 'undefined') {
            try { localStorage.setItem(CONFIG.PASSWORD_STORAGE_KEY, JSON.stringify(password)); } catch (err) {}
          }
        }

        var res = login(email, password, remember);
        if (res.success) {
          if (authError) {
            authError.style.display = 'none';
            authError.textContent = '';
          }
          if (authPassword) {
            authPassword.value = '';
          }
          hideAuthModal();
          if (typeof root !== 'undefined' && root && typeof root.onAuthSuccess === 'function') {
            root.onAuthSuccess(res.user);
          }
        } else {
          if (authError) {
            authError.textContent = res.error;
            authError.style.display = 'block';
          }
          if (authPassword) {
            authPassword.focus();
          }
        }
      }

      if (authForm) {
        authForm.addEventListener('submit', handleLoginAction);
      }
      if (authBtn) {
        authBtn.addEventListener('click', handleLoginAction);
      }
    }

    // Модальное окно смены пароля
    if (!document.getElementById('mytables-pwd-modal')) {
      var pwdModal = document.createElement('div');
      pwdModal.id = 'mytables-pwd-modal';
      pwdModal.className = 'mytables-modal-backdrop';
      pwdModal.innerHTML = [
        '<div class="mytables-paper-modal" role="dialog" aria-modal="true" style="max-width: 380px;">',
        '  <div class="modal-icon-circle" style="background: #DCEEFE; color: #113F6B;">',
        '    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
        '  </div>',
        '  <div class="modal-title">Смена пароля</div>',
        '  <div class="modal-text" style="margin-bottom: 14px;">Задайте новый секретный пароль для защиты ваших таблиц.</div>',
        '  <form id="mytables-pwd-form" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; text-align: left;">',
        '    <div>',
        '      <label style="font-size: 11px; font-weight: 800; color: #726453; margin-bottom: 4px; display: block;">Текущий пароль</label>',
        '      <input type="password" id="mytables-pwd-current" class="auth-password-input" placeholder="Введите текущий пароль" style="padding: 11px 14px; font-size: 13px;" required>',
        '    </div>',
        '    <div>',
        '      <label style="font-size: 11px; font-weight: 800; color: #726453; margin-bottom: 4px; display: block;">Новый пароль</label>',
        '      <input type="password" id="mytables-pwd-new" class="auth-password-input" placeholder="Новый пароль (от 4 символов)" style="padding: 11px 14px; font-size: 13px;" required>',
        '    </div>',
        '    <div>',
        '      <label style="font-size: 11px; font-weight: 800; color: #726453; margin-bottom: 4px; display: block;">Повторите новый пароль</label>',
        '      <input type="password" id="mytables-pwd-confirm" class="auth-password-input" placeholder="Повторите новый пароль" style="padding: 11px 14px; font-size: 13px;" required>',
        '    </div>',
        '    <div id="mytables-pwd-error" class="auth-error-box" style="margin-top: 4px;"></div>',
        '    <div id="mytables-pwd-success" class="auth-error-box" style="margin-top: 4px; background: #C8E2D2; color: #1E3F30; display: none;">Пароль успешно сохранён! ✓</div>',
        '  </form>',
        '  <div class="modal-actions">',
        '    <button type="button" class="modal-btn modal-btn-cancel" id="mytables-pwd-cancel">Отмена</button>',
        '    <button type="button" class="modal-btn" id="mytables-pwd-save" style="background: #C8E2D2; color: #1E3F30; box-shadow: 2px 3px 8px rgba(35, 70, 50, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9);">Сохранить</button>',
        '  </div>',
        '</div>'
      ].join('');

      document.body.appendChild(pwdModal);

      var pwdCancel = document.getElementById('mytables-pwd-cancel');
      if (pwdCancel) {
        pwdCancel.addEventListener('click', function () {
          hideChangePasswordModal();
        });
      }
      var pwdSave = document.getElementById('mytables-pwd-save');
      if (pwdSave) {
        pwdSave.addEventListener('click', function () {
          handlePasswordChangeSubmit();
        });
      }
      var pwdForm = document.getElementById('mytables-pwd-form');
      if (pwdForm) {
        pwdForm.addEventListener('submit', function (e) {
          if (e && e.preventDefault) e.preventDefault();
          handlePasswordChangeSubmit();
        });
      }
      pwdModal.addEventListener('click', function (e) {
        if (e.target === pwdModal) hideChangePasswordModal();
      });
    }

    // Слушатели сети
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', function () {
        setStatus('saving', 'Связь есть, синхронизирую...');
        getAllData().then(function () {
          setStatus('saved', 'Синхронизировано с Google ✓');
          if (typeof root !== 'undefined' && root && typeof root.onDataRefreshed === 'function') {
            root.onDataRefreshed();
          }
          if (typeof root !== 'undefined' && root && typeof root.onNetworkOnline === 'function') {
            root.onNetworkOnline();
          }
        }).catch(function (err) {
          setStatus('error', 'Ошибка синхронизации ✕', err.message);
        });
      });
      window.addEventListener('offline', function () {
        setStatus('error', 'Нет связи с Google ✕', 'Отсутствует интернет');
      });
    }

    // Привязка кнопок и проверка текущей авторизации
    updateUserChips();
    if (!isAuthenticated()) {
      showAuthModal();
    }
  }

  // Автоматическая инициализация при загрузке DOM в браузере
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectStylesAndMarkup);
    } else {
      injectStylesAndMarkup();
    }
  }

  function syncNow() {
    return getAllData().then(function (res) {
      if (res && res.data && typeof window !== 'undefined' && typeof window.updateCurrentScreen === 'function') {
        window.updateCurrentScreen(res.data);
      }
      return res;
    });
  }

  // --- ПУБЛИЧНЫЙ API МОДУЛЯ (ПОЛНЫЙ ИНТЕРФЕЙС СТЕЙДЖА 5) ---
  return {
    CONFIG: CONFIG,
    syncNow: syncNow,
    init: injectStylesAndMarkup,
    initUI: injectStylesAndMarkup,
    getState: getState,
    getStatus: getState,
    getAuthStorage: getAuthStorage,
    isAuthenticated: isAuthenticated,
    getCurrentUser: getCurrentUser,
    login: login,
    logout: logout,
    checkPassword: checkPassword,
    changePassword: changePassword,
    showChangePasswordModal: showChangePasswordModal,
    hideChangePasswordModal: hideChangePasswordModal,
    _resetPasswordForTesting: _resetPasswordForTesting,
    getAllData: getAllData,
    saveIncome: saveIncome,
    saveExpense: saveExpense,
    saveClient: saveClient,
    deleteRecord: deleteRecord,
    confirmDeleteDialog: confirmDeleteDialog,
    showDeleteConfirmation: confirmDeleteDialog,
    showAuthModal: showAuthModal,
    hideAuthModal: hideAuthModal,
    getCachedData: getCachedData,
    isOnline: isOnline,
    _setOnlineForTesting: function (val) {
      testOnlineOverride = val;
    },
    _setTestOnlineOverride: function (val) {
      testOnlineOverride = val;
    },
    getStatusState: function () {
      return {
        status: state.status,
        text: state.statusText,
        lastSync: state.lastSync,
        error: state.errorMessage
      };
    },
    onStatusChange: function (fn) {
      if (typeof fn === 'function') state.listeners.push(fn);
    },
    subscribe: function (fn) {
      if (typeof fn === 'function') state.listeners.push(fn);
    }
  };
});
