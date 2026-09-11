const $ = id => document.getElementById(id);
let currentSurvey = null;
let editingQuadratIndex = null;
let map, markers;
let speciesPool = [];

function uid(){ return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`; }
function today(){ return new Date().toISOString().slice(0,10); }
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function speciesKey(s){ return (s.scientific_name||s.common_name||'').trim().toLowerCase(); }
function normaliseSpecies(s){return {common_name:s.common_name||'',scientific_name:s.scientific_name||'',indicator:s.indicator||'Neutral / not set',abundance:s.abundance||'Present',notes:s.notes||''};}

const guidance = {
  'Neutral grassland':'Look for a varied sward with a mixture of grasses and broad-leaved herbs. Record positive and negative indicators consistently, note dominance by coarse grasses, nutrient enrichment, scrub, bare ground and management effects. Use the relevant verified BEHTA grassland key for formal classification.',
  'Calcareous grassland':'Pay particular attention to short, open, species-rich turf, calcicolous herbs, scrub encroachment, rank growth and bare ground. Confirm the substrate and use the relevant verified BEHTA key before assigning habitat condition.',
  'Acid grassland':'Record the balance of fine grasses, acid-tolerant herbs and any heath or rush influence. Note enrichment, bracken, scrub, poaching and shifts towards coarse grass dominance. Formal assessment should follow the verified acid-grassland BEHTA guidance.',
  'Marshy grassland':'Record wetland herbs, rushes, sedges and the spatial pattern of wetter ground. Note drainage, poaching, scrub, dominant rush cover and evidence of drying or enrichment. Use the verified wet-grassland BEHTA criteria for formal interpretation.',
  'Semi-improved grassland':'Record retained herb richness and indicators alongside evidence of agricultural modification, reseeding, nutrient enrichment and dominance by productive grasses. Semi-improved grasslands can be heterogeneous, so keep quadrat locations representative.'
};

function switchTab(name){
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active',p.id===`tab-${name}`));
  if(name==='map') setTimeout(()=>{ initMap(); renderMap(); map.invalidateSize(); },50);
  if(name==='records') loadSaved();
  if(name==='stats') renderStats();
}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));

function blankSurvey(){ return { id:'', created_at:'', site:'', parcel:'', agreement_ref:'', surveyor:'', survey_date:today(), weather:'', habitat_code:'', habitat_name:'', feature_extent:'', status:'Draft', management:'', pressures:'', overall_condition:'', condition_notes:'', quadrats:[] }; }
function collectSurvey(){
  const s=currentSurvey||blankSurvey();
  Object.assign(s,{id:$('surveyId').value,site:$('site').value,parcel:$('parcel').value,agreement_ref:$('agreementRef').value,surveyor:$('surveyor').value,survey_date:$('surveyDate').value,weather:$('weather').value,habitat_code:$('habitatCode').value,habitat_name:$('habitatName').value,feature_extent:$('featureExtent').value,status:$('status').value,management:$('management').value,pressures:$('pressures').value,overall_condition:$('overallCondition').value,condition_notes:$('conditionNotes').value});
  currentSurvey=s; rebuildSpeciesPool(); updateActiveSurveyBar(); return s;
}
function fillSurvey(s){
  currentSurvey=s;
  const pairs={surveyId:'id',site:'site',parcel:'parcel',agreementRef:'agreement_ref',surveyor:'surveyor',surveyDate:'survey_date',weather:'weather',habitatCode:'habitat_code',habitatName:'habitat_name',featureExtent:'feature_extent',status:'status',management:'management',pressures:'pressures',overallCondition:'overall_condition',conditionNotes:'condition_notes'};
  for(const [id,key] of Object.entries(pairs)) $(id).value=s[key]||'';
  rebuildSpeciesPool(); renderQuadrats(); updateHabitatSelection(); updateActiveSurveyBar();
}
function newSurvey(){ fillSurvey(blankSurvey()); switchTab('survey'); }

async function saveSurvey(){
  const s=collectSurvey();
  const r=await fetch('/api/surveys',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(s)});
  const data=await r.json(); if(!r.ok) throw new Error(data.error||'Save failed');
  fillSurvey(data.survey); localStorage.setItem('behta-last-survey',JSON.stringify(data.survey)); return data.survey;
}
$('surveyForm').addEventListener('submit',async e=>{e.preventDefault();try{await saveSurvey();flash('Survey saved.');}catch(err){alert(err.message);}});
$('newSurvey').addEventListener('click',newSurvey);
$('goQuadrats').addEventListener('click',()=>{collectSurvey();switchTab('quadrats');});

function flash(msg){ const state=$('onlineState'); const old=state.textContent; state.textContent=msg; setTimeout(()=>state.textContent=old,1800); }
function updateActiveSurveyBar(){
  const bar=$('activeSurveyBar'); if(!currentSurvey?.site){bar.classList.add('hidden');return;} bar.classList.remove('hidden');
  $('activeSurveyName').textContent=currentSurvey.site; $('activeSurveyMeta').textContent=`${currentSurvey.parcel?` · ${currentSurvey.parcel}`:''}${currentSurvey.habitat_name?` · ${currentSurvey.habitat_name}`:''}`;
  const q=currentSurvey.quadrats?.length||0; $('surveyProgress').style.width=`${Math.min(100,q*10)}%`;
}

function selectHabitat(name){ $('habitatName').value=name; updateHabitatSelection(); collectSurvey(); }
document.querySelectorAll('.habitat-card').forEach(b=>b.onclick=()=>selectHabitat(b.dataset.habitat));
$('habitatName').addEventListener('input',updateHabitatSelection);
function updateHabitatSelection(){
  const name=$('habitatName').value;
  document.querySelectorAll('.habitat-card').forEach(b=>b.classList.toggle('selected',b.dataset.habitat===name));
  const box=$('habitatGuidance'); if(guidance[name]){box.classList.remove('hidden');$('guidanceText').textContent=guidance[name];}else box.classList.add('hidden');
}

function renderQuadrats(){
  const qs=currentSurvey?.quadrats||[]; $('quadratCount').textContent=qs.length;
  $('quadratList').innerHTML=qs.length?qs.map((q,i)=>`<button class="quadrat-card" data-q="${i}"><div class="quadrat-number">${q.number}</div><div><strong>Quadrat ${q.number}</strong><span>${q.species?.length||0} species · ${q.latitude!=null?'GPS ✓':'No GPS'}${q.accuracy_m?` · ±${Math.round(q.accuracy_m)} m`:''}</span></div><span class="chevron">›</span></button>`).join(''):'<div class="empty"><strong>No quadrats yet.</strong><br>Add the first field quadrat to begin building the survey species pool.</div>';
  document.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>openQuadrat(Number(b.dataset.q))));
  updateActiveSurveyBar();
}
function blankQuadrat(){return {id:uid(),number:(currentSurvey?.quadrats?.length||0)+1,latitude:null,longitude:null,accuracy_m:null,grid_ref:'',size_m:'',vegetation_height_cm:'',bare_ground_pct:'',scrub_pct:'',litter_pct:'',photo_data:'',species:[],notes:''};}
function openQuadrat(index){
  collectSurvey(); editingQuadratIndex=index; const q=currentSurvey.quadrats[index];
  $('quadratEditor').classList.remove('hidden'); $('quadratTitle').textContent=`Quadrat ${q.number}`;
  $('qLat').value=q.latitude??'';$('qLng').value=q.longitude??'';$('qAccuracy').value=q.accuracy_m??'';$('qGridRef').value=q.grid_ref||'';$('qSize').value=q.size_m||'';$('qHeight').value=q.vegetation_height_cm||'';$('qBare').value=q.bare_ground_pct||'';$('qScrub').value=q.scrub_pct||'';$('qLitter').value=q.litter_pct||'';$('qNotes').value=q.notes||'';
  $('qPhotoPreview').src=q.photo_data||'';$('qPhotoPreview').classList.toggle('hidden',!q.photo_data);
  $('gpsStatus').textContent=q.latitude!=null?`Captured${q.accuracy_m?` ±${Math.round(q.accuracy_m)} m`:''}`:'No location';
  rebuildSpeciesPool(); renderSpeciesPool(); updateQuadratSummary(); $('quadratEditor').scrollIntoView({behavior:'smooth',block:'start'});
}
function collectQuadrat(){
  const q=currentSurvey.quadrats[editingQuadratIndex]; if(!q)return null;
  const selected=[...document.querySelectorAll('.species-chip.present')].map(el=>speciesPool.find(s=>speciesKey(s)===el.dataset.key)).filter(Boolean).map(normaliseSpecies);
  Object.assign(q,{latitude:$('qLat').value===''?null:Number($('qLat').value),longitude:$('qLng').value===''?null:Number($('qLng').value),accuracy_m:$('qAccuracy').value===''?null:Number($('qAccuracy').value),grid_ref:$('qGridRef').value,size_m:$('qSize').value,vegetation_height_cm:$('qHeight').value,bare_ground_pct:$('qBare').value,scrub_pct:$('qScrub').value,litter_pct:$('qLitter').value,notes:$('qNotes').value,species:selected});
  rebuildSpeciesPool(); return q;
}
function addQuadrat(){ collectSurvey(); if(!currentSurvey.site){switchTab('survey');alert('Enter a site name first.');return;} currentSurvey.quadrats.push(blankQuadrat()); renderQuadrats(); openQuadrat(currentSurvey.quadrats.length-1); }
$('addQuadrat').addEventListener('click',addQuadrat);
$('closeQuadrat').addEventListener('click',()=>{$('quadratEditor').classList.add('hidden');});
$('saveQuadrat').addEventListener('click',async()=>{try{collectQuadrat();await saveSurvey();renderQuadrats();flash('Quadrat saved');}catch(e){alert(e.message);}});
$('saveNext').addEventListener('click',async()=>{try{collectQuadrat();await saveSurvey();currentSurvey.quadrats.push(blankQuadrat());renderQuadrats();openQuadrat(currentSurvey.quadrats.length-1);}catch(e){alert(e.message);}});
$('deleteQuadrat').addEventListener('click',()=>{if(editingQuadratIndex==null)return;if(confirm('Delete this quadrat?')){currentSurvey.quadrats.splice(editingQuadratIndex,1);currentSurvey.quadrats.forEach((q,i)=>q.number=i+1);editingQuadratIndex=null;$('quadratEditor').classList.add('hidden');rebuildSpeciesPool();renderQuadrats();}});

function rebuildSpeciesPool(){
  const pool=new Map();
  (currentSurvey?.quadrats||[]).forEach(q=>(q.species||[]).forEach(raw=>{const s=normaliseSpecies(raw), key=speciesKey(s); if(!key)return; const prev=pool.get(key); if(!prev||prev.indicator==='Neutral / not set')pool.set(key,{...s});}));
  speciesPool=[...pool.values()];
}
function speciesFrequency(s){ const qs=currentSurvey?.quadrats||[]; if(!qs.length)return 0; const key=speciesKey(s); return qs.filter(q=>(q.species||[]).some(x=>speciesKey(x)===key)).length; }
function currentPresenceKeys(){ const q=currentSurvey?.quadrats?.[editingQuadratIndex]; return new Set((q?.species||[]).map(speciesKey)); }
function renderSpeciesPool(){
  if(editingQuadratIndex==null)return;
  const filter=$('speciesFilter').value.trim().toLowerCase(); const sort=$('speciesSort').value; const present=currentPresenceKeys();
  let list=[...speciesPool].filter(s=>`${s.common_name} ${s.scientific_name}`.toLowerCase().includes(filter));
  if(sort==='alpha') list.sort((a,b)=>(a.common_name||a.scientific_name).localeCompare(b.common_name||b.scientific_name));
  else if(sort==='indicator') list.sort((a,b)=>(a.indicator==='Positive'?-1:a.indicator==='Negative'?0:1)-(b.indicator==='Positive'?-1:b.indicator==='Negative'?0:1));
  else list.sort((a,b)=>speciesFrequency(b)-speciesFrequency(a)||(a.common_name||a.scientific_name).localeCompare(b.common_name||b.scientific_name));
  $('poolCount').textContent=`${speciesPool.length} in pool`;
  $('speciesPool').innerHTML=list.length?list.map(s=>{const key=speciesKey(s), freq=speciesFrequency(s), klass=s.indicator==='Positive'?'positive':s.indicator==='Negative'?'negative':'';return `<button type="button" class="species-chip ${present.has(key)?'present':''} ${klass}" data-key="${esc(key)}"><span class="tick">${present.has(key)?'✓':'+'}</span><span><strong>${esc(s.common_name||s.scientific_name)}</strong>${s.scientific_name&&s.common_name?`<small>${esc(s.scientific_name)}</small>`:''}</span><em>${freq}</em></button>`;}).join(''):'<div class="empty mini-empty">No matching species. Add a new species below.</div>';
  document.querySelectorAll('.species-chip').forEach(b=>b.onclick=()=>{b.classList.toggle('present');b.querySelector('.tick').textContent=b.classList.contains('present')?'✓':'+'; updateQuadratSummary();});
}
$('speciesFilter').addEventListener('input',renderSpeciesPool);$('speciesSort').addEventListener('change',renderSpeciesPool);
$('addSpecies').addEventListener('click',()=>{$('newSpeciesForm').classList.remove('hidden');$('newCommon').focus();});
$('cancelSpecies').addEventListener('click',()=>{$('newSpeciesForm').classList.add('hidden');});
$('confirmSpecies').addEventListener('click',()=>{
  const common=$('newCommon').value.trim(), scientific=$('newScientific').value.trim(); if(!common&&!scientific){alert('Enter a common or scientific name.');return;}
  const candidate=normaliseSpecies({common_name:common,scientific_name:scientific,indicator:$('newIndicator').value}); const key=speciesKey(candidate);
  if(!speciesPool.some(s=>speciesKey(s)===key))speciesPool.push(candidate);
  const q=currentSurvey.quadrats[editingQuadratIndex]; if(!q.species.some(s=>speciesKey(s)===key))q.species.push(candidate);
  $('newCommon').value='';$('newScientific').value='';$('newIndicator').value='Neutral / not set';$('newSpeciesForm').classList.add('hidden');renderSpeciesPool();updateQuadratSummary();
});
function updateQuadratSummary(){ const count=document.querySelectorAll('.species-chip.present').length; const gps=$('qLat').value!==''; $('quadratLiveSummary').textContent=`${count} species present · ${gps?'GPS captured':'GPS not captured'}`; }

$('gpsButton').addEventListener('click',()=>{
  if(!navigator.geolocation){$('gpsStatus').textContent='GPS unsupported';return;}
  $('gpsStatus').textContent='Getting fix…';
  navigator.geolocation.getCurrentPosition(pos=>{const {latitude,longitude,accuracy}=pos.coords;$('qLat').value=latitude.toFixed(7);$('qLng').value=longitude.toFixed(7);$('qAccuracy').value=Math.round(accuracy);$('gpsStatus').textContent=`Captured ±${Math.round(accuracy)} m`;updateQuadratSummary();},err=>{$('gpsStatus').textContent=`GPS unavailable`;alert(err.message);},{enableHighAccuracy:true,timeout:20000,maximumAge:0});
});
$('clearGps').addEventListener('click',()=>{$('qLat').value='';$('qLng').value='';$('qAccuracy').value='';$('gpsStatus').textContent='No location';updateQuadratSummary();});
$('qPhoto').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{const q=currentSurvey.quadrats[editingQuadratIndex];q.photo_data=reader.result;$('qPhotoPreview').src=reader.result;$('qPhotoPreview').classList.remove('hidden');};reader.readAsDataURL(f);});

function initMap(){ if(map)return; map=L.map('map').setView([54.66,-1.19],10);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:20,attribution:'© OpenStreetMap contributors'}).addTo(map);markers=L.layerGroup().addTo(map); }
function renderMap(){ if(!map)return;markers.clearLayers();const pts=[];(currentSurvey?.quadrats||[]).forEach(q=>{if(q.latitude!=null&&q.longitude!=null){const icon=L.divIcon({className:'numbered-marker',html:`<span>${q.number}</span>`,iconSize:[34,34],iconAnchor:[17,17]});L.marker([q.latitude,q.longitude],{icon}).bindPopup(`<b>Quadrat ${q.number}</b><br>${q.species?.length||0} species`).addTo(markers);pts.push([q.latitude,q.longitude]);}});$('mapCount').textContent=`${pts.length} point${pts.length===1?'':'s'}`;if(pts.length)map.fitBounds(pts,{padding:[30,30],maxZoom:17});}

function allSpeciesStats(){
  const qs=currentSurvey?.quadrats||[]; const map=new Map(); qs.forEach(q=>(q.species||[]).forEach(raw=>{const s=normaliseSpecies(raw),key=speciesKey(s);if(!key)return;if(!map.has(key))map.set(key,{...s,count:0});map.get(key).count++;}));
  return [...map.values()].sort((a,b)=>b.count-a.count||(a.common_name||a.scientific_name).localeCompare(b.common_name||b.scientific_name));
}
function renderStats(){
  const qs=currentSurvey?.quadrats||[]; const species=allSpeciesStats(); const total=species.length; const mean=qs.length?(qs.reduce((a,q)=>a+(q.species?.length||0),0)/qs.length):0; const positives=species.filter(s=>s.indicator==='Positive').length; const negatives=species.filter(s=>s.indicator==='Negative').length;
  $('statsSurveyName').textContent=currentSurvey?.site?`${currentSurvey.site}${currentSurvey.parcel?` · ${currentSurvey.parcel}`:''}`:'No active survey';
  $('statCards').innerHTML=[['Quadrats',qs.length],['Total species',total],['Mean richness',mean.toFixed(1)],['Positive indicators',positives],['Negative indicators',negatives]].map(([label,val])=>`<div class="stat-card"><strong>${val}</strong><span>${label}</span></div>`).join('');
  $('frequencyTable').innerHTML=species.length?species.map(s=>{const pct=qs.length?Math.round(s.count/qs.length*100):0;return `<div class="frequency-row"><div class="frequency-name"><strong>${esc(s.common_name||s.scientific_name)}</strong><span>${s.count}/${qs.length} quadrats</span></div><div class="bar"><i style="width:${pct}%"></i></div><b>${pct}%</b></div>`;}).join(''):'<div class="empty">Add quadrats and species to generate frequency statistics.</div>';
  const max=Math.max(1,...qs.map(q=>q.species?.length||0)); $('richnessChart').innerHTML=qs.length?qs.map(q=>`<div class="richness-col"><span>${q.species?.length||0}</span><i style="height:${Math.max(6,((q.species?.length||0)/max)*120)}px"></i><small>Q${q.number}</small></div>`).join(''):'<div class="empty">No quadrat data yet.</div>';
  const pos=species.filter(s=>s.indicator==='Positive'), neg=species.filter(s=>s.indicator==='Negative'); $('indicatorStats').innerHTML=`<div class="indicator-grid"><div><strong class="positive-text">${pos.length}</strong><span>positive indicator species recorded</span></div><div><strong class="negative-text">${neg.length}</strong><span>negative indicator species recorded</span></div></div>${[...pos,...neg].length?`<div class="indicator-list">${[...pos,...neg].map(s=>`<span class="indicator-tag ${s.indicator==='Positive'?'positive':'negative'}">${esc(s.common_name||s.scientific_name)} · ${s.count}/${qs.length}</span>`).join('')}</div>`:''}`;
}

async function loadSaved(){
  try{const r=await fetch('/api/surveys');const data=await r.json();const list=data.surveys||[];$('savedList').innerHTML=list.length?list.map(s=>`<div class="saved-card"><div><strong>${esc(s.site||'Unnamed site')}</strong><span>${esc(s.parcel||'No parcel')} · ${esc(s.survey_date||'No date')} · ${esc(s.habitat_name||s.habitat_code||'Grassland')}</span><small>${s.quadrats?.length||0} quadrats · ${esc(s.status||'Draft')}</small></div><div class="button-row"><button class="btn secondary load-survey" data-id="${s.id}">Open</button><button class="btn danger ghost-danger delete-survey" data-id="${s.id}">Delete</button></div></div>`).join(''):'<div class="empty">No surveys saved yet.</div>';
  document.querySelectorAll('.load-survey').forEach(b=>b.onclick=()=>{const s=list.find(x=>x.id===b.dataset.id);fillSurvey(s);switchTab('survey');});document.querySelectorAll('.delete-survey').forEach(b=>b.onclick=async()=>{if(confirm('Delete this saved survey?')){await fetch(`/api/surveys/${b.dataset.id}`,{method:'DELETE'});loadSaved();}});
  }catch(e){$('savedList').innerHTML=`<div class="empty">Could not load surveys: ${esc(e.message)}</div>`;}
}
$('refreshRecords').addEventListener('click',loadSaved);$('exportCsv').addEventListener('click',()=>location.href='/api/export.csv');$('exportGeo').addEventListener('click',()=>location.href='/api/export.geojson');

async function health(){try{const r=await fetch('/api/health');const d=await r.json();$('onlineState').textContent=d.ok?'Online':'Storage error';$('onlineState').classList.toggle('offline',!d.ok);}catch{$('onlineState').textContent='Offline';$('onlineState').classList.add('offline');}}
window.addEventListener('online',health);window.addEventListener('offline',health);
if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});

(function init(){ const cached=localStorage.getItem('behta-last-survey'); if(cached){try{fillSurvey(JSON.parse(cached));}catch{newSurvey();}}else newSurvey(); health(); })();