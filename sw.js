// ==========================================================================
// 🛠️ Service Worker (sw.js) - الّلي ذاكر فاكر V13.1 (منظومة SyncFlow الذكية)
// ==========================================================================

// الترقية لـ V13.1 لإضافة أيقونة بيكاسو للكاش وتنظيف الإصدارات السابقة
const CACHE_NAME = 'ali-zhaker-faker-v13.1'; 

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './notes.css',
  './notes.js',
  './syncflow.css', // 🌟 دمج ملف التصميم للمحرك الجديد
  './syncflow.js',  // 🌟 دمج ملف اللوجيك للمحرك الجديد
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './1000069604.png', // 🐧 إضافة أيقونة بيكاسو (البطريق الأسطوري) ليعمل أوفلاين بدون مشاكل!
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js',
  'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg'
];

// 1. تثبيت الـ Service Worker وضخ الملفات الجديدة في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📌 جاري تحديث الكاش للمنظومة الذكية V13.1...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // إجبار الـ SW الجديد على التنشيط فوراً
});

// 2. تفعيل الـ SW وتنظيف كاش V13.0 وأي كاش قديم لتجنب التضارب
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
      return self.clients.claim(); // السيطرة على كل الصفحات المفتوحة فوراً
    })
  );
});

// 3. استراتيجية الكاش (السرعة القصوى والاستدعاء السلس مع استثناء الـ APIs)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // 🤖 استثناء سيرفرات Chatbase (البوت) عشان يفضل شغال لايف وبدون مشاكل
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
        }).catch(() => {
          // في حال انقطاع الشبكة تماماً، الـ Cache المسترجع هيقوم بالواجب
        });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
