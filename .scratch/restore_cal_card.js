const fs = require('fs');

const previewPath = 'C:/Users/Admin/.gemini/antigravity/brain/08480e9d-48c1-4f7a-9fbc-d733ddec5f0c/main_screen_preview.html';
let html = fs.readFileSync(previewPath, 'utf8');

// Find the corrupted desktop section:
const desktopStart = html.indexOf('<!-- Контент десктопа -->');
const deskPaymentsIdx = html.indexOf('<!-- 2. МОИ ПЛАТЕЖИ:');

// Look at the portion between desktopStart and deskPaymentsIdx:
const corruptedChunk = html.slice(desktopStart, deskPaymentsIdx);
console.log('Corrupted chunk:\n', corruptedChunk);

// Reconstruct the correct desktop header and calendar card:
// Find where the calendar table starts:
const tableIdx = corruptedChunk.indexOf('<div style="display: grid; grid-template-columns: repeat(7, 1fr);');
const tableContent = corruptedChunk.slice(tableIdx);

const restoredChunk = `<!-- Контент десктопа -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            
            <!-- Шапка десктопа -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
              <div style="font-size: 24px; font-weight: 900; color: #2F261D; letter-spacing: -0.3px;">Мой мир ♡</div>
              <div style="flex: 1; max-width: 320px; background: #FAF2E7; border-radius: 14px; padding: 8px 14px; display: flex; align-items: center; gap: 8px; box-shadow: inset 1.5px 2px 5px rgba(150, 130, 110, 0.15); border: none; font-size: 12px; color: #726453;">
                <span>🔍</span>
                <span>Поиск...</span>
              </div>
              <div class="cat-circle">
                <span style="font-size: 20px;">🐱</span>
              </div>
            </div>

            <!-- ============================================================== -->
            <!-- ВЕРХНИЙ РЯД: КАЛЕНДАРЬ (2fr = ДОХОД + РАСХОД) + ПЛАТЕЖИ (1fr)  -->
            <!-- ============================================================== -->
            <div class="bento-top-grid">
              
              <!-- 1. КАЛЕНДАРЬ НА 2 КОЛОНКИ: НЕЖНЫЕ СЛИВКИ #FDF1CC -->
              <div class="desk-calendar-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <button class="cal-nav-btn" title="Предыдущий месяц">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="#5B481D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                  <span style="font-size: 17px; font-weight: 900; color: #3A2F1D; letter-spacing: -0.2px;">Март 2025</span>
                  <button class="cal-nav-btn" title="Следующий месяц">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="#5B481D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                </div>
                ${tableContent}
              </div>

              `;

html = html.replace(corruptedChunk, restoredChunk);

// Save to preview, main_screen.html, and index.html
fs.writeFileSync(previewPath, html, 'utf8');
fs.writeFileSync('main_screen.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');

console.log('Restored calendar card container successfully. Size:', fs.statSync('main_screen.html').size);
