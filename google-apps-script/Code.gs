/**
 * Carib Yacht Sailing, poptávkový formulář
 * Webová aplikace Google Apps Script: zapíše poptávku do tabulky,
 * pošle potvrzení zájemci a shrnutí na e-mail firmy.
 * Návod k nasazení najdete v souboru NAVOD.md.
 */

const CONFIG = {
  SHEET_NAME: 'Poptávky',
  NOTIFY_TO: 'info@caribyacht.cz',        // kam chodí nové poptávky (lze více adres oddělených čárkou)
  FROM_NAME: 'Carib Yacht Sailing',
  PHONE: '+420 737 168 072',
  PHONE_NAME: 'Pavel Strašil',
  WEB: 'https://caribyacht.cz',
  SEND_CONFIRMATION: true                 // potvrzovací e-mail zájemci
};

// Sloupce tabulky: [klíč z formuláře, název sloupce]
const FIELDS = [
  ['datum', 'Datum'], ['stav', 'Stav'], ['typ', 'Typ poptávky'], ['shrnuti', 'Shrnutí'],
  ['jmeno', 'Jméno'], ['email', 'E-mail'], ['telefon', 'Telefon'],
  ['destinace', 'Destinace'], ['termin', 'Termín'], ['delka', 'Délka'],
  ['dospeli', 'Dospělí'], ['deti', 'Děti'], ['vek_deti', 'Věk dětí'], ['lod', 'Loď'], ['zkusenosti', 'Zkušenosti'],
  ['firma', 'Firma'], ['ucastnici', 'Účastníci'], ['format', 'Formát akce'], ['program', 'Program na palubě'],
  ['kurz', 'Kurz'], ['kvalifikace', 'Kvalifikace'], ['pocet_osob', 'Počet osob'],
  ['pronajem_typ', 'Typ pronájmu'], ['prukaz', 'Průkaz'],
  ['sluzba', 'Služba'], ['lod_majitel', 'Loď majitele'], ['kotviste', 'Kotviště'], ['odkud', 'Přeplavba odkud'], ['kam', 'Přeplavba kam'],
  ['zprava', 'Zpráva'], ['stranka', 'Odesláno ze stránky']
];
const INTERNAL = ['datum', 'stav', 'shrnuti', 'stranka'];
const TYPES = ['Soukromá plavba', 'Firemní akce', 'Kurz jachtingu', 'Pronájem lodi', 'Služby pro majitele lodí'];

function doGet() {
  return json_({ ok: true, info: 'Formulář Carib Yacht Sailing běží.' });
}

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Ochrana proti robotům: vyplněné skryté pole nebo příliš rychlé odeslání
  if (p._hp) return json_({ ok: true });
  if (Number(p._t || 0) < 3000) return json_({ ok: true });

  const data = {};
  FIELDS.forEach(function (f) { data[f[0]] = clean_(p[f[0]]); });
  data.datum = new Date();
  data.stav = 'Nová';

  if (!data.jmeno || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || TYPES.indexOf(data.typ) === -1) {
    return json_({ ok: false, error: 'Neplatná data.' });
  }
  if (!data.shrnuti) data.shrnuti = data.typ;

  // Zápis do tabulky
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = sheet_();
    sheet.appendRow(FIELDS.map(function (f) { return safe_(data[f[0]]); }));
  } finally {
    lock.releaseLock();
  }

  // E-maily (chyba v e-mailu nesmí zahodit uloženou poptávku)
  try { notify_(data); } catch (err) { console.error('Notifikace: ' + err); }
  if (CONFIG.SEND_CONFIRMATION) {
    try { confirm_(data); } catch (err) { console.error('Potvrzení: ' + err); }
  }
  return json_({ ok: true });
}

/** Spusťte jednou ručně: vytvoří list se záhlavím a vyžádá oprávnění. */
function setup() {
  sheet_();
  console.log('Hotovo. Tabulka: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
}

/** Pošle zkušební poptávku bez formuláře (pro kontrolu e-mailů). */
function testPoptavka() {
  doPost({ parameter: {
    _t: '10000', typ: 'Soukromá plavba', shrnuti: 'Soukromá plavba, Turecko, červen 2027, 4 dospělí',
    jmeno: 'Test Testovič', email: Session.getActiveUser().getEmail(), telefon: '+420 600 000 000',
    destinace: 'Turecko', termin: 'Červen 2027', dospeli: '4', deti: '0', zprava: 'Zkušební poptávka.', stranka: 'test'
  } });
}

// ---------- pomocné funkce ----------

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) sh = ss.insertSheet(CONFIG.SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(FIELDS.map(function (f) { return f[1]; }));
    sh.getRange(1, 1, 1, FIELDS.length).setFontWeight('bold').setBackground('#0B1621').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    sh.getRange(2, 1, sh.getMaxRows() - 1, 1).setNumberFormat('d. M. yyyy H:mm');
    const stav = SpreadsheetApp.newDataValidation().requireValueInList(['Nová', 'Rozpracovaná', 'Nabídka odeslána', 'Potvrzená', 'Uzavřená'], true).build();
    sh.getRange(2, 2, sh.getMaxRows() - 1, 1).setDataValidation(stav);
  }
  return sh;
}

