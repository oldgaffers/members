const CURRENT_CACHES = {
  code: 'code-cache-v1'
};

const addResourcesToCache = async (resources) => {
    const cache = await caches.open("v1");
    console.log('C', await cache.keys());
    await cache.addAll(resources);
    console.log('cache warmed');
};
  
  self.addEventListener("install", (event) => {
    console.log('install');
    event.waitUntil(
      addResourcesToCache([
        '/index.css'
      ]),
    );
  });
  
  self.addEventListener("fetch", (event) => {
    console.log("Handling fetch event for", event.request.url);
  
    event.respondWith(
      caches.open(CURRENT_CACHES.code).then((cache) => {
        return cache
          .match(event.request)
          .then((response) => {
            if (response) {
              console.log(" Found response in cache:", response);
              return response;
            }
  
            // Otherwise, if there is no entry in the cache for event.request,
            // response will be undefined, and we need to fetch() the resource.
            console.log(
              " No response for %s found in cache. About to fetch " +
                "from network…",
              event.request.url,
            );
  
            // We call .clone() on the request since we might use it
            // in a call to cache.put() later on.
            // Both fetch() and cache.put() "consume" the request,
            // so we need to make a copy.
            // (see https://developer.mozilla.org/en-US/docs/Web/API/Request/clone)
            return fetch(event.request.clone()).then((response) => {
              console.log(
                "  Response for %s from network is: %O",
                event.request.url,
                response,
              );
  
              if (
                response.status < 400 &&
                response.headers.has("content-type") &&
                (
                  response.headers.get("content-type").match(/application\/javascript/)
                  ||
                  response.headers.get("content-type").match(/application\/json/)
                )
              ) {
                cache.put(event.request, response.clone());
              } else {
                console.log("  Not caching the response to", event.request.url);
              }
  
              // Return the original response object, which will be used to
              // fulfill the resource request.
              return response;
            });
          })
          .catch((error) => {
            // This catch() will handle exceptions that arise from the match()
            // or fetch() operations.
            // Note that a HTTP error response (e.g. 404) will NOT trigger
            // an exception.
            // It will return a normal response object that has the appropriate
            // error code set.
            console.error("  Error in fetch handler:", error);
  
            throw error;
          });
      }),
    );
  });