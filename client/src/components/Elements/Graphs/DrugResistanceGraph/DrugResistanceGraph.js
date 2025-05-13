/* eslint-disable react-hooks/exhaustive-deps */
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
import { useStyles } from './DrugResistanceGraphMUI';
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
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setDrugResistanceGraphView, setStarttimeDRT,setEndtimeDRT} from '../../../../stores/slices/graphSlice';
import { drugsINTS, drugsKP, drugsNG, drugsST } from '../../../../util/drugs';
import { useEffect, useState } from 'react';
import { hoverColor } from '../../../../util/colorHelper';
import { getColorForDrug } from '../graphColorHelper';
import { Close, InfoOutlined } from '@mui/icons-material';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { setCaptureDRT } from '../../../../stores/slices/dashboardSlice';
import { SelectCountry } from '../../SelectCountry';
import { amrLikeOrganisms } from '../../../../util/organismsCards';

export const DrugResistanceGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [plotChart, setPlotChart] = useState(() => {});

  const dispatch = useAppDispatch();
  const drugResistanceGraphView = useAppSelector((state) => state.graph.drugResistanceGraphView);
  const drugsYearData = useAppSelector((state) => state.graph.drugsYearData);
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const timeInitial = useAppSelector((state) => state.dashboard.timeInitial);
  const timeFinal = useAppSelector((state) => state.dashboard.timeFinal);
  const organism = useAppSelector((state) => state.dashboard.organism);

  useEffect(() => {
    setCurrentTooltip(null);
  }, [drugsYearData]);

  useEffect(() => {
    if (drugsYearData.length <= 0) {
      dispatch(setCaptureDRT(false));
    } else {
      dispatch(setCaptureDRT(true));
    }
  }, [drugsYearData]);

  function getData() {
    const exclusions = ['name', 'count'];

    let drugDataPercentage = structuredClone(drugsYearData).filter(item => item.count >= 10);
    drugDataPercentage = drugDataPercentage.map((item) => {
      const keys = Object.keys(item).filter((x) => !exclusions.includes(x));

      keys.forEach((key) => {
        item[key] = Number(((item[key] / item.count) * 100).toFixed(2));
      });
      return item;
    });

    return drugDataPercentage;
  }

  function getDrugs() {
    if (organism === 'none') {
      return [];
    }
    if (organism === 'styphi') {
      return drugsST;
    }
    if (organism === 'kpneumo') {
      return drugsKP;
    }
    if (organism === 'ngono') {
      return drugsNG;
    }
    if (amrLikeOrganisms.includes(organism)) {
      return drugsINTS;
    }
  }
  function getDrugsForLegends() {
    if (organism === 'none') {
      return [];
    }
    // if (organism === 'typhi') {
    return drugResistanceGraphView;
    // }
    // return drugsKP;
  }

  //TODO: check the comment above code duplicate

  // function getDrugsForLegends() {
  //   if (organism === 'none') {
  //     return [];
  //   }
  //   // if (organism === 'typhi') {
  //     return drugResistanceGraphView;
  //   // }
  //   // return drugsKP;
  // }

  function getXDRDefinition() {
    switch (organism) {
      case 'styphi':
        return 'XDR, extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)';
      case 'ngono':
        return 'XDR, extensively drug resistant (resistant to two of Azithromycin, Ceftriaxone, Cefixime [category I drugs], AND resistant to Penicillin, Ciprofloxacin and Spectinomycin [category II drugs])';
      default:
        return;
    }
  }
  function getMDRDefinition() {
    switch (organism) {
      case 'styphi':
        return 'MDR, multi-drug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)';
      case 'ngono':
        return 'MDR, multidrug resistant (resistant to one of Azithromycin, Ceftriaxone, Cefixime [category I drugs], plus two or more of Penicillin, Ciprofloxacin, Spectinomycin [category II drugs])';
      default:
        return;
    }
  }
  function getSusceptibleDefinition() {
    switch (organism) {
      case 'ngono':
        return 'Pansusceptible’ (sensitive to Azithromycin, Ceftriaxone, Ciprofloxacin, Cefixime, Penicillin, Spectinomycin)';
      default:
        return;
    }
  }
  function handleChangeDrugsView({ event = null, all = false }) {
    setCurrentTooltip(null);
    let newValues = [];
    const drugs = getDrugs();

    if (all) {
      if (drugResistanceGraphView.length === drugs.length) {
        newValues = [];
      } else {
        newValues = drugs.slice();
      }
    } else {
      const {
        target: { value },
      } = event;
      newValues = value;
    }
    newValues.sort((a, b) => a.localeCompare(b));
    dispatch(setDrugResistanceGraphView(newValues));
  }

  function handleClickChart(event) {
    const data = drugsYearData.find((item) => item.name === event?.activeLabel);

    if (data && drugResistanceGraphView.length > 0) {
      const currentData = structuredClone(data);

      const value = {
        name: currentData.name,
        count: currentData.count,
        drugs: [],
      };

      delete currentData.name;
      delete currentData.count;

      Object.keys(currentData).forEach((key) => {
        if (!drugResistanceGraphView.includes(key)) {
          return;
        }

        const count = currentData[key];
        // if (count === 0) {
        //   return;
        // }

        value.drugs.push({
          label: key,
          count,
          percentage: Number(((count / value.count) * 100).toFixed(2)),
          fill: event.activePayload.find((x) => x.name === key).stroke,
        });
        value.drugs.sort((a, b) => b.count - a.count);
      });

      setCurrentTooltip(value);
    }
  }
