/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  InputAdornment,
  FormControl,
  ListSubheader,
  Autocomplete,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setCustomDropdownMapView } from '../../../../stores/slices/graphSlice';
import { useStyles } from './TopRightControls2MUI';
import TextField from '@mui/material/TextField';
import { InfoOutlined } from '@mui/icons-material';
import { Collapse } from '@mui/material';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import { setMapView } from '../../../../stores/slices/mapSlice';

export const TopRightControls2 = () => {
  const classes = useStyles();
  const [, setCurrentTooltip] = useState(null);
  const [searchValue2, setSearchValue2] = useState('');
  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const genotypesDrugsData2 = useAppSelector((state) => state.graph.genotypesDrugsData2);
  const genotypesDrugsData = useAppSelector((state) => state.graph.genotypesDrugsData);
  const customDropdownMapView = useAppSelector((state) => state.graph.customDropdownMapView);
  const [selectedValues, setSelectedValues] = useState([customDropdownMapView[0]]);
  const [open, setOpen] = useState(true);
  const mapView = useAppSelector((state) => state.map.mapView);

  console.log('i m 2', genotypesDrugsData2);
  console.log('customDropdownMapView', customDropdownMapView);
  const handleAutocompleteChange = (event, newValue) => {
    if (customDropdownMapView.length === 10 && newValue.length > 10) {
      return;
    }
    dispatch(setCustomDropdownMapView(newValue));
    setSelectedValues(newValue);
  };

  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    dispatch(setCustomDropdownMapView(genotypesDrugsData.slice(0, 1).map((x) => x.name)));
  }, [genotypesDrugsData]);

  function getSelectGenotypeLabel(genotype) {
    const matchingGenotype = genotypesDrugsData.find(g => g.name === genotype);
    const totalCount = matchingGenotype?.totalCount ?? 0;
    const susceptiblePercentage = (matchingGenotype?.Susceptible / totalCount || 0) * 100;
    return `${genotype} (total N=${totalCount}, ${susceptiblePercentage.toFixed(2)}% Susceptible)`;
  }
  function getHeading (){
    if (organism === 'decoli')
      return (
        <Tooltip title="pathovar and 7-locus MLST" placement="top">
                <span>Select Lineage</span>
              </Tooltip>
      )
    else if(organism === 'kpneumo')
      return (
        <Tooltip title="7-locus MLST" placement="top">
                <span>Select Lineage</span>
              </Tooltip>
      )
    else if (organism === "shige")
      return (
        <Tooltip title="species + HC400 cluster" placement="top">
                <span>Select Lineage</span>
              </Tooltip>
      )
    return "Select genotype"
  }
  const filteredData = genotypesDrugsData2.filter(
    (genotype) =>
      genotype.name.includes(searchValue2.toLowerCase()) || genotype.name.includes(searchValue2.toUpperCase()),
  );
  // .filter(x => x.totalCount >= 20)
  console.log('filteredData', filteredData);
  const icon = (
    // <div className={`${classes.topRightControls}`}>
    <Card elevation={3} className={classes.card}>
      <CardContent className={classes.frequenciesGraph}>
        <div className={classes.label}>
          <Typography variant="caption">{getHeading()}</Typography>
          <Tooltip title="Select up to 10 Genotypes" placement="top">
            <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
          </Tooltip>
        </div>
        <FormControl fullWidth>
          <Autocomplete
            sx={{ m: 1, maxHeight: 200 }}
            multiple
            limitTags={1}
            id="tags-standard"
            options={filteredData.map((data) => data.name)}
            freeSolo={customDropdownMapView.length >= 10 ? false : true}
            getOptionDisabled={(options) => (customDropdownMapView.length >= 10 ? true : false)}
            value={selectedValues}
            disableCloseOnSelect
            onChange={handleAutocompleteChange}
            renderOption={(props, option, { selected }) => (
              <MenuItem key={option} value={option} sx={{ justifyContent: 'space-between' }} {...props}>
                <Checkbox checked={customDropdownMapView.indexOf(option) > -1} />
                <ListItemText primary={getSelectGenotypeLabel(option)} />
              </MenuItem>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder={
                  customDropdownMapView.length > 0
                    ? 'Type to search...'
                    : organism === 'shige' || organism === 'decoli'
                    ? '0 lineage selected'
                    : '0 genotype selected'
                }
              />
            )}
          />
        </FormControl>
      </CardContent>
    </Card>
    // </div>
  );
  return (
    <Box className={`${classes.topRightControls}`}>
      <FormControlLabel
        className={classes.font}
        control={<Switch checked={open} onChange={handleClick} />}
        label={
          organism === 'shige' || organism === 'decoli' ? (
            open ? (
              <Typography className={classes.font}>Close lineage selector</Typography>
            ) : (
              <Typography className={classes.font}>Open lineage selector</Typography>
            )
          ) : open ? (
            <Typography className={classes.font}>Close genotype selector</Typography>
          ) : (
            <Typography className={classes.font}>Open genotype selector</Typography>
          )
        }
      />
      <Collapse in={open}>{icon}</Collapse>
    </Box>
  );
};
