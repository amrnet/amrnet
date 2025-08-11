import { GitHub, RestartAlt } from '@mui/icons-material';
import { Fab, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { useIndexedDB } from '../../../context/IndexedDBContext';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  setActualCountry,
  setActualRegion,
  setActualTimeFinal,
  setActualTimeInitial,
  setCanFilterData,
  setCanGetData,
  setSelectedLineages,
} from '../../../stores/slices/dashboardSlice';
import {
  setBubbleHeatmapGraphVariable,
  setBubbleKOHeatmapGraphVariable,
  setBubbleKOYAxisType,
  setBubbleMarkersHeatmapGraphVariable,
  setBubbleMarkersYAxisType,
  setConvergenceColourPallete,
  setConvergenceColourVariable,
  setConvergenceGroupVariable,
  setCurrentSliderValue,
  setCurrentSliderValueCM,
  setCurrentSliderValueKOT,
  setCurrentSliderValueKP_GE,
  setCurrentSliderValueKP_GT,
  setCurrentSliderValueRD,
  setCustomDropdownMapViewNG,
  setDeterminantsGraphDrugClass,
  setDeterminantsGraphView,
  setDistributionGraphVariable,
  setDistributionGraphView,
  setDrugResistanceGraphView,
  setFrequenciesGraphView,
  setKODiversityGraphView,
  setKOTrendsGraphPlotOption,
  setKOTrendsGraphView,
  setNgmastDrugsData,
  setResetBool,
  setTrendsGraphDrugClass,
  setTrendsGraphView,
} from '../../../stores/slices/graphSlice';
import { setDataset, setDatasetKP, setMapView, setPosition } from '../../../stores/slices/mapSlice';
import {
  defaultDrugsForDrugResistanceGraphNG,
  defaultDrugsForDrugResistanceGraphST,
  drugsECOLI,
  drugsINTS,
  drugsKP,
  markersDrugsKP,
} from '../../../util/drugs';
import { getNgmastData } from '../../Dashboard/filters';
import { useStyles } from './ResetButtonMUI';

