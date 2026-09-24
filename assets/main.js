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

// Kolotoč destinací: nekonečné točení oběma směry, tažení myší, zvýraznění karty uprostřed
document.querySelectorAll('[data-carousel]').forEach(function(c){
  var track=c.querySelector('.car-track'), cards=[].slice.call(track.querySelectorAll('.dcard'));
  var n=parseInt(c.dataset.count,10)||cards.length;
  var btns=c.querySelectorAll('.car-btn'), count=c.querySelector('.car-count b'), bar=c.querySelector('.car-progress span');
  if(!cards.length) return;
  var active=-1, raf=0, settle=0, reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function center(el){return el.offsetLeft+el.offsetWidth/2;}
  function step(){return center(cards[1])-center(cards[0]);}
  function nearest(pos){var best=0,bd=1e9; cards.forEach(function(card,i){var d=Math.abs(center(card)-pos); if(d<bd){bd=d;best=i;}}); return best;}
  function update(){
    raf=0;
    var mid=track.scrollLeft+track.clientWidth/2, st=step();
    cards.forEach(function(card){
      var k=Math.min(Math.abs(center(card)-mid)/st,1);
      card.style.setProperty('--s',(1-.14*k).toFixed(3));
      card.style.setProperty('--o',(1-.45*k).toFixed(3));
      card.style.setProperty('--t',Math.max(0,1-1.5*k).toFixed(3));
    });
    var best=nearest(mid);
    if(best!==active){
      if(active>-1) cards[active].classList.remove('is-active');
      active=best; cards[active].classList.add('is-active');
      var real=((active%n)+n)%n;
      if(count) count.textContent=String(real+1).padStart(2,'0');
      if(bar){bar.style.width=(100/n)+'%'; bar.style.transform='translateX('+(real*100)+'%)';}
    }
  }
  function queue(){ if(!raf) raf=requestAnimationFrame(update); }
  function scrollToCard(i,instant){ track.scrollTo({left:center(cards[i])-track.clientWidth/2,behavior:(instant||reduce)?'auto':'smooth'}); }
  // Po dojetí: když jsme v krajní sadě kopií, nepozorovaně skočíme do prostřední
  function recenter(){
    if(down) return;
    var i=nearest(track.scrollLeft+track.clientWidth/2);
    if(i<n||i>=2*n){
      var shift=(i<n?n:-n)*step();
      track.classList.add('nosnap');
      track.scrollLeft=track.scrollLeft+shift;
      update();
      requestAnimationFrame(function(){track.classList.remove('nosnap');});
    }
  }
  track.addEventListener('scroll',function(){queue(); clearTimeout(settle); settle=setTimeout(recenter,140);},{passive:true});
  btns.forEach(function(b){b.addEventListener('click',function(){scrollToCard(Math.max(0,Math.min(cards.length-1,active+parseInt(b.dataset.dir,10))));});});
  track.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'){e.preventDefault();scrollToCard(active+1);} if(e.key==='ArrowLeft'){e.preventDefault();scrollToCard(active-1);} });
  window.addEventListener('resize',function(){scrollToCard(active,true);queue();});
  cards.forEach(function(card,i){ card.addEventListener('click',function(e){ if(i!==active){e.preventDefault();scrollToCard(i);} }); });

  // Tažení myší
  var down=false, moved=false, startX=0, startL=0, lastX=0, lastT=0, vel=0;
  track.addEventListener('pointerdown',function(e){
    if(e.pointerType!=='mouse'||e.button!==0) return;
    down=true; moved=false; startX=lastX=e.clientX; startL=track.scrollLeft; lastT=performance.now(); vel=0;
    track.classList.add('nosnap');
  });
  window.addEventListener('pointermove',function(e){
    if(!down) return;
    var dx=e.clientX-startX;
    if(!moved&&Math.abs(dx)>5){moved=true; track.classList.add('dragging');}
    if(moved){ track.scrollLeft=startL-dx; var now=performance.now(); vel=(e.clientX-lastX)/Math.max(1,now-lastT); lastX=e.clientX; lastT=now; }
  });
  window.addEventListener('pointerup',function(){
    if(!down) return; down=false; track.classList.remove('dragging');
    var i=nearest(track.scrollLeft+track.clientWidth/2-vel*220);
    scrollToCard(i);
    setTimeout(function(){track.classList.remove('nosnap');},650);
  });
  track.addEventListener('click',function(e){ if(moved){e.preventDefault();e.stopPropagation();moved=false;} },true);
  track.addEventListener('dragstart',function(e){e.preventDefault();});

  scrollToCard(n,true); update();
});
