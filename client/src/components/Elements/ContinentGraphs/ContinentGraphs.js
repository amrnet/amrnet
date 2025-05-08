import {
  Alert,
  Box,
  Card,
  CardActions,
  Collapse,
  IconButton,
  Snackbar,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useStyles } from './ContinentGraphsMUI';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCollapse } from '../../../stores/slices/graphSlice';
import { cloneElement, useEffect, useMemo, useState } from 'react';
import { isTouchDevice } from '../../../util/isTouchDevice';
import { continentGraphCard } from '../../../util/graphCards';
import { BubbleGeographicGraph } from './BubbleGeographicGraph';
import { ExpandLess, ExpandMore, FilterList, FilterListOff } from '@mui/icons-material';
import { TrendLineGraph } from './TrendLineGraph';
import { amrLikeOrganisms } from '../../../util/organismsCards';

const TABS = [
  {
    label: 'Heatmap',
    value: 'BG',
    disabled: false,
    component: <BubbleGeographicGraph />,
    notShow: [],
  },
  {
    label: 'Trend line',
    value: 'TL',
    disabled: false,
    component: <TrendLineGraph />,
    notShow: amrLikeOrganisms,
  },
  // {
  //   label: 'Trend line 2',
  //   value: 'TL2',
  //   disabled: false,
  //   component: <TrendLineGraph2 />,
  // },
];

export const ContinentGraphs = () => {
  const classes = useStyles();
  const matches500 = useMediaQuery('(max-width:500px)');
  const [showAlert, setShowAlert] = useState(false);
  const [currentTab, setCurrentTab] = useState(TABS[0].value);
  const [showFilter, setShowFilter] = useState(!matches500);

  const dispatch = useAppDispatch();
  const collapses = useAppSelector((state) => state.graph.collapses);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const loadingData = useAppSelector((state) => state.dashboard.loadingData);
  const loadingMap = useAppSelector((state) => state.map.loadingMap);
  const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);

  useEffect(() => {
    setShowFilter(!matches500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organism]);

  const showFilterFull = useMemo(() => {
    return showFilter && !loadingData && !loadingMap;
  }, [loadingData, loadingMap, showFilter]);

  const filteredTABS = useMemo(() => TABS.filter((tab) => !tab.notShow.includes(organism)), [organism]);

  function handleCloseAlert() {
    setShowAlert(false);
  }

  function handleExpandClick() {
    dispatch(setCollapse({ key: 'continent', value: !collapses['continent'] }));
  }

  function handleChangeTab(_, newValue) {
    setCurrentTab(newValue);
  }

  function handleClickFilter(event) {
    event.stopPropagation();
    setShowFilter(!showFilter);
  }

  if (!continentGraphCard.organisms.includes(organism)) {
    return null;
  }

  return (
    <div className={classes.cardsWrapper}>
      <Card className={classes.card}>
        <CardActions
          disableSpacing
          className={classes.cardActions}
          onClick={handleExpandClick}
          style={{
            cursor: isTouchDevice() ? 'default' : 'pointer',
          }}
          sx={{ padding: collapses['continent'] ? '16px 16px 0px !important' : '16px !important' }}
        >
          <div className={classes.titleWrapper}>
            {continentGraphCard.icon}
            <div className={classes.title}>
              <Typography fontSize="18px" fontWeight="500">
                {continentGraphCard.title}
              </Typography>
              {collapses['continent'] && (
                <Typography fontSize="10px" component="span">
                  {currentTab.includes('TL') && <div>Data are plotted for years with N ≥ 10 genomes</div>}
                  {currentTab.includes('BG') && <div>Data are restricted to the Global filters selected (Year {actualTimeInitial} - {actualTimeFinal} )</div>}
                </Typography>
              )}
            </div>
          </div>
          <div className={classes.actionsWrapper}>
            {collapses['continent'] && (
              <Tooltip title={showFilter ? 'Hide Filters' : 'Show Filters'} placement="top">
                <span>
                  <IconButton color="primary" onClick={(event) => handleClickFilter(event)}>
                    {showFilter ? <FilterListOff /> : <FilterList />}
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <IconButton>{collapses['continent'] ? <ExpandLess /> : <ExpandMore />}</IconButton>
          </div>
        </CardActions>
        {collapses['continent'] && (
          <Tabs value={currentTab} onChange={handleChangeTab} variant="fullWidth">
            {filteredTABS.map((tab, i) => {
              return (
                <Tab
                  key={`geo-tab-${i}`}
                  label={tab.label}
                  value={tab.value}
                  sx={{ flexGrow: 1 }}
                  disabled={tab.disabled}
                />
              );
            })}
          </Tabs>
        )}

        <Collapse in={collapses['continent']} timeout="auto">
          <Box className={classes.boxWrapper}>
            {filteredTABS.map((card) => {
              return (
                <Box
                  key={`card-${card.value}`}
                  sx={{
                    visibility: currentTab === card.value ? 'visible' : 'hidden',
                    position: currentTab === card.value ? 'relative' : 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                  }}
                >
                  {cloneElement(card.component, { showFilter: showFilterFull, setShowFilter })}
                </Box>
              );
            })}
          </Box>
        </Collapse>
      </Card>
      <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          Something went wrong with the download, please try again later.
        </Alert>
      </Snackbar>
    </div>
  );
};
