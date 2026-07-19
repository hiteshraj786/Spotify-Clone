const CACHE_NAME = 'hitmelody-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/utility.css',
    '/js/script.js',
    '/manifest.json',
    '/img/logo.svg',
    '/img/home.svg',
    '/img/search.svg',
    '/img/playlist.svg',
    '/img/close.svg',
    '/img/hameburger.svg',
    '/img/playsong.svg',
    '/img/pausesong.svg',
    '/img/nextsong.svg',
    '/img/previous.svg',
    '/img/volume.svg',
    '/img/mutevolume.svg',
    '/img/music.svg',
    '/img/playing.svg'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch: Network First for dynamic content (songs, JSON), Cache First for static assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // For songs.json and MP3 files - always go Network First so new songs show up
    if (url.pathname.endsWith('.json') || url.pathname.endsWith('.mp3')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cache a copy for offline use
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // If offline, serve from cache
                    return caches.match(event.request);
                })
        );
        return;
    }

    // For static assets - Cache First (fast loading)
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Update cache in background
                fetch(event.request).then((response) => {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, response);
                    });
                });
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
