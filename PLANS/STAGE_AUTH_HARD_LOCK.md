# План стейджа: Железный замок авторизации (только для Ани) и изоляция данных (v3)

## 1. Цели стейджа
1. **Железный экран блокировки (Hard Lock Screen):**
   - Экран блокировки вшит прямо в статическую разметку `index.html` и активен с нулевой миллисекунды.
   - Быстрый синхронный скрипт в `<head>` проверяет сессию: если валидной сессии `lifekvi2018@gmail.com` нет, оверлей остаётся на 100% экрана, а корневые контейнеры `#desktop-app` и `#mobile-app` получают атрибуты `inert` и `aria-hidden="true"`. Если валидная сессия есть — скрипт мгновенно ставит класс `mytables-authed` и скрывает оверлей без мигания (FOUC).
   - Без авторизации ни один экран (Главная, Расходы, Доходы, Клиенты) и ни одна цифра не видны.
   - Запрещён любой гостевой режим или показ шаблонов.
2. **Строгий белый список (Whitelist) и полное удаление обходов:**
   - Доступ разрешён **строго и только** для аккаунта `lifekvi2018@gmail.com` с `email_verified === true`.
   - Любой другой Google-аккаунт получает отказ: «Доступ ограничен. Это личное приложение Ани».
   - Объект сессии при входе через Google обязательно содержит `{ authorized: true, email: cleanEmail, name: ..., expiresAt: ... }`.
   - Полное удаление функции `performDirectGoogleLogin()` и любых автоматических обходов при сбое One Tap. Вход происходит исключительно по прямому клику на кнопку «Войти через Google».
3. **Защита методов синхронизации:**
   - Все методы (`getAllData`, `saveExpense`, `saveIncome`, `saveClient`, `deleteRecord`) блокируются при `!isAuthenticated()`.
4. **Сквозная изоляция автоматических тестов:**
   - В `sync.js` добавлен аппаратный предохранитель в `fetchWithTimeout`: в среде Node.js (`typeof window === 'undefined'`) сетевые запросы к `CONFIG.SCRIPT_URL` заблокированы по умолчанию (если тест не задал собственный `mockFetchHandler`), исключая случайный трафик в живую Google Таблицу Ани.
5. **Безопасная очистка Google Таблицы от мусора и дублей:**
   - Скрипт `.scratch/cleanup_sheets.js` делает полный бэкап данных в `.scratch/backup_expenses.json`.
   - Очищает лист «Расходы» от дубликатов, нулевых клонов и строки `test_123`.
   - В листе остаётся ровно 6 утверждённых позиций Ани с контрольной суммой **5 550 ₽**:
     * Gemini: 1 200 ₽
     * GPT: 2 500 ₽
     * Домашний интернет: 750 ₽
     * Телефон: 400 ₽
     * VPN компьютер: 400 ₽
     * VPN на телефон: 300 ₽

---

## 2. Архитектурные изменения

### 2.1. `index.html`
- Встроить оверлей `#mytables-auth-gate` прямо в тело документа перед основными экранами.
- Стили оверлея по умолчанию: `display: flex; position: fixed; inset: 0; z-index: 20000; background: #FAF2E7;`.
- Inline guard в `<head>`:
  ```html
  <script>
    try {
      var raw = localStorage.getItem('my_tables_auth_user') || sessionStorage.getItem('my_tables_auth_user');
      if (raw) {
        var u = JSON.parse(raw);
        if (u && u.authorized && u.email && u.email.toLowerCase() === 'lifekvi2018@gmail.com' && u.expiresAt > Date.now()) {
          document.documentElement.classList.add('mytables-authed');
        }
      }
    } catch(e) {}
  </script>
  ```
- CSS-правило: `.mytables-authed #mytables-auth-gate { display: none !important; }`.
- Инициализация `inert`: если класс `mytables-authed` отсутствует, `#desktop-app` и `#mobile-app` получают атрибуты `inert` и `aria-hidden="true"`.

### 2.2. `sync.js`
- В `injectStylesAndMarkup()`:
  * Если `#mytables-auth-gate` уже присутствует в DOM (из `index.html`), пропускается *только генерация HTML-разметки оверлея*.
  * Обязательно навешиваются обработчики событий (клик по кнопке входа, чекбокс запоминания) и вызывается `initGoogleIdentity()`.
