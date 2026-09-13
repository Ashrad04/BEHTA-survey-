(() => {
  const DRAFT_KEY='rapid-assessment-draft-v1';
  const SAVED_KEY='rapid-assessments-v1';

  const blankStop=n=>({number:n,latitude:null,longitude:null,accuracy_m:null,easting:null,northing:null,grid_ref:'',positive:[],negative:[],notes:''});
  const asString=v=>v==null?'':String(v);

  function normaliseStop(raw,n){
    const s=raw&&typeof raw==='object'?raw:{};
    return {
      ...blankStop(n),
      ...s,
      number:n,
      positive:Array.isArray(s.positive)?s.positive.filter(Boolean).map(String):[],
      negative:Array.isArray(s.negative)?s.negative.filter(Boolean).map(String):[],
      notes:asString(s.notes),
      grid_ref:asString(s.grid_ref)
    };
  }

  function normaliseRapid(raw){
    const r=raw&&typeof raw==='object'?raw:{};
    const known=window.RAPID_PROTOCOLS||{};
    const protocol=known[r.protocol]?r.protocol:(known.CG8?'CG8':Object.keys(known)[0]||'CG8');
    const stops=Array.isArray(r.stops)?r.stops:[];
    return {
      ...r,
      id:r.id||((crypto.randomUUID&&crypto.randomUUID())||`${Date.now()}-${Math.random().toString(16).slice(2)}`),
      type:'rapid',
      protocol,
      method:r.method||'structured20',
      site:asString(r.site), unit:asString(r.unit), surveyor:asString(r.surveyor), survey_date:asString(r.survey_date),
      extent:asString(r.extent), herb_cover:asString(r.herb_cover), negative_cover:asString(r.negative_cover), scrub_cover:asString(r.scrub_cover),
      height_cm:asString(r.height_cm), litter_cover:asString(r.litter_cover), bare_ground:asString(r.bare_ground), condition:asString(r.condition),
      management_notes:asString(r.management_notes), notes:asString(r.notes),
      extras:r.extras&&typeof r.extras==='object'&&!Array.isArray(r.extras)?r.extras:{},
      stops:Array.from({length:20},(_,i)=>normaliseStop(stops[i],i+1))
    };
  }

  function repairStorage(){
    try{
      const raw=localStorage.getItem(DRAFT_KEY);
      if(raw){localStorage.setItem(DRAFT_KEY,JSON.stringify(normaliseRapid(JSON.parse(raw))))}
    }catch(err){console.warn('Rapid draft could not be repaired',err)}
    try{
      const raw=localStorage.getItem(SAVED_KEY);
      if(raw){
        const parsed=JSON.parse(raw);
        if(Array.isArray(parsed)) localStorage.setItem(SAVED_KEY,JSON.stringify(parsed.map(normaliseRapid)));
      }
    }catch(err){console.warn('Rapid saved records could not be repaired',err)}
  }

  // Run at startup and again immediately before Rapid Assessment opens.
  repairStorage();
  document.addEventListener('click',e=>{
    if(e.target.closest('#hubRapid,[data-open-rapid]')) repairStorage();
  },true);

  // If an older/corrupt local record still causes a client-side error, give the user a recovery action rather than leaving a dead screen.
  window.addEventListener('error',e=>{
    if(!document.body.classList.contains('rapid-mode')) return;
    console.error('Rapid Assessment error',e.error||e.message);
    let box=document.getElementById('rapidRecovery');
    if(box) return;
    box=document.createElement('div');
    box.id='rapidRecovery';
    box.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;background:#fff;border:1px solid #d9c7a7;border-radius:14px;padding:12px;box-shadow:0 12px 35px rgba(0,0,0,.18);font:14px system-ui,sans-serif;color:#2f3b33';
    box.innerHTML='<strong>Rapid Assessment hit a local data error.</strong><div style="margin-top:5px">Your saved records have not been deleted. Return to Survey types and reopen Rapid Assessment after the repair step.</div><button type="button" style="margin-top:9px;border:0;border-radius:9px;padding:8px 10px;background:#214d35;color:white;font-weight:800">Return to Survey types</button>';
    box.querySelector('button').onclick=()=>{box.remove();document.getElementById('rapidHome')?.click()||document.getElementById('surveyHomeBtn')?.click()};
    document.body.appendChild(box);
  });
})();
