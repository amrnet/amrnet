// List of legends for the map and in which organisms they appear
export const mapLegends = [
  { value: 'MDR', label: 'Multidrug resistant (MDR)', organisms: ['styphi'] },
  { value: 'XDR', label: 'Extensively drug resistant (XDR)', organisms: ['styphi'] },
  { value: 'AzithR', label: 'Azithromycin resistant', organisms: ['styphi'] },
  { value: 'CipNS', label: 'Ciprofloxacin non-susceptible (CipNS)', organisms: ['styphi'] },
  { value: 'CipR', label: 'Ciprofloxacin resistant (CipR)', organisms: ['styphi', 'ngono'] },
  { value: 'ESBL', label: 'ESBL', organisms: ['kpneumo'] },
  { value: 'ESBL_category', label: 'Ceftriaxone resistant', organisms: ['styphi', 'ngono']},
  { value: 'Carb', label: 'Carbapenems', organisms: ['kpneumo'] },
  { value: 'Sensitive to all drugs', label: 'Sensitive to all drugs', organisms: ['styphi', 'kpneumo', 'ngono'] },
  { value: 'Dominant Genotype', label: 'Dominant Genotype', organisms: [] },
  { value: 'Genotype prevalence', label: 'Genotype prevalence', organisms: ['styphi', 'kpneumo', 'ngono', 'ecoli','decoli', 'shige', 'senterica', 'sentericaints'] },
  { value: 'H58 / Non-H58', label: 'H58 genotype', organisms: ['styphi'] },
  { value: 'No. Samples', label: 'No. Samples', organisms: ['styphi', 'kpneumo', 'ngono', 'ecoli', 'shige', 'senterica', 'decoli','sentericaints'] },
  { value: 'Resistance prevalence', label: 'Resistance prevalence', organisms: [] },
  { value: 'NG-MAST prevalence', label: 'NG-MAST prevalence', organisms: ['ngono'] },
];
