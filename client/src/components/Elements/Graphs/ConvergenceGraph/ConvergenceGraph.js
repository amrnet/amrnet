import { Box, CardContent, MenuItem, Select, Typography } from '@mui/material';
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
import { /*setConvergenceColourVariable,*/ setConvergenceGroupVariable, setTopColorSlice, } from '../../../../stores/slices/graphSlice';
import { useEffect, useMemo, useState } from 'react';
import { hoverColor } from '../../../../util/colorHelper';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { variablesOptions } from '../../../../util/convergenceVariablesOptions';
import { setCanFilterData } from '../../../../stores/slices/dashboardSlice';
import { SliderSizes } from '../../Slider';

export const ConvergenceGraph = () => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [plotChart, setPlotChart] = useState(() => {});

  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const convergenceData = useAppSelector((state) => state.graph.convergenceData);
  const convergenceGroupVariable = useAppSelector((state) => state.graph.convergenceGroupVariable);
  // const convergenceColourVariable = useAppSelector((state) => state.graph.convergenceColourVariable);
  const convergenceColourPallete = useAppSelector((state) => state.graph.convergenceColourPallete);
  const currentSliderValueCM = useAppSelector((state) => state.graph.currentSliderValueCM);

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
    const data = convergenceData.find((item) => item.name === name);

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
        topConvergenceData.some((item) => item.colorLabel === key),
      ),
    );
  }, [convergenceColourPallete, topConvergenceData]);

  useEffect(()=>{
    dispatch(setTopColorSlice(topColours))
  },[topColours])

  useEffect(() => {
    if (canGetData) {
      setPlotChart(() => {
        return (
          <ResponsiveContainer width="100%">
            <ScatterChart cursor={isTouchDevice() ? 'default' : 'pointer'}>
              <CartesianGrid strokeDasharray="3 3" />
              {/* <XAxis dataKey="name" interval="preserveStartEnd" tick={{ fontSize: 14 }} /> */}
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
              <YAxis
                type="number"
                dataKey="y"
                allowDataOverflow={true}
                domain={[0, 3]}
                padding={{ top: 20, bottom: 20 }}
              >
                <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                  Mean resistance score
                </Label>
              </YAxis>
              <ZAxis type="number" dataKey="z" range={[50, 1000]} />

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
                {topConvergenceData.map((option, index) => (
                  <Cell
                    name={option.name}
                    onClick={() => handleClickChart(option.name)}
                    key={`combination-cell-${index}`}
                    fill={convergenceColourPallete[option.colorLabel]}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topConvergenceData]);

  return (
    <CardContent className={classes.convergenceGraph}>
      <div className={classes.selectsWrapper}>
        <div className={classes.selectWrapper}>
          <Typography variant="caption">Group variable</Typography>
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
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="CVM">
          {plotChart}
        </div>
        <div className={classes.rightSide}>
          <SliderSizes value={'CM'} style={{ width: '100%'}} />
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
    </CardContent>
  );
};
