const CACHE_NAME = 'hello-pwa';
// This is the "Offline page" service worker

//importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js');

var filesToCache = [
  'index.html',
  'standalone.html',
  'manifest.json',
  'main.js',
  'password_rank.js',
  'password_generation.js',
  'icons/icon-128x128.png',
  'icons/icon-144x144.png',
  'icons/icon-152x152.png',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

var installed = false;

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  console.log("install called");
  //installed = true;
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/* Network falling back to the cache */
self.addEventListener('fetch', function(event) {
  var request = event.request;
  
  event.respondWith(
    caches.open(CACHE_NAME).then(
	  fetch(request)
        .then(function(response) { return cache.put(request, response.clone()).then(function () { return response; } ) )
        .catch(function() { return cache.match(request); })
	)
  );
});
