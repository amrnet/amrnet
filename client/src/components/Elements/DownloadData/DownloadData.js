import { Alert, Button, Snackbar, useMediaQuery } from '@mui/material';
import { useStyles } from './DownloadDataMUI';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import axios from 'axios';
import download from 'downloadjs';
import { API_ENDPOINT } from '../../../constants';
import { useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { PictureAsPdf, Storage, TableChart } from '@mui/icons-material';
import { setPosition } from '../../../stores/slices/mapSlice';
import jsPDF from 'jspdf';
import LogoImg from '../../../assets/img/logo-prod.png';
import EUFlagImg from '../../../assets/img/eu_flag.jpg';
import moment from 'moment';
import { svgAsPngUri } from 'save-svg-as-png';
import { mapLegends } from '../../../util/mapLegends';
import { imgOnLoadPromise } from '../../../util/imgOnLoadPromise';
import { graphCards } from '../../../util/graphCards';
import domtoimage from 'dom-to-image';
import { setCollapses } from '../../../stores/slices/graphSlice';
import { drugsKP, drugsST, drugsNG } from '../../../util/drugs';
import { colorsForKODiversityGraph, getColorForDrug } from '../Graphs/graphColorHelper';
import {
  colorForDrugClassesKP,
  colorForDrugClassesNG,
  colorForDrugClassesST,
  getColorForGenotype,
} from '../../../util/colorHelper';
import { getKlebsiellaTexts, getSalmonellaTexts, getNgonoTexts } from '../../../util/reportInfoTexts';
import { variablesOptions } from '../../../util/convergenceVariablesOptions';

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
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);
  const listPIMD = useAppSelector((state) => state.dashboard.listPMID);
  const PMID = useAppSelector((state) => state.dashboard.PMID);
  const actualGenomes = useAppSelector((state) => state.dashboard.actualGenomes);
  const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);
  const mapView = useAppSelector((state) => state.map.mapView);
  const dataset = useAppSelector((state) => state.map.dataset);
  const determinantsGraphDrugClass = useAppSelector((state) => state.graph.determinantsGraphDrugClass);
  const trendsGraphDrugClass = useAppSelector((state) => state.graph.trendsGraphDrugClass);
  const KODiversityGraphView = useAppSelector((state) => state.graph.KODiversityGraphView);
  const colorPallete = useAppSelector((state) => state.dashboard.colorPallete);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const convergenceGroupVariable = useAppSelector((state) => state.graph.convergenceGroupVariable);
  const convergenceColourVariable = useAppSelector((state) => state.graph.convergenceColourVariable);
  const convergenceColourPallete = useAppSelector((state) => state.graph.convergenceColourPallete);
  const prevalenceMapViewOptionsSelected = useAppSelector((state) => state.graph.prevalenceMapViewOptionsSelected);
  const drugResistanceGraphView = useAppSelector((state) => state.graph.drugResistanceGraphView);
  const captureDRT = useAppSelector((state) => state.dashboard.captureDRT);
  const captureRFWG = useAppSelector((state) => state.dashboard.captureRFWG);
  const captureRDWG = useAppSelector((state) => state.dashboard.captureRDWG);
  const captureGD = useAppSelector((state) => state.dashboard.captureGD);
  const genotypesForFilterSelected = useAppSelector((state) => state.dashboard.genotypesForFilterSelected);
  const genotypesForFilterSelectedRD = useAppSelector((state) => state.dashboard.genotypesForFilterSelectedRD);
  const topGenesSlice = useAppSelector((state) => state.graph.topGenesSlice);
  const topGenotypeSlice = useAppSelector((state) => state.graph.topGenotypeSlice);
  const topColorSlice = useAppSelector((state) => state.graph.topColorSlice);


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
      firstName = 'Diarrheagenic';
      secondName = 'E. coli';
    } else if (organism === 'sentericaints') {
      firstName = 'Invasive';
      secondName = 'non-typhoidal Salmonella';
    }
    if (organism !== 'styphi') columnsToRemove = [...columnsToRemoveNonTyphi, ...columnsToRemove];
    setLoadingCSV(true);
    await axios
      .post(`${API_ENDPOINT}file/download`, { organism })
      .then((res) => {
        let indexes = [];
        let csv = res.data.split('\n');
        let lines = [];

        for (let index = 0; index < csv.length; index++) {
          let line = csv[index].split(',');
          lines.push(line);
        }

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

        lines[0].forEach((curr, index) => {
          lines[0][index] = replacements[curr] || curr;
        });

        for (let index = 0; index < columnsToRemove.length; index++) {
          let currentIndex = lines[0].indexOf(columnsToRemove[index]);
          indexes.push(currentIndex);
        }
        indexes.sort();
        indexes.reverse();

        let newLines = [];
        for (let j = 0; j < lines.length; j++) {
          let aux = [];
          for (let i = 0; i < lines[j].length; i++) {
            if (!indexes.includes(i)) {
              aux.push(lines[j][i]);
            }
          }
          newLines.push(aux);
        }

        // Assemble the new TSV data by joining columns with "\t" instead of ","
        let newTSV = '';
        for (let i = 0; i < newLines.length; i++) {
          newTSV += newLines[i].join('\t');
          if (i !== newLines.length - 1) {
            newTSV += '\n';
          }
        }

        // Update the filename to reflect TSV format
        download(newTSV, `AMRnet ${firstName} ${secondName} Database.tsv`);
      })
      .finally(() => {
        setLoadingCSV(false);
      });
}


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
      default:
        return colorForDrugClassesNG[determinantsGraphDrugClass];
    }
  }

  function formatDate(date) {
    return moment(date).format('ddd MMM DD YYYY HH:mm');
  }

  function drawFooter({ document, pageHeight, pageWidth, date }) {
    document.setFontSize(10);
    document.line(0, pageHeight - 26, pageWidth, pageHeight - 24);
    document.text(`Source: amrnet.org`, 16, pageHeight - 10, { align: 'left' });
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
    id = null,
    legendData,
    document,
    factor,
    rectY,
    isGenotype = false,
    isDrug = false,
    isVariable = false,
    xSpace,
    twoPages = false,
    threePages = false,
    factorMultiply = organism === 'ngono' ? 6 : 3,
  }) {
    let firstLegendData = legendData.slice();
    let secondLegendData = [];

    let firstLegendFactor = factor;
    let secondLegendFactor;

    if (twoPages) {
      firstLegendData = legendData.slice(0, 26 * factorMultiply);
      secondLegendData = legendData.slice(26 * factorMultiply);
      secondLegendFactor = factor - 26;
      firstLegendFactor = 26;
    }
    if (threePages) {
      firstLegendData = legendData.slice(0, 50 * factorMultiply);
      secondLegendData = legendData.slice(50 * factorMultiply);
      secondLegendFactor = factor - 50;
      firstLegendFactor = 50;
    }

    firstLegendData.forEach((legend, i) => {
      const yFactor = (i % firstLegendFactor) * 10;
      const xFactor = Math.floor(i / firstLegendFactor) * xSpace;

      document.setFillColor(
        isGenotype
          ? getGenotypeColor(legend)
          : isDrug
          ? getColorForDrug(legend)
          : isVariable
          ? convergenceColourPallete[legend]
          : legend.color,
      );
      document.circle(50 + xFactor, rectY + 10 + yFactor, 2.5, 'F');

      if (id === 'RDT' && i < 2) {
        if (i === 0) {
          document.setFont(undefined, 'bold');
        } else {
          document.setFont(undefined, 'normal');
        }
      }
      document.text(
        isGenotype || isDrug || isVariable ? legend.replaceAll('β', 'B') : legend.name,
        56 + xFactor,
        rectY + 12 + yFactor,
      );
    });

    if (twoPages || threePages) {
      document.addPage();

      secondLegendData.forEach((legend, i) => {
        const yFactor = (i % secondLegendFactor) * 10;
        const xFactor = Math.floor(i / secondLegendFactor) * xSpace;

        document.setFillColor(
          isGenotype
            ? getGenotypeColor(legend)
            : isDrug
            ? getColorForDrug(legend)
            : isVariable
            ? convergenceColourPallete[legend]
            : legend.color,
        );
        document.circle(50 + xFactor, 34 + yFactor, 2.5, 'F');
        document.text(
          isGenotype || isDrug || isVariable ? legend.replaceAll('β', 'B') : legend.name,
          56 + xFactor,
          36 + yFactor,
        );
      });
    }
  }

  async function handleClickDownloadPDF() {
    setLoadingPDF(true);
    dispatch(
      setCollapses({
        determinants: true,
        distribution: true,
        drugResistance: true,
        frequencies: true,
        trends: true,
        KODiversity: true,
        convergence: true,
        continent: true,
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
      let firstName, secondName, secondword;
      if (organism === 'styphi') {
        texts = getSalmonellaTexts(date);
        firstName = 'Salmonella';
        secondName = 'Typhi';
        secondword = 315;
      } else if (organism === 'kpneumo') {
        texts = getKlebsiellaTexts();
        firstName = 'Klebsiella';
        secondName = 'pneumoniae';
        secondword = 330;
      } else if (organism === 'ngono') {
        texts = getNgonoTexts();
        firstName = 'Neisseria';
        secondName = 'gonorrhoeae';
        secondword = 330;
      }else {
        texts = getNgonoTexts();
        firstName = 'shigella';
        secondName = 'gonorrhoeae';
        secondword = 330;
      }

      // Title and Date
      drawHeader({ document: doc, pageWidth });
      doc.setFontSize(16).setFont(undefined, 'bold');
      doc.text('AMRnet Report for', 177, 44, { align: 'center' });
      doc.setFont(undefined, 'bolditalic');
      doc.text(firstName, 264, 44, { align: 'center' });
      if (organism === 'kpneumo' || organism === 'ngono') doc.setFont(undefined, 'bolditalic');
      else doc.setFont(undefined, 'bold');
      doc.text(secondName, secondword, 44, { align: 'center' });
      doc.setFontSize(12).setFont(undefined, 'normal');
      doc.text(date, pageWidth / 2, 68, { align: 'center' });

      if (organism === 'styphi') {
        let list = PMID.filter((value) => value !== '-');
        let pmidSpace, dynamicText;
        if (actualCountry === 'All') {
          pmidSpace = 50;
          dynamicText = `Data are drawn from studies with the following PubMed IDs (PMIDs) or Digital Object Identifier (DOI): ${list.join(
            ', ',
          )}.`;
          // pmidSpace = 50;
        } else {
          list = listPIMD.filter((value) => value !== '-');
          dynamicText = `Data for country ${actualCountry} are drawn from studies with the following PubMed IDs (PMIDs) or Digital Object Identifier (DOI): ${list.join(
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
        doc.text('gyrA/parC/gyrB', 120, 555 + pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
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
          doc.text(texts[26], 16, 575 + pmidSpace - 10, { align: 'left', maxWidth: pageWidth - 36 });
          drawFooter({ document: doc, pageHeight, pageWidth, date });
          doc.addPage();
          drawHeader({ document: doc, pageWidth });
        }
        doc.setFont(undefined, 'bold');
        doc.text(texts[27], 16, pageHeight - 90, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[28], 16, pageHeight - 70, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'italic');
        doc.text(texts[29], 136, pageHeight - 70, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[30], 182, pageHeight - 70, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[31], 16, pageHeight - 60, { align: 'left', maxWidth: pageWidth - 36 });
        // doc.setFont(undefined, 'normal');
        const euFlag = new Image();
        euFlag.src = EUFlagImg;
        doc.addImage(euFlag, 'JPG', 322, pageHeight - 56.5, 12, 7, undefined, 'FAST');
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
        let list = PMID.filter((value) => value !== '-');
        let pmidSpace, dynamicText;
        if (actualCountry === 'All') {
          pmidSpace = 0;
          dynamicText = `Data are drawn from studies with the following PubMed IDs (PMIDs): ${list.join(', ')}.`;
        } else {
          list = listPIMD.filter((value) => value !== '-');
          dynamicText = `Data for country ${actualCountry} are drawn from studies with the following PubMed IDs (PMIDs): ${list.join(
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
        doc.text(texts[24], 16, 46, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[25], 16, 76, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[26], 16, 116, { align: 'left', maxWidth: pageWidth - 36 });
      }else {
        console.log("shige....")
      }
      drawFooter({ document: doc, pageHeight, pageWidth, date });

      // Map
      doc.addPage();
      drawHeader({ document: doc, pageWidth });
      drawFooter({ document: doc, pageHeight, pageWidth, date });

      doc.setFontSize(16).setFont(undefined, 'bold');
      doc.text('Global Overview of', 177, 44, { align: 'center' });
      doc.setFont(undefined, 'bolditalic');
      doc.text(firstName, 264, 44, { align: 'center' });
      doc.setFont(undefined, 'bold');
      doc.text(secondName, secondword, 44, { align: 'center' });
      doc.setFontSize(12).setFont(undefined, 'normal');
      doc.text(`Total: ${actualGenomes} genomes`, pageWidth / 2, 60, { align: 'center' });
      doc.text(`Country: ${actualCountry}`, pageWidth / 2, 72, { align: 'center' });
      doc.text(`Time Period: ${actualTimeInitial} to ${actualTimeFinal}`, pageWidth / 2, 84, { align: 'center' });
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
      const actualMapView = mapLegends.find((x) => x.value === mapView).label;
      doc.text(`Map View: ${actualMapView}`, 16, 128);
      doc.text(`Dataset: ${dataset}${dataset === 'All' && organism === 'styphi' ? ' (local + travel)' : ''}`, 16, 140);
      if (prevalenceMapViewOptionsSelected.length === 1) {
        if (mapView === 'Genotype prevalence') {
          doc.text('Selected Genotypes: ' + prevalenceMapViewOptionsSelected, 16, 160);
        } else if (mapView === 'NG-MAST prevalence') {
          doc.text('Selected NG-MAST TYPE: ' + prevalenceMapViewOptionsSelected, 16, 160);
        } else if (mapView === 'ST prevalence') {
          doc.text('Selected ST: ' + prevalenceMapViewOptionsSelected, 16, 160);
        }else if (mapView === 'Sublineage prevalence') {
          doc.text('Selected Sublineage: ' + prevalenceMapViewOptionsSelected, 16, 160);
        }else if (mapView === 'Resistance prevalence') {
          doc.text('Selected Resistance: ' + prevalenceMapViewOptionsSelected, 16, 160);
        }
      }else if (prevalenceMapViewOptionsSelected.length > 1) {
          const genotypesText = prevalenceMapViewOptionsSelected.join('\n');
          doc.text('Selected Genotypes: \n' + genotypesText, 16, 160);
        }
      let mapY = 180 + prevalenceMapViewOptionsSelected.length * 9;
      await svgAsPngUri(document.getElementById('global-overview-map'), {
        // scale: 4,
        backgroundColor: 'white',
        width: 1200,
        left: -200,
      }).then(async (uri) => {
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
        doc.addImage(img, 'PNG', 0, mapY, pageWidth, 223, undefined, 'FAST');
      });

      const mapLegend = new Image();
      let legendWidth = 58.85;

      switch (mapView) {
        case 'Dominant Genotype':
          legendWidth = organism === 'styphi' ? 414.21 : 394.28;
          mapLegend.src = `legends/MapView_DominantGenotype_${organism}.png`;
          break;
        case 'No. Samples':
          mapLegend.src = 'legends/MapView_NoSamples.png';
          break;
        case 'Sensitive to all drugs':
          mapLegend.src = 'legends/MapView_Sensitive.png';
          break;
        default:
          mapLegend.src = 'legends/MapView_Others.png';
          break;
      }
      if (mapView === 'Dominant Genotype') {
        doc.addImage(mapLegend, 'PNG', pageWidth / 2 - legendWidth / 2, 371, legendWidth, 47, undefined, 'FAST');
      } else {
        doc.addImage(mapLegend, 'PNG', pageWidth - pageWidth / 5, 105, legendWidth, 47, undefined, 'FAST');
      }

      // Graphs
      const isKlebe = organism === 'kpneumo';
      const isNgono = organism === 'ngono';

      const cards = getOrganismCards();
      const legendDrugs = organism === 'styphi' ? drugsST : organism === 'kpneumo' ? drugsKP : drugsNG;
      const drugClassesBars = getDrugClassesBars();
      let drugClassesFactor = 0;
      if(drugClassesBars !== undefined)
        drugClassesFactor = Math.ceil(drugClassesBars.length / 3);
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
          case 'KO':
            title += `: ${KODiversityGraphView}`;
            break;
          case 'CVM':
            const group = variablesOptions.find((option) => option.value === convergenceGroupVariable).label;
            const colour = variablesOptions.find((option) => option.value === convergenceColourVariable).label;
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
        doc.text(`Total: ${actualGenomes} genomes`, 16, 74);
        doc.text(`Country: ${actualCountry}`, 16, 86);
        doc.text(`Time Period: ${actualTimeInitial} to ${actualTimeFinal}`, 16, 98);
        doc.text(
          `Dataset: ${dataset}${dataset === 'All' && organism === 'styphi' ? ' (local + travel)' : ''}`,
          16,
          110,
        );

        const graphImg = document.createElement('img');
        const graphImgPromise = imgOnLoadPromise(graphImg);
        graphImg.src = await domtoimage.toPng(document.getElementById(cards[index].id), { bgcolor: 'white' });
        await graphImgPromise;
        if (graphImg.width <= 700) {
          doc.addImage(graphImg, 'PNG', 16, 130, undefined, undefined, undefined, 'FAST');
        } else {
          doc.addImage(graphImg, 'PNG', 16, 130, pageWidth - 80, 271, undefined, 'FAST');
        }

        doc.setFillColor(255, 255, 255);
        const rectY = matches1000 ? 320 : 340;
        doc.rect(0, rectY, pageWidth, 200, 'F');

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
          drawLegend({
            document: doc,
            legendData: drugResistanceGraphView,
            factor: 8,
            rectY,
            xSpace: 200,
            isDrug: true,
          });
        } else if (cards[index].id === 'RDWG') {
          const legendDataRD = drugClassesBars.filter((value) => genotypesForFilterSelectedRD.includes(value.name));
          // console.log("..../", genotypesForFilterSelectedRD, legendDataRD)
          drawLegend({
            document: doc,
            legendData: legendDataRD,
            factor: drugClassesFactor,
            rectY,
            xSpace: 127,
            // twoPages: isKlebe,
          });

          if (isKlebe || isNgono) {
            drawHeader({ document: doc, pageWidth });
            drawFooter({ document: doc, pageHeight, pageWidth, date });
          }
        } else if (cards[index].id === 'GD') {
          drawLegend({
            document: doc,
            legendData: genotypesForFilterSelected,
            factor: genotypesFactor,
            rectY,
            xSpace: 65,
            isGenotype: true,
            twoPages: isNgono && genotypesForFilterSelected.length > 156,
          });
          if (isKlebe || isNgono) {
            drawHeader({ document: doc, pageWidth });
            drawFooter({ document: doc, pageHeight, pageWidth, date });
          }
        } else if (cards[index].id === 'RDT') {
          const legendGenotypes = genotypesForFilter
            .filter((genotype) => topGenotypeSlice.includes(genotype))
            .map((genotype) => ({
              name: genotype,
              color: getGenotypeColor(genotype)
            }));

          const legendGens = drugClassesBars.filter((value) => topGenesSlice.includes(value.name));

          drawLegend({
            id: 'RDT',
            document: doc,
            legendData: [{ name: 'GENES: ', color: 'white' }, ...legendGens],
            factor: drugClassesFactor,
            rectY,
            xSpace: 127,
            twoPages: true,
          });
          drawHeader({ document: doc, pageWidth });
          drawFooter({ document: doc, pageHeight, pageWidth, date });

          drawLegend({
            id: 'RDT',
            document: doc,
            legendData: [{ name: 'GENOTYPES: ', color: 'white' }, ...legendGenotypes],
            factor: Math.ceil(legendGenotypes.length/6) ,
            rectY: isKlebe ? 6 * 18 : 6 * 6,
            xSpace: 60,
            threePages: false,
          });
          drawHeader({ document: doc, pageWidth });
          drawFooter({ document: doc, pageHeight, pageWidth, date });
        } else if (cards[index].id === 'KO') {
          drawLegend({
            document: doc,
            legendData: colorsForKODiversityGraph,
            factor: Math.ceil(colorsForKODiversityGraph.length / 4),
            rectY,
            xSpace: 90,
            // twoPages: isKlebe
          });
        } else if (cards[index].id === 'CVM') {
          // console.log("convergenceColourPallete",topColorSlice)
          drawLegend({
            document: doc,
            legendData: Object.keys(topColorSlice),
            factor: variablesFactor,
            rectY,
            xSpace: isYersiniabactin ? 190 : 127,
            isVariable: true,
            factorMultiply: isYersiniabactin ? 2 : 3,
            // twoPages: isKlebe,
          });

          if (isKlebe) {
            drawHeader({ document: doc, pageWidth });
            drawFooter({ document: doc, pageHeight, pageWidth, date });
          }
        }
      }

      doc.save(`AMRnet ${firstName} ${secondName} Report.pdf`);
    } catch (error) {
      setShowAlert(true);
    } finally {
      setLoadingPDF(false);
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
    console.log("url",url)
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
        Download database (CSV format)
      </LoadingButton>
      <LoadingButton
        className={classes.button}
        variant="contained"
        onClick={handleClickDownloadPDF}
        loading={loadingPDF}
        startIcon={<PictureAsPdf />}
        loadingPosition="start"
        disabled={organism !== 'styphi' && organism !== 'kpneumo' && organism !== 'ngono'}
      >
        Download PDF
      </LoadingButton>
      <Button className={classes.button} variant="contained" onClick={() => handleClickDatabasePage()} startIcon={<Storage />}>
        See Database info
      </Button>
      <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          Something went wrong with the download, please try again later.
        </Alert>
      </Snackbar>
    </div>
  );
};
