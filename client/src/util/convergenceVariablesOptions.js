export const variablesOptions = [
  { label: 'Country', value: 'COUNTRY_ONLY' },
  { label: 'Year', value: 'DATE' },
  { label: 'ST (7-locus MLST)', value: 'GENOTYPE', graph: true, mapValue: 'GENOTYPE' },
  { label: 'cgST (core genome MLST)', value: 'cgST', graph: true, mapValue: 'CGST' },
  { label: 'Sublineage', value: 'Sublineage', graph: true, mapValue: 'SUBLINEAGE' },
  // { label: 'Host', value: 'Host' },
  // { label: 'Bla_Carb_acquired', value: 'Bla_Carb_acquired' },
  // { label: 'Bla_ESBL_acquired', value: 'Bla_ESBL_acquired' }
];
export const variableGraphOptions = variablesOptions.filter(x => x.graph);

export const variablesOptionsNG = [
  { label: 'NG-MAST', value: 'NG-MAST TYPE', graph: true, mapValue: 'NGMAST' },
  { label: 'Genotype', value: 'GENOTYPE', graph: true, mapValue: 'GENOTYPE' },
];
export const variableGraphOptionsNG = variablesOptionsNG.filter(x => x.graph);
