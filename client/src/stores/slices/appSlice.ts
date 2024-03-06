import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface AppState {
  page: string;
  openDrawer: boolean;
}

const initialState: AppState = {
  page: 'home',
  openDrawer: false
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<string>) => {
      state.page = action.payload;
    },
    setOpenDrawer: (state, action: PayloadAction<boolean>) => {
      state.openDrawer = action.payload;
    }
  }
});

export const { setPage, setOpenDrawer } = appSlice.actions;

export default appSlice.reducer;
