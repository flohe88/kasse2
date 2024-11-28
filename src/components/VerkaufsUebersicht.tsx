import React, { useState, useEffect } from 'react';
import { getVerkaeufeFuerTag, exportiereVerkaefeAlsCSV, loescheArtikelAusVerkauf } from '../services/verkaufService';
import { formatCurrency } from '../utils/format';

interface Verkauf {
  id: number;
  datum: string;
  gesamtbetrag: number;
  bezahlterBetrag: number;
  rueckgeld: number;
  artikel: VerkaufArtikel[];
}

interface VerkaufArtikel {
  name: string;
  preis: number;
}

const VerkaufsUebersicht: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [verkauefe, setVerkauefe] = useState<Verkauf[]>([]);
  const [tagesumsatz, setTagesumsatz] = useState(0);

  const loadVerkauefe = () => {
    const result = getVerkaeufeFuerTag(new Date(selectedDate));
    setVerkauefe(result);
    setTagesumsatz(result.reduce((sum, v) => sum + v.gesamtbetrag, 0));
  };

  useEffect(() => {
    loadVerkauefe();
  }, [selectedDate]);

  const handleExport = () => {
    // Datum für den Export (ganzer Tag)
    const startDatum = new Date(selectedDate);
    startDatum.setHours(0, 0, 0, 0);
    
    const endDatum = new Date(selectedDate);
    endDatum.setHours(23, 59, 59, 999);

    const csvContent = exportiereVerkaefeAlsCSV(startDatum, endDatum);
    
    // CSV-Datei erstellen und herunterladen
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `verkauefe_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteArtikel = (verkaufId: number, artikelName: string) => {
    if (window.confirm(`Möchten Sie den Artikel '${artikelName}' wirklich löschen?`)) {
      loescheArtikelAusVerkauf(verkaufId, artikelName);
      loadVerkauefe(); // Liste neu laden
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Verkaufsübersicht</h2>
        <div className="flex gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded p-2"
          />
          <button
            onClick={handleExport}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Export
          </button>
        </div>
      </div>

      <div className="mb-6 bg-green-100 p-4 rounded-lg">
        <h3 className="text-xl font-semibold text-green-800">Tagesumsatz</h3>
        <p className="text-3xl font-bold text-green-600">{formatCurrency(tagesumsatz)}</p>
      </div>

      <div className="space-y-4">
        {verkauefe.map((verkauf) => (
          <div key={verkauf.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-500">
                  {new Date(verkauf.datum).toLocaleTimeString()}
                </p>
                <p className="font-semibold text-lg">
                  Gesamtbetrag: {formatCurrency(verkauf.gesamtbetrag)}
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <div className="text-right">
                  <p className="text-sm">
                    Bezahlt: {formatCurrency(verkauf.bezahlterBetrag)}
                  </p>
                  <p className="text-sm text-green-600">
                    Rückgeld: {formatCurrency(verkauf.rueckgeld)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <p className="text-sm font-semibold mb-2">Gekaufte Artikel:</p>
              <div className="space-y-1">
                {verkauf.artikel.map((artikel, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{artikel.name}</span>
                    <span>{formatCurrency(artikel.preis)}</span>
                    <button
                      onClick={() => handleDeleteArtikel(verkauf.id, artikel.name)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                      title="Artikel löschen"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {verkauefe.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Keine Verkäufe an diesem Tag
        </div>
      )}
    </div>
  );
};

export default VerkaufsUebersicht;
