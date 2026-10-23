const fs = require('fs');
const path = require('path');

const mockupsPath = path.resolve('макеты.html');
let html = fs.readFileSync(mockupsPath, 'utf8');

// 1. Update container width to 1180px for spacious side-by-side comparison
html = html.replace('.container {\n      max-width: 880px;', '.container {\n      max-width: 1180px;');

// 2. Extra CSS for Section 7
const extraStyles = `
    /* =========================================================================
       РАЗДЕЛ 7: 4 БОЕВЫХ ЭКРАНА (ТЕЛЕФОН + КОМПЬЮТЕР) С ЖИВОЙ ПАЛИТРОЙ
       ========================================================================= */
    :root {
      /* Палитра 1 по умолчанию (Точный Скриншот 1: Песок, Крем, Шалфей, Персик) */
      --scr-income-bg: linear-gradient(145deg, #E2EEE6, #D1E5DA);
      --scr-income-fg: #2D5847;
      --scr-income-pill: #3E735D;
      
      --scr-expense-bg: linear-gradient(145deg, #FDECE7, #F8D6CE);
      --scr-expense-fg: #8A4134;
      --scr-expense-pill: #B35848;

      --scr-clients-bg: linear-gradient(145deg, #E6EEF7, #D6E4F3);
      --scr-clients-fg: #2C5278;
      --scr-clients-pill: #3D6C9B;

      --scr-accent-bg: linear-gradient(145deg, #FFF1DB, #FCE2B6);
      --scr-accent-fg: #7A4E1A;

      --scr-badge-paid: linear-gradient(135deg, #D4EDDF, #BFE2CD);
      --scr-badge-paid-fg: #1F5438;
      --scr-badge-unpaid: linear-gradient(135deg, #FAF4ED, #E6D8C6);
      --scr-badge-unpaid-fg: #614F3D;

      --desktop-win-bg: #F7F2EA;
      --desktop-sidebar-bg: #EFE8DD;
      --desktop-card-bg: #FAF5EE;
    }

    .dark-theme {
      --scr-income-bg: linear-gradient(145deg, #1C332A, #152720);
      --scr-income-fg: #74C6A5;
      --scr-income-pill: #2C5243;

      --scr-expense-bg: linear-gradient(145deg, #3A2222, #2A1717);
      --scr-expense-fg: #F5A396;
      --scr-expense-pill: #5A2F2B;

      --scr-clients-bg: linear-gradient(145deg, #1E2B3E, #151F2E);
      --scr-clients-fg: #94C1EF;
      --scr-clients-pill: #2B4261;

      --scr-accent-bg: linear-gradient(145deg, #3A2F1A, #2A2111);
      --scr-accent-fg: #F3C474;

      --scr-badge-paid: linear-gradient(135deg, #1C3829, #152A1F);
      --scr-badge-paid-fg: #7AD6A2;
      --scr-badge-unpaid: linear-gradient(135deg, #2D3246, #202332);
      --scr-badge-unpaid-fg: #C9CFDF;

      --desktop-win-bg: #141722;
      --desktop-sidebar-bg: #1A1E2C;
      --desktop-card-bg: #222638;
    }

    /* Альтернативная Палитра 2: Мягкая пудра и зефир */
    body.palette-powder {
      --scr-income-bg: linear-gradient(145deg, #E6F4EA, #D4ECD9);
      --scr-income-fg: #28543B;
      --scr-expense-bg: linear-gradient(145deg, #FCE8EE, #F8CFDC);
      --scr-expense-fg: #7E314F;
      --scr-clients-bg: linear-gradient(145deg, #ECE5F8, #DDD2F3);
      --scr-clients-fg: #50377A;
      --scr-accent-bg: linear-gradient(145deg, #FFF0E6, #FCE0CF);
      --scr-accent-fg: #7D4828;
    }

    /* Альтернативная Палитра 3: Природный эвкалипт и лён */
    body.palette-eucalyptus {
      --scr-income-bg: linear-gradient(145deg, #DCEAE2, #C9DDD2);
      --scr-income-fg: #234837;
      --scr-expense-bg: linear-gradient(145deg, #F7E7DE, #ECCEC0);
      --scr-expense-fg: #77432F;
      --scr-clients-bg: linear-gradient(145deg, #DFE7EC, #CBD7DF);
      --scr-clients-fg: #314A57;
      --scr-accent-bg: linear-gradient(145deg, #EFE9D8, #DFD6BE);
      --scr-accent-fg: #5E5336;
    }

    /* Панель интерактивного переключения палитры */
    .palette-selector-card {
      background: var(--card-inner);
      border-radius: var(--radius);
      padding: 16px 20px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-marshmallow);
    }
    .palette-btn-group {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }
    .palette-btn {
      padding: 9px 16px;
      border-radius: 14px;
      font-size: 12px;
      font-weight: 800;
      border: 2px solid transparent;
      cursor: pointer;
      background: var(--card);
      color: var(--foreground);
      box-shadow: 2px 4px 10px rgba(0,0,0,0.08);
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .palette-btn:hover {
      transform: translateY(-2px);
    }
    .palette-btn.active {
      border-color: var(--ring);
      background: var(--secondary);
      box-shadow: 4px 6px 14px rgba(0,0,0,0.15);
    }
    .palette-chips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
      margin-top: 14px;
    }
    .palette-chip {
      padding: 8px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 800;
      text-align: center;
      box-shadow: 2px 3px 8px rgba(0,0,0,0.08);
    }

    /* Раскладка: Телефон + Компьютерное окно */
    .screen-duo-wrapper {
      display: flex;
      gap: 24px;
      align-items: flex-start;
      margin-top: 16px;
    }
    @media (max-width: 960px) {
      .screen-duo-wrapper {
        flex-direction: column;
        align-items: center;
      }
    }

    /* Компактный iPhone-корпус для экранов */
    .iphone-compact {
      width: 320px;
      flex-shrink: 0;
      background: #25282A;
      border-radius: 46px;
      padding: 10px;
      box-shadow: 0 20px 50px -10px rgba(110, 90, 75, 0.45), inset 0 0 3px 2px rgba(255, 255, 255, 0.2);
    }
    .dark-theme .iphone-compact {
      box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.85);
    }
    .iphone-compact-screen {
      background: var(--background-gradient);
      border-radius: 38px;
      padding: 12px 14px 16px 14px;
      overflow: hidden;
      min-height: 610px;
      display: flex;
      flex-direction: column;
      color: var(--foreground);
    }

    /* Десктопное окно приложения */
    .desktop-app-window {
      flex: 1;
      min-width: 0;
      background: var(--desktop-win-bg);
      border-radius: 22px;
      box-shadow: 0 20px 50px -8px rgba(130, 110, 95, 0.35), inset 1px 1px 2px rgba(255,255,255,0.7);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border);
    }
    .dark-theme .desktop-app-window {
      box-shadow: 0 20px 50px -8px rgba(0,0,0,0.75), inset 1px 1px 2px rgba(255,255,255,0.06);
    }
    .desktop-window-bar {
      padding: 12px 16px;
      background: var(--desktop-sidebar-bg);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .mac-dots {
      display: flex;
      gap: 6px;
    }
    .mac-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .mac-dot-red { background: #FF5F56; }
    .mac-dot-yellow { background: #FFBD2E; }
    .mac-dot-green { background: #27C93F; }

    .desktop-body-layout {
      display: flex;
      min-height: 540px;
    }
    .desktop-sidebar {
      width: 155px;
      flex-shrink: 0;
      background: var(--desktop-sidebar-bg);
      padding: 16px 10px;
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .desktop-nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 800;
      color: var(--muted);
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .desktop-nav-link:hover {
      background: rgba(0,0,0,0.04);
      color: var(--foreground);
    }
    .desktop-nav-link.active {
      background: var(--scr-accent-bg);
      color: var(--scr-accent-fg);
      box-shadow: 2px 3px 8px rgba(0,0,0,0.06);
    }
    .desktop-main-content {
      flex: 1;
      padding: 18px;
      background: var(--desktop-win-bg);
      overflow-x: auto;
    }

    /* Виджет календаря */
    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
      text-align: center;
      margin-top: 8px;
    }
    .cal-header-cell {
      font-size: 10px;
      font-weight: 800;
      color: var(--muted);
      padding: 2px;
    }
    .cal-day-cell {
      aspect-ratio: 1;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      background: var(--card);
      box-shadow: 1px 2px 4px rgba(0,0,0,0.04);
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    .cal-day-cell:hover {
      transform: scale(1.08);
      z-index: 2;
    }
    .cal-day-muted {
      opacity: 0.4;
      background: transparent;
      box-shadow: none;
    }
    .cal-day-highlight {
      background: var(--scr-accent-bg);
      color: var(--scr-accent-fg);
      box-shadow: 2px 3px 8px rgba(0,0,0,0.12);
      font-weight: 900;
    }
    .cal-event-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      position: absolute;
      bottom: 3px;
    }

    /* Интерактивные строки платежей и сервисов */
    .service-row-card {
      background: var(--card);
      border-radius: 14px;
      padding: 9px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      box-shadow: 2px 3px 8px rgba(0,0,0,0.05);
      transition: transform 0.15s ease;
    }
    .service-row-card:hover {
      transform: translateY(-2px);
    }
`;

