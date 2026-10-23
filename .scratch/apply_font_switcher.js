const fs = require('fs');

const previewPath = 'C:/Users/Admin/.gemini/antigravity/brain/08480e9d-48c1-4f7a-9fbc-d733ddec5f0c/main_screen_preview.html';
let html = fs.readFileSync(previewPath, 'utf8');

// 1. Add Google Fonts link in head
const fontLinks = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800;900&family=Nunito:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
`;

if (!html.includes('family=Nunito')) {
  html = html.replace('<style>', fontLinks + '\n  <style>');
}

// 2. Add font switching CSS classes
const fontClasses = `
    /* ШРИФТОВЫЕ СТИЛИ */
    body.font-1, body.font-1 * { font-family: 'Nunito', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important; }
    body.font-2, body.font-2 * { font-family: 'Manrope', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important; }
    body.font-3, body.font-3 * { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important; }

    /* ПЕРЕКЛЮЧАТЕЛЬ ШРИФТОВ */
    .font-switch-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      background: #F3E6D7;
      padding: 6px 10px;
      border-radius: 999px;
      max-width: fit-content;
      margin-left: auto;
      margin-right: auto;
      box-shadow: inset 1.5px 2px 4px rgba(150, 125, 100, 0.18), 0 1px 0 rgba(255,255,255,0.9);
    }
    .font-switch-label {
      font-size: 11px;
      font-weight: 900;
      color: #6C5D4C;
      padding-left: 8px;
    }
    .font-switch-btn {
      padding: 6px 14px;
      border-radius: 999px;
      border: none;
      background: transparent;
      color: #5A4E40;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .font-switch-btn.active {
      background: #FAF2E7;
      color: #2F261D;
      box-shadow: 2px 3px 8px rgba(140, 115, 90, 0.22), -1px -1px 3px rgba(255,255,255,0.95);
    }
`;

html = html.replace('</style>', fontClasses + '\n</style>');

// 3. Set default font class on body: class="font-1"
html = html.replace('<body>', '<body class="font-1">');

// 4. Add font switcher HTML above top-header
const switcherHtml = `
    <!-- ПЕРЕКЛЮЧАТЕЛЬ ШРИФТОВ ДЛЯ НАГЛЯДНОГО СРАВНЕНИЯ -->
    <div class="font-switch-bar">
      <span class="font-switch-label">✨ Шрифт:</span>
      <button class="font-switch-btn active" id="fbtn-1" onclick="setFont(1)">1. Мягкий (Nunito)</button>
      <button class="font-switch-btn" id="fbtn-2" onclick="setFont(2)">2. Скандинавский (Manrope)</button>
      <button class="font-switch-btn" id="fbtn-3" onclick="setFont(3)">3. Деловой (Jakarta)</button>
    </div>
`;

html = html.replace('<div class="top-header">', switcherHtml + '\n    <div class="top-header">');

// 5. Replace text '+' with vector plus icon in buttons
const vectorPlus = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`;

html = html.replace(/<button class="btn-plus-income" title="Добавить">\+<\/button>/g, `<button class="btn-plus-income" title="Добавить">${vectorPlus}</button>`);
html = html.replace(/<button class="btn-plus-expense" title="Добавить">\+<\/button>/g, `<button class="btn-plus-expense" title="Добавить">${vectorPlus}</button>`);
html = html.replace(/<button class="btn-plus-clients" title="Добавить">\+<\/button>/g, `<button class="btn-plus-clients" title="Добавить">${vectorPlus}</button>`);
html = html.replace(/<button class="btn-plus-desk">\+<\/button>/g, `<button class="btn-plus-desk" style="display:flex;align-items:center;justify-content:center;">${vectorPlus}</button>`);

// 6. Replace text '›' inside sub-arrows with vector chevron icon
const vectorChevron = `<svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

html = html.replace(/<span class="sub-arrow-income">›<\/span>/g, `<span class="sub-arrow-income">${vectorChevron}</span>`);
html = html.replace(/<span class="sub-arrow-expense">›<\/span>/g, `<span class="sub-arrow-expense">${vectorChevron}</span>`);
html = html.replace(/<span class="sub-arrow-clients">›<\/span>/g, `<span class="sub-arrow-clients">${vectorChevron}</span>`);

// 7. Add setFont script before </body>
const scriptHtml = `
  <script>
    function setFont(num) {
      document.body.className = 'font-' + num;
      document.querySelectorAll('.font-switch-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = document.getElementById('fbtn-' + num);
      if (activeBtn) activeBtn.classList.add('active');
    }
  </script>
`;

html = html.replace('</body>', scriptHtml + '\n</body>');

// Write out all files
fs.writeFileSync(previewPath, html, 'utf8');
fs.writeFileSync('main_screen.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');

console.log('Font switcher & vector icons applied. Size:', fs.statSync('main_screen.html').size);
