(function(){
 'use strict';
 const KEY='meutempo-shared-pitch-clock-v2';
 const params=new URLSearchParams(location.search);
 if(document.getElementById('demoLogin') && !params.has('mtclock') && params.get('tour') !== '1') return;
 const fresh=()=>({running:false,remainingMs:480000,endsAt:null,updatedAt:0});
 let state=fresh();
 function valid(x){return x&&typeof x.running==='boolean'&&Number.isFinite(x.remainingMs)&&Number.isFinite(x.updatedAt)&&(!x.running||Number.isFinite(x.endsAt))}
 function read(){let a=null,b=null;try{a=JSON.parse(localStorage.getItem(KEY))}catch{}try{b=JSON.parse(params.get('mtclock'))}catch{};const candidates=[state,a,b].filter(valid);state=candidates.sort((x,y)=>y.updatedAt-x.updatedAt)[0]||fresh()}
 read();
 const deck=!!document.getElementById('clock');
 let enabled=deck||params.has('mtclock')||state.updatedAt>0;
 let dock;
 if(!deck&&enabled){dock=document.createElement('div');dock.id='pitchDock';dock.innerHTML='<span>Pitch · <b id="sharedClock">08:00</b></span><button type="button" id="sharedToggle">Pausar</button><a href="'+(location.pathname.includes('/app/')||location.pathname.includes('/roteiro/')?'../apresentacao/index.html#8':'apresentacao/index.html#1')+'">Voltar aos slides</a>';document.body.appendChild(dock);const style=document.createElement('style');style.textContent='#pitchDock{position:fixed;bottom:78px;right:16px;z-index:90;display:flex;align-items:center;gap:12px;background:#163b38;color:white;padding:11px 14px;border-radius:12px;box-shadow:0 5px 25px #102d3840;font:12px Segoe UI,Arial,sans-serif}#pitchDock a{color:#dcf2b1}#pitchDock button{border:1px solid #87a496;background:transparent;border-radius:5px;padding:5px 8px;color:white;cursor:pointer}#pitchDock b{font-variant-numeric:tabular-nums}.pitch-over{color:#ffae98}@media print{#pitchDock{display:none}}';document.head.appendChild(style);document.getElementById('sharedToggle').onclick=toggle;}
 function left(){return state.running?state.endsAt-Date.now():state.remainingMs}
 function save(){state.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}paint()}
 function paint(){const ms=left(),sec=Math.ceil(Math.abs(ms)/1000),text=(ms<0?'−':'')+String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');for(const id of ['clock','sharedClock']){const el=document.getElementById(id);if(el){el.textContent=text;el.classList.toggle('over',ms<0);el.classList.toggle('pitch-over',ms<0)}}for(const id of ['timerButton','sharedToggle']){const el=document.getElementById(id);if(el)el.textContent=state.running?'Pausar':state.updatedAt?'Continuar':'Iniciar'}}
 function toggle(){if(state.running){state.remainingMs=left();state.running=false;state.endsAt=null}else{state.endsAt=Date.now()+state.remainingMs;state.running=true}save()}
 function reset(){state=fresh();save()}
 window.timerToggle=toggle;window.timerReset=reset;window.timerPaint=paint;
 window.MTClock={remaining:()=>left(),snapshot:()=>({...state}),toggle,reset};
 document.addEventListener('click',event=>{const a=event.target.closest?.('a[href]');if(!a)return;const url=new URL(a.getAttribute('href'),location.href);if(url.protocol!==location.protocol||url.host!==location.host||!url.pathname.endsWith('.html'))return;if(!enabled)return;url.searchParams.set('mtclock',JSON.stringify(state));a.href=url.href;});
 window.addEventListener('storage',event=>{if(event.key===KEY){try{const s=JSON.parse(event.newValue);if(valid(s)&&s.updatedAt>=state.updatedAt)state=s}catch{}paint()}});
 window.addEventListener('pageshow',()=>{read();paint()});document.addEventListener('visibilitychange',()=>{if(!document.hidden){read();paint()}});
 setInterval(paint,250);paint();
})();
