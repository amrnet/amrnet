import { InfoOutlined, CheckCircleOutline } from '@mui/icons-material';
import {
  Box,
  CardContent,
  Chip,
  CircularProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  ErrorBar,
  Label,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
  ZAxis,
  Cell,
} from 'recharts';
import { useAppSelector } from '../../../../stores/hooks';
import { fetchGLASSData, getGLASSIndicatorForOrganism, getGLASSPhenotypicByOrganismDrug } from '../../../../data/glass_data';
import { useStyles } from './GenomicVsPhenotypicGraphMUI';

const CONCORDANCE_COLORS = {
  concordant: '#2e7d32',
  overestimate: '#e65100',
  underestimate: '#1565c0',
};

const THRESHOLD_PP = 15; // Percentage points threshold for concordance

/**
 * Wilson score 95% confidence interval for a proportion.
 * More appropriate than normal approximation for small samples or extreme proportions.
 */
function wilsonCI(successes, total) {
  if (total === 0) return { lower: 0, upper: 0 };
  const p = successes / total;
  const z = 1.96; // 95% CI
  const z2 = z * z;
  const denom = 1 + z2 / total;
  const center = (p + z2 / (2 * total)) / denom;
  const margin = (z / denom) * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total));
  return {
    lower: Math.max(0, (center - margin) * 100),
    upper: Math.min(100, (center + margin) * 100),
  };
}

/**
 * Pearson correlation coefficient
 */
function pearsonR(data) {
  const n = data.length;
  if (n < 3) return { r: 0, r2: 0, p: 1 };
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  data.forEach(d => { sumX += d.x; sumY += d.y; sumXY += d.x * d.y; sumX2 += d.x * d.x; sumY2 += d.y * d.y; });
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const r = den > 0 ? num / den : 0;
  // Approximate p-value using t-distribution
  const t = r * Math.sqrt((n - 2) / (1 - r * r + 1e-10));
  // Simplified p-value approximation for |t| with n-2 df
  const df = n - 2;
  const p = df > 0 ? Math.exp(-0.717 * Math.abs(t) - 0.416 * t * t / df) : 1; // rough approximation
  return { r, r2: r * r, p: Math.min(1, p) };
}

/**
 * Spearman rank correlation
 */
function spearmanRho(data) {
  const n = data.length;
  if (n < 3) return { rho: 0, p: 1 };

  const rankArray = (arr) => {
    const sorted = [...arr].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const ranks = new Array(arr.length);
    let i = 0;
    while (i < sorted.length) {
      let j = i;
      while (j < sorted.length - 1 && sorted[j + 1].v === sorted[j].v) j++;
      const avgRank = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) ranks[sorted[k].i] = avgRank;
      i = j + 1;
    }
    return ranks;
  };

  const xRanks = rankArray(data.map(d => d.x));
  const yRanks = rankArray(data.map(d => d.y));

  let sumD2 = 0;
  for (let i = 0; i < n; i++) sumD2 += Math.pow(xRanks[i] - yRanks[i], 2);
  const rho = 1 - (6 * sumD2) / (n * (n * n - 1));
  // Approximate p-value
  const t = rho * Math.sqrt((n - 2) / (1 - rho * rho + 1e-10));
  const p = Math.exp(-0.717 * Math.abs(t) - 0.416 * t * t / Math.max(n - 2, 1));
  return { rho, p: Math.min(1, p) };
}

/**
 * Linear regression with slope, intercept, R²
 */
function linearRegression(data) {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  data.forEach(d => { sumX += d.x; sumY += d.y; sumXY += d.x * d.y; sumX2 += d.x * d.x; });
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const ssRes = data.reduce((s, d) => s + Math.pow(d.y - (slope * d.x + intercept), 2), 0);
  const ssTot = data.reduce((s, d) => s + Math.pow(d.y - sumY / n, 2), 0);
  return { slope, intercept, r2: ssTot > 0 ? 1 - ssRes / ssTot : 0 };
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const diff = d.y - d.x;
  return (
    <Box sx={{ backgroundColor: '#fff', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '4px', maxWidth: 300 }}>
      <Typography variant="body2" fontWeight={600}>{d.country}</Typography>
      <Typography variant="caption" display="block">
        Phenotypic (GLASS): <strong>{d.x?.toFixed(1)}%</strong> ({d.phenoYear}, N={d.phenoTested})
      </Typography>
      <Typography variant="caption" display="block">
        Genomic (AMRnet): <strong>{d.y?.toFixed(1)}%</strong> (95% CI: {d.genomicCILower?.toFixed(1)}–{d.genomicCIUpper?.toFixed(1)}%, N={d.genomes})
      </Typography>
      <Typography variant="caption" display="block" sx={{ color: Math.abs(diff) <= THRESHOLD_PP ? '#2e7d32' : '#d32f2f' }}>
        Difference: {diff > 0 ? '+' : ''}{diff.toFixed(1)} pp
        {Math.abs(diff) <= THRESHOLD_PP ? ' (concordant)' : diff > 0 ? ' (genomic overestimates)' : ' (genomic underestimates)'}
      </Typography>
      {d.yearOverlap && (
        <Typography variant="caption" display="block" color="textSecondary">
          Time period overlap: {d.yearOverlap}
        </Typography>
      )}
    </Box>
  );
};

export const GenomicVsPhenotypicGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [glassData, setGlassData] = useState(null);
  const [loading, setLoading] = useState(true);

  const organism = useAppSelector(state => state.dashboard.organism);
  const drugsCountriesData = useAppSelector(state => state.graph.drugsCountriesData);
  const timeInitial = useAppSelector(state => state.dashboard.timeInitial);
  const timeFinal = useAppSelector(state => state.dashboard.timeFinal);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);

  const glassIndicator = useMemo(() => getGLASSIndicatorForOrganism(organism), [organism]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchGLASSData()
      .then(data => { if (!cancelled) setGlassData(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Build comparison data with proper statistics
  const { scatterData, regression, stats, correlations } = useMemo(() => {
    const empty = { scatterData: [], regression: { slope: 0, intercept: 0, r2: 0 }, stats: null, correlations: null };
    if (!glassData || !glassIndicator || !drugsCountriesData || typeof drugsCountriesData !== 'object') {
      return empty;
    }

    // Get phenotypic data from GLASS (GHO API or CSV depending on organism)
    let phenoData = [];
    if (glassIndicator.source === 'csv') {
      phenoData = getGLASSPhenotypicByOrganismDrug(glassData, glassIndicator.pathogen, glassIndicator.antibiotic, glassIndicator.specimen);
    } else if (organism === 'ngono') {
      phenoData = Array.isArray(glassData.resistance?.ng_ciprofloxacin) ? glassData.resistance.ng_ciprofloxacin : [];
    } else if (organism === 'saureus') {
      phenoData = glassData.resistance?.mrsa || [];
    } else {
      phenoData = glassData.resistance?.ecoli_3gc || [];
    }

    if (phenoData.length === 0) return empty;

    // Build phenotypic lookup: latest year per country
    const phenoByCountry = {};
    phenoData.forEach(r => {
      if (!phenoByCountry[r.country] || r.year > phenoByCountry[r.country].year) {
        phenoByCountry[r.country] = r;
      }
    });

    // Get genomic data from AMRnet
    const drugEntries = drugsCountriesData[glassIndicator.drug];
    if (!Array.isArray(drugEntries)) return empty;

    // Build a normalized lookup for fuzzy country matching
    const normalize = s => s?.toLowerCase().replace(/[^a-z]/g, '') || '';
    const phenoNormalized = {};
    Object.keys(phenoByCountry).forEach(c => { phenoNormalized[normalize(c)] = phenoByCountry[c]; });

    // Match countries (exact first, then normalized fallback)
    const points = [];
    drugEntries.forEach(entry => {
      const country = entry.name;
      const pheno = phenoByCountry[country] || phenoNormalized[normalize(country)];

      if (pheno && entry.count >= 20) {
        const resistant = entry.resistantCount || 0;
        const total = entry.count;
        const genomicPct = total > 0 ? (resistant / total) * 100 : 0;
        const diff = genomicPct - pheno.value;

        // Wilson score 95% CI for genomic estimate
        const ci = wilsonCI(resistant, total);

        // Assess temporal overlap
        const phenoYear = pheno.year;
        const amrnetRange = `${timeInitial || '?'}–${timeFinal || '?'}`;
        const yearOverlap = (phenoYear >= (timeInitial || 0) && phenoYear <= (timeFinal || 9999))
          ? `Yes (${phenoYear} within ${amrnetRange})`
          : `Limited (GLASS ${phenoYear}, AMRnet ${amrnetRange})`;

        let category;
        // Use CI overlap for concordance instead of fixed threshold:
        // If the phenotypic value falls within the genomic 95% CI, they are concordant
        const ciConcordant = pheno.value >= ci.lower && pheno.value <= ci.upper;
        if (ciConcordant || Math.abs(diff) <= THRESHOLD_PP) category = 'concordant';
        else if (diff > 0) category = 'overestimate';
        else category = 'underestimate';

        points.push({
          country,
          x: Number(pheno.value.toFixed(1)),
          y: Number(genomicPct.toFixed(1)),
          genomes: total,
          genomicResistant: resistant,
          genomicCILower: Number(ci.lower.toFixed(1)),
          genomicCIUpper: Number(ci.upper.toFixed(1)),
          phenoYear,
          phenoTested: pheno.tested || 'N/A',
          diff: Number(diff.toFixed(1)),
          category,
          ciConcordant,
          color: CONCORDANCE_COLORS[category],
          yearOverlap,
        });
      }
    });

    if (points.length < 2) return { ...empty, scatterData: points };

    // Compute statistics
    const concordant = points.filter(p => p.category === 'concordant').length;
    const ciConcordantCount = points.filter(p => p.ciConcordant).length;
    const overestimate = points.filter(p => p.category === 'overestimate').length;
    const underestimate = points.filter(p => p.category === 'underestimate').length;
    const meanAbsDiff = points.reduce((s, p) => s + Math.abs(p.diff), 0) / points.length;
    const medianAbsDiff = [...points.map(p => Math.abs(p.diff))].sort((a, b) => a - b)[Math.floor(points.length / 2)];

    // Weighted mean absolute difference (weighted by genomic sample size)
    const totalWeight = points.reduce((s, p) => s + p.genomes, 0);
    const weightedMAD = points.reduce((s, p) => s + Math.abs(p.diff) * p.genomes, 0) / (totalWeight || 1);

    const pears = pearsonR(points);
    const spear = spearmanRho(points);
    const reg = linearRegression(points);

    return {
      scatterData: points,
      regression: reg,
      stats: {
        total: points.length,
        concordant,
        ciConcordantCount,
        overestimate,
        underestimate,
        concordanceRate: ((concordant / points.length) * 100).toFixed(0),
        ciConcordanceRate: ((ciConcordantCount / points.length) * 100).toFixed(0),
        meanAbsDiff: meanAbsDiff.toFixed(1),
        medianAbsDiff: medianAbsDiff.toFixed(1),
        weightedMAD: weightedMAD.toFixed(1),
      },
      correlations: {
        pearson: pears,
        spearman: spear,
      },
    };
  }, [glassData, glassIndicator, drugsCountriesData, organism, timeInitial, timeFinal]);

  if (!canGetData) return null;

  return (
    <CardContent className={classes.genomicVsPhenotypicGraph}>
      <Box className={classes.controlsRow}>
        <Typography variant="body2" fontWeight={600}>
          Genomic (AMRnet) vs Phenotypic (WHO GLASS) Resistance
        </Typography>
        <Tooltip title={`Compares AMRnet genome-derived resistance predictions with WHO GLASS phenotypic surveillance data. Each point = one country. Points on the diagonal = perfect agreement. Error bars = 95% Wilson score CI on the genomic estimate.`}>
          <InfoOutlined fontSize="small" sx={{ cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }} />
        </Tooltip>
        {loading && <CircularProgress size={16} />}
        {!loading && glassIndicator && (
          <Chip label={glassIndicator.label} size="small" variant="outlined" color="primary" />
        )}
        {!loading && !glassIndicator && (
          <Chip label="No GLASS data available for this organism" size="small" variant="outlined" color="warning" />
        )}
      </Box>

      <Box className={classes.graphWrapper}>
        <Box className={classes.graph}>
          {!glassIndicator ? (
            <Box className={classes.noSelection}>
              <Typography variant="body2" color="textSecondary">
                No GLASS phenotypic data available for this organism.
              </Typography>
            </Box>
          ) : scatterData.length === 0 ? (
            <Box className={classes.noSelection}>
              <Typography variant="body2" color="textSecondary">
                {loading ? 'Loading GLASS data...' : 'No matching countries between AMRnet and GLASS data.'}
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" domain={[0, 100]}>
                  <Label value="Phenotypic Resistance — WHO GLASS (%)" position="bottom" offset={20} style={{ fontSize: 12 }} />
                </XAxis>
                <YAxis type="number" dataKey="y" domain={[0, 100]}>
                  <Label value="Genomic Resistance — AMRnet (%)" angle={-90} position="insideLeft" offset={10} style={{ fontSize: 12, textAnchor: 'middle' }} />
                </YAxis>
                <ZAxis type="number" dataKey="genomes" range={[40, 300]} name="Genomes" />
                <ChartTooltip content={<CustomTooltip />} />
                {/* Perfect agreement diagonal */}
                <ReferenceLine
                  ifOverflow="extendDomain"
                  segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
                  stroke="#333"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  label={{ value: 'Perfect agreement', position: 'end', fontSize: 10, fill: '#666' }}
                />
                {/* ±15pp concordance band */}
                <ReferenceLine ifOverflow="extendDomain" segment={[{ x: 0, y: THRESHOLD_PP }, { x: 100 - THRESHOLD_PP, y: 100 }]} stroke="#e0e0e0" strokeWidth={0.5} />
                <ReferenceLine ifOverflow="extendDomain" segment={[{ x: THRESHOLD_PP, y: 0 }, { x: 100, y: 100 - THRESHOLD_PP }]} stroke="#e0e0e0" strokeWidth={0.5} />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                  {/* 95% CI error bars on genomic estimate (Y-axis) */}
                  <ErrorBar
                    dataKey="y"
                    width={4}
                    strokeWidth={1}
                    stroke="#666"
                    direction="y"
                  />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </Box>

        <Box className={classes.rightSide}>
          {stats && correlations && (
            <>
              {/* Correlation Statistics */}
              <Typography variant="body2" fontWeight={600}>Correlation Statistics</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '4px 0' }}>
                <Typography variant="caption">
                  <strong>Pearson r</strong> = {correlations.pearson.r.toFixed(3)} (R² = {correlations.pearson.r2.toFixed(3)}, p {correlations.pearson.p < 0.001 ? '< 0.001' : `≈ ${correlations.pearson.p.toFixed(3)}`})
                </Typography>
                <Typography variant="caption">
                  <strong>Spearman ρ</strong> = {correlations.spearman.rho.toFixed(3)} (p {correlations.spearman.p < 0.001 ? '< 0.001' : `≈ ${correlations.spearman.p.toFixed(3)}`})
                </Typography>
                <Typography variant="caption">
                  <strong>Regression</strong>: y = {regression.slope.toFixed(2)}x + {regression.intercept.toFixed(1)}
                </Typography>
              </Box>

              {/* Concordance */}
              <Typography variant="body2" fontWeight={600} sx={{ marginTop: '4px' }}>Concordance</Typography>
              <Box className={classes.statsRow}>
                <Box className={classes.concordanceBadge} sx={{ backgroundColor: '#e8f5e9', color: '#1b5e20' }}>
                  <CheckCircleOutline sx={{ fontSize: 14 }} />
                  {stats.ciConcordanceRate}% (95% CI overlap)
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: CONCORDANCE_COLORS.concordant }} />
                  <Typography variant="caption">Concordant: {stats.concordant}/{stats.total}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: CONCORDANCE_COLORS.overestimate }} />
                  <Typography variant="caption">Genomic overestimates: {stats.overestimate}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: CONCORDANCE_COLORS.underestimate }} />
                  <Typography variant="caption">Genomic underestimates: {stats.underestimate}</Typography>
                </Box>
              </Box>

              {/* Error metrics */}
              <Typography variant="body2" fontWeight={600} sx={{ marginTop: '4px' }}>Error Metrics</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <Typography variant="caption">Mean absolute diff: <strong>{stats.meanAbsDiff} pp</strong></Typography>
                <Typography variant="caption">Median absolute diff: <strong>{stats.medianAbsDiff} pp</strong></Typography>
                <Typography variant="caption">Weighted MAD (by N): <strong>{stats.weightedMAD} pp</strong></Typography>
                <Typography variant="caption">Countries compared: <strong>{stats.total}</strong></Typography>
              </Box>
            </>
          )}

          {/* Methodology */}
          <Typography variant="body2" fontWeight={600} sx={{ marginTop: '4px' }}>Methodology</Typography>
          <Box className={classes.tooltipWrapper}>
            <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
              <strong>Matching:</strong> Countries present in both AMRnet and GLASS (N≥20 AMRnet genomes, N≥10 GLASS isolates tested).
              <br /><br />
              <strong>Concordance:</strong> A country is concordant if the GLASS phenotypic value falls within the 95% Wilson score CI of the AMRnet genomic estimate, OR if the absolute difference is ≤{THRESHOLD_PP} pp.
              <br /><br />
              <strong>Error bars:</strong> 95% Wilson score confidence intervals on the genomic proportion (more accurate than normal approximation for small N or extreme proportions).
              <br /><br />
              <strong>Correlations:</strong> Pearson r measures linear association. Spearman ρ measures rank correlation (robust to outliers and non-normal distributions).
              <br /><br />
              <strong>Drug mapping:</strong> {glassIndicator?.label || '—'}. AMRnet = genome-derived ({glassIndicator?.drug || '—'}). Note: genotypic and phenotypic definitions may differ.
              <br /><br />
              <strong>Caveats:</strong> (1) Time period mismatch — AMRnet pools across available years, GLASS uses single-year estimates; (2) Sampling bias — public genomes may over-represent resistant isolates; (3) Population differences — GLASS captures clinical specimens, AMRnet captures all public genomes.
              <br /><br />
              <strong>Bubble size</strong> ∝ AMRnet genome count.
            </Typography>
          </Box>
        </Box>
      </Box>
    </CardContent>
  );
};
