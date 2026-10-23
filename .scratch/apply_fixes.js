const fs = require('fs');

const previewPath = 'C:/Users/Admin/.gemini/antigravity/brain/08480e9d-48c1-4f7a-9fbc-d733ddec5f0c/main_screen_preview.html';
let html = fs.readFileSync(previewPath, 'utf8');

// 1. Remove the top arrow button from desktop card headers (keep only plus)
// Income
html = html.replace(
  /<div style="display: flex; align-items: center; gap: 8px;">\s*<button class="btn-plus-desk" title="Добавить">\+<\/button>\s*<button class="arrow-btn-desk" title="Открыть Доходы">›<\/button>\s*<\/div>/,
  `<button class="btn-plus-income" title="Добавить">+</button>`
);
// Expense
html = html.replace(
  /<div style="display: flex; align-items: center; gap: 8px;">\s*<button class="btn-plus-desk" title="Добавить">\+<\/button>\s*<button class="arrow-btn-desk" title="Открыть Расходы">›<\/button>\s*<\/div>/,
  `<button class="btn-plus-expense" title="Добавить">+</button>`
);
// Clients
html = html.replace(
  /<div style="display: flex; align-items: center; gap: 8px;">\s*<button class="btn-plus-desk" title="Добавить">\+<\/button>\s*<button class="arrow-btn-desk" title="Открыть Клиенты">›<\/button>\s*<\/div>/,
  `<button class="btn-plus-clients" title="Добавить">+</button>`
);

// 2. Add client rows sub-arrows if missing
// Let's check how client rows are structured in desktop
const clientBlockOld = `<div class="sub-item-clients">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 24px; height: 24px; border-radius: 50%; background: #B9D7F2; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; color: #1E3F5A;">А</div>
                      <div>
                        <div style="font-weight: 800; color: #163B59;">Анка</div>
                        <div style="font-size: 10px; color: #436F94;">В работе</div>
                      </div>
                    </div>
                    <span style="font-weight: 800; color: #2B6899; font-size: 11px;">Досье ↗</span>
                  </div>`;

// Replace all client rows with paper sub-arrow button
html = html.replace(
  /<span style="font-weight: 800; color: #2B6899; font-size: 11px;">Досье ↗<\/span>/g,
  `<span class="sub-arrow-clients">›</span>`
);

// 3. Update CSS:
// Define specialized plus buttons and large sub-arrow buttons tinted to each card color (green on green, pink on pink, blue on blue)
const newCss = `
    /* КНОПКИ ПЛЮСИКОВ В ЦВЕТ КАРТОЧЕК */
    .btn-plus-income {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #D8EFE0;
      border: none;
      font-size: 18px;
      font-weight: 900;
      color: #1E4A35;
      cursor: pointer;
      box-shadow: 2.5px 4px 10px rgba(45, 88, 71, 0.22), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .btn-plus-income:hover { transform: translateY(-1px); }
    .btn-plus-income:active { transform: translateY(1.5px); }

    .btn-plus-expense {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #FCE3DE;
      border: none;
      font-size: 18px;
      font-weight: 900;
      color: #6E2F26;
      cursor: pointer;
      box-shadow: 2.5px 4px 10px rgba(140, 60, 50, 0.20), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .btn-plus-expense:hover { transform: translateY(-1px); }
    .btn-plus-expense:active { transform: translateY(1.5px); }

    .btn-plus-clients {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #DEEEFA;
      border: none;
      font-size: 18px;
      font-weight: 900;
      color: #1B4567;
      cursor: pointer;
      box-shadow: 2.5px 4px 10px rgba(50, 90, 140, 0.20), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .btn-plus-clients:hover { transform: translateY(-1px); }
    .btn-plus-clients:active { transform: translateY(1.5px); }

    /* КРУПНЫЕ ТАКТИЛЬНЫЕ БУМАЖНЫЕ СТРЕЛКИ В СТРОКАХ (В ЦВЕТ СВОЕЙ КАРТОЧКИ) */
    .sub-arrow-income {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #D8EFE0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      font-weight: 900;
      color: #1E4A35;
      box-shadow: 2.5px 4px 8px rgba(45, 88, 71, 0.22), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.9);
      flex-shrink: 0;
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    .sub-arrow-income:hover { transform: translateY(-1px); }
    .sub-arrow-income:active { transform: translateY(1.5px); }

    .sub-arrow-expense {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #FCE3DE;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      font-weight: 900;
      color: #6E2F26;
      box-shadow: 2.5px 4px 8px rgba(140, 60, 50, 0.20), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.9);
      flex-shrink: 0;
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    .sub-arrow-expense:hover { transform: translateY(-1px); }
    .sub-arrow-expense:active { transform: translateY(1.5px); }

    .sub-arrow-clients {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #DEEEFA;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      font-weight: 900;
      color: #1B4567;
      box-shadow: 2.5px 4px 8px rgba(50, 90, 140, 0.20), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.9);
      flex-shrink: 0;
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    .sub-arrow-clients:hover { transform: translateY(-1px); }
    .sub-arrow-clients:active { transform: translateY(1.5px); }

    /* ОБЪЁМНЫЕ БУМАЖНЫЕ КРУЖОЧКИ В КАЛЕНДАРЕ */
    .cal-paper-dot {
      border-radius: 50%;
      width: 26px;
      height: 26px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      box-shadow: 2px 3.5px 7px rgba(160, 130, 90, 0.25), -1px -1px 3px rgba(255, 255, 255, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }
`;