- Полностью удалить функцию `performDirectGoogleLogin()`.
- В `initGoogleIdentity()`: при `isNotDisplayed()` / `isSkippedMoment()` не производить авто-входа, оставлять экран входа открытым.
- В `handleGoogleCredentialResponse()`:
  * Декодировать JWT токен.
  * Проверить `payload.email && payload.email.toLowerCase() === 'lifekvi2018@gmail.com' && payload.email_verified === true`.
  * При несоответствии: показать текст ошибки «Доступ ограничен. Это личное приложение Ани», очистить сессию, заблокировать интерфейс.
  * При успехе: сохранить сессию `{ authorized: true, email: 'lifekvi2018@gmail.com', name: 'Аня', expiresAt: ... }` на 30 дней.
  * Снять `inert` с `#desktop-app` и `#mobile-app`, скрыть оверлей, отправить событие `window.dispatchEvent(new CustomEvent('mytables:auth-success', { detail: user }))`.
- При `logout()`:
  * Удалить сессию из storage.
  * Повесить `inert` и `aria-hidden="true"` на `#desktop-app` и `#mobile-app`.
  * Показать `#mytables-auth-gate`.
- Во всех методах (`getAllData`, `saveExpense`, `saveIncome`, `saveClient`, `deleteRecord`):
  ```javascript
  if (!isAuthenticated()) {
    return Promise.reject(new Error('Требуется авторизация'));
  }
  ```
- Node.js guard в `fetchWithTimeout`: если `typeof window === 'undefined' && !mockFetchHandler && !process.env.LIVE_GOOGLE_SHEETS`, отклонять сетевой запрос к live Google Apps Script.

### 2.3. `app.js`
- На `DOMContentLoaded`:
  * Всегда инициализировать UI: `injectAddModal()`, `bindAddButtons()`, `bindLogoutButtons()`, регистрация слушателя `mytables:auth-success`.
  * Заменить старый `window.onAuthSuccess` на слушатель `window.addEventListener('mytables:auth-success', function() { loadLiveData(); });`.
  * Только первичный запуск `loadLiveData()` обернуть в guard:
    ```javascript
    if (window.MyTablesSync && window.MyTablesSync.isAuthenticated()) {
      loadLiveData();
    }
    ```
- Логика Logout: при нажатии «Выйти» очистить локальные массивы данных в DOM, сбросить экран входа, заблокировать интерфейс.

### 2.4. Тесты (`tests/`)
- Добавить тесты на проверку:
  * Статический замок активен без сессии.
  * Корневые контейнеры имеют `inert` без сессии.
  * Попытка входа с email `other@gmail.com` отклоняется.
  * Все методы синхронизации отклоняют запросы без авторизации.
  * Прогон всех тестов не выполняет ни одного несанкционированного вызова к `script.google.com`.

### 2.5. Скрипт очистки Google Таблицы (`.scratch/cleanup_sheets.js`)
- Шаг 1: `GET` запрос к `CONFIG.SCRIPT_URL`, сохранение сырых данных в `.scratch/backup_expenses.json`.
- Шаг 2: Формирование чистого массива из 6 эталонных строк:
  1. `Gemini` (ai, 1 200 ₽, 1 число, Т-Банк)
  2. `GPT` (ai, 2 500 ₽, 1 число, Т-Банк)
  3. `Домашний интернет` (internet, 750 ₽, 21 число, Т-Банк)
  4. `Телефон` (internet, 400 ₽, 1 число, Т-Банк)
  5. `VPN компьютер` (vpn, 400 ₽, 23 число, Т-Банк)
  6. `VPN на телефон` (vpn, 300 ₽, 26 число, Т-Банк)
- Шаг 3: Перезапись/очистка листа «Расходы» в Google Таблице через Apps Script.
- Шаг 4: Проверочный `GET` — контроль количества строк (строго 6) и суммы (строго 5 550 ₽).

---

## 3. Критерии приемки (Definition of Done)
1. В чистом браузере / Инкогнито при открытии `index.html` интерфейс на 100% перекрыт экраном входа, ни одна таблица не видна.
2. Контейнеры `#desktop-app` и `#mobile-app` имеют `inert` и не реагируют на клики/Tab до авторизации.
3. Отсутствие FOUC: при открытии страницы уже авторизованной Аней замок не моргает.
4. Вход под чужим Google-аккаунтам невозможен (отказ в доступе).
5. Вход под `lifekvi2018@gmail.com` успешно открывает таблицы и подтягивает настоящие суммы.
6. В Google Таблице в листе «Расходы» ровно 6 строк, сумма ровно 5 550 ₽. Запись `test_123` и нулевые строки полностью отсутствуют.
7. При нажатии «Выйти» локальная сессия удаляется, данные на экране очищаются, оверлей немедленно блокирует весь экран.
8. При прогоне полного набора тестов в сеть не уходит ни один сетевой запрос к `script.google.com`.
9. Все тесты проекта зелёные (100% pass).
