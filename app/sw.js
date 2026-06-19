const CACHE = "beg06-v7";
const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./js/engine.js",
  "./js/excelModel.js",
  "./js/formulaParser.js",
  "./js/formulaGrid.js",
  "./js/cellLegend.js",
  "./js/skills.js",
  "./js/worksheets.js",
  "./data/curriculum.json",
  "./data/excel_formulas_exact.json",
  "./manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
