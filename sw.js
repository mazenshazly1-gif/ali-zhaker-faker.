// ==========================================
// 🛠️ Service Worker (sw.js) - الّلي ذاكر فاكر V8
// ==========================================

const CACHE_NAME = 'ali-zhaker-faker-v8'; // رفعنا الإصدار لـ v8 عشان يطير أي كاش قديم متهنج
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

// 1. تثبيت الـ Service Worker وحفظ الملفات الأساسية فوراً
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📌 جاري حلب الملفات وتحديث الكاش لـ V8...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // إجبار الـ SW الجديد إنه يشتغل فوراً بدون انتظار
});

// 2. تفعيل الـ SW وتفجير أي كاش قديم فوراً وتحديث الأجهزة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🗑️ كاش قديم اتمسح:', key);
            return caches.delete(key); 
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // السيطرة على كل الصفحات المفتوحة فوراً عشان التعديل يظهر
    })
  );
});

// 3. استراتيجية (Stale-While-Revalidate) السرعة القصوى + التحديث الفوري
self.addEventListener('fetch', (event) => {
  // ميزتشيكش غير على ملفات موقعنا والـ CDN الأساسية
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // لو الملف موجود في الكاش رجعه فوراً عشان الموقع يفتح في ثانية (أوفلاين أو أونلاين)
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // وفي الخلفية، لو أونلاين وجاب نسخة جديدة من السيرفر، حدث الكاش فوراً للتطوير الجاي
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // لو فصل نت خالص، الكاش القديم يفضل حامي ظهرنا
        });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
