/* Verified BEHTA enhancements.
   G02 data below is transcribed from Natural England BEHTA Manual Part 2 extract,
   Annex 7 / Grassland Table 1 as reproduced in Forestry Commission guidance V3.1.
   No other habitat-specific indicator list is inferred here. */

const BEHTA_G02 = {
  code: 'G02',
  name: 'Semi-improved grassland',
  source: 'Natural England BEHTA Manual Part 2, Second Edition (May 2016), Grassland Table 1',
  threshold: 'At least five wildflower indicators occasional in the sward.',
  indicators: [
    'autumn hawkbit','black medick','burnet saxifrage','bulbous buttercup','common cat\'s-ear',
    'common fleabane','common sorrel','creeping cinquefoil','crosswort','cuckooflower','cuckoo flower',
    'field wood-rush','germander speedwell','hedge bedstraw','lesser trefoil','ribwort plantain',
    'meadow buttercup','red clover','selfheal','smooth hawksbeard','tufted vetch','wild carrot','yarrow'
  ],
  typicalGrasses: [
    'cock\'s-foot','cocksfoot','common bent','crested dog\'s-tail','crested dogs-tail','creeping bent',
    'false oat-grass','meadow fescue','meadow foxtail','red fescue','sweet vernal grass','timothy',
    'tufted hair-grass','yorkshire-fog'
  ],
  injuriousWeeds: [
    'creeping thistle','spear thistle','broad-leaved dock','broad leaved dock','curled dock','common ragwort'
  ]
};

function behtaName(value){
  return String(value || '').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
}
function currentBehtaType(){
  const habitat = behtaName(document.getElementById('habitatName')?.value);
  const code = behtaName(document.getElementById('habitatCode')?.value);
  if (habitat.includes('semi-improved') || code === 'g02') return 'G02';
  return null;
}
function classifyBehtaSpecies(species){
  if (currentBehtaType() !== 'G02') return { role:'unclassified', indicator:'Neutral / not set', label:'Not classified' };
  const names = [behtaName(species?.common_name), behtaName(species?.scientific_name)].filter(Boolean);
  if (names.some(n => BEHTA_G02.indicators.includes(n))) return { role:'indicator', indicator:'Positive', label:'BEHTA + indicator' };
  if (names.some(n => BEHTA_G02.typicalGrasses.includes(n))) return { role:'typical', indicator:'Neutral / not set', label:'Typical grass' };
  if (names.some(n => BEHTA_G02.injuriousWeeds.includes(n))) return { role:'weed', indicator:'Negative', label:'Injurious weed' };
  return { role:'other', indicator:'Neutral / not set', label:'Other species' };
}

// Override normalisation so verified classifications are applied consistently on save/load.
const baseNormaliseSpecies = normaliseSpecies;
normaliseSpecies = function(s){
  const item = baseNormaliseSpecies(s || {});
  const classified = classifyBehtaSpecies(item);
  if (currentBehtaType() === 'G02') {
    item.indicator = classified.indicator;
    item.behta_role = classified.role;
    item.behta_label = classified.label;
    item.behta_source = BEHTA_G02.source;
  }
  return item;
};

const baseUpdateHabitatSelection = updateHabitatSelection;
updateHabitatSelection = function(){
  baseUpdateHabitatSelection();
  const name = document.getElementById('habitatName')?.value || '';
  const code = document.getElementById('habitatCode');
  const box = document.getElementById('habitatGuidance');
  const text = document.getElementById('guidanceText');
  if (behtaName(name).includes('semi-improved')) {
    if (code && !code.value.trim()) code.value = 'G02';
    if (box && text) {
      box.classList.remove('hidden');
      text.innerHTML = `<div class="verified-rule"><div><span class="verified-badge">Verified BEHTA G02</span><strong>${BEHTA_G02.threshold}</strong></div><p>Typical context: moderately species-rich, usually 8–15 species/m². Wildflower and sedge cover is usually &lt;30% (excluding white clover, creeping buttercup and injurious weeds); rye-grass cover is generally &lt;25%.</p><p class="rule-caution">Quadrat frequency is shown as evidence only. The app does not automatically convert frequency across quadrats into the BEHTA term “occasional”.</p></div>`;
    }
  }
  // Reclassify already-recorded species when habitat selection changes.
  if (typeof currentSurvey !== 'undefined' && currentSurvey?.quadrats) {
    currentSurvey.quadrats.forEach(q => { q.species = (q.species || []).map(normaliseSpecies); });
    rebuildSpeciesPool();
    if (editingQuadratIndex != null) renderSpeciesPool();
  }
};

