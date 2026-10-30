/* Perf Lab — service worker
   Bump CACHE quand tu modifies la coque (pas nécessaire pour programs.js
   grâce au network-first ci-dessous, mais conseillé après gros changements). */
const CACHE = "perflab-v15";
const NET_TIMEOUT = 3000;   // ms avant de servir la coque depuis le cache

const SHELL = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./backend.js",
  "./config.js",
  "./programs.js",
  "./progression.js",
  "./cycle.js",
  "./cyclestore.js",
  "./cycle-ui.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon.png"
];

self.addEventListener("install", e=>{
  // relue sur le réseau (cache: reload) : sinon le cache HTTP de GitHub Pages (max-age 600)
  // rangerait l'ancienne version de la coque sous le nouveau nom de cache
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>fetch(u, { cache:"reload" }).then(r=>{
    if(!r.ok) throw new Error(u+" : "+r.status);
    return c.put(u, r);
  })))).then(()=>self.skipWaiting()));
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch", e=>{
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;

  // Appels Supabase (API REST + auth) : toujours réseau, jamais de cache.
  if(/supabase\.co$/.test(url.host)) return;

  // Code applicatif (HTML/CSS/JS même origine) : network-first → màj quand en ligne, cache si offline.
  // Réseau de salle (connecté mais sans débit) : au-delà de NET_TIMEOUT on sert le cache ;
  // sans copie en cache, on attend quand même le réseau.
  const isCode = sameOrigin && /\.(html|css|js)$/.test(url.pathname) || (sameOrigin && url.pathname.endsWith("/"));
  if(isCode){
    // no-cache : on revalide auprès du serveur (304 si rien n'a changé) au lieu de lire le cache HTTP
    const net = fetch(req.url, { cache:"no-cache" }).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(req, copy));
      return res;
    });
    const late = new Promise((_, no)=> setTimeout(()=> no(new Error("réseau lent")), NET_TIMEOUT));
    e.respondWith(
      Promise.race([net, late]).catch(()=> caches.match(req).then(r=> r ||
        net.catch(()=> caches.match("./index.html"))))
    );
    return;
  }

  // Reste (icônes, polices Google, etc.) : cache-first + mise en cache à la volée.
  e.respondWith(
    caches.match(req).then(cached=>{
      if(cached) return cached;
      return fetch(req).then(res=>{
        if(res && (res.ok || res.type === "opaque")){
          const copy = res.clone();
          caches.open(CACHE).then(c=>c.put(req, copy));
        }
        return res;
      }).catch(()=> cached);
    })
  );
});
