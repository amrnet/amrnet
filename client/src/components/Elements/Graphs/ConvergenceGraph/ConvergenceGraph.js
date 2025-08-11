import { Close } from '@mui/icons-material';
import { Box, Card, CardContent, Divider, IconButton, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Cell,
  Tooltip as ChartTooltip,
  Label,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setCanFilterData } from '../../../../stores/slices/dashboardSlice';
import {
  /*setConvergenceColourVariable,*/ setConvergenceGroupVariable,
  setTopColorSlice,
} from '../../../../stores/slices/graphSlice';
import { hoverColor } from '../../../../util/colorHelper';
import { variablesOptions } from '../../../../util/convergenceVariablesOptions';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { SelectCountry } from '../../SelectCountry';
import { SliderSizes } from '../../Slider';
import { useStyles } from './ConvergenceGraphMUI';

const GRADIENT_COLORS = {
  LIGHT_GREY: 200, // #c8c8c8 - lighter
  DARK_GREY: 30, // #1e1e1e - darker for better contrast
};

const calculateGreyGradient = (index, total) => {
  const normalizedPosition = total > 1 ? index / (total - 1) : 0;
  const greyValue = Math.round(
    GRADIENT_COLORS.LIGHT_GREY + (GRADIENT_COLORS.DARK_GREY - GRADIENT_COLORS.LIGHT_GREY) * normalizedPosition,
  );
  return `rgb(${greyValue},${greyValue},${greyValue})`;
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

  useEffect(() => {
    dispatch(setTopColorSlice(topColours));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topColours]);

  useEffect(() => {
    console.log('🐛 Debug Values:');
    console.log('convergenceGroupVariable:', convergenceGroupVariable);
    console.log('topConvergenceData length:', topConvergenceData.length);
    console.log('convergenceColourPallete:', convergenceColourPallete);

    if (canGetData) {
      setPlotChart(() => {
        return (
          <ResponsiveContainer width="100%">
            <ScatterChart cursor={isTouchDevice() ? 'default' : 'pointer'}>
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
                  const zMin = 50;
                  const zMax = 1000;
                  const zMid = Math.round((zMin + zMax) / 2);
                  const zValues = [zMin, zMid, zMax];
                  const sizeScale = z => 10 + 30 * ((z - zMin) / (zMax - zMin));

                  return (
                    <Box display="flex" alignItems="center" gap={4} justifyContent="center" mt={5} ml={8}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Box display="flex" alignItems="center" gap={3}>
                          {zValues.map((z, index) => {
                            const size = sizeScale(z);
                            const radius = size / 2;

                            return (
                              <Box key={index} display="flex" flexDirection="column" alignItems="center">
                                <svg width={size} height={size}>
                                  <circle cx={radius} cy={radius} r={radius} fill="#888" opacity={0.5} />
                                </svg>
                                <Typography variant="caption">{z}</Typography>
                              </Box>
                            );
                          })}
                        </Box>
                        <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center' }}>
                          Number of items
                        </Typography>
                      </Box>

                      {/* Only show gradient legend when DATE is selected AND there's actual data */}
                      {convergenceGroupVariable === 'DATE' && topConvergenceData.length > 0 && (
                        <>
                          <Divider orientation="vertical" flexItem />
                          <Box display="flex" flexDirection="column" alignItems="center">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography fontSize="0.75rem">Earliest</Typography>
                              <Box className={classes.gradientBox} />
                              <Typography fontSize="0.75rem">Latest</Typography>
                            </Box>
                            <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center' }}>
                              Date progression
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  );
                }}
              />

              {convergenceGroupVariable !== 'DATE' && (
                <Legend
                  content={() => {
                    return (
                      <div className={classes.legendWrapper}>
                        {Object.keys(topColours).map((key, index) => {
                          return (
                            <div key={`convergence-legend-${index}`} className={classes.legendItemWrapper}>
                              <Box
                                className={classes.colorCircle}
                                style={{
                                  backgroundColor: convergenceColourPallete[key],
                                }}
                              />
                              <Typography variant="caption">{key}</Typography>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                />
              )}

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
                  const color =
                    convergenceGroupVariable === 'DATE'
                      ? calculateGreyGradient(index, topConvergenceData.length)
                      : convergenceColourPallete[option.colorLabel] || '#F5F4F6'; // Add fallback color

                  return (
                    <Cell
                      name={option.name}
                      onClick={() => handleClickChart(option.name)}
                      key={`combination-cell-${index}`}
                      fill={color}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      });
    }
  }, [topConvergenceData, convergenceGroupVariable, convergenceColourPallete, topColours, classes]); // Added missing dependencies

  return (
    <CardContent className={classes.convergenceGraph}>
      <div className={classes.graphWrapper}>
        {/* changed id="CVM" to id="convergence-graph", as 'CVM' is used as 'id' for The "Heatmap View",  */}
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
                  {/* <Typography noWrap variant="subtitle1" minWidth="90px" textAlign="end"> */}
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
                      <Typography variant="body2" fontWeight="00">
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
                {/* <div className={classes.selectWrapper}>
          <Typography variant="caption">Colour variable</Typography>
          <Select
            value={convergenceColourVariable}
            onChange={handleChangeColourVariable}
            inputProps={{ className: classes.selectInput }}
            MenuProps={{ classes: { list: classes.selectMenu } }}
            disabled={organism === 'none'}
          >
            {variablesOptions.map((option, index) => {
              return (
                <MenuItem key={index + 'convergence-colour-variable'} value={option.value}>
                  {option.label}
                </MenuItem>
              );
            })}
          </Select>
        </div> */}
              </div>
            </CardContent>
          </Card>
        </Box>
      )}
    </CardContent>
  );
};
