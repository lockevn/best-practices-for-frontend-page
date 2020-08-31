importScripts('/PWA/workbox-v5.1.2/workbox-sw.js');
if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);
    workbox.setConfig({
        clientsClaim: true,
        debug: false,
        skipWaiting: true,
        modulePathPrefix: '/PWA/workbox-v5.1.2/'
    });

    // Pre-cache offline page!
    workbox.precaching.precacheAndRoute([
        { url: '/PWA/offline.html', revision: '041520' },   // THIS CONFIGURATION MUST BE CHANGE PER SITE
        { url: '/manifest.json', revision: '041520' }   // THIS CONFIGURATION MUST BE CHANGE PER SITE
    ]);

    // CACHING ==>
    // Cache pages
    // THIS CONFIGURATION MUST BE CHANGE PER SITE
    workbox.routing.registerRoute(
        /\/[^/]+\/?$/i,  /* match all pages where path end with /pathnamehere or /pathnamehere/     */
        new workbox.strategies.NetworkFirst({
            cacheName: 'pages',
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [200] }),
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 10,
                    maxAgeSeconds: 7 * 24 * 60 * 60
                })
            ]
        })
    );

    // Cache CSS or JS files.
    workbox.routing.registerRoute(
        /\.(?:js|css)$/i,
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'static-resources-cache'
        })
    );
   
    // Cache font files.
    workbox.routing.registerRoute(
        /\.(?:woff2|woff|eot|ttf)$/i,
        // Use the cache if it's available.
        new workbox.strategies.CacheFirst({
            cacheName: 'fonts-cache',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 10,
                    // Cache for a maximum of a week.
                    maxAgeSeconds: 365 * 24 * 60 * 60
                })
            ]
        })
    );

    // Cache image files.
    workbox.routing.registerRoute(
        /\.(?:png|jpg|jpeg|svg|webp|gif|ico)$/i,
        // Use the cache if it's available.
        new workbox.strategies.CacheFirst({
            cacheName: 'image-cache',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 100,
                    // Cache for a maximum of a month.
                    maxAgeSeconds: 30 * 24 * 60 * 60
                })
            ]
        })
    );

    // This route will go against the network if there isn't a cache match,
    // but it won't populate the cache at runtime.
    // If there is a cache match, then it will properly serve partial responses.
    workbox.routing.registerRoute(
        /\.(?:mp4|webm)$/i,
        new workbox.strategies.CacheFirst({
            cacheName: 'video-cache',
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [200] }),
                new workbox.rangeRequests.RangeRequestsPlugin()
            ]
        })
    );
    // CACHING END

    // Use a stale-while-revalidate strategy for all other requests.
    workbox.routing.setDefaultHandler(new workbox.strategies.NetworkOnly());
    // This "catch" handler is triggered when any of the other routes fail to
    // generate a response.
    workbox.routing.setCatchHandler(({ event }) => {
        // The FALLBACK_URL entries must be added to the cache ahead of time, either via runtime
        // or precaching.
        // If they are precached, then call workbox.precaching.getCacheKeyForURL(FALLBACK_URL)
        // to get the correct cache key to pass in to caches.match().
        //
        // Use event, request, and url to figure out how to respond.
        // One approach would be to use request.destination, see
        // https://medium.com/dev-channel/service-worker-caching-strategies-based-on-request-types-57411dd7652c
        switch (event.request.destination) {
            case 'document':
                return caches.match('/PWA/offline.html');
            default:
                // If we don't have a fallback, just return an error response.
                return Response.error();
        }
    });
}