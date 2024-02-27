// List of Salmonella drugs
export const drugsST = [
  'Ampicillin/Amoxicillin',
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

// List of Salmonella Typhi drug classes
export const drugClassesST = [
  'Ampicillin/Amoxicillin',
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

// List of E. coli drug classes
export const drugClassesEC = [
  // 'Ampicillin',
  // 'Azithromycin',
  // 'Chloramphenicol',
  // // 'Co-trimoxazole',
  // 'Trimethoprim-sulfamethoxazole',
  // // 'ESBL',
  // 'Ceftriaxone',
  // // 'Fluoroquinolones (CipNS)',
  // 'Ciprofloxacin NS',
  // 'Sulphonamides',
  // 'Tetracyclines',
  // 'Trimethoprim'
];

export const drugClassesDEC = [
  // 'Ampicillin',
  // 'Azithromycin',
  // 'Chloramphenicol',
  // // 'Co-trimoxazole',
  // 'Trimethoprim-sulfamethoxazole',
  // // 'ESBL',
  // 'Ceftriaxone',
  // // 'Fluoroquinolones (CipNS)',
  // 'Ciprofloxacin NS',
  // 'Sulphonamides',
  // 'Tetracyclines',
  // 'Trimethoprim'
];

// List of E. coli drug classes
export const drugsEC = [
  // 'Ampicillin',
  // 'Azithromycin',
  // 'Chloramphenicol',
  // // 'Co-trimoxazole',
  // 'Trimethoprim-sulfamethoxazole',
  // // 'ESBL',
  // 'Ceftriaxone',
  // // 'Fluoroquinolones (CipNS)',
  // 'Ciprofloxacin NS',
  // 'Sulphonamides',
  // 'Tetracyclines',
  // 'Trimethoprim'
];

export const drugsDEC = [
  // 'Ampicillin',
  // 'Azithromycin',
  // 'Chloramphenicol',
  // // 'Co-trimoxazole',
  // 'Trimethoprim-sulfamethoxazole',
  // // 'ESBL',
  // 'Ceftriaxone',
  // // 'Fluoroquinolones (CipNS)',
  // 'Ciprofloxacin NS',
  // 'Sulphonamides',
  // 'Tetracyclines',
  // 'Trimethoprim'
];

export const drugsSH = [
  // 'Ampicillin',
  // 'Azithromycin',
  // 'Chloramphenicol',
  // // 'Co-trimoxazole',
  // 'Trimethoprim-sulfamethoxazole',
  // // 'ESBL',
  // 'Ceftriaxone',
  // // 'Fluoroquinolones (CipNS)',
  // 'Ciprofloxacin NS',
  // 'Sulphonamides',
  // 'Tetracyclines',
  // 'Trimethoprim'
];

export const drugsSE = [
  // 'Ampicillin',
  // 'Azithromycin',
  // 'Chloramphenicol',
  // // 'Co-trimoxazole',
  // 'Trimethoprim-sulfamethoxazole',
  // // 'ESBL',
  // 'Ceftriaxone',
  // // 'Fluoroquinolones (CipNS)',
  // 'Ciprofloxacin NS',
  // 'Sulphonamides',
  // 'Tetracyclines',
  // 'Trimethoprim'
];

export const drugsSEINTS = [
  // 'Ampicillin',
  // 'Azithromycin',
  // 'Chloramphenicol',
  // // 'Co-trimoxazole',
  // 'Trimethoprim-sulfamethoxazole',
  // // 'ESBL',
  // 'Ceftriaxone',
  // // 'Fluoroquinolones (CipNS)',
  // 'Ciprofloxacin NS',
  // 'Sulphonamides',
  // 'Tetracyclines',
  // 'Trimethoprim'
];

// List of Salmonella spp drug classes
export const drugClassesSE = [
  'Ampicillin',
  'Azithromycin',
  'Chloramphenicol',
  'Trimethoprim-sulfamethoxazole',
  'Ceftriaxone',
  'Ciprofloxacin NS',
  'Sulphonamides',
  'Tetracyclines',
  'Trimethoprim'
];

// List of Salmonella spp drug classes
export const drugClassesSEINTS = [
  'Ampicillin',
  'Azithromycin',
  'Chloramphenicol',
  'Trimethoprim-sulfamethoxazole',
  'Ceftriaxone',
  'Ciprofloxacin NS',
  'Sulphonamides',
  'Tetracyclines',
  'Trimethoprim'
];

// List of Shigella drug classes
export const drugClassesSH = [
  // 'Ampicillin',
  // 'Azithromycin',
  // 'Chloramphenicol',
  // // 'Co-trimoxazole',
  // 'Trimethoprim-sulfamethoxazole',
  // // 'ESBL',
  // 'Ceftriaxone',
  // // 'Fluoroquinolones (CipNS)',
  // 'Ciprofloxacin NS',
  // 'Sulphonamides',
  // 'Tetracyclines',
  // 'Trimethoprim'
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
  'Spectinomycin'
];

// List of Klebsiella drug classes
export const drugClassesKP = ['Carbapenems', 'ESBL'];
