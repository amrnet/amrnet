// Stratified Resistance — bar chart of resistance prevalence broken down
// by either:
//   mode='source'  → source_niche / source_type (One Health framing)
//   mode='lin'     → LINcode_3 / _5 / _7 (Enterobase lineage clusters)
//
// Both modes share the same shape: filter rawOrganismData, group by the
// chosen stratum, compute resistance % per group, render horizontal bars.
//
// Available organisms (gated upstream in AMRInsights tab config):
//   source mode → senterica, sentericaints, ecoli, decoli, shige
//   lin mode    → ecoli, decoli, shige   (Enterobase only assigns LIN codes
//                                          for these three)

import { Box, CardContent, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../stores/hooks';
import { useStyles } from './StratifiedResistanceGraphMUI';
import { mixColorScale } from '../../Map/mapColorHelper';
import SHIGE_LINCODE_LOOKUP from '../../../../data/lincode_shigella_lookup.json';

// Per-species typing scheme labels shown in the legend and tooltips.
const SHIGE_TYPING_SCHEME = {
  Sf: 'FlexIt (Hawkey et al., in prep)',
  Ss: 'Hawkey 2021 genotypes',
  Sd: 'Serotype (Enterobase)',
  Sb: 'Serotype (Enterobase)',
};

// Returns the lookup entry for a raw Shigella LINcode prefix, or null.
function getShigeEntry(rawValue) {
  return SHIGE_LINCODE_LOOKUP[rawValue] ?? null;
}

// Returns display label: "SpeciesCode lineage" (e.g. "Sf 2.3.5"). Falls back to raw.
function translateShigeLINcode(rawValue) {
  const entry = getShigeEntry(rawValue);
  if (!entry) return rawValue;
  return entry.speciesCode ? `${entry.speciesCode} ${entry.lineage}` : entry.lineage;
}

// Quinolone marker regexes (mirrors filters.js — kept local to avoid an
// extra cross-component import dependency).
const QRDR_RE = /gyr[AB]|par[CE]/i;
const QNR_RE = /qnr[A-Z]/i;
const AAC_CR_RE = /aac.*Ib.*cr/i;
function countQuinoloneMarkers(raw) {
  if (!raw || raw === '-' || raw === 'ND') return 0;
  let n = 0;
  String(raw)
    .split(';')
    .forEach(e => {
      const g = e.trim();
      if (!g) return;
      if (QRDR_RE.test(g) || QNR_RE.test(g) || AAC_CR_RE.test(g)) n++;
    });
  return n;
}

// Cell predicate: column has a resistance hit (non-empty, non-'-', non-'ND').
function hasResColumn(item, col) {
  const v = item[col];
  return v != null && v !== '' && v !== '-' && v !== 'ND';
}

// Resistance evaluator for the ECOLI-family Enterobase schema. Keys match
// the canonical drug names exposed by statKeysSalmonella.
function isResistant(item, drugKey) {
  switch (drugKey) {
    case 'Ciprofloxacin':
    case 'Ciprofloxacin NS':
      return countQuinoloneMarkers(item['Quinolone']) >= 1;
    case 'Ciprofloxacin R':
      return countQuinoloneMarkers(item['Quinolone']) >= 2;
    case 'Aminoglycosides':
      return hasResColumn(item, 'Aminoglycoside');
    case 'Carbapenems':
    case 'ESBL':
    case 'Beta-lactam':
      return hasResColumn(item, 'Beta-lactam');
    case 'Macrolide':
    case 'Azithromycin':
      return hasResColumn(item, 'Macrolide');
    case 'Sulfonamides':
      return hasResColumn(item, 'Sulfonamide');
    case 'Tetracycline':
      return hasResColumn(item, 'Tetracycline');
    case 'Trimethoprim':
      return hasResColumn(item, 'Trimethoprim');
    case 'Chloramphenicol':
    case 'Phenicol':
      return hasResColumn(item, 'Phenicol');
    case 'Colistin':
      return hasResColumn(item, 'Colistin');
    case 'Fosfomycin':
      return hasResColumn(item, 'Fosfomycin');
    case 'Tigecycline':
      return hasResColumn(item, 'Tigecycline');
    case 'MDR': {
      let c = 0;
      if (hasResColumn(item, 'Quinolone')) c++;
      if (hasResColumn(item, 'Macrolide')) c++;
      if (hasResColumn(item, 'Beta-lactam')) c++;
      return c >= 2;
    }
    default:
      // Fallback: try the key as a column name directly.
      return hasResColumn(item, drugKey);
  }
}

// Drugs offered in the picker. Pansusceptible / XDR / etc. omitted —
// they're either inverse-prevalence or computed combinations that
// don't make sense here.
const DRUG_OPTIONS = [
  'Ciprofloxacin',
  'Aminoglycosides',
  'Carbapenems',
  'ESBL',
  'Macrolide',
  'Sulfonamides',
  'Tetracycline',
  'Trimethoprim',
  'Chloramphenicol',
  'Colistin',
  'Fosfomycin',
  'Tigecycline',
  'MDR',
];

// Modes
const SOURCE_FIELDS = [
  { value: 'source_niche', labelKey: 'amrInsights.stratified.fields.source_niche' },
  { value: 'source_type', labelKey: 'amrInsights.stratified.fields.source_type' },
];
const LIN_FIELDS = [
  { value: 'LINcode_3',  labelKey: 'amrInsights.stratified.fields.LINcode_3'  },
  { value: 'LINcode_5',  labelKey: 'amrInsights.stratified.fields.LINcode_5'  },
  { value: 'LINcode_7',  labelKey: 'amrInsights.stratified.fields.LINcode_7'  },
  { value: 'LINcode_9',  labelKey: 'amrInsights.stratified.fields.LINcode_9'  },
  { value: 'LINcode_11', labelKey: 'amrInsights.stratified.fields.LINcode_11' },
];

const MIN_N_OPTIONS_SOURCE = [20, 50, 200, 500];
const MIN_N_OPTIONS_LIN = [200, 500, 1000, 2000];
const TOP_N_OPTIONS = [10, 12, 20, 30];

const EMPTY_VALUES = new Set([null, '', '-', 'ND', undefined]);

export const StratifiedResistanceGraph = ({ mode = 'source' }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const organism = useAppSelector(state => state.dashboard.organism);
  const rawData = useAppSelector(state => state.graph.rawOrganismData);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);

  const [drug, setDrug] = useState('Ciprofloxacin');
  const [field, setField] = useState(mode === 'lin' ? 'LINcode_3' : 'source_niche');
  const [minN, setMinN] = useState(mode === 'lin' ? 200 : 20);
  const [topN, setTopN] = useState(mode === 'lin' ? 12 : 30);

  const fieldOptions = mode === 'lin' ? LIN_FIELDS : SOURCE_FIELDS;
  const minNOptions = mode === 'lin' ? MIN_N_OPTIONS_LIN : MIN_N_OPTIONS_SOURCE;

  const isShige = organism === 'shige';

  // Group + compute %
  const { rows, totalRecords, recordsWithField } = useMemo(() => {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return { rows: [], totalRecords: 0, recordsWithField: 0 };
    }
    const groups = {};
    let withField = 0;
    rawData.forEach(item => {
      const v = item[field];
      if (EMPTY_VALUES.has(v)) return;
      withField++;
      if (!groups[v]) {
        const label = (mode === 'lin' && isShige) ? translateShigeLINcode(v) : v;
        groups[v] = { name: v, label, total: 0, resistant: 0 };
      }
      groups[v].total++;
      if (isResistant(item, drug)) groups[v].resistant++;
    });

    const allRows = Object.values(groups)
      .filter(g => g.total >= minN)
      .map(g => ({
        ...g,
        pct: (g.resistant / g.total) * 100,
      }))
      .sort((a, b) => b.pct - a.pct);

    // For LIN mode, take top-N; for source, show all (usually <15 categories)
    const finalRows = mode === 'lin' ? allRows.slice(0, topN) : allRows;

    return { rows: finalRows, totalRecords: rawData.length, recordsWithField: withField };
  }, [rawData, field, drug, minN, topN, mode]);

  if (!canGetData) return null;

  const coveragePct = totalRecords > 0 ? ((recordsWithField / totalRecords) * 100).toFixed(1) : '0.0';

  return (
    <CardContent className={classes.stratifiedResistanceGraph}>
      <Box className={classes.controlsRow}>
        <Box className={classes.control}>
          <span className={classes.controlLabel}>{t('amrInsights.stratified.drugLabel')}</span>
          <Select size="small" value={drug} onChange={e => setDrug(e.target.value)} sx={{ minWidth: 180, fontSize: 13 }}>
            {DRUG_OPTIONS.map(d => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box className={classes.control}>
          <span className={classes.controlLabel}>{t('amrInsights.stratified.stratifyByLabel')}</span>
          <Select size="small" value={field} onChange={e => setField(e.target.value)} sx={{ minWidth: 200, fontSize: 13 }}>
            {fieldOptions.map(f => (
              <MenuItem key={f.value} value={f.value}>
                {t(f.labelKey)}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box className={classes.control}>
          <span className={classes.controlLabel}>{t('amrInsights.stratified.minNLabel')}</span>
          <Select size="small" value={minN} onChange={e => setMinN(e.target.value)} sx={{ minWidth: 100, fontSize: 13 }}>
            {minNOptions.map(n => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </Box>
        {mode === 'lin' && (
          <Box className={classes.control}>
            <span className={classes.controlLabel}>{t('amrInsights.stratified.topNLabel')}</span>
            <Select size="small" value={topN} onChange={e => setTopN(e.target.value)} sx={{ minWidth: 80, fontSize: 13 }}>
              {TOP_N_OPTIONS.map(n => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}
      </Box>

      <Box className={classes.chartArea}>
        {rows.length === 0 ? (
          <Box className={classes.emptyState}>
            {t('amrInsights.stratified.empty', {
              field: t(fieldOptions.find(f => f.value === field)?.labelKey ?? field),
              minN,
            })}
          </Box>
        ) : (
          <>
            {rows.map(r => {
              const color = mixColorScale(r.pct, false);
              const entry = mode === 'lin' && isShige ? getShigeEntry(r.name) : null;
              const tooltipContent = entry ? (
                <Box sx={{ fontSize: 12, lineHeight: 1.6 }}>
                  <div><strong>LINcode:</strong> {r.name}</div>
                  <div><strong>Typing:</strong> {SHIGE_TYPING_SCHEME[entry.speciesCode] ?? '—'}</div>
                  {entry.serotype && entry.serotype !== r.label && (
                    <div><strong>Serotype:</strong> {entry.serotype}</div>
                  )}
                  <div><strong>Purity:</strong> {(entry.purity * 100).toFixed(0)}%</div>
                </Box>
              ) : r.name;

              const labelEl = (
                <Box className={classes.label}>
                  {mode === 'lin' ? <code>{r.label ?? r.name}</code> : r.name}
                </Box>
              );

              return (
                <Box key={r.name} className={classes.row}>
                  {entry ? (
                    <Tooltip title={tooltipContent} arrow placement="right" enterDelay={300}>
                      {labelEl}
                    </Tooltip>
                  ) : (
                    <Box className={classes.label} title={r.name}>
                      {mode === 'lin' ? <code>{r.label ?? r.name}</code> : r.name}
                    </Box>
                  )}
                  <Box className={classes.barWrap}>
                    <Box
                      className={classes.bar}
                      sx={{
                        width: `${Math.max(r.pct, 0.5)}%`,
                        background: color,
                      }}
                    >
                      {r.pct.toFixed(1)}%
                    </Box>
                  </Box>
                  <Box className={classes.meta}>
                    {r.resistant.toLocaleString()} / {r.total.toLocaleString()}
                  </Box>
                </Box>
              );
            })}
            <Box className={classes.axis}>
              <Box />
              <Box className={classes.axisTicks}>
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </Box>
              <Box />
            </Box>
          </>
        )}
      </Box>

      <Typography component="div" className={classes.footer}>
        <strong>{t('amrInsights.stratified.coverageLabel')}</strong>{' '}
        {t('amrInsights.stratified.coverage', {
          withField: recordsWithField.toLocaleString(),
          total: totalRecords.toLocaleString(),
          pct: coveragePct,
          field,
        })}
        <br />
        <strong>{t('amrInsights.stratified.suppressLabel')}</strong>{' '}
        {t('amrInsights.stratified.suppress', { minN })}
        {mode === 'lin' && isShige && (
          <>
            <br />
            <strong>{t('amrInsights.stratified.typingSchemeLabel')}</strong>{' '}
            {t('amrInsights.stratified.typingSchemeShige')}
          </>
        )}
      </Typography>
    </CardContent>
  );
};
