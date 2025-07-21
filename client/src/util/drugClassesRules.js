// Drug rules for Salmonella, where the column has to have one of the values to validate the rule. For frequencies and
// drug resistance graphs
export const drugRulesST = [
  { key: 'Ampicillin/Amoxicillin', columnID: 'blaTEM-1D', values: ['1'] },
  { key: 'Azithromycin', columnID: 'azith_pred_pheno', values: ['AzithR'] },
  {
    key: 'Chloramphenicol',
    columnID: 'chloramphenicol_category',
    values: ['ChlR'],
  },
  { key: 'Trimethoprim-sulfamethoxazole', columnID: 'co_trim', values: ['1'] },
  { key: 'Ceftriaxone', columnID: 'ESBL_category', values: ['ESBL'] },
  {
    key: 'Ciprofloxacin NS',
    columnID: 'cip_pred_pheno',
    values: ['CipNS'],
    legends: 'Ciprofloxacin (non-susceptible)',
  },
  // { key: 'Ciprofloxacin R', columnID: 'cip_pred_pheno', values: ['CipR'], legends: 'Ciprofloxacin (resistant)'  },
  { key: 'Sulfonamides', columnID: 'sul_any', values: ['1'] },
  { key: 'Tetracyclines', columnID: 'tetracycline_category', values: ['TetR'] },
  { key: 'Trimethoprim', columnID: 'dfra_any', values: ['1'] },
  { key: 'MDR', columnID: 'MDR', values: ['MDR'], legends: 'Multidrug resistant (MDR)' },
  { key: 'XDR', columnID: 'XDR', values: ['XDR'], legends: 'Extensively drug resistant (XDR)' },
  { key: 'Pansusceptible', columnID: 'amr_category', values: ['No AMR detected'] },
];

export const statKeysST = [
  { name: 'Ampicillin/Amoxicillin', column: 'blaTEM-1D', key: '1', resistanceView: true },
  { name: 'Azithromycin', column: 'azith_pred_pheno', key: 'AzithR', resistanceView: true },
  { name: 'Ceftriaxone', column: 'ESBL_category', key: 'ESBL', resistanceView: true },
  {
    name: 'Chloramphenicol',
    column: 'chloramphenicol_category',
    key: 'ChlR',
    resistanceView: true,
  },
  { name: 'CipNS', column: 'cip_pred_pheno', key: 'CipNS', resistanceView: true },
  { name: 'CipR', column: 'cip_pred_pheno', key: 'CipR', resistanceView: true },
  { name: 'XDR', column: 'XDR', key: 'XDR', resistanceView: true },
  { name: 'H58', column: 'GENOTYPE_SIMPLE', key: 'H58' },
  { name: 'MDR', column: 'MDR', key: 'MDR', resistanceView: true },
  // { name: 'Multidrug resistant (MDR)', column: 'MDR', key: 'MDR', resistanceView: true },
  // { name: 'Sulphonamides', column: 'sul_any', key: '1', resistanceView: true },
  // { name: 'Pansusceptible', column: 'amr_category', key: 'No AMR detected', resistanceView: true },
  // { name: 'Tetracyclines', column: 'tetracycline_category', key: 'TetR', resistanceView: true },
  // { name: 'Trimethoprim', column: 'dfra_any', key: '1', resistanceView: true },
  { name: 'Sulfonamides', column: 'sul_any', key: '1', resistanceView: true },
  { name: 'Tetracyclines', column: 'tetracycline_category', key: 'TetR', resistanceView: true },
  { name: 'Trimethoprim', column: 'dfra_any', key: '1', resistanceView: true },
  { name: 'Trimethoprim-sulfamethoxazole', column: 'co_trim', key: '1', resistanceView: true },
  { name: 'Pansusceptible', column: 'amr_category', key: 'No AMR detected', resistanceView: true },
];

// export const drugRulesForDrugResistanceGraphNG = [
//   { key: 'MDR', columnID: 'MDR', values: ['1'] },
//   { key: 'XDR', columnID: 'XDR', values: ['1'] }
// ];

