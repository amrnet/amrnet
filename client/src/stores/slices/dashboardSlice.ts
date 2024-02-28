import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface GlobalOverviewModel {
  italicLabel: string;
  label: string;
  fullLabel: string
}

interface DashboardState {
  canGetData: boolean;
  globalOverviewLabel: GlobalOverviewModel;
  organism: string;
  loadingData: boolean;
  actualCountry: string;
  totalGenomes: number;
  totalGenotypes: number;
  actualGenomes: number;
  actualGenotypes: number;
  timeInitial: number | string;
  timeFinal: number | string;
  actualTimeInitial: number | string;
  actualTimeFinal: number | string;
  years: Array<number>;
  genotypesForFilter: Array<string>;
  colorPallete: Object;
  listPMID: Array<string>;
  PMID: Array<string>;
  captureDRT: boolean;
  captureRFWG: boolean;
  captureRDWG: boolean;
  captureGD: boolean;
}

const initialState: DashboardState = {
  canGetData: true,
  globalOverviewLabel: { italicLabel: 'Salmonella', label: 'Typhi', fullLabel: 'Salmonella Typhi' },
  organism: 'styphi',
  loadingData: false,
  actualCountry: 'All',
  totalGenotypes: 0,
  totalGenomes: 0,
  actualGenomes: 0,
  actualGenotypes: 0,
  timeInitial: 0,
  timeFinal: 0,
  actualTimeInitial: '',
  actualTimeFinal: '',
  years: [],
  genotypesForFilter: [],
  colorPallete: {},
  listPMID: [],
  PMID: [],
  captureDRT: true,
  captureRFWG: true,
  captureRDWG: true,
  captureGD: true,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setCanGetData: (state, action: PayloadAction<boolean>) => {
      state.canGetData = action.payload;
    },
    setGlobalOverviewLabel: (state, action: PayloadAction<GlobalOverviewModel>) => {
      state.globalOverviewLabel = action.payload;
    },
    setOrganism: (state, action: PayloadAction<string>) => {
      state.organism = action.payload;
    },
    setLoadingData: (state, action: PayloadAction<boolean>) => {
      state.loadingData = action.payload;
    },
    setActualCountry: (state, action: PayloadAction<string>) => {
      state.actualCountry = action.payload;
    },
    setTotalGenotypes: (state, action: PayloadAction<number>) => {
      state.totalGenotypes = action.payload;
    },
    setTotalGenomes: (state, action: PayloadAction<number>) => {
      state.totalGenomes = action.payload;
    },
    setActualGenomes: (state, action: PayloadAction<number>) => {
      state.actualGenomes = action.payload;
    },
    setActualGenotypes: (state, action: PayloadAction<number>) => {
      state.actualGenotypes = action.payload;
    },
    setTimeInitial: (state, action: PayloadAction<number>) => {
      state.timeInitial = action.payload;
    },
    setTimeFinal: (state, action: PayloadAction<number>) => {
      state.timeFinal = action.payload;
    },
    setActualTimeInitial: (state, action: PayloadAction<number>) => {
      state.actualTimeInitial = action.payload;
    },
    setActualTimeFinal: (state, action: PayloadAction<number>) => {
      state.actualTimeFinal = action.payload;
    },
    setYears: (state, action: PayloadAction<Array<number>>) => {
      state.years = action.payload;
    },
    setGenotypesForFilter: (state, action: PayloadAction<Array<string>>) => {
      state.genotypesForFilter = action.payload;
    },
    setColorPallete: (state, action: PayloadAction<Object>) => {
      state.colorPallete = action.payload;
    },
    setListPMID: (state, action: PayloadAction<Array<string>>) => {
      state.listPMID = action.payload;
    },
    setPMID: (state, action: PayloadAction<Array<string>>) => {
      state.PMID = action.payload;
    },
    setCaptureDRT: (state, action: PayloadAction<boolean>) => {
      state.captureDRT = action.payload;
    },
    setCaptureRFWG: (state, action: PayloadAction<boolean>) => {
      state.captureRFWG = action.payload;
    },
    setCaptureRDWG: (state, action: PayloadAction<boolean>) => {
      state.captureRDWG = action.payload;
    },
    setCaptureGD: (state, action: PayloadAction<boolean>) => {
      state.captureGD = action.payload;
    },
  }
});

export const {
  setCanGetData,
  setGlobalOverviewLabel,
  setOrganism,
  setLoadingData,
  setActualCountry,
  setTotalGenotypes,
  setTotalGenomes,
  setActualGenomes,
  setActualGenotypes,
  setTimeInitial,
  setTimeFinal,
  setActualTimeInitial,
  setActualTimeFinal,
  setYears,
  setGenotypesForFilter,
  setColorPallete,
  setListPMID,
  setPMID,
  setCaptureDRT,
  setCaptureRFWG,
  setCaptureRDWG,
  setCaptureGD
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
