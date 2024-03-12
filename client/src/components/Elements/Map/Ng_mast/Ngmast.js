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
import { setCustomDropdownMapViewNG } from '../../../../stores/slices/graphSlice';
import { useStyles } from './NgmastMUI';
import TextField from '@mui/material/TextField';
import { InfoOutlined } from '@mui/icons-material';
import { Collapse } from '@mui/material';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';

export const Ngmast = () => {
  const classes = useStyles();
  const [, setCurrentTooltip] = useState(null);
  const [searchValue2, setSearchValue2] = useState('');
  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const NGMAST = useAppSelector((state) => state.graph.NGMAST);
  const ngmastDrugData = useAppSelector((state) => state.graph.ngmastDrugsData);
  const customDropdownMapViewNG = useAppSelector((state) => state.graph.customDropdownMapViewNG);
  const [selectedValues, setSelectedValues] = useState([customDropdownMapViewNG[0]]);
  const [open, setOpen] = useState(true);

  const handleAutocompleteChange = (event, newValue) => {
    if (customDropdownMapViewNG.length === 10 && newValue.length > 10) {
      return;
    }
    dispatch(setCustomDropdownMapViewNG(newValue));
    setSelectedValues(newValue);
  };

  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    dispatch(setCustomDropdownMapViewNG(ngmastDrugData.slice(0, 1).map((x) => x.name)));
  }, [ngmastDrugData]);

  function getSelectGenotypeLabel(genotype) {
    const matchingGenotype = ngmastDrugData.find((g) => g.name === genotype);
    const totalCount = matchingGenotype?.totalCount ?? 0;
    const susceptiblePercentage = (matchingGenotype?.Susceptible / totalCount || 0) * 100;
    return `${genotype} (total N=${totalCount}, ${susceptiblePercentage.toFixed(2)}% Susceptible)`;
  }
  const filteredData = ngmastDrugData.filter(
    (genotype) =>
      genotype.name.includes(searchValue2.toLowerCase()) || genotype.name.includes(searchValue2.toUpperCase()),
  );
  const icon = (
    <Card elevation={3} className={classes.card}>
      <CardContent className={classes.frequenciesGraph}>
        <div className={classes.label}>
          <Typography variant="caption">Select genotype</Typography>
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
            freeSolo={customDropdownMapViewNG.length >= 10 ? false : true}
            getOptionDisabled={(options) => (customDropdownMapViewNG.length >= 10 ? true : false)}
            value={selectedValues}
            disableCloseOnSelect
            onChange={handleAutocompleteChange}
            renderOption={(props, option, { selected }) => (
              <MenuItem key={option} value={option} sx={{ justifyContent: 'space-between' }} {...props}>
                <Checkbox checked={customDropdownMapViewNG.indexOf(option) > -1} />
                <ListItemText primary={getSelectGenotypeLabel(option)} />
              </MenuItem>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder={customDropdownMapViewNG.length > 0 ? 'Type to search...' : '0 genotype selected'}
              />
            )}
          />
        </FormControl>
      </CardContent>
    </Card>
  );
  return (
    <Box className={`${classes.topRightControls}`}>
      <FormControlLabel
        className={classes.font}
        control={<Switch checked={open} onChange={handleClick} />}
        label={
          open ? (
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
