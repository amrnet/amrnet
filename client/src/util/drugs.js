import {
  drugClassesRulesNG,
  drugRulesINTS,
  drugRulesNG,
  drugRulesST,
  statKeysECOLI,
  statKeysINTS,
  statKeysKP,
  statKeysKPOnlyMarkers,
} from './drugClassesRules';

// List of Salmonella drugs
export const drugsST = [
  'Ampicillin/Amoxicillin',
  'Azithromycin',
  'Ceftriaxone',
  'Chloramphenicol',
  'Ciprofloxacin',
  'Ciprofloxacin R',
  'XDR',
  'MDR',
  'Sulfonamides',
  'Tetracycline',
  'Trimethoprim',
  'Trimethoprim-sulfamethoxazole',
  'Pansusceptible',
];

export const drugsSTLegendsOnly = [
  'Ampicillin/Amoxicillin',
  'Azithromycin',
  'Ceftriaxone',
  'Chloramphenicol',
  'Ciprofloxacin (non-susceptible)',
  'Ciprofloxacin (resistant)',
  'Extensively drug resistant (XDR)',
  'Multidrug resistant (MDR)',
  'Sulfonamides',
  'Tetracycline',
  'Trimethoprim',
  'Trimethoprim-sulfamethoxazole',
  'Pansusceptible',
];

export const defaultDrugsForDrugResistanceGraphST = [
  'Azithromycin',
  'Ceftriaxone',
  'Ciprofloxacin',
  'Ciprofloxacin R',
  'XDR',
  'MDR',
  'Trimethoprim-sulfamethoxazole',
  'Pansusceptible',
];

//List of N. gono drug classes
export const drugsNG = [
  'Azithromycin',
  'Cefixime',
  'Ceftriaxone',
  'Ciprofloxacin',
  'XDR',
  'MDR',
  'Benzylpenicillin',
  'Spectinomycin',
  'Sulfonamides',
  'Tetracycline',
  'Pansusceptible',
];

// export const drugsNGLegendsOnly = [
//   'Azithromycin',
//   'Ceftriaxone',
//   'Ciprofloxacin',
//   'Sulfonamides',
//   'Tetracycline',
//   'Cefixime',
//   'Penicillin',
//   'Spectinomycin',
//   'Susceptible to cat I/II drugs',
//   'Extensively drug resistant (XDR)',
//   'Multidrug resistant (MDR)',
// ];

// List of N. gono drug classes default
export const defaultDrugsForDrugResistanceGraphNG = [
  'Azithromycin',
  'Cefixime',
  'Ceftriaxone',
  'Ciprofloxacin',
  'XDR',
  'MDR',
  'Benzylpenicillin',
  'Spectinomycin',
  'Pansusceptible',
];

// List of Klebsiella drugs
export const drugsKP = statKeysKP.map(x => x.name);
export const markersDrugsKP = [
  ...drugsKP.filter(x => !['Pansusceptible'].includes(x)),
  ...statKeysKPOnlyMarkers.map(x => x.name),
].sort();
export const markersDrugsST = [...drugRulesST.map(x => x.name)].sort();
export const markersDrugsSH = statKeysECOLI.map(x => x.name).filter(x => !['Pansusceptible'].includes(x));
export const markersDrugsINTS = statKeysINTS.map(x => x.name).filter(x => !['Pansusceptible'].includes(x));

// List of Salmonella Typhi drug classes
export const drugClassesST = [
  'Ampicillin/Amoxicillin',
  'Azithromycin',
  'Ceftriaxone',
  'Ciprofloxacin',
  'Chloramphenicol',
  // 'XDR',
  // 'MDR',
  'Sulfonamides',
  'Tetracycline',
  'Trimethoprim',
  // 'Trimethoprim-sulfamethoxazole',
  // 'Pansusceptible',
];

// List of NG drug classes
export const drugClassesNG = Object.keys(drugClassesRulesNG).sort();

