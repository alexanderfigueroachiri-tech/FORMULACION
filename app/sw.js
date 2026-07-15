const CACHE = "eduapp-v13";
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
  "./js/courses/registry.js",
  "./js/courses/beg06.js",
  "./js/courses/comms2.js",
  "./js/courses/commsWidgets.js",
  "./js/courses/examEE530.js",
  "./js/courses/examWidgets.js",
  "./js/courses/mathFormat.js",
  "./data/curriculum.json",
  "./data/comms2.curriculum.json",
  "./data/examEE530.curriculum.json",
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
