import { Box, Card, CardContent, Divider, IconButton, MenuItem, Select, Tooltip, Typography, FormGroup, FormControlLabel, Switch } from '@mui/material';
import { useStyles } from './ConvergenceGraphMUI';
import {
  CartesianGrid,
  Label,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import {
  /*setConvergenceColourVariable,*/ setConvergenceGroupVariable,
  setTopColorSlice,
  setConvergenceColourPallete
} from '../../../../stores/slices/graphSlice';
import { useEffect, useMemo, useState } from 'react';
import { hoverColor, generatePalleteForGenotypes} from '../../../../util/colorHelper';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { variablesOptions } from '../../../../util/convergenceVariablesOptions';
import { setCanFilterData} from '../../../../stores/slices/dashboardSlice';
import { SliderSizes } from '../../Slider';
import { Close } from '@mui/icons-material';
import { SelectCountry } from '../../SelectCountry';
import { getPatternForGenotype, sanitizeId } from '../GenotypePatternRect';
const GRADIENT_COLORS = {
  LIGHT_GREY: 200, // #c8c8c8 - lighter
  DARK_GREY: 30, // #1e1e1e - darker for better contrast
};


export const ConvergenceGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [plotChart, setPlotChart] = useState(() => {});

  const dispatch = useAppDispatch();
  const organism = useAppSelector(state => state.dashboard.organism);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const convergenceData = useAppSelector(state => state.graph.convergenceData);
  const convergenceGroupVariable = useAppSelector(state => state.graph.convergenceGroupVariable);
  // const convergenceColourVariable = useAppSelector((state) => state.graph.convergenceColourVariable);
  const convergenceColourPallete = useAppSelector(state => state.graph.convergenceColourPallete);
  const currentSliderValueCM = useAppSelector(state => state.graph.currentSliderValueCM);
  const canFilterData = useAppSelector(state => state.dashboard.canFilterData);
  const colourPattern = useAppSelector((state) => state.dashboard.colourPattern);

  useEffect(() => {
    setCurrentTooltip(null);
  }, [convergenceData]);

  function handleChangeGroupVariable(event) {
    setCurrentTooltip(null);
    dispatch(setConvergenceGroupVariable(event.target.value));
    dispatch(setCanFilterData(true));
  }

  // function handleChangeColourVariable(event) {
  //   setCurrentTooltip(null);
  //   dispatch(setConvergenceColourVariable(event.target.value));
  // }

  function handleClickChart(name) {
    const data = convergenceData.find(item => item.name === name);

    if (data) {
      const currentData = structuredClone(data);
      setCurrentTooltip({ ...currentData });
    }
  }

  const topConvergenceData = useMemo(() => {
    return convergenceData.slice(0, currentSliderValueCM);
  }, [convergenceData, currentSliderValueCM]);

  const topColours = useMemo(() => {
    return Object.fromEntries(
      Object.entries(convergenceColourPallete).filter(([key]) =>
        topConvergenceData.some(item => item.colorLabel === key),
      ),
    );
  }, [convergenceColourPallete, topConvergenceData]);

  // const getPatternForGenotype = (option) => {
  //   const patternTypes = ['solid', 'stripes', 'dots', 'cross'];
  //   const genotypeIndex = topConvergenceData.findIndex(item => item.colorLabel === option.colorLabel);
  //   const patternIndex = genotypeIndex !== -1 ? genotypeIndex % patternTypes.length : 0;
  //   const patternType = patternTypes[patternIndex];
  //   const safeLabel = sanitizeId(option.colorLabel);
  //   return `url(#pattern-${patternType}-${safeLabel})`;
  // };

  // Helper function to get pattern type for a genotype (for use in legend and tooltip)
  const getPatternTypeForGenotype = (colorLabel) => {
    const patternTypes = ['solid', 'stripes', 'dots', 'cross'];
    const genotypeIndex = topConvergenceData.findIndex(item => item.colorLabel === colorLabel);
    const patternIndex = genotypeIndex !== -1 ? genotypeIndex % patternTypes.length : 0;
    return patternTypes[patternIndex];
  };

  const topData = topConvergenceData.map(item => item.name);
  // console.log("topColours", topData, topColours, convergenceGroupVariable);
  useEffect(() => {
    const newPalette = generatePalleteForGenotypes(topData, convergenceGroupVariable, colourPattern);

    // prevent infinite re-dispatch
    const isSame =
      JSON.stringify(newPalette) === JSON.stringify(convergenceColourPallete);

    if (!isSame) {
      dispatch(setConvergenceColourPallete(newPalette));
    }

    dispatch(setTopColorSlice(topColours));
  }, [topColours, colourPattern, convergenceData, convergenceGroupVariable]);

  useEffect(() => {
    if (canGetData) {

      setPlotChart(() => {
        return (
          <ResponsiveContainer width="100%">
            <ScatterChart cursor={isTouchDevice() ? 'default' : 'pointer'}>
              <defs>
                {/* Pattern definitions for each colorLabel */}
                {Object.keys(topColours).map((colorLabel) => {
                  const color = topColours[colorLabel]; // Get the actual color value
                  const safeLabel = sanitizeId(colorLabel);
                  
                  return [
                    // Solid pattern
                    <pattern
                      key={`pattern-solid-${safeLabel}`}
                      id={`pattern-solid-${safeLabel}`}
                      patternUnits="userSpaceOnUse"
                      width={10}
                      height={10}
                    >
                      <rect width="10" height="10" fill={color} />
                    </pattern>,

                    // Stripes pattern
                    <pattern
                      key={`pattern-stripes-${safeLabel}`}
                      id={`pattern-stripes-${safeLabel}`}
                      patternUnits="userSpaceOnUse"
                      width={6}
                      height={6}
                      patternTransform="rotate(45)"
                    >
                      <rect width="6" height="6" fill={color} />
                      <line x1="0" y1="0" x2="0" y2="6" stroke="white" strokeWidth={1} />
                    </pattern>,

                    // Dots pattern
                    <pattern
                      key={`pattern-dots-${safeLabel}`}
                      id={`pattern-dots-${safeLabel}`}
                      patternUnits="userSpaceOnUse"
                      width={8}
                      height={8}
                    >
                      <rect width="8" height="8" fill={color} />
                      <circle cx="4" cy="4" r="1" fill="white" />
                      <circle cx="4" cy="0" r="0.5" fill="white" />
                      <circle cx="0" cy="4" r="0.5" fill="white" />
                      <circle cx="8" cy="4" r="0.5" fill="white" />
                      <circle cx="4" cy="8" r="0.5" fill="white" />
                    </pattern>,

                    // Cross pattern
                    <pattern
                      key={`pattern-cross-${safeLabel}`}
                      id={`pattern-cross-${safeLabel}`}
                      patternUnits="userSpaceOnUse"
                      width={8}
                      height={8}
                    >
                      <rect width="8" height="8" fill={color} />
                      <path d="M0,0 L8,8 M8,0 L0,8" stroke="white" strokeWidth={1} />
                    </pattern>
                  ];
                })}
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                allowDecimals={false}
                type="number"
                interval="preserveStartEnd"
                tick={{ fontSize: 14 }}
                tickCount={10}
                domain={[0, 5]}
                padding={{ left: 20, right: 20 }}
              >
                <Label position="bottom" className={classes.graphLabel}>
                  Mean virulence score
                </Label>
              </XAxis>
              <YAxis type="number" dataKey="y" allowDataOverflow={true} padding={{ top: 20, bottom: 20 }}>
                <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                  Mean resistance score
                </Label>
              </YAxis>
              <ZAxis type="number" dataKey="z" range={[50, 1000]} />

              <Legend
                content={() => {
                  // Create ordered legend data based on topConvergenceData order, not alphabetical
                  const orderedLegendKeys = [];
                  const seenKeys = new Set();
                  
                  // Iterate through topConvergenceData to maintain order
                  topConvergenceData.forEach(item => {
                    if (!seenKeys.has(item.colorLabel)) {
                      orderedLegendKeys.push(item.colorLabel);
                      seenKeys.add(item.colorLabel);
                    }
                  });
                  
                  return (
                    <div className={classes.legendWrapper}>
                      {orderedLegendKeys.map((key, index) => {
                        const patternType = getPatternTypeForGenotype(key);
                        const safeLabel = sanitizeId(key);
                        return (
                          <div key={`convergence-legend-${index}`} className={classes.legendItemWrapper}>
                            {colourPattern ? 
                              <svg width="16" height="16" style={{ marginRight: 6 }}>
                                <rect
                                  x="0"
                                  y="0"
                                  width="16"
                                  height="16"
                                  fill={`url(#pattern-${patternType}-${safeLabel})`}
                                  stroke="#ccc"
                                  strokeWidth="0.5"
                                />
                              </svg>
                              :
                              <Box
                                className={classes.colorCircle}
                                style={{
                                  backgroundColor: convergenceColourPallete[key],
                                }}
                              />
                            }
                            <Typography variant="caption">{key}</Typography>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />

              <ChartTooltip
                cursor={{ fill: hoverColor }}
                content={({ payload, active }) => {
                  if (payload !== null && active) {
                    return <div className={classes.chartTooltipLabel}>{payload[0]?.payload.name}</div>;
                  }
                  return null;
                }}
              />

              <Scatter name="combinations" data={topConvergenceData}>
                {topConvergenceData.map((option, index) => {
                  const color = convergenceColourPallete[option.colorLabel];
                  const fillValue = colourPattern ? getPatternForGenotype(option, topConvergenceData) : color;
                  return (
                    <Cell
                      name={option.name}
                      onClick={() => handleClickChart(option.name)}
                      key={`combination-cell-${index}`}
                      fill={fillValue}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topConvergenceData, colourPattern, convergenceColourPallete, topColours]);

  return (
    <CardContent className={classes.convergenceGraph}>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="convergence-graph">
          {plotChart}
        </div>
        <div className={classes.rightSide}>
          <SliderSizes value={'CM'} style={{ width: '100%' }} />
          <div className={classes.tooltipWrapper}>
            {currentTooltip ? (
              <div className={classes.tooltip}>
                <div className={classes.tooltipTitle}>
                  <Typography variant="h5" fontWeight="600">
                    {currentTooltip.name}
                  </Typography>
                  <Typography variant="subtitle1">{'N = ' + currentTooltip.z}</Typography>
                </div>
                <div className={classes.tooltipContent}>
                  <div className={classes.tooltipItemWrapper}>
                    <Box
                      className={classes.tooltipItemBox}
                      style={{
                        backgroundColor: 'rgb(24, 85, 183)',
                      }}
                    />
                    <div className={classes.tooltipItemStats}>
                      <Typography variant="body2" fontWeight="500">
                        Mean virulence score
                      </Typography>
                      <Typography variant="caption" noWrap>
                        {currentTooltip.x}
                      </Typography>
                    </div>
                  </div>
                  <div className={classes.tooltipItemWrapper}>
                    <Box
                      className={classes.tooltipItemBox}
                      style={{
                        backgroundColor: 'rgb(187, 54, 60)',
                      }}
                    />
                    <div className={classes.tooltipItemStats}>
                      <Typography variant="body2" fontWeight="500">
                        Mean resistance score
                      </Typography>
                      <Typography variant="caption" noWrap>
                        {currentTooltip.y}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={classes.noBubbleSelected}>No bubble selected</div>
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
              <div className={classes.selectsWrapper}>
                <SelectCountry />
                <div className={classes.selectWrapper}>
                  <div className={classes.labelWrapper}>
                    <Typography variant="caption">Group variable</Typography>
                  </div>
                  <Select
                    value={convergenceGroupVariable}
                    onChange={handleChangeGroupVariable}
                    inputProps={{ className: classes.selectInput }}
                    MenuProps={{ classes: { list: classes.selectMenu } }}
                    disabled={organism === 'none'}
                  >
                    {variablesOptions.map((option, index) => {
                      return (
                        <MenuItem key={index + 'convergence-group-variable'} value={option.value}>
                          {option.label}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </Box>
      )}
    </CardContent>
  );
};