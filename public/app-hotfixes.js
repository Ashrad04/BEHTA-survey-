(() => {
  const RAPID_KEY='rapid-assessments-v1';
  const RAPID_DRAFT='rapid-assessment-draft-v1';

  function uid(){
    try { if (globalThis.crypto?.randomUUID) return crypto.randomUUID(); } catch {}
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function emptyStop(n){
    return {number:n,latitude:null,longitude:null,accuracy_m:null,easting:null,northing:null,grid_ref:'',positive:[],negative:[],notes:''};
  }

  function normaliseRapid(raw){
    const r = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const out = {
      id: typeof r.id === 'string' && r.id ? r.id : uid(),
      type:'rapid',
      created_at: typeof r.created_at === 'string' && r.created_at ? r.created_at : new Date().toISOString(),
      updated_at: typeof r.updated_at === 'string' && r.updated_at ? r.updated_at : new Date().toISOString(),
      site:String(r.site ?? ''), unit:String(r.unit ?? ''), surveyor:String(r.surveyor ?? ''),
      survey_date:String(r.survey_date ?? new Date().toISOString().slice(0,10)),
      protocol: window.RAPID_PROTOCOLS?.[r.protocol] ? r.protocol : 'CG8',
      method:'structured20', extent:String(r.extent ?? ''), herb_cover:String(r.herb_cover ?? ''),
      negative_cover:String(r.negative_cover ?? ''), scrub_cover:String(r.scrub_cover ?? ''),
      height_cm:String(r.height_cm ?? ''), litter_cover:String(r.litter_cover ?? ''), bare_ground:String(r.bare_ground ?? ''),
      condition:String(r.condition ?? ''), management_notes:String(r.management_notes ?? ''), notes:String(r.notes ?? ''),
      extras: r.extras && typeof r.extras === 'object' && !Array.isArray(r.extras) ? {...r.extras} : {},
      stops:[]
    };
    const sourceStops = Array.isArray(r.stops) ? r.stops : [];
    out.stops = Array.from({length:20},(_,i)=>{
      const src = sourceStops[i] && typeof sourceStops[i] === 'object' ? sourceStops[i] : {};
      const base = emptyStop(i+1);
      return {
        ...base, ...src, number:i+1,
        latitude: src.latitude === '' || src.latitude == null ? null : Number(src.latitude),
        longitude: src.longitude === '' || src.longitude == null ? null : Number(src.longitude),
        accuracy_m: src.accuracy_m === '' || src.accuracy_m == null ? null : Number(src.accuracy_m),
        easting: src.easting === '' || src.easting == null ? null : Number(src.easting),
        northing: src.northing === '' || src.northing == null ? null : Number(src.northing),
        grid_ref:String(src.grid_ref ?? ''),
        positive:Array.isArray(src.positive) ? src.positive.filter(v=>typeof v==='string') : [],
        negative:Array.isArray(src.negative) ? src.negative.filter(v=>typeof v==='string') : [],
        notes:String(src.notes ?? '')
      };
    });
    return out;
  }

  function repairRapidStorage(){
    try {
      const draftText=localStorage.getItem(RAPID_DRAFT);
      if(draftText){
        let parsed=null; try{parsed=JSON.parse(draftText)}catch{}
        if(parsed) localStorage.setItem(RAPID_DRAFT,JSON.stringify(normaliseRapid(parsed)));
        else localStorage.removeItem(RAPID_DRAFT);
      }
      const savedText=localStorage.getItem(RAPID_KEY);
      if(savedText){
        let rows=[]; try{rows=JSON.parse(savedText)}catch{}
        if(!Array.isArray(rows)) rows=[];
        localStorage.setItem(RAPID_KEY,JSON.stringify(rows.map(normaliseRapid)));
      }
    } catch {}
  }

  repairRapidStorage();
  document.addEventListener('click',event=>{
    if(event.target.closest('#hubRapid,[data-open-rapid],[data-load]')) repairRapidStorage();
  },true);

  window.addEventListener('error',event=>{
    if(!document.body.classList.contains('rapid-mode')) return;
    const msg=String(event.message||'');
    if(!/rapid|undefined|null|length|extras|stops|positive|negative/i.test(msg)) return;
    try{ localStorage.removeItem(RAPID_DRAFT); }catch{}
    setTimeout(()=>{
      const home=document.getElementById('rapidHome');
      if(home) home.click();
      let note=document.getElementById('rapidRecoveryNotice');
      if(!note){
        note=document.createElement('div'); note.id='rapidRecoveryNotice'; note.className='rapid-recovery-notice';
        const hub=document.getElementById('surveyHub'); hub?.prepend(note);
      }
      note.innerHTML='<strong>Rapid Assessment local draft repaired.</strong><span>A malformed older draft was cleared. Tap Rapid Assessment again to start or open a saved record.</span>';
    },0);
  });

  const COMMON=()=>window.RAPID_COMMON_NAMES||{};
  function decorateRapidIndicators(){
    document.querySelectorAll('#rIndicators .indicator-item span').forEach(span=>{
      if(span.dataset.named==='1') return;
      const input=span.closest('label')?.querySelector('input');
      const scientific=input?.value || span.textContent.trim();
      const common=COMMON()[scientific];
      if(!common) return;
      span.dataset.named='1';
      span.innerHTML=`<strong class="rapid-common">${escapeHtml(common)}</strong><em class="rapid-scientific">${escapeHtml(scientific)}</em>`;
    });
  }
  function decorateRapidFrequency(){
    document.querySelectorAll('#rFrequency .freq-row:not(.head)').forEach(row=>{
      const first=row.firstElementChild;
      if(!first || first.dataset.named==='1') return;
      const scientific=first.textContent.trim(); const common=COMMON()[scientific];
      if(!common) return;
      first.dataset.named='1'; first.innerHTML=`<strong class="rapid-common">${escapeHtml(common)}</strong><em class="rapid-scientific">${escapeHtml(scientific)}</em>`;
    });
  }
  function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  const observer=new MutationObserver(()=>{decorateRapidIndicators();decorateRapidFrequency();});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>{decorateRapidIndicators();decorateRapidFrequency();},0);

  const PHOTO_QUERIES={
    'Ligule':'grass ligule close up botany',
    'Auricles':'grass auricles leaf collar close up',
    'Leaf sheath':'grass leaf sheath stem close up',
    'Spikelet':'grass spikelet close up labelled botany',
    'Glume':'grass glume close up spikelet',
    'Lemma':'grass lemma floret close up',
    'Palea':'grass palea floret close up',
    'Stipule':'plant stipules leaf base close up',
    'Opposite leaves':'opposite leaf arrangement stem',
    'Whorled leaves':'whorled leaf arrangement stem',
    'Calyx / sepals':'flower calyx sepals close up',
    'Corolla / petals':'flower corolla petals close up',
    'Umbel':'umbel inflorescence close up botany',
    'Raceme':'raceme inflorescence botany',
    'Panicle':'grass panicle inflorescence botany',
    'Pinnate leaf':'pinnate compound leaf close up',
    'Trifoliate leaf':'trifoliate leaf close up',
    'Ray and disc florets':'daisy ray disc florets close up',
    'Triangular sedge stem':'sedge triangular stem cross section close up'
  };

  function addStructureLinks(){
    const modal=document.getElementById('termModal');
    const title=document.getElementById('termTitle');
    const diagram=document.getElementById('termDiagram');
    if(!modal||modal.hidden||!title||!diagram) return;
    const titleText=title.textContent.trim();
    const query=PHOTO_QUERIES[titleText] || `${titleText} plant structure botany`;
    let box=modal.querySelector('.structure-photo-links');
    if(box?.dataset.query===query) return;
    if(!box){
      box=document.createElement('div');
      box.className='structure-photo-links';
      diagram.insertAdjacentElement('afterend',box);
    }
    box.dataset.query=query;
    box.innerHTML=`<div><strong>Real examples</strong><span>Open actual photographs of this structure to compare with the diagram.</span></div><div class="structure-photo-actions"><a target="_blank" rel="noopener noreferrer" href="https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=${encodeURIComponent(query)}">Wikimedia photos ↗</a><a target="_blank" rel="noopener noreferrer" href="https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}">More images ↗</a></div>`;
  }

  // Term links are added once, immediately after the existing Species ID code opens the modal.
  // Do not observe child-list mutations here: rewriting the helper itself would retrigger the observer indefinitely.
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-term],.term-card')) setTimeout(addStructureLinks,0);
  });
})();
