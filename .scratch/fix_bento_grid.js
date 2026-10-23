const fs = require('fs');

const previewPath = 'C:/Users/Admin/.gemini/antigravity/brain/08480e9d-48c1-4f7a-9fbc-d733ddec5f0c/main_screen_preview.html';
let html = fs.readFileSync(previewPath, 'utf8');

// Remove the extra </div> after desk-calendar-card
const badPattern = `                </div>
              </div>

              
              </div>

              <!-- 2. МОИ ПЛАТЕЖИ`;

const goodPattern = `                </div>
              </div>

              <!-- 2. МОИ ПЛАТЕЖИ`;

if (html.includes(badPattern)) {
  html = html.replace(badPattern, goodPattern);
  console.log('Fixed extra </div> successfully!');
} else {
  console.log('badPattern not found, checking with regex');
  html = html.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<!-- 2\. МОИ ПЛАТЕЖИ/, '</div>\n              </div>\n\n              <!-- 2. МОИ ПЛАТЕЖИ');
}

// Write to preview, main_screen.html, and index.html
fs.writeFileSync(previewPath, html, 'utf8');
fs.writeFileSync('main_screen.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');

console.log('Done! Files synchronized.');
