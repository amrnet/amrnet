import { IconButton, MenuItem, Select, useMediaQuery } from '@mui/material';
import { useStyles } from './SelectOrganismMUI';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { setGlobalOverviewLabel, setOrganism } from '../../../stores/slices/dashboardSlice.ts';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';

const organisms = [
  {
    label: 'Salmonella Typhi',
    value: 'styphi',
    abbr: 'S. Typhi',
  },
  {
    label: 'Klebsiella pneumoniae',
    value: 'kpneumo',
    abbr: 'K. pneumoniae',
  },
  {
    label: 'Neisseria gonorrhoeae',
    value: 'ngono',
    abbr: 'N. gonorrhoeae',
  },
  // {
  //   label: 'Escherichia coli',
  //   value: 'ecoli',
  //   abbr: 'E. coli'
  // },
  {
    label: 'Diarrheagenic E. coli',
    value: 'decoli',
    abbr: 'DEC',
  },
  {
    label: 'Shigella + EIEC',
    value: 'shige',
    abbr: 'Shigella+EIEC',
  },
  {
    label: 'invasive non-typhoidal Salmonella',
    value: 'sentericaints',
    abbr: 'iNTS',
  },
  // {
  //   label: 'Salmonella enterica',
  //   value: 'senterica',
  //   abbr: 'S. enterica'
  // }
];

export const SelectOrganism = () => {
  const classes = useStyles();
  const matches1050 = useMediaQuery('(max-width: 1050px)');
  const matches650 = useMediaQuery('(max-width: 650px)');

  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const loadingData = useAppSelector((state) => state.dashboard.loadingData);

  function handleChange(event) {
    const value = event.target.value;
    dispatch(setOrganism(value));
    handleGlobalOverviewLabel(value);
  }

  function handlePreviousAgent() {
    const index = organisms.findIndex((org) => org.value === organism);
    if (index !== -1) {
      const isFirstIndex = index === 0;
      const newValue = isFirstIndex ? organisms[organisms.length - 1].value : organisms[index - 1].value;
      dispatch(setOrganism(newValue));
      handleGlobalOverviewLabel(newValue);
    }
  }

  function handleNextAgent() {
    const index = organisms.findIndex((org) => org.value === organism);
    if (index !== -1) {
      const isLastIndex = organisms.length - 1 === index;
      const newValue = isLastIndex ? organisms[0].value : organisms[index + 1].value;
      dispatch(setOrganism(newValue));
      handleGlobalOverviewLabel(newValue);
    }
  }

  function handleGlobalOverviewLabel(value) {
    const currentOrganism = organisms.find((x) => x.value === value);
    const labels = currentOrganism.label.split(' ');
    dispatch(
      setGlobalOverviewLabel({
        italicLabel: labels[0],
        label: labels[1],
        fullLabel: currentOrganism.label,
      }),
    );
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
        {organisms.map((item, index) => (
          <MenuItem key={`organism-${index}`} value={item.value}>
            {matches1050 ? item.abbr : item.label}
          </MenuItem>
        ))}
        {/* <MenuItem value="ngono" disabled>
          {matches1050 ? 'N. gonorrhoeae' : 'Neisseria gonorrhoeae'}
        </MenuItem> */}
      </Select>
      {!matches650 && (
        <IconButton color="inherit" onClick={handleNextAgent} disabled={loadingData}>
          <KeyboardArrowRight />
        </IconButton>
      )}
    </div>
  );
};
