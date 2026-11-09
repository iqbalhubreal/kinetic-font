const $=s=>document.querySelector(s);
const cv=$('#cv'),ctx=cv.getContext('2d');
const FONTS=[
 {n:'Bricolage Grotesque',w:800,fb:'system-ui,sans-serif'},
 {n:'Fraunces',w:900,fb:'Georgia,serif'},
 {n:'Archivo Black',w:400,fb:'Impact,sans-serif'},
 {n:'Pacifico',w:400,fb:'cursive'},
 {n:'Space Grotesk',w:700,fb:'system-ui,sans-serif'},
 {n:'Bebas Neue',w:400,fb:'Impact,sans-serif'},
 {n:'Playfair Display',w:800,fb:'Georgia,serif'},
 {n:'DM Serif Display',w:400,fb:'Georgia,serif'}
];
const COLS=[['#f7f4ee','Chalk'],['#17132e','Ink'],['#ffc247','Marigold'],['#7cc4ff','Sky'],['mix','Mixed']];
const MIX=['#ffc247','#7cc4ff','#ff7a90','#8df0b4'];
const BGS=[['#17132e','Ink'],['#0b4f5c','Lagoon'],['#5a1146','Berry'],['#e9edf7','Daylight'],['clear','Transparent']];
const MODES=[['bounce','Bounce'],['rotate','Rotate'],['fall','Fall'],['dissolve','Dissolve'],['wave','Wave'],['typewriter','Typewriter'],['glitch','Glitch'],['path','Path']];
const S={text:'Make it move',mode:'bounce',unit:'letter',path:'circle',font:0,speed:1,size:50,color:0,bg:0,playing:true};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let t=0,last=performance.now(),DPR=1,units=[],fs=60,textLen=1,pk=1,P=null;


const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const rnd=(i,k)=>{const x=Math.sin(i*12.9898+k*78.233)*43758.5453;return x-Math.floor(x)};
const ease=k=>k*k*(3-2*k);
const bo=x=>{const n=7.5625,d=2.75;if(x<1/d)return n*x*x;if(x<2/d)return n*(x-=1.5/d)*x+.75;if(x<2.5/d)return n*(x-=2.25/d)*x+.9375;return n*(x-=2.625/d)*x+.984375};
const F=()=>FONTS[S.font];
const hx=h=>[1,3,5].map(k=>parseInt(h.substr(k,2),16));
function fillOf(i){const c=COLS[S.color][0];if(c==='mix')return MIX[i%MIX.length];
 return c}
let ac,master,dest,lastSnd=0,lt=0;
function aud(){if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=+$('#vol').value;master.connect(ac.destination);dest=ac.createMediaStreamDestination();master.connect(dest)}if(ac.state==='suspended')ac.resume();return ac}
function tone(f,d,type,v,f2){const o=ac.createOscillator(),g=ac.createGain(),n=ac.currentTime;o.type=type;o.frequency.setValueAtTime(f,n);if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(master);o.start(n);o.stop(n+d+.02)}
function noise(d,v,hp){const n=ac.currentTime,b=ac.createBuffer(1,Math.ceil(ac.sampleRate*d),ac.sampleRate),a=b.getChannelData(0);for(let k=0;k<a.length;k++)a[k]=Math.random()*2-1;const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;fl.type='highpass';fl.frequency.value=hp;g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.001,n+d);s.connect(fl);fl.connect(g);g.connect(master);s.start(n)}
const NOTE=[0,2,4,7,9];
function fire(m,i){
 if(!ac||!$('#snd').checked||ac.currentTime-lastSnd<.03)return;lastSnd=ac.currentTime;
 const f=262*Math.pow(2,(NOTE[i%5]+12*(Math.floor(i/5)%2))/12);
 if(m==='bounce')tone(f*1.5,.14,'sine',.5,f*.6);
 else if(m==='rotate')tone(f,.2,'triangle',.3,f*2);
 else if(m==='fall'){tone(140,.18,'sine',.7,45);noise(.05,.2,1500)}
 else if(m==='dissolve')tone(f*2,.45,'sine',.18);
 else if(m==='wave')tone(f,.3,'triangle',.2);
 else if(m==='typewriter'){noise(.03,.35,2500);tone(900+Math.random()*250,.025,'square',.06)}
 else if(m==='glitch'){noise(.07,.45,900);tone(120+Math.random()*1100,.06,'sawtooth',.14)}
 else tone(f,.28,'sine',.22);
}
const setFont=px=>{ctx.font=`${F().w} ${px}px "${F().n}",${F().fb}`};

