# Poptávkový formulář přes Google Sheets

Formulář na stránce /kontakt/ posílá data do Google Apps Scriptu. Ten poptávku zapíše do tabulky, pošle shrnutí na e-mail firmy a potvrzení zájemci.

## Nasazení (asi 10 minut)

1. **Tabulka.** Pod Google účtem, ze kterého mají e-maily odcházet, založte novou tabulku v Google Sheets, třeba „Poptávky Carib Yacht“.
2. **Skript.** V tabulce otevřete Rozšíření → Apps Script. Smažte vzorový kód a vložte celý obsah souboru `Code.gs`.
3. **Nastavení.** Nahoře v `CONFIG` upravte `NOTIFY_TO`, tedy adresu, kam mají chodit nové poptávky. Více adres oddělte čárkou.
4. **Oprávnění.** Nahoře vyberte funkci `setup` a klikněte na Spustit. Google se zeptá na oprávnění (tabulka a odesílání e-mailů), povolte je. V tabulce vznikne list „Poptávky“ se záhlavím.
5. **Test.** Spusťte funkci `testPoptavka`. Do tabulky přibude řádek a na vaši adresu přijde potvrzení i notifikace.
6. **Webová aplikace.** Vpravo nahoře Nasadit → Nové nasazení → typ Webová aplikace.
   - Spustit jako: **Já**
   - Kdo má přístup: **Kdokoli**
   Po nasazení zkopírujte URL webové aplikace (končí na `/exec`).
7. **Napojení webu.** V souboru `kontakt/index.html` najděte `data-endpoint="VLOZTE_URL_APPS_SCRIPTU"` a místo textu vložte zkopírovanou URL. Commit, push, hotovo.

Dokud URL není vložená, formulář místo odeslání otevře e-mail s předvyplněnou poptávkou, takže se nic neztratí ani při testování.

## Úpravy skriptu

Po každé změně v `Code.gs` je potřeba nasadit novou verzi: Nasadit → Spravovat nasazení → tužka → Verze: Nová verze. URL zůstane stejná.

## Dobré vědět

- **Odesílatel.** E-maily odcházejí z Google účtu, pod kterým je skript nasazený. Pokud mají chodit z adresy @caribyacht.cz, musí být v tomto Gmailu nastavená jako alias a skript upravený na `GmailApp.sendEmail` s parametrem `from`.
- **Limit.** Běžný Google účet může ze skriptu poslat zhruba 100 e-mailů denně, Google Workspace víc. Každá poptávka spotřebuje dva.
- **Sloupec Stav** má rozbalovací výběr (Nová, Rozpracovaná, Nabídka odeslána, Potvrzená, Uzavřená) pro jednoduché sledování poptávek.
- **Ochrana proti spamu.** Skryté pole pro roboty a kontrola, že formulář nebyl odeslán nesmyslně rychle.
