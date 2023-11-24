// List of legends for the map and in which organisms they appear
export const mapLegends = [
  { value: 'MDR', label: 'Multidrug resistant (MDR)', organisms: ['typhi'] },
  { value: 'XDR', label: 'Extensively drug resistant (XDR)', organisms: ['typhi'] },
  { value: 'AzithR', label: 'Azithromycin resistant', organisms: ['typhi'] },
  { value: 'CipNS', label: 'Ciprofloxacin non-susceptible (CipNS)', organisms: ['typhi'] },
  { value: 'CipR', label: 'Ciprofloxacin resistant (CipR)', organisms: ['typhi'] },
  { value: 'ESBL', label: 'ESBL', organisms: ['klebe'] },
  { value: 'Carb', label: 'Carbapenems', organisms: ['klebe'] },
  { value: 'Sensitive to all drugs', label: 'Sensitive to all drugs', organisms: ['typhi', 'klebe', 'gono', 'pneumo'] },
  { value: 'Dominant Genotype', label: 'Dominant Genotype', organisms: ['typhi', 'klebe', 'gono', 'pneumo'] },
  { value: 'H58 / Non-H58', label: 'H58 genotype', organisms: ['typhi'] },
  { value: 'No. Samples', label: 'No. Samples', organisms: ['typhi', 'klebe', 'gono', 'pneumo'] }
];