function layout(){
  const W=cv.width,H=cv.height,words=S.text.trim().split(/\s+/).filter(Boolean);
  units=[];if(!words.length||!W||!H)return;
  let px=H*.26*S.size/50,rows,sp;
  for(let k=0;k<40;k++){
    setFont(px);sp=ctx.measureText(' ').width;rows=[];let cur=null;
    for(const w of words){
      const ww=ctx.measureText(w).width;
      if(cur&&cur.w+sp+ww<=W*.86){cur.words.push(w);cur.w+=sp+ww}
      else{cur={words:[w],w:ww};rows.push(cur)}
    }
    if(rows.length*px*1.15<=H*.82&&Math.max(...rows.map(r=>r.w))<=W*.9)break;
    px*=.92;
  }
  fs=px;setFont(px);
  const metrics=ctx.measureText('Hg');
  const ascent=metrics.actualBoundingBoxAscent||px*.72;
  const descent=metrics.actualBoundingBoxDescent||px*.18;
  const baselineOffset=(ascent-descent)/2;
  const lineHeight=px*1.15;
  const centerY=H/2;
  let first=true;
  rows.forEach((r,ri)=>{
    let x=W/2-r.w/2;
    const y=centerY+(ri-(rows.length-1)/2)*lineHeight+baselineOffset;
    r.words.forEach(w=>{
      if(S.unit==='word'){
        const wordWidth=ctx.measureText(w).width;
        units.push({s:w,x:x+wordWidth/2,y,w:wordWidth,gap:first?0:sp});
        x+=wordWidth+sp;first=false;
      }else{
        let firstChar=true;
        for(const ch of w){
          const charWidth=ctx.measureText(ch).width;
          units.push({s:ch,x:x+charWidth/2,y,w:charWidth,gap:firstChar&&!first?sp:0});
          x+=charWidth;firstChar=false;first=false;
        }
        x+=sp;
      }
    });
  });
  let acc=0;
  units.forEach(u=>{acc+=u.gap;u.arc=acc+u.w/2;acc+=u.w});
  textLen=acc;fitPath();
}
function fitPath(){
  const W=cv.width,H=cv.height,cx=W/2,cy=H/2,R=Math.min(W*.5,H)*.36,N=500,pts=[];
  for(let k=0;k<=N;k++){const u=k/N,a=u*Math.PI*2;let x,y;
    if(S.path==='circle'){x=cx+Math.cos(a-1.5708)*Math.min(W*.4,R*1.7);y=cy+Math.sin(a-1.5708)*R}
    else if(S.path==='infinity'){const d=1+Math.sin(a)**2;x=cx+Math.cos(a)/d*Math.min(W*.44,R*2.6);y=cy+Math.sin(a)*Math.cos(a)/d*R*2.4}
    else if(S.path==='wave'){x=W*.03+u*W*.94;y=cy+Math.sin(u*Math.PI*4)*R*.55}
    else{const r=R*(.1+.95*u),b=u*Math.PI*5.2-1.5708;x=cx+Math.cos(b)*r*1.5;y=cy+Math.sin(b)*r}
    pts.push([x,y]);
  }
  const cum=[0];for(let k=1;k<=N;k++)cum.push(cum[k-1]+Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]));
  P={pts,cum,len:cum[N],closed:S.path==='circle'||S.path==='infinity'};
  pk=Math.min(1,P.len*.92/textLen);
}
function pt(s){
  const {pts,cum,len}=P;s=((s%len)+len)%len;let lo=0,hi=cum.length-1;
  while(hi-lo>1){const m=(lo+hi)>>1;cum[m]<=s?lo=m:hi=m}
  const f=(s-cum[lo])/((cum[hi]-cum[lo])||1);
  return[pts[lo][0]+(pts[hi][0]-pts[lo][0])*f,pts[lo][1]+(pts[hi][1]-pts[lo][1])*f];
}

