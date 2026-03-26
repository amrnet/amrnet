import {
  drugClassesRulesNG,
  drugRulesINTS,
  drugRulesNG,
  drugRulesSA,
  drugRulesSP,
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
  'Ciprofloxacin NS',
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
  'Ciprofloxacin NS',
  'Ciprofloxacin R',
  'XDR',
  'MDR',
  'Trimethoprim-sulfamethoxazole',
  'Pansusceptible',
];

export const drugsNG = [
  'Azithromycin',
  'Cefixime',
  'Ceftriaxone',
  'Ciprofloxacin',
  'Benzylpenicillin',
  'Spectinomycin',
  'Sulfonamides',
  'Tetracycline',
];

export const defaultDrugsForDrugResistanceGraphNG = [
  'Azithromycin',
  'Cefixime',
  'Ceftriaxone',
  'Ciprofloxacin',
  'XDR',
  'MDR',
  'Benzylpenicillin',
  'Spectinomycin',
  'Susceptible to cat I/II drugs',
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

// S. aureus drug list
export const drugsSA = drugRulesSA.map(x => x.key);

// S. pneumoniae drug list
export const drugsSP = drugRulesSP.map(x => x.key);

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
  Gentamicin: 'GEN',
  Cefixime: 'CFM',
  Ciprofloxacin: 'CIP',
  Benzylpenicillin: 'PEN',
  Spectinomycin: 'SPT',
  Pansusceptible: 'PAN',
  Macrolides: 'MLS',
  Gentamicin: 'GEN',
  Tobramycin: 'TOB',
  Kanamycin: 'KAN',
  Methicillin: 'MET',
  Vancomycin: 'VAN',
  Clindamycin: 'CLI',
  Erythromycin: 'ERY',
  Mupirocin: 'MUP',
  Linezolid: 'LNZ',
  Tetracycline: 'TET',
  Daptomycin: 'DAP',
  Rifampicin: 'RIF',
  Moxifloxacin: 'MFX',
  Teicoplanin: 'TEC',
  'Fusidic Acid': 'FUS',
  Fluoroquinolone: 'FLQ',
  'Susceptible to cat I/II drugs': 'SUS',
  Susceptible: 'SUS',
  Carbapenems: 'CARB',
  Carbapenem: 'CARB',
  'Ciprofloxacin R': 'CipR',
  CipNS: 'CipNS',
  CipR: 'CipR',
  'QRDR mutations': 'QRDR',
  MDR: 'MDR',
  XDR: 'XDR',
  PDR: 'PDR',
  Amikacin: 'AMI',
  'Co-Trimoxazole': 'SXT',
  Penicillin: 'PEN',
};

export const drugAcronymsOpposite = {
  CIP: 'Ciprofloxacin',
  AZM: 'Azithromycin',
  // ESBL: 'Extended-Spectrum Beta-Lactamase',
  CipNS: 'Ciprofloxacin (non-susceptible)',
  CipR: 'Ciprofloxacin (resistant)',
  QRDR: 'QRDR mutations',
  MDR: 'Multidrug resistant (MDR)',
  XDR: 'Extensively drug resistant (XDR)',
  PDR: 'Pan-drug resistant (PDR)',
  SUS: 'Susceptible to cat I/II drugs',
};

export const drugAcronymsOpposite2 = {
  CIP: 'Ciprofloxacin',
  AZM: 'Azithromycin',
  // ESBL: 'Extended-Spectrum Beta-Lactamase',
  CipR: 'Ciprofloxacin (resistant)',
  MDR: 'Multidrug resistant (MDR)',
  XDR: 'Extensively drug resistant (XDR)',
};

export const ciproAcronyms = {
  Ciprofloxacin: 'Ciprofloxacin',
  'Ciprofloxacin NS': 'Ciprofloxacin (non-susceptible)',
  'Ciprofloxacin R': 'Ciprofloxacin (resistant)',
};

export const drugsINTS = [...drugRulesINTS.map(x => x.key), 'CipNS', 'CipR', 'QRDR mutations', 'MDR', 'XDR', 'PDR'];
export const drugsECOLI = statKeysECOLI.map(x => x.name);
export const drugsINTSLegendsOnly = [
  ...drugRulesINTS.map(x => x.legends || x.key),
  'Ciprofloxacin (non-susceptible)',
  'Ciprofloxacin (resistant)',
  'QRDR mutations',
  'Multidrug resistant (MDR)',
  'Extensively drug resistant (XDR)',
  'Pan-drug resistant (PDR)',
].sort((a, b) => a.localeCompare(b));
export const drugsNGLegendsOnly = drugRulesNG.map(x => x.legends || x.key);
export const drugsKlebLegendsOnly = drugsKP.map(x => x.key).sort((a, b) => a.localeCompare(b));
//export const drugsSTLegendsOnly = drugsSTLegendsOnlyOk.map((x) => x.legends || x.key);

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
    case 'saureus':
      return drugsSA;
    case 'strepneumo':
      return drugsSP;
    default:
      return drugsECOLI.filter(x => x !== 'Pansusceptible');
  }
}

export function ngonoSusceptibleRule(name, organism) {
  return (name === 'Susceptible' || name === 'Pansusceptible') && organism === 'ngono'
    ? 'Susceptible to cat I/II drugs'
    : null;
}
