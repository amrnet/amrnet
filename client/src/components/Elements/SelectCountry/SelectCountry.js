import { useStyles } from './SelectCountryMUI';
import { Card, CardContent, MenuItem, Select, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setActualCountry, setCanFilterData } from '../../../stores/slices/dashboardSlice';

export const SelectCountry = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);
  const countriesForFilter = useAppSelector((state) => state.graph.countriesForFilter);
  const dataset = useAppSelector((state) => state.map.dataset);
  const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);
  const organism = useAppSelector((state) => state.dashboard.organism);

  function handleChange(event) {
    dispatch(setActualCountry(event.target.value));
    dispatch(setCanFilterData(true));
  }

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography variant="h5" fontWeight={700}>
          {`Detailed plots for selected: ${
            organism === 'styphi'
              ? `${dataset} data from ${
                  actualCountry === 'All' ? 'all countries' : actualCountry
                } from ${actualTimeInitial} to ${actualTimeFinal}`
              : `data from ${actualCountry === 'All' ? 'all countries' : actualCountry}`
          }`}
        </Typography>
        <Typography variant="subtitle1" fontWeight={500}>
          Select a focus country by clicking on the map above or selecting from the list below
        </Typography>
        <Select
          variant="standard"
          value={actualCountry}
          onChange={handleChange}
          inputProps={{ className: classes.selectInput }}
          MenuProps={{
            classes: { paper: classes.menuPaper, list: classes.selectMenu },
          }}
          disabled={organism === 'none'}
        >
          <MenuItem value="All">All</MenuItem>
          {countriesForFilter.map((country, index) => {
            return (
              <MenuItem key={index + 'mapview'} value={country}>
                {country}
              </MenuItem>
            );
          })}
        </Select>
      </CardContent>
    </Card>
  );
};
