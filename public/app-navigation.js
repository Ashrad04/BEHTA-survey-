(() => {
  let applying = false;
  let lastState = null;
  let keyDepth = 0;

  const cleanState = state => ({
    view: state?.view || 'hub',
    behtaTab: state?.behtaTab || 'survey',
    rapidTab: state?.rapidTab || 'setup',
    speciesTab: state?.speciesTab || 'key',
    keyDepth: Number(state?.keyDepth || 0),
    modal: state?.modal || '',
    term: state?.term || ''
  });

  function hashFor(state) {
    const s = cleanState(state);
    if (s.view === 'behta') return `#behta/${s.behtaTab}`;
    if (s.view === 'rapid') return `#rapid/${s.rapidTab}`;
    if (s.view === 'species') return `#species/${s.speciesTab}`;
    return '#home';
  }

  function stateFromHash() {
    const hash = (location.hash || '#home').replace(/^#/, '');
    const [view, sub] = hash.split('/');
    if (view === 'behta') return cleanState({ view: 'behta', behtaTab: sub || 'survey' });
    if (view === 'rapid') return cleanState({ view: 'rapid', rapidTab: sub || 'setup' });
    if (view === 'species') return cleanState({ view: 'species', speciesTab: sub || 'key' });
    return cleanState({ view: 'hub' });
  }

  function push(state) {
    if (applying) return;
    const next = cleanState(state);
    history.pushState({ fieldSurveys: next }, '', hashFor(next));
    lastState = next;
  }

  function replace(state) {
    const next = cleanState(state);
    history.replaceState({ fieldSurveys: next }, '', hashFor(next));
    lastState = next;
  }

  function click(selector) {
    const el = document.querySelector(selector);
    if (el) el.click();
    return Boolean(el);
  }

  function goHubUi() {
    if (document.body.classList.contains('species-id-mode')) {
      if (click('#speciesHome')) return;
    }
    if (document.body.classList.contains('rapid-mode')) {
      if (click('#rapidHome')) return;
    }
    if (!document.body.classList.contains('survey-hub-open')) click('#surveyHomeBtn');
  }

  function ensureHub() {
    if (!document.body.classList.contains('survey-hub-open')) goHubUi();
  }

  function openView(view) {
    if (view === 'hub') { goHubUi(); return; }
    if (view === 'behta') {
      if (document.body.classList.contains('rapid-mode') || document.body.classList.contains('species-id-mode')) goHubUi();
      if (document.body.classList.contains('survey-hub-open')) click('#hubBehta');
      return;
    }
    if (view === 'rapid') {
      if (!document.body.classList.contains('rapid-mode')) {
        ensureHub();
        click('#hubRapid');
      }
      return;
    }
    if (view === 'species') {
      if (!document.body.classList.contains('species-id-mode')) {
        ensureHub();
        click('#hubSpecies');
      }
    }
  }

  function apply(state, previous = lastState) {
    const target = cleanState(state);
    applying = true;

    try {
      if (previous?.view === 'species' && previous.modal === 'term' && target.view === 'species' && !target.modal) {
        const close = document.querySelector('#termClose');
        if (close) close.click();
        keyDepth = target.keyDepth;
        lastState = target;
        return;
      }

      if (previous?.view === 'species' && target.view === 'species' &&
          previous.speciesTab === 'key' && target.speciesTab === 'key' &&
          target.keyDepth < previous.keyDepth && document.body.classList.contains('species-id-mode')) {
        const back = document.querySelector('#resultBack, #keyBack');
        if (back) back.click();
        keyDepth = target.keyDepth;
        lastState = target;
        return;
      }

      openView(target.view);

      if (target.view === 'behta') {
        click(`.tab[data-tab="${CSS.escape(target.behtaTab)}"]`);
      } else if (target.view === 'rapid') {
        click(`.rapid-tab[data-rpanel="${CSS.escape(target.rapidTab)}"]`);
      } else if (target.view === 'species') {
        click(`.species-tab[data-spanel="${CSS.escape(target.speciesTab)}"]`);
      }
      keyDepth = target.keyDepth;
      lastState = target;
    } finally {
      setTimeout(() => { applying = false; }, 0);
    }
  }

  function navigateHome() {
    if (lastState?.view === 'hub' && document.body.classList.contains('survey-hub-open')) return;
    applying = true;
    goHubUi();
    applying = false;
    keyDepth = 0;
    push({ view: 'hub' });
  }

  function makeBrandHomeLink() {
    const brand = document.querySelector('.topbar .brand');
    if (!brand || brand.dataset.homeReady) return;
    brand.dataset.homeReady = '1';
    brand.setAttribute('role', 'link');
    brand.setAttribute('tabindex', '0');
    brand.setAttribute('aria-label', 'Field Surveys home');
    brand.title = 'Back to Field Surveys home';
    brand.addEventListener('click', navigateHome);
    brand.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        navigateHome();
      }
    });

    const mark = brand.querySelector('.brand-mark');
    if (mark && !mark.querySelector('img')) {
      mark.textContent = '';
      const img = document.createElement('img');
      img.src = '/field-surveys-icon.svg';
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      mark.appendChild(img);
    }
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('#keyBack, #resultBack');
    if (!target || applying || lastState?.view !== 'species' || keyDepth <= 0) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    history.back();
  }, true);

  document.addEventListener('click', event => {
    if (applying) return;
    const target = event.target.closest('button, [data-tab], [data-rpanel], [data-spanel], [data-term]');
    if (!target) return;

    if (target.id === 'hubBehta') {
      keyDepth = 0;
      setTimeout(() => push({ view: 'behta', behtaTab: 'survey' }), 0);
      return;
    }
    if (target.id === 'hubRapid') {
      keyDepth = 0;
      setTimeout(() => push({ view: 'rapid', rapidTab: 'setup' }), 0);
      return;
    }
    if (target.id === 'hubSpecies') {
      keyDepth = 0;
      setTimeout(() => push({ view: 'species', speciesTab: 'key', keyDepth: 0 }), 0);
      return;
    }
    if (['surveyHomeBtn', 'rapidHome', 'speciesHome'].includes(target.id)) {
      keyDepth = 0;
      setTimeout(() => push({ view: 'hub' }), 0);
      return;
    }

    if (target.matches('.tab[data-tab]') && !document.body.classList.contains('rapid-mode') && !document.body.classList.contains('species-id-mode')) {
      setTimeout(() => push({ view: 'behta', behtaTab: target.dataset.tab }), 0);
      return;
    }
    if (target.matches('.rapid-tab[data-rpanel]')) {
      setTimeout(() => push({ view: 'rapid', rapidTab: target.dataset.rpanel }), 0);
      return;
    }
    if (target.matches('.species-tab[data-spanel]')) {
      const tab = target.dataset.spanel;
      if (tab !== 'key') keyDepth = 0;
      setTimeout(() => push({ view: 'species', speciesTab: tab, keyDepth }), 0);
      return;
    }

    if (document.body.classList.contains('species-id-mode') &&
        (target.matches('[data-node]') || target.matches('[data-next]') || target.matches('[data-species]'))) {
      keyDepth += 1;
      setTimeout(() => push({ view: 'species', speciesTab: 'key', keyDepth }), 0);
      return;
    }

    if (document.body.classList.contains('species-id-mode') && target.matches('[data-term]')) {
      const term = target.dataset.term || '';
      setTimeout(() => push({ view: 'species', speciesTab: document.querySelector('.species-tab.active')?.dataset.spanel || 'terms', keyDepth, modal: 'term', term }), 0);
      return;
    }

    if (target.id === 'termClose' && lastState?.modal === 'term') {
      setTimeout(() => history.back(), 0);
    }
  });

  window.addEventListener('popstate', event => {
    apply(event.state?.fieldSurveys || stateFromHash(), lastState);
  });

  function init() {
    makeBrandHomeLink();
    const requested = stateFromHash();
    replace(requested);
    if (requested.view !== 'hub') setTimeout(() => apply(requested, { view: 'hub' }), 0);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
