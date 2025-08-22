// js/menu-tabs-scroll.js — single source of truth for the menu tabs
(() => {
  const root   = document.documentElement;
  const tabsEl = document.querySelector('.menu-tabs');
  const bar    = document.querySelector('.menu-tabs .container');
  if (!tabsEl || !bar) return;

  const chips    = Array.from(bar.querySelectorAll('a[href^="#"]'));
  const sections = chips.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  const cssVar = name =>
    parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0;

  let headerH = 72;
  let tabsH   = 46;
  let offsetY = headerH + tabsH + 6;
  let sectionTops = [];

  function measureHeights() {
    headerH = cssVar('--header-h') || 72;
    // measure the real bar height (use .menu-tabs because it includes padding)
    const h = Math.round(tabsEl.getBoundingClientRect().height || bar.getBoundingClientRect().height || 46);
    tabsH = h;
    root.style.setProperty('--tabs-h', `${tabsH}px`);
    offsetY = headerH + tabsH + 6;
    sectionTops = sections.map(sec => sec.getBoundingClientRect().top + window.scrollY);
  }

  // initial measurements + keep fresh
  document.addEventListener('DOMContentLoaded', measureHeights);
  window.addEventListener('load', measureHeights);
  window.addEventListener('resize', measureHeights);
  window.addEventListener('orientationchange', measureHeights);
  if (window.ResizeObserver) new ResizeObserver(measureHeights).observe(tabsEl);

  function centerChip(a, smooth = true) {
    const left = a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2;
    bar.scrollTo({ left, behavior: smooth ? 'smooth' : 'instant' });
  }

  function setActive(chip, smooth = true) {
    if (!chip || chip.classList.contains('active')) return;
    chips.forEach(c => { c.classList.remove('active'); c.removeAttribute('aria-current'); });
    chip.classList.add('active');
    chip.setAttribute('aria-current', 'true');
    centerChip(chip, smooth);
  }

  // Initial active/centering (hash > explicit active > first)
  document.addEventListener('DOMContentLoaded', () => {
    const initial =
      (location.hash && bar.querySelector(`a[href="${CSS.escape(location.hash)}"]`)) ||
      bar.querySelector('.active,[aria-current="true"],[aria-current="page"]') ||
      chips[0];
    setActive(initial, false);
  });

  // Tap chip -> scroll to section (use sticky offset)
  bar.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;

    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - offsetY;
    window.scrollTo({ top: y, behavior: 'smooth' });
    setActive(a);
    history.replaceState(null, '', a.getAttribute('href'));
  });

  // Allow trackpad/mouse vertical wheel to pan the row horizontally
  bar.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      bar.scrollLeft += e.deltaY;
    }
  }, { passive: false });

  // Scroll-driven highlight: pick the last section whose top has crossed the offset line
  let raf = 0;
  function onScroll() {
    const line = window.scrollY + offsetY + 1;
    let idx = 0;
    for (let i = 0; i < sectionTops.length; i++) {
      if (sectionTops[i] <= line) idx = i;
    }
    setActive(chips[idx], true);
  }
  const tick = () => { raf = 0; onScroll(); };

  window.addEventListener('scroll', () => {
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  // First measure right away
  measureHeights();
})();
