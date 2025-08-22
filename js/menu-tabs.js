/* js/menu-tabs.js */
(() => {
  const root  = document.documentElement;
  const tabs  = document.querySelector('.menu-tabs');
  if (!tabs) return;

  // Set --tabs-h so sections can offset correctly under both bars
  const setTabsH = () => {
    const th = Math.round(tabs.getBoundingClientRect().height);
    root.style.setProperty('--tabs-h', `${th}px`);
  };

  document.addEventListener('DOMContentLoaded', setTabsH);
  window.addEventListener('load', setTabsH);
  window.addEventListener('resize', setTabsH);
  window.addEventListener('orientationchange', setTabsH);
  if (window.ResizeObserver) new ResizeObserver(setTabsH).observe(tabs);

  // Click = immediate visual active
  const links = Array.from(tabs.querySelectorAll('a[href^="#"]'));
  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Scroll-spy (keeps the right chip active while scrolling)
  const sections = links.map(l => {
    const id = decodeURIComponent(l.getAttribute('href') || '').slice(1);
    const el = id ? document.getElementById(id) : null;
    return el ? { el, link: l } : null;
  }).filter(Boolean);
  if (!sections.length) return;

  const pxVar = (name) => {
    const v = getComputedStyle(root).getPropertyValue(name);
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
  };

  let io;
  function makeObserver() {
    const offset = pxVar('--header-h') + pxVar('--tabs-h');
    io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const found = sections.find(s => s.el === entry.target);
        if (!found) return;
        links.forEach(l => l.classList.remove('active'));
        found.link.classList.add('active');
      });
    }, {
      root: null,
      rootMargin: `-${offset}px 0px -70% 0px`,
      threshold: 0.01
    });
    sections.forEach(s => io.observe(s.el));
  }

  makeObserver();
  window.addEventListener('resize', () => { io?.disconnect?.(); makeObserver(); });
})();
