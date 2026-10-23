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
    module.exports = factory();
  } else {
    // Браузерное окружение
    root.MyTablesSync = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // --- КОНФИГУРАЦИЯ ---
  var CONFIG = {
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzU_3g5bISD-PKzCHuzk2kqc4hosbruIXd5r5dXPFYkJLqpYG9oxEZwG80zB2opjWI7/exec',
    AUTHORIZED_EMAIL: 'lifekvi2018@gmail.com',
    AUTH_STORAGE_KEY: 'my_tables_auth_user',
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

  // --- УТИЛИТЫ ХРАНИЛИЩА ---
  var storage = {
    get: function (key) {
      try {
        if (typeof sessionStorage !== 'undefined') {
          var val = sessionStorage.getItem(key);
          return val ? JSON.parse(val) : null;
        }
      } catch (e) {
        console.warn('Storage read error:', e);
      }
      return null;
    },
    set: function (key, value) {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(key, JSON.stringify(value));
        }
      } catch (e) {
        console.warn('Storage write error:', e);
      }
    },
    remove: function (key) {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(key);
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

  // ==========================================================================
  // АВТОРИЗАЦИЯ (GOOGLE GATE)
  // ==========================================================================

  function isAuthenticated() {
    var user = storage.get(CONFIG.AUTH_STORAGE_KEY);
    return !!(user && user.authorized && user.email && user.email.toLowerCase() === CONFIG.AUTHORIZED_EMAIL.toLowerCase());
  }

  function getCurrentUser() {
    if (!isAuthenticated()) return null;
    return storage.get(CONFIG.AUTH_STORAGE_KEY);
  }

  function login(email) {
    var cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === CONFIG.AUTHORIZED_EMAIL.toLowerCase()) {
      var user = {
        authorized: true,
        email: cleanEmail,
        name: 'Аня',
        avatar: 'А',
        loginTime: new Date().toISOString()
      };
      storage.set(CONFIG.AUTH_STORAGE_KEY, user);
      hideAuthModal();
      return { success: true, user: user };
    } else {
      var err = 'Доступ ограничен. Это личное приложение только для ' + CONFIG.AUTHORIZED_EMAIL;
      return { success: false, error: err };
    }
  }

  function logout() {
    storage.remove(CONFIG.AUTH_STORAGE_KEY);
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
            return arr.filter(function (item) {
              var id = item.ID || item.id;
              return !id || deleted.indexOf(String(id)) === -1;
            });
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
    var date = record.Дата || record.date || new Date().toISOString().slice(0, 10);
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
    var date = record.Дата || record.date || new Date().toISOString().slice(0, 10);
    var title = record['Название / Где'] || record.title || '';
    var category = record['Категория'] || record.category || 'Прочее';
    var amount = Number(record['Сумма'] || record.amount || 0);
    var wallet = record['Кошелек / Карта'] || record.wallet || 'Т-Банк';
    var note = record['Заметка'] || record.note || '';

    var row = [id, date, title, category, amount, wallet, note];

    var payload = {
      sheet: 'Расходы',
      action: 'append',
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
            cached.expenses.push({
              ID: id,
              'Дата': date,
              'Название / Где': title,
              'Категория': category,
              'Сумма': amount,
              'Кошелек / Карта': wallet,
              'Заметка': note
            });
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
    var link = record['Ссылка на материалы'] || record.link || '';
    var notes = record['Заметки'] || record.notes || '';

    var row = [id, name, phone, project, color, clientStatus, budget, paid, link, notes];

    var payload = {
      sheet: 'Клиенты',
      action: record.isUpdate ? 'update' : 'append',
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
      gate.style.display = 'flex';
      var emailInput = document.getElementById('mytables-auth-email');
      if (emailInput && !emailInput.value) {
        emailInput.value = CONFIG.AUTHORIZED_EMAIL;
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

  function updateBadgeUI() {
    if (typeof document === 'undefined') return;
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
        iconEl.innerHTML = '<span class="sync-spinner"></span>';
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
  }

  // --- ИНИЦИАЛИЗАЦИЯ СТИЛЕЙ И РАЗМЕТКИ В БРАУЗЕРЕ ---
  function injectStylesAndMarkup() {
    if (typeof document === 'undefined') return;

    // Стили 3D-бумажечек
    if (!document.getElementById('mytables-sync-styles')) {
      var style = document.createElement('style');
      style.id = 'mytables-sync-styles';
      style.textContent = [
        '/* --- СТИЛИ СИНХРОНИЗАЦИИ И БЕЗОПАСНОСТИ «МОИ ТАБЛИЦЫ» --- */',
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
        '  cursor: pointer;',
        '  user-select: none;',
        '  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);',
        '  box-shadow: 0 10px 25px -4px rgba(110, 85, 60, 0.22), 0 4px 8px -2px rgba(110, 85, 60, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9);',
        '}',
        '.mytables-sync-badge:hover {',
        '  transform: translateY(-2px);',
        '  box-shadow: 0 14px 28px -4px rgba(110, 85, 60, 0.28), 0 6px 12px -2px rgba(110, 85, 60, 0.16);',
        '}',
        '.mytables-sync-badge:active { transform: translateY(1px); }',
        '.mytables-sync-badge.status-idle {',
        '  background: #FDF1CC; color: #5B481D; border: 1.5px solid #EBD9A0;',
        '}',
        '.mytables-sync-badge.status-saving {',
        '  background: #FCE8D5; color: #6D3E14; border: 1.5px solid #F5CBA7;',
        '}',
        '.mytables-sync-badge.status-saved {',
        '  background: #EAF5EE; color: #1E3F30; border: 1.5px solid #C8E2D2;',
        '}',
        '.mytables-sync-badge.status-error {',
        '  background: #FFF2EE; color: #6E2F26; border: 1.5px solid #FCD6CF;',
        '}',
        '.sync-spinner {',
        '  width: 12px; height: 12px; border: 2px solid currentColor;',
        '  border-right-color: transparent; border-radius: 50%;',
        '  animation: sync-spin 0.8s linear infinite; display: inline-block;',
        '}',
        '@keyframes sync-spin { to { transform: rotate(360deg); } }',
        '',
        '/* МОДАЛЬНОЕ ОКНО УДАЛЕНИЯ */',
        '.mytables-modal-backdrop {',
        '  position: fixed; inset: 0; background: rgba(43, 34, 25, 0.45);',
        '  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);',
        '  z-index: 10000; display: none; align-items: center; justify-content: center;',
        '  padding: 16px; opacity: 0; transition: opacity 0.2s ease;',
        '}',
        '.mytables-modal-backdrop.active { display: flex; opacity: 1; }',
        '.mytables-paper-modal {',
        '  background: #FAF2E7; border: none; border-radius: 28px;',
        '  padding: 24px 22px; max-width: 400px; width: 100%;',
        '  box-shadow: 0 24px 60px -8px rgba(90, 70, 50, 0.35), 0 8px 18px rgba(90, 70, 50, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.9);',
        '  font-family: "Manrope", sans-serif; text-align: center;',
        '  animation: paper-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1);',
        '}',
        '@keyframes paper-pop { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }',
        '.modal-icon-circle {',
        '  width: 48px; height: 48px; border-radius: 50%; background: #FCD6CF;',
        '  color: #6E2F26; display: flex; align-items: center; justify-content: center;',
        '  margin: 0 auto 14px auto;',
        '  box-shadow: 2px 4px 10px rgba(180, 90, 90, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9);',
        '}',
        '.modal-title { font-size: 18px; font-weight: 900; color: #2F261D; margin-bottom: 6px; }',
        '.modal-text { font-size: 13px; color: #726453; line-height: 1.45; margin-bottom: 20px; }',
        '.modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }',
        '.modal-btn {',
        '  padding: 12px 16px; border-radius: 14px; font-size: 13px; font-weight: 800;',
        '  border: none; cursor: pointer; transition: all 0.15s ease;',
        '  font-family: "Manrope", sans-serif;',
        '}',
        '.modal-btn-cancel {',
        '  background: #FDF1CC; color: #5B481D;',
        '  box-shadow: 2px 3px 8px rgba(190, 170, 110, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.9);',
        '}',
        '.modal-btn-cancel:hover { background: #FCE8B8; }',
        '.modal-btn-danger {',
        '  background: #FCD6CF; color: #6E2F26;',
        '  box-shadow: 2px 4px 12px rgba(180, 90, 90, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.9);',
        '}',
        '.modal-btn-danger:hover { background: #F8C3BA; }',
        '',
        '/* ЭКРАН ВХОДА (GOOGLE GATE) */',
        '.mytables-auth-gate-overlay {',
        '  position: fixed; inset: 0; background: #FAF2E7; z-index: 20000;',
        '  display: flex; align-items: center; justify-content: center; padding: 20px;',
        '  font-family: "Manrope", sans-serif;',
        '}',
        '.mytables-auth-card {',
        '  background: #FAF2E7; border: 3px solid #EADBCC; border-radius: 32px;',
        '  padding: 32px 28px; max-width: 420px; width: 100%; text-align: center;',
        '  box-shadow: 0 28px 70px -10px rgba(140, 110, 80, 0.35), 0 10px 24px rgba(140, 110, 80, 0.18), inset 0 1px 2px rgba(255, 255, 255, 0.95);',
        '}',
        '.auth-heart {',
        '  width: 56px; height: 56px; border-radius: 20px; background: #FCD6CF;',
        '  color: #6E2F26; display: flex; align-items: center; justify-content: center;',
        '  margin: 0 auto 16px auto; font-size: 24px;',
        '  box-shadow: 3px 6px 14px rgba(180, 90, 90, 0.28), -2px -2px 6px rgba(255, 255, 255, 0.9);',
        '}',
        '.auth-app-title { font-size: 24px; font-weight: 900; color: #2F261D; margin-bottom: 4px; }',
        '.auth-app-subtitle { font-size: 13px; font-weight: 600; color: #726453; margin-bottom: 22px; }',
        '.auth-guard-box {',
        '  background: #FDF1CC; border-radius: 16px; padding: 12px 14px;',
        '  margin-bottom: 20px; font-size: 12px; font-weight: 700; color: #5B481D;',
        '  box-shadow: inset 1px 1px 2px rgba(255, 255, 255, 0.8), 2px 3px 8px rgba(185, 160, 110, 0.2);',
        '}',
        '.auth-email-input {',
        '  width: 100%; padding: 13px 16px; border-radius: 16px;',
        '  border: 2px solid #EADBCC; background: #FAF4EB;',
        '  font-family: "Manrope", sans-serif; font-size: 13px; font-weight: 700;',
        '  color: #2F261D; margin-bottom: 14px; outline: none;',
        '  transition: border-color 0.15s ease;',
        '  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);',
        '}',
        '.auth-email-input:focus { border-color: #5A4E40; }',
        '.auth-login-btn {',
        '  width: 100%; padding: 14px 20px; border-radius: 16px;',
        '  background: #5A4E40; color: #FFFFFF; font-size: 14px; font-weight: 800;',
        '  border: none; cursor: pointer; display: flex; align-items: center;',
        '  justify-content: center; gap: 10px; font-family: "Manrope", sans-serif;',
        '  box-shadow: 0 8px 18px rgba(90, 78, 64, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.25);',
        '  transition: all 0.15s ease;',
        '}',
        '.auth-login-btn:hover { background: #4A3E31; transform: translateY(-1px); }',
        '.auth-login-btn:active { transform: translateY(1px); }',
        '.auth-error-box {',
        '  margin-top: 14px; padding: 10px 12px; border-radius: 12px;',
        '  background: #FFF2EE; border: 1.5px solid #FCD6CF;',
        '  color: #6E2F26; font-size: 12px; font-weight: 700; display: none;',
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

      document.getElementById('mytables-del-cancel').addEventListener('click', function () {
        closeDeleteModal(false);
      });
      document.getElementById('mytables-del-confirm').addEventListener('click', function () {
        closeDeleteModal(true);
      });
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeDeleteModal(false);
      });
    }

    // Экран авторизации (Google Gate)
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
        '    🔒 Личное защищенное пространство.<br>Вход доступен исключительно для владелицы.',
        '  </div>',
        '  <form id="mytables-auth-form">',
        '    <input type="email" id="mytables-auth-email" class="auth-email-input" placeholder="lifekvi2018@gmail.com" value="' + CONFIG.AUTHORIZED_EMAIL + '" required>',
        '    <button type="submit" id="mytables-auth-submit" class="auth-login-btn">',
        '      <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.4 7.5 23 12 23z"/></svg>',
        '      Войти через Google',
        '    </button>',
        '  </form>',
        '  <div id="mytables-auth-error" class="auth-error-box"></div>',
        '</div>'
      ].join('');

      document.body.appendChild(gate);

      var authForm = document.getElementById('mytables-auth-form');
      var authEmail = document.getElementById('mytables-auth-email');
      var authError = document.getElementById('mytables-auth-error');
      var authBtn = document.getElementById('mytables-auth-submit');

      function handleLoginAction(e) {
        if (e && e.preventDefault) e.preventDefault();
        var email = (authEmail && authEmail.value) || CONFIG.AUTHORIZED_EMAIL;
        var res = login(email);
        if (res.success) {
          if (authError) authError.style.display = 'none';
          hideAuthModal();
          if (typeof root.onAuthSuccess === 'function') {
            root.onAuthSuccess();
          }
        } else {
          if (authError) {
            authError.textContent = res.error;
            authError.style.display = 'block';
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

    // Слушатели сети
    window.addEventListener('online', function () {
      setStatus('saving', 'Связь есть, синхронизирую...');
      getAllData().then(function () {
        setStatus('saved', 'Синхронизировано с Google ✓');
        if (typeof root.onDataRefreshed === 'function') {
          root.onDataRefreshed();
        }
      }).catch(function (err) {
        setStatus('error', 'Ошибка синхронизации ✕', err.message);
      });
    });
    window.addEventListener('offline', function () {
      setStatus('error', 'Нет связи с Google ✕', 'Отсутствует интернет');
    });

    // Проверка текущей авторизации
    if (!isAuthenticated()) {
      showAuthModal();
    } else {
      updateUserChips();
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

  // --- ПУБЛИЧНЫЙ API МОДУЛЯ ---
  return {
    CONFIG: CONFIG,
    isAuthenticated: isAuthenticated,
    getCurrentUser: getCurrentUser,
    login: login,
    logout: logout,
    getAllData: getAllData,
    saveIncome: saveIncome,
    saveExpense: saveExpense,
    saveClient: saveClient,
    deleteRecord: deleteRecord,
    confirmDeleteDialog: confirmDeleteDialog,
    isOnline: isOnline,
    _setOnlineForTesting: function (val) {
      testOnlineOverride = val;
    },
    getStatus: function () {
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
    initUI: injectStylesAndMarkup
  };
});
