import React, { useState } from 'react';
import { Artikel } from '../types';
import NummerTastatur from './NummerTastatur';

interface PreisDialogProps {
  artikel: Artikel;
  onPreisBestaetigt: (artikel: Artikel, preis: number) => void;
  onAbbrechen: () => void;
}

const PreisDialog: React.FC<PreisDialogProps> = ({ artikel, onPreisBestaetigt, onAbbrechen }) => {
  const [preis, setPreis] = useState<string>('');

  const handleBestaetigen = () => {
    const preisNumeric = parseFloat(preis.replace(',', '.'));
    if (!isNaN(preisNumeric) && preisNumeric >= 0) {
      onPreisBestaetigt(artikel, preisNumeric);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Preis eingeben für {artikel.name}</h2>
        
        <div className="mb-6">
          <NummerTastatur
            wert={preis}
            onWertChange={setPreis}
            onBestaetigen={handleBestaetigen}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onAbbrechen}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreisDialog;
