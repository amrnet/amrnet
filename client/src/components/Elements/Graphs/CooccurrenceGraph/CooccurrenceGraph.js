import { InfoOutlined } from '@mui/icons-material';
import { Box, CardContent, FormControlLabel, Slider, Switch, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useAppSelector } from '../../../../stores/hooks';
import {
  drugRulesKP,
  drugRulesNG,
  drugRulesSA,
  drugRulesSP,
  drugRulesST,
  statKeysECOLI,
} from '../../../../util/drugClassesRules';
import { getCountryDisplayName } from '../../../Dashboard/filters';
import { useStyles } from './CooccurrenceGraphMUI';

// Cells are wider than the original 36px so the diagonal column labels (now
// rendered as full drug names like 'Trimethoprim-sulfamethoxazole') get more
// spacing between baselines at -45deg and stop colliding with their
// neighbors. LABEL_WIDTH is sized so the longest horizontal row label and the
// longest rotated column label both fit.
const CELL_SIZE = 48;
const LABEL_WIDTH = 260;

// Per-organism lineage column used by the (lineage × country × year) dedup
// option. kpneumo and ecoli/decoli/shige expose more granular lineage clusters
// than the bare GENOTYPE column, so we prefer them when they're populated and
// fall back to GENOTYPE otherwise.
function getLineageKey(genome, organism) {
  if (organism === 'kpneumo' && genome.Sublineage && genome.Sublineage !== '-') {
    return genome.Sublineage;
  }
  if (['ecoli', 'decoli', 'shige'].includes(organism) && genome.LINcode_7 && genome.LINcode_7 !== '-') {
    return genome.LINcode_7;
  }
  return genome.GENOTYPE;
}
const EXCLUSIONS = [
  'MDR',
  'XDR',
  'Pansusceptible',
  'Susceptible',
  'Susceptible to cat I/II drugs',
  'H58',
  'Ciprofloxacin NS',
  'Ciprofloxacin R',
  'Trimethoprim-sulfamethoxazole',
  'Trimethoprim-Sulfamethoxazole',
];

/**
 * Determine which drugs a single genome is resistant to.
 * Returns a Set of drug names.
 */
function getResistantDrugs(genome, organism) {
  const resistant = new Set();

  if (organism === 'styphi') {
    drugRulesST.forEach(rule => {
      if (EXCLUSIONS.includes(rule.key)) return;
      if (rule.values.some(v => genome[rule.columnID]?.toString() === v.toString())) {
        resistant.add(rule.key);
      }
    });
  } else if (organism === 'kpneumo') {
    drugRulesKP.forEach(rule => {
      if (EXCLUSIONS.includes(rule.key)) return;
      const hasResistance = rule.columnIDs.some(id => genome[id] && genome[id] !== '-' && genome[id] !== 'ND');
      if ('every' in rule) {
        const allPresent = rule.columnIDs.every(id => genome[id] && genome[id] !== '-' && genome[id] !== 'ND');
        if (allPresent) resistant.add(rule.key);
      } else if (hasResistance) {
        resistant.add(rule.key);
      }
    });
  } else if (organism === 'ngono') {
    drugRulesNG.forEach(rule => {
      if (EXCLUSIONS.includes(rule.key)) return;
      if (Array.isArray(rule.columnID)) {
        if (rule.values.some(v => rule.columnID.some(col => genome[col]?.toString() === v.toString()))) {
          resistant.add(rule.key);
        }
      } else if (rule.values.some(v => genome[rule.columnID]?.toString() === v.toString())) {
        resistant.add(rule.key);
      }
    });
  } else if (['senterica', 'sentericaints', 'ecoli', 'decoli', 'shige'].includes(organism)) {
    statKeysECOLI.forEach(drug => {
      if (EXCLUSIONS.includes(drug.name) || !drug.resistanceView || drug.computed) return;
      if (!drug.rules || drug.rules.length === 0) return;
      const matchRule = rule => {
        const raw = genome[rule.column];
        const isEmpty = raw == null || raw === '' || raw === '-';
        // equal: true → susceptible check (value IS empty/'-')
        // equal: false → resistance check (value has actual gene content)
        return rule.equal ? isEmpty : !isEmpty;
      };
      const isResistant = drug.every ? drug.rules.every(matchRule) : drug.rules.some(matchRule);
      if (isResistant) resistant.add(drug.name);
    });
  } else if (organism === 'saureus') {
    drugRulesSA.forEach(rule => {
      if (EXCLUSIONS.includes(rule.key) || rule.pansusceptible) return;
      if (rule.values.some(v => genome[rule.columnID]?.toString() === v.toString())) {
        resistant.add(rule.key);
      }
    });
  } else if (organism === 'strepneumo') {
    drugRulesSP.forEach(rule => {
      if (EXCLUSIONS.includes(rule.key) || rule.pansusceptible) return;
      if (rule.values.some(v => genome[rule.columnID]?.toString() === v.toString())) {
        resistant.add(rule.key);
      }
    });
  }

  return resistant;
}

