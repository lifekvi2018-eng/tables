const fs = require('fs');

function inspectMarkers(filename) {
  const lines = fs.readFileSync(filename, 'utf8').split('\n');
  console.log(`\n=== ${filename} (Total: ${lines.length}) ===`);
  lines.forEach((l, i) => {
    if (l.includes('class="desktop-window"') || l.includes('class="desk-main-content"') || l.includes('class="iphone-screen"')) {
      console.log(`Line ${i + 1}: ${l.trim().slice(0, 80)}`);
    }
  });
}

inspectMarkers('main_screen.html');
inspectMarkers('income_screen.html');
inspectMarkers('expenses_screen.html');
inspectMarkers('clients_screen.html');
