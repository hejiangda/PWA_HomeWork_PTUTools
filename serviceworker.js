importScripts('/PWA_HomeWork_PTUTools/cache-polyfill.js');
var CACHE_NAME = "ptu-cache-v2";
// "https://js-1252338577.cos.ap-chengdu.myqcloud.com/opencv.js"
var CACHED_URLS = [
  "/",
  "/index.html",
  "https://cdn.staticfile.org/twitter-bootstrap/4.3.1/css/bootstrap.min.css",
  "https://cdn.staticfile.org/jquery/3.2.1/jquery.min.js",
  "https://cdn.staticfile.org/popper.js/1.15.0/umd/popper.min.js",
  "https://cdn.staticfile.org/twitter-bootstrap/4.3.1/js/bootstrap.min.js",
  "/app/index.css",
  "/app/loading.css",
  "/app/opencv.js",
  // "https://js-1252338577.cos.ap-chengdu.myqcloud.com/opencv.js",
  "/app/index.js",
  "/favicon.ico",
  "/img/sunraise-icon-192.png",
  "/img/sunraise-icon-512.png",
  "/PWA_HomeWork_PTUTools/manifest.json"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CACHED_URLS);
    })
  );
});

self.addEventListener('fetch', function (event) {

  console.log(event.request.url);

  event.respondWith(

    caches.match(event.request).then(function (response) {

      return response || fetch(event.request);

    })

  );

});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (CACHE_NAME !== cacheName && cacheName.startsWith("ptu-cache")) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
