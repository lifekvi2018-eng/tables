/**
 * ============================================================================
 * ПРОЕКТ «МОИ ТАБЛИЦЫ» — БЕЗОПАСНЫЙ МОСТИК ДЛЯ GOOGLE ТАБЛИЦ
 * ============================================================================
 * Этот скрипт работает внутри вашего личного Google-аккаунта.
 * Он создает структуру из 4 вкладок и позволяет вашему приложению
 * безопасно читать и сохранять данные.
 */

// 1. ПЕРВИЧНАЯ НАСТРОЙКА ТАБЛИЦЫ (Запустите один раз)
function initialSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Создаем или получаем 4 вкладки
  var sheetMain = getOrCreateSheet(ss, 'Главная');
  var sheetIncome = getOrCreateSheet(ss, 'Доходы');
  var sheetExpenses = getOrCreateSheet(ss, 'Расходы');
  var sheetClients = getOrCreateSheet(ss, 'Клиенты');
  
  // Удаляем стандартный "Лист 1", если он пустой и есть другие листы
  var firstSheet = ss.getSheetByName('Лист 1') || ss.getSheetByName('Sheet1');
  if (firstSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(firstSheet); } catch(e) {}
  }
  
  // --- 1. ВКЛАДКА «ГЛАВНАЯ» ---
  sheetMain.clear();
  var mainHeaders = [['Показатель', 'Значение', 'Пояснение / Цель']];
  var mainData = [
    ['Общий баланс', 245000, 'Текущий остаток'],
    ['Доходы за месяц', 185000, 'Всего поступило'],
    ['Расходы за месяц', 68500, 'Всего потрачено'],
    ['Копилка: На море', 65000, 'Цель: 150 000 ₽'],
    ['Копилка: Подушка безопасности', 120000, 'Цель: 200 000 ₽'],
    ['Копилка: Новый айфон', 40000, 'Цель: 100 000 ₽']
  ];
  sheetMain.getRange(1, 1, 1, 3).setValues(mainHeaders);
  sheetMain.getRange(2, 1, mainData.length, 3).setValues(mainData);
  formatHeader(sheetMain, 3, '#FDF3E7'); // нежно-персиковый
  
  // --- 2. ВКЛАДКА «ДОХОДЫ» ---
  sheetIncome.clear();
  var incomeHeaders = [['ID', 'Дата', 'Клиент / Источник', 'Проект / Услуга', 'Категория', 'Сумма', 'Статус', 'Заметка']];
  var incomeData = [
    ['inc_1', '2026-10-22', 'Анна Смирнова', 'Дизайн кухни (18м²)', 'Дизайн', 60000, 'Оплачено', 'Второй этап'],
    ['inc_2', '2026-10-20', 'Михаил Ковалев', 'Сайт для кофейни', 'Сайты', 45000, 'Оплачено', 'Предоплата 50%'],
    ['inc_3', '2026-10-18', 'Елена Морозова', 'Консультация по стилю', 'Консультации', 15000, 'Оплачено', 'Разовая сессия'],
    ['inc_4', '2026-10-15', 'Пассивный доход', 'Выплата дивидендов', 'Инвестиции', 25000, 'Оплачено', 'Т-Банк Инвестиции'],
    ['inc_5', '2026-10-10', 'Артем Васильев', 'Логотип и айдентика', 'Дизайн', 40000, 'Оплачено', 'Финальный расчет']
  ];
  sheetIncome.getRange(1, 1, 1, 8).setValues(incomeHeaders);
  sheetIncome.getRange(2, 1, incomeData.length, 8).setValues(incomeData);
  formatHeader(sheetIncome, 8, '#EAF5EE'); // нежно-мятный
  
  // --- 3. ВКЛАДКА «РАСХОДЫ» ---
  sheetExpenses.clear();
  var expensesHeaders = [['ID', 'Дата', 'Название / Где', 'Категория', 'Сумма', 'Кошелек / Карта', 'Заметка']];
  var expensesData = [
    ['exp_1', '2026-10-22', 'ВкусВилл', 'Продукты', 3450, 'Т-Банк', 'Продукты на неделю'],
    ['exp_2', '2026-10-22', 'Кофейня Surf', 'Кафе', 650, 'Т-Банк', 'Раф и круассан'],
    ['exp_3', '2026-10-21', 'Яндекс Заправки', 'Авто', 2800, 'Т-Банк', 'Полный бак'],
    ['exp_4', '2026-10-19', 'Золотое Яблоко', 'Красота', 5200, 'Т-Банк', 'Уход и крем'],
    ['exp_5', '2026-10-17', 'Подписка Яндекс Плюс', 'Подписки', 299, 'Карта', 'Ежемесячно']
  ];
  sheetExpenses.getRange(1, 1, 1, 7).setValues(expensesHeaders);
  sheetExpenses.getRange(2, 1, expensesData.length, 7).setValues(expensesData);
  formatHeader(sheetExpenses, 7, '#FFF2EE'); // нежно-розовый
  
  // --- 4. ВКЛАДКА «КЛИЕНТЫ» ---
  sheetClients.clear();
  var clientsHeaders = [['ID', 'Имя клиента', 'Телефон / Контакт', 'Проект', 'Цвет', 'Статус', 'Бюджет', 'Оплачено', 'Ссылка на материалы', 'Заметки']];
  var clientsData = [
    ['cli_1', 'Анна Смирнова', '+7 916 123-45-67', 'Дизайн интерьера кухни 18м²', 'mint', 'В работе', 120000, 60000, 'https://drive.google.com/...', 'Любит минимализм и дерево. Сдача 15 ноября.'],
    ['cli_2', 'Михаил Ковалев', '+7 926 789-01-23', 'Редизайн сайта кофейни', 'peach', 'В работе', 90000, 45000, '', 'Ждем фотосъемку десертов.'],
    ['cli_3', 'Елена Морозова', '+7 903 456-78-90', 'Гардеробная капсула', 'lavender', 'Завершен', 30000, 30000, '', 'Проект сдан, отзыв получен ♡'],
    ['cli_4', 'Артем Васильев', '+7 915 234-56-78', 'Брендбук и упаковка', 'sky', 'Обсуждение', 80000, 0, '', 'Согласовываем мудборд во вторник.']
  ];
  sheetClients.getRange(1, 1, 1, 10).setValues(clientsHeaders);
  sheetClients.getRange(2, 1, clientsData.length, 10).setValues(clientsData);
  formatHeader(sheetClients, 10, '#F2EEFA'); // нежно-лавандовый
  
  SpreadsheetApp.flush();
  Logger.log('Настройка успешно завершена! Все 4 вкладки созданы.');
}

