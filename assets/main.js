(function(){
  var header=document.getElementById('header'), burger=header.querySelector('.burger'), menu=document.getElementById('menu');
  var open=false;
  function onScroll(){header.classList.toggle('scrolled', window.scrollY>60 && !open);}
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  function setMenu(v){
    open=v; menu.classList.toggle('open',v); menu.setAttribute('aria-hidden',!v);
    burger.setAttribute('aria-expanded',v); burger.setAttribute('aria-label',v?'Zavřít menu':'Otevřít menu');
    document.body.style.overflow=v?'hidden':''; onScroll();
  }
  burger.addEventListener('click',function(){setMenu(!open);});
  menu.addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&open){setMenu(false);burger.focus();}});
  window.addEventListener('resize',function(){if(window.innerWidth>1180&&open)setMenu(false);});

  // Jemné odhalení fotek
  var els=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:.1,rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el){io.observe(el);});
  } else { els.forEach(function(el){el.classList.add('in');}); }

  var y=document.getElementById('y'); if(y) y.textContent=new Date().getFullYear();
  // Počet let od daného roku (např. <span data-since="1974">), každý rok se přepočítá sám
  document.querySelectorAll('[data-since]').forEach(function(el){ el.textContent=new Date().getFullYear()-parseInt(el.getAttribute('data-since'),10); });
})();

