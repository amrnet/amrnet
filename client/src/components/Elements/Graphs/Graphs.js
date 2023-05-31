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
  useMediaQuery
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
import { drugsST, drugsKP } from '../../../util/drugs';
import { getColorForDrug } from './graphColorHelper';
import { colorForDrugClassesKP, colorForDrugClassesST, getColorForGenotype } from '../../../util/colorHelper';
import { TrendsKPGraph } from './TrendsKPGraph';
import { isTouchDevice } from '../../../util/isTouchDevice';
import { graphCards } from '../../../util/graphCards';

export const Graphs = () => {
  const classes = useStyles();
  const matches500 = useMediaQuery('(max-width:500px)');
  const [showAlert, setShowAlert] = useState(false);
  const [chartLoadings, setCharLoadings] = useState({
    frequencies: false,
    drugResistance: false,
    determinants: false,
    distribution: false,
    trendsKP: false
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
  const globalOverviewLabel = useAppSelector((state) => state.dashboard.globalOverviewLabel);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const colorPallete = useAppSelector((state) => state.dashboard.colorPallete);

  function getOrganismCards() {
    return graphCards.filter((card) => card.organisms.includes(organism));
  }

  function getGenotypeColor(genotype) {
    return organism === 'typhi' ? getColorForGenotype(genotype) : colorPallete[genotype] || '#F5F4F6';
  }

  function getDrugClassesBars() {
    switch (organism) {
      case 'typhi':
        return colorForDrugClassesST[determinantsGraphDrugClass];
      default:
        return colorForDrugClassesKP[determinantsGraphDrugClass];
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
    xSpace
  }) {
    legendData.forEach((legend, i) => {
      const yFactor = (i % factor) * 24;
      const xFactor = Math.floor(i / factor) * xSpace;

      context.fillStyle = isGenotype ? getGenotypeColor(legend) : isDrug ? getColorForDrug(legend) : legend.color;
      context.beginPath();
      context.arc(102 + xFactor, yPosition - mobileFactor + yFactor, 5, 0, 2 * Math.PI);
      context.fill();
      context.closePath();
      context.fillStyle = 'black';
      context.fillText(
        isGenotype || isDrug ? legend : legend.name,
        111 + xFactor,
        yPosition + 4 - mobileFactor + yFactor
      );
    });
  }

  async function handleClickDownload(event, card) {
    event.stopPropagation();
    handleLoading(card.collapse, true);

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
        genotypesFactor;

      if (['RFWG', 'DRT'].includes(card.id)) {
        heightFactor = 250;
      }
      if (['RDWG', 'CERDT'].includes(card.id)) {
        drugClassesBars = getDrugClassesBars();
        drugClassesFactor = Math.ceil(drugClassesBars.length / 4);
        heightFactor += drugClassesFactor * 22;
      }
      if (card.id === 'GD') {
        genotypesFactor = Math.ceil(genotypesForFilter.length / 9);
        heightFactor += genotypesFactor * 22;
      }
      if (card.id === 'CERDT') {
        genotypesFactor = Math.ceil(genotypesForFilter.length / 9);
        heightFactor += genotypesFactor * 22 + 50;
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

      ctx.fillStyle = 'white';
      ctx.textAlign = 'start';
      ctx.font = '12px Montserrat';

      const mobileFactor = matches500 ? 100 : 0;
      if (['RFWG', 'DRT'].includes(card.id)) {
        ctx.fillRect(0, 660 - mobileFactor, canvas.width, canvas.height);
        const legendDrugs = organism === 'typhi' ? drugsST : drugsKP;

        drawLegend({
          legendData: legendDrugs,
          context: ctx,
          factor: 5,
          mobileFactor,
          yPosition: 670,
          xSpace: 330,
          isDrug: true
        });
      } else if (card.id === 'RDWG') {
        ctx.fillRect(0, 660 - mobileFactor, canvas.width, canvas.height);

        drawLegend({
          legendData: drugClassesBars,
          context: ctx,
          factor: drugClassesFactor,
          mobileFactor,
          yPosition: 670,
          xSpace: 208
        });
      } else if (card.id === 'GD') {
        ctx.fillRect(0, 660 - mobileFactor, canvas.width, canvas.height);

        drawLegend({
          legendData: genotypesForFilter,
          context: ctx,
          factor: genotypesFactor,
          mobileFactor,
          yPosition: 670,
          isGenotype: true,
          xSpace: 87
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
          xSpace: 208
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
          xSpace: 87
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
