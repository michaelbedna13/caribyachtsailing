# Carib Yacht Sailing, web v4

Statický web (HTML, CSS, JS) bez build kroku.

## Struktura
- `index.html` úvod
- `destinace/` přehled a oblasti podle starého webu: `stredomori/` (turecko, chorvatsko), `severni-more/` (norsko), `karibik/` (navetrne-ostrovy), `vzdalena-more/`
- `pro-firmy/`, `kapitani/`, `jak-to-funguje/` (FAQ + slovník), `kontakt/`, `dekujeme/`, `404.html`
- `assets/styles.css` a `assets/main.js` jsou sdílené pro všechny stránky
- `_redirects` přesměrování starých adres (Netlify), `sitemap.xml`, `robots.txt`

## Lokální náhled
Odkazy vedou na složky, proto web otevírej přes lokální server, ne dvojklikem:
`npx serve .` nebo `python3 -m http.server`

## Nasazení
Repozitář na GitHubu připojit k Netlify (build command prázdný, publish directory `.`).
Formulář na /kontakt/ funguje přes Netlify Forms automaticky.

## Nová destinace
Zkopírovat např. `destinace/stredomori/turecko/` do správné oblasti, upravit texty a přidat kartu do carouselu na úvodu, na stránku oblasti a do `sitemap.xml`.

## Fotky
Zatím odkazy na Unsplash. Vlastní fotky uložit do `assets/img/` ve formátu WebP a přepsat `src`.
