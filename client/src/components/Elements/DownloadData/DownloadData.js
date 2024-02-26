import { Alert, Button, Snackbar, useMediaQuery } from '@mui/material';
import { useStyles } from './DownloadDataMUI';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setPage } from '../../../stores/slices/appSlice';
import { useNavigate } from 'react-router-dom';
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
import { drugsKP, drugsST, drugsForDrugResistanceGraphST } from '../../../util/drugs';
import { colorsForKODiversityGraph, getColorForDrug } from '../Graphs/graphColorHelper';
import { colorForDrugClassesKP, colorForDrugClassesST, getColorForGenotype } from '../../../util/colorHelper';
import { getKlebsiellaTexts, getSalmonellaTexts } from '../../../util/reportInfoTexts';
import { variablesOptions } from '../../../util/convergenceVariablesOptions';

const columnsToRemove = [
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
];

export const DownloadData = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const matches500 = useMediaQuery('(max-width:500px)');
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);
  const listPIMD = useAppSelector((state) => state.dashboard.listPMID);
  const PMID = useAppSelector((state) => state.dashboard.PMID);
  // const globalOverviewLabel = useAppSelector((state) => state.dashboard.globalOverviewLabel);
  const actualGenomes = useAppSelector((state) => state.dashboard.actualGenomes);
  const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);
  const mapView = useAppSelector((state) => state.map.mapView);
  const dataset = useAppSelector((state) => state.map.dataset);
  const determinantsGraphDrugClass = useAppSelector((state) => state.graph.determinantsGraphDrugClass);
  const trendsKPGraphDrugClass = useAppSelector((state) => state.graph.trendsKPGraphDrugClass);
  const KODiversityGraphView = useAppSelector((state) => state.graph.KODiversityGraphView);
  const colorPallete = useAppSelector((state) => state.dashboard.colorPallete);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const convergenceGroupVariable = useAppSelector((state) => state.graph.convergenceGroupVariable);
  const convergenceColourVariable = useAppSelector((state) => state.graph.convergenceColourVariable);
  const convergenceColourPallete = useAppSelector((state) => state.graph.convergenceColourPallete);
  const customDropdownMapView = useAppSelector((state) => state.graph.customDropdownMapView);
  const drugResistanceGraphView = useAppSelector((state) => state.graph.drugResistanceGraphView);

  async function handleClickDownloadDatabase() {
    setLoadingCSV(true);
    await axios
      .post(`${API_ENDPOINT}file/download`, { organism })
      .then((res) => {
        console.log("response",res);
        let indexes = [];
        let csv = res.data.split('\n');
        let lines = [];

        for (let index = 0; index < csv.length; index++) {
          let line = csv[index].split(',');
          lines.push(line);
        }
        
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

        let newCSV = '';
        for (let i = 0; i < newLines.length; i++) {
          let aux = '';
          for (let index = 0; index < newLines[i].length; index++) {
            aux += newLines[i][index];
            if (index !== newLines[i].length - 1) {
              aux += ',';
            }
          }
          if (i !== newLines.length - 1) {
            aux += '\n';
          }
          newCSV += aux;
        }
         download(newCSV, 'Database.csv');
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
      default:
        return colorForDrugClassesKP[determinantsGraphDrugClass];
    }
  }

  function formatDate(date) {
    return moment(date).format('ddd MMM DD YYYY HH:mm');
  }

  function drawFooter({ document, pageHeight, pageWidth, date }) {
    document.setFontSize(10);
    document.line(0, pageHeight - 26, pageWidth, pageHeight - 24);
    document.text(`Source: amr.net [${date}]`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

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
    factorMultiply = 3
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
          : legend.color
      );
      document.circle(50 + xFactor, rectY + 10 + yFactor, 2.5, 'F');

      if (id === 'CERDT' && i < 2) {
        if (i === 0) {
          document.setFont(undefined, 'bold');
        } else {
          document.setFont(undefined, 'normal');
        }
      }
      document.text(
        isGenotype || isDrug || isVariable ? legend.replaceAll('β', 'B') : legend.name,
        56 + xFactor,
        rectY + 12 + yFactor
      );
    });

    if (twoPages || threePages ) {
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
            : legend.color
        );
        document.circle(50 + xFactor, 24 + yFactor, 2.5, 'F');
        document.text(
          isGenotype || isDrug || isVariable ? legend.replaceAll('β', 'B') : legend.name,
          56 + xFactor,
          26 + yFactor
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
        trendsKP: true,
        KODiversity: true,
        convergence: true
      })
    );
    dispatch(setPosition({ coordinates: [0, 0], zoom: 1 }));

    try {
      if(genotypesForFilter.length<=0)
        return console.log("No data available to generate report");
      const doc = new jsPDF({ unit: 'px', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const date = formatDate(new Date());

      // Logo
      const logo = new Image();
      logo.src = LogoImg;
      const logoWidth = 80;
      doc.addImage(logo, 'PNG', 16, 16, logoWidth, 41, undefined, 'FAST');


      let texts;
      let firstName, secondName, secondword;
      if (organism === 'styphi') {
        texts = getSalmonellaTexts(date);
        firstName = "Salmonella";
        secondName = "Typhi";
        secondword = 315;
      } else if (organism === 'kpneumo') {
        console.log("organism", organism)
        texts = getKlebsiellaTexts();
        firstName = "Klebsiella";
        secondName = "pneumoniae";
        secondword = 330;
      }

      // Title and Date
      doc.setFontSize(16).setFont(undefined, 'bold');
      doc.text("Global Overview of", 177, 24, { align: 'center' });
      doc.setFont(undefined, "bolditalic");
      doc.text(firstName, 264, 24, { align: 'center' });
      doc.setFont(undefined, "bold");
      doc.text(secondName, secondword, 24, { align: 'center' });
      doc.setFontSize(12).setFont(undefined, 'normal');
      doc.text(date, pageWidth / 2, 48, { align: 'center' });

      if (organism === 'styphi') {
        let list = PMID.filter((value)=> value !== "-")
        let pmidSpace, dynamicText;
        if (actualCountry === 'All'){
          pmidSpace = 0;
          dynamicText = `TyphiNET presents data aggregated from >100 studies. Data are drawn from studies with the following PubMed IDs (PMIDs) or Digital Object Identifier (DOI): ${list.join(', ')}.`
        }else{
          list = listPIMD.filter((value)=> value !== "-")
          dynamicText = `TyphiNET presents data aggregated from >100 studies. Data for country ${actualCountry} are drawn from studies with the following PubMed IDs (PMIDs) or Digital Object Identifier (DOI): ${list.join(', ')}.`
          const textWidth = doc.getTextWidth(dynamicText);
          
          const widthRanges = [815, 1200, 1600, 2000, 2400];
          const pmidSpaces = [-50, -40, -30, -20, -10, 0];          

            // Find the appropriate pmidSpace based on textWidth
            pmidSpace = pmidSpaces.find((space, index) => textWidth <= widthRanges[index]) || pmidSpaces[pmidSpaces.length - 1];
          }
        doc.text(dynamicText,16, 185,{ align: 'left', maxWidth: pageWidth - 36 });
        
        // Info
        
        doc.text(texts[0], 16, 85, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[1], 16, 135, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[2], 16, 155, { align: 'left', maxWidth: pageWidth - 36});
        doc.text(texts[3], 16, 265+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[4], 16, 305+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[5], 16, 325+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[6], 16, 355+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[7], 16, 385+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'bold');
        doc.text(texts[8], 16, 415+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[9], 16, 435+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[10], 16, 465+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[11], 16, 485+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, "italic");
        doc.text("qnr", 16, 495+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[12], 32, 495+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, "italic");
        doc.text("gyrA/parC/gyrB", 122, 495+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[13], 185, 495+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[14], 16, 515+pmidSpace, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFontSize(10).setFont(undefined, 'bold');
        doc.text(texts[15], 16, pageHeight-60, { align: 'left', maxWidth: pageWidth - 36 });
        doc.setFont(undefined, 'normal');
        doc.text(texts[16], 16, pageHeight-50, { align: 'left', maxWidth: pageWidth - 36 });
        const euFlag = new Image();
        euFlag.src = EUFlagImg;
        doc.addImage(euFlag, 'JPG',173,pageHeight-38, 12, 7, undefined,'FAST');
      }else{
        doc.text(texts[0], 16, 85, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[1], 16, 125, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[2], 16, 145, { align: 'left', maxWidth: pageWidth - 36});
        doc.text(texts[3], 16, 155, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[4], 16, 175, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[5], 16, 195, { align: 'left', maxWidth: pageWidth - 36 });
        doc.text(texts[6], 16, 235, { align: 'left', maxWidth: pageWidth - 36 });
      }      

      
        drawFooter({ document: doc, pageHeight, pageWidth, date });

      // Map
      doc.addPage();
      drawFooter({ document: doc, pageHeight, pageWidth, date });

      doc.setFontSize(16).setFont(undefined, 'bold');
      doc.text("Global Overview of", 177, 24, { align: 'center' });
      doc.setFont(undefined, "bolditalic");
      doc.text(firstName, 264, 24, { align: 'center' });
      doc.setFont(undefined, "bold");
      doc.text(secondName, secondword, 24, { align: 'center' });
      doc.setFontSize(12).setFont(undefined, 'normal');
      doc.text(`Total: ${actualGenomes} genomes`, pageWidth / 2, 40, { align: 'center' });
      doc.text(`Country: ${actualCountry}`, pageWidth / 2, 52, { align: 'center' });
      doc.text(`Time Period: ${actualTimeInitial} to ${actualTimeFinal}`, pageWidth / 2, 64, { align: 'center' });
      doc.line(16, 76, pageWidth - 16, 76);

      doc.setFont(undefined, 'bold');
      doc.text('Map', 16, 96);
      doc.setFont(undefined, 'normal');
      const actualMapView = mapLegends.find((x) => x.value === mapView).label;
      doc.text(`Map View: ${actualMapView}`, 16, 108);
      doc.text(`Dataset: ${dataset}${dataset === 'All' && organism === 'styphi' ? ' (local + travel)' : ''}`, 16, 120);
      if(mapView === 'Genotype prevalence'){
        if (customDropdownMapView.length === 1) {
          doc.text('Selected Genotypes: ' + customDropdownMapView, 16, 140);
        } else if(mapView === 'NG-MAST TYPE prevalence'){
          doc.text('Selected NG-MAST TYPE: ' + customDropdownMapView, 16, 140);
        }else if (customDropdownMapView.length > 1) {
            const genotypesText = customDropdownMapView.join('\n');
            doc.text('Selected Genotypes: \n' + genotypesText, 16, 140);
        }
      }
      let mapY = 160 + (customDropdownMapView.length*9);
      await svgAsPngUri(document.getElementById('global-overview-map'), {
        // scale: 4,
        backgroundColor: 'white',
        width: 1200,
        left: -200
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
        doc.addImage(mapLegend, 'PNG', pageWidth / 2 - legendWidth / 2, 351, legendWidth, 47, undefined, 'FAST');
      } else {
        doc.addImage(mapLegend, 'PNG', pageWidth - pageWidth / 5 , 85, legendWidth, 47, undefined, 'FAST');
      }

      // Graphs
      const isKlebe = organism === 'kpneumo';

      const cards = getOrganismCards();
      const legendDrugs = organism === 'styphi' ? drugsST : drugsKP;
      const drugClassesBars = getDrugClassesBars();
      const drugClassesFactor = Math.ceil(drugClassesBars.length / 3);
      const genotypesFactor = Math.ceil(genotypesForFilter.length / 6);

      const isYersiniabactin = convergenceColourVariable === 'Yersiniabactin';
      const variablesFactor = Math.ceil(Object.keys(convergenceColourPallete).length / (isYersiniabactin ? 2 : 3));

      for (let index = 0; index < cards.length; index++) {
        if (graphCards[index].id === 'DRT' && drugResistanceGraphView.length === 0 ){
          continue;
        }
        doc.addPage();
        drawFooter({ document: doc, pageHeight, pageWidth, date });

        let title = `${cards[index].title}`;
        switch (cards[index].id) {
          case 'RDWG':
            title += `: ${determinantsGraphDrugClass}`;
            break;
          case 'CERDT':
            title += `: ${trendsKPGraphDrugClass}`;
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
        doc.text(title, 16, 24);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(cards[index].description.join(' / ').replaceAll('≥', '>='), 16, 36);
        doc.setFontSize(12);
        doc.text(`Total: ${actualGenomes} genomes`, 16, 54);
        doc.text(`Country: ${actualCountry}`, 16, 66);
        doc.text(`Time Period: ${actualTimeInitial} to ${actualTimeFinal}`, 16, 78);
        doc.text(`Dataset: ${dataset}${dataset === 'All' && organism === 'styphi' ? ' (local + travel)' : ''}`, 16, 90);

        const graphImg = document.createElement('img');
        const graphImgPromise = imgOnLoadPromise(graphImg);
        graphImg.src = await domtoimage.toPng(document.getElementById(cards[index].id), { bgcolor: 'white' });
        await graphImgPromise;
        if (graphImg.width <= 741) {
          doc.addImage(graphImg, 'PNG', 16, 110, undefined, undefined,undefined, 'FAST');
        } else {
          doc.addImage(graphImg, 'PNG', 16, 110, pageWidth - 80, 271, undefined, 'FAST');
        }

        doc.setFillColor(255, 255, 255);
        const rectY = matches500 ? 300 : 320;
        doc.rect(0, rectY, pageWidth, 200, 'F');

        doc.setFontSize(9);
        if (graphCards[index].id === 'RFWG') {
          drawLegend({
            document: doc,
            legendData: legendDrugs,
            factor: (legendDrugs.length>12 ? 8 : 4),
            rectY,
            xSpace: (legendDrugs.length>12 ? 200 : 100),
            isDrug: true
          });
        }else if (graphCards[index].id === 'DRT') {
          drawLegend({
            document: doc,
            legendData: drugResistanceGraphView,
            factor: 8,
            rectY,
            xSpace: 200,
            isDrug: true
          });
        } else if (graphCards[index].id === 'RDWG') {

          drawLegend({
            document: doc,
            legendData: drugClassesBars,
            factor: drugClassesFactor,
            rectY,
            xSpace: 127,
            twoPages: isKlebe
          });

          if (isKlebe) {
            drawFooter({ document: doc, pageHeight, pageWidth, date });
          }
        } else if (cards[index].id === 'GD') {
          drawLegend({
            document: doc,
            legendData: genotypesForFilter,
            factor: genotypesFactor,
            rectY,
            xSpace: 65,
            isGenotype: true,
            // twoPages: isKlebe
          });
        } else if (cards[index].id === 'CERDT') {
          const legendGenotypes = genotypesForFilter.map((genotype) => {
            return { name: genotype, color: getGenotypeColor(genotype) };
          });

          drawLegend({
            id: 'CERDT',
            document: doc,
            legendData: [{ name: 'GENES: ', color: 'white' }, ...drugClassesBars],
            factor: drugClassesFactor,
            rectY,
            xSpace: 127,
            twoPages: true
          });
          drawFooter({ document: doc, pageHeight, pageWidth, date });

          drawLegend({
            id: 'CERDT',
            document: doc,
            legendData: [{ name: 'GENOTYPES: ', color: 'white' }, ...legendGenotypes],
            factor: Math.ceil(genotypesForFilter.length / 3),
            rectY: 6 * 14,
            xSpace: 127,
            threePages: false,
          });
          
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
          const isTwoPages = ['Bla_Carb_acquired', 'Bla_ESBL_acquired', 'Yersiniabactin'].includes(
            convergenceColourVariable
          );

          drawLegend({
            document: doc,
            legendData: Object.keys(convergenceColourPallete),
            factor: variablesFactor,
            rectY,
            xSpace: isYersiniabactin ? 190 : 127,
            isVariable: true,
            factorMultiply: isYersiniabactin ? 2 : 3,
            twoPages: isKlebe
          });

          if (isKlebe) {
            drawFooter({ document: doc, pageHeight, pageWidth, date });
          }
        }
      }

      doc.save('AMRnet - Report.pdf');
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
    dispatch(setPage('user-guide'));
    navigate('/user-guide');
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
        disabled={organism !== 'styphi' && organism !== 'kpneumo'}
      >
        Download PDF
      </LoadingButton>
      <Button className={classes.button} variant="contained" onClick={handleClickDatabasePage} startIcon={<Storage />}>
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
