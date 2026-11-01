const boothCards = [...document.querySelectorAll('.booth-card')];
const boothButtons = [...document.querySelectorAll('.booth-open')];
const boothFilters = [...document.querySelectorAll('[data-booth-filter]')];
const boothDialog = document.querySelector('.booth-dialog');
let currentBooth = 0;
let openedFrom;
boothFilters.forEach(button => button.addEventListener('click', () => {
  boothFilters.forEach(item => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  let visible = 0;
  boothCards.forEach(card => {
    card.hidden = button.dataset.boothFilter !== '전체' && card.dataset.category !== button.dataset.boothFilter;
    if (!card.hidden) visible++;
  });
  document.querySelector('.booth-count').textContent = `${button.dataset.boothFilter} ${visible}개 안내`;
}));
function showBooth(index) {
  currentBooth = index;
  const button = boothButtons[index];
  const title = button.querySelector('strong').textContent;
  const thumbnail = button.querySelector('img');
  const file = thumbnail.getAttribute('src').split('/').pop().replace(/\.jpg$/, '.png');
  const original = `사진/부스/${file}`;
  document.querySelector('#booth-dialog-title').textContent = title;
  const image = document.querySelector('#booth-full-image');
  image.src = original;
  image.alt = `${title} 전체 안내문`;
  document.querySelector('#booth-original').href = original;
  document.querySelector('.booth-dialog-body').scrollTop = 0;
}
boothButtons.forEach((button, index) => button.addEventListener('click', () => {
  openedFrom = button;
  showBooth(index);
  boothDialog.showModal();
  document.body.classList.add('booth-modal-open');
}));
document.querySelector('.booth-close').addEventListener('click', () => boothDialog.close());
boothDialog.addEventListener('click', event => { if (event.target === boothDialog) { const r = boothDialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) boothDialog.close(); } });
boothDialog.addEventListener('close', () => { document.body.classList.remove('booth-modal-open'); openedFrom?.focus({ preventScroll:true }); });
function moveBooth(direction) {
  const visible = boothCards.flatMap((card, index) => card.hidden ? [] : [index]);
  showBooth(visible[(visible.indexOf(currentBooth) + direction + visible.length) % visible.length]);
}
document.querySelector('.booth-prev').addEventListener('click', () => moveBooth(-1));
document.querySelector('.booth-next').addEventListener('click', () => moveBooth(1));
boothDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); moveBooth(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); moveBooth(1); }
});
