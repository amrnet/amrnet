/* eslint-disable react-hooks/exhaustive-deps */
import { Box, CardContent, IconButton, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { useStyles } from './MarkerTrendsGraphMUI';
import {
  Brush,
  CartesianGrid,
  ComposedChart,
  Label,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { colorForDrugClassesNG, hoverColor, lightGrey, colorForMarkers } from '../../../../util/colorHelper';
import {
  setTrendsGraphDrugClass,
  setTrendsGraphView,
  setMaxSliderValueKP_GE,
  setTopGenesSlice,
  setStarttimeRDT,
  setEndtimeRDT,
} from '../../../../stores/slices/graphSlice';
import { drugClassesNG, markersDrugsKP } from '../../../../util/drugs';
import { SliderSizes } from '../../Slider';
import { Card } from '@mui/material';
import { Close } from '@mui/icons-material';
import { SelectCountry } from '../../SelectCountry';
import { getRange } from '../../../../util/helpers';

const dataViewOptions = [
  { label: 'Number of genomes', value: 'number' },
  { label: 'Percentage per year', value: 'percentage' },
];

export const MarkerTrendsGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [plotChart, setPlotChart] = useState(() => {});

  const dispatch = useAppDispatch();
  const organism = useAppSelector(state => state.dashboard.organism);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const genotypesForFilter = useAppSelector(state => state.dashboard.genotypesForFilter);
  const timeInitial = useAppSelector(state => state.dashboard.timeInitial);
  const timeFinal = useAppSelector(state => state.dashboard.timeFinal);
  const genotypesAndDrugsYearData = useAppSelector(state => state.graph.genotypesAndDrugsYearData);
  const trendsGraphView = useAppSelector(state => state.graph.trendsGraphView);
  const trendsGraphDrugClass = useAppSelector(state => state.graph.trendsGraphDrugClass);
  const resetBool = useAppSelector(state => state.graph.resetBool);
  const currentSliderValueKP_GE = useAppSelector(state => state.graph.currentSliderValueKP_GE);
  const topGenesSlice = useAppSelector(state => state.graph.topGenesSlice);
  const canFilterData = useAppSelector(state => state.dashboard.canFilterData);

  useEffect(() => {
    //dispatch(setResetBool(true));
    setCurrentTooltip(null);
  }, [genotypesAndDrugsYearData]);

  useEffect(() => {
    setCurrentTooltip(null);
  }, [currentSliderValueKP_GE]);

  const dataViewOptionsGenomes = [
    { label: 'Number of Genomes', value: 'number' },
    { label: 'Percentage of Genomes', value: 'percentage' },
  ];

  function getDrugClasses() {
    if (organism === 'none') {
      return [];
    }
    if (organism === 'kpneumo') {
      return markersDrugsKP;
    }

    return drugClassesNG;
  }

  function getDomain(max = null) {
    return trendsGraphView === 'number' ? ['dataMin', max ?? 'dataMax'] : [0, 100];
  }

  const yearsData = useMemo(() => {
    return (
      genotypesAndDrugsYearData[trendsGraphDrugClass]?.map(x => {
        const object = {};

        Object.keys(x).forEach(key => {
          if (!genotypesForFilter.includes(key)) {
            object[key] = x[key];
          }
        });

        return object;
      }) || []
    );
  }, [genotypesAndDrugsYearData, trendsGraphDrugClass, genotypesForFilter]);

  // Step 1: Pure calculation of counts and sorted keys.
  const processedData = useMemo(() => {
    const genes = {};

    yearsData?.forEach(year => {
      Object.keys(year).forEach(key => {
        if (['name', 'totalCount', 'resistantCount'].includes(key)) {
          return;
        }

        if (key in genes) {
          genes[key] += year[key];
        } else {
          genes[key] = year[key];
        }
      });
    });

    const sortedGeneKeys = Object.keys(genes).sort((a, b) => genes[b] - genes[a]);

    return { genes, sortedGeneKeys };
  }, [yearsData]);

  // Step 2: Perform side effects (dispatching to Redux) after calculation.
  useEffect(() => {
    if (!processedData) return;

    const { genes, sortedGeneKeys } = processedData;

    // This is a side effect and belongs in useEffect
    dispatch(setMaxSliderValueKP_GE(Object.keys(genes).length));

    const topGE = sortedGeneKeys.slice(0, currentSliderValueKP_GE);

    // These are also side effects
    dispatch(setTopGenesSlice(topGE));
  }, [processedData, currentSliderValueKP_GE, dispatch]);

  // Step 3: Calculate the final data for the chart based on Redux state.
  const slicedData = useMemo(() => {
    const slicedDataArray = [];

    yearsData?.forEach(year => {
      if (year.totalCount < 10) {
        //Filter data which is used to plot and include count greater and equal to 10 (Bla for Kleb and Marker for N.Gono)
        return;
      }
      const value = {
        name: year.name,
        totalCount: year.totalCount,
        resistantCount: year.resistantCount,
        // 'Other Genes': 0,
      };

      const keys = Object.keys(year).filter(key => !['name', 'totalCount', 'resistantCount'].includes(key));
      keys.forEach(key => {
        if (topGenesSlice.includes(key)) {
          value[key] = year[key];
          return;
        }

        // value['Other Genes'] += year[key];
      });

      processedData.sortedGeneKeys
        .filter(key => !keys.includes(key))
        .forEach(key => {
          value[key] = 0;
        });

      slicedDataArray.push(value);
    });

    return slicedDataArray;
  }, [yearsData, topGenesSlice]);

  function getData() {
    if (trendsGraphView === 'number') {
      return slicedData;
    }

    const exclusions = ['name', 'totalCount', 'resistantCount'];
    let percentageData = structuredClone(slicedData ?? []);
    percentageData = percentageData.map(item => {
      const keys = Object.keys(item).filter(x => !exclusions.includes(x));

      keys.forEach(key => {
        item[key] = Number(((item[key] / item.totalCount) * 100).toFixed(2));
      });

      return item;
    });

    return percentageData;
  }

  function handleChangeDataView(event) {
    dispatch(setTrendsGraphView(event.target.value));
  }

  function handleChangeDrugClass(event) {
    setCurrentTooltip(null);
    dispatch(setTrendsGraphDrugClass(event.target.value));
  }

  function handleClickChart(event) {
    const data = slicedData.find(item => item.name === event?.activeLabel);

    if (data && data.totalCount > 0) {
      const currentData = structuredClone(data);
      const value = {
        name: currentData.name,
        count: currentData.totalCount,
        genes: [],
      };

      delete currentData.name;
      delete currentData.totalCount;
      delete currentData.resistantCount;

      Object.keys(currentData).forEach(key => {
        const count = currentData[key];

        if (count === 0) {
          return;
        }

        const item = {
          label: key,
          count,
          percentage: Number(((count / value.count) * 100).toFixed(2)),
          color: event.activePayload.find(x => x.name === key)?.color,
        };

        value.genes.push(item);
        value.genes.sort((a, b) => a.label.localeCompare(b.label));
      });

      setCurrentTooltip(value);
    } else {
      setCurrentTooltip({
        name: event?.activeLabel,
        count: 'ID',
        genes: [],
      });
    }
    //dispatch(setResetBool(false));
  }

  useEffect(() => {
    if (resetBool) {
      setCurrentTooltip(null);
    }
  });

  useEffect(() => {
    if (slicedData.length > 0) {
      // Dispatch initial values based on the default range (full range)
      const startValue = slicedData[0]?.name; // First value in the data
      const endValue = slicedData[slicedData.length - 1]?.name; // Last value in the data
      dispatch(setStarttimeRDT(startValue));
      dispatch(setEndtimeRDT(endValue));
    }
  }, [slicedData, dispatch]);

  useEffect(() => {
    if (canGetData) {
      // Get data
      const data = getData();

      let allYears = [];
      if (data.length > 0) {
        // Add missing years between the select time to show continuous scale
        allYears = getRange(Number(data[0].name), Number(data[data.length - 1].name))?.map(String);
        const years = data.map(x => x.name.toString());

        allYears.forEach(year => {
          if (!years.includes(year)) {
            data.push({
              name: year,
              'Insufficient data': trendsGraphView === 'number' ? 0 : 100,
            });
          }
        });

        data.sort((a, b) => a.name.toString().localeCompare(b.name).toString());
      }

      setPlotChart(() => {
        return (
          <ResponsiveContainer width="100%">
            <ComposedChart data={data} cursor={isTouchDevice() ? 'default' : 'pointer'} onClick={handleClickChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                tickCount={20}
                allowDecimals={false}
                padding={{ left: 20, right: 20 }}
                dataKey="name"
                domain={(slicedData ?? []).length > 0 ? ['dataMin', 'dataMax'] : undefined}
                interval={'preserveStartEnd'}
                tick={{ fontSize: 14 }}
              />
              <YAxis
                tickCount={8}
                padding={{ top: 20, bottom: 20 }}
                allowDecimals={false}
                domain={getDomain()}
                allowDataOverflow={true}
              >
                <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                  {dataViewOptionsGenomes.find(option => option.value === trendsGraphView).label}
                </Label>
              </YAxis>
              {(slicedData ?? []).length > 0 && (
                <Brush
                  dataKey="name"
                  height={20}
                  stroke={'rgb(31, 187, 211)'}
                  startIndex={allYears.findIndex(x => x === '2000') || 0}
                  onChange={brushRange => {
                    dispatch(setStarttimeRDT(slicedData[brushRange.startIndex]?.name));
                    dispatch(setEndtimeRDT(slicedData[brushRange.endIndex]?.name)); // if using state genotypesYearData[start]?.name
                  }}
                />
              )}

              {organism !== 'none' && (
                <Legend
                  content={props => {
                    const { payload } = props;

                    return (
                      <div className={classes.legendWrapper}>
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry;

                          if (dataKey.includes('Other Genes')) {
                            const hasData = data.some(d => {
                              const value = d[dataKey];

                              return value !== undefined && value !== null && value !== 0;
                            });

                            if (!hasData) {
                              return null;
                            }
                          }

                          return (
                            <React.Fragment key={`trends-legend-${index}`}>
                              <div className={classes.legendItemWrapper}>
                                <Box
                                  className={classes.colorCircle}
                                  style={{
                                    backgroundColor: color,
                                  }}
                                />
                                <Typography variant="caption">{dataKey}</Typography>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    );
                  }}
                />
              )}

              <ChartTooltip
                cursor={{ fill: hoverColor }}
                content={({ payload, active, label }) => {
                  if (payload !== null && active) {
                    return <div className={classes.chartTooltipLabel}>{label}</div>;
                  }
                  return null;
                }}
              />

              {[...(topGenesSlice || []).filter(x => x !== 'None'), 'Other Genes', 'None'].map((option, index) => {
                let fillColor = '#F5F4F6';

                if (option === 'Other Genes') {
                  fillColor = '#F5F4F6';
                } else if (option === 'None') {
                  fillColor = lightGrey;
                } else if (organism === 'ngono') {
                  const colorObj = colorForDrugClassesNG[trendsGraphDrugClass]?.find(x => x.name === option);
                  if (colorObj) fillColor = colorObj.color;
                } else if (organism === 'kpneumo') {
                  fillColor = colorForMarkers[index];
                }

                return (
                  <Line
                    key={`trends-line-${index}`}
                    dataKey={option}
                    strokeWidth={2}
                    stroke={fillColor}
                    connectNulls
                    type="monotone"
                    activeDot={timeInitial === timeFinal ? true : false}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearsData, trendsGraphView, trendsGraphDrugClass, currentSliderValueKP_GE, slicedData, topGenesSlice]);

  return (
    <CardContent className={classes.markerTrendsGraph}>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="RDT">
          {plotChart}
        </div>
        <div className={classes.rightSide}>
          <SliderSizes value={'KP_GE'} style={{ width: '100%' }} />
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
                    {currentTooltip.genes.map((item, index) => {
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
              <div className={classes.noYearSelected}>No year selected</div>
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
                <div className={classes.selectPreWrapper}>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">Select drug class</Typography>
                    </div>
                    <Select
                      value={trendsGraphDrugClass}
                      onChange={handleChangeDrugClass}
                      inputProps={{ className: classes.selectInput }}
                      MenuProps={{ classes: { list: classes.selectMenu } }}
                      disabled={organism === 'none'}
                    >
                      {getDrugClasses()?.map((option, index) => {
                        return (
                          <MenuItem key={index + 'trends-drug-classes'} value={option}>
                            {option}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </div>
                </div>
                <div className={classes.selectPreWrapper}>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">Data view</Typography>
                    </div>
                    <Select
                      value={trendsGraphView}
                      onChange={handleChangeDataView}
                      inputProps={{ className: classes.selectInput }}
                      MenuProps={{ classes: { list: classes.selectMenu } }}
                      disabled={organism === 'none'}
                    >
                      {dataViewOptions.map((option, index) => {
                        return (
                          <MenuItem key={index + 'trends-dataview'} value={option.value}>
                            {option.label}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Box>
      )}
    </CardContent>
  );
};
