import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface AppState {
  openDrawer: boolean;
}

const initialState: AppState = {
  openDrawer: false,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOpenDrawer: (state, action: PayloadAction<boolean>) => {
      state.openDrawer = action.payload;
    },
  },
});

export const { setOpenDrawer } = appSlice.actions;

export default appSlice.reducer;
