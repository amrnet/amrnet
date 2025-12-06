// Drug rules for Salmonella, where the column has to have one of the values to validate the rule. For frequencies and
// drug resistance graphs
export const drugRulesST = [
  { key: 'Ampicillin/Amoxicillin', columnID: 'blaTEM-1D', values: ['1'] },
  { key: 'Azithromycin', columnID: 'azith_pred_pheno', values: ['AzithR'] },
  { key: 'Chloramphenicol', columnID: 'chloramphenicol_category', values: ['ChlR'] },
  { key: 'Trimethoprim-sulfamethoxazole', columnID: 'co_trim', values: ['1'] },
  { key: 'Ceftriaxone', columnID: 'ESBL_category', values: ['ESBL'] },
  {
    key: 'Ciprofloxacin',
    columnID: 'cip_pred_pheno',
    values: ['CipNS'],
    legends: 'Ciprofloxacin (non-susceptible)',
  },
  { key: 'Ciprofloxacin R', columnID: 'cip_pred_pheno', values: ['CipR'], legends: 'Ciprofloxacin (resistant)' },
  { key: 'Sulfonamides', columnID: 'sul_any', values: ['1'] },
  { key: 'Tetracycline', columnID: 'tetracycline_category', values: ['TetR'] },
  { key: 'Trimethoprim', columnID: 'dfra_any', values: ['1'] },
  { key: 'MDR', columnID: 'MDR', values: ['MDR'], legends: 'Multidrug resistant (MDR)' },
  { key: 'XDR', columnID: 'XDR', values: ['XDR'], legends: 'Extensively drug resistant (XDR)' },
  { key: 'Pansusceptible', columnID: 'amr_category', values: ['No AMR detected'] },
];

export const statKeysST = [
  { name: 'Ampicillin/Amoxicillin', column: 'blaTEM-1D', key: '1', resistanceView: true },
  { name: 'Azithromycin', column: 'azith_pred_pheno', key: 'AzithR', resistanceView: true },
  { name: 'Ceftriaxone', column: 'ESBL_category', key: 'ESBL', resistanceView: true },
  { name: 'Chloramphenicol', column: 'chloramphenicol_category', key: 'ChlR', resistanceView: true },
  { name: 'CipNS', column: 'cip_pred_pheno', key: 'CipNS', resistanceView: true },
  { name: 'CipR', column: 'cip_pred_pheno', key: 'CipR', resistanceView: true },
  { name: 'XDR', column: 'XDR', key: 'XDR', resistanceView: true },
  { name: 'H58', column: 'GENOTYPE_SIMPLE', key: 'H58' },
  { name: 'MDR', column: 'MDR', key: 'MDR', resistanceView: true },
  { name: 'Sulfonamides', column: 'sul_any', key: '1', resistanceView: true },
  { name: 'Tetracycline', column: 'tetracycline_category', key: 'TetR', resistanceView: true },
  { name: 'Trimethoprim', column: 'dfra_any', key: '1', resistanceView: true },
  { name: 'Trimethoprim-sulfamethoxazole', column: 'co_trim', key: '1', resistanceView: true },
  { name: 'Pansusceptible', column: 'amr_category', key: 'No AMR detected', resistanceView: true },
];

// Drug rules for Klebsiella, where the column has to be any value other than '-' to validate the rule. For frequencies
// and drug resistance graphs
export const drugRulesKP = [
  { key: 'Aminoglycosides', columnIDs: ['AGly_acquired'] },
  { key: 'Carbapenems', columnIDs: ['Bla_Carb_acquired'] },
  { key: 'ESBL', columnIDs: ['Bla_ESBL_acquired', 'Bla_Carb_acquired', 'Bla_ESBL_inhR_acquired'] },
  { key: 'Ciprofloxacin R', columnIDs: ['Flq_acquired', 'Flq_mutations'] },
  { key: 'Colistin', columnIDs: ['Col_acquired', 'Col_mutations'] },
  { key: 'Fosfomycin', columnIDs: ['Fcyn_acquired'] },
  { key: 'Chloramphenicol', columnIDs: ['Phe_acquired'] },
  { key: 'Sulfonamides', columnIDs: ['Sul_acquired'] },
  { key: 'Tetracycline', columnIDs: ['Tet_acquired'] },
  { key: 'Tigecycline', columnIDs: ['Tgc_acquired'] },
  { key: 'Trimethoprim', columnIDs: ['Tmt_acquired'] },
  { key: 'Trimethoprim-sulfamethoxazole', columnIDs: ['Tmt_acquired', 'Sul_acquired'], every: true },
];

export const drugRulesKPOnlyMarkers = [
  { key: 'SHV mutations', columnIDs: ['SHV_mutations'] },
  { key: 'Porin mutations', columnIDs: ['Omp_mutations'] },
];

export const statKeysKP = [
  { name: 'Aminoglycosides', column: 'AGly_acquired', key: '-', resistanceView: true },
  { name: 'Carbapenems', column: 'Bla_Carb_acquired', key: '-', resistanceView: true },
  { name: 'Colistin', column: ['Col_acquired', 'Col_mutations'], key: '-', resistanceView: true },
  { name: 'Ciprofloxacin R', column: ['Flq_acquired', 'Flq_mutations'], key: '-', resistanceView: true },
  {
    name: 'ESBL',
    column: ['Bla_ESBL_acquired', 'Bla_Carb_acquired', 'Bla_ESBL_inhR_acquired'],
    key: '-',
    resistanceView: true,
  },
  { name: 'Fosfomycin', column: 'Fcyn_acquired', key: '-', resistanceView: true },
  { name: 'Chloramphenicol', column: 'Phe_acquired', key: '-', resistanceView: true },
  { name: 'Sulfonamides', column: 'Sul_acquired', key: '-', resistanceView: true },
  { name: 'Tetracycline', column: 'Tet_acquired', key: '-', resistanceView: true },
  { name: 'Tigecycline', column: 'Tgc_acquired', key: '-', resistanceView: true },
  { name: 'Trimethoprim', column: 'Tmt_acquired', key: '-', resistanceView: true },
  { name: 'Trimethoprim-sulfamethoxazole', column: ['Tmt_acquired', 'Sul_acquired'], key: '-', resistanceView: true },
  { name: 'Pansusceptible', column: 'num_resistance_classes', key: '0', resistanceView: true },
];

