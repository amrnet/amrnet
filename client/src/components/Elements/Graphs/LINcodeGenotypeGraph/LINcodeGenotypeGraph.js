// LINcode × Genotype association heatmap.
// Rows = LINcode lineages (top N by isolate count), columns = GENOTYPEs or Pathovars.
// Cell color intensity = isolate count; hovering shows exact count.
// Only shown for ecoli, decoli, shige (organisms with LIN code data).

import { Box, CardContent, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../stores/hooks';
import SHIGE_LINCODE_LOOKUP from '../../../../data/lincode_shigella_lookup.json';

const EMPTY_VALUES = new Set([null, '', '-', 'ND', undefined]);

const LIN_FIELD_OPTIONS = [
  { value: 'LINcode_3',  label: 'LINcode_3 (broad)' },
  { value: 'LINcode_5',  label: 'LINcode_5' },
  { value: 'LINcode_7',  label: 'LINcode_7' },
  { value: 'LINcode_9',  label: 'LINcode_9 (high res)' },
  { value: 'LINcode_11', label: 'LINcode_11 (finest)' },
];

const X_FIELD_OPTIONS = [
  { value: 'GENOTYPE', label: 'GENOTYPE / ST' },
  { value: 'Pathovar', label: 'Pathovar / Pathotype' },
];

const TOP_N_OPTIONS = [5, 10, 15, 20];

function getLINLabel(rawValue, organism) {
  if (organism !== 'shige') return rawValue;
  const entry = SHIGE_LINCODE_LOOKUP[rawValue];
  if (!entry) return rawValue;
  return entry.speciesCode ? `${entry.speciesCode} ${entry.lineage}` : entry.lineage;
}

// Interpolate from white (#fff) to a teal-ish color based on 0–1 intensity.
function cellColor(count, maxCount) {
  if (maxCount === 0 || count === 0) return '#f5f5f5';
  const t = Math.sqrt(count / maxCount); // sqrt scale so small counts are visible
  const r = Math.round(255 - t * (255 - 0));
  const g = Math.round(255 - t * (255 - 128));
  const b = Math.round(255 - t * (255 - 128));
  return `rgb(${r},${g},${b})`;
}

export const LINcodeGenotypeGraph = () => {
  const { t } = useTranslation();
  const organism = useAppSelector(state => state.dashboard.organism);
  const rawData = useAppSelector(state => state.graph.rawOrganismData);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);

  const [linField, setLinField] = useState('LINcode_7');
  const [xField, setXField] = useState('GENOTYPE');
  const [topNRows, setTopNRows] = useState(10);
  const [topNCols, setTopNCols] = useState(10);

  const { matrix, rowLabels, colLabels, maxCount, totalCrossed } = useMemo(() => {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return { matrix: [], rowLabels: [], colLabels: [], maxCount: 0, totalCrossed: 0 };
    }

    // Count isolates per (lincode, xField) pair
    const rowTotals = {};   // raw lincode → total count
    const colTotals = {};   // xField value → total count
    const cells = {};       // `${lin}|||${x}` → count

    let crossed = 0;
    rawData.forEach(item => {
      const lin = item[linField];
      const x   = item[xField];
      if (EMPTY_VALUES.has(lin) || EMPTY_VALUES.has(x)) return;
      crossed++;
      rowTotals[lin] = (rowTotals[lin] ?? 0) + 1;
      colTotals[x]   = (colTotals[x]   ?? 0) + 1;
      const k = `${lin}|||${x}`;
      cells[k] = (cells[k] ?? 0) + 1;
    });

    const topRows = Object.entries(rowTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topNRows)
      .map(([v]) => v);

    const topCols = Object.entries(colTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topNCols)
      .map(([v]) => v);

    let maxCount = 0;
    const matrix = topRows.map(row =>
      topCols.map(col => {
        const c = cells[`${row}|||${col}`] ?? 0;
        if (c > maxCount) maxCount = c;
        return c;
      })
    );

    const rowLabels = topRows.map(raw => getLINLabel(raw, organism));
    return { matrix, rowLabels, colLabels: topCols, maxCount, totalCrossed: crossed };
  }, [rawData, linField, xField, topNRows, topNCols, organism]);

  if (!canGetData) return null;

  const CELL_W = 52;
  const CELL_H = 28;
  const LABEL_W = 160;

  return (
    <CardContent>
      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
          <Typography variant="caption" fontWeight={600}>{t('amrInsights.linGenotype.linField')}</Typography>
          <Select size="small" value={linField} onChange={e => setLinField(e.target.value)} sx={{ fontSize: 12, minWidth: 160 }}>
            {LIN_FIELD_OPTIONS.map(o => (
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: 12 }}>{o.label}</MenuItem>
            ))}
          </Select>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
          <Typography variant="caption" fontWeight={600}>{t('amrInsights.linGenotype.xField')}</Typography>
          <Select size="small" value={xField} onChange={e => setXField(e.target.value)} sx={{ fontSize: 12, minWidth: 160 }}>
            {X_FIELD_OPTIONS.map(o => (
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: 12 }}>{o.label}</MenuItem>
            ))}
          </Select>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
          <Typography variant="caption" fontWeight={600}>{t('amrInsights.linGenotype.topNLineages')}</Typography>
          <Select size="small" value={topNRows} onChange={e => setTopNRows(e.target.value)} sx={{ fontSize: 12, minWidth: 70 }}>
            {TOP_N_OPTIONS.map(n => <MenuItem key={n} value={n} sx={{ fontSize: 12 }}>{n}</MenuItem>)}
          </Select>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
          <Typography variant="caption" fontWeight={600}>{t('amrInsights.linGenotype.topNGenotypes')}</Typography>
          <Select size="small" value={topNCols} onChange={e => setTopNCols(e.target.value)} sx={{ fontSize: 12, minWidth: 70 }}>
            {TOP_N_OPTIONS.map(n => <MenuItem key={n} value={n} sx={{ fontSize: 12 }}>{n}</MenuItem>)}
          </Select>
        </Box>
      </Box>

      {matrix.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          {t('amrInsights.linGenotype.empty')}
        </Typography>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          {/* Column headers */}
          <Box sx={{ display: 'flex', ml: `${LABEL_W}px` }}>
            {colLabels.map(col => (
              <Tooltip key={col} title={col} arrow placement="top">
                <Box
                  sx={{
                    width: CELL_W,
                    minWidth: CELL_W,
                    fontSize: 10,
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    px: 0.3,
                    pb: 0.5,
                    fontWeight: 600,
                  }}
                >
                  {col}
                </Box>
              </Tooltip>
            ))}
          </Box>

          {/* Rows */}
          {matrix.map((row, ri) => (
            <Box key={rowLabels[ri]} sx={{ display: 'flex', alignItems: 'center', mb: '2px' }}>
              <Tooltip title={rowLabels[ri]} arrow placement="right">
                <Box
                  sx={{
                    width: LABEL_W,
                    minWidth: LABEL_W,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    pr: 1,
                    textAlign: 'right',
                  }}
                >
                  {rowLabels[ri]}
                </Box>
              </Tooltip>
              {row.map((count, ci) => (
                <Tooltip
                  key={ci}
                  title={
                    count > 0
                      ? `${rowLabels[ri]} × ${colLabels[ci]}: ${count.toLocaleString()} isolates`
                      : `${rowLabels[ri]} × ${colLabels[ci]}: 0`
                  }
                  arrow
                  placement="top"
                >
                  <Box
                    sx={{
                      width: CELL_W,
                      minWidth: CELL_W,
                      height: CELL_H,
                      background: cellColor(count, maxCount),
                      border: '1px solid #e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: count > 0 ? 600 : 400,
                      color: count / maxCount > 0.5 ? '#fff' : '#333',
                      cursor: count > 0 ? 'default' : 'default',
                    }}
                  >
                    {count > 0 ? count.toLocaleString() : ''}
                  </Box>
                </Tooltip>
              ))}
            </Box>
          ))}
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
        {t('amrInsights.linGenotype.footer', { n: totalCrossed.toLocaleString() })}
      </Typography>
    </CardContent>
  );
};
