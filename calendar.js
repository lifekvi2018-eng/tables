/**
 * ============================================================================
 * ПРОЕКТ «МОИ ТАБЛИЦЫ» — МОДУЛЬ КАЛЕНДАРЯ И ГЛАВНОГО ЭКРАНА (calendar.js)
 * ============================================================================
 * Стейдж 1: Интерактивный календарь, цветные точки оплат, тактильный поповер
 * со ссылкой на оплату и реактивное обновление плашек сводки.
 */

(function () {
  'use strict';

  var MONTH_NAMES = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  var MONTH_NAMES_GENITIVE = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  var DEFAULT_PAYMENTS = [];

  // 1. Количество дней в месяце
  function getDaysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  // 2. День недели начала месяца (Пн = 0, ..., Вс = 6)
  function getFirstDayOfWeek(year, monthIndex) {
    var day = new Date(year, monthIndex, 1).getDay();
    return day === 0 ? 6 : day - 1;
  }

  // 3. Переключение месяцев
  function navigateMonth(year, monthIndex, direction) {
    var nextM = monthIndex + direction;
    var nextY = year;
    if (nextM < 0) {
      nextM = 11;
      nextY--;
    } else if (nextM > 11) {
      nextM = 0;
      nextY++;
    }
    return {
      year: nextY,
      monthIndex: nextM
    };
  }

  // Вспомогательный хелпер для форматирования 'YYYY-MM'
  function formatYearMonth(year, monthIndex) {
    var m = (monthIndex + 1);
    return year + '-' + (m < 10 ? '0' + m : m);
  }

  // Нормализация структуры платежа из разных источников (Google Sheets или объект)
  function normalizePayment(item, idx) {
    var day = 0;
    if (item.dayOfMonth !== undefined && item.dayOfMonth !== null && item.dayOfMonth !== '') {
      day = Number(item.dayOfMonth);
    } else if (item.day !== undefined && item.day !== null && item.day !== '') {
      day = Number(item.day);
    } else if (item['День месяца'] !== undefined && item['День месяца'] !== null && item['День месяца'] !== '') {
      day = Number(item['День месяца']);
    }

    if (!day || isNaN(day) || day < 1 || day > 31) {
      var rawDate = String(item['Дата'] || item.date || '').trim();
      if (rawDate) {
        var isoMatch = rawDate.match(/^\d{4}-\d{2}-(\d{1,2})/);
        if (isoMatch) {
          day = parseInt(isoMatch[1], 10);
        } else {
          var dotMatch = rawDate.match(/^(\d{1,2})\.\d{1,2}\.\d{4}/);
          if (dotMatch) {
            day = parseInt(dotMatch[1], 10);
          } else {
            var anyMatch = rawDate.match(/(?:^\d{4}-\d{2}-|\.)(\d{1,2})/);
            if (anyMatch) day = parseInt(anyMatch[1], 10);
          }
        }
      }
    }
    if (!day || isNaN(day) || day < 1 || day > 31) day = 1;

    var rate = Number(item.currentRate || item['Сумма'] || item.amount || 0);
    var title = item.title || item['Название / Где'] || item['Название'] || 'Платёж';
    var isArchived = Boolean(item.isArchived || item['В архиве'] || item.status === 'archived');
    var shopUrl = item.shopUrl || item['Ссылка'] || item['Сайт'] || item.url || 'https://example.com';
    var paidMonths = Array.isArray(item.paidMonths) ? item.paidMonths : [];
    if (typeof item.paidMonths === 'string') {
      try {
        paidMonths = JSON.parse(item.paidMonths);
      } catch (e) {
        paidMonths = item.paidMonths.split(',').map(function (s) { return s.trim(); });
      }
    }

    var color = item.color;
    var cat = (item.category || item['Категория'] || '').toLowerCase();
    var tLow = title.toLowerCase();

    if (!color) {
      if (cat.indexOf('vpn') !== -1 || tLow.indexOf('vpn') !== -1) color = '#D3E7F8';
      else if (cat.indexOf('интернет') !== -1 || tLow.indexOf('интернет') !== -1 || cat.indexOf('net') !== -1) color = '#FCE8D5';
      else if (cat.indexOf('ии') !== -1 || cat.indexOf('ai') !== -1 || cat.indexOf('gpt') !== -1 || tLow.indexOf('chatgpt') !== -1) color = '#DBCCE9';
      else if (cat.indexOf('подписк') !== -1) color = '#FCD6CF';
      else if (tLow.indexOf('яблок') !== -1 || tLow.indexOf('красот') !== -1 || cat.indexOf('красот') !== -1) color = '#FDF1CC';
      else if (tLow.indexOf('заправ') !== -1 || tLow.indexOf('бензин') !== -1 || cat.indexOf('авто') !== -1) color = '#FCE8D5';
      else color = '#FDF1CC';
    }

    return {
      id: item.ID || item.id || ('exp_' + idx),
      title: title,
      category: cat || 'general',
      dayOfMonth: day,
      currentRate: rate,
      currency: item.currency || '₽',
      color: color,
      shopUrl: shopUrl,
      isArchived: isArchived,
      paidMonths: paidMonths,
      rawItem: item
    };
  }

  // 4. Проекция платежей на дни месяца с учетом коротких месяцев
  function projectRecurringPayments(payments, year, monthIndex) {
    var daysInMonth = getDaysInMonth(year, monthIndex);
    var projection = {};

    (payments || []).forEach(function (item, idx) {
      var p = normalizePayment(item, idx);
      if (p.isArchived) return;

      var effectiveDay = Math.min(p.dayOfMonth, daysInMonth);
      if (!projection[effectiveDay]) {
        projection[effectiveDay] = [];
      }
      projection[effectiveDay].push(p);
    });

    return projection;
  }

  // 5. Цветные кружочки на дату
  function getDayDots(paymentsForDay) {
    if (!paymentsForDay || !paymentsForDay.length) return [];
    return paymentsForDay.map(function (p) {
      return p.color || '#D3E7F8';
    });
  }

  // 6. Формирование данных поповера
  function buildPopoverData(paymentsForDay, yearMonth) {
    if (!paymentsForDay || !paymentsForDay.length) return [];
    return paymentsForDay.map(function (item) {
      var isPaid = Array.isArray(item.paidMonths) && item.paidMonths.indexOf(yearMonth) !== -1;
      return {
        id: item.id,
        title: item.title,
        amount: item.currentRate,
        color: item.color || '#D3E7F8',
        shopUrl: item.shopUrl || 'https://example.com',
        isPaid: isPaid,
        buttonText: isPaid ? '✓ Оплачено' : 'Оплатить',
        rawItem: item
      };
    });
  }

  // 7. Переключение оплаты (toggle) в контексте выбранного месяца
  function togglePaymentPaid(paymentItem, yearMonth) {
    if (!paymentItem.paidMonths) {
      paymentItem.paidMonths = [];
    }
    var idx = paymentItem.paidMonths.indexOf(yearMonth);
    var isPaid;
    if (idx !== -1) {
      paymentItem.paidMonths.splice(idx, 1);
      isPaid = false;
    } else {
      paymentItem.paidMonths.push(yearMonth);
      isPaid = true;
    }

    if (paymentItem.rawItem) {
      paymentItem.rawItem.paidMonths = paymentItem.paidMonths;
    }

    return {
      isPaid: isPaid,
      paidMonths: paymentItem.paidMonths
    };
  }

  // 8. Расчет сводных метрик
  function calcSummaryMetrics(data, yearMonth) {
    var incomeList = (data && data.income) || [];
    var expensesList = (data && data.expenses && data.expenses.length ? data.expenses : (state && state.payments)) || [];
    var clientsList = (data && data.clients) || [];

    // Доходы: только за указанный месяц
    var totalIncome = incomeList.reduce(function (sum, item) {
      var dateStr = String(item.date || item['Дата'] || '');
      var inMonth = false;
      if (dateStr.indexOf(yearMonth) === 0) {
        inMonth = true;
      } else {
        // Проверяем формат DD.MM.YYYY
        var parts = dateStr.split('.');
        if (parts.length === 3) {
          var formatted = parts[2] + '-' + (parts[1].length === 1 ? '0' + parts[1] : parts[1]);
          if (formatted === yearMonth) inMonth = true;
        }
      }
      if (inMonth) {
        return sum + Number(item.amount || item['Сумма'] || 0);
      }
      return sum;
    }, 0);

    // Расходы: неоплаченные активные подписки за указанный месяц
    var unpaidExpenses = expensesList.reduce(function (sum, item, idx) {
      var p = normalizePayment(item, idx);
      if (p.isArchived) return sum;
      var isPaid = p.paidMonths && p.paidMonths.indexOf(yearMonth) !== -1;
      if (!isPaid) {
        return sum + p.currentRate;
      }
      return sum;
    }, 0);

    // Клиенты: только со статусом 'work' или 'В работе' и не в архиве
    var activeClientsCount = clientsList.reduce(function (count, item) {
      if (!item) return count;
      var isArchived = Boolean(
        item.isArchived === true ||
        item['В_Архиве'] === true ||
        String(item['В_Архиве']).toUpperCase() === 'TRUE'
      );
      if (isArchived) return count;
      var status = String(item.status || item['Статус'] || '').trim().toLowerCase();
      if (status === 'work' || status === 'в работе') {
        return count + 1;
      }
      return count;
    }, 0);

    return {
      totalIncome: totalIncome,
      unpaidExpenses: unpaidExpenses,
      activeClientsCount: activeClientsCount
    };
  }

  // ==========================================================================
  // UI ИНТЕЛЛЕКТ И ИНТЕРАКТИВНОСТЬ (ДЛЯ БРАУЗЕРА)
  // ==========================================================================
  var state = {
    currentYear: 2026,
    currentMonthIdx: 9, // Октябрь 2026 по умолчанию
    payments: DEFAULT_PAYMENTS,
    data: { income: [], expenses: DEFAULT_PAYMENTS, clients: [] },
    activePopoverDay: null
  };

  function setCalendarData(allData) {
    if (!allData) return;
    state.data = allData;
    if (allData.expenses && allData.expenses.length > 0) {
      state.payments = allData.expenses;
    }
    renderCalendar();
    updateSummaryCards();
  }

  function getYearMonth() {
    return formatYearMonth(state.currentYear, state.currentMonthIdx);
  }

  function renderCalendar() {
    if (typeof document === 'undefined') return;

    var ym = getYearMonth();
    var daysInCurrentMonth = getDaysInMonth(state.currentYear, state.currentMonthIdx);
    var firstDayOfWeek = getFirstDayOfWeek(state.currentYear, state.currentMonthIdx);
    var projection = projectRecurringPayments(state.payments, state.currentYear, state.currentMonthIdx);

    // Дни предыдущего месяца для заполнения пустых ячеек в начале
    var prevMonthInfo = navigateMonth(state.currentYear, state.currentMonthIdx, -1);
    var daysInPrevMonth = getDaysInMonth(prevMonthInfo.year, prevMonthInfo.monthIndex);

    var titleText = MONTH_NAMES[state.currentMonthIdx] + ' ' + state.currentYear;

    // Обновляем заголовки календарей в десктопе и на мобилке
    var deskTitleEl = document.getElementById('desk-cal-title');
    if (deskTitleEl) deskTitleEl.innerText = titleText;
    var mobTitleEl = document.getElementById('mob-cal-title');
    if (mobTitleEl) mobTitleEl.innerText = titleText;

    // Рендер сетки десктопа
    renderCalendarGrid('desk', firstDayOfWeek, daysInCurrentMonth, daysInPrevMonth, projection);

    // Рендер сетки мобилки
    renderCalendarGrid('mob', firstDayOfWeek, daysInCurrentMonth, daysInPrevMonth, projection);

    // Закрываем открытый поповер при смене месяца
    hidePopover();
  }

  function renderCalendarGrid(mode, firstDayOfWeek, daysInMonth, daysInPrevMonth, projection) {
    var container = mode === 'desk'
      ? (document.getElementById('desk-cal-table') || document.querySelector('.desk-calendar-card .cal-table'))
      : (document.getElementById('mob-cal-table') || document.querySelector('.cal-box-mobile .cal-table'));

    if (!container) return;

    var html = [
      '<div class="cal-th" style="color: #8C784C; font-weight: 700; padding-bottom: 4px;">Пн</div>',
      '<div class="cal-th" style="color: #8C784C; font-weight: 700; padding-bottom: 4px;">Вт</div>',
      '<div class="cal-th" style="color: #8C784C; font-weight: 700; padding-bottom: 4px;">Ср</div>',
      '<div class="cal-th" style="color: #8C784C; font-weight: 700; padding-bottom: 4px;">Чт</div>',
      '<div class="cal-th" style="color: #8C784C; font-weight: 700; padding-bottom: 4px;">Пт</div>',
      '<div class="cal-th" style="color: #8C784C; font-weight: 700; padding-bottom: 4px;">Сб</div>',
      '<div class="cal-th" style="color: #8C784C; font-weight: 700; padding-bottom: 4px;">Вс</div>'
    ];

    // 1. Дни предыдущего месяца
    var prevStart = daysInPrevMonth - firstDayOfWeek + 1;
    for (var i = 0; i < firstDayOfWeek; i++) {
      var dPrev = prevStart + i;
      html.push('<div class="cal-td muted" style="color: #C2B088; padding: 4px 0; opacity: 0.6;">' + dPrev + '</div>');
    }

    // 2. Дни текущего месяца
    for (var d = 1; d <= daysInMonth; d++) {
      var paymentsForDay = projection[d] || [];
      var dots = getDayDots(paymentsForDay);

      var cellClasses = 'cal-td day-cell';
      var cellStyle = 'position: relative; cursor: pointer; padding: 4px 0; font-weight: 700; color: #4A3E25;';
      var content = String(d);

      if (dots.length === 1) {
        // Один платёж: число в нежном цветном кружке с правильным контрастным текстом
        var bg = dots[0];
        var textColor = '#4A3E25';
        if (bg === '#D3E7F8') textColor = '#1B4567';
        else if (bg === '#FCD6CF') textColor = '#6E2F26';
        else if (bg === '#FDF1CC' || bg === '#F7E4A8') textColor = '#5B481D';
        else if (bg === '#FCE8D5') textColor = '#6D3E14';
        else if (bg === '#DBCCE9') textColor = '#442B5B';

        cellStyle += ' background: ' + bg + '; color: ' + textColor + '; border-radius: 50%; width: 26px; height: 26px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1.5px 2.5px 5px rgba(140,115,90,0.18), inset 0 1px 0 rgba(255,255,255,0.9); font-weight: 800;';
      } else if (dots.length >= 2) {
        // Два или более платежей: аккуратная мягкая плашечка и мини-точки под числом (без грубых чёрных ободков)
        cellStyle += ' width: 28px; height: 28px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 10px; background: rgba(250, 244, 235, 0.7); box-shadow: 1px 2px 4px rgba(180, 155, 125, 0.15);';
        var visibleDots = dots.slice(0, 3);
        var dotsHtml = '<div style="display: flex; gap: 3px; align-items: center; justify-content: center; margin-top: 2px;">';
        visibleDots.forEach(function (color) {
          dotsHtml += '<span style="width: 5px; height: 5px; border-radius: 50%; background: ' + color + '; display: inline-block; box-shadow: 0 1px 2px rgba(100,80,60,0.2);"></span>';
        });
        dotsHtml += '</div>';
        content = '<span style="line-height: 1; font-size: 11px; font-weight: 800; color: #4A3E25;">' + d + '</span>' + dotsHtml;
      }

      html.push('<div class="' + cellClasses + '" style="' + cellStyle + '" data-day="' + d + '" onclick="window.MyTablesCalendar.onDayClick(event, ' + d + ')">' + content + '</div>');
    }

    // 3. Дни следующего месяца для завершения сетки
    var totalCells = firstDayOfWeek + daysInMonth;
    var remainingCells = (7 - (totalCells % 7)) % 7;
    for (var j = 1; j <= remainingCells; j++) {
      html.push('<div class="cal-td muted" style="color: #C2B088; padding: 4px 0; opacity: 0.6;">' + j + '</div>');
    }

    container.innerHTML = html.join('');
  }

  // Клик по дате в календаре: показ поповера
  function onDayClick(event, day) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    var ym = getYearMonth();
    var projection = projectRecurringPayments(state.payments, state.currentYear, state.currentMonthIdx);
    var paymentsForDay = projection[day] || [];

    if (!paymentsForDay.length) {
      hidePopover();
      return;
    }

    state.activePopoverDay = day;
    showPopover(day, paymentsForDay, event.currentTarget || event.target);
  }

  // Показ поповера
  function showPopover(day, payments, triggerEl) {
    hidePopover();

    var ym = getYearMonth();
    var popoverData = buildPopoverData(payments, ym);
    var dateTitle = day + ' ' + MONTH_NAMES_GENITIVE[state.currentMonthIdx];

    var popover = document.createElement('div');
    popover.id = 'calendar-tactile-popover';
    popover.className = 'tactile-popover';

    var itemsHtml = popoverData.map(function (item) {
      var isNeedPay = !item.isPaid;
      var btnClass = isNeedPay ? 'btn-pay-toggle need-pay' : 'btn-pay-toggle';
      var payBtnStyle = isNeedPay
        ? 'padding:9px 16px;border-radius:12px;border:none;font-size:12px;font-weight:900;cursor:pointer;background:#C8E2D2;color:#1E3F30;box-shadow:2px 3px 7px rgba(70,130,95,0.25),-1px -1px 2px rgba(255,255,255,0.8);'
        : 'padding:9px 16px;border-radius:12px;border:none;font-size:12px;font-weight:900;cursor:pointer;background:#EADBC8;color:#6A553E;box-shadow:inset 1px 1px 3px rgba(130,100,70,0.2);';

      // Вариант 2: плашка тёплый персик (#FCE8D5), кнопка «В магазин» тёплые сливки (#FDF1CC, не белая!), кнопка оплаты нежная мята (#C8E2D2). Без подводок!
      return [
        '<div class="popover-item" style="background:#FCE8D5;border:none;border-radius:18px;padding:14px;margin-bottom:10px;box-shadow:3px 5px 14px rgba(170,130,95,0.2),-2px -2px 6px rgba(255,255,255,0.85);">',
        '  <div class="popover-item-title" style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;color:#6D3E14;">',
        '    <span style="width:10px;height:10px;border-radius:50%;background:' + item.color + ';display:inline-block;box-shadow:0 1px 2px rgba(100,80,60,0.25);"></span>',
        '    <span>' + escapeHtml(item.title) + '</span>',
        '  </div>',
        '  <div class="popover-item-sum" style="font-size:18px;font-weight:900;color:#4A2708;margin:6px 0 12px 0;">' + item.amount.toLocaleString('ru-RU') + ' ₽</div>',
        '  <div class="popover-actions" style="display:flex;gap:8px;">',
        '    <a href="' + escapeHtml(item.shopUrl) + '" target="_blank" rel="noopener noreferrer" class="btn-shop-link" style="flex:1;padding:9px 12px;border-radius:12px;background:#FDF1CC;border:none;color:#5B481D;text-decoration:none;font-size:12px;font-weight:800;text-align:center;display:inline-flex;align-items:center;justify-content:center;gap:4px;box-shadow:2px 3px 6px rgba(160,125,85,0.2),-1px -1px 2px rgba(255,255,255,0.9);">В магазин ↗</a>',
        '    <button class="' + btnClass + '" data-id="' + item.id + '" onclick="window.MyTablesCalendar.onPayToggleClick(event, \'' + item.id + '\', ' + day + ')" style="' + payBtnStyle + '">' + item.buttonText + '</button>',
        '  </div>',
        '</div>'
      ].join('');
    }).join('');

    popover.innerHTML = [
      '<div class="popover-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">',
      '  <span class="popover-date-title" style="font-size:14px;font-weight:900;color:#2F261D;">Платежи на ' + dateTitle + '</span>',
      '  <button class="popover-close-btn" onclick="window.MyTablesCalendar.hidePopover()" style="background:none;border:none;font-size:16px;font-weight:900;color:#726453;cursor:pointer;padding:4px;">✕</button>',
      '</div>',
      '<div class="popover-items-list">' + itemsHtml + '</div>'
    ].join('');

    // Позиционирование
    var isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // Мобильная шторка
      var overlay = document.createElement('div');
      overlay.id = 'popover-backdrop';
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(40,30,20,0.4);z-index:999;backdrop-filter:blur(2px);';
      overlay.onclick = hidePopover;
      document.body.appendChild(overlay);

      popover.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;max-width:380px;margin:0 auto;z-index:1000;background:#FAF2E7;border-radius:24px;padding:18px;box-shadow:6px 14px 35px rgba(130,105,80,0.32);border:none;animation:slideUp 0.2s ease;';
      document.body.appendChild(popover);
    } else {
      // Десктопное всплывающее окно: чистый бумажный стиль БЕЗ рамок и подводок
      var calCard = document.querySelector('.desk-calendar-card');
      if (calCard) {
        calCard.style.position = 'relative';
        popover.style.cssText = 'position:absolute;top:70px;right:20px;width:310px;background:#FAF2E7;border-radius:24px;padding:18px;box-shadow:6px 14px 35px rgba(130,105,80,0.28), -3px -3px 10px rgba(255,255,255,0.9);border:none;z-index:100;';
        calCard.appendChild(popover);
      } else {
        document.body.appendChild(popover);
      }
    }
  }

  function hidePopover() {
    if (typeof document === 'undefined') return;
    var popover = document.getElementById('calendar-tactile-popover');
    if (popover && popover.parentNode) {
      popover.parentNode.removeChild(popover);
    }
    var overlay = document.getElementById('popover-backdrop');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    state.activePopoverDay = null;
  }

  // Обработка клика по кнопке «Оплачено / Оплатить» в поповере
  function onPayToggleClick(event, paymentId, day) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    var ym = getYearMonth();
    var payment = null;
    for (var i = 0; i < state.payments.length; i++) {
      var p = state.payments[i];
      if ((p.id || p.ID) === paymentId) {
        payment = p;
        break;
      }
    }

    if (!payment) return;

    // Переключаем статус в контексте просматриваемого месяца
    var res = togglePaymentPaid(payment, ym);

    // Реактивно обновляем плашку расходов
    updateSummaryCards();

    // Обновляем состояние кнопки в поповере (без рамок)
    var btn = event.currentTarget || event.target;
    if (btn) {
      if (res.isPaid) {
        btn.classList.remove('need-pay');
        btn.innerText = '✓ Оплачено';
        btn.style.background = '#EADBC8';
        btn.style.color = '#6A553E';
        btn.style.boxShadow = 'inset 1px 1px 3px rgba(130,100,70,0.2)';
      } else {
        btn.classList.add('need-pay');
        btn.innerText = 'Оплатить';
        btn.style.background = '#C8E2D2';
        btn.style.color = '#1E3F30';
        btn.style.boxShadow = '2px 3px 7px rgba(70,130,95,0.25), -1px -1px 2px rgba(255,255,255,0.8)';
      }
    }
  }

  // Реактивное обновление 3 плашек сводки
  function updateSummaryCards() {
    if (typeof document === 'undefined') return;

    var ym = getYearMonth();
    var metrics = calcSummaryMetrics(state.data, ym);

    // Доходы
    var incomeStr = metrics.totalIncome.toLocaleString('ru-RU') + ' ₽';
    var mobIncomeEl = document.getElementById('mob-income-sum');
    if (mobIncomeEl) mobIncomeEl.innerText = incomeStr;

    // Расходы (осталось оплатить)
    var expenseStr = metrics.unpaidExpenses.toLocaleString('ru-RU') + ' ₽';
    var mobExpenseEl = document.getElementById('mob-expense-sum');
    if (mobExpenseEl) mobExpenseEl.innerText = expenseStr;
    var deskExpenseRemEl = document.getElementById('desk-expenses-rem');
    if (deskExpenseRemEl) deskExpenseRemEl.innerText = expenseStr;

    // Клиенты
    var clientsStr = metrics.activeClientsCount + ' в работе';
    var mobClientsEl = document.getElementById('mob-clients-count');
    if (mobClientsEl) mobClientsEl.innerText = clientsStr;
    var deskClientsEl = document.getElementById('desk-clients-count');
    if (deskClientsEl) deskClientsEl.innerText = clientsStr;
  }

  function prevMonth() {
    var nav = navigateMonth(state.currentYear, state.currentMonthIdx, -1);
    state.currentYear = nav.year;
    state.currentMonthIdx = nav.monthIndex;
    renderCalendar();
    updateSummaryCards();
  }

  function nextMonth() {
    var nav = navigateMonth(state.currentYear, state.currentMonthIdx, 1);
    state.currentYear = nav.year;
    state.currentMonthIdx = nav.monthIndex;
    renderCalendar();
    updateSummaryCards();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Подключение стрелочек календаря в DOM
  function initCalendarControls() {
    if (typeof document === 'undefined') return;

    // Закрытие по Esc
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        hidePopover();
      }
    });

    // Закрытие при клике снаружи
    document.addEventListener('click', function (e) {
      var popover = document.getElementById('calendar-tactile-popover');
      if (popover && !popover.contains(e.target) && !e.target.closest('.day-cell')) {
        hidePopover();
      }
    });

    // Навешиваем слушатели на кнопки переключения месяцев
    document.querySelectorAll('.cal-nav-btn').forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var isPrev = (btn.getAttribute('title') || '').indexOf('Предыдущий') !== -1 || btn.innerText.indexOf('<') !== -1;
        if (isPrev) {
          prevMonth();
        } else {
          nextMonth();
        }
      };
    });

    renderCalendar();
    updateSummaryCards();
  }

  // Публичный интерфейс
  var MyTablesCalendar = {
    normalizePayment: normalizePayment,
    getDaysInMonth: getDaysInMonth,
    getFirstDayOfWeek: getFirstDayOfWeek,
    navigateMonth: navigateMonth,
    projectRecurringPayments: projectRecurringPayments,
    getDayDots: getDayDots,
    buildPopoverData: buildPopoverData,
    togglePaymentPaid: togglePaymentPaid,
    calcSummaryMetrics: calcSummaryMetrics,
    renderCalendar: renderCalendar,
    updateSummaryCards: updateSummaryCards,
    setCalendarData: setCalendarData,
    prevMonth: prevMonth,
    nextMonth: nextMonth,
    onDayClick: onDayClick,
    onPayToggleClick: onPayToggleClick,
    showPopover: showPopover,
    hidePopover: hidePopover,
    initCalendarControls: initCalendarControls,
    state: state
  };

  if (typeof window !== 'undefined') {
    window.MyTablesCalendar = MyTablesCalendar;
    document.addEventListener('DOMContentLoaded', function () {
      initCalendarControls();
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MyTablesCalendar;
  }
})();
