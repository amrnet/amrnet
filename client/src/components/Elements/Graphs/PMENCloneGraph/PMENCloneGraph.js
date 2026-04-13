import { InfoOutlined } from '@mui/icons-material';
import { Box, CardContent, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppSelector } from '../../../../stores/hooks';
import { drugsSP } from '../../../../util/drugs';

// PMEN clone definitions: key = "CC_Serotype" or "ST_Serotype"
// Based on McGee et al. 2001, Beall et al. 2006, Hanage et al., and subsequent literature.
// Serotypes are stored in canonical (non-zero-padded) form — normalization applied at lookup time.
const PMEN_LOOKUP = {
  'CC81_23F':  { pmen: 'PMEN1',  name: 'Spain23F-1' },
  '81_23F':    { pmen: 'PMEN1',  name: 'Spain23F-1' },

  'CC9_14':    { pmen: 'PMEN2',  name: 'England14-9' },
  '9_14':      { pmen: 'PMEN2',  name: 'England14-9' },

  'CC180_3':   { pmen: 'PMEN3',  name: 'Netherlands3-31' },
  '180_3':     { pmen: 'PMEN3',  name: 'Netherlands3-31' },

  'CC90_6B':   { pmen: 'PMEN4',  name: 'Spain6B-2' },
  '90_6B':     { pmen: 'PMEN4',  name: 'Spain6B-2' },

  'CC18_14':   { pmen: 'PMEN5',  name: 'Tennessee14-18' },
  '18_14':     { pmen: 'PMEN5',  name: 'Tennessee14-18' },

  'CC162_9V':  { pmen: 'PMEN6',  name: 'Spain9V-3' },
  '162_9V':    { pmen: 'PMEN6',  name: 'Spain9V-3' },

  'CC44_9V':   { pmen: 'PMEN7',  name: 'UK9V-22' },
  '44_9V':     { pmen: 'PMEN7',  name: 'UK9V-22' },

  'CC63_1':    { pmen: 'PMEN8',  name: 'SouthAfrica1-19' },
  '63_1':      { pmen: 'PMEN8',  name: 'SouthAfrica1-19' },

  'CC276_19A': { pmen: 'PMEN9',  name: 'SouthAfrica19A-7' },
  '276_19A':   { pmen: 'PMEN9',  name: 'SouthAfrica19A-7' },

  'CC315_21':  { pmen: 'PMEN10', name: 'Greece21-30' },
  '315_21':    { pmen: 'PMEN10', name: 'Greece21-30' },

  'CC61_15B':  { pmen: 'PMEN11', name: 'SouthAfrica15B-17' },
  '61_15B':    { pmen: 'PMEN11', name: 'SouthAfrica15B-17' },
  'CC61_15C':  { pmen: 'PMEN11', name: 'SouthAfrica15B-17' },
  '61_15C':    { pmen: 'PMEN11', name: 'SouthAfrica15B-17' },

  'CC156_9V':  { pmen: 'PMEN12', name: 'France9V-13' },
  '156_9V':    { pmen: 'PMEN12', name: 'France9V-13' },

  'CC306_1':   { pmen: 'PMEN13', name: 'Sweden1-28' },
  '306_1':     { pmen: 'PMEN13', name: 'Sweden1-28' },

  'CC63_15A':  { pmen: 'PMEN14', name: 'Sweden15A-25' },
  '63_15A':    { pmen: 'PMEN14', name: 'Sweden15A-25' },

  'CC315_6B':  { pmen: 'PMEN15', name: 'Poland6B-20' },
  '315_6B':    { pmen: 'PMEN15', name: 'Poland6B-20' },

  'CC395_6A':  { pmen: 'PMEN16', name: 'Spain6A-11' },
  '395_6A':    { pmen: 'PMEN16', name: 'Spain6A-11' },

  'CC191_7F':  { pmen: 'PMEN17', name: 'Netherlands7F-31' },
  '191_7F':    { pmen: 'PMEN17', name: 'Netherlands7F-31' },

  'CC113_18C': { pmen: 'PMEN18', name: 'Netherlands18C-26' },
  '113_18C':   { pmen: 'PMEN18', name: 'Netherlands18C-26' },

  'CC236_19F': { pmen: 'PMEN19', name: 'Taiwan19F-14' },
  '236_19F':   { pmen: 'PMEN19', name: 'Taiwan19F-14' },
  'CC262_19F': { pmen: 'PMEN19', name: 'Taiwan19F-14' },
  '262_19F':   { pmen: 'PMEN19', name: 'Taiwan19F-14' },
};

