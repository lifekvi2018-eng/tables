const fs = require('fs');
let html = fs.readFileSync('макеты.html', 'utf8');

const oldBlockStart = '<!-- ПУДРОВЫЕ ЦВЕТА И БЕЖЕВАЯ БУМАГА СО СКРИНШОТА 1';
const oldBlockEnd = '<!-- =============================================================== -->\r\n    <!-- РАЗДЕЛ 2. ПАЛИТРА ГРАДИЕНТОВ';
const oldBlockEndLF = '<!-- =============================================================== -->\n    <!-- РАЗДЕЛ 2. ПАЛИТРА ГРАДИЕНТОВ';

const newPowderSection = `<!-- ПУДРОВЫЕ ЦВЕТА И БЕЖЕВАЯ БУМАГА СО СКРИНШОТА 1 (ЧИСТЫЙ МАТ) -->
    <!-- =============================================================== -->
    <div class="ui-card" style="margin-bottom: 24px;">
      <div class="ui-card-header">
        <div class="ui-card-title">
          <span class="badge-num-3d">★</span>
          Приглушенные бумажные цвета и бежевые фоны со Скриншота 1
        </div>
        <span class="ui-badge ui-badge-default">Чистый мат, без конфетной яркости</span>
      </div>

      <!-- А. Бежевые оттенки бумаги -->
      <div style="font-size: 13px; font-weight: 800; color: var(--foreground); margin-bottom: 8px;">
        1. Варианты бежевой бумаги (для стола и базовых карточек):
      </div>
      <div class="bento-grid" style="margin-bottom: 20px;">
        <div class="col-3">
          <div style="background-color: #FAF2E7; color: #4A3E31; padding: 16px; border-radius: 16px; box-shadow: 4px 6px 14px rgba(160, 140, 120, 0.2); border: 1px solid #E8DAC8; min-height: 90px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 13px; font-weight: 900;">Сливочный песок</div>
              <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">Фон стола</div>
            </div>
            <div style="font-size: 11px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.6); border-radius: 6px; width: fit-content; margin-top: 6px;">#FAF2E7</div>
          </div>
        </div>
        <div class="col-3">
          <div style="background-color: #F9F0E1; color: #4A3E31; padding: 16px; border-radius: 16px; box-shadow: 4px 6px 14px rgba(160, 140, 120, 0.2); border: 1px solid #E8DAC8; min-height: 90px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 13px; font-weight: 900;">Топлёный крем</div>
              <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">Корпус окна</div>
            </div>
            <div style="font-size: 11px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.6); border-radius: 6px; width: fit-content; margin-top: 6px;">#F9F0E1</div>
          </div>
        </div>
        <div class="col-3">
          <div style="background-color: #FCEFDE; color: #4A3E31; padding: 16px; border-radius: 16px; box-shadow: 4px 6px 14px rgba(160, 140, 120, 0.2); border: 1px solid #E8DAC8; min-height: 90px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 13px; font-weight: 900;">Ванильный пергамент</div>
              <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">Лист карточки</div>
            </div>
            <div style="font-size: 11px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.6); border-radius: 6px; width: fit-content; margin-top: 6px;">#FCEFDE</div>
          </div>
        </div>
        <div class="col-3">
          <div style="background-color: #F6EADE; color: #4A3E31; padding: 16px; border-radius: 16px; box-shadow: 4px 6px 14px rgba(160, 140, 120, 0.2); border: 1px solid #E8DAC8; min-height: 90px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 13px; font-weight: 900;">Молочный лён</div>
              <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">Боковое меню</div>
            </div>
            <div style="font-size: 11px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.6); border-radius: 6px; width: fit-content; margin-top: 6px;">#F6EADE</div>
          </div>
        </div>
      </div>

      <!-- Б. 6 Пудровых бумажных цветов -->
      <div style="font-size: 13px; font-weight: 800; color: var(--foreground); margin-bottom: 8px;">
        2. Шесть приглушенных бумажных цветов (сняты с больших карточек референса):
      </div>
      <div class="bento-grid">
        <div class="col-4">
          <div style="background-color: #D7DBCD; color: #2D4233; padding: 16px; border-radius: 16px; box-shadow: 4px 6px 14px rgba(160, 140, 120, 0.2); min-height: 100px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 13px; font-weight: 900;">Бумажный шалфей</div>
              <div style="font-size: 11px; opacity: 0.85; margin-top: 2px;">Карточка «Доходы»</div>
            </div>
            <div style="font-size: 11px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.6); border-radius: 6px; width: fit-content; margin-top: 6px;">#D7DBCD</div>
          </div>
        </div>
        <div class="col-4">
          <div style="background-color: #F1D4C6; color: #64382B; padding: 16px; border-radius: 16px; box-shadow: 4px 6px 14px rgba(160, 140, 120, 0.2); min-height: 100px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 13px; font-weight: 900;">Пудровая терракота-роза</div>
              <div style="font-size: 11px; opacity: 0.85; margin-top: 2px;">Карточка «Расходы»</div>
            </div>
            <div style="font-size: 11px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.6); border-radius: 6px; width: fit-content; margin-top: 6px;">#F1D4C6</div>
          </div>
        </div>
        <div class="col-4">
          <div style="background-color: #CADBE5; color: #264357; padding: 16px; border-radius: 16px; box-shadow: 4px 6px 14px rgba(160, 140, 120, 0.2); min-height: 100px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 13px; font-weight: 900;">Джинсовая дымка</div>
              <div style="font-size: 11px; opacity: 0.85; margin-top: 2px;">Карточка «Клиенты»</div>
            </div>
            <div style="font-size: 11px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.6); border-radius: 6px; width: fit-content; margin-top: 6px;">#CADBE5</div>
          </div>
        </div>
        <div class="col-4">
          <div style="background-color: #FCE7B2; color: #5C481A; padding: 16px; border-radius: 16px; box-shadow: 4px 6px 14px rgba(160, 140, 120, 0.2); min-height: 100px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 13px; font-weight: 900;">Ванильный крем (нежный желтый)</div>
              <div style="font-size: 11px; opacity: 0.85; margin-top: 2px;">Кружок 12 марта в календаре</div>
            </div>
            <div style="font-size: 11px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.6); border-radius: 6px; width: fit-content; margin-top: 6px;">#FCE7B2</div>
          </div>
        </div>
        <div class="col-4">
          <div style="background-color: #F2D2A4; color: #613C16; padding: 16px; border-radius: 16px; box-shadow: 4px 6px 14px rgba(160, 140, 120, 0.2); min-height: 100px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 13px; font-weight: 900;">Песочный абрикос</div>
              <div style="font-size: 11px; opacity: 0.85; margin-top: 2px;">Категория «Подписки»</div>
            </div>
            <div style="font-size: 11px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.6); border-radius: 6px; width: fit-content; margin-top: 6px;">#F2D2A4</div>
          </div>
        </div>
        <div class="col-4">
          <div style="background-color: #C8B6CD; color: #432F4A; padding: 16px; border-radius: 16px; box-shadow: 4px 6px 14px rgba(160, 140, 120, 0.2); min-height: 100px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 13px; font-weight: 900;">Пыльная лаванда</div>
              <div style="font-size: 11px; opacity: 0.85; margin-top: 2px;">Категория «Прочее»</div>
            </div>
            <div style="font-size: 11px; font-weight: 800; font-family: monospace; padding: 2px 6px; background: rgba(255,255,255,0.6); border-radius: 6px; width: fit-content; margin-top: 6px;">#C8B6CD</div>
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
    html = html.substring(0, startIdx) + newPowderSection + html.substring(endIdx);
    fs.writeFileSync('макеты.html', html, 'utf8');
    console.log('Successfully updated powder section in макеты.html!');
  }
}
