const filters = document.querySelectorAll('.program-filters button');
const header = document.querySelector('.site-header');
const updateHeaderHeight = () => document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
new ResizeObserver(updateHeaderHeight).observe(header);
updateHeaderHeight();
const sectionLinks = document.querySelectorAll('.main-nav a, .quick-links a');
const sections = [...new Set([...sectionLinks].map(link => document.querySelector(link.getAttribute('href'))))].filter(Boolean);
const sectionObserver = new IntersectionObserver(entries => {
  const active = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
  if (!active) return;
  sectionLinks.forEach(link => {
    const selected = link.getAttribute('href') === `#${active.target.id}`;
    link.classList.toggle('is-current', selected);
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}, { rootMargin: '-25% 0px -45% 0px' });
sections.forEach(section => sectionObserver.observe(section));
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => {
    const selected = item === button;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('.program-card').forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.audience !== button.dataset.filter;
  });
}));
