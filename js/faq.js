// js/faq.js
(() => {
    // Grab the modal; bail out quietly if this page doesn't have it
    const modal = document.getElementById('faq-modal');
    if (!modal) return;
  
    // You can have multiple openers; keep the footer id and optionally add [data-open-faq] anywhere
    const openers = document.querySelectorAll('#footer-faq-link, [data-open-faq]');
    const closeBtn = modal.querySelector('[data-faq-close]');
    let lastFocused = null;
  
    const focusableSelectors = [
      'a[href]', 'button:not([disabled])', 'summary', 'input:not([disabled])',
      'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'
    ];
  
    function getFocusable() {
      return Array.from(modal.querySelectorAll(focusableSelectors.join(',')))
        .filter(el => el.offsetParent !== null || el === document.activeElement);
    }
  
    function openModal(e) {
      if (e) e.preventDefault();
      lastFocused = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('faq-lock');
      const focusables = getFocusable();
      (focusables[0] || modal).focus();
    }
  
    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('faq-lock');
      if (lastFocused) lastFocused.focus();
    }
  
    // Wire up openers & closer (use optional chaining in case the button is missing)
    openers.forEach(el => el.addEventListener('click', openModal));
    closeBtn?.addEventListener('click', closeModal);
  
    // Click backdrop to close
    modal.addEventListener('click', (e) => {
      const dialog = modal.querySelector('.faq-dialog');
      if (!dialog.contains(e.target)) closeModal();
    });
  
    // ESC + focus trap
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      } else if (e.key === 'Tab') {
        const nodes = getFocusable();
        if (!nodes.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });
  
    // Optional: open if URL hash is #faq
    if (location.hash === '#faq') openModal();
  })();
  