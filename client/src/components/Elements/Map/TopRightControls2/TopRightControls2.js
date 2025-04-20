import { Card, CardContent, Checkbox, Tooltip, Typography, FormControl, Autocomplete, Chip } from '@mui/material';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { useStyles } from './TopRightControls2MUI';
import TextField from '@mui/material/TextField';
import { InfoOutlined } from '@mui/icons-material';
import { Collapse } from '@mui/material';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { setPrevalenceMapViewOptionsSelected } from '../../../../stores/slices/graphSlice';
import { statKeys, mapStatKeysKP } from '../../../../util/drugClassesRules';

const INFO_ICON_TEXTS = {
  decoli: 'Lineages are labelled as Pathovar (ST) and 7-locus MLST. Select up to 10 to display.',
  kpneumo: 'Sequence type are labelled as 7-locus MLST. Select up to 10 to display.',
  shige: 'Lineages are labelled as Species + HC400 cluster. Select up to 10 to display.',
  sentericaints:
    'Lineages are labelled as 7-locus MLST and HC150(305,1547,48,9882,728,12675,2452) cluster. Select up to 10 to display.',
};

export const TopRightControls2 = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const organism = useAppSelector((state) => state.dashboard.organism);
  const mapView = useAppSelector((state) => state.map.mapView);
  const genotypesDrugsData = useAppSelector((state) => state.graph.genotypesDrugsData);
  const prevalenceMapViewOptionsSelected = useAppSelector((state) => state.graph.prevalenceMapViewOptionsSelected);
  const selectedLineages = useAppSelector((state) => state.dashboard.selectedLineages);

  const [open, setOpen] = useState(true);
  const [openTypho, setOpenTypo] = useState();

  const isResPrevalence = useMemo(() => mapView === 'Resistance prevalence', [mapView]);
  const resistanceOptions = useMemo(() => {
    let options;
    if (organism === 'kpneumo') options = mapStatKeysKP;
    else options = statKeys[organism] ? statKeys[organism] : statKeys['others'];
    return options.filter((option) => option.resistanceView).map((option) => option.name);
  }, [organism]);

  useEffect(()=>{
    if(open)
      setOpenTypo(null);
    else{
      if(prevalenceMapViewOptionsSelected[0] !== undefined)
        setOpenTypo(`Showing ${prevalenceMapViewOptionsSelected[0]} data`);
      else
      setOpenTypo(`No Drug is selected`);
    }
  }, [open, prevalenceMapViewOptionsSelected[0]])
  useEffect(() => {
    if (isResPrevalence) {
      dispatch(setPrevalenceMapViewOptionsSelected(resistanceOptions[0] ? [resistanceOptions[0]] : []));
    } else {
      // dispatch(setPrevalenceMapViewOptionsSelected(genotypesDrugsData.slice(0, 1).map((x) => x.name)));
      let firstMatch = genotypesDrugsData.find(item => item.name.includes(selectedLineages));
      if(organism === 'sentericaints')
        firstMatch = genotypesDrugsData.find(item => item.name.includes((selectedLineages.includes('Enteritidis') ? 'iE' : 'iT')));
      console.log("firstMatch", firstMatch)
      if (firstMatch) {
        dispatch(setPrevalenceMapViewOptionsSelected([firstMatch.name]));
      } 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genotypesDrugsData, isResPrevalence, resistanceOptions, selectedLineages]);

  const placeholder = useMemo(() => {
    if (prevalenceMapViewOptionsSelected.length) {
      return 'Type to search...';
    }

    if (isResPrevalence) {
      return '0 drugs selected';
    }

    if (organism === 'shige' || organism === 'decoli') {
      return '0 lineage selected';
    }

    return '0 genotype selected';
  }, [prevalenceMapViewOptionsSelected.length, isResPrevalence, organism]);

  const infoIconText = useMemo(() => {
    if (Object.keys(INFO_ICON_TEXTS).includes(organism) && !isResPrevalence) {
      return INFO_ICON_TEXTS[organism];
    }
    return 'Select up to 10 to display';
  }, [isResPrevalence, organism]);

  const heading = useMemo(() => {
    if (isResPrevalence) {
      return 'Select Drug';
    }

    if (['decoli', 'shige', 'sentericaints'].includes(organism)) {
      return 'Select Lineage';
    }
    if (['kpneumo'].includes(organism)) {
      return 'Select ST';
    }

    return 'Select Genotype';
  }, [isResPrevalence, organism]);

  const label = useMemo(() => {
    if (isResPrevalence) {
      return `${open ? 'Close' : 'Open'} drug selector`;
    }

    if (['shige', 'decoli', 'sentericaints'].includes(organism)) {
      return `${open ? 'Close' : 'Open'} lineage selector`;
    }
    if (['kpneumo'].includes(organism)) {
      return `${open ? 'Close' : 'Open'} ST selector`;
    }

    return `${open ? 'Close' : 'Open'} genotype selector`;
  }, [isResPrevalence, open, organism]);

  const getOptionLabel = useCallback(
    (item) => {
      if (isResPrevalence) {
        return item;
      }

      const matchingItem = genotypesDrugsData.find((g) => g.name === item);

      const totalCount = matchingItem?.totalCount ?? 0;
      const susceptiblePercentage = (matchingItem?.Pansusceptible / totalCount || 0) * 100;

      if (['decoli', 'shige', 'sentericaints'].includes(organism)) {
        return `${item} (total N=${totalCount})`;
      }

      return `${item} (total N=${totalCount}, ${susceptiblePercentage.toFixed(2)}% Pansusceptible)`;
    },
    [genotypesDrugsData, isResPrevalence, organism],
  );

  function getOptionDisabled(option) {
    if (isResPrevalence)
      return prevalenceMapViewOptionsSelected.length >= 1 && !prevalenceMapViewOptionsSelected.includes(option);
    return prevalenceMapViewOptionsSelected.length >= 10 && !prevalenceMapViewOptionsSelected.includes(option);
  }

  function handleAutocompleteChange(_, newValue) {
    if (prevalenceMapViewOptionsSelected.length === 10 && newValue.length > 10) {
      return;
    }

    dispatch(setPrevalenceMapViewOptionsSelected(newValue));
  }

  function handleClick() {
    setOpen((prev) => !prev);
  }

  return (
    <Box className={`${classes.topRightControls}`}>
      <FormControlLabel
        className={classes.font}
        control={<Switch checked={open} onChange={handleClick} size="small" />}
        label={<Typography className={classes.font}>{label}</Typography>}
      />
      <Typography>{openTypho}</Typography>
      <Collapse in={open}>
        <Card elevation={3} className={classes.card}>
          <CardContent className={classes.frequenciesGraph}>
            <div className={classes.label}>
              <Typography variant="caption">{heading}</Typography>
              <Tooltip title={infoIconText} placement="top">
                <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
              </Tooltip>
            </div>
            <FormControl fullWidth>
              <Autocomplete
                multiple
                disableCloseOnSelect
                value={prevalenceMapViewOptionsSelected}
                options={isResPrevalence ? resistanceOptions : genotypesDrugsData.map((data) => data.name)}
                onChange={handleAutocompleteChange}
                limitTags={1}
                getOptionDisabled={getOptionDisabled}
                renderInput={(params) => <TextField {...params} variant="standard" placeholder={placeholder} />}
                renderOption={(props, option, { selected }) => {
                  const { key, ...optionProps } = props;
                  if (organism === 'shige' || organism === 'decoli'){
                    // if (selectedLineages.some(lineage => option.includes(lineage))) {
                      if (option.includes(selectedLineages)) {
                      return (
                        <li key={option} {...optionProps}>
                          <Checkbox
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            sx={{ marginRight: '8px', padding: 0 }}
                            checked={selected}
                          />
                          {getOptionLabel(option)}
                        </li>
                      );
                    } 
                  }else if (organism === 'sentericaints'){

                      if (option.includes((selectedLineages.includes('Enteritidis') ? 'iE' : 'iT'))) {
                      return (
                        <li key={option} {...optionProps}>
                          <Checkbox
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            sx={{ marginRight: '8px', padding: 0 }}
                            checked={selected}
                          />
                          {getOptionLabel(option)}
                        </li>
                      );
                    } 
                  }else {
                      return (
                      <li key={key} {...optionProps}>
                        <Checkbox
                          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                          checkedIcon={<CheckBoxIcon fontSize="small" />}
                          sx={{ marginRight: '8px', padding: 0 }}
                          checked={selected}
                        />
                        {getOptionLabel(option)}
                      </li>
                    );
                    }
                }}
                renderTags={(value, getTagProps) => (
                  <Box sx={{ maxHeight: 50, overflowY: 'auto' }}>
                    {value.map((option, index) => (
                      <Chip key={index} label={option} {...getTagProps({ index })} />
                    ))}
                  </Box>
                )}
              />
            </FormControl>
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  );
};
