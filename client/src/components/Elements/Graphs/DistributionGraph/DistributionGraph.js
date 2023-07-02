import { Box, CardContent, MenuItem, Select, Typography } from '@mui/material';
import { useStyles } from './DistributionGraphMUI';
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
import { setDistributionGraphView } from '../../../../stores/slices/graphSlice';
import { getColorForGenotype, hoverColor } from '../../../../util/colorHelper';
import { useEffect, useState } from 'react';
import { isTouchDevice } from '../../../../util/isTouchDevice';

const dataViewOptions = [
  { label: 'Number of genomes', value: 'number' },
  { label: 'Percentage per year', value: 'percentage' }
];

export const DistributionGraph = () => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [plotChart, setPlotChart] = useState(() => {});

  const dispatch = useAppDispatch();
  const distributionGraphView = useAppSelector((state) => state.graph.distributionGraphView);
  const genotypesYearData = useAppSelector((state) => state.graph.genotypesYearData);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const colorPallete = useAppSelector((state) => state.dashboard.colorPallete);
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const [topXGenotypes, setTopXGenotypes] = useState([]);

  useEffect(() => {
    setCurrentTooltip(null);
  }, [genotypesYearData]);

  function getDomain() {
    return distributionGraphView === 'number' ? undefined : [0, 100];
  }
  useEffect(() =>{
      let mp = new Map();
      // console.log("genotypesYearDataNumber:", genotypesYearData);
      genotypesYearData.forEach(cur => {
        Object.keys(cur).forEach(it => {
          if (it !== "name" && it !== "count") {
            if (mp.has(it)) {
              mp.set(it, mp.get(it) + cur[it]);
            } else {
              mp.set(it, cur[it]);
            }
          }
        })
      })

      const mapArray = Array.from(mp);
      // Sort the array based on keys
      mapArray.sort((a, b) => b[1] - a[1]);
      const slicedArray = mapArray.slice(0, genotypesForFilter.length).map(([key, value]) => key);
      slicedArray.push('Unused');
      setTopXGenotypes(slicedArray);
  },[genotypesForFilter, genotypesYearData]);

  function getData(){
    const exclusions = ['name', 'count'];
    if (distributionGraphView === 'number') {
        return genotypesYearData;
    }
    let genotypeDataPercentage = structuredClone(genotypesYearData);
    return genotypeDataPercentage.map((item) => {
        for (const key in item) {      
          if (!topXGenotypes.includes(key) && !exclusions.includes(key) ) { 
            item.count = item.count - item[key];
            delete item[key];
          }
        }
      const keys = Object.keys(item).filter((x) => !exclusions.includes(x));      
      keys.forEach((key) => {
        item[key] = Number(((item[key] / item.count) * 100).toFixed(2));
      });
      const UnusedPercentage = 100 - keys.reduce((sum, key) => sum + item[key], 0);
          item.Unused = Number(UnusedPercentage.toFixed(2));
      return item;
    });
  }

  function getGenotypeColor(genotype) {
    return organism === 'typhi' ? getColorForGenotype(genotype) : colorPallete[genotype] || '#F5F4F6';
  }

  function handleChangeDataView(event) {
    dispatch(setDistributionGraphView(event.target.value));
  }

  function handleClickChart(event) {
    const data = genotypesYearData.find((item) => item.name === event?.activeLabel);

    if (data) {
      const currentData = structuredClone(data);

      const value = {
        name: currentData.name,
        count: currentData.count,
        genotypes: []
      };

      delete currentData.name;
      delete currentData.count;

      value.genotypes = Object.keys(currentData).map((key) => {
        const count = currentData[key];
        const activePayload = event.activePayload.find((x) => x.name === key);

        return {
          label: key,
          count,
          percentage: Number(((count / value.count) * 100).toFixed(2)),
          color: activePayload?.fill
        };
      });
      value.genotypes.sort((a, b) => b.label.localeCompare(a.label));

      setCurrentTooltip(value);
    }
  }

  useEffect(() => {
    if (canGetData) {
      setPlotChart(() => {
        return (
          <ResponsiveContainer width="100%">
            <BarChart
              data={getData()}
              cursor={isTouchDevice() ? 'default' : 'pointer'}
              onClick={handleClickChart}
              maxBarSize={70}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval="preserveStartEnd" tick={{ fontSize: 14 }} />
              <YAxis domain={getDomain()} allowDataOverflow={true} allowDecimals={false}>
                <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                  {dataViewOptions.find((option) => option.value === distributionGraphView).label}
                </Label>
              </YAxis>
              {genotypesYearData.length > 0 && <Brush dataKey="name" height={20} stroke={'rgb(31, 187, 211)'} />}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className={classes.legendWrapper}>
                      {payload.map((entry, index) => {
                        const { dataKey, color } = entry;
                        return (
                          <div key={`distribution-legend-${index}`} className={classes.legendItemWrapper}>
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

              {topXGenotypes.map((option, index) => (
                <Bar
                  key={`distribution-bar-${index}`}
                  dataKey={option}
                  name={option}
                  stackId={0}
                  fill={getGenotypeColor(option)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genotypesYearData, distributionGraphView,topXGenotypes]);

  return (
    <CardContent className={classes.distributionGraph}>
      <div className={classes.selectWrapper}>
        <Typography variant="caption">Data view</Typography>
        <Select
          value={distributionGraphView}
          onChange={handleChangeDataView}
          inputProps={{ className: classes.selectInput }}
          MenuProps={{ classes: { list: classes.selectMenu } }}
          disabled={organism === 'none'}
        >
          {dataViewOptions.map((option, index) => {
            return (
              <MenuItem key={index + 'distribution-dataview'} value={option.value}>
                {option.label}
              </MenuItem>
            );
          })}
        </Select>
      </div>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="GD">
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
                {currentTooltip.genotypes.map((item, index) => {
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
            <div className={classes.noYearSelected}>No year selected</div>
          )}
        </div>
      </div>
    </CardContent>
  );
};
