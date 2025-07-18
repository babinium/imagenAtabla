const CACHE_NAME = 'babinium-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/favicon.svg',
  '/components/DataTable.tsx',
  '/components/ImageUploader.tsx',
  '/components/Spinner.tsx',
  '/services/geminiService.ts',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react-dom@^19.1.0/',
  'https://esm.sh/lucide-react@^0.525.0',
  'https://esm.sh/react@^19.1.0/',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/@google/genai@^1.10.0'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Add all URLs to cache, but don't fail the install if one fails
        return cache.addAll(urlsToCache).catch(err => {
            console.error('Failed to cache one or more resources:', err);
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
            // This is a basic offline fallback. 
            // For a better experience, you might want a custom offline page.
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
