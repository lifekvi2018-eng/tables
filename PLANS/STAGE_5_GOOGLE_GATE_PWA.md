# ИНЖЕНЕРНЫЙ ПЛАН СТЕЙДЖА 5: GOOGLE GATE & PWA
# Проект: «Мои таблицы ♡»
**Стейдж:** 5 из 5 (Финальный)  
**Версия:** 2.0 (после Plan Review v3, Раунд 1 — устранены блокер DEF-5.1 и замечания DEF-5.2–DEF-5.7)  
**Статус:** Готово к повторному независимому Plan Review v3 (Раунд 2, уровни 1–3)  
**Цель:** Завершить финальный этап проекта «Мои таблицы ♡»: реализовать надежную систему авторизации Google Gate, ограниченную строго аккаунтом владелицы `lifekvi2018@gmail.com`, адаптивное разделение сессий (30 дней для ПК и установленного PWA, сессионная защита для мобильных браузерных вкладок), честную двустороннюю синхронизацию с 4 листами Google Таблиц через Google Apps Script, легковесный автономный Service Worker (только статический App Shell и шрифты, прямой пропуск запросов Google Sheets), чистку стилей `sync.js` от рамок по Золотому стандарту Ани, набор TDD-тестов для чистого Node.js и сдачу проекта под ключ.

---

## 1. ЦЕЛИ И АРХИТЕКТУРА СТЕЙДЖА 5

### 1.1. Что входит в Стейдж 5:

1. **Google Gate Авторизация (Строго для `lifekvi2018@gmail.com`):**
   - Безопасный шлюз авторизации: вход разрешен исключительно для `lifekvi2018@gmail.com`.
   - При попытке ввода любого другого email отображается понятное и вежливое предупреждение: *«Доступ ограничен. Это личное приложение только для lifekvi2018@gmail.com»*.
   - **Адаптивное разделение сессий (DEF-5.2):**
     * **Компьютер (десктоп, ширина экрана > 768px):** долгоживущая сессия до 30 дней в `localStorage`;
     * **Установленное PWA на телефоне (standalone-режим):** долгоживущая сессия до 30 дней в `localStorage` (комфортная работа с ярлыка как с нативным приложением);
     * **Обычная вкладка мобильного браузера (Safari/Chrome по внешней ссылке):** сессия в `sessionStorage`, требующая подтверждения при открытии в новой вкладке per `STAGES.md`;
   - **Автоинвалидация сессии при истечении срока (DEF-5.3):**
     * В метод `isAuthenticated()` встроена автоматическая проверка:
       ```javascript
       if (user && user.expiresAt && Date.now() > user.expiresAt) {
         logout();
         return false;
       }
       ```
     * При истечении 30 дней сессия аккуратно сбрасывается и отображается приветственное окно авторизации;
   - **Безопасный адаптер хранилища (DEF-5.3):**
     * Если `localStorage` недоступен (приватный режим, куки заблокированы, среда Node.js), адаптер безопасно и без ошибок падения откатывается на `sessionStorage` или in-memory объект.
   - **Окно входа (Google Gate Modal) строго по Золотому стандарту Ани (DEF-5.6):**
     * Тёплый бумажный фон `#FAF2E7`, радиус 24px, глубокая мягкая тень, **полное отсутствие любых рамок (`border: none`)**;
     * Внутренняя плашка: тёплый персик `#FCE8D5` (или сливки `#FDF1CC`), радиус 18px, мягкая тень, без рамок;
     * Поле ввода email: тёплая бумага `#FAF2E7`, мягкая внутренняя тень, `border: none`, радиус 14px;
     * Кнопка действия «Войти как Аня»: нежная мята `#C8E2D2`, текст `#1E3F30` (полный запрет чисто белого текста `#FFFFFF`!), высота $\ge 44\text{px}$;
     * Отображение текущего пользователя в чипе бокового меню (имя «Аня», email `lifekvi2018@gmail.com`, аватар «А»);
     * Кнопка «Выйти» для безопасного завершения сессии.

