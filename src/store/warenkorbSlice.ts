import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Artikel, WarenkorbArtikel } from '../types';

interface WarenkorbState {
  artikel: WarenkorbArtikel[];
  gesamtbetrag: number;
  bezahlungAbgeschlossen: boolean;
}

const initialState: WarenkorbState = {
  artikel: [],
  gesamtbetrag: 0,
  bezahlungAbgeschlossen: false,
};

const warenkorbSlice = createSlice({
  name: 'warenkorb',
  initialState,
  reducers: {
    artikelHinzufuegen: (state, action: PayloadAction<Artikel>) => {
      // Konvertiere das Date-Objekt in einen String
      const artikelMitString = {
        ...action.payload,
        erstellt_am: action.payload.erstellt_am.toISOString()
      };
      
      const vorhandenerArtikel = state.artikel.find(
        (item) => item.artikel.id === artikelMitString.id
      );

      if (vorhandenerArtikel) {
        vorhandenerArtikel.menge += 1;
      } else {
        state.artikel.push({
          artikel: artikelMitString,
          menge: 1,
        });
      }

      state.gesamtbetrag = state.artikel.reduce(
        (sum, item) => sum + item.artikel.preis * item.menge,
        0
      );
      state.bezahlungAbgeschlossen = false;
    },
    mengeAendern: (state, action: PayloadAction<{ artikelId: number; menge: number }>) => {
      const artikel = state.artikel.find(
        (item) => item.artikel.id === action.payload.artikelId
      );
      if (artikel) {
        artikel.menge = action.payload.menge;
        if (artikel.menge <= 0) {
          state.artikel = state.artikel.filter(
            (item) => item.artikel.id !== action.payload.artikelId
          );
        }
        state.gesamtbetrag = state.artikel.reduce(
          (sum, item) => sum + item.artikel.preis * item.menge,
          0
        );
      }
    },
    warenkorbLeeren: (state) => {
      state.artikel = [];
      state.gesamtbetrag = 0;
      state.bezahlungAbgeschlossen = false;
    },
    setBezahlungAbgeschlossen: (state, action: PayloadAction<boolean>) => {
      state.bezahlungAbgeschlossen = action.payload;
    },
  },
});

export const { artikelHinzufuegen, mengeAendern, warenkorbLeeren, setBezahlungAbgeschlossen } = warenkorbSlice.actions;

export default warenkorbSlice.reducer;
