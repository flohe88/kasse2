import React from 'react';

interface NummerTastaturProps {
  wert: string;
  onWertChange: (wert: string) => void;
  onBestaetigen: () => void;
  waehrungsSymbol?: string;
}

const NummerTastatur: React.FC<NummerTastaturProps> = ({
  wert,
  onWertChange,
  onBestaetigen,
  waehrungsSymbol = '€'
}) => {
  const handleZifferClick = (ziffer: string) => {
    if (ziffer === 'C') {
      onWertChange('');
    } else if (ziffer === '←') {
      onWertChange(wert.slice(0, -1));
    } else if (ziffer === ',') {
      if (!wert.includes(',')) {
        onWertChange(wert + ziffer);
      }
    } else {
      // Verhindere mehr als zwei Nachkommastellen
      const [vorKomma, nachKomma] = wert.split(',');
      if (nachKomma && nachKomma.length >= 2) {
        return;
      }
      onWertChange(wert + ziffer);
    }
  };

  const ziffern = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['C', '0', ','],
  ];

  return (
    <div className="w-full">
      <div className="bg-gray-100 p-4 rounded-lg text-right text-2xl font-bold mb-2">
        {wert || '0,00'} {waehrungsSymbol}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {/* Ziffernblock */}
        <div className="col-span-3 grid grid-cols-3 gap-2">
          {ziffern.map((reihe, reihenIndex) => (
            <React.Fragment key={reihenIndex}>
              {reihe.map((ziffer) => (
                <button
                  key={ziffer}
                  type="button"
                  className={`p-4 text-xl font-bold rounded-lg ${
                    ziffer === 'C' 
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  onClick={() => handleZifferClick(ziffer)}
                >
                  {ziffer}
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* Rechte Spalte */}
        <div className="grid grid-rows-2 gap-2">
          <button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 p-4 text-xl font-bold rounded-lg"
            onClick={() => handleZifferClick('←')}
          >
            ←
          </button>
          <button
            type="button"
            className={`row-span-3 bg-blue-600 hover:bg-blue-700 text-white p-4 text-xl font-bold rounded-lg ${
              !wert ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={onBestaetigen}
            disabled={!wert}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default NummerTastatur;
