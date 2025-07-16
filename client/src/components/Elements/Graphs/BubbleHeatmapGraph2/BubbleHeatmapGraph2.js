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
  TextField,
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
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { darkGrey, hoverColor } from '../../../../util/colorHelper';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { statKeys } from '../../../../util/drugClassesRules';
import { drugAcronyms, drugAcronymsOpposite } from '../../../../util/drugs';
import { mixColorScale } from '../../Map/mapColorHelper';
import { longestVisualWidth } from '../../../../util/helpers';
import { Clear, Close, InfoOutlined } from '@mui/icons-material';
import { SelectCountry } from '../../SelectCountry';
import { getAxisLabel } from '../../../../util/genotypes';
import { organismsWithLotsGenotypes } from '../../../../util/organismsCards';
import { setBubbleHeatmapGraphVariable } from '../../../../stores/slices/graphSlice';
import { variableGraphOptions } from '../../../../util/convergenceVariablesOptions';

const xOptionsByOrganism = [
  {
    label: 'Genotype',
    value: 'genotype',
    organisms: ['styphi', 'ngono', 'kpneumo', 'ecoli', 'shige', 'decoli'],
  },
  {
    label: 'Lineage',
    value: 'genotype',
    organisms: ['senterica', 'sentericaints'],
  },
];

