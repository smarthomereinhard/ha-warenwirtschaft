/**
 * Warenwirtschaftssystem – Schnittstelle für Home Assistant
 *
 * Einrichtung:
 *   1. In der Google-Tabelle Erweiterungen > Apps Script öffnen, diesen Code einfügen.
 *   2. Unten bei TOKEN ein eigenes Geheimwort eintragen (dasselbe wie in
 *      packages/warenwirtschaft/schnittstelle.yaml).
 *   3. Bereitstellen > Neue Bereitstellung > Web-App
 *        Ausführen als: Ich · Zugriff: Jeder
 *   4. Die Web-App-URL (…/exec) in schnittstelle.yaml eintragen.
 *   Nach Code-Änderungen: Bereitstellungen verwalten > Bearbeiten > neue Version.
 *
 * Blätter (Kopfzeilen siehe docs/tabelle.md):
 *   Artikelstamm, Sammelartikel, Lagerorte, Bestand, Buchungen, Mapping
 *
 * GET  ?action=stammdaten          -> Artikelstamm, Sammelartikel, Lagerorte, Mapping als JSON
 * GET  ?action=artikel&code=...    -> ein Artikel (Artikel-Nr. oder weitere EAN)
 * POST {action:"bestand", ...}     -> Zeile im Blatt „Bestand“ anlegen oder aktualisieren
 * POST {action:"buchung", ...}     -> Zeile im Blatt „Buchungen“ anhängen
 * POST {action:"artikel_neu", ...} -> neuen Artikel im Artikelstamm anlegen
 */

const TOKEN = 'HIER-EIN-EIGENES-GEHEIMWORT-EINTRAGEN';

function antwort_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function blattAlsObjekte_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  const werte = sh.getDataRange().getDisplayValues();
  const kopf = werte.shift();
  return werte
    .filter(r => r[0] !== '')
    .map(r => Object.fromEntries(kopf.map((k, i) => [k, r[i]])));
}

function doGet(e) {
  const p = e.parameter || {};
  if (p.token !== TOKEN) return antwort_({status: 'error', fehler: 'token'});
  if (p.action === 'stammdaten') {
    return antwort_({
      status: 'ok',
      stand: new Date().toISOString(),
      artikel: blattAlsObjekte_('Artikelstamm'),
      sammelartikel: blattAlsObjekte_('Sammelartikel'),
      lagerorte: blattAlsObjekte_('Lagerorte'),
      mapping: blattAlsObjekte_('Mapping'),
    });
  }
  if (p.action === 'artikel') {
    const code = String(p.code || '').trim();
    const treffer = blattAlsObjekte_('Artikelstamm').find(a =>
      a['Artikel-Nr.'] === code ||
      String(a['Weitere EANs'] || '').split(/[,; ]+/).includes(code));
    return antwort_(treffer ? {status: 'found', artikel: treffer} : {status: 'not_found'});
  }
  return antwort_({status: 'error', fehler: 'action'});
}

function doPost(e) {
  const d = JSON.parse(e.postData.contents || '{}');
  if (d.token !== TOKEN) return antwort_({status: 'error', fehler: 'token'});
  const ss = SpreadsheetApp.getActive();
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (d.action === 'bestand') {
      // Schlüssel: Artikel-Nr. + Lagerort
      const sh = ss.getSheetByName('Bestand');
      const werte = sh.getDataRange().getValues();
      const zeile = [ "'" + d.code, d.name || '', d.lagerort || '', Number(d.stueck || 0),
        Number(d.offen || 0), d.offen_seit || '', d.haltbar_bis || '', new Date() ];
      const idx = werte.findIndex((r, i) => i > 0 && String(r[0]) === String(d.code) && r[2] === d.lagerort);
      if (idx > 0) sh.getRange(idx + 1, 1, 1, zeile.length).setValues([zeile]);
      else sh.appendRow(zeile);
      return antwort_({status: 'ok'});
    }
    if (d.action === 'buchung') {
      ss.getSheetByName('Buchungen').appendRow([ new Date(), d.art || '', d.quelle || '',
        "'" + (d.code || ''), d.name || '', d.lagerort || '', Number(d.anzahl || 0),
        d.bestand_danach === undefined ? '' : Number(d.bestand_danach), d.notiz || '' ]);
      return antwort_({status: 'ok'});
    }
    if (d.action === 'artikel_neu') {
      const sh = ss.getSheetByName('Artikelstamm');
      const vorhanden = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getDisplayValues()
        .some(r => r[0] === String(d.code));
      if (vorhanden) return antwort_({status: 'exists'});
      sh.appendRow([ "'" + d.code, '', d.name || '', d.marke || '', d.groesse || '', d.zaehlart || 'Stück',
        d.warengruppe || '', d.lagerort || 'Eingang', d.mindestbestand === undefined ? 1 : Number(d.mindestbestand),
        d.angebrochen || 'nein', '', 'nein', d.geschaeft || '', '', 'ja', d.preis || '',
        d.notiz || 'neu angelegt von HA – prüfen' ]);
      return antwort_({status: 'ok'});
    }
    return antwort_({status: 'error', fehler: 'action'});
  } finally {
    lock.releaseLock();
  }
}
