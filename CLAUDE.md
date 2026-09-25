# Carib Yacht Sailing, web

Statický vícestránkový web (HTML, CSS, JS) bez build kroku. Hostováno na Netlify z tohoto repozitáře.

## Pravidla pro texty
- Nikdy nepoužívat dlouhou pomlčku (em dash). Místo ní čárka, dvojtečka nebo nová věta.
- Čeština, vykání, klidný prémiový tón. Žádné superlativy ani marketingové fráze.
- Nevymýšlet fakta o firmě, kapitánech, cenách ani termínech. Co není ověřené, označit v kódu komentářem OVĚŘIT.

## Design
- Nadpisy: DM Serif Display. Text: Jost (400 a 500). Oba z Google Fonts.
- Barvy jsou jako proměnné v `assets/styles.css` (:root): midnight, ivory, brass. Nové barvy nepřidávat.
- Prémiový, vzdušný styl: velké fotky, tenké linky, hodně prostoru. Žádné kartičky se stíny, ikonky v kolečkách, barevné přechody ani štítky typu „Nejčastější volba“. Výzvy k akci vždy jako tlačítka (.btn nebo .line-link).
- Všechny stránky musí fungovat na mobilu i desktopu.

## Struktura
- Sdílené styly a skript: `assets/styles.css`, `assets/main.js`. Hlavička a patička jsou na každé stránce stejné, při změně upravit všude.
- Odkazy jsou relativní a vedou na složky (`kapitani/`), ne na `index.html`.
- Nová destinace: zkopírovat existující destinaci ve stejné oblasti (např. `destinace/stredomori/turecko/`), pak přidat kartu na stránku oblasti (např. `destinace/stredomori/index.html`), podle potřeby na úvod a do `sitemap.xml`.
- Staré adresy z původního webu přesměrovat v `_redirects` (301).

## SEO
- Každá stránka má vlastní title, description, canonical a Open Graph.
- Strukturovaná data (JSON-LD) udržovat v souladu s obsahem.
