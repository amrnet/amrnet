import { InfoOutlined } from '@mui/icons-material';
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
import { drugAcronyms, drugsECOLI, drugsKP, drugsNG, drugsSA, drugsSP, drugsST } from '../../../../util/drugs';
import { useStyles } from './TemporalHeatmapGraphMUI';
import { useTranslation } from 'react-i18next';

const MIN_SAMPLES_PER_CELL = 10;
const MIN_SAMPLES_PER_COUNTRY = 20;
const MAX_COUNTRIES = 25;

function getPrevalenceColor(value) {
  if (value === null || value === undefined) return '#f5f5f5';
  if (value === 0) return '#e8e8e8';
  if (value <= 2) return '#fee5d9';
  if (value <= 10) return '#fcae91';
  if (value <= 50) return '#fb6a4a';
  return '#cb181d';
}

function getTextColor(value) {
  if (value === null || value === undefined) return '#999';
  if (value > 10) return '#fff';
  return '#333';
}

function getDrugsForOrganism(organism) {
  switch (organism) {
    case 'styphi': return drugsST.filter(d => !['MDR', 'XDR', 'Pansusceptible'].includes(d));
    case 'kpneumo': return drugsKP.filter(d => !['Pansusceptible'].includes(d));
    case 'ngono': return drugsNG;
    case 'senterica':
    case 'sentericaints':
    case 'ecoli':
    case 'decoli':
    case 'shige': return drugsECOLI.filter(d => !['Pansusceptible'].includes(d));
    case 'saureus': return drugsSA;
    case 'strepneumo': return drugsSP;
    default: return [];
  }
}

