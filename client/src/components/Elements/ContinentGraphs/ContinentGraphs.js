import { CameraAlt, ExpandLess, ExpandMore, FilterList, FilterListOff } from '@mui/icons-material';
import {
  Alert,
  Box,
  Card,
  CardActions,
  CircularProgress,
  Collapse,
  IconButton,
  Snackbar,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import domtoimage from 'dom-to-image';
import download from 'downloadjs';
import { cloneElement, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LogoImg from '../../../assets/img/logo-prod.png';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setCollapse } from '../../../stores/slices/graphSlice';
import { getContinentGraphCard } from '../../../util/graphCards';
import { imgOnLoadPromise } from '../../../util/imgOnLoadPromise';
import { isTouchDevice } from '../../../util/isTouchDevice';
import { DownloadMapViewData } from '../Map/MapActions/DownloadMapViewData';
import { BubbleGeographicGraph } from './BubbleGeographicGraph';
import { useStyles } from './ContinentGraphsMUI';

const TABS = [
  {
    labelKey: 'continentGraphs.tabs.heatmap',
    value: 'BG',
    disabled: false,
    component: <BubbleGeographicGraph />,
    notShow: [],
  },
];

export const ContinentGraphs = () => {
  const classes = useStyles();
  const matches500 = useMediaQuery('(max-width:500px)');
  const [showAlert, setShowAlert] = useState(false);
  const [currentTab, setCurrentTab] = useState(TABS[0].value);
  const [showFilter, setShowFilter] = useState(!matches500);
  const [loading, setLoading] = useState(false);
  const matches1000 = useMediaQuery('(max-width:1000px)');
  const { t } = useTranslation();

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
  const drugClass = useAppSelector(state => state.graph.drugClass); // Drug class selected in the graph for SS
  const drugGene = useAppSelector(state => state.graph.drugGene); // Drug gene selected in the graph for SS
  // coloredOptions is used to draw the legend in the Trend Line graph
  const coloredOptions = useAppSelector(state => state.graph.coloredOptions);
  const yAxisType = useAppSelector(state => state.map.yAxisType);
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

  if (!getContinentGraphCard(t).organisms.includes(organism)) {
    return null;
  }
  // This is a component that renders the continent graphs legends based on the selected organism
  function drawLegend({ legendData, context, factor, mobileFactor, yPosition, xSpace }) {
    legendData.forEach((legend, i) => {
      const yFactor = (i % factor) * 24;
      const xFactor = Math.floor(i / factor) * xSpace;
      context.textAlign = 'left';
      context.fillStyle = legend.color;
      context.beginPath();
      context.arc(52 + xFactor, yPosition - mobileFactor + yFactor, 5, 0, 2 * Math.PI);
      context.fill();
      context.closePath();
      context.fillStyle = 'black';
      context.fillText(legend.name, 52 + xFactor + 12, yPosition + 4 - mobileFactor + yFactor);
    });
  }

  async function handleClick(event) {
    event.stopPropagation();

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

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
      const legendImg = document.createElement('img');
      const legendPromise = imgOnLoadPromise(legendImg);
      legendImg.src = '/legends/HeatMapLegend.png';
      await legendPromise;

      graphImg.src = await domtoimage.toPng(graph, { quality: 0.1, bgcolor: 'white' });

      await graphImgPromise;

      // Restore original styles
      graph.style.overflow = originalOverflow;
      graph.style.width = originalWidth;

      const heightFactor = 0;
      ///TODO: improve the code below as its hardcode
      // canvas.width = 1200;

      canvas.width = graphImg.width < 670 ? 922 : graphImg.width + 100;
      // console.log('canvas.width', canvas.width, graphImg.width);
      canvas.height = graphImg.height + 520 + ('BG' ? 250 : heightFactor); // BG is replaced from CVM for BubbleGeographicGraph
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const logo = document.createElement('img');
      const logoPromise = imgOnLoadPromise(logo);
      logo.src = LogoImg;
      await logoPromise;

      ctx.drawImage(logo, 10, 10, 155, 80);
      ctx.drawImage(graphImg, canvas.width / 2 - graphImg.width / 2, 220);
      ctx.drawImage(legendImg, canvas.width/1.5, 200);        


      ctx.font = 'bold 18px Montserrat';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.fillText(t('continentGraphs.pdf.title'), canvas.width / 2, 50);

      ctx.font = '12px Montserrat';
      // ctx.fillText(currentCard.description.join(' / '), canvas.width / 2, 72);

      ctx.font = '14px Montserrat';
      ctx.fillText(
        t('continentGraphs.pdf.organism', { label: globalOverviewLabel.stringLabel }),
        canvas.width / 2,
        110,
      );
      ctx.fillText(t('continentGraphs.pdf.dataset', { label: dataset }), canvas.width / 2, 132);

      ctx.fillText(
        t('continentGraphs.pdf.timePeriod', { start: actualTimeInitial, end: actualTimeFinal }),
        canvas.width / 2,
        154,
      );
      ctx.fillText(t('continentGraphs.pdf.totalGenomes', { count: actualGenomes }), canvas.width / 2, 174);
      ctx.fillText(t('continentGraphs.pdf.drugGene', { drugClass, gene: drugGene }), canvas.width / 2, 194);

      // This is a component that renders the continent graphs legends based on the selected organism

      if (currentTab === 'TL') {
        ctx.fillStyle = 'white';
        const whiteBoxY = graphImg.height * 0.73 + 220;
        ctx.fillRect(0, whiteBoxY, canvas.width, canvas.height);
        const variablesFactor = Math.ceil(coloredOptions.length / 3);
        let heightFactor = 0;
        heightFactor += variablesFactor * 22;

        const mobileFactor = matches1000 ? 100 : 0;
        drawLegend({
          legendData: coloredOptions,
          context: ctx,
          factor: variablesFactor,
          mobileFactor,
          yPosition: 670,
          xSpace: 270,
        });
      }
      const getAxisLabel = () => {
        switch (organism) {
          case 'decoli':
          case 'shige':
            return `Selected Pathotypes : ${selectedLineages.join(', ')}`;
          case 'sentericaints':
          case 'kpneumo':
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
      await download(
        base64,
        `AMRnet - ${globalOverviewLabel.stringLabel}_Geographic_Comparisons_${yAxisType}_prevalence .png`,
      );
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
            {getContinentGraphCard(t).icon}
            <div className={classes.title}>
              <Typography fontSize="18px" fontWeight="500">
                {getContinentGraphCard(t).title}
              </Typography>
              {collapses['continent'] && (
                <Typography fontSize="10px" component="span">
                  {currentTab.includes('TL') && <div>{t('continentGraphs.plottedYears')}</div>}
                  {
                    <div>
                      {t('continentGraphs.restrictedData', {
                        start: actualTimeInitial,
                        end: actualTimeFinal,
                        dataset: datasetStatemnet(),
                      })}
                    </div>
                  }
                </Typography>
              )}
            </div>
          </div>
          <div className={classes.actionsWrapper}>
            {collapses['continent'] && (
              <>
                <Tooltip title={t('continentGraphs.tooltip.downloadData')} placement="top">
                  <IconButton
                    className={classes.actionButton}
                    color="primary"
                    disabled={organism === 'none'}
                    onClick={e => e.stopPropagation()}
                  >
                    <DownloadMapViewData fontSize="inherit" value={currentTab} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('continentGraphs.tooltip.downloadChart')} placement="top">
                  <span>
                    <IconButton color="primary" onClick={event => handleClick(event)} disabled={organism === 'none'}>
                      {loading ? <CircularProgress color="primary" size={24} /> : <CameraAlt />}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip
                  title={
                    showFilter ? t('continentGraphs.tooltip.hideFilters') : t('continentGraphs.tooltip.showFilters')
                  }
                  placement="top"
                >
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
                  label={t(tab.labelKey)}
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
          {t('continentGraphs.alert.downloadError')}
        </Alert>
      </Snackbar>
    </div>
  );
};
