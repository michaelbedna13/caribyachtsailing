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

  // Předvyplnění poptávky z odkazu, např. kontakt/?typ=firemni&destinace=Turecko
  var q=new URLSearchParams(location.search);
  var typ=q.get('typ'); if(typ){var r=document.querySelector('input[name="typ"][data-key="'+typ+'"]'); if(r) r.checked=true;}
  var dest=q.get('destinace'); var z=document.getElementById('f7'); if(dest&&z&&!z.value){z.value=dest;}

  var y=document.getElementById('y'); if(y) y.textContent=new Date().getFullYear();
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
      var k=Math.min(Math.abs(centers[i]-mid)/st,1), el=cards[i];
      el.style.setProperty('--s',(1-.14*k).toFixed(3)); el.style.setProperty('--o',(1-.45*k).toFixed(3)); el.style.setProperty('--t',Math.max(0,1-1.5*k).toFixed(3));
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
  function initAll(){ cards.forEach(function(el){el.style.setProperty('--s','.86');el.style.setProperty('--o','.55');el.style.setProperty('--t','0');}); }
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
  cards.forEach(function(card,i){ card.addEventListener('click',function(e){ if(i!==active){e.preventDefault();animateTo(i);} }); });

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
    var r=box.getBoundingClientRect(), vh=window.innerHeight;
    var p=reduce?1:Math.max(0,Math.min(1,(vh*.85-r.top)/(r.height+vh*.35)));
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