// Kolotoč destinací: nekonečné točení, plynulé tažení myší, zvýraznění karty uprostřed
document.querySelectorAll('[data-carousel]').forEach(function(c){
  var track=c.querySelector('.car-track'), cards=[].slice.call(track.querySelectorAll('.dcard'));
  var n=parseInt(c.dataset.count,10)||cards.length;
  var btns=c.querySelectorAll('.car-btn'), count=c.querySelector('.car-count b'), bar=c.querySelector('.car-progress span');
  if(!cards.length) return;
  var coarse=window.matchMedia('(pointer: coarse)').matches, reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var centers=[], half=0, st=1, active=-1, raf=0, anim=0, idle=0;
  function measure(){ centers=cards.map(function(el){return el.offsetLeft+el.offsetWidth/2;}); half=track.clientWidth/2; st=centers[1]-centers[0]||1; }
  function nearest(pos){ var i=Math.round((pos-centers[0])/st); return Math.max(0,Math.min(cards.length-1,i)); }
  function render(){
    raf=0;
    var mid=track.scrollLeft+half, lo=nearest(mid)-3, hi=lo+6;
    for(var i=Math.max(0,lo);i<=Math.min(cards.length-1,hi);i++){
      var k=Math.min(Math.abs(centers[i]-mid)/st,1), el=cards[i], sm=window.innerWidth<700;
      el.style.setProperty('--s',(1-(sm?.07:.14)*k).toFixed(3)); el.style.setProperty('--o',(1-(sm?.3:.45)*k).toFixed(3)); el.style.setProperty('--t',Math.max(0,1-1.5*k).toFixed(3));
    }
    var best=nearest(mid);
    if(best!==active){
      if(active>-1) cards[active].classList.remove('is-active');
      active=best; cards[active].classList.add('is-active');
      var real=((active%n)+n)%n;
      if(count) count.textContent=String(real+1).padStart(2,'0');
      if(bar){bar.style.width=(100/n)+'%'; bar.style.transform='translateX('+(real*100)+'%)';}
    }
  }
  function queue(){ if(!raf) raf=requestAnimationFrame(render); }
  function initAll(){ var sm=window.innerWidth<700; cards.forEach(function(el){el.style.setProperty('--s',sm?'.93':'.86');el.style.setProperty('--o',sm?'.7':'.55');el.style.setProperty('--t','0');}); }
  // Nepozorovaný skok do prostřední sady karet
  function recenter(){
    var i=nearest(track.scrollLeft+half);
    if(i<n||i>=2*n){ var shift=(i<n?n:-n)*st; if(coarse) track.classList.add('nosnap'); track.scrollLeft+=shift; render(); if(coarse) requestAnimationFrame(function(){track.classList.remove('nosnap');}); }
  }
  function animateTo(i){
    cancelAnimationFrame(anim);
    var from=track.scrollLeft, to=centers[i]-half, d=to-from;
    if(Math.abs(d)<1){ recenter(); return; }
    if(reduce){ track.scrollLeft=to; recenter(); return; }
    var dur=Math.min(700,Math.max(320,Math.abs(d)*.6)), t0=performance.now();
    if(coarse) track.classList.add('nosnap');
    (function tick(now){
      var t=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-t,3);
      track.scrollLeft=from+d*e;
      if(t<1){ anim=requestAnimationFrame(tick); } else { anim=0; if(coarse) track.classList.remove('nosnap'); recenter(); }
    })(t0);
  }
  track.addEventListener('scroll',function(){
    queue();
    if(anim||down) return;
    clearTimeout(idle);
    idle=setTimeout(function(){ if(coarse){ recenter(); } else { animateTo(nearest(track.scrollLeft+half)); } }, coarse?160:120);
  },{passive:true});
  btns.forEach(function(b){b.addEventListener('click',function(){animateTo(Math.max(0,Math.min(cards.length-1,active+parseInt(b.dataset.dir,10))));});});
  track.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'){e.preventDefault();animateTo(active+1);} if(e.key==='ArrowLeft'){e.preventDefault();animateTo(active-1);} });
  window.addEventListener('resize',function(){ var a=active; measure(); track.scrollLeft=centers[a]-half; render(); });
  // Klik myší na boční kartu ji jen přisune doprostřed, Enter z klávesnice (detail 0) vždy otevře odkaz
  cards.forEach(function(card,i){ card.addEventListener('click',function(e){ if(i!==active&&e.detail>0){e.preventDefault();animateTo(i);} }); });

  // Tažení myší s setrvačností
  var down=false, moved=false, startX=0, startL=0, lastX=0, lastT=0, vel=0, targetL=0, dragRaf=0;
  track.addEventListener('pointerdown',function(e){
    if(e.pointerType!=='mouse'||e.button!==0) return;
    cancelAnimationFrame(anim); anim=0; clearTimeout(idle);
    down=true; moved=false; startX=lastX=e.clientX; startL=targetL=track.scrollLeft; lastT=performance.now(); vel=0;
  });
  window.addEventListener('pointermove',function(e){
    if(!down) return;
    var dx=e.clientX-startX;
    if(!moved&&Math.abs(dx)>4){moved=true; track.classList.add('dragging');}
    if(!moved) return;
    var now=performance.now(), dt=Math.max(1,now-lastT);
    vel=vel*.6+((e.clientX-lastX)/dt)*.4; lastX=e.clientX; lastT=now;
    targetL=startL-dx;
    if(!dragRaf) dragRaf=requestAnimationFrame(function(){ dragRaf=0; track.scrollLeft=targetL; });
  });
  window.addEventListener('pointerup',function(){
    if(!down) return; down=false; track.classList.remove('dragging');
    if(!moved) return;
    if(performance.now()-lastT>90) vel=0;
    animateTo(nearest(targetL+half-vel*260));
  });
  track.addEventListener('click',function(e){ if(moved){e.preventDefault();e.stopPropagation();moved=false;} },true);
  track.addEventListener('dragstart',function(e){e.preventDefault();});

  measure(); initAll();
  var start=parseInt(c.dataset.start||'0',10); if(window.innerWidth<700) start=0;
  track.scrollLeft=centers[n+start]-half; render();
});

