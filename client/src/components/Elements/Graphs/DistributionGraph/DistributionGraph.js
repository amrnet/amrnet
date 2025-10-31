import { Close } from '@mui/icons-material';
import { Box, Card, CardContent, IconButton, MenuItem, Select, Tooltip, Typography, FormGroup, FormControlLabel, Switch, Slider } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Label,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks.ts';
import { setCaptureGD, setGenotypesForFilterSelected, setColorPallete, setColorPalleteCgST, setColorPalleteSublineages } from '../../../../stores/slices/dashboardSlice';
import {
  setDistributionGraphVariable,
  setDistributionGraphView,
  setEndtimeGD,
  setStarttimeGD,
  setTopXGenotype,
} from '../../../../stores/slices/graphSlice.ts';
import { getColorForGenotype, hoverColor, lightGrey, generatePalleteForGenotypes } from '../../../../util/colorHelper';
import { variableGraphOptions, variableGraphOptionsNG } from '../../../../util/convergenceVariablesOptions';
import { arraysEqual, getRange } from '../../../../util/helpers';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { SelectCountry } from '../../SelectCountry';
import { SliderSizes } from '../../Slider/SliderSizes';
import { useStyles } from './DistributionGraphMUI';
import GenotypePatternRect from '../GenotypePatternRect.js';

const dataViewOptions = [
  { label: 'Number per year', value: 'number' },
  { label: 'Percentage per year', value: 'percentage' },
];

