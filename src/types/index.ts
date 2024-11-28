export interface Artikel {
  id: number;
  name: string;
  preis: number;
  kategorie?: Kategorie;
  erstellt_am: string;
}

export interface VerkaufArtikel {
  artikel_name: string;
  preis: number;
  menge?: number;
}

export interface Verkauf {
  id: number;
  datum: string;
  gesamtbetrag: number;
  bezahlter_betrag: number;
  rueckgeld: number;
  artikel: VerkaufArtikel[];
}

export interface WarenkorbArtikel {
  artikel: Artikel;
  menge: number;
}

export interface Kategorie {
  id: number;
  name: string;
  erstellt_am: string;
}
