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
  var dest=q.get('destinace'); var z=document.getElementById('f5'); if(dest&&z&&!z.value){z.value='Zajímá mě plavba: '+dest+'\n';}

  var y=document.getElementById('y'); if(y) y.textContent=new Date().getFullYear();
})();
