(() => {
  let promptEvent = null;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

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
    box.innerHTML='<strong>Install BEHTA Recorder</strong><span>In Safari, tap Share then <b>Add to Home Screen</b>.</span><button type="button">Close</button>';
    box.querySelector('button').onclick=()=>box.remove();
    document.body.appendChild(box);
  }

  addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;addButton();const b=document.getElementById('installAppBtn');if(b)b.hidden=false;});
  addEventListener('appinstalled',()=>{promptEvent=null;document.getElementById('installAppBtn')?.remove();});
  addEventListener('load',addButton);
})();