2. **Двусторонняя синхронизация с Google Таблицами (4 листа):**
   - Прямой коннектор к Google Apps Script Web App:
     `https://script.google.com/macros/s/AKfycbzU_3g5bISD-PKzCHuzk2kqc4hosbruIXd5r5dXPFYkJLqpYG9oxEZwG80zB2opjWI7/exec`
   - Поддержка всех 4 рабочих листов:
     * **Лист «Главная»:** сводные показатели месяца;
     * **Лист «Доходы»:** проектные транзакции, суммы, даты, клиенты;
     * **Лист «Расходы»:** подписки и регулярные платежи, автосброс 1-го числа;
     * **Лист «Клиенты»:** клиенты, 4 статуса, телефоны с защитой экранирования `'+7...` от формульной ошибки `#ERROR!`.
   - **Четкое разделение ответственности с Service Worker (DEF-5.1):**
     * Все запросы к `script.google.com` (как `GET`, так и `POST`) выполняются напрямую через сеть модулем `sync.js`. Service Worker **не вмешивается** в трафик Google Apps Script и не пытается обращаться к несуществующему в воркере `localStorage`;
     * При сбое сети или отсутствии интернета модуль `sync.js` в потоке страницы честно и безопасно достает последние сохраненные данные из `storage.get(CONFIG.CACHE_STORAGE_KEY)` и информирует Аню бумажным бейджем;
   - **Очистка стилей бейджа синхронизации (DEF-5.6):**
     * Полное удаление рамок (`border: none`) из всех 4 статусов бейджа (`.status-idle`, `.status-saving`, `.status-saved`, `.status-error`);
     * Объём бейджа задаётся исключительно фирменной 3D-тенью `box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08)`.

3. **PWA (Progressive Web App) и офлайн-режим:**
   - **Манифест приложения (`manifest.json`):**
     * Имя: `Мои таблицы ♡`, короткое имя: `Таблицы ♡`;
     * Режим отображения: `standalone` (полноэкранный режим без адресной строки);
     * Цвета: `background_color: "#FAF2E7"`, `theme_color: "#FAF2E7"`;
     * Иконки: `./icons/icon-192.png` и `./icons/icon-512.png` (а также `./icons/icon.svg`).
   - **Генерация иконок без npm-зависимостей (DEF-5.5):**
     * Создается скрипт `scripts/generate_pwa_icons.js`, генерирующий физические PNG-файлы (192×192 и 512×512) стандартными средствами Node.js (`zlib` + PNG chunk writer) с фирменным символом сердца ♡ и цветом теплой бумаги `#FAF2E7`;
     * Все иконки физически присутствуют в репозитории в папке `icons/`, исключая ошибку 404 при кэшировании.
   - **Service Worker (`sw.js`) и кэширование App Shell (DEF-5.1, DEF-5.4):**
     * Имя кэша: `mytables-app-shell-v1`;
     * Список предкэшируемых статических ресурсов (`PRECACHE_ASSETS`):
       ```javascript
       const PRECACHE_ASSETS = [
         './',
         './index.html',
         './app.js',
         './calendar.js',
         './sync.js',
         './manifest.json',
         './icons/icon-192.png',
         './icons/icon-512.png',
         './icons/icon.svg'
       ];
       ```
     * **Логика перехвата (`fetch`):**
       1. Если домен запроса содержит `script.google.com` $\rightarrow$ немедленный возврат (`return;`), браузер обрабатывает запрос напрямую через сеть;
       2. Для внешних шрифтов (fonts.googleapis.com, fonts.gstatic.com) $\rightarrow$ Cache-First с долгим хранением;
       3. Для локального App Shell $\rightarrow$ Stale-While-Revalidate (мгновенная отдача из кэша + тихое обновление в фоне).

4. **Интеграция в `index.html`:**
   - Подключение `manifest.json`, метатегов `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`;
   - Регистрация Service Worker при наступлении события `'load'`;
   - Инициализация модуля `MyTablesSync.init()` при старте приложения.

---

### 1.2. Что НЕ входит в Стейдж 5 (границы изоляции и Scope Lock):
- Изменение верстки, логики или дизайна экранов Стейджей 1–4 («Главная», «Расходы», «Доходы», «Клиенты»);
- Авторизация через сторонние сервисы (VK, Telegram, Яндекс) — вход строго через персональный Google Gate `lifekvi2018@gmail.com`;
- Сложные бэкенд-сервера или базы данных — хранилищем остаются Google Таблицы.

---

