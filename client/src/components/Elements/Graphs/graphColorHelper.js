import { lightGrey } from '../../../util/colorHelper';

export const getColorForDrug = drug => {
  switch (drug) {
    case 'Ampicillin/Amoxicillin':
    case 'Ampicillin':
    case 'Penicillin':
    case 'Penicillins':
    case 'Benzylpenicillin':
      return '#DE77AE';

    case 'Aminoglycosides':
      return 'rgb(129,178,210)';

    case 'Carbapenems':
    case 'Carb':
      return 'rgb(144,211,199)';

    case 'Azithromycin':
    case 'AzithR':
      return '#26a18b'; //PDF does not support rgba

    case '3rd gen cephalosporins (3GCs)':
    case 'ESBL':
      return 'rgb(249,129,117)';

    // case 'Co-trimoxazole':
    case 'Trimethoprim-sulfamethoxazole':
    case '3rd gen cephalosporins (3GCs) + β-lactamase inhibitors':
      return 'rgb(252,180,105)';

    // case 'ESBL':
    case 'Ceftriaxone':
      return '#DB90F0';

    case 'Colistin':
      return 'rgb(0, 163, 35)';

    // case 'Cefixime':
    case 'Cefixime':
      return '#0b08d3ff';

    // case 'Fosfomycin':
    case 'Fosfomycin':
      return '#98fb98';

    // case 'Fluoroquinolones (CipNS)':
    case 'Ciprofloxacin (non-susceptible)':
    case 'Ciprofloxacin NS':
    case 'Ciprofloxacin S':
      return '#f56207ff';

    case 'CipNS':
      return 'rgba(201, 184, 70, 1)';

    // case 'Fluoroquinolones (CipR)':
    case 'Ciprofloxacin R':
    case 'Ciprofloxacin (resistant)':
    case 'Ciprofloxacin':
      return '#9e9ac8';


    case 'Fluoroquinolones':
    case 'Fluoroquinolone':
      return '#c5a514ff';

    case 'Sulphonamides':
    case 'Sulfonamides':
    case 'Sulfamethoxazole':
      return 'rgb(180,221,112)';

    case 'Susceptible':
    case 'Pansusceptible':
    case 'Susceptible to cat I/II drugs':
      return lightGrey;

    case 'Tetracyclines':
    case 'Tetracycline':
      return 'rgb(251,207,229)';

    case 'Trimethoprim':
    case 'Spectinomycin':
      return 'rgb(102,102,255)';

    case 'β-lactamase inhibitors':
    case 'Gentamicin':
      return '#F3AAB9';

    case 'Phenicols':
    case 'Chloramphenicol':
    case 'Meropenem':
      return '#28b936ff';

    case 'Tigecycline':
      return '#54C2FF';

    case 'XDR':
    case 'Extensively drug resistant (XDR)':
      return '#000';

    case 'MDR':
    case 'Multidrug resistant (MDR)':
      return '#B80F0F';

    default:
      return '#F5F4F6';
  }
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
