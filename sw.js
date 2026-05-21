const CACHE_NAME = 'mazen-dashboard-v6'; // رفعنا الإصدار لـ v6 لتصفير الكاش القديم فوراً
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// تثبيت الـ Service Worker وحفظ الملفات الأساسية
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// تنظيف الكاشات القديمة بالكامل
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// استراتيجية جلب الملفات الذكية (تخطي الروابط الخارجية والـ APIs)
self.addEventListener('fetch', (e) => {
  // عدم عمل كاش لطلبات الـ API أو المصحف الخارجي عشان ميتعطلش الـ PWA
  if (e.request.url.includes('api.aladhan.com') || e.request.url.includes('quran.com')) {
    return fetch(e.request);
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // لو الملف موجود في الكاش، هاته بسرعة، وحدثه في الخلفية
        fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
          }
        }).catch(() => {/* صامت */});
        return cachedResponse;
      }
      
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
        return networkResponse;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
