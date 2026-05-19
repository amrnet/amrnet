import { InfoOutlined, FileDownload } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { PlottingOptionsHeader } from '../../Shared/PlottingOptionsHeader';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
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
import { fetchGLASSData } from '../../../../data/glass_data';
import { getATBClassesForOrganism, getAmrnetDrugsForATBClass } from '../../../../util/atbDrugMapping';
import { getResistantDrugs } from '../../../../util/resistance';
import { getCountryDisplayName } from '../../../Dashboard/filters';
import { useStyles } from './ATBCorrelationGraphMUI';

// WHO GLASS public-facing landing pages — used for the Data Sources panel.
const GLASS_AMU_URL = 'https://www.who.int/data/gho/data/themes/topics/global-antimicrobial-resistance-and-use-surveillance-system-glass-database';
const AMRNET_DOCS_URL = 'https://amrnet.readthedocs.io';

// Dynamic color palette for regions (AMRnet uses UN sub-regions from UNR data)
const REGION_COLOR_PALETTE = [
  '#006cde', '#cd3cbe', '#00ac35', '#e65c00', '#785EF0', '#FFB000',
  '#A50026', '#1a6b8a', '#c0392b', '#2e7d32', '#ff7f4f', '#1abc9c',
];

/**
 * Build a country-to-region lookup from AMRnet's economicRegions (Redux).
 * This uses the exact same UN sub-region mapping that the rest of AMRnet uses.
 */
function buildCountryToRegion(economicRegions) {
  const map = {};
  if (!economicRegions || typeof economicRegions !== 'object') return map;
  Object.entries(economicRegions).forEach(([region, countries]) => {
    if (Array.isArray(countries)) {
      countries.forEach(c => { map[c] = region; });
    }
  });
  return map;
}

function linearRegression(data) {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  data.forEach(d => { sumX += d.x; sumY += d.y; sumXY += d.x * d.y; sumX2 += d.x * d.x; });
  // Guard against zero denominator (all x values equal) and any NaN/Infinity
  // that could otherwise propagate into the chart and crash Recharts.
  const denom = n * sumX2 - sumX * sumX;
  if (!Number.isFinite(denom) || denom === 0) {
    return { slope: 0, intercept: sumY / n, r2: 0 };
  }
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  if (!Number.isFinite(slope) || !Number.isFinite(intercept)) {
    return { slope: 0, intercept: 0, r2: 0 };
  }
  const ssRes = data.reduce((s, d) => s + Math.pow(d.y - (slope * d.x + intercept), 2), 0);
  const ssTot = data.reduce((s, d) => s + Math.pow(d.y - sumY / n, 2), 0);
  return { slope, intercept, r2: ssTot > 0 ? 1 - ssRes / ssTot : 0 };
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  return (
    <Box sx={{ backgroundColor: '#fff', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '4px' }}>
      <Typography variant="body2" fontWeight={600}>{data.country}</Typography>
      <Typography variant="caption" display="block">
        AM consumption (WHO GLASS): {data.x?.toFixed(2)} DDD/1000/day ({data.consumptionYear})
      </Typography>
      <Typography variant="caption" display="block">
        Genomic %R (AMRnet): {data.y?.toFixed(1)}% — {data.resistant}/{data.genomes} genomes
      </Typography>
      {data.classDrugs?.length > 0 && (
        <Typography variant="caption" display="block" color="textSecondary">
          Aggregated over: {data.classDrugs.join(', ')}
        </Typography>
      )}
      <Typography variant="caption" display="block" color="textSecondary">Region: {data.region}</Typography>
    </Box>
  );
};