export const statKeysKPOnlyMarkers = [
  { name: 'SHV mutations', column: 'SHV_mutations', key: '-' },
  { name: 'Porin mutations', column: 'Omp_mutations', key: '-' },
];

export const drugRulesNG = [
  { key: 'Azithromycin', columnID: ['Azithromycin'], values: ['1'] },
  { key: 'Ceftriaxone', columnID: ['CefR1'], values: ['1'] },
  { key: 'Ciprofloxacin', columnID: ['Ciprofloxacin'], values: ['1'] },
  { key: 'Sulfonamides', columnID: ['Sulfonamides'], values: ['1'] },
  { key: 'Tetracycline', columnID: ['Tetracycline'], values: ['1'] },
  { key: 'Cefixime', columnID: ['Cefixime'], values: ['1'] },
  { key: 'Benzylpenicillin', columnID: ['Penicillin'], values: ['1'] },
  { key: 'Pansusceptible', columnID: ['Susceptible'], values: ['1'], legends: 'Susceptible to cat I/II drugs' },
  { key: 'Spectinomycin', columnID: ['Spectinomycin'], values: ['1'] },
  // { key: 'MDR', columnID: 'MDR', values: ['1'], legends: 'Multidrug resistant (MDR)' },
  // { key: 'XDR', columnID: 'XDR', values: ['1'], legends: 'Extensively drug resistant (XDR)' },
];

export const drugRulesMDRXDR_NG = {
  MDR: [
    {
      columns: ['Azithromycin', 'Ceftriaxone', 'Cefixime'],
      value: 1,
      matches: 1,
    },
    {
      columns: ['Ciprofloxacin', 'Spectinomycin', 'Penicillin'],
      value: 1,
      matches: 2,
    },
  ],
  XDR: [
    {
      columns: ['Azithromycin', 'Ceftriaxone', 'Cefixime'],
      value: 1,
      matches: 1,
    },
    {
      columns: ['Ciprofloxacin', 'Spectinomycin', 'Penicillin'],
      value: 1,
      matches: 3,
    },
  ],
};

export const statKeysNG = [
  { name: 'Azithromycin', column: 'Azithromycin', key: '1', resistanceView: true },
  { name: 'Benzylpenicillin', column: 'Penicillin', key: '1', resistanceView: true },
  { name: 'Cefixime', column: 'Cefixime', key: '1', resistanceView: true },
  { name: 'Ceftriaxone', column: 'CefR1', key: '1', resistanceView: true },
  { name: 'Ciprofloxacin', column: 'Ciprofloxacin', key: '1', resistanceView: true },
  // { name: 'XDR', column: 'XDR', key: '1', resistanceView: true },
  // { name: 'MDR', column: 'MDR', key: '1', resistanceView: true },
  { name: 'Spectinomycin', column: 'Spectinomycin', key: '1', resistanceView: true },
  { name: 'Sulfonamides', column: 'Sulfonamides', key: '1', resistanceView: true },
  { name: 'Tetracycline', column: 'Tetracycline', key: '1', resistanceView: true },
  { name: 'Susceptible', column: 'Susceptible', key: '1', resistanceView: true },
];

