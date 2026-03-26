import { InfoOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  CardContent,
  Checkbox,
  Chip,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Legend,
  Tooltip as ChartTooltip,
} from 'recharts';
import { useAppSelector } from '../../../../stores/hooks';
import { drugAcronyms } from '../../../../util/drugs';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { SelectCountry } from '../../SelectCountry';
import { PlottingOptionsHeader } from '../../Shared/PlottingOptionsHeader';
import { useStyles } from './RadarProfileGraphMUI';

const RADAR_COLORS = [
  '#006cde',
  '#cd3cbe',
  '#00ac35',
  '#e65c00',
  '#785EF0',
];

const MAX_COUNTRIES = 5;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ backgroundColor: '#fff', padding: '8px 12px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '4px' }}>
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
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [xAxisType, setXAxisType] = useState('country');

  const organism = useAppSelector(state => state.dashboard.organism);
  const drugsCountriesData = useAppSelector(state => state.graph.drugsCountriesData);
  const drugsRegionsData = useAppSelector(state => state.graph.drugsRegionsData);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);

  const drugsData = useMemo(() => {
    return xAxisType === 'country' ? drugsCountriesData : drugsRegionsData;
  }, [drugsCountriesData, drugsRegionsData, xAxisType]);

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

  // Get all drug names from the data
  const drugNames = useMemo(() => {
    if (!drugsData || typeof drugsData !== 'object') return [];
    return Object.keys(drugsData).filter(
      d => !['MDR', 'XDR', 'Pansusceptible', 'Susceptible', 'Susceptible to cat I/II drugs'].includes(d),
    );
  }, [drugsData]);

  // Build radar chart data: one entry per drug, with values per country
  const radarData = useMemo(() => {
    if (!drugsData || selectedCountries.length === 0 || drugNames.length === 0) return [];

    return drugNames.map(drug => {
      const entry = {
        drug,
        shortDrug: drugAcronyms[drug] || drug.substring(0, 6),
      };

      selectedCountries.forEach(country => {
        const drugEntries = drugsData[drug];
        if (!Array.isArray(drugEntries)) {
          entry[country] = null;
          return;
        }
        const countryEntry = drugEntries.find(d => d.name === country);
        if (countryEntry && countryEntry.count > 0) {
          // Calculate resistance percentage
          // For most organisms: resistantCount / count * 100
          // Some organisms store individual marker counts; use resistantCount if present
          const resistant = countryEntry.resistantCount ?? 0;
          entry[country] = Number(((resistant / countryEntry.count) * 100).toFixed(1));
        } else {
          entry[country] = null;
        }
      });

      return entry;
    });
  }, [drugsData, selectedCountries, drugNames]);

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

  if (!canGetData) return null;

  return (
    <CardContent className={classes.radarProfileGraph}>
      {/* Controls */}
      <Box className={classes.selectWrapper}>
        <Box className={classes.labelWrapper}>
          <Typography variant="body2" fontWeight={600}>
            Compare by
          </Typography>
        </Box>
        <Select
          value={xAxisType}
          onChange={handleXAxisTypeChange}
          size="small"
          sx={{ maxWidth: 200, fontSize: '14px' }}
        >
          <MenuItem value="country">Country</MenuItem>
          <MenuItem value="region">Region</MenuItem>
        </Select>
      </Box>

      <Box className={classes.selectWrapper}>
        <Box className={classes.labelWrapper}>
          <Typography variant="body2" fontWeight={600}>
            Select {xAxisType === 'country' ? 'countries' : 'regions'} (up to {MAX_COUNTRIES})
          </Typography>
          <Tooltip
            title={`Select up to ${MAX_COUNTRIES} ${xAxisType === 'country' ? 'countries' : 'regions'} to compare their AMR profiles. Only locations with N≥20 are shown.`}
          >
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
                  label={value}
                  size="small"
                  onDelete={() => handleRemoveCountry(value)}
                  onMouseDown={e => e.stopPropagation()}
                  sx={{ backgroundColor: RADAR_COLORS[selected.indexOf(value) % RADAR_COLORS.length], color: '#fff', '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' } }}
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
            <MenuItem key={loc} value={loc} disabled={selectedCountries.length >= MAX_COUNTRIES && !selectedCountries.includes(loc)}>
              <Checkbox checked={selectedCountries.includes(loc)} size="small" />
              <ListItemText primary={loc} />
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Chart area */}
      <Box className={classes.graphWrapper}>
        <Box className={classes.graph}>
          {selectedCountries.length === 0 ? (
            <Box className={classes.noSelection}>
              <Typography variant="body2" color="textSecondary">
                Select {xAxisType === 'country' ? 'countries' : 'regions'} to compare AMR profiles
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
                <PolarAngleAxis
                  dataKey="shortDrug"
                  tick={{ fontSize: 11, fill: '#333' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  tickCount={6}
                />
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

        {/* Right side: Legend + details */}
        <Box className={classes.rightSide}>
          {selectedCountries.length > 0 && (
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
                    <Typography variant="caption">{country}</Typography>
                  </Box>
                ))}
              </Box>

              <Typography variant="body2" fontWeight={600} sx={{ paddingTop: '8px', paddingBottom: '4px' }}>
                Drug Abbreviations
              </Typography>
              <Box className={classes.tooltipWrapper}>
                <Box sx={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {drugNames.map(drug => (
                    <Typography key={drug} variant="caption" sx={{ lineHeight: 1.4 }}>
                      <strong>{drugAcronyms[drug] || drug.substring(0, 6)}</strong>: {drug}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </>
          )}

          {selectedCountries.length === 0 && (
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
    </CardContent>
  );
};
