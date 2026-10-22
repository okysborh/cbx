/* Service worker simples: deixa o site "instalavel" no celular.
   NAO faz cache de midia privada (fotos/videos/API) por seguranca;
   so guarda os arquivos basicos de interface para abrir mais rapido. */
const CACHE = 'cbx-v1';
const ASSETS = [
  '/css/style.css',
  '/js/layout.js',
  '/js/features.js',
  '/img/banner.jpg',
  '/manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Nunca cacheia API nem arquivos privados: sempre busca na rede.
  if (url.pathname.startsWith('/api/')) return;
  // Para os assets estaticos: tenta cache primeiro, senao rede.
  if (ASSETS.includes(url.pathname)) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
  }
});