// Plavební mapa: loď pluje po trase podle scrollování
document.querySelectorAll('[data-voyage]').forEach(function(box){
  var names=box.dataset.stops.split('|'), svgs=[].slice.call(box.querySelectorAll('svg')), NS='http://www.w3.org/2000/svg', state=null;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setup(){
    var svg=svgs.filter(function(s){return s.getBoundingClientRect().width>0;})[0]; if(!svg) return;
    var vertical=svg.classList.contains('vm-v');
    var route=svg.querySelector('.vm-route'), trail=svg.querySelector('.vm-trail'), g=svg.querySelector('.vm-stops'), boat=svg.querySelector('.vm-boat');
    var L=route.getTotalLength(); trail.style.strokeDasharray=L; trail.style.strokeDashoffset=L;
    g.innerHTML=''; var stops=[];
    names.forEach(function(nm,i){
      var f=.05+.9*i/(names.length-1), pt=route.getPointAtLength(L*f);
      var st=document.createElementNS(NS,'g'); st.setAttribute('class','vm-stop');
      var c=document.createElementNS(NS,'circle'); c.setAttribute('class','vm-dot'); c.setAttribute('cx',pt.x); c.setAttribute('cy',pt.y); c.setAttribute('r',6);
      var t=document.createElementNS(NS,'text'); t.setAttribute('class','vm-label'); t.textContent=nm;
      if(vertical){ t.setAttribute('x',pt.x+26); t.setAttribute('y',pt.y+5); }
      else { t.setAttribute('x',pt.x); t.setAttribute('y',i%2?pt.y+40:pt.y-24); t.setAttribute('text-anchor','middle'); }
      st.appendChild(c); st.appendChild(t); g.appendChild(st); stops.push({el:st,f:f});
    });
    state={svg:svg,route:route,trail:trail,boat:boat,L:L,stops:stops,vertical:vertical};
    tick();
  }
  function tick(){
    if(!state) return;
    var r=(window.innerWidth>760?box.closest('.voyage'):box).getBoundingClientRect(), vh=window.innerHeight;
    var sticky=window.innerWidth>760, p=reduce?1:(sticky?Math.max(0,Math.min(1,-r.top/Math.max(1,r.height-vh))):Math.max(0,Math.min(1,(vh*.85-r.top)/(r.height+vh*.35))));
    var f=.02+.96*p, pt=state.route.getPointAtLength(state.L*f), pt2=state.route.getPointAtLength(Math.min(state.L,state.L*f+2));
    var ang=state.vertical?0:Math.atan2(pt2.y-pt.y,pt2.x-pt.x)*180/Math.PI*.4;
    state.boat.setAttribute('transform','translate('+pt.x+' '+(pt.y-6)+') rotate('+ang.toFixed(1)+')');
    state.trail.style.strokeDashoffset=state.L*(1-f);
    state.stops.forEach(function(s){ s.el.classList.toggle('on', f>=s.f-.005); });
  }
  var q=0; window.addEventListener('scroll',function(){ if(!q) q=requestAnimationFrame(function(){q=0;tick();}); },{passive:true});
  window.addEventListener('resize',setup);
  setup();
});

// Náš příběh: loď pluje podél kapitol
document.querySelectorAll('[data-story]').forEach(function(track){
  var svg=track.querySelector('.st-svg'), route=svg.querySelector('.st-route'), trail=svg.querySelector('.st-trail'), dots=svg.querySelector('.st-dots'), boat=svg.querySelector('.vm-boat');
  var chapters=[].slice.call(track.querySelectorAll('.chapter')), NS='http://www.w3.org/2000/svg', L=0, table=[], pts=[], H=0;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setup(){
    H=track.offsetHeight; var W=svg.getBoundingClientRect().width||80;
    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    pts=[{x:W*.5,y:0}];
    chapters.forEach(function(ch,i){ pts.push({x:W*(i%2?.72:.28), y:ch.offsetTop+ch.offsetHeight/2}); });
    pts.push({x:W*.5,y:H});
    var d='M'+pts[0].x+' '+pts[0].y;
    for(var i=1;i<pts.length;i++){ var a=pts[i-1], b=pts[i], m=(b.y-a.y)/2; d+=' C'+a.x+' '+(a.y+m)+' '+b.x+' '+(b.y-m)+' '+b.x+' '+b.y; }
    route.setAttribute('d',d); trail.setAttribute('d',d);
    L=route.getTotalLength(); trail.style.strokeDasharray=L;
    table=[]; for(var k=0;k<=240;k++){ var l=L*k/240; table.push([route.getPointAtLength(l).y,l]); }
    dots.innerHTML='';
    pts.slice(1,-1).forEach(function(pt){ var c=document.createElementNS(NS,'circle'); c.setAttribute('class','st-dot'); c.setAttribute('cx',pt.x); c.setAttribute('cy',pt.y); c.setAttribute('r',6); dots.appendChild(c); });
    tick();
  }
  function lenAtY(y){ for(var k=1;k<table.length;k++){ if(table[k][0]>=y){ var a=table[k-1],b=table[k],t=(y-a[0])/Math.max(.001,b[0]-a[0]); return a[1]+(b[1]-a[1])*t; } } return L; }
  function tick(){
    if(!L) return;
    var r=track.getBoundingClientRect(), y=reduce?H:Math.max(0,Math.min(H,window.innerHeight*.55-r.top));
    var l=lenAtY(y), pt=route.getPointAtLength(l);
    boat.setAttribute('transform','translate('+pt.x+' '+(pt.y-6)+')');
    trail.style.strokeDashoffset=L-l;
    var ds=dots.querySelectorAll('.st-dot');
    chapters.forEach(function(ch,i){ var on=pts[i+1].y<=y+4; ch.classList.toggle('on',on); if(ds[i]) ds[i].classList.toggle('on',on); });
  }
  var q=0; window.addEventListener('scroll',function(){ if(!q) q=requestAnimationFrame(function(){q=0;tick();}); },{passive:true});
  window.addEventListener('resize',setup); window.addEventListener('load',setup);
  setup();
});

