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

    // Десктопные плашки (последние записи)
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
          '<div class="sub-item-income" data-id="' + id + '" data-sheet="Доходы">',
          '  <div style="display: flex; align-items: center; gap: 8px;">',
          '    <div style="width: 10px; height: 10px; border-radius: 50%; background: ' + dotColor + ';"></div>',
          '    <div>',
          '      <div style="font-weight: 800; color: #1E3F30;">' + escapeHtml(title) + '</div>',
          '      <div style="font-size: 10px; color: #4A6E5A;">' + escapeHtml(date) + '</div>',
          '    </div>',
          '  </div>',
          '  <div style="display: flex; align-items: center; gap: 4px;">',
          '    <span style="font-weight: 900; color: #1E3F30;">+ ' + sum + '</span>',
          '    <button class="item-del-btn" title="Удалить" onclick="window.handleDeleteRow(event, \'Доходы\', \'' + id + '\', \'' + escapeHtml(title) + '\')"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
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
          '<div class="sub-item-expense" data-id="' + id + '" data-sheet="Расходы">',
          '  <div style="display: flex; align-items: center; gap: 8px;">',
          '    <div style="width: 10px; height: 10px; border-radius: 50%; background: ' + dotColor + ';"></div>',
          '    <div>',
          '      <div style="font-weight: 800; color: #58241B;">' + escapeHtml(title) + '</div>',
          '      <div style="font-size: 10px; color: #8A4C42;">' + escapeHtml(date) + '</div>',
          '    </div>',
          '  </div>',
          '  <div style="display: flex; align-items: center; gap: 4px;">',
          '    <span style="font-weight: 900; color: #6E2F26;">' + sum + '</span>',
          '    <button class="item-del-btn" title="Удалить" onclick="window.handleDeleteRow(event, \'Расходы\', \'' + id + '\', \'' + escapeHtml(title) + '\')"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
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
          '<div class="sub-item-clients" data-id="' + id + '" data-sheet="Клиенты">',
          '  <div style="display: flex; align-items: center; gap: 10px;">',
          '    <div style="width: 30px; height: 30px; border-radius: 50%; background: ' + bg + '; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #2F261D; font-size: 11px;">' + initials + '</div>',
          '    <div>',
          '      <div style="font-weight: 800; color: #163B59;">' + escapeHtml(name) + '</div>',
          '      <div style="font-size: 10px; color: #3A6488;">' + escapeHtml(project) + '</div>',
          '    </div>',
          '  </div>',
          '  <button class="item-del-btn" title="Удалить" onclick="window.handleDeleteRow(event, \'Клиенты\', \'' + id + '\', \'' + escapeHtml(name) + '\')"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
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
      return sum + (Number(item['Сумма'] || item.amount || 0));
    }, 0);

    var totalPill = document.getElementById('expense-total-val');
    if (totalPill) totalPill.textContent = formatRub(totalExpense);

    var mobContainer = document.getElementById('expense-live-slips') || document.querySelector('.expenses-scroll-list');
    if (mobContainer && expensesList.length > 0) {
      mobContainer.innerHTML = expensesList.slice().reverse().map(function (item, idx) {
        var id = item.ID || item.id || ('exp_' + idx);
        var date = formatDate(item['Дата']);
        var sum = formatRub(item['Сумма'] || 0);
        var title = item['Название / Где'] || 'Расход';
        var cat = item['Категория'] || 'Прочее';
        var wallet = item['Кошелек / Карта'] || '';
        return [
          '<div class="expense-cat-card pink" style="margin-bottom: 12px;" data-id="' + id + '">',
          '  <div class="cat-card-header">',
          '    <div class="cat-title-left">',
          '      <div class="cat-badge-icon">₽</div>',
          '      <span class="cat-name">' + escapeHtml(title) + '</span>',
          '    </div>',
          '    <button class="item-del-btn" title="Удалить" onclick="window.handleDeleteRow(event, \'Расходы\', \'' + id + '\', \'' + escapeHtml(title) + '\')"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>',
          '  </div>',
          '  <div class="cat-items-list">',
          '    <div class="expense-paper-slip">',
          '      <div class="expense-item-left">',
          '        <div>',
          '          <span class="expense-item-name">' + escapeHtml(cat) + (wallet ? ' • ' + escapeHtml(wallet) : '') + '</span>',
          '          <span class="expense-item-sub">' + escapeHtml(date) + '</span>',
          '        </div>',
          '      </div>',
          '      <span class="expense-item-sum">' + sum + '</span>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('');
      }).join('');
    }
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

  // --- МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ЗАПИСЕЙ (+) ---
  function injectAddModal() {
    if (document.getElementById('mytables-add-modal')) return;

    var modal = document.createElement('div');
    modal.id = 'mytables-add-modal';
    modal.className = 'mytables-modal-backdrop';
    modal.innerHTML = [
      '<div class="mytables-paper-modal" style="max-width: 440px; text-align: left;">',
      '  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">',
      '    <div style="font-size: 18px; font-weight: 900; color: #2F261D;" id="add-modal-title">Новая запись</div>',
      '    <button type="button" id="add-modal-close" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #726453;">✕</button>',
      '  </div>',
      '  <form id="add-modal-form" onsubmit="return false;">',
      '    <input type="hidden" id="add-modal-type" value="income">',
      '    <div style="display: flex; flex-direction: column; gap: 12px;">',
      '      <div>',
      '        <label style="font-size: 11px; font-weight: 800; color: #5A4E40; display: block; margin-bottom: 4px;" id="add-field-1-label">Клиент / Название</label>',
      '        <input type="text" id="add-field-1" class="auth-email-input" style="margin-bottom: 0;" required>',
      '      </div>',
      '      <div>',
      '        <label style="font-size: 11px; font-weight: 800; color: #5A4E40; display: block; margin-bottom: 4px;" id="add-field-2-label">Проект / Описание</label>',
      '        <input type="text" id="add-field-2" class="auth-email-input" style="margin-bottom: 0;">',
      '      </div>',
      '      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">',
      '        <div>',
      '          <label style="font-size: 11px; font-weight: 800; color: #5A4E40; display: block; margin-bottom: 4px;">Сумма (₽)</label>',
      '          <input type="number" id="add-field-amount" class="auth-email-input" style="margin-bottom: 0;" required>',
      '        </div>',
      '        <div>',
      '          <label style="font-size: 11px; font-weight: 800; color: #5A4E40; display: block; margin-bottom: 4px;">Категория</label>',
      '          <input type="text" id="add-field-cat" class="auth-email-input" style="margin-bottom: 0;" value="Дизайн">',
      '        </div>',
      '      </div>',
      '      <div>',
      '        <label style="font-size: 11px; font-weight: 800; color: #5A4E40; display: block; margin-bottom: 4px;">Заметка</label>',
      '        <input type="text" id="add-field-note" class="auth-email-input" style="margin-bottom: 0;">',
      '      </div>',
      '      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px;">',
      '        <button type="button" class="modal-btn modal-btn-cancel" id="add-modal-cancel">Отмена</button>',
      '        <button type="submit" class="modal-btn" id="add-modal-submit" style="background: #5A4E40; color: #FAF4EB;">Сохранить в Google ✓</button>',
      '      </div>',
      '    </div>',
      '  </form>',
      '</div>'
    ].join('');

    document.body.appendChild(modal);

    // Добавляем стиль кнопок удаления
    var style = document.createElement('style');
    style.textContent = [
      '.item-del-btn {',
      '  background: rgba(0,0,0,0.05); border: none; border-radius: 6px;',
      '  width: 20px; height: 20px; display: inline-flex; align-items: center;',
      '  justify-content: center; cursor: pointer; color: inherit; opacity: 0.6;',
      '  transition: all 0.12s ease; margin-left: 4px;',
      '}',
      '.item-del-btn:hover { opacity: 1; background: #FCD6CF; color: #6E2F26; }'
    ].join('\n');
    document.head.appendChild(style);

    // Закрытие модалки
    var closeModal = function () { modal.classList.remove('active'); };
    document.getElementById('add-modal-close').addEventListener('click', closeModal);
    document.getElementById('add-modal-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    // Отправка формы добавления
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
      } else if (type === 'expense') {
        promise = MyTablesSync.saveExpense({
          title: f1,
          category: cat || 'Прочее',
          amount: amount,
          wallet: f2 || 'Т-Банк',
          note: note
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

      promise.then(function () {
        submitBtn.textContent = 'Сохранить в Google ✓';
        submitBtn.disabled = false;
        closeModal();
        loadLiveData(); // Перезагружаем живые данные
      }).catch(function (err) {
        submitBtn.textContent = 'Сохранить в Google ✓';
        submitBtn.disabled = false;
        alert('Ошибка при сохранении: ' + err.message);
      });
    });
  }

  // Открытие модалки добавления для соответствующего типа
  window.openAddModal = function (type) {
    var modal = document.getElementById('mytables-add-modal');
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
    } else if (type === 'expense') {
      title.textContent = 'Новый расход ♡';
      l1.textContent = 'Название / Где потрачено:';
      l2.textContent = 'Кошелек / Карта:';
      fCat.value = 'Продукты';
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

    var plusExpense = document.querySelectorAll('.btn-plus-expense');
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
