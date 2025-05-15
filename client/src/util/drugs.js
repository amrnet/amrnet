import { drugRulesINTS, drugRulesNG, drugRulesKP } from './drugClassesRules';

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

export const drugsSTLegendsOnly = [
  'Ampicillin/Amoxicillin',
  'Azithromycin',
  'Chloramphenicol',
  'Ceftriaxone',
  'Ciprofloxacin (non-susceptible)',
  'Ciprofloxacin (resistant)',
  'Sulphonamides',
  'Pansusceptible',
  'Tetracyclines',
  'Trimethoprim',
  'Trimethoprim-sulfamethoxazole',
  'Extensively Drug Resistant (XDR)',
  'Multi-drug Resistant (MDR)',
];

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

// export const drugsNGLegensOnly = [
//   'Azithromycin',
//   'Ceftriaxone',
//   'Ciprofloxacin',
//   'Sulfonamides',
//   'Tetracycline',
//   'Cefixime',
//   'Penicillin',
//   'Spectinomycin',
//   'Susceptible to cat I/II drugs',
//   'Extensively Drug Resistant (XDR)',
//   'Multi-drug Resistant (MDR)',
// ];

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
  'ESBL',
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
  'Ampicillin/Amoxicillin': 'AMP',
  Ampicillin: 'AMP',
  Azithromycin: 'AZM',
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
  Carb: 'CARB',
  Aminoglycosides: 'AGLY',
  Fluoroquinolones: 'FLQ',
  // 'β-lactamase inhibitors': 'β-lactamase inhibitors',
  Phenicols: 'PHE',
  Tigecycline: 'TGC',
  AzithR: 'AZM',
  '3rd gen cephalosporins (3GCs)': '3GCs',
  Sulfamethoxazole: 'SMX',
  Gentamicin: 'GEN',
  Cefixime: 'CFM',
  Ciprofloxacin: 'CIP',
  Penicillin: 'PEN',
  Spectinomycin: 'SPT',
  Pansusceptible: 'PAN',
  'Susceptible to cat I/II drugs': 'SUS',
  Susceptible: 'SUS',
};

export const drugAcronymsOpposite = {
  CipNS: 'Ciprofloxacin (non-susceptible)',
  CARB: 'Carbapenems',
  AZM: 'Azithromycin',
  ESBL: 'Extended-Spectrum Beta-Lactamase',
  CipR: 'Ciprofloxacin (resistant)',
  MDR: 'Multi-drug Resistant (MDR)',
  XDR: 'Extensively Drug Resistant (XDR)',
  SUS: 'Susceptible to cat I/II drugs',
};

export const drugAcronymsOpposite2 = {
  CipNS: 'Ciprofloxacin (non-susceptible)',
  CARB: 'Carbapenems',
  Carb: 'Carbapenems',
  AZM: 'Azithromycin',
  ESBL: 'Extended-Spectrum Beta-Lactamase',
  CipR: 'Ciprofloxacin (resistant)',
  AzithR: 'Azithromycin',
  MDR: 'Multi-drug Resistant (MDR)',
  XDR: 'Extensively Drug Resistant (XDR)',
};

export const ciproAcronyms = {
  'Ciprofloxacin NS': 'Ciprofloxacin (non-susceptible)',
  'Ciprofloxacin R': 'Ciprofloxacin (resistant)',
};

export const drugsINTS = drugRulesINTS.map((x) => x.key).sort((a, b) => a.localeCompare(b));
export const drugsINTSLegendsOnly = drugRulesINTS.map((x) => x.legends || x.key).sort((a, b) => a.localeCompare(b));
export const drugsNGLegensOnly = drugRulesNG.map((x) => x.legends || x.key);
export const drugsKlebLegendsOnly = drugRulesKP.map((x) => x.key).sort((a, b) => a.localeCompare(b));
// export const drugsSTLegendsOnly = drugsSTLegendsOnlyOk.map((x) => x.legends || x.key);
export function getDrugClasses(organism) {
  switch (organism) {
    case 'styphi':
      return drugClassesST;
    case 'kpneumo':
      return drugClassesKP;
    case 'ngono':
      return drugClassesNG;
    default:
      return drugsINTS;
  }
}

export function ngonoSusceptibleRule(name, organism) {
  return name === 'Susceptible' && organism === 'ngono' ? 'Susceptible to cat I/II drugs' : null;
}
