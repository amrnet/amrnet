import { InfoOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  FormGroup,
  Switch,
  Slider,
  FormControlLabel,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  Brush,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Label,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setCaptureDRT } from '../../../../stores/slices/dashboardSlice';
import { setDrugResistanceGraphView, setEndtimeDRT, setStarttimeDRT } from '../../../../stores/slices/graphSlice';
import { hoverColor } from '../../../../util/colorHelper';
import {
  ciproAcronyms,
  drugAcronymsOpposite,
  drugsECOLI,
  drugsKP,
  defaultDrugsForDrugResistanceGraphNG,
  drugsNG,
  drugsST,
  drugsSA,
  drugsSP,
} from '../../../../util/drugs';
import { getRange } from '../../../../util/helpers';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { SelectCountry } from '../../SelectCountry';
import { PlottingOptionsHeader } from '../../Shared/PlottingOptionsHeader';
import { getColorForDrug } from '../graphColorHelper';
import { useStyles } from './DrugResistanceGraphMUI';
import { SliderSizes } from '../../Slider';
import { useTranslation } from 'react-i18next';

/**
 * DrugResistanceGraph - Interactive line chart for visualizing drug resistance trends
 *
 * This component displays temporal trends of antimicrobial resistance across multiple drugs
 * for a selected organism. Features include:
 * - Multi-drug selection with dropdown interface
 * - Interactive line chart with hover tooltips
 * - Brush selection for temporal filtering
 * - Auto-selection for paginated organisms
 * - Drug-specific color coding
 *
 * @component
 * @param {Object} props - Component properties
 * @param {boolean} props.showFilter - Whether to show the filter interface
 * @param {Function} props.setShowFilter - Function to toggle filter visibility
 * @example
 * return (
 *   <DrugResistanceGraph
 *     showFilter={true}
 *     setShowFilter={setShowFilter}
 *   />
 * )
 */