console.log('drugsYearData', drugsYearData[0]);
  useEffect(() => {
    if (drugsYearData.length > 0) {
      // Dispatch initial values based on the default range (full range)
      const startValue = drugsYearData[0]?.name; // First value in the data
      const endValue = drugsYearData[drugsYearData.length - 1]?.name; // Last value in the data
      dispatch(setStarttimeDRT(startValue));
      dispatch(setEndtimeDRT(endValue));
    }
  }, [drugsYearData, dispatch]);

  useEffect(() => {
    if (canGetData) {
      const doc = document.getElementById('DRT');
      const lines = doc.getElementsByClassName('recharts-line');

      for (let index = 0; index < lines.length; index++) {
        const drug = drugResistanceGraphView[index];
        const hasValue = getDrugs()?.includes(drug);
        lines[index].style.display = hasValue ? 'block' : 'none';
      }

      setPlotChart(() => {
        return (
          <ResponsiveContainer width="100%">
            <LineChart data={getData()} cursor={isTouchDevice() ? 'default' : 'pointer'} onClick={handleClickChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                tickCount={20}
                allowDecimals={false}
                padding={{ left: 20, right: 20 }}
                dataKey="name"
                domain={drugsYearData.length > 0 ? ['dataMin', 'dataMax'] : undefined}
                interval={'preserveStartEnd'}
                tick={{ fontSize: 14 }}
              />
              <YAxis tickCount={6} padding={{ top: 20, bottom: 20 }} allowDecimals={false}>
                <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                  Resistant (%)
                </Label>
              </YAxis>
              {drugsYearData.length > 0 && <Brush dataKey="name" height={20} stroke={'rgb(31, 187, 211)'} onChange={(brushRange) => {
                dispatch(setStarttimeDRT((drugsYearData[brushRange.startIndex]?.name)));
                dispatch(setEndtimeDRT((drugsYearData[brushRange.endIndex]?.name))); // if using state genotypesYearData[start]?.name
              }} />}

              {organism !== 'none' && (
                <Legend
                  content={(props) => {
                    const { payload } = props;
                    return (
                      <div className={classes.legendWrapper}>
                        {payload.map((entry, index) => {
                          if (!drugsYearData.length) return null;
                          const { dataKey, color } = entry;
                          let dataKeyElement;
                          if (dataKey === 'XDR') {
                            dataKeyElement = (
                              <Tooltip title={getXDRDefinition()} placement="top">
                                <span>XDR</span>
                              </Tooltip>
                            );
                          } else if (dataKey === 'MDR') {
                            dataKeyElement = (
                              <Tooltip title={getMDRDefinition()} placement="top">
                                <span>MDR</span>
                              </Tooltip>
                            );
                          } else if (dataKey === 'Pansusceptible') {
                            dataKeyElement = (
                              <Tooltip title={getSusceptibleDefinition()} placement="top">
                                <span>Pansusceptible</span>
                              </Tooltip>
                            );
                          } else {
                            dataKeyElement = dataKey;
                          }
                          return (
                            <div key={`drug-resistance-legend-${index}`} className={classes.legendItemWrapper}>
                              <Box className={classes.colorCircle} style={{ backgroundColor: color }} />
                              <Typography variant="caption">{dataKeyElement}</Typography>
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

              {getDrugsForLegends().map((option, index) => (
                <Line
                  key={`drug-resistance-bar-${index}`}
                  dataKey={option}
                  strokeWidth={2}
                  stroke={getColorForDrug(option)}
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
  }, [drugsYearData, drugResistanceGraphView]);

  return (
    <CardContent className={classes.drugResistanceGraph}>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="DRT">
          {plotChart}
        </div>
        <div className={classes.tooltipWrapper}>
          {currentTooltip ? (
            <div className={classes.tooltip}>
              <div className={classes.tooltipTitle}>
                <Typography variant="h5" fontWeight="600">
                  {currentTooltip.name}
                </Typography>
                <Typography variant="subtitle1">{'N = ' + currentTooltip.count}</Typography>
              </div>
              <div className={classes.tooltipContent}>
                {currentTooltip.drugs.map((item, index) => {
                  let itemLabel;
                  if (item.label === 'XDR') {
                    itemLabel = (
                      <Tooltip title={getXDRDefinition()} placement="top">
                        <span>XDR</span>
                      </Tooltip>
                    );
                  } else if (item.label === 'MDR') {
                    itemLabel = (
                      <Tooltip title={getMDRDefinition()} placement="top">
                        <span>MDR</span>
                      </Tooltip>
                    );
                  } else if (item.label === 'Pansusceptible') {
                    itemLabel = (
                      <Tooltip title={getSusceptibleDefinition()} placement="top">
                        <span>Pansusceptible</span>
                      </Tooltip>
                    );
                  } else {
                    itemLabel = item.label;
                  }
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
            </div>
          ) : (
            <div className={classes.noYearSelected}>
              {drugResistanceGraphView.length === 0 ? 'No drug selected' : 'No year selected'}{' '}
            </div>
          )}
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
              <SelectCountry />
              <div className={classes.selectWrapper}>
                <div className={classes.labelWrapper}>
                  <Typography variant="caption">Select drugs/classes to display</Typography>
                  <Tooltip
                    title="The resistance frequencies are only shown for years with N≥10 genomes. When the data is insufficent per year to calculate annual frequencies, there are no data points to show."
                    placement="top"
                  >
                    <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                  </Tooltip>
                </div>
                <Select
                  multiple
                  value={drugResistanceGraphView}
                  onChange={(event) => handleChangeDrugsView({ event })}
                  displayEmpty
                  disabled={organism === 'none'}
                  endAdornment={
                    <Button
                      variant="outlined"
                      className={classes.selectButton}
                      onClick={() => handleChangeDrugsView({ all: true })}
                      disabled={organism === 'none'}
                      color={drugResistanceGraphView.length === getDrugs()?.length ? 'error' : 'primary'}
                    >
                      {drugResistanceGraphView.length === getDrugs()?.length ? 'Clear All' : 'Select All'}
                    </Button>
                  }
                  inputProps={{ className: classes.selectInput }}
                  MenuProps={{
                    classes: { paper: classes.menuPaper, list: classes.selectMenu },
                  }}
                  renderValue={(selected) => <div>{`${selected.length} of ${getDrugs()?.length} selected`}</div>}
                >
                  {getDrugs()?.map((drug, index) => (
                    <MenuItem key={`drug-resistance-option-${index}`} value={drug}>
                      <Checkbox checked={drugResistanceGraphView.indexOf(drug) > -1} />
                      <ListItemText primary={drug} />
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>
        </Box>
      )}
    </CardContent>
  );
};
