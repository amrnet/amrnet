import { InfoOutlined } from '@mui/icons-material';
import {
  Box,
  CardContent,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';
import { useAppSelector } from '../../../../stores/hooks';
import { useStyles } from './QRDRPathwayGraphMUI';

// All QRDR mutation fields in S. Typhi
const STYPHI_QRDR_MUTATIONS = [
  'gyrA_S83F', 'gyrA_S83Y',
  'gyrA_D87A', 'gyrA_D87G', 'gyrA_D87N', 'gyrA_D87V', 'gyrA_D87Y',
  'gyrB_S464F', 'gyrB_S464Y',
  'gyrB_Q465L', 'gyrB_Q465R',
  'parC_S80I', 'parC_S80R',
  'parC_E84G', 'parC_E84K',
  'parE_D420N', 'parE_L416F',
];

const ACRB_MUTATIONS = ['acrB_R717Q', 'acrB_R717L'];

// N. gonorrhoeae QRDR mutations (from drugClassesRulesNG.Ciprofloxacin columns)
const NGONO_GYRA_MUTATIONS = ['gyrA_S91F', 'gyrA_D95G', 'gyrA_D95N'];
const NGONO_PARC_MUTATIONS = ['parC_D86N', 'parC_S87R', 'parC_S87I', 'parC_S88P', 'parC_E91Q'];

/**
 * Classify a single ngono genome into a named QRDR resistance pattern.
 *
 * QRDR_0  No gyrA S91F and no parC S87R → fully susceptible
 * QRDR_1  gyrA S91F only, no parC mutation → low-level resistance
 * QRDR_2  (gyrA S91F + D95G) OR (parC S87R) → intermediate resistance
 * QRDR_3  gyrA S91F + D95N + (parC D86N+S88P OR parC S87R+E91Q) → high-level resistance
 */
function classifyNgonoQRDR(item) {
  const has = col => item[col] === '1' || item[col] === 1;
  const hasS91F  = has('gyrA_S91F');
  const hasD95N  = has('gyrA_D95N');
  const hasD95G  = has('gyrA_D95G');
  const hasS87R  = has('parC_S87R');
  const hasD86N  = has('parC_D86N');
  const hasS88P  = has('parC_S88P');
  const hasE91Q  = has('parC_E91Q');

  // QRDR_3: gyrA S91F + D95N + specific parC combo
  if (hasS91F && hasD95N && ((hasD86N && hasS88P) || (hasS87R && hasE91Q))) return 'QRDR_3';
  // QRDR_2: gyrA S91F + D95G   OR   parC S87R alone
  if ((hasS91F && hasD95G) || hasS87R) return 'QRDR_2';
  // QRDR_1: gyrA S91F only
  if (hasS91F) return 'QRDR_1';
  // QRDR_0: no qualifying mutations
  return 'QRDR_0';
}

const NGONO_PATTERN_COLORS = {
  QRDR_0: '#4caf50',
  QRDR_1: '#ff9800',
  QRDR_2: '#f44336',
  QRDR_3: '#9c27b0',
  Other:  '#9e9e9e',
};

const NGONO_PATTERN_LABELS = {
  QRDR_0: 'QRDR_0 — Susceptible',
  QRDR_1: 'QRDR_1 — Low resistance (gyrA S91F)',
  QRDR_2: 'QRDR_2 — Intermediate (S91F+D95G or parC S87R)',
  QRDR_3: 'QRDR_3 — High resistance (S91F+D95N + parC combo)',
  Other:  'Other pattern',
};

const PATHWAY_COLORS = {
  '0 QRDR': '#4caf50',
  '1 QRDR': '#ff9800',
  '2 QRDR': '#f44336',
  '3+ QRDR': '#9c27b0',
};

const CIPRO_CATEGORY_COLORS = {
  'CipS': '#4caf50',
  'CipNS': '#ff9800',
  'CipR': '#d32f2f',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ backgroundColor: '#fff', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '4px' }}>
      <Typography variant="body2" fontWeight={600}>{label}</Typography>
      {payload.map((entry, i) => (
        <Typography key={i} variant="caption" display="block">
          {entry.name}: {entry.value} ({entry.payload?.count > 0 ? ((entry.value / entry.payload.count) * 100).toFixed(1) : 0}%)
        </Typography>
      ))}
      {payload[0]?.payload?.count && (
        <Typography variant="caption" display="block" color="textSecondary">
          Total: N={payload[0].payload.count}
        </Typography>
      )}
    </Box>
  );
};

