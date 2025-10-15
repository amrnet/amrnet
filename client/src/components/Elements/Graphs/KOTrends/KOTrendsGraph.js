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
import { hoverColor, lightGrey , generatePalleteForGenotypes} from '../../../../util/colorHelper';
import { useEffect, useMemo, useState } from 'react';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { SliderSizes } from '../../Slider/SliderSizes';
import { Close } from '@mui/icons-material';
import { SelectCountry } from '../../SelectCountry';
import { arraysEqual, getRange } from '../../../../util/helpers';
import { setCaptureKOT, setKOForFilterSelected, setColorPalleteKO } from '../../../../stores/slices/dashboardSlice';
import GenotypePatternRect from '../GenotypePatternRect.js';

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
  const colourPattern = useAppSelector((state) => state.dashboard.colourPattern);
  const distributionGraphVariable = useAppSelector(state => state.graph.distributionGraphVariable);

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

  // const getPatternForGenotype = (genName) => {
  //   const patternTypes = ['solid', 'stripes', 'dots', 'cross'];
    
  //   // Get the index of the genotype in topXGenotype array
  //   const genotypeIndex = topXKO.indexOf(genName);
    
  //   // If genotype is found, use its index to determine pattern, otherwise default to 0
  //   const patternIndex = genotypeIndex !== -1 ? genotypeIndex % patternTypes.length : 0;
  //   const patternType = patternTypes[patternIndex];
  //   return `url(#pattern-${patternType}-${genName})`;
  // };

  const computedTopXKO = useMemo(() => {
    const map = new Map();
    currentData.forEach(cur => {
      Object.keys(cur).forEach(key => {
        if (key !== 'name' && key !== 'count' && key != null && key !== undefined && key !== '' && key !== '-' && key.toString().trim() !== '') {
          map.set(key, (map.get(key) || 0) + cur[key]);
        }
      });
    });

    return Array.from(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, currentSliderValueKOT)
      .map(([key]) => key)
      .filter(key => key != null && key !== undefined && key !== '' && key !== '-' && key.toString().trim() !== '');
  }, [currentData, currentSliderValueKOT]);

  useEffect(() => {
    // if (!arraysEqual(computedTopXKO, topXKO)) {
      dispatch(setTopXKO(computedTopXKO));
      // Generate palettes for each plot option using the same computedTopXKO array
      const colorPalleteKOVar = {
        O_locus: generatePalleteForGenotypes(computedTopXKO, distributionGraphVariable, colourPattern),
        K_locus: generatePalleteForGenotypes(computedTopXKO, distributionGraphVariable, colourPattern),
        O_type: generatePalleteForGenotypes(computedTopXKO,distributionGraphVariable, colourPattern),
      };
      dispatch(setColorPalleteKO(colorPalleteKOVar));
      dispatch(
        setKOForFilterSelected(
          currentSliderValueKOT === computedTopXKO.length ? computedTopXKO : [...computedTopXKO, 'Other'],
        ),
      );
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedTopXKO, topXKO, distributionGraphVariable, colourPattern]);

  const { newArray, newArrayPercentage } = useMemo(() => {
    const exclusions = ['name', 'count'];

    const baseArray = currentData
      .map(item => {
        const filteredItems = {};
        let count = 0;

        for (const key in item) {
          if (!topXKO.includes(key) && !exclusions.includes(key) && key != null && key !== undefined && key !== '-' && key.toString().trim() !== '') {
            count += item[key];
          }

          if (organism !== 'styphi' && key in colorPallete && !exclusions.includes(key) && key != null && key !== undefined && key !== '-' && key.toString().trim() !== '') {
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

    if (data && data.count >0) {
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
    } else if (event?.activeLabel === undefined || event?.activeLabel === null) {
      setCurrentTooltip(null);
    }else {
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
      dispatch(setStartTimeKOT('2000'));
      dispatch(setEndTimeKOT(endValue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData]);

  // SVG pattern definitions for genotypes
  const patternTypes = ['solid', 'stripes', 'dots', 'cross'];
  const renderPatterns = () => (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        {topXKO.map((genName) => {
          const patternIndex = topXKO.indexOf(genName) !== -1 ? topXKO.indexOf(genName) % patternTypes.length : 0;
          const patternType = patternTypes[patternIndex];
          const color = getColor(genName);
          if (patternType === 'solid') {
            return (
              <pattern id={`pattern-solid-${genName}`} key={genName} patternUnits="userSpaceOnUse" width="16" height="16">
                <rect width="16" height="16" fill={color} />
              </pattern>
            );
          } else if (patternType === 'stripes') {
            return (
              <pattern id={`pattern-stripes-${genName}`} key={genName} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                <rect width="8" height="8" fill={color} />
                <rect x="0" y="0" width="4" height="8" fill="#fff" fillOpacity="0.4" />
              </pattern>
            );
          } else if (patternType === 'dots') {
            return (
              <pattern id={`pattern-dots-${genName}`} key={genName} patternUnits="userSpaceOnUse" width="8" height="8">
                <rect width="8" height="8" fill={color} />
                <circle cx="4" cy="4" r="2" fill="#fff" fillOpacity="0.4" />
              </pattern>
            );
          } else if (patternType === 'cross') {
            return (
              <pattern id={`pattern-cross-${genName}`} key={genName} patternUnits="userSpaceOnUse" width="8" height="8">
                <rect width="8" height="8" fill={color} />
                <path d="M0,0 L8,8 M8,0 L0,8" stroke="#fff" strokeWidth="1" strokeOpacity="0.4" />
              </pattern>
            );
          }
          return null;
        })}
      </defs>
    </svg>
  );


  const chartJSX = useMemo(() => {
    if (!canGetData) return null;

    const rawData = KOTrendsGraphView === 'number' ? newArray : newArrayPercentage;
    const data = [...rawData];

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
          <defs>
            {topXKO.map((genotype, i) => (
              <pattern
                key={`pattern-solid-${genotype}`}
                id={`pattern-solid-${genotype}`}
                patternUnits="userSpaceOnUse"
                width={10}
                height={10}
              >
                <rect width="10" height="10" fill={getColor(genotype)} />
              </pattern>
            ))}

            {topXKO.map((genotype, i) => (
              <pattern
                key={`pattern-stripes-${genotype}`}
                id={`pattern-stripes-${genotype}`}
                patternUnits="userSpaceOnUse"
                width={6}
                height={6}
                patternTransform="rotate(45)"
              >
                <rect width="6" height="6" fill={getColor(genotype)} />
                <line x1="0" y1="0" x2="0" y2="6" stroke="white" strokeWidth={1} />
              </pattern>
            ))}

            {topXKO.map((genotype, i) => (
              <pattern
                key={`pattern-dots-${genotype}`}
                id={`pattern-dots-${genotype}`}
                patternUnits="userSpaceOnUse"
                width={8}
                height={8}
              >
                <rect width="8" height="8" fill={getColor(genotype)} />
                <circle cx="5" cy="5" r="0.5" fill="white" />
                <circle cx="5" cy="1" r="0.5" fill="white" />
                <circle cx="1" cy="5" r="0.5" fill="white" />
                <circle cx="1" cy="1" r="0.5" fill="white" />
              </pattern>
            ))}

            {topXKO.map((genotype, i) => (
              <pattern
                key={`pattern-cross-${genotype}`}
                id={`pattern-cross-${genotype}`}
                patternUnits="userSpaceOnUse"
                width={8}
                height={8}
              >
                <rect width="8" height="8" fill={getColor(genotype)} />
                <path d="M0,0 L8,8 M8,0 L0,8" stroke="white" strokeWidth={0.5} />
              </pattern>
            ))}
          </defs>

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
                  if (dataKey === 'Insufficient data' || dataKey == null || dataKey === undefined || dataKey === '' || dataKey === '-' || dataKey.toString().trim() === '') {
                    return null;
                  }
                  if (dataKey === 'Other') {
                    const hasData = data.some(d => !!d[dataKey]);
                    if (!hasData) return null;
                  }
                  return (
                    <div key={`legend-${dataKey}-${index}`} className={classes.legendItemWrapper}>
                      {colourPattern ? (
                        <svg width="16" height="16" style={{ marginRight: 6, flexShrink: 0 }}>
                          <rect
                            x="0"
                            y="0"
                            width="16"
                            height="16"
                            fill={dataKey === 'Other' ? lightGrey : GenotypePatternRect(dataKey, topXKO)}
                            stroke="#ccc"
                            strokeWidth="0.5"
                          />
                        </svg>
                      ) : (
                        <Box className={classes.colorCircle} style={{ backgroundColor: color }} />
                      )}
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

          {topXKO
            .filter(genotype => genotype != null && genotype !== undefined && genotype !== '' && genotype !== '-' && genotype.toString().trim() !== '')
            .map((genotype) => (
              <Bar
                key={`bar-${genotype}`}
                dataKey={genotype}
                stackId={0}
                fill={colourPattern ? GenotypePatternRect(genotype, topXKO) : getColor(genotype)}
              />
            ))}
          <Bar dataKey="Other" stackId={0} fill={lightGrey} />
          <Bar dataKey="Insufficient data" stackId={0} fill={getColor('Other')} />
        </BarChart>
      </ResponsiveContainer>
    );
  }, [currentData, KOTrendsGraphView, topXKO, currentSliderValueKOT, colorPallete, colourPattern]);
    
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
                          {colourPattern ? (
                            <svg
                              width="16"
                              height="16"
                              style={{ marginRight: 6, flexShrink: 0 }}
                            >
                              <rect
                                x="0"
                                y="0"
                                width="16"
                                height="16"
                                fill={item.label === 'Other' ? item.color : GenotypePatternRect(item.label, topXKO)}
                                stroke="#ccc"
                                strokeWidth="0.5"
                              />
                            </svg>
                          ) : (
                            <Box
                              className={classes.tooltipItemBox}
                              style={{ backgroundColor: item.label === 'Other' ? item.color : getColor(item.label) }}
                            />
                          )}
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
