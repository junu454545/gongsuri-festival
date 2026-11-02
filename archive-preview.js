'use strict';
(async()=>{
 const keys=['press','photos'];
 function node(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
 function safe(value){if(typeof value!=='string'||!value.trim())return null;try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}}
 function media(item,key){
  const box=node('span',undefined,'archive-thumb');
  const isVideo=Boolean(item.video)||/영상|방송/.test(item.type||'');
  const placeholder=()=>node('span',isVideo?'영상':key==='photos'?'갤러리':'보도자료','archive-thumb-empty');
  if(safe(item.image)){const img=node('img');img.src=safe(item.image);img.alt='';img.loading='lazy';img.decoding='async';img.addEventListener('error',()=>img.replaceWith(placeholder()));box.append(img);}
  else if(safe(item.video)){const video=node('video');video.src=safe(item.video)+(item.video.includes('#')?'':'#t=0.1');video.preload='metadata';video.muted=true;video.playsInline=true;video.setAttribute('aria-hidden','true');video.addEventListener('error',()=>video.replaceWith(placeholder()));box.append(video);}
  else box.append(placeholder());
  if(isVideo){const play=node('span','▶','archive-thumb-play');play.setAttribute('aria-hidden','true');box.append(play);}
  return box;
 }
 try{
  const response=await fetch('board.json',{cache:'no-cache'});if(!response.ok)throw Error('load');const data=await response.json();
  for(const key of keys){
   const list=document.getElementById('recent-'+key);if(!list)continue;
   const items=(Array.isArray(data[key])?data[key]:[]).filter(item=>item&&typeof item==='object');
   const dated=items.map((item,index)=>({item,index,date:String(item.date||item.registeredAt||'').match(/\b20\d{2}[.-]\d{2}(?:[.-]\d{2})?/)?.[0].replaceAll('.','-')||''}));
   dated.sort((a,b)=>b.date.localeCompare(a.date)||b.index-a.index);list.replaceChildren();
   for(const {item,date} of dated.slice(0,3)){
    const row=node('li'),link=node('a'),copy=node('span',undefined,'archive-preview-copy');
    link.href=safe(item.url||item.video||item.image||item.links?.[0]?.url)||'board.html#'+key;
    copy.append(node('strong',item.title||item.caption||'축제 기록'));
    if(date){const time=node('time',date.replaceAll('-','.'));time.dateTime=date;copy.append(time);}
    link.append(media(item,key),copy);row.append(link);list.append(row);
   }
   if(!items.length)list.append(node('li','등록된 자료가 없습니다.','archive-placeholder'));
  }
 }catch{for(const key of keys){const list=document.getElementById('recent-'+key);if(!list)continue;list.replaceChildren();const row=node('li'),link=node('a','자료실에서 보기 →');link.href='board.html#'+key;row.append(link);list.append(row);}}
})();
