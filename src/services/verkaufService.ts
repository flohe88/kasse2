import { supabase } from './supabase';
import { Verkauf, VerkaufArtikel } from '../types';

const VERKAUEFE_KEY = 'verkaufe';

// Hilfsfunktion zum Formatieren von Zahlen
const formatNumber = (num: number): string => {
  return Number(num).toFixed(2);
};

export const speichereVerkauf = async (verkauf: Verkauf): Promise<Verkauf> => {
  try {
    const supabaseVerkauf = {
      datum: new Date().toISOString(),
      gesamtbetrag: formatNumber(verkauf.gesamtbetrag || 0),
      bezahlter_betrag: formatNumber(verkauf.bezahlterBetrag || verkauf.bezahlter_betrag || 0),
      rueckgeld: formatNumber(verkauf.rueckgeld || 0),
      artikel: JSON.stringify(verkauf.artikel.map(artikel => ({
        artikel_name: artikel.artikel_name,
        preis: formatNumber(artikel.preis || 0),
        menge: artikel.menge || 1
      })))
    };

    console.log('Zu speichernder Verkauf:', supabaseVerkauf);

    const { data, error } = await supabase
      .from('verkaufe')
      .insert([supabaseVerkauf])
      .select()
      .single();

    if (error) {
      console.error('Supabase Fehler:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Keine Daten nach dem Insert erhalten');
    }

    // Zusätzlich Artikel in verkauf_artikel speichern
    const artikelEintraege = verkauf.artikel.map(artikel => ({
      verkauf_id: data.id,
      artikel_name: artikel.artikel_name,
      preis: formatNumber(artikel.preis || 0),
      menge: artikel.menge || 1
    }));

    const { error: artikelError } = await supabase
      .from('verkauf_artikel')
      .insert(artikelEintraege);

    if (artikelError) {
      console.error('Fehler beim Speichern der Artikel:', artikelError);
      throw artikelError;
    }

    const neuerVerkauf = {
      ...verkauf,
      id: data.id,
      datum: data.datum
    };

    // Lokale Speicherung aktualisieren
    const verkauefe = getVerkauefe();
    verkauefe.push(neuerVerkauf);
    localStorage.setItem(VERKAUEFE_KEY, JSON.stringify(verkauefe));

    return neuerVerkauf;
  } catch (error) {
    console.error('Vollständiger Fehler:', error);
    throw error;
  }
};

export const getVerkauefe = (): Verkauf[] => {
  try {
    const verkauefe = localStorage.getItem(VERKAUEFE_KEY);
    return verkauefe ? JSON.parse(verkauefe) : [];
  } catch (error) {
    console.error('Fehler beim Laden der Verkäufe:', error);
    return [];
  }
};

export const getVerkaeufeFuerTag = async (datum: Date): Promise<Verkauf[]> => {
  try {
    console.log('Lade Verkäufe für Datum:', datum);
    const startDatum = new Date(datum);
    startDatum.setHours(0, 0, 0, 0);
    
    const endDatum = new Date(datum);
    endDatum.setHours(23, 59, 59, 999);

    const { data: verkauefe, error } = await supabase
      .from('verkaufe')
      .select('*')
      .gte('datum', startDatum.toISOString())
      .lte('datum', endDatum.toISOString())
      .order('datum', { ascending: true });

    if (error) {
      console.error('Fehler beim Abrufen der Verkäufe:', error);
      throw error;
    }

    if (!verkauefe) {
      console.log('Keine Verkäufe gefunden');
      return [];
    }

    console.log('Rohdaten von Supabase:', verkauefe);

    // Konvertiere die Verkäufe
    const konvertierteVerkauefe = verkauefe.map(verkauf => {
      try {
        // Prüfe ob artikel bereits ein Array ist
        let artikelArray;
        if (Array.isArray(verkauf.artikel)) {
          artikelArray = verkauf.artikel;
        } else {
          try {
            artikelArray = JSON.parse(verkauf.artikel || '[]');
          } catch (e) {
            console.error('Fehler beim Parsen der Artikel für Verkauf', verkauf.id, ':', e);
            artikelArray = [];
          }
        }
        
        console.log(`Geparste Artikel für Verkauf ${verkauf.id} :`, artikelArray);

        return {
          ...verkauf,
          artikel: artikelArray,
          gesamtbetrag: Number(verkauf.gesamtbetrag || 0),
          bezahlter_betrag: Number(verkauf.bezahlter_betrag || 0)
        };
      } catch (e) {
        console.error('Fehler bei der Konvertierung des Verkaufs', verkauf.id, ':', e);
        return null;
      }
    }).filter(Boolean); // Entferne null-Werte

    console.log('Konvertierte Verkäufe:', konvertierteVerkauefe);
    return konvertierteVerkauefe;
  } catch (error) {
    console.error('Fehler beim Laden der Verkäufe:', error);
    throw error;
  }
};