## 2. АЛГОРИТМ РАЗДЕЛЕНИЯ СЕССИЙ И СТРУКТУРА ХРАНЕНИЯ

### 2.1. Определение типа устройства и выбор адаптера (DEF-5.2)

```javascript
function getAuthStorage() {
  if (typeof window === 'undefined') {
    // Безопасный fallback для Node.js окружения тестов
    return {
      getItem: function() { return null; },
      setItem: function() {},
      removeItem: function() {}
    };
  }

  // Проверка standalone-режима (PWA на телефоне или ПК)
  var isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  var isIOSStandalone = window.navigator && window.navigator.standalone === true;
  // Десктоп (ширина экрана более 768px)
  var isDesktop = window.innerWidth > 768;

  // Долгоживущая сессия (30 дней) — для Десктопа и установленного PWA:
  var usePersistentStorage = isDesktop || isStandalone || isIOSStandalone;

  if (usePersistentStorage) {
    try {
      if (window.localStorage) return window.localStorage;
    } catch (e) {
      console.warn('localStorage недоступен, откат на sessionStorage:', e);
    }
  }

  // Для обычных вкладок мобильного браузера — сессионная защита
  try {
    if (window.sessionStorage) return window.sessionStorage;
  } catch (e) {
    console.warn('sessionStorage недоступен:', e);
  }

  return {
    getItem: function() { return null; },
    setItem: function() {},
    removeItem: function() {}
  };
}
```

### 2.2. Структура объекта пользователя и автоинвалидация (DEF-5.3)

```javascript
var SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 дней в миллисекундах

function login(email) {
  var cleanEmail = (email || '').trim().toLowerCase();
  if (cleanEmail === CONFIG.AUTHORIZED_EMAIL.toLowerCase()) {
    var now = Date.now();
    var user = {
      authorized: true,
      email: cleanEmail,
      name: 'Аня',
      avatar: 'А',
      loginTime: now,
      expiresAt: now + SESSION_TTL_MS
    };
    var storageAdapter = getAuthStorage();
    storageAdapter.setItem(CONFIG.AUTH_STORAGE_KEY, JSON.stringify(user));
    hideAuthModal();
    return { success: true, user: user };
  } else {
    return {
      success: false,
      error: 'Доступ ограничен. Это личное приложение только для ' + CONFIG.AUTHORIZED_EMAIL
    };
  }
}

function isAuthenticated() {
  var storageAdapter = getAuthStorage();
  var raw = storageAdapter.getItem(CONFIG.AUTH_STORAGE_KEY);
  if (!raw) return false;
  try {
    var user = JSON.parse(raw);
    if (!user || !user.authorized || user.email !== CONFIG.AUTHORIZED_EMAIL) {
      return false;
    }
    // Проверка истечения 30 дней
    if (user.expiresAt && Date.now() > user.expiresAt) {
      logout();
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}
```

---

## 3. АРХИТЕКТУРА PWA, КЭШИРОВАНИЯ И ИЗОЛЯЦИИ СЕТИ

### 3.1. Структура Service Worker (`sw.js`) (DEF-5.1, DEF-5.4)

```javascript
const CACHE_NAME = 'mytables-app-shell-v1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './app.js',
  './calendar.js',
  './sync.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ЖЕЛЕЗНОЕ ПРАВИЛО: Service Worker НЕ перехватывает запросы к Google Apps Script
  if (url.hostname.includes('script.google.com')) {
    return; // Запрос проходит напрямую в сеть
  }

  // Шрифты Google Fonts: Cache-First
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        });
      })
    );
    return;
  }

  // App Shell и локальные ресурсы: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return networkResponse;
        })
        .catch(() => cached); // При сбое сети отдаем из кэша

      return cached || fetchPromise;
    })
  );
});
```

---

## 4. ИНВЕНТАРИЗАЦИЯ И ЧИСТКА СТИЛЕЙ ПО ЗОЛОТОМУ СТАНДАРТУ АНИ (DEF-5.6)

В файле `sync.js` (строки 690–825) производятся точечные исправления:

1. **Бейдж синхронизации:**
   - Удалить `border: 1.5px solid #C8E2D2`, `#DCEEFE`, `#FCD6CF`, `#EADBCC`.
   - Заменить на `border: none; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);`.
