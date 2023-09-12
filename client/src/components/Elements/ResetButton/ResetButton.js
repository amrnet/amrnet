import { RestartAlt } from '@mui/icons-material';
import { useStyles } from './ResetButtonMUI';
import { Fab, Tooltip, useMediaQuery } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setActualTimeFinal, setActualTimeInitial, setCanGetData } from '../../../stores/slices/dashboardSlice';
import { setDataset, setMapView, setPosition, setIfCustom } from '../../../stores/slices/mapSlice';
import { setActualCountry } from '../../../stores/slices/dashboardSlice';
import {
  setCollapses,
  setConvergenceColourPallete,
  setConvergenceColourVariable,
  setConvergenceGroupVariable,
  setDeterminantsGraphDrugClass,
  setDeterminantsGraphView,
  setDistributionGraphView,
  setDrugResistanceGraphView,
  setFrequenciesGraphView,
  setKODiversityGraphView,
  setTrendsKPGraphDrugClass,
  setTrendsKPGraphView,
  setCustomDropdownMapView,
  setCurrentSliderValue,
  setResetBool,
  setFrequenciesGraphSelectedGenotypes,
} from '../../../stores/slices/graphSlice';
import { drugsKP, defaultDrugsForDrugResistanceGraphST } from '../../../util/drugs';
import {
  getGenotypesData
} from '../../Dashboard/filters';

export const ResetButton = (props) => {
  const classes = useStyles();
  const matches500 = useMediaQuery('(max-width: 500px)');

  const dispatch = useAppDispatch();
  const timeInitial = useAppSelector((state) => state.dashboard.timeInitial);
  const timeFinal = useAppSelector((state) => state.dashboard.timeFinal);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const genotypes = useAppSelector((state) => state.dashboard.genotypesForFilter);

  function handleClick() {
    dispatch(setCanGetData(false));
    dispatch(
      setCollapses({
        determinants: false,
        distribution: false,
        drugResistance: false,
        frequencies: false,
        trendsKP: false,
        KODiversity: false,
        convergence: false
      })
    );

    dispatch(setDataset('All'));
    dispatch(setActualTimeInitial(timeInitial));
    dispatch(setActualTimeFinal(timeFinal));
    dispatch(setPosition({ coordinates: [0, 0], zoom: 1 }));
    dispatch(setActualCountry('All'));

    if (organism === 'typhi') {
      dispatch(setMapView('CipNS'));
      dispatch(setDeterminantsGraphDrugClass('Ciprofloxacin NS'));
      dispatch(setDrugResistanceGraphView(defaultDrugsForDrugResistanceGraphST));
    } else {
      dispatch(setMapView('No. Samples'));
      dispatch(setDrugResistanceGraphView(drugsKP));
      dispatch(setDeterminantsGraphDrugClass('Carbapenems'));
      dispatch(setTrendsKPGraphDrugClass('Carbapenems'));
      dispatch(setTrendsKPGraphView('number'));
      dispatch(setKODiversityGraphView('K_locus'));
      dispatch(setConvergenceGroupVariable('COUNTRY_ONLY'));
      dispatch(setConvergenceColourVariable('DATE'));
      dispatch(setConvergenceColourPallete({}));
    }

    dispatch(setFrequenciesGraphView('percentage'));
    dispatch(setDeterminantsGraphView('percentage'));
    dispatch(setDistributionGraphView('number'));
    dispatch(setCanGetData(true));
    dispatch(setIfCustom(false));

    const genotypesData = getGenotypesData({ data: props.data, genotypes, organism });
    dispatch(setCustomDropdownMapView(genotypesData.genotypesDrugsData.slice(0, 1).map((x) => x.name)));
    dispatch(setFrequenciesGraphSelectedGenotypes(genotypesData.genotypesDrugsData.slice(0, 5).map((x) => x.name)));
    dispatch(setCurrentSliderValue(20));
    dispatch(setResetBool(true));
    // dispatch(setGenotypesForFilter(true))
  }

  return (
    <div className={classes.resetButton}>
      <Tooltip title="Reset Configurations" placement="left">
        <span>
          <Fab
            color="primary"
            size={matches500 ? 'medium' : 'large'}
            onClick={handleClick}
            disabled={organism === 'none'}
          >
            <RestartAlt sx={{ color: '#fff' }} />
          </Fab>
        </span>
      </Tooltip>
    </div>
  );
};
