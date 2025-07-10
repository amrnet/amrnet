import { useStyles } from './TopLeftControlsMUI';
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setDataset, setDatasetKP } from '../../../../stores/slices/mapSlice.ts';
import {
  setActualTimeFinal,
  setActualTimeInitial,
  setCanFilterData,
  setSelectedLineages,
} from '../../../../stores/slices/dashboardSlice';
import { amrLikeOrganisms } from '../../../../util/organismsCards';
import { useEffect, useState } from 'react';

const datasetOptions = ['All', 'Local', 'Travel'];

export const TopLeftControls = ({ style, closeButton = null, title = 'Filters' }) => {
  const classes = useStyles();
  const matches = useMediaQuery('(max-width:700px)');
  const [currentSelectedLineages, setCurrentSelectedLineages] = useState([]);

  const dispatch = useAppDispatch();
  const dataset = useAppSelector(state => state.map.dataset);
  const datasetKP = useAppSelector(state => state.map.datasetKP);
  const actualTimeInitial = useAppSelector(state => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector(state => state.dashboard.actualTimeFinal);
  const years = useAppSelector(state => state.dashboard.years);
  const pathovar = useAppSelector(state => state.dashboard.pathovar);
  const organism = useAppSelector(state => state.dashboard.organism);
  const selectedLineages = useAppSelector(state => state.dashboard.selectedLineages);

  useEffect(() => {
    setCurrentSelectedLineages(selectedLineages);
  }, [selectedLineages]);

  function handleChangeST(_event, newValue) {
    if (newValue !== null) {
      dispatch(setDataset(newValue));
      dispatch(setCanFilterData(true));
    }
  }

  function handleChangeKP(_event, newValue) {
    if (newValue !== null) {
      dispatch(setDatasetKP(newValue));
      dispatch(setCanFilterData(true));
    }
  }

  function handleChangeInitial(_event, child) {
    dispatch(setActualTimeInitial(child.props.value));
    dispatch(setCanFilterData(true));
  }

  function handleChangeFinal(_event, child) {
    dispatch(setActualTimeFinal(child.props.value));
    dispatch(setCanFilterData(true));
  }

  function handleChangeLineages(_, newValue) {
    if (newValue === null) {
      return;
    }

    dispatch(setSelectedLineages(newValue === 'all' ? pathovar : [newValue]));
    dispatch(setCanFilterData(true));
  }

  function isAllOption(option) {
    return ['Clear All', 'Select All'].includes(option);
  }

  function handleChangeMultiLineages(event, value) {
    if (event.type === 'keydown') {
      return;
    }

    if (!value.includes('Clear All') && !value.includes('Select All')) {
      setCurrentSelectedLineages(value);
      return;
    }

    if (value.includes('Clear All')) {
      setCurrentSelectedLineages([]);
      return;
    }

    if (value.includes('Select All')) {
      setCurrentSelectedLineages(pathovar);
    }
  }

  function handleCloseLineages(_) {
    if (
      currentSelectedLineages.length !== selectedLineages.length ||
      currentSelectedLineages.some(item => !selectedLineages.includes(item))
    ) {
      dispatch(setSelectedLineages(currentSelectedLineages));
      dispatch(setCanFilterData(true));
    }
  }

  return (
    <div className={`${classes.topLeftControls} ${matches && !closeButton ? classes.bp700 : ''}`} style={style}>
      <Card elevation={3} className={classes.card}>
        <CardContent className={classes.cardContent}>
          <div className={classes.titleWrapper}>
            <Typography variant="h6">Global Filter</Typography>
            {closeButton}
          </div>
          <Typography variant="caption">Applied to all plots</Typography>
          {organism !== 'styphi' ? null : (
            <div className={classes.datasetWrapper}>
              <Typography gutterBottom variant="caption">
                Select dataset
              </Typography>
              <ToggleButtonGroup value={dataset} exclusive size="small" onChange={handleChangeST}>
                {datasetOptions.map((option, index) => (
                  <ToggleButton key={`dataset-${index}`} value={option} color="primary">
                    {option}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>
          )}
          {organism !== 'kpneumo' ? null : (
            <div className={classes.datasetWrapper}>
              <ToggleButtonGroup value={datasetKP} exclusive size="small" onChange={handleChangeKP}>
                <ToggleButton value="All" color="primary">
                  ALL
                </ToggleButton>
                <ToggleButton value="ESBL" color="primary">
                  ESBL+
                </ToggleButton>
                <ToggleButton value="Carbapenems" color="primary">
                  CARB+
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          )}
          {!amrLikeOrganisms.filter(x => !['ecoli', 'senterica'].includes(x)).includes(organism) ? null : (
            <div className={classes.datasetWrapper}>
              <Typography gutterBottom variant="caption">
                {organism === 'sentericaints' ? 'Select serotype' : 'Select pathotype'}
              </Typography>
              {organism === 'decoli' ? (
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  value={currentSelectedLineages}
                  options={
                    currentSelectedLineages.length === pathovar.length
                      ? ['Clear All', ...pathovar]
                      : ['Select All', ...pathovar]
                  }
                  onChange={handleChangeMultiLineages}
                  onClose={handleCloseLineages}
                  limitTags={1}
                  clearIcon={null}
                  renderInput={params => <TextField {...params} variant="standard" placeholder="Select..." />}
                  slotProps={{
                    popper: { placement: 'bottom-start', style: { width: 'fit-content' } },
                  }}
                  renderOption={(props, option, { selected }) => {
                    const { key, ...optionProps } = props;
                    const isAllButton = isAllOption(option);
                    return (
                      // eslint-disable-next-line jsx-a11y/role-supports-aria-props
                      <li
                        key={key}
                        {...optionProps}
                        aria-selected={isAllButton ? false : selected}
                        className={`${optionProps.className} ${classes.lineageLi}`}
                      >
                        {!isAllButton && (
                          <Checkbox
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            sx={{ marginRight: '8px', padding: 0 }}
                            checked={selected}
                          />
                        )}
                        {option}
                      </li>
                    );
                  }}
                  renderTags={(value, getTagProps) => (
                    <Box sx={{ maxHeight: 80, overflowY: 'auto' }}>
                      {value.map((option, index) => (
                        <Chip key={index} label={option} {...getTagProps({ index })} onDelete={undefined} />
                      ))}
                    </Box>
                  )}
                  sx={{
                    '@media (min-width: 700px)': {
                      maxWidth: '165px',
                    },
                    '& .MuiAutocomplete-tag': {
                      maxHeight: 30,
                    },
                    '& .MuiAutocomplete-inputRoot': {
                      paddingRight: '0px !important',
                    },
                    '& .MuiAutocomplete-inputRoot .MuiAutocomplete-input': {
                      width: '100% !important',
                    },
                  }}
                />
              ) : (
                <>
                  <ToggleButtonGroup
                    value={selectedLineages.length === pathovar.length ? 'all' : selectedLineages[0]}
                    size="small"
                    onChange={handleChangeLineages}
                    orientation="vertical"
                    exclusive
                  >
                    <ToggleButton value="all" color="primary" className={classes.toggleButton}>
                      All
                    </ToggleButton>
                    {pathovar.map((option, index) => (
                      <ToggleButton
                        key={`dataset-${index}`}
                        value={option}
                        color="primary"
                        className={classes.toggleButton}
                      >
                        {option}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </>
              )}
            </div>
          )}
          <div className={classes.yearsWrapper}>
            <div className={classes.yearWrapper}>
              <Typography gutterBottom variant="caption">
                Start year
              </Typography>
              <Select
                variant="standard"
                inputProps={{ className: classes.selectInput }}
                MenuProps={{
                  classes: {
                    paper: classes.menuPaper,
                    list: classes.selectMenu,
                  },
                }}
                value={actualTimeInitial}
                onChange={handleChangeInitial}
                fullWidth
                disabled={organism === 'none'}
              >
                {years
                  .filter(year => year <= actualTimeFinal)
                  .map((year, index) => {
                    return (
                      <MenuItem key={`initial-year-${index}`} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
              </Select>
            </div>
            <Divider orientation="vertical" flexItem />
            <div className={classes.yearWrapper}>
              <Typography gutterBottom variant="caption">
                End year
              </Typography>
              <Select
                variant="standard"
                inputProps={{ className: classes.selectInput }}
                MenuProps={{
                  classes: {
                    paper: classes.menuPaper,
                    list: classes.selectMenu,
                  },
                }}
                value={actualTimeFinal}
                onChange={handleChangeFinal}
                fullWidth
                disabled={organism === 'none'}
              >
                {years
                  .filter(year => year >= actualTimeInitial)
                  .map((year, index) => {
                    return (
                      <MenuItem key={`final-year-${index}`} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
