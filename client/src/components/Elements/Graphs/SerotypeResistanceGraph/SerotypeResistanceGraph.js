import { InfoOutlined } from '@mui/icons-material';
import { Box, CardContent, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useAppSelector } from '../../../../stores/hooks';
import { drugsSP } from '../../../../util/drugs';
import { useStyles } from './SerotypeResistanceGraphMUI';

const MIN_SEROTYPE_COUNT = 10;
const MAX_SEROTYPES = 30;

/** Strip leading zeros from serotype numeric prefix: "06B"→"6B", "09V"→"9V", "03"→"3" */
function normalizeSerotype(st) {
  if (!st) return st;
  return st
    .toString()
    .trim()
    .replace(/^0+(\d)/, '$1');
}

// PCV vaccine coverage — canonical (non-zero-padded) serotype lists
const PCV7_SEROTYPES = ['4', '6B', '9V', '14', '18C', '19F', '23F'];
const PCV10_SEROTYPES = ['1', '4', '5', '6B', '7F', '9V', '14', '18C', '19F', '23F'];
const PCV13_SEROTYPES = ['1', '3', '4', '5', '6A', '6B', '7F', '9V', '14', '18C', '19A', '19F', '23F'];
const PCV15_SEROTYPES = ['1', '3', '4', '5', '6A', '6B', '7F', '9V', '14', '18C', '19A', '19F', '22F', '23F', '33F'];
const PCV20_EXTRA = ['8', '10A', '11A', '12F', '15B', '22F', '33F'];
const PCV20_SEROTYPES = [...PCV13_SEROTYPES, ...PCV20_EXTRA];

// Sets for "first introduced in" coloring (canonical forms only)
const PCV7_FIRST = new Set(PCV7_SEROTYPES);
const PCV10_FIRST = new Set(PCV10_SEROTYPES.filter(s => !PCV7_FIRST.has(s)));
const PCV13_FIRST = new Set(PCV13_SEROTYPES.filter(s => !PCV10_SEROTYPES.includes(s)));
const PCV15_FIRST = new Set(['22F', '33F']);
const PCV20_FIRST = new Set(['8', '10A', '11A', '12F', '15B']);

const VACCINE_COLORS = {
  pcv7: '#e65c00',
  pcv10: '#00796b',
  pcv13: '#1565c0',
  pcv15: '#2e7d32',
  pcv20: '#7b1fa2',
};

function getVaccineColor(st) {
  const n = normalizeSerotype(st);
  if (PCV7_FIRST.has(n)) return VACCINE_COLORS.pcv7;
  if (PCV10_FIRST.has(n)) return VACCINE_COLORS.pcv10;
  if (PCV13_FIRST.has(n)) return VACCINE_COLORS.pcv13;
  if (PCV15_FIRST.has(n)) return VACCINE_COLORS.pcv15;
  if (PCV20_FIRST.has(n)) return VACCINE_COLORS.pcv20;
  return null;
}

const VACCINE_LEGEND = [
  { key: 'pcv7', label: 'PCV7' },
  { key: 'pcv10', label: 'PCV10+' },
  { key: 'pcv13', label: 'PCV13+' },
  { key: 'pcv15', label: 'PCV15+' },
  { key: 'pcv20', label: 'PCV20+' },
];

function getPrevalenceColor(value) {
  if (value === null || value === undefined) return '#f5f5f5';
  if (value === 0) return '#e8f5e9';
  if (value <= 10) return '#fff9c4';
  if (value <= 30) return '#ffcc80';
  if (value <= 60) return '#ef6c00';
  return '#b71c1c';
}

function getTextColor(value) {
  return value > 30 ? '#fff' : '#333';
}