// Salmonella Typhi drug classes rules for determinants graph
export const drugClassesRulesSTHeatMap = {
  'Ampicillin/Amoxicillin': [
    {
      name: 'blaTEM-1D',
      susceptible: false,
      rules: [{ columnID: 'blaTEM-1D', value: '1' }],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'blaTEM-1D', value: '0' }],
    },
  ],
  Azithromycin: [
    // {
    //   name: 'acrB_R717Q + acrB_R717L',
    //   susceptible: false,
    //   rules: [
    //     { columnID: 'azith_pred_pheno', value: 'AzithR' },
    //     { columnID: 'acrB_R717Q', value: '1' },
    //     { columnID: 'acrB_R717L', value: '1' },
    //   ],
    // },
    {
      name: 'acrB_R717Q',
      susceptible: false,
      rules: [
        // { columnID: 'azith_pred_pheno', value: 'AzithR' },
        { columnID: 'acrB_R717Q', value: '1' },
        // { columnID: 'acrB_R717L', value: '0' },
      ],
    },
    {
      name: 'acrB_R717L',
      susceptible: false,
      rules: [
        // { columnID: 'azith_pred_pheno', value: 'AzithR' },
        { columnID: 'acrB_R717L', value: '1' },
        // { columnID: 'acrB_R717Q', value: '0' },
      ],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'azith_pred_pheno', value: 'AzithS' }],
    },
  ],
  Chloramphenicol: [
    // {
    //   name: 'catA1 + cmlA',
    //   susceptible: false,
    //   rules: [
    //     { columnID: 'chloramphenicol_category', value: 'ChlR' },
    //     { columnID: 'catA1', value: '1' },
    //     { columnID: 'cmlA', value: '1' },
    //   ],
    // },
    {
      name: 'catA1',
      susceptible: false,
      rules: [
        { columnID: 'chloramphenicol_category', value: 'ChlR' },
        { columnID: 'catA1', value: '1' },
        // { columnID: 'cmlA', value: '0' },
      ],
    },
    {
      name: 'cmlA',
      susceptible: false,
      rules: [
        { columnID: 'chloramphenicol_category', value: 'ChlR' },
        { columnID: 'cmlA', value: '1' },
        // { columnID: 'catA1', value: '0' },
      ],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'chloramphenicol_category', value: 'ChlS' }],
    },
  ],
  // 'Co-trimoxazole': [
  // 'Trimethoprim-sulfamethoxazole': [
  //   {
  //     name: 'dfrA7 + dfrA14 + sul1 + sul2',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA7', value: '1' },
  //       { columnID: 'dfrA14', value: '1' },
  //       { columnID: 'sul1', value: '1' },
  //       { columnID: 'sul2', value: '1' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA7 + sul1 + sul2',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA7', value: '1' },
  //       { columnID: 'dfrA14', value: '0' },
  //       { columnID: 'sul1', value: '1' },
  //       { columnID: 'sul2', value: '1' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA7 + sul1',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA7', value: '1' },
  //       { columnID: 'dfrA14', value: '0' },
  //       { columnID: 'sul1', value: '1' },
  //       { columnID: 'sul2', value: '0' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA7 + sul2',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA7', value: '1' },
  //       { columnID: 'dfrA14', value: '0' },
  //       { columnID: 'sul1', value: '0' },
  //       { columnID: 'sul2', value: '1' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA14 + sul1 + sul2',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA7', value: '0' },
  //       { columnID: 'dfrA14', value: '1' },
  //       { columnID: 'sul1', value: '1' },
  //       { columnID: 'sul2', value: '1' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA14 + sul1',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA7', value: '0' },
  //       { columnID: 'dfrA14', value: '1' },
  //       { columnID: 'sul1', value: '1' },
  //       { columnID: 'sul2', value: '0' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA14 + sul2',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA7', value: '0' },
  //       { columnID: 'dfrA14', value: '1' },
  //       { columnID: 'sul1', value: '0' },
  //       { columnID: 'sul2', value: '1' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA1 + sul1 + sul2',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA1', value: '1' },
  //       { columnID: 'sul1', value: '1' },
  //       { columnID: 'sul2', value: '1' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA1 + sul1',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA1', value: '1' },
  //       { columnID: 'sul1', value: '1' },
  //       { columnID: 'sul2', value: '0' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA1 + sul2',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA1', value: '1' },
  //       { columnID: 'sul1', value: '0' },
  //       { columnID: 'sul2', value: '1' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA5 + sul1 + sul2',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA5', value: '1' },
  //       { columnID: 'sul1', value: '1' },
  //       { columnID: 'sul2', value: '1' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA5 + sul1',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA5', value: '1' },
  //       { columnID: 'sul1', value: '1' },
  //       { columnID: 'sul2', value: '0' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA5 + sul2',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA5', value: '1' },
  //       { columnID: 'sul1', value: '0' },
  //       { columnID: 'sul2', value: '1' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA15 + sul1 + sul2',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA15', value: '1' },
  //       { columnID: 'sul1', value: '1' },
  //       { columnID: 'sul2', value: '1' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA15 + sul1',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA15', value: '1' },
  //       { columnID: 'sul1', value: '1' },
  //       { columnID: 'sul2', value: '0' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA15 + sul2',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA15', value: '1' },
  //       { columnID: 'sul1', value: '0' },
  //       { columnID: 'sul2', value: '1' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA17 + sul1 + sul2',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA17', value: '1' },
  //       { columnID: 'sul1', value: '1' },
  //       { columnID: 'sul2', value: '1' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA17 + sul1',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA17', value: '1' },
  //       { columnID: 'sul1', value: '1' },
  //       { columnID: 'sul2', value: '0' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA17 + sul2',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA17', value: '1' },
  //       { columnID: 'sul1', value: '0' },
  //       { columnID: 'sul2', value: '1' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA18 + sul1 + sul2',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA18', value: '1' },
  //       { columnID: 'sul1', value: '1' },
  //       { columnID: 'sul2', value: '1' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA18 + sul1',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA18', value: '1' },
  //       { columnID: 'sul1', value: '1' },
  //       { columnID: 'sul2', value: '0' },
  //     ],
  //   },
  //   {
  //     name: 'dfrA18 + sul2',
  //     susceptible: false,
  //     rules: [
  //       { columnID: 'co_trim', value: '1' },
  //       { columnID: 'dfrA18', value: '1' },
  //       { columnID: 'sul1', value: '0' },
  //       { columnID: 'sul2', value: '1' },
  //     ],
  //   },
  //   {
  //     name: 'None',
  //     susceptible: true,
  //     rules: [{ columnID: 'co_trim', value: '0' }],
  //   },
  // ],
  Ceftriaxone: [
    {
      name: 'blaCTX-M-15',
      susceptible: false,
      rules: [
        { columnID: 'ESBL_category', value: 'ESBL' },
        { columnID: 'blaCTX-M-15_23', value: '1' },
      ],
    },
    {
      name: 'blaOXA-7',
      susceptible: false,
      rules: [
        { columnID: 'ESBL_category', value: 'ESBL' },
        { columnID: 'blaOXA-7', value: '1' },
      ],
    },
    {
      name: 'blaSHV-12',
      susceptible: false,
      rules: [
        { columnID: 'ESBL_category', value: 'ESBL' },
        { columnID: 'blaSHV-12', value: '1' },
      ],
    },
    {
      name: 'blaCTX-M-55',
      susceptible: false,
      rules: [
        { columnID: 'ESBL_category', value: 'ESBL' },
        { columnID: 'blaCTX-M-55', value: '1' },
      ],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'ESBL_category', value: 'Non-ESBL' }],
    },
  ],
  // 'Fluoroquinolones (CipNS)': [
  Ciprofloxacin: [
    {
      name: 'qnrS',
      susceptible: false,
      rules: [{ columnID: 'qnrS', value: '1' }],
    },
    {
      name: 'qnrB',
      susceptible: false,
      rules: [{ columnID: 'qnrB', value: '1' }],
    },
    {
      name: 'qnrD',
      susceptible: false,
      rules: [{ columnID: 'qnrD', value: '1' }],
    },
    {
      name: 'gyrA_D87G',
      susceptible: false,
      rules: [{ columnID: 'gyrA_D87G', value: '1' }],
    },
    {
      name: 'gyrA_D87N',
      susceptible: false,
      rules: [{ columnID: 'gyrA_D87N', value: '1' }],
    },
    {
      name: 'gyrA_D87V',
      susceptible: false,
      rules: [{ columnID: 'gyrA_D87V', value: '1' }],
    },
    {
      name: 'gyrA_D87Y',
      susceptible: false,
      rules: [{ columnID: 'gyrA_D87Y', value: '1' }],
    },
    {
      name: 'gyrA_D87A',
      susceptible: false,
      rules: [{ columnID: 'gyrA_D87A', value: '1' }],
    },
    {
      name: 'gyrA_S83F',
      susceptible: false,
      rules: [{ columnID: 'gyrA_S83F', value: '1' }],
    },
    {
      name: 'gyrA_S83Y',
      susceptible: false,
      rules: [{ columnID: 'gyrA_S83Y', value: '1' }],
    },
    {
      name: 'gyrB_S464F',
      susceptible: false,
      rules: [{ columnID: 'gyrB_S464F', value: '1' }],
    },
    {
      name: 'parC_S80I',
      susceptible: false,
      rules: [{ columnID: 'parC_S80I', value: '1' }],
    },
    {
      name: 'parC_S80R',
      susceptible: false,
      rules: [{ columnID: 'parC_S80R', value: '1' }],
    },
    {
      name: 'parC_E84G',
      susceptible: false,
      rules: [{ columnID: 'parC_E84G', value: '1' }],
    },
    {
      name: 'parC_E84K',
      susceptible: false,
      rules: [{ columnID: 'parC_E84K', value: '1' }],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [
        { columnID: 'qnrS', value: '0' },
        { columnID: 'qnrB', value: '0' },
        { columnID: 'qnrD', value: '0' },
        { columnID: 'gyrA_D87G', value: '0' },
        { columnID: 'gyrA_D87N', value: '0' },
        { columnID: 'gyrA_D87V', value: '0' },
        { columnID: 'gyrA_D87Y', value: '0' },
        { columnID: 'gyrA_D87A', value: '0' },
        { columnID: 'gyrA_S83F', value: '0' },
        { columnID: 'gyrA_S83Y', value: '0' },
        { columnID: 'gyrB_S464F', value: '0' },
        { columnID: 'parC_S80I', value: '0' },
        { columnID: 'parC_S80R', value: '0' },
        { columnID: 'parC_E84G', value: '0' },
        { columnID: 'parC_E84K', value: '0' },
      ],
    },
  ],
  Sulfonamides: [
    // {
    //   name: 'sul1 + sul2',
    //   susceptible: false,
    //   rules: [
    //     { columnID: 'sul_any', value: '1' },
    //     { columnID: 'sul1', value: '1' },
    //     { columnID: 'sul2', value: '1' },
    //   ],
    // },
    {
      name: 'sul1',
      susceptible: false,
      rules: [
        // { columnID: 'sul_any', value: '1' },
        { columnID: 'sul1', value: '1' },
        // { columnID: 'sul2', value: '0' },
      ],
    },
    {
      name: 'sul2',
      susceptible: false,
      rules: [
        // { columnID: 'sul_any', value: '1' },
        { columnID: 'sul2', value: '1' },
        // { columnID: 'sul1', value: '0' },
      ],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'sul_any', value: '0' }],
    },
  ],
  Tetracycline: [
    {
      name: 'tetA(A)',
      susceptible: false,
      rules: [
        // { columnID: 'tetracycline_category', value: 'TetR' },
        { columnID: 'tetA(A)', value: '1' },
      ],
    },
    {
      name: 'tetA(B)',
      susceptible: false,
      rules: [
        // { columnID: 'tetracycline_category', value: 'TetR' },
        { columnID: 'tetA(B)', value: '1' },
      ],
    },
    {
      name: 'tetA(C)',
      susceptible: false,
      rules: [
        // { columnID: 'tetracycline_category', value: 'TetR' },
        { columnID: 'tetA(C)', value: '1' },
      ],
    },
    {
      name: 'tetA(D)',
      susceptible: false,
      rules: [
        // { columnID: 'tetracycline_category', value: 'TetR' },
        { columnID: 'tetA(D)', value: '1' },
      ],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'tetracycline_category', value: 'TetS' }],
    },
  ],
  Trimethoprim: [
    // {
    //   name: 'dfrA7 + dfrA14',
    //   susceptible: false,
    //   rules: [
    //     { columnID: 'dfra_any', value: '1' },
    //     { columnID: 'dfrA7', value: '1' },
    //     { columnID: 'dfrA14', value: '1' },
    //   ],
    // },
    {
      name: 'dfrA7',
      susceptible: false,
      rules: [
        // { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA7', value: '1' },
        // { columnID: 'dfrA14', value: '0' },
      ],
    },
    {
      name: 'dfrA14',
      susceptible: false,
      rules: [
        // { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA14', value: '1' },
        // { columnID: 'dfrA7', value: '0' },
      ],
    },
    {
      name: 'dfrA1',
      susceptible: false,
      rules: [
        // { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA1', value: '1' },
        // { columnID: 'dfrA14', value: '0' },
        // { columnID: 'dfrA7', value: '0' },
      ],
    },
    {
      name: 'dfrA5',
      susceptible: false,
      rules: [
        // { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA5', value: '1' },
        // { columnID: 'dfrA14', value: '0' },
        // { columnID: 'dfrA7', value: '0' },
      ],
    },
    {
      name: 'dfrA15',
      susceptible: false,
      rules: [
        // { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA15', value: '1' },
        // { columnID: 'dfrA14', value: '0' },
        // { columnID: 'dfrA7', value: '0' },
      ],
    },
    {
      name: 'dfrA17',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA17', value: '1' },
        // { columnID: 'dfrA14', value: '0' },
        // { columnID: 'dfrA7', value: '0' },
      ],
    },
    {
      name: 'dfrA18',
      susceptible: false,
      rules: [
        // { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA18', value: '1' },
        // { columnID: 'dfrA14', value: '0' },
        // { columnID: 'dfrA7', value: '0' },
      ],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'dfra_any', value: '0' }],
    },
  ],
};
export const drugClassesRulesST = {
  ...drugClassesRulesSTHeatMap,
  // // MDR: [
  // //   {
  // //     name: 'MDR',
  // //     susceptible: false,
  // //     rules: [{ columnID: 'MDR', value: 'MDR' }],
  // //   },
  // //   {
  // //     name: 'Non-MDR',
  // //     susceptible: true,
  // //     rules: [{ columnID: 'MDR', value: '-' }],
  // //   },
  // // ],
  // // XDR: [
  // //   {
  // //     name: 'XDR',
  // //     susceptible: false,
  // //     rules: [{ columnID: 'XDR', value: 'XDR' }],
  // //   },
  // //   {
  // //     name: 'Non-XDR',
  // //     susceptible: true,
  // //     rules: [{ columnID: 'XDR', value: '-' }],
  // //   },
  // ],
  Pansusceptible: [
    {
      name: 'Pansusceptible (no AMR markers)',
      susceptible: true,
      rules: [{ columnID: 'amr_category', value: 'No AMR detected' }],
    },
    {
      name: 'One or more AMR markers',
      susceptible: false,
      rules: [{ columnID: 'amr_category', value: 'No AMR detected' }], // This rule is read different in the filters
    },
  ],
};

