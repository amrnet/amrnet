import { InfoOutlined } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tooltip as ChartTooltip,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { useAppSelector } from '../../../../stores/hooks';
import { drugRulesST } from '../../../../util/drugClassesRules';
import { drugAcronyms, defaultDrugsForDrugResistanceGraphST } from '../../../../util/drugs';
import { getLocalizedCountryName } from '../../../../util/countryLocalization';
import { PlottingOptionsHeader } from '../../Shared/PlottingOptionsHeader';
import { useStyles } from './RadarProfileGraphMUI';

// Column lookups for all styphi drugs (including MDR/XDR/Pansusceptible)
const STYPHI_DRUG_RULES = Object.fromEntries(
  drugRulesST.map(r => [r.key, { columnID: r.columnID, values: r.values }]),
);
// When 'Ciprofloxacin NS' is absent from drugsData, 'Ciprofloxacin' (NS+R combined) is the fallback
const DEFAULT_DRUG_FALLBACKS = { 'Ciprofloxacin NS': 'Ciprofloxacin',};
const RADAR_COLORS = ['#006cde', '#cd3cbe', '#00ac35', '#e65c00', '#785EF0'];

const MAX_COUNTRIES = 5;

const DEFAULT_X_AXIS_TYPE = 'region';
const DEFAULT_REGIONS = ['Eastern Africa', 'Western Africa', 'Southern Asia', 'South-eastern Asia'];
const DEFAULT_RADAR_DRUGS_ST = defaultDrugsForDrugResistanceGraphST;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{ backgroundColor: '#fff', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '4px' }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: '4px' }}>
        {label}
      </Typography>
      {payload.map((entry, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: entry.color, flexShrink: 0 }} />
          <Typography variant="caption">
            {entry.name}: {entry.value != null ? `${entry.value.toFixed(1)}%` : 'N/A'}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export const RadarProfileGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const { t, i18n } = useTranslation();
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [xAxisType, setXAxisType] = useState(DEFAULT_X_AXIS_TYPE);
  const [selectedDrugs, setSelectedDrugs] = useState(null); // null = default (all regular drugs)

  const organism = useAppSelector(state => state.dashboard.organism);
  const drugsCountriesData = useAppSelector(state => state.graph.drugsCountriesData);
  const drugsRegionsData = useAppSelector(state => state.graph.drugsRegionsData);
  const rawOrganismData = useAppSelector(state => state.graph.rawOrganismData);
  const economicRegions = useAppSelector(state => state.dashboard.economicRegions);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const resetBool = useAppSelector(state => state.graph.resetBool);

  const drugsData = useMemo(() => {
    return xAxisType === 'country' ? drugsCountriesData : drugsRegionsData;
  }, [drugsCountriesData, drugsRegionsData, xAxisType]);

  // For styphi, compute per-country per-drug resistance from raw data (avoids resistantCount bug)
  const styphiRawResistance = useMemo(() => {
    if (organism !== 'styphi' || xAxisType !== 'country' || !rawOrganismData?.length) return null;
    const map = {};
    rawOrganismData.forEach(item => {
      const country = item.COUNTRY_ONLY;
      if (!country) return;
      if (!map[country]) map[country] = {};
      Object.entries(STYPHI_DRUG_RULES).forEach(([drugKey, rule]) => {
        if (!map[country][drugKey]) map[country][drugKey] = { resistant: 0, total: 0 };
        map[country][drugKey].total++;
        if (rule.values.includes(String(item[rule.columnID]))) {
          map[country][drugKey].resistant++;
        }
      });
    });
    return map;
  }, [organism, xAxisType, rawOrganismData]);

  // For styphi, compute MDR/XDR/Pansusceptible per location (country or region) from raw data
  const styphiExtraResistance = useMemo(() => {
    if (organism !== 'styphi' || !rawOrganismData?.length) return null;

    if (xAxisType === 'country') {
      const map = {};
      rawOrganismData.forEach(item => {
        const country = item.COUNTRY_ONLY;
        if (!country) return;
        if (!map[country]) map[country] = {};
        Object.entries(STYPHI_DRUG_RULES).forEach(([drugKey, rule]) => {
          if (!map[country][drugKey]) map[country][drugKey] = { resistant: 0, total: 0 };
          map[country][drugKey].total++;
          if (rule.values.includes(String(item[rule.columnID]))) {
            map[country][drugKey].resistant++;
          }
        });
      });
      return map;
    }

    // Region view: aggregate using economicRegions country→region mapping
    if (!economicRegions) return null;
    const countryToRegions = {};
    Object.entries(economicRegions).forEach(([region, countries]) => {
      countries.forEach(country => {
        if (!countryToRegions[country]) countryToRegions[country] = [];
        countryToRegions[country].push(region);
      });
    });
    const map = {};
    rawOrganismData.forEach(item => {
      const country = item.COUNTRY_ONLY;
      if (!country) return;
      (countryToRegions[country] || []).forEach(region => {
        if (!map[region]) map[region] = {};
        Object.entries(STYPHI_DRUG_RULES).forEach(([drugKey, rule]) => {
          if (!map[region][drugKey]) map[region][drugKey] = { resistant: 0, total: 0 };
          map[region][drugKey].total++;
          if (rule.values.includes(String(item[rule.columnID]))) {
            map[region][drugKey].resistant++;
          }
        });
      });
    });
    return map;
  }, [organism, xAxisType, rawOrganismData, economicRegions]);

  // Get available countries/regions that have data
  const availableLocations = useMemo(() => {
    if (!drugsData || typeof drugsData !== 'object') return [];
    const firstDrug = Object.keys(drugsData)[0];
    if (!firstDrug || !Array.isArray(drugsData[firstDrug])) return [];
    return drugsData[firstDrug]
      .filter(item => item.count >= 20)
      .map(item => item.name)
      .sort();
  }, [drugsData]);

  // Get all drug names from the data. For ecoli-family organisms the Radar is
  // a marker-oriented view, so collapse 'Ciprofloxacin NS'/'Ciprofloxacin R'
  // into the single 'Ciprofloxacin' aggregate (≥1 marker in Quinolone) that
  // filters.js also emits alongside them.
  const drugNames = useMemo(() => {
    if (!drugsData || typeof drugsData !== 'object') return [];
    const EXCLUDED = new Set([]); // removed 'MDR', 'XDR', 'Pansusceptible', 'Susceptible', 'Susceptible to cat I/II drugs'
    if (['ecoli', 'decoli', 'shige', 'senterica', 'sentericaints'].includes(organism)) {
      EXCLUDED.add('Ciprofloxacin NS');
      EXCLUDED.add('Ciprofloxacin R');
    }
    return Object.keys(drugsData).filter(d => !EXCLUDED.has(d));
  }, [drugsData, organism]);

  // Extra drug options: MDR, XDR, Pansusceptible — only those not already in drugNames
  const extraDrugOptions = useMemo(() => {
    const EXTRA_DRUGS = ['MDR', 'XDR', 'Pansusceptible'];
    return EXTRA_DRUGS.filter(drug => {
      if (drugNames.includes(drug)) return false; // already in the regular list
      if (organism === 'styphi') return true;
      return drugsData && drug in drugsData;
    });
  }, [organism, drugsData, drugNames]);

  // All selectable drug options
  const allDrugOptions = useMemo(() => [...drugNames, ...extraDrugOptions], [drugNames, extraDrugOptions]);

  // Default selection: styphi matches AMR trends defaults; other organisms show all
  const defaultDrugs = useMemo(() => {
    if (organism === 'styphi') {
      const seen = new Set();
      const hits = DEFAULT_RADAR_DRUGS_ST
        .map(d => (allDrugOptions.includes(d) ? d : (DEFAULT_DRUG_FALLBACKS[d] && allDrugOptions.includes(DEFAULT_DRUG_FALLBACKS[d]) ? DEFAULT_DRUG_FALLBACKS[d] : null)))
        .filter(d => d && !seen.has(d) && seen.add(d));
      return hits.length > 0 ? hits : allDrugOptions;
    }
    return allDrugOptions;
  }, [organism, allDrugOptions]);

  // Effective drugs shown on the radar (selectedDrugs=null means use defaultDrugs)
  const displayedDrugs = useMemo(() => {
    if (!selectedDrugs) return defaultDrugs;
    const valid = selectedDrugs.filter(d => allDrugOptions.includes(d));
    return valid.length > 0 ? valid : defaultDrugs;
  }, [selectedDrugs, defaultDrugs, allDrugOptions]);

  // Build radar chart data: one entry per drug, with values per location
  const radarData = useMemo(() => {
    if (!drugsData || selectedCountries.length === 0 || displayedDrugs.length === 0) return [];

    return displayedDrugs.map(drug => {
      const entry = {
        drug,
      };

      selectedCountries.forEach(location => {
        // 1. MDR/XDR/Pansusceptible for styphi: use raw per-genome computation
        if (styphiExtraResistance) {
          const raw = styphiExtraResistance[location]?.[drug];
          if (raw !== undefined) {
            entry[location] = raw.total >= 20 ? Number(((raw.resistant / raw.total) * 100).toFixed(1)) : null;
            return;
          }
        }

        // 2. Regular drugs for styphi country view: use per-genome raw counts
        if (styphiRawResistance) {
          const raw = styphiRawResistance[location]?.[drug];
          if (raw && raw.total >= 20) {
            entry[location] = Number(((raw.resistant / raw.total) * 100).toFixed(1));
          } else {
            entry[location] = null;
          }
          return;
        }

        // 3. All other organisms / styphi region regular drugs: use precomputed drugsData
        const drugEntries = drugsData[drug];
        if (!Array.isArray(drugEntries)) {
          entry[location] = null;
          return;
        }
        const locEntry = drugEntries.find(d => d.name === location);
        if (locEntry && locEntry.count > 0) {
          const resistant = locEntry.resistantCount ?? 0;
          entry[location] = Number(((resistant / locEntry.count) * 100).toFixed(1));
        } else {
          entry[location] = null;
        }
      });

      return entry;
    });
  }, [drugsData, selectedCountries, displayedDrugs, styphiRawResistance, styphiExtraResistance]);

  useEffect(() => {
    if (resetBool) {
      setXAxisType(DEFAULT_X_AXIS_TYPE);
      setSelectedCountries([]);
      setSelectedDrugs(null);
    }
  }, [resetBool]);

  useEffect(() => {
    if (availableLocations.length > 0 && selectedCountries.length === 0) {
      if (xAxisType === DEFAULT_X_AXIS_TYPE) {
        const defaults = DEFAULT_REGIONS.filter(r => availableLocations.includes(r));
        setSelectedCountries(defaults.length > 0 ? defaults : availableLocations.slice(0, MAX_COUNTRIES));
      } else {
        setSelectedCountries(availableLocations.slice(0, MAX_COUNTRIES));
      }
    }
  }, [availableLocations, xAxisType]);

  const handleCountrySelect = event => {
    const value = event.target.value;
    if (typeof value === 'string') {
      setSelectedCountries(value.split(',').slice(0, MAX_COUNTRIES));
    } else {
      setSelectedCountries(value.slice(0, MAX_COUNTRIES));
    }
  };

  const handleRemoveCountry = countryToRemove => {
    setSelectedCountries(prev => prev.filter(c => c !== countryToRemove));
  };

  const handleXAxisTypeChange = event => {
    setXAxisType(event.target.value);
    setSelectedCountries([]);
  };

  const handleDrugSelect = event => {
    const value = event.target.value;
    setSelectedDrugs(typeof value === 'string' ? value.split(',') : [...value]);
  };

  const handleRemoveDrug = drugToRemove => {
    const current = selectedDrugs ?? defaultDrugs;
    setSelectedDrugs(current.filter(d => d !== drugToRemove));
  };

  if (!canGetData) return null;

  const activeDrugsForSelector = selectedDrugs ?? defaultDrugs;

  return (
    <CardContent className={classes.radarProfileGraph}>
      {/* Chart area */}
      <Box className={classes.graphWrapper}>
        <Box className={classes.graph}>
          {selectedCountries.length === 0 ? (
            <Box className={classes.noSelection}>
              <Typography variant="body2" color="textSecondary">
                {t('common.selectCountriesToCompare')}
              </Typography>
            </Box>
          ) : radarData.length === 0 ? (
            <Box className={classes.noSelection}>
              <Typography variant="body2" color="error">
                No data available for selected {xAxisType === 'country' ? 'countries' : 'regions'}
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#ccc" />
                <PolarAngleAxis dataKey="drug" tick={{ fontSize: 10, fill: '#333' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} tickCount={6} />
                {selectedCountries.map((country, index) => (
                  <Radar
                    key={country}
                    name={country}
                    dataKey={country}
                    stroke={RADAR_COLORS[index % RADAR_COLORS.length]}
                    fill={RADAR_COLORS[index % RADAR_COLORS.length]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                    dot={{ r: 3, fill: RADAR_COLORS[index % RADAR_COLORS.length] }}
                    connectNulls
                  />
                ))}
                <ChartTooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </Box>

        {/* Right side: Legend */}
        <Box className={classes.rightSide}>
          {selectedCountries.length > 0 ? (
            <>
              <Typography variant="body2" fontWeight={600} sx={{ paddingBottom: '4px' }}>
                Legend
              </Typography>
              <Box className={classes.legendWrapper}>
                {selectedCountries.map((country, index) => (
                  <Box key={country} className={classes.legendItemWrapper}>
                    <Box
                      className={classes.colorCircle}
                      style={{ backgroundColor: RADAR_COLORS[index % RADAR_COLORS.length] }}
                    />
                    <Typography variant="caption">
                      {xAxisType === 'country' ? getLocalizedCountryName(country, i18n.language) : country}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <Box className={classes.tooltipWrapper}>
              <Box className={classes.noSelection}>
                <Typography variant="body2" color="textSecondary">
                  Select locations to see comparison
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Floating plotting-options panel — mirrors BubbleHeatmapGraph2 / SerotypeResistanceGraph */}
      {showFilter && (
        <Box className={classes.floatingFilter}>
          <Card elevation={3}>
            <CardContent>
              <PlottingOptionsHeader onClose={() => setShowFilter(false)} className={classes.titleWrapper} />
              <Box className={classes.selectWrapper}>
                <Box className={classes.labelWrapper}>
                  <Typography variant="caption">{t('common.compareBy')}</Typography>
                </Box>
                <Select
                  value={xAxisType}
                  onChange={handleXAxisTypeChange}
                  size="small"
                  inputProps={{ className: classes.selectInput }}
                >
                  <MenuItem value="country">{t('common.selectCountry')}</MenuItem>
                  <MenuItem value="region">{t('common.selectRegion')}</MenuItem>
                </Select>
              </Box>

              <Box className={classes.selectWrapper}>
                <Box className={classes.labelWrapper}>
                  <Typography variant="caption">{t('common.selectCountriesCompare')}</Typography>
                  <Tooltip title={t('common.selectCountriesCompareTooltip')}>
                    <InfoOutlined fontSize="small" sx={{ cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }} />
                  </Tooltip>
                </Box>
                <Select
                  multiple
                  value={selectedCountries}
                  onChange={handleCountrySelect}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(value => (
                        <Chip
                          key={value}
                          label={xAxisType === 'country' ? getLocalizedCountryName(value, i18n.language) : value}
                          size="small"
                          onDelete={() => handleRemoveCountry(value)}
                          onMouseDown={e => e.stopPropagation()}
                          sx={{
                            backgroundColor: RADAR_COLORS[selected.indexOf(value) % RADAR_COLORS.length],
                            color: '#fff',
                            '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' },
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  size="small"
                  MenuProps={{ PaperProps: { className: classes.menuPaper } }}
                  className={classes.selectMenu}
                  disabled={availableLocations.length === 0}
                >
                  {availableLocations.map(loc => (
                    <MenuItem
                      key={loc}
                      value={loc}
                      disabled={selectedCountries.length >= MAX_COUNTRIES && !selectedCountries.includes(loc)}
                    >
                      <Checkbox checked={selectedCountries.includes(loc)} size="small" />
                      <ListItemText
                        primary={xAxisType === 'country' ? getLocalizedCountryName(loc, i18n.language) : loc}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              {/* Drug selector */}
              {allDrugOptions.length > 0 && (
                <Box className={classes.selectWrapper}>
                  <Box className={classes.labelWrapper}>
                    <Typography variant="body2" fontWeight={600}>
                      Select drugs
                    </Typography>
                    <Tooltip title="Choose which drugs and resistance categories to display on the radar axes">
                      <InfoOutlined fontSize="small" sx={{ cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }} />
                    </Tooltip>
                  </Box>
                  <Select
                    multiple
                    value={activeDrugsForSelector}
                    onChange={handleDrugSelect}
                    renderValue={selected => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map(drug => (
                          <Chip
                            key={drug}
                            label={drug}
                            size="small"
                            onDelete={() => handleRemoveDrug(drug)}
                            onMouseDown={e => e.stopPropagation()}
                            sx={{
                              backgroundColor: extraDrugOptions.includes(drug) ? '#5c5c8a' : '#607d8b',
                              color: '#fff',
                              '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' },
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    size="small"
                    MenuProps={{ PaperProps: { className: classes.menuPaper } }}
                    className={classes.selectMenu}
                  >
                    {allDrugOptions.map(drug => (
                      <MenuItem key={drug} value={drug}>
                        <Checkbox checked={activeDrugsForSelector.includes(drug)} size="small" />
                        <ListItemText primary={drug} />
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </CardContent>
  );
};