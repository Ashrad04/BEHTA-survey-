(() => {
  const queries={
    'Ligule':'grass ligule botanical close up','Auricles':'grass auricles botanical close up','Leaf sheath':'grass leaf sheath botanical','Spikelet':'grass spikelet anatomy photograph','Glume':'grass glume spikelet photograph','Lemma':'grass lemma spikelet photograph','Palea':'grass palea spikelet photograph','Stipule':'plant stipule leaf base photograph','Opposite leaves':'opposite leaf arrangement plant','Whorled leaves':'whorled leaf arrangement plant','Calyx / sepals':'flower calyx sepals close up','Corolla / petals':'flower corolla petals anatomy','Umbel':'umbel inflorescence plant photograph','Raceme':'raceme inflorescence plant photograph','Panicle':'panicle inflorescence grass photograph','Pinnate leaf':'pinnate compound leaf photograph','Trifoliate leaf':'trifoliate leaf photograph','Ray and disc florets':'daisy ray disc florets close up','Triangular sedge stem':'Carex triangular stem sedge cross section'
  };

  function encode(q){return encodeURIComponent(q)}
  function addLinks(){
    const modal=document.getElementById('termModal');
    const title=document.getElementById('termTitle')?.textContent?.trim();
    const definition=document.getElementById('termDefinition');
    if(!modal||modal.hidden||!title||!definition) return;
    let row=document.getElementById('termRealImages');
    if(row) row.remove();
    const q=queries[title]||`${title} botany plant structure`;
    row=document.createElement('div');
    row.id='termRealImages';
    row.className='term-real-images';
    row.innerHTML=`<div><strong>Compare with real material</strong><span>Open external image results showing the structure on actual plants. Check several examples because appearance varies between species.</span></div><div class="term-real-actions"><a target="_blank" rel="noopener noreferrer" href="https://commons.wikimedia.org/w/index.php?search=${encode(q)}&title=Special:MediaSearch&type=image">Wikimedia Commons photos ↗</a><a target="_blank" rel="noopener noreferrer" href="https://www.google.com/search?tbm=isch&q=${encode(q+' botany')}">More reference images ↗</a></div>`;
    definition.insertAdjacentElement('afterend',row);
  }

  const observer=new MutationObserver(addLinks);
  function init(){
    const modal=document.getElementById('termModal');
    if(!modal){setTimeout(init,250);return;}
    observer.observe(modal,{attributes:true,attributeFilter:['hidden'],subtree:true,childList:true});
    document.addEventListener('click',e=>{if(e.target.closest('[data-term]'))setTimeout(addLinks,0)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
