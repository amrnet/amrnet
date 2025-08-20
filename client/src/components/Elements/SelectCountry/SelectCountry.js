import { useStyles } from './SelectCountryMUI';
import {
  /*Card, CardContent,*/ MenuItem,
  Select /*Typography*/,
  Tooltip,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  setActualCountry,
  setActualRegion,
  setCanFilterData,
} from '../../../stores/slices/dashboardSlice';
import { useMemo } from 'react';
import { InfoOutlined } from '@mui/icons-material';
// import { useMemo } from 'react';

export const SelectCountry = ({ hideAll = false }) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);
  const actualRegion = useAppSelector((state) => state.dashboard.actualRegion);
  const countriesForFilter = useAppSelector((state) => state.graph.countriesForFilter);
  // const dataset = useAppSelector((state) => state.map.dataset);
  // const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  // const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const economicRegions = useAppSelector((state) => state.dashboard.economicRegions);
  const mapRegionData = useAppSelector((state) => state.map.mapRegionData);
  const mapData = useAppSelector((state) => state.map.mapData);

  const filteredRegions = useMemo(() => {
    return mapRegionData
      .filter((x) => x.count >= 20 && x.name !== 'All')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [mapRegionData]);

  const filteredCountries = useMemo(() => {
    const countries = actualRegion === 'All' ? countriesForFilter : economicRegions[actualRegion];

    return mapData
      .filter((x) => countries.includes(x.name))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [actualRegion, countriesForFilter, economicRegions, mapData]);

  function handleChangeRegion(event) {
    dispatch(setActualCountry('All'));
    dispatch(setActualRegion(event.target.value));
    dispatch(setCanFilterData(true));
  }

  function handleChangeCountry(event) {
    const country = event.target.value;

    if (!(actualRegion !== 'All' && country === 'All')) {
      const region =
        Object.keys(economicRegions).find((key) => economicRegions[key].includes(country)) ?? 'All';
      dispatch(setActualRegion(region));
    }

    dispatch(setActualCountry(country));
    dispatch(setCanFilterData(true));
  }

  // const plotsDescription = useMemo(() => {
  //   const datasetText = organism === 'styphi' ? ` ${dataset}` : '';
  //   const locationText = `${
  //     actualRegion === 'All' ? 'all regions' : actualCountry === 'All' ? actualRegion : actualCountry
  //   }`;
  //   const dateText = `from ${actualTimeInitial} to ${actualTimeFinal}`;

  //   return `Detailed plots for selected:${datasetText} data from ${locationText} ${dateText}`;
  // }, [actualCountry, actualRegion, actualTimeFinal, actualTimeInitial, dataset, organism]);

  return (
    // <Card className={classes.card}>
    //   <CardContent className={classes.cardContent}>
    //     <Typography variant="h5" fontWeight={700}>
    //       {plotsDescription}
    //     </Typography>
    //     <Typography variant="subtitle1" fontWeight={500}>
    //       Select a focus country by clicking on the map above or selecting from the list below
    //     </Typography>
    //     <div className={classes.selectWrapper}>
    //       <Select
    //         variant="standard"
    //         value={actualRegion}
    //         onChange={handleChangeRegion}
    //         inputProps={{ className: classes.selectInput }}
    //         MenuProps={{
    //           classes: { paper: classes.menuPaper, list: classes.selectMenu },
    //         }}
    //         disabled={organism === 'none'}
    //       >
    //         <MenuItem value="All">All regions</MenuItem>
    //         {Object.keys(economicRegions)
    //           .sort()
    //           .map((country, index) => {
    //             return (
    //               <MenuItem key={index + 'mapview'} value={country}>
    //                 {country}
    //               </MenuItem>
    //             );
    //           })}
    //       </Select>
    //       <Select
    //         variant="standard"
    //         value={actualCountry}
    //         onChange={handleChangeCountry}
    //         inputProps={{ className: classes.selectInput }}
    //         MenuProps={{
    //           classes: { paper: classes.menuPaper, list: classes.selectMenu },
    //         }}
    //         disabled={organism === 'none'}
    //       >
    //         <MenuItem value="All">All countries</MenuItem>
    //         {(actualRegion === 'All' ? countriesForFilter : economicRegions[actualRegion]).map((country, index) => {
    //           return (
    //             <MenuItem key={index + 'mapview'} value={country}>
    //               {country}
    //             </MenuItem>
    //           );
    //         })}
    //       </Select>
    //     </div>
    //   </CardContent>
    // </Card>
    <div className={classes.selectWrapper}>
      <div className={classes.labelWrapper}>
        <Typography variant="caption">Select region</Typography>
        <Tooltip title="Only show regions with N≥20 genomes." placement="top">
          <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
        </Tooltip>
      </div>
      <Select
        value={actualRegion}
        onChange={handleChangeRegion}
        inputProps={{ className: classes.selectInput }}
        MenuProps={{
          classes: { paper: classes.menuPaper, list: classes.selectMenu },
        }}
        disabled={organism === 'none'}
        renderValue={(selected) => {
          if (selected === 'All') {
            return 'All regions';
          }
          return selected;
        }}
      >
        {hideAll ? (
          <MenuItem value="All" disabled>
            Select a region
          </MenuItem>
        ) : (
          <MenuItem value="All">All regions</MenuItem>
        )}
        {filteredRegions.map((region, index) => {
          return (
            <MenuItem key={index + 'mapview'} value={region.name}>
              {region.name} (total N={region.count})
            </MenuItem>
          );
        })}
      </Select>
      <div style={{ paddingTop: '8px' }}></div>
      <div className={classes.labelWrapper}>
        <Typography variant="caption">Select country</Typography>
      </div>
      <Select
        value={actualCountry}
        onChange={handleChangeCountry}
        inputProps={{ className: classes.selectInput }}
        MenuProps={{
          classes: { paper: classes.menuPaper, list: classes.selectMenu },
        }}
        disabled={organism === 'none'}
        renderValue={(selected) => {
          if (selected === 'All') {
            return actualRegion !== 'All' ? 'All countries in region' : 'All countries';
          }
          return selected;
        }}
      >
        {hideAll ? (
          <MenuItem value="All" disabled>
            Select a country
          </MenuItem>
        ) : (
          <MenuItem value="All">
            {actualRegion !== 'All' ? 'All countries in region' : 'All countries'}
          </MenuItem>
        )}
        {filteredCountries.map((country, index) => {
          return (
            <MenuItem key={index + 'mapview'} value={country.name}>
              {country.name} (total N={country.count})
            </MenuItem>
          );
        })}
      </Select>
    </div>
  );
};
