const fs = require('fs');

['main_screen.html', 'income_screen.html', 'expenses_screen.html', 'clients_screen.html'].forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  console.log(f, {
    deskMain: c.indexOf('class="desk-main-content"'),
    iphoneScreen: c.indexOf('class="iphone-screen"')
  });
});
