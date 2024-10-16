/* eslint-disable react-hooks/exhaustive-deps */
import {
  Card,
  CardContent,
  Checkbox,
  ListItemText,
  MenuItem,
  Tooltip,
  Typography,
  FormControl,
  Autocomplete,
} from '@mui/material';
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

export const TopRightControls2 = () => {
  const classes = useStyles();
  // eslint-disable-next-line no-unused-vars
  const [searchValue2, setSearchValue2] = useState('');
  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const genotypesDrugsData2 = useAppSelector((state) => state.graph.genotypesDrugsData2);
  const customDropdownMapView = useAppSelector((state) => state.graph.customDropdownMapView);
  const [selectedValues, setSelectedValues] = useState([customDropdownMapView[0]]);
  const [open, setOpen] = useState(true);

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
    dispatch(setCustomDropdownMapView(genotypesDrugsData2.slice(0, 1).map((x) => x.name)));
  }, [genotypesDrugsData2]);

  function getSelectGenotypeLabel(genotype) {
    const matchingGenotype = genotypesDrugsData2.find((g) => g.name === genotype);
    const totalCount = matchingGenotype?.totalCount ?? 0;
    const susceptiblePercentage = (matchingGenotype?.Susceptible / totalCount || 0) * 100;
    if (organism === 'decoli' || organism === 'shige' || organism === 'sentericaints')
      return `${genotype} (total N=${totalCount})`;
    return `${genotype} (total N=${totalCount}, ${susceptiblePercentage.toFixed(2)}% Susceptible)`;
  }
  function getHoverIcon() {
    if (organism === 'decoli')
      return 'Lineages are labelled as Pathovar (ST) and 7-locus MLST. Select up to 10 to display.';
    else if (organism === 'kpneumo') return 'Sequence type are labelled as 7-locus MLST. Select up to 10 to display.';
    else if (organism === 'shige')
      return 'Lineages are labelled as Species + HC400 cluster. Select up to 10 to display.';
    else if (organism === 'sentericaints')
      return 'Lineages are labelled as 7-locus MLST and HC150(305,1547,48,9882,728,12675,2452) cluster. Select up to 10 to display.';
    return 'Select up to 10 to display';
  }
  function getHeading() {
    if (organism === 'decoli' || organism === 'shige' || organism === 'sentericaints') return 'Select Lineage';
    return 'Select Genotype';
  }
  const filteredData = genotypesDrugsData2.filter(
    (genotype) =>
      genotype.name.includes(searchValue2.toLowerCase()) || genotype.name.includes(searchValue2.toUpperCase()),
  );
  const icon = (
    <Card elevation={3} className={classes.card}>
      <CardContent className={classes.frequenciesGraph}>
        <div className={classes.label}>
          <Typography variant="caption">{getHeading()}</Typography>
          <Tooltip title={getHoverIcon()} placement="top">
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
  );
  return (
    <Box className={`${classes.topRightControls}`}>
      <FormControlLabel
        className={classes.font}
        control={<Switch checked={open} onChange={handleClick} />}
        label={
          organism === 'shige' || organism === 'decoli' || organism === 'sentericaints' ? (
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
