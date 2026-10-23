const fs = require('fs');
let html = fs.readFileSync('макеты.html', 'utf8');

const target = '<!-- УТВЕРЖДЁННАЯ ИТОГОВАЯ ПАЛИТРА ПРОЕКТА';

const newFullSection = `<!-- =============================================================== -->
    <!-- СРАВНЕНИЕ 4 ОТТЕНКОВ «РАСХОДЫ» В ПОЛНОМ СОСТАВЕ ПАЛИТРЫ       -->
    <!-- =============================================================== -->
    <div class="ui-card" style="margin-bottom: 24px; border: 2px solid #E6D8C6;">
      <div class="ui-card-header">
        <div class="ui-card-title">Сравнение 4 оттенков «Расходы» в полном составе всех 7 цветов</div>
        <span class="ui-badge ui-badge-default">Все цвета сняты со Скриншота 1</span>
      </div>

      <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px;">
        В каждом ряду показаны ВСЕ твои выбранные цвета вместе (без рамочек), а ниже — примерка карточек Доходы, Расходы и Клиенты на сливочном столе:
      </p>

      <!-- ВАРИАНТ А -->
      <div style="background: var(--card-inner); padding: 14px; border-radius: 16px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 900; margin-bottom: 8px;">
          <span>Вариант А: Центр карточки «Расходы» со Скриншота 1 (#F3D2C9)</span>
          <span style="font-size: 10px; color: var(--muted);">Снято с мобильной карточки</span>
        </div>
        <div class="bento-grid" style="margin-bottom: 10px;">
          <div class="col-2"><div style="background: #FAF2E7; color: #4A3E31; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900; border: 1px solid #E5D5C1;">Стол<br><span style="font-size: 9px; font-family: monospace;">#FAF2E7</span></div></div>
          <div class="col-2"><div style="background: #C8E2D2; color: #244736; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Доходы<br><span style="font-size: 9px; font-family: monospace;">#C8E2D2</span></div></div>
          <div class="col-2"><div style="background: #F3D2C9; color: #6E3224; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Расходы А<br><span style="font-size: 9px; font-family: monospace;">#F3D2C9</span></div></div>
          <div class="col-2"><div style="background: #D3E7F8; color: #1E4668; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Клиенты<br><span style="font-size: 9px; font-family: monospace;">#D3E7F8</span></div></div>
          <div class="col-2"><div style="background: #FDF1CC; color: #5B481D; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Календарь<br><span style="font-size: 9px; font-family: monospace;">#FDF1CC</span></div></div>
          <div class="col-2"><div style="background: #FCE8D5; color: #6E3F14; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Подписки<br><span style="font-size: 9px; font-family: monospace;">#FCE8D5</span></div></div>
        </div>
        <div style="background: #FAF2E7; padding: 10px; border-radius: 12px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
          <div style="background: #C8E2D2; color: #244736; padding: 10px; border-radius: 10px; font-size: 11px; font-weight: 900;">Доходы<br><span style="font-size: 13px;">+125 500 ₽</span></div>
          <div style="background: #F3D2C9; color: #6E3224; padding: 10px; border-radius: 10px; font-size: 11px; font-weight: 900;">Расходы А<br><span style="font-size: 13px;">28 400 ₽</span></div>
          <div style="background: #D3E7F8; color: #1E4668; padding: 10px; border-radius: 10px; font-size: 11px; font-weight: 900;">Клиенты<br><span style="font-size: 13px;">12 активных</span></div>
        </div>
      </div>

      <!-- ВАРИАНТ Б -->
      <div style="background: var(--card-inner); padding: 14px; border-radius: 16px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 900; margin-bottom: 8px;">
          <span>Вариант Б: Десктопная плашка «Расходы» со Скриншота 1 (#F4D3C7)</span>
          <span style="font-size: 10px; color: var(--muted);">Мягкий и тёплый</span>
        </div>
        <div class="bento-grid" style="margin-bottom: 10px;">
          <div class="col-2"><div style="background: #FAF2E7; color: #4A3E31; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900; border: 1px solid #E5D5C1;">Стол<br><span style="font-size: 9px; font-family: monospace;">#FAF2E7</span></div></div>
          <div class="col-2"><div style="background: #C8E2D2; color: #244736; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Доходы<br><span style="font-size: 9px; font-family: monospace;">#C8E2D2</span></div></div>
          <div class="col-2"><div style="background: #F4D3C7; color: #6E3224; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Расходы Б<br><span style="font-size: 9px; font-family: monospace;">#F4D3C7</span></div></div>
          <div class="col-2"><div style="background: #D3E7F8; color: #1E4668; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Клиенты<br><span style="font-size: 9px; font-family: monospace;">#D3E7F8</span></div></div>
          <div class="col-2"><div style="background: #FDF1CC; color: #5B481D; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Календарь<br><span style="font-size: 9px; font-family: monospace;">#FDF1CC</span></div></div>
          <div class="col-2"><div style="background: #FCE8D5; color: #6E3F14; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Подписки<br><span style="font-size: 9px; font-family: monospace;">#FCE8D5</span></div></div>
        </div>
        <div style="background: #FAF2E7; padding: 10px; border-radius: 12px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
          <div style="background: #C8E2D2; color: #244736; padding: 10px; border-radius: 10px; font-size: 11px; font-weight: 900;">Доходы<br><span style="font-size: 13px;">+125 500 ₽</span></div>
          <div style="background: #F4D3C7; color: #6E3224; padding: 10px; border-radius: 10px; font-size: 11px; font-weight: 900;">Расходы Б<br><span style="font-size: 13px;">28 400 ₽</span></div>
          <div style="background: #D3E7F8; color: #1E4668; padding: 10px; border-radius: 10px; font-size: 11px; font-weight: 900;">Клиенты<br><span style="font-size: 13px;">12 активных</span></div>
        </div>
      </div>

      <!-- ВАРИАНТ В -->
      <div style="background: var(--card-inner); padding: 14px; border-radius: 16px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 900; margin-bottom: 8px;">
          <span>Вариант В: Светлая пудровая часть карточки «Расходы» (#F6D7CF)</span>
          <span style="font-size: 10px; color: var(--muted);">Светлый и нежный</span>
        </div>
        <div class="bento-grid" style="margin-bottom: 10px;">
          <div class="col-2"><div style="background: #FAF2E7; color: #4A3E31; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900; border: 1px solid #E5D5C1;">Стол<br><span style="font-size: 9px; font-family: monospace;">#FAF2E7</span></div></div>
          <div class="col-2"><div style="background: #C8E2D2; color: #244736; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Доходы<br><span style="font-size: 9px; font-family: monospace;">#C8E2D2</span></div></div>
          <div class="col-2"><div style="background: #F6D7CF; color: #6E3224; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Расходы В<br><span style="font-size: 9px; font-family: monospace;">#F6D7CF</span></div></div>
          <div class="col-2"><div style="background: #D3E7F8; color: #1E4668; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Клиенты<br><span style="font-size: 9px; font-family: monospace;">#D3E7F8</span></div></div>
          <div class="col-2"><div style="background: #FDF1CC; color: #5B481D; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Календарь<br><span style="font-size: 9px; font-family: monospace;">#FDF1CC</span></div></div>
          <div class="col-2"><div style="background: #FCE8D5; color: #6E3F14; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Подписки<br><span style="font-size: 9px; font-family: monospace;">#FCE8D5</span></div></div>
        </div>
        <div style="background: #FAF2E7; padding: 10px; border-radius: 12px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
          <div style="background: #C8E2D2; color: #244736; padding: 10px; border-radius: 10px; font-size: 11px; font-weight: 900;">Доходы<br><span style="font-size: 13px;">+125 500 ₽</span></div>
          <div style="background: #F6D7CF; color: #6E3224; padding: 10px; border-radius: 10px; font-size: 11px; font-weight: 900;">Расходы В<br><span style="font-size: 13px;">28 400 ₽</span></div>
          <div style="background: #D3E7F8; color: #1E4668; padding: 10px; border-radius: 10px; font-size: 11px; font-weight: 900;">Клиенты<br><span style="font-size: 13px;">12 активных</span></div>
        </div>
      </div>

      <!-- ВАРИАНТ Г -->
      <div style="background: var(--card-inner); padding: 14px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 900; margin-bottom: 8px;">
          <span>Вариант Г: Воздушная разбелённая пудра-персик (#F8DDD6)</span>
          <span style="font-size: 10px; color: var(--muted);">Максимально светлый</span>
        </div>
        <div class="bento-grid" style="margin-bottom: 10px;">
          <div class="col-2"><div style="background: #FAF2E7; color: #4A3E31; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900; border: 1px solid #E5D5C1;">Стол<br><span style="font-size: 9px; font-family: monospace;">#FAF2E7</span></div></div>
          <div class="col-2"><div style="background: #C8E2D2; color: #244736; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Доходы<br><span style="font-size: 9px; font-family: monospace;">#C8E2D2</span></div></div>
          <div class="col-2"><div style="background: #F8DDD6; color: #6E3224; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Расходы Г<br><span style="font-size: 9px; font-family: monospace;">#F8DDD6</span></div></div>
          <div class="col-2"><div style="background: #D3E7F8; color: #1E4668; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Клиенты<br><span style="font-size: 9px; font-family: monospace;">#D3E7F8</span></div></div>
          <div class="col-2"><div style="background: #FDF1CC; color: #5B481D; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Календарь<br><span style="font-size: 9px; font-family: monospace;">#FDF1CC</span></div></div>
          <div class="col-2"><div style="background: #FCE8D5; color: #6E3F14; padding: 8px; border-radius: 10px; font-size: 10px; font-weight: 900;">Подписки<br><span style="font-size: 9px; font-family: monospace;">#FCE8D5</span></div></div>
        </div>
        <div style="background: #FAF2E7; padding: 10px; border-radius: 12px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
          <div style="background: #C8E2D2; color: #244736; padding: 10px; border-radius: 10px; font-size: 11px; font-weight: 900;">Доходы<br><span style="font-size: 13px;">+125 500 ₽</span></div>
          <div style="background: #F8DDD6; color: #6E3224; padding: 10px; border-radius: 10px; font-size: 11px; font-weight: 900;">Расходы Г<br><span style="font-size: 13px;">28 400 ₽</span></div>
          <div style="background: #D3E7F8; color: #1E4668; padding: 10px; border-radius: 10px; font-size: 11px; font-weight: 900;">Клиенты<br><span style="font-size: 13px;">12 активных</span></div>
        </div>
      </div>
    </div>\n\n    `;

const idx = html.indexOf(target);
if (idx !== -1) {
  html = html.substring(0, idx) + newFullSection + html.substring(idx);
  fs.writeFileSync('макеты.html', html, 'utf8');
  console.log('Successfully inserted full 4-option row comparison into макеты.html!');
} else {
  console.log('Target not found in макеты.html!');
}