function clean_(v) {
  return v == null ? '' : String(v).replace(/\s+$/,'').slice(0, 3000);
}

// Zabrání tomu, aby text z formuláře tabulka vyhodnotila jako vzorec
function safe_(v) {
  if (typeof v === 'string' && /^[=+\-@]/.test(v)) return "'" + v;
  return v;
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function rows_(data) {
  return FIELDS.filter(function (f) { return INTERNAL.indexOf(f[0]) === -1 && data[f[0]] !== '' && !(f[0] === 'deti' && data.deti === '0'); })
    .map(function (f) {
      return '<tr><td style="padding:10px 16px 10px 0;color:#50585E;font-size:13px;vertical-align:top;white-space:nowrap">' + esc_(f[1]) +
             '</td><td style="padding:10px 0;color:#121C25;font-size:15px;vertical-align:top">' + esc_(data[f[0]]).replace(/\n/g, '<br>') + '</td></tr>';
    }).join('');
}

function layout_(title, intro, data, outro) {
  return '<div style="background:#F6F3ED;padding:32px 0;font-family:Helvetica,Arial,sans-serif">' +
    '<div style="max-width:600px;margin:0 auto;background:#FFFFFF">' +
    '<div style="background:#0B1621;padding:28px 32px;color:#FFFFFF;font-family:Georgia,serif;font-size:20px;letter-spacing:3px">CARIB YACHT <span style="font-size:11px;letter-spacing:5px;color:#CDB184">SAILING</span></div>' +
    '<div style="padding:32px">' +
    '<h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:normal;font-size:26px;color:#121C25">' + esc_(title) + '</h1>' +
    '<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#50585E">' + intro + '</p>' +
    '<p style="margin:0 0 8px;padding:14px 16px;background:#F6F3ED;font-size:15px;color:#121C25"><strong>' + esc_(data.shrnuti) + '</strong></p>' +
    '<table style="width:100%;border-collapse:collapse;margin:16px 0 24px">' + rows_(data) + '</table>' +
    '<p style="margin:0;font-size:14px;line-height:1.6;color:#50585E">' + outro + '</p>' +
    '</div></div></div>';
}

function notify_(data) {
  const html = layout_('Nová poptávka', 'Z webu přišla nová poptávka. Odpovědět můžete přímo na tento e-mail.', data,
    'Všechny poptávky najdete v tabulce: <a href="' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '">' + esc_(CONFIG.SHEET_NAME) + '</a>');
  MailApp.sendEmail({
    to: CONFIG.NOTIFY_TO,
    subject: 'Nová poptávka: ' + data.shrnuti,
    htmlBody: html,
    replyTo: data.email,
    name: CONFIG.FROM_NAME + ' web'
  });
}

function confirm_(data) {
  const intro = 'Dobrý den, ' + esc_(data.jmeno) + ',<br>děkujeme za vaši poptávku. Projdeme ji a ozveme se vám co nejdříve s návrhem. Níže posíláme shrnutí toho, co jste nám napsali.';
  const outro = 'Pokud spěcháte nebo chcete něco doplnit, odpovězte na tento e-mail nebo zavolejte: ' + esc_(CONFIG.PHONE_NAME) +
    ', <a href="tel:' + CONFIG.PHONE.replace(/\s/g, '') + '">' + esc_(CONFIG.PHONE) + '</a>.<br><br>Carib Yacht Sailing<br><a href="' + CONFIG.WEB + '">' + CONFIG.WEB.replace('https://', '') + '</a>';
  MailApp.sendEmail({
    to: data.email,
    subject: 'Děkujeme za poptávku, Carib Yacht Sailing',
    htmlBody: layout_('Děkujeme za poptávku', intro, data, outro),
    replyTo: CONFIG.NOTIFY_TO,
    name: CONFIG.FROM_NAME
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
