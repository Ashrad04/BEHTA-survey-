(() => {
  let promptEvent = null;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ua = navigator.userAgent || '';
  const ios = /iphone|ipad|ipod/i.test(ua);
  const android = /android/i.test(ua);
  const chromeLike = /chrome|crios|edg|opr/i.test(ua);

  function loadUiUpgrades(){
    ['/ui-upgrades.css','/app-hotfixes.css','/field-species-tools.css'].forEach(href=>{
      if(document.querySelector(`link[href="${href}"]`)) return;
      const link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.appendChild(link);
    });
    ['/term-illustrations.js','/app-hotfixes.js','/app-navigation.js','/species-fallback.js','/field-species-tools.js'].forEach(src=>{
      if(document.querySelector(`script[src="${src}"]`)) return;
      const script=document.createElement('script');script.src=src;script.async=false;document.body.appendChild(script);
    });
  }

  function showLaunchBrand(){
    if(!standalone() || document.getElementById('fieldLaunchSplash')) return;
    const splash=document.createElement('div');
    splash.id='fieldLaunchSplash'; splash.className='field-launch-splash';
    splash.innerHTML='<div class="field-launch-card"><img src="/field-surveys-final-v3.svg" alt=""><strong>Field Surveys</strong><span>Grassland field surveys</span></div>';
    document.body.appendChild(splash);
    requestAnimationFrame(()=>splash.classList.add('show'));
    setTimeout(()=>{splash.classList.remove('show');setTimeout(()=>splash.remove(),220);},850);
  }

  function installHelp(){
    document.getElementById('pwaInstallHelp')?.remove();
    const box=document.createElement('div');
    box.id='pwaInstallHelp'; box.className='pwa-install-help';
    let text='Open this page in Chrome, then use the browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.';
    if(ios) text='In Safari, tap <b>Share</b> then <b>Add to Home Screen</b>.';
    else if(android && chromeLike) text='In Chrome, tap the <b>⋮</b> menu then choose <b>Install app</b> or <b>Add to Home screen</b>. If you opened this inside another app, first choose <b>Open in Chrome</b>.';
    else if(android) text='Open this page in Chrome, then tap the <b>⋮</b> menu and choose <b>Install app</b> or <b>Add to Home screen</b>.';
    box.innerHTML=`<strong>Install Field Surveys</strong><span>${text}</span><button type="button">Close</button>`;
    box.querySelector('button').onclick=()=>box.remove();
    document.body.appendChild(box);
  }

  function addButton(){
    if(standalone()) { document.getElementById('installAppBtn')?.remove(); return; }
    const header=document.querySelector('.topbar'); if(!header) return;
    let actions=header.querySelector('.pwa-header-actions');
    if(!actions){actions=document.createElement('div');actions.className='pwa-header-actions';const state=document.getElementById('onlineState');if(state)actions.appendChild(state);header.appendChild(actions);}
    let b=document.getElementById('installAppBtn');
    if(!b){b=document.createElement('button');b.id='installAppBtn';b.type='button';b.className='install-app-btn';b.textContent='Install app';b.addEventListener('click',async()=>{if(promptEvent){promptEvent.prompt();try{await promptEvent.userChoice;}catch{}promptEvent=null;if(standalone())b.remove();return;}installHelp();});actions.insertBefore(b,actions.firstChild);}
    b.hidden=false; b.title=promptEvent?'Install Field Surveys':'Show installation instructions';
  }

  loadUiUpgrades();
  showLaunchBrand();
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;addButton();});
  addEventListener('appinstalled',()=>{promptEvent=null;document.getElementById('installAppBtn')?.remove();document.getElementById('pwaInstallHelp')?.remove();});
  addEventListener('load',addButton);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)addButton();});
  if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
})();