// Insert extra styles right before </style>
html = html.replace('</style>', extraStyles + '\n  </style>');

// 3. Section 7 HTML Content
const section7Html = `
    <!-- =============================================================== -->
    <!-- РАЗДЕЛ 7. ИНТЕРАКТИВНЫЕ МАКЕТЫ 4 БОЕВЫХ ЭКРАНОВ (SHADCN UI)    -->
    <!-- =============================================================== -->
    <div class="ui-card" style="margin-bottom: 32px;" id="section-7-screens">
      <div class="ui-card-header">
        <div class="ui-card-title">
          <span class="badge-num-3d">7</span>
          4 боевых экрана системы (Сравнение: Телефон + Компьютер)
        </div>
        <span class="ui-badge ui-badge-default">Точно по референсам</span>
      </div>

      <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px; line-height: 1.5;">
        Макеты собраны по модульной анатомии <strong>shadcn/ui</strong>. Цветовая основа взята из <strong>Скриншота 1</strong> (тёплый сливочный крем, шалфей, персик и небесная дымка). Ниже ты можешь в один клик примерить 3 варианта палитры!
      </p>

      <!-- Интерактивный блок выбора палитры -->
      <div class="palette-selector-card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <strong style="font-size: 13px;">🎨 Выбери палитру для примерки:</strong>
            <div style="font-size: 11px; color: var(--muted); margin-top: 2px;">Кликни по кнопке, и цвета на всех 4 экранах ниже мгновенно переключатся</div>
          </div>
          <span class="ui-badge ui-badge-secondary" id="active-palette-name">Палитра 1 активна</span>
        </div>

        <div class="palette-btn-group">
          <button class="palette-btn active" id="btn-pal-1" onclick="selectPalette('default', 'Палитра 1 (Скриншот 1: Песок, Крем, Шалфей)')">
            <span>🌾</span> 1. Тёплый песок и крем (как на 1-м скрине)
          </button>
          <button class="palette-btn" id="btn-pal-2" onclick="selectPalette('powder', 'Палитра 2 (Зефир, Пудра и Лаванда)')">
            <span>🌸</span> 2. Нежный зефир и пудра
          </button>
          <button class="palette-btn" id="btn-pal-3" onclick="selectPalette('eucalyptus', 'Палитра 3 (Эвкалипт, Карамель и Лён)')">
            <span>🌿</span> 3. Природный эвкалипт и лён
          </button>
        </div>

        <!-- Плашка с кодами цветов текущей палитры -->
        <div class="palette-chips-grid">
          <div class="palette-chip" style="background: var(--scr-income-bg); color: var(--scr-income-fg);">
            💰 Доходы<br><span style="font-size: 9px; opacity: 0.85;">Шалфей / Мята</span>
          </div>
          <div class="palette-chip" style="background: var(--scr-expense-bg); color: var(--scr-expense-fg);">
            📉 Расходы<br><span style="font-size: 9px; opacity: 0.85;">Персик / Роза</span>
          </div>
          <div class="palette-chip" style="background: var(--scr-clients-bg); color: var(--scr-clients-fg);">
            👥 Клиенты<br><span style="font-size: 9px; opacity: 0.85;">Небесная дымка</span>
          </div>
          <div class="palette-chip" style="background: var(--scr-accent-bg); color: var(--scr-accent-fg);">
            ✨ Календарь<br><span style="font-size: 9px; opacity: 0.85;">Тёплый крем</span>
          </div>
        </div>
      </div>


      <!-- ============================================================= -->
      <!-- 7.1. ЭКРАН 1: ГЛАВНЫЙ («МОЙ МИР ♡»)                           -->
      <!-- ============================================================= -->
      <div style="margin-top: 32px; border-top: 1px dashed var(--border); padding-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="font-size: 18px; font-weight: 900;">Экран 1: Главный («Мой мир ♡»)</h3>
            <p style="font-size: 12px; color: var(--muted);">Календарь с цветными метками, статус дня и быстрый переход в Доходы, Расходы и Клиенты</p>
          </div>
          <span class="ui-badge ui-badge-secondary">Скриншот 1</span>
        </div>

        <div class="screen-duo-wrapper">
          <!-- МОБИЛЬНЫЙ ВИД (IPHONE) -->
          <div class="iphone-compact">
            <div class="iphone-compact-screen">
              <div class="dynamic-island"><div class="camera-lens"></div></div>

              <div class="status-bar" style="margin-bottom: 8px;">
                <span>09:41</span>
                <span style="font-size: 11px;">100% 􀛨</span>
              </div>

              <!-- Шапка: Мой мир ♡ + Аватарка котика -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="font-size: 18px; font-weight: 900; letter-spacing: -0.3px;">Мой мир ♡</div>
                <div style="width: 34px; height: 34px; border-radius: 50%; background: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 2px 3px 8px rgba(0,0,0,0.1);">🐱</div>
              </div>

              <!-- Виджет календаря (Март 2025) -->
              <div style="background: var(--card); border-radius: 18px; padding: 12px; margin-bottom: 10px; box-shadow: 2px 4px 12px rgba(0,0,0,0.06);">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 900; margin-bottom: 6px;">
                  <span style="cursor: pointer;">‹</span>
                  <span>Март 2025</span>
                  <span style="cursor: pointer;">›</span>
                </div>
                <div class="cal-grid">
                  <div class="cal-header-cell">Пн</div>
                  <div class="cal-header-cell">Вт</div>
                  <div class="cal-header-cell">Ср</div>
                  <div class="cal-header-cell">Чт</div>
                  <div class="cal-header-cell">Пт</div>
                  <div class="cal-header-cell">Сб</div>
                  <div class="cal-header-cell">Вс</div>

                  <div class="cal-day-cell cal-day-muted">24</div>
                  <div class="cal-day-cell cal-day-muted">25</div>
                  <div class="cal-day-cell cal-day-muted">26</div>
                  <div class="cal-day-cell cal-day-muted">27</div>
                  <div class="cal-day-cell cal-day-muted">28</div>
                  <div class="cal-day-cell">1</div>
                  <div class="cal-day-cell">2</div>

                  <div class="cal-day-cell">3</div>
                  <div class="cal-day-cell">4<span class="cal-event-dot" style="background: #5A9BE6;"></span></div>
                  <div class="cal-day-cell">5</div>
                  <div class="cal-day-cell">6</div>
                  <div class="cal-day-cell">7<span class="cal-event-dot" style="background: #E86B6B;"></span></div>
                  <div class="cal-day-cell">8</div>
                  <div class="cal-day-cell">9</div>

                  <div class="cal-day-cell">10</div>
                  <div class="cal-day-cell">11</div>
                  <div class="cal-day-cell cal-day-highlight">12</div>
                  <div class="cal-day-cell">13</div>
                  <div class="cal-day-cell">14</div>
                  <div class="cal-day-cell">15<span class="cal-event-dot" style="background: #ECA348;"></span></div>
                  <div class="cal-day-cell">16</div>

                  <div class="cal-day-cell">17</div>
                  <div class="cal-day-cell">18</div>
                  <div class="cal-day-cell">19</div>
                  <div class="cal-day-cell">20</div>
                  <div class="cal-day-cell">21<span class="cal-event-dot" style="background: #E86B6B;"></span></div>
                  <div class="cal-day-cell">22</div>
                  <div class="cal-day-cell">23</div>
                </div>
              </div>

              <!-- 3 крупные плашки быстрого доступа (Зефирка) -->
              <!-- 1. Доходы -->
              <div style="background: var(--scr-income-bg); color: var(--scr-income-fg); border-radius: 18px; padding: 12px 14px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 3px 5px 12px rgba(0,0,0,0.08); cursor: pointer;" class="ui-btn-hover">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 20px;">👛</span>
                  <div>
                    <div style="font-size: 13px; font-weight: 900;">Доходы</div>
                    <div style="font-size: 11px; opacity: 0.9; font-weight: 700;">125 500 ₽</div>
                  </div>
                </div>
                <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--secondary); color: var(--foreground); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; box-shadow: 1px 2px 5px rgba(0,0,0,0.1);">›</div>
              </div>

              <!-- 2. Расходы -->
              <div style="background: var(--scr-expense-bg); color: var(--scr-expense-fg); border-radius: 18px; padding: 12px 14px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 3px 5px 12px rgba(0,0,0,0.08); cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 20px;">📊</span>
                  <div>
                    <div style="font-size: 13px; font-weight: 900;">Расходы</div>
                    <div style="font-size: 11px; opacity: 0.9; font-weight: 700;">28 400 ₽</div>
                  </div>
                </div>
                <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--secondary); color: var(--foreground); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; box-shadow: 1px 2px 5px rgba(0,0,0,0.1);">›</div>
              </div>

              <!-- 3. Клиенты -->
              <div style="background: var(--scr-clients-bg); color: var(--scr-clients-fg); border-radius: 18px; padding: 12px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 3px 5px 12px rgba(0,0,0,0.08); cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 20px;">👥</span>
                  <div>
                    <div style="font-size: 13px; font-weight: 900;">Клиенты</div>
                    <div style="font-size: 11px; opacity: 0.9; font-weight: 700;">12 активных</div>
                  </div>
                </div>
                <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--secondary); color: var(--foreground); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; box-shadow: 1px 2px 5px rgba(0,0,0,0.1);">›</div>
              </div>

              <!-- Нижний таббар -->
              <div class="bottom-tab-bar" style="margin-top: auto;">
                <div class="tab-item active"><span>🏠</span><span>Главная</span></div>
                <div class="tab-item"><span>📅</span><span>Календарь</span></div>
                <div class="tab-item"><span>📊</span><span>Отчёты</span></div>
                <div class="tab-item"><span>⚙️</span><span>Профиль</span></div>
              </div>
              <div class="home-indicator"></div>
            </div>
          </div>

          <!-- ДЕСКТОПНЫЙ ВИД (ОКНО ПРИЛОЖЕНИЯ) -->
          <div class="desktop-app-window">
            <div class="desktop-window-bar">
              <div class="mac-dots">
                <span class="mac-dot mac-dot-red"></span>
                <span class="mac-dot mac-dot-yellow"></span>
                <span class="mac-dot mac-dot-green"></span>
              </div>
              <div style="font-size: 12px; font-weight: 800; color: var(--muted); margin-left: 8px;">Мои таблицы — Главная</div>
              <div style="margin-left: auto; display: flex; align-items: center; gap: 12px;">
                <input type="text" placeholder="🔍 Поиск..." style="background: var(--card); border: 1px solid var(--border); padding: 5px 12px; border-radius: 12px; font-size: 11px; outline: none; width: 140px; color: var(--foreground);">
                <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 14px;">🐱</div>
              </div>
            </div>

            <div class="desktop-body-layout">
              <!-- Сайдбар -->
              <div class="desktop-sidebar">
                <div class="desktop-nav-link active"><span>🏠</span> Главная</div>
                <div class="desktop-nav-link"><span>📅</span> Календарь</div>
                <div class="desktop-nav-link"><span>💰</span> Доходы</div>
                <div class="desktop-nav-link"><span>📉</span> Расходы</div>
                <div class="desktop-nav-link"><span>👥</span> Клиенты</div>
                <div class="desktop-nav-link"><span>⚙️</span> Настройки</div>
              </div>

              <!-- Основная Bento-сетка десктопа -->
              <div class="desktop-main-content">
                <div style="font-size: 20px; font-weight: 900; margin-bottom: 14px; letter-spacing: -0.3px;">Мой мир ♡</div>

                <!-- Верхний ряд: Календарь + Мои платежи -->
                <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px; margin-bottom: 14px;">
                  <!-- Большой календарь -->
                  <div style="background: var(--desktop-card-bg); border-radius: 18px; padding: 14px; box-shadow: 2px 4px 12px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; font-weight: 900;">
                      <span>‹</span><span>Март 2025</span><span>›</span>
                    </div>
                    <div class="cal-grid" style="gap: 8px;">
                      <div class="cal-header-cell">Пн</div><div class="cal-header-cell">Вт</div><div class="cal-header-cell">Ср</div><div class="cal-header-cell">Чт</div><div class="cal-header-cell">Пт</div><div class="cal-header-cell">Сб</div><div class="cal-header-cell">Вс</div>
                      <div class="cal-day-cell cal-day-muted">24</div><div class="cal-day-cell cal-day-muted">25</div><div class="cal-day-cell cal-day-muted">26</div><div class="cal-day-cell cal-day-muted">27</div><div class="cal-day-cell cal-day-muted">28</div><div class="cal-day-cell">1</div><div class="cal-day-cell">2</div>
                      <div class="cal-day-cell">3</div><div class="cal-day-cell">4<span class="cal-event-dot" style="background: #5A9BE6;"></span></div><div class="cal-day-cell">5</div><div class="cal-day-cell">6</div><div class="cal-day-cell">7<span class="cal-event-dot" style="background: #E86B6B;"></span></div><div class="cal-day-cell">8</div><div class="cal-day-cell">9</div>
                      <div class="cal-day-cell">10</div><div class="cal-day-cell">11</div><div class="cal-day-cell cal-day-highlight">12</div><div class="cal-day-cell">13</div><div class="cal-day-cell">14</div><div class="cal-day-cell">15<span class="cal-event-dot" style="background: #ECA348;"></span></div><div class="cal-day-cell">16</div>
                    </div>
                  </div>

                  <!-- Карточка: Мои платежи -->
                  <div style="background: var(--desktop-card-bg); border-radius: 18px; padding: 14px; box-shadow: 2px 4px 12px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                      <strong style="font-size: 13px;">Мои платежи</strong>
                      <button class="ui-btn ui-btn-secondary" style="padding: 4px 10px; font-size: 11px;">+ Добавить</button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                      <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background: #5A9BE6;"></span> VPN
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background: #54B48A;"></span> Интернет
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background: #E86B6B;"></span> ИИ сервисы
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background: #ECA348;"></span> Подписки
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background: #A088C9;"></span> Прочее
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Нижний ряд Bento: 3 карточки (Доходы, Расходы, Клиенты) -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                  <!-- Карточка: Доходы -->
                  <div style="background: var(--scr-income-bg); color: var(--scr-income-fg); border-radius: 18px; padding: 14px; box-shadow: 2px 4px 12px rgba(0,0,0,0.06);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <strong style="font-size: 13px;">💰 Доходы</strong>
                      <span style="font-size: 12px; font-weight: 900; cursor: pointer;">+</span>
                    </div>
                    <div class="service-row-card">
                      <div>
                        <div style="font-size: 11px; font-weight: 900;">Проект Сайт</div>
                        <div style="font-size: 9px; color: var(--muted);">12 мар</div>
                      </div>
                      <span style="font-size: 11px; font-weight: 900; color: #2B7A55;">+45 000 ₽</span>
                    </div>
                    <div class="service-row-card">
                      <div>
                        <div style="font-size: 11px; font-weight: 900;">Проект Дизайн</div>
                        <div style="font-size: 9px; color: var(--muted);">4 мар</div>
                      </div>
                      <span style="font-size: 11px; font-weight: 900; color: #2B7A55;">+30 000 ₽</span>
                    </div>
                    <div class="service-row-card">
                      <div>
                        <div style="font-size: 11px; font-weight: 900;">Консультация</div>
                        <div style="font-size: 9px; color: var(--muted);">1 мар</div>
                      </div>
                      <span style="font-size: 11px; font-weight: 900; color: #2B7A55;">+10 000 ₽</span>
                    </div>
                  </div>

                  <!-- Карточка: Расходы -->
                  <div style="background: var(--scr-expense-bg); color: var(--scr-expense-fg); border-radius: 18px; padding: 14px; box-shadow: 2px 4px 12px rgba(0,0,0,0.06);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <strong style="font-size: 13px;">📊 Расходы</strong>
                      <span style="font-size: 12px; font-weight: 900; cursor: pointer;">+</span>
                    </div>
                    <div class="service-row-card">
                      <div>
                        <div style="font-size: 11px; font-weight: 900;">VPN</div>
                        <div style="font-size: 9px; color: var(--muted);">15 мар</div>
                      </div>
                      <span style="font-size: 11px; font-weight: 900;">850 ₽</span>
                    </div>
                    <div class="service-row-card">
                      <div>
                        <div style="font-size: 11px; font-weight: 900;">Интернет</div>
                        <div style="font-size: 9px; color: var(--muted);">5 мар</div>
                      </div>
                      <span style="font-size: 11px; font-weight: 900;">1 200 ₽</span>
                    </div>
                    <div class="service-row-card">
                      <div>
                        <div style="font-size: 11px; font-weight: 900;">ИИ сервисы</div>
                        <div style="font-size: 9px; color: var(--muted);">21 мар</div>
                      </div>
                      <span style="font-size: 11px; font-weight: 900;">2 000 ₽</span>
                    </div>
                  </div>

                  <!-- Карточка: Клиенты -->
                  <div style="background: var(--scr-clients-bg); color: var(--scr-clients-fg); border-radius: 18px; padding: 14px; box-shadow: 2px 4px 12px rgba(0,0,0,0.06);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <strong style="font-size: 13px;">👥 Клиенты</strong>
                      <span style="font-size: 12px; font-weight: 900; cursor: pointer;">+</span>
                    </div>
                    <div class="service-row-card">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 14px;">👩</span>
                        <div>
                          <div style="font-size: 11px; font-weight: 900;">Анна</div>
                          <div style="font-size: 9px; color: var(--muted);">Проект Сайт</div>
                        </div>
                      </div>
                      <span style="font-size: 12px; color: var(--muted);">›</span>
                    </div>
                    <div class="service-row-card">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 14px;">👨</span>
                        <div>
                          <div style="font-size: 11px; font-weight: 900;">Игорь</div>
                          <div style="font-size: 9px; color: var(--muted);">Проект Дизайн</div>
                        </div>
                      </div>
                      <span style="font-size: 12px; color: var(--muted);">›</span>
                    </div>
                    <div class="service-row-card">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 14px;">👩</span>
                        <div>
                          <div style="font-size: 11px; font-weight: 900;">Катя</div>
                          <div style="font-size: 9px; color: var(--muted);">Консультации</div>
                        </div>
                      </div>
                      <span style="font-size: 12px; color: var(--muted);">›</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- ============================================================= -->
      <!-- 7.2. ЭКРАН 2: «ДОХОДЫ»                                        -->
      <!-- ============================================================= -->
      <div style="margin-top: 36px; border-top: 1px dashed var(--border); padding-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="font-size: 18px; font-weight: 900;">Экран 2: «Доходы»</h3>
            <p style="font-size: 12px; color: var(--muted);">Карточки проектов по клиентам с суммами и вложенным списком платежей</p>
          </div>
          <span class="ui-badge ui-badge-secondary">Скриншот 2</span>
        </div>

        <div class="screen-duo-wrapper">
          <!-- МОБИЛЬНЫЙ ВИД (IPHONE) -->
          <div class="iphone-compact">
            <div class="iphone-compact-screen">
              <div class="dynamic-island"><div class="camera-lens"></div></div>

              <div class="status-bar" style="margin-bottom: 8px;">
                <span>09:41</span>
                <span style="font-size: 11px;">100% 􀛨</span>
              </div>

              <!-- Шапка: Доходы + Кнопка плюс -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="font-size: 20px; font-weight: 900;">Доходы</div>
                <button class="ui-btn ui-btn-secondary" style="width: 32px; height: 32px; padding: 0; border-radius: 50%; font-size: 16px;">+</button>
              </div>

              <!-- Поиск -->
              <input type="text" placeholder="🔍 Поиск клиента..." style="width: 100%; background: var(--card); border: 1px solid var(--border); padding: 8px 12px; border-radius: 14px; font-size: 11px; margin-bottom: 12px; outline: none; color: var(--foreground);">

              <!-- Список клиентов -->
              <!-- Клиент 1 (Мята) -->
              <div style="background: var(--scr-income-bg); color: var(--scr-income-fg); border-radius: 18px; padding: 12px; margin-bottom: 10px; box-shadow: 2px 4px 10px rgba(0,0,0,0.06);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--secondary); color: var(--foreground); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900;">АС</div>
                    <div>
                      <div style="font-size: 12px; font-weight: 900;">Анна Смирнова</div>
                      <div style="font-size: 9px; opacity: 0.8;">+7 916 123-45-67</div>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 9px; opacity: 0.8;">Сумма проекта</div>
                    <div style="font-size: 12px; font-weight: 900;">120 000 ₽</div>
                  </div>
                </div>
                <!-- Вложенные платежи -->
                <div style="background: var(--card); border-radius: 12px; padding: 8px 10px; color: var(--foreground); font-size: 10px;">
                  <div style="display: flex; justify-content: space-between; font-weight: 800; margin-bottom: 4px; color: var(--muted);">
                    <span>Платежи (2)</span><span>›</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed var(--border);">
                    <span>12.05.2024</span><span style="font-weight: 800;">60 000 ₽</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 3px 0;">
                    <span>25.05.2024</span><span style="font-weight: 800;">40 000 ₽</span>
                  </div>
                </div>
              </div>

              <!-- Клиент 2 (Теплый персик) -->
              <div style="background: var(--scr-accent-bg); color: var(--scr-accent-fg); border-radius: 18px; padding: 12px; margin-bottom: 10px; box-shadow: 2px 4px 10px rgba(0,0,0,0.06);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--secondary); color: var(--foreground); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900;">ИК</div>
                    <div>
                      <div style="font-size: 12px; font-weight: 900;">Ирина Кузнецова</div>
                      <div style="font-size: 9px; opacity: 0.8;">+7 905 987-65-43</div>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 9px; opacity: 0.8;">Сумма проекта</div>
                    <div style="font-size: 12px; font-weight: 900;">85 000 ₽</div>
                  </div>
                </div>
                <div style="background: var(--card); border-radius: 12px; padding: 8px 10px; color: var(--foreground); font-size: 10px;">
                  <div style="display: flex; justify-content: space-between; font-weight: 800; margin-bottom: 4px; color: var(--muted);">
                    <span>Платежи (3)</span><span>›</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 3px 0;">
                    <span>10.04.2024</span><span style="font-weight: 800;">30 000 ₽</span>
                  </div>
                </div>
              </div>

              <!-- Нижний таббар -->
              <div class="bottom-tab-bar" style="margin-top: auto;">
                <div class="tab-item"><span>🏠</span><span>Главная</span></div>
                <div class="tab-item"><span>📅</span><span>Календарь</span></div>
                <div class="tab-item active"><span>💰</span><span>Доходы</span></div>
                <div class="tab-item"><span>👥</span><span>Клиенты</span></div>
              </div>
              <div class="home-indicator"></div>
            </div>
          </div>

          <!-- ДЕСКТОПНЫЙ ВИД (ОКНО ПРИЛОЖЕНИЯ) -->
          <div class="desktop-app-window">
            <div class="desktop-window-bar">
              <div class="mac-dots">
                <span class="mac-dot mac-dot-red"></span>
                <span class="mac-dot mac-dot-yellow"></span>
                <span class="mac-dot mac-dot-green"></span>
              </div>
              <div style="font-size: 12px; font-weight: 800; color: var(--muted); margin-left: 8px;">Мои таблицы — Доходы</div>
              <div style="margin-left: auto; display: flex; align-items: center; gap: 10px;">
                <input type="text" placeholder="🔍 Поиск клиента..." style="background: var(--card); border: 1px solid var(--border); padding: 5px 12px; border-radius: 12px; font-size: 11px; outline: none; width: 150px; color: var(--foreground);">
                <button class="ui-btn ui-btn-primary" style="padding: 6px 12px; font-size: 11px;">+ Добавить клиента</button>
              </div>
            </div>

            <div class="desktop-body-layout">
              <div class="desktop-sidebar">
                <div class="desktop-nav-link"><span>🏠</span> Главная</div>
                <div class="desktop-nav-link active"><span>💰</span> Доходы</div>
                <div class="desktop-nav-link"><span>📉</span> Расходы</div>
                <div class="desktop-nav-link"><span>📅</span> Календарь</div>
                <div class="desktop-nav-link"><span>👥</span> Клиенты</div>
                <div class="desktop-nav-link"><span>⚙️</span> Настройки</div>
              </div>

              <div class="desktop-main-content">
                <div style="font-size: 20px; font-weight: 900; margin-bottom: 14px;">Доходы</div>

                <!-- Широкие карточки клиентов -->
                <!-- Карточка 1 -->
                <div style="background: var(--scr-income-bg); color: var(--scr-income-fg); border-radius: 18px; padding: 14px 18px; margin-bottom: 12px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; align-items: center; box-shadow: 2px 4px 12px rgba(0,0,0,0.06);">
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--secondary); color: var(--foreground); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; box-shadow: 2px 3px 6px rgba(0,0,0,0.1);">АС</div>
                    <div>
                      <div style="font-size: 14px; font-weight: 900;">Анна Смирнова</div>
                      <div style="font-size: 11px; opacity: 0.85;">+7 916 123-45-67</div>
                    </div>
                    <div style="margin-left: auto; text-align: right;">
                      <div style="font-size: 10px; opacity: 0.85;">Сумма проекта</div>
                      <div style="font-size: 14px; font-weight: 900;">120 000 ₽</div>
                    </div>
                  </div>

                  <div style="background: var(--card); border-radius: 14px; padding: 10px 14px; color: var(--foreground);">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: var(--muted); margin-bottom: 6px;">
                      <span>Платежи (2)</span><span>›</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; padding: 3px 0; border-bottom: 1px dashed var(--border);">
                      <span>12.05.2024</span><span style="font-weight: 800;">60 000 ₽</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; padding: 3px 0;">
                      <span>25.05.2024</span><span style="font-weight: 800;">40 000 ₽</span>
                    </div>
                  </div>
                </div>

                <!-- Карточка 2 -->
                <div style="background: var(--scr-accent-bg); color: var(--scr-accent-fg); border-radius: 18px; padding: 14px 18px; margin-bottom: 12px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; align-items: center; box-shadow: 2px 4px 12px rgba(0,0,0,0.06);">
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--secondary); color: var(--foreground); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; box-shadow: 2px 3px 6px rgba(0,0,0,0.1);">ИК</div>
                    <div>
                      <div style="font-size: 14px; font-weight: 900;">Ирина Кузнецова</div>
                      <div style="font-size: 11px; opacity: 0.85;">+7 905 987-65-43</div>
                    </div>
                    <div style="margin-left: auto; text-align: right;">
                      <div style="font-size: 10px; opacity: 0.85;">Сумма проекта</div>
                      <div style="font-size: 14px; font-weight: 900;">85 000 ₽</div>
                    </div>
                  </div>

                  <div style="background: var(--card); border-radius: 14px; padding: 10px 14px; color: var(--foreground);">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: var(--muted); margin-bottom: 6px;">
                      <span>Платежи (3)</span><span>›</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; padding: 3px 0; border-bottom: 1px dashed var(--border);">
                      <span>10.04.2024</span><span style="font-weight: 800;">30 000 ₽</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; padding: 3px 0;">
                      <span>28.04.2024</span><span style="font-weight: 800;">30 000 ₽</span>
                    </div>
                  </div>
                </div>

                <!-- Карточка 3 -->
                <div style="background: var(--scr-expense-bg); color: var(--scr-expense-fg); border-radius: 18px; padding: 14px 18px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; align-items: center; box-shadow: 2px 4px 12px rgba(0,0,0,0.06);">
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--secondary); color: var(--foreground); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; box-shadow: 2px 3px 6px rgba(0,0,0,0.1);">МЛ</div>
                    <div>
                      <div style="font-size: 14px; font-weight: 900;">Мария Лебедева</div>
                      <div style="font-size: 11px; opacity: 0.85;">+7 926 555-11-22</div>
                    </div>
                    <div style="margin-left: auto; text-align: right;">
                      <div style="font-size: 10px; opacity: 0.85;">Сумма проекта</div>
                      <div style="font-size: 14px; font-weight: 900;">50 000 ₽</div>
                    </div>
                  </div>

                  <div style="background: var(--card); border-radius: 14px; padding: 10px 14px; color: var(--foreground);">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: var(--muted); margin-bottom: 6px;">
                      <span>Платежи (1)</span><span>›</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; padding: 3px 0;">
                      <span>05.05.2024</span><span style="font-weight: 800;">50 000 ₽</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- ============================================================= -->
      <!-- 7.3. ЭКРАН 3: «РАСХОДЫ»                                        -->
      <!-- ============================================================= -->
      <div style="margin-top: 36px; border-top: 1px dashed var(--border); padding-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="font-size: 18px; font-weight: 900;">Экран 3: «Расходы ♡»</h3>
            <p style="font-size: 12px; color: var(--muted);">Группировка по категориям (ИИ, связь, VPN) с переключателями статуса «Оплачено»</p>
          </div>
          <span class="ui-badge ui-badge-secondary">Скриншот 3</span>
        </div>

        <div class="screen-duo-wrapper">
          <!-- МОБИЛЬНЫЙ ВИД (IPHONE) -->
          <div class="iphone-compact">
            <div class="iphone-compact-screen">
              <div class="dynamic-island"><div class="camera-lens"></div></div>

              <div class="status-bar" style="margin-bottom: 8px;">
                <span>09:41</span>
                <span style="font-size: 11px;">100% 􀛨</span>
              </div>

              <!-- Шапка: Расходы ♡ + Аватарка котика -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="font-size: 18px; font-weight: 900;">Расходы ♡</div>
                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 16px;">🐱</div>
              </div>

              <button class="ui-btn ui-btn-marshmallow" style="width: 100%; margin-bottom: 12px; font-size: 11px; padding: 8px;">
                + Добавить платеж
              </button>

              <!-- Категория 1: ИИ сервисы (Персик) -->
              <div style="background: var(--scr-expense-bg); color: var(--scr-expense-fg); border-radius: 18px; padding: 12px; margin-bottom: 10px; box-shadow: 2px 4px 10px rgba(0,0,0,0.06);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <strong style="font-size: 12px;">🤖 ИИ сервисы</strong>
                  <span style="font-size: 12px; font-weight: 900; cursor: pointer;">+</span>
                </div>
                <!-- Claude -->
                <div class="service-row-card">
                  <div>
                    <div style="font-size: 11px; font-weight: 900;">Claude</div>
                    <div style="font-size: 9px; color: var(--muted);">1 500 ₽ • 12 мар</div>
                  </div>
                  <span class="ui-badge" style="background: var(--scr-badge-paid); color: var(--scr-badge-paid-fg); font-size: 9px; padding: 3px 8px;">● Оплачено</span>
                </div>
                <!-- Gemini -->
                <div class="service-row-card">
                  <div>
                    <div style="font-size: 11px; font-weight: 900;">Gemini</div>
                    <div style="font-size: 9px; color: var(--muted);">1 500 ₽ • 15 мар</div>
                  </div>
                  <button class="ui-btn ui-btn-secondary" style="font-size: 9px; padding: 3px 8px;">Оплатить ◯</button>
                </div>
              </div>

              <!-- Категория 2: Интернет и связь (Мята) -->
              <div style="background: var(--scr-income-bg); color: var(--scr-income-fg); border-radius: 18px; padding: 12px; margin-bottom: 10px; box-shadow: 2px 4px 10px rgba(0,0,0,0.06);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <strong style="font-size: 12px;">📶 Интернет и связь</strong>
                  <span style="font-size: 12px; font-weight: 900; cursor: pointer;">+</span>
                </div>
                <div class="service-row-card">
                  <div>
                    <div style="font-size: 11px; font-weight: 900;">Домашний интернет</div>
                    <div style="font-size: 9px; color: var(--muted);">1 200 ₽ • 5 мар</div>
                  </div>
                  <span class="ui-badge" style="background: var(--scr-badge-paid); color: var(--scr-badge-paid-fg); font-size: 9px; padding: 3px 8px;">● Оплачено</span>
                </div>
              </div>

              <!-- Нижний таббар -->
              <div class="bottom-tab-bar" style="margin-top: auto;">
                <div class="tab-item"><span>🏠</span><span>Главная</span></div>
                <div class="tab-item active"><span>📉</span><span>Расходы</span></div>
                <div class="tab-item"><span>💰</span><span>Доходы</span></div>
                <div class="tab-item"><span>👥</span><span>Клиенты</span></div>
              </div>
              <div class="home-indicator"></div>
            </div>
          </div>

          <!-- ДЕСКТОПНЫЙ ВИД (ОКНО ПРИЛОЖЕНИЯ) -->
          <div class="desktop-app-window">
            <div class="desktop-window-bar">
              <div class="mac-dots">
                <span class="mac-dot mac-dot-red"></span>
                <span class="mac-dot mac-dot-yellow"></span>
                <span class="mac-dot mac-dot-green"></span>
              </div>
              <div style="font-size: 12px; font-weight: 800; color: var(--muted); margin-left: 8px;">Мои таблицы — Расходы</div>
              <div style="margin-left: auto; display: flex; align-items: center; gap: 10px;">
                <input type="text" placeholder="🔍 Поиск..." style="background: var(--card); border: 1px solid var(--border); padding: 5px 12px; border-radius: 12px; font-size: 11px; outline: none; width: 140px; color: var(--foreground);">
                <button class="ui-btn ui-btn-primary" style="padding: 6px 12px; font-size: 11px;">+ Добавить платеж</button>
              </div>
            </div>

            <div class="desktop-body-layout">
              <div class="desktop-sidebar">
                <div class="desktop-nav-link"><span>🏠</span> Главная</div>
                <div class="desktop-nav-link"><span>💰</span> Доходы</div>
                <div class="desktop-nav-link active"><span>📉</span> Расходы</div>
                <div class="desktop-nav-link"><span>📅</span> Календарь</div>
                <div class="desktop-nav-link"><span>👥</span> Клиенты</div>
                <div class="desktop-nav-link"><span>⚙️</span> Настройки</div>
              </div>

              <div class="desktop-main-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                  <div style="font-size: 20px; font-weight: 900;">Расходы ♡</div>
                  <div style="font-size: 12px; color: var(--muted); font-weight: 700;">Всего за март: <strong>28 400 ₽</strong></div>
                </div>

                <!-- 3 колонки Bento категорий расходов -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;">
                  <!-- Колонка 1: ИИ сервисы -->
                  <div style="background: var(--scr-expense-bg); color: var(--scr-expense-fg); border-radius: 18px; padding: 14px; box-shadow: 2px 4px 12px rgba(0,0,0,0.06);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                      <strong style="font-size: 13px;">🤖 ИИ сервисы</strong>
                      <span style="font-size: 12px; font-weight: 900; cursor: pointer;">+</span>
                    </div>

                    <div class="service-row-card">
                      <div>
                        <div style="font-size: 12px; font-weight: 900;">Claude</div>
                        <div style="font-size: 10px; color: var(--muted);">1 500 ₽ • 12 мар</div>
                      </div>
                      <span class="ui-badge" style="background: var(--scr-badge-paid); color: var(--scr-badge-paid-fg); font-size: 9px; padding: 3px 8px;">● Оплачено</span>
                    </div>

                    <div class="service-row-card">
                      <div>
                        <div style="font-size: 12px; font-weight: 900;">Gemini</div>
                        <div style="font-size: 10px; color: var(--muted);">1 500 ₽ • 15 мар</div>
                      </div>
                      <button class="ui-btn ui-btn-secondary" style="font-size: 9px; padding: 3px 8px;">Оплатить ◯</button>
                    </div>

                    <div class="service-row-card">
                      <div>
                        <div style="font-size: 12px; font-weight: 900;">ChatGPT</div>
                        <div style="font-size: 10px; color: var(--muted);">1 500 ₽ • 21 мар</div>
                      </div>
                      <button class="ui-btn ui-btn-secondary" style="font-size: 9px; padding: 3px 8px;">Оплатить ◯</button>
                    </div>
                  </div>

                  <!-- Колонка 2: Интернет и связь -->
                  <div style="background: var(--scr-income-bg); color: var(--scr-income-fg); border-radius: 18px; padding: 14px; box-shadow: 2px 4px 12px rgba(0,0,0,0.06);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                      <strong style="font-size: 13px;">📶 Интернет и связь</strong>
                      <span style="font-size: 12px; font-weight: 900; cursor: pointer;">+</span>
                    </div>

                    <div class="service-row-card">
                      <div>
                        <div style="font-size: 12px; font-weight: 900;">Домашний интернет</div>
                        <div style="font-size: 10px; color: var(--muted);">1 200 ₽ • 5 мар</div>
                      </div>
                      <span class="ui-badge" style="background: var(--scr-badge-paid); color: var(--scr-badge-paid-fg); font-size: 9px; padding: 3px 8px;">● Оплачено</span>
                    </div>

                    <div class="service-row-card">
                      <div>
                        <div style="font-size: 12px; font-weight: 900;">Мобильный телефон</div>
                        <div style="font-size: 10px; color: var(--muted);">500 ₽ • 18 мар</div>
                      </div>
                      <button class="ui-btn ui-btn-secondary" style="font-size: 9px; padding: 3px 8px;">Оплатить ◯</button>
                    </div>
                  </div>

                  <!-- Колонка 3: VPN -->
                  <div style="background: var(--scr-clients-bg); color: var(--scr-clients-fg); border-radius: 18px; padding: 14px; box-shadow: 2px 4px 12px rgba(0,0,0,0.06);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                      <strong style="font-size: 13px;">🛡️ VPN</strong>
                      <span style="font-size: 12px; font-weight: 900; cursor: pointer;">+</span>
                    </div>

                    <div class="service-row-card">
                      <div>
                        <div style="font-size: 12px; font-weight: 900;">VPN (компьютер)</div>
                        <div style="font-size: 10px; color: var(--muted);">1 200 ₽ • 7 мар</div>
                      </div>
                      <span class="ui-badge" style="background: var(--scr-badge-paid); color: var(--scr-badge-paid-fg); font-size: 9px; padding: 3px 8px;">● Оплачено</span>
                    </div>

                    <div class="service-row-card">
                      <div>
                        <div style="font-size: 12px; font-weight: 900;">VPN (телефон)</div>
                        <div style="font-size: 10px; color: var(--muted);">1 200 ₽ • 14 мар</div>
                      </div>
                      <button class="ui-btn ui-btn-secondary" style="font-size: 9px; padding: 3px 8px;">Оплатить ◯</button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- ============================================================= -->
      <!-- 7.4. ЭКРАН 4: «КЛИЕНТЫ» И ДОСЬЕ КЛИЕНТА                        -->
      <!-- ============================================================= -->
      <div style="margin-top: 36px; border-top: 1px dashed var(--border); padding-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="font-size: 18px; font-weight: 900;">Экран 4: «Клиенты» и Карточка досье</h3>
            <p style="font-size: 12px; color: var(--muted);">Реестр клиентов со статусами + подробное досье с контактами, ссылками, доступами и заметками</p>
          </div>
          <span class="ui-badge ui-badge-secondary">Скриншот 4</span>
        </div>

        <div class="screen-duo-wrapper">
          <!-- МОБИЛЬНЫЙ ВИД 1 (СПИСОК КЛИЕНТОВ) -->
          <div class="iphone-compact">
            <div class="iphone-compact-screen">
              <div class="dynamic-island"><div class="camera-lens"></div></div>

              <div class="status-bar" style="margin-bottom: 8px;">
                <span>09:41</span>
                <span style="font-size: 11px;">100% 􀛨</span>
              </div>

              <!-- Шапка: Клиенты ♡ -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="font-size: 18px; font-weight: 900;">Клиенты ♡</div>
                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 16px;">🐱</div>
              </div>

              <button class="ui-btn ui-btn-marshmallow" style="width: 100%; margin-bottom: 10px; font-size: 11px; padding: 8px;">
                + Добавить клиента
              </button>

              <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                <input type="text" placeholder="🔍 Поиск..." style="flex: 1; background: var(--card); border: 1px solid var(--border); padding: 7px 12px; border-radius: 12px; font-size: 11px; outline: none; color: var(--foreground);">
                <button class="ui-btn ui-btn-secondary" style="padding: 7px 10px; font-size: 11px;">⚙️</button>
              </div>

              <!-- Список клиентов -->
              <!-- 1. Анна -->
              <div style="background: var(--card); border-radius: 16px; padding: 10px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 2px 3px 8px rgba(0,0,0,0.06); cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 18px;">👩</span>
                  <div>
                    <div style="font-size: 12px; font-weight: 900;">Анна</div>
                    <div style="font-size: 9px; color: var(--muted);">Проект Сайт • +7 900 123-45-67</div>
                  </div>
                </div>
                <span class="ui-badge" style="background: var(--scr-badge-paid); color: var(--scr-badge-paid-fg); font-size: 9px; padding: 2px 7px;">● В работе</span>
              </div>

              <!-- 2. Игорь -->
              <div style="background: var(--card); border-radius: 16px; padding: 10px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 2px 3px 8px rgba(0,0,0,0.06); cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 18px;">👨</span>
                  <div>
                    <div style="font-size: 12px; font-weight: 900;">Игорь</div>
                    <div style="font-size: 9px; color: var(--muted);">CRM-система • +7 911 234-56-78</div>
                  </div>
                </div>
                <span class="ui-badge" style="background: var(--scr-clients-bg); color: var(--scr-clients-fg); font-size: 9px; padding: 2px 7px;">● Обсуждение</span>
              </div>

              <!-- 3. Катя -->
              <div style="background: var(--card); border-radius: 16px; padding: 10px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 2px 3px 8px rgba(0,0,0,0.06); cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 18px;">👩</span>
                  <div>
                    <div style="font-size: 12px; font-weight: 900;">Катя</div>
                    <div style="font-size: 9px; color: var(--muted);">Google Таблицы • +7 920 345-67-89</div>
                  </div>
                </div>
                <span class="ui-badge" style="background: var(--scr-accent-bg); color: var(--scr-accent-fg); font-size: 9px; padding: 2px 7px;">● Ожидает</span>
              </div>

              <!-- 4. Максим -->
              <div style="background: var(--card); border-radius: 16px; padding: 10px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 2px 3px 8px rgba(0,0,0,0.06); cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 18px;">👨</span>
                  <div>
                    <div style="font-size: 12px; font-weight: 900;">Максим</div>
                    <div style="font-size: 9px; color: var(--muted);">Юридические док.</div>
                  </div>
                </div>
                <span class="ui-badge" style="background: var(--secondary); color: var(--foreground); font-size: 9px; padding: 2px 7px;">● Завершён</span>
              </div>

              <!-- Нижний таббар -->
              <div class="bottom-tab-bar" style="margin-top: auto;">
                <div class="tab-item"><span>🏠</span><span>Главная</span></div>
                <div class="tab-item"><span>📉</span><span>Расходы</span></div>
                <div class="tab-item"><span>💰</span><span>Доходы</span></div>
                <div class="tab-item active"><span>👥</span><span>Клиенты</span></div>
              </div>
              <div class="home-indicator"></div>
            </div>
          </div>

          <!-- ДЕСКТОПНЫЙ ВИД (MASTER-DETAIL) -->
          <div class="desktop-app-window">
            <div class="desktop-window-bar">
              <div class="mac-dots">
                <span class="mac-dot mac-dot-red"></span>
                <span class="mac-dot mac-dot-yellow"></span>
                <span class="mac-dot mac-dot-green"></span>
              </div>
              <div style="font-size: 12px; font-weight: 800; color: var(--muted); margin-left: 8px;">Мои таблицы — Клиенты (Досье)</div>
              <div style="margin-left: auto; display: flex; align-items: center; gap: 10px;">
                <input type="text" placeholder="🔍 Поиск..." style="background: var(--card); border: 1px solid var(--border); padding: 5px 12px; border-radius: 12px; font-size: 11px; outline: none; width: 140px; color: var(--foreground);">
                <button class="ui-btn ui-btn-primary" style="padding: 6px 12px; font-size: 11px;">+ Добавить клиента</button>
              </div>
            </div>

            <div class="desktop-body-layout">
              <div class="desktop-sidebar">
                <div class="desktop-nav-link"><span>🏠</span> Главная</div>
                <div class="desktop-nav-link"><span>💰</span> Доходы</div>
                <div class="desktop-nav-link"><span>📉</span> Расходы</div>
                <div class="desktop-nav-link"><span>📅</span> Календарь</div>
                <div class="desktop-nav-link active"><span>👥</span> Клиенты</div>
                <div class="desktop-nav-link"><span>⚙️</span> Настройки</div>
              </div>

              <!-- Разделение: Слева список, Справа карточка (Master-Detail) -->
              <div class="desktop-main-content" style="display: grid; grid-template-columns: 200px 1fr; gap: 16px;">
                <!-- Список клиентов слева -->
                <div style="border-right: 1px solid var(--border); padding-right: 12px;">
                  <div style="font-size: 13px; font-weight: 900; margin-bottom: 10px;">Клиенты (5)</div>
                  
                  <div style="background: var(--secondary); border-radius: 12px; padding: 8px 10px; margin-bottom: 6px; cursor: pointer; box-shadow: 2px 3px 6px rgba(0,0,0,0.06);">
                    <div style="font-size: 12px; font-weight: 900;">👩 Анна</div>
                    <div style="font-size: 9px; color: var(--muted);">Проект Сайт</div>
                  </div>

                  <div style="background: var(--card); border-radius: 12px; padding: 8px 10px; margin-bottom: 6px; cursor: pointer;">
                    <div style="font-size: 12px; font-weight: 900;">👨 Игорь</div>
                    <div style="font-size: 9px; color: var(--muted);">CRM-система</div>
                  </div>

                  <div style="background: var(--card); border-radius: 12px; padding: 8px 10px; margin-bottom: 6px; cursor: pointer;">
                    <div style="font-size: 12px; font-weight: 900;">👩 Катя</div>
                    <div style="font-size: 9px; color: var(--muted);">Google Таблицы</div>
                  </div>
                </div>

                <!-- Досье клиента справа -->
                <div>
                  <!-- Заголовок досье -->
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 18px;">👩</div>
                      <div>
                        <div style="font-size: 16px; font-weight: 900;">Анна</div>
                        <div style="font-size: 11px; color: var(--muted);">Проект Сайт</div>
                      </div>
                    </div>
                    <span class="ui-badge" style="background: var(--scr-badge-paid); color: var(--scr-badge-paid-fg); font-size: 10px; padding: 4px 10px;">● В работе ▾</span>
                  </div>

                  <!-- Вкладки досье (Tabs) -->
                  <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--border); padding-bottom: 8px; margin-bottom: 14px; font-size: 11px; font-weight: 800;">
                    <span style="color: var(--primary-foreground); background: var(--primary); padding: 4px 10px; border-radius: 10px;">Основное</span>
                    <span style="color: var(--muted); padding: 4px 8px; cursor: pointer;">Ссылки</span>
                    <span style="color: var(--muted); padding: 4px 8px; cursor: pointer;">Доступы</span>
                    <span style="color: var(--muted); padding: 4px 8px; cursor: pointer;">Заметки</span>
                  </div>

                  <!-- Сетка параметров -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div style="background: var(--card); border-radius: 14px; padding: 10px 12px;">
                      <div style="font-size: 10px; color: var(--muted); font-weight: 800; margin-bottom: 4px;">КОНТАКТЫ</div>
                      <div style="font-size: 11px; font-weight: 800; margin-bottom: 3px;">📞 +7 900 123-45-67</div>
                      <div style="font-size: 11px; font-weight: 800; margin-bottom: 3px;">✉️ anna@mail.ru</div>
                      <div style="font-size: 11px; font-weight: 800;">💬 @anna_site</div>
                    </div>

                    <div style="background: var(--card); border-radius: 14px; padding: 10px 12px;">
                      <div style="font-size: 10px; color: var(--muted); font-weight: 800; margin-bottom: 4px;">ПРОЕКТ И СРОКИ</div>
                      <div style="font-size: 11px; font-weight: 800; margin-bottom: 3px;">🖥️ Сайт (лендинг)</div>
                      <div style="font-size: 11px; font-weight: 800; margin-bottom: 3px;">📅 Старт: 5 марта 2025</div>
                      <div style="font-size: 11px; font-weight: 800; color: #C44536;">⏳ Срок: 31 марта 2025</div>
                    </div>
                  </div>

                  <!-- Быстрые ссылки -->
                  <div style="background: var(--scr-clients-bg); color: var(--scr-clients-fg); border-radius: 14px; padding: 10px 14px; margin-bottom: 12px; font-size: 11px;">
                    <div style="font-size: 10px; font-weight: 800; opacity: 0.8; margin-bottom: 6px;">🔗 БЫСТРЫЕ ССЫЛКИ</div>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                      <span class="ui-btn ui-btn-secondary" style="font-size: 10px; padding: 4px 10px;">🌐 Сайт проекта ↗</span>
                      <span class="ui-btn ui-btn-secondary" style="font-size: 10px; padding: 4px 10px;">📊 Google Таблицы ↗</span>
                      <span class="ui-btn ui-btn-secondary" style="font-size: 10px; padding: 4px 10px;">📁 Google Диск ↗</span>
                    </div>
                  </div>

                  <!-- Заметки -->
                  <div style="background: var(--scr-accent-bg); color: var(--scr-accent-fg); border-radius: 14px; padding: 10px 14px; font-size: 11px;">
                    <div style="font-size: 10px; font-weight: 800; opacity: 0.8; margin-bottom: 4px;">📝 ЗАМЕТКИ ПО ЗАДАЧЕ</div>
                    <div style="font-weight: 700; line-height: 1.4;">Создание современного адаптивного лендинга для курса. Уточнить тексты до 15 марта, согласовать примеры дизайна.</div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
`;

