/* 관리자는 resources.json에 목록을, files 폴더에 공개할 파일을 등록합니다. */
(async () => {
  const status = document.getElementById('resources-status');
  const list = document.getElementById('resources-list');
  try {
    const response = await fetch('resources.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('목록 요청 실패');
    const items = await response.json();
    if (!Array.isArray(items)) throw new Error('목록 형식 오류');
    const fragment = document.createDocumentFragment();
    for (const item of [...items].sort((a, b) => String(b.date).localeCompare(String(a.date)))) {
      if (!item || typeof item.title !== 'string' || !item.title.trim() ||
          typeof item.file !== 'string' || !/^files\/(?!.*(?:\.\.|[\\?#%]))[^/].+/.test(item.file) ||
          typeof item.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
        throw new Error('자료 항목 형식 오류');
      }
      const row = document.createElement('li');
      row.className = 'resource-item';
      const information = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = item.title;
      const date = document.createElement('time');
      date.dateTime = item.date;
      date.textContent = item.date.replaceAll('-', '. ');
      information.append(title, date);
      if (typeof item.description === 'string' && item.description.trim()) {
        const description = document.createElement('p');
        description.textContent = item.description;
        information.append(description);
      }
      const link = document.createElement('a');
      link.className = 'button button-dark';
      link.href = item.file.split('/').map(encodeURIComponent).join('/');
      link.download = item.file.split('/').pop();
      link.textContent = '파일 내려받기 ↓';
      link.setAttribute('aria-label', `${item.title} 파일 내려받기`);
      row.append(information, link);
      fragment.append(row);
    }
    list.replaceChildren(fragment);
    status.textContent = items.length ? `총 ${items.length}개의 자료가 있습니다.` : '아직 등록된 자료가 없습니다. 자료가 준비되면 이곳에 안내하겠습니다.';
  } catch {
    status.textContent = '자료 목록을 불러오지 못했습니다. 잠시 후 새로고침해주세요.';
  }
})();
