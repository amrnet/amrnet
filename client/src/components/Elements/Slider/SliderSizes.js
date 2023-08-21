import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCurrentSliderValue,setMaxSliderValue } from '../../../stores/slices/graphSlice';
import { useStyles } from './SliderMUI';

export const SliderSizes = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const currentSliderValue = useAppSelector((state) => state.graph.currentSliderValue);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const maxSliderValue = useAppSelector((state) => state.graph.maxSliderValue);
  // const [currentSliderValue, setCurrentSliderValue] = useState(20);

  const handleDefaultSliderChange = (event, newValue) => {
    dispatch(setCurrentSliderValue(newValue));
    // callBackValue(newValue);
  };

  useEffect(()=>{
    const max = genotypesForFilter.length <= 133 ? genotypesForFilter.length : 133;
    dispatch(setMaxSliderValue(max));
  });

  return (
    <div className={classes.sliderSize}>
      <Box >
        {/* Display the values of the sliders */}
        <div className={classes.sliderLabel}>
        <p>Individual genotypes to colour:</p>
        <p>{currentSliderValue}</p>
        </div>
        <Slider
          value={currentSliderValue }
          onChange={handleDefaultSliderChange}
          aria-label="Default"
          valueLabelDisplay="auto"
          min={1}
          max={maxSliderValue}
        />
      </Box>
    </div>
  );
}
