export interface VerkaufArtikel {
  name: string;
  preis: number;
  menge?: number;
}

export interface Verkauf {
  gesamtbetrag: number;
  bezahlterBetrag: number;
  rueckgeld: number;
  artikel: VerkaufArtikel[];
  id?: number;
  datum?: string;
}

// Simulierte Datenbank-Speicherung im localStorage
const VERKAUEFE_KEY = 'verkauefe';

export const speichereVerkauf = (verkauf: Verkauf) => {
  const verkauefe = getVerkauefe();
  const neuerVerkauf = {
    ...verkauf,
    id: Date.now(),
    datum: new Date().toISOString()
  };
  verkauefe.push(neuerVerkauf);
  localStorage.setItem(VERKAUEFE_KEY, JSON.stringify(verkauefe));
  return neuerVerkauf;
};

export const getVerkaeufeFuerTag = (datum: Date): Verkauf[] => {
  const verkauefe = getVerkauefe();
  
  // Filtern nach Datum
  const gefilterteVerkauefe = verkauefe.filter(verkauf => {
    const verkaufDatum = new Date(verkauf.datum);
    return verkaufDatum.toDateString() === datum.toDateString();
  });

  // Sortieren von neu nach alt
  return gefilterteVerkauefe.sort((a, b) => {
    const datumA = new Date(a.datum).getTime();
    const datumB = new Date(b.datum).getTime();
    return datumB - datumA; // Absteigend (neueste zuerst)
  });
};

export const getAlleVerkauefe = () => {
  return getVerkauefe();
};

export const exportiereVerkaefeAlsCSV = (startDatum: Date, endDatum: Date): string => {
  // CSV Header
  let csvContent = 'Datum,Uhrzeit,Artikelname,Preis,Menge,Gesamtbetrag\n';

  // Alle Verkäufe aus dem localStorage holen
  const alleVerkauefe = getAlleVerkauefe();

  // Verkäufe nach Datum filtern
  const gefilterteVerkauefe = alleVerkauefe.filter(verkauf => {
    const verkaufDatum = new Date(verkauf.datum);
    return verkaufDatum >= startDatum && verkaufDatum <= endDatum;
  });

  // Verkäufe in CSV Format umwandeln
  gefilterteVerkauefe.forEach(verkauf => {
    const datum = new Date(verkauf.datum);
    const datumFormatiert = datum.toLocaleDateString();
    const uhrzeitFormatiert = datum.toLocaleTimeString();

    // Für jeden Artikel im Verkauf eine Zeile erstellen
    verkauf.artikel.forEach(artikel => {
      const zeile = [
        datumFormatiert,
        uhrzeitFormatiert,
        artikel.name.replace(/,/g, ';'), // Kommas durch Semikolons ersetzen
        artikel.preis.toFixed(2),
        artikel.menge || 1,
        (artikel.preis * (artikel.menge || 1)).toFixed(2)
      ].join(',');
      csvContent += zeile + '\n';
    });
  });

  return csvContent;
};

export const loescheArtikelAusVerkauf = (verkaufId: number, artikelName: string): void => {
  const verkauefe = getVerkauefe();
  const aktualisierteVerkauefe = verkauefe.map(verkauf => {
    if (verkauf.id === verkaufId) {
      // Artikel filtern und Gesamtbetrag neu berechnen
      const neueArtikel = verkauf.artikel.filter(artikel => artikel.name !== artikelName);
      const neuerGesamtbetrag = neueArtikel.reduce((sum, artikel) => sum + artikel.preis, 0);
      
      return {
        ...verkauf,
        artikel: neueArtikel,
        gesamtbetrag: neuerGesamtbetrag
      };
    }
    return verkauf;
  });

  // Entferne Verkäufe ohne Artikel
  const bereinigteListe = aktualisierteVerkauefe.filter(verkauf => verkauf.artikel.length > 0);
  
  localStorage.setItem(VERKAUEFE_KEY, JSON.stringify(bereinigteListe));
};

const getVerkauefe = (): Verkauf[] => {
  const verkauefe = localStorage.getItem(VERKAUEFE_KEY);
  return verkauefe ? JSON.parse(verkauefe) : [];
};
