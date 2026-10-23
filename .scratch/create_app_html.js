const fs = require('fs');

// Читаем существующие файлы экранов
const mainContent = fs.readFileSync('main_screen.html', 'utf8');
const incomeContent = fs.readFileSync('income_screen.html', 'utf8');
const expensesContent = fs.readFileSync('expenses_screen.html', 'utf8');
const clientsContent = fs.readFileSync('clients_screen.html', 'utf8');

// Собираем все уникальные CSS правила
function getStyles(html) {
  const m = html.match(/<style>([\s\S]*?)<\/style>/i);
  return m ? m[1] : '';
}

// Извлекаем десктопное содержимое из каждого файла
// В main_screen: содержимое внутри .desktop-window > div (правая колонка с flex-direction: column)
// В income_screen: .desk-main-content
// В expenses_screen: .desk-main-content
// В clients_screen: .desk-main-content

console.log('Script template ready');
