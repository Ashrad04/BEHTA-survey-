const $ = id => document.getElementById(id);
let currentSurvey = null;
let editingQuadratIndex = null;
let map, markers;

function uid(){ return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`; }
function today(){ return new Date().toISOString().slice(0,10); }
function switchTab(name){
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active',p.id===`tab-${name}`));
  if(name==='map') setTimeout(()=>{ initMap(); renderMap(); map.invalidateSize(); },50);
  if(name==='records') loadSaved();
}

document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));

function blankSurvey(){ return { id:'', created_at:'', site:'', parcel:'', agreement_ref:'', surveyor:'', survey_date:today(), weather:'', habitat_code:'', habitat_name:'', feature_extent:'', status:'Draft', management:'', pressures:'', overall_condition:'', condition_notes:'', quadrats:[] }; }
function collectSurvey(){
  const s=currentSurvey||blankSurvey();
  Object.assign(s,{id:$('surveyId').value,site:$('site').value,parcel:$('parcel').value,agreement_ref:$('agreementRef').value,surveyor:$('surveyor').value,survey_date:$('surveyDate').value,weather:$('weather').value,habitat_code:$('habitatCode').value,habitat_name:$('habitatName').value,feature_extent:$('featureExtent').value,status:$('status').value,management:$('management').value,pressures:$('pressures').value,overall_condition:$('overallCondition').value,condition_notes:$('conditionNotes').value});
  currentSurvey=s; return s;
}
function fillSurvey(s){
  currentSurvey=s;
  const pairs={surveyId:'id',site:'site',parcel:'parcel',agreementRef:'agreement_ref',surveyor:'surveyor',surveyDate:'survey_date',weather:'weather',habitatCode:'habitat_code',habitatName:'habitat_name',featureExtent:'feature_extent',status:'status',management:'management',pressures:'pressures',overallCondition:'overall_condition',conditionNotes:'condition_notes'};
  for(const [id,key] of Object.entries(pairs)) $(id).value=s[key]||'';
  renderQuadrats();
}
function newSurvey(){ fillSurvey(blankSurvey()); switchTab('survey'); }

async function saveSurvey(){
  const s=collectSurvey();
  const r=await fetch('/api/surveys',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(s)});
  const data=await r.json(); if(!r.ok) throw new Error(data.error||'Save failed');
  fillSurvey(data.survey); localStorage.setItem('behta-last-survey',JSON.stringify(data.survey)); return data.survey;
}

$('surveyForm').addEventListener('submit',async e=>{e.preventDefault();try{await saveSurvey();alert('Survey saved.');}catch(err){alert(err.message);}});
$('newSurvey').addEventListener('click',newSurvey);
$('goQuadrats').addEventListener('click',()=>{collectSurvey();switchTab('quadrats');});

function renderQuadrats(){
  const qs=currentSurvey?.quadrats||[]; $('quadratCount').textContent=qs.length;
  $('quadratList').innerHTML=qs.length?qs.map((q,i)=>`<button class="card" style="text-align:left;width:100%" data-q="${i}"><h3>Quadrat ${q.number}</h3><div class="meta">${q.species?.length||0} species · ${q.latitude!=null?`${Number(q.latitude).toFixed(5)}, ${Number(q.longitude).toFixed(5)}`:'No GPS'}${q.accuracy_m?` · ±${Math.round(q.accuracy_m)} m`:''}</div></button>`).join(''):'<div class="empty">No quadrats yet. Add the first field quadrat.</div>';
  document.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>openQuadrat(Number(b.dataset.q))));
}

function blankQuadrat(){return {id:uid(),number:(currentSurvey?.quadrats?.length||0)+1,latitude:null,longitude:null,accuracy_m:null,grid_ref:'',size_m:'',vegetation_height_cm:'',bare_ground_pct:'',scrub_pct:'',litter_pct:'',photo_data:'',species:[],notes:''};}
function openQuadrat(index){
  collectSurvey(); editingQuadratIndex=index; const q=currentSurvey.quadrats[index];
  $('quadratEditor').classList.remove('hidden'); $('quadratTitle').textContent=`Quadrat ${q.number}`;
  $('qLat').value=q.latitude??'';$('qLng').value=q.longitude??'';$('qAccuracy').value=q.accuracy_m??'';$('qGridRef').value=q.grid_ref||'';$('qSize').value=q.size_m||'';$('qHeight').value=q.vegetation_height_cm||'';$('qBare').value=q.bare_ground_pct||'';$('qScrub').value=q.scrub_pct||'';$('qLitter').value=q.litter_pct||'';$('qNotes').value=q.notes||'';
  $('qPhotoPreview').src=q.photo_data||'';$('qPhotoPreview').classList.toggle('hidden',!q.photo_data);
  renderSpecies(q.species||[]); $('quadratEditor').scrollIntoView({behavior:'smooth',block:'start'});
}
function collectQuadrat(){
  const q=currentSurvey.quadrats[editingQuadratIndex];
  Object.assign(q,{latitude:$('qLat').value===''?null:Number($('qLat').value),longitude:$('qLng').value===''?null:Number($('qLng').value),accuracy_m:$('qAccuracy').value===''?null:Number($('qAccuracy').value),grid_ref:$('qGridRef').value,size_m:$('qSize').value,vegetation_height_cm:$('qHeight').value,bare_ground_pct:$('qBare').value,scrub_pct:$('qScrub').value,litter_pct:$('qLitter').value,notes:$('qNotes').value,species:[...document.querySelectorAll('.species-row')].map(row=>({common_name:row.querySelector('.sp-common').value,scientific_name:row.querySelector('.sp-scientific').value,abundance:row.querySelector('.sp-abundance').value,indicator:row.querySelector('.sp-indicator').value,notes:''})).filter(s=>s.common_name||s.scientific_name)});
  return q;
}
function addQuadrat(){ collectSurvey(); currentSurvey.quadrats.push(blankQuadrat()); renderQuadrats(); openQuadrat(currentSurvey.quadrats.length-1); }
$('addQuadrat').addEventListener('click',addQuadrat);
$('closeQuadrat').addEventListener('click',()=>{$('quadratEditor').classList.add('hidden');});
$('saveQuadrat').addEventListener('click',async()=>{try{collectQuadrat();await saveSurvey();renderQuadrats();alert('Quadrat saved.');}catch(e){alert(e.message);}});
$('saveNext').addEventListener('click',async()=>{try{collectQuadrat();await saveSurvey();currentSurvey.quadrats.push(blankQuadrat());renderQuadrats();openQuadrat(currentSurvey.quadrats.length-1);}catch(e){alert(e.message);}});
$('deleteQuadrat').addEventListener('click',()=>{if(editingQuadratIndex==null)return;if(confirm('Delete this quadrat?')){currentSurvey.quadrats.splice(editingQuadratIndex,1);currentSurvey.quadrats.forEach((q,i)=>q.number=i+1);editingQuadratIndex=null;$('quadratEditor').classList.add('hidden');renderQuadrats();}});

function speciesRow(s={}){return `<div class="species-row"><label>Common name<input class="sp-common" value="${esc(s.common_name||'')}"></label><label>Scientific name<input class="sp-scientific" value="${esc(s.scientific_name||'')}"></label><label>Abundance<select class="sp-abundance"><option></option>${['Present','Rare','Occasional','Frequent','Abundant','Dominant'].map(x=>`<option ${s.abundance===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Indicator<select class="sp-indicator"><option></option>${['Positive','Negative','Neutral / not set'].map(x=>`<option ${s.indicator===x?'selected':''}>${x}</option>`).join('')}</select></label><button class="btn remove" type="button">Remove</button></div>`;}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderSpecies(list){$('speciesRows').innerHTML=list.map(speciesRow).join('');hookSpeciesRemove();}
function hookSpeciesRemove(){document.querySelectorAll('.species-row .remove').forEach(b=>b.onclick=()=>b.closest('.species-row').remove());}
$('addSpecies').addEventListener('click',()=>{$('speciesRows').insertAdjacentHTML('beforeend',speciesRow());hookSpeciesRemove();});

$('gpsButton').addEventListener('click',()=>{
  if(!navigator.geolocation){$('gpsStatus').textContent='GPS is not supported on this device.';return;}
  $('gpsStatus').textContent='Getting GPS fix…';
  navigator.geolocation.getCurrentPosition(pos=>{const {latitude,longitude,accuracy}=pos.coords;$('qLat').value=latitude.toFixed(7);$('qLng').value=longitude.toFixed(7);$('qAccuracy').value=Math.round(accuracy);$('gpsStatus').textContent=`Location captured ±${Math.round(accuracy)} m.`;},err=>{$('gpsStatus').textContent=`GPS unavailable: ${err.message}`;},{enableHighAccuracy:true,timeout:20000,maximumAge:0});
});
$('clearGps').addEventListener('click',()=>{$('qLat').value='';$('qLng').value='';$('qAccuracy').value='';$('gpsStatus').textContent='Location cleared.';});
$('qPhoto').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{const q=currentSurvey.quadrats[editingQuadratIndex];q.photo_data=reader.result;$('qPhotoPreview').src=reader.result;$('qPhotoPreview').classList.remove('hidden');};reader.readAsDataURL(f);});

