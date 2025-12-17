import { CameraAlt, ExpandLess, ExpandMore, FilterList, FilterListOff, StackedBarChart } from '@mui/icons-material';
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
  tabsClasses,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import domtoimage from 'dom-to-image';
import download from 'downloadjs';
import { cloneElement, useEffect, useMemo, useState } from 'react';
import { Circles } from 'react-loader-spinner';
import LogoImg from '../../../assets/img/logo-prod.png';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { useTranslation } from 'react-i18next';
import { setCollapse, setDownload } from '../../../stores/slices/graphSlice';
import {
  colorForDrugClassesNG,
  colorForDrugClassesST,
  colorForMarkers,
  getColorForGenotype,
} from '../../../util/colorHelper';
import { variablesOptions } from '../../../util/convergenceVariablesOptions';
import { drugsKP, drugsST } from '../../../util/drugs';
import { graphCards } from '../../../util/graphCards';
import { imgOnLoadPromise } from '../../../util/imgOnLoadPromise';
import { isTouchDevice } from '../../../util/isTouchDevice';
import { DownloadMapViewData } from '../Map/MapActions/DownloadMapViewData';
import { colorsForKODiversityGraph, getColorForDrug } from './graphColorHelper';
import { useStyles } from './GraphsMUI';
import GenotypePatternRect from '../../../components/Elements/Graphs/GenotypePatternRect.js';

