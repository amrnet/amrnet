import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface CollapsesModel {
  determinants: boolean;
  distribution: boolean;
  drugResistance: boolean;
  frequencies: boolean;
  trendsKP: boolean;
  trendsNG: boolean;
  KODiversity: boolean;
  convergence: boolean;
}
interface GraphState {
  countriesForFilter: Array<string>;
  distributionGraphView: string;
  genotypesYearData: Array<any>;
  drugsYearData: Array<any>;
  genotypesAndDrugsYearData: Array<any>;
  collapses: CollapsesModel;
  drugResistanceGraphView: Array<string>;
  frequenciesGraphView: string;
  frequenciesGraphSelectedGenotypes: Array<string>;
  customDropdownMapView: Array<string>;
  customDropdownMapViewNG: Array<string>;
  genotypesDrugsData: Array<any>;
  genotypesDrugsData2: Array<any>;
  genotypesDrugClassesData: Array<any>;
  determinantsGraphView: string;
  determinantsGraphDrugClass: string;
  trendsKPGraphDrugClass: string;
  trendsKPGraphView: string;
  trendsNGGraphDrugClass: string;
  trendsNGGraphView: string;
  KODiversityData: Array<any>;
  KODiversityGraphView: string;
  convergenceData: Array<any>;
  convergenceGroupVariable: string;
  convergenceColourVariable: string;
  convergenceColourPallete: Object;
  currentSliderValue: number;
  maxSliderValue: number;
  currentSliderValueRD: number;
  maxSliderValueRD: number;
  currentSliderValueKP_GT: number;
  currentSliderValueKP_GE: number;
  maxSliderValueKP_GE: number;
  currentSliderValueNG_GT: number;
  currentSliderValueNG_GE: number;
  maxSliderValueNG_GE: number;
  resetBool: boolean;
  sliderList: number;
  sliderListKP_GE: number;
  sliderListNG_GE: number;
  NGMAST: Array<any>;
  ngmastDrugsData: Array<any>;
}

const initialState: GraphState = {
  collapses: {
    determinants: false,
    distribution: false,
    drugResistance: false,
    frequencies: false,
    trendsKP: false,
    trendsNG: false,
    KODiversity: false,
    convergence: false,
  },
  countriesForFilter: [],
  genotypesYearData: [],
  drugsYearData: [],
  genotypesDrugsData: [],
  genotypesDrugsData2: [],
  genotypesDrugClassesData: [],
  genotypesAndDrugsYearData: [],
  distributionGraphView: 'number',
  drugResistanceGraphView: [],
  frequenciesGraphView: 'percentage',
  frequenciesGraphSelectedGenotypes: [],
  customDropdownMapView: [],
  customDropdownMapViewNG: [],
  determinantsGraphView: 'percentage',
  determinantsGraphDrugClass: '',
  trendsKPGraphDrugClass: '',
  trendsKPGraphView: 'number',
  trendsNGGraphDrugClass: '',
  trendsNGGraphView: 'number',
  KODiversityData: [],
  KODiversityGraphView: 'K_locus',
  convergenceData: [],
  convergenceGroupVariable: 'COUNTRY_ONLY',
  convergenceColourVariable: 'DATE',
  convergenceColourPallete: {},
  currentSliderValue: 20,
  maxSliderValue: 0,
  currentSliderValueRD: 5,
  maxSliderValueRD: 0,
  currentSliderValueKP_GT: 20,
  currentSliderValueKP_GE: 20,
  maxSliderValueKP_GE: 0,
  resetBool: false,
  sliderList: 0,
  sliderListKP_GE: 0,
  NGMAST: [],
  ngmastDrugsData: [],
  currentSliderValueNG_GT: 0,
  currentSliderValueNG_GE: 0,
  maxSliderValueNG_GE: 0,
  sliderListNG_GE: 0
};

