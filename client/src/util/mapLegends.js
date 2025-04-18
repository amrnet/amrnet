// List of legends for the map and in which organisms they appear
export const mapLegends = [
  {
    value: 'MDR',
    label: 'Multidrug resistant (MDR)',
    organisms: ['styphi', 'ngono' /*, 'ecoli', 'shige', 'senterica', 'decoli', 'sentericaints'*/],
  },
  {
    value: 'XDR',
    label: 'Extensively drug resistant (XDR)',
    organisms: ['styphi', 'ngono' /*, 'ecoli', 'shige', 'senterica', 'decoli', 'sentericaints'*/],
  },
  { value: 'AzithR', label: 'Azithromycin resistant', organisms: ['styphi', 'sentericaints', 'shige'] },
  { value: 'CipNS', label: 'Ciprofloxacin non-susceptible (CipNS)', organisms: ['styphi'] },
  { value: 'CipR', label: 'Ciprofloxacin resistant (CipR)', organisms: ['styphi', 'sentericaints', 'shige'] },
  {
    value: 'ESBL',
    label: 'ESBL prevalence',
    organisms: ['kpneumo' /*, 'ecoli', 'shige', 'senterica', 'decoli'*/],
  },
  { value: 'ESBL_category', label: 'Ceftriaxone resistant', organisms: ['styphi'] },
  { value: 'Ceftriaxone', label: 'Ceftriaxone resistant', organisms: ['ngono', 'sentericaints', 'shige'] },
  { value: 'Azithromycin', label: 'Azithromycin resistant', organisms: ['ngono'] },
  { value: 'Ciprofloxacin', label: 'Ciprofloxacin resistant', organisms: ['ngono'] },
  {
    value: 'Carb',
    label: 'Carbapenemase prevalence',
    organisms: ['kpneumo' /*, 'ecoli', 'shige', 'decoli'*/],
  },
  {
    value: 'Pansusceptible',
    label: 'Pansusceptible',
    organisms: ['styphi', 'kpneumo', 'ecoli', 'shige', 'senterica', 'decoli', 'sentericaints'],
  },
  { value: 'Pansusceptible', label: 'Pansusceptible to class I/II drugs', organisms: ['ngono'] },
  { value: 'Dominant Genotype', label: 'Dominant Genotype', organisms: [] },
  {
    value: 'Genotype prevalence',
    label: 'Genotype prevalence',
    organisms: ['styphi', 'ngono' /*, 'ecoli', 'senterica'*/],
  },
  {
    value: 'ST prevalence',
    label: 'ST prevalence',
    organisms: ['kpneumo'],
  },
  {
    value: 'Resistance prevalence',
    label: 'Resistance prevalence',
    organisms: ['styphi', 'kpneumo', 'ngono', 'sentericaints', 'shige'],
  },
  {
    value: 'Lineage prevalence',
    label: 'Lineage prevalence',
    organisms: ['shige', 'decoli', 'sentericaints', 'shige'],
  },
  { value: 'H58 / Non-H58', label: 'H58 genotype', organisms: ['styphi'] },
  { value: 'NG-MAST prevalence', label: 'NG-MAST prevalence', organisms: ['ngono'] },
  {
    value: 'No. Samples',
    label: 'No. Samples',
    organisms: ['styphi', 'kpneumo', 'ngono', 'ecoli', 'shige', 'senterica', 'decoli', 'sentericaints', 'shige'],
  },
];
