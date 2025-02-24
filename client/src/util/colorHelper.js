// Helper for colors

// Color for Salmonella genotypes
export const getColorForGenotype = (genotype) => {
  switch (genotype) {
    case '0':
    case '0.0.1':
    case '0.0.2':
    case '0.0.3':
    case '0.1.0':
    case '0.1':
    case '0.1.1':
    case '0.1.2':
    case '0.1.3':
      return '#808080';
    case '1.1':
    case '1.1.1':
    case '1.1.2':
    case '1.1.3':
    case '1.1.4':
      return '#ffff00';
    case '1.2':
    case '1.2.1':
      return '#ffd700';
    case '2':
    case '2.0.0':
    case '2.0.1':
    case '2.0.2':
      return '#32cd32';
    case '2.1.0':
    case '2.1':
    case '2.1.1':
    case '2.1.2':
    case '2.1.3':
    case '2.1.4':
    case '2.1.5':
    case '2.1.6':
    case '2.1.7':
    case '2.1.8':
    case '2.1.9':
    case '2.1.7.1':
    case '2.1.7.2':
      return '#adff2f';
    case '2.2':
    case '2.2.0':
    case '2.2.1':
    case '2.2.2':
    case '2.2.3':
    case '2.2.4':
      return '#98fb98';
    case '2.3':
    case '2.3.1':
    case '2.3.2':
    case '2.3.3':
    case '2.3.4':
    case '2.3.5':
      return '#6b8e23';
    case '2.4.0':
    case '2.4':
    case '2.4.1':
      return '#2e8b57';
    case '2.5.0':
    case '2.5':
    case '2.5.1':
    case '2.5.2':
      return '#006400';
    case '3.0.0':
    case '3':
    case '3.0.1':
    case '3.0.2':
      return '#0000cd';
    case '3.1.0':
    case '3.1':
    case '3.1.1':
    case '3.1.2':
      return '#4682b4';
    case '3.2.1':
    case '3.2':
    case '3.2.2':
      return '#00bfff';
    case '3.3.0':
    case '3.3':
    case '3.3.1':
    case '3.3.2':
    case '3.3.2.Bd1':
    case '3.3.2.Bd2':
      return '#1e90ff';
    case '3.4':
      return '#6a5acd';
    case '3.5':
    case '3.5.1':
    case '3.5.2':
    case '3.5.3':
    case '3.5.4':
    case '3.5.4.1':
    case '3.5.4.2':
    case '3.5.4.3':
      return '#4b0082';
    case '4':
    case '4.1.0':
    case '4.1':
    case '4.1.1':
      return '#8b0000';
    case '4.2':
    case '4.2.1':
    case '4.2.2':
    case '4.2.3':
      return '#ff6347';
    // case '4.3':
    // case '4.3.0':
    case '4.3.1':
      return '#ff0000';
    case '4.3.1.1':
    case '4.3.1.1.EA1':
      return '#f1b6da';
    case '4.3.1.1.P1':
      return 'black';
    case '4.3.1.2':
    case '4.3.1.2.EA2':
    case '4.3.1.2.EA3':
    case '4.3.1.2.1':
    case '4.3.1.2.1.1':
      return '#c51b7d';
    case '4.3.1.3':
    case '4.3.1.3.Bdq':
      return '#fb8072';
    default:
      return '#F5F4F6';
  }
};

// Generate color pallete for Klebsiella genotypes
let iwanthue = require('iwanthue');
export const generatePalleteForGenotypes = (genotypes) => {
  if (genotypes.length === 0) {
    return {};
  }
  const colors = iwanthue(genotypes.length, {
    clustering: 'force-vector',
    seed: 'all',
    quality: 100,
  });

  const pallete = {};
  genotypes.forEach((x, i) => {
    pallete[x] = `${colors[i]}`;
  });

  return pallete;
};

//TODO: implement to all organisms
// Generate color pallete for Klebsiella genes, not being used at the moment
export const generatePalleteForGenes = (genes) => {
  var Rainbow = require('rainbowvis.js');
  const rainbow = new Rainbow();
  rainbow.setNumberRange(0, genes.length);
  rainbow.setSpectrum(
    '#67001f',
    '#b2182b',
    '#d6604d',
    '#f4a582',
    '#fddbc7',
    '#d1e5f0',
    '#92c5de',
    '#4393c3',
    '#2166ac',
    '#053061',
    '#40004b',
    '#762a83',
    '#9970ab',
    '#c2a5cf',
    '#e7d4e8',
    '#d9f0d3',
    '#a6dba0',
    '#5aae61',
    '#1b7837',
    '#00441b',
  );

  const pallete = [];
  genes.forEach((x, i) => {
    pallete.push({ name: x, color: `#${rainbow.colourAt(i)}` });
  });

  return pallete;
};

