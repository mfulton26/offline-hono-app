/// <reference lib="dom" />

await navigator.serviceWorker.register("/sw.js", { type: "module" });
