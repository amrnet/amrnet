import { lightGrey } from '../../../util/colorHelper';

export const getColorForDrug = (drug) => {
  switch (drug) {
    case 'Ampicillin/Amoxicillin':
    case 'Aminoglycosides':
      return 'rgb(129,178,210)';

    case 'Azithromycin':
    case 'AzithR':
    case 'Carbapenems':
    case 'Carb':
      return 'rgb(144,211,199)';

    case 'Chloramphenicol':
    case '3rd gen cephalosporins (3GCs)':
    case 'ESBL':
      return 'rgb(249,129,117)';

    // case 'Co-trimoxazole':
    case 'Trimethoprim-sulfamethoxazole':
    case '3rd gen cephalosporins (3GCs) + β-lactamase inhibitors':
      return 'rgb(252,180,105)';

    // case 'ESBL':
    case 'Ceftriaxone':
    case 'Colistin':
      return '#DB90F0';

    // case 'Fluoroquinolones (CipI)':
    case 'Fosfomycin':
    case 'Cefixime':
      return '#98fb98';

    // case 'Fluoroquinolones (CipNS)':
    // case 'Ciprofloxacin NS':
    case 'Ciprofloxacin':
    case 'Penicillins':
    case 'CipNS':
      return 'rgb(255,236,120)';

    // case 'Fluoroquinolones (CipR)':
    case 'Ciprofloxacin R':
    case 'Fluoroquinolones':
    case 'Penicillin':
      return '#9e9ac8';

    case 'Sulphonamides':
    case 'Sulfonamides':
      return 'rgb(180,221,112)';

    case 'Susceptible':
    case 'Pansusceptible':
      return lightGrey;

    case 'Tetracyclines':
    case 'Tetracycline':
      return 'rgb(251,207,229)';

    case 'Trimethoprim':
    case 'Spectinomycin':
      return 'rgb(102,102,255)';

    case 'β-lactamase inhibitors':
      return '#F3AAB9';

    case 'Phenicols':
      return '#FBCFBA';

    case 'Tigecycline':
      return '#54C2FF';

    case 'XDR':
      return '#000';

    case 'MDR':
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
