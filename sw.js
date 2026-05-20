const CACHE_NAME = 'mazen-dashboard-v5'; // غيّرنا الإصدار لـ v5 عشان يلقط التعديل الجديد والشاشة تلف فوراً
const ASSETS = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// تثبيت الـ Service Worker وحفظ الملفات أوفلاين
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // إجبار النسخة الجديدة إنها تشتغل فوراً في الخلفية
});

// تنظيف الكاشات القديمة كلها (v1, v2, v3, v4) عشان الأيقونة الجديدة والدوران يشتغلوا
self.addEventListener('activate', (e) => {
  e.waitUntil(
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
  self.clients.claim(); // السيطرة على التطبيق وتحديثه في نفس اللحظة بدون انتظار
});

// استراتيجية التشغيل (الشبكة أولاً لتحديث فوري)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => caches.match(e.request)) 
  );
});
