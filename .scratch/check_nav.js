const fs = require('fs');
const html = fs.readFileSync('main_screen.html', 'utf8');

const navIdx = html.indexOf('desk-nav-item');
console.log('desk-nav-item CSS:');
console.log(html.slice(navIdx, navIdx + 600));

// Check sidebar markup in desktop
const sbIdx = html.indexOf('<!-- Боковое меню десктопа -->');
console.log('Sidebar markup:');
console.log(html.slice(sbIdx, sbIdx + 1200));
