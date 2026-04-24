import { InfoOutlined, TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import {
  Box,
  CardContent,
  Checkbox,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { useAppSelector } from '../../../../stores/hooks';
import {
  drugsECOLI,
  drugsKP,
  drugsNG,
  drugsSA,
  drugsSP,
  drugsST,
} from '../../../../util/drugs';
import { getColorForDrug } from '../graphColorHelper';
import { useStyles } from './EmergenceRateGraphMUI';
import { useTranslation } from 'react-i18next';

function getDrugsForOrganism(organism) {
  const exclusions = ['Pansusceptible'];
  switch (organism) {
    case 'styphi': return drugsST.filter(d => !exclusions.includes(d));
    case 'kpneumo': return drugsKP.filter(d => !exclusions.includes(d));
    case 'ngono': return drugsNG;
    case 'senterica':
    case 'sentericaints':
    case 'ecoli':
    case 'decoli':
    case 'shige': return drugsECOLI.filter(d => !exclusions.includes(d));
    default: return [];
  }
}

const MIN_YEARS = 5; // Need at least 5 years of data
const MIN_SAMPLES_PER_YEAR = 10;

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  return (
    <Box sx={{ backgroundColor: '#fff', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '4px', maxWidth: 250 }}>
      <Typography variant="body2" fontWeight={600}>{data.drug}</Typography>
      <Typography variant="caption" display="block">
        Avg. annual change: <strong>{data.rate > 0 ? '+' : ''}{data.rate.toFixed(2)}%</strong> per year
      </Typography>
      <Typography variant="caption" display="block" color="textSecondary">
        From {data.startYear} ({data.startPrev.toFixed(1)}%) to {data.endYear} ({data.endPrev.toFixed(1)}%)
      </Typography>
      <Typography variant="caption" display="block" color="textSecondary">
        Based on {data.numYears} years of data
      </Typography>
    </Box>
  );
};

export const EmergenceRateGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [selectedDrugs, setSelectedDrugs] = useState([]);

  const organism = useAppSelector(state => state.dashboard.organism);
  const drugsYearData = useAppSelector(state => state.graph.drugsYearData);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);

  const drugs = useMemo(() => getDrugsForOrganism(organism), [organism]);

  // Auto-select top drugs on organism change
  useMemo(() => {
    if (drugs.length > 0 && (selectedDrugs.length === 0 || !selectedDrugs.some(d => drugs.includes(d)))) {
      setSelectedDrugs(drugs.slice(0, 8));
    }
  }, [drugs]);

  // Compute emergence rate: average annual change in resistance % (linear slope)
  const rateData = useMemo(() => {
    if (!Array.isArray(drugsYearData) || drugsYearData.length < MIN_YEARS) return [];

    // Get years with enough samples
    const validYears = drugsYearData
      .filter(entry => entry.count >= MIN_SAMPLES_PER_YEAR)
      .map(entry => ({
        year: typeof entry.name === 'string' ? parseInt(entry.name) : entry.name,
        count: entry.count,
        ...entry,
      }))
      .filter(e => !isNaN(e.year))
      .sort((a, b) => a.year - b.year);

    if (validYears.length < MIN_YEARS) return [];

    const results = [];

    selectedDrugs.forEach(drug => {
      // Get year-prevalence pairs
      const points = validYears
        .filter(y => y[drug] !== undefined)
        .map(y => ({
          year: y.year,
          prevalence: y.count > 0 ? (y[drug] / y.count) * 100 : 0,
        }));

      if (points.length < MIN_YEARS) return;

      // Linear regression: slope = average annual change
      const n = points.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      points.forEach(p => {
        sumX += p.year;
        sumY += p.prevalence;
        sumXY += p.year * p.prevalence;
        sumX2 += p.year * p.year;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

      results.push({
        drug,
        rate: Number(slope.toFixed(3)),
        startYear: points[0].year,
        endYear: points[points.length - 1].year,
        startPrev: points[0].prevalence,
        endPrev: points[points.length - 1].prevalence,
        numYears: points.length,
        color: getColorForDrug(drug, drugs.indexOf(drug)),
      });
    });

    // Sort by rate descending (fastest growing first)
    results.sort((a, b) => b.rate - a.rate);
    return results;
  }, [drugsYearData, selectedDrugs, drugs]);

  const handleDrugSelect = event => {
    const value = event.target.value;
    setSelectedDrugs(typeof value === 'string' ? value.split(',') : value);
  };

  if (!canGetData) return null;

  return (
    <CardContent className={classes.emergenceRateGraph}>
      <Box className={classes.selectWrapper}>
        <Box className={classes.labelWrapper}>
          <Typography variant="body2" fontWeight={600}>Select drugs to compare</Typography>
          <Tooltip title="Shows the average annual change in resistance prevalence (% per year). Positive = resistance increasing, negative = decreasing. Computed via linear regression over all years with N≥10.">
            <InfoOutlined fontSize="small" sx={{ cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }} />
          </Tooltip>
        </Box>
        <Select
          multiple
          value={selectedDrugs}
          onChange={handleDrugSelect}
          renderValue={selected => `${selected.length} drugs selected`}
          size="small"
          sx={{ maxWidth: 400, fontSize: '14px' }}
          MenuProps={{ PaperProps: { sx: { maxHeight: 350 } } }}
        >
          {drugs.map(drug => (
            <MenuItem key={drug} value={drug}>
              <Checkbox checked={selectedDrugs.includes(drug)} size="small" />
              <ListItemText primary={drug} />
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box className={classes.graphWrapper}>
        <Box className={classes.graph}>
          {rateData.length === 0 ? (
            <Box className={classes.noSelection}>
              <Typography variant="body2" color="textSecondary">
                Insufficient data (need ≥{MIN_YEARS} years with N≥{MIN_SAMPLES_PER_YEAR} each)
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rateData} layout="vertical" margin={{ top: 10, right: 30, bottom: 10, left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`}>
                </XAxis>
                <YAxis type="category" dataKey="drug" width={110} tick={{ fontSize: 11 }} />
                <ReferenceLine x={0} stroke="#333" strokeWidth={1.5} />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar dataKey="rate" barSize={18} radius={[0, 4, 4, 0]}>
                  {rateData.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={entry.rate > 0 ? '#d32f2f' : '#2e7d32'}
                      fillOpacity={Math.min(Math.abs(entry.rate) / 3 + 0.3, 1)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>

        <Box className={classes.rightSide}>
          <Typography variant="body2" fontWeight={600}>Emergence Alerts</Typography>
          <Box className={classes.tooltipWrapper}>
            {rateData.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {rateData.map(d => (
                  <Box key={d.drug} sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {d.rate > 1 ? (
                      <TrendingUp sx={{ color: '#d32f2f', fontSize: 16 }} />
                    ) : d.rate > 0 ? (
                      <TrendingUp sx={{ color: '#ff9800', fontSize: 16 }} />
                    ) : d.rate < -1 ? (
                      <TrendingDown sx={{ color: '#2e7d32', fontSize: 16 }} />
                    ) : (
                      <TrendingFlat sx={{ color: '#666', fontSize: 16 }} />
                    )}
                    <Typography variant="caption" sx={{ flex: 1 }}>{d.drug}</Typography>
                    <Box
                      className={classes.alertChip}
                      sx={{
                        backgroundColor: d.rate > 1 ? '#ffebee' : d.rate > 0 ? '#fff3e0' : d.rate < -1 ? '#e8f5e9' : '#f5f5f5',
                        color: d.rate > 1 ? '#c62828' : d.rate > 0 ? '#e65100' : d.rate < -1 ? '#1b5e20' : '#666',
                      }}
                    >
                      {d.rate > 0 ? '+' : ''}{d.rate.toFixed(2)}%/yr
                    </Box>
                  </Box>
                ))}
                <Typography variant="caption" sx={{ marginTop: '8px', color: '#666', lineHeight: 1.5 }}>
                  Values show average annual change in resistance prevalence.
                  <br />
                  <strong style={{ color: '#d32f2f' }}>Red (&gt;+1%/yr)</strong> = rapidly increasing
                  <br />
                  <strong style={{ color: '#ff9800' }}>Orange (0-1%/yr)</strong> = slowly increasing
                  <br />
                  <strong style={{ color: '#2e7d32' }}>Green (&lt;0)</strong> = decreasing
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">No data available</Typography>
            )}
          </Box>
        </Box>
      </Box>
    </CardContent>
  );
};