export const drugClassesRulesNG = {
  Azithromycin: [
    {
      name: '23S_rDNA_a2045g',
      susceptible: false,
      rules: [{ columnID: '23S_rDNA_a2045g', value: '1' }],
    },
    {
      name: 'mtrR_promoter_a-57del',
      susceptible: false,
      rules: [{ columnID: 'mtrR_promoter_a-57del', value: '1' }],
    },
    {
      name: 'mtrR_G45D',
      susceptible: false,
      rules: [{ columnID: 'mtrR_G45D', value: '1' }],
    },
    {
      name: 'mtrC_disrupted',
      susceptible: false,
      rules: [{ columnID: 'mtrC_disrupted', value: '1' }],
    },
    {
      name: '23S_rDNA_c2597t',
      susceptible: false,
      rules: [{ columnID: '23S_rDNA_c2597t', value: '1' }],
    },
    {
      name: 'mtrR_A39T',
      susceptible: false,
      rules: [{ columnID: 'mtrR_A39T', value: '1' }],
    },
    {
      name: 'mtrD_mosaic_2',
      susceptible: false,
      rules: [{ columnID: 'mtrD_mosaic_2', value: '1' }],
    },
    {
      name: 'mtrR_promoter_mosaic_2',
      susceptible: false,
      rules: [{ columnID: 'mtrR_promoter_mosaic_2', value: '1' }],
    },
    {
      name: 'rplD_G70D',
      susceptible: false,
      rules: [{ columnID: 'rplD_G70D', value: '1' }],
    },
    {
      name: 'rplV_----90ARAK',
      susceptible: false,
      rules: [{ columnID: 'rplV_----90ARAK', value: '1' }],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [
        { columnID: '23S_rDNA_a2045g', value: '0' },
        { columnID: 'mtrR_promoter_a-57del', value: '0' },
        { columnID: 'mtrR_G45D', value: '0' },
        { columnID: 'mtrC_disrupted', value: '0' },
        { columnID: '23S_rDNA_c2597t', value: '0' },
        { columnID: 'mtrR_A39T', value: '0' },
        { columnID: 'mtrD_mosaic_2', value: '0' },
        { columnID: 'mtrR_promoter_mosaic_2', value: '0' },
        { columnID: 'rplD_G70D', value: '0' },
        { columnID: 'rplV_----90ARAK', value: '0' },
      ],
    },
  ],
  Ceftriaxone: [
    {
      name: 'penA.A501P',
      susceptible: false,
      rules: [{ columnID: 'penA.A501P', value: '1' }],
    },
    {
      name: 'penA.G545T',
      susceptible: false,
      rules: [{ columnID: 'penA.G545T', value: '1' }],
    },
    {
      name: 'penA.I312M',
      susceptible: false,
      rules: [{ columnID: 'penA.I312M', value: '1' }],
    },
    {
      name: 'penA.V316T',
      susceptible: false,
      rules: [{ columnID: 'penA.V316T', value: '1' }],
    },
    {
      name: 'penA.A501V',
      susceptible: false,
      rules: [{ columnID: 'penA.A501V', value: '1' }],
    },
    {
      name: 'penA.G542S',
      susceptible: false,
      rules: [{ columnID: 'penA.G542S', value: '1' }],
    },
    {
      name: 'penA.insV346D',
      susceptible: false,
      rules: [{ columnID: 'penA.insV346D', value: '1' }],
    },
    {
      name: 'penA_G545S',
      susceptible: false,
      rules: [{ columnID: 'penA_G545S', value: '1' }],
    },
    {
      name: 'penA_T483S',
      susceptible: false,
      rules: [{ columnID: 'penA_T483S', value: '1' }],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [
        { columnID: 'penA.A501P', value: '0' },
        { columnID: 'penA.G545S', value: '0' },
        { columnID: 'penA.I312M', value: '0' },
        { columnID: 'penA.V316T', value: '0' },
        { columnID: 'penA.A501V', value: '0' },
        { columnID: 'penA.G542S', value: '0' },
        { columnID: 'penA.insV346D', value: '0' },
        { columnID: 'penA_G545S', value: '0' },
        { columnID: 'penA_T483S', value: '0' },
      ],
    },
  ],
  Cefixime: [
    {
      name: 'penA.A501P',
      susceptible: false,
      rules: [{ columnID: 'penA.A501P', value: '1' }],
    },
    {
      name: 'penA.A311V',
      susceptible: false,
      rules: [{ columnID: 'penA.A311V', value: '1' }],
    },
    {
      name: 'penA.G545S',
      susceptible: false,
      rules: [{ columnID: 'penA.G545S', value: '1' }],
    },
    {
      name: 'penA.I312M',
      susceptible: false,
      rules: [{ columnID: 'penA.I312M', value: '1' }],
    },
    {
      name: 'penA.P551S',
      susceptible: false,
      rules: [{ columnID: 'penA.P551S', value: '1' }],
    },
    {
      name: 'penA.V316T',
      susceptible: false,
      rules: [{ columnID: 'penA.V316T', value: '1' }],
    },
    {
      name: 'mtrR.G45D',
      susceptible: false,
      rules: [{ columnID: 'mtrR.G45D', value: '1' }],
    },
    {
      name: 'mtrR.A39T',
      susceptible: false,
      rules: [{ columnID: 'mtrR.A39T', value: '1' }],
    },
    {
      name: 'penA_T483S',
      susceptible: false,
      rules: [{ columnID: 'penA_T483S', value: '1' }],
    },
    {
      name: 'penA_V316P',
      susceptible: false,
      rules: [{ columnID: 'penA_V316P', value: '1' }],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [
        { columnID: 'penA.A501P', value: '0' },
        { columnID: 'penA.G545S', value: '0' },
        { columnID: 'penA.I312M', value: '0' },
        { columnID: 'penA.V316T', value: '0' },
        { columnID: 'penA.P551S', value: '0' },
        { columnID: 'mtrR.G45D', value: '0' },
        { columnID: 'mtrR.A39T', value: '0' },
        { columnID: 'penA.A311V', value: '0' },
        { columnID: 'penA_T483S', value: '0' },
        { columnID: 'penA_V316P', value: '0' },
      ],
    },
  ],
  Ciprofloxacin: [
    {
      name: 'gyrA_D95G',
      susceptible: false,
      rules: [{ columnID: 'gyrA_D95G', value: '1' }],
    },
    {
      name: 'parC_S87I',
      susceptible: false,
      rules: [{ columnID: 'parC_S87I', value: '1' }],
    },
    {
      name: 'gyrA_S91F',
      susceptible: false,
      rules: [{ columnID: 'gyrA_S91F', value: '1' }],
    },
    {
      name: 'gyrA_D95N',
      susceptible: false,
      rules: [{ columnID: 'gyrA_D95N', value: '1' }],
    },
    {
      name: 'parC_S87R',
      susceptible: false,
      rules: [{ columnID: 'parC_S87R', value: '1' }],
    },
    {
      name: 'parC_S88P',
      susceptible: false,
      rules: [{ columnID: 'parC_S88P', value: '1' }],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [
        { columnID: 'gyrA_D95G', value: '0' },
        { columnID: 'parC_S87I', value: '0' },
        { columnID: 'gyrA_S91F', value: '0' },
        { columnID: 'gyrA_D95N', value: '0' },
        { columnID: 'parC_S87R', value: '0' },
        { columnID: 'parC_S88P', value: '0' },
      ],
    },
  ],
  Sulfonamides: [
    {
      name: 'folP_R228S',
      susceptible: false,
      rules: [{ columnID: 'folP_R228S', value: '1' }],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'folP_R228S', value: '0' }],
    },
  ],
  Spectinomycin: [
    {
      name: '16S_rDNA_c1184t',
      susceptible: false,
      rules: [{ columnID: '16S_rDNA_c1184t', value: '1' }],
    },
    {
      name: 'rpsE_T24P',
      susceptible: false,
      rules: [{ columnID: 'rpsE_T24P', value: '1' }],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [
        { columnID: '16S_rDNA_c1184t', value: '0' },
        { columnID: 'rpsE_T24P', value: '0' },
      ],
    },
  ],
  Benzylpenicillin: [
    {
      name: 'mtrR_promoter_a-57del',
      susceptible: false,
      rules: [{ columnID: 'mtrR_promoter_a-57del', value: '1' }],
    },
    {
      name: 'penA_A501T',
      susceptible: false,
      rules: [{ columnID: 'penA_A501T', value: '1' }],
    },
    {
      name: 'penA_ins346D',
      susceptible: false,
      rules: [{ columnID: 'penA_ins346D', value: '1' }],
    },
    {
      name: 'ponA1_L421P',
      susceptible: false,
      rules: [{ columnID: 'ponA1_L421P', value: '1' }],
    },
    {
      name: 'porB1b_A121D',
      susceptible: false,
      rules: [{ columnID: 'porB1b_A121D', value: '1' }],
    },
    {
      name: 'porB1b_G120K',
      susceptible: false,
      rules: [{ columnID: 'porB1b_G120K', value: '1' }],
    },
    {
      name: 'mtrR_A39T',
      susceptible: false,
      rules: [{ columnID: 'mtrR_A39T', value: '1' }],
    },
    {
      name: 'penA_G542S',
      susceptible: false,
      rules: [{ columnID: 'penA_G542S', value: '1' }],
    },
    {
      name: 'mtrR_G45D',
      susceptible: false,
      rules: [{ columnID: 'mtrR_G45D', value: '1' }],
    },
    {
      name: 'penA_G545S',
      susceptible: false,
      rules: [{ columnID: 'penA_G545S', value: '1' }],
    },
    {
      name: 'penA_I312M',
      susceptible: false,
      rules: [{ columnID: 'penA_I312M', value: '1' }],
    },
    {
      name: 'penA_V316T',
      susceptible: false,
      rules: [{ columnID: 'penA_V316T', value: '1' }],
    },
    {
      name: 'blaTEM',
      susceptible: false,
      rules: [{ columnID: 'blaTEM', value: '1' }],
    },
    {
      name: 'penA_V316T',
      susceptible: false,
      rules: [{ columnID: 'penA_V316T', value: '1' }],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [
        { columnID: 'mtrR_promoter_a-57del', value: '0' },
        { columnID: 'blaTEM', value: '0' },
        { columnID: 'penA_V316T', value: '0' },
        { columnID: 'penA_A501T', value: '0' },
        { columnID: 'penA_ins346D', value: '0' },
        { columnID: 'ponA1_L421P', value: '0' },
        { columnID: 'porB1b_A121D', value: '0' },
        { columnID: 'porB1b_G120K', value: '0' },
        { columnID: 'mtrR_A39T', value: '0' },
        { columnID: 'penA_G542S', value: '0' },
        { columnID: 'mtrR_G45D', value: '0' },
        { columnID: 'penA_G545S', value: '0' },
        { columnID: 'penA_I312M', value: '0' },
        { columnID: 'penA_V316T', value: '0' },
      ],
    },
  ],
  Tetracycline: [
    {
      name: 'mtrR_promoter_a-57del',
      susceptible: false,
      rules: [{ columnID: 'mtrR_promoter_a-57del', value: '1' }],
    },
    {
      name: 'rpsJ_V57M',
      susceptible: false,
      rules: [{ columnID: 'rpsJ_V57M', value: '1' }],
    },
    {
      name: 'mtrR_A39T',
      susceptible: false,
      rules: [{ columnID: 'mtrR_A39T', value: '1' }],
    },
    {
      name: 'mtrR_G45D',
      susceptible: false,
      rules: [{ columnID: 'mtrR_G45D', value: '1' }],
    },
    {
      name: 'tetM',
      susceptible: false,
      rules: [{ columnID: 'tetM', value: '1' }],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [
        { columnID: 'mtrR_promoter_a-57del', value: '0' },
        { columnID: 'rpsJ_V57M', value: '0' },
        { columnID: 'mtrR_A39T', value: '0' },
        { columnID: 'mtrR_G45D', value: '0' },
        { columnID: 'tetM', value: '0' },
      ],
    },
  ],
};

