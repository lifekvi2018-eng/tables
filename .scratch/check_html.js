const fs = require('fs');
const html = fs.readFileSync('main_screen.html', 'utf8');

const cliIdx = html.indexOf('desk-clients-card');
const cliIdx2 = html.indexOf('desk-clients-card', cliIdx + 1);
console.log(html.slice(cliIdx2 + 400, cliIdx2 + 2000));