// Colors for Salmonella drug classes genes
export const colorForDrugClassesST = {
  Azithromycin: [
    { name: 'acrB_R717L', color: '#FBCFE5' },
    { name: 'acrB_R717Q', color: '#addd8e' },
    { name: 'acrB_R717Q + acrB_R717L', color: '#fd8d3c' },
    { name: 'None', color: '#B9B9B9' },
  ],
  // 'Fluoroquinolones (CipNS)': [
  Ciprofloxacin: [
    { name: '0_QRDR + qnrB (CipNS)', color: '#0066cc' },
    { name: '0_QRDR + qnrS (CipNS)', color: '#009999' },
    { name: '0_QRDR + qnrS + qnrD (CipNS)', color: '#a8ddb5' },
    { name: '1_QRDR (CipNS)', color: '#ffcc00' },
    { name: '1_QRDR + qnrB (CipNS)', color: '#993399' },
    { name: '1_QRDR + qnrS (CipNS)', color: '#660066' },
    { name: '2_QRDR (CipR)', color: '#ff6600' },
    { name: '2_QRDR + qnrB (CipR)', color: '#ffcccc' },
    { name: '2_QRDR + qnrS (CipR)', color: '#ff6666' },
    { name: '3_QRDR (CipR)', color: '#cc0000' },
    { name: '3_QRDR + qnrB (CipR)', color: '#660000' },
    { name: '3_QRDR + qnrS (CipR)', color: 'black' },
    { name: 'None (CipNS)', color: '#B9B9B9' },
  ],
  Chloramphenicol: [
    { name: 'catA1', color: '#9e9ac8' },
    { name: 'catA1 + cmlA', color: '#FFEC78' },
    { name: 'cmlA', color: '#addd8e' },
    { name: 'None', color: '#B9B9B9' },
  ],
  'Ampicillin/Amoxicillin': [
    { name: 'blaTEM-1D', color: '#addd8e' },
    { name: 'None', color: '#B9B9B9' },
  ],
  Sulphonamides: [
    { name: 'None', color: '#B9B9B9' },
    { name: 'sul1', color: '#fd8d3c' },
    { name: 'sul1 + sul2', color: '#B4DD70' },
    { name: 'sul2', color: '#ffeda0' },
  ],
  Trimethoprim: [
    { name: 'dfrA1', color: '#B4DD70' },
    { name: 'dfrA5', color: '#D7AEF7' },
    { name: 'dfrA7', color: '#FFEC78' },
    { name: 'dfrA7 + dfrA14', color: '#fd8d3c' },
    { name: 'dfrA14', color: '#6baed6' },
    { name: 'dfrA15', color: '#FBCFE5' },
    { name: 'dfrA17', color: '#FCB469' },
    { name: 'dfrA18', color: '#66c2a4' },
    { name: 'None', color: '#B9B9B9' },
  ],
  Tetracyclines: [
    { name: 'tetA(A)', color: 'rgb(174,227,154)' },
    { name: 'tetA(B)', color: '#D7AEF7' },
    { name: 'tetA(C)', color: '#FFEC78' },
    { name: 'tetA(D)', color: '#FCB469' },
    { name: 'None', color: '#B9B9B9' },
  ],
  // ESBL: [
  //   { name: 'blaCTX-M-15', color: '#6baed6' },
  //   { name: 'blaCTX-M-55', color: '#FBCFE5' },
  //   { name: 'blaOXA-7', color: '#9e9ac8' },
  //   { name: 'blaSHV-12', color: '#addd8e' },
  //   { name: 'None', color: '#B9B9B9' }
  // ],
  Ceftriaxone: [
    { name: 'blaCTX-M-15', color: '#6baed6' },
    { name: 'blaCTX-M-55', color: '#FBCFE5' },
    { name: 'blaOXA-7', color: '#9e9ac8' },
    { name: 'blaSHV-12', color: '#addd8e' },
    { name: 'None', color: '#B9B9B9' },
  ],
  // 'Co-trimoxazole': [
  'Trimethoprim-sulfamethoxazole': [
    { name: 'dfrA1 + sul1', color: '#ffeda0' },
    { name: 'dfrA1 + sul2', color: '#a50f15' },
    { name: 'dfrA1 + sul1 + sul2', color: '#fcc5c0' },
    { name: 'dfrA5 + sul1', color: '#fd8d3c' },
    { name: 'dfrA5 + sul2', color: '#6a5acd' },
    { name: 'dfrA5 + sul1 + sul2', color: '#bcbddc' },
    { name: 'dfrA7 + sul1', color: '#addd8e' },
    { name: 'dfrA7 + sul2', color: '#f1b6da' },
    { name: 'dfrA7 + sul1 + sul2', color: '#fdd0a2' },
    { name: 'dfrA7 + dfrA14 + sul1 + sul2', color: '#F54CEB' },
    { name: 'dfrA14 + sul1', color: '#9e9ac8' },
    { name: 'dfrA14 + sul2', color: '#fb8072' },
    { name: 'dfrA14 + sul1 + sul2', color: '#c994c7' },
    { name: 'dfrA15 + sul1', color: '#4682b4' },
    { name: 'dfrA15 + sul2', color: '#6baed6' },
    { name: 'dfrA15 + sul1 + sul2', color: '#9ecae1' },
    { name: 'dfrA17 + sul1', color: '#7a0177' },
    { name: 'dfrA17 + sul2', color: '#2e8b57' },
    { name: 'dfrA17 + sul1 + sul2', color: '#a8ddb5' },
    { name: 'dfrA18 + sul1', color: '#54278f' },
    { name: 'dfrA18 + sul2', color: '#98fb98' },
    { name: 'dfrA18 + sul1 + sul2', color: '#fc9272' },
    { name: 'None', color: '#B9B9B9' },
  ],
  MDR: [
    { name: 'MDR', color: '#B80F0F' },
    { name: 'Non-MDR', color: '#B9B9B9' },
  ],
  XDR: [
    { name: 'XDR', color: '#000' },
    { name: 'Non-XDR', color: '#B9B9B9' },
  ],
  Pansusceptible: [
    { name: 'Pansusceptible (no AMR markers)', color: '#B9B9B9' },
    { name: 'One or more AMR markers', color: '#000080' },
  ],
};

