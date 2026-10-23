const fs = require('fs');

const previewPath = 'C:/Users/Admin/.gemini/antigravity/brain/08480e9d-48c1-4f7a-9fbc-d733ddec5f0c/main_screen_preview.html';
let html = fs.readFileSync(previewPath, 'utf8');

// 1. Google Fonts link
const fontLinks = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800;900&display=swap" rel="stylesheet">
`;
if (!html.includes('family=Manrope')) {
  html = html.replace('<style>', fontLinks + '\n  <style>');
}

// 2. Set Manrope as the primary font for everything
html = html.replace(/font-family: -apple-system[^;]+;/g, "font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;");
html = html.replace(/font-family: Georgia, serif;/g, "font-family: 'Manrope', sans-serif; font-weight: 900;");

// Set body default font
html = html.replace(/<body[^>]*>/, '<body style="font-family: \'Manrope\', sans-serif;">');

// 3. Replace text '+' with vector plus icon in buttons
const vectorPlus = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`;

html = html.replace(/<button class="btn-plus-income" title="Добавить">\+<\/button>/g, `<button class="btn-plus-income" title="Добавить">${vectorPlus}</button>`);
html = html.replace(/<button class="btn-plus-expense" title="Добавить">\+<\/button>/g, `<button class="btn-plus-expense" title="Добавить">${vectorPlus}</button>`);
html = html.replace(/<button class="btn-plus-clients" title="Добавить">\+<\/button>/g, `<button class="btn-plus-clients" title="Добавить">${vectorPlus}</button>`);
html = html.replace(/<button class="btn-plus-desk">\+<\/button>/g, `<button class="btn-plus-desk" style="display:flex;align-items:center;justify-content:center;">${vectorPlus}</button>`);

// 4. Replace text '›' inside sub-arrows with vector chevron icon
const vectorChevron = `<svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

html = html.replace(/<span class="sub-arrow-income">›<\/span>/g, `<span class="sub-arrow-income">${vectorChevron}</span>`);
html = html.replace(/<span class="sub-arrow-expense">›<\/span>/g, `<span class="sub-arrow-expense">${vectorChevron}</span>`);
html = html.replace(/<span class="sub-arrow-clients">›<\/span>/g, `<span class="sub-arrow-clients">${vectorChevron}</span>`);

// Update badge status to indicate approved Manrope font
html = html.replace(/★ ГЛАВНЫЙ ЭКРАН • БЕЗ БЕЛОГО ЦВЕТА/g, '★ ГЛАВНЫЙ ЭКРАН • СКАНДИНАВСКИЙ ШИК (MANROPE) • БЕЗ БЕЛОГО');

// Save files
fs.writeFileSync(previewPath, html, 'utf8');
fs.writeFileSync('main_screen.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');

console.log('Applied Manrope font & vector icons. Size:', fs.statSync('main_screen.html').size);
