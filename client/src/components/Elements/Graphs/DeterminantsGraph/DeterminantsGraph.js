/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Card, CardContent, IconButton, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { useStyles } from './DeterminantsGraphMUI';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Brush,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import {
  setDeterminantsGraphDrugClass,
  setDeterminantsGraphView,
  setResetBool,
  setSliderList,
  setMaxSliderValueRD,
} from '../../../../stores/slices/graphSlice';
import { getDrugClasses } from '../../../../util/drugs';
import { useEffect, useState } from 'react';
import {
  colorForDrugClassesKP,
  colorForDrugClassesST,
  colorForDrugClassesNG,
  hoverColor,
} from '../../../../util/colorHelper';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { SliderSizes } from '../../Slider/SliderSizes';
import { setCaptureRDWG, setGenotypesForFilterSelectedRD } from '../../../../stores/slices/dashboardSlice';
import { Close } from '@mui/icons-material';
import { SelectCountry } from '../../SelectCountry';

const dataViewOptions = [
  {
    label: 'Number of genomes',
    value: 'number',
    graphLabel: 'Number of occurrences',
  },
  {
    label: 'Percentage per genotype',
    value: 'percentage',
    graphLabel: '% Genomes',
  },
];

export const DeterminantsGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [topXGenotypes, setTopXGenotypes] = useState([]);
  const [plotChart, setPlotChart] = useState(() => {});
  const [currentEventSelected, setCurrentEventSelected] = useState([]);

  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const genotypesDrugClassesData = useAppSelector((state) => state.graph.genotypesDrugClassesData);
  const determinantsGraphView = useAppSelector((state) => state.graph.determinantsGraphView);
  const determinantsGraphDrugClass = useAppSelector((state) => state.graph.determinantsGraphDrugClass);
  const currentSliderValueRD = useAppSelector((state) => state.graph.currentSliderValueRD);
  const resetBool = useAppSelector((state) => state.graph.resetBool);
  const captureRDWG = useAppSelector((state) => state.dashboard.captureRDWG);
  const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);

  let sumOfBarDataToShowOnPlot = 0;
  useEffect(() => {
    // eslint-disable-next-line array-callback-return
    newArray.map((item) => {
      sumOfBarDataToShowOnPlot += item.totalCount;
    });

    if (sumOfBarDataToShowOnPlot <= 0) {
      dispatch(setCaptureRDWG(false));
    } else {
      dispatch(setCaptureRDWG(true));
    }
  }, [genotypesDrugClassesData, determinantsGraphDrugClass, actualCountry]);
  useEffect(() => {
    dispatch(setResetBool(true));
    setCurrentTooltip(null);
  }, [genotypesDrugClassesData]);

  function getDrugClassesBars() {
    switch (organism) {
      case 'styphi':
        if (colorForDrugClassesST[determinantsGraphDrugClass] !== undefined)
          return colorForDrugClassesST[determinantsGraphDrugClass].filter(
            (item) => topXGenotypes.includes(item.name) || item.label === 'Other' || item.label === 'None',
          );
        break;
      case 'kpneumo':
        if (colorForDrugClassesKP[determinantsGraphDrugClass] !== undefined)
          return colorForDrugClassesKP[determinantsGraphDrugClass].filter(
            (item) => topXGenotypes.includes(item.name) || item.label === 'Other' || item.label === 'None',
          );
        break;
      case 'ngono':
        if (colorForDrugClassesNG[determinantsGraphDrugClass] !== undefined)
          return colorForDrugClassesNG[determinantsGraphDrugClass].filter(
            (item) => topXGenotypes.includes(item.name) || item.label === 'Other' || item.label === 'None',
          );
        break;
      default:
        return [];
    }
  }
  let data = 0;
  useEffect(() => {
    if (genotypesDrugClassesData[determinantsGraphDrugClass] !== undefined) {
      data = genotypesDrugClassesData[determinantsGraphDrugClass].filter((x) => x).length;
    }
  }, [genotypesDrugClassesData, determinantsGraphDrugClass]);

  function getDomain() {
    return determinantsGraphView === 'number' ? undefined : [0, 100];
  }

  let determinantsGraphDrugClassData = structuredClone(genotypesDrugClassesData[determinantsGraphDrugClass] ?? []);
  useEffect(() => {
    let mp = new Map(); //mp = total count of a genotype in database(including all years)
    determinantsGraphDrugClassData.forEach((cur) => {
      Object.keys(cur).forEach((it) => {
        if (it !== 'name' && it !== 'count' && it !== 'resistantCount' && it !== 'totalCount') {
          if (mp.has(it)) {
            mp.set(it, mp.get(it) + cur[it]);
          } else {
            mp.set(it, cur[it]);
          }
        }
      });
    });
    const mapArray = Array.from(mp); //[key, total_count], eg: ['4.3.1.1', 1995]
    // const filteredArr = mapArray.filter((item) => genotypesDrugClassesData[determinantsGraphDrugClass].includes(item[0]));
    // Sort the array based on keys
    // filteredArr.sort((a, b) => b[1] - a[1]);

    //     const slicedArray = filteredArr.slice(0, currentSliderValueRD).map(([key, value]) => key);
    //     const slicedArrayWithOther = structuredClone(slicedArray);
    //     const Other = 'Other';
    //     const insertIndex = slicedArrayWithOther.length; // Index to insert "Other"
    //     slicedArrayWithOther.splice(insertIndex, insertIndex, Other);

    mapArray.sort((a, b) => b[1] - a[1]);
    const slicedArray = mapArray.slice(0, currentSliderValueRD).map(([key, value]) => key);
    dispatch(setGenotypesForFilterSelectedRD(slicedArray));
    setTopXGenotypes(slicedArray);

    dispatch(setMaxSliderValueRD(mapArray.length));
  }, [determinantsGraphDrugClass, currentSliderValueRD]);

  let newArray = []; //TODO: can be a global value in redux
  const exclusions = ['name', 'totalCount', 'resistantCount'];

  newArray = determinantsGraphDrugClassData.map((item) => {
    let count = 0;
    let newTotalCount = 0;
    for (const key in item) {
      if (!exclusions.includes(key)) {
        newTotalCount += item[key];
      }
      if (!topXGenotypes.includes(key) && !exclusions.includes(key)) {
        count += item[key]; //adding count of all genotypes which are not in topX
      }
    }
    const newItem = { ...item, Other: count, newTotalCount: newTotalCount };
    return newItem; //return item of genotypesYearData with additional filed 'Other' to newArray
  });

  let genotypeDrugClassesDataPercentage = structuredClone(newArray);
  useEffect(() => {
    //TODO change the exclusions
    const exclusions = ['name', 'totalCount', 'resistantCount'];

    genotypeDrugClassesDataPercentage = genotypeDrugClassesDataPercentage
      .filter((x) => x)
      .map((item) => {
        const keys = Object.keys(item).filter((x) => !exclusions.includes(x));
        dispatch(setSliderList(keys.length));

        keys.forEach((key) => {
          item[key] = Number(((item[key] / item.totalCount) * 100).toFixed(2));
        });

        return item;
      });
  }, [genotypeDrugClassesDataPercentage]);

  function getData() {
    if (determinantsGraphView === 'number') return newArray;
    else return genotypeDrugClassesDataPercentage;
  }

  function handleChangeDataView(event) {
    dispatch(setDeterminantsGraphView(event.target.value));
  }

  function handleChangeDrugClass(event) {
    setCurrentTooltip(null);
    dispatch(setDeterminantsGraphDrugClass(event.target.value));
  }

  function handleClickChart(event) {
    setCurrentEventSelected(event);
  }
  //TODO: Check this fuction to work for all organisms
  function getColorForDrug(drug) {
    const colorForDrugClasses =
      organism === 'styphi'
        ? colorForDrugClassesST
        : organism === 'kpneumo'
        ? colorForDrugClassesKP
        : colorForDrugClassesNG;
    const drugClassColors = colorForDrugClasses[determinantsGraphDrugClass];
    // Find the color for the specific drug from the drug class colors
    const drugColorObject = drugClassColors.find((item) => drug === item.name);
    const drugColor = drugColorObject ? drugColorObject.color : '#DCDCDC'; // If drugColorObject exists, extract color, otherwise set to empty string
    return drugColor;
  }

  useEffect(() => {
    const data = newArray.find((item) => item.name === currentEventSelected?.activeLabel);

    if (data) {
      const currentData = structuredClone(data);
      const value = {
        name: currentData.name,
        count: currentData.newTotalCount,
        drugClasses: [],
      };

      delete currentData.name;
      delete currentData.totalCount;
      delete currentData.newTotalCount;
      delete currentData.resistantCount;

      Object.keys(currentData).forEach((key) => {
        const count = currentData[key];

        if (count === 0) {
          return;
        }

        value.drugClasses.push({
          label: key,
          count,
          percentage: Number(((count / value.count) * 100).toFixed(2)),
          color: getColorForDrug(key),
        });

        // value.drugClasses = value.drugClasses.sort((a, b) => a.label.localeCompare(b.label));
        value.drugClasses = value.drugClasses
          .sort((a, b) => a.label.localeCompare(b.label))
          .filter((item) => topXGenotypes.includes(item.label) || item.label === 'Other');
      });

      setCurrentTooltip(value);
      dispatch(setResetBool(false));
    }
  }, [topXGenotypes, currentEventSelected.activeLabel, currentSliderValueRD]);

  useEffect(() => {
    if (!resetBool) handleClickChart(currentEventSelected);
    else {
      setCurrentTooltip(null);
      dispatch(setResetBool(true));
    }
  }, [topXGenotypes, currentSliderValueRD]);

  useEffect(() => {
    if (canGetData) {
      setPlotChart(() => {
        return (
          <ResponsiveContainer width="100%">
            <BarChart
              data={getData()}
              cursor={isTouchDevice() ? 'default' : 'pointer'}
              onClick={handleClickChart}
              maxBarSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval="preserveStartEnd" tick={{ fontSize: 14 }} />
              <YAxis domain={getDomain()} allowDataOverflow={true} allowDecimals={false}>
                <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                  {dataViewOptions.find((option) => option.value === determinantsGraphView).label}
                </Label>
              </YAxis>
              {(genotypesDrugClassesData[determinantsGraphDrugClass] ?? []).length > 0 && (
                <Brush dataKey="name" height={20} stroke={'rgb(31, 187, 211)'} />
              )}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className={classes.legendWrapper}>
                      {payload.map((entry, index) => {
                        if (!captureRDWG) return null;
                        const { dataKey, color } = entry;
                        return (
                          <div key={`distribution-legend-${index}`} className={classes.legendItemWrapper}>
                            <Box className={classes.colorCircle} style={{ backgroundColor: color }} />
                            <Typography variant="caption">{dataKey}</Typography>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />

              <ChartTooltip
                cursor={data > 0 ? { fill: hoverColor } : false}
                content={({ payload, active, label }) => {
                  if (payload !== null && active) {
                    return <div className={classes.chartTooltipLabel}>{label}</div>;
                  }
                  return null;
                }}
              />

              {getDrugClassesBars()?.map((option, index) => (
                <Bar
                  key={`determinants-bar-${index}`}
                  dataKey={option.name}
                  name={option.name}
                  stackId={0}
                  fill={option.color}
                />
              ))}
              <Bar dataKey={'Other'} stackId={0} fill={'#DCDCDC'} />
            </BarChart>
          </ResponsiveContainer>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genotypesDrugClassesData, determinantsGraphView, determinantsGraphDrugClass, topXGenotypes]);

  return (
    <CardContent className={classes.determinantsGraph}>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="RDWG">
          {plotChart}
        </div>
        <div className={classes.sliderCont}>
          <SliderSizes sx={{ margin: '0px 10px 0px 10px' }} />
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
                  {currentTooltip.drugClasses.map((item, index) => {
                    return (
                      <div key={`tooltip-content-${index}`} className={classes.tooltipItemWrapper}>
                        <Box
                          className={classes.tooltipItemBox}
                          style={{
                            backgroundColor: item.color,
                          }}
                        />
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
              </div>
            ) : (
              <div className={classes.noGenotypeSelected}>No genotype selected</div>
            )}
          </div>
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
                <div className={classes.selectWrapper}>
                  <Typography variant="caption">Select drug/class</Typography>
                  <Select
                    value={determinantsGraphDrugClass}
                    onChange={handleChangeDrugClass}
                    inputProps={{ className: classes.selectInput }}
                    MenuProps={{ classes: { list: classes.selectMenu } }}
                    disabled={organism === 'none'}
                  >
                    {getDrugClasses(organism).map((option, index) => {
                      return (
                        <MenuItem key={index + 'determinants-drug-classes'} value={option}>
                          {option}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </div>
                <div className={classes.selectWrapper}>
                  <Typography variant="caption">Data view</Typography>
                  <Select
                    value={determinantsGraphView}
                    onChange={handleChangeDataView}
                    inputProps={{ className: classes.selectInput }}
                    MenuProps={{ classes: { list: classes.selectMenu } }}
                    disabled={organism === 'none'}
                  >
                    {dataViewOptions.map((option, index) => {
                      return (
                        <MenuItem key={index + 'determinants-dataview'} value={option.value}>
                          {option.label}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </Box>
      )}
    </CardContent>
  );
};