export const ATBCorrelationGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [selectedATBClass, setSelectedATBClass] = useState('Fluoroquinolones');
  const [showTrendLine, setShowTrendLine] = useState(true);
  const [glassData, setGlassData] = useState(null);
  const [loadingGlass, setLoadingGlass] = useState(false);
  const [dataSource, setDataSource] = useState('glass');

  const organism = useAppSelector(state => state.dashboard.organism);
  const rawOrganismData = useAppSelector(state => state.graph.rawOrganismData);
  const economicRegions = useAppSelector(state => state.dashboard.economicRegions);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const actualTimeInitial = useAppSelector(state => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector(state => state.dashboard.actualTimeFinal);

  // Build country→region lookup from AMRnet's own region mapping
  const countryToRegion = useMemo(() => buildCountryToRegion(economicRegions), [economicRegions]);

  // Assign colors to regions dynamically
  const regionColors = useMemo(() => {
    const regions = [...new Set(Object.values(countryToRegion))].sort();
    const colors = {};
    regions.forEach((r, i) => { colors[r] = REGION_COLOR_PALETTE[i % REGION_COLOR_PALETTE.length]; });
    colors['Unknown'] = '#999';
    return colors;
  }, [countryToRegion]);

  const atbClasses = useMemo(() => {
    // Show every ATB class that has an AMRnet drug mapping for this organism.
    // Previously this filter only kept classes with a matching GLASS pheno
    // indicator; the Y-axis now uses AMRnet genomic data so the filter no
    // longer needs to gate on GLASS pheno coverage.
    return getATBClassesForOrganism(organism).filter(
      cls => getAmrnetDrugsForATBClass(organism, cls).length > 0,
    );
  }, [organism]);

  // Reset selected class when organism changes
  useEffect(() => {
    if (atbClasses.length > 0 && !atbClasses.includes(selectedATBClass)) {
      setSelectedATBClass(atbClasses[0]);
    }
  }, [atbClasses, selectedATBClass]);

  // Fetch GLASS data on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingGlass(true);
    fetchGLASSData()
      .then(data => {
        if (!cancelled && data?.consumption?.length > 0) {
          setGlassData(data);
          setDataSource('glass');
        }
      })
      .catch(() => {
        setDataSource('static');
      })
      .finally(() => {
        if (!cancelled) setLoadingGlass(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Build scatter data — Y axis is AMRnet genomic %R per ATB class
  // (computed from rawOrganismData using the same drug-rules engine the
  // rest of AMRnet uses). X axis stays as WHO GLASS AM consumption.
  const { scatterData, regression } = useMemo(() => {
    if (!selectedATBClass) {
      return { scatterData: [], regression: { slope: 0, intercept: 0, r2: 0 } };
    }

    const amrnetDrugs = getAmrnetDrugsForATBClass(organism, selectedATBClass);
    if (amrnetDrugs.length === 0) {
      return { scatterData: [], regression: { slope: 0, intercept: 0, r2: 0 } };
    }

    // Fuzzy country-name matching: GLASS uses one set of country labels and
    // AMRnet uses another. Build both keyed by a normalized form so a country
    // that appears in both datasets matches even if the label is slightly
    // different (e.g. "Korea, Republic of" vs "South Korea").
    const normalize = s => s?.toLowerCase().replace(/[^a-z]/g, '') || '';

    // ── X-axis: WHO GLASS consumption (latest year per country) ──
    const consumptionByKey = {};
    if (glassData?.consumption) {
      glassData.consumption.forEach(r => {
        const key = normalize(r.country);
        if (!consumptionByKey[key] || r.year > consumptionByKey[key].year) {
          consumptionByKey[key] = { value: r.value, year: r.year, displayName: r.country };
        }
      });
    }

    // ── Y-axis: AMRnet genomic %R per class, per country ──
    // Per country: count genomes resistant to ANY drug in the class (union
    // semantics) over total genomes in the year range. This matches
    // intuitive "class resistance" — i.e. resistance to at least one drug
    // in the class — and is computed identically to how the rest of the
    // dashboard derives per-class flags.
    const classDrugSet = new Set(amrnetDrugs);
    const amrnetByKey = {};
    if (Array.isArray(rawOrganismData)) {
      rawOrganismData.forEach(genome => {
        const date = genome.DATE;
        if (date && (date < actualTimeInitial || date > actualTimeFinal)) return;
        const country = getCountryDisplayName(genome.COUNTRY_ONLY);
        if (!country) return;
        const key = normalize(country);
        if (!amrnetByKey[key]) amrnetByKey[key] = { total: 0, resistant: 0, displayName: country };
        amrnetByKey[key].total++;
        const resistantSet = getResistantDrugs(genome, organism);
        for (const drug of classDrugSet) {
          if (resistantSet.has(drug)) {
            amrnetByKey[key].resistant++;
            break;
          }
        }
      });
    }

    // ── Build scatter points: countries with both AMRnet genomes (N>=20) and GLASS consumption ──
    const points = [];
    Object.entries(amrnetByKey).forEach(([key, agg]) => {
      if (agg.total < 20) return; // same min-N gate used elsewhere in the dashboard
      const consumption = consumptionByKey[key];
      if (!consumption) return;
      const x = Number(consumption.value);
      const y = Number(((agg.resistant / agg.total) * 100).toFixed(1));
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      const country = agg.displayName;
      const region = countryToRegion[country] || 'Unknown';
      points.push({
        country,
        x,
        y,
        genomes: agg.total,
        resistant: agg.resistant,
        classDrugs: amrnetDrugs,
        region,
        color: regionColors[region] || regionColors['Unknown'],
        consumptionYear: consumption.year,
      });
    });

    return { scatterData: points, regression: linearRegression(points) };
  }, [
    selectedATBClass,
    organism,
    rawOrganismData,
    glassData,
    countryToRegion,
    regionColors,
    actualTimeInitial,
    actualTimeFinal,
  ]);

  const downloadCSV = useCallback(() => {
    if (!scatterData.length) return;
    const amrnetDrugs = getAmrnetDrugsForATBClass(organism, selectedATBClass);
    const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const headers = [
      'country',
      'region',
      'atb_class',
      'amrnet_class_drugs',
      'consumption_ddd_per_1000_day',
      'consumption_year',
      'consumption_source',
      'genomic_resistance_pct',
      'n_genomes_resistant',
      'n_genomes_total',
      'genomic_source',
    ];
    const rows = scatterData.map(d => [
      d.country, d.region, selectedATBClass, amrnetDrugs.join(';'),
      d.x, d.consumptionYear, 'WHO GLASS', d.y, d.resistant, d.genomes, 'AMRnet',
    ]);
    const csv = [headers, ...rows].map(r => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amrnet_atb_correlation_${organism}_${selectedATBClass.replace(/\W+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [scatterData, organism, selectedATBClass]);

  if (!canGetData) return null;

  const xMin = scatterData.length > 0 ? Math.min(...scatterData.map(d => d.x)) : 0;
  const xMax = scatterData.length > 0 ? Math.max(...scatterData.map(d => d.x)) * 1.05 : 10;
  const trendY1 = Math.max(0, Math.min(100, regression.slope * xMin + regression.intercept));
  const trendY2 = Math.max(0, Math.min(100, regression.slope * xMax + regression.intercept));
  // Only render the trend line when every coordinate is finite — passing
  // NaN to a ReferenceLine forces Recharts to recompute axis ticks with a
  // bad domain, which crashes the categorical chart with a DecimalError.
  const trendLineFinite =
    Number.isFinite(xMin) &&
    Number.isFinite(xMax) &&
    Number.isFinite(trendY1) &&
    Number.isFinite(trendY2);

  return (
    <CardContent className={classes.atbCorrelationGraph}>
      <Box className={classes.controlsRow}>
        <Box className={classes.selectWrapper}>
          <Box className={classes.labelWrapper}>
            <Typography variant="body2" fontWeight={600}>Antibiotic class</Typography>
            <Tooltip title="Select antibiotic class to correlate consumption (DDD/1000/day) with resistance prevalence (%)">
              <InfoOutlined fontSize="small" sx={{ cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }} />
            </Tooltip>
          </Box>
          <Select
            value={atbClasses.includes(selectedATBClass) ? selectedATBClass : (atbClasses[0] || '')}
            onChange={e => setSelectedATBClass(e.target.value)}
            size="small"
            sx={{ minWidth: 220, fontSize: '14px' }}
          >
            {atbClasses.map(cls => {
              const amrnetDrugs = getAmrnetDrugsForATBClass(organism, cls);
              return (
                <MenuItem key={cls} value={cls}>
                  {cls}
                  <Typography component="span" variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
                    ({amrnetDrugs.join(', ')})
                  </Typography>
                </MenuItem>
              );
            })}
          </Select>
        </Box>

        <FormControlLabel
          control={<Switch checked={showTrendLine} onChange={e => setShowTrendLine(e.target.checked)} size="small" />}
          label={<Typography variant="body2">Show trend line</Typography>}
        />

        {/* Data source indicator + download */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {loadingGlass ? (
            <Chip label="Loading GLASS data..." size="small" icon={<CircularProgress size={12} />} />
          ) : (
            <Tooltip title="X: WHO GLASS antimicrobial consumption (DDD/1000/day). Y: AMRnet genomic %R, computed per ATB class by aggregating the resistance calls for every AMRnet drug in that class (union — resistant to ≥1 drug). Click for source links in the Data Sources panel.">
              <Chip
                label={`WHO GLASS × AMRnet — ${scatterData.length} countries`}
                size="small"
                color="success"
                variant="outlined"
              />
            </Tooltip>
          )}
          <Tooltip title={`Download plotted data as CSV (${scatterData.length} countries, ${selectedATBClass})`}>
            <span>
              <IconButton size="small" onClick={downloadCSV} disabled={scatterData.length === 0}>
                <FileDownload fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Box className={classes.graphWrapper}>
        <Box className={classes.graph}>
          {scatterData.length === 0 ? (
            <Box className={classes.noSelection}>
              <Typography variant="body2" color="textSecondary">
                No countries have both WHO GLASS consumption and ≥20 AMRnet genomes for this antibiotic class. Try a different class or widen the dashboard's year range.
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" domain={['auto', 'auto']}>
                  <Label value="AM Consumption (DDD/1000 inhabitants/day)" position="bottom" offset={20} style={{ fontSize: 12 }} />
                </XAxis>
                <YAxis type="number" dataKey="y" domain={[0, 100]}>
                  <Label value="Genomic Resistance — AMRnet (%)" angle={-90} position="insideLeft" offset={10} style={{ fontSize: 11, textAnchor: 'middle' }} />
                </YAxis>
                <ZAxis type="number" dataKey="genomes" range={[60, 400]} />
                <ChartTooltip content={<CustomTooltip />} />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Scatter>
                {showTrendLine && scatterData.length >= 2 && trendLineFinite && (
                  <ReferenceLine
                    segment={[
                      { x: xMin, y: trendY1 },
                      { x: xMax, y: trendY2 },
                    ]}
                    stroke="#333"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </Box>

        <Box className={classes.rightSide}>
          {showTrendLine && scatterData.length >= 2 && (
            <Box className={classes.rSquared}>
              <Typography variant="body2" fontWeight={600}>
                R² = {regression.r2.toFixed(3)}
              </Typography>
              <Tooltip title="Coefficient of determination. Higher values indicate stronger linear correlation between antibiotic consumption and resistance.">
                <InfoOutlined fontSize="small" sx={{ cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }} />
              </Tooltip>
            </Box>
          )}

          <Typography variant="body2" fontWeight={600}>Region Legend</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px 0' }}>
            {Object.entries(regionColors)
              .filter(([region]) => scatterData.some(d => d.region === region))
              .map(([region, color]) => (
                <Box key={region} sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                  <Typography variant="caption">{region} ({scatterData.filter(d => d.region === region).length})</Typography>
                </Box>
              ))}
          </Box>

        </Box>
      </Box>

      {/* Floating reference panel — Data Sources content. The inline right
          panel keeps the live chart stats (R², Region Legend) so the dense
          attribution text doesn't compete with them for vertical space. */}
      {showFilter && (
        <Box className={classes.floatingFilter}>
          <Card elevation={3}>
            <CardContent>
              <PlottingOptionsHeader onClose={() => setShowFilter(false)} className={classes.titleWrapper} />

              <Typography variant="body2" fontWeight={600}>Data Sources</Typography>
              <Box className={classes.tooltipWrapper} sx={{ marginTop: '4px' }}>
                <Typography variant="caption" sx={{ lineHeight: 1.5 }} component="div">
                  <strong>AM Consumption (X):</strong>{' '}
                  <a href={GLASS_AMU_URL} target="_blank" rel="noopener noreferrer">WHO GLASS-AMC via GHO OData API</a>{' '}
                  ({dataSource === 'glass'
                    ? `${glassData?.consumption?.length || 0} country-year records, 2016–2023`
                    : 'static fallback, 16 countries, 2020'}). Total antibiotic consumption in DDD/1000 inhabitants/day. GLASS publishes TOTAL consumption, not per-class — so the X value is the same for every ATB class for a given country.
                  <br /><br />
                  <strong>Genomic Resistance (Y):</strong>{' '}
                  <a href={AMRNET_DOCS_URL} target="_blank" rel="noopener noreferrer">AMRnet</a> genome-derived call. Per country: count of genomes resistant to <em>any</em> AMRnet drug in the selected ATB class
                  {' '}({getAmrnetDrugsForATBClass(organism, selectedATBClass).join(', ') || '—'}), divided by total genomes (year range respects the dashboard filter). Countries with &lt;20 genomes are excluded.
                  <br /><br />
                  <strong>Matching:</strong> N={scatterData.length} countries with both GLASS consumption AND ≥20 AMRnet genomes. Country names are matched on a normalized lowercase-alpha form to bridge WHO/AMRnet label differences.
                  <br /><br />
                  <strong>Caveat:</strong> ecological correlation — does not imply causation. Different ATB classes share the same X (total consumption); the Y value is what changes per class.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </CardContent>
  );
};