function getCooccurrenceColor(value) {
  if (value === null || value === undefined) return '#f9f9f9';
  if (value < 1) return '#f0f0f0';
  if (value < 5) return '#d4e4f7';
  if (value < 10) return '#a8c8ef';
  if (value < 20) return '#6ca4e0';
  if (value < 40) return '#3b7dd8';
  if (value < 60) return '#1a56b0';
  return '#0a3580';
}

function getTextColorForBg(value) {
  return value >= 20 ? '#fff' : '#333';
}

export const CooccurrenceGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [hoveredCell, setHoveredCell] = useState(null);
  const [minThreshold, setMinThreshold] = useState(5);
  const [dedup, setDedup] = useState(true);

  const organism = useAppSelector(state => state.dashboard.organism);
  const rawOrganismData = useAppSelector(state => state.graph.rawOrganismData);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const actualCountry = useAppSelector(state => state.dashboard.actualCountry);
  const actualRegion = useAppSelector(state => state.dashboard.actualRegion);
  const actualTimeInitial = useAppSelector(state => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector(state => state.dashboard.actualTimeFinal);
  const economicRegions = useAppSelector(state => state.dashboard.economicRegions);

  // Apply the dashboard's country / region / year-range filters to the raw
  // genome data so this plot stays in sync with the rest of Summary Plots.
  // Then, if dedup is on, collapse repeat isolates by (lineage, country, year)
  // — lineage prefers organism-specific clusters where available.
  const filteredGenomes = useMemo(() => {
    if (!Array.isArray(rawOrganismData) || rawOrganismData.length === 0) return [];

    const inDateRange = g => g.DATE >= actualTimeInitial && g.DATE <= actualTimeFinal;
    const inLocation = g => {
      if (actualCountry !== 'All') return getCountryDisplayName(g.COUNTRY_ONLY) === actualCountry;
      if (actualRegion !== 'All') {
        const countries = economicRegions?.[actualRegion] ?? [];
        return countries.includes(getCountryDisplayName(g.COUNTRY_ONLY));
      }
      return true;
    };

    const filtered = rawOrganismData.filter(g => inDateRange(g) && inLocation(g));
    if (!dedup) return filtered;

    const seen = new Set();
    const result = [];
    filtered.forEach(g => {
      const key = `${getLineageKey(g, organism)}|${g.COUNTRY_ONLY}|${g.DATE}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(g);
      }
    });
    return result;
  }, [
    rawOrganismData,
    organism,
    actualCountry,
    actualRegion,
    actualTimeInitial,
    actualTimeFinal,
    economicRegions,
    dedup,
  ]);

  // Compute REAL per-genome co-occurrence matrix
  const { drugNames, matrix, totalGenomes } = useMemo(() => {
    if (filteredGenomes.length === 0) {
      return { drugNames: [], matrix: {}, totalGenomes: 0 };
    }

    const total = filteredGenomes.length;

    // Count per-drug resistance and per-pair co-occurrence
    const drugCount = {}; // drug → count of resistant genomes
    const pairCount = {}; // "drugA|||drugB" → count of genomes resistant to both

    filteredGenomes.forEach(genome => {
      const resistantDrugs = getResistantDrugs(genome, organism);
      const drugs = [...resistantDrugs];

      drugs.forEach(d => {
        drugCount[d] = (drugCount[d] || 0) + 1;
      });

      // Count all pairs
      for (let i = 0; i < drugs.length; i++) {
        for (let j = i + 1; j < drugs.length; j++) {
          const key = drugs[i] < drugs[j] ? `${drugs[i]}|||${drugs[j]}` : `${drugs[j]}|||${drugs[i]}`;
          pairCount[key] = (pairCount[key] || 0) + 1;
        }
      }
    });

    // Get drug names sorted by prevalence
    const allDrugs = Object.keys(drugCount).sort((a, b) => drugCount[b] - drugCount[a]);

    // Build matrix
    const mat = {};
    allDrugs.forEach(drugA => {
      mat[drugA] = {};
      const countA = drugCount[drugA];
      const prevA = (countA / total) * 100;

      allDrugs.forEach(drugB => {
        if (drugA === drugB) {
          // Diagonal: a drug always co-occurs with itself → 100%
          mat[drugA][drugB] = { value: 100, type: 'self', count: countA, prevA };
        } else {
          const countB = drugCount[drugB];
          const key = drugA < drugB ? `${drugA}|||${drugB}` : `${drugB}|||${drugA}`;
          const coCount = pairCount[key] || 0;

          // Jaccard index: |A ∩ B| / |A ∪ B| × 100
          // → 100% when A and B always co-occur, 0% when never
          const union = countA + countB - coCount;
          const jaccard = union > 0 ? (coCount / union) * 100 : 0;

          const coPercent = (coCount / total) * 100;
          const expected = (countA / total) * (countB / total) * total;

          mat[drugA][drugB] = {
            value: jaccard, // Jaccard similarity % (primary display metric)
            coPercent, // % of ALL genomes with both (for tooltip)
            coCount,
            countA,
            countB,
            prevA,
            prevB: (countB / total) * 100,
            expected,
            oeRatio: expected > 0 ? coCount / expected : 0,
          };
        }
      });
    });

    return { drugNames: allDrugs, matrix: mat, totalGenomes: total };
  }, [filteredGenomes, organism]);

  // Filter drugs by prevalence threshold
  const filteredDrugs = useMemo(() => {
    if (totalGenomes === 0) return [];
    return drugNames.filter(d => {
      const prevalence = matrix[d]?.[d]?.prevA ?? 0;
      return prevalence >= minThreshold;
    });
  }, [drugNames, matrix, minThreshold, totalGenomes]);

  const svgWidth = LABEL_WIDTH + filteredDrugs.length * CELL_SIZE + 20;
  const svgHeight = LABEL_WIDTH + filteredDrugs.length * CELL_SIZE + 20;

  if (!canGetData) return null;

  return (
    <CardContent className={classes.cooccurrenceGraph}>
      <Box className={classes.controlsRow}>
        <Box className={classes.selectWrapper}>
          <Box className={classes.labelWrapper}>
            <Typography variant="body2" fontWeight={600}>
              Min. prevalence threshold (%)
            </Typography>
            <Tooltip title="Only show drugs with prevalence above this threshold. Co-occurrence is computed from per-genome data (real, not estimated).">
              <InfoOutlined fontSize="small" sx={{ cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }} />
            </Tooltip>
          </Box>
          <Slider
            value={minThreshold}
            onChange={(_, val) => setMinThreshold(val)}
            min={0}
            max={50}
            step={1}
            valueLabelDisplay="auto"
            sx={{ width: 200 }}
          />
        </Box>
        <Box className={classes.selectWrapper}>
          <Box className={classes.labelWrapper}>
            <Typography variant="body2" fontWeight={600}>
              Dedup repeat isolates
            </Typography>
            <Tooltip
              title={
                organism === 'kpneumo'
                  ? 'Keep one isolate per (Sublineage, country, year) where Sublineage is available; otherwise GENOTYPE.'
                  : ['ecoli', 'decoli', 'shige'].includes(organism)
                    ? 'Keep one isolate per (LINcode_7, country, year) where LIN code is available; otherwise GENOTYPE.'
                    : 'Keep one isolate per (GENOTYPE, country, year). Reduces over-counting of closely-related repeat isolates.'
              }
            >
              <InfoOutlined fontSize="small" sx={{ cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }} />
            </Tooltip>
          </Box>
          <FormControlLabel
            control={<Switch checked={dedup} onChange={(_, val) => setDedup(val)} size="small" />}
            label={<Typography variant="caption">{dedup ? 'On' : 'Off'}</Typography>}
            sx={{ marginLeft: 0 }}
          />
        </Box>
        {totalGenomes > 0 && (
          <Typography variant="caption" sx={{ color: '#666', paddingBottom: '4px' }}>
            Computed from {totalGenomes.toLocaleString()} {dedup ? 'unique isolates' : 'genomes'} (per-genome analysis,
            respects current country / region / year filters)
          </Typography>
        )}
      </Box>

      <Box className={classes.legendBar}>
        <Typography variant="caption">0%</Typography>
        <Box
          className={classes.legendGradient}
          sx={{
            background:
              'linear-gradient(to right, #f0f0f0 0%, #d4e4f7 10%, #a8c8ef 20%, #6ca4e0 35%, #3b7dd8 50%, #1a56b0 70%, #0a3580 100%)',
          }}
        />
        <Typography variant="caption">60%+</Typography>
        <Typography variant="caption" sx={{ marginLeft: '8px', color: '#666' }}>
          Jaccard similarity (100% = always co-occur, 0% = never)
        </Typography>
      </Box>

      <Box className={classes.graphWrapper}>
        <Box className={classes.matrixContainer}>
          {filteredDrugs.length === 0 ? (
            <Box className={classes.noSelection}>
              <Typography variant="body2" color="textSecondary">
                {filteredGenomes.length === 0
                  ? rawOrganismData.length === 0
                    ? 'Loading genome data...'
                    : 'No genomes match the current country / region / year filters.'
                  : `No drugs with prevalence ≥${minThreshold}%`}
              </Typography>
            </Box>
          ) : (
            <svg width={svgWidth} height={svgHeight}>
              {/* Column labels */}
              {filteredDrugs.map((drug, i) => (
                <text
                  key={`col-${drug}`}
                  x={LABEL_WIDTH + i * CELL_SIZE + CELL_SIZE / 2}
                  y={LABEL_WIDTH - 20}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="600"
                  transform={`rotate(-45, ${LABEL_WIDTH + i * CELL_SIZE + CELL_SIZE / 2}, ${LABEL_WIDTH - 20})`}
                >
                  {drug}
                </text>
              ))}
              {/* Rows */}
              {filteredDrugs.map((drugRow, rowIdx) => (
                <g key={`row-${drugRow}`}>
                  <text
                    x={LABEL_WIDTH - 20}
                    y={LABEL_WIDTH + rowIdx * CELL_SIZE + CELL_SIZE / 2 + 4}
                    textAnchor="end"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {drugRow}
                  </text>
                  {filteredDrugs.map((drugCol, colIdx) => {
                    const cellData = matrix[drugRow]?.[drugCol];
                    const value = cellData?.value ?? 0;
                    const bgColor =
                      cellData?.type === 'self' ? getCooccurrenceColor(value) : getCooccurrenceColor(value);
                    const isHovered = hoveredCell?.row === drugRow && hoveredCell?.col === drugCol;
                    return (
                      <g key={`cell-${drugRow}-${drugCol}`}>
                        <rect
                          x={LABEL_WIDTH + colIdx * CELL_SIZE}
                          y={LABEL_WIDTH + rowIdx * CELL_SIZE}
                          width={CELL_SIZE - 1}
                          height={CELL_SIZE - 1}
                          fill={bgColor}
                          stroke={isHovered ? '#333' : '#fff'}
                          strokeWidth={isHovered ? 2 : 0.5}
                          rx={2}
                          onMouseEnter={() => setHoveredCell({ row: drugRow, col: drugCol, data: cellData })}
                          onMouseLeave={() => setHoveredCell(null)}
                          style={{ cursor: 'pointer' }}
                        />
                        {value > 0 && CELL_SIZE >= 30 && (
                          <text
                            x={LABEL_WIDTH + colIdx * CELL_SIZE + CELL_SIZE / 2 - 0.5}
                            y={LABEL_WIDTH + rowIdx * CELL_SIZE + CELL_SIZE / 2 + 4}
                            textAnchor="middle"
                            fontSize="11"
                            fill={getTextColorForBg(value)}
                            pointerEvents="none"
                          >
                            {value.toFixed(0)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              ))}
            </svg>
          )}
        </Box>

        <Box className={classes.rightSide}>
          <Typography variant="body2" fontWeight={600}>
            Details
          </Typography>
          <Box className={classes.tooltipWrapper}>
            {hoveredCell ? (
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {hoveredCell.row} × {hoveredCell.col}
                </Typography>
                {hoveredCell.data?.type === 'self' ? (
                  <>
                    <Typography variant="caption" display="block">
                      Prevalence: {hoveredCell.data.prevA.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" display="block">
                      Count: {hoveredCell.data.count} / {totalGenomes}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ color: '#666', marginTop: '4px' }}>
                      Jaccard: 100% (same drug)
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="caption" display="block" sx={{ fontWeight: 600, marginBottom: '4px' }}>
                      Jaccard similarity: {hoveredCell.data.value.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" display="block">
                      {hoveredCell.row}: {hoveredCell.data.prevA.toFixed(1)}% ({hoveredCell.data.countA})
                    </Typography>
                    <Typography variant="caption" display="block">
                      {hoveredCell.col}: {hoveredCell.data.prevB.toFixed(1)}% ({hoveredCell.data.countB})
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ marginTop: '4px' }}>
                      Co-occurring genomes: {hoveredCell.data.coCount} ({hoveredCell.data.coPercent.toFixed(1)}% of
                      total)
                    </Typography>
                    <Typography variant="caption" display="block">
                      Expected if independent: {hoveredCell.data.expected.toFixed(0)} genomes
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{
                        color:
                          hoveredCell.data.oeRatio > 1.5
                            ? '#c62828'
                            : hoveredCell.data.oeRatio < 0.5
                              ? '#2e7d32'
                              : '#666',
                      }}
                    >
                      O/E ratio: {hoveredCell.data.oeRatio.toFixed(2)}
                      {hoveredCell.data.oeRatio > 1.5
                        ? ' (co-selected)'
                        : hoveredCell.data.oeRatio < 0.5
                          ? ' (negatively associated)'
                          : ''}
                    </Typography>
                  </>
                )}
              </Box>
            ) : (
              <Typography variant="caption" sx={{ lineHeight: 1.6 }}>
                Hover over a cell to see details.
                <br />
                <br />
                <strong>Values:</strong> Jaccard similarity — |A∩B| / |A∪B| × 100. Diagonal is always 100% (same drug).
                100% off-diagonal means both drugs always co-occur.
                <br />
                <br />
                <strong>O/E ratio:</strong> Observed/Expected co-occurrence.
                {'>'}1.5 = co-selected (resistance to both found together more than expected by chance).
                {'<'}0.5 = negatively associated (rarely found together). Co-selection may reflect co-located genes,
                clonal expansion, or shared selective pressures.
                <br />
                <br />
                <strong>Method:</strong> Genome-only. For each genome, resistance is determined using the same rules as
                AMR Trends, then all pairwise co-occurrences are counted. The plot respects the dashboard's current
                country / region / year-range filters. When the dedup toggle is on, the input is collapsed to one
                isolate per (lineage, country, year) — lineage uses Sublineage for kpneumo and LINcode_7 for
                ecoli/decoli/shige when available, falling back to GENOTYPE otherwise.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </CardContent>
  );
};
