# Carib Yacht Sailing, web v4

Statický web (HTML, CSS, JS) bez build kroku.

## Struktura
- `index.html` úvod
- `destinace/` přehled + `turecko/`, `chorvatsko/`, `karibik/`
- `pro-firmy/`, `kapitani/`, `jak-to-funguje/` (FAQ + slovník), `kontakt/`, `dekujeme/`, `404.html`
- `assets/styles.css` a `assets/main.js` jsou sdílené pro všechny stránky
- přesměrování starých adres: vlastní složky s přesměrovací stránkou (např. `kapitani/`) a skript v `404.html` pro celé skupiny adres
- `CNAME` vlastní doména pro GitHub Pages, `.nojekyll`, `sitemap.xml`, `robots.txt`

## Lokální náhled
Odkazy vedou na složky, proto web otevírej přes lokální server, ne dvojklikem:
`npx serve .` nebo `python3 -m http.server`

## Nasazení
GitHub Pages: Settings → Pages → Source „Deploy from a branch“, větev `main`, složka `/ (root)`.
Vlastní doména je v souboru `CNAME` (`caribyacht.cz`). U registrátora domény nastavit DNS:
- `A` záznamy pro `caribyacht.cz`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- `CNAME` pro `www` na `<uživatel>.github.io`

Po ověření domény zapnout v nastavení Pages „Enforce HTTPS“.
Formulář na /kontakt/ odesílá poptávky do Google Apps Scriptu (složka `google-apps-script/`).

## Nová destinace
Zkopírovat existující destinaci ve stejné oblasti (např. `destinace/stredomori/turecko/`), upravit texty a přidat kartu na stránku oblasti (např. `destinace/stredomori/index.html`), podle potřeby na úvod a do `sitemap.xml`.

## Fotky
Zatím odkazy na Unsplash. Vlastní fotky uložit do `assets/img/` ve formátu WebP a přepsat `src`.
