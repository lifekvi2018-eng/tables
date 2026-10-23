const fs = require('fs');
let html = fs.readFileSync('макеты.html', 'utf8');

const target = '<!-- КАТАЛОГ НАКОПЛЕНИЯ: ВСЕ ВАРИАНТЫ ЦВЕТОВ ДЛЯ СРАВНЕНИЯ -->';

const peachPinkBlock = `<!-- =============================================================== -->
    <!-- ПОДБОР ПУДРОВОГО ПЕРСИКА-РОЗЫ (БЛИЖЕ К ПЕРСИКУ, БЕЗ ТЕРРАКОТЫ) -->
    <!-- =============================================================== -->
    <div class="ui-card" style="margin-bottom: 24px; border: 1px solid #E8DAC8;">
      <div class="ui-card-header">
        <div class="ui-card-title">Подбор пудрового персиково-розового (для «Расходов»)</div>
        <span class="ui-badge ui-badge-secondary">Тёплая нежная пудра</span>
      </div>

      <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px;">
        Сместили оттенок от холодного розового в сторону мягкого пудрового персика (но без кирпичной терракоты):
      </p>

      <div class="bento-grid">
        <div class="col-2">
          <div style="background-color: #FBE2DB; color: #6E3224; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">П1. Зефир персик-роза</div><div style="font-size: 9px; opacity: 0.8;">Воздушный</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 4px;">#FBE2DB</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #FADED7; color: #6E3224; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">П2. Коралл-нюд</div><div style="font-size: 9px; opacity: 0.8;">Бархатный</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 4px;">#FADED7</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #FCE5DC; color: #6E3224; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">П3. Французский крем</div><div style="font-size: 9px; opacity: 0.8;">Светлый, тонкий</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 4px;">#FCE5DC</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #FADAD2; color: #6E3224; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">П4. Тёплый румянец</div><div style="font-size: 9px; opacity: 0.8;">Классическая пудра</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 4px;">#FADAD2</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #FCE2D6; color: #6E3224; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">П5. Сливочный персик</div><div style="font-size: 9px; opacity: 0.8;">Ближе к персику</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 4px;">#FCE2D6</div>
          </div>
        </div>
      </div>
    </div>\n\n    `;

const idx = html.indexOf(target);
if (idx !== -1) {
  html = html.substring(0, idx) + peachPinkBlock + html.substring(idx);
  fs.writeFileSync('макеты.html', html, 'utf8');
  console.log('Successfully inserted peach-pink block into макеты.html!');
} else {
  console.log('Target not found in макеты.html!');
}
