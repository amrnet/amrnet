import { useEffect, useState } from 'react';
import { useStyles } from './SwitchColourMUI';
import { TopLeftControls } from '../Map/TopLeftControls';
import { useMediaQuery, ToggleButton, Tooltip } from '@mui/material';

import { useAppSelector, useAppDispatch } from '../../../stores/hooks';
import { setColourPattern } from '../../../stores/slices/dashboardSlice';
import ColorLensIcon from "@mui/icons-material/ColorLens";
import FilterBAndWIcon from "@mui/icons-material/FilterBAndW";


export const SwitchColour = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const matches500 = useMediaQuery('(max-width: 500px)');
  const matches1750 = useMediaQuery('(max-width: 1750px)');

  const colourPattern = useAppSelector((state) => state.dashboard.colourPattern);

  const [left, setLeft] = useState(16);
  const [showFilter, setShowFilter] = useState(!matches500);

  useEffect(() => {
    const updateLeft = () => {
      const width = window.innerWidth;
      setLeft(Math.max((width - 1280) / 2 - 216, 16));
    };

    updateLeft();
    window.addEventListener('resize', updateLeft);
    return () => {
      window.removeEventListener('resize', updateLeft);
    };
  }, []);

  function handleSwitchPattern() {
    dispatch(setColourPattern(!colourPattern));
  }

  return (
    <div className={classes.fabGF}>
    <Tooltip
        title={colourPattern ? "Colour Accessibility Mode" : "Normal Mode"}
        arrow
        placement="top"
      >
        <ToggleButton
          value="pattern"
          selected={colourPattern}
          onChange={handleSwitchPattern}
          sx={{
            borderRadius: "50px",
            px: 1,
            py: 1,
            fontSize: "0.8rem",
            textTransform: "none",
            backgroundColor: "#1fbbd3", // default (OFF)
            color: "white",
            "&:hover": {
              backgroundColor: "#158293",
            },
            "&.Mui-selected": {
              backgroundColor: "#1fbbd3", // ON state
              color: "white",
              "&:hover": {
                backgroundColor: "##158293",
              },
            },
          }}
        >
        {colourPattern ? (
          <FilterBAndWIcon sx={{ fontSize: 20 }} /> // smaller icon
        ) : (
          <ColorLensIcon sx={{ fontSize: 20 }} /> // smaller icon
        )}
        </ToggleButton>
      </Tooltip>
    </div>
  );
};
