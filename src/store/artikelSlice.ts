import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Artikel } from '../types';

interface ArtikelState {
  liste: Artikel[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ArtikelState = {
  liste: [
    {
      id: 1,
      name: 'Mode',
      preis: 0,
      erstellt_am: new Date(),
    },
    {
      id: 2,
      name: 'Deko',
      preis: 0,
      erstellt_am: new Date(),
    },
    {
      id: 3,
      name: 'Accessoires',
      preis: 0,
      erstellt_am: new Date(),
    },
  ],
  isLoading: false,
  error: null,
};

const artikelSlice = createSlice({
  name: 'artikel',
  initialState,
  reducers: {
    artikelHinzufuegen: (state, action: PayloadAction<Artikel>) => {
      state.liste.push(action.payload);
    },
    artikelAktualisieren: (state, action: PayloadAction<Artikel>) => {
      const index = state.liste.findIndex(artikel => artikel.id === action.payload.id);
      if (index !== -1) {
        state.liste[index] = action.payload;
      }
    },
    artikelLoeschen: (state, action: PayloadAction<number>) => {
      state.liste = state.liste.filter(artikel => artikel.id !== action.payload);
    },
  },
});

export const { artikelHinzufuegen, artikelAktualisieren, artikelLoeschen } = artikelSlice.actions;
export default artikelSlice.reducer;
