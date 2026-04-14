// Drug rules for Salmonella, where the column has to have one of the values to validate the rule. For frequencies and
// drug resistance graphs
export const drugRulesST = [
  { key: 'Ampicillin/Amoxicillin', columnID: 'blaTEM-1D', values: ['1'] },
  { key: 'Azithromycin', columnID: 'azith_pred_pheno', values: ['AzithR'] },
  { key: 'Chloramphenicol', columnID: 'chloramphenicol_category', values: ['ChlR'] },
  { key: 'Trimethoprim-sulfamethoxazole', columnID: 'co_trim', values: ['1'] },
  { key: 'Ceftriaxone', columnID: 'ESBL_category', values: ['ESBL'] },
  {
    key: 'Ciprofloxacin NS',
    columnID: 'cip_pred_pheno',
    values: ['CipNS'],
    legends: 'Ciprofloxacin (non-susceptible)',
  },
  { key: 'Ciprofloxacin R', columnID: 'cip_pred_pheno', values: ['CipR'], legends: 'Ciprofloxacin (resistant)' },
  {
    key: 'Ciprofloxacin',
    columnID: 'cip_pred_pheno',
    values: ['CipNS', 'CipR'],
    legends: 'Ciprofloxacin',
  },
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
  {
    key: 'Susceptible to cat I/II drugs',
    columnID: ['Susceptible'],
    values: ['1'],
    legends: 'Susceptible to cat I/II drugs',
  },
  { key: 'Spectinomycin', columnID: ['Spectinomycin'], values: ['1'] },
  { key: 'MDR', columnID: 'MDR', values: ['1'], legends: 'Multidrug resistant (MDR)' },
  { key: 'XDR', columnID: 'XDR', values: ['1'], legends: 'Extensively drug resistant (XDR)' },
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
  { name: 'XDR', column: 'XDR', key: '1', resistanceView: true },
  { name: 'MDR', column: 'MDR', key: '1', resistanceView: true },
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
// export const drugClassesRulesINTS = {};
// export const drugClassesRulesSHIGE = {};
// export const drugClassesRulesDECOLI = {};
// export const drugClassesRulesECOLI = {};
// export const drugClassesRulesSENTERICA = {};

// Sentericaints INTS
// Drug combination rules for non-typhoidal Salmonella (senterica + sentericaints)
// Data from Enterobase, AMR genes identified by AMRFinderPlus
// QUINOLONE field contains gene/class names from AMRFinderPlus (e.g., "QUINOLONE", "aac(6')-Ib-cr;gyrA_D87Y")
// export const drugRulesINTS = [
//   { key: 'Aminoglycosides', columnID: 'AMINOGLYCOSIDE', values: ['GENTAMICIN', 'AMINOGLYCOSIDE'] },
//   { key: 'Ampicillin', columnID: 'BETA-LACTAM', values: ['BETA-LACTAM'] },
//   { key: 'Azithromycin', columnID: 'MACROLIDE', values: ['mph(A)', 'acrB_R717L'] },
//   { key: 'Carbapenems', columnID: 'BETA-LACTAM', values: ['CARBAPENEM'] },
//   { key: 'Chloramphenicol', columnID: 'PHENICOL', values: ['CHLORAMPHENICOL'] },
//   { key: 'Ciprofloxacin', columnID: 'QUINOLONE', values: ['QUINOLONE'], legends: 'Ciprofloxacin (any quinolone resistance)' },
//   { key: 'Colistin', columnID: 'COLISTIN', values: ['COLISTIN'] },
//   { key: 'ESBL', columnID: 'BETA-LACTAM', values: ['CEPHALOSPORIN'] },
//   { key: 'Sulfamethoxazole', columnID: 'SULFONAMIDE', values: ['SULFONAMIDE'] },
//   { key: 'Tetracycline', columnID: 'TETRACYCLINE', values: ['TETRACYCLINE'] },
//   { key: 'Trimethoprim', columnID: 'TRIMETHOPRIM', values: ['TRIMETHOPRIM'] },

// {
//   key: 'Pansusceptible',
//   requirements: [
//     { columnID: 'AMINOGLYCOSIDE', values: ['-'] },
//     { columnID: 'BETA-LACTAM', values: ['-'] },
//     { columnID: 'SULFONAMIDE', values: ['-'] },
//     { columnID: 'TETRACYCLINE', values: ['-'] },
//     { columnID: 'QUINOLONE', values: ['-'] },
//     { columnID: 'MACROLIDE', values: ['-'] },
//     { columnID: 'COLISTIN', values: ['-'] },
//     { columnID: 'TRIMETHOPRIM', values: ['-'] },
//     { columnID: 'PHENICOL', values: ['-'] },
//   ],
// },
// ];

// Drug combination rules for NTS — MDR, XDR, CipNS, CipR, QRDR mutations
// These are computed client-side from the raw Enterobase data fields
// Applied in getYearsData (filters.js) via calculateDrugStatsINTSCombinations
// Drug combination definitions for NTS — Reference: Van Puyvelde et al. 2023 Nat Commun (doi:10.1038/s41467-023-41152-6)
// export const drugCombinationRulesINTS = {
//   // CipNS: ciprofloxacin non-susceptible (MIC ≥0.06 mg/L)
//   // Due to presence of ≥1 qnr gene OR ≥1 QRDR mutation in gyrA/parC/gyrB
//   CipNS: { key: 'CipNS', legends: 'Ciprofloxacin (non-susceptible)' },
//   // CipR: ciprofloxacin resistant (MIC ≥0.5 mg/L)
//   // Due to presence of multiple mutations and/or genes (≥2 QRDR mutations, OR QRDR + qnr/aac(6')-Ib-cr)
//   CipR: { key: 'CipR', legends: 'Ciprofloxacin (resistant)' },
//   // QRDR mutations: presence of any gyrA/gyrB/parC/parE mutation
//   QRDR: { key: 'QRDR mutations', legends: 'QRDR mutations' },
//   // MDR: resistant to ampicillin + chloramphenicol + trimethoprim-sulfamethoxazole
//   MDR: { key: 'MDR', legends: 'Multidrug resistant (MDR)' },
//   // XDR: MDR plus resistant to either (i) ciprofloxacin AND ceftriaxone, OR (ii) azithromycin AND ceftriaxone
//   XDR: { key: 'XDR', legends: 'Extensively drug resistant (XDR)' },
//   // PDR: MDR plus resistant to ciprofloxacin + azithromycin + ceftriaxone
//   PDR: { key: 'PDR', legends: 'Pan-drug resistant (PDR)' },
// };

// Used for senterica and sentericaints both
// export const statKeysINTS = [
//   { name: 'Aminoglycosides', column: 'AMINOGLYCOSIDE', key: ['GENTAMICIN', 'AMINOGLYCOSIDE'], resistanceView: true },
//   { name: 'Ampicillin', column: 'BETA-LACTAM', key: 'BETA-LACTAM', resistanceView: true },
//   { name: 'Azithromycin', column: 'MACROLIDE', key: ['mph(A)', 'acrB_R717L'], resistanceView: true },
//   { name: 'Carbapenems', column: 'BETA-LACTAM', key: 'CARBAPENEM', resistanceView: true },
//   { name: 'Chloramphenicol', column: 'PHENICOL', key: 'CHLORAMPHENICOL', resistanceView: true },
//   { name: 'Ciprofloxacin', column: 'QUINOLONE', key: 'QUINOLONE', resistanceView: true },
//   { name: 'Colistin', column: 'COLISTIN', key: 'COLISTIN', resistanceView: true },
//   { name: 'ESBL', column: 'BETA-LACTAM', key: 'CEPHALOSPORIN', resistanceView: true },
//   { name: 'Sulfamethoxazole', column: 'SULFONAMIDE', key: 'SULFONAMIDE', resistanceView: true },
//   { name: 'Tetracycline', column: 'TETRACYCLINE', key: 'TETRACYCLINE', resistanceView: true },
//   { name: 'Trimethoprim', column: 'TRIMETHOPRIM', key: 'TRIMETHOPRIM', resistanceView: true },
//   // Drug combinations — computed client-side in getYearsData from QUINOLONE field parsing
//   // CipNS: any quinolone resistance mechanism (single QRDR mutation OR qnr gene)
//   { name: 'CipNS', column: '_computed', key: 'CipNS', resistanceView: true, computed: true },
//   // CipR: ≥2 QRDR mutations, OR QRDR + qnr/aac(6')-Ib-cr (high-level resistance)
//   { name: 'CipR', column: '_computed', key: 'CipR', resistanceView: true, computed: true },
//   // QRDR mutations: count of genomes with any gyrA/gyrB/parC/parE mutation
//   { name: 'QRDR mutations', column: '_computed', key: 'QRDR mutations', resistanceView: true, computed: true },
//   // MDR: Ampicillin + Chloramphenicol + Trimethoprim-Sulfamethoxazole
//   { name: 'MDR', column: '_computed', key: 'MDR', resistanceView: true, computed: true },
//   // XDR: MDR + (Ciprofloxacin + Ceftriaxone) OR (Azithromycin + Ceftriaxone)
//   { name: 'XDR', column: '_computed', key: 'XDR', resistanceView: true, computed: true },
//   // PDR: MDR + Ciprofloxacin + Azithromycin + Ceftriaxone
//   { name: 'PDR', column: '_computed', key: 'PDR', resistanceView: true, computed: true },
//   {
//     name: 'Pansusceptible',
//     column: drugRulesINTS.find(x => x.key === 'Pansusceptible').requirements.map(x => x.columnID),
//     key: '-',
//     resistanceView: true,
//   },
// ];

// Used for shige, ecoli and decoli
// Shared drug rules for ecoli, decoli, shige, senterica, sentericaints
// Each drug maps 1:1 to a DB column; resistant = column has a non-empty value (not '', '-', null)
export const statKeysECOLI = (() => {
  const drugColumns = [
    'Aminoglycoside',
    'Sulfonamide',
    'Tetracycline',
    'Phenicol',
    'Quinolone',
    'Fosfomycin',
    'Trimethoprim',
    'Macrolide',
    // 'Lincosamide',
    // 'Streptothricin',
    // 'Rifamycin',
    'Colistin',
    // 'Bleomycin',
  ];

  const items = drugColumns.map(col => ({
    name: col,
    resistanceView: true,
    rules: [{ column: col, value: '-', equal: false }],
    every: true,
  }));

  // Computed combinations
  items.push({
    name: 'Trimethoprim-Sulfamethoxazole',
    resistanceView: true,
    rules: [
      { column: 'Trimethoprim', value: '-', equal: false },
      { column: 'Sulfonamide', value: '-', equal: false },
    ],
    every: true,
  });
  items.push({
    name: 'Ampicillin',
    resistanceView: true,
    rules: [
      { column: 'Beta-lactam', value: 'BETA-LACTAM', equal: false },
    ],
    every: true,
  });
  //TODO: ADD CARBAPENEMASES and ESBL based on feedback
  // items.push({
  //   name: 'Carbapenems',
  //   resistanceView: true,
  //   rules: [
  //     { column: 'Carbapenemase', value: '-', equal: false },
  //   ],
  //   every: true,
  // });
  // items.push({
  //   name: 'ESBL',
  //   resistanceView: true,
  //   rules: [
  //     { column: 'Carbapenemase', value: '-', equal: false },
  //     { column: 'ESBL', value: '-', equal: false },
  //   ],
  //   every: true,
  // });
  // CipNS/CipR are not applicable for these organisms — computed separately per organism where needed

  const uniqueColumns = [
    ...new Set(items.filter(i => !i.computed).flatMap(item => item.rules.map(rule => rule.column))),
  ];
  return items.concat({
    name: 'Pansusceptible',
    resistanceView: true,
    rules: uniqueColumns.map(col => ({ column: col, value: '-', equal: true })),
    every: true,
  });
})().sort((a, b) => a.name.localeCompare(b.name));

export const statKeysOthers = [
  { name: 'Pansusceptible', column: 'num_resistance_classes', key: '0' },
  { name: 'MDR', column: 'MDR', key: 'MDR' },
  { name: 'XDR', column: 'XDR', key: 'XDR' },
  { name: 'ESBL', column: 'Bla_ESBL_acquired', key: '-' },
  // { name: 'Carbapenemase', column: 'Bla_Carb_acquired', key: '-' },
];

export const statKeysSA = [
  { name: 'Amikacin', column: 'Amikacin', key: '1', resistanceView: true },
  { name: 'Gentamicin', column: 'Gentamicin', key: '1', resistanceView: true },
  { name: 'Tobramycin', column: 'Tobramycin', key: '1', resistanceView: true },
  { name: 'Kanamycin', column: 'Kanamycin', key: '1', resistanceView: true },
  { name: 'Methicillin', column: 'Methicillin', key: '1', resistanceView: true },
  { name: 'Penicillin', column: 'Penicillin', key: '1', resistanceView: true },
  { name: 'Fusidic Acid', column: 'Fusidic Acid', key: '1', resistanceView: true },
  { name: 'Vancomycin', column: 'Vancomycin', key: '1', resistanceView: true },
  { name: 'Clindamycin', column: 'Clindamycin', key: '1', resistanceView: true },
  { name: 'Erythromycin', column: 'Erythromycin', key: '1', resistanceView: true },
  { name: 'Mupirocin', column: 'Mupirocin', key: '1', resistanceView: true },
  { name: 'Linezolid', column: 'Linezolid', key: '1', resistanceView: true },
  { name: 'Tetracycline', column: 'Tetracycline', key: '1', resistanceView: true },
  { name: 'Trimethoprim', column: 'Trimethoprim', key: '1', resistanceView: true },
  { name: 'Daptomycin', column: 'Daptomycin', key: '1', resistanceView: true },
  { name: 'Rifampicin', column: 'Rifampicin', key: '1', resistanceView: true },
  { name: 'Ciprofloxacin', column: 'Ciprofloxacin', key: '1', resistanceView: true },
  { name: 'Moxifloxacin', column: 'Moxifloxacin', key: '1', resistanceView: true },
  { name: 'Teicoplanin', column: 'Teicoplanin', key: '1', resistanceView: true },
  { name: 'Pansusceptible', column: null, key: null, resistanceView: true, pansusceptible: true },
];

export const statKeysSP = [
  { name: 'Chloramphenicol', column: 'Chloramphenicol', key: '1', resistanceView: true },
  { name: 'Clindamycin', column: 'Clindamycin', key: '1', resistanceView: true },
  { name: 'Erythromycin', column: 'Erythromycin', key: '1', resistanceView: true },
  { name: 'Fluoroquinolones', column: 'Fluoroquinolones', key: '1', resistanceView: true },
  { name: 'Kanamycin', column: 'Kanamycin', key: '1', resistanceView: true },
  // { name: 'Linezolid', column: 'Linezolid', key: '1', resistanceView: true },
  { name: 'Tetracycline', column: 'Tetracycline', key: '1', resistanceView: true },
  { name: 'Trimethoprim', column: 'Trimethoprim', key: '1', resistanceView: true },
  { name: 'Sulfamethoxazole', column: 'Sulfamethoxazole', key: '1', resistanceView: true },
  { name: 'Co-Trimoxazole', column: 'Co-Trimoxazole', key: '1', resistanceView: true },
  { name: 'Pansusceptible', column: 'amr_gene_count', key: '0', resistanceView: true, pansusceptible: true },
];

export const statKeys = {
  styphi: statKeysST,
  ngono: statKeysNG,
  kpneumo: statKeysKP,
  sentericaints: statKeysECOLI,
  shige: statKeysECOLI,
  senterica: statKeysECOLI,
  ecoli: statKeysECOLI,
  decoli: statKeysECOLI,
  saureus: statKeysSA,
  strepneumo: statKeysSP,
  others: statKeysOthers,
};

// ---------------------------------------------------------------------------
// S. aureus — resistance stored as 1 (resistant) / 0 (susceptible)
// ---------------------------------------------------------------------------
export const drugRulesSA = [
  { key: 'Amikacin', columnID: 'Amikacin', values: ['1'] },
  { key: 'Gentamicin', columnID: 'Gentamicin', values: ['1'] },
  { key: 'Tobramycin', columnID: 'Tobramycin', values: ['1'] },
  { key: 'Kanamycin', columnID: 'Kanamycin', values: ['1'] },
  { key: 'Methicillin', columnID: 'Methicillin', values: ['1'] },
  { key: 'Penicillin', columnID: 'Penicillin', values: ['1'] },
  { key: 'Fusidic Acid', columnID: 'Fusidic Acid', values: ['1'] },
  { key: 'Vancomycin', columnID: 'Vancomycin', values: ['1'] },
  { key: 'Clindamycin', columnID: 'Clindamycin', values: ['1'] },
  { key: 'Erythromycin', columnID: 'Erythromycin', values: ['1'] },
  { key: 'Mupirocin', columnID: 'Mupirocin', values: ['1'] },
  { key: 'Linezolid', columnID: 'Linezolid', values: ['1'] },
  { key: 'Tetracycline', columnID: 'Tetracycline', values: ['1'] },
  { key: 'Trimethoprim', columnID: 'Trimethoprim', values: ['1'] },
  { key: 'Daptomycin', columnID: 'Daptomycin', values: ['1'] },
  { key: 'Rifampicin', columnID: 'Rifampicin', values: ['1'] },
  { key: 'Ciprofloxacin', columnID: 'Ciprofloxacin', values: ['1'] },
  { key: 'Moxifloxacin', columnID: 'Moxifloxacin', values: ['1'] },
  { key: 'Teicoplanin', columnID: 'Teicoplanin', values: ['1'] },
  { key: 'Pansusceptible', columnID: null, values: [], pansusceptible: true },
];

// ---------------------------------------------------------------------------
// S. pneumoniae — resistance stored as 1 (resistant) / 0 (susceptible)
// ---------------------------------------------------------------------------
export const drugRulesSP = [
  { key: 'Chloramphenicol', columnID: 'Chloramphenicol', values: ['1'] },
  { key: 'Clindamycin', columnID: 'Clindamycin', values: ['1'] },
  { key: 'Erythromycin', columnID: 'Erythromycin', values: ['1'] },
  { key: 'Fluoroquinolones', columnID: 'Fluoroquinolones', values: ['1'] },
  { key: 'Kanamycin', columnID: 'Kanamycin', values: ['1'] },
  // { key: 'Linezolid', columnID: 'Linezolid', values: ['1'] },
  { key: 'Tetracycline', columnID: 'Tetracycline', values: ['1'] },
  { key: 'Trimethoprim', columnID: 'Trimethoprim', values: ['1'] },
  { key: 'Sulfamethoxazole', columnID: 'Sulfamethoxazole', values: ['1'] },
  { key: 'Co-Trimoxazole', columnID: 'Co-Trimoxazole', values: ['1'] },
  { key: 'Pansusceptible', columnID: 'amr_gene_count', values: ['0'], pansusceptible: true },
];

// ---------------------------------------------------------------------------
// S. aureus — AMR marker rules
// Maps each drug to the specific acquired genes (from 'Acquired' field) and
// point mutations (from 'Variants' field, stored as 'gene_variant') that
// confer resistance to that drug.
// ---------------------------------------------------------------------------
export const markerRulesSA = {
  Penicillin: { acquired: ['blaZ', 'blaZ_LGA251', 'mecA'], variants: [] },
  Methicillin: { acquired: ['mecA', 'mecC'], variants: [] },
  Amikacin: { acquired: ['aphA-3', 'aadD'], variants: [] },
  Gentamicin: { acquired: ['aacA-aphD'], variants: [] },
  Tobramycin: { acquired: ['aphA-3', 'aadD', 'aacA-aphD'], variants: [] },
  Kanamycin: { acquired: ['aphA-3', 'aadD', 'aacA-aphD'], variants: [] },
  Erythromycin: {
    acquired: ['ermA', 'ermB', 'ermC', 'erm33', 'ermT', 'mefA', 'mefE', 'msrA', 'ereA', 'ereB'],
    variants: [],
  },
  Clindamycin: { acquired: ['ermA', 'ermA_SDS'], variants: [] },
  Tetracycline: { acquired: ['tetK', 'tetM', 'tetL', 'tetO'], variants: [] },
  'Fusidic Acid': {
    acquired: ['fusB', 'fusC', 'fusD'],
    variants: [
      'fusA_F88L',
      'fusA_V90A',
      'fusA_V90I',
      'fusA_P114H',
      'fusA_Q115L',
      'fusA_T385N',
      'fusA_P404L',
      'fusA_P404Q',
      'fusA_P406L',
      'fusA_D434N',
      'fusA_T436I',
      'fusA_H438N',
      'fusA_E444K',
      'fusA_G451V',
      'fusA_E444V',
      'fusA_G452S',
      'fusA_G452C',
      'fusA_N453I',
      'fusA_L456F',
      'fusA_H457Q',
      'fusA_H457Y',
      'fusA_L461K',
      'fusA_L461S',
      'fusA_L461F',
      'fusA_D436G',
      'fusA_R464C',
      'fusA_R464S',
      'fusA_R464H',
      'fusA_P478S',
      'fusA_G556S',
      'fusA_G617D',
      'fusA_F652S',
      'fusA_Y654N',
      'fusA_A655E',
      'fusA_A655P',
      'fusA_T656K',
      'fusA_R659C',
      'fusA_R659L',
      'fusA_R659S',
      'fusA_G664S',
    ],
  },
  Linezolid: {
    acquired: ['cfr'],
    variants: ['rplD_K68Q', 'rplC_G139R', 'rplC_G152D', 'rplC_G155R', 'rplC_M169L'],
  },
  Mupirocin: {
    acquired: ['ileS-2', 'mupB'],
    variants: ['ileS-1_H67Q', 'ileS-1_F563L', 'ileS-1_V588F', 'ileS-1_G593V', 'ileS-1_V631F', 'ileS-1_R816C'],
  },
  Trimethoprim: {
    acquired: ['dfrK', 'dfrA', 'dfrG'],
    variants: ['dfrB_L21V', 'dfrB_H31N', 'dfrB_L41F', 'dfrB_F99S', 'dfrB_F99Y', 'dfrB_F99I', 'dfrB_H150R'],
  },
  Vancomycin: { acquired: ['vanA', 'vanZ'], variants: [] },
  Teicoplanin: { acquired: ['vanA', 'vanZ'], variants: [] },
  Ciprofloxacin: {
    acquired: [],
    variants: [
      'grlA_S80F',
      'grlA_S80Y',
      'grlA_E84K',
      'grlA_A116V',
      'grlA_A116E',
      'grlB_D432V',
      'grlB_D432N',
      'grlB_D432H',
      'grlB_D443E',
      'grlB_R444S',
      'grlB_P451S',
      'grlB_R470D',
      'grlB_P585S',
      'gyrA_D73G',
      'gyrA_G82C',
      'gyrA_S84L',
      'gyrA_S84V',
      'gyrA_S84A',
      'gyrA_S85P',
      'gyrA_E88K',
      'gyrA_E88L',
      'gyrA_E88R',
      'gyrA_G106D',
      'gyrB_D437N',
      'gyrB_E477D',
    ],
  },
  Rifampicin: {
    acquired: [],
    variants: [
      'rpoB_S464P',
      'rpoB_S463P',
      'rpoB_I527F',
      'rpoB_N474K',
      'rpoB_Q468R',
      'rpoB_Q468K',
      'rpoB_Q468L',
      'rpoB_S486L',
      'rpoB_D471Y',
      'rpoB_D552N',
      'rpoB_D550G',
      'rpoB_R484H',
      'rpoB_A477T',
      'rpoB_A477V',
      'rpoB_A477D',
      'rpoB_A477G',
      'rpoB_H481Y',
      'rpoB_H481N',
      'rpoB_H481D',
    ],
  },
  Daptomycin: {
    acquired: [],
    variants: ['rpoB_A621E', 'mprF_S295L', 'mprF_T345A'],
  },
  Moxifloxacin: { acquired: [], variants: [] },
};

// ---------------------------------------------------------------------------
// S. pneumoniae — AMR marker rules
// Maps each drug to the specific acquired genes (from 'Acquired' field) and
// point mutations (from 'Variants' field, stored as 'gene_variant') that
// confer resistance to that drug.
// ---------------------------------------------------------------------------
const _ermSP = [
  'erm30',
  'erm31',
  'erm32',
  'erm33',
  'erm34',
  'erm36',
  'erm38',
  'erm39',
  'erm40',
  'erm42',
  'ermA',
  'ermB',
  'ermC_13',
  'ermB_UPST',
  'ermD',
  'ermE',
  'ermF',
  'ermG',
  'ermN',
  'ermO',
  'ermQ',
  'ermS',
  'ermT',
  'ermW',
  'ermX',
  'ermY',
  'ermZ',
];
export const markerRulesSP = {
  Chloramphenicol: {
    acquired: [
      'cat_1',
      'cat_2',
      'cat_3',
      'cat_4',
      'cat_5',
      'cat86',
      'catA1',
      'catA2',
      'catA3',
      'catB',
      'catB1',
      'catB2',
      'catB3',
      'catB7',
      'catB9',
      'catB10',
      'catP',
      'catQ',
      'cat_pC194',
      'cat_pC221',
      'cat_pC233',
    ],
    variants: [],
  },
  Clindamycin: {
    acquired: ['lnuA', 'lnuB', 'lnuC', 'lnuD', 'lnuF', 'lsaA', 'lsaB', 'lsaC', ..._ermSP],
    variants: ['23S_rRNA_a2062g'],
  },
  Erythromycin: {
    acquired: ['mefA_3', 'mefA_10', 'mefB', ..._ermSP],
    variants: ['23S_rRNA_a2062g'],
  },
  Fluoroquinolones: {
    acquired: [],
    variants: [
      'gyrA_S81F',
      'gyrA_S81Y',
      'gyrA_S81C',
      'gyrA_S81I',
      'gyrA_E85K',
      'gyrA_Q118K',
      'gyrB_E474K',
      'parC_A63T',
      'parC_S79F',
      'parC_S79Y',
      'parC_S79L',
      'parC_D83G',
      'parC_D83N',
      'parE_E474K',
      'parE_D435N',
      'parE_D435H',
      'parE_P454S',
    ],
  },
  Kanamycin: { acquired: ['aph_3prime_III_1'], variants: [] },
  Linezolid: { acquired: [], variants: [] },
  Tetracycline: {
    acquired: [
      'tet32',
      'tetK',
      'tetM_1',
      'tetM_2',
      'tetM_4',
      'tetM_5',
      'tetM_8',
      'tetM_10',
      'tetM_11',
      'tetM_12',
      'tetM_13',
      'tetS_M',
    ],
    variants: [],
  },
  Trimethoprim: { acquired: [], variants: ['folA_I100L'] },
  Sulfamethoxazole: { acquired: [], variants: ['folP_aa_insert_57-70'] },
  'Co-Trimoxazole': { acquired: [], variants: ['folP_aa_insert_57-70', 'folA_I100L'] },
};