// Insert Section 7 right before </div>\n\n  <script>
html = html.replace('  </div>\n\n  <script>', section7Html + '\n  </div>\n\n  <script>');

// 4. Append JavaScript logic for dynamic palette selection
const paletteScript = `
    function selectPalette(mode, name) {
      document.body.classList.remove('palette-powder', 'palette-eucalyptus');
      if (mode === 'powder') {
        document.body.classList.add('palette-powder');
      } else if (mode === 'eucalyptus') {
        document.body.classList.add('palette-eucalyptus');
      }

      var btn1 = document.getElementById('btn-pal-1');
      var btn2 = document.getElementById('btn-pal-2');
      var btn3 = document.getElementById('btn-pal-3');
      var label = document.getElementById('active-palette-name');

      if (btn1) btn1.className = (mode === 'default') ? 'palette-btn active' : 'palette-btn';
      if (btn2) btn2.className = (mode === 'powder') ? 'palette-btn active' : 'palette-btn';
      if (btn3) btn3.className = (mode === 'eucalyptus') ? 'palette-btn active' : 'palette-btn';
      if (label) label.textContent = name + ' выбрана';
    }
`;

html = html.replace('</script>', paletteScript + '\n  </script>');

// Save updated file
fs.writeFileSync(mockupsPath, html, 'utf8');
console.log('Successfully updated макеты.html with Section 7 and Palette Switcher!');
