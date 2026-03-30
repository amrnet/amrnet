import { InfoOutlined, CheckCircleOutline, WarningAmber, FileDownload } from '@mui/icons-material';
import {
  Alert,
  Box,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import typhiCipNSRaw from '../../../../assets/typhiCipNS.json';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

// ISO3 → AMRnet country name for Typhi literature data matching
const TYPHI_ISO3_TO_AMRNET = {
  BGD: 'Bangladesh', NPL: 'Nepal', PAK: 'Pakistan', IND: 'India',
  KHM: 'Cambodia', VNM: 'Vietnam', LAO: 'Laos', IDN: 'Indonesia',
  PHL: 'Philippines', KEN: 'Kenya', TZA: 'Tanzania', ZWE: 'Zimbabwe',
  MWI: 'Malawi', ZMB: 'Zambia', ZAF: 'South Africa', GHA: 'Ghana',
  NGA: 'Nigeria', UGA: 'Uganda',
};

const CONCORDANCE_COLORS = {
  concordant: '#2e7d32',
  overestimate: '#e65100',
  underestimate: '#1565c0',
};


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
        Phenotypic ({d.phenoSourceLabel || 'GLASS'}): <strong>{d.x?.toFixed(1)}%</strong> ({d.phenoYearRange || d.phenoYear}, N={d.phenoTested})
      </Typography>
      <Typography variant="caption" display="block">
        Genomic (AMRnet): <strong>{d.y?.toFixed(1)}%</strong> (95% CI: {d.genomicCILower?.toFixed(1)}–{d.genomicCIUpper?.toFixed(1)}%, N={d.genomes})
      </Typography>
      <Typography variant="caption" display="block" sx={{ color: d.category === 'concordant' ? '#2e7d32' : '#d32f2f' }}>
        Difference: {diff > 0 ? '+' : ''}{diff.toFixed(1)} pp
        {d.category === 'concordant' ? ' (concordant — within 95% CI)' : diff > 0 ? ' (genomic overestimates)' : ' (genomic underestimates)'}
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
  const [phenoSource, setPhenoSource] = useState('typhi_literature'); // styphi only

  const organism = useAppSelector(state => state.dashboard.organism);
  const drugsCountriesData = useAppSelector(state => state.graph.drugsCountriesData);
  const rawOrganismData = useAppSelector(state => state.graph.rawOrganismData);
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
  const { scatterData, regression, stats, correlations, rawPhenoData } = useMemo(() => {
    const empty = { scatterData: [], regression: { slope: 0, intercept: 0, r2: 0 }, stats: null, correlations: null, rawPhenoData: [] };
    if (!glassIndicator || !drugsCountriesData || typeof drugsCountriesData !== 'object') {
      return empty;
    }
    // For typhi_literature, we don't need glassData
    if (organism !== 'styphi' || phenoSource !== 'typhi_literature') {
      if (!glassData) return empty;
    }

    // Get phenotypic data
    let phenoData = [];
    let phenoSourceLabel = 'GLASS';

    if (organism === 'styphi' && phenoSource === 'typhi_literature') {
      // Build from bundled Typhi-specific literature data (de-duplicated: keep most-recent year range per ISO3)
      const typhiByIso3 = {};
      typhiCipNSRaw.data.forEach(entry => {
        if (entry.cipNS_pct === null) return;
        const match = (entry.yearRange || '').match(/(\d{4})/g);
        const yearEnd = match ? parseInt(match[match.length - 1]) : 0;
        const existing = typhiByIso3[entry.iso3];
        if (!existing || yearEnd > (existing._yearEnd || 0)) {
          typhiByIso3[entry.iso3] = { ...entry, _yearEnd: yearEnd };
        }
      });
      phenoData = Object.values(typhiByIso3).map(entry => ({
        country: TYPHI_ISO3_TO_AMRNET[entry.iso3] || entry.country,
        year: entry._yearEnd,
        yearRange: entry.yearRange,
        value: entry.cipNS_pct,
        tested: entry.N ?? 'N/A',
        source: entry.source,
      }));
      phenoSourceLabel = 'Literature';
    } else if (glassIndicator.source === 'csv') {
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

    // For styphi: build per-country CipNS counts directly from rawOrganismData using
    // cip_pred_pheno column ('CipNS'|'CipR'|'CipS'). getDrugClassData's resistantCount is
    // unreliable for styphi because the susceptible 'None' gene also fires, making
    // resistantCount ≈ total. rawOrganismData gives an exact count per country.
    const styphiCipNSByCountry = {};
    if (organism === 'styphi' && rawOrganismData?.length) {
      rawOrganismData.forEach(item => {
        const key = normalize(item.COUNTRY_ONLY || '');
        if (!styphiCipNSByCountry[key]) styphiCipNSByCountry[key] = { total: 0, cipNS: 0 };
        styphiCipNSByCountry[key].total++;
        if (item.cip_pred_pheno === 'CipNS' || item.cip_pred_pheno === 'CipR') {
          styphiCipNSByCountry[key].cipNS++;
        }
      });
    }

    // Match countries (exact first, then normalized fallback)
    const points = [];
    drugEntries.forEach(entry => {
      const country = entry.name;
      const pheno = phenoByCountry[country] || phenoNormalized[normalize(country)];

      if (pheno && entry.count >= 20) {
        const resistant = organism === 'styphi'
          ? (styphiCipNSByCountry[normalize(country)]?.cipNS ?? 0)
          : entry.resistantCount || 0;
        const total = entry.count;
        const genomicPct = total > 0 ? (resistant / total) * 100 : 0;
        const diff = genomicPct - pheno.value;

        // Wilson score 95% CI for genomic estimate
        const ci = wilsonCI(resistant, total);

        // Assess temporal overlap
        const phenoYear = pheno.year;
        const phenoYearDisplay = pheno.yearRange || String(phenoYear);
        const amrnetRange = `${timeInitial || '?'}–${timeFinal || '?'}`;
        const yearOverlap = (phenoYear >= (timeInitial || 0) && phenoYear <= (timeFinal || 9999))
          ? `Yes (${phenoYearDisplay} within ${amrnetRange})`
          : `Limited (${phenoSourceLabel} ${phenoYearDisplay}, AMRnet ${amrnetRange})`;

        // Concordance: phenotypic value falls within the genomic 95% Wilson CI
        const ciConcordant = pheno.value >= ci.lower && pheno.value <= ci.upper;
        const category = ciConcordant ? 'concordant' : diff > 0 ? 'overestimate' : 'underestimate';

        const yVal = Number(genomicPct.toFixed(1));
        const ciLower = Number(ci.lower.toFixed(1));
        const ciUpper = Number(ci.upper.toFixed(1));

        points.push({
          country,
          x: Number(pheno.value.toFixed(1)),
          y: yVal,
          yError: [yVal - ciLower, ciUpper - yVal],
          genomes: total,
          genomicResistant: resistant,
          genomicCILower: ciLower,
          genomicCIUpper: ciUpper,
          phenoYear,
          phenoYearRange: pheno.yearRange || null,
          phenoTested: pheno.tested || 'N/A',
          phenoSourceLabel,
          diff: Number(diff.toFixed(1)),
          category,
          ciConcordant,
          color: CONCORDANCE_COLORS[category],
          yearOverlap,
        });
      }
    });

    if (points.length < 2) return { ...empty, scatterData: points };

    // Compute statistics — all counts derived from the same `category` field (CI overlap only)
    const concordant = points.filter(p => p.category === 'concordant').length;
    const overestimate = points.filter(p => p.category === 'overestimate').length;
    const underestimate = points.filter(p => p.category === 'underestimate').length;
    const meanAbsDiff = points.reduce((s, p) => s + Math.abs(p.diff), 0) / points.length;
    const sortedDiffs = [...points.map(p => Math.abs(p.diff))].sort((a, b) => a - b);
    const mid = Math.floor(sortedDiffs.length / 2);
    const medianAbsDiff = sortedDiffs.length % 2 === 0
      ? (sortedDiffs[mid - 1] + sortedDiffs[mid]) / 2
      : sortedDiffs[mid];

    // Weighted mean absolute difference (weighted by genomic sample size)
    const totalWeight = points.reduce((s, p) => s + p.genomes, 0);
    const weightedMAD = points.reduce((s, p) => s + Math.abs(p.diff) * p.genomes, 0) / (totalWeight || 1);

    const pears = pearsonR(points);
    const spear = spearmanRho(points);
    const reg = linearRegression(points);

    return {
      scatterData: points,
      rawPhenoData: phenoData,
      regression: reg,
      stats: {
        total: points.length,
        concordant,
        overestimate,
        underestimate,
        concordanceRate: ((concordant / points.length) * 100).toFixed(0),
        meanAbsDiff: meanAbsDiff.toFixed(1),
        medianAbsDiff: medianAbsDiff.toFixed(1),
        weightedMAD: weightedMAD.toFixed(1),
      },
      correlations: {
        pearson: pears,
        spearman: spear,
      },
    };
  }, [glassData, glassIndicator, drugsCountriesData, rawOrganismData, organism, timeInitial, timeFinal, phenoSource]);

  const downloadPhenoCSV = useCallback(() => {
    const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const toCSV = (headers, rows) =>
      [headers, ...rows].map(r => r.map(escape).join(',')).join('\n');

    let csv, filename;

    if (organism === 'styphi' && phenoSource === 'typhi_literature') {
      // Full literature dataset — include ALL entries (even null cipNS_pct) for transparency
      const headers = ['country', 'iso3', 'region', 'year_range', 'cip_ns_pct', 'cip_r_pct', 'n_tested', 'definition', 'notes', 'source', 'doi_or_url'];
      const rows = typhiCipNSRaw.data.map(r => [
        r.country, r.iso3, r.region, r.yearRange,
        r.cipNS_pct ?? '', r.cipR_pct ?? '', r.N ?? '',
        r.definition ?? '', r.notes ?? '', r.source ?? '', r.doi_or_url ?? '',
      ]);
      csv = toCSV(headers, rows);
      filename = 'amrnet_styphi_ciprofloxacin_phenotypic_literature.csv';
    } else if (rawPhenoData?.length) {
      // GLASS data (styphi+glass or any other organism)
      const hasSpecimen = rawPhenoData[0]?.specimen !== undefined;
      const indicator = glassIndicator?.label || 'WHO GLASS';
      const headers = ['country', 'iso3', 'year', 'percent_resistant', 'n_tested', ...(hasSpecimen ? ['specimen'] : []), 'indicator'];
      const rows = rawPhenoData.map(r => [
        r.country, r.countryCode || '', r.year, r.value ?? '',
        r.tested ?? '', ...(hasSpecimen ? [r.specimen || ''] : []), indicator,
      ]);
      csv = toCSV(headers, rows);
      filename = `amrnet_${organism}_phenotypic_glass.csv`;
    } else {
      return;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [organism, phenoSource, rawPhenoData, glassIndicator]);

  if (!canGetData) return null;

  return (
    <CardContent className={classes.genomicVsPhenotypicGraph}>
      <Box className={classes.controlsRow}>
        <Typography variant="body2" fontWeight={600}>
          Genomic (AMRnet) vs Phenotypic Resistance
        </Typography>
        <Tooltip title="Compares AMRnet genome-derived resistance predictions with phenotypic surveillance data. Each point = one country. Points on the diagonal = perfect agreement. Error bars = 95% Wilson score CI on the genomic estimate.">
          <InfoOutlined fontSize="small" sx={{ cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }} />
        </Tooltip>

        {/* Phenotypic data source selector — styphi only */}
        {organism === 'styphi' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Typography variant="caption" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>Phenotypic source:</Typography>
            <Select
              value={phenoSource}
              onChange={e => setPhenoSource(e.target.value)}
              size="small"
              sx={{ fontSize: '12px', minWidth: 240 }}
            >
              <MenuItem value="typhi_literature">Typhi-specific literature (recommended)</MenuItem>
              <MenuItem value="glass">WHO GLASS (Salmonella, includes NTS)</MenuItem>
            </Select>
            <Tooltip title={`Download phenotypic source data as CSV (${phenoSource === 'typhi_literature' ? 'Typhi literature dataset' : 'WHO GLASS Salmonella'})`}>
              <span>
                <IconButton size="small" onClick={downloadPhenoCSV} disabled={!rawPhenoData?.length && phenoSource !== 'typhi_literature'}>
                  <FileDownload fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )}

        {loading && organism !== 'styphi' && <CircularProgress size={16} />}
        {!loading && glassIndicator && organism !== 'styphi' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Chip label={glassIndicator.label} size="small" variant="outlined" color="primary" />
            <Tooltip title="Download phenotypic source data as CSV (WHO GLASS)">
              <span>
                <IconButton size="small" onClick={downloadPhenoCSV} disabled={!rawPhenoData?.length}>
                  <FileDownload fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )}
        {!loading && !glassIndicator && (
          <Chip label="No phenotypic data available for this organism" size="small" variant="outlined" color="warning" />
        )}
      </Box>

      {/* Decoli specimen caveat */}
      {organism === 'decoli' && (
        <Alert severity="info" sx={{ marginBottom: '8px', fontSize: '12px', padding: '2px 12px' }}>
          <strong>Specimen note:</strong> WHO GLASS 2022 does not include stool-based <em>E. coli</em> data. Phenotypic values shown are from blood and urine isolates, which may differ from enteric (diarrheagenic) strains.
        </Alert>
      )}

      {/* Styphi-specific data source warnings */}
      {organism === 'styphi' && phenoSource === 'glass' && (
        <Alert
          severity="warning"
          icon={<WarningAmber fontSize="small" />}
          sx={{ marginBottom: '8px', fontSize: '12px', padding: '2px 12px' }}
        >
          <strong>GLASS data caveat:</strong> WHO GLASS tracks all <em>Salmonella</em> bloodstream isolates — S. Typhi and non-typhoidal Salmonella (NTS) are <strong>not separated</strong>. CipNS rates differ substantially between Typhi and NTS. This comparison may be misleading. Consider switching to "Typhi-specific literature".
        </Alert>
      )}
      {organism === 'styphi' && phenoSource === 'typhi_literature' && (
        <Alert severity="info" sx={{ marginBottom: '8px', fontSize: '12px', padding: '2px 12px' }}>
          <strong>Typhi-specific phenotypic data</strong> from published surveillance studies (2008–2022). Country coverage is limited; year ranges vary per country. Not a single unified dataset. See methodology panel for sources.
        </Alert>
      )}

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
                {loading && !(organism === 'styphi' && phenoSource === 'typhi_literature')
                  ? 'Loading data...'
                  : 'No matching countries between AMRnet and phenotypic data (N≥20 genomes required).'}
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" domain={[0, 100]}>
                  <Label
                    value={organism === 'styphi' && phenoSource === 'typhi_literature'
                      ? 'Phenotypic CipNS — Literature (%)'
                      : 'Phenotypic Resistance — WHO GLASS (%)'}
                    position="bottom" offset={20} style={{ fontSize: 12 }}
                  />
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
                <Scatter data={scatterData}>
                  {scatterData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                  {/* 95% CI error bars on genomic estimate (Y-axis) */}
                  <ErrorBar
                    dataKey="yError"
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
                  {stats.concordanceRate}% (95% CI overlap)
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
              <strong>Concordance:</strong> A country is concordant if the phenotypic value falls within the 95% Wilson score CI of the AMRnet genomic estimate.
              <br /><br />
              <strong>Error bars:</strong> 95% Wilson score confidence intervals on the genomic proportion (more accurate than normal approximation for small N or extreme proportions).
              <br /><br />
              <strong>Correlations:</strong> Pearson r measures linear association. Spearman ρ measures rank correlation (robust to outliers and non-normal distributions).
              <br /><br />
              <strong>Drug mapping:</strong>{' '}
              {organism === 'styphi' && phenoSource === 'typhi_literature'
                ? 'Phenotypic = CipNS (I+R) from country-specific literature. Genomic = Ciprofloxacin NS markers (AMRnet). CipNS defined as ≥1 QRDR mutation (gyrA/parC) or acquired fluoroquinolone resistance gene.'
                : `${glassIndicator?.label || '—'}. AMRnet = genome-derived (${glassIndicator?.drug || '—'}). Note: genotypic and phenotypic definitions may differ.`
              }
              <br /><br />
              <strong>Caveats:</strong>{' '}
              {organism === 'styphi' && phenoSource === 'typhi_literature'
                ? '(1) Literature data uses different year ranges per country — not a single snapshot; (2) Most studies are hospital-based and may overestimate resistance vs community burden; (3) Genomic CipNS (QRDR mutations) may slightly overestimate phenotypic CipNS MIC ≥0.06 breakpoints; (4) AMRnet public genomes may over-represent resistant isolates.'
                : '(1) Time period mismatch — AMRnet pools across available years, GLASS uses single-year estimates; (2) Sampling bias — public genomes may over-represent resistant isolates; (3) Population differences — GLASS captures clinical specimens, AMRnet captures all public genomes.'
              }
              <br /><br />
              <strong>Bubble size</strong> ∝ AMRnet genome count.
            </Typography>
          </Box>
        </Box>
      </Box>
    </CardContent>
  );
};
