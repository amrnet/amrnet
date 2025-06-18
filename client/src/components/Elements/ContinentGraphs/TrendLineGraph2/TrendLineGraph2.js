import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  IconButton,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import { useStyles } from './TrendLineGraphMUI';
import {
  Brush,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  LineChart,
  Line,
  Label,
} from 'recharts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../../../../stores/hooks';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { hoverColor, lightGrey } from '../../../../util/colorHelper';
import { Close, InfoOutlined } from '@mui/icons-material';
import { drugAcronyms, getDrugClasses } from '../../../../util/drugs';

export const TrendLineGraph2 = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [plotChart, setPlotChart] = useState(() => {});
  const [geoType, setGeoType] = useState('country');
  const [geoSelected, setGeoSelected] = useState([]);

  const countriesYearData = useAppSelector((state) => state.graph.countriesYearData);
  const regionsYearData = useAppSelector((state) => state.graph.regionsYearData);
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const timeInitial = useAppSelector((state) => state.dashboard.timeInitial);
  const timeFinal = useAppSelector((state) => state.dashboard.timeFinal);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const countriesForFilter = useAppSelector((state) => state.graph.countriesForFilter);
  const economicRegions = useAppSelector((state) => state.dashboard.economicRegions);
  const mapData = useAppSelector((state) => state.map.mapData);
  const mapRegionData = useAppSelector((state) => state.map.mapRegionData);
  const genotypesAndDrugsYearData = useAppSelector(
    (state) => state.graph.genotypesAndDrugsYearData,
  );
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);

  const [drugClass, setDrugClass] = useState(getDrugClasses(organism)?.[0] || '');
  const [drugGene, setDrugGene] = useState('');

  const currentData = useMemo(() => {
    if (geoType === 'country') {
      return countriesYearData?.[drugClass] || [];
    }
    return regionsYearData?.[drugClass] || [];
  }, [geoType, regionsYearData, drugClass, countriesYearData]);

  const linesWithZero = useMemo(() => {
    return (geoType === 'country' ? countriesForFilter : Object.keys(economicRegions)).filter(
      (key) => currentData?.some((item) => item[key] && item[key] !== 0),
    );
  }, [countriesForFilter, currentData, economicRegions, geoType]);

  useEffect(() => {
    setCurrentTooltip(null);
  }, [currentData]);

  const geneOptions = useMemo(() => {
    switch (organism) {
      case 'styphi':
      case 'ngono':
        return Object.keys(Object.values(currentData?.[0]?.['items'] || {})?.[0] || []).filter(
          (key) => !['totalCount', 'resistantCount', 'None'].includes(key),
        );

      case 'kpneumo':
        const genes = [];
        genotypesAndDrugsYearData[drugClass]?.forEach((year) => {
          Object.keys(year).forEach((key) => {
            if (
              ['name', 'totalCount', 'resistantCount', 'None'].includes(key) ||
              genotypesForFilter.includes(key)
            ) {
              return;
            }

            if (!genes.includes(key)) {
              genes.push(key);
            }
          });
        });
        return genes.sort();
      default:
        return [];
    }
  }, [currentData, drugClass, genotypesAndDrugsYearData, organism]);

  useEffect(() => {
    if (geneOptions.length > 0) {
      setDrugGene(geneOptions[0]);
    }
  }, [geneOptions]);

  const geoOptions = useMemo(() => {
    switch (geoType) {
      case 'country':
        return countriesForFilter.filter((x) => linesWithZero.includes(x));
      case 'region':
        return Object.keys(economicRegions)
          .filter((x) => linesWithZero.includes(x))
          .sort();
      default:
        return [];
    }
  }, [countriesForFilter, economicRegions, geoType, linesWithZero]);

  useEffect(() => {
    setGeoSelected(
      (geoType === 'country' ? mapData : mapRegionData)
        .slice()
        .sort((a, b) => b.count - a.count)
        .filter((item) => geoOptions.includes(item.name))
        .slice(0, 10)
        .map((item) => item.name),
    );
  }, [mapData, mapRegionData, geoType, geoOptions]);

  const getColor = useCallback(
    (item) => {
      return (
        (geoType === 'country' ? mapData : mapRegionData)?.find((x) => x?.name === item)?.color ||
        lightGrey
      );
    },
    [geoType, mapData, mapRegionData],
  );

  function handleChangeGeoType(event) {
    setCurrentTooltip(null);
    setGeoType(event.target.value);
  }

  function handleChangeGeoSelected({ event = null, all = false }) {
    setCurrentTooltip(null);
    if (!all) {
      const newValue = event.target.value;
      setGeoSelected(newValue);
      return;
    }

    if (geoSelected.length === geoOptions.length) {
      setGeoSelected([]);
      return;
    }

    setGeoSelected(geoOptions.slice());
  }

  function handleChangeDrugClass(event) {
    setCurrentTooltip(null);
    setDrugClass(event.target.value);
  }

  function handleChangeDrugGene(event) {
    setCurrentTooltip(null);
    setDrugGene(event.target.value);
  }

  const geneData = useMemo(() => {
    return currentData.map((item) => {
      const currentItem = { ...item };
      const keys = Object.keys(currentItem).filter(
        (key) => !['items', 'name', 'resistantCount', 'totalCount'].includes(key),
      );
      keys.forEach((key) => {
        currentItem[key] = currentItem.items[key][drugGene] || 0;
      });
      return currentItem;
    });
  }, [currentData, drugGene]);

  function handleClickChart(event) {
    const data = geneData?.find((item) => item.name === event?.activeLabel);
    if (data && geoSelected.length > 0) {
      const actualData = structuredClone(data);

      const value = {
        name: actualData.name,
        count: actualData.totalCount,
        geo: [],
      };
      delete actualData.name;
      delete actualData.count;

      Object.keys(actualData).forEach((key) => {
        if (!geoSelected.includes(key)) {
          return;
        }

        const count = actualData[key];

        if (!count || count === 0) {
          return;
        }

        value.geo.push({
          label: key,
          count,
          percentage: Number(((count / value.count) * 100).toFixed(2)),
          fill: event.activePayload.find((x) => x.name === key).stroke,
        });
        value.geo.sort((a, b) => b.count - a.count);
      });

      setCurrentTooltip(value);
    }
  }

  useEffect(() => {
    if (canGetData) {
      const doc = document.getElementById('TL');
      const lines = doc.getElementsByClassName('recharts-line');

      for (let index = 0; index < lines.length; index++) {
        const geo = geoOptions[index];
        const hasValue = geoSelected.includes(geo);
        lines[index].style.display = hasValue ? 'block' : 'none';
      }

      setPlotChart(() => {
        return (
          <ResponsiveContainer width="100%">
            <LineChart
              data={geneData}
              cursor={isTouchDevice() ? 'default' : 'pointer'}
              onClick={handleClickChart}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                tickCount={20}
                allowDecimals={false}
                padding={{ left: 20, right: 20 }}
                dataKey="name"
                interval={'preserveStartEnd'}
                tick={{ fontSize: 14 }}
              />
              <YAxis
                tickCount={6}
                padding={{ top: 20, bottom: 20 }}
                allowDecimals={false}
                domain={[
                  (dataMin) => dataMin,
                  (dataMax) => {
                    const multiple = dataMax < 100 ? 25 : 50;
                    return Math.ceil(dataMax / multiple) * multiple;
                  },
                ]}
              >
                <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                  {`Number of genomes (${drugAcronyms[drugClass] ?? drugClass})`}
                </Label>
              </YAxis>
              {currentData?.length > 0 && (
                <Brush dataKey="name" height={20} stroke={'rgb(31, 187, 211)'} />
              )}

              {organism !== 'none' && (
                <Legend
                  content={(props) => {
                    const { payload } = props;
                    return (
                      <div className={classes.legendWrapper}>
                        {payload.map((entry, index) => {
                          const { dataKey, color } = entry;

                          if (!currentData?.length || !geoSelected.includes(dataKey)) return null;

                          return (
                            <div
                              key={`geo-trend-line-legend-${index}`}
                              className={classes.legendItemWrapper}
                            >
                              <Box
                                className={classes.colorCircle}
                                style={{ backgroundColor: color }}
                              />
                              <Typography variant="caption">{dataKey}</Typography>
                            </div>
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

              {geoOptions.map((option, index) => (
                <Line
                  key={`geo-trend-line-${index}`}
                  dataKey={option}
                  strokeWidth={2}
                  stroke={getColor(option)}
                  connectNulls
                  type="monotone"
                  activeDot={timeInitial === timeFinal ? true : false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geneData, geoSelected]);

  return (
    <CardContent className={classes.trendLineGraph}>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="TL2">
          {plotChart}
        </div>
        <div className={classes.tooltipWrapper}>
          {currentTooltip ? (
            <div className={classes.tooltip}>
              <div className={classes.tooltipTitle}>
                <div className={classes.tooltipInfo}>
                  <Typography variant="h5" fontWeight="600">
                    {currentTooltip.name}
                  </Typography>
                  <Typography variant="subtitle1">{'N = ' + currentTooltip.count}</Typography>
                </div>
                <Typography fontWeight={400} variant="subtitle2">
                  {drugClass}
                </Typography>
                <Typography variant="subtitle2">{drugGene}</Typography>
              </div>
              {currentTooltip?.geo.length > 0 ? (
                <div className={classes.tooltipContent}>
                  {currentTooltip?.geo.map((item, index) => {
                    const itemLabel = item.label;

                    return (
                      <div key={`tooltip-content-${index}`} className={classes.tooltipItemWrapper}>
                        <Box
                          className={classes.tooltipItemBox}
                          style={{
                            backgroundColor: item.fill,
                          }}
                        />
                        <div className={classes.tooltipItemStats}>
                          <Typography variant="body2" fontWeight="500">
                            {itemLabel}
                          </Typography>
                          <Typography variant="caption" noWrap>{`N = ${item.count}`}</Typography>
                          <Typography fontSize="10px">{`${item.percentage}%`}</Typography>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Typography className={classes.noData}>No data to show</Typography>
              )}
            </div>
          ) : (
            <div className={classes.noYearSelected}>No year selected</div>
          )}
        </div>
      </div>
      {showFilter && (
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
                    <Typography variant="caption">Select drug/class</Typography>
                    <Select
                      value={drugClass}
                      onChange={handleChangeDrugClass}
                      inputProps={{ className: classes.selectInput }}
                      MenuProps={{ classes: { list: classes.selectMenu } }}
                      disabled={organism === 'none'}
                    >
                      {getDrugClasses(organism).map((option, index) => {
                        return (
                          <MenuItem key={index + 'trend-line-drug-classes'} value={option}>
                            {option}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </div>
                  <div className={classes.selectWrapper}>
                    <Typography variant="caption">Select gene</Typography>
                    <Select
                      value={drugGene}
                      onChange={handleChangeDrugGene}
                      inputProps={{ className: classes.selectInput }}
                      MenuProps={{ classes: { list: classes.selectMenu } }}
                      disabled={organism === 'none'}
                    >
                      {geneOptions.map((option, index) => {
                        return (
                          <MenuItem key={index + 'trend-line-genes'} value={option}>
                            {option}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </div>
                  <div className={classes.selectWrapper}>
                    <Typography variant="caption">View Type</Typography>
                    <Select
                      value={geoType}
                      onChange={handleChangeGeoType}
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
                      <Typography variant="caption">Select countries/regions to display</Typography>
                      <Tooltip
                        title="Navigate by typing the first letter of the country/region. The data is only shown for years with N≥10 genomes. When the data is insufficent per year to calculate annual info, there are no data points to show."
                        placement="top"
                      >
                        <InfoOutlined
                          color="action"
                          fontSize="small"
                          className={classes.labelTooltipIcon}
                        />
                      </Tooltip>
                    </div>
                    <Select
                      multiple
                      value={geoSelected}
                      onChange={(event) => handleChangeGeoSelected({ event })}
                      displayEmpty
                      disabled={organism === 'none'}
                      endAdornment={
                        <Button
                          variant="outlined"
                          className={classes.selectButton}
                          onClick={() => handleChangeGeoSelected({ all: true })}
                          disabled={organism === 'none'}
                          color={geoSelected.length === geoOptions.length ? 'error' : 'primary'}
                        >
                          {geoSelected.length === geoOptions.length ? 'Clear All' : 'Select All'}
                        </Button>
                      }
                      inputProps={{ className: classes.multipleSelectInput }}
                      MenuProps={{
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      renderValue={(selected) => (
                        <div>{`${selected.length} of ${geoOptions.length} selected`}</div>
                      )}
                    >
                      {geoOptions.map((option, index) => (
                        <MenuItem key={`geo-x-axis-option-${index}`} value={option}>
                          <Checkbox checked={geoSelected.indexOf(option) > -1} />
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
