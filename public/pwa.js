(() => {
  let promptEvent = null;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

  function loadUiUpgrades(){
    if(!document.querySelector('link[href="/ui-upgrades.css"]')){
      const link=document.createElement('link');link.rel='stylesheet';link.href='/ui-upgrades.css';document.head.appendChild(link);
    }
    ['/term-illustrations.js','/app-navigation.js'].forEach(src=>{
      if(document.querySelector(`script[src="${src}"]`)) return;
      const script=document.createElement('script');script.src=src;script.async=false;document.body.appendChild(script);
    });
  }

  function addButton(){
    if(standalone() || document.getElementById('installAppBtn')) return;
    const header=document.querySelector('.topbar');
    if(!header) return;
    let actions=header.querySelector('.pwa-header-actions');
    if(!actions){
      actions=document.createElement('div');
      actions.className='pwa-header-actions';
      const state=document.getElementById('onlineState');
      if(state) actions.appendChild(state);
      header.appendChild(actions);
    }
    const b=document.createElement('button');
    b.id='installAppBtn'; b.type='button'; b.className='install-app-btn'; b.textContent='Install app';
    b.hidden=!ios && !promptEvent;
    b.addEventListener('click',async()=>{
      if(ios && !promptEvent){ showIosHelp(); return; }
      if(!promptEvent) return;
      promptEvent.prompt();
      try{ await promptEvent.userChoice; }catch{}
      promptEvent=null; b.remove();
    });
    actions.insertBefore(b,actions.firstChild);
  }

  function showIosHelp(){
    document.getElementById('pwaInstallHelp')?.remove();
    const box=document.createElement('div');
    box.id='pwaInstallHelp'; box.className='pwa-install-help';
    box.innerHTML='<strong>Install Field Surveys</strong><span>In Safari, tap Share then <b>Add to Home Screen</b>.</span><button type="button">Close</button>';
    box.querySelector('button').onclick=()=>box.remove();
    document.body.appendChild(box);
  }

  loadUiUpgrades();
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;addButton();const b=document.getElementById('installAppBtn');if(b)b.hidden=false;});
  addEventListener('appinstalled',()=>{promptEvent=null;document.getElementById('installAppBtn')?.remove();});
  addEventListener('load',addButton);
  if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
})();
