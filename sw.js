const CACHE_NAME = 'skpk-monitoring-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './acehjaya_round.webp',
    './acehjaya_diskominsa.webp',
    './fav_icon_acehjayakab.webp',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap'
];

// 1. Saat Service Worker dipasang (Install Event)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Menyita aset statis ke dalam cache Service Worker');
            return cache.addAll(ASSETS_TO_CACHE);
        }).catch(err => {
            console.warn('Sebagian aset gagal dicache saat instalasi:', err);
        })
    );
    self.skipWaiting();
});

// 2. Saat Service Worker diaktifkan (Activate Event)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Menghapus cache lama yang kedaluwarsa:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. Pintasan Jaringan (Fetch Event)
// Mengutamakan jaringan untuk data Google Sheets / API, dan Cache untuk aset lokal.
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Jika request menuju Google Apps Script (API), utamakan Network terlebih dahulu
    if (url.origin.includes('script.google.com')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Untuk aset lainnya, gunakan strategi Cache dengan fallback ke Network
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    // Simpan salinan respons baru ke cache (opsional untuk file lokal)
                    if (event.request.method === 'GET' && url.protocol.startsWith('http')) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            });
        }).catch(() => {
            // Fallback offline dapat disesuaikan jika diperlukan
            console.warn('Gagal mengambil resource:', event.request.url);
        })
    );
});