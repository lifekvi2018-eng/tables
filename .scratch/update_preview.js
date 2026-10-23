const fs = require('fs');
const path = 'C:/Users/Admin/.gemini/antigravity/brain/08480e9d-48c1-4f7a-9fbc-d733ddec5f0c/main_screen_preview.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Remove borders from cards and containers
html = html.replace(/border: 1px solid #B4D7C0;/g, 'border: none;');
html = html.replace(/border: 1px solid #F6BEB4;/g, 'border: none;');
html = html.replace(/border: 1px solid #BEDAF3;/g, 'border: none;');
html = html.replace(/border: 1px solid #F3E2B5;/g, 'border: none;');
html = html.replace(/border: 1px solid #F6D6BC;/g, 'border: none;');
html = html.replace(/border: 1px solid rgba\(220, 205, 185, 0\.7\);/g, 'border: none;');
html = html.replace(/border: 1px solid #EADCCB;/g, 'border: none;');

// 2. Add top bevel highlight (inset 0 1.5px 0 rgba(255, 255, 255, 0.85)) and remove borders
// Ensure cards have beautiful soft paper shadows without borders
html = html.replace(/\.desk-income-card \{[\s\S]*?border: none;\s*\}/, `.desk-income-card {
      background: #C8E2D2;
      border-radius: 22px;
      padding: 16px;
      box-shadow: 8px 14px 28px -4px rgba(100, 145, 120, 0.32), -4px -4px 14px rgba(255, 255, 255, 0.85), inset 0 1.5px 0 rgba(255, 255, 255, 0.85);
      border: none;
    }`);

html = html.replace(/\.desk-expense-card \{[\s\S]*?border: none;\s*\}/, `.desk-expense-card {
      background: #FCD6CF;
      border-radius: 22px;
      padding: 16px;
      box-shadow: 8px 14px 28px -4px rgba(175, 120, 115, 0.32), -4px -4px 14px rgba(255, 255, 255, 0.85), inset 0 1.5px 0 rgba(255, 255, 255, 0.85);
      border: none;
    }`);

html = html.replace(/\.desk-clients-card \{[\s\S]*?border: none;\s*\}/, `.desk-clients-card {
      background: #D3E7F8;
      border-radius: 22px;
      padding: 16px;
      box-shadow: 8px 14px 28px -4px rgba(110, 135, 165, 0.32), -4px -4px 14px rgba(255, 255, 255, 0.85), inset 0 1.5px 0 rgba(255, 255, 255, 0.85);
      border: none;
    }`);

// 3. Replace sub-items styling to make them lighter, layered 3D paper
const subItemRegex = /\/\* ВНУТРЕННИЕ ПЛАШКИ:[\s\S]*?\.sub-item-payments \{[\s\S]*?color: #383025;\s*\}/;
const newSubItemStyles = `/* ВНУТРЕННИЕ ПЛАШКИ: СВЕТЛЫЕ 3D-БУМАЖЕЧКИ С МЯГКОЙ ТЕНЬЮ */
    .sub-item-income {
      background: #F0F8F3;
      border-radius: 14px;
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 2px 4px 10px -1px rgba(50, 90, 70, 0.20), -1.5px -1.5px 5px rgba(255, 255, 255, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.95);
      font-size: 12px;
      cursor: pointer;
      border: none;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .sub-item-income:hover {
      transform: translateY(-1.5px);
      box-shadow: 3px 6px 14px -1px rgba(50, 90, 70, 0.26), -2px -2px 6px rgba(255, 255, 255, 0.95);
    }
    .sub-item-income:active {
      transform: translateY(1.5px);
      box-shadow: 1px 2px 4px rgba(50, 90, 70, 0.16);
    }

    .sub-item-expense {
      background: #FFF3F0;
      border-radius: 14px;
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 2px 4px 10px -1px rgba(130, 65, 55, 0.18), -1.5px -1.5px 5px rgba(255, 255, 255, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.95);
      font-size: 12px;
      cursor: pointer;
      border: none;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .sub-item-expense:hover {
      transform: translateY(-1.5px);
      box-shadow: 3px 6px 14px -1px rgba(130, 65, 55, 0.24), -2px -2px 6px rgba(255, 255, 255, 0.95);
    }
    .sub-item-expense:active {
      transform: translateY(1.5px);
      box-shadow: 1px 2px 4px rgba(130, 65, 55, 0.14);
    }

    .sub-item-clients {
      background: #F1F7FD;
      border-radius: 14px;
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 2px 4px 10px -1px rgba(60, 100, 140, 0.18), -1.5px -1.5px 5px rgba(255, 255, 255, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.95);
      font-size: 12px;
      cursor: pointer;
      border: none;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .sub-item-clients:hover {
      transform: translateY(-1.5px);
      box-shadow: 3px 6px 14px -1px rgba(60, 100, 140, 0.24), -2px -2px 6px rgba(255, 255, 255, 0.95);
    }
    .sub-item-clients:active {
      transform: translateY(1.5px);
      box-shadow: 1px 2px 4px rgba(60, 100, 140, 0.14);
    }

    .sub-item-payments {
      background: #FFF7EE;
      border-radius: 12px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 2px 4px 8px -1px rgba(150, 110, 80, 0.16), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.95);
      font-size: 13px;
      font-weight: 700;
      color: #383025;
      border: none;
    }

    /* БУМАЖНЫЕ ТАКТИЛЬНЫЕ КНОПКИ СО СТРЕЛОЧКОЙ */
    .arrow-btn-desk {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #FAF2E7;
      border: none;
      font-size: 15px;
      font-weight: 900;
      color: #4A3E31;
      box-shadow: 3px 4px 10px rgba(140, 110, 90, 0.22), -2px -2px 5px rgba(255, 255, 255, 0.95);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .arrow-btn-desk:hover {
      transform: translateY(-1px);
      box-shadow: 4px 6px 12px rgba(140, 110, 90, 0.28), -2px -2px 6px rgba(255, 255, 255, 0.95);
    }
    .arrow-btn-desk:active {
      transform: translateY(1.5px);
      box-shadow: 1px 2px 4px rgba(140, 110, 90, 0.2);
    }

    .sub-arrow-btn {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #FAF2E7;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 900;
      color: #5A4E40;
      box-shadow: 2px 3px 6px rgba(130, 105, 80, 0.18), -1px -1px 3px rgba(255, 255, 255, 0.95);
      flex-shrink: 0;
    }`;

html = html.replace(subItemRegex, newSubItemStyles);

// 4. Update the desktop cards headers to include the tactile arrow button next to '+'
// Income header
html = html.replace(
  /<span style="font-size: 16px; font-weight: 900; color: #1E3F30; font-family: Georgia, serif;">Доходы<\/span>\s*<\/div>\s*<button class="btn-plus-desk">\+<\/button>/,
  `<span style="font-size: 16px; font-weight: 900; color: #1E3F30; font-family: Georgia, serif;">Доходы</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="btn-plus-desk" title="Добавить">+</button>
                    <button class="arrow-btn-desk" title="Открыть Доходы">›</button>
                  </div>`
);

// Expense header
html = html.replace(
  /<span style="font-size: 16px; font-weight: 900; color: #58241B; font-family: Georgia, serif;">Расходы<\/span>\s*<\/div>\s*<button class="btn-plus-desk">\+<\/button>/,
  `<span style="font-size: 16px; font-weight: 900; color: #58241B; font-family: Georgia, serif;">Расходы</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="btn-plus-desk" title="Добавить">+</button>
                    <button class="arrow-btn-desk" title="Открыть Расходы">›</button>
                  </div>`
);

// Clients header
html = html.replace(
  /<span style="font-size: 16px; font-weight: 900; color: #163B59; font-family: Georgia, serif;">Клиенты<\/span>\s*<\/div>\s*<button class="btn-plus-desk">\+<\/button>/,
  `<span style="font-size: 16px; font-weight: 900; color: #163B59; font-family: Georgia, serif;">Клиенты</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="btn-plus-desk" title="Добавить">+</button>
                    <button class="arrow-btn-desk" title="Открыть Клиенты">›</button>
                  </div>`
);

// 5. Replace flat text arrows in sub-items with tactile paper buttons .sub-arrow-btn
html = html.replace(/<span style="color: #6A8E7A; font-size: 12px; font-weight: 900;">›<\/span>/g, '<span class="sub-arrow-btn">›</span>');
html = html.replace(/<span style="color: #B0746A; font-size: 12px; font-weight: 900;">›<\/span>/g, '<span class="sub-arrow-btn">›</span>');
html = html.replace(/<span style="color: #6B95B8; font-size: 12px; font-weight: 900;">›<\/span>/g, '<span class="sub-arrow-btn">›</span>');

// Save back
fs.writeFileSync(path, html, 'utf8');
fs.writeFileSync('main_screen.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Update complete. File sizes:', fs.statSync(path).size, fs.statSync('main_screen.html').size);
