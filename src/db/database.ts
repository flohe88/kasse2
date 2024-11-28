import Database from 'better-sqlite3';
import path from 'path';

// Initialisiere die Datenbank
const db = new Database(path.join(__dirname, 'verkauefe.db'));

// Erstelle die Tabellen
db.exec(`
  CREATE TABLE IF NOT EXISTS verkauefe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    datum DATETIME DEFAULT CURRENT_TIMESTAMP,
    gesamtbetrag DECIMAL(10,2) NOT NULL,
    bezahlter_betrag DECIMAL(10,2) NOT NULL,
    rueckgeld DECIMAL(10,2) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS verkauf_artikel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verkauf_id INTEGER NOT NULL,
    artikel_name TEXT NOT NULL,
    preis DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (verkauf_id) REFERENCES verkauefe(id)
  );
`);

// Prepared Statements
const insertVerkauf = db.prepare(`
  INSERT INTO verkauefe (gesamtbetrag, bezahlter_betrag, rueckgeld)
  VALUES (?, ?, ?)
`);

const insertVerkaufArtikel = db.prepare(`
  INSERT INTO verkauf_artikel (verkauf_id, artikel_name, preis)
  VALUES (?, ?, ?)
`);

// Funktion zum Speichern eines Verkaufs
export interface VerkaufArtikel {
  name: string;
  preis: number;
}

export interface Verkauf {
  gesamtbetrag: number;
  bezahlterBetrag: number;
  rueckgeld: number;
  artikel: VerkaufArtikel[];
}

export const speichereVerkauf = (verkauf: Verkauf) => {
  // Transaktion starten
  const transaction = db.transaction((verkauf: Verkauf) => {
    // Verkauf speichern
    const verkaufInfo = insertVerkauf.run(
      verkauf.gesamtbetrag,
      verkauf.bezahlterBetrag,
      verkauf.rueckgeld
    );
    
    // Artikel des Verkaufs speichern
    for (const artikel of verkauf.artikel) {
      insertVerkaufArtikel.run(
        verkaufInfo.lastInsertRowid,
        artikel.name,
        artikel.preis
      );
    }
    
    return verkaufInfo.lastInsertRowid;
  });

  // Transaktion ausführen
  return transaction(verkauf);
};

// Funktion zum Abrufen aller Verkäufe eines Tages
export const getVerkaeufeFuerTag = (datum: Date) => {
  const startDatum = new Date(datum);
  startDatum.setHours(0, 0, 0, 0);
  
  const endDatum = new Date(datum);
  endDatum.setHours(23, 59, 59, 999);
  
  return db.prepare(`
    SELECT 
      v.id,
      v.datum,
      v.gesamtbetrag,
      v.bezahlter_betrag,
      v.rueckgeld,
      GROUP_CONCAT(va.artikel_name || ':' || va.preis) as artikel
    FROM verkauefe v
    LEFT JOIN verkauf_artikel va ON v.id = va.verkauf_id
    WHERE v.datum BETWEEN ? AND ?
    GROUP BY v.id
  `).all(startDatum.toISOString(), endDatum.toISOString());
};

export default db;