// Insert new CSS into <style>
html = html.replace('</style>', newCss + '\n</style>');

// 4. Update sub-arrows inside Income, Expense, Clients cards
// In Income card: replace class="sub-arrow-btn" with class="sub-arrow-income"
// Find income block
const incStart = html.indexOf('<div class="desk-income-card">');
const incEnd = html.indexOf('<div class="desk-expense-card">');
let incBlock = html.slice(incStart, incEnd);
incBlock = incBlock.replace(/class="sub-arrow-btn"/g, 'class="sub-arrow-income"');
html = html.slice(0, incStart) + incBlock + html.slice(incEnd);

// In Expense card
const expStart = html.indexOf('<div class="desk-expense-card">');
const expEnd = html.indexOf('<div class="desk-clients-card">');
let expBlock = html.slice(expStart, expEnd);
expBlock = expBlock.replace(/class="sub-arrow-btn"/g, 'class="sub-arrow-expense"');
html = html.slice(0, expStart) + expBlock + html.slice(expEnd);

// In Calendar: update dot circles to have 3D paper feel with cal-paper-dot
html = html.replace(/box-shadow: 1px 2px 4px rgba\(120,150,180,0\.3\);/g, 'box-shadow: 2px 3.5px 7px rgba(80,120,160,0.28), -1px -1px 3px rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.9); width: 26px; height: 26px;');
html = html.replace(/box-shadow: 1px 2px 4px rgba\(200,130,130,0\.3\);/g, 'box-shadow: 2px 3.5px 7px rgba(180,90,90,0.28), -1px -1px 3px rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.9); width: 26px; height: 26px;');
html = html.replace(/box-shadow: 1px 2px 4px rgba\(190,160,80,0\.3\);/g, 'box-shadow: 2px 3.5px 7px rgba(170,140,70,0.28), -1px -1px 3px rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.9); width: 26px; height: 26px;');
html = html.replace(/box-shadow: 1px 2px 4px rgba\(200,140,90,0\.3\);/g, 'box-shadow: 2px 3.5px 7px rgba(180,110,60,0.28), -1px -1px 3px rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.9); width: 26px; height: 26px;');
html = html.replace(/box-shadow: 1px 2px 4px rgba\(150,130,170,0\.3\);/g, 'box-shadow: 2px 3.5px 7px rgba(130,100,150,0.28), -1px -1px 3px rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.9); width: 26px; height: 26px;');

// Write files
fs.writeFileSync(previewPath, html, 'utf8');
fs.writeFileSync('main_screen.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');

console.log('Applied fixes. Size:', fs.statSync('main_screen.html').size);