export const DistributionGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [yAxisSliderValue, setYAxisSliderValue] = useState([0, 100]);
  const [logScale, setLogScale] = useState(false);


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
  const colourPattern = useAppSelector((state) => state.dashboard.colourPattern);

  const currentData = useMemo(() => {
    if (organism !== 'kpneumo' && organism !== 'ngono') {
      return genotypesYearData;
    }
    return distributionGraphVariable === 'Sublineage'
      ? sublineagesYearData
      : (distributionGraphVariable === 'cgST' || distributionGraphVariable === 'NG-MAST TYPE')
        ? cgSTYearData
        : genotypesYearData;
  }, [cgSTYearData, distributionGraphVariable, genotypesYearData, organism, sublineagesYearData]);

  const currentColorPallete = useMemo(() => {
    const isSpecialOrganism = organism === 'kpneumo' || organism === 'ngono';

    if (!isSpecialOrganism) {
      return colorPallete;
    }

    if (distributionGraphVariable === 'Sublineage') {
      return colorPalleteSublineages;
    }

    if (distributionGraphVariable === 'cgST' || distributionGraphVariable === 'NG-MAST TYPE') {
      return colorPalleteCgST;
    }

    return colorPallete;
  }, [colorPallete, colorPalleteCgST, colorPalleteSublineages, distributionGraphVariable, organism]);
  
  function getDomain(max = null) {
    if (distributionGraphView === 'number') {
      return logScale? [yAxisSliderValue[0], yAxisSliderValue[1] ?? max ?? 'dataMax'] : distributionGraphView === 'number' ? ['dataMin', max ?? 'dataMax'] : [0, 100];
    }
    // percentage view -> zoomable 0–100
    return [yAxisSliderValue[0], yAxisSliderValue[1]];
  }

  function handleSwitchScale(event) {
    setCurrentTooltip(null);
    setLogScale(event.target.checked);
  }

  function handleSliderChangeDataView(event) {
    setYAxisSliderValue(event.target.value);
  }
  
  const sliderLabel = useMemo(() => {
    if (organism !== 'kpneumo') {
      return undefined;
    }

    return distributionGraphVariable === 'Sublineage'
      ? 'sublineage'
      : distributionGraphVariable === 'cgST'
        ? 'cgST'
        : distributionGraphVariable === 'NG-MAST TYPE'
          ? 'NG-MAST'
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

  // function getDomain() {
  //   return distributionGraphView === 'number' ? undefined : [0, 100];
  // }


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

  const maxDataValue = useMemo(() => {
    if (!currentData || currentData.length === 0) return 100;
    
    // For percentage view, max is always 100
    if (distributionGraphView === 'percentage') return 100;
    
    // For number view, find the max value across all data points
    let max = 0;
    currentData.forEach(item => {
      let yearTotal = 0;
      Object.entries(item).forEach(([key, value]) => {
        if (!['name', 'count'].includes(key)) {
          if (typeof value === 'number') {
            yearTotal += value;
            if (value > max) max = value;
          }
        }
      });
      // Also check the total for the year as it might be higher than individual values
      if (yearTotal > max) max = yearTotal;
    });

    // Round up to nearest nice number for better axis display
    const niceMax = Math.ceil(max / 10) * 10;
    return niceMax;
  }, [currentData, distributionGraphView]);

  useEffect(() => {

    // if (!arraysEqual(computedTopXGenotype, topXGenotype)) {

      dispatch(setTopXGenotype(computedTopXGenotype));
      dispatch(setColorPalleteCgST(generatePalleteForGenotypes(computedTopXGenotype, distributionGraphVariable, colourPattern)));
      dispatch(setColorPalleteSublineages(generatePalleteForGenotypes(computedTopXGenotype, distributionGraphVariable, colourPattern)));
      dispatch(setColorPallete(generatePalleteForGenotypes(computedTopXGenotype, distributionGraphVariable, colourPattern)));
      dispatch(
        setGenotypesForFilterSelected(
          currentSliderValue === computedTopXGenotype.length
            ? computedTopXGenotype
            : [...computedTopXGenotype, 'Other'],
        ),
      );
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedTopXGenotype, colourPattern, distributionGraphVariable]);

  const { newArray, newArrayPercentage } = useMemo(() => {
    const exclusions = ['name', 'count'];

    const baseArray = currentData.map(item => {
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
    });
    // .filter(x => x.count >= 10);

    const percentageArray = structuredClone(baseArray).map(item => {
      const keys = Object.keys(item).filter(k => !exclusions.includes(k));
      keys.forEach(key => {
        item[key] = Number(((item[key] / item.count) * 100).toFixed(2));
      });
      return item;
    });
    // .filter(x => x.count >= 10);

    return { newArray: baseArray, newArrayPercentage: percentageArray };
  }, [currentColorPallete, currentData, organism, topXGenotype]);

  function getGenotypeColor(genotype) {
    return  currentColorPallete[genotype] || '#F5F4F6';
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

    if (data && data.count >= 10) {
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
    } else if (event?.activeLabel === undefined || event?.activeLabel === null) {
      setCurrentTooltip(null);
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
      dispatch(setStarttimeGD('2000'));
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
      const existingYears = data.filter(d => d.count >= 10).map(d => d.name.toString());

      allYears.forEach(year => {
        if (!existingYears.includes(year)) {
          // Find index of item to remove
          const index = data.findIndex(d => d.name == year); // to match with string and number types
          if (index !== -1) {
            data.splice(index, 1); // Remove existing entry in-place
          }

          // Push new entry
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
    // console.log('allYears', allYears, data);
    return (
      <ResponsiveContainer width="100%">
        <BarChart
          data={data}
          cursor={isTouchDevice() ? 'default' : 'pointer'}
          onClick={handleClickChart}
          maxBarSize={70}
        >
          <defs>
            {/* Solid pattern */}
            {topXGenotype.map((genotype, i) => (
              <pattern
                key={`pattern-solid-${genotype}`}
                id={`pattern-solid-${genotype}`}
                patternUnits="userSpaceOnUse"
                width={10}
                height={10}
              >
                <rect width="10" height="10" fill={getGenotypeColor(genotype)} />
              </pattern>
            ))}

            {/* Stripes */}
            {topXGenotype.map((genotype, i) => (
              <pattern
                key={`pattern-stripes-${genotype}`}
                id={`pattern-stripes-${genotype}`}
                patternUnits="userSpaceOnUse"
                width={6}
                height={6}
                patternTransform="rotate(45)"
              >
                <rect width="6" height="6" fill={getGenotypeColor(genotype)} />
                <line x1="0" y1="0" x2="0" y2="6" stroke="white" strokeWidth={1} />
              </pattern>
            ))}

            {/* Dots */}
            {topXGenotype.map((genotype, i) => (
              <pattern
                key={`pattern-dots-${genotype}`}
                id={`pattern-dots-${genotype}`}
                patternUnits="userSpaceOnUse"
                width={8}
                height={8}
              >
                <rect width="8" height="8" fill={getGenotypeColor(genotype)} />
                <circle cx="5" cy="5" r="0.5" fill="white" />
                <circle cx="5" cy="1" r="0.5" fill="white" />
                <circle cx="1" cy="5" r="0.5" fill="white" />
                <circle cx="1" cy="1" r="0.5" fill="white" />
              </pattern>
            ))}

            {/* Diagonal cross-hatch */}
            {topXGenotype.map((genotype, i) => (
              <pattern
                key={`pattern-cross-${genotype}`}
                id={`pattern-cross-${genotype}`}
                patternUnits="userSpaceOnUse"
                width={8}
                height={8}
              >
                <rect width="8" height="8" fill={getGenotypeColor(genotype)} />
                <path d="M0,0 L8,8 M8,0 L0,8" stroke="white" strokeWidth={0.5} />
              </pattern>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                tickCount={20}
                allowDecimals={false}
                padding={{ left: 20, right: 20 }}
                dataKey="name"
                domain={(computedTopXGenotype ?? []).length > 0 ? ['dataMin', 'dataMax'] : undefined}
                interval={'preserveStartEnd'}
                tick={{ fontSize: 14 }}
              />
              <YAxis
                tickCount={logScale ? 8 : 6}
                padding={{ top: 20, bottom: 20 }}
                allowDecimals={false}
                domain={getDomain()}
                allowDataOverflow={true}
                scale={logScale ? 'linear' : undefined}
              >
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
                dispatch(setStarttimeGD(data[startIndex]?.name));
                dispatch(setEndtimeGD(data[endIndex]?.name));
              }}
            />
          )}

          <Legend
            content={({ payload }) => (
              <div className={classes.legendWrapper}>
                {payload.map((entry) => {
                  const { dataKey, color } = entry;
                  if (dataKey === 'Insufficient data') return null;
                  if (dataKey === 'Other' && !data.some(d => d[dataKey] !== 0)) return null;

                  // Rotate between the 4 pattern types
                  {/* const patternTypes = ['solid', 'stripes', 'dots', 'cross'];
                  const patternType = patternTypes[i % 4]; */}
                  return (
                    <div key={`legend-${dataKey}`} className={classes.legendItemWrapper}>
                      {colourPattern ? 
                        <svg width="16" height="16" style={{ marginRight: 6 }}>
                          <rect
                            x="0"
                            y="0"
                            width="16"
                            height="16"
                            fill={dataKey === 'Other'? color : GenotypePatternRect(dataKey, topXGenotype)}
                            stroke="#ccc"
                            strokeWidth="0.5"
                          />
                        </svg>:
                        <Box className={classes.colorCircle} style={{ backgroundColor: color }} />
                      }

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

          {topXGenotype.map((genotype, i) => {
            // Assign a pattern type based on index
            {/* const patternTypes = ['solid', 'stripes', 'dots', 'cross'];
            const patternType = patternTypes[i % 4]; */}

            return (
              <Bar
                key={`bar-${genotype}`}
                dataKey={genotype}
                stackId={0}
                fill={colourPattern ? GenotypePatternRect(genotype, topXGenotype) : getGenotypeColor(genotype)}
              />
            );
          })}

          <Bar dataKey="Other" stackId={0} fill={lightGrey} />
          {/* <Bar dataKey="Insufficient data" stackId={0} fill={`url(#pattern-dots-Insufficient)`} /> */}
          <Bar dataKey="Insufficient data" stackId={0} fill={getGenotypeColor('Other')} />
        </BarChart>
      </ResponsiveContainer>

    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData, distributionGraphView, topXGenotype, currentSliderValue, currentColorPallete, colourPattern, computedTopXGenotype, logScale, yAxisSliderValue, maxDataValue]);

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
          <FormGroup className={classes.formGroup}>
              <FormControlLabel
                label={<Typography variant="caption">Change the y-axis scale</Typography>}
                control={<Switch checked={logScale} onChange={handleSwitchScale} />}
              />
            </FormGroup>
            {logScale ? (
              <>
                <Typography variant="caption">Adjust Y-axis Range (Min-Max)</Typography>
                <Slider
                  value={yAxisSliderValue}
                  onChange={handleSliderChangeDataView}
                  step={1}
                  min={0}
                  max={distributionGraphView === 'number'? maxDataValue : 100}
                  valueLabelDisplay="auto"
                />
              </>
            ) : null}
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
                          {colourPattern ? 
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
                                fill={item.label === 'Other'? item.color : GenotypePatternRect(item.label, topXGenotype)}
                                stroke="#ccc"
                                strokeWidth="0.5"
                              />
                            </svg> 
                            : <Box
                                className={classes.tooltipItemBox}
                                style={{
                                  backgroundColor: item.color,
                                }}
                              />}

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
              {(organism === 'kpneumo' || organism === 'ngono')  && (
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
                    {organism === 'ngono' ? 
                      variableGraphOptionsNG.map((option, index) => {
                        return (
                          <MenuItem key={index + 'distribution-variable'} value={option.value}>
                            {option.label}
                          </MenuItem>
                        );
                      })
                      : variableGraphOptions.map((option, index) => {
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
