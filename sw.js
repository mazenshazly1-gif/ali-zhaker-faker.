// ==========================================
// 🛠️ Service Worker (sw.js) - الّلي ذاكر فاكر V8.1
// ==========================================

const CACHE_NAME = 'ali-zhaker-faker-v8.1'; // تحديث رقم الإصدار لضمان تنظيف الـ Cache القديم فوراً

// الملفات المحلية الأساسية فقط لضمان نجاح التثبيت بنسبة 100% بدون مشاكل الـ CORS
const LOCAL_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. تثبيت الـ Service Worker وحفظ الملفات في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // استخدام آلية مرنة: لو ملف خارجي فشل، التطبيق الأساسي يتثبت برضه وميقفش
      console.log('جاري تهيئة كاش تطبيق الّلي ذاكر فاكر...');
      return cache.addAll(LOCAL_ASSETS);
    })
  );
  self.skipWaiting(); 
});

// 2. تفعيل وتحديث الكاش القديم وتطهير الـ Storage
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('تم حذف كاش قديم وغير مستخدم:', key);
            return caches.delete(key); 
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. استراتيجية جلب البيانات الذكية (Network First للـ API / Cache First للملفات)
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 💡 استثناء مواقيت الصلاة والـ APIs: نحاول نجيبها من النت الأول عشان تكون دقيقة، لو مفيش نت يروح للكاش
  if (requestUrl.hostname.includes('aladhan.com') || requestUrl.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // لو أوفلاين تماماً، رجع أي كاش متخزن للرابط ده
          return caches.match(event.request);
        })
    );
    return; // اخرج من الـ event عشان ميطبقش الكاش العادي
  }

  // ⚡ للملفات الثابتة (الموقع، التنسيقات، الصور والـ سكريبت): Cache First لسرعة خارقة
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // لو موجود في الكاش رجعه فوراً
      }

      // لو مش في الكاش (زي الملفات الخارجية Chart.js أو صوت الإنذار)، هاتها من النت وخزن نسخة منها ديناميكياً
      return fetch(event.request).then((networkResponse) => {
        // تأكد من صحة الاستجابة قبل تخزينها
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          // لو الاستجابة خارجية (CORS) بنرجعها للموقع بس مش بنخزنها عشان متعملش Error
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // لو مفيش نت نهائي والملف مش متكش، المتصفح هيتصرف طبيعي
        console.log('فشل جلب الملف أوفلاين:', event.request.url);
      });
    })
  );
});
