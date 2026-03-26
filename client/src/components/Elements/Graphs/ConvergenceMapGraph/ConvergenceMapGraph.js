import { InfoOutlined, Warning } from '@mui/icons-material';
import {
  Box,
  CardContent,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useAppSelector } from '../../../../stores/hooks';
import { getCountryDisplayName } from '../../../Dashboard/filters';
import { useStyles } from './ConvergenceMapGraphMUI';

const MIN_SAMPLES = 20;
const MAX_LOCATIONS = 30;

// Fallback region mapping for countries that may not be in economicRegions
// (e.g., not enough samples to appear in map data, but present in raw data)
const FALLBACK_REGIONS = {
  'Russia': 'Eastern Europe',
  'Hong Kong': 'Eastern Asia',
  'North Macedonia': 'Southern Europe',
  'Venezuela': 'South America',
  'Palestine': 'Western Asia',
  'Curaçao': 'Caribbean',
  'Curacao': 'Caribbean',
  'Taiwan': 'Eastern Asia',
  'Puerto Rico': 'Caribbean',
  'Guam': 'Oceania',
  'New Caledonia': 'Oceania',
  'Réunion': 'Eastern Africa',
  'Guadeloupe': 'Caribbean',
  'Martinique': 'Caribbean',
  'French Guiana': 'South America',
  'Kosovo': 'Southern Europe',
  'Macau': 'Eastern Asia',
};

// Thresholds for "high" virulence and resistance
const VIRULENCE_THRESHOLDS = [
  { label: 'Virulence ≥ 1', value: 1 },
  { label: 'Virulence ≥ 2', value: 2 },
  { label: 'Virulence ≥ 3 (hypervirulent)', value: 3 },
];

const RESISTANCE_THRESHOLDS = [
  { label: 'Resistance ≥ 1 class', value: 1 },
  { label: 'Resistance ≥ 3 classes (MDR)', value: 3 },
  { label: 'Resistance ≥ 5 classes (XDR)', value: 5 },
];

function getConvergenceColor(pct) {
  if (pct === 0) return '#e8f5e9';
  if (pct < 2) return '#fff9c4';
  if (pct < 5) return '#ffe0b2';
  if (pct < 10) return '#ffab91';
  if (pct < 20) return '#ef5350';
  if (pct < 40) return '#c62828';
  return '#4a0000';
}

function getTextColor(pct) {
  return pct >= 10 ? '#fff' : '#333';
}

