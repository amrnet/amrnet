import { Box, CardContent, MenuItem, Select, Typography } from '@mui/material';
import { useStyles } from './KODiversityGraphMUI';
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Label
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setKODiversityGraphView, setResetBool } from '../../../../stores/slices/graphSlice';
import { hoverColor } from '../../../../util/colorHelper';
import { useEffect, useState } from 'react';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { colorsForKODiversityGraph } from '../graphColorHelper';

const dataViewOptions = [
  { label: 'K locus', value: 'K_locus' },
  { label: 'O locus', value: 'O_locus' }
];

export const KODiversityGraph = () => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [plotChart, setPlotChart] = useState(() => {});

  const dispatch = useAppDispatch();
  const KODiversityData = useAppSelector((state) => state.graph.KODiversityData);
  const KODiversityGraphView = useAppSelector((state) => state.graph.KODiversityGraphView);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const resetBool = useAppSelector((state) => state.graph.resetBool);

  useEffect(() => {
    dispatch(setResetBool(true));
    setCurrentTooltip(null);
  }, [KODiversityData]);

  function handleChangeDataView(event) {
    setCurrentTooltip(null);
    dispatch(setKODiversityGraphView(event.target.value));
  }

  function handleClickChart(event) {
    const data = KODiversityData[KODiversityGraphView].find((item) => item.name === event?.activeLabel);

    if (data) {
      const currentData = structuredClone(data);

      const value = {
        name: currentData.name,
        count: currentData.count,
        diversity: []
      };

      delete currentData.name;
      delete currentData.count;

      Object.keys(currentData).forEach((key) => {
        const count = currentData[key];

        if (count === 0) {
          return;
        }

        const activePayload = event.activePayload.find((x) => x.name === key);

        value.diversity.push({
          label: key,
          count,
          percentage: Number(((count / value.count) * 100).toFixed(2)),
          color: activePayload?.fill
        });
      });

      setCurrentTooltip(value);
      dispatch(setResetBool(false));

    }
  }

  useEffect(()=>{
    if(resetBool){
      setCurrentTooltip(null);
      dispatch(setResetBool(true));
    }
  });

  useEffect(() => {
    if (canGetData) {
      setPlotChart(() => {
        return (
          <ResponsiveContainer width="100%">
            <BarChart
              data={KODiversityData[KODiversityGraphView]}
              cursor={isTouchDevice() ? 'default' : 'pointer'}
              onClick={handleClickChart}
              maxBarSize={70}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval="preserveStartEnd" tick={{ fontSize: 14 }} />
              <YAxis allowDataOverflow={true} allowDecimals={false} fontSize="14px">
                <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                  Number of genomes
                </Label>
              </YAxis>

              {(KODiversityData[KODiversityGraphView] ?? []).length > 0 && (
                <Brush dataKey="name" height={20} stroke={'rgb(31, 187, 211)'} />
              )}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className={classes.legendWrapper}>
                      {payload.map((entry, index) => {
                        const { dataKey, color } = entry;
                        return (
                          <div key={`KODiversity-legend-${index}`} className={classes.legendItemWrapper}>
                            <Box className={classes.colorCircle} style={{ backgroundColor: color }} />
                            <Typography variant="caption">{dataKey}</Typography>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />

              <ChartTooltip
                cursor={{ fill: hoverColor }}
                content={({ payload, active, label }) => {
                  if (payload !== null && active) {
                    return <div className={classes.chartTooltipLabel}>{label}</div>;
                  }
                  return null;
                }}
              />

              {colorsForKODiversityGraph.map((option, index) => (
                <Bar
                  key={`KODiversity-bar-${index}`}
                  dataKey={option.name}
                  name={option.name}
                  stackId={0}
                  fill={option.color}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [KODiversityData, KODiversityGraphView]);

  return (
    <CardContent className={classes.KODiversityGraph}>
      <div className={classes.selectWrapper}>
        <Typography variant="caption">Data view</Typography>
        <Select
          value={KODiversityGraphView}
          onChange={handleChangeDataView}
          inputProps={{ className: classes.selectInput }}
          MenuProps={{ classes: { list: classes.selectMenu } }}
          disabled={organism === 'none'}
        >
          {dataViewOptions.map((option, index) => {
            return (
              <MenuItem key={index + 'KODiversity-dataview'} value={option.value}>
                {option.label}
              </MenuItem>
            );
          })}
        </Select>
      </div>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="KO">
          {plotChart}
        </div>
        <div className={classes.tooltipWrapper}>
          {currentTooltip ? (
            <div className={classes.tooltip}>
              <div className={classes.tooltipTitle}>
                <Typography variant="h5" fontWeight="600">
                  {currentTooltip.name}
                </Typography>
                <Typography variant="subtitle1">{'N = ' + currentTooltip.count}</Typography>
              </div>
              <div className={classes.tooltipContent}>
                {currentTooltip.diversity.map((item, index) => {
                  return (
                    <div key={`tooltip-content-${index}`} className={classes.tooltipItemWrapper}>
                      <Box
                        className={classes.tooltipItemBox}
                        style={{
                          backgroundColor: item.color
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
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={classes.noYearSelected}>Click on a item to see the details</div>
          )}
        </div>
      </div>
    </CardContent>
  );
};
