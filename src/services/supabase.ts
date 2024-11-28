import { createClient } from '@supabase/supabase-js';

// WICHTIG: Ersetzen Sie diese Werte mit Ihren eigenen Supabase-Projekt-Credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Typen für Datenbank-Tabellen
export interface VerkaufEntry {
  id?: number;
  datum: string;
  gesamtbetrag: number;
  bezahlterBetrag: number;
  rueckgeld: number;
  artikel: VerkaufArtikel[];
}

export interface VerkaufArtikel {
  id?: number;
  verkauf_id?: number;
  artikel_name: string;
  preis: number;
  menge: number;
}
