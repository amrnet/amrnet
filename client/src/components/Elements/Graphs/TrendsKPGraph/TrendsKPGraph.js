/* eslint-disable react-hooks/exhaustive-deps */
import { Box, CardContent, Divider, FormGroup, MenuItem, Select, Switch, Tab, Tabs, Typography } from '@mui/material';
import { useStyles } from './TrendsKPGraphMUI';
import {
  Bar,
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
import { colorForDrugClassesKP, hoverColor } from '../../../../util/colorHelper';
import {
  setTrendsKPGraphDrugClass,
  setTrendsKPGraphView,
  setResetBool,
  setMaxSliderValueKP_GE,
} from '../../../../stores/slices/graphSlice';
import { drugClassesKP } from '../../../../util/drugs';
import { SliderSizes } from '../../Slider';
import { FormControlLabel } from '@material-ui/core';

const dataViewOptions = [
  { label: 'Number of genomes', value: 'number' },
  { label: 'Percentage per year', value: 'percentage' },
];

export const TrendsKPGraph = () => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [plotChart, setPlotChart] = useState(() => {});
  const [tooltipTab, setTooltipTab] = useState('genes');
  const [topGenotypes, setTopGenotypes] = useState([]);
  const [topGenes, setTopGenes] = useState([]);
  const [switchLines, setSwitchLines] = useState(true);

  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const colorPallete = useAppSelector((state) => state.dashboard.colorPallete);
  const timeInitial = useAppSelector((state) => state.dashboard.timeInitial);
  const timeFinal = useAppSelector((state) => state.dashboard.timeFinal);
  const genotypesAndDrugsYearData = useAppSelector((state) => state.graph.genotypesAndDrugsYearData);
  const trendsKPGraphView = useAppSelector((state) => state.graph.trendsKPGraphView);
  const trendsKPGraphDrugClass = useAppSelector((state) => state.graph.trendsKPGraphDrugClass);
  const resetBool = useAppSelector((state) => state.graph.resetBool);
  const currentSliderValueKP_GE = useAppSelector((state) => state.graph.currentSliderValueKP_GE);
  const currentSliderValueKP_GT = useAppSelector((state) => state.graph.currentSliderValueKP_GT);

  useEffect(() => {
    dispatch(setResetBool(true));
    setCurrentTooltip(null);
  }, [genotypesAndDrugsYearData]);

  useEffect(() => {
    setCurrentTooltip(null);
  }, [currentSliderValueKP_GE, currentSliderValueKP_GT]);

  function getDrugClasses() {
    if (organism === 'none') {
      return [];
    }
    return drugClassesKP;
  }

  function getDomain() {
    return trendsKPGraphView === 'number' ? undefined : [0, 100];
  }

  const slicedData = useMemo(() => {
    const slicedDataArray = [];
    const genotypes = {};
    const genes = {};

    genotypesAndDrugsYearData[trendsKPGraphDrugClass]?.forEach((year) => {
      Object.keys(year).forEach((key) => {
        if (['name', 'totalCount', 'resistantCount'].includes(key)) {
          return;
        }

        if (genotypesForFilter.includes(key)) {
          if (key in genotypes) {
            genotypes[key] += year[key];
            return;
          }

          genotypes[key] = year[key];
          return;
        }

        if (key in genes) {
          genes[key] += year[key];
          return;
        }

        genes[key] = year[key];
      });
    });

    dispatch(setMaxSliderValueKP_GE(Object.keys(genes).length));

    const sortedGenotypeKeys = Object.keys(genotypes).sort((a, b) => genotypes[b] - genotypes[a]);
    const sortedGeneKeys = Object.keys(genes).sort((a, b) => genes[b] - genes[a]);

    const topGT = sortedGenotypeKeys.slice(0, currentSliderValueKP_GT);
    const topGE = sortedGeneKeys.slice(0, currentSliderValueKP_GE);
    setTopGenotypes(topGT);
    setTopGenes(topGE);

    genotypesAndDrugsYearData[trendsKPGraphDrugClass]?.forEach((year) => {
      const value = {
        name: year.name,
        totalCount: year.totalCount,
        resistantCount: year.resistantCount,
        'Other Genotypes': 0,
        'Other Genes': 0,
      };

      Object.keys(year).forEach((key) => {
        if (['name', 'totalCount', 'resistantCount'].includes(key)) {
          return;
        }

        if (topGT.includes(key) || topGE.includes(key)) {
          value[key] = year[key];
          return;
        }

        if (genotypesForFilter.includes(key)) {
          value['Other Genotypes'] += year[key];
          return;
        }

        value['Other Genes'] += year[key];
      });

      slicedDataArray.push(value);
    });

    return slicedDataArray;
  }, [
    currentSliderValueKP_GE,
    currentSliderValueKP_GT,
    genotypesAndDrugsYearData,
    genotypesForFilter,
    trendsKPGraphDrugClass,
  ]);

  function getData() {
    if (trendsKPGraphView === 'number') {
      return slicedData;
    }

    const exclusions = ['name', 'totalCount', 'resistantCount'];
    let percentageData = structuredClone(slicedData ?? []);
    percentageData = percentageData.map((item) => {
      const keys = Object.keys(item).filter((x) => !exclusions.includes(x));

      keys.forEach((key) => {
        item[key] = Number(((item[key] / item.totalCount) * 100).toFixed(2));
      });

      return item;
    });

    return percentageData;
  }

  function handleChangeDataView(event) {
    dispatch(setTrendsKPGraphView(event.target.value));
  }

  function handleChangeDrugClass(event) {
    setCurrentTooltip(null);
    dispatch(setTrendsKPGraphDrugClass(event.target.value));
  }

  function handleChangeTooltipTab(_, newValue) {
    setTooltipTab(newValue);
  }

  function handleClickChart(event) {
    const data = slicedData.find((item) => item.name === event?.activeLabel);

    if (data) {
      const currentData = structuredClone(data);
      const value = {
        name: currentData.name,
        count: currentData.totalCount,
        genes: [],
        genotypes: [],
      };

      delete currentData.name;
      delete currentData.totalCount;
      delete currentData.resistantCount;

      Object.keys(currentData).forEach((key) => {
        const count = currentData[key];

        if (count === 0) {
          return;
        }

        const item = {
          label: key,
          count,
          percentage: Number(((count / value.count) * 100).toFixed(2)),
          color: event.activePayload.find((x) => x.name === key)?.color,
        };

        if (genotypesForFilter.includes(key) || key === 'Other Genotypes') {
          value.genotypes.push(item);
          value.genotypes.sort((a, b) => a.label.localeCompare(b.label));
          return;
        }

        value.genes.push(item);
        value.genes.sort((a, b) => a.label.localeCompare(b.label));
      });

      setCurrentTooltip(value);
      dispatch(setResetBool(false));
    }
  }

  function handleSwitchLines(event) {
    setCurrentTooltip(null);
    setTooltipTab('genes');
    setSwitchLines(event.target.checked);
  }

  useEffect(() => {
    if (resetBool) {
      setCurrentTooltip(null);
      dispatch(setResetBool(true));
    }
  });
  useEffect(() => {
    if (canGetData) {
      setPlotChart(() => {
        return (
          <ResponsiveContainer width="100%">
            <ComposedChart data={getData()} cursor={isTouchDevice() ? 'default' : 'pointer'} onClick={handleClickChart}>
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
                tickCount={6}
                padding={switchLines ? { top: 20, bottom: 20 } : undefined}
                allowDecimals={false}
                domain={getDomain()}
                allowDataOverflow={true}
              >
                <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                  Number of Genomes
                </Label>
              </YAxis>
              {(slicedData ?? []).length > 0 && <Brush dataKey="name" height={20} stroke={'rgb(31, 187, 211)'} />}

              {organism !== 'none' && (
                <Legend
                  content={(props) => {
                    const { payload } = props;
                    const diviserIndex = topGenes.length === 0 ? 0 : topGenes.length + 1;

                    return (
                      <div className={classes.legendWrapper}>
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry;
                          return (
                            <React.Fragment key={`trendsKP-legend-${index}`}>
                              <div className={classes.legendItemWrapper}>
                                <Box
                                  className={classes.colorCircle}
                                  style={{
                                    backgroundColor: color,
                                    borderRadius:
                                      index < colorForDrugClassesKP[trendsKPGraphDrugClass]?.length ? undefined : '50%',
                                  }}
                                />
                                <Typography variant="caption">{dataKey}</Typography>
                              </div>
                              {switchLines && diviserIndex - 1 === index && (
                                <Divider orientation="vertical" className={classes.legendDivider} />
                              )}
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

              {topGenes?.map((option, index) => {
                const color = colorForDrugClassesKP[trendsKPGraphDrugClass].find((x) => x.name === option).color;
                return <Bar key={`trendsKP-bar-${index}`} dataKey={option} name={option} stackId={0} fill={color} />;
              })}
              <Bar key="trendsKP-bar-others" dataKey="Other Genes" name="Other Genes" stackId={0} fill="#f5f4f6" />

              {switchLines &&
                [...topGenotypes, 'Other Genotypes'].map((option, index) => (
                  <Line
                    key={`trendsKP-line-${index}`}
                    dataKey={option}
                    strokeWidth={2}
                    stroke={colorPallete[option] || '#F5F4F6'}
                    connectNulls
                    type="monotone"
                    activeDot={timeInitial === timeFinal ? true : false}
                  />
                ))}
            </ComposedChart>
          </ResponsiveContainer>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    genotypesAndDrugsYearData,
    trendsKPGraphView,
    trendsKPGraphDrugClass,
    currentSliderValueKP_GE,
    currentSliderValueKP_GT,
    switchLines,
  ]);

  return (
    <CardContent className={classes.trendsKPGraph}>
      <div className={classes.selectsWrapper}>
        <div className={classes.selectPreWrapper}>
          <div className={classes.selectWrapper}>
            <Typography variant="caption">Select drug class</Typography>
            <Select
              value={trendsKPGraphDrugClass}
              onChange={handleChangeDrugClass}
              inputProps={{ className: classes.selectInput }}
              MenuProps={{ classes: { list: classes.selectMenu } }}
              disabled={organism === 'none'}
            >
              {getDrugClasses().map((option, index) => {
                return (
                  <MenuItem key={index + 'trendsKP-drug-classes'} value={option}>
                    {option}
                  </MenuItem>
                );
              })}
            </Select>
          </div>
          <SliderSizes value={'KP_GT'} style={{ width: '100%', maxWidth: '350px' }} disabled={!switchLines} />
        </div>
        <div className={classes.selectPreWrapper}>
          <div className={classes.selectWrapper}>
            <Typography variant="caption">Data view</Typography>
            <Select
              value={trendsKPGraphView}
              onChange={handleChangeDataView}
              inputProps={{ className: classes.selectInput }}
              MenuProps={{ classes: { list: classes.selectMenu } }}
              disabled={organism === 'none'}
            >
              {dataViewOptions.map((option, index) => {
                return (
                  <MenuItem key={index + 'trendsKP-dataview'} value={option.value}>
                    {option.label}
                  </MenuItem>
                );
              })}
            </Select>
          </div>
          <SliderSizes value={'KP_GE'} style={{ width: '100%', maxWidth: '350px' }} />
        </div>
      </div>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="CERDT">
          {plotChart}
        </div>
        <div className={classes.rightSide}>
          <FormGroup className={classes.formGroup}>
            <FormControlLabel
              label={<Typography variant="caption">Show genotype lines</Typography>}
              control={<Switch checked={switchLines} onChange={handleSwitchLines} />}
            />
          </FormGroup>
          <div className={classes.tooltipWrapper}>
            {currentTooltip ? (
              <div className={classes.tooltip}>
                <div className={classes.tooltipTitle}>
                  <Typography variant="h5" fontWeight="600">
                    {currentTooltip.name}
                  </Typography>
                  <Typography variant="subtitle1">{'N = ' + currentTooltip.count}</Typography>
                </div>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tooltipTab} onChange={handleChangeTooltipTab} variant="fullWidth">
                    <Tab label="Genes" value="genes" />
                    {switchLines && <Tab label="Genotypes" value="genotypes" />}
                  </Tabs>
                </Box>
                <div className={classes.tooltipContent}>
                  {currentTooltip[tooltipTab].map((item, index) => {
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
              </div>
            ) : (
              <div className={classes.noYearSelected}>No year selected</div>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  );
};