// TO DO: ADD RULES (USE GONO AS REFERENCE)
export const drugClassesRulesINTS = {};
export const drugClassesRulesSHIGE = {};
export const drugClassesRulesDECOLI = {};
export const drugClassesRulesECOLI = {};
export const drugClassesRulesSENTERICA = {};

// Sentericaints INTS
export const drugRulesINTS = [
  { key: 'Ampicillin', columnID: 'BETA-LACTAM', values: ['BETA-LACTAM'] },
  { key: 'Azithromycin', columnID: 'MACROLIDE', values: ['AZITHROMYCIN'] },
  { key: 'ESBL', columnID: 'BETA-LACTAM', values: ['CEPHALOSPORIN'] },
  { key: 'Chloramphenicol', columnID: 'PHENICOL', values: ['CHLORAMPHENICOL'] },
  { key: 'Ciprofloxacin', columnID: 'QUINOLONE', values: ['QUINOLONE'], legends: 'Ciprofloxacin' },
  { key: 'Colistin', columnID: 'COLISTIN', values: ['COLISTIN'] },
  { key: 'Aminoglycosides', columnID: 'AMINOGLYCOSIDE', values: ['GENTAMICIN', 'AMINOGLYCOSIDE'] },
  { key: 'Macrolides', columnID: 'MACROLIDE', values: ['MACROLIDE'] },
  { key: 'Meropenem', columnID: 'BETA-LACTAM', values: ['CARBAPENEM'] },
  { key: 'Sulfamethoxazole', columnID: 'SULFONAMIDE', values: ['SULFONAMIDE'] },
  { key: 'Tetracycline', columnID: 'TETRACYCLINE', values: ['TETRACYCLINE'] },
  { key: 'Tigecycline', columnID: 'TETRACYCLINE', values: ['TIGECYCLINE'] },
  { key: 'Trimethoprim', columnID: 'TRIMETHOPRIM', values: ['TRIMETHOPRIM'] },
  {
    key: 'Pansusceptible',
    requirements: [
      { columnID: 'AMINOGLYCOSIDE', values: ['-'] },
      { columnID: 'BETA-LACTAM', values: ['-'] },
      { columnID: 'SULFONAMIDE', values: ['-'] },
      { columnID: 'TETRACYCLINE', values: ['-'] },
      { columnID: 'QUINOLONE', values: ['-'] },
      { columnID: 'MACROLIDE', values: ['-'] },
      { columnID: 'COLISTIN', values: ['-'] },
      { columnID: 'TRIMETHOPRIM', values: ['-'] },
      { columnID: 'PHENICOL', values: ['-'] },
    ],
  },
];

