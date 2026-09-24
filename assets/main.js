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

// Carousel destinací
document.querySelectorAll('[data-carousel]').forEach(function(c){
  var track=c.querySelector('.car-track'), bar=c.querySelector('.car-progress span'), btns=c.querySelectorAll('.car-btn');
  function step(){var card=track.querySelector('.dcard'); if(!card) return 300; var gap=parseFloat(getComputedStyle(track).columnGap)||0; return card.getBoundingClientRect().width+gap;}
  function update(){
    var max=track.scrollWidth-track.clientWidth, x=track.scrollLeft;
    var ratio=track.clientWidth/track.scrollWidth, w=Math.max(ratio*100,12);
    bar.style.width=w+'%'; bar.style.transform='translateX('+(max>0?(x/max)*(100/w*100-100):0)+'%)';
    btns[0].disabled=x<=4; btns[1].disabled=x>=max-4;
  }
  btns.forEach(function(b){b.addEventListener('click',function(){track.scrollBy({left:step()*parseInt(b.dataset.dir,10),behavior:'smooth'});});});
  track.addEventListener('scroll',update,{passive:true}); window.addEventListener('resize',update); update();
});

// Zvýraznění aktivní položky v podnavigaci
var sub=document.querySelector('.subnav');
if(sub && 'IntersectionObserver' in window){
  var links={}; sub.querySelectorAll('a').forEach(function(a){links[a.getAttribute('href').slice(1)]=a;});
  var so=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){Object.values(links).forEach(function(l){l.classList.remove('active');}); var l=links[x.target.id]; if(l){l.classList.add('active'); l.scrollIntoView({block:'nearest',inline:'nearest'});}}});},{rootMargin:'-45% 0px -50% 0px'});
  Object.keys(links).forEach(function(id){var el=document.getElementById(id); if(el) so.observe(el);});
}
