import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  IconButton,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import { useStyles } from './BubbleHeatmapGraphMUI';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  LabelList,
} from 'recharts';
import { useAppSelector } from '../../../../stores/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { darkGrey, hoverColor } from '../../../../util/colorHelper';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { drugClassesRulesKP, statKeys } from '../../../../util/drugClassesRules';
import { drugAcronyms, drugAcronymsOpposite } from '../../../../util/drugs';
import { differentColorScale } from '../../Map/mapColorHelper';
import { longestVisualWidth } from '../../../../util/helpers';
import { Close } from '@mui/icons-material';
import { SelectCountry } from '../../SelectCountry';

const kpYOptions = Object.keys(drugClassesRulesKP).map((drug) => {
  return {
    value: `kp-markers-${drug.toLowerCase()}`,
    label: `${drug} resistance markers`,
  };
});

const xOptionsByOrganism = [
  {
    label: 'Genotype',
    value: 'genotype',
    organisms: ['styphi', 'ngono', 'kpneumo'],
  },
  {
    label: 'Pathotype',
    value: 'pathotype',
    organisms: ['shige', 'decoli', 'ecoli'],
  },
];

export const BubbleHeatmapGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [xAxisType, setXAxisType] = useState('');
  const [yAxisType, setYAxisType] = useState('resistance');
  const [xAxisSelected, setXAxisSelected] = useState([]);
  const [yAxisSelected, setYAxisSelected] = useState([]);
  const [plotChart, setPlotChart] = useState(() => {});

  const organism = useAppSelector((state) => state.dashboard.organism);
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const mapData = useAppSelector((state) => state.map.mapData);
  const mapRegionData = useAppSelector((state) => state.map.mapRegionData);
  const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);
  const actualRegion = useAppSelector((state) => state.dashboard.actualRegion);

  const xOptions = useMemo(() => {
    return xOptionsByOrganism.filter((x) => x.organisms.includes(organism));
  }, [organism]);

  useEffect(() => {
    setXAxisType(xOptions[0].value ?? '');
  }, [xOptions]);
  
  const selectedCRData = useMemo(() => {
    return (actualCountry !== 'All' ? mapData : mapRegionData).find(
      (x) => x.name === (actualCountry !== 'All' ? actualCountry : actualRegion),
    );
  }, [actualCountry, actualRegion, mapData, mapRegionData]);

  const resistanceOptions = useMemo(() => {
    const options = statKeys[organism] ? statKeys[organism] : statKeys['others'];
    const resistance = options
      .filter((option) => option.resistanceView)
      .map((option) => option.name)
      .sort();
    const drugs = {};

    resistance.forEach((drug) => {
      const stats = selectedCRData?.stats;

      if (!stats) return;

      if (!(drug in drugs)) {
        drugs[drug] = stats[drug]?.count ?? 0;
        return;
      }

      drugs[drug] += stats[drug]?.count ?? 0;
    });

    return (
      Object.entries(drugs)
        .filter((x) => x[1] > 0)
        .sort((a, b) => b[1] - a[1])
        .map((x) => x[0]) ?? []
    );
  }, [organism, selectedCRData?.stats]);

  const markersOptions = useMemo(() => {
    const drugKey = yAxisType === 'kp-markers-carbapenems' ? 'Carb' : 'ESBL';

    return (
      selectedCRData?.stats[drugKey]?.items
        .filter((x) => x.name !== '-')
        .sort((a, b) => b.count - a.count)
        .map((x) => x.name) ?? []
    );
  }, [selectedCRData?.stats, yAxisType]);

  const xAxisOptions = useMemo(() => {
    switch (xAxisType) {
      case 'genotype':
        if (!selectedCRData) return [];
        return selectedCRData?.stats.GENOTYPE?.items?.map((x) => x.name) ?? [];
      case 'pathotype':
        return selectedCRData?.stats.PATHOTYPE?.items?.map((x) => x.name) ?? [];
      default:
        return [];
    }
  }, [selectedCRData, xAxisType]);

  const yAxisOptions = useMemo(() => {
    switch (yAxisType) {
      case 'resistance':
        return resistanceOptions;
      case 'kp-markers-carbapenems':
      case 'kp-markers-esbl':
        return markersOptions;
      default:
        return [];
    }
  }, [markersOptions, resistanceOptions, yAxisType]);

  useEffect(() => {
    setXAxisSelected(xAxisOptions?.slice(0, 10));
  }, [xAxisOptions]);

  useEffect(() => {
    setYAxisSelected(yAxisOptions?.slice(0, 8));
  }, [yAxisOptions]);

  const yAxisWidth = useMemo(() => {
    return longestVisualWidth(xAxisSelected ?? []);
  }, [xAxisSelected]);

  const getOptionLabel = useCallback(
    (item) => {
      const totalCount = selectedCRData?.stats[xAxisType?.toUpperCase()].items.find((x) => x.name === item)?.count ?? 0;

      return `${item} (total N=${totalCount})`;
    },
    [selectedCRData, xAxisType],
  );

  const getOptionLabelY = useCallback(
    (item) => {
      if (yAxisType === 'resistance') {
        if (['MDR', 'XDR'].includes(item)) {
          return item;
        }
        return drugAcronymsOpposite[drugAcronyms[item] ?? item] ?? item;
      }

      return item;
    },
    [yAxisType],
  );

  function handleChangeXAxisType(event) {
    setXAxisType(event.target.value);
  }

  function handleChangeYAxisType(event) {
    setYAxisType(event.target.value);
  }

  function handleChangeXAxisSelected({ event = null, all = false }) {
    if (!all) {
      const newValue = event.target.value;
      setXAxisSelected(newValue);
      return;
    }

    if (xAxisSelected?.length === xAxisOptions?.length) {
      setXAxisSelected([]);
      return;
    }

    setXAxisSelected(xAxisOptions?.slice());
  }

  function handleChangeYAxisSelected(event) {
    const newValue = event.target.value;

    if (newValue.length <= 8) {
      setYAxisSelected(newValue);
    }
  }

  function clearYAxisSelected() {
    setYAxisSelected([]);
  }

  const getTitle = useCallback((value) => {
    return drugAcronymsOpposite[value] ?? Object.keys(drugAcronyms).find((key) => drugAcronyms[key] === value) ?? value;
  }, []);

  const configuredMapData = useMemo(() => {
    if (!selectedCRData || yAxisSelected.length === 0) {
      return [];
    }

    if (xAxisType === 'genotype') {
      return selectedCRData?.stats.GENOTYPE.items
        .filter((item) => xAxisSelected?.includes(item.name))
        .map((item) => {
          const itemData = { name: item.name, items: [] };

          if (yAxisType === 'resistance') {
            Object.entries(item.drugs).forEach(([key, value]) => {
              if (yAxisSelected.includes(key)) {
                itemData.items.push({
                  itemName: drugAcronyms[key] ?? key,
                  percentage: value.percentage,
                  count: value.count,
                  index: 1,
                  typeName: item.name,
                });
              }
            });
          }

          if (yAxisType.includes('markers')) {
            const drugGenes = item?.drugs[yAxisType.includes('esbl') ? 'ESBL' : 'Carb']?.items;

            yAxisSelected.forEach((gene) => {
              const currentGene = drugGenes.find((dg) => dg.name === gene);

              itemData.items.push({
                itemName: (currentGene?.name ?? gene).replace(' + ', '/'),
                percentage: currentGene?.percentage ?? 0,
                index: 1,
                typeName: item.name,
              });
            });
          }

          return itemData;
        });
    }

    return [];
  }, [selectedCRData, xAxisSelected, xAxisType, yAxisSelected, yAxisType]);

  useEffect(() => {
    if (canGetData) {
      setPlotChart(() => {
        return (
          <>
            {configuredMapData.map((item, index) => {
              return (
                <ResponsiveContainer key={`heatmap-graph-${index}`} width="100%" height={index === 0 ? 90 : 70}>
                  <ScatterChart
                    cursor={isTouchDevice() ? 'default' : 'pointer'}
                    margin={{ bottom: index === 0 ? -20 : 0 }}
                  >
                    <XAxis
                      type="category"
                      dataKey="itemName"
                      interval={0}
                      tick={
                        index === 0
                          ? (props) => {
                              const title = getTitle(props.payload.value);

                              return (
                                <Tooltip title={title} placement="top">
                                  <text
                                    x={props.x}
                                    y={props.y}
                                    fontSize="14px"
                                    textAnchor="middle"
                                    dy={-4}
                                    fill="rgb(128,128,128)"
                                  >
                                    {props.payload.value}
                                  </text>
                                </Tooltip>
                              );
                            }
                          : false
                      }
                      axisLine={false}
                      orientation="top"
                    />

                    <YAxis
                      type="number"
                      dataKey="index"
                      name={item.name.toLowerCase()}
                      tick={false}
                      tickLine={false}
                      axisLine={false}
                      domain={[1, 1]}
                      label={{ value: item.name, position: 'insideRight' }}
                      width={yAxisWidth}
                    />

                    <ZAxis type="number" dataKey="percentage" range={[1500, 1500]} />

                    <ChartTooltip
                      cursor={{ fill: hoverColor }}
                      wrapperStyle={{ zIndex: 100 }}
                      content={({ payload, active }) => {
                        if (payload !== null && active) {
                          const title = getTitle(payload[0]?.payload.itemName);
                          return (
                            <div className={classes.chartTooltipLabel}>
                              <Typography variant="body1" fontWeight="500">
                                {payload[0]?.payload.typeName}
                              </Typography>
                              <Typography variant="body2">
                                {yAxisType !== 'resistance'
                                  ? `${title}: ${payload[0]?.payload.percentage}%`
                                  : `${title}: ${payload[0]?.payload.count} (${payload[0]?.payload.percentage}%)`}
                              </Typography>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    <Scatter data={item.items} shape="square">
                      {item.items.map((option, index) => (
                        <Cell
                          name={option.drug}
                          key={`bubble-cell-${index}`}
                          fill={option.percentage === 0 ? darkGrey : differentColorScale(option.percentage, 'red')}
                        />
                      ))}
                      <LabelList
                        dataKey="percentage"
                        fontSize={12}
                        content={({ x, y, value, z }) => {
                          return (
                            <text
                              x={x + 22}
                              y={y + 25}
                              textAnchor="middle"
                              fontSize={12}
                              fontWeight={500}
                              fill={value === 0 || value > 25 ? '#fff' : '#000'}
                              pointerEvents="none"
                            >
                              {value}
                            </text>
                          );
                        }}
                      />
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              );
            })}
          </>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuredMapData, yAxisWidth, canGetData]);

  return (
    <CardContent className={classes.bubbleHeatmapGraph}>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="HSG">
          {plotChart}
        </div>
      </div>
      {yAxisSelected.length === 0 && (
        <Box className={classes.nothingSelected}>
          <Typography fontWeight={600}>No data to show</Typography>
        </Box>
      )}
      <Divider className={classes.divider} />
      <div className={classes.bottomLegend}>
        <div className={classes.legend}>
          <Typography fontSize="0.75rem">0%</Typography>
          <Box className={classes.singleBox} sx={{ backgroundColor: darkGrey }} />
        </div>
        <div className={classes.legend}>
          <Typography fontSize="0.75rem">1%</Typography>
          <Box className={classes.gradientBox} />
          <Typography fontSize="0.75rem">100%</Typography>
        </div>
      </div>
      {showFilter && (
        <Box className={classes.floatingFilter}>
          <Card elevation={3}>
            <CardContent>
              <div className={classes.titleWrapper}>
                <Typography variant="h6">Filters</Typography>
                <Tooltip title="Hide Filters" placement="top">
                  <IconButton onClick={() => setShowFilter(false)}>
                    <Close fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
              <div className={classes.selectsWrapper}>
                <SelectCountry />
                <div className={classes.selectPreWrapper}>
                  <div className={classes.selectWrapper}>
                    <Typography variant="caption">X axis</Typography>
                    <Select
                      value={xAxisType}
                      onChange={handleChangeXAxisType}
                      inputProps={{ className: classes.selectInput }}
                      MenuProps={{ classes: { list: classes.selectMenu } }}
                      disabled={organism === 'none'}
                    >
                      {xOptions.map((option) => (
                        <MenuItem key={`x-option-${option.value}`} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                  <div className={classes.selectWrapper}>
                    <Typography variant="caption">Select genotypes/pathotypes</Typography>
                    <Select
                      multiple
                      value={xAxisSelected}
                      onChange={(event) => handleChangeXAxisSelected({ event })}
                      displayEmpty
                      disabled={organism === 'none'}
                      endAdornment={
                        <Button
                          variant="outlined"
                          className={classes.selectButton}
                          onClick={() => handleChangeXAxisSelected({ all: true })}
                          disabled={organism === 'none'}
                          color={xAxisSelected?.length === xAxisOptions?.length ? 'error' : 'primary'}
                        >
                          {xAxisSelected?.length === xAxisOptions?.length ? 'Clear All' : 'Select All'}
                        </Button>
                      }
                      inputProps={{ className: classes.multipleSelectInput }}
                      MenuProps={{
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      renderValue={(selected) => <div>{`${selected?.length} of ${xAxisOptions?.length} selected`}</div>}
                    >
                      {xAxisOptions?.map((option, index) => (
                        <MenuItem key={`geo-x-axis-option-${index}`} value={option}>
                          <Checkbox checked={xAxisSelected?.indexOf(option) > -1} />
                          <ListItemText primary={getOptionLabel(option)} />
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className={classes.selectPreWrapper}>
                  <div className={classes.selectWrapper}>
                    <Typography variant="caption">Y axis</Typography>
                    <Select
                      value={yAxisType}
                      onChange={handleChangeYAxisType}
                      inputProps={{ className: classes.selectInput }}
                      MenuProps={{ classes: { list: classes.selectMenu } }}
                      disabled={organism === 'none'}
                    >
                      <MenuItem value="resistance">Resistance prevalence</MenuItem>
                      {organism === 'kpneumo' &&
                        kpYOptions.map((option, index) => (
                          <MenuItem key={`y-kp-option-${index}`} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                    </Select>
                  </div>
                  <div className={classes.selectWrapper}>
                    <Typography variant="caption">Select drugs/genes (up to 8)</Typography>
                    <Select
                      multiple
                      value={yAxisSelected}
                      onChange={handleChangeYAxisSelected}
                      displayEmpty
                      disabled={organism === 'none'}
                      endAdornment={
                        <Button
                          variant="outlined"
                          className={classes.selectButton}
                          onClick={clearYAxisSelected}
                          disabled={organism === 'none' || yAxisSelected?.length === 0}
                          color="error"
                        >
                          Clear All
                        </Button>
                      }
                      inputProps={{ className: classes.multipleSelectInput }}
                      MenuProps={{
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      renderValue={(selected) => <div>{`${selected?.length} of ${yAxisOptions.length} selected`}</div>}
                    >
                      {yAxisOptions.map((option, index) => (
                        <MenuItem key={`geo-y-axis-option-${index}`} value={option}>
                          <Checkbox checked={yAxisSelected.indexOf(option) > -1} />
                          <ListItemText primary={getOptionLabelY(option)} />
                        </MenuItem>
                      ))}
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
