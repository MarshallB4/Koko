// js/search.js — card-style search results + multi-form support
(() => {
  const resultsEl = document.getElementById('search-results');
  const countEl   = document.getElementById('search-count');
  const queryEl   = document.getElementById('search-query');

  // All search forms (desktop + mobile)
  const forms  = Array.from(document.querySelectorAll('.nav-search-form'));
  const inputs = forms.map(f => f.querySelector('input[name="q"]')).filter(Boolean);

  // current query from ?q=
  const params = new URLSearchParams(location.search);
  const q = (params.get('q') || '').trim();

  // Pre-fill every input with current query
  inputs.forEach(i => { i.value = q; });
  if (queryEl) queryEl.textContent = q || '…';

  // Keep desktop & mobile inputs in sync as the user types
  const mirror = (fromInput) => {
    inputs.forEach(i => { if (i !== fromInput) i.value = fromInput.value; });
  };
  inputs.forEach(i => i.addEventListener('input', () => mirror(i)));

  // ---------- utils ----------
  const esc = (s = '') =>
    s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[c]));

  const makeMarkRe = (term = '') => {
    const tokens = term.split(/\s+/).filter(Boolean).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return tokens.length ? new RegExp(`(${tokens.join('|')})`, 'ig') : null;
  };

  const highlight = (text = '', re) => {
    const safe = esc(text);
    return re ? safe.replace(re, '<mark data-search>$1</mark>') : safe;
  };

  const normalize = (item) => {
    const tags = Array.isArray(item.tags) ? item.tags.join(' ') : (item.tags || '');
    return `${item.title || ''} ${item.category || ''} ${item.desc || ''} ${tags}`.toLowerCase();
  };

  const filterHits = (list, term) => {
    const tokens = term.toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    return list.filter(it => {
      const hay = normalize(it);
      // AND match: every token must appear
      return tokens.every(t => hay.includes(t));
    });
  };

  // ---------- render ----------
  const render = (index) => {
    if (!resultsEl) return; // not on search.html

    // No query → clear results & hide count
    if (!q) {
      resultsEl.replaceChildren();
      if (countEl) countEl.hidden = true;
      return;
    }

    const hits = filterHits(index, q);
    const markRe = makeMarkRe(q);

    // Count chip
    if (countEl) {
      countEl.textContent = `${hits.length} result${hits.length === 1 ? '' : 's'}`;
      countEl.hidden = false;
    }

    // No results state
    if (!hits.length) {
      resultsEl.innerHTML = `<p>No results for <strong>${esc(q)}</strong>.</p>`;
      return;
    }

    // Build: <ul class="search-list"><li class="search-card">…</li>…</ul>
    const ul = document.createElement('ul');
    ul.className = 'search-list';

    hits.forEach(it => {
      const li = document.createElement('li');
      li.className = 'search-card';
      li.innerHTML = `
        ${it.category ? `<small>${esc(it.category)}</small>` : ``}
        <a href="${it.url}">${highlight(it.title || '', markRe)}</a>
        ${it.desc ? `<p>${highlight(it.desc, markRe)}</p>` : ``}
      `;
      ul.appendChild(li);
    });

    resultsEl.replaceChildren(ul);
  };

  // Load index and render (bust cache so updates show up)
  fetch('assets/search-index.json?v=5', { cache: 'no-store' })
    .then(r => r.json())
    .then(render)
    .catch(() => {
      if (resultsEl) resultsEl.textContent = 'Search index missing.';
      if (countEl) countEl.hidden = true;
    });

  // Submit handler for every form (desktop + mobile)
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const term = (input?.value || '').trim();
      const url = new URL('search.html', location.href);
      if (term) url.searchParams.set('q', term);
      location.assign(url.toString());
    });
  });
})();
