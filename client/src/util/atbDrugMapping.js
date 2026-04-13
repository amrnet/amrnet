// Maps ATB consumption classes (from WHO GLASS / ESAC-Net) to AMRnet drug names
// IMPORTANT: Drug names must match the keys in drugsCountriesData for each organism.
//
// drugsCountriesData keys come from:
//   styphi:       Object.keys(drugClassesRulesST) = Ampicillin/Amoxicillin, Azithromycin, Ceftriaxone, Ciprofloxacin, Chloramphenicol, Sulfonamides, Tetracycline, Trimethoprim
//   kpneumo:      markersDrugsKP = Aminoglycosides, Carbapenems, Ciprofloxacin R, Colistin, ESBL, Fosfomycin, Chloramphenicol, Sulfonamides, Tetracycline, Tigecycline, Trimethoprim, ...
//   ngono:        Object.keys(drugClassesRulesNG) = Azithromycin, Ceftriaxone, Ciprofloxacin, Sulfonamides, Tetracycline, Cefixime, Benzylpenicillin, Spectinomycin
//   senterica/ints/ecoli/decoli/shige: statKeysECOLI.map(d => d.name) = Aminoglycoside, Beta-lactam, Sulfonamide, Tetracycline, Phenicol, Quinolone, Fosfomycin, Trimethoprim, Macrolide, Lincosamide, Streptothricin, Rifamycin, Colistin, Bleomycin, Trimethoprim-Sulfamethoxazole, Pansusceptible
//   saureus:      statKeysSA.map(d => d.name) = Amikacin, Gentamicin, Tobramycin, Kanamycin, Methicillin, Penicillin, Fusidic Acid, Vancomycin, Clindamycin, Erythromycin, Mupirocin, Linezolid, Tetracycline, Trimethoprim, Daptomycin, Rifampicin, Ciprofloxacin, Moxifloxacin, Teicoplanin
//   strepneumo:   statKeysSP.map(d => d.name) = Chloramphenicol, Clindamycin, Erythromycin, Fluoroquinolone, Kanamycin, Linezolid, Tetracycline, Trimethoprim, Sulfamethoxazole, Co-Trimoxazole

export const atbToAmrnetMapping = {
  styphi: {
    'Fluoroquinolones': ['Ciprofloxacin'],
    'Cephalosporins': ['Ceftriaxone'],
    'Macrolides': ['Azithromycin'],
    'Penicillins': ['Ampicillin/Amoxicillin'],
    'Tetracyclines': ['Tetracycline'],
    'Sulfonamides+Trimethoprim': ['Trimethoprim'],
  },
  kpneumo: {
    'Fluoroquinolones': ['Ciprofloxacin R'],
    'Cephalosporins': ['ESBL'],
    'Carbapenems': ['Carbapenems'],
    'Aminoglycosides': ['Aminoglycosides'],
    'Tetracyclines': ['Tetracycline'],
    'Sulfonamides+Trimethoprim': ['Trimethoprim'],
  },
  ngono: {
    'Fluoroquinolones': ['Ciprofloxacin'],
    'Cephalosporins': ['Ceftriaxone', 'Cefixime'],
    'Macrolides': ['Azithromycin'],
    'Penicillins': ['Benzylpenicillin'],
    'Tetracyclines': ['Tetracycline'],
    'Sulfonamides+Trimethoprim': ['Sulfonamides'],
  },
  ecoli: {
    'Fluoroquinolones': ['Quinolone'],
    'Cephalosporins': ['Beta-lactam'],
    'Aminoglycosides': ['Aminoglycoside'],
    'Tetracyclines': ['Tetracycline'],
    'Sulfonamides+Trimethoprim': ['Trimethoprim-Sulfamethoxazole'],
    'Penicillins': ['Beta-lactam'],
    'Macrolides': ['Macrolide'],
  },
  decoli: {
    'Fluoroquinolones': ['Quinolone'],
    'Cephalosporins': ['Beta-lactam'],
    'Aminoglycosides': ['Aminoglycoside'],
    'Tetracyclines': ['Tetracycline'],
    'Sulfonamides+Trimethoprim': ['Trimethoprim-Sulfamethoxazole'],
    'Penicillins': ['Beta-lactam'],
    'Macrolides': ['Macrolide'],
  },
  shige: {
    'Fluoroquinolones': ['Quinolone'],
    'Cephalosporins': ['Beta-lactam'],
    'Macrolides': ['Macrolide'],
    'Tetracyclines': ['Tetracycline'],
    'Sulfonamides+Trimethoprim': ['Trimethoprim-Sulfamethoxazole'],
    'Penicillins': ['Beta-lactam'],
  },
  senterica: {
    'Fluoroquinolones': ['Quinolone'],
    'Cephalosporins': ['Beta-lactam'],
    'Aminoglycosides': ['Aminoglycoside'],
    'Tetracyclines': ['Tetracycline'],
    'Sulfonamides+Trimethoprim': ['Trimethoprim'],
    'Penicillins': ['Beta-lactam'],
    'Macrolides': ['Macrolide'],
  },
  sentericaints: {
    'Fluoroquinolones': ['Quinolone'],
    'Cephalosporins': ['Beta-lactam'],
    'Aminoglycosides': ['Aminoglycoside'],
    'Tetracyclines': ['Tetracycline'],
    'Sulfonamides+Trimethoprim': ['Trimethoprim'],
    'Penicillins': ['Beta-lactam'],
    'Macrolides': ['Macrolide'],
  },
  saureus: {
    'Penicillins': ['Methicillin', 'Penicillin'],
    'Fluoroquinolones': ['Ciprofloxacin', 'Moxifloxacin'],
    'Macrolides': ['Erythromycin'],
    'Tetracyclines': ['Tetracycline'],
    'Aminoglycosides': ['Gentamicin'],
    'Sulfonamides+Trimethoprim': ['Trimethoprim'],
  },
  strepneumo: {
    'Fluoroquinolones': ['Fluoroquinolones'],
    'Macrolides': ['Erythromycin'],
    'Tetracyclines': ['Tetracycline'],
    'Sulfonamides+Trimethoprim': ['Co-Trimoxazole'],
  },
};

export function getATBClassesForOrganism(organism) {
  return Object.keys(atbToAmrnetMapping[organism] || {});
}

export function getAmrnetDrugsForATBClass(organism, atbClass) {
  return atbToAmrnetMapping[organism]?.[atbClass] || [];
}
