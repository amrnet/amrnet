import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  setCurrentSliderValue,
  setMaxSliderValue,
  setCurrentSliderValueRD,
  setMaxSliderValueRD,
} from '../../../stores/slices/graphSlice';
import { useStyles } from './SliderMUI';
import { graphCards } from './../../../util/graphCards';

export const SliderSizes = (props) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const currentSliderValue = useAppSelector((state) => state.graph.currentSliderValue);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const maxSliderValue = useAppSelector((state) => state.graph.maxSliderValue);
  // const [currentSliderValue, setCurrentSliderValue] = useState(20);
  const currentSliderValueRD = useAppSelector((state) => state.graph.currentSliderValueRD);
  const maxSliderValueRD = useAppSelector((state) => state.graph.maxSliderValueRD);
  const organism = useAppSelector((state) => state.dashboard.organism);

  const [heading, setHeading] = useState('');
  const [sliderValueMax, setSliderValueMax] = useState();

  const handleDefaultSliderChange = (event, newValue) => {
    // dispatch(setCurrentSliderValue(newValue));
    // callBackValue(newValue);
    if (props.value === 'GD') {
      dispatch(setCurrentSliderValue(newValue));
    } else {
      dispatch(setCurrentSliderValueRD(newValue));
    }
  };
  function geno(){
    if (organism === 'decoli' ||  organism === "shige"  ||  organism === 'sentericaints')
      return "lineages"
    return "genotype"
  }

  useEffect(() => {
    if (props.value === 'GD') {
      setSliderValueMax(maxSliderValue);
      setHeading(`Individual ${geno()} to colour:`);
    } else {
      setSliderValueMax(maxSliderValueRD);
      setHeading('Individual resistance determinants:');
    }
    const max = genotypesForFilter.length;
    dispatch(setMaxSliderValue(max));
  });
  function SliderValueToSet(){
    let sliderValueForPlot;
    if(props.value === 'GD'){
      sliderValueForPlot = (currentSliderValue < maxSliderValue ? currentSliderValue : maxSliderValue);
    }else{
        sliderValueForPlot = (currentSliderValueRD < maxSliderValueRD ? currentSliderValueRD : maxSliderValueRD);
    } 
    return sliderValueForPlot;
  }

  return (
    <div className={classes.sliderSize}>
      <Box>
        {/* Display the values of the sliders */}
        <div className={classes.sliderLabel}>
          <p>{heading}</p>
          <p>{SliderValueToSet()}
          </p>
        </div>
        <Slider
          value={SliderValueToSet()}
          onChange={handleDefaultSliderChange}
          aria-label="Default"
          valueLabelDisplay="auto"
          min={1}
          max={sliderValueMax}
        />
      </Box>
    </div>
  );
};