function initMap(){ if(map)return; map=L.map('map').setView([54.66,-1.19],10);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:20,attribution:'© OpenStreetMap contributors'}).addTo(map);markers=L.layerGroup().addTo(map); }
function renderMap(){ if(!map)return;markers.clearLayers();const pts=[];(currentSurvey?.quadrats||[]).forEach(q=>{if(q.latitude!=null&&q.longitude!=null){const m=L.marker([q.latitude,q.longitude]).bindPopup(`<b>Quadrat ${q.number}</b><br>${q.species?.length||0} species`);m.addTo(markers);pts.push([q.latitude,q.longitude]);}});$('mapCount').textContent=`${pts.length} point${pts.length===1?'':'s'}`;if(pts.length)map.fitBounds(pts,{padding:[30,30],maxZoom:17});}

async function loadSaved(){
  try{const r=await fetch('/api/surveys');const data=await r.json();const list=data.surveys||[];$('savedList').innerHTML=list.length?list.map(s=>`<div class="card"><h3>${esc(s.site||'Unnamed site')}</h3><div class="meta">${esc(s.parcel||'No parcel')} · ${esc(s.survey_date||'No date')} · ${esc(s.habitat_code||'No code')} ${esc(s.habitat_name||'')}<br>${s.quadrats?.length||0} quadrats · ${esc(s.status||'Draft')}</div><div class="button-row" style="margin-top:.7rem"><button class="btn load-survey" data-id="${s.id}">Open</button><button class="btn danger delete-survey" data-id="${s.id}">Delete</button></div></div>`).join(''):'<div class="empty">No surveys saved yet.</div>';
  document.querySelectorAll('.load-survey').forEach(b=>b.onclick=()=>{const s=list.find(x=>x.id===b.dataset.id);fillSurvey(s);switchTab('survey');});document.querySelectorAll('.delete-survey').forEach(b=>b.onclick=async()=>{if(confirm('Delete this saved survey?')){await fetch(`/api/surveys/${b.dataset.id}`,{method:'DELETE'});loadSaved();}});
  }catch(e){$('savedList').innerHTML=`<div class="empty">Could not load surveys: ${esc(e.message)}</div>`;}
}
$('refreshRecords').addEventListener('click',loadSaved);$('exportCsv').addEventListener('click',()=>location.href='/api/export.csv');$('exportGeo').addEventListener('click',()=>location.href='/api/export.geojson');

async function health(){try{const r=await fetch('/api/health');const d=await r.json();$('onlineState').textContent=d.ok?'Online':'Storage error';}catch{$('onlineState').textContent='Offline';}}
window.addEventListener('online',health);window.addEventListener('offline',health);
if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});

(function init(){ const cached=localStorage.getItem('behta-last-survey'); if(cached){try{fillSurvey(JSON.parse(cached));}catch{newSurvey();}}else newSurvey(); health(); })();
