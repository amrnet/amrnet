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
  { value: 'Dominant Genotype', label: 'Dominant Genotype', labelKey: 'dashboard.mapViews.dominantGenotype', organisms: [] },
  {
    value: 'Resistance prevalence',
    label: 'Resistance prevalence',
    labelKey: 'dashboard.mapViews.resistancePrevalence',
    organisms: organismsCards.map(x => x.value),
  },
  {
    value: 'Genotype prevalence',
    label: 'Genotype prevalence',
    labelKey: 'dashboard.mapViews.genotypePrevalence',
    // shige uses 'ST prevalence' instead (its GENOTYPE field is the 7-locus ST).
    organisms: organismsCards
      .map(x => x.value)
      .filter(x => !['sentericaints', 'kpneumo', 'senterica', 'shige'].includes(x)),
  },
  {
    value: 'ST prevalence',
    label: 'ST prevalence',
    labelKey: 'dashboard.mapViews.stPrevalence',
    // shige's GENOTYPE is the 7-locus MLST ST, so it shows 'ST prevalence'
    // (same GENOTYPE-column rendering as kpneumo).
    organisms: ['kpneumo', 'shige'],
  },
  {
    value: 'Lineage prevalence (ST)',
    label: 'Lineage prevalence (ST)',
    labelKey: 'dashboard.mapViews.lineagePrevalence',
    organisms: ['sentericaints', 'senterica'],
  },
  {
    // shige: the genotype mapped from the LINcode (not the LINcode itself), so
    // it is presented as 'Genotype prevalence'. The internal value is kept as
    // 'Lincode prevalence' because it keys the LINCODE_NUM stats column.
    value: 'Lincode prevalence',
    label: 'Genotype prevalence',
    labelKey: 'dashboard.mapViews.genotypePrevalence',
    organisms: ['shige'],
  },
  {
    // shige: named LINcode alias (populated for S. sonnei only)
    value: 'Lincode alias prevalence',
    label: 'Lincode alias prevalence',
    labelKey: 'dashboard.mapViews.lincodeAliasPrevalence',
    organisms: ['shige'],
  },
  // { value: 'H58 / Non-H58', label: 'H58 genotype', organisms: [''] },
  { value: 'NG-MAST prevalence', label: 'NG-MAST prevalence', labelKey: 'dashboard.mapViews.ngMastPrevalence', organisms: ['ngono'] },
  {
    value: 'Serotype prevalence',
    label: 'ST Prevalence (7-locus MLST)',
    labelKey: 'dashboard.mapViews.serotypePrevalence',
    organisms: ['senterica'],
  },
  {
    value: 'Pathotype prevalence',
    label: 'Pathotype prevalence',
    labelKey: 'dashboard.mapViews.pathotypePrevalence',
    organisms: ['ecoli', 'decoli'],
  },
  {
    // shige removed per review — O/H prevalence are not shown on the Shigella map.
    value: 'O prevalence',
    label: 'O prevalence',
    labelKey: 'dashboard.mapViews.oPrevalence',
    organisms: ['ecoli', 'decoli'],
  },
  {
    value: 'H prevalence',
    label: 'H prevalence',
    labelKey: 'dashboard.mapViews.hPrevalence',
    organisms: ['ecoli', 'decoli'],
  },
  {
    value: 'No. Samples',
    label: 'No. Samples',
    labelKey: 'dashboard.mapViews.sampleCount',
    organisms: organismsCards.map(x => x.value),
  },
];
