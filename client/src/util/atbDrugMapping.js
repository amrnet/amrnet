// Maps ATB consumption classes (from WHO GLASS / ESAC-Net) to AMRnet drug names
// IMPORTANT: Drug names must match the keys in drugsCountriesData for each organism.
//
// drugsCountriesData keys come from:
//   styphi:       Object.keys(drugClassesRulesST) = Ampicillin/Amoxicillin, Azithromycin, Ceftriaxone, Ciprofloxacin, Chloramphenicol, Sulfonamides, Tetracycline, Trimethoprim
//   kpneumo:      markersDrugsKP = Aminoglycosides, Carbapenems, Ciprofloxacin R, Colistin, ESBL, Fosfomycin, Chloramphenicol, Sulfonamides, Tetracycline, Tigecycline, Trimethoprim, ...
//   ngono:        Object.keys(drugClassesRulesNG) = Azithromycin, Ceftriaxone, Ciprofloxacin, Sulfonamides, Tetracycline, Cefixime, Benzylpenicillin, Spectinomycin
//   ecoli/decoli/shige (statKeysEcoliShige):   Aminoglycosides, Ampicillin, Carbapenems, Chloramphenicol, Ciprofloxacin, Colistin, ESBL, Fosfomycin, Macrolide, Pansusceptible, Tetracycline, Trimethoprim, Trimethoprim-Sulfamethoxazole
//   senterica/sentericaints (statKeysSalmonella): same as above PLUS 'Ciprofloxacin NS' and 'Ciprofloxacin R' (computed, disjoint categories)
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
    'Fluoroquinolones': ['Ciprofloxacin'],
    'Cephalosporins': ['ESBL'],
    'Carbapenems': ['Carbapenems'],
    'Aminoglycosides': ['Aminoglycosides'],
    'Tetracyclines': ['Tetracycline'],
    'Sulfonamides+Trimethoprim': ['Trimethoprim-Sulfamethoxazole'],
    'Penicillins': ['Ampicillin'],
    'Macrolides': ['Macrolide'],
  },
  decoli: {
    'Fluoroquinolones': ['Ciprofloxacin'],
    'Cephalosporins': ['ESBL'],
    'Carbapenems': ['Carbapenems'],
    'Aminoglycosides': ['Aminoglycosides'],
    'Tetracyclines': ['Tetracycline'],
    'Sulfonamides+Trimethoprim': ['Trimethoprim-Sulfamethoxazole'],
    'Penicillins': ['Ampicillin'],
    'Macrolides': ['Macrolide'],
  },
  shige: {
    'Fluoroquinolones': ['Ciprofloxacin'],
    'Cephalosporins': ['ESBL'],
    'Carbapenems': ['Carbapenems'],
    'Macrolides': ['Macrolide'],
    'Tetracyclines': ['Tetracycline'],
    'Sulfonamides+Trimethoprim': ['Trimethoprim-Sulfamethoxazole'],
    'Penicillins': ['Ampicillin'],
  },
  senterica: {
    'Fluoroquinolones': ['Ciprofloxacin NS'],
    'Cephalosporins': ['ESBL'],
    'Carbapenems': ['Carbapenems'],
    'Aminoglycosides': ['Aminoglycosides'],
    'Tetracyclines': ['Tetracycline'],
    'Sulfonamides+Trimethoprim': ['Trimethoprim'],
    'Penicillins': ['Ampicillin'],
    'Macrolides': ['Macrolide'],
  },
  sentericaints: {
    'Fluoroquinolones': ['Ciprofloxacin NS'],
    'Cephalosporins': ['ESBL'],
    'Carbapenems': ['Carbapenems'],
    'Aminoglycosides': ['Aminoglycosides'],
    'Tetracyclines': ['Tetracycline'],
    'Sulfonamides+Trimethoprim': ['Trimethoprim'],
    'Penicillins': ['Ampicillin'],
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
