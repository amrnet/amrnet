// List of legends for the map and in which organisms they appear
export const mapLegends = [
  // {
  //   value: 'MDR',
  //   label: 'Multidrug resistant (MDR)',
  //   organisms: ['', 'ngono', 'ecoli', 'shige', 'senterica', 'decoli' /*'sentericaints'*/],
  // },
  // {
  //   value: 'XDR',
  //   label: 'Extensively drug resistant (XDR)',
  //   organisms: ['', 'ngono', 'ecoli', 'shige', 'senterica', 'decoli' /*'sentericaints'*/],
  // },
  // { value: 'AzithR', label: 'Azithromycin resistant', organisms: ['', 'sentericaints'] },
  // { value: 'CipNS', label: 'Ciprofloxacin NS non-susceptible (CipNS)', organisms: [''] },
  // { value: 'CipR', label: 'Ciprofloxacin resistant (CipR)', organisms: ['', 'sentericaints'] },
  {
    value: 'ESBL',
    label: 'ESBL prevalence',
    organisms: [ '', 'shige', 'senterica', 'decoli'],
  },
  // { value: 'ESBL_category', label: 'Ceftriaxone resistant', organisms: ['All'] },
  // { value: 'Ceftriaxone', label: 'Ceftriaxone resistant', organisms: ['ngono', 'sentericaints'] },
  // { value: 'Azithromycin', label: 'Azithromycin resistant', organisms: ['ngono'] },
  // { value: 'Ciprofloxacin', label: 'Ciprofloxacin resistant', organisms: ['ngono'] },
  {
    value: 'Carb',
    label: 'Carbapenemase prevalence',
    organisms: [ 'ecoli'],
  },
  // {
  //   value: 'Pansusceptible',
  //   label: 'Pansusceptible',
  //   organisms: ['', 'ecoli', 'shige', 'senterica', 'decoli', 'sentericaints'],
  // },
  // { value: 'Pansusceptible', label: 'Pansusceptible', organisms: ['ngono'] },
  { value: 'Dominant Genotype', label: 'Dominant Genotype', organisms: [] },
  {
    value: 'Genotype prevalence',
    label: 'Genotype prevalence',
    organisms: ['styphi', 'ngono', 'ecoli', 'senterica'],
  },
  {
    value: 'ST prevalence',
    label: 'ST prevalence',
    organisms: ['kpneumo'],
  },
  {
    value: 'Resistance prevalence',
    label: 'Resistance prevalence',
    organisms: ['styphi', 'kpneumo', 'ngono', 'sentericaints'],
  },
  { value: 'Lineage prevalence', label: 'Lineage prevalence', organisms: ['shige', 'decoli', 'sentericaints'] },
  { value: 'H58 / Non-H58', label: 'H58 genotype', organisms: [''] },
  { value: 'NG-MAST prevalence', label: 'NG-MAST prevalence', organisms: ['ngono'] },
  {
    value: 'No. Samples',
    label: 'No. Samples',
    organisms: ['styphi', 'kpneumo', 'ngono', 'ecoli', 'shige', 'senterica', 'decoli', 'sentericaints'],
  },
];
