/**
 * ============================================================================
 * ПРОЕКТ «МОИ ТАБЛИЦЫ» — ИНТЕРФЕЙСНЫЙ МОДУЛЬ (app.js)
 * ============================================================================
 * Связывает экраны с модулем sync.js
 * Обеспечивает живое обновление данных, модальные окна добавления записей
 * и подтверждение удаления в единой эстетике «3D-Бумажечки».
 */

(function () {
  'use strict';

  // Форматирование чисел в рубли
  function formatRub(val) {
    var num = Number(val) || 0;
    return num.toLocaleString('ru-RU') + ' ₽';
  }

  // Получение инициалов для круглого аватара
  function getInitials(name) {
    if (!name) return '♡';
    var parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  // Цвета для аватарок и плашек
  var PALETTE_COLORS = ['#C8E2D2', '#FCD6CF', '#D3E7F8', '#FDF1CC', '#FCE8D5', '#DBCCE9'];

  // Инициализация при загрузке страницы
  document.addEventListener('DOMContentLoaded', function () {
    // 1. Проверяем наличие MyTablesSync
    if (typeof MyTablesSync === 'undefined') {
      console.error('MyTablesSync не найден. Убедитесь, что sync.js подключен.');
      return;
    }

    // 2. Внедряем модальное окно добавления записей (+)
    injectAddModal();

    // 3. Подключаем кнопки добавления на странице
    bindAddButtons();

    // 4. Подключаем кнопки выхода в сайдбарах и шапках
    bindLogoutButtons();

    // 5. Загружаем живые данные из Google Таблицы
    loadLiveData();

    // 6. Подписываемся на повторный вход при смене аккаунта
    window.onAuthSuccess = function () {
      loadLiveData();
    };
  });

  // Загрузка живых данных и обновление текущего экрана
  function loadLiveData() {
    MyTablesSync.getAllData().then(function (res) {
      if (res && res.data) {
        updateCurrentScreen(res.data);
      }
    });
  }

  // Обновление специфичных элементов текущего экрана
  function updateCurrentScreen(data) {
    updateMainScreen(data);
    updateIncomeScreen(data);
    updateExpensesScreen(data);
    updateClientsScreen(data);
  }
  window.updateCurrentScreen = updateCurrentScreen;
  window.updateScreenData = updateCurrentScreen;

  function detectCurrentPage() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf('income') !== -1) return 'income';
    if (path.indexOf('expense') !== -1) return 'expenses';
    if (path.indexOf('client') !== -1) return 'clients';
    return 'main';
  }

  // --- ОБНОВЛЕНИЕ ГЛАВНОГО ЭКРАНА ---
  function updateMainScreen(data) {
    if (window.MyTablesCalendar && window.MyTablesCalendar.setCalendarData) {
      window.MyTablesCalendar.setCalendarData(data);
    }

    var incomeList = data.income || [];
    var expensesList = data.expenses || [];
    var clientsList = data.clients || [];

    // Суммы доходов и расходов
    var totalIncome = incomeList.reduce(function (sum, item) {
      return sum + (Number(item['Сумма'] || item.amount || 0));
    }, 0);

    var totalExpense = expensesList.reduce(function (sum, item) {
      return sum + (Number(item['Сумма'] || item.amount || 0));
    }, 0);

    // Мобильные карточки: Доходы, Расходы, Клиенты
    var mobIncomeSum = document.getElementById('mob-income-sum');
    if (mobIncomeSum) mobIncomeSum.textContent = formatRub(totalIncome);

    var mobExpenseSum = document.getElementById('mob-expense-sum');
    if (mobExpenseSum) mobExpenseSum.textContent = formatRub(totalExpense);

    var mobClientsCount = document.getElementById('mob-clients-count');
    if (mobClientsCount) mobClientsCount.textContent = clientsList.length + ' активных';

    // Десктопные плашки (последние записи) — чистый вид без крестиков корзин
    var deskIncomeContainer = document.getElementById('desk-income-items');
    if (deskIncomeContainer && incomeList.length > 0) {
      var recentIncome = incomeList.slice(-4).reverse();
      deskIncomeContainer.innerHTML = recentIncome.map(function (item, idx) {
        var title = item['Проект / Услуга'] || item['Клиент / Источник'] || 'Доход';
        var sum = formatRub(item['Сумма'] || 0);
        var date = formatDate(item['Дата']);
        var id = item.ID || item.id || ('inc_' + idx);
        var dotColor = PALETTE_COLORS[idx % PALETTE_COLORS.length];
        return [
          '<div class="sub-item-income" data-id="' + id + '" onclick="switchAppTab(\'income\')" style="cursor: pointer;">',
          '  <div style="display: flex; align-items: center; gap: 8px;">',
          '    <div style="width: 10px; height: 10px; border-radius: 50%; background: ' + dotColor + ';"></div>',
          '    <div>',
          '      <div style="font-weight: 800; color: #1E3F30;">' + escapeHtml(title) + '</div>',
          '      <div style="font-size: 10px; color: #4A6E5A;">' + escapeHtml(date) + '</div>',
          '    </div>',
          '  </div>',
          '  <div style="display: flex; align-items: center; gap: 4px;">',
          '    <span style="font-weight: 900; color: #1E3F30;">+ ' + sum + '</span>',
          '    <span class="sub-arrow-income"><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></span>',
          '  </div>',
          '</div>'
        ].join('');
      }).join('');
    }

    var deskExpenseContainer = document.getElementById('desk-expense-items');
    if (deskExpenseContainer && expensesList.length > 0) {
      var recentExpenses = expensesList.slice(-4).reverse();
      deskExpenseContainer.innerHTML = recentExpenses.map(function (item, idx) {
        var title = item['Название / Где'] || item['Категория'] || 'Расход';
        var sum = formatRub(item['Сумма'] || 0);
        var date = formatDate(item['Дата']);
        var id = item.ID || item.id || ('exp_' + idx);
        var dotColor = PALETTE_COLORS[(idx + 2) % PALETTE_COLORS.length];
        return [
          '<div class="sub-item-expense" data-id="' + id + '" onclick="switchAppTab(\'expenses\')" style="cursor: pointer;">',
          '  <div style="display: flex; align-items: center; gap: 8px;">',
          '    <div style="width: 10px; height: 10px; border-radius: 50%; background: ' + dotColor + ';"></div>',
          '    <div>',
          '      <div style="font-weight: 800; color: #58241B;">' + escapeHtml(title) + '</div>',
          '      <div style="font-size: 10px; color: #8A4C42;">' + escapeHtml(date) + '</div>',
          '    </div>',
          '  </div>',
          '  <div style="display: flex; align-items: center; gap: 4px;">',
          '    <span style="font-weight: 900; color: #6E2F26;">' + sum + '</span>',
          '    <span class="sub-arrow-expense"><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></span>',
          '  </div>',
          '</div>'
        ].join('');
      }).join('');
    }

    var deskClientsContainer = document.getElementById('desk-clients-items');
    if (deskClientsContainer && clientsList.length > 0) {
      var recentClients = clientsList.slice(-4).reverse();
      deskClientsContainer.innerHTML = recentClients.map(function (item, idx) {
        var name = item['Имя клиента'] || 'Клиент';
        var project = item['Проект'] || 'Без проекта';
        var id = item.ID || item.id || ('cli_' + idx);
        var initials = getInitials(name);
        var bg = PALETTE_COLORS[(idx + 1) % PALETTE_COLORS.length];
        return [
          '<div class="sub-item-clients" data-id="' + id + '" onclick="switchAppTab(\'clients\')" style="cursor: pointer;">',
          '  <div style="display: flex; align-items: center; gap: 10px;">',
          '    <div style="width: 30px; height: 30px; border-radius: 50%; background: ' + bg + '; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #2F261D; font-size: 11px;">' + initials + '</div>',
          '    <div>',
          '      <div style="font-weight: 800; color: #163B59;">' + escapeHtml(name) + '</div>',
          '      <div style="font-size: 10px; color: #3A6488;">' + escapeHtml(project) + '</div>',
          '    </div>',
          '  </div>',
          '  <span class="sub-arrow-clients"><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></span>',
          '</div>'
        ].join('');
      }).join('');
    }
  }

  // --- ОБНОВЛЕНИЕ ЭКРАНА ДОХОДОВ ---
  function updateIncomeScreen(data) {
    var incomeList = data.income || [];
    var totalIncome = incomeList.reduce(function (sum, item) {
      return sum + (Number(item['Сумма'] || item.amount || 0));
    }, 0);

    // Обновляем общую сумму доходов (налепочки / бейджи)
    var totalPill = document.getElementById('income-total-val') || document.querySelector('.project-sum-val');
    if (totalPill) totalPill.textContent = formatRub(totalIncome);

    // Мобильный список карточек доходов
    var mobContainer = document.getElementById('income-live-payments') || document.querySelector('.income-cards-list');
    if (mobContainer && incomeList.length > 0) {
      // Рендерим живые доходы в виде аккуратных 3D-бумажечек
      mobContainer.innerHTML = incomeList.slice().reverse().map(function (item, idx) {
        var id = item.ID || item.id || ('inc_' + idx);
        var date = formatDate(item['Дата']);
        var sum = formatRub(item['Сумма'] || 0);
        var client = item['Клиент / Источник'] || 'Клиент';
        var project = item['Проект / Услуга'] || 'Услуга';
        var cat = item['Категория'] || 'Доход';
        var color = PALETTE_COLORS[idx % PALETTE_COLORS.length];
        var initials = getInitials(client);

        return [
          '<div class="income-client-card" style="background: ' + color + '; margin-bottom: 12px;" data-id="' + id + '">',
          '  <div class="client-card-top">',
          '    <div class="client-info-left">',
          '      <div class="client-avatar" style="background: rgba(255,255,255,0.7);">' + initials + '</div>',
          '      <div class="client-name-box">',
          '        <span class="client-name">' + escapeHtml(client) + '</span>',
          '        <span class="client-phone">' + escapeHtml(project) + '</span>',
          '      </div>',
          '    </div>',
          '    <div class="project-sum-pill">',
          '      <span class="project-sum-label">' + escapeHtml(cat) + ':</span>',
          '      <span class="project-sum-val">' + sum + '</span>',
          '    </div>',
          '  </div>',
          '  <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 6px; font-size: 11px; opacity: 0.8;">',
          '    <span>' + escapeHtml(date) + '</span>',
          '    <button class="item-del-btn" title="Удалить" onclick="window.handleDeleteRow(event, \'Доходы\', \'' + id + '\', \'' + escapeHtml(client) + '\')"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
          '  </div>',
          '</div>'
        ].join('');
      }).join('');
    }

    // Десктопный список карточек
    var deskContainer = document.getElementById('income-desktop-list') || document.querySelector('.desk-income-list');
    if (deskContainer && incomeList.length > 0) {
      deskContainer.innerHTML = incomeList.slice().reverse().map(function (item, idx) {
        var id = item.ID || item.id || ('inc_' + idx);
        var date = formatDate(item['Дата']);
        var sum = formatRub(item['Сумма'] || 0);
        var client = item['Клиент / Источник'] || 'Клиент';
        var project = item['Проект / Услуга'] || 'Услуга';
        var cat = item['Категория'] || 'Доход';
        var color = PALETTE_COLORS[idx % PALETTE_COLORS.length];
        var initials = getInitials(client);

        return [
          '<div class="desk-client-bento-card" style="background: ' + color + '; margin-bottom: 16px;" data-id="' + id + '">',
          '  <div class="desk-card-profile">',
          '    <div class="desk-profile-header">',
          '      <div class="client-avatar desk-avatar-big">' + initials + '</div>',
          '      <div>',
          '        <div class="desk-profile-name">' + escapeHtml(client) + '</div>',
          '        <div class="desk-profile-phone">' + escapeHtml(project) + ' • ' + escapeHtml(date) + '</div>',
          '      </div>',
          '    </div>',
          '    <div class="project-sum-pill" style="width: fit-content;">',
          '      <span class="project-sum-label">' + escapeHtml(cat) + ':</span>',
          '      <span class="project-sum-val">' + sum + '</span>',
          '    </div>',
          '  </div>',
          '  <div class="desk-payments-block">',
          '    <div class="desk-payments-header">',
          '      <span class="desk-payments-title">Поступление</span>',
          '      <button class="payment-dots-btn" title="Удалить" onclick="window.handleDeleteRow(event, \'Доходы\', \'' + id + '\', \'' + escapeHtml(client) + '\')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>',
          '    </div>',
          '    <div class="desk-payments-grid">',
          '      <div class="payment-paper-slip">',
          '        <span class="payment-date">' + escapeHtml(date) + '</span>',
          '        <div class="payment-right-group">',
          '          <span class="payment-sum">' + sum + '</span>',
          '        </div>',
          '      </div>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('');
      }).join('');
    }
  }

  // --- ОБНОВЛЕНИЕ ЭКРАНА РАСХОДОВ ---
  function updateExpensesScreen(data) {
    var expensesList = data.expenses || [];
    var totalExpense = expensesList.reduce(function (sum, item) {
      return sum + (Number(item['Сумма'] || item.amount || item['Текущий_Тариф'] || item.currentRate || 0));
    }, 0);

    var totalPill = document.getElementById('expense-total-val');
    if (totalPill && totalExpense > 0) totalPill.textContent = formatRub(totalExpense);
  }

  // --- ОБНОВЛЕНИЕ ЭКРАНА КЛИЕНТОВ ---
  function updateClientsScreen(data) {
    var clientsList = data.clients || [];
    var countPill = document.getElementById('clients-count-pill');
    if (countPill) countPill.textContent = clientsList.length + ' активных';

    // Мобильный список клиентов
    var mobContainer = document.getElementById('clients-live-grid') || document.querySelector('.client-slips-list');
    if (mobContainer && clientsList.length > 0) {
      mobContainer.innerHTML = clientsList.slice().reverse().map(function (item, idx) {
        var id = item.ID || item.id || ('cli_' + idx);
        var name = item['Имя клиента'] || 'Клиент';
        var phone = String(item['Телефон / Контакт'] || '').replace(/^'/, '');
        var project = item['Проект'] || '';
        var status = item['Статус'] || 'В работе';
        var color = item['Цвет'] || 'mint';
        var initials = getInitials(name);

        return [
          '<div class="client-item-slip ' + color + '" data-id="' + id + '" style="margin-bottom: 10px;">',
          '  <div class="client-item-left">',
          '    <div class="client-avatar-round" style="width: 38px; height: 38px; border-radius: 50%; aspect-ratio: 1/1; flex-shrink: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: #2F261D;">' + initials + '</div>',
          '    <div class="client-details">',
          '      <span class="client-name-title">' + escapeHtml(name) + '</span>',
          '      <span class="client-project-sub">' + escapeHtml(project) + '</span>',
          '      <span class="client-phone-sub">' + escapeHtml(phone) + '</span>',
          '    </div>',
          '  </div>',
          '  <div style="display: flex; align-items: center; gap: 6px;">',
          '    <span class="client-status-badge badge-work" style="font-size: 10px; padding: 4px 8px;">' + escapeHtml(status) + '</span>',
          '    <button class="item-del-btn" title="Удалить" onclick="window.handleDeleteRow(event, \'Клиенты\', \'' + id + '\', \'' + escapeHtml(name) + '\')"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
          '  </div>',
          '</div>'
        ].join('');
      }).join('');
    }

    // Десктопная колонка клиентов
    var deskContainer = document.getElementById('clients-desktop-grid') || document.querySelector('.desk-client-list-column');
    if (deskContainer && clientsList.length > 0) {
      deskContainer.innerHTML = clientsList.slice().reverse().map(function (item, idx) {
        var id = item.ID || item.id || ('cli_' + idx);
        var name = item['Имя клиента'] || 'Клиент';
        var phone = String(item['Телефон / Контакт'] || '').replace(/^'/, '');
        var project = item['Проект'] || '';
        var status = item['Статус'] || 'В работе';
        var color = item['Цвет'] || 'mint';
        var initials = getInitials(name);

        return [
          '<div class="client-item-slip ' + color + '" data-id="' + id + '" style="margin-bottom: 10px;">',
          '  <div class="client-item-left">',
          '    <div class="client-avatar-round" style="width: 38px; height: 38px; border-radius: 50%; aspect-ratio: 1/1; flex-shrink: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: #2F261D;">' + initials + '</div>',
          '    <div>',
          '      <div class="client-name-title" style="font-size: 13px;">' + escapeHtml(name) + '</div>',
          '      <div class="client-project-sub" style="font-size: 11px;">' + escapeHtml(project) + '</div>',
          '      <div class="client-phone-sub" style="font-size: 10px;">' + escapeHtml(phone) + '</div>',
          '    </div>',
          '  </div>',
          '  <div style="display: flex; align-items: center; gap: 6px;">',
          '    <span class="client-status-badge badge-work" style="font-size: 9px; padding: 4px 8px;">' + escapeHtml(status) + '</span>',
          '    <button class="item-del-btn" title="Удалить" onclick="window.handleDeleteRow(event, \'Клиенты\', \'' + id + '\', \'' + escapeHtml(name) + '\')"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
          '  </div>',
          '</div>'
        ].join('');
      }).join('');
    }
  }

  // --- ОБРАБОТЧИК УДАЛЕНИЯ ЗАПИСИ ---
  window.handleDeleteRow = function (e, sheet, id, title) {
    if (e && e.stopPropagation) e.stopPropagation();
    MyTablesSync.deleteRecord(sheet, id, title).then(function (res) {
      if (res && res.deleted) {
        // Удаляем элемент из DOM визуально
        var rowEls = document.querySelectorAll('[data-id="' + id + '"]');
        for (var i = 0; i < rowEls.length; i++) {
          rowEls[i].style.transition = 'all 0.25s ease';
          rowEls[i].style.opacity = '0';
          rowEls[i].style.transform = 'scale(0.9)';
          (function (el) {
            setTimeout(function () {
              if (el.parentNode) el.parentNode.removeChild(el);
            }, 250);
          })(rowEls[i]);
        }
      }
    });
  };

  // --- ПЕРЕКЛЮЧЕНИЕ СТАТУСА ОПЛАТЫ РАСХОДА («ОПЛАЧЕНО / ОПЛАТИТЬ») ---
  window.toggleExpenseItemStatus = function (event, btn) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!btn) return;

    var slip = btn.closest ? btn.closest('.expense-paper-slip') : null;
    var titleEl = slip ? slip.querySelector('.expense-item-name') : null;
    var title = titleEl ? titleEl.textContent.trim() : '';
    var willBePaid = !btn.classList.contains('paid');

    // 1. Синхронизируем состояние кнопок (десктоп и мобильный)
    var allSlips = document.querySelectorAll('.expense-paper-slip');
    for (var s = 0; s < allSlips.length; s++) {
      var sTitleEl = allSlips[s].querySelector('.expense-item-name');
      if (sTitleEl && sTitleEl.textContent.trim().toLowerCase() === title.toLowerCase()) {
        var pill = allSlips[s].querySelector('.status-pill');
        if (pill) {
          if (willBePaid) {
            pill.classList.remove('unpaid');
            pill.classList.add('paid');
            pill.innerHTML = '<span class="status-dot"></span> Оплачено';
          } else {
            pill.classList.remove('paid');
            pill.classList.add('unpaid');
            pill.innerHTML = '<span class="status-dot"></span> Оплатить';
          }
        }
      }
    }

    // 2. Обновляем paidMonths в calendar.js и реактивно пересчитываем сводку на Главном экране
    if (window.MyTablesCalendar) {
      var ym = (typeof window.MyTablesCalendar.getYearMonth === 'function')
        ? window.MyTablesCalendar.getYearMonth()
        : '2026-10';
      var payments = (window.MyTablesCalendar.state && window.MyTablesCalendar.state.payments) || [];
      for (var i = 0; i < payments.length; i++) {
        var p = payments[i];
        var pTitle = p.title || p['Название'] || p.name || '';
        if (title && pTitle.toLowerCase() === title.toLowerCase()) {
          if (!p.paidMonths) p.paidMonths = [];
          var mIdx = p.paidMonths.indexOf(ym);
          if (willBePaid && mIdx === -1) {
            p.paidMonths.push(ym);
          } else if (!willBePaid && mIdx !== -1) {
            p.paidMonths.splice(mIdx, 1);
          }
          break;
        }
      }
      if (typeof window.MyTablesCalendar.updateSummaryCards === 'function') {
        window.MyTablesCalendar.updateSummaryCards();
      }
      if (typeof window.MyTablesCalendar.renderCalendar === 'function') {
        window.MyTablesCalendar.renderCalendar();
      }
    }
  };

  // --- МОДАЛЬНЫЕ ОКНА ДОБАВЛЕНИЯ ЗАПИСЕЙ (ЗОЛОТОЙ СТАНДАРТ АНИ) ---
  function injectAddModal() {
    // 1. Модальное окно РАСХОДОВ (строго 4 поля + палитра кружочков, персик #FCE8D5, сливки #FDF1CC, мята #C8E2D2, без рамок)
    if (!document.getElementById('mytables-expense-modal')) {
      var expModal = document.createElement('div');
      expModal.id = 'mytables-expense-modal';
      expModal.className = 'mytables-modal-backdrop';
      expModal.innerHTML = [
        '<div class="mytables-paper-modal" style="max-width: 440px; width: 100%; background: #FAF2E7; border-radius: 24px; padding: 22px 20px; box-shadow: 6px 14px 35px rgba(130, 105, 80, 0.28), -3px -3px 10px rgba(255, 255, 255, 0.9); border: none; text-align: left;">',
        '  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">',
        '    <div style="font-size: 18px; font-weight: 900; color: #2F261D; display: flex; align-items: center; gap: 6px;">',
        '      <span>+ Новый расход</span> <span style="color: #E27D60;">♡</span>',
        '    </div>',
        '    <button type="button" id="exp-modal-close" style="background: none; border: none; font-size: 20px; font-weight: 800; cursor: pointer; color: #8C784C; padding: 4px; line-height: 1; outline: none;">✕</button>',
        '  </div>',
        '  <form id="exp-modal-form" onsubmit="return false;">',
        '    <div style="background: #FCE8D5; border-radius: 18px; padding: 16px; box-shadow: 3px 5px 14px rgba(170, 130, 95, 0.2), -2px -2px 6px rgba(255, 255, 255, 0.85); margin-bottom: 16px; border: none;">',
        '      <div style="margin-bottom: 12px;">',
        '        <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 5px;">Услуга / Название</label>',
        '        <input type="text" id="exp-in-title" placeholder="Например, Яндекс Плюс, Claude" style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 11px 14px; font-size: 13px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); font-family: inherit;" required>',
        '      </div>',
        '      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">',
        '        <div>',
        '          <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 5px;">Число месяца (1–31)</label>',
        '          <input type="number" id="exp-in-day" min="1" max="31" placeholder="15" style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 11px 14px; font-size: 13px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); font-family: inherit;" required>',
        '        </div>',
        '        <div>',
        '          <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 5px;">Сумма (₽)</label>',
        '          <input type="number" id="exp-in-amount" min="1" placeholder="1 500" style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 11px 14px; font-size: 13px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); font-family: inherit;" required>',
        '        </div>',
        '      </div>',
        '      <div style="margin-bottom: 14px;">',
        '        <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 5px;">Ссылка на сайт оплаты</label>',
        '        <input type="url" id="exp-in-url" placeholder="https://..." style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 11px 14px; font-size: 13px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); font-family: inherit;">',
        '      </div>',
        '      <div>',
        '        <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 7px;">Цвет карточки</label>',
        '        <div id="exp-color-dots-row" style="display: flex; gap: 10px; align-items: center;">',
        '          <button type="button" class="exp-color-opt active" data-color="#D3E7F8" style="width: 28px; height: 28px; border-radius: 50%; background: #D3E7F8; border: none; cursor: pointer; box-shadow: 0 0 0 2px #FAF2E7, 0 0 0 4px #5B481D; transform: scale(1.1); transition: all 0.15s ease; outline: none;"></button>',
        '          <button type="button" class="exp-color-opt" data-color="#C8E2D2" style="width: 28px; height: 28px; border-radius: 50%; background: #C8E2D2; border: none; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.15); transition: all 0.15s ease; outline: none;"></button>',
        '          <button type="button" class="exp-color-opt" data-color="#FCE8D5" style="width: 28px; height: 28px; border-radius: 50%; background: #FCE8D5; border: none; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.15); transition: all 0.15s ease; outline: none;"></button>',
        '          <button type="button" class="exp-color-opt" data-color="#FCD6CF" style="width: 28px; height: 28px; border-radius: 50%; background: #FCD6CF; border: none; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.15); transition: all 0.15s ease; outline: none;"></button>',
        '          <button type="button" class="exp-color-opt" data-color="#DBCCE9" style="width: 28px; height: 28px; border-radius: 50%; background: #DBCCE9; border: none; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.15); transition: all 0.15s ease; outline: none;"></button>',
        '          <button type="button" class="exp-color-opt" data-color="#FDF1CC" style="width: 28px; height: 28px; border-radius: 50%; background: #FDF1CC; border: none; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.15); transition: all 0.15s ease; outline: none;"></button>',
        '        </div>',
        '      </div>',
        '    </div>',
        '    <div style="display: flex; gap: 10px; justify-content: flex-end;">',
        '      <button type="button" id="exp-modal-cancel" style="background: #FDF1CC; color: #5B481D; border: none; outline: none; border-radius: 14px; padding: 11px 20px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 2px 3px 6px rgba(160, 125, 85, 0.2); transition: all 0.15s ease;">Отмена</button>',
        '      <button type="submit" id="exp-modal-submit" style="background: #C8E2D2; color: #1E3F30; border: none; outline: none; border-radius: 14px; padding: 11px 24px; font-size: 13px; font-weight: 900; cursor: pointer; box-shadow: 2px 3px 7px rgba(70, 130, 95, 0.25); transition: all 0.15s ease;">Сохранить</button>',
        '    </div>',
        '  </form>',
        '</div>'
      ].join('');
      document.body.appendChild(expModal);

      var selectedExpenseColor = '#D3E7F8';
      var colorBtns = expModal.querySelectorAll('.exp-color-opt');
      for (var ci = 0; ci < colorBtns.length; ci++) {
        colorBtns[ci].addEventListener('click', function () {
          for (var cj = 0; cj < colorBtns.length; cj++) {
            colorBtns[cj].classList.remove('active');
            colorBtns[cj].style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)';
            colorBtns[cj].style.transform = 'scale(1)';
          }
          this.classList.add('active');
          this.style.boxShadow = '0 0 0 2px #FAF2E7, 0 0 0 4px #5B481D';
          this.style.transform = 'scale(1.1)';
          selectedExpenseColor = this.getAttribute('data-color');
        });
      }

      var closeExpModal = function () { expModal.classList.remove('active'); };
      document.getElementById('exp-modal-close').addEventListener('click', closeExpModal);
      document.getElementById('exp-modal-cancel').addEventListener('click', closeExpModal);
      expModal.addEventListener('click', function (e) {
        if (e.target === expModal) closeExpModal();
      });

      document.getElementById('exp-modal-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var title = (document.getElementById('exp-in-title').value || '').trim();
        var day = parseInt(document.getElementById('exp-in-day').value, 10);
        var amount = Number(document.getElementById('exp-in-amount').value) || 0;
        var url = (document.getElementById('exp-in-url').value || '').trim();

        if (!title) {
          alert('Пожалуйста, введите название услуги');
          return;
        }
        if (!day || day < 1 || day > 31) {
          alert('Число месяца должно быть от 1 до 31');
          return;
        }
        if (amount <= 0) {
          alert('Сумма должна быть больше нуля');
          return;
        }

        var submitBtn = document.getElementById('exp-modal-submit');
        submitBtn.textContent = 'Сохраняю...';
        submitBtn.disabled = true;

        // Автоопределение категории
        var cat = 'other';
        var tLower = title.toLowerCase();
        if (tLower.indexOf('vpn') !== -1) cat = 'vpn';
        else if (tLower.indexOf('интернет') !== -1 || tLower.indexOf('телефон') !== -1 || tLower.indexOf('связь') !== -1 || tLower.indexOf('мегафон') !== -1 || tLower.indexOf('мтс') !== -1 || tLower.indexOf('билайн') !== -1 || tLower.indexOf('т-мобайл') !== -1) cat = 'internet';
        else if (tLower.indexOf('ai') !== -1 || tLower.indexOf('ии') !== -1 || tLower.indexOf('gpt') !== -1 || tLower.indexOf('claude') !== -1 || tLower.indexOf('gemini') !== -1 || tLower.indexOf('midjourney') !== -1) cat = 'ai';

        var newExpense = {
          title: title,
          day: day,
          amount: amount,
          url: url || '#',
          color: selectedExpenseColor,
          category: cat
        };

        // Добавляем новую плашечку на экран (десктоп и мобильный)
        var slipHtml = [
          '<div class="expense-paper-slip">',
          '  <div class="expense-item-left">',
          '    <div class="service-logo-circle" style="color: ' + selectedExpenseColor + ';">',
          '      <span style="font-weight:900; font-size:13px; color:#2F261D;">' + escapeHtml(title.charAt(0).toUpperCase()) + '</span>',
          '    </div>',
          '    <div class="expense-item-info">',
          '      <span class="expense-item-name">' + escapeHtml(title) + '</span>',
          '      <div class="expense-item-sub">',
          '        <span class="expense-item-price">' + formatRub(amount) + '</span>',
          '        <span class="expense-item-date">• ' + day + ' число</span>',
          '      </div>',
          '    </div>',
          '  </div>',
          '  <div class="expense-item-right">',
          '    <a href="' + escapeHtml(url || '#') + '" target="_blank" class="expense-shop-btn">В магазин ↗</a>',
          '    <button class="status-pill unpaid" onclick="window.toggleExpenseItemStatus(event, this)"><span class="status-dot"></span> Оплатить</button>',
          '  </div>',
          '</div>'
        ].join('');

        // Находим целевой список карточек (десктоп и мобилка)
        var targetColIndex = (cat === 'ai') ? 0 : (cat === 'internet' ? 1 : (cat === 'vpn' ? 2 : 0));
        var deskCards = document.querySelectorAll('#desk-view-expenses .expense-cat-card');
        if (deskCards && deskCards[targetColIndex]) {
          var deskList = deskCards[targetColIndex].querySelector('.cat-items-list');
          if (deskList) deskList.insertAdjacentHTML('beforeend', slipHtml);
        }
        var mobCards = document.querySelectorAll('#mob-view-expenses .expense-cat-card');
        if (mobCards && mobCards[targetColIndex]) {
          var mobList = mobCards[targetColIndex].querySelector('.cat-items-list');
          if (mobList) mobList.insertAdjacentHTML('beforeend', slipHtml);
        }

        // Сохраняем в синхронизацию
        var syncPromise = (window.MyTablesSync && typeof window.MyTablesSync.saveExpense === 'function')
          ? window.MyTablesSync.saveExpense(newExpense)
          : Promise.resolve();

        syncPromise.then(function () {
          submitBtn.textContent = 'Сохранить';
          submitBtn.disabled = false;
          closeExpModal();
          if (window.MyTablesCalendar && window.MyTablesCalendar.state) {
            if (!window.MyTablesCalendar.state.payments) window.MyTablesCalendar.state.payments = [];
            window.MyTablesCalendar.state.payments.push({
              id: 'exp_' + Date.now(),
              title: title,
              dayOfMonth: day,
              currentRate: amount,
              amount: amount,
              shopUrl: url || '#',
              color: selectedExpenseColor,
              category: cat,
              paidMonths: [],
              isArchived: false
            });
            if (typeof window.MyTablesCalendar.updateSummaryCards === 'function') {
              window.MyTablesCalendar.updateSummaryCards();
            }
            if (typeof window.MyTablesCalendar.renderCalendar === 'function') {
              window.MyTablesCalendar.renderCalendar();
            }
          }
        }).catch(function (err) {
          submitBtn.textContent = 'Сохранить';
          submitBtn.disabled = false;
          closeExpModal();
        });
      });
    }

    // 2. Модальное окно для ДОХОДОВ и КЛИЕНТОВ (также в Золотом стандарте без рамок и без #5A4E40)
    if (!document.getElementById('mytables-add-modal')) {
      var modal = document.createElement('div');
      modal.id = 'mytables-add-modal';
      modal.className = 'mytables-modal-backdrop';
      modal.innerHTML = [
        '<div class="mytables-paper-modal" style="max-width: 440px; width: 100%; background: #FAF2E7; border-radius: 24px; padding: 22px 20px; box-shadow: 6px 14px 35px rgba(130, 105, 80, 0.28), -3px -3px 10px rgba(255, 255, 255, 0.9); border: none; text-align: left;">',
        '  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">',
        '    <div style="font-size: 18px; font-weight: 900; color: #2F261D;" id="add-modal-title">Новая запись</div>',
        '    <button type="button" id="add-modal-close" style="background: none; border: none; font-size: 20px; font-weight: 800; cursor: pointer; color: #8C784C; outline: none;">✕</button>',
        '  </div>',
        '  <form id="add-modal-form" onsubmit="return false;">',
        '    <input type="hidden" id="add-modal-type" value="income">',
        '    <div style="background: #FCE8D5; border-radius: 18px; padding: 16px; box-shadow: 3px 5px 14px rgba(170, 130, 95, 0.2), -2px -2px 6px rgba(255, 255, 255, 0.85); margin-bottom: 16px; border: none;">',
        '      <div style="margin-bottom: 12px;">',
        '        <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 4px;" id="add-field-1-label">Клиент / Название</label>',
        '        <input type="text" id="add-field-1" class="auth-email-input" style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 11px 14px; font-size: 13px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); margin-bottom: 0; font-family: inherit;" required>',
        '      </div>',
        '      <div style="margin-bottom: 12px;">',
        '        <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 4px;" id="add-field-2-label">Проект / Описание</label>',
        '        <input type="text" id="add-field-2" class="auth-email-input" style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 11px 14px; font-size: 13px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); margin-bottom: 0; font-family: inherit;">',
        '      </div>',
        '      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">',
        '        <div>',
        '          <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 4px;">Сумма (₽)</label>',
        '          <input type="number" id="add-field-amount" class="auth-email-input" style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 11px 14px; font-size: 13px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); margin-bottom: 0; font-family: inherit;" required>',
        '        </div>',
        '        <div>',
        '          <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 4px;">Категория</label>',
        '          <input type="text" id="add-field-cat" class="auth-email-input" style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 11px 14px; font-size: 13px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); margin-bottom: 0; font-family: inherit;" value="Дизайн">',
        '        </div>',
        '      </div>',
        '      <div>',
        '        <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 4px;">Заметка</label>',
        '        <input type="text" id="add-field-note" class="auth-email-input" style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 11px 14px; font-size: 13px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); margin-bottom: 0; font-family: inherit;">',
        '      </div>',
        '    </div>',
        '    <div style="display: flex; gap: 10px; justify-content: flex-end;">',
        '      <button type="button" class="modal-btn modal-btn-cancel" id="add-modal-cancel" style="background: #FDF1CC; color: #5B481D; border: none; outline: none; border-radius: 14px; padding: 11px 20px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 2px 3px 6px rgba(160, 125, 85, 0.2);">Отмена</button>',
        '      <button type="submit" class="modal-btn" id="add-modal-submit" style="background: #C8E2D2; color: #1E3F30; border: none; outline: none; border-radius: 14px; padding: 11px 24px; font-size: 13px; font-weight: 900; cursor: pointer; box-shadow: 2px 3px 7px rgba(70, 130, 95, 0.25);">Сохранить</button>',
        '    </div>',
        '  </form>',
        '</div>'
      ].join('');

      document.body.appendChild(modal);

      var closeModal = function () { modal.classList.remove('active'); };
      document.getElementById('add-modal-close').addEventListener('click', closeModal);
      document.getElementById('add-modal-cancel').addEventListener('click', closeModal);
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });

      document.getElementById('add-modal-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var type = document.getElementById('add-modal-type').value;
        var f1 = document.getElementById('add-field-1').value;
        var f2 = document.getElementById('add-field-2').value;
        var amount = Number(document.getElementById('add-field-amount').value) || 0;
        var cat = document.getElementById('add-field-cat').value;
        var note = document.getElementById('add-field-note').value;

        var submitBtn = document.getElementById('add-modal-submit');
        submitBtn.textContent = 'Сохраняю...';
        submitBtn.disabled = true;

        var promise;
        if (type === 'income') {
          promise = MyTablesSync.saveIncome({
            client: f1,
            project: f2,
            amount: amount,
            category: cat,
            note: note,
            status: 'Оплачено'
          });
        } else if (type === 'client') {
          promise = MyTablesSync.saveClient({
            name: f1,
            phone: f2,
            project: note || 'Новый проект',
            budget: amount,
            paid: 0,
            color: 'mint',
            status: 'В работе'
          });
        }

        if (promise) {
          promise.then(function () {
            submitBtn.textContent = 'Сохранить';
            submitBtn.disabled = false;
            closeModal();
            loadLiveData();
          }).catch(function (err) {
            submitBtn.textContent = 'Сохранить';
            submitBtn.disabled = false;
            alert('Ошибка при сохранении: ' + err.message);
          });
        } else {
          submitBtn.textContent = 'Сохранить';
          submitBtn.disabled = false;
          closeModal();
        }
      });
    }
  }

  // Открытие модалки добавления для соответствующего типа
  window.openAddModal = function (type) {
    if (type === 'expense') {
      var expModal = document.getElementById('mytables-expense-modal');
      if (!expModal) {
        injectAddModal();
        expModal = document.getElementById('mytables-expense-modal');
      }
      if (expModal) {
        document.getElementById('exp-in-title').value = '';
        document.getElementById('exp-in-day').value = new Date().getDate();
        document.getElementById('exp-in-amount').value = '';
        document.getElementById('exp-in-url').value = '';
        expModal.classList.add('active');
        document.getElementById('exp-in-title').focus();
      }
      return;
    }

    var modal = document.getElementById('mytables-add-modal');
    if (!modal) {
      injectAddModal();
      modal = document.getElementById('mytables-add-modal');
    }
    if (!modal) return;

    var title = document.getElementById('add-modal-title');
    var typeInput = document.getElementById('add-modal-type');
    var l1 = document.getElementById('add-field-1-label');
    var l2 = document.getElementById('add-field-2-label');
    var fCat = document.getElementById('add-field-cat');

    typeInput.value = type;

    if (type === 'income') {
      title.textContent = 'Новый доход ♡';
      l1.textContent = 'Клиент / Источник:';
      l2.textContent = 'Проект / Услуга:';
      fCat.value = 'Дизайн';
    } else if (type === 'client') {
      title.textContent = 'Новый клиент ♡';
      l1.textContent = 'Имя клиента:';
      l2.textContent = 'Телефон / Контакт:';
      fCat.value = 'В работе';
    }

    document.getElementById('add-field-1').value = '';
    document.getElementById('add-field-2').value = '';
    document.getElementById('add-field-amount').value = '';
    document.getElementById('add-field-note').value = '';

    modal.classList.add('active');
  };

  // Привязка кнопок "+" на странице
  function bindAddButtons() {
    var plusIncome = document.querySelectorAll('.btn-plus-income');
    for (var i = 0; i < plusIncome.length; i++) {
      plusIncome[i].addEventListener('click', function () { openAddModal('income'); });
    }

    var plusExpense = document.querySelectorAll('.btn-plus-expense, .cat-add-btn');
    for (var j = 0; j < plusExpense.length; j++) {
      plusExpense[j].addEventListener('click', function () { openAddModal('expense'); });
    }

    var plusClients = document.querySelectorAll('.btn-plus-clients, .btn-plus-desk');
    for (var k = 0; k < plusClients.length; k++) {
      plusClients[k].addEventListener('click', function () { openAddModal('client'); });
    }
  }

  // Привязка кнопок выхода (Logout)
  function bindLogoutButtons() {
    var logoutBtns = document.querySelectorAll('.mytables-logout-btn');
    for (var i = 0; i < logoutBtns.length; i++) {
      logoutBtns[i].addEventListener('click', function (e) {
        e.preventDefault();
        MyTablesSync.logout();
      });
    }
  }

  // Вспомогательное форматирование даты
  function formatDate(raw) {
    if (!raw) return '';
    try {
      var d = new Date(raw);
      if (isNaN(d.getTime())) return String(raw);
      var day = d.getDate();
      var months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
      return day + ' ' + months[d.getMonth()];
    } catch (e) {
      return String(raw);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();
