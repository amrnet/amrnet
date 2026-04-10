import { lightGrey } from '../../../util/colorHelper';

// Base palette - these are the "true" colors for normal vision
const dynamicColors = [
  '#cd3cbe',
  '#00ac35',
  '#006cde',
  '#bbd146',
  '#9e1061',
  '#785EF0',
  '#e3acff',
  '#2e5e07',
  '#ff7691',
  '#37debc',
  '#ffe119',
  '#000000',
  '#8ec1ff',
  '#FFB000',
  '#A50026',
  '#864000',
  '#ff7f4f',
  '#aa8a5b',
  '#DC227F',
  // Extended palette for saureus / strepneumo
  '#1a6b8a', // 19 - Vancomycin / Teicoplanin (glycopeptides)
  '#e65c00', // 20 - Fusidic Acid
  '#7b2fa0', // 21 - Mupirocin
  '#1abc9c', // 22 - Linezolid
  '#6d4c1f', // 23 - Daptomycin
  '#c0392b', // 24 - Rifampicin
];

// Safe colors for colorblind users - high contrast and distinguishable
const safeColors = [
  '#aeb342',
  '#5173e2',
  '#63bf63',
  '#9f6bd0',
  '#578b3f',
  '#a64091',
  '#47c29a',
  '#d44d78',
  '#66a1e5',
  '#cd8e33',
  '#537fd8',
  '#bf6033',
  '#503182',
  '#9b8c40',
  '#7e72be',
  '#d95157',
  '#d788d5',
  '#a44739',
  '#c75a92',
  '#9b3b5b',
  // Extended palette for saureus / strepneumo
  '#1a6b8a', // 19 - Vancomycin / Teicoplanin
  '#e65c00', // 20 - Fusidic Acid
  '#7b2fa0', // 21 - Mupirocin
  '#1abc9c', // 22 - Linezolid
  '#6d4c1f', // 23 - Daptomycin
  '#c0392b', // 24 - Rifampicin
];

const drugColorMap = {
  Ampicillin: 0,
  'Ampicillin/Amoxicillin': 0,
  Aminoglycosides: 1,
  Azithromycin: 2,
  Benzylpenicillin: 3,
  ESBL: 3,
  Carbapenems: 4,
  Cefixime: 5,
  Sulfonamides: 5,
  Ceftriaxone: 6,
  Tigecycline: 6,
  Chloramphenicol: 7,
  Ciprofloxacin: 8,
  'Ciprofloxacin (non-susceptible)': 8,
  'Ciprofloxacin NS': 8,
  // 'Ciprofloxacin S': 8,
  CipNS: 8,
  'Ciprofloxacin R': 9,
  CipR: 9,
  Colistin: 10,
  'Extensively drug resistant (XDR)': 11,
  XDR: 11,
  Fosfomycin: 12,
  Macrolides: 13,
  'Multidrug resistant (MDR)': 14,
  MDR: 14,
  Pansusceptible: '#808080', // fixed gray
  'Susceptible to cat I/II drugs': '#808080', // fixed gray
  Spectinomycin: 15,
  Sulfamethoxazole: 15,
  Tetracycline: 16,
  Trimethoprim: 17,
  'Trimethoprim-sulfamethoxazole': 18,
  'Trimethoprim-Sulfamethoxazole': 18,
  // New shared drug columns (ecoli, decoli, shige, senterica, sentericaints)
  Aminoglycoside: 1,
  'Beta-lactam': 0,
  Sulfonamide: 5,
  Phenicol: 7,
  Quinolone: 8,
  Macrolide: 2,
  Lincosamide: 13,
  Streptothricin: 3,
  Rifamycin: 24,
  Bleomycin: 15,
  // S. aureus drugs
  Amikacin: 1,       // aminoglycoside
  Gentamicin: 1,     // aminoglycoside
  Tobramycin: 1,     // aminoglycoside
  Kanamycin: 1,      // aminoglycoside
  Methicillin: 0,    // beta-lactam
  Penicillin: 0,     // beta-lactam
  'Fusidic Acid': 20,
  Vancomycin: 19,    // glycopeptide
  Clindamycin: 13,   // lincosamide (grouped with macrolides)
  Erythromycin: 13,  // macrolide
  Mupirocin: 21,
  Linezolid: 22,
  Daptomycin: 23,
  Rifampicin: 24,
  Moxifloxacin: 8,   // fluoroquinolone
  Teicoplanin: 19,   // glycopeptide
  // S. pneumoniae drugs
  Fluoroquinolone: 8,
  'Co-Trimoxazole': 18,
};

// Based on drug name
export const getColorForDrug = (drug, mode = false) => {
  const colorIndex = drugColorMap[drug];

  if (colorIndex === undefined) return 'rgb(0,0,0)';
  if (typeof colorIndex === 'number') return (mode ? safeColors : dynamicColors)[colorIndex];
  return colorIndex;
};

export const colorsForKODiversityGraph = [
  // { name: 'MDR', color: 'rgb(187, 54, 60)' },
  // { name: 'Hv', color: 'rgb(24, 85, 183)' },
  { name: 'Carbapenems', color: 'rgb(144,211,199)' },
  { name: 'ESBL', color: '#DB90F0' },
  { name: 'Aerobactin(iuc)', color: 'rgb(180,221,112)' },
  { name: 'rmpADC', color: 'rgb(252,180,105)' },
  { name: 'None', color: lightGrey },
];
