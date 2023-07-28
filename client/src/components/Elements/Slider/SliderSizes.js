import { useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setGenotypesForFilterLength } from '../../../stores/slices/graphSlice';

export const SliderSizes = () => {

  const dispatch = useAppDispatch();
  const genotypesForFilterLength = useAppSelector((state) => state.graph.genotypesForFilterLength);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);

  const handleDefaultSliderChange = (event, newValue) => {
    dispatch(setGenotypesForFilterLength(newValue));
  };

  return (
    <div style={{ margin: '0px 10px' }}>
      <Box >
        <Slider
          value={genotypesForFilter.length >= genotypesForFilterLength ? genotypesForFilterLength :  genotypesForFilter.length }
          onChange={handleDefaultSliderChange}
          aria-label="Default"
          valueLabelDisplay="auto"
          min={1}
          max={genotypesForFilter.length <= 133 ? genotypesForFilter.length : 133 }
        />
        {/* Display the values of the sliders */}
        <p>Selected Slider Value: {genotypesForFilter.length >= genotypesForFilterLength ? genotypesForFilterLength :  genotypesForFilter.length}</p>
      </Box>
    </div>
  );
}
