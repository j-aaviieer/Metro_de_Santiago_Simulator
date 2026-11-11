// ---------- Efectos de sonido (sintetizados con WebAudio, no necesitan archivos) ----------
let AC_,sfxOn=localStorage.getItem('metroSfx')!=='0';
const ac=()=>AC_||(AC_=new(window.AudioContext||window.webkitAudioContext)());
function tone(f,d,type='sine',v=.07,t0=0){if(!sfxOn)return;try{const c=ac(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime+t0;o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(c.destination);o.start(t);o.stop(t+d)}catch(e){}}
const SFX={click:()=>tone(660,.07,'triangle'),open:()=>{tone(392,.09);tone(587,.16,'sine',.08,.08)},close:()=>{tone(587,.08);tone(392,.13,'sine',.07,.07)},
buy:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.13,'square',.04,i*.07)),up:()=>[440,554,659].forEach((f,i)=>tone(f,.1,'triangle',.08,i*.06)),
err:()=>tone(150,.2,'sawtooth',.05),news:()=>{tone(880,.08,'sine',.05);tone(1175,.12,'sine',.05,.09)},ach:()=>[784,988,1319].forEach((f,i)=>tone(f,.16,'triangle',.07,i*.08)),
rebirth:()=>[262,330,392,523,659,784].forEach((f,i)=>tone(f,.2,'triangle',.08,i*.09))};
// ---------- Música original generada por código ----------
// Estas canciones se componen aquí mismo (acordes, bajo, batería y melodía), por lo que no usan material de terceros.
const CH={m:[0,3,7],M:[0,4,7],m7:[0,3,7,10],M7:[0,4,7,11],p:[0,7,12]};
const SONGS=[
{n:'Cumbia del Andén',g:'Cumbia',bpm:96,len:16,root:220,prog:[0,0,-4,-2],ct:['m','m','M','M'],kick:'x.......x.......',snr:'....x.......x...',hat:'x.xxx.xxx.xxx.xx',bass:[0,null,null,0,null,7,null,null,0,null,null,0,null,7,null,0],lead:[12,null,15,null,12,null,10,null,12,null,null,10,12,null,7,null,15,null,17,null,15,null,12,null,10,null,12,null,7,null,null,null],w:'triangle'},
{n:'Cueca Callejera',g:'Folclore',bpm:150,len:12,root:146.83,prog:[0,0,7,0],ct:['M','M','M','M'],kick:'x.....x.....',snr:'............',hat:'x.xx.xx.xx.x',bass:[0,null,7,null,0,null,7,null,0,null,7,null],lead:[12,null,16,14,null,12,9,null,11,12,null,null,14,null,16,17,null,16,14,null,12,11,null,null],w:'triangle'},
{n:'Lo-fi Santiago',g:'Hip hop',bpm:76,len:16,root:130.81,prog:[0,-4,-2,0],ct:['m7','M7','M7','m7'],kick:'x.....x..x......',snr:'....x.......x...',hat:'..x...x...x...x.',bass:[0,null,null,null,null,null,7,null,0,null,null,null,null,null,10,null],lead:[12,null,null,15,null,null,10,null,null,null,12,null,null,7,null,null],w:'sine'},
{n:'Viento Andino',g:'Folclore andino',bpm:84,len:16,root:164.81,prog:[0,-2,-4,-2],ct:['m','M','M','M'],kick:'x.......x.......',snr:'................',hat:'..x...x...x...x.',bass:[0,null,null,null,7,null,null,null,0,null,null,null,7,null,null,null],lead:[12,null,15,null,17,null,15,12,null,null,10,null,12,null,null,null,19,null,17,null,15,null,12,null,15,null,12,null,10,null,null,null],w:'sine',long:1},
{n:'Rock de Ruta',g:'Rock',bpm:118,len:16,root:164.81,prog:[0,0,-4,-2],ct:['p','p','p','p'],kick:'x.x.....x.x.....',snr:'....x.......x...',hat:'x.x.x.x.x.x.x.x.',bass:[0,null,0,null,0,null,0,null,0,null,0,null,0,null,0,null],lead:[12,null,15,17,null,15,12,null,10,null,12,null,null,null,null,null],w:'sawtooth'},
{n:'Ambiente de Estación',g:'Ambiental',bpm:60,len:16,root:146.83,prog:[0,-2,-4,-2],ct:['m7','M7','M7','M7'],kick:'................',snr:'................',hat:'................',bass:[],lead:[19,null,null,null,null,null,null,null,15,null,null,null,null,null,null,null,17,null,null,null,null,null,null,null,12,null,null,null,null,null,null,null],w:'sine',long:1}];
let mg,nb,mus=null,gSel='';
function mAudio(){if(!mg){const c=ac();mg=c.createGain();mg.gain.value=+(localStorage.getItem('metroVol')||.5);mg.connect(c.destination);nb=c.createBuffer(1,c.sampleRate,c.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}return mg}
function nt(f,t,d,type,v,att=.01){const c=ac(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(mAudio());o.start(t);o.stop(t+d+.05)}
function nz(t,d,v,hp){const c=ac(),s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=nb;f.type='highpass';f.frequency.value=hp;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f).connect(g).connect(mAudio());s.start(t);s.stop(t+d+.02)}
function kk(t){const c=ac(),o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);g.gain.setValueAtTime(.55,t);g.gain.exponentialRampToValueAtTime(.0001,t+.2);o.connect(g).connect(mAudio());o.start(t);o.stop(t+.25)}
function mStep(s,i,t,dur){const bar=Math.floor(i/s.len)%s.prog.length,p=i%s.len,r=s.root*Math.pow(2,s.prog[bar]/12),ch=CH[s.ct[bar]];
if(p===0)ch.forEach(x=>nt(r*Math.pow(2,x/12),t,dur*s.len*.95,'sine',.03,.25));
if(s.kick[p]==='x')kk(t);if(s.snr[p]==='x')nz(t,.14,.25,1200);if(s.hat[p]==='x')nz(t,.05,.1,6000);
const b=s.bass[p];if(b!=null)nt(r/2*Math.pow(2,b/12),t,dur*1.8,'triangle',.22);
const l=s.lead[i%s.lead.length];if(l!=null)nt(s.root*Math.pow(2,l/12),t,dur*(s.long?3.5:1.6),s.w,s.w==='sawtooth'?.05:.12)}
function mSched(){const c=ac(),s=SONGS[mus.i],dur=60/s.bpm/4;while(mus.next<c.currentTime+.3){mStep(s,mus.step,mus.next,dur);mus.next+=dur;mus.step++;if(mus.step>=s.len*s.prog.length*4){const n=(mus.i+1)%SONGS.length;mPlay(n);if(typeof refresh==='function')refresh();return}}}
function mStop(){if(mus){clearInterval(mus.t);mus=null}au.pause()}
function mPlay(i){mStop();const c=ac();if(c.resume)c.resume();mAudio();mus={i,step:0,next:c.currentTime+.1,t:setInterval(mSched,50)};if(typeof S!=='undefined')S.stat.music=1}
// ---------- Pistas propias (opcional): public/music/playlist.js ----------
const LOCAL=[];(typeof TRACKS!=='undefined'?TRACKS:[]).forEach(t=>LOCAL.push(t));
const au=new Audio();au.volume=.5;let li=-1;
function mPlayL(i){if(!LOCAL[i])return;mStop();li=i;au.src='music/'+LOCAL[i].file;au.play().catch(()=>{});if(typeof S!=='undefined')S.stat.music=1;refresh()}
function mNext(d){const n=mus?mus.i:-1;mPlay((n+d+SONGS.length)%SONGS.length);refresh()}
function mVol(v){localStorage.setItem('metroVol',v);au.volume=v;if(mg)mg.gain.value=+v}
function mMusic(){const np=mus?`${SONGS[mus.i].n} · ${SONGS[mus.i].g}`:li>=0&&!au.paused?LOCAL[li].title:'Nada sonando';
let b=`<div class="box" style="background:#fff0f5;border-color:#f8c5d6"><div><b style="font-size:18px">🎧 ${np}</b><div class="pu" style="color:#b3325f">Música original, creada por código: libre de derechos.</div></div></div>
<div class="g2">${B('⏮ Anterior','#e8467c','mNext(-1)')}${B('⏭ Siguiente','#e8467c','mNext(1)')}</div>${B('⏹ Detener música','#8b95a1','mStop();refresh()')}
<label><b>Volumen</b> <input type="range" min="0" max="1" step=".05" value="${mg?mg.gain.value:+(localStorage.getItem('metroVol')||.5)}" oninput="mVol(this.value)" style="width:60%"></label>
<label><b>Efectos de sonido</b> <input type="checkbox" ${sfxOn?'checked':''} onchange="sfxOn=this.checked;localStorage.setItem('metroSfx',sfxOn?1:0);SFX.click()"></label>
<b style="font-size:18px">🎶 Canciones</b><div class="g2">`;
SONGS.forEach((s,i)=>b+=`<div class="card ${mus&&mus.i===i?'on':''}"><b>${s.n}</b><small>${s.g} · ${s.bpm} BPM · inspirada en música chilena</small>${B('▶ Tocar','#e8467c',`mPlay(${i});refresh()`)}</div>`);b+='</div>';
if(LOCAL.length){b+=`<b style="font-size:18px">📁 Tus pistas</b><div class="g2">`;LOCAL.forEach((t,i)=>b+=`<div class="card ${i===li?'on':''}"><b>${t.title}</b><small>${t.artist||''} ${t.genre?'· '+t.genre:''}</small>${B('▶ Tocar','#e8467c',`mPlayL(${i})`)}</div>`);b+='</div>'}
b+=`<div class="hint">¿Quieres más? Agrega mp3 libres de derechos (por ejemplo con licencia CC0 o dominio público; revisa siempre la licencia de cada sitio) en <b>public/music/</b> y descríbelos en <b>playlist.js</b>.</div>`;
return{c:'#e8467c',t:'Música',s:'Sin derechos de autor',b}}
