import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCurrentSliderValue,setMaxSliderValue } from '../../../stores/slices/graphSlice';

export const SliderSizes = () => {

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
    <div style={{ margin: '0px 10px' }}>
      <Box >
        <Slider
          value={currentSliderValue }
          onChange={handleDefaultSliderChange}
          aria-label="Default"
          valueLabelDisplay="auto"
          min={1}
          max={maxSliderValue}
        />
        {/* Display the values of the sliders */}
        <div style= {{display:'flex'}}>
        <p>Number of genotypes to colour individually:</p>
        <p>{currentSliderValue}</p>
        </div>
      </Box>
    </div>
  );
}
