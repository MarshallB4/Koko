// Smooth scroll + active tab highlight
const tabs = document.querySelectorAll('.menu-tabs a');
const sections = [...document.querySelectorAll('.menu-section')];

document.querySelector('.menu-tabs')?.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if(!a) return;
  e.preventDefault();
  document.querySelector(a.getAttribute('href'))?.scrollIntoView({behavior:'smooth', block:'start'});
});

const linkFor = id => [...tabs].find(t => t.getAttribute('href') === '#' + id);
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const link = linkFor(entry.target.id);
    if(!link) return;
    if(entry.isIntersecting){
      tabs.forEach(t => t.classList.remove('active'));
      link.classList.add('active');
    }
  });
}, {rootMargin: "-40% 0px -55% 0px", threshold: .01});

sections.forEach(s => io.observe(s));
tabs[0]?.classList.add('active');
