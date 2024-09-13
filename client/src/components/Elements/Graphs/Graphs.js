import {
  Alert,
  Card,
  CardActions,
  CircularProgress,
  Collapse,
  IconButton,
  Snackbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useStyles } from './GraphsMUI';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { CameraAlt, ExpandLess, ExpandMore } from '@mui/icons-material';
import { setCollapse } from '../../../stores/slices/graphSlice';
import { DeterminantsGraph } from './DeterminantsGraph';
import { FrequenciesGraph } from './FrequenciesGraph';
import { DrugResistanceGraph } from './DrugResistanceGraph';
import { DistributionGraph } from './DistributionGraph';
import { useState } from 'react';
import { imgOnLoadPromise } from '../../../util/imgOnLoadPromise';
import domtoimage from 'dom-to-image';
import LogoImg from '../../../assets/img/logo-prod.png';
import download from 'downloadjs';
import { drugsST, drugsKP, drugsForDrugResistanceGraphST } from '../../../util/drugs';
import { colorsForKODiversityGraph, getColorForDrug } from './graphColorHelper';
import {
  colorForDrugClassesKP,
  colorForDrugClassesNG,
  colorForDrugClassesST,
  getColorForGenotype,
} from '../../../util/colorHelper';
import { TrendsKPGraph } from './TrendsKPGraph';
import { isTouchDevice } from '../../../util/isTouchDevice';
import { graphCards } from '../../../util/graphCards';
import { KODiversityGraph } from './KODiversityGraph';
import { ConvergenceGraph } from './ConvergenceGraph';
import { variablesOptions } from '../../../util/convergenceVariablesOptions';