2. **Карточка модалки входа (`.mytables-auth-card`):**
   - Удалить `border: 3px solid #EADBCC;`.
   - Заменить на `border: none; background: #FAF2E7; border-radius: 24px; box-shadow: 0 12px 36px rgba(140, 115, 85, 0.22);`.
3. **Поле ввода email (`.auth-email-input`):**
   - Удалить `border: 2px solid #EADBCC;`.
   - Заменить на `border: none; background: #FAF2E7; box-shadow: inset 1px 1.5px 3px rgba(35, 30, 20, 0.08); border-radius: 14px; color: #2D251E;`.
4. **Кнопка входа (`.auth-login-btn`):**
   - Удалить `color: #FFFFFF;` и `border: none;`.
   - Заменить на `background: #C8E2D2; color: #1E3F30; border: none; font-weight: 700; border-radius: 14px; box-shadow: 0 3px 8px rgba(45, 156, 94, 0.2); min-height: 44px;`.
5. **Блок ошибки (`.auth-error-box`):**
   - Удалить `border: 1.5px solid #FCD6CF;`.
   - Заменить на `border: none; background: #FCD6CF; color: #58241B; border-radius: 12px; box-shadow: 0 2px 6px rgba(220, 60, 40, 0.1);`.

---

## 5. ПОШАГОВЫЙ ПЛАН РЕАЛИЗАЦИИ И СПЕЦИФИКАЦИЯ ТЕСТОВ (DEF-5.7)

### Шаг 5.1: Утверждение плана v2.0 независимым субагентом (Plan Review v3, Раунд 2)
- Проверка устранения блокера DEF-5.1 и замечаний DEF-5.2–DEF-5.7.
- Получение оценки «ОДОБРЕНО» (10.0 / 10).

### Шаг 5.2: TDD-тесты Стейджа 5 (`tests/stage5_pwa_gate.test.js`)
Реализация 8 изолированных тестов для запуска в чистом Node.js:
1. `test_google_gate_auth_strict_email`: вход разрешен строго для `lifekvi2018@gmail.com`, любой другой email отклоняется с понятным сообщением;
2. `test_session_30_days_and_auto_expiration`: при логине выставляется `expiresAt = now + 30 дней`; при превышении срока `isAuthenticated()` сбрасывает сессию;
3. `test_storage_adapter_resilience`: отсутствие `localStorage` (Node.js fallback) не вызывает `ReferenceError`;
4. `test_manifest_structure_and_assets`: парсинг `manifest.json`, проверка `standalone`, цветов `#FAF2E7` и физического наличия файлов `./icons/icon-192.png`, `./icons/icon-512.png`, `./icons/icon.svg`;
5. `test_sw_precache_and_gas_bypass`: статический анализ `sw.js` — наличие `'./'` и `'./index.html'` в `PRECACHE_ASSETS`, изоляция запросов к `script.google.com`, отсутствие вызовов `localStorage`;
6. `test_golden_standard_sync_styles`: валидация CSS в `sync.js` — строго 0 совпадений по шаблонам `border:\s*[0-9]` и `#FFFFFF`;
7. `test_offline_data_fallback_honesty`: модульная проверка отката на кэшированные данные при сетевом сбое с выставлением статуса «Нет связи с Google ✕»;
8. `test_regression_suite_all_stages`: запуск всех предыдущих тестов (Стейджи 1–4, `sync.test.js`, `check_mockup_layout.js`) — 100% зелёных тестов, 0 регрессий.

### Шаг 5.3: Реализация Google Gate и адаптера сессий в `sync.js`
- Внедрение `getAuthStorage()`, проверки `expiresAt` и очистка стилей.

### Шаг 5.4: Генерация иконок, создание `manifest.json` и `sw.js`
- Запуск `scripts/generate_pwa_icons.js` для создания иконок;
- Создание `manifest.json` и `sw.js`;
- Подключение метатегов и скрипта регистрации в `index.html`.

### Шаг 5.5: Независимое ревью кода (`/loop-code-review-3`, уровни 1–4)
- Достижение оценки 10.0 / 10 («ОДОБРЕНО»).

### Шаг 5.6: Проверка в живом браузере и сдача проекта Ане
- Проверка работы Google Gate и PWA на сервере `http://localhost:3000/index.html`;
- Финальный git commit и презентация готового проекта Ане.
