# offline-hono-app

Small [Hono](https://hono.dev/) app demonstrating how a multi-page application server can be built and ran in a browser, even offline, by [using a service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

Things to note:

1. Initial site visit renders the requested route on the server.
2. All server-side-rendered routes attempt to register the servcie worker.
3. Once the service worker is activated, all routes are service-worker-side-rendered.
4. [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache) is used in both server [Deno](https://deno.com/) environment and in servcie worker browser environment for caching users lookup.
