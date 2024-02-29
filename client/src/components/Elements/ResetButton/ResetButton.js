import { RestartAlt } from '@mui/icons-material';
import { useStyles } from './ResetButtonMUI';
import { Fab, Tooltip, useMediaQuery } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setActualTimeFinal, setActualTimeInitial, setCanGetData } from '../../../stores/slices/dashboardSlice';
import { setDataset, setMapView, setPosition } from '../../../stores/slices/mapSlice';
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
  setFrequenciesGraphSelectedGenotypes,
  setNgmast,
  setNgmastDrugsData,
  setCustomDropdownMapViewNG
} from '../../../stores/slices/graphSlice';
import { drugsKP, defaultDrugsForDrugResistanceGraphST } from '../../../util/drugs';
import {
  getGenotypesData,
  getNgmastData
} from '../../Dashboard/filters';

export const ResetButton = (props) => {
  const classes = useStyles();
  const matches500 = useMediaQuery('(max-width: 500px)');

  const dispatch = useAppDispatch();
  const timeInitial = useAppSelector((state) => state.dashboard.timeInitial);
  const timeFinal = useAppSelector((state) => state.dashboard.timeFinal);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const genotypes = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);
  const ngmast = useAppSelector((state) => state.graph.NGMAST);
    const customDropdownMapViewNG = useAppSelector((state) => state.graph.customDropdownMapViewNG);


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
    const genotypesData = getGenotypesData({ data: props.data, genotypes, actualCountry });
    const ngmastData = getNgmastData({ data: props.data, ngmast, organism });
    dispatch(setCustomDropdownMapView(genotypesData.genotypesDrugsData.slice(0, 1).map((x) => x.name)));
    console.log("setCustomDropdownMapView", customDropdownMapViewNG, genotypesData.genotypesDrugsData.slice(0, 1).map((x) => x.name))
    dispatch(setFrequenciesGraphSelectedGenotypes(genotypesData.genotypesDrugsData.slice(0, 5).map((x) => x.name)));

    if (organism === 'styphi') {
      dispatch(setMapView('CipNS'));
      dispatch(setDeterminantsGraphDrugClass('Ciprofloxacin NS'));
      dispatch(setDrugResistanceGraphView(defaultDrugsForDrugResistanceGraphST));
    } else if(organism === 'ngono'){
      dispatch(setMapView('No. Samples'));
      dispatch(setDrugResistanceGraphView(drugsKP));
      dispatch(setDeterminantsGraphDrugClass('Carbapenems'));
      dispatch(setTrendsKPGraphDrugClass('Carbapenems'));
      dispatch(setTrendsKPGraphView('number'));
      dispatch(setKODiversityGraphView('K_locus'));
      dispatch(setConvergenceGroupVariable('COUNTRY_ONLY'));
      dispatch(setConvergenceColourVariable('DATE'));
      dispatch(setConvergenceColourPallete({}));
      dispatch(setNgmastDrugsData(ngmastData.ngmastDrugData));
      dispatch(setCustomDropdownMapViewNG(ngmastData.ngmastDrugData.slice(0, 1).map((x) => x.name)));
    }else {
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