export const drugRulesForDrugResistanceGraphNG = [
  { key: 'Azithromycin', columnID: ['Azithromycin'], values: ['1'] },
  { key: 'Ceftriaxone', columnID: ['CefR1'], values: ['1'] },
  { key: 'Ciprofloxacin', columnID: ['Ciprofloxacin'], values: ['1'] },
  { key: 'Sulfonamides', columnID: ['Sulfonamides'], values: ['1'] },
  { key: 'Tetracyclines', columnID: ['Tetracycline'], values: ['1'] },
  { key: 'Cefixime', columnID: ['Cefixime'], values: ['1'] },
  { key: 'Penicillin', columnID: ['Penicillin'], values: ['1'] },
  { key: 'Susceptible', columnID: ['Susceptible'], values: ['1'] },
  { key: 'Spectinomycin', columnID: ['Spectinomycin'], values: ['1'] },
  { key: 'MDR', columnID: 'MDR', values: ['1'] },
  { key: 'XDR', columnID: 'XDR', values: ['1'] },
];

// Drug rules for Klebsiella, where the column has to be any value other than '-' to validate the rule. For frequencies
// and drug resistance graphs
export const drugRulesKP = [
  { key: 'Aminoglycosides', columnIDs: ['AGly_acquired'] },
  { key: 'Carbapenems', columnIDs: ['Bla_Carb_acquired'] },
  { key: 'ESBL', columnIDs: ['Bla_ESBL_acquired', 'Bla_Carb_acquired', 'Bla_ESBL_inhR_acquired'] },
  // {
  //   key: '3rd gen cephalosporins (3GCs) + β-lactamase inhibitors',
  //   columnIDs: ['Bla_ESBL_inhR_acquired'],
  // },
  // { key: 'Ciprofloxacin S', columnIDs: ['Ciprofloxacin_prediction'], value: 'wildtype S' },
  // { key: 'CipR', columnIDs: ['Ciprofloxacin_prediction'], value: 'nonwildtype R' },
  // { key: 'Ciprofloxacin I', columnIDs: ['Ciprofloxacin_prediction'], value: 'nonwildtype I' },
  { key: 'Colistin', columnIDs: ['Col_acquired', 'Col_mutations'] },
  { key: 'CipR', columnIDs: ['Flq_acquired', 'Flq_mutations'] },
  { key: 'Fosfomycin', columnIDs: ['Fcyn_acquired'] },
  // { key: 'Penicillins', columnIDs: ['Bla_chr'] },
  // { key: 'β-lactamase inhibitors', columnIDs: ['Bla_inhR_acquired'] },
  { key: 'Phenicols', columnIDs: ['Phe_acquired'] },
  // { key: 'Sulfonamides', columnIDs: ['Sul_acquired'] },
  { key: 'Tetracyclines', columnIDs: ['Tet_acquired'] },
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
  // { name: 'Ciprofloxacin S', column: 'Ciprofloxacin_prediction', key: 'wildtype S', resistanceView: true },
  // { name: 'CipR', column: 'Ciprofloxacin_prediction', key: 'nonwildtype R', resistanceView: true },
  // { name: 'Ciprofloxacin I', column: 'Ciprofloxacin_prediction', key: 'nonwildtype I', resistanceView: true },
  {
    name: 'ESBL',
    column: ['Bla_ESBL_acquired', 'Bla_Carb_acquired', 'Bla_ESBL_inhR_acquired'],
    key: '-',
    resistanceView: true,
  },
  // { name: 'ESBL', column: 'Bla_ESBL_acquired', key: '-', resistanceView: true },
  {
    name: 'Fluoroquinolones',
    column: ['Flq_acquired', 'Flq_mutations'],
    key: '-',
    resistanceView: true,
  },
  { name: 'Fosfomycin', column: 'Fcyn_acquired', key: '-', resistanceView: true },
  // { name: 'Penicillins', column: 'Bla_chr', key: '-', resistanceView: true },
  // { name: 'β-lactamase inhibitors', column: 'Bla_Carb_acquired', key: '-', resistanceView: true},
  { name: 'Phenicols', column: 'Phe_acquired', key: '-', resistanceView: true },
  // { name: 'Sulfonamides', column: 'Phe_acquired', key: '-', resistanceView: true},
  { name: 'Tetracyclines', column: 'Tet_acquired', key: '-', resistanceView: true },
  { name: 'Tigecycline', column: 'Tgc_acquired', key: '-', resistanceView: true },
  { name: 'Trimethoprim', column: 'Tmt_acquired', key: '-', resistanceView: true },
  { name: 'Trimethoprim-sulfamethoxazole', column: ['Tmt_acquired', 'Sul_acquired'], key: '-', resistanceView: true }, //// TODO: need to update 'Trimethoprim-sulfamethoxazole column name
  { name: 'Pansusceptible', column: 'resistance_score', key: '0', resistanceView: true },
];

