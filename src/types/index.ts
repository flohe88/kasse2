export interface Artikel {
  id: number;
  name: string;
  preis: number;
  erstellt_am: Date;
}

export interface VerkaufArtikel {
  name: string;
  preis: number;
  menge?: number;
}

export interface Verkauf {
  id?: number;
  datum?: string;
  gesamtbetrag: number;
  bezahlterBetrag: number;
  rueckgeld: number;
  artikel: VerkaufArtikel[];
}

export interface WarenkorbArtikel {
  artikel: Artikel;
  menge: number;
}
