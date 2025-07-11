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
import { useStyles } from './BubbleMarkersHeatmapGraphMUI';
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
import { mixColorScale } from '../../Map/mapColorHelper';
import { longestVisualWidth, truncateWord } from '../../../../util/helpers';
import { Clear, Close, InfoOutlined } from '@mui/icons-material';
import { SelectCountry } from '../../SelectCountry';
import { getAxisLabel } from '../../../../util/genotypes';
import { organismsWithLotsGenotypes } from '../../../../util/organismsCards';
import { variableGraphOptions } from '../../../../util/convergenceVariablesOptions';
import { markersDrugsKP } from '../../../../util/drugs';
import { setBubbleMarkersHeatmapGraphVariable, setBubbleMarkersYAxisType } from '../../../../stores/slices/graphSlice';

export const BubbleMarkersHeatmapGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [xAxisSelected, setXAxisSelected] = useState([]);
  const [yAxisSelected, setYAxisSelected] = useState([]);
  const [genotypeSearch, setGenotypeSearch] = useState('');
  const [markerSearch, setMarkerSearch] = useState('');
  const [plotChart, setPlotChart] = useState(() => {});

  const dispatch = useAppDispatch();
  const organism = useAppSelector(state => state.dashboard.organism);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const mapData = useAppSelector(state => state.map.mapData);
  const mapRegionData = useAppSelector(state => state.map.mapRegionData);
  const actualCountry = useAppSelector(state => state.dashboard.actualCountry);
  const actualRegion = useAppSelector(state => state.dashboard.actualRegion);
  const canFilterData = useAppSelector(state => state.dashboard.canFilterData);
  const bubbleMarkersHeatmapGraphVariable = useAppSelector(state => state.graph.bubbleMarkersHeatmapGraphVariable);
  const bubbleMarkersYAxisType = useAppSelector(state => state.graph.bubbleMarkersYAxisType);
  const loadingPDF = useAppSelector((state) => state.dashboard.loadingPDF);
  const organismHasLotsOfGenotypes = useMemo(() => organismsWithLotsGenotypes.includes(organism), [organism]);

  const selectedCRData = useMemo(() => {
    return (actualCountry !== 'All' ? mapData : mapRegionData).find(
      x => x.name === (actualCountry !== 'All' ? actualCountry : actualRegion),
    );
  }, [actualCountry, actualRegion, mapData, mapRegionData]);

  const statColumn = useMemo(() => {
    return variableGraphOptions.find(x => x.value === bubbleMarkersHeatmapGraphVariable).mapValue;
  }, [bubbleMarkersHeatmapGraphVariable]);

  const yAxisOptions = useMemo(() => {
    function getUniqueNames(data) {
      const seen = new Set();

      for (let i = 0; i < data.length; i++) {
        const items = data[i].drugs?.[bubbleMarkersYAxisType]?.items;
        if (!items) continue;

        for (let j = 0; j < items.length; j++) {
          const name = items[j].name;
          if (name) {
            seen.add(name);
          }
        }
      }

      return [...seen];
    }

    const items = getUniqueNames(selectedCRData?.stats?.[statColumn]?.items || []);
    return items.filter(x => x !== '-').sort();
  }, [bubbleMarkersYAxisType, selectedCRData?.stats, statColumn]);

  const filteredYAxisOptions = useMemo(() => {
    const filteredOptions = yAxisOptions.filter(option => option.toLowerCase().includes(markerSearch.toLowerCase()));

    return filteredOptions.slice(0, 20);
  }, [yAxisOptions, markerSearch]);

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

  useEffect(() => {
    setXAxisSelected(xAxisOptions?.slice(0, 10));
  }, [xAxisOptions]);

  useEffect(() => {
    setYAxisSelected(yAxisOptions?.slice(0, 10));
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

    if (value?.length === 1 && value[0] === undefined) {
      return;
    }

    if (!all) {
      setYAxisSelected(value);
      return;
    }

    setYAxisSelected([]);
  }

  function handleChangeSearch(event) {
    event.stopPropagation();
    setGenotypeSearch(event.target.value);
  }

  function clearSearch(event) {
    event.stopPropagation();
    setGenotypeSearch('');
  }

  function handleChangeYSearch(event) {
    event.stopPropagation();
    setMarkerSearch(event.target.value);
  }

  function clearYSearch(event) {
    event.stopPropagation();
    setMarkerSearch('');
  }

  function handleChangeVariable(event) {
    dispatch(setBubbleMarkersHeatmapGraphVariable(event.target.value));
  }

  function handleChangeYAxisType(event) {
    dispatch(setBubbleMarkersYAxisType(event.target.value));
  }

  const configuredMapData = useMemo(() => {
    if (!selectedCRData || yAxisSelected.length === 0) {
      return [];
    }

    return selectedCRData?.stats[statColumn]?.items
      ?.filter(item => xAxisSelected?.includes(item.name))
      .map(item => {
        const itemData = { name: item.name, items: [] };
        const items = item.drugs?.[bubbleMarkersYAxisType]?.items || [];

        yAxisSelected.forEach(option => {
          const info = items.find(x => x.name === option) || { name: option, count: 0, percentage: 0 };
          itemData.items.push({
            itemName: info.name,
            percentage: info.percentage,
            count: info.count,
            index: 1,
            typeName: item.name,
            total: item.count,
          });
        });

        itemData.items.sort((a, b) => a.itemName.localeCompare(b.itemName));

        return itemData;
      });
  }, [bubbleMarkersYAxisType, selectedCRData, statColumn, xAxisSelected, yAxisSelected]);

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
                  style={{ paddingTop: index === 0 ? 70 : 0 }}
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
                              const title = props.payload.value;

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
                                    {truncateWord(title)}
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
                          const title = payload[0]?.payload.itemName;
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
                                {`${title}: ${payload[0]?.payload.count} (${payload[0]?.payload.percentage}%)`}
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
    <CardContent className={classes.bubbleMarkersHeatmapGraph}>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} style={loadingPDF ? { overflow: 'visible' } : undefined} id="BAMRH">
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
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">Select genotype</Typography>
                    </div>
                    <Select
                      value={bubbleMarkersHeatmapGraphVariable}
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
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">
                        Select {getAxisLabel(organism, bubbleMarkersHeatmapGraphVariable)}
                      </Typography>
                      <Tooltip
                        title={`If the total ${getAxisLabel(
                          organism,
                          bubbleMarkersHeatmapGraphVariable,
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
                          onChange={handleChangeSearch}
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
                        <MenuItem key={`markers-x-axis-option-${index}`} value={option}>
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
                      <Typography variant="caption">Select drug</Typography>
                    </div>
                    <Select
                      value={bubbleMarkersYAxisType}
                      onChange={handleChangeYAxisType}
                      inputProps={{ className: classes.selectInput }}
                      MenuProps={{ classes: { list: classes.selectMenu } }}
                      disabled={organism === 'none'}
                    >
                      {markersDrugsKP.map((option, index) => (
                        <MenuItem key={`bubbler-markers-y-axis-type-${index}`} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">Select markers</Typography>
                      <Tooltip title="Only the first 20 options are shown at a time" placement="top">
                        <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                      </Tooltip>
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
                      renderValue={selected => <div>{`${selected?.length} of ${yAxisOptions.length} selected`}</div>}
                      onClose={clearYSearch}
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
                          value={markerSearch}
                          onChange={handleChangeYSearch}
                          InputProps={
                            markerSearch === ''
                              ? undefined
                              : {
                                  endAdornment: (
                                    <IconButton size="small" onClick={clearYSearch}>
                                      <Clear />
                                    </IconButton>
                                  ),
                                }
                          }
                        />
                      </Box>
                      {filteredYAxisOptions.map((option, index) => (
                        <MenuItem key={`markers-y-axis-option-${index}`} value={option}>
                          <Checkbox checked={yAxisSelected.indexOf(option) > -1} />
                          <ListItemText primary={option} />
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
