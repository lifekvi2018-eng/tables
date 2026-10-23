const fs = require('fs');

// Читаем 4 файла экранов
const mainHtml = fs.readFileSync('main_screen.html', 'utf8');
const incomeHtml = fs.readFileSync('income_screen.html', 'utf8');
const expensesHtml = fs.readFileSync('expenses_screen.html', 'utf8');
const clientsHtml = fs.readFileSync('clients_screen.html', 'utf8');

// Извлекаем CSS стили из каждого файла
function extractStyle(html) {
  const m = html.match(/<style>([\s\S]*?)<\/style>/i);
  return m ? m[1] : '';
}

const mainCss = extractStyle(mainHtml);
const incomeCss = extractStyle(incomeHtml);
const expensesCss = extractStyle(expensesHtml);
const clientsCss = extractStyle(clientsHtml);

console.log('Styles extracted');
