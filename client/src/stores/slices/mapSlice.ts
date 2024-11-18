import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface PositionModel {
  coordinates: Array<number>;
  zoom: number;
}

interface ItemModel {
  name: string;
  count: number;
  percentage: number;
}

interface ItemsModel {
  items: Array<ItemModel>;
  count: number;
  percentage?: number;
}

interface StatsModel {
  GENOTYPE: ItemsModel;
  H58: ItemsModel;
  MDR: ItemsModel;
  XDR: ItemsModel;
  AzithR: ItemsModel;
  Susceptible: ItemsModel;
  CipR: ItemsModel;
  CipNS: ItemsModel;
  NGMAST: ItemsModel;
}

interface MapDataModel {
  name: string;
  displayName: string;
  count: number;
  stats: StatsModel;
}

interface MapState {
  loadingMap: boolean;
  position: PositionModel;
  mapView: string;
  tooltipContent: Object | null;
  dataset: string;
  mapData: Array<MapDataModel>;
  mapRegionData: Array<MapDataModel>;
}

const initialState: MapState = {
  loadingMap: false,
  position: {
    coordinates: [0, 0],
    zoom: 1,
  },
  mapView: '',
  tooltipContent: null,
  dataset: '',
  mapData: [],
  mapRegionData: [],
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setLoadingMap: (state, action: PayloadAction<boolean>) => {
      state.loadingMap = action.payload;
    },
    setPosition: (state, action: PayloadAction<PositionModel>) => {
      state.position = action.payload;
    },
    setMapView: (state, action: PayloadAction<string>) => {
      state.mapView = action.payload;
    },
    setTooltipContent: (state, action: PayloadAction<Object | null>) => {
      state.tooltipContent = action.payload;
    },

    setDataset: (state, action: PayloadAction<string>) => {
      state.dataset = action.payload;
    },
    setMapData: (state, action: PayloadAction<Array<any>>) => {
      state.mapData = action.payload;
    },
    setMapRegionData: (state, action: PayloadAction<Array<any>>) => {
      state.mapRegionData = action.payload;
    },
  },
});

export const { setPosition, setMapView, setTooltipContent, setDataset, setLoadingMap, setMapData, setMapRegionData } =
  mapSlice.actions;

export default mapSlice.reducer;
