# План стейджа: Окно «+ Новый проект» (Бумажный выбор клиента и удаление чекбокса) (v2)

## 1. Цели стейджа
1. **Выбор клиента из базы («Клиенты ♡»):**
   - Выпадающий список в модалке «+ Новый проект» должен наполняться всеми активными клиентами из `MyTablesClients.getActiveClients()`, `window.allData.clients`, локального хранилища и текущих проектов `projects`.
   - Клиент выбирается в один клик. По умолчанию выбран первый клиент из списка или плейсхолдер «Выберите клиента».
   - Если клиентов в базе нет, в триггере отображается «Сначала добавьте клиента во вкладке Клиенты ♡», а при клике «Сохранить» выводится понятная подсказка без создания пустого проекта.
2. **Отказ от нативного системного `<select>` и ликвидация синевы:**
   - Заменить нативный `<select>` на утверждённый проектом компонент `.custom-select`:
     * Фон плашки и выпадающего меню: тёплая бумага `#FAF2E7`.
     * Никаких рамок (`border: none !important`).
     * Мягкие 3D-тени бумаги (`box-shadow: 4px 10px 24px rgba(35, 30, 20, 0.18)`).
     * Канонические CSS-классы: `.custom-select`, `.custom-select-trigger`, `.custom-select-val`, `.custom-select-dropdown`, `.custom-select-option`.
     * Подсветка пунктов при наведении и выборе: нежный персик `#FCE8D5` (ноль системного синего цвета!).
     * Цвет текста: глубокий кофейно-шоколадный `#5B481D`.
3. **Полное удаление чекбокса «Отметить как оплаченный»:**
   - Чекбокс с черной рамкой `#inc-modal-paid-now` и его контейнер с датой платежа `#inc-modal-date-wrap` полностью удаляются из разметки и логики сохранения.
   - Платежи вносятся исключительно через кнопку `+` на карточке проекта, когда реальные деньги поступают на счёт.
4. **Сохранение и совместимость с тестами:**
   - Для считывания значения и сохранения 100% совместимости с существующими тестами `tests/stage3_income.test.js` в разметке используется скрытое поле:
     ```html
     <input type="hidden" id="inc-modal-client" class="inc-proj-client" value="">
     ```
   - При выборе пункта из `.custom-select-dropdown` скрытый инпут обновляет своё значение, а текст в `.custom-select-val` меняется на имя выбранного клиента.
5. **Сохранение золотого стандарта вёрстки:**
   - Модалка для десктопа и для телефона (390×844) проверяется тестом геометрии (`scrollWidth <= clientWidth`). Сенсорные зоны не менее 44px.

---

## 2. Архитектурные изменения

### 2.1. `app.js` (Функция `openAddProjectModal` и `ensureOverlay`)
- В функции получения списка клиентов:
  ```javascript
  function getAvailableClients() {
    var list = [];
    if (window.MyTablesClients && typeof window.MyTablesClients.getActiveClients === 'function') {
      window.MyTablesClients.getActiveClients().forEach(function (c) {
        var n = (c.name || c['Имя клиента'] || c['Имя'] || '').trim();
        if (n) list.push(n);
      });
    }
    if (window.allData && Array.isArray(window.allData.clients)) {
      window.allData.clients.forEach(function (c) {
        var n = (c.name || c['Имя клиента'] || c['Имя'] || '').trim();
        if (n) list.push(n);
      });
    }
    if (Array.isArray(projects)) {
      projects.forEach(function (p) {
        var n = (p.client || '').trim();
        if (n) list.push(n);
      });
    }
    return Array.from(new Set(list)).filter(Boolean);
  }
  ```
- В разметке модалки:
  * Заменить нативный `<select id="inc-modal-client-select">` на кастомный бумажный блок:
    ```html
    <div class="custom-select" id="inc-custom-client-select" style="width: 100%;">
      <input type="hidden" id="inc-modal-client" class="inc-proj-client" value="">
      <button type="button" class="custom-select-trigger" id="inc-client-trigger">
        <span class="custom-select-val">Выберите клиента</span>
        <span class="custom-select-arrow" style="font-size: 11px; opacity: 0.7;">▼</span>
      </button>
      <div class="custom-select-dropdown">
        <!-- Генерируемые пункты .custom-select-option -->
      </div>
    </div>
    ```
  * Удалить чекбокс `#inc-modal-paid-now` и блок `#inc-modal-date-wrap`.
- Локальная логика выпадающего списка:
  * Клик по `.custom-select-trigger` переключает класс `.open` на `#inc-custom-client-select`.
  * Клик по `.custom-select-option` записывает `data-value` в `#inc-modal-client`, обновляет текст в `.custom-select-val` и закрывает меню.
  * Глобальный клик вне модалки закрывает открытое меню.
- В обработчике сохранения:
  * Считывать выбранного клиента из `#inc-modal-client`.
  * Валидация: если клиент пуст, показать подсказку: «Пожалуйста, выберите клиента».

### 2.2. Стили (`index.html`)
- Использовать уже существующие утверждённые стили `.custom-select`, `.custom-select-trigger`, `.custom-select-val`, `.custom-select-dropdown`, `.custom-select-option` из `index.html` (строки 4917–4977).
- Убедиться, что `z-index` у `.custom-select-dropdown` внутри модалки достаточно высок, чтобы меню не перекрывалось соседними полями ввода.

---

## 3. Критерии приёмки (Definition of Done)
1. В окне «+ Новый проект» отображаются все клиенты Ани из вкладки «Клиенты ♡».
2. Выпадающий список оформлен в 3D-бумажном стиле (`#FAF2E7`, `#FCE8D5`), системный синий цвет полностью отсутствует.
3. Чёрный квадратный чекбокс `#inc-modal-paid-now` и сопутствующие даты полностью удалены из окна.
4. Новый проект успешно создается и отображается на экране Доходов с привязкой к выбранному клиенту.
5. Тесты `tests/stage3_income.test.js`, `tests/anya_audit_full_journey.test.js` и все тесты проекта зелёные (100% pass).
