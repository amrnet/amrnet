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
import { useStyles } from './BubbleGeographicGraphMUI';
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
import { drugClassesRulesKP, drugClassesRulesST, statKeys } from '../../../../util/drugClassesRules';
import { drugAcronyms, drugAcronymsOpposite } from '../../../../util/drugs';
import { differentColorScale } from '../../Map/mapColorHelper';
import { longestVisualWidth, truncateWord } from '../../../../util/helpers';
import { Close, InfoOutlined } from '@mui/icons-material';

const kpYOptions = Object.keys(drugClassesRulesKP).map((drug) => {
  return {
    organism: 'kpneumo',
    key: drug,
    value: `kp-trends-${drug.toLowerCase()}`,
    label: `${drug} resistant determinant trends`,
  };
});

const stYOptions = Object.keys(drugClassesRulesST).map((drug) => {
  return {
    organism: 'styphi',
    key: drug,
    value: `st-trends-${drug.toLowerCase()}`,
    label: `${drug} resistant determinant trends`,
  };
});

const allYOptions = kpYOptions.concat(stYOptions);

export const BubbleGeographicGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [xAxisType, setXAxisType] = useState('country');
  const [yAxisType, setYAxisType] = useState('resistance');
  const [xAxisSelected, setXAxisSelected] = useState([]);
  const [yAxisSelected, setYAxisSelected] = useState([]);
  const [plotChart, setPlotChart] = useState(() => {});

  const organism = useAppSelector((state) => state.dashboard.organism);
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const mapData = useAppSelector((state) => state.map.mapData);
  const mapRegionData = useAppSelector((state) => state.map.mapRegionData);
  const countriesForFilter = useAppSelector((state) => state.graph.countriesForFilter);
  const economicRegions = useAppSelector((state) => state.dashboard.economicRegions);
  const drugsRegionsData = useAppSelector((state) => state.graph.drugsRegionsData);
  const drugsCountriesData = useAppSelector((state) => state.graph.drugsCountriesData);

  useEffect(() => {
    setXAxisType('country');
    setYAxisType('resistance');
  }, [organism]);

  const drugsData = useMemo(() => {
    return xAxisType === 'country' ? drugsCountriesData : drugsRegionsData;
  }, [drugsCountriesData, drugsRegionsData, xAxisType]);

  const resistanceOptions = useMemo(() => {
    const options = statKeys[organism] ? statKeys[organism] : statKeys['others'];
    const resistance = options
      .filter((option) => option.resistanceView)
      .map((option) => option.name)
      .sort();

    const drugs = {};

    (xAxisType === 'country' ? mapData : mapRegionData)
      .filter((item) => xAxisSelected.includes(item.name))
      .forEach((item) => {
        const stats = item.stats;
        if (!stats) return;

        resistance.forEach((drug) => {
          if (!(drug in drugs)) {
            drugs[drug] = stats[drug]?.count ?? 0;
            return;
          }

          drugs[drug] += stats[drug]?.count ?? 0;
        });
      });

    return (
      Object.entries(drugs)
        .filter((x) => x[1] > 0)
        .sort((a, b) => b[1] - a[1])
        .map((x) => x[0]) ?? []
    );
  }, [mapData, mapRegionData, organism, xAxisSelected, xAxisType]);

  const markersOptions = useMemo(() => {
    const drugKey = allYOptions?.find((x) => x.value === yAxisType)?.key;

    const data = drugsData?.[drugKey];
    const filteredData = data?.filter((x) => xAxisSelected.includes(x.name)) ?? [];
    const drugs = {};

    filteredData.forEach((obj) => {
      Object.keys(obj).forEach((key) => {
        if (['None', 'name', 'resistantCount', 'totalCount'].includes(key)) {
          return;
        }

        if (!(key in drugs)) {
          drugs[key] = obj[key];
          return;
        }

        drugs[key] += obj[key];
      });
    });

    return (
      Object.entries(drugs)
        .filter((x) => x[1] > 0)
        .sort((a, b) => b[1] - a[1])
        .map((x) => x[0]) ?? []
    );
  }, [drugsData, xAxisSelected, yAxisType]);

  const genotypesEntries = useMemo(() => {
    const filteredData = (xAxisType === 'country' ? mapData : mapRegionData).filter((x) =>
      xAxisSelected.includes(x.name),
    );
    const genotypes = {};

    filteredData.forEach((obj) => {
      obj.stats.GENOTYPE.items.forEach((item) => {
        if (!(item.name in genotypes)) {
          genotypes[item.name] = item.count;
          return;
        }

        genotypes[item.name] += item.count;
      });
    });

    return genotypes;
  }, [mapData, mapRegionData, xAxisSelected, xAxisType]);

  const xAxisOptions = useMemo(() => {
    switch (xAxisType) {
      case 'country':
        return countriesForFilter;
      case 'region':
        return Object.keys(economicRegions).sort();
      default:
        return [];
    }
  }, [countriesForFilter, economicRegions, xAxisType]);

  const yAxisOptions = useMemo(() => {
    switch (yAxisType) {
      case 'resistance':
        return resistanceOptions;
      case 'genotype':
        return (
          Object.entries(genotypesEntries)
            .sort((a, b) => b[1] - a[1])
            .map((x) => x[0]) ?? []
        );
      default:
        return markersOptions ?? [];
    }
  }, [genotypesEntries, markersOptions, resistanceOptions, yAxisType]);

  useEffect(() => {
    setXAxisSelected(
      (xAxisType === 'country' ? mapData : mapRegionData)
        .slice()
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((item) => item.name),
    );
  }, [mapData, mapRegionData, xAxisType]);

  useEffect(() => {
    setYAxisSelected(yAxisOptions.slice(0, 8));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yAxisOptions]);

  const yAxisWidth = useMemo(() => {
    return longestVisualWidth((xAxisSelected ?? []).map((x) => (x === 'United States of America' ? 'USA' : x)));
  }, [xAxisSelected]);

  const getOptionLabel = useCallback(
    (item) => {
      if (yAxisType !== 'genotype') {
        if (['MDR', 'XDR'].includes(item)) {
          return item;
        }
        return drugAcronymsOpposite[drugAcronyms[item] ?? item] ?? item;
      }

      return `${item} (total N=${genotypesEntries[item]})`;
    },
    [genotypesEntries, yAxisType],
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

    if (xAxisSelected.length === xAxisOptions.length) {
      setXAxisSelected([]);
      return;
    }

    setXAxisSelected(xAxisOptions.slice());
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

  const countriesTooltipForRegion = useCallback(
    (region, stat) => {
      if (xAxisType === 'country') {
        return null;
      }

      const countries = economicRegions[region];
      const drug = Object.keys(drugAcronyms).find((key) => drugAcronyms[key] === stat) ?? stat;
      const regionCount = mapRegionData.find((x) => x.name === region).count;
      const countriesData = mapData.filter((x) => countries.includes(x.name) && x.stats?.[drug]?.count > 0);

      return (
        <div>
          <br />
          {countriesData.map((country, index) => {
            const drugCount = country.stats[drug].count;
            const percentage = Number(((drugCount / regionCount) * 100).toFixed(2));

            return (
              <Typography fontSize="12px" key={`country-tooltip-${index}`}>
                <Typography component="span" fontWeight={500} fontSize="12px" display="inline">
                  {country.name}
                </Typography>
                {`: ${drugCount} (${percentage}%)`}
              </Typography>
            );
          })}
        </div>
      );
    },
    [economicRegions, mapData, mapRegionData, xAxisType],
  );

  const configuredMapData = useMemo(() => {
    if (yAxisSelected.length === 0) {
      return [];
    }

    return (xAxisType === 'country' ? mapData : mapRegionData)
      .filter((item) => xAxisSelected.includes(item.name))
      .map((item) => {
        const data = { name: item.name === 'United States of America' ? 'USA' : item.name, items: [] };

        if (yAxisType === 'resistance') {
          Object.entries(item.stats).forEach(([key, value]) => {
            if (resistanceOptions.includes(key) && yAxisSelected.includes(key)) {
              data.items.push({
                itemName: drugAcronyms[key] ?? key,
                percentage: value.percentage,
                count: value.count,
                index: 1,
                typeName: item.name,
              });
            }
          });
        }

        if (yAxisType === 'genotype') {
          yAxisSelected.forEach((genotype) => {
            const gen = item.stats.GENOTYPE.items.find((g) => g.name === genotype);

            data.items.push({
              itemName: genotype,
              percentage: gen ? Number(((gen.count / item.count) * 100).toFixed(2)) : 0,
              index: 1,
              typeName: item.name,
            });
          });
        }

        if (yAxisType.includes('trends')) {
          const drugKey = allYOptions?.find((x) => x.value === yAxisType)?.key;
          const locationDrugData = drugsData?.[drugKey];
          const locationData = locationDrugData?.find((x) => x.name === item.name);

          yAxisSelected.forEach((drug) => {
            const drugCount = locationData ? locationData[drug] : 0;

            data.items.push({
              itemName: drug.replaceAll(' + ', '/'),
              percentage: drugCount ? Number(((drugCount / locationData.totalCount) * 100).toFixed(2)) : 0,
              index: 1,
              typeName: item.name,
            });
          });
        }

        return data;
      });
  }, [drugsData, mapData, mapRegionData, resistanceOptions, xAxisSelected, xAxisType, yAxisSelected, yAxisType]);

  useEffect(() => {
    if (canGetData) {
      setPlotChart(() => {
        return (
          <>
            {configuredMapData.map((item, index) => {
              return (
                <ResponsiveContainer
                  className={classes.graphContainer}
                  key={`bubble-graph-${index}`}
                  width="100%"
                  height={index === 0 ? 90 : 70}
                >
                  <ScatterChart
                    cursor={isTouchDevice() ? 'default' : 'pointer'}
                    margin={{ bottom: index === 0 ? -20 : 0 }}
                    rad
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
                                    {truncateWord(props.payload.value)}
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

                    <ZAxis type="number" dataKey="percentage" range={[1200, 1200]} />

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
                              {countriesTooltipForRegion(payload[1]?.payload.typeName, payload[0]?.payload.itemName)}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    <Scatter data={item.items}>
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
                              x={x + 20}
                              y={y + 23}
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
  }, [configuredMapData, yAxisWidth]);

  return (
    <CardContent className={classes.bubbleGeographicGraph}>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="CVM">
          {plotChart}
        </div>
      </div>
      {(configuredMapData.length === 0 || yAxisSelected.length === 0) && (
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
                      <MenuItem value="country">Countries</MenuItem>
                      <MenuItem value="region">Regions</MenuItem>
                    </Select>
                  </div>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">Select countries/regions</Typography>
                      <Tooltip title="Navigate by typing the first letter of the country/region." placement="top">
                        <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                      </Tooltip>
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
                          color={xAxisSelected.length === xAxisOptions.length ? 'error' : 'primary'}
                        >
                          {xAxisSelected.length === xAxisOptions.length ? 'Clear All' : 'Select All'}
                        </Button>
                      }
                      inputProps={{ className: classes.multipleSelectInput }}
                      MenuProps={{
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      renderValue={(selected) => <div>{`${selected.length} of ${xAxisOptions.length} selected`}</div>}
                    >
                      {xAxisOptions.map((option, index) => (
                        <MenuItem key={`geo-x-axis-option-${index}`} value={option}>
                          <Checkbox checked={xAxisSelected.indexOf(option) > -1} />
                          <ListItemText primary={option} />
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
                      <MenuItem value="genotype">Genotype prevalence</MenuItem>
                      {organism === 'kpneumo' &&
                        kpYOptions.map((option, index) => (
                          <MenuItem key={`y-kp-option-${index}`} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      {organism === 'styphi' &&
                        stYOptions.map((option, index) => (
                          <MenuItem key={`y-st-option-${index}`} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                    </Select>
                  </div>
                  <div className={classes.selectWrapper}>
                    <Typography variant="caption">Select drugs/genotypes (up to 8)</Typography>
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
                          disabled={organism === 'none' || yAxisSelected.length === 0}
                          color="error"
                        >
                          Clear All
                        </Button>
                      }
                      inputProps={{ className: classes.multipleSelectInput }}
                      MenuProps={{
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      renderValue={(selected) => <div>{`${selected.length} of ${yAxisOptions.length} selected`}</div>}
                    >
                      {yAxisOptions.map((option, index) => (
                        <MenuItem key={`geo-y-axis-option-${index}`} value={option}>
                          <Checkbox checked={yAxisSelected.indexOf(option) > -1} />
                          <ListItemText primary={getOptionLabel(option)} />
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
