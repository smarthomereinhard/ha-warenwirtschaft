# Google-Tabelle „Warenwirtschaftssystem“

Lege eine neue Google-Tabelle mit diesen sechs Blättern an. Die **Kopfzeilen müssen exakt so heißen** – Home Assistant liest die Spalten über ihre Namen. Weitere Spalten rechts daneben stören nicht.

Tipp: Die Spalten *Artikel-Nr.*, *Weitere EANs* (Artikelstamm), *Artikel-Nr.* (Bestand, Buchungen) als **Nur-Text** formatieren, sonst verliert Google führende Nullen.

## Artikelstamm

| Spalte | Inhalt |
|---|---|
| Artikel-Nr. | EAN oder eigener Code (z. B. `GEWUERZ-SALZ`, `GG-…` für Gefriergut) |
| Weitere EANs | weitere Barcodes desselben Artikels, durch Komma getrennt |
| Name | kurzer Name, z. B. „Fettarme Milch 1,5 %“ |
| Marke | z. B. „Milbona“ |
| Packungsgröße | nur Info |
| Zählart | Stück / Gramm / Milliliter / Ladungen / Stufen |
| Warengruppe | z. B. Lebensmittel (Vorrat), Getränke, Medikamente … |
| Standard-Lagerort | muss in „Lagerorte“ vorkommen |
| Mindestbestand | Zahl, 0 = kein Mindestbestand |
| Wird angebrochen | ja / nein – „ja“ = Entnehmen ist ein Packungswechsel |
| Haltbar nach Öffnen (Tage) | für die Meldung „offene Packung läuft ab“ |
| MHD erfassen | ja / nein (reserviert) |
| Geschäft | z. B. Lidl, dm, Online – „Online“/„Amazon“ landen auf der Liste *Bestellen* |
| Sammelartikel | Artikel mit gleichem Sammelnamen zählen gemeinsam (z. B. alle Milchmarken) |
| Aktiv | ja / nein – nur „ja“ wird geladen |
| Letzter Preis | optional |
| Notiz | optional; neue Artikel aus HA bekommen „prüfen“ |

## Sammelartikel

`Sammelartikel` · `Mindestbestand` · `Zählart` · (beliebige weitere, z. B. Warengruppe, Notiz)

## Lagerorte

`Code` · `Lagerort / Befehl` · `Art` · `Typischer Inhalt`

Beispiele:

| Code | Lagerort / Befehl | Art |
|---|---|---|
| LO-VORRAT | Vorratskammer | Lagerort |
| LO-KUEHL | Kühlschrank | Lagerort |
| LO-GEFRIER | Gefrierschrank | Lagerort |
| LO-EINGANG | Eingang | Lagerort |
| CMD-EIN | Einbuchen | Befehl |
| CMD-AUS | Entnehmen | Befehl |
| CMD-UM | Umbuchen | Befehl |
| CMD-MUELL | Müll | Befehl |
| CMD-INV | Inventur | Befehl |
| CMD-ENDE | Fertig | Befehl |

Die Codes druckst du als Barcode- oder QR-Etiketten (z. B. mit einem Etikettendrucker) und klebst sie an Regal, Kühlschrank usw.

## Bestand (schreibt Home Assistant)

`Artikel-Nr.` · `Name` · `Lagerort` · `Stück` · `Offen` · `Offen seit` · `Haltbar bis` · `Aktualisiert`

## Buchungen (schreibt Home Assistant)

`Zeit` · `Buchungsart` · `Quelle` · `Artikel-Nr.` · `Name` · `Lagerort` · `Anzahl` · `Bestand danach` · `Notiz`

## Mapping

`OpenFoodFacts-Kategorie` · `Warengruppe` – optional, als Nachschlagetabelle für neue Artikel.
