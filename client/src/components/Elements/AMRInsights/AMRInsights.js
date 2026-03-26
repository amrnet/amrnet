import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActions,
  Collapse,
  IconButton,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { cloneElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCollapse } from '../../../stores/slices/graphSlice';
import { isTouchDevice } from '../../../util/isTouchDevice';
import { InsightsActions } from './InsightsActions';
import { ATBCorrelationGraph } from '../Graphs/ATBCorrelationGraph';
import { CooccurrenceGraph } from '../Graphs/CooccurrenceGraph';
import { ConvergenceMapGraph } from '../Graphs/ConvergenceMapGraph';
import { GeneMapGraph } from '../Graphs/GeneMapGraph';
import { GenomicVsPhenotypicGraph } from '../Graphs/GenomicVsPhenotypicGraph';
import { QRDRPathwayGraph } from '../Graphs/QRDRPathwayGraph';
import { SerotypeResistanceGraph } from '../Graphs/SerotypeResistanceGraph';
import { useStyles } from './AMRInsightsMUI';

const TABS = [
  {
    labelKey: 'amrInsights.tabs.genomicVsPhenotypic',
    value: 'GVP',
    component: <GenomicVsPhenotypicGraph />,
  },
  {
    labelKey: 'amrInsights.tabs.convergenceMap',
    value: 'CVM',
    component: <ConvergenceMapGraph />,
  },
  {
    labelKey: 'amrInsights.tabs.geneMap',
    value: 'GMP',
    component: <GeneMapGraph />,
  },
  {
    labelKey: 'amrInsights.tabs.qrdrPathway',
    value: 'QRDR',
    component: <QRDRPathwayGraph />,
  },
  {
    labelKey: 'amrInsights.tabs.serotypeResistance',
    value: 'SRT',
    component: <SerotypeResistanceGraph />,
  },
  {
    labelKey: 'amrInsights.tabs.cooccurrence',
    value: 'COO',
    component: <CooccurrenceGraph />,
  },
  {
    labelKey: 'amrInsights.tabs.atbCorrelation',
    value: 'ATB',
    component: <ATBCorrelationGraph />,
  },
];

export const AMRInsights = () => {
  const classes = useStyles();
  const matches500 = useMediaQuery('(max-width:500px)');
  const [currentTab, setCurrentTab] = useState('GVP');
  const [showFilter, setShowFilter] = useState(!matches500);
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const collapses = useAppSelector(state => state.graph.collapses);
  const organism = useAppSelector(state => state.dashboard.organism);
  const loadingData = useAppSelector(state => state.dashboard.loadingData);
  const loadingMap = useAppSelector(state => state.map.loadingMap);
  const actualTimeInitial = useAppSelector(state => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector(state => state.dashboard.actualTimeFinal);

  const showFilterFull = useMemo(() => {
    return showFilter && !loadingData && !loadingMap;
  }, [loadingData, loadingMap, showFilter]);

  function handleExpandClick() {
    dispatch(setCollapse({ key: 'insights', value: !(collapses['insights'] ?? false) }));
  }

  function handleChangeTab(_, newValue) {
    setCurrentTab(newValue);
  }

  function handleClickFilter(event) {
    event.stopPropagation();
    setShowFilter(!showFilter);
  }

  // Get current tab label for sharing
  const currentTabConfig = TABS.find(tab => tab.value === currentTab);
  const currentTabLabel = currentTabConfig ? t(currentTabConfig.labelKey) : 'AMR Insights';

  // Build CSV data from available Redux data based on current tab
  const drugsYearData = useAppSelector(state => state.graph.drugsYearData);
  const drugsCountriesData = useAppSelector(state => state.graph.drugsCountriesData);
  const rawOrganismData = useAppSelector(state => state.graph.rawOrganismData);

  const csvData = useMemo(() => {
    switch (currentTab) {
      case 'COO': // Co-occurrence — export drugsYearData
        return Array.isArray(drugsYearData) ? drugsYearData : [];
      case 'ATB': // ATB correlation — export drugsCountriesData for first available drug
      case 'GVP': { // Genomic vs Phenotypic
        if (!drugsCountriesData || typeof drugsCountriesData !== 'object') return [];
        const firstKey = Object.keys(drugsCountriesData)[0];
        return Array.isArray(drugsCountriesData[firstKey]) ? drugsCountriesData[firstKey] : [];
      }
      case 'GMP': // Gene map — export raw kpneumo data with gene fields
      case 'QRDR': // QRDR — export raw styphi data
      case 'SRT': // Serotype — export raw strepneumo data
      case 'CVM': // Convergence map — export raw kpneumo data
        return Array.isArray(rawOrganismData) ? rawOrganismData.slice(0, 5000) : []; // Cap at 5k rows for CSV
      default:
        return [];
    }
  }, [currentTab, drugsYearData, drugsCountriesData, rawOrganismData]);

  if (organism === 'none') return null;

  const isExpanded = collapses['insights'] ?? false;

  return (
    <div className={classes.cardsWrapper}>
      <Card className={classes.card}>
        <CardActions
          disableSpacing
          className={classes.cardActions}
          onClick={handleExpandClick}
          style={{ cursor: isTouchDevice() ? 'default' : 'pointer' }}
          sx={{ padding: isExpanded ? '16px 16px 0px !important' : '16px !important' }}
        >
          <div className={classes.titleWrapper}>
            <div className={classes.title}>
              <Typography fontSize="18px" fontWeight="500">
                {t('amrInsights.title')}
              </Typography>
              {isExpanded && (
                <Typography fontSize="10px" component="span">
                  <div>
                    {t('continentGraphs.restrictedData', {
                      start: actualTimeInitial,
                      end: actualTimeFinal,
                      dataset: '',
                    })}
                  </div>
                </Typography>
              )}
            </div>
          </div>
          <div className={classes.actionsWrapper}>
            {isExpanded && (
              <InsightsActions
                csvData={csvData}
                csvFilename={`AMRnet_${organism}_${currentTab}`}
                pngElementId="amr-insights-content"
                pngFilename={`AMRnet_${organism}_${currentTabLabel}`}
                organism={organism}
                currentTab={currentTab}
                tabLabel={currentTabLabel}
              />
            )}
            <IconButton>{isExpanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
          </div>
        </CardActions>

        {isExpanded && (
          <Tabs value={currentTab} onChange={handleChangeTab} variant="fullWidth">
            {TABS.map((tab, i) => (
              <Tab key={`insights-tab-${i}`} label={t(tab.labelKey)} value={tab.value} sx={{ flexGrow: 1 }} />
            ))}
          </Tabs>
        )}

        <Collapse in={isExpanded} timeout="auto">
          <Box id="amr-insights-content" className={classes.boxWrapper}>
            {TABS.map(card => (
              <Box
                key={`insights-card-${card.value}`}
                sx={{
                  position: currentTab === card.value ? 'relative' : 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                }}
                zIndex={currentTab === card.value ? 1 : -100}
              >
                {cloneElement(card.component, { showFilter: showFilterFull, setShowFilter })}
              </Box>
            ))}
          </Box>
        </Collapse>
      </Card>
    </div>
  );
};
