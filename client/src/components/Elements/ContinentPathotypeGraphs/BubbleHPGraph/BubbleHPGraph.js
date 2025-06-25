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
import { useStyles } from './BubbleHPGraphMUI';
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
import { statKeys } from '../../../../util/drugClassesRules';
import { drugAcronyms, drugAcronymsOpposite } from '../../../../util/drugs';
import { differentColorScale, mixColorScale } from '../../Map/mapColorHelper';
import { longestVisualWidth } from '../../../../util/helpers';
import { Clear, Close, InfoOutlined } from '@mui/icons-material';

export const BubbleHPGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [xAxisSelected, setXAxisSelected] = useState([]);
  const [yAxisSelected, setYAxisSelected] = useState([]);
  const [regionSelected, setRegionSelected] = useState('All');
  const [countrySelected, setCountrySelected] = useState('All');
  const [genotypeSearch, setGenotypeSearch] = useState('');
  const [plotChart, setPlotChart] = useState(() => {});

  const organism = useAppSelector((state) => state.dashboard.organism);
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const mapData = useAppSelector((state) => state.map.mapDataNoPathotype);
  const mapRegionData = useAppSelector((state) => state.map.mapRegionDataNoPathotype);
  const canFilterData = useAppSelector((state) => state.dashboard.canFilterData);
  const economicRegions = useAppSelector((state) => state.dashboard.economicRegions);
  const countriesForFilter = useAppSelector((state) => state.graph.countriesForFilter);

  const selectLabel = useMemo(
    () => (organism === 'sentericaints' ? 'serotypes' : 'pathotypes'),
    [organism],
  );

  const selectedCRData = useMemo(() => {
    return (countrySelected !== 'All' ? mapData : mapRegionData).find(
      (x) => x.name === (countrySelected !== 'All' ? countrySelected : regionSelected),
    );
  }, [countrySelected, mapData, mapRegionData, regionSelected]);

  const resistanceOptions = useMemo(() => {
    const options = statKeys[organism] ? statKeys[organism] : statKeys['others'];
    const resistance = options
      .filter((option) => option.resistanceView)
      .map((option) => option.name);
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
        .map((x) => x[0]) ?? []
    );
  }, [organism, selectedCRData?.stats]);

  const xAxisOptions = useMemo(() => {
    return selectedCRData?.stats.PATHOTYPE?.items?.map((x) => x.name) ?? [];
  }, [selectedCRData]);

  const filteredXAxisOptions = useMemo(() => {
    const filteredOptions = xAxisOptions.filter((option) =>
      option.toLowerCase().includes(genotypeSearch.toLowerCase()),
    );

    return filteredOptions;
  }, [xAxisOptions, genotypeSearch]);

  const yAxisOptions = useMemo(() => {
    return resistanceOptions;
  }, [resistanceOptions]);

  const filteredRegions = useMemo(() => {
    return mapRegionData
      .filter((x) => x.count >= 20 && x.name !== 'All')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [mapRegionData]);

  const filteredCountries = useMemo(() => {
    const countries =
      regionSelected === 'All' ? countriesForFilter : economicRegions[regionSelected];

    return mapData
      .filter((x) => countries.includes(x.name))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [countriesForFilter, economicRegions, mapData, regionSelected]);

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
    (item) => {
      const totalCount =
        selectedCRData?.stats.PATHOTYPE?.items.find((x) => x.name === item)?.count ?? 0;

      return `${item} (total N=${totalCount})`;
    },
    [selectedCRData],
  );

  const getOptionLabelY = useCallback((item) => {
    return drugAcronymsOpposite[drugAcronyms[item] ?? item] ?? item;
  }, []);

  function handleChangeXAxisSelected({ event = null, all = false }) {
    const value = event?.target.value;

    if (value?.length === 1 && value[0] === undefined) {
      return;
    }

    if (!all) {
      setXAxisSelected(value);
      return;
    }

    if (xAxisOptions?.length === xAxisSelected?.length) {
      setXAxisSelected([]);
      return;
    }

    setXAxisSelected(xAxisOptions?.slice());
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

  function handleChangeRegion(event) {
    setCountrySelected('All');
    setRegionSelected(event.target.value);
  }

  function handleChangeCountry(event) {
    const country = event.target.value;

    if (!(regionSelected !== 'All' && country === 'All')) {
      const region =
        Object.keys(economicRegions).find((key) => economicRegions[key].includes(country)) ?? 'All';
      setRegionSelected(region);
    }

    setCountrySelected(country);
  }

  const getTitle = useCallback((value) => {
    return (
      drugAcronymsOpposite[value] ??
      Object.keys(drugAcronyms).find((key) => drugAcronyms[key] === value) ??
      value
    );
  }, []);

  const configuredMapData = useMemo(() => {
    if (!selectedCRData || yAxisSelected.length === 0) {
      return [];
    }

    return selectedCRData?.stats.PATHOTYPE?.items
      ?.filter((item) => xAxisSelected?.includes(item.name))
      .map((item) => {
        const itemData = { name: item.name, items: [] };

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

        const moveToStart = (name) => {
          const i = itemData.items.findIndex((x) => x.itemName === name);
          if (i >= 0) itemData.items.unshift(...itemData.items.splice(i, 1));
        };

        const moveToEnd = (name) => {
          const i = itemData.items.findIndex((x) => x.itemName === name);
          if (i >= 0) itemData.items.push(...itemData.items.splice(i, 1));
        };

        if (['styphi', 'sentericaints'].includes(organism)) {
          ['CRO', 'CipR', 'CipNS'].forEach(moveToStart);
        }

        ['MDR', 'XDR', 'PAN', 'SUS'].forEach(moveToEnd);

        return itemData;
      });
  }, [organism, selectedCRData, xAxisSelected, yAxisSelected]);

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
                          ? (props) => {
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
                                marginTop:
                                  index + 1 === configuredMapData.length
                                    ? -40
                                    : index === 0
                                    ? 40
                                    : 0,
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
                          fill={
                            option.percentage === 0
                              ? darkGrey
                              : mixColorScale(option.percentage)
                          }
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
        <div className={classes.graph} id="BHP">
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
                <div className={classes.selectPreWrapper}>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">Select region</Typography>
                      <Tooltip title="Only show regions with N≥20 genomes." placement="top">
                        <InfoOutlined
                          color="action"
                          fontSize="small"
                          className={classes.labelTooltipIcon}
                        />
                      </Tooltip>
                    </div>
                    <Select
                      value={regionSelected}
                      onChange={handleChangeRegion}
                      inputProps={{ className: classes.selectInput }}
                      MenuProps={{
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      disabled={organism === 'none'}
                      renderValue={(selected) => {
                        if (selected === 'All') {
                          return 'All regions';
                        }
                        return selected;
                      }}
                    >
                      <MenuItem value="All">All regions</MenuItem>
                      {filteredRegions.map((region, index) => {
                        return (
                          <MenuItem key={index + 'mapview'} value={region.name}>
                            {region.name} (total N={region.count})
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </div>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">Select country</Typography>
                    </div>
                    <Select
                      value={countrySelected}
                      onChange={handleChangeCountry}
                      inputProps={{ className: classes.selectInput }}
                      MenuProps={{
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      disabled={organism === 'none'}
                      renderValue={(selected) => {
                        if (selected === 'All') {
                          return regionSelected !== 'All'
                            ? 'All countries in region'
                            : 'All countries';
                        }
                        return selected;
                      }}
                    >
                      <MenuItem value="All">
                        {regionSelected !== 'All' ? 'All countries in region' : 'All countries'}
                      </MenuItem>
                      {filteredCountries.map((country, index) => {
                        return (
                          <MenuItem key={index + 'mapview'} value={country.name}>
                            {country.name} (total N={country.count})
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </div>
                </div>
                <div className={classes.selectPreWrapper}>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">Select {selectLabel}</Typography>
                    </div>
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
                          color={
                            xAxisSelected?.length === xAxisOptions?.length ? 'error' : 'primary'
                          }
                        >
                          {xAxisSelected?.length === xAxisOptions?.length
                            ? 'Clear All'
                            : 'Select All'}
                        </Button>
                      }
                      inputProps={{ className: classes.multipleSelectInput }}
                      MenuProps={{
                        disableAutoFocusItem: true,
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      renderValue={(selected) => (
                        <div>{`${selected?.length} of ${xAxisOptions?.length} selected`}</div>
                      )}
                    >
                      <Box
                        className={classes.selectSearch}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <TextField
                          variant="standard"
                          placeholder="Search..."
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
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">Select drugs/genes</Typography>
                    </div>
                    <Select
                      multiple
                      value={yAxisSelected}
                      onChange={(event) => handleChangeYAxisSelected({ event })}
                      displayEmpty
                      disabled={organism === 'none'}
                      endAdornment={
                        <Button
                          variant="outlined"
                          className={classes.selectButton}
                          onClick={() => handleChangeYAxisSelected({ all: true })}
                          disabled={organism === 'none'}
                          color={
                            yAxisSelected?.length === yAxisOptions?.length ? 'error' : 'primary'
                          }
                        >
                          {yAxisSelected?.length === yAxisOptions?.length
                            ? 'Clear All'
                            : 'Select All'}
                        </Button>
                      }
                      inputProps={{ className: classes.multipleSelectInput }}
                      MenuProps={{
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      renderValue={(selected) => (
                        <div>{`${selected?.length} of ${yAxisOptions.length} selected`}</div>
                      )}
                    >
                      {yAxisOptions.sort().map((option, index) => (
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