export const ConvergenceMapGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [virThreshold, setVirThreshold] = useState(3);
  const [resThreshold, setResThreshold] = useState(3);
  const [xAxisType, setXAxisType] = useState('country');

  const organism = useAppSelector(state => state.dashboard.organism);
  const rawData = useAppSelector(state => state.graph.rawOrganismData);
  const economicRegions = useAppSelector(state => state.dashboard.economicRegions);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);

  const { locationStats, locations, globalStats } = useMemo(() => {
    if (!Array.isArray(rawData) || rawData.length === 0 || organism !== 'kpneumo') {
      return { locationStats: {}, locations: [], globalStats: null };
    }

    // Build country-to-region map with normalized key lookup
    const countryToRegion = {};
    const normalizedRegionLookup = {};
    const normalize = s => s?.toLowerCase().replace(/[^a-z]/g, '') || '';
    if (xAxisType === 'region' && economicRegions) {
      Object.entries(economicRegions).forEach(([region, countries]) => {
        if (Array.isArray(countries)) countries.forEach(c => {
          countryToRegion[c] = region;
          normalizedRegionLookup[normalize(c)] = region;
        });
      });
    }

    // Group by location
    const byLocation = {};
    let globalTotal = 0, globalConvergent = 0, globalHighVir = 0, globalHighRes = 0;

    rawData.forEach(item => {
      const vir = parseFloat(item.virulence_score);
      const res = parseInt(item.num_resistance_classes);
      if (isNaN(vir) || isNaN(res)) return;

      const country = getCountryDisplayName(item.COUNTRY_ONLY);
      const region = countryToRegion[country] || normalizedRegionLookup[normalize(country)] || FALLBACK_REGIONS[country];
      const loc = xAxisType === 'region' ? (region || 'Unknown') : (country || 'Unknown');

      if (!byLocation[loc]) byLocation[loc] = { total: 0, convergent: 0, highVir: 0, highRes: 0 };
      byLocation[loc].total++;
      globalTotal++;

      const isHighVir = vir >= virThreshold;
      const isHighRes = res >= resThreshold;
      if (isHighVir) { byLocation[loc].highVir++; globalHighVir++; }
      if (isHighRes) { byLocation[loc].highRes++; globalHighRes++; }
      if (isHighVir && isHighRes) { byLocation[loc].convergent++; globalConvergent++; }
    });

    // Compute percentages and sort
    const stats = {};
    Object.entries(byLocation).forEach(([loc, d]) => {
      if (d.total >= MIN_SAMPLES) {
        stats[loc] = {
          total: d.total,
          convergent: d.convergent,
          convergentPct: Number(((d.convergent / d.total) * 100).toFixed(1)),
          highVirPct: Number(((d.highVir / d.total) * 100).toFixed(1)),
          highResPct: Number(((d.highRes / d.total) * 100).toFixed(1)),
        };
      }
    });

    const sorted = Object.keys(stats)
      .sort((a, b) => stats[b].convergentPct - stats[a].convergentPct)
      .slice(0, MAX_LOCATIONS);

    const gStats = globalTotal > 0 ? {
      total: globalTotal,
      convergent: globalConvergent,
      convergentPct: ((globalConvergent / globalTotal) * 100).toFixed(1),
      highVirPct: ((globalHighVir / globalTotal) * 100).toFixed(1),
      highResPct: ((globalHighRes / globalTotal) * 100).toFixed(1),
    } : null;

    return { locationStats: stats, locations: sorted, globalStats: gStats };
  }, [rawData, organism, virThreshold, resThreshold, xAxisType, economicRegions]);

  if (!canGetData || organism !== 'kpneumo') return null;

  return (
    <CardContent className={classes.convergenceMapGraph}>
      <Box className={classes.controlsRow}>
        <Box>
          <Typography variant="caption" fontWeight={600}>Virulence threshold</Typography>
          <Select value={virThreshold} onChange={e => setVirThreshold(e.target.value)} size="small" sx={{ minWidth: 200, fontSize: '13px', display: 'block' }}>
            {VIRULENCE_THRESHOLDS.map(t => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </Box>
        <Box>
          <Typography variant="caption" fontWeight={600}>Resistance threshold</Typography>
          <Select value={resThreshold} onChange={e => setResThreshold(e.target.value)} size="small" sx={{ minWidth: 200, fontSize: '13px', display: 'block' }}>
            {RESISTANCE_THRESHOLDS.map(t => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </Box>
        <Box>
          <Typography variant="caption" fontWeight={600}>Group by</Typography>
          <Select value={xAxisType} onChange={e => setXAxisType(e.target.value)} size="small" sx={{ minWidth: 120, fontSize: '13px', display: 'block' }}>
            <MenuItem value="country">Country</MenuItem>
            <MenuItem value="region">Region</MenuItem>
          </Select>
        </Box>
        <Tooltip title="Shows the percentage of K. pneumoniae isolates that are BOTH hypervirulent AND multidrug-resistant. These convergent strains are the most clinically dangerous.">
          <InfoOutlined fontSize="small" sx={{ cursor: 'pointer', color: 'rgba(0,0,0,0.5)', marginBottom: '8px' }} />
        </Tooltip>
      </Box>

      {/* Legend */}
      <Box className={classes.legendBar}>
        <Typography variant="caption">0%</Typography>
        <Box className={classes.legendGradient} sx={{ background: 'linear-gradient(to right, #e8f5e9 0%, #fff9c4 5%, #ffe0b2 10%, #ffab91 20%, #ef5350 35%, #c62828 60%, #4a0000 100%)' }} />
        <Typography variant="caption">40%+</Typography>
        <Typography variant="caption" sx={{ marginLeft: '8px', color: '#666' }}>
          (% convergent: high virulence + high resistance)
        </Typography>
      </Box>

      <Box className={classes.graphWrapper}>
        <Box className={classes.chartArea}>
          {locations.length === 0 ? (
            <Box className={classes.noSelection}>
              <Typography variant="body2" color="textSecondary">
                {organism !== 'kpneumo' ? 'Convergence analysis available for K. pneumoniae only' : 'No locations with sufficient data'}
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Global summary bar */}
              {globalStats && (
                <Box className={classes.dataRow} sx={{ borderBottom: '2px solid #333', paddingBottom: '4px', marginBottom: '4px' }}>
                  <Box className={classes.countryLabel}>
                    <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 700 }}>GLOBAL</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flex: 1, gap: '4px', alignItems: 'center' }}>
                    <Box sx={{ flex: 1, position: 'relative', height: '22px', backgroundColor: '#f0f0f0', borderRadius: '2px' }}>
                      <Box sx={{ position: 'absolute', top: 0, left: 0, width: `${Math.min(globalStats.convergentPct, 100)}%`, height: '100%', backgroundColor: getConvergenceColor(parseFloat(globalStats.convergentPct)), borderRadius: '2px' }} />
                      <Typography variant="caption" sx={{ position: 'absolute', left: '4px', top: '2px', fontSize: '10px', fontWeight: 700, color: parseFloat(globalStats.convergentPct) >= 10 ? '#fff' : '#333', zIndex: 1 }}>
                        {globalStats.convergentPct}% convergent
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ minWidth: '55px', fontSize: '9px', color: '#666' }}>
                      N={globalStats.total.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Per-location rows */}
              {locations.map(loc => {
                const d = locationStats[loc];
                if (!d) return null;
                const isAlert = d.convergentPct >= 10;

                return (
                  <Tooltip
                    key={loc}
                    title={
                      <Box>
                        <Typography variant="caption" fontWeight={600}>{loc}</Typography>
                        <br />
                        <Typography variant="caption">Convergent (vir+res): {d.convergentPct}% ({d.convergent}/{d.total})</Typography>
                        <br />
                        <Typography variant="caption">High virulence only: {d.highVirPct}%</Typography>
                        <br />
                        <Typography variant="caption">High resistance only: {d.highResPct}%</Typography>
                      </Box>
                    }
                    arrow
                    placement="right"
                  >
                    <Box className={classes.dataRow}>
                      <Box className={classes.countryLabel} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        {isAlert && <Warning sx={{ fontSize: 12, color: '#c62828' }} />}
                        <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: isAlert ? 700 : 400 }} noWrap>
                          {loc}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flex: 1, gap: '4px', alignItems: 'center' }}>
                        <Box sx={{ flex: 1, position: 'relative', height: '20px', backgroundColor: '#f0f0f0', borderRadius: '2px' }}>
                          <Box sx={{ position: 'absolute', top: 0, left: 0, width: `${Math.max(d.convergentPct, 0.3)}%`, height: '100%', backgroundColor: getConvergenceColor(d.convergentPct), borderRadius: '2px', transition: 'width 0.3s' }} />
                          <Typography variant="caption" sx={{ position: 'absolute', left: '4px', top: '1px', fontSize: '9px', fontWeight: 600, color: getTextColor(d.convergentPct), zIndex: 1 }}>
                            {d.convergentPct}%
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ minWidth: '55px', fontSize: '9px', color: '#666' }}>
                          N={d.total.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          )}
        </Box>

        <Box className={classes.rightSide}>
          <Typography variant="body2" fontWeight={600}>What is convergence?</Typography>
          <Box className={classes.tooltipWrapper}>
            <Typography variant="caption" sx={{ lineHeight: 1.6 }}>
              <strong>Convergent strains</strong> carry BOTH high virulence AND high antimicrobial resistance.
              These are the most clinically dangerous because they can cause severe infections that are
              difficult to treat.
              <br /><br />
              <strong>Virulence score</strong> (from Kleborate): 0 = no virulence loci, 1 = yersiniabactin,
              2 = yersiniabactin + colibactin, 3 = aerobactin (hypervirulent), 4 = aerobactin + salmochelin,
              5 = aerobactin + salmochelin + others.
              <br /><br />
              <strong>Resistance classes</strong>: Number of distinct antimicrobial classes to which resistance
              genes/mutations are detected. ≥3 = MDR, ≥5 = XDR-like.
              <br /><br />
              <strong>Warning icon</strong> (<Warning sx={{ fontSize: 10, color: '#c62828', verticalAlign: 'middle' }} />) appears
              for locations where convergent strains exceed 10% of isolates.
              <br /><br />
              <strong>Reference:</strong> Wyres et al. 2020 <em>Genome Med</em>; Lam et al. 2021 <em>Nat Commun</em>.
            </Typography>
          </Box>
        </Box>
      </Box>
    </CardContent>
  );
};
