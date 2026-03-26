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
import { getCountryDisplayName } from '../../../Dashboard/filters';
import { useStyles } from './GeneMapGraphMUI';

const MIN_SAMPLES = 20;
const MAX_LOCATIONS = 20;

const FALLBACK_REGIONS = {
  'Russia': 'Eastern Europe', 'Hong Kong': 'Eastern Asia', 'North Macedonia': 'Southern Europe',
  'Venezuela': 'South America', 'Palestine': 'Western Asia', 'Curaçao': 'Caribbean',
  'Curacao': 'Caribbean', 'Taiwan': 'Eastern Asia', 'Kosovo': 'Southern Europe', 'Macau': 'Eastern Asia',
};

// Gene class definitions: which acquired fields to parse for each class
const GENE_CLASSES = {
  Carbapenemases: { fields: ['Bla_Carb_acquired'], label: 'Carbapenemase enzymes' },
  ESBLs: { fields: ['Bla_ESBL_acquired'], label: 'ESBL enzymes' },
  Aminoglycosides: { fields: ['AGly_acquired'], label: 'Aminoglycoside resistance genes' },
  'Fluoroquinolone (acquired)': { fields: ['Flq_acquired'], label: 'Acquired fluoroquinolone resistance' },
  'Fluoroquinolone (mutations)': { fields: ['Flq_mutations'], label: 'Fluoroquinolone resistance mutations' },
  'Colistin (acquired)': { fields: ['Col_acquired'], label: 'Acquired colistin resistance genes' },
  'Colistin (mutations)': { fields: ['Col_mutations'], label: 'Colistin resistance mutations' },
  'Porin mutations': { fields: ['Omp_mutations'], label: 'Outer membrane porin mutations' },
  'SHV mutations': { fields: ['SHV_mutations'], label: 'SHV beta-lactamase mutations' },
};

function parseGenes(value) {
  if (!value || value === '-' || value === 'ND') return [];
  return value
    .split(';')
    .map(g => g.replace(/\..*$/, '').replace(/[\^*?$]/g, '').trim())
    .filter(Boolean);
}

function getPrevalenceColor(value) {
  if (value === null || value === undefined || value === 0) return '#f5f5f5';
  if (value < 1) return '#f0e6f6';
  if (value < 5) return '#d4b9e8';
  if (value < 15) return '#b07cc9';
  if (value < 30) return '#8b45a6';
  if (value < 50) return '#6a1d8a';
  return '#3d0066';
}

function getTextColor(value) {
  return value >= 15 ? '#fff' : '#333';
}

