const filters = document.querySelectorAll('.program-filters button');
const header = document.querySelector('.site-header');
const updateHeaderHeight = () => document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
new ResizeObserver(updateHeaderHeight).observe(header);
updateHeaderHeight();
// Include dropdown summaries as well as direct section links.
const sectionIds = ['about', 'guide', 'programs', 'location', 'resources'];
const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
const sectionControls = [...document.querySelectorAll('.main-nav > a[href^="#"], .main-nav summary[data-section], .quick-links a[href^="#"]')];
const quickLinks = document.querySelector('.quick-links');
function updateCurrentSection() {
  const marker = (header?.getBoundingClientRect().height || 0) + (quickLinks?.getBoundingClientRect().height || 0) + 48;
  let active = null;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= marker) active = section.id;
  }
  if (sections.length && window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    active = sections[sections.length - 1].id;
  }
  sectionControls.forEach(control => {
    const target = control.dataset.section || control.getAttribute('href')?.slice(1);
    const selected = target === active;
    control.classList.toggle('is-current', selected);
    if (selected) control.setAttribute('aria-current', 'location');
    else control.removeAttribute('aria-current');
  });
}
let sectionUpdatePending = false;
function scheduleSectionUpdate() {
  if (sectionUpdatePending) return;
  sectionUpdatePending = true;
  requestAnimationFrame(() => { sectionUpdatePending = false; updateCurrentSection(); });
}
window.addEventListener('scroll', scheduleSectionUpdate, {passive:true});
window.addEventListener('resize', scheduleSectionUpdate);
window.addEventListener('load', scheduleSectionUpdate);
new ResizeObserver(scheduleSectionUpdate).observe(document.body);
updateCurrentSection();
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
