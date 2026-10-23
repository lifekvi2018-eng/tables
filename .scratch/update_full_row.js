const fs = require('fs');

let html = fs.readFileSync('макеты.html', 'utf8');

const startMarker = '<!-- СРАВНЕНИЕ 4 ОТТЕНКОВ «РАСХОДЫ» В ПОЛНОМ СОСТАВЕ ПАЛИТРЫ       -->';
const endMarker = '<!-- УТВЕРЖДЁННАЯ ИТОГОВАЯ ПАЛИТРА ПРОЕКТА «МОИ ТАБЛИЦЫ»';

const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.log('Markers not found! start:', startIdx, 'end:', endIdx);
  process.exit(1);
}

const newSection = `<!-- СРАВНЕНИЕ 4 ОТТЕНКОВ «РАСХОДЫ» В ПОЛНОМ СОСТАВЕ ПАЛИТРЫ       -->
    <!-- =============================================================== -->
    <div class="ui-card" style="margin-bottom: 24px; border: 2px solid #5A4E40; background: #FFFDF9;">
      <div class="ui-card-header">
        <div>
          <span style="font-size: 10px; font-weight: 900; padding: 3px 8px; border-radius: 6px; background: #5A4E40; color: #fff; display: inline-block; margin-bottom: 6px;">★ СНЯТО ТОЧНО С ПЕРВОГО РЕФЕРЕНСА (ПИКСЕЛЬ В ПИКСЕЛЬ)</span>
          <div class="ui-card-title">Сравнение 4 пудровых персиково-розовых для «Расходов»</div>
        </div>
        <span class="ui-badge ui-badge-default">Все 7 цветов в каждом ряду</span>
      </div>

      <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px;">
        В каждом варианте показаны <strong>все 7 выбранных цветов вместе в одном ряду</strong> (без красных рамочек, без золота, без градиентов). А под ними — живая примерка карточек Доходы, Расходы и Клиенты на сливочно-песочном столе:
      </p>

      <!-- ==================== ВАРИАНТ А ==================== -->
      <div style="background: #FFFFFF; border-radius: 18px; padding: 16px; margin-bottom: 18px; box-shadow: 0 4px 14px rgba(160, 140, 120, 0.12); border: 1px solid rgba(220, 205, 185, 0.6);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 6px;">
          <strong style="font-size: 14px; color: #2F261D;">Вариант А: Центр карточки «Расходы» с 1-го референса (#F3D2C9)</strong>
          <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: #FAF2E7; color: #5A4E40;">Снято с мобильной карточки</span>
        </div>

        <!-- Все 7 цветов в одном ряду -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 8px; margin-bottom: 12px;">
          <div style="background-color: #FAF2E7; color: #4A3E31; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #E2D3BE; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Стол</div><div style="font-size: 10px; opacity: 0.8;">Песок</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#FAF2E7</div>
          </div>
          <div style="background-color: #C8E2D2; color: #234735; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Доходы</div><div style="font-size: 10px; opacity: 0.8;">Зеленый 1</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#C8E2D2</div>
          </div>
          <div style="background-color: #F3D2C9; color: #692F22; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Расходы</div><div style="font-size: 10px; opacity: 0.8;">Персик А</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#F3D2C9</div>
          </div>
          <div style="background-color: #D3E7F8; color: #1B4567; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Клиенты</div><div style="font-size: 10px; opacity: 0.8;">Небо</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#D3E7F8</div>
          </div>
          <div style="background-color: #FDF1CC; color: #5B481D; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Календарь</div><div style="font-size: 10px; opacity: 0.8;">Сливки</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#FDF1CC</div>
          </div>
          <div style="background-color: #FCE8D5; color: #6D3E14; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Подписки</div><div style="font-size: 10px; opacity: 0.8;">Абрикос</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#FCE8D5</div>
          </div>
          <div style="background-color: #DBCCE9; color: #442B5B; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Прочее</div><div style="font-size: 10px; opacity: 0.8;">Лаванда</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#DBCCE9</div>
          </div>
        </div>

        <!-- Примерка 3 карточек на столе -->
        <div style="background: #FAF2E7; padding: 12px; border-radius: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;">
          <div style="background: #C8E2D2; color: #234735; padding: 12px; border-radius: 14px; box-shadow: 0 4px 10px rgba(150,130,110,0.18); min-height: 68px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: 800;">Доходы</div>
            <div style="font-size: 15px; font-weight: 900;">+125 500 ₽</div>
          </div>
          <div style="background: #F3D2C9; color: #692F22; padding: 12px; border-radius: 14px; box-shadow: 0 4px 10px rgba(150,130,110,0.18); min-height: 68px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: 800;">Расходы (Вариант А)</div>
            <div style="font-size: 15px; font-weight: 900;">28 400 ₽</div>
          </div>
          <div style="background: #D3E7F8; color: #1B4567; padding: 12px; border-radius: 14px; box-shadow: 0 4px 10px rgba(150,130,110,0.18); min-height: 68px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: 800;">Клиенты</div>
            <div style="font-size: 15px; font-weight: 900;">12 активных</div>
          </div>
        </div>
      </div>

      <!-- ==================== ВАРИАНТ Б ==================== -->
      <div style="background: #FFFFFF; border-radius: 18px; padding: 16px; margin-bottom: 18px; box-shadow: 0 4px 14px rgba(160, 140, 120, 0.12); border: 1px solid rgba(220, 205, 185, 0.6);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 6px;">
          <strong style="font-size: 14px; color: #2F261D;">Вариант Б: Десктопная плашка «Расходы» с 1-го референса (#F4D3C7)</strong>
          <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: #FAF2E7; color: #5A4E40;">Мягкий и тёплый</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 8px; margin-bottom: 12px;">
          <div style="background-color: #FAF2E7; color: #4A3E31; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #E2D3BE; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Стол</div><div style="font-size: 10px; opacity: 0.8;">Песок</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#FAF2E7</div>
          </div>
          <div style="background-color: #C8E2D2; color: #234735; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Доходы</div><div style="font-size: 10px; opacity: 0.8;">Зеленый 1</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#C8E2D2</div>
          </div>
          <div style="background-color: #F4D3C7; color: #692F22; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Расходы</div><div style="font-size: 10px; opacity: 0.8;">Персик Б</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#F4D3C7</div>
          </div>
          <div style="background-color: #D3E7F8; color: #1B4567; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Клиенты</div><div style="font-size: 10px; opacity: 0.8;">Небо</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#D3E7F8</div>
          </div>
          <div style="background-color: #FDF1CC; color: #5B481D; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Календарь</div><div style="font-size: 10px; opacity: 0.8;">Сливки</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#FDF1CC</div>
          </div>
          <div style="background-color: #FCE8D5; color: #6D3E14; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Подписки</div><div style="font-size: 10px; opacity: 0.8;">Абрикос</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#FCE8D5</div>
          </div>
          <div style="background-color: #DBCCE9; color: #442B5B; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Прочее</div><div style="font-size: 10px; opacity: 0.8;">Лаванда</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#DBCCE9</div>
          </div>
        </div>

        <div style="background: #FAF2E7; padding: 12px; border-radius: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;">
          <div style="background: #C8E2D2; color: #234735; padding: 12px; border-radius: 14px; box-shadow: 0 4px 10px rgba(150,130,110,0.18); min-height: 68px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: 800;">Доходы</div>
            <div style="font-size: 15px; font-weight: 900;">+125 500 ₽</div>
          </div>
          <div style="background: #F4D3C7; color: #692F22; padding: 12px; border-radius: 14px; box-shadow: 0 4px 10px rgba(150,130,110,0.18); min-height: 68px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: 800;">Расходы (Вариант Б)</div>
            <div style="font-size: 15px; font-weight: 900;">28 400 ₽</div>
          </div>
          <div style="background: #D3E7F8; color: #1B4567; padding: 12px; border-radius: 14px; box-shadow: 0 4px 10px rgba(150,130,110,0.18); min-height: 68px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: 800;">Клиенты</div>
            <div style="font-size: 15px; font-weight: 900;">12 активных</div>
          </div>
        </div>
      </div>

      <!-- ==================== ВАРИАНТ В ==================== -->
      <div style="background: #FFFFFF; border-radius: 18px; padding: 16px; margin-bottom: 18px; box-shadow: 0 4px 14px rgba(160, 140, 120, 0.12); border: 1px solid rgba(220, 205, 185, 0.6);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 6px;">
          <strong style="font-size: 14px; color: #2F261D;">Вариант В: Светлая пудровая часть карточки «Расходы» (#F6D7CF)</strong>
          <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: #FAF2E7; color: #5A4E40;">Светлый и нежный</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 8px; margin-bottom: 12px;">
          <div style="background-color: #FAF2E7; color: #4A3E31; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #E2D3BE; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Стол</div><div style="font-size: 10px; opacity: 0.8;">Песок</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#FAF2E7</div>
          </div>
          <div style="background-color: #C8E2D2; color: #234735; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Доходы</div><div style="font-size: 10px; opacity: 0.8;">Зеленый 1</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#C8E2D2</div>
          </div>
          <div style="background-color: #F6D7CF; color: #692F22; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Расходы</div><div style="font-size: 10px; opacity: 0.8;">Персик В</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#F6D7CF</div>
          </div>
          <div style="background-color: #D3E7F8; color: #1B4567; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Клиенты</div><div style="font-size: 10px; opacity: 0.8;">Небо</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#D3E7F8</div>
          </div>
          <div style="background-color: #FDF1CC; color: #5B481D; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Календарь</div><div style="font-size: 10px; opacity: 0.8;">Сливки</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#FDF1CC</div>
          </div>
          <div style="background-color: #FCE8D5; color: #6D3E14; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Подписки</div><div style="font-size: 10px; opacity: 0.8;">Абрикос</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#FCE8D5</div>
          </div>
          <div style="background-color: #DBCCE9; color: #442B5B; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Прочее</div><div style="font-size: 10px; opacity: 0.8;">Лаванда</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#DBCCE9</div>
          </div>
        </div>

        <div style="background: #FAF2E7; padding: 12px; border-radius: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;">
          <div style="background: #C8E2D2; color: #234735; padding: 12px; border-radius: 14px; box-shadow: 0 4px 10px rgba(150,130,110,0.18); min-height: 68px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: 800;">Доходы</div>
            <div style="font-size: 15px; font-weight: 900;">+125 500 ₽</div>
          </div>
          <div style="background: #F6D7CF; color: #692F22; padding: 12px; border-radius: 14px; box-shadow: 0 4px 10px rgba(150,130,110,0.18); min-height: 68px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: 800;">Расходы (Вариант В)</div>
            <div style="font-size: 15px; font-weight: 900;">28 400 ₽</div>
          </div>
          <div style="background: #D3E7F8; color: #1B4567; padding: 12px; border-radius: 14px; box-shadow: 0 4px 10px rgba(150,130,110,0.18); min-height: 68px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: 800;">Клиенты</div>
            <div style="font-size: 15px; font-weight: 900;">12 активных</div>
          </div>
        </div>
      </div>

      <!-- ==================== ВАРИАНТ Г ==================== -->
      <div style="background: #FFFFFF; border-radius: 18px; padding: 16px; box-shadow: 0 4px 14px rgba(160, 140, 120, 0.12); border: 1px solid rgba(220, 205, 185, 0.6);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 6px;">
          <strong style="font-size: 14px; color: #2F261D;">Вариант Г: Воздушная разбелённая пудра-персик (#F8DDD6)</strong>
          <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: #FAF2E7; color: #5A4E40;">Самый светлый и деликатный</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 8px; margin-bottom: 12px;">
          <div style="background-color: #FAF2E7; color: #4A3E31; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #E2D3BE; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Стол</div><div style="font-size: 10px; opacity: 0.8;">Песок</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#FAF2E7</div>
          </div>
          <div style="background-color: #C8E2D2; color: #234735; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Доходы</div><div style="font-size: 10px; opacity: 0.8;">Зеленый 1</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#C8E2D2</div>
          </div>
          <div style="background-color: #F8DDD6; color: #692F22; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Расходы</div><div style="font-size: 10px; opacity: 0.8;">Персик Г</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#F8DDD6</div>
          </div>
          <div style="background-color: #D3E7F8; color: #1B4567; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Клиенты</div><div style="font-size: 10px; opacity: 0.8;">Небо</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#D3E7F8</div>
          </div>
          <div style="background-color: #FDF1CC; color: #5B481D; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Календарь</div><div style="font-size: 10px; opacity: 0.8;">Сливки</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#FDF1CC</div>
          </div>
          <div style="background-color: #FCE8D5; color: #6D3E14; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Подписки</div><div style="font-size: 10px; opacity: 0.8;">Абрикос</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#FCE8D5</div>
          </div>
          <div style="background-color: #DBCCE9; color: #442B5B; padding: 10px 8px; border-radius: 12px; min-height: 76px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div><div style="font-size: 12px; font-weight: 900;">Прочее</div><div style="font-size: 10px; opacity: 0.8;">Лаванда</div></div>
            <div style="font-size: 10px; font-weight: 800; font-family: monospace; padding: 2px 4px; background: rgba(255,255,255,0.7); border-radius: 4px; width: fit-content;">#DBCCE9</div>
          </div>
        </div>

        <div style="background: #FAF2E7; padding: 12px; border-radius: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;">
          <div style="background: #C8E2D2; color: #234735; padding: 12px; border-radius: 14px; box-shadow: 0 4px 10px rgba(150,130,110,0.18); min-height: 68px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: 800;">Доходы</div>
            <div style="font-size: 15px; font-weight: 900;">+125 500 ₽</div>
          </div>
          <div style="background: #F8DDD6; color: #692F22; padding: 12px; border-radius: 14px; box-shadow: 0 4px 10px rgba(150,130,110,0.18); min-height: 68px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: 800;">Расходы (Вариант Г)</div>
            <div style="font-size: 15px; font-weight: 900;">28 400 ₽</div>
          </div>
          <div style="background: #D3E7F8; color: #1B4567; padding: 12px; border-radius: 14px; box-shadow: 0 4px 10px rgba(150,130,110,0.18); min-height: 68px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: 800;">Клиенты</div>
            <div style="font-size: 15px; font-weight: 900;">12 активных</div>
          </div>
        </div>
      </div>
    </div>\n\n    <!-- =============================================================== -->\n    `;

html = html.substring(0, startIdx) + newSection + html.substring(endIdx);
fs.writeFileSync('макеты.html', html, 'utf8');
console.log('Successfully updated 4-option full comparison in макеты.html!');