// Poptávkový formulář: přestavuje se podle typu poptávky a odesílá do Google Apps Scriptu
(function(){
  var tsum=document.getElementById('tsum');
  if(tsum){ var sm=new URLSearchParams(location.search).get('s'); if(sm){ tsum.textContent=sm; tsum.hidden=false; } }
  var form=document.getElementById('poptavka'); if(!form) return;
  var t0=Date.now(), groups=[].slice.call(form.querySelectorAll('.qgroup[data-for]')), contact=form.querySelector('.qcontact');
  var sumBox=form.querySelector('.qsummary'), sumEl=document.getElementById('qsum'), submitBox=form.querySelector('.submit'), status=document.getElementById('qstatus'), btn=form.querySelector('button[type=submit]');
  var now=new Date(), Y=now.getFullYear(), defY=now.getMonth()>=8?Y+1:Y;
  form.querySelectorAll('select.years').forEach(function(sel){ [Y,Y+1,Y+2].forEach(function(y){ var o=document.createElement('option'); o.textContent=y; if(y===defY) o.selected=true; sel.appendChild(o); }); });
  function key(){ var r=form.querySelector('input[name=typ]:checked'); return r?r.dataset.key:''; }
  function setOn(el,on){ el.hidden=!on; el.disabled=!on; }
  function conditions(){
    form.querySelectorAll('[data-show-when]').forEach(function(el){
      var g=el.closest('.qgroup'), parts=el.dataset.showWhen.split(':'), src=g.querySelector('[name="'+parts[0]+'"]'), v=src?src.value:'', c=parts[1];
      var on=!g.disabled&&(c.charAt(0)==='>'?Number(v)>Number(c.slice(1)):v===c);
      el.hidden=!on; el.querySelectorAll('input,select,textarea').forEach(function(i){ i.disabled=!on; });
    });
  }
  function applyType(){
    var k=key();
    groups.forEach(function(g){ setOn(g,g.dataset.for===k); });
    setOn(contact,!!k); sumBox.hidden=!k; submitBox.hidden=!k;
    conditions(); update();
  }
  function pl(n,a,b,c){ n=Number(n); return n+' '+(n===1?a:(n>=2&&n<=4?b:c)); }
  function update(){
    var fd=new FormData(form), g=function(n){ return (fd.get(n)||'').toString().trim(); }, k=key();
    var m=g('termin_m'), termin=m?(m==='Zatím nevím'?'Termín zatím nevím':m+' '+g('termin_y'))+(g('termin_flex')?', flexibilní':''):'';
    var parts=[];
    if(k==='soukroma'){ var os=g('dospeli')?pl(g('dospeli'),'dospělý','dospělí','dospělých'):''; if(os&&Number(g('deti'))>0) os+=' a '+pl(g('deti'),'dítě','děti','dětí'); parts=['Soukromá plavba',g('destinace'),termin,g('delka'),os]; }
    if(k==='firemni'){ parts=['Firemní akce',g('ucastnici')?pl(g('ucastnici'),'účastník','účastníci','účastníků'):'',g('format'),g('destinace'),termin]; }
    if(k==='kurz'){ parts=[g('kurz')||'Kurz jachtingu',termin,g('pocet_osob')?pl(g('pocet_osob'),'osoba','osoby','osob'):'']; }
    if(k==='pronajem'){ parts=[g('pronajem_typ')?'Pronájem lodi, '+g('pronajem_typ').toLowerCase():'Pronájem lodi',g('destinace'),termin,g('lod')]; }
    if(k==='sluzby'){ parts=[g('sluzba')||'Služby pro majitele lodí',g('lod_majitel'),g('odkud')&&g('kam')?g('odkud')+' až '+g('kam'):g('kotviste')]; }
    var sum=parts.filter(Boolean).join(', ');
    sumEl.textContent=sum; form.elements.shrnuti.value=sum; form.elements.termin.value=termin;
  }
  form.addEventListener('change',function(e){ if(e.target.name==='typ') applyType(); else { conditions(); update(); } });
  form.addEventListener('input',function(){ conditions(); update(); });

  // Předvyplnění z odkazu, např. kontakt/?typ=soukroma&destinace=Turecko
  var q=new URLSearchParams(location.search), t=q.get('typ'); if(t==='jine') t='sluzby';
  if(t){ var r=form.querySelector('input[name=typ][data-key="'+t+'"]'); if(r) r.checked=true; }
  applyType();
  var grp=form.querySelector('.qgroup[data-for="'+key()+'"]');
  var d=q.get('destinace');
  if(d&&grp){ var sel=grp.querySelector('select[name=destinace]');
    if(sel){ var opt=[].slice.call(sel.options).filter(function(o){ return o.text===d||o.text===d+', poraďte s výběrem'; })[0];
      if(opt) sel.value=opt.value; else { sel.value='Jinam, napíšu do zprávy'; form.elements.zprava.value='Destinace: '+d+'\n'; } } }
  var sv=q.get('sluzba'); if(sv&&grp){ var ss=grp.querySelector('select[name=sluzba]'); if(ss) ss.value=sv; }
  conditions(); update();

  function fields(){
    var out=[];
    [].slice.call(form.elements).forEach(function(el){
      if(!el.name||el.disabled||el.type==='hidden'||el.name.charAt(0)==='_'||/^termin_/.test(el.name)) return;
      if((el.type==='radio'||el.type==='checkbox')&&!el.checked) return;
      if(!el.value.trim()) return;
      var f=el.closest('.field'), lab=f&&f.querySelector('label')?f.querySelector('label').textContent.replace('*','').trim():el.name;
      if(el.name==='typ') lab='Typ poptávky';
      out.push(lab+': '+el.value.trim());
    });
    if(form.elements.termin.value) out.push('Termín: '+form.elements.termin.value);
    return out;
  }
  form.addEventListener('submit',function(e){
    e.preventDefault(); update(); status.textContent=''; status.className='form-status full';
    if(!key()){ status.textContent='Vyberte prosím, o co máte zájem.'; status.className+=' err'; return; }
    if(!form.checkValidity()){ form.reportValidity(); return; }
    form.elements._t.value=Date.now()-t0;
    form.elements.stranka.value=document.referrer||location.href;
    var endpoint=form.dataset.endpoint||'';
    if(!/^https:\/\//.test(endpoint)){
      // Formulář ještě není napojený na Apps Script: otevře e-mail s poptávkou
      location.href='mailto:info@caribyacht.cz?subject='+encodeURIComponent('Poptávka: '+form.elements.shrnuti.value)+'&body='+encodeURIComponent(fields().join('\n'));
      status.textContent='Otevřeli jsme váš e-mail s předvyplněnou poptávkou. Stačí ji odeslat.'; return;
    }
    btn.disabled=true; var label=btn.textContent; btn.textContent='Odesílám';
    fetch(endpoint,{method:'POST',body:new URLSearchParams(new FormData(form))})
      .then(function(r){ return r.json(); })
      .then(function(res){ if(!res||!res.ok) throw new Error(res&&res.error||'Chyba'); location.href=form.dataset.thanks+'?s='+encodeURIComponent(form.elements.shrnuti.value); })
      .catch(function(){
        btn.disabled=false; btn.textContent=label; status.className+=' err';
        status.innerHTML='Odeslání se nepovedlo. Zkuste to prosím znovu, nebo nám napište na <a href="mailto:info@caribyacht.cz">info@caribyacht.cz</a> či zavolejte na <a href="tel:+420737168072">+420 737 168 072</a>.';
      });
  });
})();
