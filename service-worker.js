const CACHE_NAME = 'PasswordGenerator'; // FOR CONFIG
// This is the "Offline page" service worker

//importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js');

var filesToCache = [
  'index.html',
  'standalone.html',
  'manifest.json',
  'pwa.js',
  'icons/icon-128x128.png',
  'icons/icon-144x144.png',
  'icons/icon-152x152.png',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  
  // TO CONFIG
  'password_rank.js',
  'password_generation.js'  
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  console.log("install called");
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/* Network falling back to the cache
  we store cache each time we are able to fetch page*/
self.addEventListener('fetch', function(event) {
  var request = event.request;
  console.log("fetch called for request : " + request.url);
  
  event.respondWith(
    caches.open(CACHE_NAME).then( function(cache)
    {
      return fetch(request)
        .then(function(response) { 
          return cache.put(request, response.clone()).then(function () { return response; } ) 
        } )
        .catch(function() { return cache.match(request); })
	} )
  );
});
