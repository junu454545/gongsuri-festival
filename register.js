(() => {
  'use strict';
  const form = document.querySelector('#archive-form');
  const fileInput = document.querySelector('#files');
  const list = document.querySelector('#file-list');
  const error = document.querySelector('#file-error');
  const message = document.querySelector('#form-message');
  const dialog = document.querySelector('#preview-dialog');
  const videoInput = document.querySelector('#video-url');
  const drop = document.querySelector('#drop-zone');
  const draftKey = 'gongsuri-archive-draft-v1';
  const labels = { photo: '사진', video: '영상', document: '문서' };
  const limits = {
    photo: { count: 10, size: 10 * 1024 * 1024, extensions: ['jpg', 'jpeg', 'png', 'webp'] },
    document: { count: 5, size: 20 * 1024 * 1024, extensions: ['pdf'] }
  };
  const attachments = { photo: [], document: [] };
  const type = () => form.elements.type.value;
  const fieldNames = ['year', 'contributor', 'title', 'description', 'videoUrl'];
  const setText = (selector, text) => { document.querySelector(selector).textContent = text; };

  function counts() {
    setText('#title-count', `${form.elements.title.value.length} / 80`);
    setText('#description-count', `${form.elements.description.value.length.toLocaleString('ko-KR')} / 2,000`);
  }

  function renderFiles() {
    list.replaceChildren();
    (attachments[type()] || []).forEach((item, index) => {
      const row = document.createElement('li');
      if (type() === 'photo') {
        const image = document.createElement('img');
        image.src = item.url;
        image.alt = `${item.file.name} 미리보기`;
        row.append(image);
      }
      const label = document.createElement('div');
      label.className = 'file-label';
      const name = document.createElement('strong');
      name.textContent = item.file.name;
      const size = document.createElement('small');
      size.textContent = `${(item.file.size / 1024 / 1024).toFixed(2)} MB`;
      label.append(name, size);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-file';
      remove.textContent = '삭제';
      remove.setAttribute('aria-label', `${item.file.name} 삭제`);
      remove.addEventListener('click', () => {
        URL.revokeObjectURL(item.url);
        attachments[type()].splice(index, 1);
        renderFiles();
        error.textContent = '';
        fileInput.focus();
      });
      row.append(label, remove);
      list.append(row);
    });
  }

  function updateType() {
    const selected = type();
    const video = selected === 'video';
    document.querySelector('#file-area').hidden = video;
    document.querySelector('#video-area').hidden = !video;
    videoInput.disabled = !video;
    videoInput.required = video;
    fileInput.disabled = video;
    setText('#file-hint', video ? '파일을 올리는 대신 영상 주소를 연결합니다.' : selected === 'photo' ? 'JPG, PNG, WEBP · 파일당 최대 10MB · 최대 10개' : 'PDF · 파일당 최대 20MB · 최대 5개');
    if (!video) {
      fileInput.accept = selected === 'photo' ? '.jpg,.jpeg,.png,.webp' : '.pdf';
      drop.querySelector('strong').textContent = selected === 'photo' ? '사진을 이곳에 놓아주세요' : '문서를 이곳에 놓아주세요';
    }
    error.textContent = '';
    renderFiles();
  }

  function addFiles(files) {
    const selected = type();
    if (selected === 'video') return;
    const rule = limits[selected];
    const errors = [];
    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!rule.extensions.includes(ext)) {
        errors.push(`${file.name}: ${rule.extensions.join(', ').toUpperCase()} 형식만 선택할 수 있습니다.`);
      } else if (file.size === 0 || file.size > rule.size) {
        errors.push(`${file.name}: 빈 파일이거나 ${rule.size / 1024 / 1024}MB를 초과합니다.`);
      } else if (attachments[selected].length >= rule.count) {
        errors.push(`최대 ${rule.count}개까지 선택할 수 있습니다.`);
        break;
      } else if (!attachments[selected].some(item => item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified)) {
        attachments[selected].push({ file, url: URL.createObjectURL(file) });
      }
    }
    error.textContent = [...new Set(errors)].join(' ');
    fileInput.value = '';
    renderFiles();
  }

  form.addEventListener('input', counts);
  form.querySelectorAll('[name="type"]').forEach(input => input.addEventListener('change', updateType));
  fileInput.addEventListener('change', () => addFiles(fileInput.files));
  ['dragenter', 'dragover'].forEach(event => drop.addEventListener(event, e => { e.preventDefault(); drop.classList.add('dragging'); }));
  drop.addEventListener('dragleave', () => drop.classList.remove('dragging'));
  drop.addEventListener('drop', e => {
    e.preventDefault();
    drop.classList.remove('dragging');
    addFiles(e.dataTransfer.files);
  });

  document.querySelector('#save-draft').addEventListener('click', () => {
    const draft = { type: type() };
    fieldNames.forEach(name => { draft[name] = form.elements[name].value; });
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
      message.textContent = '입력한 글을 이 브라우저에 임시 저장했습니다. 첨부 파일과 공개 동의는 저장되지 않습니다.';
    } catch {
      message.textContent = '이 브라우저에서는 임시 저장을 사용할 수 없습니다. 입력한 글을 따로 복사해 보관해주세요.';
    }
  });

  try {
    const draft = JSON.parse(localStorage.getItem(draftKey));
    if (draft && typeof draft === 'object') {
      if (Object.hasOwn(labels, draft.type)) form.elements.type.value = draft.type;
      fieldNames.forEach(name => {
        const field = form.elements[name];
        if (typeof draft[name] === 'string') field.value = draft[name].slice(0, field.maxLength > 0 ? field.maxLength : 2048);
      });
      message.textContent = '이전에 임시 저장한 글을 불러왔습니다. 첨부 파일과 공개 동의는 다시 선택해주세요.';
    }
  } catch { /* Unavailable storage or an old draft should not block writing. */ }

  function youtubeUrl(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
      if (url.hostname === 'youtu.be' && /^\/[\w-]{11}\/?$/.test(url.pathname)) return url;
      if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
        if (url.pathname === '/watch' && /^[\w-]{11}$/.test(url.searchParams.get('v') || '')) return url;
        if (/^\/(shorts|live|embed)\/[\w-]{11}\/?$/.test(url.pathname)) return url;
      }
    } catch { /* Show the same validation message for malformed links. */ }
    return null;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    error.textContent = '';
    ['title', 'description', 'contributor'].forEach(name => { form.elements[name].value = form.elements[name].value.trim(); });
    counts();
    if (!form.reportValidity()) return;
    const selected = type();
    let video;
    if (selected === 'video') {
      video = youtubeUrl(videoInput.value.trim());
      if (!video) {
        error.textContent = '올바른 HTTPS 유튜브 영상 주소를 입력해주세요.';
        videoInput.focus();
        return;
      }
    } else if (!attachments[selected].length) {
      error.textContent = `${labels[selected]} 파일을 한 개 이상 선택해주세요.`;
      fileInput.focus();
      return;
    }
    setText('#preview-label', `${form.elements.year.selectedOptions[0].textContent} · ${labels[selected]}`);
    setText('#preview-heading', form.elements.title.value);
    setText('#preview-byline', `기록 제공 · ${form.elements.contributor.value}`);
    setText('#preview-story', form.elements.description.value);
    const media = document.querySelector('#preview-media');
    media.replaceChildren();
    if (selected === 'video') {
      const link = document.createElement('a');
      link.href = video.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = '유튜브에서 영상 확인하기 ↗';
      media.append(link);
    } else {
      attachments[selected].forEach(item => {
        const el = document.createElement(selected === 'photo' ? 'img' : 'a');
        if (selected === 'photo') { el.src = item.url; el.alt = item.file.name; }
        else { el.href = item.url; el.download = item.file.name; el.textContent = `첨부 문서 · ${item.file.name}`; }
        media.append(el);
      });
    }
    dialog.showModal();
  });
  document.querySelector('#close-preview').addEventListener('click', () => dialog.close());
  document.querySelector('#back-edit').addEventListener('click', () => dialog.close());
  window.addEventListener('pagehide', () => {
    Object.values(attachments).flat().forEach(item => URL.revokeObjectURL(item.url));
    attachments.photo = [];
    attachments.document = [];
    renderFiles();
  });
  counts();
  updateType();
})();
