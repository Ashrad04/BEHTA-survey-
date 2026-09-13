const CACHE='behta-field-v4';
const SHELL=['/','/index.html','/styles.css','/behta-enhancements.css','/field-upgrades.css','/multi-survey.css','/app.js','/behta-enhancements.js','/field-upgrades.js','/confidence-persistence.js','/bng.js','/rapid-protocols.js','/multi-survey.js','/pwa.js','/manifest.webmanifest','/app-icon.svg','/offline.html'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

function upgradedHtmlResponse(response){
  return response.text().then(html=>{
    if(!html.includes('/field-upgrades.css')) html=html.replace('</head>','  <link rel="icon" href="/app-icon.svg" type="image/svg+xml">\n  <link rel="apple-touch-icon" href="/app-icon.svg">\n  <meta name="mobile-web-app-capable" content="yes">\n  <meta name="apple-mobile-web-app-capable" content="yes">\n  <meta name="apple-mobile-web-app-title" content="Field Surveys">\n  <link rel="stylesheet" href="/field-upgrades.css">\n  <link rel="stylesheet" href="/multi-survey.css">\n</head>');
    if(!html.includes('/multi-survey.css')) html=html.replace('</head>','  <link rel="stylesheet" href="/multi-survey.css">\n</head>');
    if(!html.includes('/field-upgrades.js')) html=html.replace('</body>','  <script src="/field-upgrades.js"></script>\n  <script src="/confidence-persistence.js"></script>\n  <script src="/pwa.js"></script>\n</body>');
    if(!html.includes('/multi-survey.js')) html=html.replace('</body>','  <script src="/bng.js"></script>\n  <script src="/rapid-protocols.js"></script>\n  <script src="/multi-survey.js"></script>\n</body>');
    const headers=new Headers(response.headers);
    headers.set('content-type','text/html; charset=utf-8');
    headers.set('cache-control','no-store');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  });
}

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  if(url.pathname.startsWith('/api/')) return;

  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{
      if(!res.ok) return res;
      const clone=res.clone();
      caches.open(CACHE).then(cache=>cache.put('/index.html',clone));
      return upgradedHtmlResponse(res);
    }).catch(()=>caches.match('/index.html').then(res=>res?upgradedHtmlResponse(res):caches.match('/offline.html'))));
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
