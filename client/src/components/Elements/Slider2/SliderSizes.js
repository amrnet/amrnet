import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCurrentSliderValueRD,setMaxSliderValueRD } from '../../../stores/slices/graphSlice';
import { useStyles } from './SliderMUI';

export const SliderSizes = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const currentSliderValueRD = useAppSelector((state) => state.graph.currentSliderValueRD);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const maxSliderValueRD = useAppSelector((state) => state.graph.maxSliderValueRD);
  const genotypesDrugClassesData = useAppSelector((state) => state.graph.genotypesDrugClassesData);
  const determinantsGraphDrugClass = useAppSelector((state) => state.graph.determinantsGraphDrugClass);
  const sliderList = useAppSelector((state) => state.graph.sliderList);
  const organism = useAppSelector((state) => state.dashboard.organism);


  const handleDefaultSliderChange = (event, newValue) => {
    console.log("newValue",newValue)
    dispatch(setCurrentSliderValueRD(newValue));
    // callBackValue(newValue);
  };

    // let slidervalue =  currentSliderValueRD<maxSliderValueRD?currentSliderValueRD:maxSliderValueRD;

  // useEffect(()=>{
  //   console.log("i m n")
  //   dispatch(setCurrentSliderValueRD(currentSliderValueRD<maxSliderValueRD?currentSliderValueRD:maxSliderValueRD));
  //   // dispatch(setMaxSliderValueRD(max));
  // },[genotypesDrugClassesData[determinantsGraphDrugClass]]);//[currentSliderValueRD, maxSliderValueRD, organism]
console.log("max",maxSliderValueRD, currentSliderValueRD, currentSliderValueRD<maxSliderValueRD?"currentSliderValueRD":maxSliderValueRD )
  return (
    <div className={classes.sliderSize}>
      <Box >
        {/* Display the values of the sliders */}
        <div className={classes.sliderLabel}>
        <p>Individual resistance determinants:</p>
        <p>{currentSliderValueRD<maxSliderValueRD?currentSliderValueRD:maxSliderValueRD}</p>
        </div>
        <Slider
          value={currentSliderValueRD}
          onChange={handleDefaultSliderChange}
          aria-label="Default"
          valueLabelDisplay="auto"
          min={1}
          max={maxSliderValueRD}
        />
      </Box>
    </div>
  );
}

