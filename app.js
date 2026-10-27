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

    // 7. Клик по плашке расхода открывает окно изменения суммы и тарифа
    document.addEventListener('click', function (e) {
      var slip = e.target.closest('.expense-paper-slip');
      if (!slip) return;
      if (e.target.closest('.status-pill')) return; // Клик по статусу обрабатывается отдельно
      var nameEl = slip.querySelector('.expense-item-name');
      var title = nameEl ? nameEl.textContent.trim() : '';
      if (typeof window.openEditExpenseModal === 'function') {
        window.openEditExpenseModal(title, slip);
      }
    });

    // 8. Инициализируем экран Доходов (Стейдж 3)
    if (window.MyTablesIncome && typeof window.MyTablesIncome.renderIncome === 'function') {
      window.MyTablesIncome.renderIncome();
    }
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

  // ==========================================================================
  // СТЕЙДЖ 3: МЕНЕДЖЕР «ДОХОДЫ ♡» (ПРОЕКТЫ И ПЛАТЕЖИ)
  // ==========================================================================
  var MyTablesIncome = (function () {
    // 1. Исходные проекты (пастельная палитра: мята, персик, лаванда, небо)
    var initialProjects = [
      { id: 'inc_proj_1', client: 'ООО Вектор', project: 'Разработка CRM-системы', totalCost: 120000, 'Полная_Стоимость': 120000, color: 'mint', isArchived: false, 'В_Архиве': false, createdAt: '2026-10-01' },
      { id: 'inc_proj_2', client: 'Мария Смирнова', project: 'Дизайн мобильного приложения', totalCost: 85000, 'Полная_Стоимость': 85000, color: 'peach', isArchived: false, 'В_Архиве': false, createdAt: '2026-10-01' },
      { id: 'inc_proj_3', client: 'Иван Петров', project: 'SMM и ведение канала', totalCost: 45000, 'Полная_Стоимость': 45000, color: 'lavender', isArchived: false, 'В_Архиве': false, createdAt: '2026-10-01' },
      { id: 'inc_proj_4', client: 'Елена Васильева', project: 'SEO и контентная оптимизация', totalCost: 60000, 'Полная_Стоимость': 60000, color: 'blue', isArchived: false, 'В_Архиве': false, createdAt: '2026-10-01' }
    ];

    // 2. Исходные платежи
    var initialPayments = [
      { id: 'inc_pay_1', projectId: 'inc_proj_1', date: '2026-10-12', 'Дата': '2026-10-12', amount: 60000, 'Сумма': 60000, note: 'Аванс 50%', 'Заметка': 'Аванс 50%' },
      { id: 'inc_pay_2', projectId: 'inc_proj_1', date: '2026-10-20', 'Дата': '2026-10-20', amount: 40000, 'Сумма': 40000, note: 'Второй платёж', 'Заметка': 'Второй платёж' },
      { id: 'inc_pay_3', projectId: 'inc_proj_2', date: '2026-10-05', 'Дата': '2026-10-05', amount: 45000, 'Сумма': 45000, note: 'Аванс', 'Заметка': 'Аванс' },
      { id: 'inc_pay_4', projectId: 'inc_proj_2', date: '2026-10-18', 'Дата': '2026-10-18', amount: 40000, 'Сумма': 40000, note: 'Окончательный расчёт', 'Заметка': 'Окончательный расчёт' },
      { id: 'inc_pay_5', projectId: 'inc_proj_3', date: '2026-10-01', 'Дата': '2026-10-01', amount: 45000, 'Сумма': 45000, note: 'Оклад за октябрь', 'Заметка': 'Оклад за октябрь' }
    ];

    var storageKeyProjects = 'mytables_income_projects_v3';
    var storageKeyPayments = 'mytables_income_payments_v3';

    function loadProjects() {
      if (typeof localStorage !== 'undefined') {
        try {
          var saved = localStorage.getItem(storageKeyProjects);
          if (saved) return JSON.parse(saved);
        } catch (e) {}
      }
      return initialProjects.slice();
    }

    function loadPayments() {
      if (typeof localStorage !== 'undefined') {
        try {
          var saved = localStorage.getItem(storageKeyPayments);
          if (saved) return JSON.parse(saved);
        } catch (e) {}
      }
      return initialPayments.slice();
    }

    var projects = loadProjects();
    var payments = loadPayments();

    function persist() {
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(storageKeyProjects, JSON.stringify(projects));
          localStorage.setItem(storageKeyPayments, JSON.stringify(payments));
        } catch (e) {}
      }
    }

    // Валидация создания проекта
    function validateProject(client, project, totalCost, color) {
      if (!client || !String(client).trim()) {
        return { valid: false, error: 'Укажите клиента' };
      }
      var cost = Number(totalCost);
      if (isNaN(cost) || cost <= 0) {
        return { valid: false, error: 'Полная стоимость проекта должна быть больше нуля' };
      }
      return {
        valid: true,
        client: String(client).trim(),
        project: String(project || 'Услуга').trim(),
        totalCost: cost,
        color: color || 'mint'
      };
    }

    // Валидация внесения/изменения платежа
    function validatePayment(amount, date, note) {
      var sum = Number(amount);
      if (isNaN(sum) || sum <= 0) {
        return { valid: false, error: 'Сумма платежа должна быть больше нуля' };
      }
      var d = date ? String(date).trim() : new Date().toISOString().slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        return { valid: false, error: 'Укажите дату в формате ГГГГ-ММ-ДД' };
      }
      return {
        valid: true,
        amount: sum,
        date: d,
        note: String(note || '').trim()
      };
    }

    // Добавление проекта со строгими полями
    function addProject(data) {
      var val = validateProject(data.client, data.project, data.totalCost, data.color);
      if (!val.valid) throw new Error(val.error);
      var newProj = {
        id: 'inc_proj_' + Date.now(),
        client: val.client,
        project: val.project,
        totalCost: val.totalCost,
        'Полная_Стоимость': val.totalCost,
        color: val.color,
        isArchived: false,
        'В_Архиве': false,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      projects.push(newProj);
      persist();
      renderIncome();
      return newProj;
    }

    // Изменение договорной стоимости проекта
    function updateProjectCost(projectId, newCost) {
      var cost = Number(newCost);
      if (isNaN(cost) || cost <= 0) throw new Error('Стоимость должна быть больше нуля');
      var proj = projects.find(function (p) { return p.id === projectId; });
      if (proj) {
        proj.totalCost = cost;
        proj['Полная_Стоимость'] = cost;
        persist();
        renderIncome();
      }
    }

    // Архивация проекта (скрывается с экрана, платежи сохраняются)
    function archiveProject(projectId) {
      var proj = projects.find(function (p) { return p.id === projectId; });
      if (proj) {
        proj.isArchived = true;
        proj['В_Архиве'] = true;
        persist();
        renderIncome();
      }
    }

    // Добавление платежа
    function addPayment(projectId, payData) {
      var val = validatePayment(payData.amount, payData.date, payData.note);
      if (!val.valid) throw new Error(val.error);
      var newPay = {
        id: 'inc_pay_' + Date.now(),
        projectId: projectId,
        date: val.date,
        'Дата': val.date,
        amount: val.amount,
        'Сумма': val.amount,
        note: val.note,
        'Заметка': val.note
      };
      payments.push(newPay);
      persist();
      syncToMainScreen();
      renderIncome();
      return newPay;
    }

    // Редактирование платежа
    function updatePayment(paymentId, payData) {
      var val = validatePayment(payData.amount, payData.date, payData.note);
      if (!val.valid) throw new Error(val.error);
      var pay = payments.find(function (p) { return p.id === paymentId; });
      if (pay) {
        pay.amount = val.amount;
        pay['Сумма'] = val.amount;
        pay.date = val.date;
        pay['Дата'] = val.date;
        pay.note = val.note;
        pay['Заметка'] = val.note;
        persist();
        syncToMainScreen();
        renderIncome();
      }
    }

    // Удаление платежа
    function deletePayment(paymentId) {
      var idx = payments.findIndex(function (p) { return p.id === paymentId; });
      if (idx !== -1) {
        payments.splice(idx, 1);
        persist();
        syncToMainScreen();
        renderIncome();
      }
    }

    // Реактивная связь с Главным экраном
    function syncToMainScreen() {
      var flatPayments = payments.map(function (p) {
        var proj = projects.find(function (pr) { return pr.id === p.projectId; });
        return {
          ID: p.id,
          id: p.id,
          'Дата': p.date,
          date: p.date,
          'Сумма': p.amount,
          amount: p.amount,
          'Клиент / Источник': proj ? proj.client : '',
          'Проект / Услуга': proj ? proj.project : '',
          'Заметка': p.note
        };
      });

      if (window.MyTablesCalendar) {
        if (!window.MyTablesCalendar.state) window.MyTablesCalendar.state = {};
        if (!window.MyTablesCalendar.state.data) window.MyTablesCalendar.state.data = {};
        window.MyTablesCalendar.state.data.income = flatPayments;
        if (typeof window.MyTablesCalendar.updateSummaryCards === 'function') {
          window.MyTablesCalendar.updateSummaryCards();
        }
      }

      var ym = (window.MyTablesCalendar && typeof window.MyTablesCalendar.getYearMonth === 'function')
        ? window.MyTablesCalendar.getYearMonth()
        : new Date().toISOString().slice(0, 7);

      var monthIncomeTotal = payments.reduce(function (sum, pay) {
        if (String(pay.date || '').indexOf(ym) === 0) {
          return sum + Number(pay.amount || 0);
        }
        return sum;
      }, 0);

      var mobIncomeSumEl = document.getElementById('mob-income-sum');
      if (mobIncomeSumEl) {
        mobIncomeSumEl.textContent = formatRub(monthIncomeTotal);
      }

      var deskMonthBadge = document.getElementById('desk-income-month-badge');
      if (deskMonthBadge) {
        deskMonthBadge.textContent = formatRub(monthIncomeTotal) + ' в ' + getMonthNameRu(ym);
      }

      var mobMonthBadge = document.getElementById('mob-income-month-badge');
      if (mobMonthBadge) {
        mobMonthBadge.textContent = formatRub(monthIncomeTotal);
      }

      var deskIncomeItems = document.getElementById('desk-income-items');
      if (deskIncomeItems && flatPayments.length > 0) {
        var recent = flatPayments.slice(-4).reverse();
        deskIncomeItems.innerHTML = recent.map(function (item, idx) {
          var title = item['Проект / Услуга'] || item['Клиент / Источник'] || 'Доход';
          var sum = formatRub(item['Сумма'] || 0);
          var date = formatDayMonth(item['Дата']);
          var dotColor = PALETTE_COLORS[idx % PALETTE_COLORS.length];
          return [
            '<div class="sub-item-income" onclick="switchAppTab(\'income\')" style="cursor: pointer;">',
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
    }

    function getMonthNameRu(ym) {
      var months = ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'];
      var parts = String(ym || '').split('-');
      var idx = (parseInt(parts[1], 10) || 1) - 1;
      return months[idx] || 'этом месяце';
    }

    function formatDayMonth(dateStr) {
      if (!dateStr) return '';
      var monthsShort = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
      var parts = String(dateStr).split('-');
      if (parts.length === 3) {
        var day = parts[2];
        var mIdx = (parseInt(parts[1], 10) || 1) - 1;
        return day + ' ' + (monthsShort[mIdx] || '');
      }
      return dateStr;
    }

    var CARD_COLOR_CLASSES = {
      mint: 'project-card mint',
      peach: 'project-card peach',
      lavender: 'project-card lavender',
      blue: 'project-card blue',
      cream: 'project-card cream'
    };

    function renderProjectCard(p) {
      var projectPayments = payments.filter(function (pay) { return pay.projectId === p.id; });
      var cardClass = CARD_COLOR_CLASSES[p.color] || 'project-card mint';

      var paymentsHtml = '';
      if (projectPayments.length > 0) {
        paymentsHtml = projectPayments.map(function (pay) {
          return [
            '<div class="payment-slip" onclick="window.MyTablesIncome.openEditPaymentModal(\'' + pay.id + '\')">',
            '  <div class="slip-data-col">',
            '    <span class="slip-sum">' + formatRub(pay.amount) + ' ₽</span>',
            '    <span class="slip-date">' + formatDayMonth(pay.date) + '</span>',
            '  </div>',
            '  <button class="btn-slip-plus" onclick="event.stopPropagation(); window.MyTablesIncome.openAddPaymentModal(\'' + p.id + '\')" title="Внести платёж">+</button>',
            '</div>'
          ].join('');
        }).join('');
      } else {
        paymentsHtml = [
          '<div class="payment-slip" onclick="window.MyTablesIncome.openAddPaymentModal(\'' + p.id + '\')">',
          '  <div class="slip-data-col">',
          '    <span class="slip-empty-text">Нет платежей</span>',
          '    <span class="slip-date">Нажмите, чтобы внести</span>',
          '  </div>',
          '  <button class="btn-slip-plus" onclick="event.stopPropagation(); window.MyTablesIncome.openAddPaymentModal(\'' + p.id + '\')" title="Внести платёж">+</button>',
          '</div>'
        ].join('');
      }

      return [
        '<div class="' + cardClass + '" data-project-id="' + p.id + '">',
        '  <div class="project-card-header">',
        '    <div class="project-title-group">',
        '      <span class="project-client-name">' + escapeHtml(p.client) + '</span>',
        '      <span class="project-service-name">' + escapeHtml(p.project) + '</span>',
        '    </div>',
        '    <div class="project-header-right">',
        '      <div class="project-total-pill" onclick="window.MyTablesIncome.openEditCostModal(\'' + p.id + '\')" title="Изменить стоимость">',
        '        <span class="project-total-val">' + formatRub(p.totalCost) + ' ₽</span>',
        '        <button class="edit-pencil-btn" title="Редактировать сумму">✎</button>',
        '      </div>',
        '      <button class="btn-archive-project" onclick="window.MyTablesIncome.openArchiveModal(\'' + p.id + '\')" title="В архив">',
        '        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
        '          <path d="M3 6h18"/>',
        '          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>',
        '          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
        '          <line x1="10" y1="11" x2="10" y2="17"/>',
        '          <line x1="14" y1="11" x2="14" y2="17"/>',
        '        </svg>',
        '      </button>',
        '    </div>',
        '  </div>',
        '  <div class="payments-section">',
        '    <div class="payments-section-header">',
        '      <span class="payments-section-title">Внесённые оплаты (' + projectPayments.length + ')</span>',
        '    </div>',
        '    <div class="payments-list">',
        paymentsHtml,
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
    }

    function renderIncome() {
      if (typeof document === 'undefined') return;

      var activeProjects = projects.filter(function (p) { return !p.isArchived && !p['В_Архиве']; });
      var cardsHtml = activeProjects.map(renderProjectCard).join('');

      var deskContainer = document.getElementById('desk-income-cards-grid');
      if (deskContainer) {
        deskContainer.innerHTML = cardsHtml;
      }

      var mobContainer = document.getElementById('mob-income-projects-scroll');
      if (mobContainer) {
        mobContainer.innerHTML = cardsHtml;
      }

      syncToMainScreen();
    }

    function ensureOverlay() {
      var overlay = document.getElementById('mytables-income-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'mytables-income-overlay';
        overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(45, 35, 25, 0.45); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 1000; padding: 16px; box-sizing: border-box;';
        overlay.onclick = function (e) {
          if (e.target.id === 'mytables-income-overlay') closeIncomeModal();
        };
        document.body.appendChild(overlay);
      }
      return overlay;
    }

    function closeIncomeModal() {
      var overlay = document.getElementById('mytables-income-overlay');
      if (overlay) {
        overlay.style.display = 'none';
        overlay.innerHTML = '';
      }
    }

    // 1. Модалка добавления нового проекта
    function openAddProjectModal() {
      var overlay = ensureOverlay();
      var existingClients = Array.from(new Set(projects.map(function (p) { return p.client; })));
      var optionsHtml = existingClients.map(function (c) {
        return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>';
      }).join('');
      optionsHtml += '<option value="__new__">+ Ввести нового клиента...</option>';

      var colors = [
        { name: 'mint', hex: '#C8E2D2' },
        { name: 'peach', hex: '#FCD6CF' },
        { name: 'lavender', hex: '#DBCCE9' },
        { name: 'blue', hex: '#D3E7F8' },
        { name: 'cream', hex: '#FDF1CC' }
      ];

      var selectedColor = 'mint';

      overlay.innerHTML = [
        '<div class="golden-modal" style="max-width: 440px; width: 100%;">',
        '  <div class="golden-modal-header">',
        '    <span class="golden-modal-title"><span style="color:#1E3F30;">+</span> Новый проект</span>',
        '    <button type="button" class="golden-modal-close" onclick="window.MyTablesIncome.closeModal()">✕</button>',
        '  </div>',
        '  <div class="golden-plaque">',
        '    <div class="golden-field-group">',
        '      <label class="golden-field-label">Клиент</label>',
        '      <select id="inc-modal-client-select" class="golden-field-select">',
        optionsHtml,
        '      </select>',
        '      <input type="text" id="inc-modal-client" class="golden-field-input inc-proj-client" placeholder="Имя нового клиента" style="display: none; margin-top: 6px;">',
        '    </div>',
        '    <div class="golden-field-group">',
        '      <label class="golden-field-label">Название проекта / услуги</label>',
        '      <input type="text" id="inc-modal-title" class="golden-field-input inc-proj-title" placeholder="Например: Разработка CRM, Дизайн">',
        '    </div>',
        '    <div class="golden-field-group">',
        '      <label class="golden-field-label">Полная стоимость проекта (₽)</label>',
        '      <input type="number" id="inc-modal-cost" class="golden-field-input inc-proj-cost" placeholder="100 000" min="1">',
        '      <span class="golden-field-hint">Фиксированная сумма по договору</span>',
        '    </div>',
        '    <div class="golden-field-group">',
        '      <label class="golden-field-label">Цвет карточки</label>',
        '      <div class="golden-palette-row" id="inc-proj-palette">',
        colors.map(function (c, idx) {
          return '<button type="button" class="palette-circle ' + (idx === 0 ? 'selected' : '') + '" data-color="' + c.name + '" style="background:' + c.hex + ';"></button>';
        }).join(''),
        '      </div>',
        '      <input type="hidden" id="inc-proj-color" class="inc-proj-color" value="mint">',
        '    </div>',
        '  </div>',
        '  <div class="golden-actions-row">',
        '    <button type="button" class="btn-action-modal cancel" onclick="window.MyTablesIncome.closeModal()">Отмена</button>',
        '    <button type="button" class="btn-action-modal save" id="inc-modal-save-proj">Сохранить проект</button>',
        '  </div>',
        '</div>'
      ].join('');

      var select = document.getElementById('inc-modal-client-select');
      var clientInput = document.getElementById('inc-modal-client');
      select.onchange = function () {
        if (select.value === '__new__') {
          clientInput.style.display = 'block';
          clientInput.focus();
        } else {
          clientInput.style.display = 'none';
        }
      };

      var paletteCircles = overlay.querySelectorAll('.palette-circle');
      paletteCircles.forEach(function (btn) {
        btn.onclick = function () {
          paletteCircles.forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          selectedColor = btn.getAttribute('data-color');
          document.getElementById('inc-proj-color').value = selectedColor;
        };
      });

      document.getElementById('inc-modal-save-proj').onclick = function () {
        var client = select.value === '__new__' ? clientInput.value : select.value;
        var title = document.getElementById('inc-modal-title').value;
        var cost = document.getElementById('inc-modal-cost').value;
        var color = document.getElementById('inc-proj-color').value || 'mint';

        try {
          addProject({ client: client, project: title, totalCost: cost, color: color });
          closeIncomeModal();
        } catch (err) {
          alert(err.message);
        }
      };

      overlay.style.display = 'flex';
    }

    // 2. Модалка добавления платежа
    function openAddPaymentModal(projectId) {
      var proj = projects.find(function (p) { return p.id === projectId; });
      var clientName = proj ? proj.client : 'Клиент';
      var overlay = ensureOverlay();
      var today = new Date().toISOString().slice(0, 10);

      overlay.innerHTML = [
        '<div class="golden-modal" style="max-width: 440px; width: 100%;">',
        '  <div class="golden-modal-header">',
        '    <span class="golden-modal-title"><span style="color:#1E3F30;">+</span> Внести платёж • ' + escapeHtml(clientName) + '</span>',
        '    <button type="button" class="golden-modal-close" onclick="window.MyTablesIncome.closeModal()">✕</button>',
        '  </div>',
        '  <div class="golden-plaque">',
        '    <div class="golden-field-group">',
        '      <label class="golden-field-label">Сумма фактически внесённой оплаты (₽)</label>',
        '      <input type="number" id="inc-pay-amount" class="golden-field-input inc-pay-amount" placeholder="40 000" min="1" required>',
        '    </div>',
        '    <div class="golden-field-group">',
        '      <label class="golden-field-label">Дата получения денег</label>',
        '      <input type="date" id="inc-pay-date" class="golden-field-input inc-pay-date" value="' + today + '" required>',
        '    </div>',
        '    <div class="golden-field-group">',
        '      <label class="golden-field-label">Заметка / За что платёж</label>',
        '      <input type="text" id="inc-pay-note" class="golden-field-input inc-pay-note" placeholder="Например: Аванс 50%, Оклад за октябрь">',
        '      <span class="golden-field-hint">Отображается при редактировании</span>',
        '    </div>',
        '  </div>',
        '  <div class="golden-actions-row">',
        '    <button type="button" class="btn-action-modal cancel" onclick="window.MyTablesIncome.closeModal()">Отмена</button>',
        '    <button type="button" class="btn-action-modal save" id="inc-pay-save-btn">Сохранить платёж</button>',
        '  </div>',
        '</div>'
      ].join('');

      document.getElementById('inc-pay-save-btn').onclick = function () {
        var amount = document.getElementById('inc-pay-amount').value;
        var date = document.getElementById('inc-pay-date').value;
        var note = document.getElementById('inc-pay-note').value;

        try {
          addPayment(projectId, { amount: amount, date: date, note: note });
          closeIncomeModal();
        } catch (err) {
          alert(err.message);
        }
      };

      overlay.style.display = 'flex';
      setTimeout(function () {
        var inp = document.getElementById('inc-pay-amount');
        if (inp) inp.focus();
      }, 50);
    }

    // 3. Модалка редактирования и удаления платежа (3 равные кнопки, [ Удалить ] коралловая)
    function openEditPaymentModal(paymentId) {
      var pay = payments.find(function (p) { return p.id === paymentId; });
      if (!pay) return;
      var proj = projects.find(function (p) { return p.id === pay.projectId; });
      var clientName = proj ? proj.client : 'Клиент';
      var overlay = ensureOverlay();

      overlay.innerHTML = [
        '<div class="golden-modal" style="max-width: 440px; width: 100%;">',
        '  <div class="golden-modal-header">',
        '    <span class="golden-modal-title"><span>✎</span> Изменить платёж • ' + escapeHtml(clientName) + '</span>',
        '    <button type="button" class="golden-modal-close" onclick="window.MyTablesIncome.closeModal()">✕</button>',
        '  </div>',
        '  <div class="golden-plaque">',
        '    <div class="golden-field-group">',
        '      <label class="golden-field-label">Сумма платежа (₽)</label>',
        '      <input type="number" id="inc-pay-amount" class="golden-field-input inc-pay-amount" value="' + pay.amount + '" min="1" required>',
        '    </div>',
        '    <div class="golden-field-group">',
        '      <label class="golden-field-label">Дата получения</label>',
        '      <input type="date" id="inc-pay-date" class="golden-field-input inc-pay-date" value="' + (pay.date || '') + '" required>',
        '    </div>',
        '    <div class="golden-field-group">',
        '      <label class="golden-field-label">Заметка / Назначение</label>',
        '      <input type="text" id="inc-pay-note" class="golden-field-input inc-pay-note" value="' + escapeHtml(pay.note || '') + '">',
        '    </div>',
        '  </div>',
        '  <div class="golden-actions-row">',
        '    <button type="button" class="btn-action-modal delete inc-btn-delete-pay" id="inc-btn-delete-pay" title="Удалить платёж">Удалить</button>',
        '    <button type="button" class="btn-action-modal cancel" onclick="window.MyTablesIncome.closeModal()">Отмена</button>',
        '    <button type="button" class="btn-action-modal save" id="inc-pay-update-btn">Сохранить</button>',
        '  </div>',
        '</div>'
      ].join('');

      document.getElementById('inc-btn-delete-pay').onclick = function () {
        deletePayment(paymentId);
        closeIncomeModal();
      };

      document.getElementById('inc-pay-update-btn').onclick = function () {
        var amount = document.getElementById('inc-pay-amount').value;
        var date = document.getElementById('inc-pay-date').value;
        var note = document.getElementById('inc-pay-note').value;

        try {
          updatePayment(paymentId, { amount: amount, date: date, note: note });
          closeIncomeModal();
        } catch (err) {
          alert(err.message);
        }
      };

      overlay.style.display = 'flex';
    }

    // 4. Модалка изменения договорной стоимости проекта
    function openEditCostModal(projectId) {
      var proj = projects.find(function (p) { return p.id === projectId; });
      if (!proj) return;
      var overlay = ensureOverlay();

      overlay.innerHTML = [
        '<div class="golden-modal" style="max-width: 440px; width: 100%;">',
        '  <div class="golden-modal-header">',
        '    <span class="golden-modal-title"><span>✎</span> Стоимость проекта • ' + escapeHtml(proj.client) + '</span>',
        '    <button type="button" class="golden-modal-close" onclick="window.MyTablesIncome.closeModal()">✕</button>',
        '  </div>',
        '  <div class="golden-plaque">',
        '    <div class="golden-field-group">',
        '      <label class="golden-field-label">Полная договорная стоимость (₽)</label>',
        '      <input type="number" id="inc-proj-cost" class="golden-field-input inc-proj-cost" value="' + proj.totalCost + '" min="1" required>',
        '      <span class="golden-field-hint">Сумма проекта фиксируется договором и не зависит от разбивки на частичные оплаты</span>',
        '    </div>',
        '  </div>',
        '  <div class="golden-actions-row">',
        '    <button type="button" class="btn-action-modal cancel" onclick="window.MyTablesIncome.closeModal()">Отмена</button>',
        '    <button type="button" class="btn-action-modal save" id="inc-proj-cost-save-btn">Сохранить</button>',
        '  </div>',
        '</div>'
      ].join('');

      document.getElementById('inc-proj-cost-save-btn').onclick = function () {
        var cost = document.getElementById('inc-proj-cost').value;
        try {
          updateProjectCost(projectId, cost);
          closeIncomeModal();
        } catch (err) {
          alert(err.message);
        }
      };

      overlay.style.display = 'flex';
      setTimeout(function () {
        var inp = document.getElementById('inc-proj-cost');
        if (inp) inp.focus();
      }, 50);
    }

    // 5. Модалка архивации проекта
    function openArchiveModal(projectId) {
      var proj = projects.find(function (p) { return p.id === projectId; });
      if (!proj) return;
      var overlay = ensureOverlay();

      overlay.innerHTML = [
        '<div class="golden-modal" style="max-width: 440px; width: 100%;">',
        '  <div class="golden-modal-header">',
        '    <span class="golden-modal-title">',
        '      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;">',
        '        <path d="M3 6h18"/>',
        '        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>',
        '        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
        '        <line x1="10" y1="11" x2="10" y2="17"/>',
        '        <line x1="14" y1="11" x2="14" y2="17"/>',
        '      </svg>',
        '      <span>Архивация проекта</span>',
        '    </span>',
        '    <button type="button" class="golden-modal-close" onclick="window.MyTablesIncome.closeModal()">✕</button>',
        '  </div>',
        '  <div class="golden-plaque">',
        '    <p style="font-size: 13.5px; font-weight: 700; color: #4D3118; line-height: 1.45; margin-bottom: 6px;">',
        '      Отправить проект <b>«' + escapeHtml(proj.client) + '»</b> в архив?',
        '    </p>',
        '    <p style="font-size: 11.5px; font-weight: 600; color: #726453; line-height: 1.4;">',
        '      Карточка скроется из активного экрана Доходов, а все внесённые платежи сохранятся в Google Таблицах для годовой отчётности.',
        '    </p>',
        '  </div>',
        '  <div class="golden-actions-row">',
        '    <button type="button" class="btn-action-modal cancel" onclick="window.MyTablesIncome.closeModal()">Отмена</button>',
        '    <button type="button" class="btn-action-modal delete" id="inc-proj-archive-btn">В архив</button>',
        '  </div>',
        '</div>'
      ].join('');

      document.getElementById('inc-proj-archive-btn').onclick = function () {
        archiveProject(projectId);
        closeIncomeModal();
      };

      overlay.style.display = 'flex';
    }

    return {
      getProjects: function () { return projects; },
      getPayments: function (projectId) {
        if (!projectId) return payments;
        return payments.filter(function (p) { return p.projectId === projectId; });
      },
      validateProject: validateProject,
      validatePayment: validatePayment,
      addProject: addProject,
      updateProjectCost: updateProjectCost,
      archiveProject: archiveProject,
      addPayment: addPayment,
      updatePayment: updatePayment,
      deletePayment: deletePayment,
      renderIncome: renderIncome,
      syncToMainScreen: syncToMainScreen,
      openAddProjectModal: openAddProjectModal,
      openAddPaymentModal: openAddPaymentModal,
      openEditPaymentModal: openEditPaymentModal,
      openEditCostModal: openEditCostModal,
      openArchiveModal: openArchiveModal,
      closeModal: closeIncomeModal
    };
  })();

  window.MyTablesIncome = MyTablesIncome;

  // --- ОБНОВЛЕНИЕ ЭКРАНА ДОХОДОВ ---
  function updateIncomeScreen(data) {
    if (window.MyTablesIncome && typeof window.MyTablesIncome.renderIncome === 'function') {
      window.MyTablesIncome.renderIncome();
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
        '        <div id="exp-color-dots-row" style="display: flex; gap: 12px; align-items: center;">',
        '          <button type="button" class="exp-color-opt active" data-color="#D3E7F8" style="width: 32px; height: 32px; border-radius: 50%; background: #D3E7F8; border: none; cursor: pointer; box-shadow: 2px 4px 8px rgba(120, 90, 60, 0.28); transform: scale(1.12); transition: all 0.15s ease; outline: none; display: flex; align-items: center; justify-content: center; padding: 0;"><svg class="exp-check-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3D2B1F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>',
        '          <button type="button" class="exp-color-opt" data-color="#C8E2D2" style="width: 32px; height: 32px; border-radius: 50%; background: #C8E2D2; border: none; cursor: pointer; box-shadow: 1px 2px 4px rgba(120, 90, 60, 0.15); transition: all 0.15s ease; outline: none; display: flex; align-items: center; justify-content: center; padding: 0;"></button>',
        '          <button type="button" class="exp-color-opt" data-color="#FCE8D5" style="width: 32px; height: 32px; border-radius: 50%; background: #FCE8D5; border: none; cursor: pointer; box-shadow: 1px 2px 4px rgba(120, 90, 60, 0.15); transition: all 0.15s ease; outline: none; display: flex; align-items: center; justify-content: center; padding: 0;"></button>',
        '          <button type="button" class="exp-color-opt" data-color="#FCD6CF" style="width: 32px; height: 32px; border-radius: 50%; background: #FCD6CF; border: none; cursor: pointer; box-shadow: 1px 2px 4px rgba(120, 90, 60, 0.15); transition: all 0.15s ease; outline: none; display: flex; align-items: center; justify-content: center; padding: 0;"></button>',
        '          <button type="button" class="exp-color-opt" data-color="#DBCCE9" style="width: 32px; height: 32px; border-radius: 50%; background: #DBCCE9; border: none; cursor: pointer; box-shadow: 1px 2px 4px rgba(120, 90, 60, 0.15); transition: all 0.15s ease; outline: none; display: flex; align-items: center; justify-content: center; padding: 0;"></button>',
        '          <button type="button" class="exp-color-opt" data-color="#FDF1CC" style="width: 32px; height: 32px; border-radius: 50%; background: #FDF1CC; border: none; cursor: pointer; box-shadow: 1px 2px 4px rgba(120, 90, 60, 0.15); transition: all 0.15s ease; outline: none; display: flex; align-items: center; justify-content: center; padding: 0;"></button>',
        '        </div>',
        '      </div>',
        '    </div>',
        '    <div style="display: flex; gap: 10px; align-items: center; justify-content: stretch;">',
        '      <button type="button" id="exp-modal-archive" style="display: none; flex: 1; min-height: 44px; background: #FCD6CF; color: #58241B; border: none; outline: none; border-radius: 14px; padding: 12px 10px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 2.5px 4px 10px rgba(180, 100, 90, 0.22), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 1px 1px 0 rgba(255, 255, 255, 0.95); transition: all 0.15s ease; white-space: nowrap; display: inline-flex; align-items: center; justify-content: center; text-align: center;">Удалить</button>',
        '      <button type="button" id="exp-modal-cancel" style="flex: 1; min-height: 44px; background: #FDF1CC; color: #5B481D; border: none; outline: none; border-radius: 14px; padding: 12px 10px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 2.5px 4px 10px rgba(160, 125, 85, 0.22), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 1px 1px 0 rgba(255, 255, 255, 0.95); transition: all 0.15s ease; display: inline-flex; align-items: center; justify-content: center; text-align: center;">Отмена</button>',
        '      <button type="submit" id="exp-modal-submit" style="flex: 1; min-height: 44px; background: #C8E2D2; color: #1E3F30; border: none; outline: none; border-radius: 14px; padding: 12px 10px; font-size: 13px; font-weight: 900; cursor: pointer; box-shadow: 2.5px 4px 10px rgba(70, 130, 95, 0.25), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 1px 1px 0 rgba(255, 255, 255, 0.95); transition: all 0.15s ease; display: inline-flex; align-items: center; justify-content: center; text-align: center;">Сохранить</button>',
        '    </div>',
        '  </form>',
        '</div>'
      ].join('');
      document.body.appendChild(expModal);

      var selectedExpenseColor = '#D3E7F8';
      var checkSvg = '<svg class="exp-check-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3D2B1F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      var colorBtns = expModal.querySelectorAll('.exp-color-opt');

      function selectColorDot(color) {
        selectedExpenseColor = color || '#D3E7F8';
        for (var i = 0; i < colorBtns.length; i++) {
          var btnColor = colorBtns[i].getAttribute('data-color');
          if (btnColor && btnColor.toLowerCase() === selectedExpenseColor.toLowerCase()) {
            colorBtns[i].classList.add('active');
            colorBtns[i].innerHTML = checkSvg;
            colorBtns[i].style.boxShadow = '2px 3.5px 7px rgba(120, 90, 60, 0.22), -1.5px -1.5px 3.5px rgba(255, 255, 255, 0.95), inset 1px 1px 0 rgba(255, 255, 255, 0.9)';
            colorBtns[i].style.transform = 'scale(1.12)';
          } else {
            colorBtns[i].classList.remove('active');
            colorBtns[i].innerHTML = '';
            colorBtns[i].style.boxShadow = '1.5px 2.5px 5px rgba(120, 90, 60, 0.14), -1px -1px 2.5px rgba(255, 255, 255, 0.9)';
            colorBtns[i].style.transform = 'scale(1)';
          }
        }
      }

      for (var ci = 0; ci < colorBtns.length; ci++) {
        colorBtns[ci].addEventListener('click', function () {
          selectColorDot(this.getAttribute('data-color'));
        });
      }

      var currentEditingSlip = null;
      var currentEditingPayment = null;

      window.openAddExpenseModal = function () {
        currentEditingSlip = null;
        currentEditingPayment = null;
        var modalTitle = expModal.querySelector('.mytables-paper-modal > div:first-child span:first-child');
        if (modalTitle) modalTitle.textContent = '+ Новый расход';
        document.getElementById('exp-in-title').value = '';
        document.getElementById('exp-in-day').value = new Date().getDate();
        document.getElementById('exp-in-amount').value = '';
        document.getElementById('exp-in-url').value = '';
        var archBtn = document.getElementById('exp-modal-archive');
        if (archBtn) archBtn.style.display = 'none';
        selectColorDot('#D3E7F8');
        expModal.classList.add('active');
        document.getElementById('exp-in-title').focus();
      };

      window.openEditExpenseModal = function (title, slipEl) {
        currentEditingSlip = slipEl;
        var p = null;
        if (window.MyTablesCalendar && window.MyTablesCalendar.state && window.MyTablesCalendar.state.payments) {
          p = window.MyTablesCalendar.state.payments.find(function (item) {
            return item.title && (item.title.toLowerCase() === title.toLowerCase() || item.title.toLowerCase().indexOf(title.toLowerCase()) !== -1 || title.toLowerCase().indexOf(item.title.toLowerCase()) !== -1);
          });
        }
        currentEditingPayment = p;

        var name = title;
        var day = 15;
        var amount = 1500;
        var url = '';
        var color = '#D3E7F8';

        if (p) {
          name = p.title || title;
          day = p.dayOfMonth || 15;
          amount = p.currentRate || p.amount || 1500;
          url = p.shopUrl || '';
          color = p.color || '#D3E7F8';
        } else if (slipEl) {
          var priceEl = slipEl.querySelector('.expense-item-price');
          if (priceEl) amount = Number(priceEl.textContent.replace(/[^\d]/g, '')) || 1500;
          var dateEl = slipEl.querySelector('.expense-item-date');
          if (dateEl) day = Number(dateEl.textContent.replace(/[^\d]/g, '')) || 15;
        }

        var modalTitle = expModal.querySelector('.mytables-paper-modal > div:first-child span:first-child');
        if (modalTitle) modalTitle.textContent = '✎ Изменить платеж';

        document.getElementById('exp-in-title').value = name;
        document.getElementById('exp-in-day').value = day;
        document.getElementById('exp-in-amount').value = amount;
        document.getElementById('exp-in-url').value = url;

        selectColorDot(color);

        var archBtn = document.getElementById('exp-modal-archive');
        if (archBtn) archBtn.style.display = 'inline-flex';

        expModal.classList.add('active');
        document.getElementById('exp-in-amount').focus();
      };

      var closeExpModal = function () {
        currentEditingSlip = null;
        currentEditingPayment = null;
        expModal.classList.remove('active');
      };
      document.getElementById('exp-modal-close').addEventListener('click', closeExpModal);
      document.getElementById('exp-modal-cancel').addEventListener('click', closeExpModal);
      expModal.addEventListener('click', function (e) {
        if (e.target === expModal) closeExpModal();
      });

      // Кнопка «Удалить»
      var archBtn = document.getElementById('exp-modal-archive');
      if (archBtn) {
        archBtn.addEventListener('click', function () {
          var titleToArchive = (document.getElementById('exp-in-title').value || '').trim();
          if (!confirm('Точно удалить платёж «' + titleToArchive + '»?')) {
            return;
          }
          var oldTitle = currentEditingPayment ? currentEditingPayment.title : titleToArchive;
          var allSlips = document.querySelectorAll('.expense-paper-slip');
          for (var si = 0; si < allSlips.length; si++) {
            var sName = allSlips[si].querySelector('.expense-item-name');
            if (sName && (sName.textContent.trim().toLowerCase() === oldTitle.toLowerCase() || sName.textContent.trim().toLowerCase() === titleToArchive.toLowerCase())) {
              allSlips[si].remove();
            }
          }
          if (currentEditingPayment) {
            currentEditingPayment.isArchived = true;
          }
          if (window.MyTablesCalendar && typeof window.MyTablesCalendar.updateSummaryCards === 'function') {
            window.MyTablesCalendar.updateSummaryCards();
          }
          if (window.MyTablesCalendar && typeof window.MyTablesCalendar.renderCalendar === 'function') {
            window.MyTablesCalendar.renderCalendar();
          }
          closeExpModal();
        });
      }

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

        // Если это РЕДАКТИРОВАНИЕ существующего платежа
        if (currentEditingSlip) {
          var oldTitle = currentEditingPayment ? currentEditingPayment.title : (currentEditingSlip.querySelector('.expense-item-name') ? currentEditingSlip.querySelector('.expense-item-name').textContent.trim() : title);
          var allSlips = document.querySelectorAll('.expense-paper-slip');
          for (var sIdx = 0; sIdx < allSlips.length; sIdx++) {
            var sName = allSlips[sIdx].querySelector('.expense-item-name');
            if (sName && (sName.textContent.trim().toLowerCase() === oldTitle.toLowerCase() || sName.textContent.trim().toLowerCase() === title.toLowerCase())) {
              sName.textContent = title;
              var sPrice = allSlips[sIdx].querySelector('.expense-item-price');
              if (sPrice) sPrice.textContent = formatRub(amount);
              var sDate = allSlips[sIdx].querySelector('.expense-item-date');
              if (sDate) sDate.textContent = '• ' + day + ' мар';
              var sLogo = allSlips[sIdx].querySelector('.service-logo-circle');
              if (sLogo && selectedExpenseColor) {
                sLogo.style.color = selectedExpenseColor;
              }
            }
          }
          if (currentEditingPayment) {
            currentEditingPayment.title = title;
            currentEditingPayment.currentRate = amount;
            currentEditingPayment.dayOfMonth = day;
            if (url) currentEditingPayment.shopUrl = url;
            currentEditingPayment.color = selectedExpenseColor;
          }
          if (window.MyTablesCalendar && typeof window.MyTablesCalendar.updateSummaryCards === 'function') {
            window.MyTablesCalendar.updateSummaryCards();
          }
          if (window.MyTablesCalendar && typeof window.MyTablesCalendar.renderCalendar === 'function') {
            window.MyTablesCalendar.renderCalendar();
          }
          submitBtn.textContent = 'Сохранено ✓';
          setTimeout(function () {
            submitBtn.textContent = 'Сохранить';
            submitBtn.disabled = false;
            closeExpModal();
          }, 300);
          return;
        }

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
    if (type === 'income') {
      if (window.MyTablesIncome && typeof window.MyTablesIncome.openAddProjectModal === 'function') {
        window.MyTablesIncome.openAddProjectModal();
        return;
      }
    }
    if (type === 'expense') {
      var expModal = document.getElementById('mytables-expense-modal');
      if (!expModal) {
        injectAddModal();
      }
      if (typeof window.openAddExpenseModal === 'function') {
        window.openAddExpenseModal();
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