export const BubbleHeatmapGraph2 = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [xAxisType, setXAxisType] = useState('');
  const [yAxisType /*setYAxisType*/] = useState('resistance');
  const [xAxisSelected, setXAxisSelected] = useState([]);
  const [yAxisSelected, setYAxisSelected] = useState([]);
  const [genotypeSearch, setGenotypeSearch] = useState('');
  const [plotChart, setPlotChart] = useState(() => {});

  const dispatch = useAppDispatch();
  const organism = useAppSelector(state => state.dashboard.organism);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const mapData = useAppSelector(state => state.map.mapData);
  const mapRegionData = useAppSelector(state => state.map.mapRegionData);
  const actualCountry = useAppSelector(state => state.dashboard.actualCountry);
  const actualRegion = useAppSelector(state => state.dashboard.actualRegion);
  const canFilterData = useAppSelector(state => state.dashboard.canFilterData);
  const bubbleHeatmapGraphVariable = useAppSelector(state => state.graph.bubbleHeatmapGraphVariable);
  const loadingPDF = useAppSelector((state) => state.dashboard.loadingPDF); 

  const organismHasLotsOfGenotypes = useMemo(() => organismsWithLotsGenotypes.includes(organism), [organism]);

  const xOptions = useMemo(() => {
    return xOptionsByOrganism.filter(x => x.organisms.includes(organism));
  }, [organism]);

  useEffect(() => {
    setXAxisType(xOptions[0].value ?? '');
  }, [xOptions]);

  const selectedCRData = useMemo(() => {
    return (actualCountry !== 'All' ? mapData : mapRegionData).find(
      x => x.name === (actualCountry !== 'All' ? actualCountry : actualRegion),
    );
  }, [actualCountry, actualRegion, mapData, mapRegionData]);

  const resistanceOptions = useMemo(() => {
    const options = statKeys[organism] ? statKeys[organism] : statKeys['others'];
    const resistance = options.filter(option => option.resistanceView).map(option => option.name);
    const drugs = {};

    resistance.forEach(drug => {
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
        .filter(x => x[1] > 0)
        .map(x => x[0]) ?? []
    );
  }, [organism, selectedCRData?.stats]);

  const markersOptions = useMemo(() => {
    const drugKey = yAxisType === 'kp-markers-carbapenems' ? 'Carbapenems' : 'ESBL';

    return (
      selectedCRData?.stats[drugKey]?.items
        .filter(x => x.name !== '-')
        .sort((a, b) => b.count - a.count)
        .map(x => x.name) ?? []
    );
  }, [selectedCRData?.stats, yAxisType]);

  const statColumn = useMemo(() => {
    switch (xAxisType) {
      case 'genotype':
        if (organism === 'kpneumo') {
          return variableGraphOptions.find(x => x.value === bubbleHeatmapGraphVariable).mapValue;
        }
        return 'GENOTYPE';
      case 'pathotype':
        return 'PATHOTYPE';
      default:
        return '';
    }
  }, [bubbleHeatmapGraphVariable, organism, xAxisType]);

  const xAxisOptions = useMemo(() => {
    return selectedCRData?.stats[statColumn]?.items?.map(x => x.name) ?? [];
  }, [selectedCRData?.stats, statColumn]);

  const filteredXAxisOptions = useMemo(() => {
    const filteredOptions = xAxisOptions.filter(option => option.toLowerCase().includes(genotypeSearch.toLowerCase()));

    if (!organismHasLotsOfGenotypes) {
      return filteredOptions;
    }

    return filteredOptions.slice(0, 20);
  }, [xAxisOptions, organismHasLotsOfGenotypes, genotypeSearch]);

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
    setYAxisSelected(yAxisOptions);
  }, [yAxisOptions]);

  const yAxisWidth = useMemo(() => {
    return longestVisualWidth(xAxisSelected ?? []);
  }, [xAxisSelected]);

  const getOptionLabel = useCallback(
    item => {
      const totalCount = selectedCRData?.stats[statColumn].items.find(x => x.name === item)?.count ?? 0;

      return `${item} (total N=${totalCount})`;
    },
    [selectedCRData?.stats, statColumn],
  );

  const getOptionLabelY = useCallback(
    item => {
      if (yAxisType === 'resistance') {
        return drugAcronymsOpposite[drugAcronyms[item] ?? item] ?? item;
      }

      return item;
    },
    [yAxisType],
  );

  function handleChangeXAxisSelected({ event = null, all = false }) {
    const value = event?.target.value;

    if (value?.length === 1 && value[0] === undefined) {
      return;
    }

    if (!all) {
      setXAxisSelected(value);
      return;
    }

    setXAxisSelected([]);
  }

  function handleChangeYAxisSelected({ event = null, all = false }) {
    const value = event?.target.value;

    if (!all) {
      setYAxisSelected(value);
      return;
    }

    if (yAxisOptions?.length === yAxisSelected?.length) {
      setYAxisSelected([]);
      return;
    }

    setYAxisSelected(yAxisOptions?.slice());
  }

  function hangleChangeSearch(event) {
    event.stopPropagation();
    setGenotypeSearch(event.target.value);
  }

  function clearSearch(event) {
    event.stopPropagation();
    setGenotypeSearch('');
  }

  function handleChangeVariable(event) {
    dispatch(setBubbleHeatmapGraphVariable(event.target.value));
  }

  const getTitle = useCallback(value => {
    return drugAcronymsOpposite[value] ?? Object.keys(drugAcronyms).find(key => drugAcronyms[key] === value) ?? value;
  }, []);

  const configuredMapData = useMemo(() => {
    if (!selectedCRData || yAxisSelected.length === 0) {
      return [];
    }

    return selectedCRData?.stats[statColumn]?.items
      ?.filter(item => xAxisSelected?.includes(item.name))
      .map(item => {
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
                total: item.count,
              });
            }
          });

          itemData.items.sort((a, b) => a.itemName.localeCompare(b.itemName));

          const moveToStart = name => {
            const i = itemData.items.findIndex(x => x.itemName === name);
            if (i >= 0) itemData.items.unshift(...itemData.items.splice(i, 1));
          };

          const moveToEnd = name => {
            const i = itemData.items.findIndex(x => x.itemName === name);
            if (i >= 0) itemData.items.push(...itemData.items.splice(i, 1));
          };

          if (['styphi', 'sentericaints'].includes(organism)) {
            ['CRO', 'CipR', 'CipNS'].forEach(moveToStart);
          }

          ['MDR', 'XDR', 'PAN', 'SUS'].forEach(moveToEnd);
        }

        if (yAxisType.includes('markers')) {
          const drugGenes = item?.drugs[yAxisType.includes('esbl') ? 'ESBL' : 'Carbapenems']?.items;

          yAxisSelected.forEach(gene => {
            const currentGene = drugGenes.find(dg => dg.name === gene);

            itemData.items.push({
              itemName: (currentGene?.name ?? gene).replace(' + ', '/'),
              percentage: currentGene?.percentage ?? 0,
              index: 1,
              typeName: item.name,
              total: item.count,
            });
          });
        }

        return itemData;
      });
  }, [organism, selectedCRData, statColumn, xAxisSelected, yAxisSelected, yAxisType]);

  useEffect(() => {
    if (canGetData) {
      setPlotChart(() => {
        return (
          <>
            {configuredMapData?.map((item, index) => {
              return (
                <ResponsiveContainer
                  key={`heatmap-graph-${index}`}
                  width={yAxisWidth + 65 * yAxisSelected.length}
                  height={index === 0 ? 105 : 65}
                  style={{ paddingTop: index === 0 ? 40 : 0 }}
                >
                  <ScatterChart
                    cursor={isTouchDevice() ? 'default' : 'pointer'}
                    margin={{ bottom: index === 0 ? -20 : 20 }}
                  >
                    <XAxis
                      type="category"
                      dataKey="itemName"
                      interval={0}
                      tick={
                        index === 0
                          ? props => {
                              const title = getTitle(props.payload.value);

                              return (
                                <Tooltip title={title} placement="top">
                                  <text
                                    x={props.x}
                                    y={props.y}
                                    fontSize="14px"
                                    dy={-10}
                                    textAnchor="start"
                                    transform={`rotate(-45, ${props.x}, ${props.y})`}
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

                    <ZAxis type="number" dataKey="percentage" range={[3500, 3500]} />

                    <ChartTooltip
                      cursor={{ fill: hoverColor }}
                      wrapperStyle={{ zIndex: 100 }}
                      offset={40}
                      content={({ payload, active }) => {
                        if (payload !== null && active) {
                          const title = getTitle(payload[0]?.payload.itemName);
                          return (
                            <div
                              className={classes.chartTooltipLabel}
                              style={{
                                marginTop: index + 1 === configuredMapData.length ? -40 : index === 0 ? 40 : 0,
                              }}
                            >
                              <Typography variant="body1" fontWeight="500">
                                {payload[0]?.payload.typeName}
                              </Typography>
                              <Typography variant="caption" fontWeight="500">
                                Total: {payload[0]?.payload.total}
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
                          fill={option.percentage === 0 ? darkGrey : mixColorScale(option.percentage)}
                        />
                      ))}
                      <LabelList
                        dataKey="percentage"
                        fontSize={12}
                        content={({ x, y, value, z }) => {
                          return (
                            <text
                              x={x + 33}
                              y={y + 38}
                              textAnchor="middle"
                              fontSize={15}
                              fontWeight={600}
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
  }, [configuredMapData, yAxisWidth]);

  return (
    <CardContent className={classes.bubbleHeatmapGraph}>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} style={loadingPDF ? { overflow: 'visible' } : undefined} id="HSG2">
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
                  {organism === 'kpneumo' && (
                    <div className={classes.selectWrapper}>
                      <div className={classes.labelWrapper}>
                        <Typography variant="caption">Select genotype</Typography>
                      </div>
                      <Select
                        value={bubbleHeatmapGraphVariable}
                        onChange={handleChangeVariable}
                        inputProps={{ className: classes.selectInput }}
                        MenuProps={{ classes: { list: classes.selectMenu } }}
                        disabled={organism === 'none'}
                      >
                        {variableGraphOptions.map((option, index) => {
                          return (
                            <MenuItem key={index + 'bubble-heatmap-variable'} value={option.value}>
                              {option.label}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </div>
                  )}
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">
                        Select {getAxisLabel(organism, bubbleHeatmapGraphVariable)}
                      </Typography>
                      <Tooltip
                        title={`If the total ${getAxisLabel(
                          organism,
                          bubbleHeatmapGraphVariable,
                        )} are too many, only the first 20 options are shown at a time`}
                        placement="top"
                      >
                        <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                      </Tooltip>
                    </div>
                    <Select
                      multiple
                      value={xAxisSelected}
                      onChange={event => handleChangeXAxisSelected({ event })}
                      displayEmpty
                      disabled={organism === 'none'}
                      endAdornment={
                        <Button
                          variant="outlined"
                          className={classes.selectButton}
                          onClick={() => handleChangeXAxisSelected({ all: true })}
                          disabled={organism === 'none'}
                          color="error"
                        >
                          Clear All
                        </Button>
                      }
                      inputProps={{ className: classes.multipleSelectInput }}
                      MenuProps={{
                        disableAutoFocusItem: true,
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      renderValue={selected => <div>{`${selected?.length} of ${xAxisOptions?.length} selected`}</div>}
                      onClose={clearSearch}
                    >
                      <Box
                        className={classes.selectSearch}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => e.stopPropagation()}
                      >
                        <TextField
                          variant="standard"
                          placeholder={organismHasLotsOfGenotypes ? 'Search for more...' : 'Search...'}
                          fullWidth
                          value={genotypeSearch}
                          onChange={hangleChangeSearch}
                          InputProps={
                            genotypeSearch === ''
                              ? undefined
                              : {
                                  endAdornment: (
                                    <IconButton size="small" onClick={clearSearch}>
                                      <Clear />
                                    </IconButton>
                                  ),
                                }
                          }
                        />
                      </Box>
                      {filteredXAxisOptions?.map((option, index) => (
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
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">Select drugs/genes</Typography>
                    </div>
                    <Select
                      multiple
                      value={yAxisSelected}
                      onChange={event => handleChangeYAxisSelected({ event })}
                      displayEmpty
                      disabled={organism === 'none'}
                      endAdornment={
                        <Button
                          variant="outlined"
                          className={classes.selectButton}
                          onClick={() => handleChangeYAxisSelected({ all: true })}
                          disabled={organism === 'none'}
                          color={yAxisSelected?.length === yAxisOptions?.length ? 'error' : 'primary'}
                        >
                          {yAxisSelected?.length === yAxisOptions?.length ? 'Clear All' : 'Select All'}
                        </Button>
                      }
                      inputProps={{ className: classes.multipleSelectInput }}
                      MenuProps={{
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      renderValue={selected => <div>{`${selected?.length} of ${yAxisOptions.length} selected`}</div>}
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