export const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    setCollapse: (state, action: PayloadAction<any>) => {
      state.collapses[action.payload.key as keyof CollapsesModel] = action.payload.value;
    },
    setCollapses: (state, action: PayloadAction<CollapsesModel>) => {
      state.collapses = action.payload;
    },
    setCountriesForFilter: (state, action: PayloadAction<Array<string>>) => {
      state.countriesForFilter = action.payload;
    },
    setGenotypesYearData: (state, action: PayloadAction<Array<any>>) => {
      state.genotypesYearData = action.payload;
    },
    setDrugsYearData: (state, action: PayloadAction<Array<any>>) => {
      state.drugsYearData = action.payload;
    },
    setDistributionGraphView: (state, action: PayloadAction<string>) => {
      state.distributionGraphView = action.payload;
    },
    setDrugResistanceGraphView: (state, action: PayloadAction<Array<string>>) => {
      state.drugResistanceGraphView = action.payload;
    },
    setFrequenciesGraphView: (state, action: PayloadAction<string>) => {
      state.frequenciesGraphView = action.payload;
    },
    setFrequenciesGraphSelectedGenotypes: (state, action: PayloadAction<Array<string>>) => {
      state.frequenciesGraphSelectedGenotypes = action.payload;
    },
    setCustomDropdownMapView: (state, action: PayloadAction<Array<string>>) => {
      state.customDropdownMapView = action.payload;
    },
    setCustomDropdownMapViewNG: (state, action: PayloadAction<Array<string>>) => {
      state.customDropdownMapViewNG = action.payload;
    },
    setGenotypesDrugsData: (state, action: PayloadAction<Array<any>>) => {
      state.genotypesDrugsData = action.payload;
    },
    setGenotypesDrugsData2: (state, action: PayloadAction<Array<any>>) => {
      state.genotypesDrugsData2 = action.payload;
    },
    setDeterminantsGraphView: (state, action: PayloadAction<string>) => {
      state.determinantsGraphView = action.payload;
    },
    setDeterminantsGraphDrugClass: (state, action: PayloadAction<string>) => {
      state.determinantsGraphDrugClass = action.payload;
    },
    setGenotypesDrugClassesData: (state, action: PayloadAction<Array<any>>) => {
      state.genotypesDrugClassesData = action.payload;
    },
    setGenotypesAndDrugsYearData: (state, action: PayloadAction<Array<any>>) => {
      state.genotypesAndDrugsYearData = action.payload;
    },
    setTrendsKPGraphDrugClass: (state, action: PayloadAction<string>) => {
      state.trendsKPGraphDrugClass = action.payload;
    },
    setTrendsKPGraphView: (state, action: PayloadAction<string>) => {
      state.trendsKPGraphView = action.payload;
    },
    setTrendsNGGraphDrugClass: (state, action: PayloadAction<string>) => {
      state.trendsNGGraphDrugClass = action.payload;
    },
    setTrendsNGGraphView: (state, action: PayloadAction<string>) => {
      state.trendsNGGraphView = action.payload;
    },
    setKODiversityData: (state, action: PayloadAction<Array<any>>) => {
      state.KODiversityData = action.payload;
    },
    setKODiversityGraphView: (state, action: PayloadAction<string>) => {
      state.KODiversityGraphView = action.payload;
    },
    setConvergenceData: (state, action: PayloadAction<Array<any>>) => {
      state.convergenceData = action.payload;
    },
    setConvergenceGroupVariable: (state, action: PayloadAction<string>) => {
      state.convergenceGroupVariable = action.payload;
    },
    setConvergenceColourVariable: (state, action: PayloadAction<string>) => {
      state.convergenceColourVariable = action.payload;
    },
    setConvergenceColourPallete: (state, action: PayloadAction<Object>) => {
      state.convergenceColourPallete = action.payload;
    },
    setCurrentSliderValue: (state, action: PayloadAction<number>) => {
      state.currentSliderValue = action.payload;
    },
    setResetBool: (state, action: PayloadAction<boolean>) => {
      state.resetBool = action.payload;
    },
    setMaxSliderValue: (state, action: PayloadAction<number>) => {
      state.maxSliderValue = action.payload;
    },
    setCurrentSliderValueRD: (state, action: PayloadAction<number>) => {
      state.currentSliderValueRD = action.payload;
    },
    setMaxSliderValueRD: (state, action: PayloadAction<number>) => {
      state.maxSliderValueRD = action.payload;
    },
    setCurrentSliderValueKP_GT: (state, action: PayloadAction<number>) => {
      state.currentSliderValueKP_GT = action.payload;
    },
    setCurrentSliderValueKP_GE: (state, action: PayloadAction<number>) => {
      state.currentSliderValueKP_GE = action.payload;
    },
    setMaxSliderValueKP_GE: (state, action: PayloadAction<number>) => {
      state.maxSliderValueKP_GE = action.payload;
    },
    setSliderList: (state, action: PayloadAction<number>) => {
      state.sliderList = action.payload;
    },
    setSliderListKP_GE: (state, action: PayloadAction<number>) => {
      state.sliderListKP_GE = action.payload;
    },
    setCurrentSliderValueNG_GT: (state, action: PayloadAction<number>) => {
      state.currentSliderValueKP_GT = action.payload;
    },
    setCurrentSliderValueNG_GE: (state, action: PayloadAction<number>) => {
      state.currentSliderValueKP_GE = action.payload;
    },
    setMaxSliderValueNG_GE: (state, action: PayloadAction<number>) => {
      state.maxSliderValueKP_GE = action.payload;
    },
    setNgmast: (state, action: PayloadAction<Array<any>>) => {
      state.NGMAST = action.payload;
    },
    setNgmastDrugsData: (state, action: PayloadAction<Array<any>>) => {
      state.ngmastDrugsData = action.payload;
    },
  },
});

export const {
  setCountriesForFilter,
  setDistributionGraphView,
  setGenotypesYearData,
  setDrugsYearData,
  setCollapse,
  setDrugResistanceGraphView,
  setCollapses,
  setFrequenciesGraphView,
  setFrequenciesGraphSelectedGenotypes,
  setCustomDropdownMapView,
  setCustomDropdownMapViewNG,
  setGenotypesDrugsData,
  setGenotypesDrugsData2,
  setDeterminantsGraphView,
  setDeterminantsGraphDrugClass,
  setGenotypesDrugClassesData,
  setGenotypesAndDrugsYearData,
  setTrendsKPGraphDrugClass,
  setTrendsKPGraphView,
  setTrendsNGGraphDrugClass,
  setTrendsNGGraphView,
  setKODiversityData,
  setKODiversityGraphView,
  setConvergenceData,
  setConvergenceGroupVariable,
  setConvergenceColourVariable,
  setConvergenceColourPallete,
  setCurrentSliderValue,
  setResetBool,
  setMaxSliderValue,
  setCurrentSliderValueRD,
  setMaxSliderValueRD,
  setSliderList,
  setSliderListKP_GE,
  setNgmast,
  setNgmastDrugsData,
  setCurrentSliderValueKP_GT,
  setCurrentSliderValueKP_GE,
  setMaxSliderValueKP_GE,
  setCurrentSliderValueNG_GT,
  setCurrentSliderValueNG_GE,
  setMaxSliderValueNG_GE,
} = graphSlice.actions;

export default graphSlice.reducer;
