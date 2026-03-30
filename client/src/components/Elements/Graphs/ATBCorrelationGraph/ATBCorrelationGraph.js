import { InfoOutlined } from '@mui/icons-material';
import {
  Box,
  CardContent,
  Chip,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Select,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
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
import atbStaticData from '../../../../data/atb_consumption.json';
import { getATBClassesForOrganism, getAmrnetDrugsForATBClass } from '../../../../util/atbDrugMapping';
import { useStyles } from './ATBCorrelationGraphMUI';

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
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
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
      <Typography variant="caption" display="block">ATB consumption: {data.x?.toFixed(2)} DDD/1000/day ({data.consumptionYear})</Typography>
      <Typography variant="caption" display="block">Resistance: {data.y?.toFixed(1)}%</Typography>
      <Typography variant="caption" display="block">Genomes: {data.genomes}</Typography>
      <Typography variant="caption" display="block" color="textSecondary">Region: {data.region}</Typography>
      <Typography variant="caption" display="block" color="textSecondary">Source: {data.source}</Typography>
    </Box>
  );
};

export const ATBCorrelationGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [selectedATBClass, setSelectedATBClass] = useState('Fluoroquinolones');
  const [showTrendLine, setShowTrendLine] = useState(true);
  const [glassData, setGlassData] = useState(null);
  const [loadingGlass, setLoadingGlass] = useState(false);
  const [dataSource, setDataSource] = useState('static'); // 'glass' or 'static'

  const organism = useAppSelector(state => state.dashboard.organism);
  const drugsCountriesData = useAppSelector(state => state.graph.drugsCountriesData);
  const economicRegions = useAppSelector(state => state.dashboard.economicRegions);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);

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

  const atbClasses = useMemo(() => getATBClassesForOrganism(organism), [organism]);

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

  // Build scatter data
  const { scatterData, regression } = useMemo(() => {
    if (!drugsCountriesData || typeof drugsCountriesData !== 'object' || !selectedATBClass) {
      return { scatterData: [], regression: { slope: 0, intercept: 0, r2: 0 } };
    }

    const amrnetDrugs = getAmrnetDrugsForATBClass(organism, selectedATBClass);
    if (amrnetDrugs.length === 0) {
      return { scatterData: [], regression: { slope: 0, intercept: 0, r2: 0 } };
    }

    // Build consumption lookup from GLASS or static data
    const consumptionByCountry = {};
    if (dataSource === 'glass' && glassData?.consumption) {
      // Use GLASS data: pick latest year per country
      const byCountry = {};
      glassData.consumption.forEach(r => {
        if (!byCountry[r.country] || r.year > byCountry[r.country].year) {
          byCountry[r.country] = r;
        }
      });
      Object.values(byCountry).forEach(r => {
        consumptionByCountry[r.country] = { value: r.value, year: r.year, source: 'WHO GLASS' };
      });
    } else {
      // Fallback to static data
      atbStaticData.data
        .filter(d => d.atb_class === selectedATBClass)
        .forEach(d => {
          consumptionByCountry[d.country] = { value: d.DDD_per_1000, year: d.year, source: 'Static (ESAC-Net/GLASS adapted)' };
        });
    }

    // Match with AMRnet resistance data
    const points = [];
    const firstDrug = amrnetDrugs[0];
    const drugEntries = drugsCountriesData[firstDrug];
    if (!Array.isArray(drugEntries)) return { scatterData: [], regression: { slope: 0, intercept: 0, r2: 0 } };

    drugEntries.forEach(entry => {
      const country = entry.name;
      const consumption = consumptionByCountry[country];

      if (consumption && entry.count >= 20) {
        const resistance = entry.count > 0 ? (entry.resistantCount / entry.count) * 100 : 0;
        const region = countryToRegion[country] || 'Unknown';
        points.push({
          country,
          x: consumption.value,
          y: Number(resistance.toFixed(1)),
          genomes: entry.count,
          region,
          color: regionColors[region] || regionColors['Unknown'],
          consumptionYear: consumption.year,
          source: consumption.source,
        });
      }
    });

    return { scatterData: points, regression: linearRegression(points) };
  }, [drugsCountriesData, selectedATBClass, organism, glassData, dataSource, countryToRegion, regionColors]);

  if (!canGetData) return null;

  const xMin = scatterData.length > 0 ? Math.min(...scatterData.map(d => d.x)) : 0;
  const xMax = scatterData.length > 0 ? Math.max(...scatterData.map(d => d.x)) * 1.05 : 10;
  const trendY1 = Math.max(0, Math.min(100, regression.slope * xMin + regression.intercept));
  const trendY2 = Math.max(0, Math.min(100, regression.slope * xMax + regression.intercept));

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
            {atbClasses.map(cls => (
              <MenuItem key={cls} value={cls}>{cls}</MenuItem>
            ))}
          </Select>
        </Box>

        <FormControlLabel
          control={<Switch checked={showTrendLine} onChange={e => setShowTrendLine(e.target.checked)} size="small" />}
          label={<Typography variant="body2">Show trend line</Typography>}
        />

        {/* Data source indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {loadingGlass ? (
            <Chip label="Loading GLASS data..." size="small" icon={<CircularProgress size={12} />} />
          ) : (
            <Chip
              label={dataSource === 'glass' ? `WHO GLASS (${glassData?.consumption?.length || 0} records)` : 'Static data (16 countries)'}
              size="small"
              color={dataSource === 'glass' ? 'success' : 'default'}
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      <Box className={classes.graphWrapper}>
        <Box className={classes.graph}>
          {scatterData.length === 0 ? (
            <Box className={classes.noSelection}>
              <Typography variant="body2" color="textSecondary">
                No matching data between ATB consumption and resistance for this selection.
                <br />
                {dataSource === 'glass'
                  ? 'GLASS provides total consumption only (not per antibiotic class). Try selecting a different drug.'
                  : 'Static data covers 16 countries only. GLASS API provides more countries for total consumption.'}
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" domain={['auto', 'auto']}>
                  <Label value="ATB Consumption (DDD/1000 inhabitants/day)" position="bottom" offset={20} style={{ fontSize: 12 }} />
                </XAxis>
                <YAxis type="number" dataKey="y" domain={[0, 100]}>
                  <Label value="Resistance (%)" angle={-90} position="insideLeft" offset={10} style={{ fontSize: 12, textAnchor: 'middle' }} />
                </YAxis>
                <ZAxis type="number" dataKey="genomes" range={[60, 400]} />
                <ChartTooltip content={<CustomTooltip />} />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Scatter>
                {showTrendLine && scatterData.length >= 2 && (
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

          <Typography variant="body2" fontWeight={600} sx={{ marginTop: '8px' }}>Data Sources</Typography>
          <Box className={classes.tooltipWrapper}>
            <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
              <strong>ATB Consumption:</strong> {dataSource === 'glass'
                ? `WHO GLASS-AMC via GHO OData API (${glassData?.consumption?.length || 0} country-year records, 2016-2023). Total antibiotic consumption as DDD/1000/day.`
                : 'Static dataset adapted from WHO GLASS AMC/AMU report and ECDC ESAC-Net (16 countries, 2020).'}
              <br /><br />
              <strong>Resistance:</strong> Genome-derived AMR prevalence from AMRnet.
              <br /><br />
              <strong>Matching:</strong> N={scatterData.length} countries with both consumption AND genomic data (N≥20 genomes).
              <br /><br />
              <strong>Note:</strong> Ecological correlation — does not imply causation.
              {dataSource === 'glass' && ' GLASS provides TOTAL antibiotic consumption only (not per class). All antibiotic classes show the same X-axis values.'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </CardContent>
  );
};