export const drugAcronyms = {
  'Ampicillin/Amoxicillin': 'AMP/AMX',
  Ampicillin: 'AMP',
  Azithromycin: 'AZM',
  ESBL: 'ESBL',
  Ceftriaxone: 'CRO',
  Chloramphenicol: 'CHL',
  Sulfonamides: 'SUL',
  Tetracycline: 'TET',
  Trimethoprim: 'TMP',
  'Trimethoprim-sulfamethoxazole': 'SXT',
  'Trimethoprim-Sulfamethoxazole': 'SXT',
  Colistin: 'COL',
  Fosfomycin: 'FOS',
  Aminoglycosides: 'AGLY',
  Fluoroquinolones: 'FLQ',
  // 'β-lactamase inhibitors': 'β-lactamase inhibitors',
  // Phenicols: 'PHE',
  Tigecycline: 'TGC',
  '3rd gen cephalosporins (3GCs)': '3GCs',
  Sulfamethoxazole: 'SMX',
  // Gentamicin: 'GEN',
  Cefixime: 'CFM',
  Ciprofloxacin: 'CIP',
  Benzylpenicillin: 'PEN',
  Spectinomycin: 'SPT',
  Pansusceptible: 'PAN',
  Macrolides: 'MLS',
  'Susceptible to cat I/II drugs': 'SUS',
  Susceptible: 'SUS',
  Carbapenems: 'CARB',
  Carbapenem: 'CARB',
  'Ciprofloxacin R': 'CipR',
  // Penicillins: 'PCN',
};

export const drugAcronymsOpposite = {
  CipNS: 'Ciprofloxacin (non-susceptible)',
  CIP: 'Ciprofloxacin',
  // CIP: 'Ciprofloxacin (non-susceptible)',
  AZM: 'Azithromycin',
  // ESBL: 'Extended-Spectrum Beta-Lactamase', // No need to change this from ESBL
  CipR: 'Ciprofloxacin (resistant)',
  MDR: 'Multidrug resistant (MDR)',
  XDR: 'Extensively drug resistant (XDR)',
  SUS: 'Susceptible to cat I/II drugs',
};

export const drugAcronymsOpposite2 = {
  CipNS: 'Ciprofloxacin (non-susceptible)',
  CIP: 'Ciprofloxacin',
  AZM: 'Azithromycin',
  ESBL: 'Extended-Spectrum Beta-Lactamase',
  CipR: 'Ciprofloxacin (resistant)',
  MDR: 'Multidrug resistant (MDR)',
  XDR: 'Extensively drug resistant (XDR)',
};

export const ciproAcronyms = {
  Ciprofloxacin: 'Ciprofloxacin',
  'Ciprofloxacin R': 'Ciprofloxacin (resistant)',
};

export const drugsINTS = drugRulesINTS.map(x => x.key);
export const drugsECOLI = statKeysECOLI.map(x => x.name);
export const drugsINTSLegendsOnly = drugRulesINTS.map(x => x.legends || x.key).sort((a, b) => a.localeCompare(b));
export const drugsNGLegendsOnly = drugRulesNG.map(x => x.legends || x.key);
export const drugsKlebLegendsOnly = drugsKP.map(x => x.key).sort((a, b) => a.localeCompare(b));
// export const drugsSTLegendsOnly = drugsSTLegendsOnlyOk.map((x) => x.legends || x.key);

export function getDrugClasses(organism) {
  switch (organism) {
    case 'styphi':
      return drugClassesST;
    case 'kpneumo':
      return markersDrugsKP;
    case 'ngono':
      return drugClassesNG;
    case 'senterica':
    case 'sentericaints':
      return drugsINTS.filter(x => x !== 'Pansusceptible');
    default:
      return drugsECOLI.filter(x => x !== 'Pansusceptible');
  }
}

export function ngonoSusceptibleRule(name, organism) {
  return (name === 'Susceptible' || name === 'Pansusceptible') && organism === 'ngono'
    ? 'Susceptible to cat I/II drugs'
    : null;
}
