const fs = require('fs');
let html = fs.readFileSync('макеты.html', 'utf8');

const target = '<!-- =============================================================== -->\r\n    <!-- РАЗДЕЛ 2. ПАЛИТРА ГРАДИЕНТОВ';
const targetLF = '<!-- =============================================================== -->\n    <!-- РАЗДЕЛ 2. ПАЛИТРА ГРАДИЕНТОВ';

const powderSection = `<!-- =============================================================== -->
    <!-- ПУДРОВЫЕ ЦВЕТА СКРИНШОТА 1 (ЧИСТЫЙ МАТ, БЕЗ ГРАДИЕНТОВ)        -->
    <!-- =============================================================== -->
    <div class="ui-card" style="margin-bottom: 24px;">
      <div class="ui-card-header">
        <div class="ui-card-title">
          <span class="badge-num-3d">★</span>
          Пудровые цвета со Скриншота 1 (Чистый мат, без градиентов)
        </div>
        <span class="ui-badge ui-badge-default">4 базовых цвета</span>
      </div>

      <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px;">
        Точные пастельные матовые цвета из первого референса для оформления карточек и таблиц:
      </p>

      <div class="bento-grid">
        <div class="col-3">
          <div style="background-color: #C8E2D2; color: #244736; padding: 20px 16px; border-radius: 18px; box-shadow: 4px 6px 16px rgba(160, 140, 120, 0.22); min-height: 120px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 14px; font-weight: 900;">Пудровый зеленый</div>
              <div style="font-size: 11px; opacity: 0.85; margin-top: 3px;">Раздел «Доходы»</div>
            </div>
            <div style="font-size: 11px; font-weight: 800; font-family: monospace; padding: 3px 8px; background: rgba(255,255,255,0.55); border-radius: 8px; width: fit-content; margin-top: 8px;">#C8E2D2</div>
          </div>
        </div>

        <div class="col-3">
          <div style="background-color: #F5CBC4; color: #6E2D23; padding: 20px 16px; border-radius: 18px; box-shadow: 4px 6px 16px rgba(160, 140, 120, 0.22); min-height: 120px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 14px; font-weight: 900;">Пудровый розовый</div>
              <div style="font-size: 11px; opacity: 0.85; margin-top: 3px;">Раздел «Расходы»</div>
            </div>
            <div style="font-size: 11px; font-weight: 800; font-family: monospace; padding: 3px 8px; background: rgba(255,255,255,0.55); border-radius: 8px; width: fit-content; margin-top: 8px;">#F5CBC4</div>
          </div>
        </div>

        <div class="col-3">
          <div style="background-color: #C9DCED; color: #224361; padding: 20px 16px; border-radius: 18px; box-shadow: 4px 6px 16px rgba(160, 140, 120, 0.22); min-height: 120px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 14px; font-weight: 900;">Пудровый голубой</div>
              <div style="font-size: 11px; opacity: 0.85; margin-top: 3px;">Раздел «Клиенты»</div>
            </div>
            <div style="font-size: 11px; font-weight: 800; font-family: monospace; padding: 3px 8px; background: rgba(255,255,255,0.55); border-radius: 8px; width: fit-content; margin-top: 8px;">#C9DCED</div>
          </div>
        </div>

        <div class="col-3">
          <div style="background-color: #FBE49D; color: #664E11; padding: 20px 16px; border-radius: 18px; box-shadow: 4px 6px 16px rgba(160, 140, 120, 0.22); min-height: 120px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 14px; font-weight: 900;">Пудровый желтый</div>
              <div style="font-size: 11px; opacity: 0.85; margin-top: 3px;">Календарь и фокус</div>
            </div>
            <div style="font-size: 11px; font-weight: 800; font-family: monospace; padding: 3px 8px; background: rgba(255,255,255,0.55); border-radius: 8px; width: fit-content; margin-top: 8px;">#FBE49D</div>
          </div>
        </div>
      </div>
    </div>

    `;

if (html.includes(target)) {
  html = html.replace(target, powderSection + target);
  fs.writeFileSync('макеты.html', html, 'utf8');
  console.log('Successfully inserted powder block (CRLF)!');
} else if (html.includes(targetLF)) {
  html = html.replace(targetLF, powderSection + targetLF);
  fs.writeFileSync('макеты.html', html, 'utf8');
  console.log('Successfully inserted powder block (LF)!');
} else {
  console.log('Target not found!');
}