// Used for ints and senterica
export const statKeysINTS = [
  { name: 'Ampicillin', column: 'BETA-LACTAM', key: 'BETA-LACTAM', resistanceView: true },
  { name: 'Macrolides', column: 'MACROLIDE', key: 'AZITHROMYCIN', resistanceView: true },
  { name: 'ESBL', column: 'BETA-LACTAM', key: 'CEPHALOSPORIN', resistanceView: true },
  { name: 'Chloramphenicol', column: 'PHENICOL', key: 'CHLORAMPHENICOL', resistanceView: true },
  { name: 'Ciprofloxacin', column: 'QUINOLONE', key: 'QUINOLONE', resistanceView: true },
  { name: 'Colistin', column: 'COLISTIN', key: 'COLISTIN', resistanceView: true },
  { name: 'Aminoglycosides', column: 'AMINOGLYCOSIDE', key: ['GENTAMICIN', 'AMINOGLYCOSIDE'], resistanceView: true },
  { name: 'Sulfamethoxazole', column: 'SULFONAMIDE', key: 'SULFONAMIDE', resistanceView: true },
  { name: 'Tetracycline', column: 'TETRACYCLINE', key: 'TETRACYCLINE', resistanceView: true },
  { name: 'Tigecycline', column: 'TETRACYCLINE', key: 'TIGECYCLINE', resistanceView: true },
  { name: 'Trimethoprim', column: 'TRIMETHOPRIM', key: 'TRIMETHOPRIM', resistanceView: true },
  {
    name: 'Pansusceptible',
    column: drugRulesINTS.find(x => x.key === 'Pansusceptible').requirements.map(x => x.columnID),
    key: '-',
    resistanceView: true,
  },
];

