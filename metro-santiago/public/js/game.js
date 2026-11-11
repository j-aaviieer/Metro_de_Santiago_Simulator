const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a);
const hash=s=>{let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h};
// ---------- Estado ----------
const fresh=()=>({money:700,earned:0,pass:0,own:{},place:{},trains:{},cond:100,rb:0,start:false,up:{},fu:{},tok:0,lineDone:{},ach:{},
stat:{trains:0,ups:0,ev:0,evNeg:0,roja:0,music:0},tut:0,tutDone:false,ev:null,nextEv:0,t:0});
let S=fresh();try{const o=JSON.parse(localStorage.getItem('metroSt2')||'{}');Object.assign(S,o);S.stat=Object.assign(fresh().stat,o.stat||{})}catch(e){}
// ---------- Mejoras (dinero: se pierden al renacer) y fichas (permanentes) ----------
const UP={pas:{n:'Difusión y tarifas',e:'👥',d:'+10% pasajeros e ingresos por nivel',max:10,base:4000,g:2.1},
est:{n:'Escaleras y torniquetes',e:'🚪',d:'+12% ingresos de estaciones por nivel',max:10,base:6000,g:2.2},
mant:{n:'Mantenimiento preventivo',e:'🔧',d:'-12% desgaste de trenes por nivel',max:8,base:3000,g:2},
cap:{n:'Trenes de alta capacidad',e:'🚆',d:'+8% de servicio por nivel',max:8,base:8000,g:2.3},
tur:{n:'Marketing turístico',e:'📸',d:'+15% ingresos de turismo por nivel',max:8,base:5000,g:2.2},
seg:{n:'Plan de emergencia',e:'🛡️',d:'Los eventos malos duran menos y dañan menos',max:5,base:10000,g:2.5}};
const FU={inc:{n:'Ingresos eternos',e:'💎',d:'+10% ingresos por nivel',max:20,cost:l=>1+Math.floor(l/2)},
cap:{n:'Capital inicial',e:'💰',d:'Empiezas cada renacimiento con más dinero',max:10,cost:l=>1+l},
desc:{n:'Descuento de estaciones',e:'🏷️',d:'-5% al costo de las estaciones por nivel',max:10,cost:l=>2+l},
flota:{n:'Flota inicial',e:'🚇',d:'+1 tren inicial en cada línea que abras',max:3,cost:l=>3+2*l},
suerte:{n:'Buena racha',e:'🍀',d:'Más eventos buenos y menos eventos malos',max:5,cost:l=>2+l}};
const ul=k=>S.up[k]||0,fl=k=>S.fu[k]||0,upCost=k=>Math.floor(UP[k].base*Math.pow(UP[k].g,ul(k)));
// ---------- Eventos con tiempo ----------
const EVS={temporal:{n:'Temporal',e:'⛈️',neg:1,dur:45,inc:.1,tour:.1,freeze:1,txt:'Un temporal azota Santiago: el metro está bloqueado.'},
golpe:{n:'Golpe de Estado',e:'🪖',neg:1,dur:30,inc:.4,tour:0,txt:'Toque de queda: parte de tus trenes fue destruida.'},
paro:{n:'Paro de trabajadores',e:'✊',neg:1,dur:30,inc:.5,tour:1,txt:'Paro en el metro: el servicio baja.'},
apagon:{n:'Corte de luz',e:'🔌',neg:1,dur:25,inc:.2,tour:.5,freeze:1,txt:'Apagón en la red: los trenes se detienen.'},
lluvia:{n:'Lluvia de pasajeros',e:'👥',neg:0,dur:40,inc:2.5,tour:1,txt:'¡Una lluvia de pasajeros llena la red!'},
roja:{n:'Partido de La Roja',e:'⚽',neg:0,dur:50,inc:1.5,tour:3,txt:'Juega La Roja: hinchas y turistas por todos lados.'},
fiestas:{n:'Fiestas Patrias',e:'🎉',neg:0,dur:60,inc:2,tour:2,txt:'¡Fiestas Patrias! Todo Santiago viaja.'}};
const evM=()=>S.ev&&EVS[S.ev.id]?EVS[S.ev.id]:{inc:1,tour:1};
const frozen=()=>S.ev&&EVS[S.ev.id]&&EVS[S.ev.id].freeze;
function startEv(now){const neg=Math.random()<.45-.06*fl('suerte'),ids=Object.keys(EVS).filter(k=>!!EVS[k].neg===neg),id=ids[Math.floor(Math.random()*ids.length)],e=EVS[id],dur=e.dur*(e.neg?1-.12*ul('seg'):1)*1000;
S.ev={id,end:now+dur,tot:dur};
if(id==='golpe'){const lost=.5*(1-.15*ul('seg'));for(const k in S.trains)S.trains[k]=Math.max(1,Math.floor(S.trains[k]*(1-lost)));render()}
toast(`${e.e} <b>${e.n}</b> — ${e.txt}`,e.neg?'bad':'good',8000);e.neg?SFX.err():SFX.up()}
function endEv(now){const e=EVS[S.ev.id];S.stat.ev++;if(e.neg)S.stat.evNeg++;if(S.ev.id==='roja')S.stat.roja++;S.ev=null;S.nextEv=now+rnd(90,180)*1000;toast(`✅ Terminó: ${e.n}.`,'',4000)}
function evTick(now){if(nOwn()<3)return;if(S.ev){if(now>=S.ev.end)endEv(now);return}if(!S.nextEv)S.nextEv=now+rnd(60,120)*1000;if(now>=S.nextEv)startEv(now)}
// ---------- Noticias y avisos ----------
const NEWS=["Ciclistas llenan los bicicleteros del metro este fin de semana.","Santiago amanece con smog: más gente prefiere el metro.","Feria artesanal en Plaza de Armas atrae turistas.","Se agota el mote con huesillo en las estaciones.","Estudiantes llenan los vagones camino a la universidad.","Concierto gratis en el Parque O'Higgins: ¡más pasajeros!","Turistas piden más información en inglés en el metro.","Campaña: «Dejen bajar antes de subir».","Un vendedor ofrece sopaipillas en el andén.","Nueva exposición en el Centro Cultural La Moneda.","Ola de calor: los vagones con aire acondicionado son un éxito.","Un completo italiano gigante sorprende en Estación Central."];
const GIFTS=["Un músico callejero se vuelve viral en el andén y deja propinas para la red.","Récord: todos los trenes llegaron a tiempo hoy.","Un perro quiltro viaja solo en la línea y se hace famoso.","Un turista pierde su billete de lotería y lo dona al metro."];
const TIPS=["Repara tus trenes seguido para mantener alta la felicidad.","Completa una línea entera y gana +20% en toda ella.","Las fichas de renacer dan mejoras permanentes en 🛍️ Tienda.","El Plan de emergencia reduce el daño de temporales y golpes."];
let nextNews=0;
function toast(t,cls='',ms=6000,fn){const c=$('toasts'),e=document.createElement('div');e.className='toast '+cls;e.innerHTML=t;c.prepend(e);const rm=()=>{e.classList.add('out');setTimeout(()=>e.remove(),300)};e.onclick=()=>{if(fn)fn();rm()};setTimeout(rm,ms);while(c.children.length>4)c.lastChild.remove()}
function newsTick(now){if(!nextNews){nextNews=now+rnd(20,40)*1000;return}if(now<nextNews)return;nextNews=now+rnd(40,75)*1000;SFX.news();const r=Math.random();
if(r<.2){const g=Math.floor(calc().inc*30);toast(`📰 ${GIFTS[Math.floor(Math.random()*GIFTS.length)]}<br><small>Toca para cobrar +${$$(g)}</small>`,'gift',9000,()=>{S.money+=g;S.earned+=g;SFX.buy()})}
else if(r<.35)toast('💡 '+TIPS[Math.floor(Math.random()*TIPS.length)]);else toast('📰 '+NEWS[Math.floor(Math.random()*NEWS.length)])}
// ---------- Reglas ----------
const fmt=n=>{for(const[v,s]of[[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']])if(n>=v){const q=n/v;return q.toFixed(q<10?2:1)+s}return Math.floor(n)+''};
const $$=n=>'CL$'+fmt(n);
const nOwn=()=>Object.keys(S.own).length,nPl=()=>Object.keys(S.place).length;
const lineOwn=k=>LINES[k].st.filter(n=>S.own[n]!==undefined).length;
const need=k=>Math.max(1,Math.ceil(lineOwn(k)/4));
const service=k=>lineOwn(k)?Math.min(1.25,(S.trains[k]||0)/need(k))*(1+.08*ul('cap')):0;
const happy=()=>Math.round(Math.min(100,S.cond>=70?58+(S.cond-70)*1.4:S.cond*.8));
const buyCost=()=>Math.floor(600*Math.pow(1.55,nOwn())*(1-.05*fl('desc')));
const lvCost=n=>Math.floor(300*Math.pow(2.4,S.own[n])*(1+.1*nOwn()));
const maxCost=n=>{let t=0;for(let l=S.own[n];l<5;l++)t+=Math.floor(300*Math.pow(2.4,l)*(1+.1*nOwn()));return t};
const plCost=()=>Math.floor(1500*Math.pow(1.7,nPl()));
const trCost=k=>Math.floor(800*Math.pow(1.45,S.trains[k]||0));
const nTrains=()=>Object.values(S.trains).reduce((a,b)=>a+b,0);
const repCost=()=>Math.ceil((100-S.cond)*nTrains()*40);
const rbReq=()=>250000*Math.pow(4,S.rb);
const tokGain=()=>1+Math.floor(Math.log2(S.money/rbReq()+1));
const canBuy=n=>S.start&&S.own[n]===undefined&&[...ST[n].adj].some(m=>S.own[m]!==undefined);
const vis=n=>!S.start||S.own[n]!==undefined||canBuy(n);
const nAch=()=>Object.keys(S.ach).length;
function calc(){let base=0,pp=0;const sv={};for(const k in LINES)sv[k]=service(k);
for(const n in S.own){const s=ST[n];let sr=0,c=0,lm=1;s.ls.forEach(l=>{if(S.trains[l]){sr+=sv[l];c++}if(S.lineDone[l])lm*=1.2});const f=(1+.5*S.own[n])*(c?sr/c:0)*lm;base+=20*f;pp+=4*f}
const e=evM(),np=nPl(),hm=.5+happy()/200,pb=1+.03*np,glob=(1+.1*ul('pas'))*(1+.75*S.rb)*(1+.1*fl('inc'))*(1+.01*nAch())*e.inc,tour=np*12*(1+.15*ul('tur'))*e.tour;
return{inc:(base*(1+.12*ul('est'))*pb*hm+tour)*glob,pass:pp*hm*glob,np,tour:tour*glob}}
// ---------- Mapa ----------
function render(){let h='';
for(const k in LINES){const L=LINES[k],a=L.st;for(let i=1;i<a.length;i++){const p=a[i-1],q=a[i],op=S.own[p]!==undefined,oq=S.own[q]!==undefined;
if(S.start&&!(op||oq))continue;if(!vis(p)||!vis(q))continue;const on=op&&oq,A=ST[p],B_=ST[q];
h+=`<line x1="${A.x}" y1="${A.y}" x2="${B_.x}" y2="${B_.y}" stroke="${L.c}" stroke-width="${on?10:7}" stroke-linecap="round" opacity="${on?1:.3}"/>`}}
IDX.forEach((n,i)=>{if(!vis(n))return;const s=ST[n],o=S.own[n]!==undefined,b=canBuy(n),tr=s.ls.length>1,r=tr?12:8,p=PL[n];
h+=`<g class="st" data-i="${i}"><circle cx="${s.x}" cy="${s.y}" r="22" fill="transparent"/>`;
if(p&&S.start){const got=S.place[n],dx=hash(n)%2?-48:48,dy=-48;
h+=`<line x1="${s.x}" y1="${s.y}" x2="${s.x+dx}" y2="${s.y+dy}" stroke="#9aa5b1" stroke-width="3" stroke-dasharray="5 5" opacity=".6"/><g class="pl ${got?'got':''}" transform="translate(${s.x+dx} ${s.y+dy})"><circle r="24" fill="#fff" stroke="${got?'#f0a800':'#b8c1ca'}" stroke-width="4"/><text y="10" font-size="28" text-anchor="middle">${p[1]}</text></g>`;
if(got)h+=`<text class="lb k" x="${s.x+dx}" y="${s.y+dy+42}">${p[0]}</text>`}
h+=`<circle class="${b?'pulse':''}" cx="${s.x}" cy="${s.y}" r="${r}" fill="#fff" stroke="${o?'#222':b?'#f5a300':'#aab4bc'}" stroke-width="3"/>`;
if(tr)s.ls.forEach((l,j)=>h+=`<circle cx="${s.x+(j-(s.ls.length-1)/2)*7}" cy="${s.y}" r="3" fill="${LINES[l].c}"/>`);
h+=`<text class="lb ${o||b?'k':''}" x="${s.x}" y="${s.y+r+18}">${n}${o?' ·'+S.own[n]:''}</text></g>`});
h+='<g id="tg" pointer-events="none"></g>';$('w').innerHTML=h;buildTrains()}
// ---------- Trenes animados ----------
let TR=[],lt=0;
function buildTrains(){let h='';TR=[];
for(const k in LINES){const a=LINES[k].st,runs=[];let r=[];a.forEach(n=>{if(S.own[n]!==undefined)r.push(n);else{if(r.length>1)runs.push(r);r=[]}});if(r.length>1)runs.push(r);
const T=Math.min(S.trains[k]||0,8);if(!runs.length)continue;
for(let i=0;i<T;i++){const pts=runs[i%runs.length].map(n=>[ST[n].x,ST[n].y]),cum=[0];for(let j=1;j<pts.length;j++)cum.push(cum[j-1]+Math.hypot(pts[j][0]-pts[j-1][0],pts[j][1]-pts[j-1][1]));
const len=cum[cum.length-1],per=Math.max(1,Math.ceil(T/runs.length));
TR.push({pts,cum,len,u:Math.floor(i/runs.length)*(2*len/per)});
h+=`<g><rect x="-17" y="-7" width="34" height="14" rx="6" fill="${LINES[k].c}" stroke="#fff" stroke-width="2.5"/><rect x="5" y="-4.5" width="8" height="9" rx="2" fill="#fff" opacity=".85"/><rect x="-9" y="-4.5" width="8" height="9" rx="2" fill="#fff" opacity=".55"/></g>`}}
$('tg').innerHTML=h;TR.forEach((r,i)=>r.el=$('tg').children[i])}
function loop(t){const dt=Math.min(.1,(t-lt)/1000||0);lt=t;const fz=frozen();
TR.forEach(r=>{if(!fz)r.u=(r.u+130*dt)%(2*r.len);const fw=r.u<r.len,d=fw?r.u:2*r.len-r.u;let j=1;while(j<r.cum.length-1&&r.cum[j]<d)j++;
const a=r.pts[j-1],b=r.pts[j],f=(d-r.cum[j-1])/((r.cum[j]-r.cum[j-1])||1);let ang=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;if(!fw)ang+=180;
r.el.setAttribute('transform',`translate(${a[0]+(b[0]-a[0])*f} ${a[1]+(b[1]-a[1])*f}) rotate(${ang})`)});requestAnimationFrame(loop)}
// ---------- Zoom / pan ----------
let V={x:0,y:0,k:.4},drag=null,moved=0;
const ap=()=>{$('w').setAttribute('transform',`translate(${V.x} ${V.y}) scale(${V.k})`);$('map').classList.toggle('zl',V.k<.7)};
function zoom(f,cx=innerWidth/2,cy=innerHeight/2){const k=Math.min(2.5,Math.max(.15,V.k*f));f=k/V.k;V.x=cx-(cx-V.x)*f;V.y=cy-(cy-V.y)*f;V.k=k;ap()}
function centerOn(n,k=.8){V.k=k;V.x=innerWidth/2-ST[n].x*k;V.y=innerHeight/2-ST[n].y*k;ap()}
$('map').addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,vx:V.x,vy:V.y};moved=0});
addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved=Math.max(moved,Math.abs(dx)+Math.abs(dy));V.x=drag.vx+dx;V.y=drag.vy+dy;ap()});
addEventListener('pointerup',()=>drag=null);
$('map').addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.15:1/1.15,e.clientX,e.clientY)},{passive:false});
$('map').addEventListener('click',e=>{if(moved>6)return;const g=e.target.closest('.st');if(g)clickSt(+g.dataset.i)});
$('dl').innerHTML=IDX.map(n=>`<option value="${n}">`).join('');
$('sb').addEventListener('change',e=>{const n=e.target.value;if(!ST[n])return;e.target.value='';if(vis(n)){centerOn(n);if(!S.start)clickSt(IDX.indexOf(n))}else SFX.err()});
// ---------- Modales ----------
let cur=null,shopTab=0;
const B=(l,c,fn,cost=0)=>`<button class="btn" style="--c:${c}" data-cost="${cost}" ${S.money<cost?'disabled':''} onclick="${fn}">${l}</button>`;
function show(fn){const first=$('ov').style.display!=='flex';cur=fn;const o=fn();
$('md').innerHTML=`<div class="mh" style="background:${o.c}"><div><h2>${o.t}</h2><div class="sub">${o.s||''}</div></div><button class="x" onclick="closeM()">✕</button></div><div class="mb2">${o.b}</div>`;
$('ov').style.display='flex';if(first){SFX.open();for(const e of[$('md'),$('ov')]){e.classList.remove('in');void e.offsetWidth;e.classList.add('in')}}}
function refresh(){if(!cur)return;const e=document.querySelector('.mb2'),sc=e?e.scrollTop:0;show(cur);document.querySelector('.mb2').scrollTop=sc;render();hud()}
function closeM(){if(cur)SFX.close();cur=null;$('ov').style.display='none'}
const chips=s=>s.ls.map(l=>`<span class="chip" style="background:${LINES[l].c}">${l}</span>`).join('');
function mStation(i){return()=>{const n=IDX[i],s=ST[n],o=S.own[n]!==undefined,lv=S.own[n]||0,p=PL[n];let b='';
if(o){b+=`<div class="box"><div class="lvl">${lv}</div><div><b style="font-size:20px">Nivel de estación ${lv} / 5</b><div class="pu">Pasajeros +${lv*50}% → ${lv<5?'siguiente nivel +'+(lv+1)*50+'%':'nivel máximo'}</div></div></div>`;
b+=lv<5?`<div class="g2">${B('▲ Mejorar '+$$(lvCost(n)),'#7c4dff',`up(${i})`,lvCost(n))}${B('⏫ Nivel máximo '+$$(maxCost(n)),'#ff5a52',`upMax(${i})`,maxCost(n))}</div>`:`<div class="hint">✅ Esta estación está al máximo.</div>`}
else b+=`<div class="hint">🔓 Conectada a una estación tuya.</div>${B('🚉 Comprar estación '+$$(buyCost()),'#22c36b',`buy(${i})`,buyCost())}`;
if(p)b+=`<div class="card ${S.place[n]?'on':''}"><b>${p[1]} ${p[0]}</b><small>Turismo +CL$12/s · Todas las líneas +3%</small>${S.place[n]?'<b style="color:#16a34a">✅ Comprado</b>':o?B('Comprar '+$$(plCost()),'#f0a30f',`buyP(${i})`,plCost()):'<small>🔒 Abre la estación para comprarlo</small>'}</div>`;
return{c:LINES[s.ls[0]].c,t:n,s:chips(s),b}}}
const startTrains=n=>ST[n].ls.forEach(l=>S.trains[l]=S.trains[l]||1+fl('flota'));
function clickSt(i){const n=IDX[i];SFX.click();if(!S.start){if(confirm('¿Empezar en '+n+'?')){S.start=true;S.own[n]=0;startTrains(n);SFX.buy();render();centerOn(n,.9);hud()}return}
if(vis(n))show(mStation(i))}
function buy(i,silent){const n=IDX[i],c=buyCost();if(S.money<c||!canBuy(n))return false;S.money-=c;S.own[n]=0;startTrains(n);if(!silent){SFX.buy();refresh()}return true}
function up(i,silent){const n=IDX[i];if(S.own[n]>=5)return;const c=lvCost(n);if(S.money<c)return;S.money-=c;S.own[n]++;if(!silent){SFX.up();refresh()}}
function upMax(i){const n=IDX[i];while(S.own[n]<5&&S.money>=lvCost(n))up(i,1);SFX.up();refresh()}
function buyP(i,silent){const n=IDX[i],c=plCost();if(S.money<c||S.place[n]||S.own[n]===undefined)return;S.money-=c;S.place[n]=1;if(!silent){SFX.buy();refresh()}}
function joinAll(limit){let spent=0;for(;;){const i=IDX.findIndex(canBuy);if(i<0)break;const c=buyCost();if(S.money<c||spent+c>limit)break;spent+=c;buy(i,1)}SFX.buy();refresh()}
function allUp(max){for(let r=0;r<(max?5:1);r++)IDX.forEach((n,i)=>{if(S.own[n]!==undefined)up(i,1)});SFX.up();refresh()}
function mLines(){const open=Object.keys(LINES).filter(k=>lineOwn(k)),c=calc();let ed=0;for(const k in LINES){const a=LINES[k].st;for(let i=1;i<a.length;i++)if(S.own[a[i]]!==undefined&&S.own[a[i-1]]!==undefined)ed++}
let b=`<div class="g2">${B('🔗 Unir todo (½ cartera)','#22c36b','joinAll(S.money/2)')}${B('🔗 Unir todo (máx.)','#ff5a52','joinAll(S.money)')}${B('⬆️ Todas las estaciones +1','#7c4dff','allUp(0)')}${B('⏫ Todas las estaciones al MAX','#ff5a52','allUp(1)')}</div><b style="font-size:20px">🔓 Líneas abiertas</b>`;
open.forEach(k=>{const L=LINES[k];b+=`<div class="row"><span class="chip" style="background:${L.c}">${k}</span><div><b style="font-size:18px">${L.nm} ${S.lineDone[k]?'✅ +20%':''}</b><br><small>estaciones ${lineOwn(k)} / ${L.st.length} · Trenes ${S.trains[k]||0} / necesarios ${need(k)}</small></div><span class="sv">Servicio ${Math.round(service(k)*100)}%</span></div>`});
return{c:'#3b82f6',t:'Estado de líneas',s:`Líneas ${open.length} / ${Object.keys(LINES).length} · Tramos ${ed} / ${EDGES} · ${$$(c.inc)}/s`,b}}
function mTrains(){let b=`<div class="box" style="background:#e9f8ef;border-color:#bfe8cf"><div><b style="font-size:20px">🔧 Estado de los trenes ${Math.round(S.cond)}%</b><div class="pu" style="color:#2a6a45">Se desgastan poco a poco. Bajo el 70% baja la felicidad. Cada tren aparece recorriendo la línea (hasta 8 por línea).</div></div>${B('🔧 Reparar todo '+$$(repCost()),'#ff5a52','repair()',repCost())}</div>`;
Object.keys(LINES).filter(k=>lineOwn(k)).forEach(k=>{const L=LINES[k];b+=`<div class="row" style="border-color:#e5e8ec"><span class="chip" style="background:${L.c}">${k}</span><div><b>${L.nm}</b><br><small>Trenes ${S.trains[k]} / necesarios ${need(k)} · Servicio ${Math.round(service(k)*100)}%</small></div><span style="margin-left:auto">${B('🚇 +1 tren '+$$(trCost(k)),'#22c36b',`addT('${k}')`,trCost(k))}</span></div>`});
return{c:'#22c36b',t:'Trenes · Flota',s:`${nTrains()} trenes · estado ${Math.round(S.cond)}%`,b}}
function repair(){const c=repCost();if(S.money<c)return;S.money-=c;S.cond=100;SFX.up();refresh()}
function addT(k){const c=trCost(k);if(S.money<c)return;S.money-=c;S.trains[k]++;S.stat.trains++;SFX.buy();refresh()}
function mPlaces(){const c=calc(),av=IDX.filter(n=>PL[n]&&S.own[n]!==undefined&&!S.place[n]),tot=IDX.filter(n=>PL[n]).length;
let b=`<div class="hint" style="background:none;color:#444">Cada lugar atrae turismo y sube un 3% los ingresos de todas las líneas. También los ves en el mapa: grises hasta que los compras.</div>${B('🏛️ Comprar todos los lugares abiertos ('+av.length+')','#22c36b','allP()',av.length?plCost():1e99)}<div class="g2">`;
IDX.filter(n=>PL[n]).forEach(n=>{const i=IDX.indexOf(n),o=S.own[n]!==undefined;b+=`<div class="card ${S.place[n]?'on':''}"><b>${PL[n][1]} ${PL[n][0]}</b><small>Estación ${n}</small>${S.place[n]?'<b style="color:#16a34a">✅ Comprado</b>':o?B('Comprar '+$$(plCost()),'#f0a30f',`buyP(${i})`,plCost()):'<small>🔒 Estación cerrada</small>'}</div>`});
return{c:'#f0a30f',t:'Santiago · Lugares de interés',s:`Tienes ${c.np} / ${tot} · Turismo +${$$(c.tour)}/s · Todas las líneas +${c.np*3}%`,b:b+'</div>'}}
function allP(){IDX.forEach((n,i)=>buyP(i,1));SFX.buy();refresh()}
// ---------- Tienda ----------
function mShop(){let b=`<div class="tabs"><button class="${!shopTab?'on':''}" onclick="shopTab=0;SFX.click();refresh()">💰 Mejoras</button><button class="${shopTab?'on':''}" onclick="shopTab=1;SFX.click();refresh()">💠 Fichas de renacer</button></div>`;
if(!shopTab){b+='<div class="hint">Estas mejoras se pierden al renacer.</div><div class="g2">';
for(const k in UP){const u=UP[k],l=ul(k),c=upCost(k);b+=`<div class="card"><b>${u.e} ${u.n}</b><small>${u.d}</small><small>Nivel ${l} / ${u.max}</small>${l>=u.max?'<b style="color:#16a34a">✅ MAX</b>':B('Comprar '+$$(c),'#0ea5e9',`buyUp('${k}')`,c)}</div>`}b+='</div>'}
else{b+=`<div class="box"><div class="lvl" style="font-size:28px">💠</div><div><b style="font-size:20px">${S.tok} fichas</b><div class="pu">Las ganas al renacer. Estas mejoras son permanentes.</div></div></div><div class="g2">`;
for(const k in FU){const u=FU[k],l=fl(k),c=u.cost(l);b+=`<div class="card"><b>${u.e} ${u.n}</b><small>${u.d}</small><small>Nivel ${l} / ${u.max}</small>${l>=u.max?'<b style="color:#16a34a">✅ MAX</b>':`<button class="btn" style="--c:#7c4dff" ${S.tok<c?'disabled':''} onclick="buyFu('${k}')">Comprar ${c} 💠</button>`}</div>`}b+='</div>'}
return{c:'#0ea5e9',t:'Tienda de mejoras',s:`${$$(S.money)} · ${S.tok} 💠`,b}}
function buyUp(k){const c=upCost(k);if(S.money<c||ul(k)>=UP[k].max)return;S.money-=c;S.up[k]=ul(k)+1;S.stat.ups++;SFX.buy();refresh()}
function buyFu(k){const c=FU[k].cost(fl(k));if(S.tok<c||fl(k)>=FU[k].max)return;S.tok-=c;S.fu[k]=fl(k)+1;SFX.up();refresh()}
// ---------- Logros ----------
const ACH=[];const A=(id,e,n,d,fn)=>ACH.push({id,e,n,d,fn});
A('est1','🚉','Primera parada','Empieza tu red',()=>nOwn()>=1);A('est10','🛤️','Red en crecimiento','Ten 10 estaciones',()=>nOwn()>=10);A('est25','🚏','Gran red','Ten 25 estaciones',()=>nOwn()>=25);A('est50','🏙️','Ciudad conectada','Ten 50 estaciones',()=>nOwn()>=50);A('estall','👑','Dueño del metro','Compra todas las estaciones',()=>nOwn()>=IDX.length);
A('lv5','⭐','Nivel máximo','Una estación al nivel 5',()=>Object.values(S.own).some(l=>l>=5));A('lv5b','🌟','Estaciones de lujo','10 estaciones al nivel 5',()=>Object.values(S.own).filter(l=>l>=5).length>=10);
A('tr5','🚇','Flota','Ten 5 trenes',()=>nTrains()>=5);A('tr20','🚆','Flota grande','Ten 20 trenes',()=>nTrains()>=20);A('tr50','🚄','Imperio ferroviario','Ten 50 trenes',()=>nTrains()>=50);
A('pl1','📸','Turista','Compra un lugar de interés',()=>nPl()>=1);A('pl5','🧭','Guía turístico','Compra 5 lugares',()=>nPl()>=5);A('plall','🏛️','Patrimonio completo','Compra todos los lugares',()=>nPl()>=Object.keys(PL).length);
A('ln1','🏁','Línea completa','Completa una línea (+20% en ella)',()=>Object.keys(S.lineDone).length>=1);A('ln3','🎯','Tres líneas','Completa 3 líneas',()=>Object.keys(S.lineDone).length>=3);A('lnall','🏆','Metro completo','Completa todas las líneas',()=>Object.keys(S.lineDone).length>=Object.keys(LINES).length);
A('rb1','🔁','Renacido','Renace una vez',()=>S.rb>=1);A('rb3','♻️','Reincidente','Renace 3 veces',()=>S.rb>=3);A('rb5','🔥','Leyenda','Renace 5 veces',()=>S.rb>=5);
A('m1','💵','Millonario','Gana CL$1M en total',()=>S.earned>=1e6);A('m2','💰','Multimillonario','Gana CL$1B en total',()=>S.earned>=1e9);A('m3','🤑','Magnate','Gana CL$1T en total',()=>S.earned>=1e12);
A('p1','👥','Hora punta','100.000 pasajeros',()=>S.pass>=1e5);A('p2','🚏','Marea humana','10 millones de pasajeros',()=>S.pass>=1e7);
A('u1','🛍️','Comprador','Compra una mejora',()=>S.stat.ups>=1);A('u2','🔧','Maxeado','Lleva una mejora al máximo',()=>Object.keys(UP).some(k=>ul(k)>=UP[k].max));A('t1','💠','Ficha de oro','Compra una mejora con fichas',()=>Object.values(S.fu).some(v=>v>0));
A('e1','🌩️','Superviviente','Sobrevive a un evento malo',()=>S.stat.evNeg>=1);A('e2','🛡️','Veterano de crisis','Sobrevive a 5 eventos malos',()=>S.stat.evNeg>=5);A('e3','⚽','Hincha de La Roja','Vive un Partido de La Roja',()=>S.stat.roja>=1);A('mu','🎵','Melómano','Escucha música chilena',()=>S.stat.music>=1);
function checkAch(){let n=0;for(const a of ACH)if(!S.ach[a.id]&&a.fn()){S.ach[a.id]=1;n++;toast(`🏆 <b>Logro: ${a.n}</b><br><small>${a.d} · +1% ingresos</small>`,'good',6000)}if(n)SFX.ach()}
function checkLines(){for(const k in LINES)if(!S.lineDone[k]&&lineOwn(k)===LINES[k].st.length){S.lineDone[k]=1;toast(`🏁 <b>¡${LINES[k].nm} completa!</b><br><small>+20% de ingresos en toda la línea</small>`,'good',8000);SFX.rebirth()}}
function mAch(){let b='<div class="g2">';ACH.forEach(a=>{const d=S.ach[a.id];b+=`<div class="card ${d?'on':''}" style="${d?'':'opacity:.5'}"><b>${d?a.e:'🔒'} ${a.n}</b><small>${a.d}</small></div>`});
return{c:'#f59e0b',t:'Logros',s:`${nAch()} / ${ACH.length} · +${nAch()}% ingresos`,b:b+'</div>'}}
// ---------- Renacer y ajustes ----------
function mRebirth(){const r=rbReq(),ok=S.money>=r;return{c:'#7c4dff',t:'Renacer',s:`Renacimientos: ${S.rb} · Multiplicador actual x${(1+.75*S.rb).toFixed(2)}`,b:`<div class="box"><div class="lvl">🔁</div><div><b style="font-size:19px">Necesitas ${$$(r)}</b><div class="pu">Tienes ${$$(S.money)} (${Math.min(100,Math.floor(S.money/r*100))}%)</div></div></div><div class="hint">Al renacer pierdes dinero, estaciones, trenes, lugares y mejoras de dinero. Ganas ingresos x${(1+.75*(S.rb+1)).toFixed(2)} para siempre y <b>${ok?tokGain():'1 o más'} fichas 💠</b> para la tienda. Eliges una nueva estación inicial.</div>${B('🔁 Renacer','#7c4dff','doRB()',ok?0:1e99)}`}}
function doRB(){if(S.money<rbReq()||!confirm('¿Renacer? Reiniciarás tu red.'))return;const o=S,g=tokGain(),f=fresh();
Object.assign(f,{rb:o.rb+1,earned:o.earned,pass:o.pass,tok:o.tok+g,fu:o.fu,ach:o.ach,stat:o.stat,tut:o.tut,tutDone:o.tutDone});f.money=700+3000*Math.pow(o.fu.cap||0,2);S=f;SFX.rebirth();closeM();render();hud();toast(`🔁 ¡Renaciste! +${g} fichas 💠`,'good',7000)}
function mSet(){return{c:'#8b95a1',t:'Ajustes',s:'Se guarda solo en tu navegador',b:`<div class="hint">Todo funciona desde el HTML, sin servidor. Tu partida queda guardada en este navegador.</div>${B('📘 Ver tutorial de nuevo','#3b82f6','S.tut=0;S.tutDone=false;closeM()')}${B('🗑️ Borrar partida','#ff5a52','wipe()')}`}}
function wipe(){if(!confirm('¿Borrar todo el progreso?'))return;localStorage.removeItem('metroSt2');S=fresh();closeM();render();hud()}
// ---------- Tutorial ----------
const TUT=[["elige tu estación inicial: tócala en el mapa o búscala arriba a la izquierda.",()=>S.start],["compra una estación vecina (las de borde dorado).",()=>nOwn()>=2],["mejora una estación: tócala y pulsa «Mejorar».",()=>Object.values(S.own).some(l=>l>=1)],["abre 🚇 Trenes y compra un tren extra.",()=>S.stat.trains>=1],["compra un lugar de interés: los íconos grises del mapa, tocando su estación.",()=>nPl()>=1],["abre 🛍️ Tienda y compra tu primera mejora.",()=>S.stat.ups>=1],["completa una línea entera para ganar +20% en ella. ¡Y renace cuando llegues a la meta!",()=>Object.keys(S.lineDone).length>0||S.rb>0]];
function skipTut(){S.tutDone=true;SFX.click()}
let tipC='';
function tutTick(){while(!S.tutDone&&S.tut<TUT.length&&TUT[S.tut][1]()){S.tut++;SFX.up()}if(!S.tutDone&&S.tut>=TUT.length){S.tutDone=true;toast('🎓 ¡Tutorial completado!','good')}}
// ---------- HUD y bucle ----------
function hud(){const c=calc(),h=happy();$('mM').textContent=$$(S.money);$('mI').textContent='+'+$$(c.inc)+'/s';
$('sE').textContent=$$(S.earned);$('sP').textContent=Math.floor(S.pass).toLocaleString('es-CL');$('sH').textContent='🙂 '+h+'%';$('sHb').style.width=h+'%';$('sR').textContent=S.rb+' · 💠'+S.tok;
const t=S.tutDone?'':`📘 <b>Tutorial ${Math.min(S.tut+1,TUT.length)}/${TUT.length}</b> — ${TUT[Math.min(S.tut,TUT.length-1)][0]} <button class="sk" onclick="skipTut()">Saltar</button>`;
if(t!==tipC){tipC=t;$('tip').innerHTML=t;$('tip').style.display=t?'block':'none'}
$('rbp').textContent='🔁 Renacer '+Math.min(100,Math.floor(S.money/rbReq()*100))+'%';
const eb=$('evb');if(S.ev){const e=EVS[S.ev.id],left=Math.max(0,(S.ev.end-Date.now())/1000);eb.style.display='block';eb.className='panel '+(e.neg?'bad':'good');eb.innerHTML=`${e.e} <b>${e.n}</b> · ${Math.ceil(left)}s<div class="bar"><i style="width:${left*1000/S.ev.tot*100}%"></i></div>`}else eb.style.display='none';
document.querySelectorAll('[data-cost]').forEach(b=>b.disabled=S.money<+b.dataset.cost)}
let last=Date.now(),sv=0;
setInterval(()=>{const now=Date.now(),dt=Math.min(5,(now-last)/1000);last=now;
if(S.start){const c=calc();S.money+=c.inc*dt;S.earned+=c.inc*dt;S.pass+=c.pass*dt;S.cond=Math.max(0,S.cond-.02*(1-.12*ul('mant'))*dt);evTick(now);newsTick(now);checkLines();checkAch()}
tutTick();hud();if((sv+=dt)>5){sv=0;S.t=now;localStorage.setItem('metroSt2',JSON.stringify(S))}},250);
addEventListener('beforeunload',()=>{S.t=Date.now();localStorage.setItem('metroSt2',JSON.stringify(S))});
render();if(S.start){centerOn(Object.keys(S.own)[0],.8);const away=Math.min(7200,(Date.now()-(S.t||Date.now()))/1000);
if(away>60){const g=calc().inc*away*.5;S.money+=g;S.earned+=g;setTimeout(()=>toast(`😴 Mientras no estabas ganaste ${$$(g)} (50% por ${Math.round(away/60)} min).`,'good',9000),700)}}
else centerOn('Universidad de Chile',.4);
requestAnimationFrame(loop);hud();
