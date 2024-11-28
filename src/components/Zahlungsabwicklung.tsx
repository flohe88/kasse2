import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { speichereVerkauf } from '../services/verkaufService';
import { Verkauf } from '../types';
import { formatCurrency } from '../utils/format';
import NummerTastatur from './NummerTastatur';

const Zahlungsabwicklung: React.FC = () => {
  const dispatch = useDispatch();
  const artikelListe = useSelector((state: RootState) => state.artikel.liste);
  const [ausgewaehlteArtikel, setAusgewaehlteArtikel] = useState<{artikel_name: string, preis: number, menge: number}[]>([]);
  const [bezahlterBetrag, setBezahlterBetrag] = useState(0);

  const gesamtbetrag = ausgewaehlteArtikel.reduce((sum, artikel) => 
    sum + (artikel.preis * (artikel.menge || 1)), 0);
  const rueckgeld = Math.max(bezahlterBetrag - gesamtbetrag, 0);

  const handleArtikelHinzufuegen = (artikel: {artikel_name: string, preis: number}) => {
    const existingArtikel = ausgewaehlteArtikel.find(a => a.artikel_name === artikel.artikel_name);
    if (existingArtikel) {
      setAusgewaehlteArtikel(prev => 
        prev.map(a => 
          a.artikel_name === artikel.artikel_name 
            ? {...a, menge: (a.menge || 1) + 1} 
            : a
        )
      );
    } else {
      setAusgewaehlteArtikel(prev => [...prev, {...artikel, menge: 1}]);
    }
  };

  const handleVerkaufAbschliessen = async () => {
    if (ausgewaehlteArtikel.length === 0) {
      alert('Bitte wählen Sie mindestens einen Artikel aus.');
      return;
    }

    if (bezahlterBetrag < gesamtbetrag) {
      alert('Der bezahlte Betrag ist zu niedrig.');
      return;
    }

    const verkaufDaten: Verkauf = {
      id: Date.now(), // Temporäre ID, sollte durch Backend ersetzt werden
      datum: new Date().toISOString(),
      gesamtbetrag: gesamtbetrag,
      bezahlter_betrag: bezahlterBetrag,
      rueckgeld: rueckgeld,
      artikel: ausgewaehlteArtikel.map(a => ({
        id: Date.now(), // Temporäre ID
        artikel_name: a.artikel_name,
        preis: a.preis,
        menge: a.menge || 1
      }))
    };

    try {
      await speichereVerkauf(verkaufDaten);
      // Reset nach erfolgreichem Verkauf
      setAusgewaehlteArtikel([]);
      setBezahlterBetrag(0);
      alert('Verkauf erfolgreich abgeschlossen!');
    } catch (error) {
      console.error('Fehler beim Speichern des Verkaufs:', error);
      alert('Fehler beim Abschließen des Verkaufs');
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold mb-4">Artikel</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {artikelListe.map((artikel) => (
            <button
              key={artikel.id}
              onClick={() => handleArtikelHinzufuegen({
                artikel_name: artikel.name, 
                preis: artikel.preis
              })}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              {artikel.name} <br />
              {formatCurrency(artikel.preis)}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold mb-4">Warenkorb</h2>
        <div className="border p-4 rounded">
          {ausgewaehlteArtikel.map((artikel, index) => (
            <div key={index} className="flex justify-between mb-2">
              <span>{artikel.artikel_name}</span>
              <div>
                <span className="mr-2">{artikel.menge}x</span>
                {formatCurrency(artikel.preis * artikel.menge)}
              </div>
            </div>
          ))}
          <hr className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Gesamtbetrag:</span>
            <span>{formatCurrency(gesamtbetrag)}</span>
          </div>
        </div>

        <div className="mt-4">
          <NummerTastatur 
            onNumberInput={(num) => setBezahlterBetrag(num)}
            betrag={bezahlterBetrag}
          />
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div>
            <span className="mr-2">Bezahlt:</span>
            <span className="font-bold">{formatCurrency(bezahlterBetrag)}</span>
          </div>
          <div>
            <span className="mr-2">Rückgeld:</span>
            <span className="font-bold text-green-600">{formatCurrency(rueckgeld)}</span>
          </div>
        </div>

        <button 
          onClick={handleVerkaufAbschliessen}
          className="w-full mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Verkauf abschließen
        </button>
      </div>
    </div>
  );
};

export default Zahlungsabwicklung;
