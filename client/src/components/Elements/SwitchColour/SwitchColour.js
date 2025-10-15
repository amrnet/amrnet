import { useEffect, useState } from 'react';
import { useStyles } from './SwitchColourMUI';
import { TopLeftControls } from '../Map/TopLeftControls';
import { useMediaQuery, ToggleButton } from '@mui/material';

import { useAppSelector, useAppDispatch } from '../../../stores/hooks';
import { setColourPattern } from '../../../stores/slices/dashboardSlice';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

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
      <ToggleButton
        value="pattern"
        selected={colourPattern}
        onChange={handleSwitchPattern}
        sx={{
          borderRadius: "50px",
          px: 2,
          py: 1,
          fontSize: "0.8rem",
          textTransform: "none",
          background: colourPattern ? "#1976d2" : "#eee", // blue when ON, grey when OFF
          color: colourPattern ? "white" : "#333",
          "&:hover": {
            background: colourPattern ? "#1565c0" : "#ddd", // darker blue on hover
          },
        }}
      >
        {colourPattern ? <VisibilityIcon /> : <VisibilityOffIcon />}
      </ToggleButton>
    </div>
  );
};