export const Graphs = () => {
  const classes = useStyles();
  const matches1000 = useMediaQuery('(max-width:1000px)');
  // const matches750 = useMediaQuery('(max-width:750px)');
  const [showAlert, setShowAlert] = useState(false);
  const [chartLoadings, setCharLoadings] = useState({
    frequencies: false,
    drugResistance: false,
    determinants: false,
    distribution: false,
    trendsKP: false,
  });

  const dispatch = useAppDispatch();
  const collapses = useAppSelector((state) => state.graph.collapses);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const dataset = useAppSelector((state) => state.map.dataset);
  const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);
  const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);
  const determinantsGraphDrugClass = useAppSelector((state) => state.graph.determinantsGraphDrugClass);
  const trendsKPGraphDrugClass = useAppSelector((state) => state.graph.trendsKPGraphDrugClass);
  const KODiversityGraphView = useAppSelector((state) => state.graph.KODiversityGraphView);
  const globalOverviewLabel = useAppSelector((state) => state.dashboard.globalOverviewLabel);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const colorPallete = useAppSelector((state) => state.dashboard.colorPallete);
  const convergenceGroupVariable = useAppSelector((state) => state.graph.convergenceGroupVariable);
  const convergenceColourVariable = useAppSelector((state) => state.graph.convergenceColourVariable);
  const convergenceColourPallete = useAppSelector((state) => state.graph.convergenceColourPallete);
  const drugResistanceGraphView = useAppSelector((state) => state.graph.drugResistanceGraphView);
  const captureDRT = useAppSelector((state) => state.dashboard.captureDRT);
  const captureRFWG = useAppSelector((state) => state.dashboard.captureRFWG);
  const captureRDWG = useAppSelector((state) => state.dashboard.captureRDWG);
  const captureGD = useAppSelector((state) => state.dashboard.captureGD);
  const genotypesForFilterSelected = useAppSelector((state) => state.dashboard.genotypesForFilterSelected);

  function getOrganismCards() {
    return graphCards.filter((card) => card.organisms.includes(organism));
  }

  function getGenotypeColor(genotype) {
    return organism === 'styphi' ? getColorForGenotype(genotype) : colorPallete[genotype] || '#F5F4F6';
  }

  function getDrugClassesBars() {
    switch (organism) {
      case 'styphi':
        return colorForDrugClassesST[determinantsGraphDrugClass];
      case 'kpneumo':
        return colorForDrugClassesKP[determinantsGraphDrugClass];
      case 'ngono':
        return colorForDrugClassesNG[determinantsGraphDrugClass];
      default:
        return [];
    }
  }

  function drawLegend({
    legendData,
    context,
    factor,
    mobileFactor,
    yPosition,
    isGenotype = false,
    isDrug = false,
    isVariable = false,
    xSpace,
  }) {
    legendData.forEach((legend, i) => {
      const yFactor = (i % factor) * 24;
      const xFactor = Math.floor(i / factor) * xSpace;

      context.fillStyle = isGenotype
        ? getGenotypeColor(legend)
        : isDrug
        ? getColorForDrug(legend)
        : isVariable
        ? convergenceColourPallete[legend]
        : legend.color;
      context.beginPath();
      context.arc(52 + xFactor, yPosition - mobileFactor + yFactor, 5, 0, 2 * Math.PI);
      context.fill();
      context.closePath();
      context.fillStyle = 'black';
      context.fillText(
        isGenotype || isDrug || isVariable ? legend : legend.name,
        61 + xFactor,
        yPosition + 4 - mobileFactor + yFactor,
      );
    });
  }

  async function handleClickDownload(event, card) {
    event.stopPropagation();
    handleLoading(card.collapse, true);
    if ((card.id === 'DRT' && drugResistanceGraphView.length === 0) || (card.id === 'DRT' && captureDRT === false)) {
      handleLoading(card.id, false);
      alert('No drugs/classes selected to download or no data to download');
      return;
    }
    if (card.id === 'RFWG' && captureRFWG === false) {
      handleLoading(card.id, false);
      alert('No genotype selected to download or no data to download');
      return;
    }
    if ((card.id === 'RDWG' && captureRDWG === false) || (card.id === 'GD' && captureGD === false)) {
      handleLoading(card.id, false);
      alert('No data to download');
      return;
    }

    let orgBasedColumns, orgBasedSpace;
    if (organism === 'shige') {
      orgBasedColumns = 5;
      orgBasedSpace = 180;
    } else {
      orgBasedColumns = 6;
      orgBasedSpace = 140;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const graph = document.getElementById(card.id);
      const graphImg = document.createElement('img');
      const graphImgPromise = imgOnLoadPromise(graphImg);

      graphImg.src = await domtoimage.toPng(graph, { quality: 0.1, bgcolor: 'white' });

      await graphImgPromise;

      let heightFactor = 0,
        drugClassesBars,
        drugClassesFactor,
        genotypesFactor,
        variablesFactor;

      if (['RFWG', 'DRT'].includes(card.id)) {
        heightFactor = 250;
      } else if (['RDWG', 'CERDT'].includes(card.id)) {
        drugClassesBars = getDrugClassesBars();
        drugClassesFactor = Math.ceil(drugClassesBars.length / 4);
        heightFactor += drugClassesFactor * 22;
      } else if (card.id === 'GD') {
        genotypesFactor = Math.ceil(genotypesForFilterSelected.length / orgBasedColumns);
        heightFactor += genotypesFactor * 22;
      } else if (card.id === 'CERDT') {
        genotypesFactor = Math.ceil(genotypesForFilter.length / 9);
        heightFactor += genotypesFactor * 22 + 50;
      } else if (card.id === 'CVM') {
        variablesFactor = Math.ceil(Object.keys(convergenceColourPallete).length / 3);
        heightFactor += variablesFactor * 22;
      }

      canvas.width = 922;
      canvas.height = graphImg.height + 220 + heightFactor;

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
      ctx.fillText(card.title, canvas.width / 2, 50);

      ctx.font = '12px Montserrat';
      ctx.fillText(card.description.join(' / '), canvas.width / 2, 72);

      ctx.font = '14px Montserrat';
      ctx.fillText(`Organism: ${globalOverviewLabel.fullLabel}`, canvas.width / 2, 110);
      ctx.fillText(`Dataset: ${dataset}`, canvas.width / 2, 132);
      ctx.fillText(`Time period: ${actualTimeInitial} to ${actualTimeFinal}`, canvas.width / 2, 154);
      ctx.fillText(`Country: ${actualCountry}`, canvas.width / 2, 176);
      if (card.id === 'RDWG') ctx.fillText(`Drug Class: ${determinantsGraphDrugClass}`, canvas.width / 2, 198);
      if (card.id === 'CERDT') ctx.fillText(`Drug Class: ${trendsKPGraphDrugClass}`, canvas.width / 2, 198);
      if (card.id === 'KO') ctx.fillText(`Data view: ${KODiversityGraphView}`, canvas.width / 2, 198);
      if (card.id === 'CVM') {
        const group = variablesOptions.find((option) => option.value === convergenceGroupVariable).label;
        const colour = variablesOptions.find((option) => option.value === convergenceColourVariable).label;
        ctx.fillText(`Group variable: ${group} / Colour variable: ${colour}`, canvas.width / 2, 198);
      }

      ctx.fillStyle = 'white';
      ctx.textAlign = 'start';
      ctx.font = '12px Montserrat';

      const mobileFactor = matches1000 ? 100 : 0;
      if ('RFWG'.includes(card.id)) {
        ctx.fillRect(0, 660 - mobileFactor, canvas.width, canvas.height);
        const legendDrugs = organism === 'styphi' ? drugsST : drugsKP;

        drawLegend({
          legendData: legendDrugs,
          context: ctx,
          factor: legendDrugs.length > 12 ? 8 : 4,
          mobileFactor,
          yPosition: 670,
          xSpace: legendDrugs.length > 12 ? 400 : 200,
          isDrug: true,
        });
      } else if ('DRT'.includes(card.id)) {
        ctx.fillRect(0, 660 - mobileFactor, canvas.width, canvas.height);
        drawLegend({
          legendData: drugsForDrugResistanceGraphST,
          context: ctx,
          factor: 4,
          mobileFactor,
          yPosition: 670,
          xSpace: 200,
          isDrug: true,
        });
      } else if (card.id === 'RDWG') {
        ctx.fillRect(0, 660 - mobileFactor, canvas.width, canvas.height);

        drawLegend({
          legendData: drugClassesBars,
          context: ctx,
          factor: drugClassesFactor,
          mobileFactor,
          yPosition: 670,
          xSpace: 208,
        });
      } else if (card.id === 'GD') {
        ctx.fillRect(0, 660 - mobileFactor, canvas.width, canvas.height);

        drawLegend({
          legendData: genotypesForFilterSelected,
          context: ctx,
          factor: genotypesFactor,
          mobileFactor,
          yPosition: 670,
          isGenotype: true,
          xSpace: orgBasedSpace,
        });
      } else if (card.id === 'CERDT') {
        ctx.fillRect(0, 660 - mobileFactor, canvas.width, canvas.height);

        ctx.fillStyle = 'black';
        ctx.fillText('GENES:', 98, 675);
        drawLegend({
          legendData: drugClassesBars,
          context: ctx,
          factor: drugClassesFactor,
          mobileFactor,
          yPosition: 695,
          xSpace: 208,
        });

        ctx.fillStyle = 'black';
        ctx.fillText('GENOTYPES:', 98, 1310);
        drawLegend({
          legendData: genotypesForFilter,
          context: ctx,
          factor: genotypesFactor,
          mobileFactor,
          yPosition: 1330,
          isGenotype: true,
          xSpace: 87,
        });
      } else if (card.id === 'KO') {
        ctx.fillRect(0, 660 - mobileFactor, canvas.width, canvas.height);

        drawLegend({
          legendData: colorsForKODiversityGraph,
          context: ctx,
          factor: 5,
          mobileFactor,
          yPosition: 670,
          xSpace: 330,
        });
      } else if (card.id === 'CVM') {
        ctx.fillRect(0, 660 - mobileFactor, canvas.width, canvas.height);

        drawLegend({
          legendData: Object.keys(convergenceColourPallete),
          context: ctx,
          factor: variablesFactor,
          mobileFactor,
          yPosition: 670,
          xSpace: 270,
          isVariable: true,
        });
      }

      const base64 = canvas.toDataURL();
      await download(base64, `AMRnet - ${globalOverviewLabel.fullLabel} - ${card.title}.png`);
    } catch {
      setShowAlert(true);
    } finally {
      handleLoading(card.collapse, false);
    }
  }

  function handleLoading(collapse, value) {
    setCharLoadings({ ...chartLoadings, [collapse]: value });
  }

  function handleCloseAlert() {
    setShowAlert(false);
  }

  function handleExpandClick(event, key) {
    dispatch(setCollapse({ key, value: !collapses[key] }));
  }

  return (
    <div className={classes.cardsWrapper}>
      {getOrganismCards().map((card, index) => {
        return (
          <Card key={`graph-card-${index}`} className={classes.card}>
            <CardActions
              disableSpacing
              className={classes.cardActions}
              onClick={(event) => handleExpandClick(event, card.collapse)}
              style={{ cursor: isTouchDevice() ? 'default' : 'pointer' }}
            >
              <div className={classes.titleWrapper}>
                {card.icon}
                <div className={classes.title}>
                  <Typography fontSize="18px" fontWeight="500">
                    {card.title}
                  </Typography>
                  {collapses[card.collapse] && (
                    <Typography fontSize="10px" component="span">
                      {card.description.map((d, i) => (
                        <div key={`description-${i}`}>{d}</div>
                      ))}
                    </Typography>
                  )}
                </div>
              </div>
              <div className={classes.actionsWrapper}>
                {collapses[card.collapse] && (
                  <Tooltip title="Download Chart as PNG" placement="top">
                    <span>
                      <IconButton
                        color="primary"
                        onClick={(event) => handleClickDownload(event, card)}
                        disabled={organism === 'none' || chartLoadings[card.collapse]}
                      >
                        {chartLoadings[card.collapse] ? <CircularProgress color="primary" size={24} /> : <CameraAlt />}
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                <IconButton>{collapses[card.collapse] ? <ExpandLess /> : <ExpandMore />}</IconButton>
              </div>
            </CardActions>
            <Collapse in={collapses[card.collapse]} timeout="auto">
              {card.collapse === 'frequencies' && <FrequenciesGraph />}
              {card.collapse === 'drugResistance' && <DrugResistanceGraph />}
              {card.collapse === 'determinants' && <DeterminantsGraph />}
              {card.collapse === 'distribution' && <DistributionGraph />}
              {card.collapse === 'trendsKP' && <TrendsKPGraph />}
              {card.collapse === 'KODiversity' && <KODiversityGraph />}
              {card.collapse === 'convergence' && <ConvergenceGraph />}
            </Collapse>
          </Card>
        );
      })}
      <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          Something went wrong with the download, please try again later.
        </Alert>
      </Snackbar>
    </div>
  );
};
