import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { mengeAendern, warenkorbLeeren } from '../store/warenkorbSlice';
import { formatCurrency } from '../utils/format';

const Warenkorb: React.FC = () => {
  const dispatch = useDispatch();
  const { artikel, gesamtbetrag } = useSelector((state: RootState) => state.warenkorb);

  const handleMengeAendern = (artikelId: number, menge: number) => {
    dispatch(mengeAendern({ artikelId, menge }));
  };

  const handleWarenkorbLeeren = () => {
    dispatch(warenkorbLeeren());
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Warenkorb</h2>
        <button
          onClick={handleWarenkorbLeeren}
          className="text-red-600 hover:text-red-800"
        >
          Leeren
        </button>
      </div>

      {artikel.length === 0 ? (
        <p className="text-gray-500">Der Warenkorb ist leer</p>
      ) : (
        <>
          <div className="space-y-4">
            {artikel.map((item) => (
              <div
                key={item.artikel.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium">{item.artikel.name}</p>
                  <p className="text-gray-600">
                    {formatCurrency(item.artikel.preis)} pro Stück
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleMengeAendern(item.artikel.id, item.menge - 1)}
                    className="bg-gray-200 px-2 py-1 rounded"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.menge}</span>
                  <button
                    onClick={() => handleMengeAendern(item.artikel.id, item.menge + 1)}
                    className="bg-gray-200 px-2 py-1 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Gesamt:</span>
              <span>{formatCurrency(gesamtbetrag)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Warenkorb;
