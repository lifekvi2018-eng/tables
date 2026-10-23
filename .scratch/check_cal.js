const fs = require('fs');
const html = fs.readFileSync('main_screen.html', 'utf8');

const bentoIdx = html.indexOf('<div class="bento-top-grid">');
const bentoEnd = html.indexOf('<div class="bento-bottom-grid">');
const bentoChunk = html.slice(bentoIdx, bentoEnd);

console.log('bentoChunk:\n', bentoChunk);

// Count open and close divs in bentoChunk
const openDivs = (bentoChunk.match(/<div\b/g) || []).length;
const closeDivs = (bentoChunk.match(/<\/div>/g) || []).length;
console.log('Open divs:', openDivs, 'Close divs:', closeDivs);
