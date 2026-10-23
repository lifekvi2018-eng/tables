const fs = require('fs');

const previewPath = 'C:/Users/Admin/.gemini/antigravity/brain/08480e9d-48c1-4f7a-9fbc-d733ddec5f0c/main_screen_preview.html';
let html = fs.readFileSync(previewPath, 'utf8');

// Replace cat circle with elegant minimalist profile avatar
const oldCat1 = `<div class="cat-circle">
                <span style="font-size: 20px;">🐱</span>
              </div>`;

const newAvatar = `<div class="cat-circle" title="Профиль">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4.2" stroke="#5A4E40" stroke-width="2"/>
                  <path d="M4 20C4 16.5 7.6 14 12 14C16.4 14 20 16.5 20 20" stroke="#5A4E40" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>`;

html = html.replace(new RegExp(oldCat1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newAvatar);

// Also check single line variant
html = html.replace(/<span style="font-size: 20px;">🐱<\/span>/g, `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4.2" stroke="#5A4E40" stroke-width="2"/>
                  <path d="M4 20C4 16.5 7.6 14 12 14C16.4 14 20 16.5 20 20" stroke="#5A4E40" stroke-width="2" stroke-linecap="round"/>
                </svg>`);

fs.writeFileSync(previewPath, html, 'utf8');
fs.writeFileSync('main_screen.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');

console.log('Cat replaced with profile avatar icon');
