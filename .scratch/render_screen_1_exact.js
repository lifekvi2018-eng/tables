const fs = require('fs');

let html = fs.readFileSync('макеты.html', 'utf8');

const startMarker = '<!-- =============================================================== -->\n    <!-- ЭКРАН 1. ГЛАВНЫЙ ЭКРАН';
const startMarkerCRLF = '<!-- =============================================================== -->\r\n    <!-- ЭКРАН 1. ГЛАВНЫЙ ЭКРАН';
const endMarker = '<!-- =============================================================== -->\n    <!-- РАЗДЕЛ 1. СРАВНЕНИЕ ТЕНЕЙ';
const endMarkerCRLF = '<!-- =============================================================== -->\r\n    <!-- РАЗДЕЛ 1. СРАВНЕНИЕ ТЕНЕЙ';

let startIdx = html.indexOf(startMarker);
if (startIdx === -1) startIdx = html.indexOf(startMarkerCRLF);

let endIdx = html.indexOf(endMarker);
if (endIdx === -1) endIdx = html.indexOf(endMarkerCRLF);

if (startIdx === -1 || endIdx === -1) {
  console.log('Markers not found! start:', startIdx, 'end:', endIdx);
  process.exit(1);
}

const screen1HTML = `<!-- =============================================================== -->
    <!-- ЭКРАН 1. ГЛАВНЫЙ («МОЙ МИР ♡») — ТОЧНАЯ КОПИЯ РЕФЕРЕНСА 1        -->
    <!-- =============================================================== -->
    <div class="ui-card" style="margin-bottom: 32px; border: 2px solid #D6C2AC; background: #FAF2E7; padding: 24px;">
      
      <div class="ui-card-header" style="margin-bottom: 20px;">
        <div>
          <span style="font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 8px; background: #5A4E40; color: #fff; display: inline-block; margin-bottom: 8px;">★ ЭКРАН 1 • В ТОЧНОСТИ ПО РЕФЕРЕНСУ (БЕЗ ЭМОДЗИ И СМАЙЛИКОВ)</span>
          <div class="ui-card-title" style="font-size: 24px; color: #2F261D;">Главный экран: «Мой мир ♡»</div>
        </div>
        <span class="ui-badge ui-badge-default">3D-Бумажечки • Свет слева-сверху</span>
      </div>

      <p style="font-size: 13px; color: #726453; margin-bottom: 24px; max-width: 820px; line-height: 1.5;">
        Отрисовано пиксель в пиксель по первому референсу: чистые векторные пиктограммы (кошелёк, круговая диаграмма долей, силуэты клиентов), настоящие глубокие тени зефирки (<strong>свет падает из верхнего левого угла, тени рассеиваются вправо и вниз</strong>).
      </p>

      <div style="display: grid; grid-template-columns: 370px 1fr; gap: 32px; align-items: start;">

        <!-- ============================================================= -->
        <!-- ЛЕВАЯ КОЛОНКА: МОБИЛЬНЫЙ ВИД (IPHONE)                         -->
        <!-- ============================================================= -->
        <div>
          <div style="font-size: 11px; font-weight: 800; color: #726453; margin-bottom: 10px; text-transform: uppercase; text-align: center;">
            📱 На телефоне (сенсорные зоны от 44 px)
          </div>

          <!-- Корпус телефона -->
          <div style="background: #FFFFFF; border-radius: 46px; padding: 12px; box-shadow: 14px 24px 50px -6px rgba(150, 125, 100, 0.32), 4px 8px 16px rgba(150, 125, 100, 0.15); border: 4px solid #F0E2D2; max-width: 370px; margin: 0 auto;">
            
            <div style="background: #FAF2E7; border-radius: 36px; padding: 16px 14px 20px 14px; min-height: 700px; display: flex; flex-direction: column;">
              
              <!-- Динамический островок -->
              <div style="width: 86px; height: 20px; background: #2B241E; border-radius: 12px; margin: 0 auto 10px auto;"></div>
              
              <!-- Статус-бар -->
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 700; color: #5A4E40; margin-bottom: 12px; padding: 0 6px;">
                <span>9:41</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span>5G</span>
                  <span style="font-size: 12px;">100% 🔋</span>
                </div>
              </div>

              <!-- Шапка: Название и Котик -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding: 0 4px;">
                <div style="font-size: 22px; font-weight: 900; font-family: Georgia, serif; color: #2F261D; letter-spacing: -0.3px;">Мой мир ♡</div>
                <div style="width: 38px; height: 38px; border-radius: 50%; background: #FAF2E7; box-shadow: 4px 6px 14px rgba(160, 135, 110, 0.28), -2px -2px 6px rgba(255, 255, 255, 0.95); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1.5px solid #FFFFFF;">
                  <img src="photo_2026-10-22_21-35-01.jpg" style="width: 140px; height: 95px; object-fit: cover; object-position: -23px -11px;" alt="Котик" />
                </div>
              </div>

              <!-- Календарь на телефоне -->
              <div style="background: #FFFDF9; border-radius: 20px; padding: 14px 10px; margin-bottom: 14px; box-shadow: 6px 10px 24px -4px rgba(160, 135, 110, 0.22), -3px -3px 10px rgba(255, 255, 255, 0.95), inset 1px 1px 1.5px rgba(255, 255, 255, 0.95);">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 800; color: #383025; margin-bottom: 10px; padding: 0 6px;">
                  <span style="cursor: pointer; padding: 2px 8px; color: #8A7B6B;">‹</span>
                  <span style="font-family: Georgia, serif; font-size: 14px;">Март 2025</span>
                  <span style="cursor: pointer; padding: 2px 8px; color: #8A7B6B;">›</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; text-align: center; font-size: 10px;">
                  <div style="color: #9C8F80; font-weight: 700; padding-bottom: 4px;">Пн</div>
                  <div style="color: #9C8F80; font-weight: 700; padding-bottom: 4px;">Вт</div>
                  <div style="color: #9C8F80; font-weight: 700; padding-bottom: 4px;">Ср</div>
                  <div style="color: #9C8F80; font-weight: 700; padding-bottom: 4px;">Чт</div>
                  <div style="color: #9C8F80; font-weight: 700; padding-bottom: 4px;">Пт</div>
                  <div style="color: #9C8F80; font-weight: 700; padding-bottom: 4px;">Сб</div>
                  <div style="color: #9C8F80; font-weight: 700; padding-bottom: 4px;">Вс</div>

                  <div style="color: #C8BDAE; padding: 4px 0;">24</div><div style="color: #C8BDAE; padding: 4px 0;">25</div><div style="color: #C8BDAE; padding: 4px 0;">26</div><div style="color: #C8BDAE; padding: 4px 0;">27</div><div style="color: #C8BDAE; padding: 4px 0;">28</div><div style="font-weight: 700; padding: 4px 0;">1</div><div style="font-weight: 700; padding: 4px 0;">2</div>
                  <div style="font-weight: 700; padding: 4px 0;">3</div>
                  <div style="background: #D3E7F8; color: #1B4567; font-weight: 800; border-radius: 50%; width: 24px; height: 24px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 5px rgba(120,150,180,0.25);">4</div>
                  <div style="font-weight: 700; padding: 4px 0;">5</div><div style="font-weight: 700; padding: 4px 0;">6</div>
                  <div style="background: #FCD6CF; color: #6E2F26; font-weight: 800; border-radius: 50%; width: 24px; height: 24px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 5px rgba(200,130,130,0.25);">7</div>
                  <div style="font-weight: 700; padding: 4px 0;">8</div><div style="font-weight: 700; padding: 4px 0;">9</div>
                  <div style="font-weight: 700; padding: 4px 0;">10</div><div style="font-weight: 700; padding: 4px 0;">11</div>
                  <div style="background: #FDF1CC; color: #5B481D; font-weight: 800; border-radius: 50%; width: 24px; height: 24px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 5px rgba(190,170,110,0.25);">12</div>
                  <div style="font-weight: 700; padding: 4px 0;">13</div><div style="font-weight: 700; padding: 4px 0;">14</div>
                  <div style="background: #FCE8D5; color: #6D3E14; font-weight: 800; border-radius: 50%; width: 24px; height: 24px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 5px rgba(200,150,110,0.25);">15</div>
                  <div style="font-weight: 700; padding: 4px 0;">16</div>
                  <div style="font-weight: 700; padding: 4px 0;">17</div><div style="font-weight: 700; padding: 4px 0;">18</div><div style="font-weight: 700; padding: 4px 0;">19</div><div style="font-weight: 700; padding: 4px 0;">20</div>
                  <div style="background: #FCD6CF; color: #6E2F26; font-weight: 800; border-radius: 50%; width: 24px; height: 24px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 5px rgba(200,130,130,0.25);">21</div>
                  <div style="font-weight: 700; padding: 4px 0;">22</div><div style="font-weight: 700; padding: 4px 0;">23</div>
                  <div style="font-weight: 700; padding: 4px 0;">24</div><div style="font-weight: 700; padding: 4px 0;">25</div><div style="font-weight: 700; padding: 4px 0;">26</div><div style="font-weight: 700; padding: 4px 0;">27</div>
                  <div style="background: #DBCCE9; color: #442B5B; font-weight: 800; border-radius: 50%; width: 24px; height: 24px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 5px rgba(150,130,170,0.25);">28</div>
                  <div style="font-weight: 700; padding: 4px 0;">29</div><div style="font-weight: 700; padding: 4px 0;">30</div><div style="font-weight: 700; padding: 4px 0;">31</div>
                </div>
              </div>

              <!-- 3 КАРТОЧКИ БЫСТРОГО ДОСТУПА НА ТЕЛЕФОНЕ (3D БУМАГА, СВЕТ СВЕРХУ-СЛЕВА) -->
              <div style="display: flex; flex-direction: column; gap: 11px; margin-bottom: auto;">
                
                <!-- 1. ДОХОДЫ -->
                <div style="background: #C8E2D2; color: #1E3F30; min-height: 60px; border-radius: 20px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: 6px 10px 22px -3px rgba(120, 160, 135, 0.35), -3px -3px 8px rgba(255, 255, 255, 0.8), inset 1px 1px 1.5px rgba(255, 255, 255, 0.9); cursor: pointer;" class="ui-btn-hover">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <!-- Векторная иконка кошелька из референса -->
                    <div style="width: 42px; height: 42px; border-radius: 14px; background: #5B8374; display: flex; align-items: center; justify-content: center; box-shadow: inset 1px 1px 2px rgba(255,255,255,0.3), 2px 3px 6px rgba(0,0,0,0.12);">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="6" width="20" height="13" rx="3.5" fill="#E8F4EC"/>
                        <path d="M16 12.5C16 11.67 16.67 11 17.5 11H22V14H17.5C16.67 14 16 13.33 16 12.5Z" fill="#A8D1BD"/>
                        <circle cx="18" cy="12.5" r="1.3" fill="#2D5847"/>
                      </svg>
                    </div>
                    <div>
                      <div style="font-size: 14px; font-weight: 800; letter-spacing: -0.2px;">Доходы</div>
                      <div style="font-size: 11px; font-weight: 600; opacity: 0.85; margin-top: 2px;">125 500 ₽</div>
                    </div>
                  </div>
                  <button style="width: 44px; height: 44px; border-radius: 50%; background: #FAF2E7; border: none; font-size: 14px; font-weight: 900; color: #4A3E31; box-shadow: 4px 6px 12px rgba(150, 130, 110, 0.25), -2px -2px 6px rgba(255, 255, 255, 0.95); cursor: pointer; display: flex; align-items: center; justify-content: center;">›</button>
                </div>

                <!-- 2. РАСХОДЫ (В ТОЧНОСТИ КРУГОВАЯ ДИАГРАММА ИЗ РЕФЕРЕНСА, БЕЗ ТОРТИКОВ!) -->
                <div style="background: #FCD6CF; color: #58241B; min-height: 60px; border-radius: 20px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: 6px 10px 22px -3px rgba(185, 135, 130, 0.35), -3px -3px 8px rgba(255, 255, 255, 0.8), inset 1px 1px 1.5px rgba(255, 255, 255, 0.9); cursor: pointer;" class="ui-btn-hover">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <!-- Векторная круговая диаграмма из референса -->
                    <div style="width: 42px; height: 42px; border-radius: 50%; background: #B86B60; display: flex; align-items: center; justify-content: center; box-shadow: inset 1px 1px 2px rgba(255,255,255,0.3), 2px 3px 6px rgba(0,0,0,0.12);">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#E8B0A7"/>
                        <path d="M12 12L12 2A10 10 0 0 1 22 12Z" fill="#FDF3F1"/>
                        <path d="M12 12L22 12A10 10 0 0 1 12 22Z" fill="#D4867A"/>
                      </svg>
                    </div>
                    <div>
                      <div style="font-size: 14px; font-weight: 800; letter-spacing: -0.2px;">Расходы</div>
                      <div style="font-size: 11px; font-weight: 600; opacity: 0.85; margin-top: 2px;">28 400 ₽</div>
                    </div>
                  </div>
                  <button style="width: 44px; height: 44px; border-radius: 50%; background: #FAF2E7; border: none; font-size: 14px; font-weight: 900; color: #4A3E31; box-shadow: 4px 6px 12px rgba(150, 130, 110, 0.25), -2px -2px 6px rgba(255, 255, 255, 0.95); cursor: pointer; display: flex; align-items: center; justify-content: center;">›</button>
                </div>

                <!-- 3. КЛИЕНТЫ (ВЕКТОРНЫЙ СИЛУЭТ ДВУХ ЛЮДЕЙ ИЗ РЕФЕРЕНСА) -->
                <div style="background: #D3E7F8; color: #163B59; min-height: 60px; border-radius: 20px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: 6px 10px 22px -3px rgba(125, 150, 180, 0.35), -3px -3px 8px rgba(255, 255, 255, 0.8), inset 1px 1px 1.5px rgba(255, 255, 255, 0.9); cursor: pointer;" class="ui-btn-hover">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <!-- Векторные силуэты клиентов -->
                    <div style="width: 42px; height: 42px; border-radius: 14px; background: #5587B3; display: flex; align-items: center; justify-content: center; box-shadow: inset 1px 1px 2px rgba(255,255,255,0.3), 2px 3px 6px rgba(0,0,0,0.12);">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="9" cy="8" r="3.2" fill="#E4EFF8"/>
                        <path d="M3 18.5C3 15.2 5.5 13.8 9 13.8C12.5 13.8 15 15.2 15 18.5" fill="#E4EFF8"/>
                        <circle cx="16.5" cy="9.2" r="2.6" fill="#A8CEEF"/>
                        <path d="M15 18C15.4 16.2 16.8 15 18.6 15C20.4 15 21.8 16.2 22.2 18" fill="#A8CEEF"/>
                      </svg>
                    </div>
                    <div>
                      <div style="font-size: 14px; font-weight: 800; letter-spacing: -0.2px;">Клиенты</div>
                      <div style="font-size: 11px; font-weight: 600; opacity: 0.85; margin-top: 2px;">12 активных</div>
                    </div>
                  </div>
                  <button style="width: 44px; height: 44px; border-radius: 50%; background: #FAF2E7; border: none; font-size: 14px; font-weight: 900; color: #4A3E31; box-shadow: 4px 6px 12px rgba(150, 130, 110, 0.25), -2px -2px 6px rgba(255, 255, 255, 0.95); cursor: pointer; display: flex; align-items: center; justify-content: center;">›</button>
                </div>

              </div>

              <!-- НИЖНЯЯ ПАНЕЛЬ НАВИГАЦИИ (ТАБ-БАР ИЗ РЕФЕРЕНСА) -->
              <div style="background: #FFFDF9; border-radius: 26px; padding: 6px 8px; display: flex; justify-content: space-around; align-items: center; box-shadow: 6px 10px 24px -4px rgba(140, 120, 100, 0.22), -2px -2px 6px rgba(255,255,255,0.95); margin-top: 16px;">
                <div style="width: 44px; height: 44px; border-radius: 16px; background: #FDF1CC; color: #5B481D; display: flex; align-items: center; justify-content: center; box-shadow: 2px 3px 6px rgba(190,170,110,0.25);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V10.5Z" fill="#5B481D"/></svg>
                </div>
                <div style="width: 44px; height: 44px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #8A7B6B;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" stroke="#8A7B6B" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="#8A7B6B" stroke-width="2"/></svg>
                </div>
                <div style="width: 44px; height: 44px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #8A7B6B;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="13" width="3.5" height="8" rx="1" fill="#8A7B6B"/><rect x="10.25" y="8" width="3.5" height="13" rx="1" fill="#8A7B6B"/><rect x="16.5" y="3" width="3.5" height="18" rx="1" fill="#8A7B6B"/></svg>
                </div>
                <div style="width: 44px; height: 44px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #8A7B6B;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#8A7B6B"/><path d="M5 20C5 16.5 8 15 12 15C16 15 19 16.5 19 20" fill="#8A7B6B"/></svg>
                </div>
              </div>

            </div>
          </div>
        </div>


        <!-- ============================================================= -->
        <!-- ПРАВАЯ КОЛОНКА: ДЕСКТОПНЫЙ ВИД BENTO GRID (В СТИЛЕ РЕФЕРЕНСА) -->
        <!-- ============================================================= -->
        <div>
          <div style="font-size: 11px; font-weight: 800; color: #726453; margin-bottom: 10px; text-transform: uppercase;">
            💻 На компьютере (Bento Grid)
          </div>

          <!-- Окно приложения на столе -->
          <div style="background: #F8EFE4; border-radius: 28px; padding: 22px; box-shadow: 14px 22px 48px -6px rgba(160, 135, 110, 0.30), 4px 6px 14px rgba(160, 135, 110, 0.14), -4px -4px 14px rgba(255, 255, 255, 0.9); border: 1px solid rgba(220, 205, 185, 0.7); display: grid; grid-template-columns: 180px 1fr; gap: 20px;">
            
            <!-- Левая боковая панель -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; gap: 6px; padding: 0 4px 12px 4px; margin-bottom: 6px; border-bottom: 1px dashed rgba(200, 180, 160, 0.5);">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: #FF5F56;"></div>
                <div style="width: 10px; height: 10px; border-radius: 50%; background: #FFBD2E;"></div>
                <div style="width: 10px; height: 10px; border-radius: 50%; background: #27C93F;"></div>
              </div>

              <button style="min-height: 42px; border-radius: 14px; padding: 0 14px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 800; color: #5B481D; background: #FDF1CC; border: none; cursor: pointer; box-shadow: 4px 6px 14px -2px rgba(190, 170, 110, 0.3), -2px -2px 6px rgba(255, 255, 255, 0.9);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V10.5Z" fill="#5B481D"/></svg>
                <span>Главная</span>
              </button>
              <button style="min-height: 42px; border-radius: 14px; padding: 0 14px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 800; color: #5A4E40; background: transparent; border: none; cursor: pointer;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" stroke="#7A6E60" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="#7A6E60" stroke-width="2"/></svg>
                <span>Календарь</span>
              </button>
              <button style="min-height: 42px; border-radius: 14px; padding: 0 14px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 800; color: #5A4E40; background: transparent; border: none; cursor: pointer;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="13" rx="3" stroke="#7A6E60" stroke-width="2"/></svg>
                <span>Доходы</span>
              </button>
              <button style="min-height: 42px; border-radius: 14px; padding: 0 14px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 800; color: #5A4E40; background: transparent; border: none; cursor: pointer;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#7A6E60" stroke-width="2"/><path d="M12 12L12 3A9 9 0 0 1 21 12Z" fill="#7A6E60"/></svg>
                <span>Расходы</span>
              </button>
              <button style="min-height: 42px; border-radius: 14px; padding: 0 14px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 800; color: #5A4E40; background: transparent; border: none; cursor: pointer;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="#7A6E60" stroke-width="2"/><path d="M3 18C3 15 5.5 14 9 14C12.5 14 15 15 15 18" stroke="#7A6E60" stroke-width="2"/></svg>
                <span>Клиенты</span>
              </button>
              <button style="min-height: 42px; border-radius: 14px; padding: 0 14px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 800; color: #5A4E40; background: transparent; border: none; cursor: pointer; margin-top: auto;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#7A6E60" stroke-width="2"/><path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke="#7A6E60" stroke-width="2"/></svg>
                <span>Настройки</span>
              </button>
            </div>

            <!-- Рабочая область десктопа -->
            <div style="display: flex; flex-direction: column; gap: 16px;">

              <!-- Верхняя строка: Заголовок, Поиск, Аватар котика -->
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                <div style="font-size: 24px; font-weight: 900; font-family: Georgia, serif; color: #2F261D; letter-spacing: -0.3px;">Мой мир ♡</div>
                <div style="flex: 1; max-width: 300px; background: #FFFBF5; border-radius: 14px; padding: 8px 14px; display: flex; align-items: center; gap: 8px; box-shadow: inset 1.5px 2px 5px rgba(150, 130, 110, 0.12), 1px 1px 2px rgba(255,255,255,0.8); border: 1px solid rgba(220, 205, 185, 0.6); font-size: 12px; color: #726453;">
                  <span>🔍</span>
                  <span>Поиск...</span>
                </div>
                <div style="width: 40px; height: 40px; border-radius: 50%; background: #FAF2E7; box-shadow: 4px 6px 14px rgba(160, 135, 110, 0.28), -2px -2px 6px rgba(255, 255, 255, 0.95); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1.5px solid #FFFFFF;">
                  <img src="photo_2026-10-22_21-35-01.jpg" style="width: 140px; height: 95px; object-fit: cover; object-position: -23px -11px;" alt="Котик" />
                </div>
              </div>

              <!-- Верхний ряд: Календарь + Мои платежи -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                
                <!-- Календарь -->
                <div style="background: #FFFDF9; border-radius: 22px; padding: 16px; box-shadow: 8px 14px 28px -4px rgba(165, 140, 115, 0.22), -4px -4px 14px rgba(255, 255, 255, 0.95), inset 1px 1px 1.5px rgba(255, 255, 255, 0.9);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-family: Georgia, serif; font-size: 15px; font-weight: 800; color: #2F261D;">Март 2025</span>
                    <div style="display: flex; gap: 4px;">
                      <button style="width: 28px; height: 28px; border-radius: 50%; background: #FAF2E7; border: none; cursor: pointer; font-size: 13px; box-shadow: 2px 3px 6px rgba(150,130,110,0.2), -1px -1px 3px rgba(255,255,255,0.9);">‹</button>
                      <button style="width: 28px; height: 28px; border-radius: 50%; background: #FAF2E7; border: none; cursor: pointer; font-size: 13px; box-shadow: 2px 3px 6px rgba(150,130,110,0.2), -1px -1px 3px rgba(255,255,255,0.9);">›</button>
                    </div>
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; text-align: center; font-size: 10px;">
                    <div style="color: #9C8F80; font-weight: 700; padding-bottom: 4px;">Пн</div><div style="color: #9C8F80; font-weight: 700;">Вт</div><div style="color: #9C8F80; font-weight: 700;">Ср</div><div style="color: #9C8F80; font-weight: 700;">Чт</div><div style="color: #9C8F80; font-weight: 700;">Пт</div><div style="color: #9C8F80; font-weight: 700;">Сб</div><div style="color: #9C8F80; font-weight: 700;">Вс</div>
                    <div style="color: #C8BDAE; padding: 4px 0;">24</div><div style="color: #C8BDAE;">25</div><div style="color: #C8BDAE;">26</div><div style="color: #C8BDAE;">27</div><div style="color: #C8BDAE;">28</div><div style="font-weight: 700;">1</div><div style="font-weight: 700;">2</div>
                    <div style="font-weight: 700; padding: 4px 0;">3</div>
                    <div style="background: #D3E7F8; color: #1B4567; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 4px rgba(120,150,180,0.25);">4</div>
                    <div style="font-weight: 700;">5</div><div style="font-weight: 700;">6</div>
                    <div style="background: #FCD6CF; color: #6E2F26; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 4px rgba(200,130,130,0.25);">7</div>
                    <div style="font-weight: 700;">8</div><div style="font-weight: 700;">9</div>
                    <div style="font-weight: 700; padding: 4px 0;">10</div><div style="font-weight: 700;">11</div>
                    <div style="background: #FDF1CC; color: #5B481D; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 4px rgba(190,170,110,0.25);">12</div>
                    <div style="font-weight: 700;">13</div><div style="font-weight: 700;">14</div>
                    <div style="background: #FCE8D5; color: #6D3E14; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 4px rgba(200,150,110,0.25);">15</div>
                    <div style="font-weight: 700;">16</div>
                    <div style="font-weight: 700; padding: 4px 0;">17</div><div style="font-weight: 700;">18</div><div style="font-weight: 700;">19</div><div style="font-weight: 700;">20</div>
                    <div style="background: #FCD6CF; color: #6E2F26; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 4px rgba(200,130,130,0.25);">21</div>
                    <div style="font-weight: 700;">22</div><div style="font-weight: 700;">23</div>
                    <div style="font-weight: 700; padding: 4px 0;">24</div><div style="font-weight: 700;">25</div><div style="font-weight: 700;">26</div><div style="font-weight: 700;">27</div>
                    <div style="background: #DBCCE9; color: #442B5B; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 4px rgba(150,130,170,0.25);">28</div>
                    <div style="font-weight: 700;">29</div><div style="font-weight: 700;">30</div><div style="font-weight: 700;">31</div>
                  </div>
                </div>

                <!-- Мои платежи -->
                <div style="background: #FFFDF9; border-radius: 22px; padding: 16px; box-shadow: 8px 14px 28px -4px rgba(165, 140, 115, 0.22), -4px -4px 14px rgba(255, 255, 255, 0.95), inset 1px 1px 1.5px rgba(255, 255, 255, 0.9);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-family: Georgia, serif; font-size: 15px; font-weight: 800; color: #2F261D;">Мои платежи</span>
                    <button style="width: 32px; height: 32px; border-radius: 50%; background: #FAF2E7; border: none; font-size: 16px; font-weight: 900; color: #4A3E31; cursor: pointer; box-shadow: 2px 4px 8px rgba(150,130,110,0.2), -1px -1px 3px rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center;">+</button>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 10px; padding: 5px 8px; font-size: 13px; font-weight: 700; color: #383025;">
                      <div style="width: 14px; height: 14px; border-radius: 50%; background: #D3E7F8; box-shadow: 1px 2px 4px rgba(0,0,0,0.12);"></div>
                      <span>VPN</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 5px 8px; font-size: 13px; font-weight: 700; color: #383025;">
                      <div style="width: 14px; height: 14px; border-radius: 50%; background: #C8E2D2; box-shadow: 1px 2px 4px rgba(0,0,0,0.12);"></div>
                      <span>Интернет</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 5px 8px; font-size: 13px; font-weight: 700; color: #383025;">
                      <div style="width: 14px; height: 14px; border-radius: 50%; background: #FCD6CF; box-shadow: 1px 2px 4px rgba(0,0,0,0.12);"></div>
                      <span>ИИ сервисы</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 5px 8px; font-size: 13px; font-weight: 700; color: #383025;">
                      <div style="width: 14px; height: 14px; border-radius: 50%; background: #FCE8D5; box-shadow: 1px 2px 4px rgba(0,0,0,0.12);"></div>
                      <span>Подписки</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 5px 8px; font-size: 13px; font-weight: 700; color: #383025;">
                      <div style="width: 14px; height: 14px; border-radius: 50%; background: #DBCCE9; box-shadow: 1px 2px 4px rgba(0,0,0,0.12);"></div>
                      <span>Прочее</span>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Нижний ряд: Доходы, Расходы, Клиенты -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">

                <!-- 1. ДОХОДЫ -->
                <div style="background: #FFFDF9; border-radius: 22px; padding: 14px; box-shadow: 8px 14px 28px -4px rgba(165, 140, 115, 0.20), -4px -4px 14px rgba(255, 255, 255, 0.95), inset 1px 1px 1.5px rgba(255, 255, 255, 0.9);">
                  <div style="background: #C8E2D2; color: #1E3F30; border-radius: 16px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; box-shadow: 3px 5px 12px rgba(120, 160, 135, 0.25);">
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 800;">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="13" rx="3.5" fill="#1E3F30"/><circle cx="18" cy="12.5" r="1.3" fill="#C8E2D2"/></svg>
                      <span>Доходы</span>
                    </div>
                    <button style="width: 28px; height: 28px; border-radius: 50%; background: #FAF2E7; border: none; font-size: 15px; font-weight: 900; color: #1E3F30; cursor: pointer; box-shadow: 2px 3px 6px rgba(0,0,0,0.12);">+</button>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="background: #FFFFFF; border-radius: 14px; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 2px 4px 8px rgba(160, 140, 120, 0.1); font-size: 12px; cursor: pointer;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: #C8E2D2;"></div>
                        <div><div style="font-weight: 800; color: #2F261D;">Проект Сайт</div><div style="font-size: 10px; color: #8A7B6B;">12 мар</div></div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="font-weight: 900; color: #2D5847;">+ 45 000 ₽</span>
                        <span style="color: #B0A090; font-size: 11px;">›</span>
                      </div>
                    </div>
                    <div style="background: #FFFFFF; border-radius: 14px; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 2px 4px 8px rgba(160, 140, 120, 0.1); font-size: 12px; cursor: pointer;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: #FCD6CF;"></div>
                        <div><div style="font-weight: 800; color: #2F261D;">Проект Дизайн</div><div style="font-size: 10px; color: #8A7B6B;">4 мар</div></div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="font-weight: 900; color: #2D5847;">+ 30 000 ₽</span>
                        <span style="color: #B0A090; font-size: 11px;">›</span>
                      </div>
                    </div>
                    <div style="background: #FFFFFF; border-radius: 14px; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 2px 4px 8px rgba(160, 140, 120, 0.1); font-size: 12px; cursor: pointer;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: #FDF1CC;"></div>
                        <div><div style="font-weight: 800; color: #2F261D;">Консультация</div><div style="font-size: 10px; color: #8A7B6B;">1 мар</div></div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="font-weight: 900; color: #2D5847;">+ 10 000 ₽</span>
                        <span style="color: #B0A090; font-size: 11px;">›</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 2. РАСХОДЫ -->
                <div style="background: #FFFDF9; border-radius: 22px; padding: 14px; box-shadow: 8px 14px 28px -4px rgba(165, 140, 115, 0.20), -4px -4px 14px rgba(255, 255, 255, 0.95), inset 1px 1px 1.5px rgba(255, 255, 255, 0.9);">
                  <div style="background: #FCD6CF; color: #58241B; border-radius: 16px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; box-shadow: 3px 5px 12px rgba(185, 135, 130, 0.25);">
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 800;">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#58241B"/><path d="M12 12L12 3A9 9 0 0 1 21 12Z" fill="#FDF3F1"/><path d="M12 12L21 12A9 9 0 0 1 12 21Z" fill="#B35B4C"/></svg>
                      <span>Расходы</span>
                    </div>
                    <button style="width: 28px; height: 28px; border-radius: 50%; background: #FAF2E7; border: none; font-size: 15px; font-weight: 900; color: #58241B; cursor: pointer; box-shadow: 2px 3px 6px rgba(0,0,0,0.12);">+</button>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="background: #FFFFFF; border-radius: 14px; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 2px 4px 8px rgba(160, 140, 120, 0.1); font-size: 12px; cursor: pointer;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: #D3E7F8;"></div>
                        <div><div style="font-weight: 800; color: #2F261D;">VPN</div><div style="font-size: 10px; color: #8A7B6B;">15 мар</div></div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="font-weight: 900; color: #6E2F26;">850 ₽</span>
                        <span style="color: #B0A090; font-size: 11px;">›</span>
                      </div>
                    </div>
                    <div style="background: #FFFFFF; border-radius: 14px; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 2px 4px 8px rgba(160, 140, 120, 0.1); font-size: 12px; cursor: pointer;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: #C8E2D2;"></div>
                        <div><div style="font-weight: 800; color: #2F261D;">Интернет</div><div style="font-size: 10px; color: #8A7B6B;">10 мар</div></div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="font-weight: 900; color: #6E2F26;">1 200 ₽</span>
                        <span style="color: #B0A090; font-size: 11px;">›</span>
                      </div>
                    </div>
                    <div style="background: #FFFFFF; border-radius: 14px; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 2px 4px 8px rgba(160, 140, 120, 0.1); font-size: 12px; cursor: pointer;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: #FCD6CF;"></div>
                        <div><div style="font-weight: 800; color: #2F261D;">ИИ сервисы</div><div style="font-size: 10px; color: #8A7B6B;">21 мар</div></div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="font-weight: 900; color: #6E2F26;">2 000 ₽</span>
                        <span style="color: #B0A090; font-size: 11px;">›</span>
                      </div>
                    </div>
                    <div style="background: #FFFFFF; border-radius: 14px; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 2px 4px 8px rgba(160, 140, 120, 0.1); font-size: 12px; cursor: pointer;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: #FCE8D5;"></div>
                        <div><div style="font-weight: 800; color: #2F261D;">Подписка</div><div style="font-size: 10px; color: #8A7B6B;">28 мар</div></div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="font-weight: 900; color: #6E2F26;">599 ₽</span>
                        <span style="color: #B0A090; font-size: 11px;">›</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 3. КЛИЕНТЫ -->
                <div style="background: #FFFDF9; border-radius: 22px; padding: 14px; box-shadow: 8px 14px 28px -4px rgba(165, 140, 115, 0.20), -4px -4px 14px rgba(255, 255, 255, 0.95), inset 1px 1px 1.5px rgba(255, 255, 255, 0.9);">
                  <div style="background: #D3E7F8; color: #163B59; border-radius: 16px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; box-shadow: 3px 5px 12px rgba(125, 150, 180, 0.25);">
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 800;">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.2" fill="#163B59"/><path d="M3 18.5C3 15.2 5.5 13.8 9 13.8C12.5 13.8 15 15.2 15 18.5" fill="#163B59"/></svg>
                      <span>Клиенты</span>
                    </div>
                    <button style="width: 28px; height: 28px; border-radius: 50%; background: #FAF2E7; border: none; font-size: 15px; font-weight: 900; color: #163B59; cursor: pointer; box-shadow: 2px 3px 6px rgba(0,0,0,0.12);">+</button>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="background: #FFFFFF; border-radius: 14px; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 2px 4px 8px rgba(160, 140, 120, 0.1); font-size: 12px; cursor: pointer;">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: #FFE7D6; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #7A421D; font-size: 11px;">А</div>
                        <div><div style="font-weight: 800; color: #2F261D;">Анна</div><div style="font-size: 10px; color: #8A7B6B;">Проект Сайт</div></div>
                      </div>
                      <span style="color: #B0A090; font-size: 11px;">›</span>
                    </div>
                    <div style="background: #FFFFFF; border-radius: 14px; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 2px 4px 8px rgba(160, 140, 120, 0.1); font-size: 12px; cursor: pointer;">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: #D8EBF8; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #1E507A; font-size: 11px;">И</div>
                        <div><div style="font-weight: 800; color: #2F261D;">Игорь</div><div style="font-size: 10px; color: #8A7B6B;">Проект Дизайн</div></div>
                      </div>
                      <span style="color: #B0A090; font-size: 11px;">›</span>
                    </div>
                    <div style="background: #FFFFFF; border-radius: 14px; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 2px 4px 8px rgba(160, 140, 120, 0.1); font-size: 12px; cursor: pointer;">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: #E2F2E7; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #2D6544; font-size: 11px;">К</div>
                        <div><div style="font-weight: 800; color: #2F261D;">Катя</div><div style="font-size: 10px; color: #8A7B6B;">Консультации</div></div>
                      </div>
                      <span style="color: #B0A090; font-size: 11px;">›</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>\n\n    `;

html = html.substring(0, startIdx) + screen1HTML + html.substring(endIdx);
fs.writeFileSync('макеты.html', html, 'utf8');
console.log('Successfully replaced Screen 1 in макеты.html with the exact reference replica!');
