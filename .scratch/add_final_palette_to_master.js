const fs = require('fs');
let html = fs.readFileSync('макеты.html', 'utf8');

const target = '<!-- КАТАЛОГ НАКОПЛЕНИЯ: ВСЕ ВАРИАНТЫ ЦВЕТОВ ДЛЯ СРАВНЕНИЯ -->';

const finalPaletteBlock = `<!-- =============================================================== -->
    <!-- УТВЕРЖДЁННАЯ ИТОГОВАЯ ПАЛИТРА ПРОЕКТА «МОИ ТАБЛИЦЫ»            -->
    <!-- =============================================================== -->
    <div class="ui-card" style="margin-bottom: 24px; border: 2px solid #2D5847; background: #FAF5EE;">
      <div class="ui-card-header">
        <div>
          <span style="font-size: 10px; font-weight: 900; padding: 3px 8px; border-radius: 6px; background: #2D5847; color: #fff; display: inline-block; margin-bottom: 6px;">✓ УТВЕРЖДЁННАЯ ПАЛИТРА СИСТЕМЫ</span>
          <div class="ui-card-title">Итоговая палитра: 7 гармоничных оттенков</div>
        </div>
        <span class="ui-badge ui-badge-default">Официальный стандарт</span>
      </div>

      <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px;">
        Все 7 выбранных оттенков работают вместе в чистом матовом бумажном стиле (без градиентов, без конфетности и без терракоты):
      </p>

      <div class="bento-grid" style="margin-bottom: 20px;">
        <!-- Стол -->
        <div class="col-3">
          <div style="background-color: #FAF2E7; color: #4A3E31; padding: 14px; border-radius: 16px; border: 1px solid #E5D5C1; box-shadow: 2px 4px 10px rgba(160,140,120,0.18); min-height: 85px; display: flex; flex-direction: column; justify-content: space-between;">
            <div><div style="font-size: 12px; font-weight: 900;">Сливочный песок</div><div style="font-size: 10px; opacity: 0.8;">Фон стола</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.7); border-radius: 6px; width: fit-content; margin-top: 4px;">#FAF2E7</div>
          </div>
        </div>
        <!-- Зеленый -->
        <div class="col-3">
          <div style="background-color: #C8E2D2; color: #244736; padding: 14px; border-radius: 16px; box-shadow: 2px 4px 10px rgba(160,140,120,0.18); min-height: 85px; display: flex; flex-direction: column; justify-content: space-between;">
            <div><div style="font-size: 12px; font-weight: 900;">Зеленый 1</div><div style="font-size: 10px; opacity: 0.8;">Раздел «Доходы»</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.7); border-radius: 6px; width: fit-content; margin-top: 4px;">#C8E2D2</div>
          </div>
        </div>
        <!-- Розовый -->
        <div class="col-3">
          <div style="background-color: #FADCE2; color: #6E2D3B; padding: 14px; border-radius: 16px; box-shadow: 2px 4px 10px rgba(160,140,120,0.18); min-height: 85px; display: flex; flex-direction: column; justify-content: space-between;">
            <div><div style="font-size: 12px; font-weight: 900;">Лепестки розы</div><div style="font-size: 10px; opacity: 0.8;">Раздел «Расходы»</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.7); border-radius: 6px; width: fit-content; margin-top: 4px;">#FADCE2</div>
          </div>
        </div>
        <!-- Голубой -->
        <div class="col-3">
          <div style="background-color: #D3E7F8; color: #1E4668; padding: 14px; border-radius: 16px; box-shadow: 2px 4px 10px rgba(160,140,120,0.18); min-height: 85px; display: flex; flex-direction: column; justify-content: space-between;">
            <div><div style="font-size: 12px; font-weight: 900;">Утреннее небо</div><div style="font-size: 10px; opacity: 0.8;">Раздел «Клиенты»</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.7); border-radius: 6px; width: fit-content; margin-top: 4px;">#D3E7F8</div>
          </div>
        </div>
      </div>

      <div class="bento-grid">
        <!-- Желтый -->
        <div class="col-4">
          <div style="background-color: #FDF1CC; color: #5B481D; padding: 14px; border-radius: 16px; box-shadow: 2px 4px 10px rgba(160,140,120,0.18); min-height: 85px; display: flex; flex-direction: column; justify-content: space-between;">
            <div><div style="font-size: 12px; font-weight: 900;">Нежные сливки</div><div style="font-size: 10px; opacity: 0.8;">Календарь и фокус</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.7); border-radius: 6px; width: fit-content; margin-top: 4px;">#FDF1CC</div>
          </div>
        </div>
        <!-- Оранжевый -->
        <div class="col-4">
          <div style="background-color: #FCE8D5; color: #6E3F14; padding: 14px; border-radius: 16px; box-shadow: 2px 4px 10px rgba(160,140,120,0.18); min-height: 85px; display: flex; flex-direction: column; justify-content: space-between;">
            <div><div style="font-size: 12px; font-weight: 900;">Абрикосовый крем</div><div style="font-size: 10px; opacity: 0.8;">Категория «Подписки»</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.7); border-radius: 6px; width: fit-content; margin-top: 4px;">#FCE8D5</div>
          </div>
        </div>
        <!-- Фиолетовый -->
        <div class="col-4">
          <div style="background-color: #DBCCE9; color: #442B5B; padding: 14px; border-radius: 16px; box-shadow: 2px 4px 10px rgba(160,140,120,0.18); min-height: 85px; display: flex; flex-direction: column; justify-content: space-between;">
            <div><div style="font-size: 12px; font-weight: 900;">Фиолетовый 1</div><div style="font-size: 10px; opacity: 0.8;">Категория «Прочее»</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.7); border-radius: 6px; width: fit-content; margin-top: 4px;">#DBCCE9</div>
          </div>
        </div>
      </div>
    </div>\n\n    `;

const idx = html.indexOf(target);
if (idx !== -1) {
  html = html.substring(0, idx) + finalPaletteBlock + html.substring(idx);
  fs.writeFileSync('макеты.html', html, 'utf8');
  console.log('Successfully inserted final palette block into макеты.html!');
} else {
  console.log('Target not found in макеты.html!');
}
