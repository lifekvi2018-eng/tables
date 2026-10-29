# План стейджа: Исправление 7 замечаний аудита интерфейса и синхронизации (v2)

## 1. Цели стейджа
1. **Сохранение фиксированных сумм ежемесячных расходов:**
   - При клике «Оплатить» сумма расхода обязана сохранять своё реальное значение (Gemini: 1 200 ₽, GPT: 2 500 ₽, Интернет: 750 ₽, Телефон: 400 ₽, VPN: 400 ₽).
   - В Google Sheets отправлять реальную сумму, а не `0`.
   - На Главном экране карточка расходов и календарь должны корректно учитывать оплаченные и неоплаченные суммы месяца.
2. **Ликвидация задвоения знака рубля (`₽ ₽`):**
   - Убрать дублирующий знак `₽` в карточке проекта (бюджет проекта) и в плашках внесённых оплат (`app.js`, строки 574 и 602).
3. **Удаление дублирующего синего плюса:**
   - Удалить круглую кнопку `+` из шапки секции «Внесённые оплаты» (`app.js`, строка 619). Добавление оплаты остаётся только на карточке платежа.
4. **Устранение вылезания плашки даты:**
   - Добавить правила `box-sizing: border-box; width: 100%; max-width: 100%; min-width: 0; -webkit-appearance: none; appearance: none;` для инпута даты `#inc-pay-date` и контейнера `.golden-field-group` в `index.html` и `app.js`.
5. **Физическое удаление с единым окном подтверждения (без повторных диалогов):**
   - Добавить параметр `skipConfirm = false` в `MyTablesSync.deleteRecord(sheet, id, description, skipConfirm)`, чтобы исключить двойное подтверждение через нативный `confirm()`.
   - Создать единое модальное окно подтверждения удаления в 3D-бумажном стиле:
     * Заголовок: «Удаление»
     * Текст: «Вы действительно хотите удалить [клиента «Имя» / расход «Название» / платёж «Название» / проект «Название»]?»
     * Кнопка «Отмена» (`#FDF1CC`, текст `#5B481D`, без рамок)
     * Кнопка «Удалить» (`#FCD6CF`, текст `#6D1B1B`, без рамок)
   - Подключить окно подтверждения для всех 4 сущностей:
     * Клиенты: удаление из базы и вызов `deleteRecord('Клиенты', id, name, true)`.
     * Платежи доходов: удаление и вызов `deleteRecord('Доходы', id, desc, true)`.
     * Проекты доходов: каскадное удаление проекта и всех входящих в него платежей через `deleteRecord('Доходы', payId, desc, true)` (защита от «зомби-проектов»).
     * Расходы: замена кнопки `#exp-modal-archive` на полноценное физическое удаление с подтверждением и вызовом `deleteRecord('Расходы', id, desc, true)`.
6. **Окно «Изменить платёж» в Расходах:**
   - Полностью вырезать блок поля «Ссылка на сайт оплаты» (`#exp-in-url`) из разметки.
   - Очистить все обращения к элементу `exp-in-url` в `app.js` (строки 3550–3553, 3659 в `openAddExpenseModal`, 3715 и 3811 в `openEditExpenseModal`), предотвратив Runtime Crash.
   - Исправить логику считывания суммы: читать реальную сумму без ложного дефолта `|| 1500`.
7. **Перенос доходов на Главный экран:**
   - В `updateMainScreen` передавать и агрегировать платежи и проекты из модуля `MyTablesIncome` (обогащённые именами клиентов и проектов через `syncToMainScreen()`).
   - Убрать разрушительную очистку `projects = []; payments = [];` в `setIncomeFromSync` (строки 1153–1160) при пустом ответе сервера.
   - Вызывать `syncToMainScreen()` при создании и изменении проектов/платежей.

---

## 2. Архитектурные изменения по файлам

### 2.1. `sync.js`
- В `saveExpense(record)` (строка 773):
  ```javascript
  var amount = Number(record['Сумма'] || record.amount || record.currentRate || (record.rawItem && (record.rawItem['Сумма'] || record.rawItem.amount)) || 0);
  ```
- В `deleteRecord(sheet, id, description, skipConfirm)` (строка 960):
  ```javascript
  function deleteRecord(sheet, id, description, skipConfirm) {
    if (!isAuthenticated()) return Promise.reject(new Error('Требуется авторизация'));
    var proceed = skipConfirm ? Promise.resolve(true) : confirmDeleteDialog(description || id);
    return proceed.then(function(ok) {
      if (!ok) return { success: false, cancelled: true };
      // ... отправка запроса на удаление в Google Apps Script и очистка кэша ...
    });
  }
  ```

### 2.2. `calendar.js`
- В `normalizePayment(item, ...)` (строки 131–143):
  Гарантировать наличие полей `amount: rate` и `'Сумма': rate`.
- В строке 99:
  Убрать дефолт `'https://example.com'` -> `''`.

