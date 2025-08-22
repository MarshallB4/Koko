// js/carousel.js — continuous loop, resize-safe, progress-preserving
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.banner-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  if (!track) return;

  const originals = Array.from(track.children);
  if (originals.length < 2) return;

  // Duplicate once: A B C ... -> A B C ... A B C ...
  originals.forEach(node => track.appendChild(node.cloneNode(true)));

  // State
  let loopW = 0;                // current half-loop width (px)
  let duration = 0;             // current animation duration (s)
  let prevInnerWidth = window.innerWidth;
  const PPS = 80;               // pixels per second (tweak speed)

  // Wait for all images to be ready before measuring
  const imgs = track.querySelectorAll('img');
  let pending = imgs.length;

  const onReady = () => (--pending <= 0) && start(false /*keepProgress*/);

  if (pending === 0) start(false);
  else imgs.forEach(img => {
    if (img.complete) onReady();
    else {
      img.addEventListener('load', onReady,  { once: true });
      img.addEventListener('error', onReady, { once: true });
    }
  });

  // Read current translateX (in px) from the running animation
  function currentTranslateX() {
    const cs = getComputedStyle(track);
    const t = cs.transform;
    if (t && t !== 'none') {
      try {
        // DOMMatrix gives us m41 = translateX
        const m = new DOMMatrixReadOnly(t);
        return m.m41 || 0;
      } catch (_e) {
        // Fallback: parse matrix(a,b,c,d,tx,ty)
        const m = t.match(/matrix\(([^)]+)\)/);
        if (m) {
          const parts = m[1].split(',').map(Number);
          return parts[4] || 0;
        }
      }
    }
    return 0;
  }

  // 0..1 progress along the loop
  function currentProgress() {
    if (!loopW) return 0;
    const x = currentTranslateX();      // negative while moving left
    const offset = ((-x) % loopW + loopW) % loopW; // 0..loopW
    return offset / loopW;
  }

  function start(keepProgress) {
    const progress = keepProgress ? currentProgress() : 0;

    // Measure half of the track (we cloned once)
    loopW = track.scrollWidth / 2;
    duration = loopW / PPS;

    track.style.setProperty('--loop-w', `${loopW}px`);
    track.style.setProperty('--duration', `${duration}s`);

    // Freeze, then resume with a negative delay so we continue at the same spot
    track.style.animation = 'none';
    // next frame: apply class/animation again
    requestAnimationFrame(() => {
      // Ensure the animated rule is active
      carousel.classList.add('is-ready');

      // Re-enable animation
      track.style.animation = '';
      // Jump to the correct point in time
      const delay = -(progress * duration);
      track.style.animationDelay = `${delay}s`;
    });
  }

  // Recalculate on real width changes only (ignore URL-bar height jitters)
  let to;
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    if (Math.abs(w - prevInnerWidth) < 2) return; // width unchanged -> ignore
    prevInnerWidth = w;

    clearTimeout(to);
    to = setTimeout(() => start(true /*keepProgress*/), 120);
  });
});