export const TemporalHeatmapGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [selectedDrug, setSelectedDrug] = useState('');
  const [sortBy, setSortBy] = useState('prevalence');

  const organism = useAppSelector(state => state.dashboard.organism);
  const drugsYearData = useAppSelector(state => state.graph.drugsYearData);
  const drugsCountriesData = useAppSelector(state => state.graph.drugsCountriesData);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);

  const drugs = useMemo(() => getDrugsForOrganism(organism), [organism]);

  // Auto-select first drug when organism changes
  useMemo(() => {
    if (drugs.length > 0 && !drugs.includes(selectedDrug)) {
      setSelectedDrug(drugs[0]);
    }
  }, [drugs, selectedDrug]);

  // Build years from drugsYearData
  const years = useMemo(() => {
    if (!Array.isArray(drugsYearData) || drugsYearData.length === 0) return [];
    return drugsYearData
      .map(entry => {
        const y = typeof entry.name === 'string' ? parseInt(entry.name) : entry.name;
        return isNaN(y) ? null : y;
      })
      .filter(Boolean)
      .sort((a, b) => a - b);
  }, [drugsYearData]);

  // Build per-year resistance rates for the selected drug
  const yearResistanceMap = useMemo(() => {
    const map = {};
    if (!Array.isArray(drugsYearData) || !selectedDrug) return map;
    drugsYearData.forEach(entry => {
      const year = typeof entry.name === 'string' ? parseInt(entry.name) : entry.name;
      if (!isNaN(year) && entry.count > 0 && entry[selectedDrug] !== undefined) {
        map[year] = {
          resistant: entry[selectedDrug] || 0,
          total: entry.count,
          rate: Number(((entry[selectedDrug] / entry.count) * 100).toFixed(1)),
        };
      }
    });
    return map;
  }, [drugsYearData, selectedDrug]);

  // Get countries with enough data from drugsCountriesData
  const { countries, countryResistance } = useMemo(() => {
    if (!drugsCountriesData || typeof drugsCountriesData !== 'object' || !selectedDrug) {
      return { countries: [], countryResistance: {} };
    }

    const drugEntries = drugsCountriesData[selectedDrug];
    if (!Array.isArray(drugEntries)) return { countries: [], countryResistance: {} };

    const resistance = {};
    drugEntries.forEach(entry => {
      if (entry.count >= MIN_SAMPLES_PER_COUNTRY) {
        const rate = entry.count > 0 ? Number(((entry.resistantCount / entry.count) * 100).toFixed(1)) : 0;
        resistance[entry.name] = {
          count: entry.count,
          rate,
          resistantCount: entry.resistantCount || 0,
        };
      }
    });

    let sortedCountries = Object.keys(resistance);

    if (sortBy === 'prevalence') {
      sortedCountries.sort((a, b) => (resistance[b]?.rate || 0) - (resistance[a]?.rate || 0));
    } else if (sortBy === 'alphabetical') {
      sortedCountries.sort((a, b) => a.localeCompare(b));
    } else if (sortBy === 'sampleCount') {
      sortedCountries.sort((a, b) => (resistance[b]?.count || 0) - (resistance[a]?.count || 0));
    }

    return {
      countries: sortedCountries.slice(0, MAX_COUNTRIES),
      countryResistance: resistance,
    };
  }, [drugsCountriesData, selectedDrug, sortBy]);

  // For the heatmap cells, we combine:
  // - Per-country overall resistance (from drugsCountriesData) for the color intensity
  // - Per-year global resistance (from drugsYearData) for temporal context
  // Since per-country-per-year-per-drug is not precomputed, we show:
  //   Each row = country (color = country's overall resistance rate)
  //   Each column = year (label = global resistance for that year)
  //   Cell = country resistance rate (same across years for that country,
  //          but modulated by whether that year had global data)

  if (!canGetData) return null;

  return (
    <CardContent className={classes.temporalHeatmapGraph}>
      {/* Controls */}
      <Box sx={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Box className={classes.selectWrapper}>
          <Box className={classes.labelWrapper}>
            <Typography variant="body2" fontWeight={600}>{t('common.selectDrug')}</Typography>
            <Tooltip title="Shows resistance prevalence across countries for the selected drug. Colors represent each country's overall resistance rate.">
              <InfoOutlined fontSize="small" sx={{ cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }} />
            </Tooltip>
          </Box>
          <Select
            value={selectedDrug}
            onChange={e => setSelectedDrug(e.target.value)}
            size="small"
            sx={{ minWidth: 200, fontSize: '14px' }}
          >
            {drugs.map(drug => (
              <MenuItem key={drug} value={drug}>{drug}</MenuItem>
            ))}
          </Select>
        </Box>

        <Box className={classes.selectWrapper}>
          <Box className={classes.labelWrapper}>
            <Typography variant="body2" fontWeight={600}>Sort countries by</Typography>
          </Box>
          <Select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            size="small"
            sx={{ minWidth: 180, fontSize: '14px' }}
          >
            <MenuItem value="prevalence">Resistance (high to low)</MenuItem>
            <MenuItem value="sampleCount">Sample count (high to low)</MenuItem>
            <MenuItem value="alphabetical">Alphabetical</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Legend */}
      <Box className={classes.legendBar}>
        <Typography variant="caption">0%</Typography>
        <Box
          className={classes.legendGradient}
          sx={{
            background: 'linear-gradient(to right, #e8e8e8 0%, #fee5d9 10%, #fcae91 30%, #fb6a4a 60%, #cb181d 100%)',
          }}
        />
        <Typography variant="caption">100%</Typography>
        <Box sx={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Box sx={{ width: 14, height: 14, backgroundColor: '#f5f5f5', border: '1px solid #ddd' }} />
          <Typography variant="caption">N&lt;{MIN_SAMPLES_PER_COUNTRY}</Typography>
        </Box>
      </Box>

      {/* Global trends row */}
      {years.length > 0 && (
        <Box sx={{ padding: '8px 0 0', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <Typography variant="caption" fontWeight={600} sx={{ width: 160, minWidth: 160, textAlign: 'right', paddingRight: '8px', flexShrink: 0 }}>
            Global trend
          </Typography>
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', gap: '1px' }}>
            {years.map(year => {
              const yrData = yearResistanceMap[year];
              return (
                <Tooltip
                  key={`global-${year}`}
                  title={yrData ? `${year}: ${yrData.rate}% (N=${yrData.total})` : `${year}: no data`}
                  arrow
                  placement="top"
                >
                  <Box
                    sx={{
                      flex: '1 1 0',
                      minWidth: 0,
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: yrData ? getPrevalenceColor(yrData.rate) : '#f5f5f5',
                      borderRadius: '1px',
                    }}
                  >
                    {/* Only show label if cells are wide enough */}
                    {years.length <= 30 && (
                      <Typography variant="caption" sx={{ fontSize: '7px', color: yrData ? getTextColor(yrData.rate) : '#999', lineHeight: 1 }}>
                        {yrData ? Math.round(yrData.rate) : ''}
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      )}
      {/* Year labels under the global trend */}
      {years.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', overflow: 'hidden', paddingBottom: '4px' }}>
          <Box sx={{ width: 160, minWidth: 160, flexShrink: 0 }} />
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', gap: '1px' }}>
            {years.map((year, i) => {
              // Show label every few years to avoid crowding
              const step = years.length > 20 ? 5 : years.length > 10 ? 2 : 1;
              const showLabel = i % step === 0 || i === years.length - 1;
              return (
                <Box key={`lbl-${year}`} sx={{ flex: '1 1 0', minWidth: 0, textAlign: 'center' }}>
                  {showLabel && (
                    <Typography variant="caption" sx={{ fontSize: '8px', color: '#666' }}>
                      {String(year).slice(-2)}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Heatmap: Country rows with their resistance bar */}
      <Box className={classes.graphWrapper}>
        <Box className={classes.graph}>
          {countries.length === 0 ? (
            <Box className={classes.noSelection}>
              <Typography variant="body2" color="textSecondary">
                {!selectedDrug ? 'Select a drug to view' : 'No countries with sufficient data (N≥20) for selected drug'}
              </Typography>
            </Box>
          ) : (
            <Box className={classes.heatmapContainer}>
              {/* Header row with years */}
              <Box className={classes.headerRow}>
                <Box className={classes.countryLabel}>
                  <Typography variant="caption" fontWeight={600}>Country</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Typography variant="caption" fontWeight={600} sx={{ minWidth: '60px' }}>
                    Resistance
                  </Typography>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Typography variant="caption" fontWeight={600} sx={{ minWidth: '50px' }}>
                      N
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Data rows — one per country */}
              {countries.map(country => {
                const data = countryResistance[country];
                if (!data) return null;
                const barWidth = Math.max(data.rate, 0.5); // min visible width
                const bgColor = getPrevalenceColor(data.rate);

                return (
                  <Tooltip
                    key={country}
                    title={
                      <Box>
                        <Typography variant="caption" fontWeight={600}>{country}</Typography>
                        <br />
                        <Typography variant="caption">Resistance: {data.rate}%</Typography>
                        <br />
                        <Typography variant="caption">Resistant: {data.resistantCount} / {data.count}</Typography>
                      </Box>
                    }
                    arrow
                    placement="right"
                  >
                    <Box className={classes.dataRow}>
                      <Box className={classes.countryLabel}>
                        <Typography variant="caption" sx={{ fontSize: '11px' }} noWrap title={country}>
                          {country}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: '8px' }}>
                        {/* Resistance bar */}
                        <Box sx={{ flex: 1, position: 'relative', height: '22px', backgroundColor: '#f0f0f0', borderRadius: '2px' }}>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: `${barWidth}%`,
                              height: '100%',
                              backgroundColor: bgColor,
                              borderRadius: '2px',
                              transition: 'width 0.3s ease',
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              position: 'absolute',
                              left: '4px',
                              top: '2px',
                              fontSize: '10px',
                              fontWeight: 600,
                              color: data.rate > 30 ? '#fff' : '#333',
                              zIndex: 1,
                            }}
                          >
                            {data.rate}%
                          </Typography>
                        </Box>
                        {/* Sample count */}
                        <Typography variant="caption" sx={{ minWidth: '50px', fontSize: '10px', color: '#666' }}>
                          N={data.count}
                        </Typography>
                      </Box>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </CardContent>
  );
};
