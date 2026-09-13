(() => {
  const WORKING_KEY = 'behta-working-copy-v2';
  let workingDirty = false;
  let workingTimer = null;

  const baseNormalise = normaliseSpecies;
  normaliseSpecies = function(s) {
    const raw = s || {};
    const item = baseNormalise(raw);
    let confidence = raw.confidence || 'Not assessed';
    const form = document.getElementById('newSpeciesForm');
    const confidenceInput = document.getElementById('newConfidence');
    if (!raw.confidence && form && confidenceInput && !form.classList.contains('hidden')) {
      const candidateKey = (document.getElementById('newScientific')?.value || document.getElementById('newCommon')?.value || '').trim().toLowerCase();
      if (candidateKey && speciesKey(item) === candidateKey) confidence = confidenceInput.value || 'Certain';
    }
    item.confidence = confidence;
    return item;
  };

  function confidenceClass(value) {
    return String(value || '').toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
  }

  function installConfidenceField() {
    const form = document.getElementById('newSpeciesForm');
    if (!form || document.getElementById('newConfidence')) return;
    const grid = form.querySelector('.grid.two');
    if (!grid) return;
    const row = document.createElement('div');
    row.className = 'confidence-row';
    row.innerHTML = `
      <label>Identification confidence
        <select id="newConfidence">
          <option value="Certain" selected>Certain</option>
          <option value="Probable">Probable</option>
          <option value="Needs checking">Needs checking</option>
        </select>
      </label>
      <button id="idLookupBtn" class="btn ghost id-lookup-btn" type="button">Search ID</button>`;
    grid.insertAdjacentElement('afterend', row);
    document.getElementById('idLookupBtn').onclick = () => {
      const name = (document.getElementById('newScientific')?.value || document.getElementById('newCommon')?.value || '').trim();
      if (!name) { alert('Enter a species name first.'); return; }
      window.open(`https://www.google.com/search?q=${encodeURIComponent(name + ' UK plant identification')}`, '_blank', 'noopener');
    };
    document.getElementById('confirmSpecies')?.addEventListener('click', () => {
      setTimeout(() => { const c = document.getElementById('newConfidence'); if (c) c.value = 'Certain'; }, 0);
    });
  }

  function decorateSpeciesChips() {
    document.querySelectorAll('#speciesPool .species-chip').forEach(chip => {
      chip.querySelector('.confidence-badge')?.remove();
      chip.classList.remove('needs-id-check', 'needs-id-review');
      const species = speciesPool.find(s => speciesKey(s) === chip.dataset.key);
      if (!species) return;
      const normal = normaliseSpecies(species);
      const value = normal.confidence || 'Not assessed';
      if (!['Probable', 'Needs checking', 'Not assessed'].includes(value)) return;
      const target = chip.querySelector('span:nth-child(2)');
      if (!target) return;
      const badge = document.createElement('small');
      badge.className = `confidence-badge ${confidenceClass(value)}`;
      badge.textContent = value === 'Needs checking' ? 'Check ID' : value;
      target.appendChild(badge);
      if (value === 'Probable') chip.classList.add('needs-id-check');
      if (value === 'Needs checking') chip.classList.add('needs-id-review');
    });
  }

  const previousRenderSpeciesPool = renderSpeciesPool;
  renderSpeciesPool = function() {
    const result = previousRenderSpeciesPool();
    decorateSpeciesChips();
    return result;
  };

  function installMethodStatus() {
    if (document.getElementById('methodStatus')) return;
    const guidance = document.getElementById('habitatGuidance');
    if (!guidance) return;
    const box = document.createElement('div');
    box.id = 'methodStatus';
    box.className = 'method-status guidance-only';
    guidance.insertAdjacentElement('afterend', box);
    updateMethodStatus();
  }

  function updateMethodStatus() {
    const box = document.getElementById('methodStatus');
    if (!box) return;
    const verified = typeof currentBehtaType === 'function' && currentBehtaType() === 'G02';
    box.className = `method-status ${verified ? 'verified' : 'guidance-only'}`;
    box.innerHTML = verified
      ? '<div class="method-status-icon">✓</div><div><strong>Verified G02 species flags active</strong><span>Known G02 indicators, typical grasses and injurious weeds are highlighted automatically. Formal abundance judgement remains with the surveyor.</span></div>'
      : '<div class="method-status-icon">i</div><div><strong>Field guidance only for this grassland type</strong><span>No habitat-specific indicator list is being inferred. Species are recorded as evidence until a verified BEHTA rule set is added.</span></div>';
  }

  const previousHabitatUpdate = updateHabitatSelection;
  updateHabitatSelection = function() {
    const result = previousHabitatUpdate();
    updateMethodStatus();
    return result;
  };

  function installFieldProgress() {
    if (document.getElementById('fieldProgressPanel')) return;
    const editor = document.getElementById('quadratEditor');
    const banner = editor?.querySelector('.quadrat-banner');
    if (!banner) return;
    const panel = document.createElement('div');
    panel.id = 'fieldProgressPanel';
    panel.className = 'field-progress-panel';
    panel.innerHTML = `
      <div class="field-progress-primary">
        <div id="fieldProgressQ" class="field-progress-q">Q–</div>
        <div class="field-progress-text">
          <strong id="fieldProgressTitle">Field quadrat</strong>
          <span id="fieldProgressLine">Open a quadrat to begin.</span>
          <div class="field-progress-chips">
            <span id="fieldSpeciesChip" class="field-progress-chip">0 species</span>
            <span id="fieldGpsChip" class="field-progress-chip check">GPS pending</span>
            <span id="fieldReviewChip" class="field-progress-chip">0 IDs to check</span>
          </div>
          <div id="localSaveState" class="local-save-state">Working changes are retained on this device.</div>
        </div>
      </div>
      <div class="field-nav">
        <button id="fieldPrev" class="btn ghost" type="button">← Previous</button>
        <button id="fieldNext" class="btn ghost" type="button">Next →</button>
        <button id="fieldReview" class="btn secondary" type="button">Review stats</button>
      </div>`;
    banner.insertAdjacentElement('afterend', panel);
    document.getElementById('fieldPrev').onclick = () => moveExistingQuadrat(-1);
    document.getElementById('fieldNext').onclick = () => moveExistingQuadrat(1);
    document.getElementById('fieldReview').onclick = () => {
      if (editingQuadratIndex != null) collectQuadrat();
      markWorkingDirty();
      switchTab('stats');
    };
    updateFieldProgress();
  }

  function moveExistingQuadrat(delta) {
    if (editingQuadratIndex == null) return;
    const next = editingQuadratIndex + delta;
    if (next < 0 || next >= (currentSurvey?.quadrats?.length || 0)) return;
    collectQuadrat();
    markWorkingDirty();
    openQuadrat(next);
  }

  function reviewSpecies() {
    return allSpeciesStats().map(normaliseSpecies).filter(s => ['Probable', 'Needs checking'].includes(s.confidence));
  }

  function updateFieldProgress() {
    const panel = document.getElementById('fieldProgressPanel');
    if (!panel || editingQuadratIndex == null) return;
    const q = currentSurvey?.quadrats?.[editingQuadratIndex];
    if (!q) return;
    const selected = document.querySelectorAll('#speciesPool .species-chip.present').length || (q.species?.length || 0);
    const totalQ = currentSurvey?.quadrats?.length || 0;
    document.getElementById('fieldProgressQ').textContent = `Q${q.number}`;
    document.getElementById('fieldProgressTitle').textContent = `Quadrat ${q.number} of ${totalQ}`;
    document.getElementById('fieldProgressLine').textContent = `${speciesPool.length} unique species currently in the survey pool`;
    document.getElementById('fieldSpeciesChip').textContent = `${selected} species present`;
    const gps = Number.isFinite(Number(document.getElementById('qLat')?.value)) && document.getElementById('qLat')?.value !== '';
    const gpsChip = document.getElementById('fieldGpsChip');
    gpsChip.textContent = gps ? 'GPS captured' : 'GPS pending';
    gpsChip.className = `field-progress-chip ${gps ? 'good' : 'check'}`;
    const reviews = reviewSpecies().length;
    const reviewChip = document.getElementById('fieldReviewChip');
    reviewChip.textContent = `${reviews} ID${reviews === 1 ? '' : 's'} to check`;
    reviewChip.className = `field-progress-chip ${reviews ? 'check' : 'good'}`;
    const prev = document.getElementById('fieldPrev');
    const next = document.getElementById('fieldNext');
    if (prev) prev.disabled = editingQuadratIndex <= 0;
    if (next) next.disabled = editingQuadratIndex >= totalQ - 1;
  }

  const previousOpenQuadrat = openQuadrat;
  openQuadrat = function(index) {
    const result = previousOpenQuadrat(index);
    updateFieldProgress();
    return result;
  };

  const previousQuadratSummary = updateQuadratSummary;
  updateQuadratSummary = function() {
    const result = previousQuadratSummary();
    updateFieldProgress();
    return result;
  };

  function renderSurveyReview() {
    const stats = document.getElementById('statCards');
    if (!stats) return;
    let panel = document.getElementById('surveyReviewPanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'surveyReviewPanel';
      panel.className = 'survey-review-panel';
      stats.insertAdjacentElement('afterend', panel);
    }
    const qs = currentSurvey?.quadrats || [];
    const species = allSpeciesStats().map(normaliseSpecies);
    const flagged = species.filter(s => ['Probable', 'Needs checking'].includes(s.confidence));
    const gps = qs.filter(q => Number.isFinite(Number(q.latitude)) && Number.isFinite(Number(q.longitude))).length;
    const verified = typeof currentBehtaType === 'function' && currentBehtaType() === 'G02';
    const indicators = verified && typeof classifyBehtaSpecies === 'function' ? species.filter(s => classifyBehtaSpecies(s).role === 'indicator') : [];
    const unassessed = species.filter(s => !s.confidence || s.confidence === 'Not assessed').length;
    const rule = verified
      ? `<div class="review-rule"><strong>G02 evidence:</strong> ${indicators.length} verified wildflower indicator species have been recorded somewhere in the survey. ${esc(BEHTA_G02.threshold)} Quadrat occurrence is shown as evidence and is not automatically translated into the BEHTA abundance term “occasional”.</div>`
      : '<div class="review-rule caution"><strong>Classification check:</strong> automatic habitat-specific indicator scoring is not active for this grassland type. Review the field evidence against the verified BEHTA guidance before assigning a formal result.</div>';
    const flaggedHtml = flagged.length
      ? `<div class="id-review-list">${flagged.map(s => {
          const label = s.common_name || s.scientific_name;
          return `<div class="id-review-item"><div><strong>${esc(label)}</strong><span>${esc(s.confidence)} · ${s.count}/${qs.length} quadrats</span></div><a target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent(label + ' UK plant identification')}">Check ID ↗</a></div>`;
        }).join('')}</div>`
      : '<div class="review-rule"><strong>Identification review:</strong> no species are currently marked Probable or Needs checking.</div>';
    panel.innerHTML = `
      <div class="survey-review-head"><div><div class="eyebrow">Field completion check</div><h3>Survey review</h3><p>Use this before marking fieldwork complete.</p></div></div>
      <div class="review-metrics">
        <div class="review-metric"><strong>${qs.length}</strong><span>quadrats</span></div>
        <div class="review-metric"><strong>${species.length}</strong><span>unique species</span></div>
        <div class="review-metric"><strong>${gps}/${qs.length}</strong><span>GPS captured</span></div>
        <div class="review-metric"><strong>${flagged.length}</strong><span>IDs to review${unassessed ? ` · ${unassessed} unassessed` : ''}</span></div>
      </div>${rule}${flaggedHtml}`;
  }

  const previousRenderStats = renderStats;
  renderStats = function() {
    const result = previousRenderStats();
    renderSurveyReview();
    return result;
  };

  function meaningfulSurvey(s) {
    return Boolean(s && (s.site || s.parcel || s.habitat_name || (s.quadrats && s.quadrats.length)));
  }

  function persistWorkingCopy() {
    clearTimeout(workingTimer);
    if (!workingDirty || !currentSurvey) return;
    try {
      if (editingQuadratIndex != null && !document.getElementById('quadratEditor')?.classList.contains('hidden')) collectQuadrat();
      collectSurvey();
      if (!meaningfulSurvey(currentSurvey)) return;
      localStorage.setItem(WORKING_KEY, JSON.stringify({ saved_at: Date.now(), survey: currentSurvey }));
      const state = document.getElementById('localSaveState');
      if (state) state.textContent = `Working draft saved on device · ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
    } catch {}
  }

  function markWorkingDirty() {
    workingDirty = true;
    clearTimeout(workingTimer);
    workingTimer = setTimeout(persistWorkingCopy, 650);
  }

  function clearWorkingCopy() {
    workingDirty = false;
    clearTimeout(workingTimer);
    try { localStorage.removeItem(WORKING_KEY); } catch {}
    document.getElementById('workingDraftBanner')?.remove();
    const state = document.getElementById('localSaveState');
    if (state) state.textContent = 'Saved to server.';
  }

  const previousSaveSurvey = saveSurvey;
  saveSurvey = async function() {
    const saved = await previousSaveSurvey();
    clearWorkingCopy();
    return saved;
  };

  function showWorkingDraftBanner() {
    let stored;
    try { stored = JSON.parse(localStorage.getItem(WORKING_KEY) || 'null'); } catch { stored = null; }
    if (!stored?.survey || !meaningfulSurvey(stored.survey)) return;
    const serverStamp = Date.parse(currentSurvey?.updated_at || currentSurvey?.created_at || '') || 0;
    if (stored.saved_at <= serverStamp + 1000 && currentSurvey?.id && stored.survey.id === currentSurvey.id) {
      localStorage.removeItem(WORKING_KEY);
      return;
    }
    if (document.getElementById('workingDraftBanner')) return;
    const banner = document.createElement('div');
    banner.id = 'workingDraftBanner';
    banner.className = 'working-draft-banner';
    banner.innerHTML = `<div><strong>Unsaved field draft found</strong><span>Saved on this device ${new Date(stored.saved_at).toLocaleString()}.</span></div><div class="working-draft-actions"><button id="discardWorkingDraft" type="button">Discard</button><button id="resumeWorkingDraft" class="primary-draft" type="button">Resume</button></div>`;
    const anchor = document.getElementById('activeSurveyBar');
    anchor?.insertAdjacentElement('beforebegin', banner);
    document.getElementById('resumeWorkingDraft').onclick = () => {
      fillSurvey(stored.survey);
      workingDirty = true;
      banner.remove();
      switchTab(stored.survey.quadrats?.length ? 'quadrats' : 'survey');
      flash('Local field draft resumed');
    };
    document.getElementById('discardWorkingDraft').onclick = () => {
      localStorage.removeItem(WORKING_KEY);
      banner.remove();
    };
  }

  function installDraftProtection() {
    document.addEventListener('input', e => {
      if (e.target.id === 'speciesFilter') return;
      if (e.target.closest('#surveyForm') || e.target.closest('#quadratEditor')) markWorkingDirty();
    }, true);
    document.addEventListener('change', e => {
      if (e.target.closest('#surveyForm') || e.target.closest('#quadratEditor')) markWorkingDirty();
    }, true);
    document.addEventListener('click', e => {
      if (e.target.closest('.species-chip,#copyPreviousSpecies,#clearQuadratSpecies,#gpsButton,#clearGps,#confirmSpecies')) markWorkingDirty();
    }, true);
    window.addEventListener('beforeunload', () => { if (workingDirty) persistWorkingCopy(); });
    window.addEventListener('offline', () => {
      const state = document.getElementById('localSaveState');
      if (state) state.textContent = 'Offline · working draft stays on this device until you reconnect and save.';
    });
    window.addEventListener('online', () => {
      const state = document.getElementById('localSaveState');
      if (state && workingDirty) state.textContent = 'Back online · press Save to send the working draft to the server.';
    });
  }

  function initialiseUpgrades() {
    installConfidenceField();
    installMethodStatus();
    installFieldProgress();
    installDraftProtection();
    showWorkingDraftBanner();
    updateMethodStatus();
    if (editingQuadratIndex != null) { renderSpeciesPool(); updateFieldProgress(); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiseUpgrades);
  else initialiseUpgrades();
})();