// Colors for Klebsiella drug classes genes
//TODO: doensn't have the NONE value like the others

export const colorForDrugClassesKP = {
  ESBL: [
    { name: 'BEL-1', color: '#543005' },
    { name: 'CMY-30', color: '#8c510a' },
    { name: 'CMY-42', color: '#f8961e' },
    { name: 'CTX-M-1', color: '#f9844a' },
    { name: 'CTX-M-115', color: '#f9c74f' },
    { name: 'CTX-M-115 + CTX-M-15', color: '#f9c74f' },
    { name: 'CTX-M-12', color: '#90be6d' },
    { name: 'CTX-M-12 + CTX-M-2', color: '#90be6d' },
    { name: 'CTX-M-12 + SHV-12', color: '#90be6d' },
    { name: 'CTX-M-12 + SHV-5', color: '#90be6d' },
    { name: 'CTX-M-132', color: '#43aa8b' },
    { name: 'CTX-M-133.v1', color: '#4d908e' },
    { name: 'CTX-M-14', color: '#577590' },
    { name: 'CTX-M-14 + CTX-M-15', color: '#577590' },
    { name: 'CTX-M-14 + CTX-M-15 + SHV-12', color: '#577590' },
    { name: 'CTX-M-14 + CTX-M-3', color: '#577590' },
    { name: 'CTX-M-14 + CTX-M-3 + SHV-12', color: '#577590' },
    { name: 'CTX-M-14 + CTX-M-55', color: '#577590' },
    { name: 'CTX-M-14 + CTX-M-8', color: '#577590' },
    { name: 'CTX-M-14 + SFO-1.v1 + VEB-3', color: '#577590' },
    { name: 'CTX-M-14 + SHV-12', color: '#577590' },
    { name: 'CTX-M-14 + VEB-1', color: '#577590' },
    { name: 'CTX-M-15', color: '#277da1' },
    { name: 'CTX-M-15 + CTX-M-15', color: '#277da1' },
    { name: 'CTX-M-15 + CTX-M-2', color: '#277da1' },
    { name: 'CTX-M-15 + CTX-M-27', color: '#277da1' },
    { name: 'CTX-M-15 + CTX-M-63', color: '#277da1' },
    { name: 'CTX-M-15 + CTX-M-65', color: '#277da1' },
    { name: 'CTX-M-15 + CTX-M-65 + SHV-12', color: '#277da1' },
    { name: 'CTX-M-15 + CTX-M-8', color: '#277da1' },
    { name: 'CTX-M-15 + CTX-M-9', color: '#277da1' },
    { name: 'CTX-M-15 + GES-9 + SHV-12', color: '#277da1' },
    { name: 'CTX-M-15 + OXA-163', color: '#277da1' },
    { name: 'CTX-M-15 + SFO-1.v1', color: '#277da1' },
    { name: 'CTX-M-15 + SHV-12', color: '#277da1' },
    { name: 'CTX-M-15 + SHV-2', color: '#277da1' },
    { name: 'CTX-M-15 + SHV-31.v1', color: '#277da1' },
    { name: 'CTX-M-15 + SHV-5', color: '#277da1' },
    { name: 'CTX-M-15 + TEM-116', color: '#277da1' },
    { name: 'CTX-M-15 + TEM-155', color: '#277da1' },
    { name: 'CTX-M-15 + VEB-1', color: '#277da1' },
    { name: 'CTX-M-15 + VEB-5', color: '#277da1' },
    { name: 'CTX-M-163', color: '#582f0e' },
    { name: 'CTX-M-2', color: '#7f4f24' },
    { name: 'CTX-M-2 + CTX-M-3', color: '#7f4f24' },
    { name: 'CTX-M-24', color: '#936639' },
    { name: 'CTX-M-25', color: '#a68a64' },
    { name: 'CTX-M-26', color: '#b6ad90' },
    { name: 'CTX-M-27', color: '#a4ac86' },
    { name: 'CTX-M-27 + CTX-M-55', color: '#a4ac86' },
    { name: 'CTX-M-27 + CTX-M-63', color: '#a4ac86' },
    { name: 'CTX-M-27 + SHV-12', color: '#a4ac86' },
    { name: 'CTX-M-3', color: '#656d4a' },
    { name: 'CTX-M-3 + CTX-M-65', color: '#656d4a' },
    { name: 'CTX-M-3 + CTX-M-65 + SHV-12', color: '#656d4a' },
    { name: 'CTX-M-3 + SHV-12', color: '#656d4a' },
    { name: 'CTX-M-32', color: '#414833' },
    { name: 'CTX-M-35', color: '#333d29' },
    { name: 'CTX-M-39', color: '#661d72' },
    { name: 'CTX-M-40', color: '#70257c' },
    { name: 'CTX-M-55', color: '#782f86' },
    { name: 'CTX-M-55 + CTX-M-65', color: '#7f3c8d' },
    { name: 'CTX-M-55 + CTX-M-65 + SHV-12', color: '#854994' },
    { name: 'CTX-M-55 + SHV-2', color: '#8c559c' },
    { name: 'CTX-M-58.v2', color: '#9262a3' },
    { name: 'CTX-M-62.v2', color: '#996fab' },
    { name: 'CTX-M-63', color: '#a079b1' },
    { name: 'CTX-M-65', color: '#a883b8' },
    { name: 'CTX-M-65 + KPC-51', color: '#af8dbf' },
    { name: 'CTX-M-65 + SHV-12', color: '#b797c5' },
    { name: 'CTX-M-65 + TEM-116', color: '#bea0cc' },
    { name: 'CTX-M-71', color: '#c6aad1' },
    { name: 'CTX-M-8', color: '#ccb2d6' },
    { name: 'CTX-M-9', color: '#d3bbdb' },
    { name: 'CTX-M-9 + SHV-12', color: '#dac4df' },
    { name: 'CTX-M-90', color: '#e1cce4' },
    { name: 'CTX-M-96', color: '#e7d5e8' },
    { name: 'CTX-M-98', color: '#e4dae4' },
    { name: 'GES-2', color: '#e2dfe0' },
    { name: 'GES-9', color: '#dfe4dc' },
    { name: 'KPC-52 + SHV-12', color: '#dce9d8' },
    { name: 'None', color: '#B9B9B9' },
    { name: 'OXA-163', color: '#daeed4' },
    { name: 'OXA-17', color: '#d3edcd' },
    { name: 'OXA-17 + SHV-12', color: '#c9e9c3' },
    { name: 'PER-1 + SFO-1.v1 + SHV-12', color: '#c0e6ba' },
    { name: 'SFO-1.v1', color: '#b6e2b0' },
    { name: 'SHV-106', color: '#addea7' },
    { name: 'SHV-12', color: '#a2d99d' },
    { name: 'SHV-12 + VEB-1', color: '#94d191' },
    { name: 'SHV-12 + VEB-9', color: '#86c886' },
    { name: 'SHV-2', color: '#78c07a' },
    { name: 'SHV-24', color: '#6ab86e' },
    { name: 'SHV-31.v1', color: '#5caf63' },
    { name: 'SHV-5', color: '#50a65a' },
    { name: 'TEM-116', color: '#459c53' },
    { name: 'TEM-15', color: '#39924b' },
    { name: 'TEM-24.v1', color: '#2d8843' },
    { name: 'TEM-3', color: '#227e3b' },
    { name: 'VEB-1', color: '#197435' },
    { name: 'VEB-1 + VEB-1', color: '#146a30' },
    { name: 'VEB-5', color: '#0f612a' },
    { name: 'VEB-6', color: '#0a5725' },
    { name: 'VEB-9', color: '#054e20' },
  ],
  Carbapenems: [
    { name: 'CTX-M-33', color: '#D1E5F0' },
    { name: 'GES-13', color: '#FDDBC7' },
    { name: 'GES-24', color: '#E7D4E8' },
    { name: 'IMP-1', color: '#F6E8C3' },
    { name: 'IMP-1 + IMP-1', color: '#F6E8C3' },
    { name: 'IMP-11', color: '#D9F0D3' },
    { name: 'IMP-19', color: '#FDE0EF' },
    { name: 'IMP-26', color: '#92C5DE' },
    { name: 'IMP-26 + NDM-1', color: '#92C5DE' },
    { name: 'IMP-27', color: '#DFC27D' },
    { name: 'IMP-4', color: '#FFB6C1' },
    { name: 'IMP-4 + KPC-2', color: '#FFB6C1' },
    { name: 'IMP-4 + KPC-3', color: '#FFB6C1' },
    { name: 'IMP-4 + NDM-1', color: '#FFB6C1' },
    { name: 'IMP-6', color: '#F1B6DA' },
    { name: 'IMP-68', color: '#A6DBA0' },
    { name: 'IMP-8', color: '#80CDC1' },
    { name: 'KPC-12', color: '#00FFFF' },
    { name: 'KPC-18', color: '#ADDD8E' },
    { name: 'KPC-2', color: '#C2A5CF' },
    { name: 'KPC-2 + KPC-2', color: '#C2A5CF' },
    { name: 'KPC-2 + KPC-2 + NDM-1', color: '#C2A5CF' },
    { name: 'KPC-2 + NDM-1', color: '#C2A5CF' },
    { name: 'KPC-2 + NDM-1 + OXA-181', color: '#C2A5CF' },
    { name: 'KPC-2 + NDM-1 + OXA-48', color: '#C2A5CF' },
    { name: 'KPC-2 + NDM-1 + VIM-24', color: '#C2A5CF' },
    { name: 'KPC-2 + NDM-5', color: '#C2A5CF' },
    { name: 'KPC-2 + NDM-7', color: '#C2A5CF' },
    { name: 'KPC-2 + NDM-9', color: '#C2A5CF' },
    { name: 'KPC-2 + OXA-181', color: '#C2A5CF' },
    { name: 'KPC-2 + OXA-48', color: '#C2A5CF' },
    { name: 'KPC-2 + VIM-1', color: '#C2A5CF' },
    { name: 'KPC-2 + VIM-2', color: '#C2A5CF' },
    { name: 'KPC-2 + VIM-4', color: '#C2A5CF' },
    { name: 'KPC-23', color: '#F4A582' },
    { name: 'KPC-29', color: '#6BAED6' },
    { name: 'KPC-3', color: '#21BCF9' },
    { name: 'KPC-3 + KPC-3', color: '#21BCF9' },
    { name: 'KPC-3 + NDM-1', color: '#21BCF9' },
    { name: 'KPC-3 + NDM-5', color: '#21BCF9' },
    { name: 'KPC-3 + NDM-7', color: '#21BCF9' },
    { name: 'KPC-3 + OXA-48', color: '#21BCF9' },
    { name: 'KPC-3 + VIM-24', color: '#21BCF9' },
    { name: 'KPC-36', color: '#00FA99' },
    { name: 'KPC-38', color: '#FEB24C' },
    { name: 'KPC-39', color: '#FFD500' },
    { name: 'KPC-4', color: '#BC8F8F' },
    { name: 'KPC-4 + NDM-7', color: '#BC8F8F' },
    { name: 'KPC-49', color: '#9ACD32' },
    { name: 'KPC-5', color: '#FFA300' },
    { name: 'KPC-54', color: '#FD8D3C' },
    { name: 'KPC-56', color: '#5AAE61' },
    { name: 'KPC-8', color: '#DE77AE' },
    { name: 'NDM-1', color: '#6495ED' },
    { name: 'NDM-1 + NDM-1 + OXA-48', color: '#6495ED' },
    { name: 'NDM-1 + OXA-181', color: '#6495ED' },
    { name: 'NDM-1 + OXA-232', color: '#6495ED' },
    { name: 'NDM-1 + OXA-48', color: '#6495ED' },
    { name: 'NDM-1 + VIM-1', color: '#6495ED' },
    { name: 'NDM-19', color: '#41AB5D' },
    { name: 'NDM-23', color: '#35978F' },
    { name: 'NDM-23 + OXA-48', color: '#35978F' },
    { name: 'NDM-29', color: '#BF812D' },
    { name: 'NDM-4', color: '#0088AF' },
    { name: 'NDM-4 + OXA-181', color: '#0088AF' },
    { name: 'NDM-4 + OXA-48', color: '#0088AF' },
    { name: 'NDM-5', color: '#9970AB' },
    { name: 'NDM-5 + OXA-181', color: '#9970AB' },
    { name: 'NDM-5 + OXA-232', color: '#9970AB' },
    { name: 'NDM-5 + OXA-48', color: '#9970AB' },
    { name: 'NDM-6', color: '#D6604D' },
    { name: 'NDM-7', color: '#9270DB' },
    { name: 'NDM-7 + OXA-232', color: '#9270DB' },
    { name: 'NDM-9', color: '#FC4E2A' },
    { name: 'None', color: '#B9B9B9' },
    { name: 'OXA-162', color: '#556B2F' },
    { name: 'OXA-181', color: '#E31A1C' },
    { name: 'OXA-204', color: '#2166AC' },
    { name: 'OXA-232', color: '#1B7837' },
    { name: 'OXA-232 + OXA-232', color: '#1B7837' },
    { name: 'OXA-244', color: '#C51B7D' },
    { name: 'OXA-245', color: '#01665E' },
    { name: 'OXA-48', color: '#8C510A' },
    { name: 'OXA-48 + OXA-48', color: '#8C510A' },
    { name: 'OXA-48 + VIM-1', color: '#8C510A' },
    { name: 'OXA-484', color: '#88419D' },
    { name: 'VIM-1', color: '#B2182B' },
    { name: 'VIM-12', color: '#08519C' },
    { name: 'VIM-19', color: '#8E0152' },
    { name: 'VIM-2', color: '#810F7C' },
    { name: 'VIM-24', color: '#543005' },
    { name: 'VIM-26', color: '#00441B' },
    { name: 'VIM-27', color: '#0000CD' },
    { name: 'VIM-29', color: '#08306B' },
    { name: 'VIM-33', color: '#67001F' },
    { name: 'VIM-4', color: '#4A0082' },
    { name: 'VIM-5', color: '#40004B' },
  ],
};

