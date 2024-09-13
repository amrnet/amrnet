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
} from '../../../stores/slices/graphSlice';
import { useStyles } from './SliderMUI';

export const SliderSizes = (props) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const currentSliderValue = useAppSelector((state) => state.graph.currentSliderValue);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const maxSliderValue = useAppSelector((state) => state.graph.maxSliderValue);
  const currentSliderValueRD = useAppSelector((state) => state.graph.currentSliderValueRD);
  const maxSliderValueRD = useAppSelector((state) => state.graph.maxSliderValueRD);
  const currentSliderValueKP_GT = useAppSelector((state) => state.graph.currentSliderValueKP_GT);
  const currentSliderValueKP_GE = useAppSelector((state) => state.graph.currentSliderValueKP_GE);
  const maxSliderValueKP_GE = useAppSelector((state) => state.graph.maxSliderValueKP_GE);
  const organism = useAppSelector((state) => state.dashboard.organism);

  const [sliderGD, setSliderGD] = useState(currentSliderValue);
  const [sliderRD, setSliderRD] = useState(currentSliderValueRD);
  const [sliderKP_GT, setSliderKP_GT] = useState(currentSliderValueKP_GT);
  const [sliderKP_GE, setSliderKP_GE] = useState(currentSliderValueKP_GE);

  useEffect(() => {
    if (['GD', 'KP_GT'].includes(props.value) && genotypesForFilter.length > 0) {
      dispatch(setMaxSliderValue(genotypesForFilter.length));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genotypesForFilter]);

  const handleSliderChange = (_, newValue) => {
    if (props.value === 'GD') {
      setSliderGD(newValue);
      return;
    }

    if (props.value === 'KP_GT') {
      setSliderKP_GT(newValue);
      return;
    }

    if (props.value === 'KP_GE') {
      setSliderKP_GE(newValue);
      return;
    }

    setSliderRD(newValue);
  };

  const handleSliderComittedChange = (_, newValue) => {
    if (props.value === 'GD') {
      dispatch(setCurrentSliderValue(newValue));
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

    dispatch(setCurrentSliderValueRD(newValue));
  };

  const heading = useMemo(() => {
    function geno() {
      if (organism === 'decoli' || organism === 'shige' || organism === 'sentericaints') return 'lineages';
      return 'genotype';
    }

    if (['GD', 'KP_GT'].includes(props.value)) {
      return `Individual ${geno()} to colour:`;
    }

    return 'Individual resistance determinants:';
  }, [organism, props.value]);

  const sliderValue = useMemo(() => {
    if (props.value === 'GD') {
      return sliderGD < maxSliderValue ? sliderGD : maxSliderValue;
    }
    if (props.value === 'KP_GT') {
      return sliderKP_GT < maxSliderValue ? sliderKP_GT : maxSliderValue;
    }
    if (props.value === 'KP_GE') {
      return sliderKP_GE < maxSliderValueKP_GE ? sliderKP_GE : maxSliderValueKP_GE;
    }

    return sliderRD < maxSliderValueRD ? sliderRD : maxSliderValueRD;
  }, [
    maxSliderValue,
    maxSliderValueKP_GE,
    maxSliderValueRD,
    props.value,
    sliderGD,
    sliderKP_GE,
    sliderKP_GT,
    sliderRD,
  ]);

  const maxValue = useMemo(() => {
    if (['GD', 'KP_GT'].includes(props.value)) {
      return maxSliderValue < 30 ? maxSliderValue : 30;
    }
    if (props.value === 'KP_GE') {
      return maxSliderValueKP_GE < 30 ? maxSliderValueKP_GE : 30;
    }

    return maxSliderValueRD < 30 ? maxSliderValueRD : 30;
  }, [maxSliderValue, maxSliderValueKP_GE, maxSliderValueRD, props.value]);

  return (
    <div className={classes.sliderSize}>
      <Box>
        {/* Display the values of the sliders */}
        <div className={classes.sliderLabel}>
          <p>{heading}</p>
          <p>{sliderValue}</p>
        </div>
        <Slider
          value={sliderValue}
          onChange={handleSliderChange}
          onChangeCommitted={handleSliderComittedChange}
          aria-label="Default"
          valueLabelDisplay="auto"
          min={1}
          max={maxValue}
        />
      </Box>
    </div>
  );
};
