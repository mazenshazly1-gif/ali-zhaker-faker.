// ===================================================
// 🛠️ Service Worker (sw.js) - الّلي ذاكر فاكر V12.0 المطور والذكي
// ===================================================

// الترقية الفورية لإصدار v12.0 لسحب ملفات الشات بوت والمخ الذكي الحي
const CACHE_NAME = 'ali-zhaker-faker-v12.0'; 

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './notes.css',        // 📝 ملف تنسيقات الملاحظات وبيكاسو
  './notes.js',         // 📝 ملف لوجيك الملاحظات، اليد، والـ Undo/Redo
  './bot.css',          // 🤖 ملف تنسيقات البوت الذكي الجديد
  './bot.js',           // 🤖 ملف لوجيك الشات بوت والمحرك الحي
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js',
  'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg'
];

// 1. تثبيت الـ Service Worker وحفظ الملفات الأساسية فوراً
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📌 جاري حلب الملفات وتحديث الكاش لـ V12.0 (دماغ ذكية + أوفلاين طلقة)...');
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
            console.log('🗑️ كاش قديم اتمسح وخسع وجبنا الجديد للأسد:', key);
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
  // تخطي الطلبات التي ليست من نوع GET (مثل الـ POST الخاصة برفع الملفات)
  if (event.request.method !== 'GET') return;

  // 🤖 فلتر صايع: استثناء طلبات سيرفر الذكاء الاصطناعي عشان يفضل حي وميهنجش
  if (event.request.url.includes('openrouter.ai')) {
    return; 
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // تحديث الكاش في الخلفية فقط إذا كانت الاستجابة صالحة
          if (networkResponse.status === 200 || networkResponse.type === 'opaque') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // في حالة عدم وجود إنترنت، الكاش يحمي ظهرنا صامتًا
        });

        // رجّع النسخة المتكاشة فوراً لسرعة البرق، ولو مش موجودة انتظر كود الشبكة
        return cachedResponse || fetchPromise;
      });
    })
  );
});
