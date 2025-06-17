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
import { setDataset, setCurrentSelectedLineages } from '../../../../stores/slices/mapSlice.ts';
import {
  setActualTimeFinal,
  setActualTimeInitial,
  setCanFilterData,
  setSelectedLineages,
} from '../../../../stores/slices/dashboardSlice';
import { amrLikeOrganisms } from '../../../../util/organismsCards';
import { useEffect, useState } from 'react';


const datasetOptions = ['All', 'Local', 'Travel'];

export const TopLeftControls = ({ style, closeButton = null, title = 'Plotting options' }) => {
  const classes = useStyles();
  const matches = useMediaQuery('(max-width:700px)');
  // currentSelectedLineages is created in redux to make it available for PDF and PNG exports
  // const [currentSelectedLineages, setCurrentSelectedLineages] = useState([]);

  const dispatch = useAppDispatch();
  const dataset = useAppSelector((state) => state.map.dataset);
  const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);
  const years = useAppSelector((state) => state.dashboard.years);
  const pathovar = useAppSelector((state) => state.dashboard.pathovar);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const selectedLineages = useAppSelector((state) => state.dashboard.selectedLineages);
  const currentSelectedLineages = useAppSelector((state) => state.map.currentSelectedLineages);

  useEffect(() => {
    dispatch(setCurrentSelectedLineages(selectedLineages));
  }, [selectedLineages, dispatch]);

  function handleChange(_event, newValue) {
    if (newValue !== null) {
      dispatch(setDataset(newValue));
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

  function isDisabled() {
    return organism !== 'styphi';
  }

  function isAllOption(option) {
    return ['Clear All', 'Select All'].includes(option);
  }

  function handleChangeMultiLineages(_, value) {
    if (!value.includes('Clear All') && !value.includes('Select All')) {
      if (organism === 'decoli') {
        dispatch(setCurrentSelectedLineages(value));
        return;
      }

      dispatch(setCurrentSelectedLineages([value[value.length - 1]]));
      return;
    }

    if (value.includes('Clear All')) {
      dispatch(setCurrentSelectedLineages([]));
      return;
    }

    if (value.includes('Select All')) {
      dispatch(setCurrentSelectedLineages(pathovar));
    }
  }

  function handleCloseLineages(_) {
    if (
      currentSelectedLineages.length !== selectedLineages.length ||
      currentSelectedLineages.some((item) => !selectedLineages.includes(item))
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
              <ToggleButtonGroup value={dataset} onChange={handleChange} disabled={isDisabled()}>
                {datasetOptions.map((option, index) => (
                  <ToggleButton key={`dataset-${index}`} value={option} color="primary">
                    {option}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>
          )}
          {!amrLikeOrganisms.includes(organism) ? null : (
            <div className={classes.datasetWrapper}>              
              {organism === 'decoli' ? (
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  value={currentSelectedLineages}
                  options={
                    currentSelectedLineages.length === pathovar.length
                      ? ['Clear All', ...pathovar]
                      : [...(organism === 'decoli' ? ['Select All'] : []), ...pathovar]
                  }
                  onChange={handleChangeMultiLineages}
                  onClose={handleCloseLineages}
                  limitTags={-1}
                  clearIcon={null}
                  renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select..." />}
                  slotProps={{ popper: { placement: 'bottom-start', style: { width: 'auto' } } }}
                  getOptionDisabled={(option) => {
                    if (['Clear All', 'Select All'].includes(option)) {
                      return false;
                    }
                    if (currentSelectedLineages.length === pathovar.length) {
                      return true;
                    }
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
                  <Typography gutterBottom variant="caption">
                    Select {organism === 'shige' ? 'pathotype' : 'serotype'}
                  </Typography>
                  <ToggleButtonGroup
                    value={selectedLineages[0]}
                    size="small"
                    onChange={handleChangeLineages}
                    orientation="vertical"
                    exclusive
                  >
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
                  .filter((year) => year <= actualTimeFinal)
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
                  .filter((year) => year >= actualTimeInitial)
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
