import { Clear, InfoOutlined } from '@mui/icons-material';
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Cell,
  Tooltip as ChartTooltip,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import {
  setBubbleMarkersHeatmapGraphData,
  setBubbleMarkersHeatmapGraphVariable,
  setBubbleMarkersYAxisType,
} from '../../../../stores/slices/graphSlice';
import { darkGrey, hoverColor } from '../../../../util/colorHelper';
import { variableGraphOptions, variablesOptionsNG } from '../../../../util/convergenceVariablesOptions';
import { drugClassesRulesST } from '../../../../util/drugClassesRules';
import { drugAcronyms, drugAcronymsOpposite, getDrugClasses } from '../../../../util/drugs';
import { getAxisLabel } from '../../../../util/genotypes';
import { longestVisualWidth, truncateWord } from '../../../../util/helpers';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { organismsWithLotsGenotypes } from '../../../../util/organismsCards';
import { mixColorScale } from '../../Map/mapColorHelper';
import { SelectCountry } from '../../SelectCountry';
import { PlottingOptionsHeader } from '../../Shared/PlottingOptionsHeader';
import { useStyles } from './BubbleMarkersHeatmapGraphMUI';

export const BubbleMarkersHeatmapGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [xAxisSelected, setXAxisSelected] = useState([]);
  const [yAxisSelected, setYAxisSelected] = useState([]);
  const [genotypeSearch, setGenotypeSearch] = useState('');
  const [markerSearch, setMarkerSearch] = useState('');
  const [plotChart, setPlotChart] = useState(() => {});
  // keep track of full selection of 'Select genotypes' manually at the time of changing the County or Region
  const [savedSelection, setSavedSelection] = useState([]);
  const [reset20, setReset20] = useState(false);

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
  const loadingPDF = useAppSelector(state => state.dashboard.loadingPDF);
  const organismHasLotsOfGenotypes = useMemo(() => organismsWithLotsGenotypes.includes(organism), [organism]);
  const genotypesDrugClassesData = useAppSelector(state => state.graph.genotypesDrugClassesData);
  const ngMastDrugClassesData = useAppSelector(state => state.graph.ngMastDrugClassesData);
  const determinantsGraphDrugClass = useAppSelector(state => state.graph.determinantsGraphDrugClass);

  const selectedCRData = useMemo(() => {
    return (actualCountry !== 'All' ? mapData : mapRegionData).find(
      x => x.name === (actualCountry !== 'All' ? actualCountry : actualRegion),
    );
  }, [actualCountry, actualRegion, mapData, mapRegionData]);

  const drugClassesData = useMemo(() => {
    if (organism === 'ngono' && bubbleMarkersHeatmapGraphVariable === 'NG-MAST TYPE') {
      return ngMastDrugClassesData;
    }
    return genotypesDrugClassesData;
  }, [bubbleMarkersHeatmapGraphVariable, genotypesDrugClassesData, ngMastDrugClassesData, organism]);

  const statColumn = useMemo(() => {
    const foundOption = (organism === 'kpneumo' ? variableGraphOptions : variablesOptionsNG).find(
      x => x.value === bubbleMarkersHeatmapGraphVariable,
    );
    return foundOption?.mapValue || null;
  }, [bubbleMarkersHeatmapGraphVariable, organism]);

  // Fix for BubbleMarkersHeatmapGraph - replace the yAxisOptions useMemo

  const yAxisOptions = useMemo(() => {
    // Helper function for kpneumo - extract from drugs structure
    const extractFromKpneumoData = (data, markerType) => {
      const markerTotals = {};

      data.forEach(item => {
        const drugItems = item.drugs?.[markerType]?.items || [];
        drugItems.forEach(drugItem => {
          if (drugItem.name && drugItem.name !== '-') {
            markerTotals[drugItem.name] = (markerTotals[drugItem.name] || 0) + (drugItem.count || 0);
          }
        });
      });

      // Sort by total count descending
      // console.log(data, markerTotals);

      return Object.entries(markerTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => key);
    };

    // Helper function for styphi - use predefined rules
    const extractFromStyphiRules = markerType => {
      return drugClassesRulesST[markerType] || [];
    };

    // Helper function for other organisms - extract from genotypesDrugClassesData
    const extractFromGenotypesDrugClassesData = (data, markerType) => {
      if (!data[markerType] || !Array.isArray(data[markerType])) {
        return [];
      }

      const exclusions = ['name', 'totalCount', 'resistantCount', 'count', 'newTotalCount', 'Other'];
      const markerTotals = {};

      data[markerType].forEach(item => {
        Object.keys(item).forEach(key => {
          if (!exclusions.includes(key)) {
            const value = item[key] || 0;
            markerTotals[key] = (markerTotals[key] || 0) + value;
          }
        });
      });

      // Sort by total count descending
      return Object.entries(markerTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => key)
        .filter(x => x !== '-');
    };

    // Choose extraction method based on organism
    let items = [];

    if (['kpneumo'].includes(organism)) {
      const sourceData = selectedCRData?.stats?.[statColumn]?.items || [];
      items = extractFromKpneumoData(sourceData, bubbleMarkersYAxisType);
      // } else if (organism === 'styphi') {
      //   items = extractFromStyphiRules(bubbleMarkersYAxisType);
    } else {
      // All other organisms (ngono, shige, ecoli, decoli, sentrerica, etc.)
      items = extractFromGenotypesDrugClassesData(drugClassesData, bubbleMarkersYAxisType);
    }

    return items;
  }, [organism, selectedCRData?.stats, statColumn, bubbleMarkersYAxisType, drugClassesData]);

  const filteredYAxisOptions = useMemo(() => {
    let filteredOptions = yAxisOptions.filter(option => option?.includes(markerSearch.toLowerCase()));

    if (organism !== 'styphi')
      filteredOptions = yAxisOptions.filter(option => option?.toLowerCase().includes(markerSearch.toLowerCase()));
    return filteredOptions.slice(0, 20);
  }, [yAxisOptions, markerSearch]);

  const xAxisOptions = useMemo(() => {
    return statColumn ? (selectedCRData?.stats[statColumn]?.items?.map(x => x.name) ?? []) : [];
  }, [selectedCRData?.stats, statColumn]);

  const filteredXAxisOptions = useMemo(() => {
    const filteredOptions = xAxisOptions.filter(option => option.toLowerCase().includes(genotypeSearch.toLowerCase()));

    const topOptions = filteredOptions.slice(0, 20);

    // Only add items from savedSelection if they’re not already in topOptions and reset20 is false
    let result = topOptions;
    if (!reset20) {
      // Only include extraSaved if count > 0
      const extraSaved = savedSelection.filter(sel => {
        if (topOptions.includes(sel)) return false;
        // Find the item in selectedCRData?.stats[statColumn]?.items
        const item = selectedCRData?.stats?.[statColumn]?.items?.find(x => x.name === sel);
        return item && item.count > 0;
      });
      result = [...topOptions, ...extraSaved];
    }
    return result;
  }, [xAxisOptions, savedSelection, genotypeSearch, reset20, selectedCRData?.stats, statColumn]);

  // Reset reset20 to false after xAxisOptions change or after selection update
  useEffect(() => {
    if (reset20) setReset20(false);
  }, [xAxisOptions, reset20]);

  useEffect(() => {
    if (savedSelection?.length) {
      // Keep only common values between xAxisOptions & savedSelection
      const common = savedSelection.filter(val => xAxisOptions.includes(val));
      setXAxisSelected(common);
    }
  }, [xAxisOptions]);

  useEffect(() => {
    setSavedSelection(xAxisOptions?.slice(0, 10));
    setXAxisSelected(xAxisOptions?.slice(0, 10));
  }, [bubbleMarkersYAxisType]);

  useEffect(() => {
    setYAxisSelected(yAxisOptions?.slice(0, 10));
  }, [yAxisOptions]);

  const yAxisWidth = useMemo(() => {
    return longestVisualWidth(xAxisSelected ?? []);
  }, [xAxisSelected]);

  const getOptionLabel = useCallback(
    item => {
      const totalCount = statColumn
        ? (selectedCRData?.stats[statColumn]?.items?.find(x => x.name === item)?.count ?? 0)
        : 0;

      return `${item} (total N=${totalCount})`;
    },
    [selectedCRData?.stats, statColumn],
  );

  function handleChangeXAxisSelected({ event = null, all = false }) {
    setReset20(true);
    const value = event?.target.value;

    if (value?.length === 1 && value[0] === undefined) {
      return;
    }

    if (!all) {
      setSavedSelection(value);
      setXAxisSelected(value);
      return;
    }

    if (
      xAxisSelected.length === filteredXAxisOptions.length ||
      xAxisSelected.some(x => !xAxisSelected.slice(0, 20).includes(x))
    ) {
      //   if (savedSelection?.length) {
      //   // Keep only common values between xAxisOptions & savedSelection
      //   const common = savedSelection.filter((val) => xAxisOptions.includes(val));
      //   setXAxisSelected(common.slice(0, 10));
      // }
      setXAxisSelected([]);
      return;
    }
    setSavedSelection(filteredXAxisOptions);
    setXAxisSelected(filteredXAxisOptions);
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

    if (
      yAxisSelected.length === filteredYAxisOptions.length ||
      yAxisSelected.some(x => !yAxisOptions.slice(0, 20).includes(x))
    ) {
      setYAxisSelected([]);
      return;
    }

    setYAxisSelected(filteredYAxisOptions);
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
    if (!selectedCRData || yAxisSelected.length === 0 || !statColumn) {
      return [];
    }

    // For kpneumo, use the original drugs-based structure
    if (['kpneumo'].includes(organism)) {
      const itemsData = selectedCRData?.stats[statColumn]?.items || [];

      return xAxisSelected.map(xName => {
        // Try to find the matching item by name
        const item = itemsData.find(i => i.name === xName);

        const itemData = { name: xName, items: [] };

        // Safely access nested drug items, or default to empty array
        const drugs = item?.drugs?.[bubbleMarkersYAxisType]?.items || [];

        yAxisSelected.forEach(option => {
          const info = drugs.find(x => x.name === option) || { name: option, count: 0, percentage: 0 };

          itemData.items.push({
            itemName: info.name,
            percentage: info.percentage,
            count: info.count,
            index: 1,
            typeName: xName,
            total: info.count, // No item.totalCount exists here, so fallback to count
          });
        });

        return itemData;
      });
    }

    // For all other organisms (ngono, styphi, shige, ecoli, decoli, sentrerica, etc.)
    // use genotypesDrugClassesData similar to DeterminantsGraph
    if (drugClassesData[bubbleMarkersYAxisType]) {
      const data = drugClassesData[bubbleMarkersYAxisType] || [];

      return xAxisSelected.map(xName => {
        const item = data.find(d => d.name === xName);

        const itemData = { name: xName, items: [] };

        yAxisSelected.forEach(option => {
          let count = 0;
          let percentage = 0;
          let total = 0;

          if (item) {
            count = item[option] || 0;
            total = item.totalCount || 0;
            percentage = total ? Number(((count / total) * 100).toFixed(2)) : 0;
          }

          itemData.items.push({
            itemName: option,
            percentage,
            count,
            index: 1,
            typeName: xName,
            total,
          });
        });

        return itemData;
      });
    }

    return [];
  }, [bubbleMarkersYAxisType, selectedCRData, statColumn, xAxisSelected, yAxisSelected, organism, drugClassesData]);
  //console.log('savedSelection', savedSelection, xAxisSelected, filteredXAxisOptions);

  useEffect(() => {
    dispatch(setBubbleMarkersHeatmapGraphData(configuredMapData));
  }, [bubbleMarkersYAxisType, configuredMapData]);
  // console.log('configuredMapData', configuredMapData, bubbleMarkersYAxisType);

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
              <PlottingOptionsHeader onClose={() => setShowFilter(false)} className={classes.titleWrapper} />
              <div className={classes.selectsWrapper}>
                <SelectCountry />
                <div className={classes.selectPreWrapper}>
                  {organism === 'kpneumo' ? (
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
                  ) : null}
                  {organism === 'ngono' ? (
                    <div className={classes.selectWrapper}>
                      <div className={classes.labelWrapper}>
                        <Typography variant="caption">Select variable</Typography>
                      </div>
                      <Select
                        value={bubbleMarkersHeatmapGraphVariable}
                        onChange={handleChangeVariable}
                        inputProps={{ className: classes.selectInput }}
                        MenuProps={{ classes: { list: classes.selectMenu } }}
                        disabled={organism === 'none'}
                      >
                        {variablesOptionsNG.map((option, index) => {
                          return (
                            <MenuItem key={index + 'bubble-heatmap-variable'} value={option.value}>
                              {option.label}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </div>
                  ) : null}
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
                          color={
                            xAxisSelected.length === filteredXAxisOptions.length
                              ? // || xAxisSelected.some(x => !xAxisOptions.slice(0, 20).includes(x))
                                'error'
                              : 'primary'
                          }
                        >
                          {xAxisSelected.length === filteredXAxisOptions.length
                            ? // || xAxisSelected.some(x => !xAxisOptions.slice(0, 20).includes(x))
                              'Clear All'
                            : /* 'Select All' for Styphi*/
                              'Select 20'}
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
                          placeholder={'Search for more...'}
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
                      {getDrugClasses(organism).map((option, index) => (
                        <MenuItem key={`bubbler-markers-y-axis-type-${index}`} value={option}>
                          {drugAcronymsOpposite[drugAcronyms[option] ?? option] ?? option}
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
                          color={
                            yAxisSelected.length === filteredYAxisOptions.length ||
                            yAxisSelected.some(x => !yAxisOptions.slice(0, 20).includes(x))
                              ? 'error'
                              : 'primary'
                          }
                        >
                          {yAxisSelected.length === filteredYAxisOptions.length ||
                          yAxisSelected.some(x => !yAxisOptions.slice(0, 20).includes(x))
                            ? 'Clear All'
                            : 'Select 20'}
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
                          placeholder={'Search for more...'}
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
