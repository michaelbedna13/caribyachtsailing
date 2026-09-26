# Carib Yacht Sailing, web

Statický vícestránkový web (HTML, CSS, JS) bez build kroku. Hostováno na GitHub Pages z tohoto repozitáře. Vlastní doména caribyacht.cz se napojí později (soubor `CNAME` zatím nepřidávat).

## Pravidla pro texty
- Nikdy nepoužívat dlouhou pomlčku (em dash). Místo ní čárka, dvojtečka nebo nová věta.
- Čeština, vykání, klidný prémiový tón. Žádné superlativy ani marketingové fráze.
- Nevymýšlet fakta o firmě, kapitánech, cenách ani termínech. Co není ověřené, označit v kódu komentářem OVĚŘIT.

## Design
- Styl webu popsaný v této sekci má přednost před doporučeními skillů (např. frontend-design, impeccable, ui-ux-pro-max, web-design-guidelines). Když skill radí něco, co je s tímto stylem v rozporu (jiná písma, nové barvy, přechody, stíny, ikonky, výraznější efekty), řídit se tímto souborem. Ze skillů přebírat jen to, co styl nemění: přístupnost, výkon, opravy chyb.
- Nadpisy: DM Serif Display. Text: Jost (400 a 500). Oba z Google Fonts.
- Barvy jsou jako proměnné v `assets/styles.css` (:root): midnight, ivory, brass. Nové barvy nepřidávat.
- Prémiový, vzdušný styl: velké fotky, tenké linky, hodně prostoru. Žádné kartičky se stíny, ikonky v kolečkách, barevné přechody ani štítky typu „Nejčastější volba“. Výzvy k akci vždy jako tlačítka (.btn nebo .line-link).
- Výjimka: reference hostů na úvodu (`.quotes.featured`) jsou bílé karty s jemným stínem a vodoznakem plachetnice z loga. Na přání klienta, jinde stíny nepoužívat.
- Všechny stránky musí fungovat na mobilu i desktopu.
- Hero sekce mají tři typy, jiné nevymýšlet:
  1. Úvod: fotka přes celou obrazovku (`.hero.home`).
  2. Zážitkové stránky (destinace, oblasti, detaily destinací, Pro firmy, Náš příběh): fotka (`.hero.page`), vždy nadpisek, nadpis, jedna věta podtitulku a nejvýš jedno tlačítko.
  3. Informační stránky (Služby, Jak to funguje, Kontakt, Děkujeme, 404): textová hlavička bez fotky (`.page-head`), nadpisek, nadpis, podtitulek, případně řada odkazů na části stránky.
- Námořní mapa jako pozadí (`.map-bg`, `assets/img/mapa-svetla.svg`, v patičce `mapa-tmava.svg`) používat střídmě: jen Kontakt, úvod Pro firmy a patička. Nepřidávat ji za dlouhé texty.

## Struktura
- Sdílené styly a skript: `assets/styles.css`, `assets/main.js`. Hlavička a patička jsou na každé stránce stejné, při změně upravit všude.
- Odkazy jsou relativní a vedou na složky (`kapitani/`), ne na `index.html`.
- Nová destinace: zkopírovat existující destinaci ve stejné oblasti (např. `destinace/stredomori/turecko/`), pak přidat kartu na stránku oblasti (např. `destinace/stredomori/index.html`), podle potřeby na úvod a do `sitemap.xml`.
- Staré adresy z původního webu: GitHub Pages neumí přesměrování 301. Jednotlivá stará adresa dostane vlastní složku s přesměrovací stránkou (vzor např. `kapitani/index.html`: canonical, meta refresh a `location.replace`). Celé skupiny adres (např. `/kategorie/*`) se přesměrují skriptem v `404.html`.
- `.nojekyll` v kořeni nechat, jinak GitHub Pages web prožene Jekyllem.

## SEO
- Každá stránka má vlastní title, description, canonical a Open Graph.
- Strukturovaná data (JSON-LD) udržovat v souladu s obsahem.
