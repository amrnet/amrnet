import { Alert, Button, Snackbar, useMediaQuery } from '@mui/material';
import axios from 'axios';
import download from 'downloadjs';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { useStyles } from './DownloadDataMUI';
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
import { PictureAsPdf, Storage, TableChart } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LogoImg from '../../../assets/img/logo-prod.png';
import { setPosition } from '../../../stores/slices/mapSlice';
// import EUFlagImg from '../../../assets/img/eu_flag.jpg';
import html2canvas from 'html2canvas';
import moment from 'moment';
import { svgAsPngUri } from 'save-svg-as-png';
import { setLoadingPDF } from '../../../stores/slices/dashboardSlice';
import { setCollapses, setDownload } from '../../../stores/slices/graphSlice';
import { drugAcronymsOpposite, drugsKP, drugsNG, drugsST, ngonoSusceptibleRule } from '../../../util/drugs';
import { getGraphCards } from '../../../util/graphCards';
import { imgOnLoadPromise } from '../../../util/imgOnLoadPromise';
import { mapLegends } from '../../../util/mapLegends';
// import { drugsKP, drugsST, drugsNG } from '../../../util/drugs';
import Papa from 'papaparse/papaparse.js';
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
import { PDFPreviewModal } from './PDFPreviewModal';

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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [capturedReportData, setCapturedReportData] = useState(null);
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
    const cards = getGraphCards(t);
    return cards.filter(card => card.organisms.includes(organism));
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
    let note = `NOTE: these estimates are derived from unfiltered genome data deposited in public databases, which reflects a strong bias towards sequencing of resistant strains. This will change in future updates.`;
    if (organism === 'senterica') {
      note += ' Salmonella Typhi has a dedicated dashboard curated by TyphiNET.';
    }
    // Only show for organisms other than styphi or ngono
    if (organism !== 'styphi' && organism !== 'ngono') {
      document.text(note, 16, 10, { align: 'left', maxWidth: pageWidth - 16 });
    }
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
    dispatch(setCollapses({ continent: true, all: true, map: true, continentP: true }));
    dispatch(setPosition({ coordinates: [0, 0], zoom: 1 }));

    try {
      if (genotypesForFilter.length <= 0) return;

      // Resolve organism display names
      const nameMap = {
        styphi: ['Salmonella', 'Typhi'],
        kpneumo: ['Klebsiella', 'pneumoniae'],
        ngono: ['Neisseria', 'gonorrhoeae'],
        shige: ['Shigella', '+ EIEC'],
        senterica: ['Salmonella enterica', '(non-typhoidal)'],
        ecoli: ['Escherichia', 'coli'],
        decoli: ['Escherichia coli', '(diarrheagenic)'],
        sentericaints: ['Salmonella', '(invasive non-typhoidal)'],
      };
      const [firstName, secondName] = nameMap[organism] ?? ['Unknown', 'organism'];

      // Resolve info texts for PDF info page
      const textsMap = {
        styphi: () => getSalmonellaTexts(formatDate(new Date())),
        kpneumo: getKlebsiellaTexts,
        ngono: getNgonoTexts,
        shige: getShigeTexts,
        senterica: getSentericaintsTexts,
        ecoli: getEcoliTexts,
        decoli: getDEcoliTexts,
        sentericaints: getIntsTexts,
      };
      const texts = textsMap[organism]?.() ?? [];

      // Resolve map view label
      const mapLegend = mapLegends.find(x => x.value === mapView);
      const actualMapView = mapLegend ? (mapLegend.labelKey ? t(mapLegend.labelKey) : mapLegend.label) : mapView;

      // Wait for DOM to fully paint after collapse/position dispatch
      await new Promise(r => setTimeout(r, 1200));

      // Capture map (SVG)
      let mapImage = null;
      const mapEl = document.getElementById('global-overview-map');
      if (mapEl) {
        mapImage = await svgAsPngUri(mapEl, { backgroundColor: 'white', width: 1200, left: -200 });
      }

      // Helper: capture a DOM element as { dataUrl, width, height }
      async function captureElement(id) {
        const el = document.getElementById(id);
        if (!el) return null;
        const canvas = await html2canvas(el, { backgroundColor: 'white', scale: 2, useCORS: true });
        return { dataUrl: canvas.toDataURL('image/png'), width: canvas.width / 2, height: canvas.height / 2 };
      }

      // Capture Geographic Comparisons
      const bgCapture = await captureElement('BG');

      // Capture Pathotype / Serotype graph (for shige, decoli, sentericaints)
      let bhpCapture = null;
      if (['sentericaints', 'decoli', 'shige'].includes(organism)) {
        bhpCapture = await captureElement('BHP');
      }

      // Capture each organism graph card
      const cards = getOrganismCards();
      const capturedGraphs = [];
      for (const card of cards) {
        dispatch(setDownload(true));
        const capture = await captureElement(card.id);
        if (!capture) continue;
        capturedGraphs.push({ ...card, image: capture.dataUrl, width: capture.width, height: capture.height });
      }
      dispatch(setDownload(false));

      setCapturedReportData({
        organism,
        firstName,
        secondName,
        texts,
        metadata: {
          organism: `${firstName} ${secondName}`,
          country: actualCountry,
          timeInitial: actualTimeInitial,
          timeFinal: actualTimeFinal,
          genomes: actualGenomes,
          dataset,
          mapView: actualMapView,
        },
        mapImage,
        bgCapture,
        bhpCapture,
        graphs: capturedGraphs,
      });
      setPreviewOpen(true);
    } catch (error) {
      console.error('PDF capture error:', error);
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
        {t('downloadData.downloadDatabase')}
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
        {t('downloadData.downloadPDF')}
      </LoadingButton>
      <Button
        className={classes.button}
        variant="contained"
        onClick={() => handleClickDatabasePage()}
        startIcon={<Storage />}
      >
        {/* Rename based on Feedback documnet 24 June */}
        {t('downloadData.infoAndDefinitions')}
      </Button>
      <PDFPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={capturedReportData}
      />
      <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          Something went wrong with the download, please try again later.
        </Alert>
      </Snackbar>
    </div>
  );
};
