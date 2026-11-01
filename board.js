'use strict';
(() => {
const keys=['press','photos','statistics'];
const labels={press:'보도 자료',photos:'축제 사진',statistics:'통계 자료'};
function select(){const key=keys.includes(location.hash.slice(1))?location.hash.slice(1):'press';keys.forEach(k=>document.getElementById(k).hidden=k!==key);document.querySelectorAll('[data-section]').forEach(a=>{if(a.dataset.section===key)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
addEventListener('hashchange',select);select();
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function safe(value){if(typeof value!=='string'||!value.trim())return null;try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}}
function video(value){try{const u=new URL(value),host=u.hostname.replace(/^www\./,'');let id;if(host==='youtu.be')id=u.pathname.split('/')[1];else if(['youtube.com','m.youtube.com'].includes(host))id=u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1];return /^[A-Za-z0-9_-]{11}$/.test(id||'')?id:null;}catch{return null;}}
function render(items,key){const list=document.getElementById(key+'-list');list.replaceChildren();if(!items.length){list.append(el('p','아직 등록된 '+labels[key]+' 게시물이 없습니다.','empty'));return;}
let previousYear=null;
items.forEach(item=>{if(!item||typeof item!=='object')return;
if(key==='press'){
 const year=String(item.year||'공통');
 if(year!==previousYear){
  const heading=el('h3',year==='공통'?'연도 공통 자료':year+'년 자료','press-year-heading');
  const count=items.filter(entry=>String(entry.year||'공통')===year).length;
  heading.append(el('span',count+'건'));list.append(heading);previousYear=year;
 }
}
const card=el(key==='photos'?'figure':'article',undefined,'card'),id=key==='press'?video(item.url):null;
if(id){const f=el('iframe');f.src='https://www.youtube-nocookie.com/embed/'+id;f.title=item.title||'축제 영상';f.loading='lazy';f.allowFullscreen=true;f.allow='encrypted-media; picture-in-picture';card.append(f);}else if(safe(item.image)){const img=el('img');img.src=safe(item.image);img.alt=item.caption||item.title||'축제 사진';img.loading='lazy';img.addEventListener('error',()=>img.replaceWith(el('p','이미지를 불러올 수 없습니다.','copy')));const media=el('div',undefined,'archive-image');media.append(img);card.append(media);}
const copy=el(key==='photos'?'figcaption':'div',undefined,'copy');
if(key==='press'&&(item.year||item.type))copy.append(el('span',[item.year==='공통'?'연도 공통':item.year?item.year+'년':'',item.type].filter(Boolean).join(' · '),'press-tag'));
if(item.date)copy.append(el('small',item.date));
if(item.source)copy.append(el('p',item.source,'press-source'));
if(key==='statistics'&&item.value!==undefined)copy.append(el('strong',String(item.value)+(item.unit||''),'value'));
if(item.title)copy.append(el('h3',item.title));
if(item.caption||item.description)copy.append(el('p',item.caption||item.description));
const links=key==='press'&&Array.isArray(item.links)&&item.links.length?item.links:[{url:item.url,label:key==='press'?'원문 / 자료 보기':'자료 자세히 보기'}];
for(const link of links){if(!safe(link.url))continue;const a=el('a',(link.label||'원문 열기')+' ↗');a.href=safe(link.url);a.target='_blank';a.rel='noopener noreferrer';copy.append(a);}
card.append(copy);list.append(card);});}
function setupPress(items){
 const filter=document.getElementById('press-year');
 const years=[...new Set(items.map(item=>String(item.year||'공통')))];
 years.sort((a,b)=>b.localeCompare(a));
 for(const year of years){const option=el('option',year==='공통'?'연도 공통':year+'년');option.value=year;filter.append(option);}
 function update(){const selected=filter.value;const visible=items.filter(item=>selected==='all'||String(item.year||'공통')===selected).sort((a,b)=>{
  const ay=a.year==='공통'?'0000':String(a.year||'0000'),by=b.year==='공통'?'0000':String(b.year||'0000');
  return by.localeCompare(ay)||String(b.date||'').localeCompare(String(a.date||''));
 });render(visible,'press');document.getElementById('press-count').textContent=`총 ${items.length}건 중 ${visible.length}건`;}
 filter.addEventListener('change',update);update();
}
fetch('board.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('load');return r.json();}).then(data=>{setupPress(Array.isArray(data.press)?data.press:[]);keys.filter(k=>k!=='press').forEach(k=>render(Array.isArray(data[k])?data[k]:[],k));document.getElementById('status').textContent='';}).catch(()=>document.getElementById('status').textContent='자료를 불러오지 못했습니다. 잠시 후 새로고침해주세요.');
})();
