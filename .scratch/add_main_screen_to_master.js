const fs = require('fs');

let html = fs.readFileSync('макеты.html', 'utf8');

const target = '<!-- =============================================================== -->\n    <!-- РАЗДЕЛ 1. СРАВНЕНИЕ ТЕНЕЙ';
const targetCRLF = '<!-- =============================================================== -->\r\n    <!-- РАЗДЕЛ 1. СРАВНЕНИЕ ТЕНЕЙ';

let idx = html.indexOf(target);
if (idx === -1) idx = html.indexOf(targetCRLF);

const mainScreenSection = `<!-- =============================================================== -->
    <!-- ЭКРАН 1. ГЛАВНЫЙ ЭКРАН «МОЙ МИР ♡» (ТЕЛЕФОН + ДЕСКТОП BENTO)     -->
    <!-- =============================================================== -->
    <div class="ui-card" style="margin-bottom: 32px; border: 2px solid #5A4E40; background: #FAF2E7; padding: 24px;">
      <div class="ui-card-header" style="margin-bottom: 20px;">
        <div>
          <span style="font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 8px; background: #5A4E40; color: #fff; display: inline-block; margin-bottom: 8px;">★ 3D-БУМАЖЕЧКИ • СВЕТ ИЗ ЛЕВОГО ВЕРХНЕГО УГЛА</span>
          <div class="ui-card-title" style="font-size: 22px;">Экран 1: Главный («Мой мир ♡»)</div>
        </div>
        <span class="ui-badge ui-badge-default">Утверждённые цвета • Свет слева-сверху</span>
      </div>

      <p style="font-size: 13px; color: #726453; margin-bottom: 24px; max-width: 800px; line-height: 1.5;">
        Источник света расположен в <strong>левом верхнем углу</strong>: все карточки и кнопки отбрасывают мягкие теплые тени <strong>вправо и вниз</strong>. Утверждённые цвета: Доходы — шалфей (<strong>#C8E2D2</strong>), Расходы — воздушная пудра (<strong>#FCD6CF</strong>), Клиенты — небо (<strong>#D3E7F8</strong>), Календарь — сливки (<strong>#FDF1CC</strong>). Сенсорные зоны от 44 px.
      </p>

      <div style="display: grid; grid-template-columns: 360px 1fr; gap: 28px; align-items: start;">

        <!-- 1. МОБИЛЬНЫЙ ТЕЛЕФОН -->
        <div>
          <div style="font-size: 11px; font-weight: 800; color: #726453; margin-bottom: 8px; text-transform: uppercase; text-align: center;">
            📱 На телефоне (iPhone)
          </div>

          <div style="background: #FFFFFF; border-radius: 44px; padding: 12px; box-shadow: 8px 18px 40px rgba(140, 120, 100, 0.24), 2px 4px 10px rgba(140, 120, 100, 0.12); border: 4px solid #F1E5D5; max-width: 360px; margin: 0 auto;">
            <div style="background: #FAF2E7; border-radius: 34px; padding: 14px 12px 18px 12px; min-height: 680px; display: flex; flex-direction: column;">
              
              <div style="width: 86px; height: 20px; background: #2D2721; border-radius: 12px; margin: 0 auto 8px auto;"></div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 700; color: #5A4E40; margin-bottom: 12px; padding: 0 6px;">
                <span>9:41</span>
                <span>100% 🔋</span>
              </div>

              <!-- Шапка: Название и Котик -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 0 4px;">
                <div style="font-size: 20px; font-weight: 900; font-family: Georgia, serif; color: #2F261D;">Мой мир ♡</div>
                <div style="width: 36px; height: 36px; border-radius: 50%; background: #FFF2DD; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 2px 4px 8px rgba(160, 140, 120, 0.18);">🐱</div>
              </div>

              <!-- Календарь на телефоне -->
              <div style="background: #FFFBF5; border-radius: 18px; padding: 12px 10px; margin-bottom: 12px; box-shadow: 4px 8px 18px rgba(160, 140, 120, 0.14); border: 1px solid rgba(230, 215, 195, 0.7);">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 800; color: #383025; margin-bottom: 8px; padding: 0 4px;">
                  <span style="cursor: pointer; padding: 2px 6px;">‹</span>
                  <span>Март 2025</span>
                  <span style="cursor: pointer; padding: 2px 6px;">›</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; font-size: 10px;">
                  <div style="font-weight: 700; color: #9C8F80; padding-bottom: 4px;">Пн</div>
                  <div style="font-weight: 700; color: #9C8F80; padding-bottom: 4px;">Вт</div>
                  <div style="font-weight: 700; color: #9C8F80; padding-bottom: 4px;">Ср</div>
                  <div style="font-weight: 700; color: #9C8F80; padding-bottom: 4px;">Чт</div>
                  <div style="font-weight: 700; color: #9C8F80; padding-bottom: 4px;">Пт</div>
                  <div style="font-weight: 700; color: #9C8F80; padding-bottom: 4px;">Сб</div>
                  <div style="font-weight: 700; color: #9C8F80; padding-bottom: 4px;">Вс</div>

                  <div style="color: #C0B4A4; padding: 4px 0;">24</div><div style="color: #C0B4A4; padding: 4px 0;">25</div><div style="color: #C0B4A4; padding: 4px 0;">26</div><div style="color: #C0B4A4; padding: 4px 0;">27</div><div style="color: #C0B4A4; padding: 4px 0;">28</div><div style="font-weight: 700; padding: 4px 0;">1</div><div style="font-weight: 700; padding: 4px 0;">2</div>
                  <div style="font-weight: 700; padding: 4px 0;">3</div>
                  <div style="background: #D3E7F8; color: #1B4567; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 4px rgba(120,150,180,0.2);">4</div>
                  <div style="font-weight: 700; padding: 4px 0;">5</div><div style="font-weight: 700; padding: 4px 0;">6</div>
                  <div style="background: #FCD6CF; color: #6E2F26; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 4px rgba(200,130,130,0.25);">7</div>
                  <div style="font-weight: 700; padding: 4px 0;">8</div><div style="font-weight: 700; padding: 4px 0;">9</div>
                  <div style="font-weight: 700; padding: 4px 0;">10</div><div style="font-weight: 700; padding: 4px 0;">11</div>
                  <div style="background: #FDF1CC; color: #5B481D; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 4px rgba(190,170,110,0.2);">12</div>
                  <div style="font-weight: 700; padding: 4px 0;">13</div><div style="font-weight: 700; padding: 4px 0;">14</div>
                  <div style="background: #FCE8D5; color: #6D3E14; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 4px rgba(200,150,110,0.2);">15</div>
                  <div style="font-weight: 700; padding: 4px 0;">16</div>
                  <div style="font-weight: 700; padding: 4px 0;">17</div><div style="font-weight: 700; padding: 4px 0;">18</div><div style="font-weight: 700; padding: 4px 0;">19</div><div style="font-weight: 700; padding: 4px 0;">20</div>
                  <div style="background: #FCD6CF; color: #6E2F26; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 4px rgba(200,130,130,0.25);">21</div>
                  <div style="font-weight: 700; padding: 4px 0;">22</div><div style="font-weight: 700; padding: 4px 0;">23</div>
                  <div style="font-weight: 700; padding: 4px 0;">24</div><div style="font-weight: 700; padding: 4px 0;">25</div><div style="font-weight: 700; padding: 4px 0;">26</div><div style="font-weight: 700; padding: 4px 0;">27</div>
                  <div style="background: #DBCCE9; color: #442B5B; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 1px 2px 4px rgba(150,130,170,0.2);">28</div>
                  <div style="font-weight: 700; padding: 4px 0;">29</div><div style="font-weight: 700; padding: 4px 0;">30</div>
                </div>
              </div>

              <!-- 3 Карточки на телефоне -->
              <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: auto;">
                
                <!-- Доходы -->
                <div style="background: #C8E2D2; color: #234735; min-height: 56px; border-radius: 18px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: 4px 8px 18px rgba(140, 160, 150, 0.22); cursor: pointer;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 38px; height: 38px; border-radius: 12px; background: #A2CBB2; display: flex; align-items: center; justify-content: center; font-size: 16px;">👛</div>
                    <div>
                      <div style="font-size: 14px; font-weight: 800;">Доходы</div>
                      <div style="font-size: 11px; opacity: 0.85;">125 500 ₽</div>
                    </div>
                  </div>
                  <button style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.85); border: none; font-size: 13px; font-weight: 900; color: #4A3E31; box-shadow: 2px 4px 8px rgba(150,130,110,0.14); cursor: pointer;">›</button>
                </div>

                <!-- Расходы -->
                <div style="background: #FCD6CF; color: #6E2F26; min-height: 56px; border-radius: 18px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: 4px 8px 18px rgba(180, 140, 140, 0.20); cursor: pointer;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 38px; height: 38px; border-radius: 12px; background: #F4B8AC; display: flex; align-items: center; justify-content: center; font-size: 16px;">🍰</div>
                    <div>
                      <div style="font-size: 14px; font-weight: 800;">Расходы</div>
                      <div style="font-size: 11px; opacity: 0.85;">28 400 ₽</div>
                    </div>
                  </div>
                  <button style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.85); border: none; font-size: 13px; font-weight: 900; color: #4A3E31; box-shadow: 2px 4px 8px rgba(150,130,110,0.14); cursor: pointer;">›</button>
                </div>

                <!-- Клиенты -->
                <div style="background: #D3E7F8; color: #1B4567; min-height: 56px; border-radius: 18px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: 4px 8px 18px rgba(140, 160, 180, 0.20); cursor: pointer;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 38px; height: 38px; border-radius: 12px; background: #A6D0F2; display: flex; align-items: center; justify-content: center; font-size: 16px;">👥</div>
                    <div>
                      <div style="font-size: 14px; font-weight: 800;">Клиенты</div>
                      <div style="font-size: 11px; opacity: 0.85;">12 активных</div>
                    </div>
                  </div>
                  <button style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.85); border: none; font-size: 13px; font-weight: 900; color: #4A3E31; box-shadow: 2px 4px 8px rgba(150,130,110,0.14); cursor: pointer;">›</button>
                </div>

              </div>

              <!-- Таб-бар внизу -->
              <div style="background: #FFFFFF; border-radius: 22px; padding: 6px 8px; display: flex; justify-content: space-around; align-items: center; box-shadow: 4px 8px 18px rgba(140, 120, 100, 0.16); margin-top: 14px;">
                <div style="width: 44px; height: 44px; border-radius: 14px; background: #FDF1CC; color: #5B481D; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 1px 2px 4px rgba(190,170,110,0.2);">🏠</div>
                <div style="width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #726453;">📅</div>
                <div style="width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #726453;">📊</div>
                <div style="width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #726453;">👤</div>
              </div>

            </div>
          </div>
        </div>

        <!-- 2. ДЕСКТОПНЫЙ ВИД BENTO GRID -->
        <div>
          <div style="font-size: 11px; font-weight: 800; color: #726453; margin-bottom: 8px; text-transform: uppercase;">
            💻 На компьютере (Bento Grid)
          </div>

          <div style="background: #FAF2E7; border-radius: 26px; padding: 20px; box-shadow: 8px 18px 40px rgba(140, 120, 100, 0.18), 2px 4px 8px rgba(140, 120, 100, 0.08); border: 1px solid rgba(220, 205, 185, 0.7); display: grid; grid-template-columns: 170px 1fr; gap: 18px;">
            
            <!-- Левое меню десктопа -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="padding: 4px 10px; margin-bottom: 8px;">
                <span style="font-size: 17px; font-weight: 900; font-family: Georgia, serif;">Таблицы</span>
              </div>
              <button style="min-height: 42px; border-radius: 12px; padding: 0 12px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; color: #5B481D; background: #FDF1CC; border: none; cursor: pointer; box-shadow: 2px 4px 8px rgba(190,170,110,0.18);"><span>🏠</span><span>Главная</span></button>
              <button style="min-height: 42px; border-radius: 12px; padding: 0 12px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; color: #5A4E40; background: transparent; border: none; cursor: pointer;"><span>📅</span><span>Календарь</span></button>
              <button style="min-height: 42px; border-radius: 12px; padding: 0 12px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; color: #5A4E40; background: transparent; border: none; cursor: pointer;"><span>👛</span><span>Доходы</span></button>
              <button style="min-height: 42px; border-radius: 12px; padding: 0 12px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; color: #5A4E40; background: transparent; border: none; cursor: pointer;"><span>🍰</span><span>Расходы</span></button>
              <button style="min-height: 42px; border-radius: 12px; padding: 0 12px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; color: #5A4E40; background: transparent; border: none; cursor: pointer;"><span>👥</span><span>Клиенты</span></button>
              <button style="min-height: 42px; border-radius: 12px; padding: 0 12px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; color: #5A4E40; background: transparent; border: none; cursor: pointer; margin-top: auto;"><span>⚙️</span><span>Настройки</span></button>
            </div>

            <!-- Рабочая область десктопа -->
            <div style="display: flex; flex-direction: column; gap: 14px;">

              <!-- Шапка -->
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 14px;">
                <div style="font-size: 22px; font-weight: 900; font-family: Georgia, serif; color: #2F261D;">Мой мир ♡</div>
                <div style="flex: 1; max-width: 280px; background: #FFFBF5; border-radius: 12px; padding: 7px 12px; display: flex; align-items: center; gap: 6px; box-shadow: inset 1px 2px 4px rgba(150, 130, 110, 0.1); border: 1px solid rgba(220, 205, 185, 0.6); font-size: 12px; color: #726453;">
                  <span>🔍</span>
                  <span>Поиск...</span>
                </div>
                <div style="width: 38px; height: 38px; border-radius: 50%; background: #FFF2DD; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 2px 4px 8px rgba(160, 140, 120, 0.18);">🐱</div>
              </div>

              <!-- Верхний Bento: Календарь + Мои платежи -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                
                <!-- Календарь десктоп -->
                <div style="background: #FFFBF5; border-radius: 20px; padding: 14px; box-shadow: 4px 8px 18px rgba(150, 130, 110, 0.14); border: 1px solid rgba(220, 205, 185, 0.7);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 14px; font-weight: 800; color: #2F261D;">Март 2025</span>
                    <div style="display: flex; gap: 4px;">
                      <button style="width: 26px; height: 26px; border-radius: 50%; background: #FAF2E7; border: none; cursor: pointer; font-size: 12px; box-shadow: 1px 2px 4px rgba(150,130,110,0.15);">‹</button>
                      <button style="width: 26px; height: 26px; border-radius: 50%; background: #FAF2E7; border: none; cursor: pointer; font-size: 12px; box-shadow: 1px 2px 4px rgba(150,130,110,0.15);">›</button>
                    </div>
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; font-size: 10px;">
                    <div style="color: #9C8F80; font-weight: 700; padding-bottom: 2px;">Пн</div><div style="color: #9C8F80; font-weight: 700;">Вт</div><div style="color: #9C8F80; font-weight: 700;">Ср</div><div style="color: #9C8F80; font-weight: 700;">Чт</div><div style="color: #9C8F80; font-weight: 700;">Пт</div><div style="color: #9C8F80; font-weight: 700;">Сб</div><div style="color: #9C8F80; font-weight: 700;">Вс</div>
                    <div style="color: #C0B4A4; padding: 3px 0;">24</div><div style="color: #C0B4A4;">25</div><div style="color: #C0B4A4;">26</div><div style="color: #C0B4A4;">27</div><div style="color: #C0B4A4;">28</div><div style="font-weight: 700;">1</div><div style="font-weight: 700;">2</div>
                    <div style="font-weight: 700; padding: 3px 0;">3</div>
                    <div style="background: #D3E7F8; color: #1B4567; font-weight: 800; border-radius: 50%; width: 20px; height: 20px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">4</div>
                    <div style="font-weight: 700;">5</div><div style="font-weight: 700;">6</div>
                    <div style="background: #FCD6CF; color: #6E2F26; font-weight: 800; border-radius: 50%; width: 20px; height: 20px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">7</div>
                    <div style="font-weight: 700;">8</div><div style="font-weight: 700;">9</div>
                    <div style="font-weight: 700; padding: 3px 0;">10</div><div style="font-weight: 700;">11</div>
                    <div style="background: #FDF1CC; color: #5B481D; font-weight: 800; border-radius: 50%; width: 20px; height: 20px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">12</div>
                    <div style="font-weight: 700;">13</div><div style="font-weight: 700;">14</div>
                    <div style="background: #FCE8D5; color: #6D3E14; font-weight: 800; border-radius: 50%; width: 20px; height: 20px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">15</div>
                    <div style="font-weight: 700;">16</div>
                    <div style="font-weight: 700; padding: 3px 0;">17</div><div style="font-weight: 700;">18</div><div style="font-weight: 700;">19</div><div style="font-weight: 700;">20</div>
                    <div style="background: #FCD6CF; color: #6E2F26; font-weight: 800; border-radius: 50%; width: 20px; height: 20px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">21</div>
                    <div style="font-weight: 700;">22</div><div style="font-weight: 700;">23</div>
                    <div style="font-weight: 700; padding: 3px 0;">24</div><div style="font-weight: 700;">25</div><div style="font-weight: 700;">26</div><div style="font-weight: 700;">27</div>
                    <div style="background: #DBCCE9; color: #442B5B; font-weight: 800; border-radius: 50%; width: 20px; height: 20px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">28</div>
                    <div style="font-weight: 700;">29</div><div style="font-weight: 700;">30</div>
                  </div>
                </div>

                <!-- Мои платежи десктоп -->
                <div style="background: #FFFBF5; border-radius: 20px; padding: 14px; box-shadow: 4px 8px 18px rgba(150, 130, 110, 0.14); border: 1px solid rgba(220, 205, 185, 0.7);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 14px; font-weight: 800; color: #2F261D;">Мои платежи</span>
                    <button style="width: 28px; height: 28px; border-radius: 50%; background: #FAF2E7; border: none; font-size: 16px; font-weight: 900; color: #4A3E31; cursor: pointer; box-shadow: 1px 2px 4px rgba(150,130,110,0.15);">+</button>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px; padding: 4px 6px; font-size: 12px; font-weight: 700; color: #383025;">
                      <div style="width: 12px; height: 12px; border-radius: 50%; background: #D3E7F8; box-shadow: 1px 1px 3px rgba(0,0,0,0.1);"></div>
                      <span>VPN</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; padding: 4px 6px; font-size: 12px; font-weight: 700; color: #383025;">
                      <div style="width: 12px; height: 12px; border-radius: 50%; background: #C8E2D2; box-shadow: 1px 1px 3px rgba(0,0,0,0.1);"></div>
                      <span>Интернет</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; padding: 4px 6px; font-size: 12px; font-weight: 700; color: #383025;">
                      <div style="width: 12px; height: 12px; border-radius: 50%; background: #FCD6CF; box-shadow: 1px 1px 3px rgba(0,0,0,0.1);"></div>
                      <span>ИИ сервисы</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; padding: 4px 6px; font-size: 12px; font-weight: 700; color: #383025;">
                      <div style="width: 12px; height: 12px; border-radius: 50%; background: #FCE8D5; box-shadow: 1px 1px 3px rgba(0,0,0,0.1);"></div>
                      <span>Подписки</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; padding: 4px 6px; font-size: 12px; font-weight: 700; color: #383025;">
                      <div style="width: 12px; height: 12px; border-radius: 50%; background: #DBCCE9; box-shadow: 1px 1px 3px rgba(0,0,0,0.1);"></div>
                      <span>Прочее</span>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Нижний Bento: 3 колонки -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">

                <!-- Доходы -->
                <div style="background: #FFFBF5; border-radius: 20px; padding: 12px; box-shadow: 4px 8px 18px rgba(150, 130, 110, 0.14); border: 1px solid rgba(220, 205, 185, 0.7);">
                  <div style="background: #C8E2D2; color: #234735; border-radius: 14px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; box-shadow: 2px 3px 6px rgba(150,130,110,0.1);">
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 900;">
                      <span>👛</span><span>Доходы</span>
                    </div>
                    <button style="width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.7); border: none; font-size: 14px; font-weight: 900; cursor: pointer;">+</button>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    <div style="background: #FFFFFF; border-radius: 12px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 1px 2px 4px rgba(150,130,110,0.08); font-size: 11px;">
                      <div><div style="font-weight: 800; color: #2F261D;">Проект Сайт</div><div style="font-size: 9px; color: #8C7E70;">12 мар</div></div>
                      <span style="font-weight: 900; color: #234735;">+45 000 ₽</span>
                    </div>
                    <div style="background: #FFFFFF; border-radius: 12px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 1px 2px 4px rgba(150,130,110,0.08); font-size: 11px;">
                      <div><div style="font-weight: 800; color: #2F261D;">Проект Дизайн</div><div style="font-size: 9px; color: #8C7E70;">4 мар</div></div>
                      <span style="font-weight: 900; color: #234735;">+30 000 ₽</span>
                    </div>
                    <div style="background: #FFFFFF; border-radius: 12px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 1px 2px 4px rgba(150,130,110,0.08); font-size: 11px;">
                      <div><div style="font-weight: 800; color: #2F261D;">Консультация</div><div style="font-size: 9px; color: #8C7E70;">1 мар</div></div>
                      <span style="font-weight: 900; color: #234735;">+10 000 ₽</span>
                    </div>
                  </div>
                </div>

                <!-- Расходы -->
                <div style="background: #FFFBF5; border-radius: 20px; padding: 12px; box-shadow: 4px 8px 18px rgba(150, 130, 110, 0.14); border: 1px solid rgba(220, 205, 185, 0.7);">
                  <div style="background: #FCD6CF; color: #6E2F26; border-radius: 14px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; box-shadow: 2px 3px 6px rgba(150,130,110,0.1);">
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 900;">
                      <span>🍰</span><span>Расходы</span>
                    </div>
                    <button style="width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.7); border: none; font-size: 14px; font-weight: 900; cursor: pointer;">+</button>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    <div style="background: #FFFFFF; border-radius: 12px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 1px 2px 4px rgba(150,130,110,0.08); font-size: 11px;">
                      <div><div style="font-weight: 800; color: #2F261D;">VPN</div><div style="font-size: 9px; color: #8C7E70;">15 мар</div></div>
                      <span style="font-weight: 900; color: #6E2F26;">850 ₽</span>
                    </div>
                    <div style="background: #FFFFFF; border-radius: 12px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 1px 2px 4px rgba(150,130,110,0.08); font-size: 11px;">
                      <div><div style="font-weight: 800; color: #2F261D;">Интернет</div><div style="font-size: 9px; color: #8C7E70;">10 мар</div></div>
                      <span style="font-weight: 900; color: #6E2F26;">1 200 ₽</span>
                    </div>
                    <div style="background: #FFFFFF; border-radius: 12px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 1px 2px 4px rgba(150,130,110,0.08); font-size: 11px;">
                      <div><div style="font-weight: 800; color: #2F261D;">ИИ сервисы</div><div style="font-size: 9px; color: #8C7E70;">21 мар</div></div>
                      <span style="font-weight: 900; color: #6E2F26;">2 000 ₽</span>
                    </div>
                  </div>
                </div>

                <!-- Клиенты -->
                <div style="background: #FFFBF5; border-radius: 20px; padding: 12px; box-shadow: 4px 8px 18px rgba(150, 130, 110, 0.14); border: 1px solid rgba(220, 205, 185, 0.7);">
                  <div style="background: #D3E7F8; color: #1B4567; border-radius: 14px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; box-shadow: 2px 3px 6px rgba(150,130,110,0.1);">
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 900;">
                      <span>👥</span><span>Клиенты</span>
                    </div>
                    <button style="width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.7); border: none; font-size: 14px; font-weight: 900; cursor: pointer;">+</button>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    <div style="background: #FFFFFF; border-radius: 12px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 1px 2px 4px rgba(150,130,110,0.08); font-size: 11px;">
                      <div><div style="font-weight: 800; color: #2F261D;">Анна</div><div style="font-size: 9px; color: #8C7E70;">Проект Сайт</div></div>
                      <span style="font-size: 12px; color: #A09080;">›</span>
                    </div>
                    <div style="background: #FFFFFF; border-radius: 12px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 1px 2px 4px rgba(150,130,110,0.08); font-size: 11px;">
                      <div><div style="font-weight: 800; color: #2F261D;">Игорь</div><div style="font-size: 9px; color: #8C7E70;">Проект Дизайн</div></div>
                      <span style="font-size: 12px; color: #A09080;">›</span>
                    </div>
                    <div style="background: #FFFFFF; border-radius: 12px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 1px 2px 4px rgba(150,130,110,0.08); font-size: 11px;">
                      <div><div style="font-weight: 800; color: #2F261D;">Катя</div><div style="font-size: 9px; color: #8C7E70;">Консультации</div></div>
                      <span style="font-size: 12px; color: #A09080;">›</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>\n\n    `;

if (idx !== -1) {
  html = html.substring(0, idx) + mainScreenSection + html.substring(idx);
  fs.writeFileSync('макеты.html', html, 'utf8');
  console.log('Successfully inserted Screen 1 (Main) into макеты.html!');
} else {
  console.log('Target not found in макеты.html!');
}
