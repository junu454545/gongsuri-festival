const filters = document.querySelectorAll('.program-filters button');
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
