(() => {
  const byId = id => document.getElementById(id);
  const escHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const keyFor = s => String(s?.scientific_name || s?.common_name || '').trim().toLowerCase();
  const labelFor = s => String(s?.common_name || s?.scientific_name || 'Unnamed species').trim();

  function surveyPoolDirect(){
    const map = new Map();
    try {
      (currentSurvey?.quadrats || []).forEach(q => (q.species || []).forEach(raw => {
        const s = raw && typeof raw === 'object' ? raw : {};
        const key = keyFor(s);
        if (!key) return;
        const previous = map.get(key) || {};
        map.set(key, {
          ...previous,
          ...s,
          common_name: String(s.common_name || previous.common_name || ''),
          scientific_name: String(s.scientific_name || previous.scientific_name || ''),
          indicator: String(s.indicator || previous.indicator || 'Neutral / not set')
        });
      }));
    } catch {}
    return [...map.values()];
  }

  function currentPresenceDirect(){
    try {
      const q = currentSurvey?.quadrats?.[editingQuadratIndex];
      return new Set((q?.species || []).map(keyFor).filter(Boolean));
    } catch { return new Set(); }
  }

  function frequencyDirect(species){
    const key = keyFor(species);
    if (!key) return 0;
    try {
      return (currentSurvey?.quadrats || []).filter(q => (q.species || []).some(s => keyFor(s) === key)).length;
    } catch { return 0; }
  }

  function syncGlobalPool(list){
    try {
      if (Array.isArray(speciesPool)) {
        speciesPool.length = 0;
        list.forEach(s => speciesPool.push(s));
      }
    } catch {}
  }

  function renderFieldSpeciesPool(){
    let index = null;
    try { index = editingQuadratIndex; } catch { return; }
    if (index == null) return;

    const container = byId('speciesPool');
    const counter = byId('poolCount');
    if (!container || !counter) return;

    const all = surveyPoolDirect();
    syncGlobalPool(all);
    const present = currentPresenceDirect();
    const filter = String(byId('speciesFilter')?.value || '').trim().toLowerCase();
    const sort = byId('speciesSort')?.value || 'frequency';
    let list = all.filter(s => `${s.common_name || ''} ${s.scientific_name || ''}`.toLowerCase().includes(filter));

    if (sort === 'alpha') {
      list.sort((a,b) => labelFor(a).localeCompare(labelFor(b)));
    } else if (sort === 'indicator') {
      const rank = s => s.indicator === 'Positive' ? 0 : s.indicator === 'Negative' ? 1 : 2;
      list.sort((a,b) => rank(a) - rank(b) || labelFor(a).localeCompare(labelFor(b)));
    } else {
      list.sort((a,b) => frequencyDirect(b) - frequencyDirect(a) || labelFor(a).localeCompare(labelFor(b)));
    }

    counter.textContent = `${all.length} in pool`;
    container.className = 'species-pool field-species-list';

    if (!list.length) {
      container.innerHTML = `<div class="empty mini-empty field-species-empty">${filter ? 'No matching survey species.' : 'No survey species yet. Add the first species below.'}</div>`;
      return;
    }

    const qTotal = Math.max(1, currentSurvey?.quadrats?.length || 1);
    container.innerHTML = list.map(s => {
      const key = keyFor(s);
      const isPresent = present.has(key);
      const indicatorClass = s.indicator === 'Positive' ? ' positive' : s.indicator === 'Negative' ? ' negative' : '';
      const scientific = s.scientific_name && s.common_name ? `<small>${escHtml(s.scientific_name)}</small>` : '';
      const freq = frequencyDirect(s);
      return `<button type="button" class="species-chip field-species-row${isPresent ? ' present' : ''}${indicatorClass}" data-key="${escHtml(key)}" aria-pressed="${isPresent ? 'true' : 'false'}"><span class="tick">${isPresent ? '✓' : '+'}</span><span class="field-species-names"><strong>${escHtml(labelFor(s))}</strong>${scientific}</span><em class="field-species-frequency">${freq}/${qTotal}</em></button>`;
    }).join('');

    container.querySelectorAll('.field-species-row').forEach(row => {
      row.addEventListener('click', () => {
        row.classList.toggle('present');
        const on = row.classList.contains('present');
        row.setAttribute('aria-pressed', on ? 'true' : 'false');
        const tick = row.querySelector('.tick');
        if (tick) tick.textContent = on ? '✓' : '+';
        try { updateQuadratSummary(); } catch {}
      });
    });
  }

  // Make all future quadrat renders use the independent field checklist.
  try { renderSpeciesPool = renderFieldSpeciesPool; } catch {}

  function tidyShortcuts(){
    const copy = byId('copyPreviousSpecies');
    const clear = byId('clearQuadratSpecies');
    const row = copy?.closest('.field-shortcuts') || clear?.closest('.field-shortcuts');
    copy?.remove();
    if (clear) {
      clear.textContent = 'Clear current ticks';
      clear.classList.add('clear-only');
    }
    row?.classList.add('field-shortcuts-clear-only');
  }

  async function copyText(text, button){
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; }
    catch {
      try {
        const area = document.createElement('textarea');
        area.value = text; area.readOnly = true; area.style.position='fixed'; area.style.opacity='0';
        document.body.appendChild(area); area.select(); ok = document.execCommand('copy'); area.remove();
      } catch {}
    }
    if (button) {
      const old = button.textContent;
      button.textContent = ok ? 'Copied ✓' : 'Copy failed';
      setTimeout(() => button.textContent = old, 1200);
    }
  }

  function renderLookupResults(results){
    const out = byId('taxonLookupResults');
    if (!out) return;
    const usable = (results || []).filter(r => r && r.name).slice(0,8);
    if (!usable.length) {
      out.innerHTML = '<div class="taxon-lookup-empty">No plant species matches found.</div>';
      return;
    }
    out.innerHTML = usable.map((r,i) => {
      const scientific = String(r.name || '').trim();
      const common = String(r.preferred_common_name || r.matched_term || '').trim();
      return `<div class="taxon-result" data-result="${i}"><div class="taxon-result-names"><strong>${escHtml(common || scientific)}</strong><em>${escHtml(scientific)}</em></div><div class="taxon-result-actions"><button type="button" data-use="${i}">Use</button><button type="button" data-copy="${i}">Copy</button></div></div>`;
    }).join('');
    out.querySelectorAll('[data-use]').forEach(btn => btn.onclick = () => {
      const r = usable[Number(btn.dataset.use)];
      if (!r) return;
      const common = String(r.preferred_common_name || r.matched_term || '').trim();
      if (byId('newScientific')) byId('newScientific').value = r.name || '';
      if (byId('newCommon') && !byId('newCommon').value.trim() && common) byId('newCommon').value = common;
      byId('newScientific')?.focus();
    });
    out.querySelectorAll('[data-copy]').forEach(btn => btn.onclick = () => {
      const r = usable[Number(btn.dataset.copy)];
      if (r?.name) copyText(r.name, btn);
    });
  }

  async function searchTaxa(){
    const input = byId('taxonLookupQuery');
    const out = byId('taxonLookupResults');
    const button = byId('taxonLookupButton');
    if (!input || !out || !button) return;
    const query = input.value.trim() || byId('newCommon')?.value.trim() || byId('newScientific')?.value.trim() || '';
    if (!query) { out.innerHTML='<div class="taxon-lookup-empty">Enter a common or scientific name first.</div>'; input.focus(); return; }
    input.value=query; button.disabled=true; button.textContent='Searching…';
    out.innerHTML='<div class="taxon-lookup-empty">Searching plant species…</div>';
    try {
      const response = await fetch(`https://api.inaturalist.org/v1/taxa/autocomplete?q=${encodeURIComponent(query)}&taxon_id=47126&rank=species&per_page=8`, {headers:{Accept:'application/json'}});
      if (!response.ok) throw new Error();
      const data = await response.json();
      renderLookupResults(Array.isArray(data.results) ? data.results : []);
    } catch {
      out.innerHTML='<div class="taxon-lookup-empty">Scientific-name lookup is unavailable right now. You can still enter the name manually.</div>';
    } finally { button.disabled=false; button.textContent='Search'; }
  }

  function installLookup(){
    const form = byId('newSpeciesForm');
    if (!form || byId('taxonLookup')) return;
    const box = document.createElement('div');
    box.id='taxonLookup'; box.className='taxon-lookup';
    box.innerHTML='<div class="taxon-lookup-head"><strong>Scientific name lookup</strong><span>Search by common or scientific name, then use or copy the scientific name.</span></div><div class="taxon-lookup-controls"><input id="taxonLookupQuery" type="search" autocomplete="off" placeholder="e.g. red clover"><button id="taxonLookupButton" type="button">Search</button></div><div id="taxonLookupResults" class="taxon-lookup-results"></div>';
    const grid=form.querySelector('.grid.two');
    if (grid) grid.insertAdjacentElement('afterend',box); else form.prepend(box);
    byId('taxonLookupButton')?.addEventListener('click',searchTaxa);
    byId('taxonLookupQuery')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchTaxa();}});
  }

  function refresh(){
    tidyShortcuts();
    installLookup();
    renderFieldSpeciesPool();
  }

  byId('speciesFilter')?.addEventListener('input', () => setTimeout(renderFieldSpeciesPool,0));
  byId('speciesSort')?.addEventListener('change', () => setTimeout(renderFieldSpeciesPool,0));
  document.addEventListener('click', e => {
    if (e.target.closest('#addQuadrat,[data-q],#addSpecies,#confirmSpecies,#clearQuadratSpecies,#saveNext,.tab[data-tab="quadrats"]')) setTimeout(refresh,20);
  });

  const editor = byId('quadratEditor');
  if (editor) new MutationObserver(() => { if (!editor.classList.contains('hidden')) setTimeout(refresh,0); }).observe(editor,{attributes:true,attributeFilter:['class']});

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',refresh); else refresh();
  setTimeout(refresh,250);
  setTimeout(refresh,900);
})();
