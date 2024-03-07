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
  'Susceptible',
  'Tetracyclines',
  'Trimethoprim',
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
  'Susceptible',
  'Spectinomycin',
  'MDR',
  'XDR',
];

// List of N. gono drug classes
export const drugsNG1 = [
  'Azithromycin',
  'Ceftriaxone',
  'Ciprofloxacin',
  'Sulfonamides',
  'Tetracycline',
  'Cefixime',
  'Penicillin',
  'Susceptible',
  'Spectinomycin',
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
  'Trimethoprim',
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
];

// List of Klebsiella drug classes
export const drugClassesNG = ['Azithromycin', 'Ceftriaxone'];

// List of Klebsiella drug classes
export const drugClassesKP = ['Carbapenems', 'ESBL'];
