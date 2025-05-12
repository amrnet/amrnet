import { drugRulesINTS } from './drugClassesRules';

// List of Salmonella drugs
export const drugsST = [
  'Ampicillin/Amoxicillin',
  'Azithromycin',
  'Chloramphenicol',
  'Trimethoprim-sulfamethoxazole',
  'Ceftriaxone',
  'Ciprofloxacin NS',
  'Ciprofloxacin R',
  'Sulphonamides',
  'Pansusceptible',
  'Tetracyclines',
  'Trimethoprim',
  'XDR',
  'MDR',
].sort((a, b) => a.localeCompare(b));

export const defaultDrugsForDrugResistanceGraphST = [
  'Azithromycin',
  'Ceftriaxone',
  'Ciprofloxacin NS',
  'Ciprofloxacin R',
  'MDR',
  'Pansusceptible',
  'Trimethoprim-sulfamethoxazole',
  'XDR',
];

// List of N. gono drug classes
export const drugsNG = [
  'Azithromycin',
  'Ceftriaxone',
  'Ciprofloxacin',
  'Sulfonamides',
  'Tetracycline',
  'Cefixime',
  'Penicillin',
  'Pansusceptible',
  'Spectinomycin',
  'MDR',
  'XDR',
];

// List of N. gono drug classes default
export const defaultDrugsForDrugResistanceGraphNG = [
  'Azithromycin',
  'Ceftriaxone',
  'Ciprofloxacin',
  'Cefixime',
  'Penicillin',
  'Pansusceptible',
  'Spectinomycin',
  'MDR',
  'XDR',
];

// List of Klebsiella drugs
export const drugsKP = [
  'Aminoglycosides',
  'Carbapenems',
  '3rd gen cephalosporins (3GCs)',
  // '3rd gen cephalosporins (3GCs) + β-lactamase inhibitors',
  'Colistin',
  'Fluoroquinolones',
  'Fosfomycin',
  // 'Penicillins',
  // 'β-lactamase inhibitors',
  'Phenicols',
  // 'Sulfonamides',
  // 'Susceptible',
  'Tetracycline',
  'Tigecycline',
  'Trimethoprim',
  'Trimethoprim-sulfamethoxazole',
];

// List of Salmonella Typhi drug classes
export const drugClassesST = [
  'Ampicillin/Amoxicillin',
  'Azithromycin',
  'Chloramphenicol',
  'Trimethoprim-sulfamethoxazole',
  'Ceftriaxone',
  'Ciprofloxacin NS',
  'Sulphonamides',
  'Tetracyclines',
  'Trimethoprim',
  // 'Pansusceptible',
  'MDR',
  'XDR',
];

// List of Klebsiella drug classes
export const drugClassesNG = ['Azithromycin', 'Ceftriaxone'];

// List of Klebsiella drug classes
export const drugClassesKP = ['Carbapenems', 'ESBL'];

export const drugAcronyms = {
  'Ampicillin/Amoxicillin': 'AMP/AMC',
  Ampicillin: 'AMP',
  Ceftriaxone: 'CRO',
  Chloramphenicol: 'CHL',
  Sulphonamides: 'SUL',
  Sulfonamides: 'SUL',
  Tetracyclines: 'TET',
  Tetracycline: 'TET',
  Trimethoprim: 'TMP',
  'Trimethoprim-sulfamethoxazole': 'SXT',
  Colistin: 'COL',
  Fosfomycin: 'FOS',
  Carbapenemase: 'CARB',
  Aminoglycosides: 'AGLY',
  Fluoroquinolones: 'FLQ',
  // 'β-lactamase inhibitors': 'β-lactamase inhibitors',
  Phenicols: 'PHE',
  Tigecycline: 'TGC',
  Azithromycin: 'AZM',
  '3rd gen cephalosporins (3GCs)': '3GCs',
  'Ciprofloxacin (non-susceptible)': 'CIP',
  'Ciprofloxacin (resistant)': 'CipR',
  Sulfamethoxazole: 'SMX',
  Gentamicin: 'GEN',
  'Multidrug resistant (MDR)':"MDR",
  'Extensively drug resistant (XDR)':"XDR",
  'Cefixime': 'CFM',
  'Ciprofloxacin': 'CIP',
  'Penicillin': 'PEN',
  'Spectinomycin': 'SPT'
};

export const drugAcronymsOpposite = {
  CIP: 'Ciprofloxacin (non-susceptible)',
  CARB: 'Carbapenems',
  AZM: 'Azithromycin',
  ESBL: 'Extended-Spectrum Beta-Lactamase',
  CipR: 'Ciprofloxacin (resistant)',
  MDR: 'Multidrug resistant (MDR)',
  XDR: 'Extensively drug resistant (XDR)',
};

export const drugsINTS = drugRulesINTS.map((x) => x.key).sort((a, b) => a.localeCompare(b));

export function getDrugClasses(organism) {
  switch (organism) {
    case 'styphi':
      return drugClassesST;
    case 'kpneumo':
      return drugClassesKP;
    case 'ngono':
      return drugClassesNG;
    default:
      return [];
  }
}
