import { IconButton, MenuItem, Select, useMediaQuery } from '@mui/material';
import { useStyles } from './SelectOrganismMUI';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { setGlobalOverviewLabel, setOrganism } from '../../../stores/slices/dashboardSlice.ts';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { organismsCards } from '../../../util/organismsCards';
import { useEffect, useMemo } from 'react';

export const SelectOrganism = () => {
  const classes = useStyles();
  const matches1050 = useMediaQuery('(max-width: 1050px)');
  const matches650 = useMediaQuery('(max-width: 650px)');

  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const loadingData = useAppSelector((state) => state.dashboard.loadingData);

  const sortedOrganismsCards = useMemo(
    () => organismsCards.slice().sort((a, b) => a.disabled - b.disabled || a.stringLabel.localeCompare(b.stringLabel)),
    [],
  );
  const activeOrganismsCards = useMemo(() => sortedOrganismsCards.filter((x) => !x.disabled), [sortedOrganismsCards]);

  useEffect(() => {
    if (organism !== '') {
      const currentOrganism = sortedOrganismsCards.find((x) => x.value === organism);
      if (currentOrganism) {
        dispatch(setGlobalOverviewLabel({ label: currentOrganism.label, stringLabel: currentOrganism.stringLabel }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organism]);

  function handleChange(event) {
    const value = event.target.value;
    dispatch(setOrganism(value));
  }

  function handlePreviousAgent() {
    const index = activeOrganismsCards.findIndex((org) => org.value === organism);
    if (index !== -1) {
      const isFirstIndex = index === 0;
      const newValue = isFirstIndex
        ? activeOrganismsCards[activeOrganismsCards.length - 1].value
        : activeOrganismsCards[index - 1].value;
      dispatch(setOrganism(newValue));
    }
  }

  function handleNextAgent() {
    const index = activeOrganismsCards.findIndex((org) => org.value === organism);
    if (index !== -1) {
      const isLastIndex = activeOrganismsCards.length - 1 === index;
      const newValue = isLastIndex ? activeOrganismsCards[0].value : activeOrganismsCards[index + 1].value;
      dispatch(setOrganism(newValue));
    }
  }

  return (
    <div className={classes.organismSelectWrapper}>
      {!matches650 && (
        <IconButton color="inherit" onClick={handlePreviousAgent} disabled={loadingData}>
          <KeyboardArrowLeft />
        </IconButton>
      )}
      <Select
        value={organism}
        onChange={handleChange}
        disableUnderline
        variant="standard"
        className={classes.organismSelect}
        inputProps={matches650 ? {} : { IconComponent: () => null }}
        disabled={loadingData}
      >
        <MenuItem value="none" disabled>
          Select an organism
        </MenuItem>
        {sortedOrganismsCards.map((item, index) => (
          <MenuItem key={`organism-${index}`} value={item.value} disabled={item.disabled}>
            {matches1050 ? item.abbr : item.label}
          </MenuItem>
        ))}
      </Select>
      {!matches650 && (
        <IconButton color="inherit" onClick={handleNextAgent} disabled={loadingData}>
          <KeyboardArrowRight />
        </IconButton>
      )}
    </div>
  );
};
