(() => {
  const $id = id => document.getElementById(id);

  function safeNormalise(raw) {
    try { return normaliseSpecies(raw || {}); }
    catch { return raw || {}; }
  }

  function safeFrequency(species) {
    try { return speciesFrequency(species); }
    catch { return 0; }
  }

  function safeRole(species) {
    try {
      if (typeof classifyBehtaSpecies === 'function') return classifyBehtaSpecies(species) || {};
    } catch {}
    return {};
  }

  function speciesLabel(species) {
    return String(species?.common_name || species?.scientific_name || 'Unnamed species').trim();
  }

  function buildSpeciesRow(species, present, quadratTotal) {
    const key = speciesKey(species);
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'species-chip field-species-row';
    row.dataset.key = key;
    row.classList.toggle('present', present.has(key));
    row.setAttribute('aria-pressed', present.has(key) ? 'true' : 'false');

    if (species.indicator === 'Positive') row.classList.add('positive');
    if (species.indicator === 'Negative') row.classList.add('negative');

    const role = safeRole(species);
    if (role.role) row.classList.add(`behta-${role.role}`);

    const tick = document.createElement('span');
    tick.className = 'tick';
    tick.textContent = present.has(key) ? '✓' : '+';

    const names = document.createElement('span');
    names.className = 'field-species-names';
    const common = document.createElement('strong');
    common.textContent = speciesLabel(species);
    names.appendChild(common);

    if (species.scientific_name && species.common_name) {
      const scientific = document.createElement('small');
      scientific.textContent = species.scientific_name;
      names.appendChild(scientific);
    }

    if (role.label && role.role && !['other','unclassified'].includes(role.role)) {
      const badge = document.createElement('small');
      badge.className = `behta-badge behta-${role.role}`;
      badge.textContent = role.label;
      names.appendChild(badge);
    }

    const occurrence = document.createElement('em');
    const count = safeFrequency(species);
    occurrence.className = 'field-species-frequency';
    occurrence.textContent = quadratTotal ? `${count}/${quadratTotal}` : String(count);
    occurrence.title = 'Quadrats containing this species';

    row.append(tick, names, occurrence);
    row.addEventListener('click', () => {
      row.classList.toggle('present');
      const isPresent = row.classList.contains('present');
      tick.textContent = isPresent ? '✓' : '+';
      row.setAttribute('aria-pressed', isPresent ? 'true' : 'false');
      try { updateQuadratSummary(); } catch {}
    });
    return row;
  }

  function renderFieldSpeciesPool() {
    if (typeof editingQuadratIndex === 'undefined' || editingQuadratIndex == null) return;
    const pool = $id('speciesPool');
    const counter = $id('poolCount');
    if (!pool || !counter) return;

    const filter = ($id('speciesFilter')?.value || '').trim().toLowerCase();
    const sort = $id('speciesSort')?.value || 'frequency';
    let present;
    try { present = currentPresenceKeys(); } catch { present = new Set(); }

    let list = Array.isArray(speciesPool) ? speciesPool.map(safeNormalise) : [];
    list = list.filter(s => `${s.common_name || ''} ${s.scientific_name || ''}`.toLowerCase().includes(filter));

    if (sort === 'alpha') {
      list.sort((a,b) => speciesLabel(a).localeCompare(speciesLabel(b)));
    } else if (sort === 'indicator') {
      const rank = s => s.indicator === 'Positive' ? 0 : s.indicator === 'Negative' ? 1 : 2;
      list.sort((a,b) => rank(a) - rank(b) || speciesLabel(a).localeCompare(speciesLabel(b)));
    } else {
      list.sort((a,b) => safeFrequency(b) - safeFrequency(a) || speciesLabel(a).localeCompare(speciesLabel(b)));
    }

    counter.textContent = `${Array.isArray(speciesPool) ? speciesPool.length : 0} in pool`;
    pool.classList.add('field-species-list');
    pool.replaceChildren();

    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'empty mini-empty field-species-empty';
      empty.textContent = filter ? 'No matching survey species.' : 'No survey species yet. Add the first species below.';
      pool.appendChild(empty);
      return;
    }

    const total = currentSurvey?.quadrats?.length || 0;
    list.forEach(species => pool.appendChild(buildSpeciesRow(species, present, total)));
  }

  // Replace the layered renderer with a field-first list renderer.
  try { renderSpeciesPool = renderFieldSpeciesPool; } catch {}

  function tidyShortcuts() {
    const copy = $id('copyPreviousSpecies');
    const row = copy?.closest('.field-shortcuts') || $id('clearQuadratSpecies')?.closest('.field-shortcuts');
    copy?.remove();
    const clear = $id('clearQuadratSpecies');
    if (clear) {
      clear.textContent = 'Clear current ticks';
      clear.classList.add('clear-only');
    }
    if (row) row.classList.add('field-shortcuts-clear-only');
  }

  async function copyText(text, button) {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      try {
        const t = document.createElement('textarea');
        t.value = text; t.setAttribute('readonly','');
        t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select();
        ok = document.execCommand('copy'); t.remove();
      } catch {}
    }
    if (button) {
      const old = button.textContent;
      button.textContent = ok ? 'Copied ✓' : 'Copy failed';
      setTimeout(() => button.textContent = old, 1300);
    }
  }

  function renderLookupResults(results) {
    const out = $id('taxonLookupResults');
    if (!out) return;
    out.replaceChildren();
    if (!results.length) {
      out.innerHTML = '<div class="taxon-lookup-empty">No plant species matches found.</div>';
      return;
    }
    results.forEach(result => {
      const scientific = String(result.name || '').trim();
      if (!scientific) return;
      const common = String(result.preferred_common_name || result.matched_term || '').trim();
      const item = document.createElement('div');
      item.className = 'taxon-result';
      const names = document.createElement('div');
      names.className = 'taxon-result-names';
      const commonEl = document.createElement('strong');
      commonEl.textContent = common || scientific;
      const scientificEl = document.createElement('em');
      scientificEl.textContent = scientific;
      names.append(commonEl, scientificEl);

      const actions = document.createElement('div');
      actions.className = 'taxon-result-actions';
      const use = document.createElement('button');
      use.type = 'button'; use.textContent = 'Use';
      use.addEventListener('click', () => {
        if ($id('newScientific')) $id('newScientific').value = scientific;
        if ($id('newCommon') && !$id('newCommon').value.trim() && common) $id('newCommon').value = common;
        $id('newScientific')?.focus();
      });
      const copy = document.createElement('button');
      copy.type = 'button'; copy.textContent = 'Copy';
      copy.addEventListener('click', () => copyText(scientific, copy));
      actions.append(use, copy);
      item.append(names, actions);
      out.appendChild(item);
    });
  }

  async function searchTaxa() {
    const input = $id('taxonLookupQuery');
    const out = $id('taxonLookupResults');
    const button = $id('taxonLookupButton');
    if (!input || !out || !button) return;
    const query = input.value.trim() || $id('newCommon')?.value.trim() || $id('newScientific')?.value.trim() || '';
    if (!query) {
      input.focus();
      out.innerHTML = '<div class="taxon-lookup-empty">Enter a common or scientific name first.</div>';
      return;
    }
    input.value = query;
    button.disabled = true;
    button.textContent = 'Searching…';
    out.innerHTML = '<div class="taxon-lookup-empty">Searching plant species…</div>';
    try {
      const url = `https://api.inaturalist.org/v1/taxa/autocomplete?q=${encodeURIComponent(query)}&taxon_id=47126&rank=species&per_page=8`;
      const response = await fetch(url, {headers:{'Accept':'application/json'}});
      if (!response.ok) throw new Error('Lookup unavailable');
      const data = await response.json();
      renderLookupResults(Array.isArray(data.results) ? data.results : []);
    } catch {
      out.innerHTML = '<div class="taxon-lookup-empty">Scientific-name lookup is unavailable right now. You can still enter the name manually.</div>';
    } finally {
      button.disabled = false;
      button.textContent = 'Search';
    }
  }

  function installLookup() {
    const form = $id('newSpeciesForm');
    if (!form || $id('taxonLookup')) return;
    const box = document.createElement('div');
    box.id = 'taxonLookup';
    box.className = 'taxon-lookup';
    box.innerHTML = `
      <div class="taxon-lookup-head"><strong>Scientific name lookup</strong><span>Search plants, then use or copy the scientific name.</span></div>
      <div class="taxon-lookup-controls"><input id="taxonLookupQuery" type="search" autocomplete="off" placeholder="e.g. red clover"><button id="taxonLookupButton" type="button">Search</button></div>
      <div id="taxonLookupResults" class="taxon-lookup-results"></div>`;
    const grid = form.querySelector('.grid.two');
    if (grid) grid.insertAdjacentElement('afterend', box);
    else form.prepend(box);
    $id('taxonLookupButton')?.addEventListener('click', searchTaxa);
    $id('taxonLookupQuery')?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); searchTaxa(); } });
  }

  function refresh() {
    tidyShortcuts();
    installLookup();
    if (typeof editingQuadratIndex !== 'undefined' && editingQuadratIndex != null) renderFieldSpeciesPool();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh);
  else refresh();
  setTimeout(refresh, 250);

  document.addEventListener('click', e => {
    if (e.target.closest('#addSpecies,#confirmSpecies,#clearQuadratSpecies,#saveNext,[data-q]')) setTimeout(refresh, 0);
  });
})();
