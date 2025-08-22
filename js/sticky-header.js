/* js/sticky-header.js */

/* -------------------------------------------------
   1) Measure header (expose --header-h)
------------------------------------------------- */
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const setHeaderH = () => {
    const h = Math.round(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--header-h', `${h}px`);
  };

  document.addEventListener('DOMContentLoaded', setHeaderH);
  window.addEventListener('load', setHeaderH);
  window.addEventListener('resize', setHeaderH);
  window.addEventListener('orientationchange', setHeaderH);
  if (window.ResizeObserver) new ResizeObserver(setHeaderH).observe(header);
})();

/* -------------------------------------------------
   2) Home only: glass effect (absolute -> fixed)
------------------------------------------------- */
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const isHome = document.body.classList.contains('home');

  const onScroll = () => {
    const fixed = window.scrollY > 1;
    header.classList.toggle('is-fixed', fixed && isHome);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* -------------------------------------------------
   3) Active pill (header + footer)
------------------------------------------------- */
(() => {
  const links = document.querySelectorAll('.main-nav a[href], .footer-nav a[href]');
  if (!links.length) return;

  const normalize = (path) => {
    const clean = (path || '').split('#')[0].split('?')[0];
    let last = clean.split('/').pop().toLowerCase();
    return last || 'index.html';
  };

  const current = normalize(location.pathname);
  links.forEach(a => {
    const href = normalize(a.getAttribute('href') || '');
    if (href === current) a.setAttribute('aria-current', 'page');
  });
})();

/* -------------------------------------------------
   4) MOBILE TOGGLE (hamburger ↔ X, body-lock, ESC)
   - Works with the CSS you added for the overlay panel
------------------------------------------------- */
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const panel  = document.querySelector('.nav-center');
  if (!toggle || !panel) return;

  const open = () => {
    panel.classList.add('open');
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    panel.classList.remove('open');
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    panel.classList.contains('open') ? close() : open();
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!panel.classList.contains('open')) return;
    const withinPanel = panel.contains(e.target);
    const onToggle = e.target === toggle || toggle.contains(e.target);
    if (!withinPanel && !onToggle) close();
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Close when clicking any link/input/button inside panel
  panel.querySelectorAll('a, button, input').forEach(el => {
    el.addEventListener('click', close);
  });
})();

/* -------------------------------------------------
   5) MENU TABS — attach under header from load
   (single, de-duped implementation)
------------------------------------------------- */
(() => {
  const header = document.querySelector('.site-header');
  const tabs   = document.querySelector('.menu-tabs');
  const menu   = document.querySelector('main.menu');
  if (!header || !tabs || !menu) return;

  const setVars = () => {
    // Header height -> CSS var
    const hh = Math.round(header.getBoundingClientRect().height) || 0;
    document.documentElement.style.setProperty('--header-h', `${hh}px`);

    // Measure tabs at natural flow height
    tabs.classList.remove('is-fixed');
    const th = Math.round(tabs.getBoundingClientRect().height) || 0;
    document.documentElement.style.setProperty('--tabs-h', `${th}px`);

    // Fix it under the header and pad the content once
    tabs.classList.add('is-fixed');
    menu.classList.add('with-tabs-fixed');
  };

  // Init & keep fresh
  document.addEventListener('DOMContentLoaded', setVars);
  window.addEventListener('load', setVars);
  window.addEventListener('resize', setVars);
  window.addEventListener('orientationchange', setVars);
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(setVars);
    ro.observe(header);
    ro.observe(tabs);
  }
})();
