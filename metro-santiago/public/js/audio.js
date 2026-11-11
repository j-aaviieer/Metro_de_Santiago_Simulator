// ---------- Efectos de sonido (sintetizados con WebAudio, no necesitan archivos) ----------
let AC_,sfxOn=localStorage.getItem('metroSfx')!=='0';
const ac=()=>AC_||(AC_=new(window.AudioContext||window.webkitAudioContext)());
function tone(f,d,type='sine',v=.07,t0=0){if(!sfxOn)return;try{const c=ac(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime+t0;o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(c.destination);o.start(t);o.stop(t+d)}catch(e){}}
const SFX={click:()=>tone(660,.07,'triangle'),open:()=>{tone(392,.09);tone(587,.16,'sine',.08,.08)},close:()=>{tone(587,.08);tone(392,.13,'sine',.07,.07)},
buy:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.13,'square',.04,i*.07)),up:()=>[440,554,659].forEach((f,i)=>tone(f,.1,'triangle',.08,i*.06)),
err:()=>tone(150,.2,'sawtooth',.05),news:()=>{tone(880,.08,'sine',.05);tone(1175,.12,'sine',.05,.09)},ach:()=>[784,988,1319].forEach((f,i)=>tone(f,.16,'triangle',.07,i*.08)),rebirth:()=>[262,330,392,523,659,784].forEach((f,i)=>tone(f,.2,'triangle',.08,i*.09))};
// ---------- Música: catálogo de artistas chilenos por género ----------
const GENRES={
"Nueva canción y folclore":["Víctor Jara","Violeta Parra","Inti-Illimani","Quilapayún","Illapu","Patricio Manns","Los Jaivas","Ángel Parra","Isabel Parra","Rolando Alarcón","Margot Loyola","Los Huasos Quincheros","Tita Parra","Congreso"],
"Rock y pop rock":["Los Prisioneros","Los Tres","Los Bunkers","Lucybell","La Ley","Chancho en Piedra","Electrodomésticos","Saiko","Los Jaivas","Santiago del Nuevo Extremo","Entremuros"],
"Indie y alternativo":["Macha y el Bloque Depresivo","Gepe","Javiera Mena","Planeta No","Fother Muckers","Dënver","Niños del Cerro","Camila Moreno","Pedropiedra","Teleférico"],
"Hip hop":["Chystemc","Tiro de Gracia","Los Tetas","Makiza","Ana Tijoux","Portavoz","Subverso","Jaas","Movimiento Original","Zaturno","Salvaje Decibel","Cenzi"],
"Punk, ska y metal":["Los Miserables","Fiskales Ad-Hok","Criminal","Dracma","Pichi Cachay"],
"Cumbia y tropical":["Chico Trujillo","Villa Cariño","La Sonora de Tommy Rey","Américo","Los Vikings 5","Santaferia","Los Charros de Lumaco","La Sonora Palacios","Noche de Brujas","Los Chuncho"],
"Pop":["Mon Laferte","Francisca Valenzuela","Denise Rosenthal","Cami","Kuervos del Sur","Nicole","Alex Anwandter","Fran Maira","Dulce y Agraz","Sebastián Ayala"],
"Urbano y trap":["Pailita","Jere Klein","Young Cister","Standly","Marcianeke","Polimá Westcoast","Cris MJ","Pablo Chill-E","Bairon Barrera","Dai Dai"],
"Baladas y clásicos":["Los Ángeles Negros","Buddy Richard","Cecilia","Gloria Simonetti","Luis Dimas","Fresia Soto","Los Hermanos Campos","Sussy Fuentes","Lucho Gatica","Los Pasteles Verdes"]};
const LOCAL=[];let li=-1,gSel=Object.keys(GENRES)[0],ytL=JSON.parse(localStorage.getItem('metroYT')||'[]');
const au=new Audio();au.volume=.5;au.onended=()=>mNext(1);
(typeof TRACKS!=='undefined'?TRACKS:[]).forEach(t=>LOCAL.push(t));
function mPlayL(i){if(!LOCAL[i])return;ytStop();S.stat.music=1;li=i;au.src='music/'+LOCAL[i].file;au.play().catch(()=>{});refresh()}
function mNext(d){if(!LOCAL.length)return;mPlayL((li+d+LOCAL.length)%LOCAL.length)}
function mToggle(){if(au.src&&!au.paused)au.pause();else if(au.src)au.play();else mNext(1);refresh()}
function ytId(u){const l=u.match(/[?&]list=([\w-]+)/),v=u.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);return l&&!v?{t:'l',id:l[1]}:v?{t:'v',id:v[1]}:null}
function ytPlay(i){const y=ytL[i];if(!y)return;au.pause();S.stat.music=1;$('mp').style.display='block';$('mpf').src=y.t==='l'?`https://www.youtube-nocookie.com/embed/videoseries?list=${y.id}&autoplay=1`:`https://www.youtube-nocookie.com/embed/${y.id}?autoplay=1&loop=1&playlist=${y.id}`}
function ytStop(){$('mpf').src='';$('mp').style.display='none'}
function ytAdd(){const v=ytId($('yt').value.trim());if(!v){alert('Pega un link válido de YouTube.');return}ytL.push({...v,g:gSel,n:$('ytn').value.trim()||'Mi pista '+(ytL.length+1)});localStorage.setItem('metroYT',JSON.stringify(ytL));ytPlay(ytL.length-1);refresh()}
function ytDel(i){ytL.splice(i,1);localStorage.setItem('metroYT',JSON.stringify(ytL));refresh()}
function setG(g){gSel=g;SFX.click();refresh()}
function mMusic(){const q=a=>'https://www.youtube.com/results?search_query='+encodeURIComponent(a+' música chilena');
const np=li>=0&&LOCAL[li]?`${LOCAL[li].title} — ${LOCAL[li].artist}`:'Nada sonando';
let b=`<div class="box" style="background:#fff0f5;border-color:#f8c5d6"><div><b style="font-size:18px">🎧 ${np}</b><div class="pu" style="color:#b3325f">${LOCAL.length?LOCAL.length+' pistas locales':'Sin pistas locales (mira public/music/playlist.js)'}</div></div></div>
<div class="g2">${B('⏮ / ⏭','#e8467c','mNext(-1)')}${B(au.paused?'▶ Reproducir':'⏸ Pausa','#22c36b','mToggle()')}</div>
<label><b>Volumen</b> <input type="range" min="0" max="1" step=".05" value="${au.volume}" oninput="au.volume=this.value" style="width:60%"></label>
<label><b>Efectos de sonido</b> <input type="checkbox" ${sfxOn?'checked':''} onchange="sfxOn=this.checked;localStorage.setItem('metroSfx',sfxOn?1:0);SFX.click()"></label>`;
if(LOCAL.length){b+=`<b style="font-size:18px">📁 Tus pistas locales</b>`;LOCAL.forEach((t,i)=>b+=`<div class="card ${i==li?'on':''}"><b>${t.title}</b><small>${t.artist} · ${t.genre||''}</small>${B('▶ Tocar','#e8467c',`mPlayL(${i})`)}</div>`)}
b+=`<b style="font-size:18px">🎶 Artistas chilenos por género</b><div class="tabs">${Object.keys(GENRES).map(g=>`<button class="${g==gSel?'on':''}" onclick="setG(this.dataset.g)" data-g="${g}">${g}</button>`).join('')}</div>
<div class="art">${GENRES[gSel].map(a=>`<a href="${q(a)}" target="_blank" rel="noopener">▶ ${a}</a>`).join('')}</div>
<div class="hint">Pega un link de YouTube (video o lista) del género «${gSel}» y suena aquí dentro mientras juegas.</div>
<input class="in2" id="yt" placeholder="https://www.youtube.com/watch?v=..."><input class="in2" id="ytn" placeholder="Nombre de la pista (opcional)">${B('➕ Agregar y reproducir','#22c36b','ytAdd()')}`;
const mine=ytL.map((y,i)=>({y,i})).filter(o=>o.y.g==gSel);
mine.forEach(o=>b+=`<div class="card"><b>${o.y.n}</b><small>${o.y.g}</small><div class="g2">${B('▶ Tocar','#e8467c',`ytPlay(${o.i})`)}${B('🗑️ Quitar','#8b95a1',`ytDel(${o.i})`)}</div></div>`);
return{c:'#e8467c',t:'Música chilena',s:'Folclore, rock, hip hop, cumbia, urbano y más',b}}
