const fs = require('fs');

const mainLines = fs.readFileSync('main_screen.html', 'utf8').split('\n');
const incomeLines = fs.readFileSync('income_screen.html', 'utf8').split('\n');
const expensesLines = fs.readFileSync('expenses_screen.html', 'utf8').split('\n');
const clientsLines = fs.readFileSync('clients_screen.html', 'utf8').split('\n');

function getStyles(html) {
  const m = html.match(/<style>([\s\S]*?)<\/style>/i);
  return m ? m[1] : '';
}

// Извлекаем все стили
const allStyles = [
  getStyles(fs.readFileSync('main_screen.html', 'utf8')),
  getStyles(fs.readFileSync('income_screen.html', 'utf8')),
  getStyles(fs.readFileSync('expenses_screen.html', 'utf8')),
  getStyles(fs.readFileSync('clients_screen.html', 'utf8'))
].join('\n\n');

// 1. Десктопные секции
// main: строки 947 до 1224
const deskMainContent = mainLines.slice(946, 1224).join('\n');
// income: строки 1028 до 1208
const deskIncomeContent = incomeLines.slice(1027, 1208).join('\n');
// expenses: строки 988 до 1198
const deskExpensesContent = expensesLines.slice(987, 1198).join('\n');
// clients: строки 1170 до 1405
const deskClientsContent = clientsLines.slice(1169, 1405).join('\n');

// 2. Мобильные секции
// main: строки 773 до 870
const mobMainContent = mainLines.slice(773, 870).join('\n');
// income: строки 776 до 945
const mobIncomeContent = incomeLines.slice(776, 945).join('\n');
// expenses: строки 695 до 915
const mobExpensesContent = expensesLines.slice(695, 915).join('\n');
// clients: строки 830 до 1094
const mobClientsContent = clientsLines.slice(830, 1094).join('\n');

const unifiedHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Мои таблицы ♡</title>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800;900&display=swap" rel="stylesheet">

  <style>
    ${allStyles}

    /* АДАПТИВНОЕ ПЕРЕКЛЮЧЕНИЕ ДЕСКТОП / МОБИЛЬНЫЙ */
    @media (min-width: 901px) {
      .desktop-only { display: block !important; }
      .mobile-only { display: none !important; }
    }
    @media (max-width: 900px) {
      .desktop-only { display: none !important; }
      .mobile-only { display: flex !important; }
      body { padding: 12px 10px !important; }
    }

    body {
      background: #FAF2E7 !important;
      color: #383025;
      font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif !important;
      min-height: 100vh;
      margin: 0;
      padding: 20px 16px;
    }

    /* СТИЛИ АКТИВНЫХ ТАБОВ В САЙДБАРЕ */
    .desk-nav-btn {
      min-height: 44px;
      border-radius: 14px;
      padding: 0 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      font-weight: 800;
      color: #5A4E40;
      background: transparent;
      border: none;
      cursor: pointer;
      width: 100%;
      text-align: left;
      font-family: 'Manrope', sans-serif !important;
      transition: all 0.15s ease;
    }
    .desk-nav-btn:hover {
      background: #EFE4D6;
      color: #2F261D;
    }
    .desk-nav-btn.active {
      background: #5A4E40;
      color: #FAF4EB;
      box-shadow: 0 4px 14px rgba(90, 78, 64, 0.28);
    }
    .desk-nav-btn.active.main-tab { background: #5A4E40; color: #FAF4EB; }
    .desk-nav-btn.active.income-tab { background: #1E3F30; color: #FAF4EB; }
    .desk-nav-btn.active.expenses-tab { background: #6E2F26; color: #FAF4EB; }
    .desk-nav-btn.active.clients-tab { background: #16324F; color: #FAF4EB; }

    /* МОБИЛЬНЫЙ ТАБ-БАР */
    .mob-tab-btn {
      width: 44px;
      height: 44px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #7A6C5B;
      cursor: pointer;
      border: none;
      background: transparent;
      transition: all 0.15s ease;
    }
    .mob-tab-btn.active {
      background: #5A4E40;
      color: #FAF4EB;
      box-shadow: 2px 4px 10px rgba(90,78,64,0.3);
    }
  </style>
</head>
<body>

  <!-- ======================================================== -->
  <!-- 1. ДЕСКТОПНАЯ ВЕРСИЯ (ДЛЯ КОМПЬЮТЕРА ВО ВЕСЬ ЭКРАН)       -->
  <!-- ======================================================== -->
  <div id="desktop-app" class="desktop-only">
    <div class="desktop-window" style="max-width: 1360px; margin: 0 auto; min-height: 860px; display: grid; grid-template-columns: 210px 1fr; gap: 24px;">
      
      <!-- ЛЕВЫЙ САЙДБАР ДЕСКТОПА -->
      <div class="desk-sidebar" style="display: flex; flex-direction: column; gap: 6px;">
        
        <!-- Профиль Кристины -->
        <div class="sidebar-user-chip" style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 12px; background: #F2E5D5; border-radius: 16px; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);">
          <div class="sidebar-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: #FAF2E7; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #5A4E40;">К</div>
          <div style="flex: 1; min-width: 0;">
            <div class="sidebar-user-name" style="font-size: 13px; font-weight: 800; color: #2F261D;">Кристина</div>
            <div class="mytables-user-email" style="font-size: 10px; color: #726453; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">lifekvi2018@gmail.com</div>
          </div>
          <button class="mytables-logout-btn" title="Выйти" style="background: none; border: none; cursor: pointer; color: #726453; padding: 2px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>

        <!-- Кнопки переключения 4 экранов -->
        <button class="desk-nav-btn main-tab active" data-tab="main" onclick="switchAppTab('main')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Мой мир ♡</span>
        </button>

        <button class="desk-nav-btn income-tab" data-tab="income" onclick="switchAppTab('income')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          <span>Доходы</span>
        </button>

        <button class="desk-nav-btn expenses-tab" data-tab="expenses" onclick="switchAppTab('expenses')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span>Расходы</span>
        </button>

        <button class="desk-nav-btn clients-tab" data-tab="clients" onclick="switchAppTab('clients')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>Клиенты</span>
        </button>

        <div style="margin-top: auto; padding: 12px 0 0 0;">
          <a href="https://docs.google.com/spreadsheets/d/1_WIuzh1mgiHVd_YUDdGXnon75cij9ApqRG3GV6_8ZGY/edit" target="_blank" class="desk-nav-btn" style="text-decoration: none; font-size: 11px; opacity: 0.75;" title="Открыть Google Таблицу">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span>Google Таблица ↗</span>
          </a>
        </div>

      </div>

      <!-- ОСНОВНОЙ КОНТЕНТ ДЕСКТОПА (ПЕРЕКЛЮЧАЕТСЯ БЕЗ ПЕРЕЗАГРУЗКИ) -->
      <div style="flex: 1; min-width: 0;">
        <div id="desk-view-main" class="app-tab-pane active">${deskMainContent}</div>
        <div id="desk-view-income" class="app-tab-pane" style="display:none;">${deskIncomeContent}</div>
        <div id="desk-view-expenses" class="app-tab-pane" style="display:none;">${deskExpensesContent}</div>
        <div id="desk-view-clients" class="app-tab-pane" style="display:none;">${deskClientsContent}</div>
      </div>

    </div>
  </div>


  <!-- ======================================================== -->
  <!-- 2. МОБИЛЬНАЯ ВЕРСИЯ (ДЛЯ ТЕЛЕФОНА БЕЗ ЛИШНИХ РАМОК)       -->
  <!-- ======================================================== -->
  <div id="mobile-app" class="mobile-only" style="max-width: 440px; margin: 0 auto; width: 100%; min-height: 100vh; flex-direction: column;">
    
    <!-- Содержимое мобильного экрана -->
    <div style="flex: 1; padding-bottom: 70px;">
      <div id="mob-view-main" class="mob-tab-pane active">${mobMainContent}</div>
      <div id="mob-view-income" class="mob-tab-pane" style="display:none;">${mobIncomeContent}</div>
      <div id="mob-view-expenses" class="mob-tab-pane" style="display:none;">${mobExpensesContent}</div>
      <div id="mob-view-clients" class="mob-tab-pane" style="display:none;">${mobClientsContent}</div>
    </div>

    <!-- Мобильный таб-бар снизу экрана -->
    <div class="tabbar-box" style="position: fixed; bottom: 12px; left: 14px; right: 14px; max-width: 412px; margin: 0 auto; z-index: 100;">
      <button class="mob-tab-btn active" data-tab="main" onclick="switchAppTab('main')" title="Главная">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </button>

      <button class="mob-tab-btn" data-tab="income" onclick="switchAppTab('income')" title="Доходы">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
      </button>

      <button class="mob-tab-btn" data-tab="expenses" onclick="switchAppTab('expenses')" title="Расходы">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      </button>

      <button class="mob-tab-btn" data-tab="clients" onclick="switchAppTab('clients')" title="Клиенты">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </button>
    </div>

  </div>

  <script src="sync.js"></script>
  <script src="app.js"></script>

  <script>
    // ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ПРИЛОЖЕНИЯ
    window.currentActiveTab = 'main';

    function switchAppTab(tabName) {
      window.currentActiveTab = tabName;

      // 1. Десктопные табы
      document.querySelectorAll('.app-tab-pane').forEach(function (el) {
        el.style.display = 'none';
      });
      var deskPane = document.getElementById('desk-view-' + tabName);
      if (deskPane) deskPane.style.display = 'block';

      // 2. Мобильные табы
      document.querySelectorAll('.mob-tab-pane').forEach(function (el) {
        el.style.display = 'none';
      });
      var mobPane = document.getElementById('mob-view-' + tabName);
      if (mobPane) mobPane.style.display = 'block';

      // 3. Активные классы кнопок в сайдбаре
      document.querySelectorAll('.desk-nav-btn').forEach(function (btn) {
        if (btn.getAttribute('data-tab') === tabName) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // 4. Активные классы кнопок в мобильном таб-баре
      document.querySelectorAll('.mob-tab-btn').forEach(function (btn) {
        if (btn.getAttribute('data-tab') === tabName) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // 5. Прокрутка наверх при переключении
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // 6. Подгружаем свежие данные для открытого экрана
      if (typeof MyTablesSync !== 'undefined' && MyTablesSync.getAllData) {
        MyTablesSync.getAllData().then(function (res) {
          if (res && res.data && typeof window.updateScreenData === 'function') {
            window.updateScreenData(res.data, tabName);
          }
        });
      }
    }
  </script>

</body>
</html>
`;

fs.writeFileSync('index.html', unifiedHtml, 'utf8');
console.log('index.html successfully updated! Length:', unifiedHtml.length);