### 2.3. `app.js`
- **Строка 574:** убрать дублирование `formatRub(pay.amount) + ' ₽'` -> `formatRub(pay.amount)`.
- **Строка 602:** убрать дублирование `formatRub(p.totalCost) + ' ₽'` -> `formatRub(p.totalCost)`.
- **Строки 617–620:** удалить кнопку `.btn-add-payment` из `payments-section-header`.
- **Строки 957–965 (`openAddPaymentModal`):** добавить инлайновые стили `box-sizing: border-box; width: 100%; max-width: 100%; display: block;` для `#inc-pay-date`.
- **Строка 3121 (`toggleExpenseItemStatus`):**
  ```javascript
  p.amount = p.currentRate || p.amount;
  p['Сумма'] = p.currentRate || p['Сумма'];
  ```
- **Очистка ссылок на `exp-in-url` (строки 3550–3553, 3659, 3715, 3811):**
  * Удалить разметку `<div style="margin-bottom: 14px;"><label>Ссылка на сайт оплаты</label>...`.
  * В `openAddExpenseModal` (строка 3659) удалить `document.getElementById('exp-in-url').value = '';`.
  * В `openEditExpenseModal` (строка 3715) удалить установку значения `document.getElementById('exp-in-url')`.
  * В сохранении расхода (строка 3811) удалить чтение `document.getElementById('exp-in-url')`.
  * Исправить дефолт `1500` на чтение `p.currentRate || p.amount`.
- **Единое окно подтверждения удаления (`showConfirmDeleteModal`):**
  * Создаёт/открывает модалку `#mytables-confirm-delete-modal` с 3D-бумажным фоном `#FAF2E7`.
  * Клиенты: переключить клик корзины и кнопку в меню архива на `showConfirmDeleteModal` -> физическое удаление через `deleteClient(id)`.
  * Платежи доходов: при удалении платежа показывать `showConfirmDeleteModal` -> `deletePayment(id)`.
  * Проекты доходов: при удалении проекта показывать `showConfirmDeleteModal` -> каскадное удаление проекта и всех его оплат из Таблицы.
  * Расходы: кнопка `#exp-modal-archive` вызывает `showConfirmDeleteModal` -> удаление из `payments` и `MyTablesSync.deleteRecord('Расходы', p.id, p.name, true)`.
- **Главный экран и доходы (`updateMainScreen`, `setIncomeFromSync`):**
  * В `updateMainScreen` вызывать обогащение локальными доходами:
    ```javascript
    if ((!data.income || data.income.length === 0) && window.MyTablesIncome && typeof window.MyTablesIncome.getPayments === 'function') {
      var pays = window.MyTablesIncome.getPayments();
      var projs = window.MyTablesIncome.getProjects();
      data.income = pays.map(function(p) {
        var proj = projs.find(function(pr) { return pr.id === p.projectId; });
        return {
          ID: p.id,
          id: p.id,
          'Дата': p.date,
          'Сумма': p.amount,
          'Клиент / Источник': proj ? proj.client : '',
          'Проект / Услуга': proj ? proj.project : '',
          'Заметка': p.note || ''
        };
      });
    }
    ```
  * В `setIncomeFromSync` (строки 1153–1160) удалить очистку `projects = []; payments = []; persist();`.
  * В `addProject`, `updateProjectCost`, `deletePayment` вызывать `syncToMainScreen()`.

### 2.4. `index.html`
- Стили инпута даты:
  ```css
  .golden-field-group { width: 100%; box-sizing: border-box; min-width: 0; }
  input[type="date"].golden-field-input, .inc-pay-date {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    display: block !important;
    min-width: 0 !important;
    -webkit-appearance: none;
    appearance: none;
  }
  ```
- Стили модалки подтверждения удаления: `#mytables-confirm-delete-modal`, фон `#FAF2E7`, радиус 24px, 3D тени, без рамок.

### 2.5. Скрипт восстановления данных (`.scratch/restore_expenses.js`)
- Проверить текущее состояние листа «Расходы» в Google Таблице. Если какие-то строки были сохранены с суммой `0`, перезаписать каноническими суммами Ани (Gemini 1200 ₽, GPT 2500 ₽, Интернет 750 ₽, Телефон 400 ₽, VPN компьютер 400 ₽, VPN на телефон 300 ₽).

---

## 3. Критерии приёмки (Definition of Done)
1. При отметке расхода как оплаченного сумма не сбрасывается в 0 ₽, в Google Sheets сохраняется реальная цифра.
2. В карточках проектов и внесенных оплат отображается строго один символ `₽`.
3. В шапке «Внесённые оплаты» нет лишнего синего плюса.
4. Плашка выбора даты в модалке «Внести платёж» ровно укладывается в границы персиковой карточки на iPhone 390×844 (0 px вылезания).
5. При нажатии «Удалить» в разделах Клиенты, Расходы и Доходы открывается одно красивое окно с вопросом «Вы действительно хотите удалить?» с кнопками «Отмена» и «Удалить». Никаких системных confirm или двойных всплывающих окон.
6. В окне добавления и редактирования расхода отсутствует поле ссылки на сайт оплаты, нет ошибок в консоли, а сумма отображает реальное значение вместо 1500.
7. Доходы (проекты и оплаты) отображаются на Главном экране в сводке и карточках.
8. Все 12 тестовых сьютов проекта и регрессионный щит Ани проходят со 100% успехом (0 ошибок).
