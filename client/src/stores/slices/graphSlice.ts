import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface CollapsesModel {
  determinants: boolean;
  distribution: boolean;
  drugResistance: boolean;
  frequencies: boolean;
  trends: boolean;
  KODiversity: boolean;
  convergence: boolean;
  continent: boolean;
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
  prevalenceMapViewOptionsSelected: Array<string>;
  customDropdownMapViewNG: Array<string>;
  genotypesDrugsData: Array<any>;
  genotypesDrugClassesData: Array<any>;
  determinantsGraphView: string;
  determinantsGraphDrugClass: string;
  trendsGraphDrugClass: string;
  trendsGraphView: string;
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
  currentSliderValueCM: number;
  maxSliderValueCM: number;
  maxSliderValueKP_GE: number;
  resetBool: boolean;
  sliderList: number;
  sliderListKP_GE: number;
  NGMAST: Array<any>;
  ngmastDrugsData: Array<any>;
  drugsCountriesKPData: Object;
  drugsRegionsKPData: Object;
  uniqueCountryKPDrugs: Object;
  uniqueRegionKPDrugs: Object;
  topGenesSlice: Array<any>;
  topGenotypeSlice: Array<any>;
  topColorSlice: Array<any>;
}

const initialState: GraphState = {
  collapses: {
    determinants: false,
    distribution: false,
    drugResistance: false,
    frequencies: false,
    trends: false,
    KODiversity: false,
    convergence: false,
    continent: false,
  },
  countriesForFilter: [],
  genotypesYearData: [],
  drugsYearData: [],
  genotypesDrugsData: [],
  genotypesDrugClassesData: [],
  genotypesAndDrugsYearData: [],
  distributionGraphView: 'number',
  drugResistanceGraphView: [],
  frequenciesGraphView: 'percentage',
  frequenciesGraphSelectedGenotypes: [],
  prevalenceMapViewOptionsSelected: [],
  customDropdownMapViewNG: [],
  determinantsGraphView: 'percentage',
  determinantsGraphDrugClass: '',
  trendsGraphDrugClass: '',
  trendsGraphView: 'number',
  KODiversityData: [],
  KODiversityGraphView: 'K_locus',
  convergenceData: [],
  convergenceGroupVariable: 'COUNTRY_ONLY',
  convergenceColourVariable: 'DATE',
  convergenceColourPallete: {},
  currentSliderValue: 20,
  maxSliderValue: 0,
  currentSliderValueRD: 20,
  maxSliderValueRD: 0,
  currentSliderValueKP_GT: 20,
  currentSliderValueKP_GE: 20,
  currentSliderValueCM: 20,
  maxSliderValueCM: 0,
  maxSliderValueKP_GE: 0,
  resetBool: false,
  sliderList: 0,
  sliderListKP_GE: 0,
  NGMAST: [],
  ngmastDrugsData: [],
  drugsCountriesKPData: {},
  drugsRegionsKPData: {},
  uniqueCountryKPDrugs: {},
  uniqueRegionKPDrugs: {},
  topGenesSlice: [],
  topGenotypeSlice: [],
  topColorSlice: [],
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
    setPrevalenceMapViewOptionsSelected: (state, action: PayloadAction<Array<string>>) => {
      state.prevalenceMapViewOptionsSelected = action.payload;
    },
    setCustomDropdownMapViewNG: (state, action: PayloadAction<Array<string>>) => {
      state.customDropdownMapViewNG = action.payload;
    },
    setGenotypesDrugsData: (state, action: PayloadAction<Array<any>>) => {
      state.genotypesDrugsData = action.payload;
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
    setTrendsGraphDrugClass: (state, action: PayloadAction<string>) => {
      state.trendsGraphDrugClass = action.payload;
    },
    setTrendsGraphView: (state, action: PayloadAction<string>) => {
      state.trendsGraphView = action.payload;
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
    setCurrentSliderValueCM: (state, action: PayloadAction<number>) => {
      state.currentSliderValueCM = action.payload;
    },
    setMaxSliderValueCM: (state, action: PayloadAction<number>) => {
      state.maxSliderValueCM = action.payload;
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
    setNgmast: (state, action: PayloadAction<Array<any>>) => {
      state.NGMAST = action.payload;
    },
    setNgmastDrugsData: (state, action: PayloadAction<Array<any>>) => {
      state.ngmastDrugsData = action.payload;
    },
    setDrugsCountriesKPData: (state, action: PayloadAction<Object>) => {
      state.drugsCountriesKPData = action.payload;
    },
    setDrugsRegionsKPData: (state, action: PayloadAction<Object>) => {
      state.drugsRegionsKPData = action.payload;
    },
    setUniqueCountryKPDrugs: (state, action: PayloadAction<Object>) => {
      state.uniqueCountryKPDrugs = action.payload;
    },
    setUniqueRegionKPDrugs: (state, action: PayloadAction<Object>) => {
      state.uniqueRegionKPDrugs = action.payload;
    },
    setTopGenesSlice: (state, action: PayloadAction<Array<any>>) => {
      state.topGenesSlice = action.payload;
    },
    setTopGenotypeSlice: (state, action: PayloadAction<Array<any>>) => {
      state.topGenotypeSlice = action.payload;
    },
    setTopColorSlice: (state, action: PayloadAction<Array<any>>) => {
      state.topColorSlice = action.payload;
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
  setPrevalenceMapViewOptionsSelected,
  setCustomDropdownMapViewNG,
  setGenotypesDrugsData,
  setDeterminantsGraphView,
  setDeterminantsGraphDrugClass,
  setGenotypesDrugClassesData,
  setGenotypesAndDrugsYearData,
  setTrendsGraphDrugClass,
  setTrendsGraphView,
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
  setCurrentSliderValueCM,
  setMaxSliderValueCM,
  setDrugsCountriesKPData,
  setDrugsRegionsKPData,
  setUniqueCountryKPDrugs,
  setUniqueRegionKPDrugs,
  setTopGenesSlice,
  setTopGenotypeSlice,
  setTopColorSlice,
} = graphSlice.actions;

export default graphSlice.reducer;
