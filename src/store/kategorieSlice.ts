import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Kategorie } from '../types';

interface KategorieState {
  liste: Kategorie[];
  isLoading: boolean;
  error: string | null;
}

const initialState: KategorieState = {
  liste: [
    {
      id: 1,
      name: 'Mode',
    },
    {
      id: 2,
      name: 'Deko',
    },
    {
      id: 3,
      name: 'Accessoires',
    },
  ],
  isLoading: false,
  error: null,
};

const kategorieSlice = createSlice({
  name: 'kategorien',
  initialState,
  reducers: {
    kategorieHinzufuegen: (state, action: PayloadAction<Kategorie>) => {
      state.liste.push(action.payload);
    },
    kategorieAktualisieren: (state, action: PayloadAction<Kategorie>) => {
      const index = state.liste.findIndex(kategorie => kategorie.id === action.payload.id);
      if (index !== -1) {
        state.liste[index] = action.payload;
      }
    },
    kategorieLoeschen: (state, action: PayloadAction<number>) => {
      state.liste = state.liste.filter(kategorie => kategorie.id !== action.payload);
    },
  },
});

export const { kategorieHinzufuegen, kategorieAktualisieren, kategorieLoeschen } = kategorieSlice.actions;
export default kategorieSlice.reducer;
