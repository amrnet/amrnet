import { InfoOutlined } from '@mui/icons-material';
import { Box, CardContent, Slider, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useAppSelector } from '../../../../stores/hooks';
import {
  drugRulesKP,
  drugRulesNG,
  drugRulesSA,
  drugRulesSP,
  drugRulesST,
  statKeysECOLI,
  statKeysINTS,
} from '../../../../util/drugClassesRules';
import { drugAcronyms } from '../../../../util/drugs';
import { useStyles } from './CooccurrenceGraphMUI';

const CELL_SIZE = 36;
const LABEL_WIDTH = 120;
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
  } else if (['senterica', 'sentericaints'].includes(organism)) {
    statKeysINTS.forEach(drug => {
      if (EXCLUSIONS.includes(drug.name) || !drug.resistanceView || drug.computed) return;
      if (Array.isArray(drug.column)) {
        // Pansusceptible-like: skip
        return;
      }
      const val = genome[drug.column];
      if (!val || val === '-') return;
      if (Array.isArray(drug.key)) {
        if (drug.key.some(k => val.includes(k))) resistant.add(drug.name);
      } else {
        if (val.includes(drug.key)) resistant.add(drug.name);
      }
    });
  } else if (['ecoli', 'decoli', 'shige'].includes(organism)) {
    statKeysECOLI.forEach(drug => {
      if (EXCLUSIONS.includes(drug.name) || !drug.resistanceView || drug.computed) return;
      if (!drug.rules || drug.rules.length === 0) return;
      const matchRule = rule => {
        const val = genome[rule.column];
        const strVal = val !== undefined && val !== null ? String(val) : '-';
        if (rule.equal) return strVal === rule.value || strVal.includes(rule.value);
        return strVal !== rule.value;
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

  const organism = useAppSelector(state => state.dashboard.organism);
  const rawOrganismData = useAppSelector(state => state.graph.rawOrganismData);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);

  // Compute REAL per-genome co-occurrence matrix
  const { drugNames, matrix, totalGenomes } = useMemo(() => {
    if (!Array.isArray(rawOrganismData) || rawOrganismData.length === 0) {
      return { drugNames: [], matrix: {}, totalGenomes: 0 };
    }

    const total = rawOrganismData.length;

    // Count per-drug resistance and per-pair co-occurrence
    const drugCount = {}; // drug → count of resistant genomes
    const pairCount = {}; // "drugA|||drugB" → count of genomes resistant to both

    rawOrganismData.forEach(genome => {
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
  }, [rawOrganismData, organism]);

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
        {totalGenomes > 0 && (
          <Typography variant="caption" sx={{ color: '#666', paddingBottom: '4px' }}>
            Computed from {totalGenomes.toLocaleString()} genomes (per-genome analysis)
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
                {rawOrganismData.length === 0 ? 'Loading genome data...' : `No drugs with prevalence ≥${minThreshold}%`}
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
                  {drugAcronyms[drug] || drug.substring(0, 6)}
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
                    {drugAcronyms[drugRow] || drugRow.substring(0, 8)}
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
                            y={LABEL_WIDTH + rowIdx * CELL_SIZE + CELL_SIZE / 2 + 3.5}
                            textAnchor="middle"
                            fontSize="9"
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
                <strong>Method:</strong> Per-genome analysis. For each genome, resistance is determined using the same
                rules as AMR Trends. Then all pairwise co-occurrences are counted.
              </Typography>
            )}
          </Box>
          <Typography variant="body2" fontWeight={600} sx={{ marginTop: '8px' }}>
            Drug abbreviations
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '200px', overflowY: 'auto' }}>
            {filteredDrugs.map(drug => (
              <Typography key={drug} variant="caption" sx={{ lineHeight: 1.4 }}>
                <strong>{drugAcronyms[drug] || drug.substring(0, 6)}</strong>: {drug}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </CardContent>
  );
};
