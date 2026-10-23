const fs = require('fs');

const previewPath = 'C:/Users/Admin/.gemini/antigravity/brain/08480e9d-48c1-4f7a-9fbc-d733ddec5f0c/main_screen_preview.html';
let html = fs.readFileSync(previewPath, 'utf8');

// 1. Add .cal-nav-btn CSS style
const calNavBtnCss = `
    /* КНОПКИ НАВИГАЦИИ КАЛЕНДАРЯ (СВЕТЛЕЕ КАЛЕНДАРЯ, СТРЕЛКИ РАЗНЕСЕНЫ) */
    .cal-nav-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #FFF9E5;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 2px 3.5px 8px rgba(180, 150, 90, 0.22), -1.5px -1.5px 4px rgba(255, 255, 255, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.9);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      flex-shrink: 0;
    }
    .cal-nav-btn:hover { transform: translateY(-1px); box-shadow: 3px 5px 10px rgba(180, 150, 90, 0.28); }
    .cal-nav-btn:active { transform: translateY(1.5px); }
`;

html = html.replace('</style>', calNavBtnCss + '\n</style>');

// 2. Update desktop calendar header:
// Month in the middle, left arrow on the left, right arrow on the right
const oldDeskCalHeader = /<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">\s*<span style="font-family: [^;]+; font-size: 16px; font-weight: 900; color: #3A2F1D;">Март 2025<\/span>\s*<div style="display: flex; gap: 6px;">\s*<button class="btn-plus-desk"[^>]*>‹<\/button>\s*<button class="btn-plus-desk"[^>]*>›<\/button>\s*<\/div>\s*<\/div>/;

const newDeskCalHeader = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <button class="cal-nav-btn" title="Предыдущий месяц">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="#5B481D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                  <span style="font-size: 17px; font-weight: 900; color: #3A2F1D; letter-spacing: -0.2px;">Март 2025</span>
                  <button class="cal-nav-btn" title="Следующий месяц">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="#5B481D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                </div>`;

if (oldDeskCalHeader.test(html)) {
  html = html.replace(oldDeskCalHeader, newDeskCalHeader);
  console.log('Replaced desktop calendar header via regex');
} else {
  console.log('oldDeskCalHeader regex did not match, trying flexible replace');
  // Flexible match between "desk-calendar-card" and grid repeat(7
  const calCardIdx = html.indexOf('desk-calendar-card');
  const calGridIdx = html.indexOf('grid-template-columns: repeat(7, 1fr)', calCardIdx);
  const chunk = html.slice(calCardIdx, calGridIdx);
  const headerIdx = chunk.indexOf('<div style="display: flex; justify-content: space-between');
  if (headerIdx !== -1) {
    const endHeaderIdx = chunk.indexOf('</div>\n                <div style="display: grid', headerIdx);
    const oldHeader = chunk.slice(headerIdx, endHeaderIdx + 6);
    html = html.replace(oldHeader, newDeskCalHeader);
    console.log('Replaced desktop calendar header via slice');
  }
}

// 3. Update mobile calendar header as well (month in the middle, buttons on left and right)
const oldMobCalNav = `<div class="cal-nav">
                <span style="cursor: pointer; color: #7A6539;">‹</span>
                <span>Март 2025</span>
                <span style="cursor: pointer; color: #7A6539;">›</span>
              </div>`;

const newMobCalNav = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 0 4px;">
                <button class="cal-nav-btn" style="width: 28px; height: 28px;" title="Предыдущий месяц">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="#5B481D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <span style="font-size: 15px; font-weight: 900; color: #3A2F1D;">Март 2025</span>
                <button class="cal-nav-btn" style="width: 28px; height: 28px;" title="Следующий месяц">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="#5B481D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>`;

html = html.replace(oldMobCalNav, newMobCalNav);

// 4. Reduce plus icon line thickness (stroke-width: 2.6 -> 1.9)
// More refined, elegant, airier plus!
html = html.replace(/stroke-width="2\.6"/g, 'stroke-width="1.9"');

// Save to preview, main_screen.html and index.html
fs.writeFileSync(previewPath, html, 'utf8');
fs.writeFileSync('main_screen.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');

console.log('Saved refined calendar & plus. File size:', fs.statSync('main_screen.html').size);
