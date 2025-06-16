import { organismsCards } from './organismsCards';

// List of legends for the map and in which organisms they appear
export const mapLegends = [
  // {
  //   value: 'MDR',
  //   label: 'Multidrug resistant (MDR)',
  //   organisms: [ 'ngono' /*, 'ecoli', 'shige', 'senterica', 'decoli', 'sentericaints'*/],
  // },
  // {
  //   value: 'XDR',
  //   label: 'Extensively drug resistant (XDR)',
  //   organisms: [ 'ngono' /*, 'ecoli', 'shige', 'senterica', 'decoli', 'sentericaints'*/],
  // },
  // { value: 'AzithR', label: 'Azithromycin resistant', organisms: [ ...amrLikeOrganisms] },
  // { value: 'CipNS', label: 'Ciprofloxacin non-susceptible (CipNS)', organisms: [] },
  // { value: 'CipR', label: 'Ciprofloxacin resistant (CipR)', organisms: [ ...amrLikeOrganisms] },
  // {
  //   value: 'ESBL',
  //   label: 'ESBL prevalence',
  //   organisms: ['kpneumo' /*, 'ecoli', 'shige', 'senterica', 'decoli'*/],
  // },
  // { value: 'ESBL_category', label: 'Ceftriaxone resistant', organisms: [] },
  // { value: 'Ceftriaxone', label: 'Ceftriaxone resistant', organisms: ['ngono', ...amrLikeOrganisms] },
  // { value: 'Azithromycin', label: 'Azithromycin resistant', organisms: ['ngono'] },
  // { value: 'Ciprofloxacin', label: 'Ciprofloxacin resistant', organisms: ['ngono'] },
  // {
  //   value: 'Carb',
  //   label: 'Carbapenemase prevalence',
  //   organisms: ['kpneumo' /*, 'ecoli', 'shige', 'decoli'*/],
  // },
  // {
  //   value: 'Pansusceptible',
  //   label: 'Pansusceptible',
  //   organisms: [ ...amrLikeOrganisms],
  // },
  // { value: 'Pansusceptible', label: 'Pansusceptible', organisms: ['ngono'] },
  { value: 'Dominant Genotype', label: 'Dominant Genotype', organisms: [] },
  {
    value: 'Genotype prevalence',
    label: 'Genotype prevalence',
    organisms: organismsCards.map((x) => x.value).filter((x) => !['sentericaints', 'kpneumo'].includes(x)),
  },
  {
    value: 'ST prevalence',
    label: 'ST prevalence',
    organisms: ['kpneumo'],
  },
  {
    value: 'Resistance prevalence',
    label: 'Resistance prevalence',
    organisms: organismsCards.map((x) => x.value),
  },
  {
    value: 'Lineage prevalence',
    label: 'Lineage prevalence',
    organisms: ['sentericaints'],
  },
  // { value: 'H58 / Non-H58', label: 'H58 genotype', organisms: [''] },
  { value: 'NG-MAST prevalence', label: 'NG-MAST prevalence', organisms: ['ngono'] },
  {
    value: 'No. Samples',
    label: 'No. Samples',
    organisms: organismsCards.map((x) => x.value),
  },
];
