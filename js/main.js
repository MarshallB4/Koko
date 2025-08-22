// ===== CONFIG =====
const GOOGLE_API_KEY      = 'AIzaSyD3aMOveui9PmfiEUyN4R9rnqKMqGXi82M';
const PLACE_ID            = 'ChIJERgHBnhxcVMRNJGyVHKUFdM';
const SHOW_REVIEW_INDICES = [0, 2, 4];
const ANIM_DURATION       = 2000; // milliseconds

// ===== SETUP OBSERVER (but don’t start it yet) =====
const reviewsSection = document.getElementById('reviews');
const observer = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    loadGoogleReviews();
    observer.disconnect();
  }
}, { threshold: 0.5 });

// ===== GLOBAL CALLBACK for Maps+Places =====
// This function is called by the Maps script once it's loaded.
window.initGooglePlaces = function() {
  observer.observe(reviewsSection);
};

// ===== LOAD & RENDER REVIEWS via PlacesService =====
function loadGoogleReviews() {
  const service = new google.maps.places.PlacesService(
    document.createElement('div')
  );

  service.getDetails({
    placeId: PLACE_ID,
    fields: ['rating', 'user_ratings_total', 'reviews']
  }, (details, status) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
      console.error('PlacesService failed:', status);
      return;
    }
    animateStats(details.rating, details.user_ratings_total);
    renderReviewCards(details.reviews);
  });
}

// ===== COUNTER ANIMATION =====
function animateValue(el, start, end, duration) {
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const current = start + (end - start) * progress;
    el.textContent = el.id === 'avg-rating'
      ? current.toFixed(1)
      : Math.floor(current);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

function animateStats(rating, total) {
  const avgEl   = document.getElementById('avg-rating');
  const totalEl = document.getElementById('total-reviews');
  const starsEl = document.getElementById('stars');

  // Build 5 empty stars
  starsEl.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const star = document.createElement('span');
    star.textContent = '★';
    starsEl.appendChild(star);
  }

  // Animate the numbers
  animateValue(avgEl,   0, rating, ANIM_DURATION);
  animateValue(totalEl, 0, total,  ANIM_DURATION);

  // Fill stars after count completes
  setTimeout(() => {
    const filledCount = Math.round(rating);
    starsEl.querySelectorAll('span').forEach((star, idx) => {
      if (idx < filledCount) star.classList.add('filled');
    });
  }, ANIM_DURATION);
}

// ===== RENDER SELECTED REVIEW CARDS =====
function renderReviewCards(reviews) {
  const container = document.getElementById('review-list');
  container.innerHTML = ''; // clear old

  SHOW_REVIEW_INDICES.forEach(idx => {
    const rev = reviews[idx];
    if (!rev) return;
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <p class="review-text">“${rev.text}”</p>
      <p class="review-author">— ${rev.author_name}</p>
    `;
    container.appendChild(card);
  });
}


document.addEventListener('DOMContentLoaded', () => {
  const img = document.querySelector('.hero-media');
  // let the browser apply the initial state, then…
  requestAnimationFrame(() => {
    img.classList.add('slide-down');
  });
});