export const ResetButton = () => {
  const classes = useStyles();
  const { getItems } = useIndexedDB();
  const matches500 = useMediaQuery('(max-width: 500px)');

  const dispatch = useAppDispatch();
  const timeInitial = useAppSelector(state => state.dashboard.timeInitial);
  const timeFinal = useAppSelector(state => state.dashboard.timeFinal);
  const organism = useAppSelector(state => state.dashboard.organism);
  const pathovar = useAppSelector(state => state.dashboard.pathovar);
  const ngmast = useAppSelector(state => state.graph.NGMAST);
  const maxSliderValueRD = useAppSelector(state => state.graph.maxSliderValueRD);
  const loadingData = useAppSelector(state => state.dashboard.loadingData);
  const loadingMap = useAppSelector(state => state.map.loadingMap);

  async function handleClick() {
    dispatch(setResetBool(true));
    dispatch(setCanGetData(false));

    dispatch(setDataset('All'));
    dispatch(setDatasetKP('All'));
    dispatch(setActualTimeInitial(timeInitial));
    dispatch(setActualTimeFinal(timeFinal));
    dispatch(setPosition({ coordinates: [0, 0], zoom: 1 }));
    dispatch(setActualRegion('All'));
    dispatch(setActualCountry('All'));

    const storeData = await getItems(organism);
    const ngmastData = getNgmastData({ data: storeData, ngmast, organism });

    if (organism === 'styphi') {
      dispatch(setMapView('Resistance prevalence'));
      dispatch(setDeterminantsGraphDrugClass('Ciprofloxacin NS'));
      dispatch(setDrugResistanceGraphView(defaultDrugsForDrugResistanceGraphST));
      dispatch(setCurrentSliderValue(20)); // to reset the genotype trend slider value for styphi
      dispatch(setMapView('Resistance prevalence'));
      // dispatch(setDrugResistanceGraphView(defaultDrugsForDrugResistanceGraphNG));
      // dispatch(setDeterminantsGraphDrugClass('Azithromycin'));
      // dispatch(setTrendsGraphDrugClass('Azithromycin'));
      dispatch(setTrendsGraphView('percentage'));
      dispatch(setConvergenceColourPallete({}));
      dispatch(setNgmastDrugsData(ngmastData.ngmastDrugData));
      dispatch(setCustomDropdownMapViewNG(ngmastData.ngmastDrugData.slice(0, 1).map(x => x.name)));
    } else {
      dispatch(setMapView('Resistance prevalence'));
      dispatch(setDrugResistanceGraphView(drugsKP));
      dispatch(setDeterminantsGraphDrugClass('Carbapenems'));
      dispatch(setTrendsGraphDrugClass('ESBL'));
      dispatch(setTrendsGraphView('percentage'));
      dispatch(setKODiversityGraphView('K_locus'));
      dispatch(setConvergenceGroupVariable('cgST'));
      dispatch(setConvergenceColourVariable('cgST'));
      dispatch(setConvergenceColourPallete({}));
      dispatch(setCurrentSliderValueCM(20));
      dispatch(setCurrentSliderValue(20));
      dispatch(setCurrentSliderValueKOT(20));
      dispatch(setCurrentSliderValueKP_GT(20));
      dispatch(setCurrentSliderValueKP_GE(20));
    }
    if (['shige', 'decoli', 'sentericaints'].includes(organism)) {
      dispatch(setSelectedLineages(pathovar));
    }
    if (['shige', 'decoli', 'sentericaints', 'ecoli', 'senterica'].includes(organism)) {
      dispatch(setDrugResistanceGraphView(drugsINTS));
      dispatch(setDeterminantsGraphDrugClass('Aminoglycosides'));
    }
    if (['decoli', 'ecoli', 'shige'].includes(organism)) {
      dispatch(setDrugResistanceGraphView(drugsECOLI));
    }

    dispatch(setFrequenciesGraphView('percentage'));
    dispatch(setDeterminantsGraphView('percentage'));
    dispatch(setDistributionGraphView('percentage'));
    dispatch(setKOTrendsGraphView('percentage'));
    dispatch(setKOTrendsGraphPlotOption('O_locus'));
    dispatch(setDistributionGraphVariable('GENOTYPE'));
    dispatch(setBubbleHeatmapGraphVariable('GENOTYPE'));
    dispatch(setBubbleKOHeatmapGraphVariable('GENOTYPE'));
    dispatch(setBubbleKOYAxisType('O_locus'));
    dispatch(setBubbleMarkersHeatmapGraphVariable('GENOTYPE'));
    dispatch(setBubbleMarkersYAxisType(markersDrugsKP[0]));

    if (organism === 'ngono') {
      dispatch(setCurrentSliderValueRD(maxSliderValueRD));
      dispatch(setDrugResistanceGraphView(defaultDrugsForDrugResistanceGraphNG));
      dispatch(setTrendsGraphDrugClass('Azithromycin'));
      dispatch(setDeterminantsGraphDrugClass('Azithromycin'));
    }
    dispatch(setCurrentSliderValueRD(20));
    dispatch(setCanGetData(true));
    dispatch(setCanFilterData(true));
  }

  if (organism === 'none' || loadingData || loadingMap) {
    return <></>;
  }

  return (
    <div className={classes.resetButton}>
      <Tooltip title="Github" placement="left">
        <span>
          <IconButton
            href="https://github.com/amrnet/amrnet"
            target="_blank"
            disabled={organism === 'none' || loadingData || loadingMap}
            sx={{ padding: 0 }}
          >
            <GitHub sx={{ color: '#000', fontSize: '32px' }} />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Reset Application" placement="left">
        <span>
          <Fab
            color="primary"
            size={matches500 ? 'medium' : 'large'}
            onClick={handleClick}
            disabled={organism === 'none' || loadingData || loadingMap}
          >
            <RestartAlt sx={{ color: '#fff' }} />
          </Fab>
        </span>
      </Tooltip>
    </div>
  );
};