export const loescheVerkauf = async (verkaufId: number): Promise<void> => {
  try {
    // Zuerst alle zugehörigen Artikel aus der verkauf_artikel Tabelle löschen
    const { error: deleteArtikelError } = await supabase
      .from('verkauf_artikel')
      .delete()
      .eq('verkauf_id', verkaufId);

    if (deleteArtikelError) {
      console.error('Fehler beim Löschen der Verkaufsartikel:', deleteArtikelError);
      throw new Error('Fehler beim Löschen der Verkaufsartikel: ' + deleteArtikelError.message);
    }

    // Dann den Verkauf selbst löschen
    const { error: deleteVerkaufError } = await supabase
      .from('verkaufe')
      .delete()
      .eq('id', verkaufId);

    if (deleteVerkaufError) {
      console.error('Fehler beim Löschen des Verkaufs:', deleteVerkaufError);
      throw new Error('Fehler beim Löschen des Verkaufs: ' + deleteVerkaufError.message);
    }

    console.log('Verkauf und zugehörige Artikel erfolgreich gelöscht');
  } catch (error) {
    console.error('Fehler beim Löschen des Verkaufs:', error);
    throw error;
  }
};

export const loescheArtikelAusVerkauf = async (verkaufId: number, artikelName: string): Promise<void> => {
  try {
    // Artikel aus der verkauf_artikel Tabelle löschen
    const { error: deleteArtikelError } = await supabase
      .from('verkauf_artikel')
      .delete()
      .eq('verkauf_id', verkaufId)
      .eq('artikel_name', artikelName);

    if (deleteArtikelError) {
      console.error('Fehler beim Löschen des Artikels:', deleteArtikelError);
      throw new Error('Fehler beim Löschen des Artikels: ' + deleteArtikelError.message);
    }

    // Gesamtbetrag des Verkaufs aktualisieren
    const { data: verbleibende_artikel, error: artikelError } = await supabase
      .from('verkauf_artikel')
      .select('preis, menge')
      .eq('verkauf_id', verkaufId);

    if (artikelError) {
      console.error('Fehler beim Laden der verbleibenden Artikel:', artikelError);
      throw new Error('Fehler beim Laden der verbleibenden Artikel: ' + artikelError.message);
    }

    // Neuen Gesamtbetrag berechnen
    const neuerGesamtbetrag = verbleibende_artikel.reduce((sum, artikel) => {
      return sum + (Number(artikel.preis) * (artikel.menge || 1));
    }, 0);

    // Verkauf mit neuem Gesamtbetrag aktualisieren
    const { error: updateError } = await supabase
      .from('verkaufe')
      .update({ gesamtbetrag: formatNumber(neuerGesamtbetrag) })
      .eq('id', verkaufId);

    if (updateError) {
      console.error('Fehler beim Aktualisieren des Gesamtbetrags:', updateError);
      throw new Error('Fehler beim Aktualisieren des Gesamtbetrags: ' + updateError.message);
    }

    console.log('Artikel erfolgreich gelöscht und Gesamtbetrag aktualisiert');
  } catch (error) {
    console.error('Fehler beim Löschen des Artikels:', error);
    throw error;
  }
};

export const exportiereVerkaefeAlsCSV = async (startDatum: Date, endDatum: Date): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('verkaufe')
      .select('*')
      .gte('datum', startDatum.toISOString())
      .lte('datum', endDatum.toISOString());

    if (error) throw error;

    const csvHeader = 'Datum,Uhrzeit,Artikelname,Preis,Menge,Gesamtbetrag\n';
    const csvRows = data.flatMap(verkauf => {
      const datum = new Date(verkauf.datum);
      const datumFormatiert = datum.toLocaleDateString('de-DE');
      const uhrzeitFormatiert = datum.toLocaleTimeString('de-DE');

      return JSON.parse(verkauf.artikel).map(artikel => {
        const menge = artikel.menge || 1;
        const einzelpreis = Number(artikel.preis);
        const gesamtpreis = einzelpreis * menge;
        
        return [
          datumFormatiert,
          uhrzeitFormatiert,
          artikel.artikel_name.replace(/,/g, ';'),
          formatNumber(einzelpreis),
          menge,
          formatNumber(gesamtpreis)
        ].join(',');
      });
    }).join('\n');

    return csvHeader + csvRows;
  } catch (error) {
    console.error('Fehler beim Exportieren:', error);
    return '';
  }
};