export const DrugResistanceGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [allYears, setAllYears] = useState([]);
  const [lineStyle, setLineStyle] = useState('');
  const [logScale, setLogScale] = useState(false);
  const [yAxisSliderValue, setYAxisSliderValue] = useState([0, 100]);
  // Brush state
  const [brushStartIndex, setBrushStartIndex] = useState(0);
  const [brushEndIndex, setBrushEndIndex] = useState(0);

  const getLineStyleForDrug = drugName => {
    const lineStyles = ['Normal', 'Thick'];

    const drugIndex = getDrugsForLegends().indexOf(drugName);
    return drugIndex !== -1 ? lineStyles[drugIndex % lineStyles.length] : lineStyles[0];
  };

  const dispatch = useAppDispatch();
  const drugResistanceGraphView = useAppSelector(state => state.graph.drugResistanceGraphView);
  const drugsYearData = useAppSelector(state => state.graph.drugsYearData);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const timeInitial = useAppSelector(state => state.dashboard.timeInitial);
  const timeFinal = useAppSelector(state => state.dashboard.timeFinal);
  const organism = useAppSelector(state => state.dashboard.organism);
  const canFilterData = useAppSelector(state => state.dashboard.canFilterData);
  const colourPattern = useAppSelector(state => state.dashboard.colourPattern);

  useEffect(() => {
    setCurrentTooltip(null);
    if (drugsYearData.length <= 0) {
      dispatch(setCaptureDRT(false));
    } else {
      dispatch(setCaptureDRT(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drugsYearData, organism]);

  const trendsData = useMemo(() => {
    const exclusions = ['name', 'count'];
    const drugsDataPercentages = Array.isArray(drugsYearData) ? JSON.parse(JSON.stringify(drugsYearData)) : null;

    if (!Array.isArray(drugsDataPercentages)) {
      // Defensive: avoid crashing if store contains an unexpected shape
      // Log the value so we can debug why it's not an array for certain organisms
      // and return an empty array to keep the UI stable.
      // eslint-disable-next-line no-console
      console.warn('[DrugResistanceGraph] expected drugsYearData to be an array, got:', drugsYearData);
      return [];
    }

    return drugsDataPercentages.map(item => {
      const name = typeof item.name === 'number' ? item.name.toString() : item.name;

      // N≥10 rule: drop drug values for years with insufficient genomes so
      // nothing plots at that x-position. We keep the name (and count) so the
      // year still appears on the axis and the click handler can show
      // "Insufficient data" in the tooltip.
      if ((item.count ?? 0) < 10) {
        return { name, count: item.count ?? 0 };
      }

      const keys = Object.keys(item).filter(x => !exclusions.includes(x));
      keys.forEach(key => {
        item[key] = Number(((item[key] / item.count) * 100).toFixed(2));
      });

      item.name = name;
      return item;
    });
  }, [drugsYearData]);

  function getDrugs() {
    if (organism === 'none') {
      return [];
    }
    let drugs = [];
    if (organism === 'styphi') {
      drugs = drugsST;
    } else if (organism === 'kpneumo') {
      drugs = drugsKP;
    } else if (organism === 'ngono') {
      drugs = defaultDrugsForDrugResistanceGraphNG;
    } else if (['senterica', 'sentericaints', 'ecoli', 'decoli', 'shige'].includes(organism)) {
      drugs = drugsECOLI;
    } else if (organism === 'saureus') {
      drugs = drugsSA;
    } else if (organism === 'strepneumo') {
      drugs = drugsSP;
    }

    // if (drugsYearData.length > 0) {
    //   drugs = drugs.filter(drug => drugsYearData.some(yearData => yearData[drug] > 0));
    // }

    return drugs;
  }

  function getDrugsForLegends() {
    if (organism === 'none') {
      return [];
    }

    // Union keys across ALL year entries — some years (e.g. with count=0) may
    // be missing drug keys in the filters.js output, so only looking at
    // drugsYearData[0] loses drugs like Tigecycline whose first year of data
    // sits later in the series.
    const allKeys = new Set();
    drugsYearData.forEach(y => {
      Object.keys(y || {}).forEach(k => {
        if (k !== 'name' && k !== 'count') allKeys.add(k);
      });
    });
    const drugsWithData = [...allKeys].filter(drug =>
      drugsYearData.some(y => (y?.[drug] ?? 0) > 0),
    );

    return drugResistanceGraphView.filter(drug => drugsWithData.includes(drug));
  }

  // function getDrugsForLegends() {
  //   if (organism === 'none') {
  //     return [];
  //   }
  //   // if (organism === 'typhi') {
  //     return drugResistanceGraphView;
  //   // }
  //   // return drugsKP;
  // }

  function handleSwitchScale(event) {
    setCurrentTooltip(null);
    setLogScale(event.target.checked);
  }

  function handleSliderChangeDataView(event) {
      setYAxisSliderValue(event.target.value);
  }

  function getXDRDefinition() {
    switch (organism) {
      case 'styphi':
        return 'XDR, extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)';
      case 'ngono':
        return 'XDR, extensively drug resistant (resistant to two of Azithromycin, Ceftriaxone, Cefixime [category I drugs], AND resistant to Benzylpenicillin, Ciprofloxacin and Spectinomycin [category II drugs])';
      default:
        return 'XDR definition not available for this organism';
    }
  }

  function getMDRDefinition() {
    switch (organism) {
      case 'styphi':
        return 'MDR, multidrug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)';
      case 'ngono':
        return 'MDR, multidrug resistant (resistant to one of Azithromycin, Ceftriaxone, Cefixime [category I drugs], plus two or more of Benzylpenicillin, Ciprofloxacin, Spectinomycin [category II drugs])';
      default:
        return 'MDR definition not available for this organism';
    }
  }

  function getSusceptibleDefinition() {
    switch (organism) {
      case 'ngono':
        return 'Susceptible to cat I/II drugs (sensitive to Azithromycin, Ceftriaxone, Ciprofloxacin, Cefixime, Benzylpenicillin, Spectinomycin)';
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
    newValues.sort((a, b) => getDrugs().indexOf(a) - getDrugs().indexOf(b));
    dispatch(setDrugResistanceGraphView(newValues));
  }

 function getDomain() {
   // percentage view -> zoomable 0–100

   return [yAxisSliderValue[0], yAxisSliderValue[1]];
 }

  function handleClickChart(event) {
    const year = event?.activeLabel;
    const data = Array.isArray(drugsYearData)
      ? drugsYearData.find(item => item?.name?.toString() === year?.toString())
      : undefined;

    if (data && data.count >= 10 && drugResistanceGraphView.length > 0) {
      const currentData = JSON.parse(JSON.stringify(data));

      const value = {
        name: currentData.name,
        count: currentData.count,
        drugs: [],
      };

      delete currentData.name;
      delete currentData.count;

      Object.keys(currentData).forEach(key => {
        if (!drugResistanceGraphView.includes(key)) {
          return;
        }

        const count = currentData[key];

        if (count === 0) {
          return;
        }

        value.drugs.push({
          label: ciproAcronyms[key] || key,
          count,
          percentage: Number(((count / value.count) * 100).toFixed(2)),
          fill: event.activePayload.find(x => x.name === key).stroke,
        });
        value.drugs.sort((a, b) => b.count - a.count);
      });

      setCurrentTooltip(value);
    } else if (year === undefined) {
      setCurrentTooltip(null);
    } else {
      setCurrentTooltip({
        name: year,
        count: 'ID',
        drugs: [],
      });
    }
  }

  useEffect(() => {
    if (drugsYearData.length > 0) {
      // Dispatch initial values based on the default range (full range)
      const startValue = drugsYearData[0]?.name; // First value in the data
      const endValue = drugsYearData[drugsYearData.length - 1]?.name; // Last value in the data
      dispatch(setStarttimeDRT('2000'));
      dispatch(setEndtimeDRT(endValue));
    }
  }, [drugsYearData, dispatch]);

  // Effect to ensure all drugs are selected by default for paginated organisms
  useEffect(() => {
    // Handle auto-selection for paginated organisms (kpneumo, ecoli, decoli, senterica, sentericaints)
    if (['kpneumo', 'ecoli', 'decoli', 'senterica', 'sentericaints'].includes(organism) && drugsYearData.length > 0) {
      // Union keys across all years, not just the first — the first year may
      // have count=0 and therefore no drug keys, which used to drop low-prevalence
      // drugs like Tigecycline from the auto-selection.
      const dataKeys = new Set();
      drugsYearData.forEach(y => {
        Object.keys(y || {}).forEach(k => {
          if (k !== 'name' && k !== 'count') dataKeys.add(k);
        });
      });
      const availableDrugs = getDrugs().filter(drug => dataKeys.has(drug));

      // Auto-select all available drugs that have data
      if (
        availableDrugs.length > 0 &&
        (drugResistanceGraphView.length === 0 ||
          availableDrugs.length !== drugResistanceGraphView.length ||
          !availableDrugs.every(drug => drugResistanceGraphView.includes(drug)))
      ) {
        dispatch(setDrugResistanceGraphView(availableDrugs));
      }
    }
  }, [organism, drugsYearData]); // fixed the bug for kpneumo, ecoli and decoli, AMR trend drugs were showing all the drugs selected and not allowing to deselect and select to users.
  useEffect(() => {
    if (canGetData) {
      const doc = document.getElementById('DRT');
      if (doc) {
        const lines = doc.getElementsByClassName('recharts-line');
        for (let index = 0; index < lines.length; index++) {
          const drug = drugResistanceGraphView[index];
          const hasValue = getDrugs()?.includes(drug);
          lines[index].style.display = hasValue ? 'block' : 'none';
        }
      }

      const data = trendsData.slice();
      let computedAllYears = [];

      if (data.length > 0) {
        computedAllYears = getRange(Number(data[0].name), Number(data[data.length - 1].name))?.map(String);
        const years = data.map(x => x.name);
        computedAllYears.forEach(year => {
          if (!years.includes(year)) {
            data.push({ name: year });
          }
        });
        data.sort((a, b) => a.name.toString().localeCompare(b.name).toString());
      }

      setChartData(data);
      setAllYears(computedAllYears);

      // Initialize brush indices if allYears changes
      if (computedAllYears.length > 0) {
        const initialStart = computedAllYears.findIndex(x => x === '2000');
        setBrushStartIndex(initialStart !== -1 ? initialStart : 0);
        setBrushEndIndex(computedAllYears.length - 1);
      }
    } else {
      setChartData([]);
      setAllYears([]);
      setBrushStartIndex(0);
      setBrushEndIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drugsYearData, drugResistanceGraphView, colourPattern, lineStyle, canGetData]);
  return (
    <CardContent className={classes.drugResistanceGraph}>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="DRT">
          {canGetData ? (
            <ResponsiveContainer width="100%">
              <LineChart
                data={chartData}
                cursor={isTouchDevice() ? 'default' : 'pointer'}
                onClick={handleClickChart}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.8} />
                <XAxis
                  tickCount={20}
                  allowDecimals={false}
                  padding={{ left: 20, right: 20 }}
                  dataKey="name"
                  domain={drugsYearData.length > 0 ? ['dataMin', 'dataMax'] : undefined}
                  interval={'preserveStartEnd'}
                  tick={{ fontSize: 14 }}
                />
                <YAxis
                  domain={[yAxisSliderValue[0], yAxisSliderValue[1]]}
                  tickCount={6}
                  padding={{ top: 20, bottom: 20 }}
                  allowDecimals={false}
                  allowDataOverflow={true}
                >
                  <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                    Resistant (%)
                  </Label>
                </YAxis>
                {drugsYearData.length > 0 && (
                  <Brush
                    dataKey="name"
                    height={20}
                    stroke={'rgb(31, 187, 211)'}
                    startIndex={brushStartIndex}
                    endIndex={brushEndIndex}
                    onChange={brushRange => {
                      // Ignore synthetic onChange fired on chart clicks (Recharts bug):
                      // a real drag always spans ≥1 index and changes at least one side.
                      if (
                        brushRange == null ||
                        brushRange.startIndex === brushRange.endIndex ||
                        (brushRange.startIndex === brushStartIndex && brushRange.endIndex === brushEndIndex)
                      ) {
                        return;
                      }
                      // Use allYears (continuous range) so indices match what the Brush sees,
                      // not drugsYearData (which may skip empty years).
                      const startYear = allYears[brushRange.startIndex];
                      const endYear = allYears[brushRange.endIndex];
                      if (!startYear || !endYear) return;
                      setCurrentTooltip(null);
                      setBrushStartIndex(brushRange.startIndex);
                      setBrushEndIndex(brushRange.endIndex);
                      dispatch(setStarttimeDRT(startYear));
                      dispatch(setEndtimeDRT(endYear));
                    }}
                  />
                )}
                {organism !== 'none' && (
                  <Legend
                    content={props => {
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
                                  <span>{t('drugs.XDR', drugAcronymsOpposite['XDR'])}</span>
                                </Tooltip>
                              );
                            } else if (dataKey === 'MDR') {
                              dataKeyElement = (
                                <Tooltip title={getMDRDefinition()} placement="top">
                                  <span>{t('drugs.MDR', drugAcronymsOpposite['MDR'])}</span>
                                </Tooltip>
                              );
                            } else if (dataKey === 'Susceptible to cat I/II drugs' && organism === 'ngono') {
                              dataKeyElement = (
                                <Tooltip title={getSusceptibleDefinition()} placement="top">
                                  <span>{t('drugs.Susceptible to cat I/II drugs')}</span>
                                </Tooltip>
                              );
                            } else if (dataKey === 'Pansusceptible') {
                              dataKeyElement = t('drugs.Pansusceptible');
                            } else {
                              dataKeyElement = t(`drugs.${dataKey}`, ciproAcronyms[dataKey] || dataKey);
                            }
                            return (
                              <div key={`drug-resistance-legend-${index}`} className={classes.legendItemWrapper}>
                                {!colourPattern ? (
                                  <Box className={classes.colorCircle} style={{ backgroundColor: color }} />
                                ) : (
                                  <svg width={16} height={16}>
                                    <circle
                                      cx="8"
                                      cy="8"
                                      r="2"
                                      fill="none"
                                      stroke={color}
                                      strokeWidth={index % 2 == 0 ? 5 : 7}
                                    />
                                  </svg>
                                )}
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
                {getDrugsForLegends().map((option, index) => {
                  const color = getColorForDrug(option, colourPattern);
                  const drugLineStyle = getLineStyleForDrug(option);
                  return (
                    <Line
                      key={`drug-resistance-bar-${index}`}
                      dataKey={option}
                      stroke={color}
                      strokeWidth={!colourPattern ? 2 : index % 2 == 0 ? 2 : 3}
                      strokeDasharray={!colourPattern ? 'solid' : drugLineStyle}
                      connectNulls
                      type="monotone"
                      activeDot={timeInitial === timeFinal}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%">
              <LineChart data={[]} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.8} />
                <XAxis tickCount={20} allowDecimals={false} padding={{ left: 20, right: 20 }} tick={{ fontSize: 14 }} />
                <YAxis tickCount={0} padding={{ top: 20, bottom: 20 }} allowDecimals={false} domain={[0, 1000]}>
                  <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                    Resistant (%)
                  </Label>
                </YAxis>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className={classes.rightSide}>
          {/* <SliderSizes value={'KP_GE'} style={{ width: '100%' }} /> */}
            <FormGroup className={classes.formGroup}>
              <FormControlLabel
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                 {t('common.changeYAxisScale')} <Typography variant="caption">
                  </Typography>
                  <Tooltip title={t('common.dataZoomTooltip')} placement="top">
                    <InfoOutlined color="action" fontSize="small" />
                  </Tooltip>
                </Box>
              }
                control={<Switch checked={logScale} onChange={handleSwitchScale} />}
              />
            </FormGroup>
            {logScale ? (
              <>
                <Typography variant="caption">{t('common.adjustYRange')}</Typography>
                <Slider
                  value={yAxisSliderValue}
                  onChange={handleSliderChangeDataView}
                  step={1}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                />
              </>
            ) : null}
          <div className={classes.tooltipWrapper}>
            {currentTooltip ? (
              <div className={classes.tooltip}>
                <div className={classes.tooltipTitle}>
                  <Typography variant="h5" fontWeight="600">
                    {currentTooltip.name}
                  </Typography>
                  {currentTooltip.count !== 'ID' && (
                    <Typography variant="subtitle1">{'N = ' + currentTooltip.count}</Typography>
                  )}
                </div>
                {currentTooltip.count === 'ID' ? (
                  <div className={classes.insufficientData}>Insufficient data</div>
                ) : (
                  <div className={classes.tooltipContent}>
                    {currentTooltip.drugs.map((item, index) => {
                      const drugKey =
                        Object.keys(ciproAcronyms).find(key => ciproAcronyms[key] === item.label) || item.label;

                      const color = getColorForDrug(drugKey, colourPattern);
                      const lineStyle = getLineStyleForDrug(drugKey);

                      return (
                        <div key={`tooltip-content-${index}`} className={classes.tooltipItemWrapper}>
                          {colourPattern && lineStyle !== 'Normal' ? (
                            <div
                              className={classes.tooltipItemBox}
                              style={{
                                backgroundColor: color,
                              }}
                            />
                          ) : (
                            <div
                              className={classes.tooltipItemBoxSmall}
                              style={{
                                backgroundColor: color,
                              }}
                            />
                          )}
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
                )}
              </div>
            ) : (
              <div className={classes.noYearSelected}>
                {drugResistanceGraphView.length === 0 ? 'No drug selected' : 'No year selected'}{' '}
              </div>
            )}
          </div>
        </div>
      </div>
      {showFilter && !canFilterData && (
        <Box className={classes.floatingFilter}>
          <Card elevation={3}>
            <CardContent>
              <PlottingOptionsHeader onClose={() => setShowFilter(false)} className={classes.titleWrapper} />
              <SelectCountry />
              <div className={classes.selectWrapper}>
                <div className={classes.labelWrapper}>
                  <Typography variant="caption">{t('common.selectDrugsClasses')}</Typography>
                  <Tooltip
                    title={t('common.selectDrugsClassesTooltip')}
                    placement="top"
                  >
                    <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                  </Tooltip>
                </div>
                <Select
                  multiple
                  value={drugResistanceGraphView}
                  onChange={event => handleChangeDrugsView({ event })}
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
                  renderValue={selected => <div>{`${selected.length} of ${getDrugs()?.length} selected`}</div>}
                >
                  {getDrugs()?.map((drug, index) => (
                    <MenuItem key={`drug-resistance-option-${index}`} value={drug}>
                      <Checkbox checked={drugResistanceGraphView.indexOf(drug) > -1} />
                      <ListItemText primary={drugAcronymsOpposite[drug] || ciproAcronyms[drug] || drug} />
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