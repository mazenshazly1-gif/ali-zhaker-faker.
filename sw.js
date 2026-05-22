// ==========================================
// 🛠️ Service Worker (sw.js) - الّلي ذاكر فاكر V8
// ==========================================

const CACHE_NAME = 'ali-zhaker-faker-v8'; // تحديث الإصدار لـ v8 لضمان سحب التعديلات والرتب الجديدة فوراً
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg'
];

// تثبيت الـ Service Worker وحفظ الملفات في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); 
});

// تفعيل وتحديث الكاش القديم فوراً
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
    }).then(() => self.clients.claim())
  );
});

// استدعاء الملفات أوفلاين وسرعة التحميل
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
