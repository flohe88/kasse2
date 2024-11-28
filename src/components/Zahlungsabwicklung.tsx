import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { warenkorbLeeren } from '../store/warenkorbSlice';
import { formatCurrency } from '../utils/format';
import { speichereVerkauf } from '../services/verkaufService';
import NummerTastatur from './NummerTastatur';

const SCHNELLWAHL_BETRAEGE = [5, 10, 20, 25, 30, 50];

const Zahlungsabwicklung: React.FC = () => {
  const dispatch = useDispatch();
  const { artikel, gesamtbetrag } = useSelector((state: RootState) => state.warenkorb);
  const [gezahlterBetrag, setGezahlterBetrag] = useState<string>('');
  const [zeigeBezahlt, setZeigeBezahlt] = useState(false);
  const [zeigeNummerTastatur, setZeigeNummerTastatur] = useState(false);

  const gezahlterBetragNumeric = parseFloat(gezahlterBetrag.replace(',', '.')) || 0;
  const rueckgeld = Math.max(0, gezahlterBetragNumeric - gesamtbetrag);

  const handleBezahlung = () => {
    if (gezahlterBetragNumeric >= gesamtbetrag) {
      // Verkauf in der Datenbank speichern
      speichereVerkauf({
        gesamtbetrag,
        bezahlterBetrag: gezahlterBetragNumeric,
        rueckgeld,
        artikel: artikel.map(item => ({
          name: item.artikel.name,
          preis: item.artikel.preis * item.menge
        }))
      });

      setZeigeBezahlt(true);
      dispatch(warenkorbLeeren());
      setGezahlterBetrag('');
    }
  };

  const handleSchnellwahlBetrag = (betrag: number) => {
    setGezahlterBetrag(betrag.toString().replace('.', ','));
    setZeigeNummerTastatur(false);
  };

  if (zeigeBezahlt) {
    return (
      <div className="bg-green-100 p-4 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Bezahlung erfolgreich!</h2>
        <p className="text-green-700">Rückgeld: {formatCurrency(rueckgeld)}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Zahlungsabwicklung</h2>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {SCHNELLWAHL_BETRAEGE.map((betrag) => (
          <button
            key={betrag}
            className="bg-blue-100 hover:bg-blue-200 p-2 rounded"
            onClick={() => handleSchnellwahlBetrag(betrag)}
          >
            {formatCurrency(betrag)}
          </button>
        ))}
      </div>

      <div className="mb-4">
        {!zeigeNummerTastatur ? (
          <button
            className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left"
            onClick={() => setZeigeNummerTastatur(true)}
          >
            Manueller Betrag
          </button>
        ) : (
          <div className="border rounded-lg p-4">
            <NummerTastatur
              wert={gezahlterBetrag}
              onWertChange={setGezahlterBetrag}
              onBestaetigen={() => {
                if (gezahlterBetragNumeric >= gesamtbetrag) {
                  handleBezahlung();
                }
              }}
            />
            <button
              className="w-full mt-2 p-2 text-sm text-gray-600 hover:text-gray-800"
              onClick={() => setZeigeNummerTastatur(false)}
            >
              Nummerntastatur ausblenden
            </button>
          </div>
        )}
      </div>

      {gezahlterBetragNumeric > 0 && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div>
              <p className="font-medium">Gesamtbetrag:</p>
              <p className="font-medium">Gezahlt:</p>
              <p className="font-bold text-xl">Rückgeld:</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatCurrency(gesamtbetrag)}</p>
              <p className={`font-medium ${gezahlterBetragNumeric < gesamtbetrag ? 'text-red-600' : ''}`}>
                {formatCurrency(gezahlterBetragNumeric)}
              </p>
              <p className="font-bold text-xl text-green-600">{formatCurrency(rueckgeld)}</p>
            </div>
          </div>
        </div>
      )}

      <button
        className={`w-full p-3 rounded-lg ${
          gezahlterBetragNumeric >= gesamtbetrag
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-400 cursor-not-allowed'
        } text-white font-bold`}
        onClick={handleBezahlung}
        disabled={gezahlterBetragNumeric < gesamtbetrag}
      >
        Bezahlen
      </button>
    </div>
  );
};

export default Zahlungsabwicklung;
