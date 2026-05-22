// ==========================================
// 🛠️ Service Worker (sw.js) - الّلي ذاكر فاكر V9
// ==========================================

const CACHE_NAME = 'ali-zhaker-faker-v9'; // تحديث الإصدار لـ v9 لتطهير الكاش القديم فوراً

// الملفات المحلية الثابتة الأساسية لضمان عمل الهيكل الأساسي للتطبيق
const LOCAL_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. تثبيت الـ Service Worker وحفظ الملفات الأساسية في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('⏳ جاري تهيئة كاش تطبيق الّلي ذاكر فاكر V9...');
      return cache.addAll(LOCAL_ASSETS);
    })
  );
  self.skipWaiting(); 
});

// 2. تفعيل السيرفيس وركر وتطهير الـ Cache القديم تماماً فوراً
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🧹 تم حذف كاش قديم:', key);
            return caches.delete(key); 
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. استراتيجية الجلب الذكية (Network First للـ APIs ومواقيت الصلاة / Cache First للباقي)
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 🕌 استثناء مواقيت الصلاة وأي API (نحاول نت الأول، لو مفيش نرجع الكاش)
  if (requestUrl.hostname.includes('aladhan.com') || requestUrl.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // خزن نسخة حديثة من مواقيت الصلاة في الكاش عشان لو فصل نت تلاقيها
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request); // لو أوفلاين، رجع أخر كاش متسجل
        })
    );
    return;
  }

  // ⚡ للملفات الثابتة والمكتبات الخارجية (Chart.js / الأليرت): Cache First لسرعة خارقة
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // لو الملف متكش، رجعه فوراً ووفر باقة ونقرة
      }

      // لو مش متكش (زي أول مرة نفتح فيها مكتبة Chart.js أو الصوت الخارجي)
      return fetch(event.request).then((networkResponse) => {
        // نكش الاستجابة لو ناجحة (كود 200) أو لو خارجية آمنة (كود 0 للـ opaque assets)
        if (!networkResponse || (networkResponse.status !== 200 && networkResponse.status !== 0)) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache); // كش الملف ديناميكياً للزيارات الجاية
        });

        return networkResponse;
      }).catch(() => {
        console.log('❌ ملف غير متاح أوفلاين:', event.request.url);
      });
    })
  );
});