export const statKeysKPOnlyMarkers = [
  { name: 'SHV mutation', column: 'SHV_mutations', key: '-' },
  { name: 'Porin mutation', column: 'Omp_mutations', key: '-' },
];

// TODO: Duplicate of drugRulesForDrugResistanceGraphNG
export const drugRulesNG = [
  { key: 'Azithromycin', columnID: ['Azithromycin'], values: ['1'] },
  { key: 'Ceftriaxone', columnID: ['CefR1'], values: ['1'] },
  { key: 'Ciprofloxacin', columnID: ['Ciprofloxacin'], values: ['1'] },
  { key: 'Sulfonamides', columnID: ['Sulfonamides'], values: ['1'] },
  { key: 'Tetracyclines', columnID: ['Tetracycline'], values: ['1'] },
  { key: 'Cefixime', columnID: ['Cefixime'], values: ['1'] },
  { key: 'Penicillin', columnID: ['Penicillin'], values: ['1'] },
  {
    key: 'Pansusceptible',
    columnID: ['Susceptible'],
    values: ['1'],
    legends: 'Susceptible to cat I/II drugs',
  },
  { key: 'Spectinomycin', columnID: ['Spectinomycin'], values: ['1'] },
  { key: 'MDR', columnID: 'MDR', values: ['1'], legends: 'Multidrug resistant (MDR)' },
  { key: 'XDR', columnID: 'XDR', values: ['1'], legends: 'Extensively drug resistant (XDR)' },
];

