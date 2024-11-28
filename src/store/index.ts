import { configureStore } from '@reduxjs/toolkit';
import warenkorbReducer from './warenkorbSlice';
import artikelReducer from './artikelSlice';

export const store = configureStore({
  reducer: {
    warenkorb: warenkorbReducer,
    artikel: artikelReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
