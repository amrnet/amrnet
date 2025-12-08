import { lightGrey } from '../../../util/colorHelper';

// Base palette - these are the "true" colors for normal vision
const dynamicColors = [
"#cd3cbe",
"#00ac35",
"#006cde",
"#bbd146",
"#9e1061",
"#785EF0",
"#e3acff",
"#2e5e07",
"#ff7691",
"#37debc",
"#ffe119",
'#000000',
"#8ec1ff",
"#FFB000",
"#A50026",
"#864000",
"#ff7f4f",
"#aa8a5b",
"#DC227F"
];

// Safe colors for colorblind users - high contrast and distinguishable
const safeColors = [
    "#aeb342",
    "#5173e2",
    "#63bf63",
    "#9f6bd0",
    "#578b3f",
    "#a64091",
    "#47c29a",
    "#d44d78",
    "#66a1e5",
    "#cd8e33",
    "#537fd8",
    "#bf6033",
    "#503182",
    "#9b8c40",
    "#7e72be",
    "#d95157",
    "#d788d5",
    "#a44739",
    "#c75a92",
    "#9b3b5b"
];

const drugColorMap = {
  'Ampicillin': 0,
  'Ampicillin/Amoxicillin': 0,
  'Aminoglycosides': 1,
  'Azithromycin': 2,
  'Benzylpenicillin': 3,
  'ESBL': 3,
  'Carbapenems': 4,
  'Cefixime': 5,
  'Sulfonamides': 5,
  'Ceftriaxone': 6,
  'Tigecycline': 6,
  'Chloramphenicol': 7,
  'Ciprofloxacin': 8,
  'Ciprofloxacin (non-susceptible)': 8,
  'Ciprofloxacin NS': 8,
  'Ciprofloxacin S': 8,
  'CipNS': 8,
  'Ciprofloxacin R': 9,
  'CipR': 9,
  'Colistin': 10,
  'Extensively drug resistant (XDR)': 11,
  'XDR': 11,
  'Fosfomycin': 12,
  'Macrolides': 13,
  'Multidrug resistant (MDR)': 14,
  'MDR': 14,
  'Pansusceptible': '#808080', // fixed gray
  'Spectinomycin': 15,
  'Sulfamethoxazole': 15,
  'Tetracycline': 16,
  'Trimethoprim': 17,
  'Trimethoprim-sulfamethoxazole': 18
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
 ]
