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

  const handleDefaultSliderChange = (event, newValue) => {
    console.log("newValue",newValue)
    dispatch(setCurrentSliderValueRD(newValue));
    // callBackValue(newValue);
  };

  useEffect(()=>{
    const max = sliderList;
    // dispatch(setMaxSliderValueRD(sliderList.length));
  });
// console.log("maxSliderValueRD", sliderList)
  return (
    <div className={classes.sliderSize}>
      <Box >
        {/* Display the values of the sliders */}
        <div className={classes.sliderLabel}>
        <p>Individual :</p>
        <p>{currentSliderValueRD}</p>
        </div>
        <Slider
          value={currentSliderValueRD }
          onChange={handleDefaultSliderChange}
          aria-label="Default"
          valueLabelDisplay="auto"
          min={1}
          max={sliderList}
        />
      </Box>
    </div>
  );
}
