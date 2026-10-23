const fs = require('fs');

const previewPath = 'C:/Users/Admin/.gemini/antigravity/brain/08480e9d-48c1-4f7a-9fbc-d733ddec5f0c/main_screen_preview.html';
let html = fs.readFileSync(previewPath, 'utf8');

// Replace any remaining flat arrows in sub-items with tactile paper buttons
html = html.replace(/<span style="color: #6A8EA8; font-size: 12px; font-weight: 900;">›<\/span>/g, '<span class="sub-arrow-clients">›</span>');
html = html.replace(/<span style="color: #6A8E7A; font-size: 12px; font-weight: 900;">›<\/span>/g, '<span class="sub-arrow-income">›</span>');
html = html.replace(/<span style="color: #B0746A; font-size: 12px; font-weight: 900;">›<\/span>/g, '<span class="sub-arrow-expense">›</span>');
html = html.replace(/<span style="color: #6B95B8; font-size: 12px; font-weight: 900;">›<\/span>/g, '<span class="sub-arrow-clients">›</span>');

fs.writeFileSync(previewPath, html, 'utf8');
fs.writeFileSync('main_screen.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');

console.log('Fixed client arrows. Total sub-arrow-clients count:', (html.match(/sub-arrow-clients/g) || []).length);
