const CACHE='behta-field-v2';
const SHELL=['/','/index.html','/styles.css','/behta-enhancements.css','/field-upgrades.css','/app.js','/behta-enhancements.js','/field-upgrades.js','/pwa.js','/manifest.webmanifest','/app-icon.svg','/offline.html'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  if(url.pathname.startsWith('/api/')) return;

  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{
      if(res.ok){const clone=res.clone();caches.open(CACHE).then(cache=>cache.put('/index.html',clone));}
      return res;
    }).catch(()=>caches.match('/index.html').then(r=>r||caches.match('/offline.html'))));
    return;
  }

  event.respondWith(caches.match(req).then(cached=>{
    const network=fetch(req).then(res=>{
      if(res.ok){const clone=res.clone();caches.open(CACHE).then(cache=>cache.put(req,clone));}
      return res;
    }).catch(()=>cached);
    return cached||network;
  }));
});
