import { Box, Card, CardContent, IconButton, MenuItem, Select, Tooltip, Typography } from '@mui/material';
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
  Label,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks.ts';
import { setGenotypesForFilterSelected } from '../../../../stores/slices/dashboardSlice';
import {
  setDistributionGraphView,
  setEndtimeGD,
  setStarttimeGD,
  setTopXGenotype,
  setDistributionGraphVariable,
} from '../../../../stores/slices/graphSlice.ts';
import { getColorForGenotype, hoverColor, lightGrey } from '../../../../util/colorHelper';
import { useEffect, useMemo, useState } from 'react';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { SliderSizes } from '../../Slider/SliderSizes';
import { setCaptureGD } from '../../../../stores/slices/dashboardSlice';
import { Close } from '@mui/icons-material';
import { SelectCountry } from '../../SelectCountry';
import { arraysEqual, getRange } from '../../../../util/helpers';
import { variableGraphOptions } from '../../../../util/convergenceVariablesOptions';

const dataViewOptions = [
  { label: 'Number per year', value: 'number' },
  { label: 'Percentage per year', value: 'percentage' },
];

export const DistributionGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  // const [currentEventSelected, setCurrentEventSelected] = useState([]);

  const dispatch = useAppDispatch();
  const distributionGraphView = useAppSelector(state => state.graph.distributionGraphView);
  const distributionGraphVariable = useAppSelector(state => state.graph.distributionGraphVariable);
  const genotypesYearData = useAppSelector(state => state.graph.genotypesYearData);
  const cgSTYearData = useAppSelector(state => state.graph.cgSTYearData);
  const sublineagesYearData = useAppSelector(state => state.graph.sublineagesYearData);
  const organism = useAppSelector(state => state.dashboard.organism);
  const colorPallete = useAppSelector(state => state.dashboard.colorPallete);
  const colorPalleteCgST = useAppSelector(state => state.dashboard.colorPalleteCgST);
  const colorPalleteSublineages = useAppSelector(state => state.dashboard.colorPalleteSublineages);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const currentSliderValue = useAppSelector(state => state.graph.currentSliderValue);
  // const resetBool = useAppSelector(state => state.graph.resetBool);
  const topXGenotype = useAppSelector(state => state.graph.topXGenotype);
  const canFilterData = useAppSelector(state => state.dashboard.canFilterData);

  const currentData = useMemo(() => {
    if (organism !== 'kpneumo') {
      return genotypesYearData;
    }

    return distributionGraphVariable === 'Sublineage'
      ? sublineagesYearData
      : distributionGraphVariable === 'cgST'
        ? cgSTYearData
        : genotypesYearData;
  }, [cgSTYearData, distributionGraphVariable, genotypesYearData, organism, sublineagesYearData]);

  const currentColorPallete = useMemo(() => {
    if (organism !== 'kpneumo') {
      return colorPallete;
    }

    return distributionGraphVariable === 'Sublineage'
      ? colorPalleteSublineages
      : distributionGraphVariable === 'cgST'
        ? colorPalleteCgST
        : colorPallete;
  }, [colorPallete, colorPalleteCgST, colorPalleteSublineages, distributionGraphVariable, organism]);

  const sliderLabel = useMemo(() => {
    if (organism !== 'kpneumo') {
      return undefined;
    }

    return distributionGraphVariable === 'Sublineage'
      ? 'sublineage'
      : distributionGraphVariable === 'cgST'
        ? 'cgST'
        : 'ST';
  }, [distributionGraphVariable, organism]);

  useEffect(() => {
    let cnt = 0;
    // eslint-disable-next-line array-callback-return
    newArray.map(item => {
      cnt += item.count;
    });

    if (cnt <= 0) {
      dispatch(setCaptureGD(false));
    } else {
      dispatch(setCaptureGD(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData, currentSliderValue]);

  useEffect(() => {
    //dispatch(setResetBool(true));
    setCurrentTooltip(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData]);

  function getDomain() {
    return distributionGraphView === 'number' ? undefined : [0, 100];
  }

  //  const updateSlider = (value) =>{
  //   setCurrentSliderValue(value);
  //  };

  const computedTopXGenotype = useMemo(() => {
    const map = new Map();
    currentData.forEach(cur => {
      Object.keys(cur).forEach(key => {
        if (key !== 'name' && key !== 'count') {
          map.set(key, (map.get(key) || 0) + cur[key]);
        }
      });
    });

    return Array.from(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, currentSliderValue)
      .map(([key]) => key);
  }, [currentData, currentSliderValue]);

  useEffect(() => {
    if (!arraysEqual(computedTopXGenotype, topXGenotype)) {
      dispatch(setTopXGenotype(computedTopXGenotype));
      dispatch(
        setGenotypesForFilterSelected(
          currentSliderValue === computedTopXGenotype.length
            ? computedTopXGenotype
            : [...computedTopXGenotype, 'Other'],
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedTopXGenotype]);

  const { newArray, newArrayPercentage } = useMemo(() => {
    const exclusions = ['name', 'count'];

    const baseArray = currentData
      .map(item => {
        const filteredItems = {};
        let count = 0;

        for (const key in item) {
          if (!topXGenotype.includes(key) && !exclusions.includes(key)) {
            count += item[key];
          }

          if (organism !== 'styphi' && key in currentColorPallete && !exclusions.includes(key)) {
            filteredItems[key] = item[key];
          }
        }

        return { name: item.name, count: item.count, ...(organism === 'styphi' ? item : filteredItems), Other: count };
      })
      .filter(x => x.count >= 10);

    const percentageArray = structuredClone(baseArray)
      .map(item => {
        const keys = Object.keys(item).filter(k => !exclusions.includes(k));
        keys.forEach(key => {
          item[key] = Number(((item[key] / item.count) * 100).toFixed(2));
        });
        return item;
      })
      .filter(x => x.count >= 10);

    return { newArray: baseArray, newArrayPercentage: percentageArray };
  }, [currentColorPallete, currentData, organism, topXGenotype]);

  function getGenotypeColor(genotype) {
    return organism === 'styphi' ? getColorForGenotype(genotype) : currentColorPallete[genotype] || '#F5F4F6';
  }

  function handleChangeDataView(event) {
    dispatch(setDistributionGraphView(event.target.value));
  }

  function handleChangeVariable(event) {
    dispatch(setDistributionGraphVariable(event.target.value));
  }

  function handleClickChart(event) {
    // setCurrentEventSelected(event);
    const data = newArray.find(item => item.name === event?.activeLabel);

    if (data && data.count > 0) {
      const currentData = structuredClone(data);

      const value = {
        name: currentData.name,
        count: currentData.count,
        genotypes: [],
      };

      delete currentData.name;
      delete currentData.count;

      value.genotypes = Object.keys(currentData).map(key => {
        const count = currentData[key];
        return {
          label: key,
          count,
          percentage: Number(((count / value.count) * 100).toFixed(2)),
          color: key === 'Other' ? lightGrey : getGenotypeColor(key),
        };
      });
      value.genotypes = value.genotypes.filter(
        item => topXGenotype.includes(item.label) || (item.label === 'Other' && item.count > 0),
      );

      setCurrentTooltip(value);
      //dispatch(setResetBool(false));
    } else {
      setCurrentTooltip({
        name: event?.activeLabel,
        count: 'ID',
        genotypes: [],
      });
    }
  }

  useEffect(() => {
    setCurrentTooltip(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topXGenotype]);

  useEffect(() => {
    if (currentData.length > 0) {
      // Dispatch initial values based on the default range (full range)
      const startValue = currentData[0]?.name; // First value in the data
      const endValue = currentData[currentData.length - 1]?.name; // Last value in the data
      // console.log('startValue', startValue, endValue);
      dispatch(setStarttimeGD(startValue));
      dispatch(setEndtimeGD(endValue));
    }
  }, [currentData, dispatch]);

  const chartJSX = useMemo(() => {
    if (!canGetData) return null;

    const rawData = distributionGraphView === 'number' ? newArray : newArrayPercentage;
    const data = [...rawData]; // clone so we can safely mutate

    let allYears = [];
    if (data.length > 0) {
      allYears = getRange(Number(data[0].name), Number(data[data.length - 1].name))?.map(String);
      const existingYears = data.map(d => d.name.toString());

      allYears.forEach(year => {
        if (!existingYears.includes(year)) {
          data.push({
            name: year,
            count: 0,
            ...Object.fromEntries(topXGenotype.map(key => [key, 0])),
            'Insufficient data': distributionGraphView === 'number' ? 0 : 100,
          });
        }
      });

      data.sort((a, b) => a.name.toString().localeCompare(b.name).toString());
    }

    return (
      <ResponsiveContainer width="100%">
        <BarChart
          data={data}
          cursor={isTouchDevice() ? 'default' : 'pointer'}
          onClick={handleClickChart}
          maxBarSize={70}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval="preserveStartEnd" tick={{ fontSize: 14 }} />
          <YAxis domain={getDomain()} allowDataOverflow allowDecimals={false}>
            <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
              {dataViewOptions.find(opt => opt.value === distributionGraphView)?.label}
            </Label>
          </YAxis>

          {currentData.length > 0 && (
            <Brush
              dataKey="name"
              height={20}
              stroke="rgb(31, 187, 211)"
              startIndex={allYears.findIndex(x => x === '2000') || 0}
              onChange={({ startIndex, endIndex }) => {
                dispatch(setStarttimeGD(currentData[startIndex]?.name));
                dispatch(setEndtimeGD(currentData[endIndex]?.name));
              }}
            />
          )}

          <Legend
            content={({ payload }) => (
              <div className={classes.legendWrapper}>
                {payload.map(entry => {
                  const { dataKey, color } = entry;

                  if (dataKey === 'Insufficient data') {
                    return null;
                  }

                  if (dataKey === 'Other') {
                    const hasData = data.some(d => d[dataKey] !== 0);
                    if (!hasData) return null;
                  }

                  return (
                    <div key={`legend-${dataKey}`} className={classes.legendItemWrapper}>
                      <Box className={classes.colorCircle} style={{ backgroundColor: color }} />
                      <Typography variant="caption">{dataKey}</Typography>
                    </div>
                  );
                })}
              </div>
            )}
          />

          <ChartTooltip
            cursor={currentData !== 0 ? { fill: hoverColor } : false}
            content={({ payload, active, label }) =>
              active && payload ? <div className={classes.chartTooltipLabel}>{label}</div> : null
            }
          />

          {topXGenotype.map((genotype, index) => (
            <Bar key={`bar-${genotype}`} dataKey={genotype} stackId={0} fill={getGenotypeColor(genotype)} />
          ))}

          <Bar dataKey="Other" stackId={0} fill={lightGrey} />
          <Bar dataKey="Insufficient data" stackId={0} fill={getGenotypeColor('Other')} />
        </BarChart>
      </ResponsiveContainer>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData, distributionGraphView, topXGenotype, currentSliderValue, currentColorPallete]);

  // console.log(currentTooltip);

  return (
    <CardContent className={classes.distributionGraph}>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="GD">
          {chartJSX}
        </div>
        <div className={classes.rightSide}>
          {/* <SliderSizes callBackValue={ updateSlider} sx={{margin: '0px 10px 0px 10px'}}/> */}
          <SliderSizes value={'GD'} style={{ width: '100%' }} label={sliderLabel} />
          <div className={classes.tooltipWrapper}>
            {currentTooltip ? (
              <div className={classes.tooltip}>
                <div className={classes.tooltipTitle}>
                  <Typography variant="h5" fontWeight="600">
                    {currentTooltip.name}
                  </Typography>
                  {currentTooltip.count !== 'ID' && (
                    <Typography variant="subtitle1">{'N = ' + currentTooltip.count}</Typography>
                  )}
                </div>
                {currentTooltip.count === 'ID' ? (
                  <div className={classes.insufficientData}>Insufficient data</div>
                ) : (
                  <div className={classes.tooltipContent}>
                    {currentTooltip.genotypes.map((item, index) => {
                      return (
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
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className={classes.noYearSelected2}>Click on a year to see detail</div>
            )}
          </div>
        </div>
      </div>
      {showFilter && !canFilterData && (
        <Box className={classes.floatingFilter}>
          <Card elevation={3}>
            <CardContent>
              <div className={classes.titleWrapper}>
                <Typography variant="h6">Plotting options</Typography>
                <Tooltip title="Hide plotting options" placement="top">
                  <IconButton onClick={() => setShowFilter(false)}>
                    <Close fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
              <SelectCountry />
              <div className={classes.selectWrapper}>
                <div className={classes.labelWrapper}>
                  <Typography variant="caption">Data view</Typography>
                </div>
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
              {organism === 'kpneumo' && (
                <div className={classes.selectWrapper}>
                  <div className={classes.labelWrapper}>
                    <Typography variant="caption">Select variable</Typography>
                  </div>
                  <Select
                    value={distributionGraphVariable}
                    onChange={handleChangeVariable}
                    inputProps={{ className: classes.selectInput }}
                    MenuProps={{ classes: { list: classes.selectMenu } }}
                    disabled={organism === 'none'}
                  >
                    {variableGraphOptions.map((option, index) => {
                      return (
                        <MenuItem key={index + 'distribution-variable'} value={option.value}>
                          {option.label}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </CardContent>
  );
};