// Color variables
export const lightGrey = '#D3D3D3';
export const darkGrey = '#727272';
export const zeroPercentColor = '#A20F17';
export const zeroCountColor = '#F5F4F6';
export const hoverColor = '#D2F1F6';

// Colors for N. gono drug classes genes
export const colorForDrugClassesNG = {
  Ceftriaxone: [
    { name: 'CefR1', color: '#f9c74f' },
    { name: 'None', color: '#B9B9B9' },
  ],
  Azithromycin: [
    { name: '23S_a2045g + mtrR_proDel', color: '#D1E5F0' },
    { name: '23S_rDNA_a2045g + mtrR_G45D', color: '#FDDBC7' },
    { name: 'mtrR_G45D + mtrC_loss + 23S_a2045g', color: '#E7D4E8' },
    { name: '23S_c2597t + mtrR_proDel', color: '#F6E8C3' },
    { name: '23S_c2597t + mtrR_A39T', color: '#67001F' },
    { name: '23S_c2597t + mtrR_G45D', color: '#4A0082' },
    { name: '23S_c2597t', color: '#20004D' },
    { name: '23S_rDNA_c2597t + mtrC_loss', color: '#054e20' },
    { name: 'mtrC_loss + mtrD_mos2', color: '#f9c74f' },
    { name: 'mtrD_mos2 + mtr_mos2', color: '#f9844a' },
    { name: 'mtr_mos2', color: '#543005' },
    { name: 'None', color: '#B9B9B9' },
  ],
};