// Used for shige, ecoli and decoli
export const statKeysECOLI = (() => {
  const items = [
    {
      name: 'Aminoglycosides',
      resistanceView: true,
      rules: [{ column: 'Aminoglycoside', value: '-', equal: false }],
      every: true,
    },
    {
      name: 'Ampicillin',
      resistanceView: true,
      rules: [
        { column: 'Penicillin', value: ['-'], equal: false },
        { column: 'Carbapenemase', value: ['-'], equal: false },
        { column: 'ESBL', value: ['-'], equal: false },
      ],
      every: false,
    },
    {
      name: 'Azithromycin',
      resistanceView: true,
      rules: [
        { column: 'Macrolide', value: 'mph(A)', equal: true },
        { column: 'Macrolide', value: 'acrB_R717L', equal: true },
      ],
      every: false,
    },
    {
      name: 'Carbapenems',
      resistanceView: true,
      rules: [{ column: 'Carbapenemase', value: '-', equal: false }],
      every: true,
    },
    {
      name: 'Chloramphenicol',
      resistanceView: true,
      rules: [{ column: 'Phenicol', value: '-', equal: false }],
      every: true,
    },
    {
      name: 'ESBL',
      resistanceView: true,
      rules: [
        { column: 'Carbapenemase', value: 'blaOXA-24', equal: true },
        { column: 'Carbapenemase', value: 'blaOXA-244', equal: true },
        { column: 'Carbapenemase', value: 'blaOXA-48', equal: true },
        { column: 'Carbapenemase', value: 'blaOXA-181', equal: true },
        { column: 'ESBL', value: '-', equal: false },
      ],
      every: false,
    },
    {
      name: 'Ciprofloxacin',
      resistanceView: true,
      rules: [{ column: 'Quinolone', value: '-', equal: false }],
      every: true,
    },
    {
      name: 'Colistin',
      resistanceView: true,
      rules: [{ column: 'Colistin', value: '-', equal: false }],
      every: true,
    },
    {
      name: 'Fosfomycin',
      resistanceView: true,
      rules: [{ column: 'Fosfomycin', value: '-', equal: false }],
      every: true,
    },
    {
      name: 'Macrolides',
      resistanceView: true,
      rules: [{ column: 'Macrolide', value: '-', equal: false }],
      every: true,
    },
    {
      name: 'Sulfamethoxazole',
      resistanceView: true,
      rules: [{ column: 'Sulfonamide', value: '-', equal: false }],
      every: true,
    },
    {
      name: 'Tetracycline',
      resistanceView: true,
      rules: [{ column: 'Tetracycline', value: '-', equal: false }],
      every: true,
    },
    {
      name: 'Trimethoprim',
      resistanceView: true,
      rules: [{ column: 'Trimethoprim', value: '-', equal: false }],
      every: true,
    },
    {
      name: 'Trimethoprim-Sulfamethoxazole',
      resistanceView: true,
      rules: [
        { column: 'Trimethoprim', value: '-', equal: false },
        { column: 'Sulfonamide', value: '-', equal: false },
      ],
      every: true,
    },
  ];

  const uniqueColumns = [...new Set(items.flatMap(item => item.rules.map(rule => rule.column)))];
  return items.concat({
    name: 'Pansusceptible',
    resistanceView: true,
    rules: uniqueColumns.map(col => {
      return { column: col, value: '-', equal: true };
    }),
    every: true,
  });
})();

export const statKeysOthers = [
  { name: 'Pansusceptible', column: 'num_resistance_classes', key: '0' },
  { name: 'MDR', column: 'MDR', key: 'MDR' },
  { name: 'XDR', column: 'XDR', key: 'XDR' },
  { name: 'ESBL', column: 'Bla_ESBL_acquired', key: '-' },
  // { name: 'Carbapenemase', column: 'Bla_Carb_acquired', key: '-' },
];

export const statKeys = {
  styphi: statKeysST,
  ngono: statKeysNG,
  kpneumo: statKeysKP,
  sentericaints: statKeysINTS,
  shige: statKeysECOLI,
  senterica: statKeysINTS,
  ecoli: statKeysECOLI,
  decoli: statKeysECOLI,
  others: statKeysOthers,
};
