import { useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setgenotypesForFilterLength } from '../../../stores/slices/graphSlice';

export const SliderSizes = () => {
  // const [defaultSliderValue, setDefaultSliderValue] = useState(50);

  const dispatch = useAppDispatch();
  const genotypesForFilterLength = useAppSelector((state) => state.graph.genotypesForFilterLength);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);

  const handleDefaultSliderChange = (event, newValue) => {
    dispatch(setgenotypesForFilterLength(newValue));
  };

  return (
    <Box width='100%'>
      <Slider
        value={genotypesForFilterLength}
        onChange={handleDefaultSliderChange}
        aria-label="Default"
        valueLabelDisplay="auto"
        min={1}
        max={genotypesForFilter.length}
      />

      {/* Display the values of the sliders */}
      <p>Selected Slider Value: {genotypesForFilterLength}</p>
    </Box>
  );
}
