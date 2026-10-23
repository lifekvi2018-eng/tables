const fs = require('fs');
let html = fs.readFileSync('макеты.html', 'utf8');

const targetStr = '<!-- 4. ВАРИАНТ 3 (ЕЩЁ БОЛЕЕ СУХИЕ КРАФТОВЫЕ ПОЛУТОНА) -->';

const newSections = `<!-- ТВОИ УТВЕРЖДЁННЫЕ ЦВЕТА -->
      <div style="background: rgba(200, 226, 210, 0.25); border: 2px solid #C8E2D2; border-radius: 16px; padding: 14px; margin-bottom: 24px;">
        <div style="font-size: 13px; font-weight: 900; color: #2D5847; margin-bottom: 4px;">
          ✓ Твой выбор (уже зафиксировано):
        </div>
        <div style="font-size: 11px; color: #556B5D; margin-bottom: 10px;">
          Эти цвета тебе понравились, мы берём их за твёрдую основу:
        </div>
        <div class="bento-grid">
          <div class="col-4">
            <div style="background-color: #C8E2D2; color: #244736; padding: 14px; border-radius: 14px; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
              <span style="font-size: 8px; font-weight: 900; padding: 2px 5px; border-radius: 4px; background: #2D5847; color: #fff;">ТВОЙ ВЫБОР</span>
              <div style="font-size: 12px; font-weight: 900; margin-top: 4px;">Зеленый (из Вар. 1)</div>
              <div style="font-size: 10px; opacity: 0.8;">Раздел «Доходы»</div>
              <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 6px;">#C8E2D2</div>
            </div>
          </div>
          <div class="col-4">
            <div style="background-color: #FDF1CC; color: #5B481D; padding: 14px; border-radius: 14px; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
              <span style="font-size: 8px; font-weight: 900; padding: 2px 5px; border-radius: 4px; background: #7A5E1A; color: #fff;">ТВОЙ ВЫБОР</span>
              <div style="font-size: 12px; font-weight: 900; margin-top: 4px;">Желтый (из Вар. 3)</div>
              <div style="font-size: 10px; opacity: 0.8;">Календарь и фокус</div>
              <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 6px;">#FDF1CC</div>
            </div>
          </div>
          <div class="col-4">
            <div style="background-color: #C8B6CD; color: #432F4A; padding: 14px; border-radius: 14px; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
              <span style="font-size: 8px; font-weight: 900; padding: 2px 5px; border-radius: 4px; background: #50377A; color: #fff;">ПРЕДВАРИТЕЛЬНО</span>
              <div style="font-size: 12px; font-weight: 900; margin-top: 4px;">Фиолетовый (из Вар. 2)</div>
              <div style="font-size: 10px; opacity: 0.8;">Пыльная лаванда</div>
              <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 6px;">#C8B6CD</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. НОВАЯ ПОДБОРКА: ЧИСТЫЙ НЕЖНЫЙ РОЗОВЫЙ (БЕЗ ТЕРРАКОТЫ) -->
      <div style="font-size: 13px; font-weight: 900; color: #8A3E4D; margin-bottom: 4px;">
        5. Новые варианты: Чистый нежный розовый (без терракоты и грязи):
      </div>
      <div style="font-size: 11px; color: var(--muted); margin-bottom: 8px;">
        Воздушные, чистые оттенки зефира и лепестков роз — выбери подходящий:
      </div>
      <div class="bento-grid" style="margin-bottom: 24px;">
        <div class="col-2">
          <div style="background-color: #F8D5DE; color: #6E2D3B; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Р1. Зефир</div><div style="font-size: 9px; opacity: 0.8;">Чистый румянец</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 4px;">#F8D5DE</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #FADCE2; color: #6E2D3B; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Р2. Лепесток розы</div><div style="font-size: 9px; opacity: 0.8;">Очень нежный</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 4px;">#FADCE2</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #FBE4E9; color: #6E2D3B; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Р3. Фарфор</div><div style="font-size: 9px; opacity: 0.8;">Светлый зефир</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 4px;">#FBE4E9</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #F8D1DA; color: #6E2D3B; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Р4. Пудра</div><div style="font-size: 9px; opacity: 0.8;">Классическая роза</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 4px;">#F8D1DA</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #FDE2E0; color: #6E2D3B; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Р5. Персик-роза</div><div style="font-size: 9px; opacity: 0.8;">Без терракоты</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 4px;">#FDE2E0</div>
          </div>
        </div>
      </div>

      <!-- 6. НОВАЯ ПОДБОРКА: ЧИСТЫЙ НЕЖНЫЙ ГОЛУБОЙ (БЕЗ СЕРОСТИ) -->
      <div style="font-size: 13px; font-weight: 900; color: #235178; margin-bottom: 4px;">
        6. Новые варианты: Чистый нежный голубой (без серости и неона):
      </div>
      <div style="font-size: 11px; color: var(--muted); margin-bottom: 8px;">
        Светлые, чистые оттенки утреннего неба и акварели:
      </div>
      <div class="bento-grid" style="margin-bottom: 24px;">
        <div class="col-2">
          <div style="background-color: #D3E7F8; color: #1E4668; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Г1. Утреннее небо</div><div style="font-size: 9px; opacity: 0.8;">Чистый нежный</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 4px;">#D3E7F8</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #DBEAF7; color: #1E4668; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Г2. Небесный бриз</div><div style="font-size: 9px; opacity: 0.8;">Светлый пастельный</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 4px;">#DBEAF7</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #CCE3F5; color: #1E4668; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Г3. Лазурь</div><div style="font-size: 9px; opacity: 0.8;">Мягкий спокойный</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 4px;">#CCE3F5</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #D5EBF5; color: #1E4668; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Г4. Роса</div><div style="font-size: 9px; opacity: 0.8;">Свежая акварель</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 4px;">#D5EBF5</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #E2EFF9; color: #1E4668; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Г5. Хлопок</div><div style="font-size: 9px; opacity: 0.8;">Очень нежный</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.7); border-radius: 5px; width: fit-content; margin-top: 4px;">#E2EFF9</div>
          </div>
        </div>
      </div>
      
      `;

const idx = html.indexOf(targetStr);
if (idx !== -1) {
  html = html.substring(0, idx) + newSections + html.substring(idx);
  fs.writeFileSync('макеты.html', html, 'utf8');
  console.log('Successfully inserted new sections into макеты.html!');
} else {
  console.log('Target string not found in макеты.html!');
}