export const QRDRPathwayGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [hoveredMutation, setHoveredMutation] = useState(null);

  const organism = useAppSelector(state => state.dashboard.organism);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const rawData = useAppSelector(state => state.graph.rawOrganismData);

  // Compute QRDR mutation pathway data from raw S. Typhi or N. gonorrhoeae data
  const { pathwayData, mutationPrevalence, totalGenomes, cipCorrelation, isNgono } = useMemo(() => {
    const empty = { pathwayData: [], mutationPrevalence: {}, totalGenomes: 0, cipCorrelation: [], isNgono: false };
    if (rawData.length === 0) return empty;

    // --- N. gonorrhoeae branch ---
    if (organism === 'ngono') {
      const total = rawData.length;
      const yearBuckets = {};
      const mutPrev = {};
      const cipBuckets = {
        QRDR_0: { CipS: 0, CipR: 0 },
        QRDR_1: { CipS: 0, CipR: 0 },
        QRDR_2: { CipS: 0, CipR: 0 },
        QRDR_3: { CipS: 0, CipR: 0 },
      };
      [...NGONO_GYRA_MUTATIONS, ...NGONO_PARC_MUTATIONS].forEach(m => { mutPrev[m] = 0; });

      rawData.forEach(item => {
        const year = typeof item.DATE === 'string' ? parseInt(item.DATE) : item.DATE;
        if (isNaN(year)) return;

        [...NGONO_GYRA_MUTATIONS, ...NGONO_PARC_MUTATIONS].forEach(m => {
          if (item[m] === '1' || item[m] === 1) mutPrev[m]++;
        });

        const pattern = classifyNgonoQRDR(item);
        if (!yearBuckets[year]) {
          yearBuckets[year] = { year, count: 0, QRDR_0: 0, QRDR_1: 0, QRDR_2: 0, QRDR_3: 0 };
        }
        yearBuckets[year].count++;
        yearBuckets[year][pattern]++;

        // Cipro phenotype: ngono uses binary Ciprofloxacin column (1 = resistant)
        if (item.Ciprofloxacin === '1' || item.Ciprofloxacin === 1) {
          cipBuckets[pattern].CipR++;
        } else {
          cipBuckets[pattern].CipS++;
        }
      });

      const pathway = Object.values(yearBuckets)
        .filter(y => y.count >= 10)
        .sort((a, b) => a.year - b.year);

      const cipData = Object.entries(cipBuckets).map(([pattern, counts]) => {
        const t = counts.CipS + counts.CipR;
        return { qrdr: pattern, ...counts, total: t };
      });

      return { pathwayData: pathway, mutationPrevalence: mutPrev, totalGenomes: total, cipCorrelation: cipData, isNgono: true };
    }

    // --- S. Typhi branch ---
    if (organism !== 'styphi') return empty;

    const total = rawData.length;
    const yearBuckets = {};
    const mutPrev = {};
    const cipBuckets = { '0': { CipS: 0, CipNS: 0, CipR: 0 }, '1': { CipS: 0, CipNS: 0, CipR: 0 }, '2': { CipS: 0, CipNS: 0, CipR: 0 }, '3+': { CipS: 0, CipNS: 0, CipR: 0 } };

    // Count individual mutation prevalence
    STYPHI_QRDR_MUTATIONS.forEach(m => { mutPrev[m] = 0; });
    ACRB_MUTATIONS.forEach(m => { mutPrev[m] = 0; });

    rawData.forEach(item => {
      const year = typeof item.DATE === 'string' ? parseInt(item.DATE) : item.DATE;
      if (isNaN(year)) return;

      // Count QRDR mutations
      let qrdrCount = 0;
      STYPHI_QRDR_MUTATIONS.forEach(m => {
        if (item[m] === '1' || item[m] === 1) {
          qrdrCount++;
          mutPrev[m]++;
        }
      });
      ACRB_MUTATIONS.forEach(m => {
        if (item[m] === '1' || item[m] === 1) mutPrev[m]++;
      });

      // Categorize
      const category = qrdrCount === 0 ? '0 QRDR' : qrdrCount === 1 ? '1 QRDR' : qrdrCount === 2 ? '2 QRDR' : '3+ QRDR';

      if (!yearBuckets[year]) {
        yearBuckets[year] = { year, count: 0, '0 QRDR': 0, '1 QRDR': 0, '2 QRDR': 0, '3+ QRDR': 0 };
      }
      yearBuckets[year].count++;
      yearBuckets[year][category]++;

      // Cipro correlation
      const cipKey = qrdrCount >= 3 ? '3+' : String(qrdrCount);
      const cipPheno = item.cip_pheno || item.CipR === '1' ? 'CipR' : item.CipNS === '1' ? 'CipNS' : 'CipS';
      if (item.CipR === '1' || item.cip_pred_pheno === 'CipR') {
        cipBuckets[cipKey].CipR++;
      } else if (item.CipNS === '1' || item.cip_pred_pheno === 'CipNS' || item.cip_pred_pheno === 'CipI') {
        cipBuckets[cipKey].CipNS++;
      } else {
        cipBuckets[cipKey].CipS++;
      }
    });

    // Build pathway data sorted by year, filter years with N≥10
    const pathway = Object.values(yearBuckets)
      .filter(y => y.count >= 10)
      .sort((a, b) => a.year - b.year);

    // Build cipro correlation data
    const cipData = Object.entries(cipBuckets).map(([qrdr, counts]) => {
      const total = counts.CipS + counts.CipNS + counts.CipR;
      return {
        qrdr: `${qrdr} mutations`,
        ...counts,
        total,
        pctR: total > 0 ? Number(((counts.CipR / total) * 100).toFixed(1)) : 0,
        pctNS: total > 0 ? Number((((counts.CipNS + counts.CipR) / total) * 100).toFixed(1)) : 0,
      };
    });

    return { pathwayData: pathway, mutationPrevalence: mutPrev, totalGenomes: total, cipCorrelation: cipData, isNgono: false };
  }, [rawData, organism]);

  if (!canGetData || (organism !== 'styphi' && organism !== 'ngono')) return null;

  return (
    <CardContent className={classes.qrdrPathwayGraph}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px' }}>
        <Typography variant="body2" fontWeight={600}>
          {isNgono ? 'QRDR Resistance Pattern Over Time' : 'QRDR Mutation Accumulation Over Time'}
        </Typography>
        <Tooltip title={isNgono
          ? 'Classifies N. gonorrhoeae genomes into QRDR_0–QRDR_3 patterns. QRDR_2: gyrA S91F+D95G or parC S87R. QRDR_3: gyrA S91F+D95N with parC D86N+S88P or S87R+E91Q.'
          : 'Shows how S. Typhi genomes accumulate QRDR (Quinolone Resistance-Determining Region) mutations over time. More mutations = higher ciprofloxacin resistance. Based on 17 tracked gyrA/gyrB/parC/parE mutations.'
        }>
          <InfoOutlined fontSize="small" sx={{ cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }} />
        </Tooltip>
      </Box>

      <Box className={classes.graphWrapper}>
        <Box className={classes.graph}>
          {pathwayData.length === 0 ? (
            <Box className={classes.noSelection}>
              <Typography variant="body2" color="textSecondary">No data available</Typography>
            </Box>
          ) : isNgono ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pathwayData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }} stackOffset="expand">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="QRDR_0" stackId="a" fill={NGONO_PATTERN_COLORS.QRDR_0} name={NGONO_PATTERN_LABELS.QRDR_0} />
                <Bar dataKey="QRDR_1" stackId="a" fill={NGONO_PATTERN_COLORS.QRDR_1} name={NGONO_PATTERN_LABELS.QRDR_1} />
                <Bar dataKey="QRDR_2" stackId="a" fill={NGONO_PATTERN_COLORS.QRDR_2} name={NGONO_PATTERN_LABELS.QRDR_2} />
                <Bar dataKey="QRDR_3" stackId="a" fill={NGONO_PATTERN_COLORS.QRDR_3} name={NGONO_PATTERN_LABELS.QRDR_3} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pathwayData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }} stackOffset="expand">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="0 QRDR" stackId="a" fill={PATHWAY_COLORS['0 QRDR']} name="0 QRDR (susceptible)" />
                <Bar dataKey="1 QRDR" stackId="a" fill={PATHWAY_COLORS['1 QRDR']} name="1 QRDR (reduced susceptibility)" />
                <Bar dataKey="2 QRDR" stackId="a" fill={PATHWAY_COLORS['2 QRDR']} name="2 QRDR (non-susceptible)" />
                <Bar dataKey="3+ QRDR" stackId="a" fill={PATHWAY_COLORS['3+ QRDR']} name="3+ QRDR (resistant)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>

        <Box className={classes.rightSide}>
          {/* Ngono: pattern legend */}
          {isNgono && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>QRDR Pattern Legend</Typography>
              {Object.entries(NGONO_PATTERN_LABELS).filter(([k]) => k !== 'Other').map(([key, label]) => (
                <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '2px' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '2px', backgroundColor: NGONO_PATTERN_COLORS[key], flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ fontSize: '9px' }}>{label}</Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Cipro correlation summary — both styphi and ngono */}
          <Typography variant="body2" fontWeight={600}>QRDR Pattern → Ciprofloxacin Phenotype</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px 0' }}>
            {cipCorrelation.map(d => (
              <Box key={d.qrdr} sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Typography variant="caption" sx={{ width: '65px', fontSize: '10px', fontWeight: 600 }}>{d.qrdr}</Typography>
                <Box sx={{ flex: 1, display: 'flex', height: '16px', borderRadius: '2px', overflow: 'hidden' }}>
                  {d.total > 0 && (
                    <>
                      <Box sx={{ width: `${(d.CipS / d.total) * 100}%`, backgroundColor: CIPRO_CATEGORY_COLORS.CipS }} />
                      {!isNgono && <Box sx={{ width: `${((d.CipNS ?? 0) / d.total) * 100}%`, backgroundColor: CIPRO_CATEGORY_COLORS.CipNS }} />}
                      <Box sx={{ width: `${(d.CipR / d.total) * 100}%`, backgroundColor: CIPRO_CATEGORY_COLORS.CipR }} />
                    </>
                  )}
                </Box>
                <Typography variant="caption" sx={{ fontSize: '9px', minWidth: '30px' }}>N={d.total}</Typography>
              </Box>
            ))}
            <Box sx={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Box sx={{ width: 8, height: 8, backgroundColor: CIPRO_CATEGORY_COLORS.CipS, borderRadius: '1px' }} />
                <Typography variant="caption" sx={{ fontSize: '9px' }}>CipS</Typography>
              </Box>
              {!isNgono && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Box sx={{ width: 8, height: 8, backgroundColor: CIPRO_CATEGORY_COLORS.CipNS, borderRadius: '1px' }} />
                  <Typography variant="caption" sx={{ fontSize: '9px' }}>CipNS</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Box sx={{ width: 8, height: 8, backgroundColor: CIPRO_CATEGORY_COLORS.CipR, borderRadius: '1px' }} />
                <Typography variant="caption" sx={{ fontSize: '9px' }}>CipR</Typography>
              </Box>
            </Box>
          </Box>

          {/* Individual mutation prevalence */}
          <Typography variant="body2" fontWeight={600} sx={{ marginTop: '8px' }}>Individual Mutation Prevalence</Typography>
          <Box className={classes.tooltipWrapper}>
            <Box className={classes.mutationGrid}>
              {(isNgono ? [...NGONO_GYRA_MUTATIONS, ...NGONO_PARC_MUTATIONS] : [...STYPHI_QRDR_MUTATIONS, ...ACRB_MUTATIONS])
                .filter(m => mutationPrevalence[m] > 0)
                .sort((a, b) => mutationPrevalence[b] - mutationPrevalence[a])
                .map(m => {
                  const pct = totalGenomes > 0 ? ((mutationPrevalence[m] / totalGenomes) * 100).toFixed(1) : 0;
                  return (
                    <Box
                      key={m}
                      className={classes.mutationChip}
                      sx={{ backgroundColor: pct > 10 ? '#ffebee' : pct > 1 ? '#fff3e0' : '#f5f5f5' }}
                    >
                      <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 600 }}>
                        {m.replace('_', ' ')}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '9px', color: '#666' }}>
                        {pct}%
                      </Typography>
                    </Box>
                  );
                })}
            </Box>
          </Box>
        </Box>
      </Box>
    </CardContent>
  );
};
