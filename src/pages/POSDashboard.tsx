import React from 'react';
import ArtikelUebersicht from '../components/ArtikelUebersicht';
import Warenkorb from '../components/Warenkorb';
import Zahlungsabwicklung from '../components/Zahlungsabwicklung';

const POSDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <h1 className="text-2xl font-bold text-gray-900">Kassen System</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Linke Spalte - Artikelübersicht */}
          <div className="lg:col-span-2">
            <ArtikelUebersicht />
          </div>

          {/* Rechte Spalte - Warenkorb und Zahlungsabwicklung */}
          <div className="space-y-6">
            <Warenkorb />
            <Zahlungsabwicklung />
          </div>
        </div>
      </main>
    </div>
  );
};

export default POSDashboard;