function draw(t){
  const W=cv.width,H=cv.height;
  const clr=BGS[S.bg][0]==='clear';$('#stage').classList.toggle('clear',clr);if(clr)ctx.clearRect(0,0,W,H);else{ctx.fillStyle=BGS[S.bg][0];ctx.fillRect(0,0,W,H)}
  const n=units.length;if(!n)return;if(t<lt)units.forEach(u=>u.ev=void 0);lt=t;
  const col=COLS[S.color][0],STG=.07,T=n*STG+3.4,tt=t%T,outStart=T-1.8,outStg=Math.min(.04,.9/n);
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  if(S.mode==='path'&&P){
    ctx.save();ctx.globalAlpha=.16;ctx.strokeStyle=fillOf(0);ctx.lineWidth=2*DPR;ctx.setLineDash([6*DPR,10*DPR]);
    ctx.beginPath();P.pts.forEach((p,k)=>k?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.restore();
  }
  units.forEach((u,i)=>{
    let x=u.x,y=u.y,rot=0,sx=1,sy=1,al=1,blur=0,ev=0,cy=0,gl=0;
    switch(S.mode){
      case 'bounce':{const ph=t*2.6-i*.35,b=Math.abs(Math.sin(ph)),q=Math.pow(1-b,8);
        ev=Math.floor(ph/Math.PI);y-=b*fs*.55;sy=1-.25*q;sx=1+.25*q;rot=Math.sin(ph)*.12;break}
      case 'rotate':{const c=((t*.55-i*.08)%1+1)%1,k=clamp(c*1.5),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
        ev=Math.floor(t*.55-i*.08);rot=e*Math.PI*2;sx=sy=1+.15*Math.sin(e*Math.PI);break}
      case 'fall':{const inT=tt-i*STG,outT=tt-outStart-i*outStg;cy=Math.floor(t/T);ev=(inT>.5?1:0)+(outT>0?1:0);
        if(outT>0){y+=H*2.2*outT*outT;rot=(rnd(i,1)-.5)*outT*3;x+=(rnd(i,2)-.5)*outT*fs*.8;al=1-clamp(outT*1.2)}
        else if(inT<0)al=0;else{y-=(1-bo(clamp(inT/.9)))*H*.75;al=clamp(inT*6)}break}
      case 'dissolve':{const inT=tt-i*STG*.6,outT=tt-outStart-i*outStg;cy=Math.floor(t/T);ev=inT>.3?1:0;
        if(outT>0){const k=clamp(outT/.9);al=1-k;blur=k*fs*.25;y-=k*fs*.5;x+=(rnd(i,3)-.5)*k*fs*1.2;sx=sy=1+k*.4}
        else{const k=ease(clamp(inT)); al=k;blur=(1-k)*fs*.25;sx=sy=1.5-.5*k;y+=(1-k)*fs*.4;x+=(rnd(i,4)-.5)*(1-k)*fs}break}
      case 'wave':{const ph=t*3-i*.55;ev=Math.floor(ph/6.283);y+=Math.sin(ph)*fs*.28;rot=Math.cos(ph)*.18;break}
      case 'typewriter':{cy=Math.floor(t/T);ev=tt>=i*STG?1:0;al=ev&&tt<outStart?1:0;break}
      case 'glitch':{const g=Math.floor(t*12),on=rnd(7,g)>.7;ev=on?g:(u.ev||0);if(on||rnd(i,g)>.93){x+=(rnd(i,g+1)-.5)*fs*.5;y+=(rnd(i,g+2)-.5)*fs*.12;gl=fs*.06*(on?2:1)}break}
      case 'path':{const L=P.len;const s=u.arc*pk+t*fs*.9;
        ev=Math.floor(s/L);const p=pt(s),a=pt(s-3*DPR),b=pt(s+3*DPR);x=p[0];y=p[1];rot=Math.atan2(b[1]-a[1],b[0]-a[0]);sx=sy=pk;
        if(!P.closed){const f=(((s%L)+L)%L)/L;al=clamp(Math.min(f,1-f)/.06)}break}
    }
    if(u.ev===void 0||u.cy!==cy){u.ev=ev;u.cy=cy}else if(ev>u.ev){u.ev=ev;fire(S.mode,i)}
    if(al<=.003)return;
    ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(sx,sy);ctx.globalAlpha=al;
    if(blur>.5&&'filter' in ctx)ctx.filter=`blur(${blur}px)`;
    ctx.fillStyle=fillOf(i);setFont(fs);
    if(gl){ctx.fillStyle='#ff2d55';ctx.globalAlpha=al*.7;ctx.fillText(u.s,-gl,0);ctx.fillStyle='#00e5ff';ctx.fillText(u.s,gl,0);ctx.globalAlpha=al;ctx.fillStyle=fillOf(i)}
    ctx.fillText(u.s,0,0);ctx.restore();
  });
}

function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(S.playing)t+=dt*S.speed;
  draw(t);requestAnimationFrame(frame);
}

