// List of Salmonella drugs
export const drugsST = [
  'Ampicillin',
  'Azithromycin',
  'Chloramphenicol',
  // 'Co-trimoxazole',
  'Trimethoprim-sulfamethoxazole',
  // 'ESBL',
  'Ceftriaxone',
  // 'Fluoroquinolones (CipNS)',
  'Ciprofloxacin NS',
  // 'Fluoroquinolones (CipR)',
  'Ciprofloxacin R',
  'Sulphonamides',
  'Susceptible',
  'Tetracyclines',
  'Trimethoprim'
].sort((a, b) => a.localeCompare(b));

export const drugsForDrugResistanceGraphST = [...drugsST, 'XDR', 'MDR'].sort((a, b) => a.localeCompare(b));

export const defaultDrugsForDrugResistanceGraphST = [
  'Azithromycin',
  'Ceftriaxone',
  'Ciprofloxacin NS',
  'Ciprofloxacin R',
  'MDR',
  'Susceptible',
  'Trimethoprim-sulfamethoxazole',
  'XDR'
];

// List of Klebsiella drugs
export const drugsKP = [
  'Aminoglycosides',
  'Carbapenems',
  '3rd gen cephalosporins (3GCs)',
  '3rd gen cephalosporins (3GCs) + β-lactamase inhibitors',
  'Colistin',
  'Fluoroquinolones',
  'Fosfomycin',
  'Penicillins',
  'β-lactamase inhibitors',
  'Phenicols',
  'Sulfonamides',
  'Susceptible',
  'Tetracycline',
  'Tigecycline',
  'Trimethoprim'
];

// List of Salmonella drug classes
export const drugClassesST = [
  'Ampicillin',
  'Azithromycin',
  'Chloramphenicol',
  // 'Co-trimoxazole',
  'Trimethoprim-sulfamethoxazole',
  // 'ESBL',
  'Ceftriaxone',
  // 'Fluoroquinolones (CipNS)',
  'Ciprofloxacin NS',
  'Sulphonamides',
  'Tetracyclines',
  'Trimethoprim'
];

// List of Klebsiella drug classes
export const drugClassesKP = ['Carbapenems', 'ESBL'];
