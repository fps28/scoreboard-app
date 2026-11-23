(()=> {
const $=id=>document.getElementById(id);let people=[],hist=[],view='players',nextId=1;
try{const saved=JSON.parse(localStorage.getItem('scoreboardData')||'null');if(saved){people=saved.people||[];hist=saved.hist||[];nextId=saved.nextId||1}}catch{}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function color(v){if(v>=5000)return'#facc15';if(v>=1000)return'#22c55e';if(v>=0)return'#e5f8e8';if(v>-1000)return'#fce4ec';if(v>-5000)return'#ef4444';return'#800020'}
function save(){localStorage.setItem('scoreboardData',JSON.stringify({people,hist,nextId}))}
function render(){
$('tabPlayers').className=view==='players'?'active':'';$('tabHistory').className=view==='history'?'active':'';
$('players').hidden=view!=='players';$('history').hidden=view!=='history';$('add').hidden=view!=='players';$('msg').innerHTML='';
if(view==='players'){
$('players').innerHTML=people.map(p=>`<div class="player"><div class="playerline"><strong>${esc(p.name)}</strong><span class="score" style="background:${color(p.score)};color:${p.score<=-5000?'white':'#222'}">${p.score>0?'+':''}${p.score}</span></div><div class="editrow"><input data-p="${p.id}" type="number" step="1" placeholder="Изменение очков" value="${p.pending||''}"><button data-c="${p.id}" title="Очистить">↺</button>${p.score===0&&!p.pending?`<button data-r="${p.id}" title="Удалить">✕</button>`:''}</div></div>`).join('')||'<p>Добавь первого участника.</p>';
$('controls').innerHTML='<button class="primary" id="check">✓ Посчитать и подтвердить</button><button style="width:100%;margin-top:8px" id="cancel">Сбросить все изменения</button>';
document.querySelectorAll('[data-p]').forEach(i=>i.oninput=()=>{let p=people.find(x=>x.id==i.dataset.p);if(p){p.pending=i.value;save()}});
document.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{let p=people.find(x=>x.id==b.dataset.c);if(p)p.pending=0;save();render()});
document.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{people=people.filter(x=>x.id!=b.dataset.r);save();render()});
$('check').onclick=commit;$('cancel').onclick=()=>{people.forEach(p=>p.pending=0);save();render()};
}else{
$('controls').innerHTML='';$('history').innerHTML=hist.length?`<div class="history"><table><thead><tr><th>Время</th>${people.map(p=>`<th>${esc(p.name)}</th>`).join('')}</tr></thead><tbody>${hist.slice().reverse().map(h=>`<tr><td style="white-space:nowrap">${esc(h.time)}</td>${people.map(p=>{let e=h.entries.find(x=>x.id===p.id);return e?`<td style="background:${color(e.balance)};color:${e.balance<=-5000?'white':'#222'}"><b>${e.balance>0?'+':''}${e.balance}</b><div class="small">(${e.delta>0?'+':''}${e.delta})</div></td>`:'<td>—</td>'}).join('')}</tr>`).join('')}</tbody></table></div>`:'<p>История пока пуста.</p>';
}}
function commit(){let total=people.reduce((s,p)=>s+p.score+(parseInt(p.pending)||0),0);
if(!people.length){$('msg').innerHTML='<div class="msg">Добавь участников.</div>';return}
if(total!==0){$('msg').innerHTML=`<div class="msg bad">❌ Баланс не сходится. Общая сумма: ${total>0?'+':''}${total}. Исправь изменения и попробуй снова.</div>`;return}
let entries=[];people.forEach(p=>{let d=parseInt(p.pending)||0;if(d){p.score+=d;entries.push({id:p.id,delta:d,balance:p.score})}p.pending=0});
if(entries.length){hist.push({time:new Date().toLocaleString(),entries});$('msg').innerHTML='<div class="msg good">✓ Изменения подтверждены и записаны в историю.</div>'}else $('msg').innerHTML='<div class="msg">Нет изменений для записи.</div>';
save();render()}
$('add').onclick=()=>{let n=prompt('Имя участника:');if(n&&n.trim()){people.push({id:nextId++,name:n.trim(),score:0,pending:0});save();render()}};
$('tabPlayers').onclick=()=>{view='players';render()};$('tabHistory').onclick=()=>{view='history';render()};
render();if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
})();