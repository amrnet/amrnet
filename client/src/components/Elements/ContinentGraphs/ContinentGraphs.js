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
} from '@mui/material';
import { useStyles } from './ContinentGraphsMUI';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCollapse } from '../../../stores/slices/graphSlice';
import { cloneElement, useEffect, useState } from 'react';
import { isTouchDevice } from '../../../util/isTouchDevice';
import { continentGraphCard } from '../../../util/graphCards';
import { BubbleGeographicGraph } from './BubbleGeographicGraph';
import { ExpandLess, ExpandMore, FilterList, FilterListOff } from '@mui/icons-material';
import { TrendLineGraph } from './TrendLineGraph';

const TABS = [
  {
    label: 'Heatmap',
    value: 'BG',
    disabled: false,
    component: <BubbleGeographicGraph />,
  },
  {
    label: 'Trend line',
    value: 'TL',
    disabled: false,
    component: <TrendLineGraph />,
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
  const [showAlert, setShowAlert] = useState(false);
  const [currentTab, setCurrentTab] = useState(TABS[0].value);
  const [showFilter, setShowFilter] = useState(false);

  const dispatch = useAppDispatch();
  const collapses = useAppSelector((state) => state.graph.collapses);
  const organism = useAppSelector((state) => state.dashboard.organism);

  useEffect(() => {
    setShowFilter(false);
  }, [organism]);

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
            {TABS.map((tab, i) => {
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
            {TABS.map((card) => {
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
                  {cloneElement(card.component, { showFilter, setShowFilter })}
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
