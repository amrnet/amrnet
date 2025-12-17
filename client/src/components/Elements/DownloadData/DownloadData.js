import { Alert, Button, Snackbar, useMediaQuery } from '@mui/material';
import axios from 'axios';
import download from 'downloadjs';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { useStyles } from './DownloadDataMUI';
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
import { PictureAsPdf, Storage, TableChart } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import jsPDF from 'jspdf';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LogoImg from '../../../assets/img/logo-prod.png';
import { setPosition } from '../../../stores/slices/mapSlice';
// import EUFlagImg from '../../../assets/img/eu_flag.jpg';
import domtoimage from 'dom-to-image';
import moment from 'moment';
import { svgAsPngUri } from 'save-svg-as-png';
import { setLoadingPDF } from '../../../stores/slices/dashboardSlice';
import { setCollapses, setDownload } from '../../../stores/slices/graphSlice';
import { drugAcronymsOpposite, drugsKP, drugsNG, drugsST, ngonoSusceptibleRule } from '../../../util/drugs';
import { graphCards } from '../../../util/graphCards';
import { imgOnLoadPromise } from '../../../util/imgOnLoadPromise';
import { mapLegends } from '../../../util/mapLegends';
// import { drugsKP, drugsST, drugsNG } from '../../../util/drugs';
import Papa from 'papaparse';
import {
  colorForDrugClassesKP,
  colorForDrugClassesNG,
  colorForDrugClassesST,
  colorForMarkers,
} from '../../../util/colorHelper';
import { variablesOptions } from '../../../util/convergenceVariablesOptions';
import {
  getDEcoliTexts,
  getEcoliTexts,
  getIntsTexts,
  getKlebsiellaTexts,
  getNgonoTexts,
  getSalmonellaTexts,
  getSentericaintsTexts,
  getShigeTexts,
} from '../../../util/reportInfoTexts';
import { getColorForDrug } from '../Graphs/graphColorHelper';

let columnsToRemove = [
  'azith_pred_pheno',
  'PROJECT ACCESSION',
  'COUNTRY_ONLY',
  'REGION_IN_COUNTRY',
  'LOCATION',
  'ACCURACY',
  'LATITUDE',
  'LONGITUDE',
  'REFERENCE',
  'MLST ST (EnteroBase)',
  'MLST PROFILE (EnteroBase)',
  'GENOTYPHI SNPs CALLED',
  'Genome ID',
  'Version',
  'Organism Name',
  'Organism ID',
  'Species Name',
  'Species ID',
  'Genus Name',
  'Genus ID',
  'Reference ID',
  'Matching Hashes',
  'p-Value',
  'Mash Distance',
  'cip_pred_pheno',
  'dcs_category',
  'amr_category',
  'num_qrdr',
  'num_acrb',
  'ESBL_category',
  'chloramphenicol_category',
  'tetracycline_category',
  'cip_pheno_qrdr_gene',
  'dcs_mechanisms',
  'num_amr_genes',
  'dfra_any',
  'sul_any',
  'co_trim',
  'GENOTYPE_SIMPLE',
  'h58_genotypes',
  'COUNTRY OF ORIGIN',
  'AGE',
  'TRAVEL COUNTRY',
  'TRAVEL ASSOCIATED',
  'parE_D420N',
  'parE_L416F',
  '_id',
  'LATITUDE',
  'LONGITUDE',
];

let columnsToRemoveNonTyphi = [
  'PURPOSE OF SAMPLING',
  'CipNS',
  'CipR',
  'AzithR1',
  'AzithR2',
  'AzithR3',
  'AzithR4',
  'AzithR5',
  'AzithR6',
  'AzithR7',
  'AzithR8',
  'AzithR9',
  'AzithR10',
  'AzithR11',
  'Source Niche',
  'Continent',
  'Serological Group',
  'Serotype, EcoR Cluster',
  'Sample ID',
  'ST Complex',
  'Subspecies',
  'source_niche',
  'Source Niche',
  'AbST',
  'Aerobactin',
  'Alternative sample name 1',
  'CbST',
  'Chr_ST',
  'K_locus_problems',

  'Omp_mutations',
  'Salmochelin',
  'YbST',
  'Yersiniabactin',
  'clbA',
  'clbB',
  'clbC',
  'clbD',
  'clbE',
  'clbF',
  'clbG',
  'clbH',
  'clbI',
  'clbL',
  'clbM',
  'clbN',
  'clbO',
  'clbP',
  'clbQ',
  'contig_count',
  'fyuA',
  'gapA',
  'infB',
  'iroB',
  'iroC',
  'iroD',
  'iroN',
  'irp1',
  'irp2',
  'iucA',
  'iucB',
  'iucC',
  'iucD',
  'iutA',
  'largest_contig',
  'pgi',
  'phoE',
  'resistance_score',
  'rmpA',
  'rmpA2',
  'rmpC',
  'rmpD',
  'rpoB',
  'species',
  'spurious_resistance_hits',
  'spurious_virulence_hits',
  'tonB',
  'total_size',
  'truncated_resistance_hits',
  'virulence_score',
  'wzi',
  'ybtA',
  'ybtE',
  'ybtP',
  'ybtQ',
  'ybtS',
  'ybtT',
  'ybtU',
  'ybtX',
];

