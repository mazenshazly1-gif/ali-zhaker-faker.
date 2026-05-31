// ===================================================
// 🛠️ Service Worker (sw.js) - الّلي ذاكر فاكر V12.2 المطور والذكي
// ===================================================

// الترقية لـ V12.2 لضمان تحديث الكاش فوراً بعد التعديلات الأخيرة
const CACHE_NAME = 'ali-zhaker-faker-v12.2'; 

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './notes.css',
  './notes.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js',
  'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg'
];

// 1. تثبيت الـ Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📌 جاري تحديث الكاش لـ V12.2...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. تفعيل الـ SW وتنظيف القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🗑️ تنظيف الكاش القديم:', key);
            return caches.delete(key); 
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. استراتيجية السرعة القصوى مع استثناء الـ API
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // 🤖 استثناء سيرفرات Chatbase (البوت الجديد) عشان يفضل شغال لايف وبدون مشاكل
  if (event.request.url.includes('chatbase.co')) {
    return; 
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200 || networkResponse.type === 'opaque') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {});

        return cachedResponse || fetchPromise;
      });
    })
  );
});