function resize(){
  const r=$('#stage').getBoundingClientRect();DPR=Math.min(devicePixelRatio||1,2);
  cv.width=Math.max(2,Math.round(r.width*DPR));cv.height=Math.max(2,Math.round(r.height*DPR));layout();
}
async function loadFont(){
  try{await document.fonts.load(`${F().w} 40px "${F().n}"`)}catch(e){}
  layout();
}

/* UI */
MODES.forEach(([id,label])=>{const b=document.createElement('button');b.className='chip';b.textContent=label;b.dataset.m=id;b.setAttribute('aria-pressed',id===S.mode);
  b.onclick=()=>{S.mode=id;t=0;document.querySelectorAll('#modes .chip').forEach(c=>c.setAttribute('aria-pressed',c===b));$('#pathWrap').hidden=id!=='path'};$('#modes').appendChild(b)});
const fontSelect=$('#font');
FONTS.forEach((f,i)=>{
  const option=document.createElement('option');
  option.value=String(i);
  option.textContent=f.n;
  fontSelect.appendChild(option);
});
fontSelect.value=String(S.font);
fontSelect.onchange=()=>{S.font=Number(fontSelect.value);loadFont()};
function swatches(host,list,key,css){list.forEach(([v,name],i)=>{const b=document.createElement('button');b.setAttribute('aria-label',name);b.title=name;
  b.style.background=css(v);b.setAttribute('aria-pressed',i===S[key]);
  b.onclick=()=>{S[key]=i;host.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b))};host.appendChild(b)})}
swatches($('#colors'),COLS,'color',v=>v==='mix'?'conic-gradient('+MIX.join(',')+','+MIX[0]+')':v);
swatches($('#bgs'),BGS,'bg',v=>v==='clear'?'repeating-conic-gradient(#999 0 25%,#ddd 0 50%) 0 0/10px 10px':v);
$('#txt').oninput=e=>{S.text=e.target.value;layout();t=0};
$('#unit').onchange=e=>{S.unit=e.target.value;layout()};
$('#path').onchange=e=>{S.path=e.target.value;fitPath()};
$('#speed').oninput=e=>S.speed=+e.target.value;
$('#size').oninput=e=>{S.size=+e.target.value;layout()};
$('#play').onclick=()=>{S.playing=!S.playing;$('#play').textContent=S.playing?'Pause':'Play'};
$('#restart').onclick=()=>{t=0};
addEventListener('keydown',e=>{if(e.code==='KeyK'&&e.target.tagName!=='INPUT'&&e.target.tagName!=='BUTTON'){e.preventDefault();$('#play').click()}});