export const statKeysNG = [
  { name: 'Azithromycin', column: 'Azithromycin', key: '1', resistanceView: true },
  { name: 'Cefixime', column: 'Cefixime', key: '1', resistanceView: true },
  { name: 'Ceftriaxone', column: 'CefR1', key: '1', resistanceView: true },
  { name: 'Ciprofloxacin', column: 'Ciprofloxacin', key: '1', resistanceView: true },
  { name: 'XDR', column: 'XDR', key: '1', resistanceView: true },
  { name: 'MDR', column: 'MDR', key: '1', resistanceView: true },
  { name: 'Penicillin', column: 'Penicillin', key: '1', resistanceView: true },
  { name: 'Spectinomycin', column: 'Spectinomycin', key: '1', resistanceView: true },
  { name: 'Sulfonamides', column: 'Sulfonamides', key: '1', resistanceView: true },
  { name: 'Tetracyclines', column: 'Tetracycline', key: '1', resistanceView: true },
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
    {
      name: 'acrB_R717Q + acrB_R717L',
      susceptible: false,
      rules: [
        { columnID: 'azith_pred_pheno', value: 'AzithR' },
        { columnID: 'acrB_R717Q', value: '1' },
        { columnID: 'acrB_R717L', value: '1' },
      ],
    },
    {
      name: 'acrB_R717Q',
      susceptible: false,
      rules: [
        { columnID: 'azith_pred_pheno', value: 'AzithR' },
        { columnID: 'acrB_R717Q', value: '1' },
        { columnID: 'acrB_R717L', value: '0' },
      ],
    },
    {
      name: 'acrB_R717L',
      susceptible: false,
      rules: [
        { columnID: 'azith_pred_pheno', value: 'AzithR' },
        { columnID: 'acrB_R717L', value: '1' },
        { columnID: 'acrB_R717Q', value: '0' },
      ],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'azith_pred_pheno', value: 'AzithS' }],
    },
  ],
  Chloramphenicol: [
    {
      name: 'catA1 + cmlA',
      susceptible: false,
      rules: [
        { columnID: 'chloramphenicol_category', value: 'ChlR' },
        { columnID: 'catA1', value: '1' },
        { columnID: 'cmlA', value: '1' },
      ],
    },
    {
      name: 'catA1',
      susceptible: false,
      rules: [
        { columnID: 'chloramphenicol_category', value: 'ChlR' },
        { columnID: 'catA1', value: '1' },
        { columnID: 'cmlA', value: '0' },
      ],
    },
    {
      name: 'cmlA',
      susceptible: false,
      rules: [
        { columnID: 'chloramphenicol_category', value: 'ChlR' },
        { columnID: 'cmlA', value: '1' },
        { columnID: 'catA1', value: '0' },
      ],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'chloramphenicol_category', value: 'ChlS' }],
    },
  ],
  // 'Co-trimoxazole': [
  'Trimethoprim-sulfamethoxazole': [
    {
      name: 'dfrA7 + dfrA14 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA7', value: '1' },
        { columnID: 'dfrA14', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'dfrA7 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA7', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'dfrA7 + sul1',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA7', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' },
      ],
    },
    {
      name: 'dfrA7 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA7', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'sul1', value: '0' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'dfrA14 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA7', value: '0' },
        { columnID: 'dfrA14', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'dfrA14 + sul1',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA7', value: '0' },
        { columnID: 'dfrA14', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' },
      ],
    },
    {
      name: 'dfrA14 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA7', value: '0' },
        { columnID: 'dfrA14', value: '1' },
        { columnID: 'sul1', value: '0' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'dfrA1 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA1', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'dfrA1 + sul1',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA1', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' },
      ],
    },
    {
      name: 'dfrA1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA1', value: '1' },
        { columnID: 'sul1', value: '0' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'dfrA5 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA5', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'dfrA5 + sul1',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA5', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' },
      ],
    },
    {
      name: 'dfrA5 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA5', value: '1' },
        { columnID: 'sul1', value: '0' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'dfrA15 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA15', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'dfrA15 + sul1',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA15', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' },
      ],
    },
    {
      name: 'dfrA15 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA15', value: '1' },
        { columnID: 'sul1', value: '0' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'dfrA17 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA17', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'dfrA17 + sul1',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA17', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' },
      ],
    },
    {
      name: 'dfrA17 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA17', value: '1' },
        { columnID: 'sul1', value: '0' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'dfrA18 + sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA18', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'dfrA18 + sul1',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA18', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' },
      ],
    },
    {
      name: 'dfrA18 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'co_trim', value: '1' },
        { columnID: 'dfrA18', value: '1' },
        { columnID: 'sul1', value: '0' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'co_trim', value: '0' }],
    },
  ],
  // ESBL: [
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
  'Ciprofloxacin NS': [
    {
      name: '3_QRDR + qnrS (CipR)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '3_QRDR + qnrS' }],
    },
    {
      name: '3_QRDR + qnrB (CipR)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '3_QRDR + qnrB' }],
    },
    {
      name: '3_QRDR (CipR)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '3_QRDR' }],
    },
    {
      name: '2_QRDR + qnrS (CipR)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '2_QRDR + qnrS' }],
    },
    {
      name: '2_QRDR + qnrB (CipR)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '2_QRDR + qnrB' }],
    },
    {
      name: '2_QRDR (CipR)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '2_QRDR' }],
    },
    {
      name: '1_QRDR + qnrS (CipNS)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '1_QRDR + qnrS' }],
    },
    {
      name: '1_QRDR + qnrB (CipNS)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '1_QRDR + qnrB' }],
    },
    {
      name: '1_QRDR (CipNS)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '1_QRDR' }],
    },
    {
      name: '0_QRDR + qnrS (CipNS)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '0_QRDR + qnrS' }],
    },
    {
      name: '0_QRDR + qnrB (CipNS)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '0_QRDR + qnrB' }],
    },
    {
      name: '0_QRDR + qnrS + qnrD (CipNS)',
      susceptible: false,
      rules: [{ columnID: 'dcs_mechanisms', value: '0_QRDR + qnrS + qnrD' }],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'dcs_mechanisms', value: '0_QRDR' }],
    },
  ],
  Sulfonamides: [
    {
      name: 'sul1 + sul2',
      susceptible: false,
      rules: [
        { columnID: 'sul_any', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '1' },
      ],
    },
    {
      name: 'sul1',
      susceptible: false,
      rules: [
        { columnID: 'sul_any', value: '1' },
        { columnID: 'sul1', value: '1' },
        { columnID: 'sul2', value: '0' },
      ],
    },
    {
      name: 'sul2',
      susceptible: false,
      rules: [
        { columnID: 'sul_any', value: '1' },
        { columnID: 'sul2', value: '1' },
        { columnID: 'sul1', value: '0' },
      ],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'sul_any', value: '0' }],
    },
  ],
  Tetracyclines: [
    {
      name: 'tetA(A)',
      susceptible: false,
      rules: [
        { columnID: 'tetracycline_category', value: 'TetR' },
        { columnID: 'tetA(A)', value: '1' },
      ],
    },
    {
      name: 'tetA(B)',
      susceptible: false,
      rules: [
        { columnID: 'tetracycline_category', value: 'TetR' },
        { columnID: 'tetA(B)', value: '1' },
      ],
    },
    {
      name: 'tetA(C)',
      susceptible: false,
      rules: [
        { columnID: 'tetracycline_category', value: 'TetR' },
        { columnID: 'tetA(C)', value: '1' },
      ],
    },
    {
      name: 'tetA(D)',
      susceptible: false,
      rules: [
        { columnID: 'tetracycline_category', value: 'TetR' },
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
    {
      name: 'dfrA7 + dfrA14',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA7', value: '1' },
        { columnID: 'dfrA14', value: '1' },
      ],
    },
    {
      name: 'dfrA7',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA7', value: '1' },
        { columnID: 'dfrA14', value: '0' },
      ],
    },
    {
      name: 'dfrA14',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA14', value: '1' },
        { columnID: 'dfrA7', value: '0' },
      ],
    },
    {
      name: 'dfrA1',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA1', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'dfrA7', value: '0' },
      ],
    },
    {
      name: 'dfrA5',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA5', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'dfrA7', value: '0' },
      ],
    },
    {
      name: 'dfrA15',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA15', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'dfrA7', value: '0' },
      ],
    },
    {
      name: 'dfrA17',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA17', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'dfrA7', value: '0' },
      ],
    },
    {
      name: 'dfrA18',
      susceptible: false,
      rules: [
        { columnID: 'dfra_any', value: '1' },
        { columnID: 'dfrA18', value: '1' },
        { columnID: 'dfrA14', value: '0' },
        { columnID: 'dfrA7', value: '0' },
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
  MDR: [
    {
      name: 'MDR',
      susceptible: false,
      rules: [{ columnID: 'MDR', value: 'MDR' }],
    },
    {
      name: 'Non-MDR',
      susceptible: true,
      rules: [{ columnID: 'MDR', value: '-' }],
    },
  ],
  XDR: [
    {
      name: 'XDR',
      susceptible: false,
      rules: [{ columnID: 'XDR', value: 'XDR' }],
    },
    {
      name: 'Non-XDR',
      susceptible: true,
      rules: [{ columnID: 'XDR', value: '-' }],
    },
  ],
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
      name: '23S_a2045g + mtrR_proDel',
      susceptible: false,
      rules: [{ columnID: 'AzithR1', value: '1' }],
    },
    {
      name: '23S_rDNA_a2045g + mtrR_G45D',
      susceptible: false,
      rules: [{ columnID: 'AzithR2', value: '1' }],
    },
    {
      name: 'mtrR_G45D + mtrC_loss + 23S_a2045g',
      susceptible: false,
      rules: [{ columnID: 'AzithR3', value: '1' }],
    },
    {
      name: '23S_c2597t + mtrR_proDel',
      susceptible: false,
      rules: [{ columnID: 'AzithR4', value: '1' }],
    },
    {
      name: '23S_c2597t + mtrR_A39T',
      susceptible: false,
      rules: [{ columnID: 'AzithR5', value: '1' }],
    },
    {
      name: '23S_c2597t + mtrR_G45D',
      susceptible: false,
      rules: [{ columnID: 'AzithR6', value: '1' }],
    },
    {
      name: '23S_c2597t',
      susceptible: false,
      rules: [{ columnID: 'AzithR7', value: '1' }],
    },
    {
      name: '23S_rDNA_c2597t + mtrC_loss',
      susceptible: false,
      rules: [{ columnID: 'AzithR8', value: '1' }],
    },
    {
      name: 'mtrC_loss + mtrD_mos2',
      susceptible: false,
      rules: [{ columnID: 'AzithR9', value: '1' }],
    },
    {
      name: 'mtrD_mos2 + mtr_mos2',
      susceptible: false,
      rules: [{ columnID: 'AzithR10', value: '1' }],
    },
    {
      name: 'mtr_mos2',
      susceptible: false,
      rules: [{ columnID: 'AzithR11', value: '1' }],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [
        { columnID: 'AzithR1', value: '0' },
        { columnID: 'AzithR2', value: '0' },
        { columnID: 'AzithR3', value: '0' },
        { columnID: 'AzithR4', value: '0' },
        { columnID: 'AzithR5', value: '0' },
        { columnID: 'AzithR6', value: '0' },
        { columnID: 'AzithR7', value: '0' },
        { columnID: 'AzithR8', value: '0' },
        { columnID: 'AzithR9', value: '0' },
        { columnID: 'AzithR10', value: '0' },
        { columnID: 'AzithR11', value: '0' },
      ],
    },
  ],
  Ceftriaxone: [
    {
      name: 'CefR1',
      susceptible: false,
      rules: [{ columnID: 'CefR1', value: '1' }],
    },
    {
      name: 'None',
      susceptible: true,
      rules: [{ columnID: 'CefR1', value: '0' }],
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
  { key: 'Ceftriaxone', columnID: 'BETA-LACTAM', values: ['CEPHALOSPORIN'] },
  {
    key: 'Chloramphenicol',
    columnID: 'PHENICOL',
    values: ['CHLORAMPHENICOL'],
  },
  // {
  //   key: 'Ciprofloxacin R',
  //   columnID: 'QUINOLONE',
  //   values: ['QUINOLONE'],
  //   legends: 'Ciprofloxacin (resistant)',
  // },
  {
    key: 'Ciprofloxacin NS',
    columnID: 'QUINOLONE',
    values: ['QUINOLONE'],
    legends: 'Ciprofloxacin (non-susceptible)',
  },
  { key: 'Colistin', columnID: 'COLISTIN', values: ['COLISTIN'] },
  { key: 'Gentamicin', columnID: 'AMINOGLYCOSIDE', values: ['GENTAMICIN', 'AMINOGLYCOSIDE'] },
  { key: 'Meropenem', columnID: 'BETA-LACTAM', values: ['CARBAPENEM'] },
  { key: 'Sulfamethoxazole', columnID: 'SULFONAMIDE', values: ['SULFONAMIDE'] },
  { key: 'Tetracyclines', columnID: 'TETRACYCLINE', values: ['TETRACYCLINE'] },
  { key: 'Tigecycline', columnID: 'TETRACYCLINE', values: ['TIGECYCLINE'] },
  { key: 'Trimethoprim', columnID: 'TRIMETHOPRIM', values: ['TRIMETHOPRIM'] },
  {
    key: 'Trimethoprim-sulfamethoxazole',
    requirements: [
      { columnID: 'SULFONAMIDE', values: ['SULFONAMIDE'] },
      { columnID: 'TRIMETHOPRIM', values: ['TRIMETHOPRIM,dfrA'] },
    ],
  },
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
  { name: 'Azithromycin', column: 'MACROLIDE', key: 'AZITHROMYCIN', resistanceView: true },
  { name: 'Ceftriaxone', column: 'BETA-LACTAM', key: 'CEPHALOSPORIN', resistanceView: true },
  { name: 'Chloramphenicol', column: 'PHENICOL', key: 'CHLORAMPHENICOL', resistanceView: true },
  { name: 'CipNS', column: 'QUINOLONE', key: 'QUINOLONE', resistanceView: true },
  { name: 'Colistin', column: 'COLISTIN', key: 'COLISTIN', resistanceView: true },
  {
    name: 'Gentamicin',
    column: 'AMINOGLYCOSIDE',
    key: ['GENTAMICIN', 'AMINOGLYCOSIDE'],
    resistanceView: true,
  },
  { name: 'Sulfamethoxazole', column: 'SULFONAMIDE', key: 'SULFONAMIDE', resistanceView: true },
  { name: 'Tetracyclines', column: 'TETRACYCLINE', key: 'TETRACYCLINE', resistanceView: true },
  { name: 'Tigecycline', column: 'TETRACYCLINE', key: 'TIGECYCLINE', resistanceView: true },
  { name: 'Trimethoprim', column: 'TRIMETHOPRIM', key: 'TRIMETHOPRIM', resistanceView: true },
  {
    name: 'Pansusceptible',
    column: drugRulesINTS.find(x => x.key === 'Pansusceptible').requirements.map(x => x.columnID),
    key: '-',
    resistanceView: true,
  },
  // { name: 'Trimethoprim-sulfamethoxazole', column: 'co_trim', key: '1', resistanceView: true },
];

// Used for shige, ecoli and decoli
export const statKeysECOLI = (() => {
  const items = [
    { name: 'Aminoglycosides', column: 'Aminoglycoside', key: '-', resistanceView: true },
    { name: 'Carbapenems', column: 'Carbapenemase', key: '-', resistanceView: true },
    { name: 'Ceftriaxone', column: 'ESBL', key: '-', resistanceView: true },
    { name: 'CipNS', column: 'Quinolone', key: '-', resistanceView: true },
    { name: 'Colistin', column: 'Colistin', key: '-', resistanceView: true },
    { name: 'Fosfomycin', column: 'Fosfomycin', key: '-', resistanceView: true },
    { name: 'Penicillins', column: 'Penicllin', key: '-', resistanceView: true },
    { name: 'Phenicols', column: 'Phenicol', key: '-', resistanceView: true },
    { name: 'Sulfamethoxazole', column: 'Sulfonamide', key: '-', resistanceView: true },
    { name: 'Tetracyclines', column: 'Tetracycline', key: '-', resistanceView: true },
    { name: 'Trimethoprim', column: 'Trimethoprim', key: '-', resistanceView: true },
    // { name: 'Ampicillin', column: 'BETA-LACTAM', key: 'BETA-LACTAM', resistanceView: true },
    // { name: 'Azithromycin', column: 'MACROLIDE', key: 'AZITHROMYCIN', resistanceView: true },
    // { name: 'Chloramphenicol', column: 'PHENICOL', key: 'CHLORAMPHENICOL', resistanceView: true },
    // { name: 'Tigecycline', column: 'TETRACYCLINE', key: 'TIGECYCLINE', resistanceView: true },
    // {
    //   name: 'Gentamicin',
    //   column: 'AMINOGLYCOSIDE',
    //   key: ['GENTAMICIN', 'AMINOGLYCOSIDE'],
    //   resistanceView: true,
    // },
    // { name: 'Trimethoprim-sulfamethoxazole', column: 'co_trim', key: '1', resistanceView: true },
  ];
  return items.concat({ name: 'Pansusceptible', column: items.map(x => x.column), key: '-', resistanceView: true });
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
