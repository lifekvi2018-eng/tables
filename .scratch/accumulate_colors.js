const fs = require('fs');
let html = fs.readFileSync('макеты.html', 'utf8');

const oldBlockStart = '<!-- ПУДРОВЫЕ ЦВЕТА И БЕЖЕВАЯ БУМАГА СО СКРИНШОТА 1';
const oldBlockEnd = '<!-- =============================================================== -->\r\n    <!-- РАЗДЕЛ 2. ПАЛИТРА ГРАДИЕНТОВ';
const oldBlockEndLF = '<!-- =============================================================== -->\n    <!-- РАЗДЕЛ 2. ПАЛИТРА ГРАДИЕНТОВ';

const accumulatedSection = `<!-- КАТАЛОГ НАКОПЛЕНИЯ: ВСЕ ВАРИАНТЫ ЦВЕТОВ ДЛЯ СРАВНЕНИЯ -->
    <!-- =============================================================== -->
    <div class="ui-card" style="margin-bottom: 24px;">
      <div class="ui-card-header">
        <div class="ui-card-title">
          <span class="badge-num-3d">★</span>
          Каталог накопления: сравнение всех вариантов цветов
        </div>
        <span class="ui-badge ui-badge-default">Принцип накопления: всё сохранено</span>
      </div>

      <p style="font-size: 13px; color: var(--muted); margin-bottom: 20px;">
        Все предложенные варианты сохранены друг за другом, чтобы можно было наглядно сравнить и выбрать любые оттенки:
      </p>

      <!-- 1. БЕЖЕВЫЕ ОСНОВЫ БУМАГИ -->
      <div style="font-size: 13px; font-weight: 900; color: var(--foreground); margin-bottom: 8px;">
        1. Бежевые оттенки бумаги (фон стола и карточек):
      </div>
      <div class="bento-grid" style="margin-bottom: 24px;">
        <div class="col-3">
          <div style="background-color: #FAF2E7; color: #4A3E31; padding: 14px; border-radius: 16px; box-shadow: 2px 4px 10px rgba(160, 140, 120, 0.18); border: 1px solid #E5D5C1; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 12px; font-weight: 900;">А. Сливочный песок</div>
              <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">Фон стола</div>
            </div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.65); border-radius: 6px; width: fit-content; margin-top: 4px;">#FAF2E7</div>
          </div>
        </div>
        <div class="col-3">
          <div style="background-color: #F9F0E1; color: #4A3E31; padding: 14px; border-radius: 16px; box-shadow: 2px 4px 10px rgba(160, 140, 120, 0.18); border: 1px solid #E5D5C1; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 12px; font-weight: 900;">Б. Топлёный крем</div>
              <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">Фон окна</div>
            </div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.65); border-radius: 6px; width: fit-content; margin-top: 4px;">#F9F0E1</div>
          </div>
        </div>
        <div class="col-3">
          <div style="background-color: #FCEFDE; color: #4A3E31; padding: 14px; border-radius: 16px; box-shadow: 2px 4px 10px rgba(160, 140, 120, 0.18); border: 1px solid #E5D5C1; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 12px; font-weight: 900;">В. Ванильный пергамент</div>
              <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">Лист карточки</div>
            </div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.65); border-radius: 6px; width: fit-content; margin-top: 4px;">#FCEFDE</div>
          </div>
        </div>
        <div class="col-3">
          <div style="background-color: #F6EADE; color: #4A3E31; padding: 14px; border-radius: 16px; box-shadow: 2px 4px 10px rgba(160, 140, 120, 0.18); border: 1px solid #E5D5C1; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 12px; font-weight: 900;">Г. Молочный лён</div>
              <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">Боковое меню</div>
            </div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.65); border-radius: 6px; width: fit-content; margin-top: 4px;">#F6EADE</div>
          </div>
        </div>
      </div>

      <!-- 2. ВАРИАНТ 1 (ПЕРВАЯ ИТЕРАЦИЯ — БОЛЕЕ ЗВОНКИЕ) -->
      <div style="font-size: 13px; font-weight: 900; color: var(--foreground); margin-bottom: 4px;">
        2. Вариант 1 (Первая итерация — снято с мелких значков-иконок):
      </div>
      <div style="font-size: 11px; color: var(--muted); margin-bottom: 8px;">
        Более чистые и звонкие оттенки:
      </div>
      <div class="bento-grid" style="margin-bottom: 24px;">
        <div class="col-2">
          <div style="background-color: #C8E2D2; color: #244736; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Зеленый 1</div><div style="font-size: 9px; opacity: 0.8;">Доходы</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#C8E2D2</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #FAC3BC; color: #6E2D23; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Розовый 1</div><div style="font-size: 9px; opacity: 0.8;">Расходы</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#FAC3BC</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #ABDBF2; color: #1C4863; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Голубой 1</div><div style="font-size: 9px; opacity: 0.8;">Клиенты</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#ABDBF2</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #FBE49D; color: #664E11; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Желтый 1</div><div style="font-size: 9px; opacity: 0.8;">Календарь</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#FBE49D</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #FCD1AE; color: #693A17; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Оранжевый 1</div><div style="font-size: 9px; opacity: 0.8;">Подписки</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#FCD1AE</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #DBCCE9; color: #442B5B; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Фиолетовый 1</div><div style="font-size: 9px; opacity: 0.8;">Прочее</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#DBCCE9</div>
          </div>
        </div>
      </div>

      <!-- 3. ВАРИАНТ 2 (ВТОРАЯ ИТЕРАЦИЯ — ПРИГЛУШЕННАЯ МАТОВАЯ БУМАГА С КАРТОЧЕК) -->
      <div style="font-size: 13px; font-weight: 900; color: var(--foreground); margin-bottom: 4px;">
        3. Вариант 2 (Вторая итерация — снято с больших бумажных карточек референса):
      </div>
      <div style="font-size: 11px; color: var(--muted); margin-bottom: 8px;">
        Приглушенные, матовые, пыльные бумажные цвета с серым подтоном (без конфетности):
      </div>
      <div class="bento-grid" style="margin-bottom: 24px;">
        <div class="col-2">
          <div style="background-color: #D7DBCD; color: #2D4233; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Шалфей 2</div><div style="font-size: 9px; opacity: 0.8;">Доходы</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#D7DBCD</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #F1D4C6; color: #64382B; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Терракота 2</div><div style="font-size: 9px; opacity: 0.8;">Расходы</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#F1D4C6</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #CADBE5; color: #264357; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Дымка 2</div><div style="font-size: 9px; opacity: 0.8;">Клиенты</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#CADBE5</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #FCE7B2; color: #5C481A; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Ваниль 2 (нежный)</div><div style="font-size: 9px; opacity: 0.8;">Календарь</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#FCE7B2</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #F2D2A4; color: #613C16; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Абрикос 2</div><div style="font-size: 9px; opacity: 0.8;">Подписки</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#F2D2A4</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #C8B6CD; color: #432F4A; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Лаванда 2</div><div style="font-size: 9px; opacity: 0.8;">Прочее</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#C8B6CD</div>
          </div>
        </div>
      </div>

      <!-- 4. ВАРИАНТ 3 (ЕЩЁ БОЛЕЕ СУХИЕ КРАФТОВЫЕ ПОЛУТОНА) -->
      <div style="font-size: 13px; font-weight: 900; color: var(--foreground); margin-bottom: 4px;">
        4. Вариант 3 (Дополнительные полутона — сухой крафт/пастель):
      </div>
      <div style="font-size: 11px; color: var(--muted); margin-bottom: 8px;">
        Максимально приглушенные полутона для тонкого сравнения:
      </div>
      <div class="bento-grid">
        <div class="col-2">
          <div style="background-color: #DFE3D6; color: #324738; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Эвкалипт 3</div><div style="font-size: 9px; opacity: 0.8;">Светлый шалфей</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#DFE3D6</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #EFD6CF; color: #693C32; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Пепел розы 3</div><div style="font-size: 9px; opacity: 0.8;">Сухая роза</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#EFD6CF</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #CFDDE6; color: #2B4557; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Серая дымка 3</div><div style="font-size: 9px; opacity: 0.8;">Мягкий деним</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#CFDDE6</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #FDF1CC; color: #5B481D; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Сливки 3</div><div style="font-size: 9px; opacity: 0.8;">Топлёное масло</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#FDF1CC</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #F4D7B8; color: #66411F; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Крафт-персик 3</div><div style="font-size: 9px; opacity: 0.8;">Песочный тон</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#F4D7B8</div>
          </div>
        </div>
        <div class="col-2">
          <div style="background-color: #D3C4D7; color: #48354D; padding: 12px; border-radius: 14px; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 3px 8px rgba(0,0,0,0.08);">
            <div><div style="font-size: 11px; font-weight: 900;">Сухой вереск 3</div><div style="font-size: 9px; opacity: 0.8;">Пепельная лаванда</div></div>
            <div style="font-size: 9px; font-weight: 800; font-family: monospace; padding: 2px 5px; background: rgba(255,255,255,0.65); border-radius: 5px; width: fit-content; margin-top: 4px;">#D3C4D7</div>
          </div>
        </div>
      </div>
    </div>\n\n    `;

const startIdx = html.indexOf(oldBlockStart);
if (startIdx !== -1) {
  let endIdx = html.indexOf(oldBlockEnd, startIdx);
  let endTarget = oldBlockEnd;
  if (endIdx === -1) {
    endIdx = html.indexOf(oldBlockEndLF, startIdx);
    endTarget = oldBlockEndLF;
  }
  if (endIdx !== -1) {
    html = html.substring(0, startIdx) + accumulatedSection + html.substring(endIdx);
    fs.writeFileSync('макеты.html', html, 'utf8');
    console.log('Successfully accumulated all color variants into макеты.html!');
  }
}