const baseRenderSpeciesPool = renderSpeciesPool;
renderSpeciesPool = function(){
  if(editingQuadratIndex==null) return;
  const filter = document.getElementById('speciesFilter').value.trim().toLowerCase();
  const sort = document.getElementById('speciesSort').value;
  const present = currentPresenceKeys();
  let list = [...speciesPool].map(normaliseSpecies).filter(s => `${s.common_name} ${s.scientific_name}`.toLowerCase().includes(filter));
  if(sort==='alpha') list.sort((a,b)=>(a.common_name||a.scientific_name).localeCompare(b.common_name||b.scientific_name));
  else if(sort==='indicator') {
    const rank = {indicator:0,weed:1,typical:2,other:3,unclassified:4};
    list.sort((a,b)=>(rank[a.behta_role]??9)-(rank[b.behta_role]??9)||(a.common_name||a.scientific_name).localeCompare(b.common_name||b.scientific_name));
  } else list.sort((a,b)=>speciesFrequency(b)-speciesFrequency(a)||(a.common_name||a.scientific_name).localeCompare(b.common_name||b.scientific_name));
  document.getElementById('poolCount').textContent = `${speciesPool.length} in pool`;
  document.getElementById('speciesPool').innerHTML = list.length ? list.map(s=>{
    const key=speciesKey(s), freq=speciesFrequency(s), c=classifyBehtaSpecies(s);
    const roleClass = `behta-${c.role}`;
    const badge = currentBehtaType()==='G02' && c.role!=='other' ? `<small class="behta-badge ${roleClass}">${c.label}</small>` : '';
    return `<button type="button" class="species-chip ${present.has(key)?'present':''} ${s.indicator==='Positive'?'positive':s.indicator==='Negative'?'negative':''} ${roleClass}" data-key="${esc(key)}"><span class="tick">${present.has(key)?'✓':'+'}</span><span><strong>${esc(s.common_name||s.scientific_name)}</strong>${s.scientific_name&&s.common_name?`<small>${esc(s.scientific_name)}</small>`:''}${badge}</span><em>${freq}</em></button>`;
  }).join('') : '<div class="empty mini-empty">No matching species. Add a new species below.</div>';
  document.querySelectorAll('.species-chip').forEach(b=>b.onclick=()=>{b.classList.toggle('present');b.querySelector('.tick').textContent=b.classList.contains('present')?'✓':'+';updateQuadratSummary();});
};

const baseRenderStats = renderStats;
renderStats = function(){
  baseRenderStats();
  if(currentBehtaType()!=='G02') return;
  const qs=currentSurvey?.quadrats||[];
  const species=allSpeciesStats().map(normaliseSpecies);
  const indicators=species.filter(s=>classifyBehtaSpecies(s).role==='indicator');
  const typical=species.filter(s=>classifyBehtaSpecies(s).role==='typical');
  const weeds=species.filter(s=>classifyBehtaSpecies(s).role==='weed');
  const target=document.getElementById('indicatorStats');
  if(!target) return;
  target.innerHTML = `<div class="behta-summary"><div class="behta-summary-head"><span class="verified-badge">G02</span><div><strong>${indicators.length} verified indicator species recorded</strong><small>${BEHTA_G02.threshold}</small></div></div><div class="indicator-grid three-way"><div><strong class="positive-text">${indicators.length}</strong><span>G02 indicators</span></div><div><strong>${typical.length}</strong><span>typical grasses</span></div><div><strong class="negative-text">${weeds.length}</strong><span>injurious weeds</span></div></div>${indicators.length?`<div class="indicator-list">${indicators.map(s=>`<span class="indicator-tag positive">${esc(s.common_name||s.scientific_name)} · ${s.count}/${qs.length}</span>`).join('')}</div>`:''}<p class="rule-caution">This is an evidence summary. BEHTA requires abundance/frequency judgement at sward level; quadrat occurrence is not automatically translated to DAFOR.</p></div>`;
};

function copyPreviousQuadratSpecies(){
  if(editingQuadratIndex==null || editingQuadratIndex<1){ alert('There is no previous quadrat to copy.'); return; }
  const q=currentSurvey.quadrats[editingQuadratIndex];
  const previous=currentSurvey.quadrats[editingQuadratIndex-1];
  const existing=new Map((q.species||[]).map(s=>[speciesKey(s),s]));
  (previous.species||[]).forEach(s=>existing.set(speciesKey(s),normaliseSpecies(s)));
  q.species=[...existing.values()];
  rebuildSpeciesPool(); renderSpeciesPool(); updateQuadratSummary(); flash('Previous species copied');
}
function clearCurrentQuadratSpecies(){
  if(editingQuadratIndex==null) return;
  currentSurvey.quadrats[editingQuadratIndex].species=[];
  renderSpeciesPool(); updateQuadratSummary();
}

function installFieldEnhancements(){
  const add=document.getElementById('addSpecies');
  if(add && !document.getElementById('copyPreviousSpecies')){
    const row=document.createElement('div'); row.className='field-shortcuts';
    row.innerHTML='<button id="copyPreviousSpecies" class="btn shortcut" type="button">↳ Copy previous quadrat</button><button id="clearQuadratSpecies" class="btn shortcut ghost" type="button">Clear ticks</button>';
    add.before(row);
    document.getElementById('copyPreviousSpecies').onclick=copyPreviousQuadratSpecies;
    document.getElementById('clearQuadratSpecies').onclick=clearCurrentQuadratSpecies;
  }
  const indicatorLabel=document.getElementById('newIndicator')?.closest('label');
  if(indicatorLabel){
    indicatorLabel.innerHTML='Indicator status <span class="auto-note">Automatically assigned where verified</span><select id="newIndicator"><option value="Neutral / not set">Not set / automatic</option><option>Positive</option><option>Negative</option></select>';
  }
  const confirm=document.getElementById('confirmSpecies');
  if(confirm){
    confirm.addEventListener('click',()=>{
      const common=document.getElementById('newCommon')?.value.trim()||'';
      const scientific=document.getElementById('newScientific')?.value.trim()||'';
      const c=classifyBehtaSpecies({common_name:common,scientific_name:scientific});
      const select=document.getElementById('newIndicator'); if(select && currentBehtaType()==='G02') select.value=c.indicator;
    },true);
  }
  updateHabitatSelection();
}

document.addEventListener('DOMContentLoaded',installFieldEnhancements);
