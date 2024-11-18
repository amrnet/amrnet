import { Box, Button, CardContent, Checkbox, Divider, ListItemText, MenuItem, Select, Typography } from '@mui/material';
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
} from 'recharts';
import { useAppSelector } from '../../../../stores/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { darkGrey, hoverColor } from '../../../../util/colorHelper';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { drugClassesRulesKP, statKeys } from '../../../../util/drugClassesRules';
import { drugAcronyms } from '../../../../util/drugs';
import { redColorScale2 } from '../../Map/mapColorHelper';
import { longestVisualWidth } from '../../../../util/helpers';

const kpYOptions = Object.keys(drugClassesRulesKP).map((drug) => {
  return {
    value: `kp-trends-${drug.toLowerCase()}`,
    label: `${drug} resistant determinant trends`,
  };
});

export const BubbleGeographicGraph = () => {
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
  const genotypesDrugsData = useAppSelector((state) => state.graph.genotypesDrugsData);
  const uniqueCountryKPDrugs = useAppSelector((state) => state.graph.uniqueCountryKPDrugs);
  const uniqueRegionKPDrugs = useAppSelector((state) => state.graph.uniqueRegionKPDrugs);
  const drugsRegionsKPData = useAppSelector((state) => state.graph.drugsRegionsKPData);
  const drugsCountriesKPData = useAppSelector((state) => state.graph.drugsCountriesKPData);

  const resistanceOptions = useMemo(() => {
    const options = statKeys[organism] ? statKeys[organism] : statKeys['others'];
    return options
      .filter((option) => option.heatmapView)
      .map((option) => option.name)
      .sort();
  }, [organism]);

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
        return genotypesDrugsData.map((data) => data.name).slice(0, 30);
      case 'kp-trends-carba':
        return xAxisType === 'country'
          ? uniqueCountryKPDrugs['Carbapenems'].slice(0, 30)
          : uniqueRegionKPDrugs['Carbapenems'].slice(0, 30);
      case 'kp-trends-esbl':
        return xAxisType === 'country'
          ? uniqueCountryKPDrugs['ESBL'].slice(0, 30)
          : uniqueRegionKPDrugs['ESBL'].slice(0, 30);
      default:
        return [];
    }
  }, [genotypesDrugsData, resistanceOptions, uniqueCountryKPDrugs, uniqueRegionKPDrugs, xAxisType, yAxisType]);

  useEffect(() => {
    setXAxisSelected(
      (xAxisType === 'country' ? mapData : mapRegionData)
        .slice()
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((item) => item.name),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xAxisType]);

  useEffect(() => {
    setYAxisSelected(yAxisOptions.slice(0, 8));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yAxisType]);

  const yAxisWidth = useMemo(() => {
    return longestVisualWidth((xAxisSelected ?? []).map((x) => (x === 'United States of America' ? 'USA' : x)));
  }, [xAxisSelected]);

  const getOptionLabel = useCallback(
    (item) => {
      if (yAxisType !== 'genotype') {
        return item;
      }

      const matchingItem = genotypesDrugsData.find((g) => g.name === item);

      const totalCount = matchingItem?.totalCount ?? 0;
      const susceptiblePercentage = (matchingItem?.Susceptible / totalCount || 0) * 100;

      if (['decoli', 'shige', 'sentericaints'].includes(organism)) {
        return `${item} (total N=${totalCount})`;
      }

      return `${item} (total N=${totalCount}, ${susceptiblePercentage.toFixed(2)}% Susceptible)`;
    },
    [genotypesDrugsData, organism, yAxisType],
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

  const configuredMapData = useMemo(() => {
    return (xAxisType === 'country' ? mapData : mapRegionData)
      .filter((item) => xAxisSelected.includes(item.name))
      .map((item) => {
        const data = { name: item.name === 'United States of America' ? 'USA' : item.name, items: [] };

        if (yAxisType === 'resistance') {
          Object.entries(item.stats).forEach(([key, value]) => {
            if (resistanceOptions.includes(key) && yAxisSelected.includes(key)) {
              data.items.push({
                itemName: drugAcronyms[key],
                percentage: value.percentage,
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
          const locationListData = xAxisType === 'country' ? drugsCountriesKPData : drugsRegionsKPData;
          const locationDrugData =
            yAxisType === 'kp-trends-carba' ? locationListData['Carbapenems'] : locationListData['ESBL'];
          const locationData = locationDrugData.find((x) => x.name === item.name);

          yAxisSelected.forEach((drug) => {
            const drugCount = locationData ? locationData[drug] : 0;

            data.items.push({
              itemName: drug.replace(' + ', '/'),
              percentage: drugCount ? Number(((drugCount / locationData.totalCount) * 100).toFixed(2)) : 0,
              index: 1,
              typeName: item.name,
            });
          });
        }

        return data;
      });
  }, [
    drugsCountriesKPData,
    drugsRegionsKPData,
    mapData,
    mapRegionData,
    resistanceOptions,
    xAxisSelected,
    xAxisType,
    yAxisSelected,
    yAxisType,
  ]);

  useEffect(() => {
    if (canGetData) {
      setPlotChart(() => {
        return (
          <>
            {configuredMapData.map((item, index) => {
              return (
                <ResponsiveContainer key={`bubble-graph-${index}`} width="100%" height={index === 0 ? 80 : 60}>
                  <ScatterChart
                    cursor={isTouchDevice() ? 'default' : 'pointer'}
                    margin={{ bottom: index === 0 ? -20 : 0 }}
                  >
                    <XAxis
                      type="category"
                      dataKey="itemName"
                      interval={0}
                      tick={index === 0 ? { fontSize: '14px' } : false}
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

                    <ZAxis type="number" dataKey="percentage" range={[600, 600]} />

                    <ChartTooltip
                      cursor={{ fill: hoverColor }}
                      wrapperStyle={{ zIndex: 100 }}
                      content={({ payload, active }) => {
                        if (payload !== null && active) {
                          return (
                            <div className={classes.chartTooltipLabel}>
                              <Typography variant="body1" fontWeight="500">
                                {payload[0]?.payload.typeName}
                              </Typography>
                              <Typography variant="body2">
                                {payload[0]?.payload.itemName}: {payload[0]?.payload.percentage}%
                              </Typography>
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
                          fill={option.percentage === 0 ? darkGrey : redColorScale2(option.percentage)}
                        />
                      ))}
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
              <MenuItem value="region">Economic regions</MenuItem>
            </Select>
          </div>
          <div className={classes.selectWrapper}>
            <Typography variant="caption">Select countries/regions</Typography>
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
            </Select>
          </div>
          <div className={classes.selectWrapper}>
            <Typography variant="caption">Select drugs/genotypes (top 30) (up to 8)</Typography>
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
      <Divider className={classes.divider} />
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="CVM">
          {plotChart}
        </div>
      </div>
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
    </CardContent>
  );
};
