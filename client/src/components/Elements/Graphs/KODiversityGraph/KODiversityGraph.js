import { Box, CardContent, Typography } from '@mui/material';
import { useStyles } from './KODiversityGraphMUI';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Label,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setResetBool } from '../../../../stores/slices/graphSlice';
import { hoverColor } from '../../../../util/colorHelper';
import { useEffect, useState } from 'react';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { colorsForKODiversityGraph } from '../graphColorHelper';

export const KODiversityGraph = () => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);

  const dispatch = useAppDispatch();
  const KODiversityData = useAppSelector((state) => state.graph.KODiversityData);
  const resetBool = useAppSelector((state) => state.graph.resetBool);

  useEffect(() => {
    dispatch(setResetBool(true));
    setCurrentTooltip(null);
  }, [KODiversityData, dispatch]);

  function handleClickChart(type, event) {
    const data = (KODiversityData[type] ?? []).find((item) => item.name === event?.activeLabel);

    if (data) {
      const currentData = structuredClone(data);

      const value = {
        type,
        name: currentData.name,
        count: currentData.count,
        diversity: [],
      };

      delete currentData.name;
      delete currentData.count;

      Object.keys(currentData).forEach((key) => {
        const count = currentData[key];
        if (count === 0) return;
        const activePayload = event.activePayload?.find((x) => x.name === key);
        value.diversity.push({
          label: key,
          count,
          percentage: Number(((count / value.count) * 100).toFixed(2)),
          color: activePayload?.fill,
        });
      });

      setCurrentTooltip(value);
      dispatch(setResetBool(false));
    }
  }

  useEffect(() => {
    if (resetBool) {
      setCurrentTooltip(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetBool]);

  // Helper for log scale (avoid -Infinity for 0)
  function safeLog10(val) {
    return val > 0 ? Math.log10(val) : 0;
  }

  // Prepare data for both plots, using the same years
  const years = Array.from(
    new Set([
      ...(KODiversityData.K_locus ?? []).map((d) => d.name),
      ...(KODiversityData.O_locus ?? []).map((d) => d.name),
    ])
  ).sort();

  // Find max value for normalization
  let maxValue = 0;
  [...(KODiversityData.K_locus ?? []), ...(KODiversityData.O_locus ?? [])].forEach((d) => {
    Object.keys(d).forEach((k) => {
      if (k !== 'name' && k !== 'count') {
        if (d[k] > maxValue) maxValue = d[k];
      }
    });
  });

  // Merge K_locus and O_locus into a single data array for a mirrored plot, normalized (0-1)
  const mergedData = years.map((year) => {
    // Filter out "unknown" from K_locus
    let k = (KODiversityData.K_locus ?? []).find((d) => d.name === year);
    if (k) {
      k = Object.fromEntries(
        Object.entries(k).filter(([key]) => key !== 'unknown')
      );
    } else {
      k = {};
    }
    // Filter out "unknown" from O_locus
    let o = (KODiversityData.O_locus ?? []).find((d) => d.name === year);
    if (o) {
      o = Object.fromEntries(
        Object.entries(o).filter(([key]) => key !== 'unknown')
      );
    } else {
      o = {};
    }
    const merged = { name: year };
    // K locus: left (negative values for mirror effect)
    colorsForKODiversityGraph.forEach((option) => {
      if (option.name === 'unknown') return;
      const raw = k[option.name] || 0;
      // Normalize to 0-1
      const norm = maxValue > 0 ? raw / maxValue : 0;
      merged[`K_${option.name}`] = -norm;
    });
    // O locus: right (positive values, skip "unknown")
    colorsForKODiversityGraph.forEach((option) => {
      if (option.name === 'unknown') return;
      const raw = o[option.name] || 0;
      const norm = maxValue > 0 ? raw / maxValue : 0;
      merged[`O_${option.name}`] = norm;
    });
    // For tooltips
    merged.K_count = k.count || 0;
    merged.O_count = o.count || 0;
    return merged;
  });

  // Helper for tooltip click
  function handleBarClick(data, index, type, key) {
    // type: 'K_locus' or 'O_locus'
    // key: e.g. 'K_XYZ' or 'O_XYZ'
    const locus = type === 'K_locus' ? 'K_locus' : 'O_locus';
    const year = data.name;
    const original = (KODiversityData[locus] ?? []).find((d) => d.name === year);
    if (!original) return;
    const value = {
      type: locus,
      name: original.name,
      count: original.count,
      diversity: [],
    };
    Object.keys(original).forEach((k) => {
      if (k === 'name' || k === 'count' || k === 'unknown') return; // <-- filter unknown here
      const count = original[k];
      if (count === 0) return;
      value.diversity.push({
        label: k,
        count,
        percentage: Number(((count / value.count) * 100).toFixed(2)),
        color:
          colorsForKODiversityGraph.find((c) => c.name === k)?.color ||
          colorsForKODiversityGraph[0].color,
      });
    });
    setCurrentTooltip(value);
    dispatch(setResetBool(false));
  }

  // Filter out "unknown" from the color options
  const filteredColors = colorsForKODiversityGraph.filter(option => option.name !== 'unknown');

  return (
    <CardContent className={classes.KODiversityGraph}>
      <div className={classes.graphWrapper}>
        {/* <Typography variant="subtitle1" align="Left" sx={{ mb: 1 }}>
          K locus */}
          {/* <span style={{ float: 'right', fontWeight: 500 }}>O locus</span> */}
        {/* </Typography> */}
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            layout="vertical"
            data={mergedData}
            cursor={isTouchDevice() ? 'default' : 'pointer'}
            margin={{ top: 5, right: 250, left: 250, bottom: 50 }} // increased bottom for legend padding
          >
            <CartesianGrid strokeDasharray="3 3" />
            {/* Left Y Axis: K_locus (hide labels) */}
            <YAxis
              yAxisId="left"
              dataKey="name"
              type="category"
              tick={{ fontSize: 14 }}
              width={150}
              interval={0}
              orientation="left"
              reversed={false}
            />
            {/* Right Y Axis: O_locus (show labels) */}
            <YAxis
              yAxisId="right"
              dataKey="name"
              type="category"
              tick={{ fontSize: 14 }}
              width={200}
              interval={0}
              orientation="right"
              reversed={false}
            />
            <XAxis
              type="number"
              allowDataOverflow
              allowDecimals={true}
              fontSize="14px"
              domain={[-1, 1]}
              tickFormatter={(v) => Math.abs(v).toFixed(2)}
            >
              <Label
                value="Number of genomes"
                position="insideBottom"
                className={classes.graphLabel}
                offset={-10} // add padding below the axis label
              />
            </XAxis>
            <ChartTooltip
              cursor={{ fill: hoverColor }}
              content={({ payload, active, label }) => {
                if (payload !== null && active) {
                  return <div className={classes.chartTooltipLabel}>{label}</div>;
                }
                return null;
              }}
            />
            {/* K locus bars (left, negative values) */}
            {filteredColors.map((option, index) => (
              <Bar
                key={`KODiversity-bar-K-${index}`}
                dataKey={`K_${option.name}`}
                name={`K locus: ${option.name}`}
                stackId="K"
                fill={option.color}
                yAxisId="left"
                onClick={(data, idx) => handleBarClick(data, idx, 'K_locus', `K_${option.name}`)}
              />
            ))}
            {/* O locus bars (right, positive values) */}
            {filteredColors.map((option, index) => (
              <Bar
                key={`KODiversity-bar-O-${index}`}
                dataKey={`O_${option.name}`}
                name={`O locus: ${option.name}`}
                stackId="O"
                fill={option.color}
                yAxisId="right"
                onClick={(data, idx) => handleBarClick(data, idx, 'O_locus', `O_${option.name}`)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        {/* Unified legend below the chart */}
        <Box className={classes.legendWrapper} sx={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: 0, justifyContent: 'center', gap: 1, padding: 1 }}>
          {filteredColors.map((option, index) => (
            <div key={`legend-K-${index}`} className={classes.legendItemWrapper}>
              <Box className={classes.colorCircle} style={{ backgroundColor: option.color }} />
              <Typography variant="caption">{option.name}</Typography>
            </div>
          ))}
        </Box>
      </div>
      {/* Single info panel below the plot */}
      <div
        className={classes.tooltipWrapper}
        style={{
          width: '50%',
          marginTop: 24,
          display: 'flex',
          justifyContent: 'flex-end', // align to the right
        }}
      >
        {currentTooltip ? (
          <div className={classes.tooltip} style={{ alignItems: 'center', width: '100%' }}>
            <div
              className={classes.tooltipTitle}
              style={{ justifyContent: 'center', textAlign: 'center', width: '100%' }}
            >
              <Typography variant="h5" fontWeight="600" align="center" sx={{ width: '100%' }}>
                {currentTooltip.type === 'K_locus' ? 'K locus' : 'O locus'}: {currentTooltip.name}
              </Typography>
            </div>
            <Typography
              variant="subtitle1"
              align="center"
              sx={{ width: '100%', fontWeight: 500, mt: 1 }}
            >
              Number of genomes: {Math.abs(currentTooltip.count)}
            </Typography>
            <div className={classes.tooltipContent} style={{ justifyContent: 'center' }}>
              {currentTooltip.diversity.map((item, index) => (
                <div key={`tooltip-content-${index}`} className={classes.tooltipItemWrapper}>
                  <Box
                    className={classes.tooltipItemBox}
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                  <div className={classes.tooltipItemStats}>
                    <Typography variant="body2" fontWeight="500">
                      {item.label}
                    </Typography>
                    <Typography variant="caption" noWrap>{`N = ${item.count}`}</Typography>
                    <Typography fontSize="10px">{`${item.percentage}%`}</Typography>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={classes.noYearSelected}
            style={{
              width: '50%',
              textAlign: 'center',
              justifyContent: 'flex-end',
              alignItems: 'center',
              display: 'flex',
            }}
          >
            Click on a bar to see the details
          </div>
        )}
      </div>
    </CardContent>
  );
};