export const GeneMapGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [selectedClass, setSelectedClass] = useState('Carbapenemases');
  const [xAxisType, setXAxisType] = useState('region');
  const [hoveredCell, setHoveredCell] = useState(null);

  const organism = useAppSelector(state => state.dashboard.organism);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const economicRegions = useAppSelector(state => state.dashboard.economicRegions);
  const rawData = useAppSelector(state => state.graph.rawOrganismData);

  // Parse genes from raw data and compute per-location gene prevalence
  const { geneNames, locationData, locations } = useMemo(() => {
    if (!rawData || rawData.length === 0 || organism !== 'kpneumo') {
      return { geneNames: [], locationData: {}, locations: [] };
    }

    const config = GENE_CLASSES[selectedClass];
    if (!config) return { geneNames: [], locationData: {}, locations: [] };

    // Group data by location
    const locationField = xAxisType === 'country' ? 'COUNTRY_ONLY' : null;
    const byLocation = {};

    if (xAxisType === 'region' && economicRegions) {
      // Build country-to-region map with fuzzy fallback
      const countryToRegion = {};
      const normalizedLookup = {};
      const normalize = s => s?.toLowerCase().replace(/[^a-z]/g, '') || '';
      Object.entries(economicRegions).forEach(([region, countries]) => {
        countries.forEach(c => {
          countryToRegion[c] = region;
          normalizedLookup[normalize(c)] = region;
        });
      });

      rawData.forEach(item => {
        const displayName = getCountryDisplayName(item.COUNTRY_ONLY);
        const loc = countryToRegion[displayName] || normalizedLookup[normalize(displayName)] || FALLBACK_REGIONS[displayName] || 'Unknown';
        if (!byLocation[loc]) byLocation[loc] = [];
        byLocation[loc].push(item);
      });
    } else {
      rawData.forEach(item => {
        const loc = getCountryDisplayName(item.COUNTRY_ONLY) || item.COUNTRY_ONLY || 'Unknown';
        if (!byLocation[loc]) byLocation[loc] = [];
        byLocation[loc].push(item);
      });
    }

    // Count gene occurrences per location
    const geneSet = new Set();
    const locGeneCount = {};
    const locTotal = {};

    Object.entries(byLocation).forEach(([loc, items]) => {
      if (items.length < MIN_SAMPLES) return;
      locTotal[loc] = items.length;
      locGeneCount[loc] = {};

      // Count items that have ANY gene in the selected class (denominator for %)
      const resistantItems = items.filter(item =>
        config.fields.some(field => item[field] && item[field] !== '-' && item[field] !== 'ND'),
      );

      // Parse individual genes
      items.forEach(item => {
        config.fields.forEach(field => {
          const genes = parseGenes(item[field]);
          genes.forEach(gene => {
            geneSet.add(gene);
            if (!locGeneCount[loc][gene]) locGeneCount[loc][gene] = 0;
            locGeneCount[loc][gene]++;
          });
        });
      });
    });

    // Sort genes by total prevalence
    const allGenes = Array.from(geneSet);
    const geneTotals = {};
    allGenes.forEach(gene => {
      geneTotals[gene] = Object.values(locGeneCount).reduce((s, lc) => s + (lc[gene] || 0), 0);
    });
    const sortedGenes = allGenes
      .sort((a, b) => geneTotals[b] - geneTotals[a])
      .slice(0, 15); // Top 15 genes

    // Sort locations by total samples
    const sortedLocations = Object.keys(locTotal)
      .sort((a, b) => locTotal[b] - locTotal[a])
      .slice(0, MAX_LOCATIONS);

    // Build prevalence data
    const data = {};
    sortedLocations.forEach(loc => {
      data[loc] = { total: locTotal[loc] };
      sortedGenes.forEach(gene => {
        const count = locGeneCount[loc]?.[gene] || 0;
        data[loc][gene] = {
          count,
          prevalence: Number(((count / locTotal[loc]) * 100).toFixed(1)),
        };
      });
    });

    return { geneNames: sortedGenes, locationData: data, locations: sortedLocations };
  }, [rawData, selectedClass, organism, xAxisType, economicRegions]);

  if (!canGetData || organism !== 'kpneumo') return null;

  return (
    <CardContent className={classes.geneMapGraph}>
      <Box className={classes.controlsRow}>
        <Box className={classes.selectWrapper}>
          <Box className={classes.labelWrapper}>
            <Typography variant="body2" fontWeight={600}>Gene class</Typography>
            <Tooltip title="Select which class of resistance genes/mutations to display. Gene names are parsed from Kleborate output fields.">
              <InfoOutlined fontSize="small" sx={{ cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }} />
            </Tooltip>
          </Box>
          <Select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            size="small"
            sx={{ minWidth: 220, fontSize: '14px' }}
          >
            {Object.entries(GENE_CLASSES).map(([key, cfg]) => (
              <MenuItem key={key} value={key}>{key}</MenuItem>
            ))}
          </Select>
        </Box>

        <Box className={classes.selectWrapper}>
          <Box className={classes.labelWrapper}>
            <Typography variant="body2" fontWeight={600}>Group by</Typography>
          </Box>
          <Select
            value={xAxisType}
            onChange={e => setXAxisType(e.target.value)}
            size="small"
            sx={{ minWidth: 140, fontSize: '14px' }}
          >
            <MenuItem value="region">Region</MenuItem>
            <MenuItem value="country">Country</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Legend */}
      <Box className={classes.legendBar}>
        <Typography variant="caption">0%</Typography>
        <Box
          className={classes.legendGradient}
          sx={{
            background: 'linear-gradient(to right, #f5f5f5 0%, #f0e6f6 5%, #d4b9e8 15%, #b07cc9 30%, #8b45a6 50%, #6a1d8a 75%, #3d0066 100%)',
          }}
        />
        <Typography variant="caption">50%+</Typography>
        <Typography variant="caption" sx={{ marginLeft: '8px', color: '#666' }}>
          (% of all {xAxisType === 'region' ? 'regional' : 'country'} isolates carrying this gene)
        </Typography>
      </Box>

      <Box className={classes.graphWrapper}>
        <Box className={classes.heatmapArea}>
          {locations.length === 0 || geneNames.length === 0 ? (
            <Box className={classes.noSelection}>
              <Typography variant="body2" color="textSecondary">
                {organism !== 'kpneumo'
                  ? 'Gene-level analysis is currently available for K. pneumoniae only'
                  : `No ${selectedClass} genes detected in locations with N≥${MIN_SAMPLES}`}
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Header: gene names */}
              <Box className={classes.headerRow}>
                <Box className={classes.locationLabel}>
                  <Typography variant="caption" fontWeight={600}>
                    {xAxisType === 'country' ? 'Country' : 'Region'}
                  </Typography>
                </Box>
                {geneNames.map(gene => (
                  <Box key={gene} className={classes.geneLabel}>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '9px', fontWeight: 600, writingMode: geneNames.length > 8 ? 'vertical-rl' : 'horizontal-tb', transform: geneNames.length > 8 ? 'rotate(180deg)' : 'none', whiteSpace: 'nowrap' }}
                    >
                      {gene}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Data rows */}
              {locations.map(loc => (
                <Box key={loc} className={classes.dataRow}>
                  <Box className={classes.locationLabel}>
                    <Typography variant="caption" sx={{ fontSize: '11px' }} noWrap title={loc}>
                      {loc}
                    </Typography>
                  </Box>
                  {geneNames.map(gene => {
                    const cellData = locationData[loc]?.[gene];
                    const value = cellData?.prevalence ?? 0;
                    const bgColor = getPrevalenceColor(value);
                    const txtColor = getTextColor(value);

                    return (
                      <Tooltip
                        key={`${loc}-${gene}`}
                        title={
                          <Box>
                            <Typography variant="caption" fontWeight={600}>{gene}</Typography>
                            <br />
                            <Typography variant="caption">{loc}</Typography>
                            <br />
                            <Typography variant="caption">
                              Prevalence: {value}% ({cellData?.count || 0} / {locationData[loc]?.total || 0})
                            </Typography>
                          </Box>
                        }
                        arrow
                        placement="top"
                      >
                        <Box className={classes.cell} sx={{ backgroundColor: bgColor }}>
                          {value > 0 && (
                            <Typography variant="caption" sx={{ fontSize: '8px', color: txtColor, fontWeight: value > 10 ? 600 : 400 }}>
                              {value < 1 ? '<1' : Math.round(value)}
                            </Typography>
                          )}
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Right side: details */}
        <Box className={classes.rightSide}>
          <Typography variant="body2" fontWeight={600}>
            {GENE_CLASSES[selectedClass]?.label || selectedClass}
          </Typography>
          <Box className={classes.tooltipWrapper}>
            {hoveredCell ? (
              <Box>
                <Typography variant="body2" fontWeight={600}>{hoveredCell.gene}</Typography>
                <Typography variant="caption">{hoveredCell.location}: {hoveredCell.prevalence}%</Typography>
              </Box>
            ) : (
              <Typography variant="caption" sx={{ lineHeight: 1.6 }}>
                This heatmap shows the prevalence of individual {selectedClass.toLowerCase()} across
                {xAxisType === 'country' ? ' countries' : ' world regions'}.
                <br /><br />
                <strong>Data source:</strong> Gene names are parsed from Kleborate v3.2.4 output
                (acquired resistance genes and point mutations).
                <br /><br />
                <strong>Interpretation:</strong> Values show the percentage of ALL isolates in that location
                carrying the specific gene/mutation. Locations with N&lt;{MIN_SAMPLES} are excluded.
                <br /><br />
                {selectedClass === 'Carbapenemases' && (
                  <>
                    <strong>Key enzymes:</strong> KPC-2/3 (class A), NDM-1 (class B), OXA-48/232 (class D),
                    VIM, IMP. Regional distribution varies substantially — see Cerdeira et al. 2026 NAR Fig. 6.
                  </>
                )}
                {selectedClass === 'Porin mutations' && (
                  <>
                    <strong>Note:</strong> Porin mutations (OmpK35, OmpK36) reduce carbapenem entry.
                    When combined with ESBL, they can confer carbapenem resistance without a carbapenemase.
                  </>
                )}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </CardContent>
  );
};
