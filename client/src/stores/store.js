import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import dashboardReducer from './slices/dashboardSlice';
import mapReducer from './slices/mapSlice';
import graphReducer from './slices/graphSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    dashboard: dashboardReducer,
    map: mapReducer,
    graph: graphReducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
    });
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