export const DownloadData = () => {
  const classes = useStyles();
  const matches1000 = useMediaQuery('(max-width:1000px)');
  const [loadingCSV, setLoadingCSV] = useState(false);
  // const [loadingPDF, setLoadingPDF] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const organism = useAppSelector(state => state.dashboard.organism);
  const actualCountry = useAppSelector(state => state.dashboard.actualCountry);
  const actualRegion = useAppSelector(state => state.dashboard.actualRegion);
  const listPMID = useAppSelector(state => state.dashboard.listPMID);
  const PMID = useAppSelector(state => state.dashboard.PMID);
  const actualGenomes = useAppSelector(state => state.dashboard.actualGenomes);
  const actualTimeInitial = useAppSelector(state => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector(state => state.dashboard.actualTimeFinal);
  const mapView = useAppSelector(state => state.map.mapView);
  const dataset = useAppSelector(state => state.map.dataset);
  const determinantsGraphDrugClass = useAppSelector(state => state.graph.determinantsGraphDrugClass);
  const trendsGraphDrugClass = useAppSelector(state => state.graph.trendsGraphDrugClass);
  const KODiversityGraphView = useAppSelector(state => state.graph.KODiversityGraphView);
  const colorPallete = useAppSelector(state => state.dashboard.colorPallete);
  const genotypesForFilter = useAppSelector(state => state.dashboard.genotypesForFilter);
  const convergenceGroupVariable = useAppSelector(state => state.graph.convergenceGroupVariable);
  const convergenceColourVariable = useAppSelector(state => state.graph.convergenceColourVariable);
  const convergenceColourPallete = useAppSelector(state => state.graph.convergenceColourPallete);
  const prevalenceMapViewOptionsSelected = useAppSelector(state => state.graph.prevalenceMapViewOptionsSelected);
  const drugResistanceGraphView = useAppSelector(state => state.graph.drugResistanceGraphView);
  const captureDRT = useAppSelector(state => state.dashboard.captureDRT);
  const captureRFWG = useAppSelector(state => state.dashboard.captureRFWG);
  const captureRDWG = useAppSelector(state => state.dashboard.captureRDWG);
  const captureGD = useAppSelector(state => state.dashboard.captureGD);
  const genotypesForFilterSelected = useAppSelector(state => state.dashboard.genotypesForFilterSelected);
  const genotypesForFilterSelectedRD = useAppSelector(state => state.dashboard.genotypesForFilterSelectedRD);
  const topGenesSlice = useAppSelector(state => state.graph.topGenesSlice);
  const topGenotypeSlice = useAppSelector(state => state.graph.topGenotypeSlice);
  const topColorSlice = useAppSelector(state => state.graph.topColorSlice);
  const endtimeGD = useAppSelector(state => state.graph.endtimeGD);
  const starttimeGD = useAppSelector(state => state.graph.starttimeGD);
  const endtimeDRT = useAppSelector(state => state.graph.endtimeDRT);
  const starttimeDRT = useAppSelector(state => state.graph.starttimeDRT);
  const actualGenomesGD = useAppSelector(state => state.graph.actualGenomesGD);
  const actualGenomesDRT = useAppSelector(state => state.graph.actualGenomesDRT);
  const starttimeRDT = useAppSelector(state => state.graph.starttimeRDT);
  const endtimeRDT = useAppSelector(state => state.graph.endtimeRDT);
  const actualGenomesRDT = useAppSelector(state => state.graph.actualGenomesRDT);
  const selectedLineages = useAppSelector(state => state.dashboard.selectedLineages);
  const coloredOptions = useAppSelector(state => state.graph.coloredOptions);
  const drugClass = useAppSelector(state => state.graph.drugClass); // Drug class selected in the graph for PDF
  const drugGene = useAppSelector(state => state.graph.drugGene); // Drug gene selected in the graph for PDF
  //loadingPDF:  Loading state for PDF generation and temp change the visibility of the Geo Comp Heatmap
  // to show all the selected values to take a correct screenshot
  const loadingPDF = useAppSelector(state => state.dashboard.loadingPDF);
  const KOForFilterSelected = useAppSelector(state => state.dashboard.KOForFilterSelected);
  const colorPalleteKO = useAppSelector(state => state.dashboard.colorPalleteKO);
  const KOTrendsGraphPlotOption = useAppSelector(state => state.graph.KOTrendsGraphPlotOption);
  const customDropdownMapViewNG = useAppSelector(state => state.graph.customDropdownMapViewNG);
  const colorPalleteCgST = useAppSelector(state => state.dashboard.colorPalleteCgST);
  const colorPalleteSublineages = useAppSelector(state => state.dashboard.colorPalleteSublineages);
  const distributionGraphVariable = useAppSelector(state => state.graph.distributionGraphVariable);
  const colourPattern = useAppSelector(state => state.dashboard.colourPattern);
  const convergenceData = useAppSelector(state => state.graph.convergenceData);
  const currentSliderValueCM = useAppSelector(state => state.graph.currentSliderValueCM);

  async function handleClickDownloadDatabase() {
    let firstName, secondName;
    if (organism === 'styphi') {
      firstName = 'Salmonella';
      secondName = 'Typhi';
    } else if (organism === 'kpneumo') {
      firstName = 'Klebsiella';
      secondName = 'pneumoniae';
    } else if (organism === 'ngono') {
      firstName = 'Neisseria';
      secondName = 'gonorrhoeae';
    } else if (organism === 'shige') {
      firstName = 'Shigella';
      secondName = '+ EIEC';
    } else if (organism === 'decoli') {
      firstName = 'Escherichia coli';
      secondName = '(diarrheagenic)';
    } else if (organism === 'sentericaints') {
      firstName = 'Salmonella';
      secondName = '(invasive non-typhoidal)';
    } else if (organism === 'senterica') {
      firstName = 'Salmonella enterica';
      secondName = '(non-typhoidal)';
    }
    if (organism !== 'styphi') columnsToRemove = [...columnsToRemoveNonTyphi, ...columnsToRemove];
    setLoadingCSV(true);

    try {
      const res = await axios.post(`/api/file/download`, { organism });

      const parsed = Papa.parse(res.data, {
        header: false,
        skipEmptyLines: true,
      });

      const lines = parsed.data;

      const replacements = {
        COUNTRY_ONLY: 'Country',
        NAME: 'Name',
        DATE: 'Date',
        GENOTYPE: 'Genotype',
        source_type: 'Source_type',
        accession: 'Accession',
        ACCESSION: 'Accession',
        'dashboard view': 'Dashboard view',
      };

      lines[0] = lines[0].map(header => replacements[header] || header);

      // columns to remove
      const indexesToRemove = columnsToRemove
        .map(col => lines[0].indexOf(col))
        .filter(index => index !== -1)
        .sort((a, b) => b - a); // Reverse sort for safe removal

      // Remove columns
      const newLines = lines.map(row => row.filter((_, i) => !indexesToRemove.includes(i)));

      // create TSV
      const newTSV = newLines.map(row => row.join('\t')).join('\n');

      // Download
      download(newTSV, `AMRnet ${firstName} ${secondName} Database.tsv`);
    } catch (error) {
      console.error('Error downloading database:', error);
    } finally {
      setLoadingCSV(false);
      dispatch(setLoadingPDF(false));
    }
  }

  function getOrganismCards() {
    return graphCards.filter(card => card.organisms.includes(organism));
  }

  function getGenotypeColor(genotype) {
    return currentColorPallete[genotype] || colorPalleteKO[KOTrendsGraphPlotOption][genotype] || '#F5F4F6';
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

  function getDrugClassesBars() {
    switch (organism) {
      case 'styphi':
        return colorForDrugClassesST[determinantsGraphDrugClass];
      case 'kpneumo':
        return colorForDrugClassesKP[determinantsGraphDrugClass];
      case 'ngono':
        return colorForDrugClassesNG[determinantsGraphDrugClass];
      default:
        return '';
    }
  }

  function formatDate(date) {
    return moment(date).format('ddd MMM DD YYYY HH:mm');
  }
  let Page = 0;
  function drawFooter({ document, pageHeight, pageWidth, date }) {
    Page++;
    document.setFontSize(10);
    document.line(0, pageHeight - 26, pageWidth, pageHeight - 24);
    document.text(`Source: amrnet.org`, 16, pageHeight - 10, { align: 'left' });
    document.text(`Page:${Page}`, pageWidth - 16, pageHeight - 10, { align: 'right' });
    document.setFontSize(12);
  }

  function drawHeader({ document, pageWidth }) {
    document.setFontSize(8);
    document.line(0, 26, pageWidth, 26);
    if (organism !== 'styphi' && organism !== 'ngono')
      document.text(
        `NOTE: these estimates are derived from unfiltered genome data deposited in public databases, which reflects a strong bias towards sequencing of resistant strains. This will change in future updates.`,
        16,
        10,
        { align: 'left', maxWidth: pageWidth - 16 },
      );
    document.setFontSize(12);
  }

  // function drawHeader({ document, pageWidth}) {
  //   document.setFontSize(10);
  //   document.line(0, 26, pageWidth, 26);
  //   document.text(`NOTE: these estimates are derived from unfiltered genome data deposited in public databases, which reflects a strong bias towards sequencing of resistant strains. This will change in future updates.`, 160, 20, { align: 'center', maxWidth: pageWidth - 36  });
  //   document.setFontSize(12);
  // }
  function drawLegend({
    document, // jsPDF document instance
    legendData,
    factor,
    rectY,
    isGenotype = false,
    isDrug = false,
    isVariable = false,
    isGen = false,
    xSpace,
    topConvergenceData = [], // For convergence graph pattern sync
    genotypesForFilterSelected = [], // For genotype pattern sync
    KOForFilterSelected = [], // For KO pattern sync
    factorMultiply = 3,
  }) {
    // --- shared pattern configuration ---
    const patternTypes = ['solid', 'stripes', 'dots', 'cross'];
    const getPatternTypeForGenotype = (
      legend,
      topConvergenceData = [],
      genotypesForFilterSelected = [],
      KOForFilterSelected = [],
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

    // --- main legend drawing loop ---
    legendData.forEach((legend, i) => {
      const yFactor = (i % factor) * 10;
      const xFactor = Math.floor(i / factor) * xSpace;

      // Determine if we should use patterns (for genotypes OR variables)
      const usePattern = colourPattern && (isGenotype || isVariable);

      if (usePattern) {
        // Determine pattern type
        const patternType = getPatternTypeForGenotype(
          legend,
          topConvergenceData,
          genotypesForFilterSelected,
          KOForFilterSelected,
        );

        // Determine base color
        let baseColor;
        if (isGenotype) {
          if (legend === 'Other') {
            baseColor = '#F5F4F6';
          } else if (KOForFilterSelected && KOForFilterSelected.includes(legend)) {
            const colorMap = colorPalleteKO[KOTrendsGraphPlotOption] || {};
            baseColor = colorMap[legend] || getGenotypeColor(legend);
          } else {
            baseColor = getGenotypeColor(legend);
          }
        } else if (isVariable) {
          baseColor = convergenceColourPallete[legend] || '#F5F4F6';
        } else {
          baseColor = '#F5F4F6';
        }

        // --- create high-res pattern canvas ---
        const patternCanvas = window.document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d');
        patternCtx.imageSmoothingEnabled = true;
        patternCtx.imageSmoothingQuality = 'high';

        const patternResolution = 64; // internal pixel size for clarity
        const logicalSize = 8; // logical units (like SVG viewBox)
        const scale = patternResolution / logicalSize;

        patternCanvas.width = patternResolution;
        patternCanvas.height = patternResolution;
        patternCtx.scale(scale, scale);

        // --- draw pattern background ---
        patternCtx.fillStyle = baseColor;
        patternCtx.fillRect(0, 0, logicalSize, logicalSize);

        // --- draw pattern details (match SVG logic) ---
        switch (patternType) {
          case 'solid':
            // already filled
            break;

          case 'stripes':
            patternCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            patternCtx.lineWidth = 0.5;
            patternCtx.beginPath();
            for (let j = -8; j < 16; j += 3) {
              patternCtx.moveTo(j, 8);
              patternCtx.lineTo(j + 8, 0);
            }
            patternCtx.stroke();
            break;

          case 'dots':
            patternCanvas.width = 6;
            patternCanvas.height = 6;

            patternCtx.fillStyle = baseColor;
            patternCtx.fillRect(0, 0, 6, 6);

            patternCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';

            // 2x2 grid of small dots
            const dotRadius = 0.5;
            for (let x = 1.5; x <= 4.5; x += 3) {
              for (let y = 1.5; y <= 4.5; y += 3) {
                patternCtx.beginPath();
                patternCtx.arc(x, y, dotRadius, 0, 2 * Math.PI);
                patternCtx.fill();
              }
            }

            break;

          case 'cross':
            patternCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            patternCtx.lineWidth = 0.5;
            patternCtx.beginPath();
            for (let j = -8; j < 16; j += 3) {
              patternCtx.moveTo(j, 8);
              patternCtx.lineTo(j + 8, 0);
            }
            for (let j = -8; j < 16; j += 3) {
              patternCtx.moveTo(j, 0);
              patternCtx.lineTo(j + 8, 8);
            }
            patternCtx.stroke();
            break;
        }

        // --- render to PDF ---
        const patternDataUrl = patternCanvas.toDataURL('image/png');
        const rectX = 46 + xFactor;
        const rectYPos = rectY + 26 + yFactor;

        // // Draw the image as pattern box
        // document.addImage(patternDataUrl, 'PNG', rectX, rectYPos, 16, 16, undefined, 'FAST');

        // Add border
        document.setDrawColor(204, 204, 204);
        const boxSize = 8; // new smaller size

        // Draw the image as pattern box
        document.addImage(patternDataUrl, 'PNG', rectX, rectYPos, boxSize, boxSize, undefined, 'MEDIUM');

        // Add border
        document.setDrawColor(204, 204, 204);
        document.setLineWidth(0.5);
        document.rect(rectX, rectYPos, boxSize, boxSize);
      } else {
        // --- non-pattern (color only) legend items ---
        let fillColor;

        if (isGenotype) {
          fillColor = legend === 'Other' ? '#F5F4F6' : getGenotypeColor(legend);
        } else if (isDrug) {
          fillColor = getColorForDrug(legend, colourPattern);
        } else if (isVariable) {
          fillColor = convergenceColourPallete[legend] || '#F5F4F6';
        } else if (isGen) {
          fillColor = i === legendData.length - 1 ? '#F5F4F6' : colorForMarkers(i, colourPattern);
        } else {
          fillColor = legend.color || '#F5F4F6';
        }

        // Convert hex to RGB
        const hexToRgb = hex => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
              }
            : { r: 245, g: 244, b: 246 };
        };

        const rgb = hexToRgb(fillColor);
        document.setFillColor(rgb.r, rgb.g, rgb.b);

        const radius = !colourPattern ? 3 : i % 2 !== 0 ? 3.5 : 3;
        const circleX = 52 + xFactor;
        const circleY = rectY + 30 + yFactor;

        document.circle(circleX, circleY, radius, 'F');
      }

      // --- text label ---
      document.setTextColor(0, 0, 0);
      const textX = usePattern ? 65 + xFactor : 61 + xFactor;
      const textY = rectY + 32 + yFactor;

      let textContent;
      if (isGenotype || isDrug || isVariable) {
        textContent = String(legend).replaceAll('β', 'B');
      } else if (isGen) {
        textContent = String(legend);
      } else {
        textContent = legend.name || String(legend);
      }

      document.text(textContent, textX, textY);
    });
  }

  async function handleClickDownloadPDF() {
    dispatch(setLoadingPDF(true));
    dispatch(
      setCollapses({
        continent: true,
        all: true,
        map: true,
        continentP: true,
      }),
    );
    dispatch(setPosition({ coordinates: [0, 0], zoom: 1 }));

    try {
      if (genotypesForFilter.length <= 0) return console.log('No data available to generate report');
      const doc = new jsPDF({ unit: 'px', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const date = formatDate(new Date());

      // Logo
      const logo = new Image();
      logo.src = LogoImg;
      const logoWidth = 80;
      doc.addImage(logo, 'PNG', 16, 36, logoWidth, 41, undefined, 'FAST');

      let texts;
      let firstName,
        secondName,
        secondword = 330,
        firstWord = 264,
        fontSize = 16,
        amrnetHeading = 177;
      if (organism === 'styphi') {
        texts = getSalmonellaTexts(date);
        firstName = 'Salmonella';
        secondName = 'Typhi';
        secondword = 315;
      } else if (organism === 'kpneumo') {
        texts = getKlebsiellaTexts();
        firstName = 'Klebsiella';
        secondName = 'pneumoniae';
        amrnetHeading = 167;
        secondword = 320;
        firstWord = 254;
      } else if (organism === 'ngono') {
        texts = getNgonoTexts();
        firstName = 'Neisseria';
        secondName = 'gonorrhoeae';
        amrnetHeading = 157;
        secondword = 310;
        firstWord = 244;
      } else if (organism === 'shige') {
        texts = getShigeTexts();
        firstName = 'Shigella';
        secondName = '+ EIEC';
        secondword = 305;
        firstWord = 257;
      } else if (organism === 'senterica') {
        texts = getSentericaintsTexts();
        firstName = 'Salmonella enterica';
        secondName = '(non-typhoidal)';
        secondword = 360;
        firstWord = 260;
        amrnetHeading = 147;
      } else if (organism === 'ecoli') {
        texts = getEcoliTexts();
        firstName = 'Escherichia';
        secondName = 'coli';
        firstWord = 269; // Adjusted for E. coli
        secondword = 315;
      } else if (organism === 'decoli') {
        texts = getDEcoliTexts();
        firstName = 'Escherichia coli';
        secondName = '(diarrheagenic)';
        secondword = 340;
        firstWord = 250;
        amrnetHeading = 147;
      } else {
        texts = getIntsTexts();
        secondName = '(invasive non-typhoidal)';
        firstName = 'Salmonella';
        amrnetHeading = 150;
        firstWord = 217;
        secondword = 296;
        fontSize = 12;
      }

      // Title and Date
      drawHeader({ document: doc, pageWidth });
      doc.setFontSize(fontSize).setFont(undefined, 'bold');
      doc.text('AMRnet Report for', amrnetHeading, 44, { align: 'center' });
      if (organism === 'styphi' || organism === 'senterica' || organism === 'shige')
        doc.setFont(undefined, 'bolditalic');
      doc.text(firstName, firstWord, 44, { align: 'center' });
      if (
        organism === 'kpneumo' ||
        organism === 'ngono' ||
        organism === 'sentericaints' ||
        organism === 'senterica' ||
        organism === 'decoli'
      )
        doc.setFont(undefined, 'bolditalic');
      else doc.setFont(undefined, 'bold');
      doc.text(secondName, secondword, 44, { align: 'center' });
      doc.setFontSize(12).setFont(undefined, 'normal');
      doc.text(date, pageWidth / 2, 68, { align: 'center' });

      if (organism === 'styphi') {
        let list = PMID.filter(value => value !== '-');
        let pmidSpace, dynamicText;
        if (actualCountry === 'All' && actualRegion === 'All') {
          pmidSpace = 50;
          dynamicText = `Data are drawn from studies with the following PubMed IDs (PMIDs) or Digital Object Identifier (DOI): ${list.join(
            ', ',
          )}.`;
          // pmidSpace = 50;
        } else {
          list = listPMID.filter(value => value !== '-');
          dynamicText = `Data for region ${actualRegion} and country ${actualCountry} are drawn from studies with the following PubMed IDs (PMIDs) or Digital Object Identifier (DOI): ${list.join(
            ', ',
          )}.`;
          const textWidth = doc.getTextWidth(dynamicText);
          const widthRanges = [400, 800, 1230, 1640, 2050, 2460, 2870];
          const pmidSpaces = [0, 10, 20, 30, 40, 50, 60, 70];

          // Find the appropriate pmidSpace based on textWidth
          pmidSpace =
            pmidSpaces.find((space, index) => textWidth <= widthRanges[index]) || pmidSpaces[pmidSpaces.length - 1];
        }
        doc.text(dynamicText, 16, 275, { align: 'left', maxWidth: pageWidth - 36 });

        // Info

        doc.text(texts[0], 16, 105, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[1], 16, 135, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[2], 16, 155, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[3], 90, 165, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[4], 136, 165, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'normal');
        doc.text(texts[5], 16, 175, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[6], 16, 205, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[7], 62, 205, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'bold');
        doc.text(texts[8], 16, 215, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'normal');
        doc.setFont(undefined, 'italic');
        doc.text(texts[9], 16, 235, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[10], 62, 235, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[11], 16, 245, { align: 'left', maxWidth: pageWidth - 36 });

        doc.text(texts[12], 16, 305 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });

        doc.text(texts[13], 16, 345 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[14], 56, 345 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        // doc.setFontSize(10).setFont(undefined, 'bold');
        doc.text(texts[15], 102, 345 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[16], 16, 365 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[17], 16, 385 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[18], 16, 415 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[19], 16, 445 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[20], 16, 475 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[21], 16, 495 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[22], 16, 525 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[23], 16, 545 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text('qnr', 16, 555 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[24], 32, 555 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text('gyrA/parC/gyrB', 120, 555 + pmidSpace, {
          align: 'left',
          maxWidth: pageWidth - 36,
        });
        doc.setFont(undefined, 'normal');
        doc.text(texts[25], 183, 555 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });

        // doc.setFont(undefined, 'italic');
        // doc.text('qnr', 16, 40, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'normal');
        // doc.text(texts[24], 32, 40, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'italic');
        // doc.text('gyrA/parC/gyrB', 120, 40, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'normal');
        // doc.text(texts[25], 183, 40, { align: 'left', maxWidth: pageWidth - 36 });
        if (pmidSpace >= 40) {
          drawFooter({ document: doc, pageHeight, pageWidth, date });
          doc.addPage();
          drawHeader({ document: doc, pageWidth });
          doc.text(texts[26], 16, 40, { align: 'left', maxWidth: pageWidth - 36 });
        } else {
          doc.text(texts[26], 16, 585 + pmidSpace - 10, {
            align: 'left',
            maxWidth: pageWidth - 36,
          });
          // drawFooter({ document: doc, pageHeight, pageWidth, date });
          // doc.addPage();
          // drawHeader({ document: doc, pageWidth });
        }
        // doc.setFont(undefined, 'bold');
        // doc.text(texts[27], 16, pageHeight - 90, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'normal');
        // doc.text(texts[28], 16, pageHeight - 70, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'italic');
        // doc.text(texts[29], 136, pageHeight - 70, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'normal');
        // doc.text(texts[30], 182, pageHeight - 70, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.text(texts[31], 16, pageHeight - 60, { align: 'left', maxWidth: pageWidth - 36 });
        // // doc.setFont(undefined, 'normal');
        // const euFlag = new Image();
        // euFlag.src = EUFlagImg;
        // doc.addImage(euFlag, 'JPG', 322, pageHeight - 56.5, 12, 7, undefined, 'FAST');
        // doc.text(texts[31], 16, pageHeight - 30, { align: 'left', maxWidth: pageWidth - 36 });
      } else if (organism === 'kpneumo') {
        // Info
        let kleb = 92;
        doc.text(texts[0], 16, 105, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[1], 16, 125, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[2], 16, 145, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[3], 155, 155, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[4], 247, 155, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[5], 16, 175, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[6], 108, 175, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[7], 16, 185, { align: 'justify', maxWidth: pageWidth - 36 });

        // Add a yellow background
        doc.setFillColor(255, 253, 175); // Yellow color
        doc.rect(10, 200, pageWidth - 20, 120, 'F'); // Draw a filled rectangle as background
        doc.setFont(undefined, 'bold');
        doc.text(texts[8], 16, 215, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[9], 16, 225, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[10], 35, 225, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[11], 35 + kleb, 225, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[12], 16, 235, { align: 'justify', maxWidth: pageWidth - 36 });
        // doc.text(texts[13], 16, 235, { align: 'justify', maxWidth: pageWidth - 36 });
        // doc.text(texts[14], 16, 245, { align: 'justify', maxWidth: pageWidth - 36 });
        // doc.text(texts[15], 16, 255, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[13], 240, 265, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[14], 332, 265, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[15], 16, 275, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[16], 16, 305, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[17], 198, 305, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[18], 16, 315, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setTextColor(0, 0, 0);
        doc.text(texts[19], 16, 335, { align: 'justify', maxWidth: pageWidth - 36 });

        doc.text(texts[20], 16, 365, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[21], 60, 365, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[22], 60 + kleb, 365, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[23], 16, 385, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[24], 16, 395, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[25], 16, 405, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[26], 16 + kleb, 405, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[27], 16, 415, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[28], 16, 445, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[29], 16, 485, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[30], 16, 495, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[31], 16, 505, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[32], 16, 515, { align: 'justify', maxWidth: pageWidth - 36 });
        // const euFlag = new Image();
        // euFlag.src = EUFlagImg;
        // doc.addImage(euFlag, 'JPG',173,pageHeight-38, 12, 7, undefined,'FAST');
      } else if (organism === 'ngono') {
        let list = PMID.filter(value => value !== '-');
        let pmidSpace, dynamicText;
        if (actualCountry === 'All' && actualRegion === 'All') {
          pmidSpace = 0;
          dynamicText = `Data are drawn from studies with the following PubMed IDs (PMIDs): ${list.join(', ')}.`;
        } else {
          list = listPMID.filter(value => value !== '-');
          dynamicText = `Data for region ${actualRegion} and country ${actualCountry} are drawn from studies with the following PubMed IDs (PMIDs): ${list.join(
            ', ',
          )}.`;
        }
        const textWidth = doc.getTextWidth(dynamicText);
        const widthRanges = [410, 820, 1230, 1640, 2050, 2460, 2870];
        const pmidSpaces = [10, 20, 30, 40, 50, 60, 70, 80];

        // Find the appropriate pmidSpace based on textWidth
        pmidSpace =
          pmidSpaces.find((space, index) => textWidth <= widthRanges[index]) || pmidSpaces[pmidSpaces.length - 1];

        doc.text(dynamicText, 16, 265, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[0], 16, 105, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[1], 16, 125, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[2], 16, 145, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[3], 16, 175, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[4], 16, 215, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[5], 112, 215, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[6], 16, 225, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'bold');

        doc.text(texts[7], 16, 275 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[8], 16, 315 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[9], 56, 315 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[10], 150, 315 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[11], 16, 335 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[12], 16, 355 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[13], 32, 365 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[14], 74, 365 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[15], 16, 375 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[16], 170, 375 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[17], 240, 375 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[18], 16, 385 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[19], 16, 415 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[20], 16, 445 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[21], 16, 485 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[22], 16, 515 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[23], 16, 535 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });

        drawFooter({ document: doc, pageHeight, pageWidth, date });
        doc.addPage();
        drawHeader({ document: doc, pageWidth });
        doc.setFont(undefined, 'bold');
        doc.text(texts[22], 16, 46, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[23], 16, 66, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[24], 16, 116, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[25], 16, 146, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[26], 16, 186, { align: 'left', maxWidth: pageWidth - 36 });
      } else if (organism === 'sentericaints') {
        // Info
        doc.text(texts[0], 16, 105, { align: 'justify', maxWidth: pageWidth - 36 });

        doc.setFont(undefined, 'italic');
        doc.text(texts[1], 16, 125, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[2], 65, 125, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[3], 162, 125, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[4], 16, 135, { align: 'justify', maxWidth: pageWidth - 36 });

        doc.text(texts[5], 16, 185, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[6], 106, 185, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[7], 153, 185, { align: 'justify', maxWidth: pageWidth - 36 });

        // Add a yellow background //WARNING
        doc.setFillColor(255, 253, 175); // Yellow color
        doc.rect(10, 200, pageWidth - 20, 90, 'F'); // Draw a filled rectangle as background
        doc.setFont(undefined, 'bold');
        doc.text(texts[8], 16, 215, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[9], 16, 235, { align: 'justify', maxWidth: pageWidth - 36 });

        //Variable definitions
        doc.setFont(undefined, 'bold');
        doc.text(texts[10], 16, 305, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[11], 16, 325, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[12], 55, 325, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[13], 16, 335, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[14], 16, 365, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[15], 96, 365, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[16], 16, 375, { align: 'justify', maxWidth: pageWidth - 36 });

        // Abbreviations
        doc.setFont(undefined, 'bold');
        doc.text(texts[17], 16, 405, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[18], 16, 425, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[19], 45, 425, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[20], 16, 435, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[21], 45, 435, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[22], 16, 445, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[23], 45, 445, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[24], 16, 455, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[25], 45, 455, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[26], 16, 465, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[27], 45, 465, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[28], 16, 475, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[29], 45, 475, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[30], 16, 485, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[31], 45, 485, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[32], 16, 495, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[33], 45, 495, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[34], 45, 505, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[35], 16, 515, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[36], 45, 515, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[37], 16, 525, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[38], 95, 525, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[39], 95, 535, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[40], 110, 535, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[41], 200, 535, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[42], 267, 535, { align: 'justify', maxWidth: pageWidth - 36 });

        doc.setFont(undefined, 'bold');
        doc.text(texts[43], 16, 545, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[44], 95, 545, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[45], 95, 555, { align: 'justify', maxWidth: pageWidth - 36 });
        // const euFlag = new Image();
        // euFlag.src = EUFlagImg;
        // doc.addImage(euFlag, 'JPG',173,pageHeight-38, 12, 7, undefined,'FAST');
      } else if (organism === 'senterica') {
        // Info
        doc.setFont(undefined, 'italic');
        doc.text(texts[0], 16, 105, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[1], 100, 105, { align: 'justify', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'italic');
        doc.text(texts[2], 16, 115, { align: 'justify', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'normal');
        doc.text(texts[3], 16, 155, { align: 'justify', maxWidth: pageWidth - 36 });

        // // Add a yellow background //WARNING
        doc.setFillColor(255, 253, 175); // Yellow color
        doc.rect(10, 165, pageWidth - 20, 40, 'F'); // Draw a filled rectangle as background
        doc.setFont(undefined, 'bold');
        doc.text(texts[4], 16, 185, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[5], 65, 185, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[6], 85, 185, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[7], 165, 185, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[8], 16, 195, { align: 'justify', maxWidth: pageWidth - 36 });
        // Variable definitions

        doc.setFont(undefined, 'bold');
        doc.text(texts[9], 16, 225, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[10], 16, 245, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[11], 16, 275, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[12], 16, 295, { align: 'justify', maxWidth: pageWidth - 36 });

        // Abbreviations
        doc.setFont(undefined, 'bold');
        doc.text(texts[13], 16, 315, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[14], 16, 335, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[15], 16, 365, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[16], 16, 385, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text('qnr', 16, 395, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[17], 32, 395, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text('gyrA/parC/gyrB', 120, 395, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[18], 183, 395, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[19], 16, 415, { align: 'left', maxWidth: pageWidth - 36 });
      } else if (organism === 'shige') {
        // Info
        doc.setFont(undefined, 'italic');
        doc.text(texts[0], 16, 105, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[1], 55, 105, { align: 'justify', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'italic');
        doc.text(texts[2], 16, 115, { align: 'justify', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'normal');
        // doc.text(texts[3], 16, 155, { align: 'justify', maxWidth: pageWidth - 36 });

        // // Add a yellow background //WARNING
        doc.setFillColor(255, 253, 175); // Yellow color
        doc.rect(10, 165, pageWidth - 20, 60, 'F'); // Draw a filled rectangle as background
        doc.setFont(undefined, 'bold');
        doc.text(texts[3], 16, 185, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[4], 65, 185, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[5], 85, 185, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[6], 115, 185, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[7], 16, 195, { align: 'justify', maxWidth: pageWidth - 36 });
        // Variable definitions
        doc.setFont(undefined, 'bold');
        doc.text(texts[8], 16, 245, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[9], 16, 265, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[10], 16, 275, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[11], 16, 325, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[12], 16, 335, { align: 'left', maxWidth: pageWidth - 36 });

        // // Abbreviations
        // doc.setFont(undefined, 'bold');
        // doc.text(texts[13], 16, 315, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'normal');
        // doc.text(texts[14], 16, 335, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.text(texts[15], 16, 365, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.text(texts[16], 16, 385, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'italic');
        // doc.text('qnr', 16, 395, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'normal');
        // doc.text(texts[17], 32, 395, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'italic');
        // doc.text('gyrA/parC/gyrB', 120, 395, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'normal');
        // doc.text(texts[18], 183, 395, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.text(texts[19], 16, 415, { align: 'left', maxWidth: pageWidth - 36 });
      } else if (organism === 'decoli') {
        // Info
        doc.setFont(undefined, 'normal');
        doc.text(texts[0], 16, 105, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[1], 80, 105, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[2], 145, 105, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[3], 16, 115, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[4], 16, 165, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[5], 16, 175, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[6], 16, 185, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[7], 16, 195, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[8], 16, 205, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[9], 16, 225, { align: 'justify', maxWidth: pageWidth - 36 });

        doc.setFillColor(255, 253, 175); // Yellow color
        doc.rect(10, 245, pageWidth - 20, 65, 'F'); // Draw a filled rectangle as background
        doc.setFont(undefined, 'bold');
        doc.text(texts[10], 16, 265, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[11], 65, 265, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[12], 16, 275, { align: 'left', maxWidth: pageWidth - 36 });
        // Abbreviations
        doc.setFont(undefined, 'bold');
        doc.text(texts[13], 16, 335, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[14], 16, 355, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[15], 60, 355, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[16], 16, 375, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[17], 102, 375, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'italic');
        // doc.text('gyrA/parC/gyrB', 120, 395, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'normal');
        doc.text(texts[18], 16, 385, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.text(texts[19], 16, 415, { align: 'left', maxWidth: pageWidth - 36 });
      } else if (organism === 'ecoli') {
        //Added texts for E. coli
        // Info
        doc.setFont(undefined, 'italic');
        doc.text(texts[0], 16, 105, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[1], 80, 105, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[2], 100, 105, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[3], 135, 105, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[4], 16, 115, { align: 'justify', maxWidth: pageWidth - 36 });
        //WARNING
        // Add a yellow background
        doc.setFillColor(255, 253, 175); // Yellow color
        doc.rect(10, 215, pageWidth - 20, 55, 'F'); // Draw a filled rectangle as background
        doc.setFont(undefined, 'bold');
        doc.text(texts[5], 16, 225, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[6], 16, 245, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[7], 32, 245, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[8], 100, 245, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.text(texts[9], 16, 255, { align: 'justify', maxWidth: pageWidth - 36 });
        // Abbreviations
        doc.setFont(undefined, 'bold');
        doc.text(texts[10], 16, 285, { align: 'justify', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[11], 16, 305, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[12], 16, 325, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[13], 16, 345, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[14], 16, 365, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'normal');
        // doc.text(texts[15], 60, 355, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'bold');
        // doc.text(texts[16], 16, 375, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'normal');
        // doc.text(texts[17], 102, 375, { align: 'left', maxWidth: pageWidth - 36 });
        // // doc.setFont(undefined, 'italic');
        // // doc.text('gyrA/parC/gyrB', 120, 395, { align: 'left', maxWidth: pageWidth - 36 });
        // // doc.setFont(undefined, 'normal');
        // doc.text(texts[18], 16, 385, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.text(texts[19], 16, 415, { align: 'left', maxWidth: pageWidth - 36 });
      } else {
        console.log('No Report available for this organism');
      }

      drawFooter({ document: doc, pageHeight, pageWidth, date });

      // Map
      // Add 'Global Overview of {mapView}' title
      const mapLegend = mapLegends.find(x => x.value === mapView);
      const actualMapView = mapLegend ? (mapLegend.labelKey ? t(mapLegend.labelKey) : mapLegend.label) : mapView;
      doc.addPage();
      drawHeader({ document: doc, pageWidth });
      drawFooter({ document: doc, pageHeight, pageWidth, date });

      doc.setFontSize(fontSize).setFont(undefined, 'bold');
      doc.text(`Global Overview of ${actualMapView} `, pageWidth / 2, 44, { align: 'center' });
      //Rename Report heading based on new Org name
      doc.setFontSize(12).setFont(undefined, 'normal');
      doc.text(`Total: ${actualGenomes} genomes`, pageWidth / 2, 60, { align: 'center' });
      doc.text(`Country: ${actualCountry}`, pageWidth / 2, 72, { align: 'center' });
      doc.text(`Time Period: ${actualTimeInitial} to ${actualTimeFinal}`, pageWidth / 2, 84, {
        align: 'center',
      });
      doc.line(16, 96, pageWidth - 16, 96);

      doc.setFont(undefined, 'bold');
      doc.text('Map', 16, 116);
      doc.setFont(undefined, 'normal');
      // doc.text(`Map View: ${actualMapView}`, 16, 128);
      // doc.text(`Dataset: ${dataset}${dataset === 'All' && organism === 'styphi' ? ' (local + travel)' : ''}`, 16, 140);
      doc.text(`Dataset: ${dataset}${dataset === 'All' && organism === 'styphi' ? ' (local + travel)' : ''}`, 16, 128);
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

      doc.text(`${getAxisLabel()} `, 16, 140);

      // Improve PDF for long list of "prevalenceMapViews"
      const prevalenceMapViews = [
        'Genotype prevalence',
        'Lineage prevalence',
        'ST prevalence',
        'Sublineage prevalence',
        'Pathotype prevalence',
        'Serotype prevalence',
        'O prevalence',
        'H prevalence',
      ];

      let y = 162;
      const maxLineLength = 98;
      // Helper to draw wrapped text
      // Improve code for {mapView}: {Prevelance list}
      const drawWrappedText = (label, text) => {
        const fullText = `${label}: ${text}`;
        for (let i = 0; i < fullText.length; i += maxLineLength) {
          const line = fullText.slice(i, i + maxLineLength);
          doc.text(line, 16, y);
          y += 10;

          if (y > pageHeight - 30) {
            doc.addPage();
            drawHeader({ document: doc, pageWidth });
            drawFooter({ document: doc, pageHeight, pageWidth, date });
            y = 50; // Reset y to 30 at the top of the new page
          }
        }
      };

      // Prevalence map views
      if (prevalenceMapViews.includes(mapView)) {
        const genotypesText = prevalenceMapViewOptionsSelected.join(', ');
        drawWrappedText(mapView, genotypesText);
      }

      // NG-MAST specific view
      if (mapView === 'NG-MAST prevalence') {
        const genotypesText = customDropdownMapViewNG.join(', ');
        drawWrappedText(mapView, genotypesText);
      }

      // Resistance prevalence view
      if (mapView === 'Resistance prevalence') {
        const resolvedOptions =
          ngonoSusceptibleRule(prevalenceMapViewOptionsSelected, organism) ||
          drugAcronymsOpposite[prevalenceMapViewOptionsSelected] ||
          prevalenceMapViewOptionsSelected;

        const genotypesText = resolvedOptions.join(', ');
        drawWrappedText(mapView, genotypesText);
      }

      // let mapY = 180 + prevalenceMapViewOptionsSelected.length * 9;
      await svgAsPngUri(document.getElementById('global-overview-map'), {
        // scale: 4,
        backgroundColor: 'white',
        width: 1200,
        left: -200,
      }).then(async uri => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const mapImg = document.createElement('img');
        const mapImgPromise = imgOnLoadPromise(mapImg);
        mapImg.src = uri;
        await mapImgPromise;

        canvas.width = 4800;
        canvas.height = 2400;
        ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);

        const img = canvas.toDataURL('image/png');
        doc.addImage(img, 'PNG', 0, y + 40, pageWidth, 223, undefined, 'FAST');
      });

      const mapLegendImage = new Image();
      let legendWidth = 58.85;

      switch (mapView) {
        case 'Genotype prevalence':
          // legendWidth = organism === 'styphi' ? 414.21 : 394.28;
          mapLegendImage.src = `legends/MapView_prevalence.png`;
          break;
        case 'No. Samples':
          mapLegendImage.src = 'legends/MapView_NoSamples.png';
          break;
        case 'Pansusceptible':
          mapLegendImage.src = 'legends/MapView_Sensitive.png';
          break;
        default:
          mapLegendImage.src = 'legends/MapView_Others.png';
          break;
      }
      if (mapView === 'Dominant Genotype') {
        doc.addImage(mapLegendImage, 'PNG', pageWidth / 2 - legendWidth / 2, y, legendWidth, 47, undefined, 'FAST');
      } else {
        doc.addImage(mapLegendImage, 'PNG', pageWidth - pageWidth / 5, y, legendWidth, 47, undefined, 'FAST');
      }

      //Heatmap
      // Helper to add page with header/footer and optional title/metadata
      let displayHeight;
      function addStandardPage({ doc, title, subtitle1, subtitle2, date, pageWidth, pageHeight }) {
        doc.addPage();
        drawHeader({ document: doc, pageWidth });
        drawFooter({ document: doc, pageHeight, pageWidth, date });
        doc.setFontSize(12).setFont(undefined, 'bold');
        doc.text(title, 16, 44);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(12);
        if (subtitle1) doc.text(subtitle1, 16, 56);
        if (subtitle2) doc.text(subtitle2, 16, 76);
      }

      // Helper to render image into PDF
      async function addImageToPDF({ doc, elementId, x = 16, y = 100, pageWidth }) {
        const img = document.createElement('img');
        const imgLoad = imgOnLoadPromise(img);
        img.src = await domtoimage.toPng(document.getElementById(elementId), {
          // doc.text(`Selected View: ${actualMapView}`, 16, 56);
          // doc.text(
          //   `Dataset: ${dataset}${
          //     dataset === 'All' && organism === 'styphi' ? ' (local + travel)' : ''
          //   }`,
          //   16,
          //   76,
          // );
          // const graphImgHeat = document.createElement('img');
          // const graphImgPromiseHeat = imgOnLoadPromise(graphImgHeat);
          // graphImgHeat.src = await domtoimage.toPng(document.getElementById('BG'), {
          bgcolor: 'white',
        });

        await imgLoad;

        // Estimate height for all images
        const aspectRatio = img.width / img.height;
        const displayWidth = pageWidth - 80;
        displayHeight = displayWidth / aspectRatio;
        doc.addImage(img, 'PNG', x, y, displayWidth - 20, displayHeight - 20, undefined, 'FAST');
        //
      }
      // Main PDF logic
      const commonSubtitle1 = `Selected View: ${actualMapView}`;
      const commonSubtitle2 = `Dataset: ${dataset}${
        dataset === 'All' && organism === 'styphi' ? ' (local + travel)' : ''
      }`;
      const heatmapTitle = `${t('continentGraphs.pdf.title')} (${t('continentGraphs.tabs.heatmap')})`;

      // Heatmap Page
      addStandardPage({
        doc,
        title: heatmapTitle,
        subtitle1: commonSubtitle1,
        subtitle2: commonSubtitle2,
        date,
        pageWidth,
        pageHeight,
      });
      await addImageToPDF({ doc, elementId: 'BG', pageWidth }); // BG is replaced from CVM for BubbleGeographicGraph

      // TL Map Page
      // Hidden for now from PDF, as we dont have a trend line map on the dashboard
      // addStandardPage({
      //   doc,
      //   title: 'Geographic Comparisons (Trend Line)',
      //   subtitle1: commonSubtitle1,
      //   subtitle2: commonSubtitle2,
      //   date,
      //   pageWidth,
      //   pageHeight,
      // });
      // doc.text(`${drugClass} : ${drugGene} Gene`, 16, 66); // Add drug class and gene to the title
      // await addImageToPDF({ doc, elementId: 'TL', pageWidth });

      // // Trend Line Page Add a Legends
      // const whiteBoxY = 100 + ((displayHeight-20) * 0.73);
      // doc.setFillColor(255, 255, 255); // White color
      // doc.rect(10, whiteBoxY, pageWidth - 20, 140, 'F'); // Draw a filled rectangle as background

      // drawLegend({
      //   document: doc,
      //   legendData: coloredOptions,
      //   factor: 17, // Adjust factor based on the number of legend items
      //   rectY:whiteBoxY,
      //   xSpace: 80, // Space between legend items
      //   isDrug: false,
      // });

      // Pathotype or Serotype Page
      if (['sentericaints', 'decoli', 'shige'].includes(organism)) {
        addStandardPage({
          doc,
          title: organism === 'sentericaints' ? 'Serotype Comparisons' : 'Pathotype Comparisons',
          subtitle1: commonSubtitle1,
          subtitle2: commonSubtitle2,
          date,
          pageWidth,
          pageHeight,
        });
        await addImageToPDF({ doc, elementId: 'BHP', pageWidth });
      }
      // Graphs
      const isKlebe = organism === 'kpneumo';
      const isNgono = organism === 'ngono';

      const cards = getOrganismCards().filter(card => card.id !== 'HSG');
      const legendDrugs = organism === 'styphi' ? drugsST : organism === 'kpneumo' ? drugsKP : drugsNG;
      const drugClassesBars = getDrugClassesBars();
      let drugClassesFactor = 0;
      if (drugClassesBars !== undefined) drugClassesFactor = Math.ceil(drugClassesBars.length / 3);
      const genotypesFactor = Math.ceil(genotypesForFilterSelected.length / 6);

      const isYersiniabactin = convergenceColourVariable === 'Yersiniabactin';
      const variablesFactor = Math.ceil(Object.keys(convergenceColourPallete).length / (isYersiniabactin ? 2 : 3));

      for (let index = 0; index < cards.length; index++) {
        if (
          (cards[index].id === 'DRT' && (drugResistanceGraphView.length === 0 || captureDRT === false)) ||
          (cards[index].id === 'RFWG' && captureRFWG === false) ||
          (cards[index].id === 'RDWG' && captureRDWG === false) ||
          (cards[index].id === 'GD' && captureGD === false)
        ) {
          continue;
        }

        doc.addPage();
        drawHeader({ document: doc, pageWidth });
        drawFooter({ document: doc, pageHeight, pageWidth, date });

        let title = `${cards[index].title}`;
        switch (cards[index].id) {
          case 'RDWG':
            title += `: ${determinantsGraphDrugClass}`;
            break;
          case 'RDT':
            title += `: ${trendsGraphDrugClass}`;
            break;
          case 'KOT':
            title += `: ${KODiversityGraphView}`;
            break;
          case 'convergence-graph': // BG is replaced from CVM for BubbleGeographicGraph
            const group = variablesOptions.find(option => option.value === convergenceGroupVariable).label;
            const colour = variablesOptions.find(option => option.value === convergenceColourVariable).label;
            title += `: ${group} x ${colour}`;
            break;
          default:
            break;
        }

        doc.setFontSize(12).setFont(undefined, 'bold');
        doc.text(title, 16, 44);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(cards[index].description.join(' / ').replaceAll('≥', '>='), 16, 56);
        doc.setFontSize(12);
        if (cards[index].id === 'GD') doc.text(`Total: ${actualGenomesGD} genomes`, 16, 74);
        else if (cards[index].id === 'DRT') doc.text(`Total: ${actualGenomesDRT} genomes`, 16, 74);
        else if (cards[index].id === 'RDT') doc.text(`Total: ${actualGenomesRDT} genomes`, 16, 74);
        else doc.text(`Total: ${actualGenomes} genomes`, 16, 74);
        doc.text(`Country: ${actualCountry}`, 16, 86);
        // doc.text(`Time Period: ${actualTimeInitial} to ${actualTimeFinal}`, 16, 98);
        if (cards[index].id === 'GD') doc.text(`Time period: ${starttimeGD} to ${endtimeGD}`, 16, 98);
        else if (cards[index].id === 'DRT') doc.text(`Time period: ${starttimeDRT} to ${endtimeDRT}`, 16, 98);
        else if (cards[index].id === 'RDT') doc.text(`Time period: ${starttimeRDT} to ${endtimeRDT}`, 16, 98);
        else doc.text(`Time Period: ${actualTimeInitial} to ${actualTimeFinal}`, 16, 98);
        doc.text(
          `Dataset: ${dataset}${dataset === 'All' && organism === 'styphi' ? ' (local + travel)' : ''}`,
          16,
          110,
        );
        dispatch(setDownload(true));
        const graphImg = document.createElement('img');
        const graphImgPromise = imgOnLoadPromise(graphImg);
        graphImg.src = await domtoimage.toPng(document.getElementById(cards[index].id), {
          bgcolor: 'white',
        });
        await graphImgPromise;
        // Plot re-size for PDF
        const aspectRatio = graphImg.width / graphImg.height;
        const isSmallImage = graphImg.width <= 700 && graphImg.height <= 700;
        const topMargin = isSmallImage ? 70 : 120;
        const bottomMargin = isSmallImage ? 70 : 30;
        const leftMargin = 16;
        const rightMargin = 16;
        const scaleFactor = isSmallImage ? 0.8 : 1.0;

        // Available space
        const availableHeight = pageHeight - topMargin - bottomMargin;
        const availableWidth = pageWidth - leftMargin - rightMargin;

        // Start with full height
        let displayHeight = availableHeight;
        let displayWidth = displayHeight * aspectRatio;

        // If too wide, fit width instead
        if (displayWidth > availableWidth) {
          displayWidth = availableWidth;
          displayHeight = displayWidth / aspectRatio;
        }

        // Apply scale factor (only reduces size if < 1.0)
        displayWidth *= scaleFactor;
        displayHeight *= scaleFactor;

        // Position: center horizontally, and either center or top-align vertically
        const xPosition = leftMargin + (availableWidth - displayWidth) / 2;
        const yPosition = isSmallImage
          ? topMargin + (availableHeight - displayHeight) / 2 // vertical center
          : topMargin; // top-align for large images

        doc.addImage(graphImg, 'PNG', xPosition, yPosition, displayWidth, displayHeight, undefined, 'FAST');

        // const rectY = matches1000 ? 390 : 340;
        const rectY = yPosition + displayHeight * (cards[index].id === 'DRT' ? (isSmallImage ? 0.6 : 0.7) : 0.7); // updated Legends position based on image height and Y position on PDF
        if (
          cards[index].id !== 'HSG2' &&
          cards[index].id !== 'BG' &&
          cards[index].id !== 'BKOH' &&
          cards[index].id !== 'BAMRH'
        ) {
          // BG is replaced from CVM for BubbleGeographicGraph
          doc.setFillColor(255, 255, 255); // white
          doc.rect(0, rectY + 10, pageWidth, 200, 'F'); // fill with white
        }

        doc.setFontSize(9);
        if (cards[index].id === 'RFWG') {
          drawLegend({
            document: doc,
            legendData: legendDrugs,
            factor: legendDrugs.length > 12 ? 8 : 4,
            rectY,
            xSpace: legendDrugs.length > 12 ? 200 : 100,
            isDrug: true,
          });
        } else if (cards[index].id === 'DRT') {
          // Dynamic Legends for DRT

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
            document: doc,
            legendData: drugResistanceGraphView,
            factor: 8,
            rectY,
            xSpace: 200,
            isDrug: true,
          });
        } else if (cards[index].id === 'RDWG') {
          const legendDataRD =
            Array.isArray(drugClassesBars) && Array.isArray(genotypesForFilterSelectedRD)
              ? drugClassesBars.filter(value => genotypesForFilterSelectedRD.includes(value.name))
              : [];

          if (legendDataRD.length > 0) {
            drawLegend({
              document: doc,
              legendData: legendDataRD,
              factor: drugClassesFactor,
              rectY,
              xSpace: 127,
              // twoPages: isKlebe,
            });
          }
          if (isNgono) {
            drawHeader({ document: doc, pageWidth });
            drawFooter({ document: doc, pageHeight, pageWidth, date });
          }
        } else if (cards[index].id === 'GD') {
          // console.log('legendGens2', genotypesForFilterSelected )
          drawLegend({
            document: doc,
            legendData: genotypesForFilterSelected,
            factor: genotypesFactor,
            rectY,
            xSpace: 65,
            isGenotype: true,
            genotypesForFilterSelected: genotypesForFilterSelected,
            twoPages: isNgono && genotypesForFilterSelected.length > 156,
          });
          if (isNgono) {
            drawHeader({ document: doc, pageWidth });
            drawFooter({ document: doc, pageHeight, pageWidth, date });
          }
        } else if (cards[index].id === 'RDT') {
          // const legendGenotypes = genotypesForFilter
          //   .filter(genotype => topGenotypeSlice.includes(genotype))
          //   .map(genotype => ({
          //     name: genotype,
          //     color: getGenotypeColor(genotype),
          //   }));
          // const legendGens = Array.isArray(drugClassesBars) && Array.isArray(topGenesSlice)
          //   ? drugClassesBars.filter(value => topGenesSlice.includes(value.name))
          //   : topGenesSlice;

          let legendGens = [...topGenesSlice.filter(g => g !== 'None'), ...topGenesSlice.filter(g => g === 'None')];
          // if (organism === 'kpneumo') legendGens = drugClassesBars?.filter(value => topGenesSlice.includes(value.name)); // wrong formate
          drawLegend({
            id: 'RDT',
            document: doc,
            legendData: [...legendGens],
            factor: legendGens.length / 3,
            rectY,
            xSpace: 120,
            isGen: true,
          });
          // drawHeader({ document: doc, pageWidth });
          // drawFooter({ document: doc, pageHeight, pageWidth, date });

          // drawLegend({
          //   id: 'RDT',
          //   document: doc,
          //   legendData: [{ name: 'GENOTYPES: ', color: 'white' }, ...legendGenotypes],
          //   factor: Math.ceil(legendGenotypes.length / 6),
          //   rectY: isKlebe ? 6 * 18 : 6 * 6,
          //   xSpace: 60,
          //   threePages: false,
          // });
          // drawHeader({ document: doc, pageWidth });
          // drawFooter({ document: doc, pageHeight, pageWidth, date });
        } else if (cards[index].id === 'KOT') {
          const legendKOTColorMap = colorPalleteKO[KOTrendsGraphPlotOption] || {};
          const legendKOT = KOForFilterSelected.map(key => ({
            name: key,
            color: legendKOTColorMap[key] || '#ccc', // fallback to grey if missing
          }));

          drawLegend({
            document: doc,
            legendData: KOForFilterSelected,
            factor: Math.ceil(KOForFilterSelected.length / 4),
            rectY,
            xSpace: 90,
            isGenotype: true,
            KOForFilterSelected: KOForFilterSelected,
          });
          // id= convergence-graph for AMR/virulence (Kleb) ,
        } else if (cards[index].id === 'convergence-graph') {
          // Create ordered legend data based on topConvergenceData order
          const orderedLegendKeys = [];
          const seenKeys = new Set();

          const topConvergenceDataForLegend = convergenceData.slice(0, currentSliderValueCM);

          topConvergenceDataForLegend.forEach(item => {
            if (!seenKeys.has(item.colorLabel)) {
              orderedLegendKeys.push(item.colorLabel);
              seenKeys.add(item.colorLabel);
            }
          });

          drawLegend({
            document: doc,
            legendData: orderedLegendKeys,
            factor: variablesFactor,
            rectY: rectY,
            xSpace: isYersiniabactin ? 190 : 127,
            isVariable: true,
            factorMultiply: isYersiniabactin ? 2 : 3,
            topConvergenceData: topConvergenceDataForLegend,
          });
        }
      }

      doc.save(`AMRnet ${firstName} ${secondName} Report.pdf`);
    } catch (error) {
      console.error('ERROR', error.message);
      setShowAlert(true);
    } finally {
      dispatch(setLoadingPDF(false));
    }
  }

  function handleCloseAlert() {
    setShowAlert(false);
  }

  function handleClickDatabasePage() {
    let Name;
    if (organism === 'styphi') {
      Name = 'salmonella-typhi';
    } else if (organism === 'kpneumo') {
      Name = 'klebsiella-pneumoniae';
    } else if (organism === 'ngono') {
      Name = 'neisseria-gonorrhoeae';
    } else if (organism === 'shige') {
      Name = 'shigella-eiec';
    } else if (organism === 'decoli') {
      Name = 'diarrheagenic-e-coli';
    } else if (organism === 'sentericaints') {
      Name = 'invasive-non-typhoidal-salmonella';
    }
    const url = `https://amrnet.readthedocs.io/en/latest/usage.html#${Name}`;
    // console.log('url', url);
    window.open(url, '_blank');
    // window.open('https://amrnet.readthedocs.io/en/latest/', '_blank');
  }

  return (
    <div className={classes.downloadDataWrapper}>
      <LoadingButton
        className={classes.button}
        variant="contained"
        onClick={handleClickDownloadDatabase}
        loading={loadingCSV}
        startIcon={<TableChart />}
        loadingPosition="start"
        disabled={organism === 'none'}
      >
        Download database (TSV format)
      </LoadingButton>
      <LoadingButton
        className={classes.button}
        variant="contained"
        onClick={handleClickDownloadPDF}
        loading={loadingPDF}
        startIcon={<PictureAsPdf />}
        loadingPosition="start"
        // disabled={['ecoli'].includes(organism)} //'styphi', 'kpneumo', 'ngono', 'sentericaints', 'senterica'
      >
        Download PDF
      </LoadingButton>
      <Button
        className={classes.button}
        variant="contained"
        onClick={() => handleClickDatabasePage()}
        startIcon={<Storage />}
      >
        {/* Rename based on Feedback documnet 24 June */}
        Info and Definitions
      </Button>
      <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          Something went wrong with the download, please try again later.
        </Alert>
      </Snackbar>
    </div>
  );
};