export const SerotypeResistanceGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [sortBy, setSortBy] = useState('count');
  const [vaccineFilter, setVaccineFilter] = useState('all');

  const organism = useAppSelector(state => state.dashboard.organism);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const rawData = useAppSelector(state => state.graph.rawOrganismData);

  const drugs = useMemo(() => drugsSP.filter(d => d !== 'Pansusceptible'), []);

  // Compute serotype × resistance from raw data
  const { serotypes, serotypeData } = useMemo(() => {
    if (rawData.length === 0 || organism !== 'strepneumo') {
      return { serotypes: [], serotypeData: {} };
    }

    // Group by serotype
    const bySerotype = {};
    rawData.forEach(item => {
      const st = item.Serotype || 'Unknown';
      if (!bySerotype[st]) bySerotype[st] = [];
      bySerotype[st].push(item);
    });

    // Compute resistance per serotype per drug
    const data = {};
    Object.entries(bySerotype).forEach(([st, items]) => {
      if (items.length < MIN_SEROTYPE_COUNT) return;

      // Apply vaccine filter — normalize before comparing
      const nst = normalizeSerotype(st);
      if (vaccineFilter === 'pcv7' && !PCV7_SEROTYPES.includes(nst)) return;
      if (vaccineFilter === 'pcv10' && !PCV10_SEROTYPES.includes(nst)) return;
      if (vaccineFilter === 'pcv13' && !PCV13_SEROTYPES.includes(nst)) return;
      if (vaccineFilter === 'pcv15' && !PCV15_SEROTYPES.includes(nst)) return;
      if (vaccineFilter === 'pcv20' && !PCV20_SEROTYPES.includes(nst)) return;
      if (vaccineFilter === 'non-vaccine' && PCV20_SEROTYPES.includes(nst)) return;

      data[st] = { count: items.length, drugs: {} };

      drugs.forEach(drug => {
        const resistant = items.filter(x => x[drug] === '1' || x[drug] === 1).length;
        data[st].drugs[drug] = {
          count: resistant,
          prevalence: Number(((resistant / items.length) * 100).toFixed(1)),
        };
      });

      // Compute multi-drug resistance (resistant to ≥3 drugs)
      const mdrCount = items.filter(item => {
        const resistantDrugs = drugs.filter(d => item[d] === '1' || item[d] === 1).length;
        return resistantDrugs >= 3;
      }).length;
      data[st].mdr = Number(((mdrCount / items.length) * 100).toFixed(1));
    });

    // Build "Others" aggregate row when a specific vaccine filter is active
    const VACCINE_FILTER_SETS = {
      pcv7: PCV7_SEROTYPES,
      pcv10: PCV10_SEROTYPES,
      pcv13: PCV13_SEROTYPES,
      pcv15: PCV15_SEROTYPES,
      pcv20: PCV20_SEROTYPES,
    };
    const activeSet = VACCINE_FILTER_SETS[vaccineFilter];
    if (activeSet) {
      const otherItems = rawData.filter(item => !activeSet.includes(normalizeSerotype(item.Serotype)));
      if (otherItems.length > 0) {
        const otherCount = otherItems.length;
        const otherDrugs = {};
        drugs.forEach(drug => {
          const resistant = otherItems.filter(x => x[drug] === '1' || x[drug] === 1).length;
          otherDrugs[drug] = {
            count: resistant,
            prevalence: Number(((resistant / otherCount) * 100).toFixed(1)),
          };
        });
        const otherMdr = otherItems.filter(item => {
          return drugs.filter(d => item[d] === '1' || item[d] === 1).length >= 3;
        }).length;
        data['__OTHERS__'] = {
          count: otherCount,
          drugs: otherDrugs,
          mdr: Number(((otherMdr / otherCount) * 100).toFixed(1)),
          isOthers: true,
        };
      }
    }

    // Sort serotypes (exclude __OTHERS__ — always goes last)
    const sorted = Object.keys(data).filter(k => k !== '__OTHERS__');
    if (sortBy === 'count') {
      sorted.sort((a, b) => data[b].count - data[a].count);
    } else if (sortBy === 'resistance') {
      sorted.sort((a, b) => {
        const aAvg = drugs.reduce((s, d) => s + (data[a].drugs[d]?.prevalence || 0), 0) / drugs.length;
        const bAvg = drugs.reduce((s, d) => s + (data[b].drugs[d]?.prevalence || 0), 0) / drugs.length;
        return bAvg - aAvg;
      });
    } else if (sortBy === 'mdr') {
      sorted.sort((a, b) => data[b].mdr - data[a].mdr);
    } else {
      sorted.sort((a, b) => a.localeCompare(b));
    }

    const finalList = sorted.slice(0, MAX_SEROTYPES);
    if (data['__OTHERS__']) finalList.push('__OTHERS__');

    return { serotypes: finalList, serotypeData: data };
  }, [rawData, organism, drugs, sortBy, vaccineFilter]);

  if (!canGetData || organism !== 'strepneumo') return null;

  return (
    <CardContent className={classes.serotypeResistanceGraph}>
      <Box className={classes.controlsRow}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box className={classes.legendBar} sx={{ padding: 0, paddingBottom: '4px' }}>
            <Typography variant="body2" fontWeight={600}>
              Serotype × Resistance
            </Typography>
            <Tooltip title="Shows resistance prevalence for each S. pneumoniae serotype across all drugs. Critical for evaluating vaccine impact on AMR — PCV13/PCV20 coverage is highlighted.">
              <InfoOutlined fontSize="small" sx={{ cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }} />
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="caption" fontWeight={600}>
            Vaccine filter
          </Typography>
          <Select
            value={vaccineFilter}
            onChange={e => setVaccineFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150, fontSize: '13px' }}
          >
            <MenuItem value="all">All serotypes</MenuItem>
            <MenuItem value="pcv7">PCV7 only</MenuItem>
            <MenuItem value="pcv10">PCV10 only</MenuItem>
            <MenuItem value="pcv13">PCV13 only</MenuItem>
            <MenuItem value="pcv15">PCV15 only</MenuItem>
            <MenuItem value="pcv20">PCV20 only</MenuItem>
            <MenuItem value="non-vaccine">Non-vaccine types</MenuItem>
          </Select>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="caption" fontWeight={600}>
            Sort by
          </Typography>
          <Select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            size="small"
            sx={{ minWidth: 150, fontSize: '13px' }}
          >
            <MenuItem value="count">Sample count</MenuItem>
            <MenuItem value="resistance">Avg. resistance</MenuItem>
            <MenuItem value="mdr">MDR rate</MenuItem>
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
            background: 'linear-gradient(to right, #e8f5e9 0%, #fff9c4 15%, #ffcc80 35%, #ef6c00 65%, #b71c1c 100%)',
          }}
        />
        <Typography variant="caption">60%+</Typography>
        <Box sx={{ marginLeft: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {VACCINE_LEGEND.map(({ key, label }) => (
            <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Box sx={{ width: 8, height: 8, backgroundColor: VACCINE_COLORS[key], borderRadius: '1px' }} />
              <Typography variant="caption" sx={{ fontSize: '9px' }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box className={classes.graphWrapper}>
        <Box className={classes.heatmapArea}>
          {serotypes.length === 0 ? (
            <Box className={classes.noSelection}>
              <Typography variant="body2" color="textSecondary">
                {organism !== 'strepneumo'
                  ? 'Serotype analysis available for S. pneumoniae only'
                  : `No serotypes with N≥${MIN_SEROTYPE_COUNT}`}
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Header */}
              <Box className={classes.headerRow}>
                <Box className={classes.serotypeLabel}>
                  <Typography variant="caption" fontWeight={600}>
                    Serotype
                  </Typography>
                </Box>
                {drugs.map(drug => (
                  <Box key={drug} className={classes.drugLabel}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '9px',
                        fontWeight: 600,
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {drug}
                    </Typography>
                  </Box>
                ))}
                <Box className={classes.drugLabel}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '9px',
                      fontWeight: 700,
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      color: '#d32f2f',
                    }}
                  >
                    MDR
                  </Typography>
                </Box>
              </Box>

              {/* Data rows */}
              {serotypes.map(st => {
                const data = serotypeData[st];
                if (!data) return null;
                const isOthers = st === '__OTHERS__';
                const vaccineColor = isOthers ? null : getVaccineColor(st);

                return (
                  <Box
                    key={st}
                    className={classes.dataRow}
                    sx={
                      isOthers
                        ? { borderTop: '2px dashed #bbb', marginTop: '4px', backgroundColor: 'rgba(0,0,0,0.03)' }
                        : {}
                    }
                  >
                    <Box
                      className={classes.serotypeLabel}
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}
                    >
                      {vaccineColor && (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            backgroundColor: vaccineColor,
                            borderRadius: '1px',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '11px',
                          fontWeight: isOthers ? 600 : vaccineColor ? 600 : 400,
                          fontStyle: isOthers ? 'italic' : 'normal',
                        }}
                        noWrap
                      >
                        {isOthers ? 'Others' : st}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '9px', color: '#999' }}>
                        ({data.count})
                      </Typography>
                    </Box>
                    {drugs.map(drug => {
                      const cellData = data.drugs[drug];
                      const value = cellData?.prevalence ?? 0;
                      return (
                        <Tooltip
                          key={`${st}-${drug}`}
                          title={
                            <Box>
                              <Typography variant="caption" fontWeight={600}>
                                {isOthers ? 'Others' : `Serotype ${st}`} — {drug}
                              </Typography>
                              <br />
                              <Typography variant="caption">
                                Resistance: {value}% ({cellData?.count || 0}/{data.count})
                              </Typography>
                            </Box>
                          }
                          arrow
                          placement="top"
                        >
                          <Box className={classes.cell} sx={{ backgroundColor: getPrevalenceColor(value) }}>
                            {value > 0 && (
                              <Typography
                                variant="caption"
                                sx={{ fontSize: '8px', color: getTextColor(value), fontWeight: value > 30 ? 600 : 400 }}
                              >
                                {Math.round(value)}
                              </Typography>
                            )}
                          </Box>
                        </Tooltip>
                      );
                    })}
                    {/* MDR column */}
                    <Tooltip title={`MDR (≥3 drugs): ${data.mdr}%`} arrow placement="top">
                      <Box className={classes.cell} sx={{ backgroundColor: getPrevalenceColor(data.mdr) }}>
                        <Typography
                          variant="caption"
                          sx={{ fontSize: '8px', color: getTextColor(data.mdr), fontWeight: 600 }}
                        >
                          {Math.round(data.mdr)}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        <Box className={classes.rightSide}>
          <Typography variant="body2" fontWeight={600}>
            Vaccine Coverage
          </Typography>
          <Box className={classes.tooltipWrapper}>
            <Typography variant="caption" sx={{ lineHeight: 1.6 }}>
              <strong>PCV7:</strong> {PCV7_SEROTYPES.join(', ')}
              <br />
              <br />
              <strong>PCV10 additional:</strong> {PCV10_SEROTYPES.filter(s => !PCV7_SEROTYPES.includes(s)).join(', ')}
              <br />
              <br />
              <strong>PCV13 additional:</strong> {PCV13_SEROTYPES.filter(s => !PCV10_SEROTYPES.includes(s)).join(', ')}
              <br />
              <br />
              <strong>PCV15 additional:</strong> {PCV15_SEROTYPES.filter(s => !PCV13_SEROTYPES.includes(s)).join(', ')}
              <br />
              <br />
              <strong>PCV20 additional:</strong> {PCV20_EXTRA.filter(s => !PCV15_SEROTYPES.includes(s)).join(', ')}
              <br />
              <br />
              <strong>Clinical significance:</strong> If vaccine-type serotypes carry high resistance, vaccination
              programs could reduce AMR burden by preventing resistant infections. Non-vaccine serotypes with high
              resistance may indicate serotype replacement risk.
              <br />
              <br />
              <strong>MDR:</strong> Resistant to ≥3 drug classes. Serotypes with high MDR rates are priority targets for
              prevention strategies.
            </Typography>
          </Box>
        </Box>
      </Box>
    </CardContent>
  );
};
