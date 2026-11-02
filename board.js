'use strict';
(() => {
const keys=['notices','press','photos','statistics'];
const labels={press:'보도 자료',photos:'축제 사진',statistics:'통계 자료'};
function select(){const key=keys.includes(location.hash.slice(1))?location.hash.slice(1):'notices';keys.forEach(k=>document.getElementById(k).hidden=k!==key);document.querySelectorAll('[data-section]').forEach(a=>{if(a.dataset.section===key)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
addEventListener('hashchange',select);select();
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function safe(value){if(typeof value!=='string'||!value.trim())return null;try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}}
function video(value){try{const u=new URL(value),host=u.hostname.replace(/^www\./,'');let id;if(host==='youtu.be')id=u.pathname.split('/')[1];else if(['youtube.com','m.youtube.com'].includes(host))id=u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1];return /^[A-Za-z0-9_-]{11}$/.test(id||'')?id:null;}catch{return null;}}
function render(items,key){const list=document.getElementById(key+'-list');list.replaceChildren();if(!items.length){list.append(el('p','아직 등록된 '+labels[key]+' 게시물이 없습니다.','empty'));return;}
let previousYear=null;
items.forEach(item=>{if(!item||typeof item!=='object')return;
if(['press','photos','statistics'].includes(key)){
 const year=String(item.year||'공통');
 if(year!==previousYear){
  const heading=el('h3',year==='공통'?'연도 공통 자료':year+'년 자료','press-year-heading');
  const count=items.filter(entry=>String(entry.year||'공통')===year).length;
  heading.append(el('span',count+'건'));list.append(heading);previousYear=year;
 }
}
if(key==='photos'){
 const card=el('figure',undefined,'card');
 if(safe(item.video)){const player=el('video');player.src=safe(item.video);player.controls=true;player.preload='metadata';player.playsInline=true;player.setAttribute('aria-label',item.title||'축제 영상');const fallback=el('a','영상 열기');fallback.href=safe(item.video);player.append(fallback);card.append(player);}
 else if(safe(item.image)){const link=el('a',undefined,'archive-image');link.href=safe(item.image);link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',(item.year||'')+'년 축제 사진 원본 보기');const img=el('img');img.src=safe(item.image);img.alt=item.title||'축제 사진';img.loading='lazy';link.append(img);card.append(link);}
 list.append(card);return;
}
const card=el(key==='photos'?'figure':'article',undefined,'card'),id=key==='press'?video(item.url):null;
if(key==='press'){
 const target=safe(item.url),media=el(target?'a':'div',undefined,'archive-image press-thumbnail');
 if(target){media.href=target;media.target='_blank';media.rel='noopener noreferrer';media.setAttribute('aria-label',(item.title||'보도자료')+' 원문 열기');}
 const isVideo=Boolean(id)||/영상|방송/.test(item.type||'');
 const fallback=()=>el('span',isVideo?'영상 보기':/PDF/.test(item.type||'')?'PDF 자료':'보도자료','press-thumbnail-empty');
 if(safe(item.image)){
  const img=el('img');img.src=safe(item.image);img.alt=item.imageAlt||item.title||'보도자료 대표 사진';img.loading='lazy';img.decoding='async';img.width=480;img.height=300;img.addEventListener('error',()=>img.replaceWith(fallback()));media.append(img);
 }else media.append(fallback());
 if(isVideo){const play=el('span','▶','press-play');play.setAttribute('aria-hidden','true');media.append(play);}
 card.append(media);
}else if(id){const f=el('iframe');f.src='https://www.youtube-nocookie.com/embed/'+id;f.title=item.title||'축제 영상';f.loading='lazy';f.allowFullscreen=true;f.allow='encrypted-media; picture-in-picture';card.append(f);}else if(safe(item.image)){const img=el('img');img.src=safe(item.image);img.alt=item.caption||item.title||'축제 사진';img.loading='lazy';img.addEventListener('error',()=>img.replaceWith(el('p','이미지를 불러올 수 없습니다.','copy')));const media=el('div',undefined,'archive-image');media.append(img);card.append(media);}
const copy=el(key==='photos'?'figcaption':'div',undefined,'copy');
if(key==='press'&&(item.year||item.type))copy.append(el('span',[item.year==='공통'?'연도 공통':item.year?item.year+'년':'',item.type].filter(Boolean).join(' · '),'press-tag'));
if(item.date)copy.append(el('small',item.date));
if(item.source)copy.append(el('p',item.source,'press-source'));
if(key==='statistics'&&item.value!==undefined)copy.append(el('strong',String(item.value)+(item.unit||''),'value'));
if(item.title){card.id='entry-'+item.title;const heading=el('h3');if(key==='press'&&safe(item.url)){const titleLink=el('a',item.title);titleLink.href=safe(item.url);titleLink.target='_blank';titleLink.rel='noopener noreferrer';heading.append(titleLink);}else heading.textContent=item.title;copy.append(heading);}
if(item.caption||item.description)copy.append(el('p',item.caption||item.description));
const links=key==='press'&&Array.isArray(item.links)&&item.links.length?item.links:[{url:item.url,label:item.linkLabel||(key==='press'?'원문 / 자료 보기':'자료 자세히 보기')}];
for(const link of links){if(!safe(link.url))continue;const a=el('a',(link.label||'원문 열기')+' ↗');a.href=safe(link.url);a.target='_blank';a.rel='noopener noreferrer';if(item.download)a.download=item.url.split('/').pop();copy.append(a);}
card.append(copy);list.append(card);});}

function renderNotices(items){
 const list=document.getElementById('notices-list');list.replaceChildren();
 const valid=items.filter(item=>item&&typeof item==='object').sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
 if(!valid.length){const row=el('tr'),cell=el('td','아직 등록된 공지사항이 없습니다.','notice-empty');cell.colSpan=5;row.append(cell);list.append(row);return;}
 valid.forEach((item,index)=>{
  const row=el('tr'),titleCell=el('td'),button=el('button',item.title||'공지사항','notice-title');button.type='button';
  const detail=el('tr',undefined,'notice-body'),body=el('td');detail.hidden=true;detail.id='notice-detail-'+index;body.colSpan=5;
  button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',detail.id);
  button.addEventListener('click',()=>{detail.hidden=!detail.hidden;button.setAttribute('aria-expanded',String(!detail.hidden));});
  titleCell.append(button);if(Array.isArray(item.attachments)&&item.attachments.some(a=>safe(a.url)))titleCell.append(el('span',' 📎'));
  row.append(el('td',String(valid.length-index)),titleCell,el('td',item.author||'관리자'),el('td',item.date||'—'),el('td',item.views===undefined?'—':String(item.views)));
  body.append(el('p',item.content||item.description||''));
  if(safe(item.image)){const img=el('img');img.src=safe(item.image);img.alt=item.title||'공지사항 첨부 이미지';img.loading='lazy';body.append(img);}
  const links=[...(Array.isArray(item.attachments)?item.attachments:[]),...(item.url?[{url:item.url,label:'관련 자료 보기'}]:[])];
  links.forEach(link=>{if(!safe(link.url))return;const a=el('a',(link.label||'첨부파일 보기')+' ↗');a.href=safe(link.url);a.target='_blank';a.rel='noopener noreferrer';body.append(a);});
  detail.append(body);list.append(row,detail);
  if(new URLSearchParams(location.search).get('notice')===String(items.indexOf(item))){detail.hidden=false;button.setAttribute('aria-expanded','true');requestAnimationFrame(()=>row.scrollIntoView({block:'center'}));}
 });
}

function setupPress(items,key='press'){
 const filter=document.getElementById(key+'-year');
 const years=[...new Set(items.map(item=>String(item.year||'공통')))];
 years.sort((a,b)=>b.localeCompare(a));
 for(const year of years){const option=el('option',year==='공통'?'연도 공통':year+'년');option.value=year;filter.append(option);}
 function update(){const selected=filter.value;const visible=items.filter(item=>selected==='all'||String(item.year||'공통')===selected).sort((a,b)=>{
  const ay=a.year==='공통'?'0000':String(a.year||'0000'),by=b.year==='공통'?'0000':String(b.year||'0000');
  return by.localeCompare(ay)||String(b.date||'').localeCompare(String(a.date||''));
 });render(visible,key);document.getElementById(key+'-count').textContent=`총 ${items.length}건 중 ${visible.length}건`;}
 filter.addEventListener('change',update);update();
}
fetch('board.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('load');return r.json();}).then(data=>{setupPress(Array.isArray(data.press)?data.press:[]);setupPress(Array.isArray(data.photos)?data.photos:[],'photos');setupPress(Array.isArray(data.statistics)?data.statistics:[],'statistics');renderNotices(Array.isArray(data.notices)?data.notices:[]);keys.filter(k=>k!=='press'&&k!=='photos'&&k!=='statistics'&&k!=='notices').forEach(k=>render(Array.isArray(data[k])?data[k]:[],k));document.getElementById('status').textContent='';const entry=new URLSearchParams(location.search).get('entry');if(entry)requestAnimationFrame(()=>document.getElementById('entry-'+entry)?.scrollIntoView({block:'center'}));}).catch(()=>document.getElementById('status').textContent='자료를 불러오지 못했습니다. 잠시 후 새로고침해주세요.');
})();
