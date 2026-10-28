/**
 * ============================================================================
 * ПРОЕКТ «МОИ ТАБЛИЦЫ» — ИНТЕРФЕЙСНЫЙ МОДУЛЬ (app.js)
 * ============================================================================
 * Связывает экраны с модулем sync.js
 * Обеспечивает живое обновление данных, модальные окна добавления записей
 * и подтверждение удаления в единой эстетике «3D-Бумажечки».
 */

(function (root) {
  'use strict';
  // Очистка устаревших тестовых данных для старта чистой базы Ани
  if (typeof localStorage !== 'undefined') {
    if (localStorage.getItem('mytables_clean_slate_v5') !== 'true') {
      try {
        localStorage.removeItem('mytables_clients_v4');
        localStorage.removeItem('mytables_income_v3');
        localStorage.removeItem('mytables_expenses_v2');
        localStorage.removeItem('mytables_calendar_state');
        localStorage.removeItem('mytables_cached_data_v1');
        localStorage.setItem('mytables_clean_slate_v5', 'true');
      } catch (e) {}
    }
  }

  var window = root;

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
  if (typeof document !== 'undefined') {
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

      // 7. Инициализация MyTablesClients
      if (typeof MyTablesClients !== 'undefined' && MyTablesClients.init) {
        MyTablesClients.init();
      }

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
}

  // Загрузка живых данных и обновление текущего экрана
  function loadLiveData() {
    // 1. Быстро отображаем сохраненные данные из кэша (мгновенный отклик)
    if (typeof MyTablesSync !== 'undefined' && typeof MyTablesSync.getCachedData === 'function') {
      var cached = MyTablesSync.getCachedData();
      if (cached) {
        window.allData = cached;
        updateCurrentScreen(cached);
      }
    }

    // 2. Подгружаем актуальные данные из Google Таблиц
    MyTablesSync.getAllData().then(function (res) {
      if (res && res.data) {
        window.allData = res.data;
        updateCurrentScreen(res.data);
      }
    }).catch(function (err) {
      console.warn('Sync getAllData warning:', err);
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
    var path = (window.location && window.location.pathname ? window.location.pathname : '').toLowerCase();
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
    var clientsList = (data.clients || []).filter(function (item) {
      var str = (String(item.name || '') + ' ' + String(item['Имя клиента'] || '') + ' ' + String(item['Телефон'] || '') + ' ' + String(item['Проект'] || '')).toLowerCase();
      return str.indexOf('автотест') === -1 && str.indexOf('#error') === -1;
    });

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
    if (deskIncomeContainer) {
      if (incomeList.length > 0) {
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
      } else {
        deskIncomeContainer.innerHTML = '<div style="font-size: 11px; font-weight: 600; color: #4A6E5A; padding: 12px 8px; text-align: center; opacity: 0.85;">Пока нет записей ♡</div>';
      }
    }

        var deskExpenseContainer = document.getElementById('desk-expense-items');
    if (deskExpenseContainer) {
      if (expensesList.length > 0) {
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
      } else {
        deskExpenseContainer.innerHTML = '<div style="font-size: 11px; font-weight: 600; color: #8A4C42; padding: 12px 8px; text-align: center; opacity: 0.85;">Пока нет расходов ♡</div>';
      }
    }

        var deskClientsContainer = document.getElementById('desk-clients-items');
    if (deskClientsContainer) {
      if (clientsList.length > 0) {
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
      } else {
        deskClientsContainer.innerHTML = '<div style="font-size: 11px; font-weight: 600; color: #3A6488; padding: 12px 8px; text-align: center; opacity: 0.85;">Пока нет клиентов ♡</div>';
      }
    }
  }

  // ==========================================================================
  // СТЕЙДЖ 3: МЕНЕДЖЕР «ДОХОДЫ ♡» (ПРОЕКТЫ И ПЛАТЕЖИ)
  // ==========================================================================
  var MyTablesIncome = (function () {
    // 1. Исходные проекты (пастельная палитра: мята, персик, лаванда, небо)
    var initialProjects = [];

    // 2. Исходные платежи
    var initialPayments = [];

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
      if (deskIncomeItems) {
        if (flatPayments.length > 0) {
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
        } else {
          deskIncomeItems.innerHTML = '<div style="font-size: 11px; font-weight: 600; color: #4A6E5A; padding: 12px 8px; text-align: center; opacity: 0.85;">Пока нет записей ♡</div>';
        }
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
            '  <button class="btn-slip-plus btn-add-payment" onclick="event.stopPropagation(); window.MyTablesIncome.openAddPaymentModal(\'' + p.id + '\')" title="Внести платёж">+</button>',
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
          '  <button class="btn-slip-plus btn-add-payment" onclick="event.stopPropagation(); window.MyTablesIncome.openAddPaymentModal(\'' + p.id + '\')" title="Внести платёж">+</button>',
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
        '        <button class="edit-pencil-btn" onclick="event.stopPropagation(); window.MyTablesIncome.openEditCostModal(\'' + p.id + '\')" title="Редактировать сумму">✎</button>',
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
        '    <div class="payments-section-header" style="display: flex; justify-content: space-between; align-items: center;">',
        '      <span class="payments-section-title">Внесённые оплаты (' + projectPayments.length + ')</span>',
        '      <button class="cat-add-btn btn-add-payment" onclick="event.stopPropagation(); window.MyTablesIncome.openAddPaymentModal(\'' + p.id + '\')" title="Внести платёж" style="width: 24px; height: 24px; min-width: 24px; min-height: 24px; font-size: 14px; font-weight: 900; line-height: 1; padding: 0; display: inline-flex; align-items: center; justify-content: center; border: none; border-radius: 50%; cursor: pointer;">+</button>',
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
      var mobContainer = document.getElementById('mob-income-projects-scroll');

      if (activeProjects.length === 0) {
        var emptyHtml = [
          '<div style="grid-column: 1 / -1; width: 100%; background: #FAF2E7; border-radius: 20px; padding: 36px 20px; text-align: center; box-shadow: 2px 4px 12px rgba(140, 110, 80, 0.12), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95); margin: 12px 0;">',
          '  <div style="font-size: 26px; margin-bottom: 6px;">♡</div>',
          '  <div style="font-size: 14px; font-weight: 800; color: #4A3E31; margin-bottom: 4px;">Пока нет проектов</div>',
          '  <div style="font-size: 12px; font-weight: 600; color: #8C784C;">Нажмите «+ Добавить проект», чтобы внести первый заказ</div>',
          '</div>'
        ].join('');
        if (deskContainer) deskContainer.innerHTML = emptyHtml;
        if (mobContainer) mobContainer.innerHTML = emptyHtml;
        syncToMainScreen();
        return;
      }

      if (deskContainer) {
        deskContainer.innerHTML = cardsHtml;
      }
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
        overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(45, 35, 25, 0.45); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 10000; padding: 16px; box-sizing: border-box; pointer-events: none;';
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
        overlay.classList.remove('active');
        overlay.style.display = 'none';
        overlay.style.pointerEvents = 'none';
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

      overlay.classList.add('active');
      overlay.style.display = 'flex';
      overlay.style.pointerEvents = 'auto';
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

      overlay.classList.add('active');
      overlay.style.display = 'flex';
      overlay.style.pointerEvents = 'auto';
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

      overlay.classList.add('active');
      overlay.style.display = 'flex';
      overlay.style.pointerEvents = 'auto';
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

      overlay.classList.add('active');
      overlay.style.display = 'flex';
      overlay.style.pointerEvents = 'auto';
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

      overlay.classList.add('active');
      overlay.style.display = 'flex';
      overlay.style.pointerEvents = 'auto';
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
  
  // --- ОТРИСОВКА ПЛАТЕЖЕЙ В КАТЕГОРИЯХ ЭКРАНА РАСХОДОВ ---
  function renderExpensesCategories(expensesList) {
    if (typeof document === 'undefined') return;

    if (!expensesList || !Array.isArray(expensesList) || expensesList.length === 0) {
      if (window.MyTablesCalendar && window.MyTablesCalendar.state && Array.isArray(window.MyTablesCalendar.state.payments) && window.MyTablesCalendar.state.payments.length > 0) {
        expensesList = window.MyTablesCalendar.state.payments;
      } else if (window.allData && Array.isArray(window.allData.expenses) && window.allData.expenses.length > 0) {
        expensesList = window.allData.expenses;
      } else if (window.MyTablesSync && typeof window.MyTablesSync.getCachedData === 'function') {
        var cData = window.MyTablesSync.getCachedData();
        if (cData && Array.isArray(cData.expenses) && cData.expenses.length > 0) {
          expensesList = cData.expenses;
        }
      }
    }
    expensesList = expensesList || [];

    // Восстанавливаем сохраненные кастомные категории, если они еще не вставлены в DOM
    if (Array.isArray(customExpenseCategories) && customExpenseCategories.length > 0 && typeof spawnCategoryCard === 'function') {
      for (var k = 0; k < customExpenseCategories.length; k++) {
        var catObj = customExpenseCategories[k];
        var existingDesk = document.querySelector('#desk-view-expenses .expense-cat-card[data-category="' + catObj.id + '"]');
        if (!existingDesk) {
          spawnCategoryCard(catObj);
        }
      }
    }

    // Базовые категории
    var catBuckets = {
      ai: [],
      internet: [],
      vpn: []
    };
    var customBuckets = {};

    for (var i = 0; i < expensesList.length; i++) {
      var item = expensesList[i];
      if (item.isArchived) continue;
      var title = item.title || item['Название / Где'] || item['Название'] || 'Платёж';
      var cat = (item.category || item['Категория'] || '').toLowerCase();
      var tLower = title.toLowerCase();

      var bucket = 'other';
      if (cat === 'ai' || cat.indexOf('ии') !== -1 || cat.indexOf('ai') !== -1 || tLower.indexOf('gpt') !== -1 || tLower.indexOf('claude') !== -1 || tLower.indexOf('gemini') !== -1) {
        bucket = 'ai';
      } else if (cat === 'internet' || cat.indexOf('интернет') !== -1 || cat.indexOf('связь') !== -1 || tLower.indexOf('интернет') !== -1 || tLower.indexOf('телефон') !== -1) {
        bucket = 'internet';
      } else if (cat === 'vpn' || tLower.indexOf('vpn') !== -1) {
        bucket = 'vpn';
      } else if (item.category) {
        bucket = item.category;
      }

      if (catBuckets[bucket]) {
        catBuckets[bucket].push(item);
      } else {
        if (!customBuckets[bucket]) customBuckets[bucket] = [];
        customBuckets[bucket].push(item);
      }
    }

    function renderSlipHtml(p) {
      var title = p.title || p['Название / Где'] || p['Название'] || 'Платёж';
      var amount = Number(p.amount || p['Сумма'] || p.currentRate || 0);
      var day = p.day || p.dayOfMonth || p['День месяца'];
      if (!day) {
        var rawDate = String(p['Дата'] || p.date || '');
        if (rawDate) {
          if (rawDate.indexOf('T') !== -1) {
            var pd = new Date(rawDate);
            if (!isNaN(pd.getTime())) day = pd.getDate();
          }
          if (!day) {
            var m = rawDate.match(/(?:^\d{4}-\d{2}-|\.)(\d{1,2})/);
            if (m) day = parseInt(m[1], 10);
          }
        }
      }
      day = day || 1;
      var color = p.color || '#D3E7F8';
      var isPaid = p.isPaid === true || p.status === 'paid';
      var dayText = day ? ('• ' + day + ' число') : '';

      return [
        '<div class="expense-paper-slip" data-title="' + escapeHtml(title) + '" onclick="window.openEditExpenseModal ? window.openEditExpenseModal(\'' + escapeHtml(title) + '\', this) : null">',
        '  <div class="expense-item-left">',
        '    <div class="service-logo-circle" style="color: ' + color + ';">',
        '      <span style="font-weight:900; font-size:13px; color:#2F261D;">' + escapeHtml(title.charAt(0).toUpperCase()) + '</span>',
        '    </div>',
        '    <div class="expense-item-info">',
        '      <span class="expense-item-name">' + escapeHtml(title) + '</span>',
        '      <div class="expense-item-sub">',
        '        <span class="expense-item-price">' + formatRub(amount) + '</span>',
        '        <span class="expense-item-date">' + dayText + '</span>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="expense-item-right">',
        '    <button class="status-pill ' + (isPaid ? 'paid' : 'unpaid') + '" onclick="window.toggleExpenseItemStatus(event, this)"><span class="status-dot"></span> ' + (isPaid ? 'Оплачено' : 'Оплатить') + '</button>',
        '  </div>',
        '</div>'
      ].join('');
    }

    function updateCardList(cardEl, items) {
      if (!cardEl) return;
      var listEl = cardEl.querySelector('.cat-items-list');
      if (!listEl) return;

      if (!items || items.length === 0) {
        listEl.innerHTML = '<div class="cat-empty-prompt" style="padding: 12px 14px; text-align: center; color: #7A6E5F; font-size: 12px; font-weight: 700;">Пока нет платежей ♡</div>';
      } else {
        var html = '';
        for (var j = 0; j < items.length; j++) {
          html += renderSlipHtml(items[j]);
        }
        listEl.innerHTML = html;
      }
    }

    // 1. Обновляем базовые карточки десктопа и мобильного
    var baseCats = ['ai', 'internet', 'vpn'];
    for (var b = 0; b < baseCats.length; b++) {
      var cKey = baseCats[b];
      var deskCard = document.querySelector('#desk-view-expenses .expense-cat-card[data-category="' + cKey + '"]');
      var mobCard = document.querySelector('#mob-view-expenses .expense-cat-card[data-category="' + cKey + '"]');
      updateCardList(deskCard, catBuckets[cKey]);
      updateCardList(mobCard, catBuckets[cKey]);
    }

    // 2. Обновляем кастомные категории
    for (var customId in customBuckets) {
      var deskCustomCard = document.querySelector('#desk-view-expenses .expense-cat-card[data-category="' + customId + '"]');
      var mobCustomCard = document.querySelector('#mob-view-expenses .expense-cat-card[data-category="' + customId + '"]');
      updateCardList(deskCustomCard, customBuckets[customId]);
      updateCardList(mobCustomCard, customBuckets[customId]);
    }
  }
  window.renderExpensesCategories = renderExpensesCategories;

  function updateExpensesScreen(data) {
    var expensesList = (data && data.expenses) || null;
    if (!expensesList || !expensesList.length) {
      if (window.MyTablesCalendar && window.MyTablesCalendar.state && Array.isArray(window.MyTablesCalendar.state.payments) && window.MyTablesCalendar.state.payments.length > 0) {
        expensesList = window.MyTablesCalendar.state.payments;
      } else if (window.allData && Array.isArray(window.allData.expenses) && window.allData.expenses.length > 0) {
        expensesList = window.allData.expenses;
      } else if (window.MyTablesSync && typeof window.MyTablesSync.getCachedData === 'function') {
        var cData = window.MyTablesSync.getCachedData();
        if (cData && Array.isArray(cData.expenses) && cData.expenses.length > 0) {
          expensesList = cData.expenses;
        }
      }
    }
    expensesList = expensesList || [];

    var totalExpense = expensesList.reduce(function (sum, item) {
      return sum + (Number(item['Сумма'] || item.amount || item['Текущий_Тариф'] || item.currentRate || 0));
    }, 0);

    var totalPill = document.getElementById('expense-total-val');
    if (totalPill && totalExpense > 0) totalPill.textContent = formatRub(totalExpense);

    var deskRem = document.getElementById('desk-expenses-rem');
    if (deskRem) deskRem.textContent = formatRub(totalExpense);
    var mobRem = document.getElementById('mob-expense-sum');
    if (mobRem) mobRem.textContent = formatRub(totalExpense);

    // Рендерим платежи в категории на десктопе и мобильном
    renderExpensesCategories(expensesList);
  }
  window.updateExpensesScreen = updateExpensesScreen;

  // --- ОБНОВЛЕНИЕ ЭКРАНА КЛИЕНТОВ ---
  function updateClientsScreen(data) {
    if (window.MyTablesClients && typeof window.MyTablesClients.setClientsFromSync === 'function') {
      window.MyTablesClients.setClientsFromSync(data.clients || []);
    }
  }

  // ==========================================================================
  // СТЕЙДЖ 4: МЕНЕДЖЕР «КЛИЕНТЫ ♡»
  // ==========================================================================
  var MyTablesClients = (function () {
    var storageKeyClients = 'mytables_clients_v4';

    var STATUS_CONFIG = {
      work: { title: 'В работе', dotColor: '#2D9C5E', activeClass: 'active-work' },
      waiting: { title: 'Ожидает', dotColor: '#D4A72C', activeClass: 'active-waiting' },
      discuss: { title: 'Обсуждение', dotColor: '#2B82D9', activeClass: 'active-discuss' },
      done: { title: 'Завершён', dotColor: '#9B8A78', activeClass: 'active-done' }
    };

    var initialClients = [];

    var activeFilter = 'all';
    var selectedClientId = 'cli_1';
    var isPasswordRevealed = false;
    var selectedModalColor = 'mint';

    function isTrashClient(c) {
      if (!c) return true;
      var str = (
        String(c.name || '') + ' ' +
        String(c['Имя клиента'] || '') + ' ' +
        String(c.project || '') + ' ' +
        String(c['Проект'] || '') + ' ' +
        String(c.phone || '') + ' ' +
        String(c['Телефон / Контакт'] || '') + ' ' +
        String(c['Телефон'] || '') + ' ' +
        String(c.notes || '') + ' ' +
        String(c['Заметки'] || '') + ' ' +
        String(c.id || '')
      ).toLowerCase();
      if (str.indexOf('автотест') !== -1) return true;
      if (str.indexOf('#error') !== -1) return true;
      if (str.indexOf('autotest') !== -1) return true;
      return false;
    }

    function loadClients() {
      if (typeof localStorage !== 'undefined') {
        try {
          var saved = localStorage.getItem(storageKeyClients);
          if (saved) {
            var parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              var clean = parsed.filter(function (c) { return !isTrashClient(c); });
              if (clean.length > 0) {
                return clean.map(normalizeClient);
              }
            }
          }
        } catch (e) {}
      }
      return initialClients.filter(function (c) { return !isTrashClient(c); }).map(normalizeClient);
    }

    var clients = loadClients();

    function saveClients() {
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(storageKeyClients, JSON.stringify(clients));
        } catch (e) {}
      }
    }

    function canonicalStatus(rawStatus) {
      if (!rawStatus || typeof rawStatus !== 'string') return 'discuss';
      var s = rawStatus.trim().toLowerCase();
      if (s === 'work' || s.indexOf('работ') !== -1) return 'work';
      if (s === 'done' || s.indexOf('заверш') !== -1) return 'done';
      if (s === 'waiting' || s.indexOf('ожида') !== -1) return 'waiting';
      if (s === 'discuss' || s.indexOf('обсужд') !== -1) return 'discuss';
      return 'discuss';
    }

    function sanitizePhoneForStorage(phone) {
      if (!phone) return '';
      var s = String(phone).trim();
      if (s.indexOf("'+") === 0) return s;
      if (s.indexOf('+') === 0) return "'" + s;
      return s;
    }

    function formatPhone(phone) {
      if (!phone) return '';
      var s = String(phone).replace(/^'/, '').trim();
      if (s.indexOf('-') !== -1) return s;
      var digits = s.replace(/\D/g, '');
      if (digits.length === 11) {
        return '+7 ' + digits.slice(1, 4) + ' ' + digits.slice(4, 7) + ' ' + digits.slice(7, 9) + ' ' + digits.slice(9, 11);
      }
      if (digits.length === 10) {
        return '+7 ' + digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6, 8) + ' ' + digits.slice(8, 10);
      }
      return s;
    }

    function displayPhone(phone) {
      if (!phone) return '';
      var s = String(phone).replace(/^'/, '').trim();
      if (s.indexOf('-') !== -1) return s;
      return formatPhone(s);
    }

    function getRawCallPhone(phone) {
      if (!phone) return '';
      var digits = String(phone || '').replace(/\D/g, '');
      if (digits.length === 11 && (digits.indexOf('8') === 0 || digits.indexOf('7') === 0)) {
        digits = '7' + digits.slice(1);
      } else if (digits.length === 10 && digits.indexOf('9') === 0) {
        digits = '7' + digits;
      }
      return digits ? ('+' + digits) : displayPhone(phone);
    }

    function getCleanPhoneDigits(phone) {
      return String(phone || '').replace(/\D/g, '');
    }

    function getWhatsAppUrl(phone) {
      var digits = String(phone || '').replace(/\D/g, '');
      if (digits.length === 11 && digits.indexOf('8') === 0) {
        digits = '7' + digits.slice(1);
      } else if (digits.length === 10 && digits.indexOf('9') === 0) {
        digits = '7' + digits;
      }
      return 'https://wa.me/' + digits;
    }

    function normalizeClient(raw) {
      if (!raw) raw = {};
      var id = raw.id || raw.ID || ('cli_' + Date.now());
      var name = raw.name || raw['Имя клиента'] || raw['Имя'] || '';
      var phone = raw.phone || raw['Телефон / Контакт'] || raw['Телефон'] || '';
      var project = raw.project || raw['Проект'] || '';
      var rawStatus = raw.status || raw['Статус'] || 'discuss';
      var status = canonicalStatus(rawStatus);
      var color = raw.color || raw['Цвет'] || 'mint';
      var notes = raw.notes || raw['Заметки'] || raw['Заметка'] || '';
      var email = raw.email || raw['Email'] || raw['Почта'] || '';
      var telegram = raw.telegram || raw['Telegram'] || raw['Телеграм'] || '';
      var taskDesc = raw.taskDesc || raw['Описание задачи'] || raw['Описание'] || '';
      var passwords = raw.passwords || raw['Пароли'] || raw['Доступы'] || '';
      var passwordUrl = raw.passwordUrl || raw.passwordsUrl || raw['Ссылка на сайт с паролями'] || raw['Ссылка на пароли'] || '';

      var links = [];
      if (Array.isArray(raw.links) && raw.links.length > 0) {
        links = raw.links;
      } else if (typeof raw.links === 'string' && raw.links.trim()) {
        try { links = JSON.parse(raw.links); } catch (e) { links = []; }
      } else if (raw['Ссылка на материалы'] && typeof raw['Ссылка на материалы'] === 'string' && raw['Ссылка на материалы'].trim()) {
        var mat = raw['Ссылка на материалы'].trim();
        if (mat.indexOf('[') === 0) {
          try { links = JSON.parse(mat); } catch (e) { links = []; }
        } else if (mat.indexOf('http') === 0 || mat.indexOf('.') !== -1) {
          links = [{ title: 'CRM / Ссылка', url: mat }];
        }
      }
      // Сохраняем локальные ссылки клиента, если из Google они не вернулись
      if ((!links || links.length === 0) && typeof clients !== 'undefined' && Array.isArray(clients)) {
        var existingLocal = clients.find(function (c) { return String(c.id) === String(id); });
        if (existingLocal && Array.isArray(existingLocal.links) && existingLocal.links.length > 0) {
          links = existingLocal.links;
        }
      }

      var isArchived = (
        raw.isArchived === true ||
        raw.isArchived === 'true' ||
        raw.isArchived === 'TRUE' ||
        raw['В_Архиве'] === true ||
        raw['В_Архиве'] === 'TRUE' ||
        raw['В_Архиве'] === 'true'
      );

      return {
        id: String(id),
        name: String(name),
        phone: String(phone),
        project: String(project),
        status: status,
        color: String(color),
        notes: String(notes),
        email: String(email),
        telegram: String(telegram),
        taskDesc: String(taskDesc),
        passwords: String(passwords),
        passwordUrl: String(passwordUrl || ''),
        links: links,
        isArchived: Boolean(isArchived)
      };
    }

    function validateClient(name, phone, project, status, color) {
      if (!name || typeof name !== 'string' || !name.trim()) {
        return { valid: false, error: 'Имя клиента обязательно' };
      }
      return {
        valid: true,
        name: name.trim(),
        phone: (phone || '').trim(),
        project: (project || '').trim(),
        status: canonicalStatus(status),
        color: color || 'mint'
      };
    }

    function sortClients(list) {
      if (!list || !Array.isArray(list)) return [];
      var active = [];
      var done = [];
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        var st = canonicalStatus(item.status || item['Статус']);
        if (st === 'done') {
          done.push(item);
        } else {
          active.push(item);
        }
      }
      return active.concat(done);
    }

    function filterClients(list, filter) {
      if (!list || !Array.isArray(list)) return [];
      var nonArchived = list.filter(function (c) {
        return !(
          c.isArchived === true ||
          c.isArchived === 'true' ||
          c.isArchived === 'TRUE' ||
          c['В_Архиве'] === true ||
          c['В_Архиве'] === 'TRUE' ||
          c['В_Архиве'] === 'true'
        );
      });

      if (!filter || filter === 'all' || filter === 'Все') {
        return nonArchived;
      }

      var targetStatus = canonicalStatus(filter);
      return nonArchived.filter(function (c) {
        return canonicalStatus(c.status || c['Статус']) === targetStatus;
      });
    }

    function getActiveClients() {
      return clients.filter(function (c) {
        return !c.isArchived;
      });
    }

    function getAllClients() {
      return clients.slice();
    }

    function getActiveWorkCount() {
      return clients.filter(function (c) {
        return !c.isArchived && canonicalStatus(c.status) === 'work';
      }).length;
    }

    function getSelectedClientId() {
      return selectedClientId;
    }

    function selectClient(id, openMobileDossier) {
      selectedClientId = id;
      renderClientLists();
      renderDossiers();
      if (openMobileDossier) {
        switchMobileView('dossier');
      }
    }

    function switchMobileView(view) {
      if (typeof document === 'undefined') return;
      var listView = document.getElementById('mob-view-list');
      var dossierView = document.getElementById('mob-view-dossier');
      var btnList = document.getElementById('mob-switch-list-btn');
      var btnDossier = document.getElementById('mob-switch-dossier-btn');

      if (view === 'dossier') {
        if (listView) listView.style.display = 'none';
        if (dossierView) dossierView.style.display = 'flex';
        if (btnList) btnList.classList.remove('active');
        if (btnDossier) btnDossier.classList.add('active');
      } else {
        if (listView) listView.style.display = 'flex';
        if (dossierView) dossierView.style.display = 'none';
        if (btnList) btnList.classList.add('active');
        if (btnDossier) btnDossier.classList.remove('active');
      }
    }

    function setFilter(status, btnElement) {
      activeFilter = status || 'all';
      if (typeof document !== 'undefined') {
        var pills = document.querySelectorAll('#mob-filter-pills .filter-pill, #desk-filter-pills .filter-pill');
        for (var i = 0; i < pills.length; i++) {
          pills[i].classList.remove('active');
        }
        var classMap = {
          all: '.pill-all',
          work: '.pill-work',
          waiting: '.pill-waiting',
          discuss: '.pill-discuss',
          done: '.pill-done'
        };
        var sel = classMap[activeFilter] || '.pill-all';
        var activePills = document.querySelectorAll('#mob-filter-pills ' + sel + ', #desk-filter-pills ' + sel);
        for (var j = 0; j < activePills.length; j++) {
          activePills[j].classList.add('active');
        }
      }
      renderClientLists();
    }

    function setClients(newClients) {
      clients = (newClients || []).filter(function (c) { return !isTrashClient(c); }).map(normalizeClient);
      saveClients();
      var active = getActiveClients();
      if (active.length > 0) {
        var found = active.find(function (c) { return c.id === selectedClientId; });
        if (!found) {
          selectedClientId = active[0].id;
        }
      } else {
        selectedClientId = null;
      }
      syncToMainScreen();
      renderClients();
    }

    function setClientsFromSync(syncClients) {
      if (Array.isArray(syncClients) && syncClients.length > 0) {
        var clean = syncClients.filter(function (c) { return !isTrashClient(c); });
        if (clean.length > 0) {
          clients = clean.map(normalizeClient);
          saveClients();
        }
        var active = getActiveClients();
        if (active.length > 0) {
          var found = active.find(function (c) { return c.id === selectedClientId; });
          if (!found) {
            selectedClientId = active[0].id;
          }
        } else {
          selectedClientId = null;
        }
      }
      syncToMainScreen();
      renderClients();
    }

    function addClient(data) {
      var v = validateClient(data.name, data.phone, data.project, data.status, data.color);
      if (!v.valid) return null;
      var newId = 'cli_' + Date.now();
      var newClient = {
        id: newId,
        name: v.name,
        phone: sanitizePhoneForStorage(v.phone),
        project: v.project,
        status: v.status,
        color: v.color,
        notes: data.notes || '',
        email: data.email || '',
        telegram: data.telegram || '',
        taskDesc: data.taskDesc || '',
        passwords: data.passwords || '',
        links: data.links || [],
        isArchived: false
      };
      clients.push(newClient);
      saveClients();
      selectedClientId = newClient.id;

      if (window.MyTablesSync && typeof window.MyTablesSync.saveClient === 'function') {
        var statusLabels = { work: 'В работе', waiting: 'Ожидает', discuss: 'Обсуждение', done: 'Завершён' };
        window.MyTablesSync.saveClient({
          ID: newClient.id,
          'Имя клиента': newClient.name,
          'Телефон / Контакт': newClient.phone,
          'Проект': newClient.project,
          'Статус': statusLabels[newClient.status] || newClient.status,
          'Цвет': newClient.color,
          'Заметки': newClient.notes,
          'В_Архиве': false,
          isArchived: false,
          isUpdate: false
        }).catch(function () {});
      }

      syncToMainScreen();
      renderClients();
      return newClient;
    }

    function updateClient(id, data) {
      var target = null;
      for (var i = 0; i < clients.length; i++) {
        if (clients[i].id === id) {
          target = clients[i];
          break;
        }
      }
      if (!target) return null;
      if (data.name !== undefined) target.name = data.name.trim();
      if (data.phone !== undefined) target.phone = sanitizePhoneForStorage(data.phone);
      if (data.project !== undefined) target.project = data.project.trim();
      if (data.status !== undefined) target.status = canonicalStatus(data.status);
      if (data.color !== undefined) target.color = data.color;
      if (data.notes !== undefined) target.notes = data.notes;
      if (data.email !== undefined) target.email = data.email;
      if (data.telegram !== undefined) target.telegram = data.telegram;
      if (data.taskDesc !== undefined) target.taskDesc = data.taskDesc;
      if (data.passwords !== undefined) target.passwords = data.passwords;
      if (data.passwordUrl !== undefined) target.passwordUrl = data.passwordUrl;
      if (data.links !== undefined) target.links = data.links;
      if (data.isArchived !== undefined) target.isArchived = Boolean(data.isArchived);

      saveClients();

      if (window.MyTablesSync && typeof window.MyTablesSync.saveClient === 'function') {
        var statusLabels = { work: 'В работе', waiting: 'Ожидает', discuss: 'Обсуждение', done: 'Завершён' };
        window.MyTablesSync.saveClient({
          ID: target.id,
          'Имя клиента': target.name,
          'Телефон / Контакт': target.phone,
          'Проект': target.project,
          'Статус': statusLabels[target.status] || target.status,
          'Цвет': target.color,
          'Заметки': target.notes,
          'В_Архиве': target.isArchived,
          isArchived: target.isArchived,
          isUpdate: true
        }).catch(function () {});
      }

      syncToMainScreen();
      renderClients();
      return target;
    }

    function archiveClient(id) {
      var target = null;
      for (var i = 0; i < clients.length; i++) {
        if (clients[i].id === id) {
          clients[i].isArchived = true;
          clients[i]['В_Архиве'] = true;
          target = clients[i];
          break;
        }
      }
      saveClients();

      if (target && window.MyTablesSync && typeof window.MyTablesSync.saveClient === 'function') {
        var statusLabels = { work: 'В работе', waiting: 'Ожидает', discuss: 'Обсуждение', done: 'Завершён' };
        window.MyTablesSync.saveClient({
          ID: target.id,
          'Имя клиента': target.name,
          'Телефон / Контакт': target.phone,
          'Проект': target.project,
          'Статус': statusLabels[target.status] || target.status,
          'Цвет': target.color,
          'Заметки': target.notes,
          'В_Архиве': true,
          isArchived: true,
          isUpdate: true
        }).catch(function () {});
      }

      if (selectedClientId === id) {
        var remaining = getActiveClients();
        selectedClientId = remaining.length > 0 ? remaining[0].id : null;
      }

      syncToMainScreen();
      renderClients();
      return target;
    }

    function addClientLink(clientId, linkObj) {
      var client = clients.find(function (c) { return c.id === clientId; });
      if (!client) {
        client = clients.find(function (c) { return c.id === selectedClientId; });
      }
      if (!client) return null;
      if (!client.links) client.links = [];
      client.links.push({
        title: (linkObj && linkObj.title) || 'Новая ссылка',
        url: (linkObj && linkObj.url) || '#'
      });
      saveClients();
      renderDossiers();
      if (typeof window.MyTablesSync !== 'undefined' && typeof window.MyTablesSync.saveClient === 'function') {
        window.MyTablesSync.saveClient(client).catch(function(e){ console.warn(e); });
      }
      return client;
    }

    function editClientLink(clientId, index, linkObj) {
      var client = clients.find(function (c) { return c.id === clientId; });
      if (!client) {
        client = clients.find(function (c) { return c.id === selectedClientId; });
      }
      if (!client || !client.links || !client.links[index]) return null;
      if (!linkObj || !linkObj.title) {
        client.links.splice(index, 1);
      } else {
        client.links[index].title = linkObj.title;
        client.links[index].url = linkObj.url || client.links[index].url;
      }
      saveClients();
      renderDossiers();
      if (typeof window.MyTablesSync !== 'undefined' && typeof window.MyTablesSync.saveClient === 'function') {
        window.MyTablesSync.saveClient(client).catch(function(e){ console.warn(e); });
      }
      return client;
    }

    function togglePasswordVisibility() {
      isPasswordRevealed = !isPasswordRevealed;
      renderDossiers();
    }

    function updateCounters() {
      if (typeof document === 'undefined') return;
      var active = getActiveClients();
      var counts = {
        all: active.length,
        work: 0,
        waiting: 0,
        discuss: 0,
        done: 0
      };

      for (var i = 0; i < active.length; i++) {
        var st = canonicalStatus(active[i].status || active[i]['Статус']);
        if (counts[st] !== undefined) {
          counts[st]++;
        }
      }

      // 1. Верхние бейджи «В работе» экрана Клиентов
      var deskBadge = document.getElementById('desk-work-count-badge');
      if (deskBadge) deskBadge.textContent = 'В работе: ' + counts.work;

      var mobBadge = document.getElementById('mob-work-count-badge');
      if (mobBadge) mobBadge.textContent = counts.work + ' в работе';

      // 2. Кнопки фильтров (десктоп и мобильный)
      var rows = ['#desk-filter-pills', '#mob-filter-pills'];
      for (var r = 0; r < rows.length; r++) {
        var prefix = rows[r];
        var pillAll = document.querySelector(prefix + ' .pill-all');
        if (pillAll) pillAll.innerHTML = 'Все ' + counts.all;

        var pillWork = document.querySelector(prefix + ' .pill-work');
        if (pillWork) pillWork.innerHTML = '<span class="filter-dot" style="background:#2D9C5E;"></span>В работе ' + counts.work;

        var pillWaiting = document.querySelector(prefix + ' .pill-waiting');
        if (pillWaiting) pillWaiting.innerHTML = '<span class="filter-dot" style="background:#D4A72C;"></span>Ожидает ' + counts.waiting;

        var pillDiscuss = document.querySelector(prefix + ' .pill-discuss');
        if (pillDiscuss) pillDiscuss.innerHTML = '<span class="filter-dot" style="background:#2B82D9;"></span>Обсуждение ' + counts.discuss;

        var pillDone = document.querySelector(prefix + ' .pill-done');
        if (pillDone) pillDone.innerHTML = '<span class="filter-dot" style="background:#9B8A78;"></span>Завершён ' + counts.done;
      }
    }

    function syncToMainScreen() {
      var activeCount = getActiveWorkCount();
      if (typeof document !== 'undefined') {
        var deskEl = document.getElementById('desk-clients-count');
        if (deskEl) deskEl.textContent = activeCount + ' в работе';
        var mobEl = document.getElementById('mob-clients-count');
        if (mobEl) mobEl.textContent = activeCount + ' в работе';
        var countPill = document.getElementById('clients-count-pill');
        if (countPill) countPill.textContent = activeCount + ' в работе';
        updateCounters();
      }
    }

    function copyPassword(clientId) {
      var id = clientId || selectedClientId;
      var client = clients.find(function (c) { return c.id === id; });
      if (!client) return;
      copyText(client.passwords || '', 'Пароль');
    }

    function copyText(text, label) {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showToast((label || 'Текст') + ' скопирован в буфер ♡');
        }).catch(function () {
          showToast('Скопировано: ' + text);
        });
      } else {
        showToast('Скопировано: ' + text);
      }
    }

    function showToast(msg) {
      if (typeof document === 'undefined') return;
      var toast = document.getElementById('toast-popup');
      var toastText = document.getElementById('toast-text');
      if (toast && toastText) {
        toastText.textContent = msg;
        toast.classList.add('active');
        setTimeout(function () {
          toast.classList.remove('active');
        }, 2200);
      }
    }

    function getLinkIconBadge(link) {
      var url = (link.url || '').toLowerCase();
      var title = (link.title || '').toLowerCase();

      if (url.indexOf('trello') !== -1 || title.indexOf('trello') !== -1 || title.indexOf('доска') !== -1) {
        return '<div class="link-circle-badge blue"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h3v8H7z"/><path d="M14 7h3v5h-3z"/></svg></div>';
      } else if (url.indexOf('drive.google') !== -1 || title.indexOf('диск') !== -1 || title.indexOf('папк') !== -1) {
        return '<div class="link-circle-badge yellow"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 8 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg></div>';
      } else if (url.indexOf('spreadsheets') !== -1 || url.indexOf('docs.google') !== -1 || title.indexOf('таблиц') !== -1 || title.indexOf('дашборд') !== -1) {
        return '<div class="link-circle-badge mint"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/></svg></div>';
      } else {
        return '<div class="link-circle-badge lavender"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>';
      }
    }

    function renderLinksHtml(links) {
      if (!links || links.length === 0) {
        return '<div style="font-size:12px; opacity:0.75; padding:6px 2px;">Ссылки ещё не добавлены</div>';
      }
      return links.map(function (l, index) {
        var cleanUrl = (l.url || '').replace(/^https?:\/\//, '');
        return [
          '<div class="link-item-row tooltip-anchor">',
          '  <a href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener noreferrer" class="link-item-main" title="' + escapeHtml(l.url) + '">',
          '    <div style="display:flex; align-items:center; gap:10px; min-width:0;">',
          '      ' + getLinkIconBadge(l),
          '      <div style="display:flex; flex-direction:column; min-width:0; gap:1px;">',
          '        <span class="link-title-text">' + escapeHtml(l.title) + '</span>',
          '        <span class="link-url-text">' + escapeHtml(cleanUrl) + '</span>',
          '      </div>',
          '    </div>',
          '    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; opacity:0.6;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
          '  </a>',
          '  <button class="link-edit-pencil-btn" onclick="window.MyTablesClients.openEditLinkPrompt(' + index + ')" title="Изменить ссылку">✎</button>',
          '  <span class="shadcn-tooltip">Открыть: ' + escapeHtml(l.title) + '</span>',
          '</div>'
        ].join('');
      }).join('');
    }

    function renderClients() {
      renderClientLists();
      renderDossiers();
      updateCounters();
    }

    function renderClientLists() {
      if (typeof document === 'undefined') return;
      var mobContainer = document.getElementById('mob-clients-container');
      var deskContainer = document.getElementById('desk-clients-container');
      if (!mobContainer && !deskContainer) return;

      var filtered = filterClients(clients, activeFilter);
      var sorted = sortClients(filtered);

      if (sorted.length === 0) {
        var emptyHtml = [
          '<div style="background:#FAF2E7; border-radius:18px; padding:22px; text-align:center; box-shadow:2px 3px 6px rgba(35,30,20,0.08);">',
          '  <div style="font-size:20px; margin-bottom:4px;">♡</div>',
          '  <div style="font-size:13px; font-weight:800; color:#5A4E40;">В этом статусе клиентов нет</div>',
          '</div>'
        ].join('');
        if (mobContainer) mobContainer.innerHTML = emptyHtml;
        if (deskContainer) deskContainer.innerHTML = emptyHtml;
        return;
      }

      if (mobContainer) {
        mobContainer.innerHTML = sorted.map(function (c) {
          var initials = getInitials(c.name);
          var stConfig = STATUS_CONFIG[c.status] || STATUS_CONFIG.discuss;
          return [
            '<div class="client-card-slip ' + c.color + '" onclick="window.MyTablesClients.selectClient(\'' + c.id + '\', true)">',
            '  <div class="client-card-left">',
            '    <div class="client-avatar-round">' + initials + '</div>',
            '    <div class="client-info-group">',
            '      <span class="client-name">' + escapeHtml(c.name) + '</span>',
            '      <span class="client-project">' + escapeHtml(c.project) + '</span>',
            '      <span class="client-phone-sub">' + escapeHtml(displayPhone(c.phone)) + '</span>',
            '    </div>',
            '  </div>',
            '  <div class="client-card-right">',
            '    <span class="status-badge ' + c.status + '">',
            '      <span class="status-dot"></span>',
            '      <span>' + stConfig.title + '</span>',
            '    </span>',
            '    <button class="card-chevron-btn" title="Открыть анкету">',
            '      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
            '    </button>',
            '  </div>',
            '</div>'
          ].join('');
        }).join('');
      }

      if (deskContainer) {
        deskContainer.innerHTML = sorted.map(function (c) {
          var initials = getInitials(c.name);
          var stConfig = STATUS_CONFIG[c.status] || STATUS_CONFIG.discuss;
          var selectedClass = (c.id === selectedClientId) ? 'selected' : '';
          return [
            '<div class="client-card-slip ' + c.color + ' ' + selectedClass + '" onclick="window.MyTablesClients.selectClient(\'' + c.id + '\', false)">',
            '  <div class="client-card-left">',
            '    <div class="client-avatar-round">' + initials + '</div>',
            '    <div class="client-info-group">',
            '      <span class="client-name">' + escapeHtml(c.name) + '</span>',
            '      <span class="client-project">' + escapeHtml(c.project) + '</span>',
            '      <span class="client-phone-sub">' + escapeHtml(displayPhone(c.phone)) + '</span>',
            '    </div>',
            '  </div>',
            '  <div class="client-card-right">',
            '    <span class="status-badge ' + c.status + '">',
            '      <span class="status-dot"></span>',
            '      <span>' + stConfig.title + '</span>',
            '    </span>',
            '  </div>',
            '</div>'
          ].join('');
        }).join('');
      }
    }

    function renderDossiers() {
      if (typeof document === 'undefined') return;
      var mobDossier = document.getElementById('mob-dossier-wrapper');
      var deskDossier = document.getElementById('desk-dossier-wrapper');
      if (!mobDossier && !deskDossier) return;

      var activeList = getActiveClients();
      var client = activeList.find(function (c) { return c.id === selectedClientId; });
      if (!client && activeList.length > 0) {
        client = activeList[0];
        selectedClientId = client.id;
      }

      if (!client) {
        var emptyDossier = '<div style="padding:32px; text-align:center; color:#7A6E5F; font-size:14px; font-weight:700;">Выберите клиента из списка или добавьте нового ♡</div>';
        if (mobDossier) mobDossier.innerHTML = emptyDossier;
        if (deskDossier) deskDossier.innerHTML = emptyDossier;
        return;
      }

      var colorClasses = ['mint', 'peach', 'lavender', 'blue', 'honey', 'sand'];
      for (var i = 0; i < colorClasses.length; i++) {
        var cls = colorClasses[i];
        if (mobDossier) mobDossier.classList.remove(cls);
        if (deskDossier) deskDossier.classList.remove(cls);
      }
      if (mobDossier) mobDossier.classList.add(client.color || 'mint');
      if (deskDossier) deskDossier.classList.add(client.color || 'mint');

      var initials = getInitials(client.name);
      var stConfig = STATUS_CONFIG[client.status] || STATUS_CONFIG.discuss;
      var cleanPhone = displayPhone(client.phone);
      var displayedPass = isPasswordRevealed ? client.passwords : '••••••••••••••••';
      var passEye = isPasswordRevealed ? '👁' : '🔒';

      if (mobDossier) {
        mobDossier.innerHTML = [
          '<div class="dossier-profile-card">',
          '  <div class="dossier-profile-left">',
          '    <div class="dossier-avatar-large">' + initials + '</div>',
          '    <div class="dossier-profile-info">',
          '      <span class="dossier-name">' + escapeHtml(client.name) + '</span>',
          '      <span class="dossier-project-sub">' + escapeHtml(client.project) + '</span>',
          '    </div>',
          '  </div>',
          '  <div class="dossier-header-actions">',
          '    <span class="status-badge ' + client.status + '">',
          '      <span class="status-dot"></span>',
          '      <span>' + stConfig.title + '</span>',
          '    </span>',
          '  </div>',
          '</div>',
          '<div class="dossier-paper-slip">',
          '  <div class="slip-title-row">',
          '    <div class="slip-title-left">',
          '      <span class="slip-icon-badge mint">',
          '        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
          '      </span>',
          '      <span>Контакты</span>',
          '    </div>',
          '  </div>',
          '  <div class="contact-clean-box">',
          '    <div style="margin-bottom: 6px;">',
          '      <a href="tel:' + escapeHtml(getRawCallPhone(client.phone)) + '" class="contact-phone-big" title="Нажмите для вызова или копирования" onclick="window.MyTablesClients.copyText(\'' + escapeHtml(getRawCallPhone(client.phone)) + '\', \'Номер телефона\')">' + escapeHtml(cleanPhone) + '</a>',
          '    </div>',
          '    <div class="contact-sub-links">',
          (client.telegram ? '      <a href="https://t.me/' + escapeHtml(client.telegram.replace('@', '')) + '" target="_blank" class="contact-sub-item">✈️ ' + escapeHtml(client.telegram) + '</a>' : ''),
          (client.telegram && client.email ? '      <span class="contact-dot-sep">•</span>' : ''),
          (client.email ? '      <a href="mailto:' + escapeHtml(client.email) + '" class="contact-sub-item">✉️ ' + escapeHtml(client.email) + '</a>' : ''),
          '    </div>',
          '  </div>',
          '</div>',
          '<div class="dossier-paper-slip">',
          '  <div class="slip-title-row">',
          '    <div class="slip-title-left">',
          '      <span class="slip-icon-badge yellow">',
          '        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
          '      </span>',
          '      <span>Ссылки и таблицы</span>',
          '    </div>',
          '  </div>',
          '  <div class="links-list-container">',
          renderLinksHtml(client.links),
          '    <button class="btn-add-link-creamy" onclick="window.MyTablesClients.openAddLinkPrompt()" title="Прикрепить новую ссылку">',
          '      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
          '      <span style="font-size:14px; font-weight:900;">+</span>',
          '      <span>Добавить ссылку</span>',
          '    </button>',
          '  </div>',
          '</div>',
          '<div class="dossier-paper-slip">',
          '  <div class="slip-title-row">',
          '    <div class="slip-title-left">',
          '      <span class="slip-icon-badge peach">',
          '        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
          '      </span>',
          '      <span>Доступы и пароли</span>',
          '    </div>',
          '    <div style="display: flex; align-items: center; gap: 6px;">',
          '      <button class="btn-add-pass-pill" onclick="window.MyTablesClients.openPasswordsModal()" title="Добавить или изменить пароль" style="background:#FDF1CC; color:#5B481D; border:none; outline:none; border-radius:12px; padding:4px 10px; font-size:14px; font-weight:900; cursor:pointer; box-shadow:1.5px 2.5px 5px rgba(120,95,70,0.16); transition:transform 0.12s ease;">+</button>',
          '      <button class="btn-copy-pass-pill" onclick="window.MyTablesClients.copyPassword(\'' + client.id + '\')" title="Скопировать">Скопировать</button>',
          '    </div>',
          '  </div>',
          '  <div class="password-display-box">',
          '    <span class="password-text" id="mob-pass-field">' + escapeHtml(displayedPass) + '</span>',
          '    <button class="dossier-icon-btn" onclick="window.MyTablesClients.togglePasswordVisibility()" title="Показать/скрыть">' + passEye + '</button>',
          '  </div>',
          (client.passwordUrl ? '  <div style="margin-top: 8px;"><a href="' + escapeHtml(client.passwordUrl) + '" target="_blank" rel="noopener noreferrer" class="btn-passwords-site" style="display:inline-flex; align-items:center; gap:6px; padding:7px 14px; background:#FDF1CC; color:#5B481D; border-radius:12px; font-size:12px; font-weight:800; text-decoration:none; border:none; box-shadow:2px 3px 6px rgba(160,125,85,0.18);"><span>🔐</span> <span>Перейти к паролям</span> <span style="font-size:10px;">↗</span></a></div>' : ''),
          '</div>',
          '<div class="dossier-paper-slip">',
          '  <div class="slip-title-row">',
          '    <div class="slip-title-left">',
          '      <span class="slip-icon-badge blue">',
          '        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
          '      </span>',
          '      <span>Описание задачи и договорённости</span>',
          '    </div>',
          '  </div>',
          '  <div class="notes-display-box">',
          escapeHtml(client.taskDesc || 'Описание задачи пока не заполнено'),
          (client.notes ? '    <div style="margin-top:6px; font-weight:800; opacity:0.9;">📌 Заметка: ' + escapeHtml(client.notes) + '</div>' : ''),
          '  </div>',
          '</div>',
          '<div class="mob-dossier-actions">',
          '  <button class="mob-btn-action edit" onclick="window.MyTablesClients.openEditModal(\'' + client.id + '\')"><span>✎</span> Редактировать</button>',
          '  <button class="mob-btn-action archive" onclick="window.MyTablesClients.openArchiveModal(\'' + client.id + '\')">',
          '    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
          '    В архив',
          '  </button>',
          '</div>'
        ].join('');
      }

      if (deskDossier) {
        deskDossier.innerHTML = [
          '<div class="dossier-profile-card">',
          '  <div class="dossier-profile-left">',
          '    <div class="dossier-avatar-large" style="width:52px; height:52px; font-size:18px;">' + initials + '</div>',
          '    <div class="dossier-profile-info">',
          '      <span class="dossier-name" style="font-size:20px;">' + escapeHtml(client.name) + '</span>',
          '      <span class="dossier-project-sub" style="font-size:13px;">' + escapeHtml(client.project) + '</span>',
          '    </div>',
          '  </div>',
          '  <div class="dossier-header-actions">',
          '    <span class="status-badge ' + client.status + '" style="font-size:12px; padding:6px 14px;">',
          '      <span class="status-dot"></span>',
          '      <span>' + stConfig.title + '</span>',
          '    </span>',
          '    <button class="dossier-icon-btn" style="width:36px; height:36px;" onclick="window.MyTablesClients.openEditModal(\'' + client.id + '\')" title="Редактировать клиента">',
          '      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
          '    </button>',
          '    <button class="dossier-icon-btn" style="width:36px; height:36px; color:#58241B;" onclick="window.MyTablesClients.openArchiveModal(\'' + client.id + '\')" title="Отправить в архив">',
          '      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
          '    </button>',
          '  </div>',
          '</div>',
          '<div class="desk-dossier-grid" style="margin-top: 4px;">',
          '  <div class="dossier-paper-slip">',
          '    <div class="slip-title-row">',
          '      <div class="slip-title-left">',
          '        <span class="slip-icon-badge mint">',
          '          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
          '        </span>',
          '        <span>Контакты</span>',
          '      </div>',
          '    </div>',
          '    <div class="contact-clean-box">',
          '      <div style="margin-bottom: 6px;">',
          '        <a href="tel:' + escapeHtml(cleanPhone) + '" class="contact-phone-big" title="Нажмите для вызова или копирования" onclick="window.MyTablesClients.copyText(\'' + escapeHtml(cleanPhone) + '\', \'Номер телефона\')">' + escapeHtml(cleanPhone) + '</a>',
          '      </div>',
          '      <div class="contact-sub-links">',
          (client.telegram ? '        <a href="https://t.me/' + escapeHtml(client.telegram.replace('@', '')) + '" target="_blank" class="contact-sub-item">✈️ ' + escapeHtml(client.telegram) + '</a>' : ''),
          (client.telegram && client.email ? '        <span class="contact-dot-sep">•</span>' : ''),
          (client.email ? '        <a href="mailto:' + escapeHtml(client.email) + '" class="contact-sub-item">✉️ ' + escapeHtml(client.email) + '</a>' : ''),
          '      </div>',
          '    </div>',
          '  </div>',
          '  <div class="dossier-paper-slip">',
          '    <div class="slip-title-row">',
          '      <div class="slip-title-left">',
          '        <span class="slip-icon-badge yellow">',
          '          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
          '        </span>',
          '        <span>Ссылки и таблицы</span>',
          '      </div>',
          '    </div>',
          '    <div class="links-list-container">',
          renderLinksHtml(client.links),
          '      <button class="btn-add-link-creamy" onclick="window.MyTablesClients.openAddLinkPrompt()" title="Прикрепить новую ссылку">',
          '        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
          '        <span style="font-size:14px; font-weight:900;">+</span>',
          '        <span>Добавить ссылку</span>',
          '      </button>',
          '    </div>',
          '  </div>',
          '  <div class="dossier-paper-slip">',
          '    <div class="slip-title-row">',
          '      <div class="slip-title-left">',
          '        <span class="slip-icon-badge blue">',
          '          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
          '        </span>',
          '        <span>Описание задачи и объём работы</span>',
          '      </div>',
          '    </div>',
          '    <div class="notes-display-box">',
          escapeHtml(client.taskDesc || 'Описание задачи пока не заполнено'),
          '    </div>',
          '  </div>',
          '  <div class="dossier-paper-slip">',
          '    <div class="slip-title-row">',
          '      <div class="slip-title-left">',
          '        <span class="slip-icon-badge peach">',
          '          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
          '        </span>',
          '        <span>Доступы и пароли</span>',
          '      </div>',
          '      <div style="display: flex; align-items: center; gap: 6px;">',
          '        <button class="btn-add-pass-pill" onclick="window.MyTablesClients.openPasswordsModal()" title="Добавить или изменить пароль" style="background:#FDF1CC; color:#5B481D; border:none; outline:none; border-radius:12px; padding:4px 10px; font-size:14px; font-weight:900; cursor:pointer; box-shadow:1.5px 2.5px 5px rgba(120,95,70,0.16); transition:transform 0.12s ease;">+</button>',
          '        <button class="btn-copy-pass-pill" onclick="window.MyTablesClients.copyPassword(\'' + client.id + '\')" title="Скопировать">Скопировать</button>',
          '      </div>',
          '    </div>',
          '    <div class="password-display-box">',
          '      <span class="password-text" id="desk-pass-field">' + escapeHtml(displayedPass) + '</span>',
          '      <button class="dossier-icon-btn" onclick="window.MyTablesClients.togglePasswordVisibility()" title="Показать/скрыть">' + passEye + '</button>',
          '    </div>',
          (client.passwordUrl ? '    <div style="margin-top: 8px;"><a href="' + escapeHtml(client.passwordUrl) + '" target="_blank" rel="noopener noreferrer" class="btn-passwords-site" style="display:inline-flex; align-items:center; gap:6px; padding:7px 14px; background:#FDF1CC; color:#5B481D; border-radius:12px; font-size:12px; font-weight:800; text-decoration:none; border:none; box-shadow:2px 3px 6px rgba(160,125,85,0.18);"><span>🔐</span> <span>Перейти к паролям</span> <span style="font-size:10px;">↗</span></a></div>' : ''),
          '  </div>',
          '  <div class="dossier-paper-slip">',
          '    <div class="slip-title-row">',
          '      <div class="slip-title-left">',
          '        <span class="slip-icon-badge blue">',
          '          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-2l-2-2V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v8l-2 2v2z"/></svg>',
          '        </span>',
          '        <span>Важные заметки</span>',
          '      </div>',
          '    </div>',
          '    <div class="notes-display-box">',
          escapeHtml(client.notes || 'Заметок нет'),
          '    </div>',
          '  </div>',
          '</div>'
        ].join('');
      }
    }

    var currentEditingLinkIndex = null;

    function injectLinkModal() {
      if (typeof document === 'undefined') return;
      if (document.getElementById('mytables-link-modal')) return;
      var modal = document.createElement('div');
      modal.id = 'mytables-link-modal';
      modal.className = 'mytables-modal-backdrop';
      modal.style.display = 'none';
      modal.style.pointerEvents = 'none';
      modal.innerHTML = [
        '<div class="mytables-paper-modal" style="max-width: 440px; width: 100%; background: #FAF2E7; border-radius: 24px; padding: 22px 20px; box-shadow: 6px 14px 35px rgba(130, 105, 80, 0.28), -3px -3px 10px rgba(255, 255, 255, 0.9); border: none; text-align: left;">',
        '  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">',
        '    <div style="font-size: 18px; font-weight: 900; color: #2F261D;" id="link-modal-heading">',
        '      <span>+ Ссылка клиента</span> <span style="color: #E27D60;">♡</span>',
        '    </div>',
        '    <button type="button" id="link-modal-close" style="background: none; border: none; font-size: 20px; font-weight: 800; cursor: pointer; color: #8C784C; outline: none;">✕</button>',
        '  </div>',
        '  <form id="link-modal-form" onsubmit="return false;">',
        '    <div style="background: #FCE8D5; border-radius: 18px; padding: 16px; box-shadow: 3px 5px 14px rgba(170, 130, 95, 0.2), -2px -2px 6px rgba(255, 255, 255, 0.85); margin-bottom: 16px; border: none;">',
        '      <div style="margin-bottom: 12px;">',
        '        <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 5px;">Название ссылки</label>',
        '        <input type="text" id="link-in-title" placeholder="CRM Битрикс24, Figma макет" style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 11px 14px; font-size: 13px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); font-family: inherit;" required>',
        '      </div>',
        '      <div>',
        '        <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 5px;">Адрес ссылки (URL)</label>',
        '        <input type="text" id="link-in-url" placeholder="https://..." style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 11px 14px; font-size: 13px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); font-family: inherit;" required>',
        '      </div>',
        '    </div>',
        '    <div style="display: flex; gap: 10px; align-items: center; justify-content: stretch;">',
        '      <button type="button" id="link-modal-delete" style="display: none; flex: 1; min-height: 44px; background: #FCD6CF; color: #58241B; border: none; outline: none; border-radius: 14px; padding: 12px 10px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 2.5px 4px 10px rgba(180, 100, 90, 0.22); transition: all 0.15s ease;">Удалить</button>',
        '      <button type="button" id="link-modal-cancel" style="flex: 1; min-height: 44px; background: #FDF1CC; color: #5B481D; border: none; outline: none; border-radius: 14px; padding: 12px 10px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 2.5px 4px 10px rgba(160, 125, 85, 0.22); transition: all 0.15s ease;">Отмена</button>',
        '      <button type="submit" id="link-modal-submit" style="flex: 1; min-height: 44px; background: #C8E2D2; color: #1E3F30; border: none; outline: none; border-radius: 14px; padding: 12px 10px; font-size: 13px; font-weight: 900; cursor: pointer; box-shadow: 2.5px 4px 10px rgba(70, 130, 95, 0.25); transition: all 0.15s ease;">Сохранить</button>',
        '    </div>',
        '  </form>',
        '</div>'
      ].join('');
      document.body.appendChild(modal);

      var close = function () {
        currentEditingLinkIndex = null;
        modal.classList.remove('active');
        modal.style.display = 'none';
        modal.style.pointerEvents = 'none';
      };
      var closeBtn = document.getElementById('link-modal-close');
      if (closeBtn) closeBtn.addEventListener('click', close);
      var cancelBtn = document.getElementById('link-modal-cancel');
      if (cancelBtn) cancelBtn.addEventListener('click', close);
      modal.addEventListener('click', function (e) {
        if (e.target === modal) close();
      });

      var delBtn = document.getElementById('link-modal-delete');
      if (delBtn) {
        delBtn.addEventListener('click', function () {
          var client = clients.find(function (c) { return c.id === selectedClientId; });
          if (client && currentEditingLinkIndex !== null) {
            editClientLink(client.id, currentEditingLinkIndex, null);
            showToast('Ссылка удалена ♡');
          }
          close();
        });
      }

      var formEl = document.getElementById('link-modal-form');
      if (formEl) {
        formEl.addEventListener('submit', function (e) {
          e.preventDefault();
          var client = clients.find(function (c) { return c.id === selectedClientId; });
          if (!client) return;
          var title = (document.getElementById('link-in-title').value || '').trim();
          var url = (document.getElementById('link-in-url').value || '').trim();
          if (!title || !url) return;
          if (!url.match(/^[a-zA-Z]+:\/\//)) {
            url = 'https://' + url;
          }

          if (currentEditingLinkIndex !== null) {
            editClientLink(client.id, currentEditingLinkIndex, { title: title, url: url });
            showToast('Ссылка обновлена ♡');
          } else {
            addClientLink(client.id, { title: title, url: url });
            showToast('Ссылка успешно добавлена ♡');
          }
          close();
        });
      }
    }

    function openAddLinkPrompt() {
      injectLinkModal();
      currentEditingLinkIndex = null;
      var modal = document.getElementById('mytables-link-modal');
      var heading = document.getElementById('link-modal-heading');
      if (heading) heading.innerHTML = '<span>+ Ссылка клиента</span> <span style="color: #E27D60;">♡</span>';
      var inTitle = document.getElementById('link-in-title');
      if (inTitle) inTitle.value = '';
      var inUrl = document.getElementById('link-in-url');
      if (inUrl) inUrl.value = '';
      var delBtn = document.getElementById('link-modal-delete');
      if (delBtn) delBtn.style.display = 'none';
      if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.pointerEvents = 'auto';
      }
      if (inTitle && typeof inTitle.focus === 'function') inTitle.focus();
    }

    function openEditLinkPrompt(index) {
      injectLinkModal();
      var client = clients.find(function (c) { return c.id === selectedClientId; });
      if (!client || !client.links || !client.links[index]) return;
      var link = client.links[index];
      currentEditingLinkIndex = index;
      var modal = document.getElementById('mytables-link-modal');
      var heading = document.getElementById('link-modal-heading');
      if (heading) heading.innerHTML = '<span>✎ Ссылка клиента</span> <span style="color: #E27D60;">♡</span>';
      var inTitle = document.getElementById('link-in-title');
      if (inTitle) inTitle.value = link.title || '';
      var inUrl = document.getElementById('link-in-url');
      if (inUrl) inUrl.value = link.url || '';
      var delBtn = document.getElementById('link-modal-delete');
      if (delBtn) delBtn.style.display = 'inline-flex';
      if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.pointerEvents = 'auto';
      }
      if (inTitle && typeof inTitle.focus === 'function') inTitle.focus();
    }

    function injectPasswordsModal() {
      if (typeof document === 'undefined') return;
      if (document.getElementById('mytables-passwords-modal')) return;
      var modal = document.createElement('div');
      modal.id = 'mytables-passwords-modal';
      modal.className = 'mytables-modal-backdrop';
      modal.style.display = 'none';
      modal.style.pointerEvents = 'none';
      modal.innerHTML = [
        '<div class="mytables-paper-modal" style="max-width: 440px; width: 100%; background: #FAF2E7; border-radius: 24px; padding: 22px 20px; box-shadow: 6px 14px 35px rgba(130, 105, 80, 0.28), -3px -3px 10px rgba(255, 255, 255, 0.9); border: none; text-align: left;">',
        '  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">',
        '    <div style="font-size: 18px; font-weight: 900; color: #2F261D;">',
        '      <span>Доступы и пароли</span> <span style="color: #E27D60;">♡</span>',
        '    </div>',
        '    <button type="button" id="pass-modal-close" style="background: none; border: none; font-size: 20px; font-weight: 800; cursor: pointer; color: #8C784C; outline: none;">✕</button>',
        '  </div>',
        '  <form id="pass-modal-form" onsubmit="return false;">',
        '    <div style="background: #FCE8D5; border-radius: 18px; padding: 16px; box-shadow: 3px 5px 14px rgba(170, 130, 95, 0.2), -2px -2px 6px rgba(255, 255, 255, 0.85); margin-bottom: 16px; border: none;">',
        '      <div style="margin-bottom: 12px;">',
        '        <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 5px;">Логин / Пароль клиента</label>',
        '        <input type="text" id="pass-in-credentials" placeholder="admin / pass123" style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 11px 14px; font-size: 13px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); font-family: inherit;">',
        '      </div>',
        '      <div>',
        '        <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 5px;">Ссылка на сервис/сайт с паролями</label>',
        '        <input type="url" id="pass-in-url" placeholder="https://passwords.google.com/..." style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 11px 14px; font-size: 13px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); font-family: inherit;">',
        '      </div>',
        '    </div>',
        '    <div style="display: flex; gap: 10px; align-items: center; justify-content: stretch;">',
        '      <button type="button" id="pass-modal-cancel" style="flex: 1; min-height: 44px; background: #FDF1CC; color: #5B481D; border: none; outline: none; border-radius: 14px; padding: 12px 10px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 2.5px 4px 10px rgba(160, 125, 85, 0.22); transition: all 0.15s ease;">Отмена</button>',
        '      <button type="submit" id="pass-modal-submit" style="flex: 1; min-height: 44px; background: #C8E2D2; color: #1E3F30; border: none; outline: none; border-radius: 14px; padding: 12px 10px; font-size: 13px; font-weight: 900; cursor: pointer; box-shadow: 2.5px 4px 10px rgba(70, 130, 95, 0.25); transition: all 0.15s ease;">Сохранить</button>',
        '    </div>',
        '  </form>',
        '</div>'
      ].join('');
      document.body.appendChild(modal);

      var close = function () {
        modal.classList.remove('active');
        modal.style.display = 'none';
        modal.style.pointerEvents = 'none';
      };
      var closeBtn = document.getElementById('pass-modal-close');
      if (closeBtn) closeBtn.addEventListener('click', close);
      var cancelBtn = document.getElementById('pass-modal-cancel');
      if (cancelBtn) cancelBtn.addEventListener('click', close);
      modal.addEventListener('click', function (e) {
        if (e.target === modal) close();
      });

      var formEl = document.getElementById('pass-modal-form');
      if (formEl) {
        formEl.addEventListener('submit', function (e) {
          e.preventDefault();
          var client = clients.find(function (c) { return c.id === selectedClientId; });
          if (!client) return;
          var inCred = document.getElementById('pass-in-credentials');
          var inUrl = document.getElementById('pass-in-url');
          var credentials = (inCred ? inCred.value : '').trim();
          var url = (inUrl ? inUrl.value : '').trim();

          updateClient(client.id, { passwords: credentials, passwordUrl: url });
          showToast('Доступы обновлены ♡');
          close();
        });
      }
    }

    function openPasswordsModal() {
      injectPasswordsModal();
      var client = clients.find(function (c) { return c.id === selectedClientId; });
      if (!client) return;
      var modal = document.getElementById('mytables-passwords-modal');
      var inCred = document.getElementById('pass-in-credentials');
      if (inCred) inCred.value = client.passwords || '';
      var inUrl = document.getElementById('pass-in-url');
      if (inUrl) inUrl.value = client.passwordUrl || '';
      if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.pointerEvents = 'auto';
      }
      if (inCred && typeof inCred.focus === 'function') inCred.focus();
    }

    function toggleCustomSelect(containerId) {
      if (typeof document === 'undefined') return;
      var container = document.getElementById(containerId);
      if (!container) return;
      var isOpen = container.classList.contains('open');
      var all = document.querySelectorAll('.custom-select');
      for (var i = 0; i < all.length; i++) {
        all[i].classList.remove('open');
      }
      if (!isOpen) {
        container.classList.add('open');
      }
    }

    function setSelectValue(containerId, value, text, dotColor) {
      if (typeof document === 'undefined') return;
      var container = document.getElementById(containerId);
      if (!container) return;
      var valSpan = container.querySelector('.custom-select-val');
      if (valSpan) {
        valSpan.innerHTML = '<span class="status-dot" style="background:' + dotColor + ';"></span><span>' + escapeHtml(text) + '</span>';
      }
      container.classList.remove('open');
      container.setAttribute('data-value', value);
    }

    function selectModalColor(color) {
      selectedModalColor = color;
      if (typeof document === 'undefined') return;
      var circles = document.querySelectorAll('.palette-circle');
      for (var i = 0; i < circles.length; i++) {
        var circle = circles[i];
        if (circle.getAttribute('data-color') === color) {
          circle.classList.add('selected');
        } else {
          circle.classList.remove('selected');
        }
      }
    }

    function openInteractiveModal(type, clientId) {
      if (typeof document === 'undefined') return;
      var overlay = document.getElementById('interactive-modal-overlay');
      var title = document.getElementById('overlay-modal-title');
      var body = document.getElementById('overlay-modal-body');
      var actions = document.getElementById('overlay-modal-actions');
      if (!overlay || !title || !body || !actions) return;

      var targetId = clientId || selectedClientId;
      var client = clients.find(function (c) { return c.id === targetId; }) || clients[0];

      if (type === 'add') {
        selectedModalColor = 'mint';
        title.innerHTML = '<span style="color:#1E3F30;">+</span> Новый клиент ♡';
        body.innerHTML = [
          '<div class="field-group">',
          '  <label class="field-label">Имя клиента / Организация *</label>',
          '  <input type="text" id="add-client-name" class="field-input" placeholder="Например: Мария Соколова">',
          '</div>',
          '<div class="field-group">',
          '  <label class="field-label">Номер телефона</label>',
          '  <input type="tel" id="add-client-phone" class="field-input" placeholder="+7 999 123-45-67">',
          '  <span class="field-hint">Для Google Таблиц телефон сохраняется с апострофом (\'+7...)</span>',
          '</div>',
          '<div class="field-group">',
          '  <label class="field-label">Проект / Услуга</label>',
          '  <input type="text" id="add-client-project" class="field-input" placeholder="Например: Дизайн сайта">',
          '</div>',
          '<div class="field-group">',
          '  <label class="field-label">Статус клиента</label>',
          '  <div class="custom-select" id="popup-select-status" data-value="work">',
          '    <button type="button" class="custom-select-trigger" onclick="window.MyTablesClients.toggleCustomSelect(\'popup-select-status\')">',
          '      <span class="custom-select-val">',
          '        <span class="status-dot" style="background:#2D9C5E;"></span>',
          '        <span>В работе (активный проект)</span>',
          '      </span>',
          '      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
          '    </button>',
          '    <div class="custom-select-dropdown">',
          '      <div class="custom-select-option" onclick="window.MyTablesClients.setSelectValue(\'popup-select-status\', \'work\', \'В работе (активный проект)\', \'#2D9C5E\')"><span class="status-dot" style="background:#2D9C5E;"></span><span>В работе (активный проект)</span></div>',
          '      <div class="custom-select-option" onclick="window.MyTablesClients.setSelectValue(\'popup-select-status\', \'waiting\', \'Ожидает (пауза / материалы)\', \'#D4A72C\')"><span class="status-dot" style="background:#D4A72C;"></span><span>Ожидает (пауза / материалы)</span></div>',
          '      <div class="custom-select-option" onclick="window.MyTablesClients.setSelectValue(\'popup-select-status\', \'discuss\', \'Обсуждение (первые переговоры)\', \'#2B82D9\')"><span class="status-dot" style="background:#2B82D9;"></span><span>Обсуждение (первые переговоры)</span></div>',
          '      <div class="custom-select-option" onclick="window.MyTablesClients.setSelectValue(\'popup-select-status\', \'done\', \'Завершён (проект сдан)\', \'#9B8A78\')"><span class="status-dot" style="background:#9B8A78;"></span><span>Завершён (проект сдан)</span></div>',
          '    </div>',
          '  </div>',
          '</div>',
          '<div class="field-group">',
          '  <label class="field-label">Цвет карточки</label>',
          '  <div class="palette-row">',
          '    <button type="button" class="palette-circle selected" data-color="mint" style="background:#C8E2D2;" onclick="window.MyTablesClients.selectModalColor(\'mint\')" title="Мята"></button>',
          '    <button type="button" class="palette-circle" data-color="peach" style="background:#FCD6CF;" onclick="window.MyTablesClients.selectModalColor(\'peach\')" title="Персик"></button>',
          '    <button type="button" class="palette-circle" data-color="lavender" style="background:#DBCCE9;" onclick="window.MyTablesClients.selectModalColor(\'lavender\')" title="Лаванда"></button>',
          '    <button type="button" class="palette-circle" data-color="blue" style="background:#D3E7F8;" onclick="window.MyTablesClients.selectModalColor(\'blue\')" title="Небо"></button>',
          '    <button type="button" class="palette-circle" data-color="honey" style="background:#FDF1CC;" onclick="window.MyTablesClients.selectModalColor(\'honey\')" title="Сливки"></button>',
          '    <button type="button" class="palette-circle" data-color="sand" style="background:#FAF2E7;" onclick="window.MyTablesClients.selectModalColor(\'sand\')" title="Песок"></button>',
          '  </div>',
          '</div>'
        ].join('');
        actions.innerHTML = [
          '<button type="button" class="btn-action-modal cancel" onclick="window.MyTablesClients.closeModal()">Отмена</button>',
          '<button type="button" class="btn-action-modal save" onclick="window.MyTablesClients.submitAddForm()">Сохранить клиента</button>'
        ].join('');
      } else if (type === 'edit') {
        if (!client) return;
        selectedModalColor = client.color || 'mint';
        var curStatus = STATUS_CONFIG[client.status] || STATUS_CONFIG.discuss;
        title.innerHTML = '<span>✎</span> Редактировать • ' + escapeHtml(client.name);
        body.innerHTML = [
          '<input type="hidden" id="edit-client-id" value="' + client.id + '">',
          '<div class="field-group">',
          '  <label class="field-label">Имя клиента *</label>',
          '  <input type="text" id="edit-client-name" class="field-input" value="' + escapeHtml(client.name) + '">',
          '</div>',
          '<div class="field-group">',
          '  <label class="field-label">Телефон</label>',
          '  <input type="tel" id="edit-client-phone" class="field-input" value="' + escapeHtml(displayPhone(client.phone)) + '">',
          '</div>',
          '<div class="field-group">',
          '  <label class="field-label">Проект</label>',
          '  <input type="text" id="edit-client-project" class="field-input" value="' + escapeHtml(client.project) + '">',
          '</div>',
          '<div class="field-group">',
          '  <label class="field-label">Статус</label>',
          '  <div class="custom-select" id="popup-select-status" data-value="' + client.status + '">',
          '    <button type="button" class="custom-select-trigger" onclick="window.MyTablesClients.toggleCustomSelect(\'popup-select-status\')">',
          '      <span class="custom-select-val">',
          '        <span class="status-dot" style="background:' + curStatus.dotColor + ';"></span>',
          '        <span>' + curStatus.title + '</span>',
          '      </span>',
          '      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
          '    </button>',
          '    <div class="custom-select-dropdown">',
          '      <div class="custom-select-option" onclick="window.MyTablesClients.setSelectValue(\'popup-select-status\', \'work\', \'В работе\', \'#2D9C5E\')"><span class="status-dot" style="background:#2D9C5E;"></span><span>В работе</span></div>',
          '      <div class="custom-select-option" onclick="window.MyTablesClients.setSelectValue(\'popup-select-status\', \'waiting\', \'Ожидает\', \'#D4A72C\')"><span class="status-dot" style="background:#D4A72C;"></span><span>Ожидает</span></div>',
          '      <div class="custom-select-option" onclick="window.MyTablesClients.setSelectValue(\'popup-select-status\', \'discuss\', \'Обсуждение\', \'#2B82D9\')"><span class="status-dot" style="background:#2B82D9;"></span><span>Обсуждение</span></div>',
          '      <div class="custom-select-option" onclick="window.MyTablesClients.setSelectValue(\'popup-select-status\', \'done\', \'Завершён\', \'#9B8A78\')"><span class="status-dot" style="background:#9B8A78;"></span><span>Завершён</span></div>',
          '    </div>',
          '  </div>',
          '</div>',
          '<div class="field-group">',
          '  <label class="field-label">Заметка</label>',
          '  <textarea id="edit-client-notes" class="field-textarea">' + escapeHtml(client.notes) + '</textarea>',
          '</div>'
        ].join('');
        actions.innerHTML = [
          '<button type="button" class="btn-action-modal delete" onclick="window.MyTablesClients.openArchiveModal(\'' + client.id + '\')">Удалить</button>',
          '<button type="button" class="btn-action-modal cancel" onclick="window.MyTablesClients.closeModal()">Отмена</button>',
          '<button type="button" class="btn-action-modal save" onclick="window.MyTablesClients.submitEditForm()">Сохранить</button>'
        ].join('');
      } else if (type === 'archive') {
        if (!client) return;
        title.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg> Удаление клиента';
        body.innerHTML = [
          '<p style="font-size: 13.5px; font-weight: 700; color: #4D3118; line-height: 1.45;">',
          '  Удалить клиента <b>«' + escapeHtml(client.name) + '»</b> из активного списка?',
          '</p>',
          '<p style="font-size: 11.5px; font-weight: 600; color: #726453; line-height: 1.4;">',
          '  Клиент скроется из списка, а все данные и пароли сохранятся в архиве Google Таблиц.',
          '</p>'
        ].join('');
        actions.innerHTML = [
          '<button type="button" class="btn-action-modal cancel" onclick="window.MyTablesClients.closeModal()">Отмена</button>',
          '<button type="button" class="btn-action-modal delete" onclick="window.MyTablesClients.confirmArchiveModal(\'' + client.id + '\')">Удалить</button>'
        ].join('');
      }

      overlay.classList.add('active');
      overlay.style.display = 'flex';
      overlay.style.pointerEvents = 'auto';

      if (type === 'add') {
        attachPhoneFormatter('add-client-phone');
      } else if (type === 'edit') {
        attachPhoneFormatter('edit-client-phone');
      }
    }

    function attachPhoneFormatter(inputId) {
      if (typeof document === 'undefined') return;
      var inputEl = document.getElementById(inputId);
      if (!inputEl || inputEl._phoneFormatterAttached) return;
      inputEl._phoneFormatterAttached = true;
      inputEl.addEventListener('input', function () {
        var raw = this.value;
        var digits = raw.replace(/\D/g, '');
        if (!digits) {
          this.value = '';
          return;
        }
        if (digits[0] === '7' || digits[0] === '8') {
          digits = digits.slice(1);
        }
        var res = '+7';
        if (digits.length > 0) res += ' ' + digits.slice(0, 3);
        if (digits.length > 3) res += ' ' + digits.slice(3, 6);
        if (digits.length > 6) res += ' ' + digits.slice(6, 8);
        if (digits.length > 8) res += ' ' + digits.slice(8, 10);
        this.value = res;
      });
    }

    function closeModal() {
      if (typeof document === 'undefined') return;
      var overlay = document.getElementById('interactive-modal-overlay');
      if (overlay) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
        overlay.style.pointerEvents = 'none';
      }
    }

    function openAddModal() {
      openInteractiveModal('add');
    }

    function openEditModal(clientId) {
      openInteractiveModal('edit', clientId);
    }

    function openArchiveModal(clientId) {
      openInteractiveModal('archive', clientId);
    }

    function submitAddForm() {
      if (typeof document === 'undefined') return;
      var nameInput = document.getElementById('add-client-name');
      var phoneInput = document.getElementById('add-client-phone');
      var projectInput = document.getElementById('add-client-project');
      var selectContainer = document.getElementById('popup-select-status');

      var name = nameInput ? nameInput.value : '';
      var phone = phoneInput ? phoneInput.value : '';
      var project = projectInput ? projectInput.value : '';
      var status = (selectContainer && selectContainer.getAttribute('data-value')) || 'work';

      var res = addClient({
        name: name,
        phone: phone,
        project: project,
        status: status,
        color: selectedModalColor
      });

      if (!res) {
        alert('Пожалуйста, укажите имя клиента ♡');
        return;
      }

      closeModal();
      showToast('Новый клиент успешно добавлен ♡');
    }

    function submitEditForm() {
      if (typeof document === 'undefined') return;
      var idInput = document.getElementById('edit-client-id');
      var nameInput = document.getElementById('edit-client-name');
      var phoneInput = document.getElementById('edit-client-phone');
      var projectInput = document.getElementById('edit-client-project');
      var notesInput = document.getElementById('edit-client-notes');
      var selectContainer = document.getElementById('popup-select-status');

      var id = idInput ? idInput.value : selectedClientId;
      var name = nameInput ? nameInput.value : '';
      var phone = phoneInput ? phoneInput.value : '';
      var project = projectInput ? projectInput.value : '';
      var notes = notesInput ? notesInput.value : '';
      var status = (selectContainer && selectContainer.getAttribute('data-value')) || 'work';

      if (!name || !name.trim()) {
        alert('Имя клиента обязательно ♡');
        return;
      }

      updateClient(id, {
        name: name,
        phone: phone,
        project: project,
        notes: notes,
        status: status
      });

      closeModal();
      showToast('Данные клиента обновлены ♡');
    }

    function confirmArchiveModal(clientId) {
      var id = clientId || selectedClientId;
      archiveClient(id);
      closeModal();
      showToast('Клиент перенесён в архив ♡');
    }

    function init() {
      syncToMainScreen();
      renderClients();

      if (typeof document !== 'undefined') {
        // Close select dropdowns on outside click
        document.addEventListener('click', function (e) {
          if (!e.target.closest || !e.target.closest('.custom-select')) {
            var selects = document.querySelectorAll('.custom-select');
            for (var i = 0; i < selects.length; i++) {
              selects[i].classList.remove('open');
            }
          }
        });
      }
    }

    return {
      validateClient: validateClient,
      canonicalStatus: canonicalStatus,
      normalizeClient: normalizeClient,
      sanitizePhoneForStorage: sanitizePhoneForStorage,
      displayPhone: displayPhone,
      getCleanPhoneDigits: getCleanPhoneDigits,
      getWhatsAppUrl: getWhatsAppUrl,
      sortClients: sortClients,
      filterClients: filterClients,
      selectClient: selectClient,
      getSelectedClientId: getSelectedClientId,
      switchMobileView: switchMobileView,
      setFilter: setFilter,
      setClients: setClients,
      setClientsFromSync: setClientsFromSync,
      getClients: getActiveClients,
      getActiveClients: getActiveClients,
      getAllClients: getAllClients,
      getActiveWorkCount: getActiveWorkCount,
      addClient: addClient,
      updateClient: updateClient,
      archiveClient: archiveClient,
      addClientLink: addClientLink,
      editClientLink: editClientLink,
      togglePasswordVisibility: togglePasswordVisibility,
      openAddModal: openAddModal,
      openEditModal: openEditModal,
      openArchiveModal: openArchiveModal,
      openInteractiveModal: openInteractiveModal,
      closeModal: closeModal,
      selectModalColor: selectModalColor,
      toggleCustomSelect: toggleCustomSelect,
      setSelectValue: setSelectValue,
      submitAddForm: submitAddForm,
      submitEditForm: submitEditForm,
      confirmArchiveModal: confirmArchiveModal,
      copyText: copyText,
      copyPassword: copyPassword,
      showToast: showToast,
      openAddLinkPrompt: openAddLinkPrompt,
      openEditLinkPrompt: openEditLinkPrompt,
      openPasswordsModal: openPasswordsModal,
      formatPhone: formatPhone,
      displayPhone: displayPhone,
      getRawCallPhone: getRawCallPhone,
      renderClients: renderClients,
      renderClientLists: renderClientLists,
      renderDossiers: renderDossiers,
      syncToMainScreen: syncToMainScreen,
      updateCounters: updateCounters,
      init: init
    };
  })();

  window.MyTablesClients = MyTablesClients;

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
      if (event.preventDefault) event.preventDefault();
      if (event.stopPropagation) event.stopPropagation();
    }
    if (!btn) return;

    var slip = btn.closest ? btn.closest('.expense-paper-slip') : null;
    var titleEl = slip ? slip.querySelector('.expense-item-name') : null;
    var title = titleEl ? titleEl.textContent.trim() : '';
    var willBePaid = !btn.classList.contains('paid');

    // Немедленно обновляем саму нажатую кнопку
    if (willBePaid) {
      btn.classList.remove('unpaid');
      btn.classList.add('paid');
      btn.innerHTML = '<span class="status-dot"></span> Оплачено';
    } else {
      btn.classList.remove('paid');
      btn.classList.add('unpaid');
      btn.innerHTML = '<span class="status-dot"></span> Оплатить';
    }

    // 1. Синхронизируем состояние кнопок (десктоп и мобильный)
    if (title) {
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
    }

    // 2. Обновляем paidMonths в calendar.js и реактивно пересчитываем сводку на Главном экране
    try {
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
    } catch (err) {
      console.warn('Calendar sync warning:', err);
    }
  };

  // --- МОДАЛЬНЫЕ ОКНА ДОБАВЛЕНИЯ ЗАПИСЕЙ (ЗОЛОТОЙ СТАНДАРТ АНИ) ---
  var currentTargetCategory = null;
  var customExpenseCategories = [];

  try {
    if (typeof localStorage !== 'undefined') {
      var savedCats = localStorage.getItem('mytables_custom_expense_categories');
      if (savedCats) customExpenseCategories = JSON.parse(savedCats);
    }
  } catch (e) {}

  var EXPENSE_BASE_CATEGORIES = {
    'ai': { name: 'ИИ сервисы', color: '#FCE8D5', badge: 'AI' },
    'internet': { name: 'Интернет и связь', color: '#C8E2D2', badge: 'NET' },
    'vpn': { name: 'VPN', color: '#D3E7F8', badge: 'VPN' }
  };

  function getCategoryMeta(catId) {
    if (EXPENSE_BASE_CATEGORIES[catId]) return EXPENSE_BASE_CATEGORIES[catId];
    for (var i = 0; i < customExpenseCategories.length; i++) {
      if (customExpenseCategories[i].id === catId) return customExpenseCategories[i];
    }
    return { name: catId, color: '#FCE8D5', badge: catId ? catId.slice(0, 2).toUpperCase() : '♡' };
  }

  function renderRecentExpensesOnMain() {
    if (typeof document === 'undefined') return;
    var deskExpenseContainer = document.getElementById('desk-expense-items');
    if (!deskExpenseContainer) return;

    var payments = [];
    if (window.MyTablesCalendar && window.MyTablesCalendar.state && window.MyTablesCalendar.state.payments) {
      payments = window.MyTablesCalendar.state.payments.filter(function (p) { return !p.isArchived; });
    }
    if (!payments.length && window.allData && window.allData.expenses) {
      payments = window.allData.expenses.filter(function (p) { return !p.isArchived; });
    }

    if (payments.length > 0) {
      var recentExpenses = payments.slice(-4).reverse();
      deskExpenseContainer.innerHTML = recentExpenses.map(function (item, idx) {
        var title = item.title || item['Название / Где'] || item['Категория'] || 'Расход';
        var sum = formatRub(item.currentRate || item.amount || item['Сумма'] || 0);
        var day = item.dayOfMonth || item.day || 15;
        var date = '• ' + day + ' число';
        var id = item.id || item.ID || ('exp_' + idx);
        var dotColor = item.color || PALETTE_COLORS[(idx + 2) % PALETTE_COLORS.length];
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
    } else {
      deskExpenseContainer.innerHTML = '<div style="font-size: 11px; font-weight: 600; color: #8A4C42; padding: 12px 8px; text-align: center; opacity: 0.85;">Пока нет платежей ♡</div>';
    }
  }
  window.renderRecentExpensesOnMain = renderRecentExpensesOnMain;

  function injectCategoryModal() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('mytables-category-modal')) return;

    var catModal = document.createElement('div');
    catModal.id = 'mytables-category-modal';
    catModal.className = 'mytables-modal-backdrop';
    catModal.style.display = 'none';
    catModal.style.pointerEvents = 'none';
    catModal.innerHTML = [
      '<div class="mytables-paper-modal" style="max-width: 440px; width: 100%; background: #FAF2E7; border-radius: 24px; padding: 22px 20px; box-shadow: 6px 14px 35px rgba(130, 105, 80, 0.28), -3px -3px 10px rgba(255, 255, 255, 0.9); border: none; text-align: left;">',
      '  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">',
      '    <div style="font-size: 18px; font-weight: 900; color: #2F261D; display: flex; align-items: center; gap: 6px;">',
      '      <span>+ Новая категория</span> <span style="color: #E27D60;">♡</span>',
      '    </div>',
      '    <button type="button" id="cat-modal-close" style="background: none; border: none; font-size: 20px; font-weight: 800; cursor: pointer; color: #8C784C; outline: none;">✕</button>',
      '  </div>',
      '  <form id="cat-modal-form" onsubmit="return false;">',
      '    <div style="background: #FCE8D5; border-radius: 18px; padding: 16px; box-shadow: 3px 5px 14px rgba(170, 130, 95, 0.2), -2px -2px 6px rgba(255, 255, 255, 0.85); margin-bottom: 16px; border: none;">',
      '      <div style="margin-bottom: 12px;">',
      '        <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 5px;">Название категории</label>',
      '        <input type="text" id="cat-in-name" placeholder="Например: Подписки, Серверы, Офис" style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 11px 14px; font-size: 13px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); font-family: inherit;" required>',
      '      </div>',
      '      <div style="margin-bottom: 14px;">',
      '        <label style="font-size: 11px; font-weight: 800; color: #6D3E14; display: block; margin-bottom: 7px;">Цвет карточки</label>',
      '        <div id="cat-color-dots-row" style="display: flex; gap: 12px; align-items: center;">',
      '          <button type="button" class="cat-color-opt active" data-color="#FCE8D5" style="width: 32px; height: 32px; border-radius: 50%; background: #FCE8D5; border: none; cursor: pointer; box-shadow: 2px 4px 8px rgba(120, 90, 60, 0.28); transform: scale(1.12); outline: none; display: flex; align-items: center; justify-content: center; padding: 0;"><svg class="exp-check-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3D2B1F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>',
      '          <button type="button" class="cat-color-opt" data-color="#C8E2D2" style="width: 32px; height: 32px; border-radius: 50%; background: #C8E2D2; border: none; cursor: pointer; box-shadow: 1px 2px 4px rgba(120, 90, 60, 0.15); outline: none; display: flex; align-items: center; justify-content: center; padding: 0;"></button>',
      '          <button type="button" class="cat-color-opt" data-color="#D3E7F8" style="width: 32px; height: 32px; border-radius: 50%; background: #D3E7F8; border: none; cursor: pointer; box-shadow: 1px 2px 4px rgba(120, 90, 60, 0.15); outline: none; display: flex; align-items: center; justify-content: center; padding: 0;"></button>',
      '          <button type="button" class="cat-color-opt" data-color="#FDF1CC" style="width: 32px; height: 32px; border-radius: 50%; background: #FDF1CC; border: none; cursor: pointer; box-shadow: 1px 2px 4px rgba(120, 90, 60, 0.15); outline: none; display: flex; align-items: center; justify-content: center; padding: 0;"></button>',
      '          <button type="button" class="cat-color-opt" data-color="#FCD6CF" style="width: 32px; height: 32px; border-radius: 50%; background: #FCD6CF; border: none; cursor: pointer; box-shadow: 1px 2px 4px rgba(120, 90, 60, 0.15); outline: none; display: flex; align-items: center; justify-content: center; padding: 0;"></button>',
      '          <button type="button" class="cat-color-opt" data-color="#DBCCE9" style="width: 32px; height: 32px; border-radius: 50%; background: #DBCCE9; border: none; cursor: pointer; box-shadow: 1px 2px 4px rgba(120, 90, 60, 0.15); outline: none; display: flex; align-items: center; justify-content: center; padding: 0;"></button>',
      '        </div>',
      '      </div>',
      '      <div style="border-top: 1px dashed rgba(180, 135, 95, 0.25); padding-top: 12px; margin-top: 12px;">',
      '        <div style="font-size: 11px; font-weight: 800; color: #6D3E14; margin-bottom: 8px;">Первый платёж (необязательно)</div>',
      '        <div style="margin-bottom: 8px;">',
      '          <input type="text" id="cat-in-first-title" placeholder="Название услуги (например: Notion, Figma)" style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 9px 12px; font-size: 12px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); font-family: inherit;">',
      '        </div>',
      '        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">',
      '          <input type="number" id="cat-in-first-day" min="1" max="31" placeholder="Число (1-31)" style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 9px 12px; font-size: 12px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); font-family: inherit;">',
      '          <input type="number" id="cat-in-first-amount" min="1" placeholder="Сумма ₽" style="width: 100%; box-sizing: border-box; background: #FAF4EB; border: none; outline: none; border-radius: 12px; padding: 9px 12px; font-size: 12px; font-weight: 700; color: #2F261D; box-shadow: inset 1.5px 2px 4px rgba(130, 100, 70, 0.15); font-family: inherit;">',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div style="display: flex; gap: 10px; align-items: center; justify-content: stretch;">',
      '      <button type="button" id="cat-modal-cancel" style="flex: 1; min-height: 44px; background: #FDF1CC; color: #5B481D; border: none; outline: none; border-radius: 14px; padding: 12px 10px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 2.5px 4px 10px rgba(160, 125, 85, 0.22); transition: all 0.15s ease;">Отмена</button>',
      '      <button type="submit" id="cat-modal-submit" style="flex: 1; min-height: 44px; background: #C8E2D2; color: #1E3F30; border: none; outline: none; border-radius: 14px; padding: 12px 10px; font-size: 13px; font-weight: 900; cursor: pointer; box-shadow: 2.5px 4px 10px rgba(70, 130, 95, 0.25); transition: all 0.15s ease;">Сохранить</button>',
      '    </div>',
      '  </form>',
      '</div>'
    ].join('');
    document.body.appendChild(catModal);

    var selectedCatColor = '#FCE8D5';
    var checkSvg = '<svg class="exp-check-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3D2B1F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    var catColorBtns = catModal.querySelectorAll('.cat-color-opt');

    function selectCatColor(color) {
      selectedCatColor = color || '#FCE8D5';
      for (var i = 0; i < catColorBtns.length; i++) {
        var btnColor = catColorBtns[i].getAttribute('data-color');
        if (btnColor && btnColor.toLowerCase() === selectedCatColor.toLowerCase()) {
          catColorBtns[i].classList.add('active');
          catColorBtns[i].innerHTML = checkSvg;
          catColorBtns[i].style.boxShadow = '2px 3.5px 7px rgba(120, 90, 60, 0.22), -1.5px -1.5px 3.5px rgba(255, 255, 255, 0.95), inset 1px 1px 0 rgba(255, 255, 255, 0.9)';
          catColorBtns[i].style.transform = 'scale(1.12)';
        } else {
          catColorBtns[i].classList.remove('active');
          catColorBtns[i].innerHTML = '';
          catColorBtns[i].style.boxShadow = '1.5px 2.5px 5px rgba(120, 90, 60, 0.14), -1px -1px 2.5px rgba(255, 255, 255, 0.9)';
          catColorBtns[i].style.transform = 'scale(1)';
        }
      }
    }

    for (var ci = 0; ci < catColorBtns.length; ci++) {
      catColorBtns[ci].addEventListener('click', function () {
        selectCatColor(this.getAttribute('data-color'));
      });
    }

    var closeCat = function () {
      catModal.classList.remove('active');
      catModal.style.display = 'none';
      catModal.style.pointerEvents = 'none';
    };
    var closeBtn = document.getElementById('cat-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeCat);
    var cancelBtn = document.getElementById('cat-modal-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', closeCat);
    catModal.addEventListener('click', function (e) {
      if (e.target === catModal) closeCat();
    });

    var formEl = document.getElementById('cat-modal-form');
    if (formEl) {
      formEl.addEventListener('submit', function (e) {
        e.preventDefault();
        var nameInput = document.getElementById('cat-in-name');
        var catName = (nameInput ? nameInput.value : '').trim();
        if (!catName) {
          alert('Пожалуйста, введите название категории');
          return;
        }

        var catId = 'cat_' + Date.now();
        var badge = catName.slice(0, 2).toUpperCase();
        var newCatObj = {
          id: catId,
          name: catName,
          color: selectedCatColor,
          badge: badge
        };

        customExpenseCategories.push(newCatObj);
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('mytables_custom_expense_categories', JSON.stringify(customExpenseCategories));
          }
        } catch (err) {}

        // Рендерим новую карточку категории на десктопе и мобильном
        spawnCategoryCard(newCatObj);

        // Проверяем первый платёж
        var firstTitle = (document.getElementById('cat-in-first-title') ? document.getElementById('cat-in-first-title').value : '').trim();
        var firstDay = parseInt(document.getElementById('cat-in-first-day') ? document.getElementById('cat-in-first-day').value : '15', 10) || 15;
        var firstAmount = Number(document.getElementById('cat-in-first-amount') ? document.getElementById('cat-in-first-amount').value : 0) || 0;

        if (firstTitle && firstAmount > 0) {
          var slipHtml = [
            '<div class="expense-paper-slip">',
            '  <div class="expense-item-left">',
            '    <div class="service-logo-circle" style="color: ' + selectedCatColor + ';">',
            '      <span style="font-weight:900; font-size:13px; color:#2F261D;">' + escapeHtml(firstTitle.charAt(0).toUpperCase()) + '</span>',
            '    </div>',
            '    <div class="expense-item-info">',
            '      <span class="expense-item-name">' + escapeHtml(firstTitle) + '</span>',
            '      <div class="expense-item-sub">',
            '        <span class="expense-item-price">' + formatRub(firstAmount) + '</span>',
            '        <span class="expense-item-date">• ' + firstDay + ' число</span>',
            '      </div>',
            '    </div>',
            '  </div>',
            '  <div class="expense-item-right">',
            '    <button class="status-pill unpaid" onclick="window.toggleExpenseItemStatus(event, this)"><span class="status-dot"></span> Оплатить</button>',
            '  </div>',
            '</div>'
          ].join('');

          var deskCard = document.querySelector('#desk-view-expenses .expense-cat-card[data-category="' + catId + '"]');
          if (deskCard) {
            var list = deskCard.querySelector('.cat-items-list');
            if (list) {
              var ep = list.querySelector('.cat-empty-prompt');
              if (ep) ep.remove();
              list.insertAdjacentHTML('beforeend', slipHtml);
            }
          }
          var mobCard = document.querySelector('#mob-view-expenses .expense-cat-card[data-category="' + catId + '"]');
          if (mobCard) {
            var mList = mobCard.querySelector('.cat-items-list');
            if (mList) {
              var mep = mList.querySelector('.cat-empty-prompt');
              if (mep) mep.remove();
              mList.insertAdjacentHTML('beforeend', slipHtml);
            }
          }

          if (window.MyTablesCalendar && window.MyTablesCalendar.state) {
            var expD = new Date();
            var expY = expD.getFullYear();
            var expM = String(expD.getMonth() + 1).padStart(2, '0');
            var expDD = String(firstDay).padStart(2, '0');
            var firstDateStr = expY + '-' + expM + '-' + expDD;

            var newCatExpense = {
              id: 'exp_' + Date.now(),
              title: firstTitle,
              name: firstTitle,
              date: firstDateStr,
              Дата: firstDateStr,
              dayOfMonth: firstDay,
              day: firstDay,
              currentRate: firstAmount,
              amount: firstAmount,
              shopUrl: '#',
              color: selectedCatColor,
              category: catId,
              paidMonths: [],
              isArchived: false
            };

            if (!window.MyTablesCalendar.state.payments) window.MyTablesCalendar.state.payments = [];
            window.MyTablesCalendar.state.payments.push(newCatExpense);
            if (window.MyTablesCalendar.state.data && Array.isArray(window.MyTablesCalendar.state.data.expenses)) {
              window.MyTablesCalendar.state.data.expenses.push(newCatExpense);
            }
            if (typeof window.MyTablesCalendar.updateSummaryCards === 'function') {
              window.MyTablesCalendar.updateSummaryCards();
            }
            if (typeof window.MyTablesCalendar.renderCalendar === 'function') {
              window.MyTablesCalendar.renderCalendar();
            }
          }
          renderRecentExpensesOnMain();
        }

        closeCat();
      });
    }
  }

  function spawnCategoryCard(cat) {
    if (typeof document === 'undefined') return;
    var colorClass = (cat.color === '#FCE8D5' || cat.color === '#FCD6CF') ? 'pink' : ((cat.color === '#C8E2D2') ? 'mint' : ((cat.color === '#D3E7F8') ? 'blue' : ''));
    var customBg = (!colorClass && cat.color) ? ('background: ' + cat.color + ';') : '';

    var cardHtml = [
      '<div class="expense-cat-card ' + colorClass + '" data-category="' + cat.id + '" style="' + customBg + '">',
      '  <div class="cat-card-header">',
      '    <div class="cat-title-left">',
      '      <div class="cat-badge-icon">' + escapeHtml(cat.badge || '♡') + '</div>',
      '      <span class="cat-name">' + escapeHtml(cat.name) + '</span>',
      '    </div>',
      '    <button class="cat-add-btn" title="Добавить подписку" onclick="window.openAddExpenseModal ? window.openAddExpenseModal(\'' + cat.id + '\', \'' + cat.color + '\') : null">',
      '      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
      '    </button>',
      '  </div>',
      '  <div class="cat-items-list">',
      '    <div class="cat-empty-prompt" style="padding: 12px 14px; text-align: center; color: #7A6E5F; font-size: 12px; font-weight: 700;">Пока нет платежей ♡</div>',
      '  </div>',
      '</div>'
    ].join('');

    var deskGrid = document.querySelector('#desk-view-expenses .desk-categories-grid');
    if (deskGrid && !deskGrid.querySelector('.expense-cat-card[data-category="' + cat.id + '"]')) {
      deskGrid.insertAdjacentHTML('beforeend', cardHtml);
    }
    var mobList = document.querySelector('#mob-view-expenses .expenses-scroll-list');
    if (mobList && !mobList.querySelector('.expense-cat-card[data-category="' + cat.id + '"]')) {
      mobList.insertAdjacentHTML('beforeend', cardHtml);
    }
  }

  function openAddExpenseCategoryModal() {
    injectCategoryModal();
    var catModal = document.getElementById('mytables-category-modal');
    var inName = document.getElementById('cat-in-name');
    if (inName) inName.value = '';
    var inFirstTitle = document.getElementById('cat-in-first-title');
    if (inFirstTitle) inFirstTitle.value = '';
    var inFirstDay = document.getElementById('cat-in-first-day');
    if (inFirstDay) inFirstDay.value = '';
    var inFirstAmount = document.getElementById('cat-in-first-amount');
    if (inFirstAmount) inFirstAmount.value = '';

    if (catModal) {
      catModal.classList.add('active');
      catModal.style.display = 'flex';
      catModal.style.pointerEvents = 'auto';
    }
    if (inName && typeof inName.focus === 'function') inName.focus();
  }
  window.openAddExpenseCategoryModal = openAddExpenseCategoryModal;
  root.openAddExpenseCategoryModal = openAddExpenseCategoryModal;

  function openAddExpenseModal(targetCat, targetColor) {
    if (!targetCat) {
      openAddExpenseCategoryModal();
      return;
    }
    injectAddModal();
    if (typeof window._realOpenAddExpenseModal === 'function') {
      window._realOpenAddExpenseModal(targetCat, targetColor);
    }
  }
  window.openAddExpenseModal = openAddExpenseModal;
  root.openAddExpenseModal = openAddExpenseModal;

  function openEditExpenseModal(title, slipEl) {
    injectAddModal();
    if (typeof window._realOpenEditExpenseModal === 'function') {
      window._realOpenEditExpenseModal(title, slipEl);
    }
  }
  window.openEditExpenseModal = openEditExpenseModal;
  root.openEditExpenseModal = openEditExpenseModal;

  function injectAddModal() {
    // 1. Модальное окно РАСХОДОВ (строго 4 поля + палитра кружочков, персик #FCE8D5, сливки #FDF1CC, мята #C8E2D2, без рамок)
    if (!document.getElementById('mytables-expense-modal')) {
      var expModal = document.createElement('div');
      expModal.id = 'mytables-expense-modal';
      expModal.className = 'mytables-modal-backdrop';
      expModal.style.display = 'none';
      expModal.style.pointerEvents = 'none';
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

      window._realOpenAddExpenseModal = function (targetCat, targetColor) {
        currentEditingSlip = null;
        currentEditingPayment = null;
        currentTargetCategory = targetCat || null;

        var meta = targetCat ? getCategoryMeta(targetCat) : null;
        var chosenColor = targetColor || (meta ? meta.color : '#D3E7F8');

        var modalTitle = expModal.querySelector('.mytables-paper-modal > div:first-child span:first-child');
        if (modalTitle) {
          modalTitle.textContent = meta ? ('+ Новый расход: ' + meta.name + ' ♡') : '+ Новый расход';
        }

        document.getElementById('exp-in-title').value = '';
        document.getElementById('exp-in-day').value = new Date().getDate();
        document.getElementById('exp-in-amount').value = '';
        document.getElementById('exp-in-url').value = '';

        var archBtn = document.getElementById('exp-modal-archive');
        if (archBtn) archBtn.style.display = 'none';

        // При добавлении расхода в конкретную категорию скрываем палитру (цвет назначается автоматически)
        var dotsRow = document.getElementById('exp-color-dots-row');
        if (dotsRow && dotsRow.parentElement) {
          dotsRow.parentElement.style.display = targetCat ? 'none' : 'block';
        }

        selectColorDot(chosenColor);
        expModal.classList.add('active');
        expModal.style.display = 'flex';
        expModal.style.pointerEvents = 'auto';
        document.getElementById('exp-in-title').focus();
      };
      window.openAddExpenseModal = window._realOpenAddExpenseModal;
      root.openAddExpenseModal = window._realOpenAddExpenseModal;

      window._realOpenEditExpenseModal = function (title, slipEl) {
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
          day = p.dayOfMonth || p.day || 15;
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

        // Показываем палитру при редактировании
        var dotsRow = document.getElementById('exp-color-dots-row');
        if (dotsRow && dotsRow.parentElement) {
          dotsRow.parentElement.style.display = 'block';
        }

        selectColorDot(color);

        var archBtn = document.getElementById('exp-modal-archive');
        if (archBtn) archBtn.style.display = 'inline-flex';

        expModal.classList.add('active');
        expModal.style.display = 'flex';
        expModal.style.pointerEvents = 'auto';
        document.getElementById('exp-in-amount').focus();
      };
      window.openEditExpenseModal = window._realOpenEditExpenseModal;
      root.openEditExpenseModal = window._realOpenEditExpenseModal;

      var closeExpModal = function () {
        currentEditingSlip = null;
        currentEditingPayment = null;
        expModal.classList.remove('active');
        expModal.style.display = 'none';
        expModal.style.pointerEvents = 'none';
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

          // Проверяем все категории на опустение и восстанавливаем плашку «Пока нет платежей ♡»
          var allCatLists = document.querySelectorAll('#desk-view-expenses .cat-items-list, #mob-view-expenses .cat-items-list');
          for (var cli = 0; cli < allCatLists.length; cli++) {
            var listEl = allCatLists[cli];
            var slipsLeft = listEl.querySelectorAll('.expense-paper-slip');
            if (slipsLeft.length === 0 && !listEl.querySelector('.cat-empty-prompt')) {
              listEl.innerHTML = '<div class="cat-empty-prompt" style="padding: 12px 14px; text-align: center; color: #7A6E5F; font-size: 12px; font-weight: 700;">Пока нет платежей ♡</div>';
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
          renderRecentExpensesOnMain();
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
              if (sDate) sDate.textContent = '• ' + day + ' число';
              var sLogo = allSlips[sIdx].querySelector('.service-logo-circle');
              if (sLogo && selectedExpenseColor) {
                sLogo.style.color = selectedExpenseColor;
              }
            }
          }
          if (currentEditingPayment) {
            var editD = new Date();
            var editY = editD.getFullYear();
            var editM = String(editD.getMonth() + 1).padStart(2, '0');
            var editDD = String(day).padStart(2, '0');
            var editDateStr = editY + '-' + editM + '-' + editDD;

            currentEditingPayment.title = title;
            currentEditingPayment.currentRate = amount;
            currentEditingPayment.amount = amount;
            currentEditingPayment.dayOfMonth = day;
            currentEditingPayment.day = day;
            currentEditingPayment.date = editDateStr;
            currentEditingPayment.Дата = editDateStr;
            if (url) currentEditingPayment.shopUrl = url;
            currentEditingPayment.color = selectedExpenseColor;
            currentEditingPayment.isUpdate = true;

            if (window.MyTablesSync && typeof window.MyTablesSync.saveExpense === 'function') {
              window.MyTablesSync.saveExpense(currentEditingPayment).catch(function () {});
            }
          }
          if (window.MyTablesCalendar && typeof window.MyTablesCalendar.updateSummaryCards === 'function') {
            window.MyTablesCalendar.updateSummaryCards();
          }
          if (window.MyTablesCalendar && typeof window.MyTablesCalendar.renderCalendar === 'function') {
            window.MyTablesCalendar.renderCalendar();
          }
          renderRecentExpensesOnMain();
          if (typeof updateExpensesScreen === 'function') {
            updateExpensesScreen();
          }
          submitBtn.textContent = 'Сохранено ✓';
          setTimeout(function () {
            submitBtn.textContent = 'Сохранить';
            submitBtn.disabled = false;
            closeExpModal();
          }, 300);
          return;
        }

        // Категория платежа
        var cat = currentTargetCategory || 'other';
        if (cat === 'other') {
          var tLower = title.toLowerCase();
          if (tLower.indexOf('vpn') !== -1) cat = 'vpn';
          else if (tLower.indexOf('интернет') !== -1 || tLower.indexOf('телефон') !== -1 || tLower.indexOf('связь') !== -1 || tLower.indexOf('мегафон') !== -1 || tLower.indexOf('мтс') !== -1 || tLower.indexOf('билайн') !== -1 || tLower.indexOf('т-мобайл') !== -1) cat = 'internet';
          else if (tLower.indexOf('ai') !== -1 || tLower.indexOf('ии') !== -1 || tLower.indexOf('gpt') !== -1 || tLower.indexOf('claude') !== -1 || tLower.indexOf('gemini') !== -1 || tLower.indexOf('midjourney') !== -1) cat = 'ai';
        }

        var expD = new Date();
        var expY = expD.getFullYear();
        var expM = String(expD.getMonth() + 1).padStart(2, '0');
        var expDD = String(day).padStart(2, '0');
        var expDateStr = expY + '-' + expM + '-' + expDD;

        var newExpense = {
          id: 'exp_' + Date.now(),
          title: title,
          name: title,
          date: expDateStr,
          Дата: expDateStr,
          day: day,
          dayOfMonth: day,
          amount: amount,
          currentRate: amount,
          url: url || '#',
          shopUrl: url || '#',
          color: selectedExpenseColor,
          category: cat,
          paidMonths: [],
          isArchived: false
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
        var deskTargetCard = document.querySelector('#desk-view-expenses .expense-cat-card[data-category="' + cat + '"]') || (deskCards ? deskCards[targetColIndex] : null);
        if (deskTargetCard) {
          var deskList = deskTargetCard.querySelector('.cat-items-list');
          if (deskList) {
            var ep = deskList.querySelector('.cat-empty-prompt');
            if (ep) ep.remove();
            deskList.insertAdjacentHTML('beforeend', slipHtml);
          }
        }

        var mobCards = document.querySelectorAll('#mob-view-expenses .expense-cat-card');
        var mobTargetCard = document.querySelector('#mob-view-expenses .expense-cat-card[data-category="' + cat + '"]') || (mobCards ? mobCards[targetColIndex] : null);
        if (mobTargetCard) {
          var mobList = mobTargetCard.querySelector('.cat-items-list');
          if (mobList) {
            var mep = mobList.querySelector('.cat-empty-prompt');
            if (mep) mep.remove();
            mobList.insertAdjacentHTML('beforeend', slipHtml);
          }
        }

        // Добавляем в календарь и кэш
        if (window.MyTablesCalendar && window.MyTablesCalendar.state) {
          if (!window.MyTablesCalendar.state.payments) window.MyTablesCalendar.state.payments = [];
          window.MyTablesCalendar.state.payments.push(newExpense);
          if (window.MyTablesCalendar.state.data && Array.isArray(window.MyTablesCalendar.state.data.expenses)) {
            window.MyTablesCalendar.state.data.expenses.push(newExpense);
          }
          if (typeof window.MyTablesCalendar.updateSummaryCards === 'function') {
            window.MyTablesCalendar.updateSummaryCards();
          }
          if (typeof window.MyTablesCalendar.renderCalendar === 'function') {
            window.MyTablesCalendar.renderCalendar();
          }
        }
        renderRecentExpensesOnMain();
        if (typeof updateExpensesScreen === 'function') {
          updateExpensesScreen();
        }

        // Сохраняем в синхронизацию
        var syncPromise = (window.MyTablesSync && typeof window.MyTablesSync.saveExpense === 'function')
          ? window.MyTablesSync.saveExpense(newExpense)
          : Promise.resolve();

        syncPromise.then(function () {
          submitBtn.textContent = 'Сохранить';
          submitBtn.disabled = false;
          closeExpModal();
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
      modal.style.display = 'none';
      modal.style.pointerEvents = 'none';
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

      var closeModal = function () {
        modal.classList.remove('active');
        modal.style.display = 'none';
        modal.style.pointerEvents = 'none';
      };
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
    if (type === 'client') {
      if (window.MyTablesClients && typeof window.MyTablesClients.openAddModal === 'function') {
        window.MyTablesClients.openAddModal();
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
    modal.style.display = 'flex';
    modal.style.pointerEvents = 'auto';
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

  // Глобальный экспорт на root (window в браузере)
  root.MyTablesIncome = typeof MyTablesIncome !== 'undefined' ? MyTablesIncome : null;
  root.MyTablesClients = typeof MyTablesClients !== 'undefined' ? MyTablesClients : null;
  root.openAddExpenseModal = typeof window !== 'undefined' ? window.openAddExpenseModal : null;
  root.openEditExpenseModal = typeof window !== 'undefined' ? window.openEditExpenseModal : null;
  root.toggleExpenseItemStatus = typeof window !== 'undefined' ? window.toggleExpenseItemStatus : null;
  root.handleDeleteRow = typeof window !== 'undefined' ? window.handleDeleteRow : null;
  root.updateCurrentScreen = typeof window !== 'undefined' ? window.updateCurrentScreen : null;
  root.updateScreenData = typeof window !== 'undefined' ? window.updateScreenData : null;
  root.openAddModal = typeof window !== 'undefined' ? window.openAddModal : null;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      MyTablesIncome: typeof MyTablesIncome !== 'undefined' ? MyTablesIncome : null,
      MyTablesClients: typeof MyTablesClients !== 'undefined' ? MyTablesClients : null
    };
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
