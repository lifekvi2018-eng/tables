const fs = require('fs');

const previewPath = 'C:/Users/Admin/.gemini/antigravity/brain/08480e9d-48c1-4f7a-9fbc-d733ddec5f0c/main_screen_preview.html';
let html = fs.readFileSync(previewPath, 'utf8');

// 1. Force all elements, buttons, inputs to inherit Manrope font
const universalFontRule = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    body, button, input, select, textarea, span, div, p, h1, h2, h3 {
      font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif !important;
    }
`;

html = html.replace(/\* \{\s*box-sizing: border-box;\s*margin: 0;\s*padding: 0;\s*\}/, universalFontRule);

// Also explicitly set font-family on .desk-nav-item and .tab-btn
html = html.replace(/\.desk-nav-item \{/, `.desk-nav-item {
      font-family: 'Manrope', sans-serif !important;`);

html = html.replace(/\.tab-btn \{/, `.tab-btn {
      font-family: 'Manrope', sans-serif !important;`);

// Write out to all 3 files
fs.writeFileSync(previewPath, html, 'utf8');
fs.writeFileSync('main_screen.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');

console.log('Manrope enforced on all buttons, inputs, and nav items!');
