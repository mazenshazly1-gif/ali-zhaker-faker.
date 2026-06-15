// ==========================================================================
// 🛠️ Service Worker (sw.js) - الّلي ذاكر فاكر V15.0
// ⚡ متوافق مع تحديثات: كشكول بيكاسو، مقامات السنن، SyncFlow، Shell V3.0
// 📦 استراتيجية: Cache First للملفات الثابتة + Network First لـ APIs
// ==========================================================================

const CACHE_NAME = 'lazaker-fakir-v16.0';

// قائمة الملفات الأساسية للتخزين المسبق (Pre-cache)
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './shell.css',
  './shell.js',
  './notes.css',
  './notes.js',
  './syncflow.css',
  './syncflow.js',
  './deen-time-challenges.css',
  './deen-time-challenges.js',
  './info-card.css',
  './info-card.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './1000069604_2.png'
];

// ملفات CDN خارجية (تخزينها لتحسين الأداء)
const CDN_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'
];

// ملفات الصوت (لنهاية الجلسة والعد)
const AUDIO_ASSETS = [
  'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
  'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
  'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg',
  'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg'
];

const ALL_ASSETS = [...STATIC_ASSETS, ...CDN_ASSETS, ...AUDIO_ASSETS];

// =======================
// 1. INSTALL EVENT
// =======================
self.addEventListener('install', (event) => {
  console.log('[SW] 📦 تثبيت الإصدار الجديد:', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] جاري تخزين الملفات الأساسية...');
      return cache.addAll(ALL_ASSETS);
    }).then(() => {
      self.skipWaiting(); // تفعيل الـ SW الجديد فوراً
    })
  );
});

// =======================
// 2. ACTIVATE EVENT
// =======================
self.addEventListener('activate', (event) => {
  console.log('[SW] ✅ تفعيل الإصدار:', CACHE_NAME);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // حذف أي كاش قديم لا يتطابق مع الإصدار الحالي
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] 🗑️ حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // السيطرة على جميع الصفحات المفتوحة فوراً
      return self.clients.claim();
    })
  );
});

// =======================
// 3. FETCH EVENT - استراتيجية ذكية
// =======================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // استثناء API الصلاة - فقط Network First (لا تخزين)
  if (url.hostname === 'api.aladhan.com') {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // استثناء بوتات الدردشة
  if (url.hostname.includes('chatbase.co')) {
    return;
  }

  // استثناء طرق POST والـ non-GET
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  // إستراتيجية: Cache First مع تحديث في الخلفية
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          // تخزين النسخة الجديدة فقط إذا كانت الاستجابة سليمة
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          console.log('[SW] ⚠️ فشل الاتصال بالشبكة للملف:', url.pathname);
        });

        // إرجاع النسخة المخزنة أولاً (إن وجدت) أو الانتظار للشبكة
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// =======================
// 4. PUSH NOTIFICATION (للإشعارات المستقبلية)
// =======================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || '🕌 حان وقت الصلاة',
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [200, 100, 200],
    sound: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
    tag: 'prayer-time',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'الّلي ذاكر فاكر', options)
  );
});

// =======================
// 5. NOTIFICATION CLICK
// =======================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('./index.html');
      })
  );
});