// js/mobile-nav.js
(() => {
  const btn = document.querySelector('.nav-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (!btn || !drawer) return;

  // keep header height available to CSS
  const setHeaderH = () => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const h = Math.round(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--header-h', `${h}px`);
  };
  setHeaderH();
  window.addEventListener('resize', setHeaderH);

  function open() {
    document.body.classList.add('menu-open');
    btn.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');

    // focus first interactive element in drawer
    const first = drawer.querySelector('a,button,[tabindex]:not([tabindex="-1"])');
    if (first) first.focus();
  }

  function close() {
    document.body.classList.remove('menu-open');
    btn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    btn.focus();
  }

  btn.addEventListener('click', () => {
    document.body.classList.contains('menu-open') ? close() : open();
  });

  // close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) close();
  });

  // click backdrop closes
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) close();
  });

  // click a link closes
  drawer.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (a) close();
  });

  // highlight current page inside drawer
  const normalize = (p) => {
    const clean = (p || '').split('#')[0].split('?')[0];
    let last = clean.split('/').pop().toLowerCase();
    return last || 'index.html';
  };
  const current = normalize(location.pathname);
  drawer.querySelectorAll('a[href]').forEach((a) => {
    const href = normalize(a.getAttribute('href') || '');
    if (href === current) a.setAttribute('aria-current', 'page');
  });
})();
