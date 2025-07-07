import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  setCurrentSliderValue,
  setMaxSliderValue,
  setCurrentSliderValueRD,
  setCurrentSliderValueKP_GT,
  setCurrentSliderValueKP_GE,
  setCurrentSliderValueCM,
  setCurrentSliderValueKOT,
} from '../../../stores/slices/graphSlice';
import { useStyles } from './SliderMUI';
import { variablesOptions } from '../../../util/convergenceVariablesOptions';

export const SliderSizes = props => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const genotypesForFilterDynamic = useAppSelector(state => state.dashboard.genotypesForFilterDynamic);
  const currentSliderValue = useAppSelector(state => state.graph.currentSliderValue);
  const maxSliderValue = useAppSelector(state => state.graph.maxSliderValue);
  const currentSliderValueKOT = useAppSelector(state => state.graph.currentSliderValueKOT);
  const maxSliderValueKOT = useAppSelector(state => state.graph.maxSliderValueKOT);
  const currentSliderValueRD = useAppSelector(state => state.graph.currentSliderValueRD);
  const maxSliderValueRD = useAppSelector(state => state.graph.maxSliderValueRD);
  const currentSliderValueKP_GT = useAppSelector(state => state.graph.currentSliderValueKP_GT);
  const currentSliderValueKP_GE = useAppSelector(state => state.graph.currentSliderValueKP_GE);
  const maxSliderValueKP_GE = useAppSelector(state => state.graph.maxSliderValueKP_GE);
  const currentSliderValueCM = useAppSelector(state => state.graph.currentSliderValueCM);
  const maxSliderValueCM = useAppSelector(state => state.graph.maxSliderValueCM);
  const convergenceGroupVariable = useAppSelector(state => state.graph.convergenceGroupVariable);
  const organism = useAppSelector(state => state.dashboard.organism);
  // const [sliderGD, setSliderGD] = useState(currentSliderValue);
  // const [sliderRD, setSliderRD] = useState(currentSliderValueRD);
  // const [sliderKP_GT, setSliderKP_GT] = useState(currentSliderValueKP_GT);
  // const [sliderKP_GE, setSliderKP_GE] = useState(currentSliderValueKP_GE);
  // const [sliderCM, setSliderCM] = useState(currentSliderValueCM);

  useEffect(() => {
    if (['GD', 'KP_GT'].includes(props.value) && genotypesForFilterDynamic.length > 0) {
      dispatch(setMaxSliderValue(genotypesForFilterDynamic.length));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genotypesForFilterDynamic]);

  // const handleSliderChange = (_, newValue) => {
  //   if (props.value === 'GD') {
  //     setSliderGD(newValue);
  //     return;
  //   }

  //   if (props.value === 'KP_GT') {
  //     setSliderKP_GT(newValue);
  //     return;
  //   }

  //   if (props.value === 'KP_GE') {
  //     setSliderKP_GE(newValue);
  //     return;
  //   }

  //   if (props.value === 'CM') {
  //     setSliderCM(newValue);
  //     return;
  //   }

  //   setSliderRD(newValue);
  // };

  const handleSliderComittedChange = (_, newValue) => {
    if (props.value === 'GD') {
      dispatch(setCurrentSliderValue(newValue));
      return;
    }

    if (props.value === 'KOT') {
      dispatch(setCurrentSliderValueKOT(newValue));
      return;
    }

    if (props.value === 'KP_GT') {
      dispatch(setCurrentSliderValueKP_GT(newValue));
      return;
    }

    if (props.value === 'KP_GE') {
      dispatch(setCurrentSliderValueKP_GE(newValue));
      return;
    }

    if (props.value === 'CM') {
      dispatch(setCurrentSliderValueCM(newValue));
      return;
    }

    dispatch(setCurrentSliderValueRD(newValue));
  };

  const heading = useMemo(() => {
    if (props.label) {
      return `Individual ${props.label} to colour:`;
    }

    function geno() {
      if (['sentericaints', 'senterica'].includes(organism)) return 'lineage';
      if (organism === 'kpneumo') return 'ST';
      return 'genotype';
    }

    if (['GD', 'KP_GT'].includes(props.value)) {
      return `Individual ${geno()} to colour:`;
    }

    if (props.value === 'CM') {
      return `Individual ${variablesOptions.find(x => x.value === convergenceGroupVariable).label} to colour`;
    }

    return 'Individual resistance determinants:';
  }, [convergenceGroupVariable, organism, props.label, props.value]);

  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    let newSliderValue;

    if (props.value === 'GD') {
      newSliderValue = currentSliderValue < maxSliderValue ? currentSliderValue : maxSliderValue;
    } else if (props.value === 'KOT') {
      newSliderValue = currentSliderValueKOT < maxSliderValueKOT ? currentSliderValueKOT : maxSliderValueKOT;
    } else if (props.value === 'KP_GT') {
      newSliderValue = currentSliderValueKP_GT < maxSliderValue ? currentSliderValueKP_GT : maxSliderValue;
    } else if (props.value === 'KP_GE') {
      newSliderValue = currentSliderValueKP_GE < maxSliderValueKP_GE ? currentSliderValueKP_GE : maxSliderValueKP_GE;
    } else if (props.value === 'CM') {
      newSliderValue = currentSliderValueCM < maxSliderValueCM ? currentSliderValueCM : maxSliderValueCM;
    } else {
      newSliderValue = currentSliderValueRD < maxSliderValueRD ? currentSliderValueRD : maxSliderValueRD;
    }

    setSliderValue(newSliderValue);
  }, [
    maxSliderValue,
    maxSliderValueCM,
    maxSliderValueKP_GE,
    maxSliderValueRD,
    props.value,
    currentSliderValueCM,
    currentSliderValue,
    currentSliderValueKP_GE,
    currentSliderValueKP_GT,
    currentSliderValueRD,
    currentSliderValueKOT,
    maxSliderValueKOT,
  ]);

  const maxValue = useMemo(() => {
    if (['GD', 'KP_GT'].includes(props.value)) {
      return maxSliderValue < 30 ? maxSliderValue : 30;
    }
    if (['KOT'].includes(props.value)) {
      return maxSliderValueKOT < 30 ? maxSliderValueKOT : 30;
    }
    if (props.value === 'KP_GE') {
      return maxSliderValueKP_GE < 30 ? maxSliderValueKP_GE : 30;
    }
    if (props.value === 'CM') {
      return maxSliderValueCM < 30 ? maxSliderValueCM : 30;
    }

    return maxSliderValueRD < 30 ? maxSliderValueRD : 30;
  }, [maxSliderValue, maxSliderValueCM, maxSliderValueKOT, maxSliderValueKP_GE, maxSliderValueRD, props.value]);

  return (
    <div className={classes.sliderSize} style={props.style}>
      <Box>
        {/* Display the values of the sliders */}
        <div className={classes.sliderLabel}>
          <p>{heading}</p>
        </div>
        <Slider
          value={sliderValue}
          onChange={handleSliderComittedChange}
          // onChangeCommitted={handleSliderComittedChange}
          aria-label="Default"
          valueLabelDisplay="on"
          min={1}
          max={maxValue}
          disabled={props.disabled ?? false}
        />
      </Box>
    </div>
  );
};
