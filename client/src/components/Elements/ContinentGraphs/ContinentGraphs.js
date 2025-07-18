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
  CircularProgress,
} from '@mui/material';
import { useStyles } from './ContinentGraphsMUI';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCollapse } from '../../../stores/slices/graphSlice';
import { cloneElement, useEffect, useMemo, useState } from 'react';
import { isTouchDevice } from '../../../util/isTouchDevice';
import { continentGraphCard } from '../../../util/graphCards';
import { BubbleGeographicGraph } from './BubbleGeographicGraph';
import { ExpandLess, ExpandMore, FilterList, FilterListOff, CameraAlt } from '@mui/icons-material';
import { imgOnLoadPromise } from '../../../util/imgOnLoadPromise';
import download from 'downloadjs';
import domtoimage from 'dom-to-image';
import LogoImg from '../../../assets/img/logo-prod.png';
import { DownloadMapViewData } from '../Map/MapActions/DownloadMapViewData';

const TABS = [
  {
    label: 'Heatmap',
    value: 'BG',
    disabled: false,
    component: <BubbleGeographicGraph />,
    notShow: [],
  },
  // {
  //   label: 'Trend line',
  //   value: 'TL',
  //   disabled: false,
  //   component: <TrendLineGraph />,
  //   notShow: [],
  // },
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
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const collapses = useAppSelector(state => state.graph.collapses);
  const organism = useAppSelector(state => state.dashboard.organism);
  const loadingData = useAppSelector(state => state.dashboard.loadingData);
  const loadingMap = useAppSelector(state => state.map.loadingMap);
  const actualTimeInitial = useAppSelector(state => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector(state => state.dashboard.actualTimeFinal);
  const dataset = useAppSelector(state => state.map.dataset);
  const globalOverviewLabel = useAppSelector(state => state.dashboard.globalOverviewLabel);
  const actualGenomes = useAppSelector(state => state.dashboard.actualGenomes);
  const selectedLineages = useAppSelector(state => state.dashboard.selectedLineages);

  useEffect(() => {
    setShowFilter(!matches500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organism]);

  const showFilterFull = useMemo(() => {
    return showFilter && !loadingData && !loadingMap;
  }, [loadingData, loadingMap, showFilter]);

  const filteredTABS = useMemo(() => TABS.filter(tab => !tab.notShow.includes(organism)), [organism]);

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

  async function handleClick(event) {
    event.stopPropagation();

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // const graph = document.getElementById('CVM');
      const graph = document.getElementById(currentTab);
      // Store original styles
      const originalOverflow = graph.style.overflow;
      const originalWidth = graph.style.width;

      // Temporarily expand the graph to its full scrollable width
      graph.style.overflow = 'visible';
      graph.style.width = graph.scrollWidth + 'px';

      await new Promise(resolve => setTimeout(resolve, 200)); // allow layout update

      const graphImg = document.createElement('img');
      const graphImgPromise = imgOnLoadPromise(graphImg);

      graphImg.src = await domtoimage.toPng(graph, { quality: 0.1, bgcolor: 'white' });

      await graphImgPromise;

      // Restore original styles
      graph.style.overflow = originalOverflow;
      graph.style.width = originalWidth;

      let heightFactor = 0;
      ///TODO: improve the code below as its hardcode
      // canvas.width = 1200;

      canvas.width = graphImg.width < 670 ? 922 : graphImg.width + 100;
      console.log('canvas.width', canvas.width, graphImg.width);
      // canvas.height = graphImg.height + 220 + ('CVM' ? 250 : heightFactor);
      canvas.height = graphImg.height + 220 + ('BG' ? 250 : heightFactor);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const logo = document.createElement('img');
      const logoPromise = imgOnLoadPromise(logo);
      logo.src = LogoImg;
      await logoPromise;

      ctx.drawImage(logo, 10, 10, 155, 80);
      ctx.drawImage(graphImg, canvas.width / 2 - graphImg.width / 2, 220);

      ctx.font = 'bold 18px Montserrat';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.fillText('Geographic Comparisons', canvas.width / 2, 50);

      ctx.font = '12px Montserrat';
      // ctx.fillText(currentCard.description.join(' / '), canvas.width / 2, 72);

      ctx.font = '14px Montserrat';
      ctx.fillText(`Organism: ${globalOverviewLabel.stringLabel}`, canvas.width / 2, 110);
      ctx.fillText(`Dataset: ${dataset}`, canvas.width / 2, 132);

      ctx.fillText(`Time period: ${actualTimeInitial} to ${actualTimeFinal}`, canvas.width / 2, 154);
      ctx.fillText(`Total: ${actualGenomes} genomes`, canvas.width / 2, 174);

      const getAxisLabel = () => {
        switch (organism) {
          case 'decoli':
          case 'shige':
            return `Selected Pathotypes : ${selectedLineages.join(', ')}`;
          case 'sentericaints':
            return `Selected Serotypes : ${selectedLineages.join(', ')}`;
          // case 'ecoli':
          //   return `Selected Genotypes : ${selectedLineages.join(', ')}`;
          default:
            return '';
        }
      };

      ctx.fillText(`${getAxisLabel()} `, canvas.width / 2, 210);
      ctx.fillStyle = 'white';
      ctx.textAlign = 'start';
      ctx.font = '12px Montserrat';

      const base64 = canvas.toDataURL();
      await download(base64, `AMRnet - ${globalOverviewLabel.stringLabel}.png`);
    } catch {
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  }
  function datasetStatemnet() {
    switch (dataset) {
      case 'Local':
        return 'isolated locally in-country only';
      case 'Travel':
        return 'travel cases isolated out-of-country only';
      default:
        return '';
    }
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
                  {
                    <div>
                      Data are restricted to the Global filters selected (Year {actualTimeInitial} - {actualTimeFinal}){' '}
                      {datasetStatemnet()}, and regions/countries with N≥20 passing these filters.
                    </div>
                  }
                </Typography>
              )}
            </div>
          </div>
          <div className={classes.actionsWrapper}>
            {collapses['continent'] && (
              <>
                <Tooltip title="Download Data" placement="top">
                  <IconButton
                    className={classes.actionButton}
                    color="primary"
                    disabled={organism === 'none'}
                    onClick={e => e.stopPropagation()}
                  >
                    <DownloadMapViewData fontSize="inherit" value={currentTab} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download Chart as PNG" placement="top">
                  <span>
                    <IconButton color="primary" onClick={event => handleClick(event)} disabled={organism === 'none'}>
                      {loading ? <CircularProgress color="primary" size={24} /> : <CameraAlt />}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={showFilter ? 'Hide Filters' : 'Show Filters'} placement="top">
                  <span>
                    <IconButton color="primary" onClick={event => handleClickFilter(event)}>
                      {showFilter ? <FilterListOff /> : <FilterList />}
                    </IconButton>
                  </span>
                </Tooltip>
              </>
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
            {filteredTABS.map(card => {
              return (
                <Box
                  key={`card-${card.value}`}
                  sx={{
                    // visibility: currentTab === card.value ? 'visible' : 'hidden',
                    position: currentTab === card.value ? 'relative' : 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                  }}
                  zIndex={currentTab === card.value ? 1 : -100}
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
