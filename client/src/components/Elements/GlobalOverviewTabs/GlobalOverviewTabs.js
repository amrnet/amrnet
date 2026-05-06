// Global Overview top-of-dashboard panel.
//
// Production: renders the existing <Map /> directly — no behavioural change.
// Development: renders a two-tab interface
//     Tab 1 "Map"      → existing <Map /> (default)
//     Tab 2 "Bar plot" → <StratifiedResistanceGraph mode="source" />
//                        for organisms with One Health source data, or
//                        a "no data" notice for the rest.
//
// The dev-only gate uses isProduction() so the prod build is unchanged.

import { Box, Card, CardContent, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../stores/hooks';
import { isProduction } from '../../../util/env';
import { Map } from '../Map';
import { StratifiedResistanceGraph } from '../Graphs/StratifiedResistanceGraph';
import { useStyles } from './GlobalOverviewTabsMUI';

// Organisms that have source_niche / source_type populated in MongoDB.
// Mirrors the AMR Insights One Health Source tab's onlyFor list.
const ORGANISMS_WITH_SOURCE_DATA = ['senterica', 'sentericaints', 'ecoli', 'decoli', 'shige'];

export const GlobalOverviewTabs = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  // Production keeps the current single-Map layout untouched.
  if (isProduction()) {
    return <Map />;
  }

  return <DevOverviewTabs classes={classes} t={t} />;
};

// Extracted so React hooks aren't called conditionally above.
const DevOverviewTabs = ({ classes, t }) => {
  const [tab, setTab] = useState('map');
  const organism = useAppSelector(state => state.dashboard.organism);
  const hasSourceData = ORGANISMS_WITH_SOURCE_DATA.includes(organism);

  const handleChangeTab = (_event, newValue) => setTab(newValue);

  return (
    <Box className={classes.wrapper}>
      <Tabs
        value={tab}
        onChange={handleChangeTab}
        className={classes.tabsBar}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab value="map" label={t('globalOverview.tabs.map')} className={classes.tab} />
        <Tab value="barplot" label={t('globalOverview.tabs.barplot')} className={classes.tab} />
      </Tabs>

      {/* Both panels stay mounted with display toggling so internal state
          (e.g., map zoom, collapse) survives tab switches. */}
      <Box sx={{ display: tab === 'map' ? 'block' : 'none' }}>
        <Map />
      </Box>
      <Box sx={{ display: tab === 'barplot' ? 'block' : 'none' }}>
        <Card className={classes.card}>
          {hasSourceData ? (
            <StratifiedResistanceGraph mode="source" />
          ) : (
            <CardContent className={classes.emptyState}>
              <Typography color="text.secondary" align="center">
                {t('globalOverview.tabs.barplotNoData')}
              </Typography>
            </CardContent>
          )}
        </Card>
      </Box>
    </Box>
  );
};
