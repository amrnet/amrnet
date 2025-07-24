import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ReactNode } from 'react';
import { organismsCards } from '../../util/organismsCards';

interface GlobalOverviewModel {
  label: ReactNode;
  stringLabel: string;
}

interface ColorPalleteKOModel {
  O_locus: Object;
  K_locus: Object;
  O_type: Object;
}

interface UniqueKOModel {
  O_locus: Array<any>;
  K_locus: Array<any>;
  O_type: Array<any>;
}

interface DashboardState {
  canGetData: boolean;
  canFilterData: boolean;
  globalOverviewLabel: GlobalOverviewModel;
  organism: string;
  loadingData: boolean;
  actualCountry: string;
  actualRegion: string;
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
  genotypesForFilterSelected: Array<string>;
  genotypesForFilterSelectedRD: Array<string>;
  KOForFilterSelected: Array<string>;
  genotypesForFilterDynamic: Array<string>;
  KOForFilterDynamic: UniqueKOModel;
  colorPallete: Object;
  colorPalleteCgST: Object;
  colorPalleteSublineages: Object;
  colorPalleteKO: ColorPalleteKOModel;
  listPMID: Array<string>;
  PMID: Array<string>;
  captureDRT: boolean;
  captureRFWG: boolean;
  captureRDWG: boolean;
  captureGD: boolean;
  captureKOT: boolean;
  selectedLineages: Array<string>;
  pathovar: Array<string>;
  serotype: Array<string>;
  economicRegions: Object;
  loadingPDF: boolean;
}

const initialState: DashboardState = {
  canGetData: true,
  canFilterData: false,
  globalOverviewLabel: {
    label: organismsCards.find(card => card.value === 'styphi')?.label || '',
    stringLabel: organismsCards.find(card => card.value === 'styphi')?.stringLabel || '',
  },
  organism: 'none',
  loadingData: false,
  actualCountry: 'All',
  actualRegion: 'All',
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
  genotypesForFilterSelected: [],
  genotypesForFilterSelectedRD: [],
  KOForFilterSelected: [],
  genotypesForFilterDynamic: [],
  KOForFilterDynamic: { K_locus: [], O_locus: [], O_type: [] },
  colorPallete: {},
  colorPalleteCgST: {},
  colorPalleteSublineages: {},
  colorPalleteKO: { K_locus: {}, O_locus: {}, O_type: {} },
  listPMID: [],
  PMID: [],
  captureDRT: true,
  captureRFWG: true,
  captureRDWG: true,
  captureGD: true,
  captureKOT: true,
  selectedLineages: [],
  pathovar: [],
  economicRegions: {},
  serotype: [],
  loadingPDF: false,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setCanGetData: (state, action: PayloadAction<boolean>) => {
      state.canGetData = action.payload;
    },
    setCanFilterData: (state, action: PayloadAction<boolean>) => {
      state.canFilterData = action.payload;
    },
    setGlobalOverviewLabel: (state, action: PayloadAction<GlobalOverviewModel>) => {
      state.globalOverviewLabel = action.payload;
    },
    removeOrganism: state => {
      state.organism = 'none';
    },
    setOrganism: (state, action: PayloadAction<string>) => {
      const url = new URL(window.location.href);
      const hash = url.hash;

      let [path, queryString] = hash.split('?');
      const searchParams = new URLSearchParams(queryString);

      if (searchParams.get('organism') !== action.payload) {
        searchParams.set('organism', action.payload);
        url.hash = `${path}?${searchParams.toString()}`;
        window.history.replaceState(null, '', url);
      }

      state.organism = action.payload;
    },
    setLoadingData: (state, action: PayloadAction<boolean>) => {
      state.loadingData = action.payload;
    },
    setActualCountry: (state, action: PayloadAction<string>) => {
      state.actualCountry = action.payload;
    },
    setActualRegion: (state, action: PayloadAction<string>) => {
      state.actualRegion = action.payload;
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
    setGenotypesForFilterSelected: (state, action: PayloadAction<Array<string>>) => {
      state.genotypesForFilterSelected = action.payload;
    },
    setGenotypesForFilterSelectedRD: (state, action: PayloadAction<Array<string>>) => {
      state.genotypesForFilterSelectedRD = action.payload;
    },
    setKOForFilterSelected: (state, action: PayloadAction<Array<string>>) => {
      state.KOForFilterSelected = action.payload;
    },
    setGenotypesForFilterDynamic: (state, action: PayloadAction<Array<string>>) => {
      state.genotypesForFilterDynamic = action.payload;
    },
    setKOForFilterDynamic: (state, action: PayloadAction<UniqueKOModel>) => {
      state.KOForFilterDynamic = action.payload;
    },
    setColorPallete: (state, action: PayloadAction<Object>) => {
      state.colorPallete = action.payload;
    },
    setColorPalleteCgST: (state, action: PayloadAction<Object>) => {
      state.colorPalleteCgST = action.payload;
    },
    setColorPalleteSublineages: (state, action: PayloadAction<Object>) => {
      state.colorPalleteSublineages = action.payload;
    },
    setColorPalleteKO: (state, action: PayloadAction<ColorPalleteKOModel>) => {
      state.colorPalleteKO = action.payload;
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
    setCaptureKOT: (state, action: PayloadAction<boolean>) => {
      state.captureKOT = action.payload;
    },
    setSelectedLineages: (state, action: PayloadAction<Array<string>>) => {
      state.selectedLineages = action.payload;
    },
    setPathovar: (state, action: PayloadAction<Array<string>>) => {
      state.pathovar = action.payload;
    },
    setSerotype: (state, action: PayloadAction<Array<string>>) => {
      state.serotype = action.payload;
    },
    setEconomicRegions: (state, action: PayloadAction<Object>) => {
      state.economicRegions = action.payload;
    },
    setLoadingPDF: (state, action: PayloadAction<boolean>) => {
      state.loadingPDF = action.payload;
    },
  },
});

export const {
  setCanGetData,
  setCanFilterData,
  setGlobalOverviewLabel,
  setOrganism,
  setLoadingData,
  setActualCountry,
  setActualRegion,
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
  setGenotypesForFilterSelected,
  setGenotypesForFilterSelectedRD,
  setGenotypesForFilterDynamic,
  setColorPallete,
  setListPMID,
  setPMID,
  setCaptureDRT,
  setCaptureRFWG,
  setCaptureRDWG,
  setCaptureGD,
  removeOrganism,
  setSelectedLineages,
  setPathovar,
  setEconomicRegions,
  setSerotype,
  setColorPalleteCgST,
  setColorPalleteSublineages,
  setKOForFilterDynamic,
  setColorPalleteKO,
  setCaptureKOT,
  setKOForFilterSelected,
  setLoadingPDF,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
