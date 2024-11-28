export interface Artikel {
  id: number;
  name: string;
  preis: number;
  erstellt_am: Date;
}

export interface Verkauf {
  id: number;
  artikel: {artikelId: number, menge: number, preis: number}[];
  gesamtbetrag: number;
  zahlungsmethode: string;
  gezahlter_betrag: number;
  rueckgeld: number;
  zeitstempel: Date;
}

export interface WarenkorbArtikel {
  artikel: Artikel;
  menge: number;
}