export const Graphs = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const matches1000 = useMediaQuery('(max-width:1000px)');
  // const matches500 = useMediaQuery('(max-width:500px)');
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('DRT'); // Initialize with valid default
  const [showFilter, setShowFilter] = useState(true);

  const dispatch = useAppDispatch();
  const collapses = useAppSelector(state => state.graph.collapses);
  const organism = useAppSelector(state => state.dashboard.organism);
  const dataset = useAppSelector(state => state.map.dataset);
  const actualTimeInitial = useAppSelector(state => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector(state => state.dashboard.actualTimeFinal);
  const actualCountry = useAppSelector(state => state.dashboard.actualCountry);
  const determinantsGraphDrugClass = useAppSelector(state => state.graph.determinantsGraphDrugClass);
  const trendsGraphDrugClass = useAppSelector(state => state.graph.trendsGraphDrugClass);
  const KODiversityGraphView = useAppSelector(state => state.graph.KODiversityGraphView);
  const globalOverviewLabel = useAppSelector(state => state.dashboard.globalOverviewLabel);
  const genotypesForFilter = useAppSelector(state => state.dashboard.genotypesForFilter);
  const colorPallete = useAppSelector(state => state.dashboard.colorPallete);
  const colorPalleteKO = useAppSelector(state => state.dashboard.colorPalleteKO);
  const KOTrendsGraphPlotOption = useAppSelector(state => state.graph.KOTrendsGraphPlotOption);
  const convergenceGroupVariable = useAppSelector(state => state.graph.convergenceGroupVariable);
  const convergenceColourVariable = useAppSelector(state => state.graph.convergenceColourVariable);
  const convergenceColourPallete = useAppSelector(state => state.graph.convergenceColourPallete);
  const drugResistanceGraphView = useAppSelector(state => state.graph.drugResistanceGraphView);
  const captureDRT = useAppSelector(state => state.dashboard.captureDRT);
  const captureRFWG = useAppSelector(state => state.dashboard.captureRFWG);
  const captureRDWG = useAppSelector(state => state.dashboard.captureRDWG);
  const captureGD = useAppSelector(state => state.dashboard.captureGD);
  const captureKOT = useAppSelector(state => state.dashboard.captureKOT);
  const genotypesForFilterSelected = useAppSelector(state => state.dashboard.genotypesForFilterSelected);
  const KOForFilterSelected = useAppSelector(state => state.dashboard.KOForFilterSelected);
  const topGenesSlice = useAppSelector(state => state.graph.topGenesSlice);
  const topGenotypeSlice = useAppSelector(state => state.graph.topGenotypeSlice);
  const topColorSlice = useAppSelector(state => state.graph.topColorSlice);
  const genotypesForFilterSelectedRD = useAppSelector(state => state.dashboard.genotypesForFilterSelectedRD);
  const endtimeGD = useAppSelector(state => state.graph.endtimeGD);
  const starttimeGD = useAppSelector(state => state.graph.starttimeGD);
  const endTimeKOT = useAppSelector(state => state.graph.endTimeKOT);
  const startTimeKOT = useAppSelector(state => state.graph.startTimeKOT);
  const endtimeDRT = useAppSelector(state => state.graph.endtimeDRT);
  const starttimeDRT = useAppSelector(state => state.graph.starttimeDRT);
  const actualGenomesGD = useAppSelector(state => state.graph.actualGenomesGD);
  const actualGenomesDRT = useAppSelector(state => state.graph.actualGenomesDRT);
  const actualGenomesKOT = useAppSelector(state => state.graph.actualGenomesKOT);
  const starttimeRDT = useAppSelector(state => state.graph.starttimeRDT);
  const endtimeRDT = useAppSelector(state => state.graph.endtimeRDT);
  const actualGenomesRDT = useAppSelector(state => state.graph.actualGenomesRDT);
  const canFilterData = useAppSelector(state => state.dashboard.canFilterData);
  const loadingData = useAppSelector(state => state.dashboard.loadingData);
  const loadingMap = useAppSelector(state => state.map.loadingMap);
  const loadingPDF = useAppSelector(state => state.dashboard.loadingPDF);
  const actualGenomes = useAppSelector(state => state.dashboard.actualGenomes);
  const selectedLineages = useAppSelector(state => state.dashboard.selectedLineages);
  const resetBool = useAppSelector(state => state.graph.resetBool);
  const colorPalleteCgST = useAppSelector(state => state.dashboard.colorPalleteCgST);
  const colorPalleteSublineages = useAppSelector(state => state.dashboard.colorPalleteSublineages);
  const distributionGraphVariable = useAppSelector(state => state.graph.distributionGraphVariable);
  const actualRegion = useAppSelector(state => state.dashboard.actualRegion);
  const organismCards = useMemo(() => graphCards.filter(card => card.organisms.includes(organism)), [organism]);
  const colourPattern = useAppSelector((state) => state.dashboard.colourPattern);
  const convergenceData = useAppSelector(state => state.graph.convergenceData);
  const currentSliderValueCM = useAppSelector(state => state.graph.currentSliderValueCM);
  
  useEffect(() => {
    if (organismCards.length > 0) {
      setCurrentTab(organismCards[0].id);
    }
  }, [organismCards, resetBool]);

  useEffect(() => {
    const runAsync = async () => {
      if (loadingPDF) {
        dispatch(setDownload(false));
      }
    };
    runAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingPDF]);

  useEffect(() => {
    setShowFilter(true);
  }, [organism]);

  const showFilterFull = useMemo(() => {
    return showFilter && !loadingData && !loadingMap;
  }, [loadingData, loadingMap, showFilter]);

  const currentCard = useMemo(() => organismCards.find(x => x.id === currentTab), [currentTab, organismCards]);

  function getGenotypeColor(genotype) {
    return  currentColorPallete[genotype] || '#F5F4F6';
  }
  const currentColorPallete = useMemo(() => {
    const isSpecialOrganism = organism === 'kpneumo' || organism === 'ngono';

    if (!isSpecialOrganism) {
      return colorPallete;
    }

    if (distributionGraphVariable === 'Sublineage') {
      return colorPalleteSublineages;
    }

    if (distributionGraphVariable === 'cgST' || distributionGraphVariable === 'NG-MAST TYPE') {
      return colorPalleteCgST;
    }

    return colorPallete;
  }, [colorPallete, colorPalleteCgST, colorPalleteSublineages, distributionGraphVariable, organism]);

  // function getColor(item) {
  //   if (currentCard.id === 'KOT') {
  //     return colorPalleteKO[KOTrendsGraphPlotOption][item] || '#F5F4F6';
  //   }

  //   return organism === 'styphi' ? getColorForGenotype(item) : colorPallete[item] || '#F5F4F6';
  // }

  const getAxisLabel = () => {
    switch (organism) {
      case 'decoli':
      case 'shige':
        return t('graphs.selectedPathotypes', { selected: selectedLineages.join(', ') });
      case 'sentericaints':
      case 'kpneumo':
        return t('graphs.selectedSerotypes', { selected: selectedLineages.join(', ') });
      case 'ecoli':
        return t('graphs.selectedGenotypes', { selected: selectedLineages.join(', ') });
      default:
        return '';
    }
  };

  function getDrugClassesBars() {
    switch (organism) {
      case 'styphi':
        return colorForDrugClassesST[determinantsGraphDrugClass];
      // case 'kpneumo':
      //   return colorForDrugClassesKP[determinantsGraphDrugClass];
      case 'ngono':
        return colorForDrugClassesNG[determinantsGraphDrugClass];
      default:
        return [];
    }
  }

  // function drawLegend({
  //   legendData,
  //   context,
  //   factor,
  //   mobileFactor,
  //   yPosition,
  //   isGenotype = false,
  //   isDrug = false,
  //   isVariable = false,
  //   isGen = false,
  //   xSpace,
  // }) {
  //   legendData.forEach((legend, i) => {
  //     const yFactor = (i % factor) * 24;
  //     const xFactor = Math.floor(i / factor) * xSpace;

  //     ((context.fillStyle = isGenotype
  //       ? GenotypePatternRect(legend, legendData)
  //       : isDrug
  //         ? getColorForDrug(legend, colourPattern)
  //         : isVariable
  //           ? convergenceColourPallete(legend, colourPattern)
  //           : isGen
  //             ? i === legendData.length - 1
  //               ? '#F5F4F6'
  //               : colorForMarkers(i, colourPattern)
  //             : legend.color),
  //       context.beginPath());
  //      {const radius = !colourPattern ? 5 : (i % 2 !== 0 ? 6 : 4.5);
  //       context.arc(52 + xFactor, yPosition - mobileFactor + yFactor, radius, 0, 2 * Math.PI);
  //       }      
  //     context.fill();
  //     context.closePath();
  //     context.fillStyle = 'black';
  //     context.fillText(
  //       isGenotype || isDrug || isVariable ? legend.replaceAll('β', 'B') : isGen ? legend : legend.name,
  //       61 + xFactor,
  //       yPosition + 4 - mobileFactor + yFactor,
  //     );
  //   });
  // }

  // Replace the drawLegend function in Graphs.jsx with this updated version:

// Replace the drawLegend function in Graphs.jsx with this updated version:

  function drawLegend({
    legendData,
    context,
    factor,
    mobileFactor,
    yPosition,
    isGenotype = false,
    isDrug = false,
    isVariable = false,
    isGen = false,
    xSpace,
    topConvergenceData = [], 
    genotypesForFilterSelected = [], 
    KOForFilterSelected = [], 
  }) {
    const patternTypes = ['solid', 'stripes', 'dots', 'cross'];
    const getPatternTypeForGenotype = (
      legend,
      topConvergenceData = [],
      genotypesForFilterSelected = [],
      KOForFilterSelected = []
    ) => {
      let patternIndex = 0;

      if (topConvergenceData?.length > 0) {
        const idx = topConvergenceData.findIndex(item => item.colorLabel === legend);
        if (idx !== -1) patternIndex = idx % patternTypes.length;
      } else if (genotypesForFilterSelected?.length > 0) {
        const idx = genotypesForFilterSelected.indexOf(legend);
        if (idx !== -1) patternIndex = idx % patternTypes.length;
      } else if (KOForFilterSelected?.length > 0) {
        const idx = KOForFilterSelected.indexOf(legend);
        if (idx !== -1) patternIndex = idx % patternTypes.length;
      }

      return patternTypes[patternIndex];
    };

    legendData.forEach((legend, i) => {
      const yFactor = (i % factor) * 24;
      const xFactor = Math.floor(i / factor) * xSpace;

      // Determine base color first
      let baseColor;
      if (isGenotype) {
        baseColor = legend === 'Other' ? '#F5F4F6' : 
                   KOForFilterSelected && KOForFilterSelected.includes(legend) ? 
                   (colorPalleteKO[KOTrendsGraphPlotOption]?.[legend] || getGenotypeColor(legend)) :
                   getGenotypeColor(legend);
      } else if (isDrug) {
        baseColor = getColorForDrug(legend, colourPattern);
      } else if (isVariable) {
        baseColor = convergenceColourPallete[legend] || '#F5F4F6';
      } else if (isGen) {
        baseColor = i === legendData.length - 1 ? '#F5F4F6' : colorForMarkers(i, colourPattern);
      } else {
        baseColor = legend.color || '#F5F4F6';
      }

      // Check if we should use patterns
      const usePattern = colourPattern && (isGenotype || isVariable);

      if (usePattern) {
        const patternType = getPatternTypeForGenotype(
          legend,
          topConvergenceData,
          genotypesForFilterSelected,
          KOForFilterSelected
        );

        const patternCanvas = document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d');
        
        // Set base pattern size
        const patternSize = patternType === 'solid' ? 16 : 8;
        patternCanvas.width = patternSize;
        patternCanvas.height = patternSize;
        
        // Fill base color
        patternCtx.fillStyle = baseColor;
        patternCtx.fillRect(0, 0, patternSize, patternSize);

        // Apply pattern overlay
        switch (patternType) {
          case 'stripes':
            patternCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            patternCtx.save();
            patternCtx.translate(patternSize/2, patternSize/2);
            patternCtx.rotate(45 * Math.PI / 180);
            patternCtx.fillRect(-0.5, -patternSize, 1, patternSize * 2);
            patternCtx.restore();
            break;
            
          case 'dots':
            patternCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            patternCtx.beginPath();
            patternCtx.arc(patternSize/2, patternSize/2, 1.5, 0, 2 * Math.PI);
            patternCtx.fill();
            [[0,0], [patternSize,0], [0,patternSize], [patternSize,patternSize]].forEach(([x,y]) => {
              patternCtx.beginPath();
              patternCtx.arc(x, y, 0.75, 0, 2 * Math.PI);
              patternCtx.fill();
            });
            break;
            
          case 'cross':
            patternCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            patternCtx.lineWidth = 1.5;
            patternCtx.beginPath();
            patternCtx.moveTo(0, 0);
            patternCtx.lineTo(patternSize, patternSize);
            patternCtx.moveTo(patternSize, 0);
            patternCtx.lineTo(0, patternSize);
            patternCtx.stroke();
            break;
        }

        const pattern = context.createPattern(patternCanvas, 'repeat');
        context.fillStyle = pattern;

        // Draw rectangle with pattern
        const rectX = 46 + xFactor;
        const rectY = yPosition - 8 - mobileFactor + yFactor;
        const rectSize = 16;
        
        context.fillRect(rectX, rectY, rectSize, rectSize);
        context.strokeStyle = '#999';
        context.lineWidth = 0.5;
        context.strokeRect(rectX, rectY, rectSize, rectSize);
        
      } else {
        // Draw circle for non-pattern legends
        context.fillStyle = baseColor;
        context.beginPath();
        const radius = !colourPattern ? 5 : (i % 2 !== 0 ? 6 : 4.5);
        context.arc(52 + xFactor, yPosition - mobileFactor + yFactor, radius, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
      }

      // Draw text label
      context.fillStyle = 'black';
      const textX = usePattern ? 65 + xFactor : 61 + xFactor;
      const textY = yPosition + 4 - mobileFactor + yFactor;
      
      const textContent = isGenotype || isDrug || isVariable ? 
                         String(legend).replaceAll('β', 'B') :
                         isGen ? String(legend) :
                         legend.name || String(legend);
      
      context.fillText(textContent, textX, textY);
    });
  }

  async function handleClickDownload(event) {
    event.stopPropagation();
    setLoading(true);
    if (
      (currentCard.id === 'DRT' && drugResistanceGraphView.length === 0) ||
      (currentCard.id === 'DRT' && captureDRT === false)
    ) {
      setLoading(false);
      alert('No drugs/classes selected to download or no data to download');
      return;
    }
    if (currentCard.id === 'RFWG' && captureRFWG === false) {
      setLoading(false);
      alert('No genotype selected to download or no data to download');
      return;
    }
    if (
      (currentCard.id === 'RDWG' && captureRDWG === false) ||
      (currentCard.id === 'GD' && captureGD === false) ||
      (currentCard.id === 'KOT' && captureKOT === false)
    ) {
      setLoading(false);
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
      const graph = document.getElementById(currentCard.id);

      // Store original styles (only usef for HSG2)
      const originalOverflow = graph.style.overflow;
      const originalWidth = graph.style.width;

      if (['HSG2', 'BKOH', 'BAMRH'].includes(currentCard.id)) {
        // Temporarily expand the graph to its full scrollable width
        graph.style.overflow = 'visible';
        graph.style.width = graph.scrollWidth + 'px';

        await new Promise(resolve => setTimeout(resolve, 200)); // allow layout update
      }

      const graphImg = document.createElement('img');
      const graphImgPromise = imgOnLoadPromise(graphImg);

      graphImg.src = await domtoimage.toPng(graph, { quality: 0.1, bgcolor: 'white' });

      await graphImgPromise;

      if (['HSG2', 'BKOH', 'BAMRH'].includes(currentCard.id)) {
        // Restore original styles
        graph.style.overflow = originalOverflow;
        graph.style.width = originalWidth;
      }
      let heightFactor = 0,
        drugClassesBars,
        drugClassesFactor,
        genotypesFactor,
        variablesFactor;

      if (['RFWG', 'DRT'].includes(currentCard.id)) {
        heightFactor = 250;
      } else if (['RDWG', 'RDT'].includes(currentCard.id)) {
        drugClassesBars = getDrugClassesBars();
        drugClassesFactor = Math.ceil(drugClassesBars.length / 4);
        heightFactor += drugClassesFactor * 22;
      } else if (currentCard.id === 'GD') {
        genotypesFactor = Math.ceil(genotypesForFilterSelected.length / orgBasedColumns);
        heightFactor += genotypesFactor * 22;
      } else if (currentCard.id === 'KOT') {
        genotypesFactor = Math.ceil(KOForFilterSelected.length / orgBasedColumns);
        heightFactor += genotypesFactor * 22;
      } else if (currentCard.id === 'RDT') {
        genotypesFactor = Math.ceil(genotypesForFilter.length / 9);
        heightFactor += genotypesFactor * 22 + 50;
      } else if (currentCard.id === 'convergence-graph') {
        variablesFactor = Math.ceil(Object.keys(convergenceColourPallete).length / 3);
        heightFactor += variablesFactor * 22;
        // BG is replaced from CVM for BubbleGeographicGraph
      }
      ///TODO: improve the code below as its hardcode
      if (['HSG2', 'BKOH', 'BAMRH'].includes(currentCard.id))
        canvas.width = graphImg.width < 670 ? 922 : graphImg.width + 100;
      else canvas.width = 922;
      // console.log('canvas.width', canvas.width, graphImg.width);
      canvas.height = graphImg.height + 220 + (currentCard.id === 'RDT' ? 250 : heightFactor);
      // canvas.height = graphImg.height + 220 + heightFactor;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const logo = document.createElement('img');
      const logoPromise = imgOnLoadPromise(logo);
      logo.src = LogoImg;
      await logoPromise;

      ctx.drawImage(logo, 10, 10, 155, 80);
      if (['HSG2', 'BKOH', 'BAMRH'].includes(currentCard.id)) ctx.drawImage(graphImg, 40, 220);
      else ctx.drawImage(graphImg, canvas.width / 2 - graphImg.width / 2, 220);

      ctx.font = 'bold 18px Montserrat';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.fillText(currentCard.title, canvas.width / 2, 50);

      ctx.font = '12px Montserrat';
      ctx.fillText(currentCard.description.join(' / '), canvas.width / 2, 72);

      ctx.font = '14px Montserrat';
      ctx.fillText(`Organism: ${globalOverviewLabel.stringLabel}`, canvas.width / 2, 95);
      ctx.fillText(`Dataset: ${dataset}`, canvas.width / 2, 115);
      // ctx.fillText(`${getAxisLabel()} ` + selectedLineages.join(', '), canvas.width / 2, 135);
      ctx.fillText(`${getAxisLabel()} `, canvas.width / 2, 135);
      //  Refrence Dashboard comment line 773 : unable to use actualGenomesGD, actualGenomesDRT, actualGenomesRD

      if (currentCard.id === 'GD') {
        ctx.fillText(`Time period: ${starttimeGD} to ${endtimeGD}`, canvas.width / 2, 154);
        ctx.fillText(`Total ${actualGenomesGD} genomes`, canvas.width / 2, 172);
      } else if (currentCard.id === 'KOT') {
        ctx.fillText(`Time period: ${startTimeKOT} to ${endTimeKOT}`, canvas.width / 2, 154);
        ctx.fillText(`Total ${actualGenomesKOT} genomes`, canvas.width / 2, 172);
      } else if (currentCard.id === 'DRT') {
        ctx.fillText(`Time period: ${starttimeDRT} to ${endtimeDRT}`, canvas.width / 2, 154);
        ctx.fillText(`Total ${actualGenomesDRT} genomes`, canvas.width / 2, 172);
      } else if (currentCard.id === 'RDT') {
        ctx.fillText(`Time period: ${starttimeRDT} to ${endtimeRDT}`, canvas.width / 2, 154);
        ctx.fillText(`Total ${actualGenomesRDT} genomes`, canvas.width / 2, 172);
      } else {
        ctx.fillText(`Time period: ${actualTimeInitial} to ${actualTimeFinal}`, canvas.width / 2, 154);
        ctx.fillText(`Total ${actualGenomes} genomes`, canvas.width / 2, 172);
      }
      // ctx.fillText(`Time period: ${actualTimeInitial} to ${actualTimeFinal}`, canvas.width / 2, 154);
      ctx.fillText(`Country: ${actualCountry}`, canvas.width / 2, 186);
      if (currentCard.id === 'RDWG') ctx.fillText(`Drug Class: ${determinantsGraphDrugClass}`, canvas.width / 2, 198);
      if (currentCard.id === 'RDT') ctx.fillText(`Drug Class: ${trendsGraphDrugClass}`, canvas.width / 2, 198);
      if (currentCard.id === 'KO') ctx.fillText(`Data view: ${KODiversityGraphView}`, canvas.width / 2, 198);
      if (currentCard.id === 'convergence-graph') {
        const group = variablesOptions.find(option => option.value === convergenceGroupVariable).label;
        const colour = variablesOptions.find(option => option.value === convergenceColourVariable).label;
        ctx.fillText(`Group variable: ${group} / Colour variable: ${colour}`, canvas.width / 2, 198);
      }

      ctx.fillStyle = 'white';
      ctx.textAlign = 'start';
      ctx.font = '12px Montserrat';

      const mobileFactor = matches1000 ? 100 : 0;
      if ('RFWG'.includes(currentCard.id)) {
        ctx.fillRect(0, 650 - mobileFactor, canvas.width, canvas.height);
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
      } else if ('DRT'.includes(currentCard.id)) {
        ctx.fillRect(0, 650 - mobileFactor, canvas.width, canvas.height);

        // let legendDrugs;

        // switch (organism) {
        //   case 'styphi':
        //     legendDrugs = drugsSTLegendsOnly;
        //     break;
        //   case 'kpneumo':
        //     legendDrugs = drugsKlebLegendsOnly;
        //     break;
        //   case 'ngono':
        //     legendDrugs = drugsNGLegendsOnly;
        //     break;
        //   default:
        //     legendDrugs = drugsINTSLegendsOnly;
        //     break;
        // }

        drawLegend({
          legendData: drugResistanceGraphView,
          context: ctx,
          factor: 8,
          mobileFactor,
          yPosition: 670,
          xSpace: 400, // Max 14 drugs we have for DRT in any org so we can use factor 8 and space 400 to keep them apart,
          isDrug: true,
        });
      } else if (currentCard.id === 'RDWG') {
        const legendDataRD = drugClassesBars.filter(value => genotypesForFilterSelectedRD.includes(value.name));
        ctx.fillRect(0, 650 - mobileFactor, canvas.width, canvas.height);

        drawLegend({
          legendData: legendDataRD,
          context: ctx,
          factor: drugClassesFactor,
          mobileFactor,
          yPosition: 670,
          xSpace: 208,
        });
      } else if (currentCard.id === 'GD') {
        ctx.fillRect(0, 650 - mobileFactor, canvas.width, canvas.height);
        drawLegend({
          legendData: genotypesForFilterSelected,
          context: ctx,
          factor: genotypesFactor,
          mobileFactor,
          yPosition: 670,
          isGenotype: true,
          xSpace: orgBasedSpace,
          genotypesForFilterSelected: genotypesForFilterSelected, // Pass the selected genotypes
        });
      } else if (currentCard.id === 'KOT') {
        ctx.fillRect(0, 650 - mobileFactor, canvas.width, canvas.height);

        drawLegend({
          legendData: KOForFilterSelected,
          context: ctx,
          factor: genotypesFactor,
          mobileFactor,
          KOForFilterSelected: KOForFilterSelected, // Pass the KO selected items
          yPosition: 670,
          isGenotype: true,
          xSpace: orgBasedSpace,
        });
      } else if (currentCard.id === 'RDT') {
        let legendGens = [...topGenesSlice.filter(g => g !== 'None'), ...topGenesSlice.filter(g => g === 'None')];
        if (organism === 'kenumon') legendGens = drugClassesBars?.filter(value => topGenesSlice.includes(value.name));
        console.log('legendGens', topGenesSlice, legendGens);

        ctx.fillRect(0, 650 - mobileFactor, canvas.width, canvas.height);

        ctx.fillStyle = '#F5F4F6';
        // ctx.fillText('GENES:', 50, 675);
        drawLegend({
          legendData: legendGens,
          context: ctx,
          factor: legendGens.length / 4,
          mobileFactor,
          yPosition: 695,
          xSpace: 238,
          isGen: true,
        });

        // ctx.fillStyle = 'black';
        // ctx.fillText('GENOTYPES:', 50, 900);
        // drawLegend({
        //   legendData: legendGenotypes,
        //   context: ctx,
        //   factor: Math.ceil(legendGenotypes.length / 8),
        //   mobileFactor,
        //   yPosition: 930,
        //   isGenotype: true,
        //   xSpace: 87,
        // });
      // } else if (currentCard.id === 'KO') {
      //   ctx.fillRect(0, 650 - mobileFactor, canvas.width, canvas.height);
      //   drawLegend({
      //     legendData: colorsForKODiversityGraph,
      //     context: ctx,
      //     factor: 5,
      //     mobileFactor,
      //     yPosition: 670,
      //     xSpace: 330,
      //   });
      } else if (currentCard.id === 'convergence-graph') {
        ctx.fillRect(0, 650 - mobileFactor, canvas.width, canvas.height);
        
        // Create ordered legend data based on topConvergenceData order (same as ConvergenceGraph.js)
        const orderedLegendKeys = [];
        const seenKeys = new Set();
        
        // Get topConvergenceData to maintain the same sequence
        const topConvergenceDataForLegend = convergenceData.slice(0, currentSliderValueCM);
        
        topConvergenceDataForLegend.forEach(item => {
          if (!seenKeys.has(item.colorLabel)) {
            orderedLegendKeys.push(item.colorLabel);
            seenKeys.add(item.colorLabel);
          }
        });

        drawLegend({
          legendData: orderedLegendKeys,
          context: ctx,
          factor: variablesFactor,
          mobileFactor,
          yPosition: 670,
          xSpace: 270,
          isVariable: true,
          topConvergenceData: topConvergenceDataForLegend,
        });
      }

      const base64 = canvas.toDataURL();
      await download(base64, `AMRnet - ${globalOverviewLabel.stringLabel}_${currentCard.title}.png`);
    } catch {
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  }

  function handleCloseAlert() {
    setShowAlert(false);
  }

  function handleExpandClick() {
    dispatch(setCollapse({ key: 'all', value: !collapses['all'] }));
  }

  function handleChangeTab(_, newValue) {
    setCurrentTab(newValue);
  }

  function handleClickFilter(event) {
    event.stopPropagation();
    setShowFilter(!showFilter);
  }

  //   const cycleThroughTabs = async () => {
  //   for (let i = 0; i < organismCards.length; i++) {
  //     await new Promise(resolve => setTimeout(resolve, 500)); // 1-second delay between tabs
  //     handleChangeTab(null, organismCards[i].id); // simulate tab change
  //   }
  // };

  // Add validation to ensure currentTab is always valid
  const safeCurrentTab = useMemo(() => {
    const validTabs = organismCards.map(card => card.id);
    return validTabs.includes(currentTab) ? currentTab : validTabs[0] || 'DRT';
  }, [currentTab, organismCards]);

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
          sx={{ padding: collapses['all'] ? '16px 16px 0px !important' : '16px !important' }}
        >
          <div className={classes.titleWrapper}>
            <StackedBarChart color="primary" />
            <div className={classes.title}>
              <Typography fontSize="18px" fontWeight="500">
                Summary plots:{' '}
                {actualCountry !== 'All'
                  ? `${actualCountry} (${actualRegion})`
                  : actualRegion === 'All'
                    ? 'All Regions'
                    : actualRegion}
              </Typography>
              {collapses['all'] && (
                <Typography fontSize="10px" component="span">
                  {currentCard?.description.map((d, i) => (
                    <div key={`description-${i}`}>{d}</div>
                  ))}
                </Typography>
              )}
            </div>
          </div>
          <div className={classes.actionsWrapper}>
            {collapses['all'] && currentTab !== 'HSG' && (
              <>
                <Tooltip title="Download Data" placement="top">
                  <IconButton
                    className={classes.actionButton}
                    color="primary"
                    disabled={organism === 'none' || loading}
                    onClick={e => e.stopPropagation()}
                  >
                    <DownloadMapViewData fontSize="inherit" value={currentCard?.id} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download Chart as PNG" placement="top">
                  <span>
                    <IconButton
                      color="primary"
                      onClick={event => handleClickDownload(event)}
                      disabled={organism === 'none' || loading}
                    >
                      {loading ? <CircularProgress color="primary" size={24} /> : <CameraAlt />}
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
            {collapses['all'] && (
              <Tooltip title={showFilter ? 'Hide plotting options' : 'Show plotting options'} placement="top">
                <span>
                  <IconButton color="primary" onClick={event => handleClickFilter(event)}>
                    {showFilter ? <FilterListOff /> : <FilterList />}
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <IconButton>{collapses['all'] ? <ExpandLess /> : <ExpandMore />}</IconButton>
          </div>
        </CardActions>
        {collapses['all'] && (
          <Tabs
            value={safeCurrentTab}
            onChange={handleChangeTab}
            variant="scrollable"
            scrollButtons
            className={classes.tabList}
            sx={{
              [`& .${tabsClasses.scrollButtons}`]: {
                '&.Mui-disabled': { opacity: 0.3 },
              },
            }}
          >
            {organismCards.map((card, i) => {
              return (
                <Tab
                  key={`geo-tab-${i}`}
                  label={card.title}
                  icon={card.icon}
                  iconPosition="start"
                  value={card.id}
                  sx={{
                    flexGrow: 1,
                    textWrap: 'nowrap',
                  }}
                />
              );
            })}
          </Tabs>
        )}

        <Collapse in={collapses['all']} timeout="auto">
          <Box className={classes.boxWrapper}>
            {organismCards.map(card => {
              const isActive = currentTab === card.id;
              const shouldRender = loadingPDF || isActive;

              return (
                <Box
                  key={`card-${card.id}`}
                  sx={{
                    position: loadingPDF ? 'relative' : isActive ? 'relative' : 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    // Set all cards active when loadingPDF is true to avoid flickering and update PDF
                    ...(loadingPDF
                      ? {
                          opacity: isActive ? 1 : 0,
                          height: isActive ? 'auto' : 0,
                          overflow: 'hidden',
                        }
                      : {
                          visibility: isActive ? 'visible' : 'hidden',
                        }),
                  }}
                >
                  {shouldRender && cloneElement(card.component, { showFilter: showFilterFull, setShowFilter })}
                </Box>
              );
            })}
            {canFilterData && (
              <div className={classes.loadingBlock}>
                <Circles color="#6F2F9F" height={60} width={60} />
              </div>
            )}
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
