(() => {
  function openSpeciesForm(){
    const form=document.getElementById('newSpeciesForm');
    if(!form) return;
    form.classList.remove('hidden');
    const common=document.getElementById('newCommon');
    setTimeout(()=>{
      try{ form.scrollIntoView({behavior:'smooth',block:'center'}); }catch{}
      try{ common?.focus({preventScroll:true}); }catch{}
    },0);
  }

  function fallbackConfirm(){
    const form=document.getElementById('newSpeciesForm');
    if(!form || form.classList.contains('hidden')) return;
    const common=document.getElementById('newCommon')?.value.trim()||'';
    const scientific=document.getElementById('newScientific')?.value.trim()||'';
    if(!common && !scientific) return;
    try{
      if(typeof currentSurvey==='undefined' || editingQuadratIndex==null) return;
      const q=currentSurvey?.quadrats?.[editingQuadratIndex];
      if(!q) return;
      const indicator=document.getElementById('newIndicator')?.value||'Neutral / not set';
      const candidate=normaliseSpecies({common_name:common,scientific_name:scientific,indicator});
      const key=speciesKey(candidate);
      if(!Array.isArray(q.species)) q.species=[];
      if(!q.species.some(s=>speciesKey(s)===key)) q.species.push(candidate);
      if(!speciesPool.some(s=>speciesKey(s)===key)) speciesPool.push(candidate);
      document.getElementById('newCommon').value='';
      document.getElementById('newScientific').value='';
      const sel=document.getElementById('newIndicator'); if(sel) sel.value='Neutral / not set';
      form.classList.add('hidden');
      rebuildSpeciesPool();
      renderSpeciesPool();
      updateQuadratSummary();
      if(typeof flash==='function') flash('Species added');
    }catch(err){
      console.error('Species fallback failed',err);
    }
  }

  document.addEventListener('click',event=>{
    const add=event.target.closest('#addSpecies');
    if(add){
      setTimeout(()=>{
        const form=document.getElementById('newSpeciesForm');
        if(form?.classList.contains('hidden')) openSpeciesForm();
      },0);
      return;
    }
    const confirm=event.target.closest('#confirmSpecies');
    if(confirm){
      const beforeCommon=document.getElementById('newCommon')?.value.trim()||'';
      const beforeScientific=document.getElementById('newScientific')?.value.trim()||'';
      setTimeout(()=>{
        const form=document.getElementById('newSpeciesForm');
        const common=document.getElementById('newCommon')?.value.trim()||'';
        const scientific=document.getElementById('newScientific')?.value.trim()||'';
        const normalHandlerSucceeded = form?.classList.contains('hidden') && !common && !scientific;
        if(!normalHandlerSucceeded && (beforeCommon||beforeScientific)) fallbackConfirm();
      },0);
    }
  },false);
})();
