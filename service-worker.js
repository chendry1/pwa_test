const cacheName = 'hello-pwa';
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

const CACHE = "pwabuilder-page";

var installed = false;

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  console.log("install called");
  //installed = true;
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/* Network falling back to the cache */
self.addEventListener('fetch', function(event) {
  var request = event.request;
  console.log(event.request);
  /*if( event.request.url == "https://chendry1.github.io/pwa_test/" )
  {
	  console.log( "root folder request detected" );
	  if( installed )
	  {
		 console.log( "browser is in standalone mode" );
		 request = new Request( "https://chendry1.github.io/pwa_test/standalone.html" );  
	  }
  }*/
  
  event.respondWith(
    fetch(request).catch(function() {
      return caches.match(request);
    })
  );
});
