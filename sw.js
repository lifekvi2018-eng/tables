/**
 * ============================================================================
 * SERVICE WORKER — «МОИ ТАБЛИЦЫ ♡» (sw.js)
 * ============================================================================
 * Кэширование App Shell, автономный офлайн-режим, изоляция Google Apps Script.
 * Внимание: Service Worker не перехватывает запросы к script.google.com
 * (они идут напрямую в сеть через модуль sync.js).
 */

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

// Установка Service Worker и предкэширование статического App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Активация и удаление устаревших кэшей
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Перехват сетевых запросов
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return; // Cache API поддерживает только GET
  }

  const url = new URL(event.request.url);

  // ЖЕЛЕЗНОЕ ПРАВИЛО: Service Worker НЕ перехватывает запросы к Google Apps Script!
  if (url.hostname.includes('script.google.com')) {
    return; // Запрос проходит напрямую в сеть через sync.js
  }

  // Внешние шрифты Google Fonts: стратегия Cache-First
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return response;
        });
      })
    );
    return;
  }

  // App Shell и локальные ресурсы: стратегия Stale-While-Revalidate
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
        .catch(() => cached); // При сбое сети или офлайне отдаем из кэша

      return cached || fetchPromise;
    })
  );
});