// 2. ОБРАБОТЧИК ЗАПРОСОВ (ЧТЕНИЕ ДАННЫХ)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) || 'getAll';
    
    var data = {
      summary: getRows(ss.getSheetByName('Главная')),
      income: getRows(ss.getSheetByName('Доходы')),
      expenses: getRows(ss.getSheetByName('Расходы')),
      clients: getRows(ss.getSheetByName('Клиенты'))
    };
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 3. ОБРАБОТЧИК ЗАПИСИ (ДОБАВЛЕНИЕ, ОБНОВЛЕНИЕ, УДАЛЕНИЕ СТРОК)
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var postData = JSON.parse(e.postData.contents);
    var targetSheetName = postData.sheet; // 'Доходы', 'Расходы' или 'Клиенты'
    var action = postData.action || 'append';
    
    var sheet = ss.getSheetByName(targetSheetName);
    if (!sheet) {
      throw new Error('Вкладка ' + targetSheetName + ' не найдена.');
    }
    
    // Удаление записи по ID
    if (action === 'delete') {
      var idToDelete = String(postData.id || '');
      var data = sheet.getDataRange().getValues();
      var deleted = false;
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === idToDelete) {
          sheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: deleted,
        message: deleted ? 'Запись успешно удалена из ' + targetSheetName : 'Запись с ID ' + idToDelete + ' не найдена'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Обновление существующей записи по ID
    if (action === 'update') {
      var idToUpdate = String(postData.id || (postData.row && postData.row[0]) || '');
      var newRowData = postData.row;
      var dataValues = sheet.getDataRange().getValues();
      var updated = false;
      for (var j = 1; j < dataValues.length; j++) {
        if (String(dataValues[j][0]) === idToUpdate) {
          sheet.getRange(j + 1, 1, 1, newRowData.length).setValues([newRowData]);
          updated = true;
          break;
        }
      }
      if (!updated && newRowData) {
        sheet.appendRow(newRowData);
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: updated ? 'Запись успешно обновлена в ' + targetSheetName : 'Запись создана'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Стандартное добавление строки
    var rowData = postData.row;
    if (!rowData || !Array.isArray(rowData)) {
      throw new Error('Массив row не передан.');
    }
    
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Запись успешно сохранена в ' + targetSheetName
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function formatHeader(sheet, cols, bgColor) {
  var headerRange = sheet.getRange(1, 1, 1, cols);
  headerRange.setBackground(bgColor);
  headerRange.setFontWeight('bold');
  headerRange.setFontColor('#2D312E');
  sheet.setFrozenRows(1);
  for (var i = 1; i <= cols; i++) {
    sheet.autoResizeColumn(i);
  }
}

function getRows(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var headers = data[0];
  var rows = [];
  
  for (var i = 1; i < data.length; i++) {
    var rowObj = {};
    for (var j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = data[i][j];
    }
    rows.push(rowObj);
  }
  return rows;
}
