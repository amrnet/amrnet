import { Alert, Card, CardActions, Collapse, IconButton, Snackbar, Tab, Tabs, Typography } from '@mui/material';
import { useStyles } from './ContinentGraphsMUI';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCollapse } from '../../../stores/slices/graphSlice';
import { useState } from 'react';
import { isTouchDevice } from '../../../util/isTouchDevice';
import { continentGraphCard } from '../../../util/graphCards';
import { BubbleGeographicGraph } from './BubbleGeographicGraph';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { BubbleHeatmapGraph } from './BubbleHeatmapGraph';

const TABS = [
  {
    label: 'Heatmap',
    value: 'one',
    disabled: false,
  },
  {
    label: 'Trend line',
    value: 'two',
    disabled: true,
  },
  {
    label: 'Heatmap view for ST vs genotype',
    value: 'three',
    disabled: false,
  },
];

export const ContinentGraphs = () => {
  const classes = useStyles();
  const [showAlert, setShowAlert] = useState(false);
  const [currentTab, setCurrentTab] = useState('one');

  const dispatch = useAppDispatch();
  const collapses = useAppSelector((state) => state.graph.collapses);

  function handleCloseAlert() {
    setShowAlert(false);
  }

  function handleExpandClick() {
    dispatch(setCollapse({ key: 'continent', value: !collapses['continent'] }));
  }

  function handleChangeTab(_, newValue) {
    setCurrentTab(newValue);
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
          sx={{ padding: collapses[continentGraphCard.collapse] ? '16px 16px 0px !important' : '16px !important' }}
        >
          <div className={classes.titleWrapper}>
            {continentGraphCard.icon}
            <div className={classes.title}>
              <Typography fontSize="18px" fontWeight="500">
                {continentGraphCard.title}
              </Typography>
              {collapses[continentGraphCard.collapse] && (
                <Typography fontSize="10px" component="span">
                  {continentGraphCard.description.map((d, i) => (
                    <div key={`description-${i}`}>{d}</div>
                  ))}
                </Typography>
              )}
            </div>
          </div>
          <div className={classes.actionsWrapper}>
            <IconButton>{collapses[continentGraphCard.collapse] ? <ExpandLess /> : <ExpandMore />}</IconButton>
          </div>
        </CardActions>
        {collapses[continentGraphCard.collapse] && (
          <Tabs value={currentTab} onChange={handleChangeTab} variant="fullWidth" centered>
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

        <Collapse in={collapses[continentGraphCard.collapse]} timeout="auto">
          {currentTab === 'one' && <BubbleGeographicGraph />}
          {currentTab === 'three' && <BubbleHeatmapGraph />}
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
