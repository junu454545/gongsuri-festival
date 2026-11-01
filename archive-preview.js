'use strict';
(async()=>{
 const keys=['notices','press','photos','statistics'];
 try{
  const response=await fetch('board.json',{cache:'no-cache'});
  if(!response.ok)throw Error('load');
  const data=await response.json();
  for(const key of keys){
   const list=document.getElementById('recent-'+key);
   const items=(Array.isArray(data[key])?data[key]:[]).filter(item=>item&&typeof item==='object');
   const dated=items.map((item,index)=>({item,index,date:String(item.date||item.registeredAt||'').match(/\b20\d{2}[.-]\d{2}(?:[.-]\d{2})?/)?.[0].replaceAll('.','-')||''}));
   dated.sort((a,b)=>b.date.localeCompare(a.date)||b.index-a.index);
   list.replaceChildren();
   for(const {item,date} of dated.slice(0,3)){
    const row=document.createElement('li'),link=document.createElement('a'),title=document.createElement('strong');
    link.href='board.html#'+key;title.textContent=item.title||item.caption||'축제 기록';link.append(title);
    if(date){const time=document.createElement('time');time.dateTime=date;time.textContent=date.replaceAll('-','.');link.append(time);}
    row.append(link);list.append(row);
   }
   if(!items.length){const row=document.createElement('li');row.className='archive-placeholder';row.textContent='등록된 자료가 없습니다.';list.append(row);}
  }
 }catch{for(const key of keys){const list=document.getElementById('recent-'+key);list.replaceChildren();const row=document.createElement('li'),link=document.createElement('a');link.href='board.html#'+key;link.textContent='자료실에서 보기 →';row.append(link);list.append(row);}}
})();
