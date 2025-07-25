import { Box, Card, CardContent, IconButton, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { useStyles } from './KOTrendsGraphMUI';
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
import {
  setKOTrendsGraphView,
  setTopXKO,
  setStartTimeKOT,
  setEndTimeKOT,
  setMaxSliderValueKOT,
  setKOTrendsGraphPlotOption,
} from '../../../../stores/slices/graphSlice.ts';
import { hoverColor, lightGrey } from '../../../../util/colorHelper';
import { useEffect, useMemo, useState } from 'react';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { SliderSizes } from '../../Slider/SliderSizes';
import { Close } from '@mui/icons-material';
import { SelectCountry } from '../../SelectCountry';
import { arraysEqual, getRange } from '../../../../util/helpers';
import { setCaptureKOT, setKOForFilterSelected } from '../../../../stores/slices/dashboardSlice';

const dataViewOptions = [
  { label: 'Number per year', value: 'number' },
  { label: 'Percentage per year', value: 'percentage' },
];

const plotOptions = [
  { label: 'O_locus', value: 'O_locus' },
  { label: 'K_locus', value: 'K_locus' },
  { label: 'O_type', value: 'O_type' },
];

export const KOTrendsGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [currentEventSelected, setCurrentEventSelected] = useState([]);

  const dispatch = useAppDispatch();
  const KOTrendsGraphView = useAppSelector(state => state.graph.KOTrendsGraphView);
  const KOTrendsGraphPlotOption = useAppSelector(state => state.graph.KOTrendsGraphPlotOption);
  const KOForFilterDynamic = useAppSelector(state => state.dashboard.KOForFilterDynamic);
  const KOYearsData = useAppSelector(state => state.graph.KOYearsData);
  const organism = useAppSelector(state => state.dashboard.organism);
  const colorPalleteKO = useAppSelector(state => state.dashboard.colorPalleteKO);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const currentSliderValueKOT = useAppSelector(state => state.graph.currentSliderValueKOT);
  const resetBool = useAppSelector(state => state.graph.resetBool);
  const topXKO = useAppSelector(state => state.graph.topXKO);
  const canFilterData = useAppSelector(state => state.dashboard.canFilterData);

  const currentData = useMemo(() => KOYearsData[KOTrendsGraphPlotOption], [KOYearsData, KOTrendsGraphPlotOption]);
  const colorPallete = useMemo(
    () => colorPalleteKO[KOTrendsGraphPlotOption],
    [colorPalleteKO, KOTrendsGraphPlotOption],
  );

  const sliderLabel = useMemo(() => {
    return KOTrendsGraphPlotOption === 'O_locus' ? 'O' : KOTrendsGraphPlotOption === 'K_locus' ? 'K' : 'O type';
  }, [KOTrendsGraphPlotOption]);

  useEffect(() => {
    if (KOForFilterDynamic[KOTrendsGraphPlotOption].length > 0) {
      dispatch(setMaxSliderValueKOT(KOForFilterDynamic[KOTrendsGraphPlotOption].length));
    }
  }, [KOForFilterDynamic, dispatch, KOTrendsGraphPlotOption]);

  useEffect(() => {
    let cnt = 0;
    // eslint-disable-next-line array-callback-return
    newArray.map(item => {
      cnt += item.count;
    });

    if (cnt <= 0) {
      dispatch(setCaptureKOT(false));
    } else {
      dispatch(setCaptureKOT(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData, currentSliderValueKOT]);

  useEffect(() => {
    //dispatch(setResetBool(true));
    setCurrentTooltip(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData]);

  function getDomain() {
    return KOTrendsGraphView === 'number' ? undefined : [0, 100];
  }

  //  const updateSlider = (value) =>{
  //   setCurrentSliderValue(value);
  //  };

  const computedTopXKO = useMemo(() => {
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
      .slice(0, currentSliderValueKOT)
      .map(([key]) => key);
  }, [currentData, currentSliderValueKOT]);

  useEffect(() => {
    if (!arraysEqual(computedTopXKO, topXKO)) {
      dispatch(setTopXKO(computedTopXKO));
      dispatch(
        setKOForFilterSelected(
          currentSliderValueKOT === computedTopXKO.length ? computedTopXKO : [...computedTopXKO, 'Other'],
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedTopXKO]);

  const { newArray, newArrayPercentage } = useMemo(() => {
    const exclusions = ['name', 'count'];

    const baseArray = currentData
      .map(item => {
        const filteredItems = {};
        let count = 0;

        for (const key in item) {
          if (!topXKO.includes(key) && !exclusions.includes(key)) {
            count += item[key];
          }

          if (organism !== 'styphi' && key in colorPallete && !exclusions.includes(key)) {
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
  }, [colorPallete, currentData, organism, topXKO]);

  function getColor(item) {
    return colorPallete[item] || '#F5F4F6';
  }

  function handleChangeDataView(event) {
    dispatch(setKOTrendsGraphView(event.target.value));
  }

  function handleChangePlotOption(event) {
    dispatch(setKOTrendsGraphPlotOption(event.target.value));
  }

  function handleClickChart(event) {
    setCurrentEventSelected(event);
    const data = newArray.find(item => item.name === event?.activeLabel);

    if (data && data.count > 0) {
      const currentData = structuredClone(data);

      const value = {
        name: currentData.name,
        count: currentData.count,
        items: [],
      };

      delete currentData.name;
      delete currentData.count;

      value.items = Object.keys(currentData).map(key => {
        const count = currentData[key];
        return {
          label: key,
          count,
          percentage: Number(((count / value.count) * 100).toFixed(2)),
          color: key === 'Other' ? lightGrey : getColor(key),
        };
      });
      value.items = value.items.filter(
        item => topXKO.includes(item.label) || (item.label === 'Other' && item.count > 0),
      );

      setCurrentTooltip(value);
      //dispatch(setResetBool(false));
    } else {
      setCurrentTooltip({
        name: event?.activeLabel,
        count: 'ID',
        items: [],
      });
    }
  }

  useEffect(() => {
    if (!resetBool) handleClickChart(currentEventSelected);
    else {
      setCurrentTooltip(null);
      //dispatch(setResetBool(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTopXKO]);

  useEffect(() => {
    if (currentData.length > 0) {
      // Dispatch initial values based on the default range (full range)
      const startValue = currentData[0]?.name; // First value in the data
      const endValue = currentData[currentData.length - 1]?.name; // Last value in the data
      // console.log('startValue', startValue, endValue);
      dispatch(setStartTimeKOT(startValue));
      dispatch(setEndTimeKOT(endValue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData]);

  const chartJSX = useMemo(() => {
    if (!canGetData) return null;

    const rawData = KOTrendsGraphView === 'number' ? newArray : newArrayPercentage;
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
            ...Object.fromEntries(topXKO.map(key => [key, 0])),
            'Insufficient data': KOTrendsGraphView === 'number' ? 0 : 100,
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
              {dataViewOptions.find(opt => opt.value === KOTrendsGraphView)?.label}
            </Label>
          </YAxis>

          {currentData.length > 0 && (
            <Brush
              dataKey="name"
              height={20}
              stroke="rgb(31, 187, 211)"
              startIndex={allYears.findIndex(x => x === '2000') || 0}
              onChange={({ startIndex, endIndex }) => {
                dispatch(setStartTimeKOT(currentData[startIndex]?.name));
                dispatch(setEndTimeKOT(currentData[endIndex]?.name));
              }}
            />
          )}

          <Legend
            content={({ payload }) => (
              <div className={classes.legendWrapper}>
                {payload.map((entry, index) => {
                  const { dataKey, color } = entry;

                  if (dataKey === 'Other') {
                    const hasData = data.some(d => !!d[dataKey]);
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

          {topXKO.map((genotype, index) => (
            <Bar key={`bar-${genotype}`} dataKey={genotype} stackId={0} fill={getColor(genotype)} />
          ))}

          <Bar dataKey="Other" stackId={0} fill={lightGrey} />
          <Bar dataKey="Insufficient data" stackId={0} fill={getColor('Other')} />
        </BarChart>
      </ResponsiveContainer>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData, KOTrendsGraphView, topXKO, currentSliderValueKOT, colorPallete]);

  return (
    <CardContent className={classes.koTrendsGraph}>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="KOT">
          {chartJSX}
        </div>
        <div className={classes.rightSide}>
          <SliderSizes value={'KOT'} style={{ width: '100%' }} label={sliderLabel} />
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
                    {currentTooltip.items.map((item, index) => {
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
                  value={KOTrendsGraphView}
                  onChange={handleChangeDataView}
                  inputProps={{ className: classes.selectInput }}
                  MenuProps={{ classes: { list: classes.selectMenu } }}
                  disabled={organism === 'none'}
                >
                  {dataViewOptions.map((option, index) => {
                    return (
                      <MenuItem key={index + 'ko-trends-dataview'} value={option.value}>
                        {option.label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </div>
              <div className={classes.selectWrapper}>
                <div className={classes.labelWrapper}>
                  <Typography variant="caption">Select option to plot</Typography>
                </div>
                <Select
                  value={KOTrendsGraphPlotOption}
                  onChange={handleChangePlotOption}
                  inputProps={{ className: classes.selectInput }}
                  MenuProps={{ classes: { list: classes.selectMenu } }}
                  disabled={organism === 'none'}
                >
                  {plotOptions.map((option, index) => {
                    return (
                      <MenuItem key={index + 'ko-trends-plot-option'} value={option.value}>
                        {option.label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </div>
            </CardContent>
          </Card>
        </Box>
      )}
    </CardContent>
  );
};