/* Recording */
let mr,chunks=[],tick,t0;
$('#rec').onclick=()=>{
  const btn=$('#rec');
  if(mr&&mr.state==='recording'){mr.stop();return}
  if(!window.MediaRecorder||!cv.captureStream){alert('This browser can’t record video from the canvas.');return}
  const mt=['video/webm;codecs=vp9','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));
  const st=cv.captureStream(30);if($('#snd').checked){aud();st.addTrack(dest.stream.getAudioTracks()[0])}
  mr=new MediaRecorder(st,mt?{mimeType:mt,videoBitsPerSecond:6e6}:{});chunks=[];
  mr.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  mr.onstop=()=>{clearInterval(tick);btn.textContent='Record';btn.classList.remove('on');
    const type=(mr.mimeType||'video/webm').split(';')[0],url=URL.createObjectURL(new Blob(chunks,{type}));
    $('#vid').src=url;$('#dl').href=url;$('#dl').download='text-animation.'+(type.includes('mp4')?'mp4':'webm');$('#modal').hidden=false};
  t=0;S.playing=true;$('#play').textContent='Pause';mr.start();t0=Date.now();btn.classList.add('on');
  const upd=()=>{const s=Math.floor((Date.now()-t0)/1000);btn.textContent='Stop '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};upd();tick=setInterval(upd,500);
};
$('#close').onclick=()=>{$('#modal').hidden=true;$('#vid').pause()};


$('#vol').oninput=e=>{if(master)master.gain.value=+e.target.value};
['pointerdown','keydown'].forEach(n=>addEventListener(n,()=>{if($('#snd').checked)aud()}));
const dock=$('#dock');dock.querySelector('.tabs').remove();
const GR={};[['text','Text','What it says and how big it is.'],['motion','Motion','How the letters move.'],['style','Look','Colors and backdrop.']].forEach(([k,l,d])=>{const g=document.createElement('section');g.className='grp';g.innerHTML=`<h3>${l}</h3><p class="hint">${d}</p>`;dock.appendChild(g);GR[k]=g});
[...dock.querySelectorAll('[data-p]')].forEach(e=>GR[e.dataset.p].appendChild(e));

document.querySelectorAll('.quick button').forEach(b=>b.onclick=()=>{S.text=b.textContent;$('#txt').value=S.text;layout();t=0});
document.querySelectorAll('.cards .card').forEach(c=>{const d=JSON.parse(c.dataset.d),k=COLS[d.color][0],b=c.querySelector('b');
 c.style.background=BGS[d.bg][0];b.style.fontFamily=`"${FONTS[d.font].n}",${FONTS[d.font].fb}`;b.style.color=k==='mix'?MIX[0]:k;
 c.onclick=()=>{Object.assign(S,{text:d.text,mode:d.mode,font:d.font,color:d.color,bg:d.bg,unit:'letter',path:d.path||'circle'});
  $('#txt').value=d.text;$('#font').value=String(d.font);$('#unit').value='letter';$('#path').value=S.path;$('#pathWrap').hidden=d.mode!=='path';
  document.querySelectorAll('#modes .chip').forEach(x=>x.setAttribute('aria-pressed',x.dataset.m===d.mode));
  document.querySelectorAll('#colors button').forEach((x,i)=>x.setAttribute('aria-pressed',i===d.color));
  document.querySelectorAll('#bgs button').forEach((x,i)=>x.setAttribute('aria-pressed',i===d.bg));
  t=0;loadFont();$('#studio').scrollIntoView({behavior:'smooth'})}});



const h1=$('#heroTitle');h1.setAttribute('aria-label',h1.textContent);
h1.innerHTML=h1.textContent.split(' ').map((w,j)=>'<span class="w" aria-hidden="true">'+[...w].map((ch,i)=>`<span style="--i:${j*4+i}">${ch}</span>`).join('')+'</span>').join(' ');
new ResizeObserver(resize).observe($('#stage'));
resize();loadFont();requestAnimationFrame(frame);
