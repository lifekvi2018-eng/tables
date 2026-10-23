const fs = require('fs');

let html = fs.readFileSync('макеты.html', 'utf8');

const target = '<!-- =============================================================== -->\n    <!-- СРАВНЕНИЕ 4 ОТТЕНКОВ «РАСХОДЫ» В ПОЛНОМ СОСТАВЕ ПАЛИТРЫ       -->';
const targetCRLF = '<!-- =============================================================== -->\r\n    <!-- СРАВНЕНИЕ 4 ОТТЕНКОВ «РАСХОДЫ» В ПОЛНОМ СОСТАВЕ ПАЛИТРЫ       -->';

let idx = html.indexOf(target);
if (idx === -1) idx = html.indexOf(targetCRLF);

const realPinkSection = `<!-- =============================================================== -->
    <!-- ТОЧНЫЙ ПУДРОВЫЙ РОЗОВЫЙ С КРУЖОЧКА РЕФЕРЕНСА 1 (#FBC5BB)        -->
    <!-- =============================================================== -->
    <div class="ui-card" style="margin-bottom: 24px; border: 2px solid #D98282; background: #FFFDFB;">
      <div class="ui-card-header">
        <div>
          <span style="font-size: 10px; font-weight: 900; padding: 3px 8px; border-radius: 6px; background: #C85A65; color: #fff; display: inline-block; margin-bottom: 6px;">★ СНЯТО ПРЯМО С РОЗОВОГО КРУЖОЧКА 1-ГО РЕФЕРЕНСА</span>
          <div class="ui-card-title">Истинный пудровый розовый лепесток (#FBC5BB)</div>
        </div>
        <span class="ui-badge ui-badge-default">Без терракоты и без персика</span>
      </div>

      <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px;">
        Сняли пипеткой точный цвет <strong>розового кружочка («ИИ сервисы» / даты календаря)</strong> со Скриншота 1. Это нежный матовый розовый, в полном ряду со всеми 7 цветами:
      </p>

      <!-- ПАЛИТРА С ТОЧНЫМ РОЗОВЫМ -->
      <div style="background: #FFFFFF; border-radius: 18px; padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 14px rgba(160, 140, 120, 0.12); border: 1px solid rgba(220, 205, 185, 0.6);">
        <div style="font-size: 14px; font-weight: 900; color: #2F261D; margin-bottom: 10px;">
          Палитра с истинным пудровым розовым (#FBC5BB):
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 8px; margin-bottom: 12px;">
          <div style="background-color: #FAF2E7; color: #4A3E31; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #E2D3BE;">
            <div><div style="font-size: 12px; font-weight: 900;">Стол</div><div style="font-size: 10px; opacity: 0.8;">Песок</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#FAF2E7</div>
          </div>
          <div style="background-color: #C8E2D2; color: #234735; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between;">
            <div><div style="font-size: 12px; font-weight: 900;">Доходы</div><div style="font-size: 10px; opacity: 0.8;">Зеленый 1</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#C8E2D2</div>
          </div>
          <div style="background-color: #FBC5BB; color: #6E2F26; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 3px 8px rgba(220,130,130,0.25);">
            <div><div style="font-size: 12px; font-weight: 900;">Расходы</div><div style="font-size: 10px; opacity: 0.8;">Розовый 1</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.8); border-radius: 4px; width: fit-content;">#FBC5BB</div>
          </div>
          <div style="background-color: #D3E7F8; color: #1B4567; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between;">
            <div><div style="font-size: 12px; font-weight: 900;">Клиенты</div><div style="font-size: 10px; opacity: 0.8;">Небо</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#D3E7F8</div>
          </div>
          <div style="background-color: #FDF1CC; color: #5B481D; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between;">
            <div><div style="font-size: 12px; font-weight: 900;">Календарь</div><div style="font-size: 10px; opacity: 0.8;">Сливки</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#FDF1CC</div>
          </div>
          <div style="background-color: #FCE8D5; color: #6D3E14; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between;">
            <div><div style="font-size: 12px; font-weight: 900;">Подписки</div><div style="font-size: 10px; opacity: 0.8;">Абрикос</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#FCE8D5</div>
          </div>
          <div style="background-color: #DBCCE9; color: #442B5B; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between;">
            <div><div style="font-size: 12px; font-weight: 900;">Прочее</div><div style="font-size: 10px; opacity: 0.8;">Лаванда</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#DBCCE9</div>
          </div>
        </div>

        <!-- Примерка на столе -->
        <div style="background: #FAF2E7; padding: 12px; border-radius: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;">
          <div style="background: #C8E2D2; color: #234735; padding: 14px; border-radius: 14px; box-shadow: 0 4px 10px rgba(150,130,110,0.18); min-height: 68px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: 800;">Доходы</div>
            <div style="font-size: 15px; font-weight: 900;">+125 500 ₽</div>
          </div>
          <div style="background: #FBC5BB; color: #6E2F26; padding: 14px; border-radius: 14px; box-shadow: 0 4px 10px rgba(150,130,110,0.18); min-height: 68px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: 800;">Расходы (Розовый с референса)</div>
            <div style="font-size: 15px; font-weight: 900;">28 400 ₽</div>
          </div>
          <div style="background: #D3E7F8; color: #1B4567; padding: 14px; border-radius: 14px; box-shadow: 0 4px 10px rgba(150,130,110,0.18); min-height: 68px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: 800;">Клиенты</div>
            <div style="font-size: 15px; font-weight: 900;">12 активных</div>
          </div>
        </div>
      </div>
    </div>\n\n    `;

if (idx !== -1) {
  html = html.substring(0, idx) + realPinkSection + html.substring(idx);
  fs.writeFileSync('макеты.html', html, 'utf8');
  console.log('Successfully inserted real pink section into макеты.html!');
} else {
  console.log('Target not found in макеты.html!');
}
