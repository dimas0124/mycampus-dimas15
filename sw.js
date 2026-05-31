const CACHE_NAME = 'smart-campus-v1';
// Daftar aset statis aplikasi yang wajib disimpan di memori HP agar bisa dibuka offline
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://code.jquery.com/jquery-3.6.0.min.js'
];

// Tahap 1: INSTALL - Menyimpan aset inti ke dalam Cache Storage
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Mengamankan aset ke dalam cache lokal...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Tahap 2: ACTIVATE - Membersihkan cache versi lama jika ada pembaruan sistem
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Membersihkan cache usang...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Tahap 3: FETCH - Strategi 'Network First with Cache Fallback' untuk halaman offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Jika jaringan internet ada, berikan respon segar dari server
        return networkResponse;
      })
      .catch(() => {
        // Jika internet mati (offline), langsung ambilkan aset dari cache lokal HP
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback jika yang diakses adalah halaman utama namun internet mati total
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
        });
      })
  );
});