const MIN_COUNT = 10;
const PMEN_COLOR = '#1565c0';
const OTHER_COLOR = '#90a4ae';

/** Normalize serotype: strip leading zeros from numeric prefix, keep letter suffix.
 *  e.g. "06B" → "6B",  "03" → "3",  "09V" → "9V",  "19A" → "19A" (unchanged)
 */
function normalizeSerotype(serotype) {
  if (!serotype) return null;
  return serotype.toString().trim().replace(/^0+(\d)/, '$1');
}

function getPMENInfo(lineage, serotype) {
  if (!lineage || !serotype) return null;
  const s = normalizeSerotype(serotype);
  // Lineage can contain multiple CCs separated by ";" (e.g. "22;857;882")
  const lineages = lineage.toString().split(';').map(l => l.trim()).filter(Boolean);
  for (const l of lineages) {
    const ccKey = `CC${l}_${s}`;
    const plainKey = `${l}_${s}`;
    const match = PMEN_LOOKUP[ccKey] ?? PMEN_LOOKUP[plainKey];
    if (match) return match;
  }
  return null;
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ backgroundColor: '#fff', padding: '10px 14px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '4px', maxWidth: 260 }}>
      <Typography variant="body2" fontWeight={700}>{d.label}</Typography>
      {d.pmenInfo && (
        <Typography variant="caption" display="block" sx={{ color: PMEN_COLOR, fontWeight: 600 }}>
          {d.pmenInfo.pmen} · {d.pmenInfo.name}
        </Typography>
      )}
      <Typography variant="caption" display="block">Prevalence: {d.prevalence.toFixed(1)}%</Typography>
      <Typography variant="caption" display="block">Count: {d.count} genomes</Typography>
      {d.drugs?.length > 0 && (
        <Box sx={{ marginTop: '6px', borderTop: '1px solid #eee', paddingTop: '6px' }}>
          <Typography variant="caption" display="block" fontWeight={600}>Resistance (% of clone):</Typography>
          {d.drugs.map(drug => (
            <Typography key={drug.name} variant="caption" display="block">
              {drug.name}: {drug.prevalence.toFixed(0)}%
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export const PMENCloneGraph = () => {
  const [sortBy, setSortBy] = useState('prevalence');
  const [showTop, setShowTop] = useState(20);

  const organism = useAppSelector(state => state.dashboard.organism);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const rawData = useAppSelector(state => state.graph.rawOrganismData);

  const drugs = useMemo(() => drugsSP.filter(d => d !== 'Pansusceptible'), []);

  const cloneData = useMemo(() => {
    if (!rawData?.length || organism !== 'strepneumo') return [];

    // Group by Lineage (CC) + Serotype combination
    const byClone = {};
    rawData.forEach(item => {
      const lineage = item.Lineage || 'Unknown';
      const serotype = normalizeSerotype(item.Serotype) || 'Unknown';
      // Use first lineage for grouping key (multi-CC genomes grouped by primary)
      const primaryLineage = lineage.split(';')[0].trim();
      const key = `${primaryLineage}__${serotype}`;
      if (!byClone[key]) byClone[key] = { lineage: primaryLineage, fullLineage: lineage, serotype, items: [] };
      byClone[key].items.push(item);
    });

    const total = rawData.length;

    const entries = Object.values(byClone)
      .filter(({ items }) => items.length >= MIN_COUNT)
      .map(({ lineage, fullLineage, serotype, items }) => {
        const pmenInfo = getPMENInfo(fullLineage, serotype);
        const count = items.length;
        const prevalence = (count / total) * 100;

        const drugStats = drugs
          .map(drug => ({
            name: drug,
            prevalence: (items.filter(x => x[drug] === '1' || x[drug] === 1).length / count) * 100,
          }))
          .filter(d => d.prevalence > 0);

        const label = pmenInfo
          ? `${pmenInfo.pmen} (CC${lineage}/${serotype})`
          : `CC${lineage} / ${serotype}`;

        return { label, lineage, serotype, pmenInfo, count, prevalence, drugs: drugStats, isPMEN: !!pmenInfo };
      });

    if (sortBy === 'prevalence') entries.sort((a, b) => b.prevalence - a.prevalence);
    else if (sortBy === 'pmen-first')
      entries.sort((a, b) => {
        if (a.isPMEN && !b.isPMEN) return -1;
        if (!a.isPMEN && b.isPMEN) return 1;
        return b.prevalence - a.prevalence;
      });
    else entries.sort((a, b) => a.label.localeCompare(b.label));

    return entries.slice(0, showTop);
  }, [rawData, organism, drugs, sortBy, showTop]);

  const pmenCount = cloneData.filter(d => d.isPMEN).length;

  if (!canGetData || organism !== 'strepneumo') return null;

  return (
    <CardContent sx={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(0,0,0,0.12)' }}>
      {/* Controls */}
      <Box sx={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', paddingTop: '8px', paddingBottom: '12px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '4px' }}>
            <Typography variant="body2" fontWeight={600}>PMEN Clone Prevalence</Typography>
            <Tooltip title="Groups genomes by Lineage (CC) + Serotype. Combinations matching established PMEN clone definitions (Beall 2006, Hanage et al.) are highlighted in blue.">
              <InfoOutlined fontSize="small" sx={{ cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }} />
            </Tooltip>
          </Box>
          {pmenCount > 0 && (
            <Typography variant="caption" sx={{ color: '#666' }}>
              {pmenCount} PMEN clone{pmenCount !== 1 ? 's' : ''} detected in current dataset
            </Typography>
          )}
          {pmenCount === 0 && cloneData.length > 0 && (
            <Typography variant="caption" sx={{ color: '#999' }}>
              No PMEN clones matched in current selection
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="caption" fontWeight={600}>Sort by</Typography>
          <Select value={sortBy} onChange={e => setSortBy(e.target.value)} size="small" sx={{ minWidth: 160, fontSize: '13px' }}>
            <MenuItem value="prevalence">Prevalence</MenuItem>
            <MenuItem value="pmen-first">PMEN clones first</MenuItem>
            <MenuItem value="alphabetical">Alphabetical</MenuItem>
          </Select>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="caption" fontWeight={600}>Show top</Typography>
          <Select value={showTop} onChange={e => setShowTop(e.target.value)} size="small" sx={{ minWidth: 100, fontSize: '13px' }}>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={30}>30</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '8px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: PMEN_COLOR, borderRadius: '2px' }} />
          <Typography variant="caption">PMEN clone</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: OTHER_COLOR, borderRadius: '2px' }} />
          <Typography variant="caption">Other CC / Serotype</Typography>
        </Box>
      </Box>

      {/* Chart */}
      {cloneData.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Typography variant="body2" color="textSecondary">
            {rawData.length === 0 ? 'Loading genome data...' : `No Lineage+Serotype combinations with N≥${MIN_COUNT}`}
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(300, cloneData.length * 28)}>
          <BarChart data={cloneData} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 180 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 'auto']} tickFormatter={v => `${v.toFixed(0)}%`} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fontWeight: 500 }} width={180} />
            <ChartTooltip content={CustomTooltip} />
            <Bar dataKey="prevalence" radius={[0, 3, 3, 0]}>
              {cloneData.map(entry => (
                <Cell key={`${entry.lineage}_${entry.serotype}`} fill={entry.isPMEN ? PMEN_COLOR : OTHER_COLOR} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* PMEN reference chips */}
      {cloneData.some(d => d.isPMEN) && (
        <Box sx={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
          <Typography variant="body2" fontWeight={600} sx={{ marginBottom: '6px' }}>PMEN Clone Reference</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {cloneData.filter(d => d.isPMEN).map(d => (
              <Box key={`${d.lineage}_${d.serotype}`} sx={{ padding: '4px 10px', backgroundColor: '#e3f2fd', borderRadius: '12px', border: '1px solid #90caf9' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: PMEN_COLOR }}>{d.pmenInfo.pmen}</Typography>
                <Typography variant="caption"> · {d.pmenInfo.name} · {d.prevalence.toFixed(1)}%</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </CardContent>
  );
};
