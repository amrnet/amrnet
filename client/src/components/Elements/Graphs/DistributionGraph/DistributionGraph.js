import { Box, Card, CardContent, IconButton, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { useStyles } from './DistributionGraphMUI';
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Label,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks.ts';
import { setColorPallete, setGenotypesForFilterSelected } from '../../../../stores/slices/dashboardSlice';
import { setDistributionGraphView, setResetBool, setEndtimeGD, setStarttimeGD } from '../../../../stores/slices/graphSlice.ts';
import { getColorForGenotype, hoverColor, generatePalleteForGenotypes } from '../../../../util/colorHelper';
import { useEffect, useState } from 'react';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { SliderSizes } from '../../Slider/SliderSizes';
import { setCaptureGD } from '../../../../stores/slices/dashboardSlice';
import { Close } from '@mui/icons-material';
import { SelectCountry } from '../../SelectCountry';

const dataViewOptions = [
  { label: 'Number of ST', value: 'number' },
  { label: 'Percentage per year', value: 'percentage' },
];

export const DistributionGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  // const [currentSliderValue, setCurrentSliderValue] = useState(20);
  const [plotChart, setPlotChart] = useState(() => {});

  const dispatch = useAppDispatch();
  const distributionGraphView = useAppSelector((state) => state.graph.distributionGraphView);
  const genotypesYearData = useAppSelector((state) => state.graph.genotypesYearData);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const colorPallete = useAppSelector((state) => state.dashboard.colorPallete);
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const currentSliderValue = useAppSelector((state) => state.graph.currentSliderValue);
  const resetBool = useAppSelector((state) => state.graph.resetBool);
  const [topXGenotypes, setTopXGenotypes] = useState([]);
  const [currentEventSelected, setCurrentEventSelected] = useState([]);

  useEffect(() => {
    let cnt = 0;
    // eslint-disable-next-line array-callback-return
    newArray.map((item) => {
      cnt += item.count;
    });

    if (cnt <= 0) {
      dispatch(setCaptureGD(false));
    } else {
      dispatch(setCaptureGD(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genotypesForFilter, genotypesYearData, currentSliderValue]);

  useEffect(() => {
    dispatch(setResetBool(true));
    setCurrentTooltip(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genotypesYearData]);

  function getDomain() {
    return distributionGraphView === 'number' ? undefined : [0, 100];
  }

  //  const updateSlider = (value) =>{
  //   setCurrentSliderValue(value);
  //  };

  useEffect(() => {
    let mp = new Map(); //mp = total count of a genotype in database(including all years)
    genotypesYearData.forEach((cur) => {
      Object.keys(cur).forEach((it) => {
        if (it !== 'name' && it !== 'count') {
          if (mp.has(it)) {
            mp.set(it, mp.get(it) + cur[it]);
          } else {
            mp.set(it, cur[it]);
          }
        }
      });
    });
    const mapArray = Array.from(mp); //[key, total_count], eg: ['4.3.1.1', 1995]
    const filteredArr = mapArray.filter((item) => genotypesForFilter.includes(item[0]));
    // Sort the array based on keys
    filteredArr.sort((a, b) => b[1] - a[1]);

    const slicedArray = filteredArr.slice(0, currentSliderValue).map(([key, value]) => key);
    const slicedArrayWithOther = structuredClone(slicedArray);
    const Other = 'Other';
    const insertIndex = slicedArrayWithOther.length; // Index to insert "Other"
    slicedArrayWithOther.splice(insertIndex, insertIndex, Other);
    // console.log("GD", slicedArrayWithOther);
    dispatch(setGenotypesForFilterSelected(slicedArrayWithOther));
    setTopXGenotypes(slicedArray);
    dispatch(setColorPallete(generatePalleteForGenotypes(genotypesForFilter)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genotypesForFilter, genotypesYearData, currentSliderValue]);

  let newArray = []; //TODO: can be a global value in redux
  let newArrayPercentage = []; //TODO: can be a global value in redux
  const exclusions = ['name', 'count'];
  newArray = genotypesYearData.map((item) => {
    let count = 0;
    for (const key in item) {
      if (!topXGenotypes.includes(key) && !exclusions.includes(key)) {
        count += item[key]; //adding count of all genotypes which are not in topX
      }
    }
    const newItem = { ...item, Other: count };
    return newItem; //return item of genotypesYearData with additional filed 'Other' to newArray
  });
  let genotypeDataPercentage = structuredClone(newArray);
  newArrayPercentage = genotypeDataPercentage.map((item) => {
    const keys = Object.keys(item).filter((x) => !exclusions.includes(x));
    keys.forEach((key) => {
      item[key] = Number(((item[key] / item.count) * 100).toFixed(2));
    });
    return item;
  });

  function getData() {
    if (distributionGraphView === 'number') return newArray;
    return newArrayPercentage;
  }

  function getGenotypeColor(genotype) {
    return organism === 'styphi' ? getColorForGenotype(genotype) : colorPallete[genotype] || '#F5F4F6';
  }

  function handleChangeDataView(event) {
    dispatch(setDistributionGraphView(event.target.value));
  }
  function handleClickChart(event) {
    setCurrentEventSelected(event);
    const data = newArray.find((item) => item.name === event?.activeLabel);
    if (data) {
      const currentData = structuredClone(data);

      const value = {
        name: currentData.name,
        count: currentData.count,
        genotypes: [],
      };

      delete currentData.name;
      delete currentData.count;

      value.genotypes = Object.keys(currentData).map((key) => {
        const count = currentData[key];
        return {
          label: key,
          count,
          percentage: Number(((count / value.count) * 100).toFixed(2)),
          color: getGenotypeColor(key),
        };
      });
      value.genotypes = value.genotypes.filter((item) => topXGenotypes.includes(item.label) || item.label === 'Other');
      setCurrentTooltip(value);
      dispatch(setResetBool(false));
    }
  }
  useEffect(() => {
    if (!resetBool) handleClickChart(currentEventSelected);
    else {
      setCurrentTooltip(null);
      dispatch(setResetBool(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topXGenotypes]);

  useEffect(() => {
    if (genotypesYearData.length > 0) {
      // Dispatch initial values based on the default range (full range)
      const startValue = genotypesYearData[0]?.name; // First value in the data
      const endValue = genotypesYearData[genotypesYearData.length - 1]?.name; // Last value in the data
      console.log('startValue', startValue, endValue);
      dispatch(setStarttimeGD(startValue));
      dispatch(setEndtimeGD(endValue));
    }
  }, [genotypesYearData, dispatch]);

  useEffect(() => {
    if (canGetData) {
      setPlotChart(() => {
        return (
          <ResponsiveContainer width="100%">
            <BarChart
              data={getData()}
              cursor={isTouchDevice() ? 'default' : 'pointer'}
              onClick={handleClickChart}
              maxBarSize={70}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval="preserveStartEnd" tick={{ fontSize: 14 }} />
              <YAxis domain={getDomain()} allowDataOverflow={true} allowDecimals={false}>
                <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                  {dataViewOptions.find((option) => option.value === distributionGraphView).label}
                </Label>
              </YAxis>
              {genotypesYearData.length > 0 && <Brush dataKey="name" height={20} stroke={'rgb(31, 187, 211)'} onChange={(brushRange) => {
                dispatch(setStarttimeGD((genotypesYearData[brushRange.startIndex]?.name)));
                dispatch(setEndtimeGD((genotypesYearData[brushRange.endIndex]?.name))); // if using state genotypesYearData[start]?.name
              }}/>}
              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className={classes.legendWrapper}>
                      {payload.map((entry, index) => {
                        if (!genotypesYearData.length) return null;
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
                cursor={genotypesYearData !== 0 ? { fill: hoverColor } : false}
                content={({ payload, active, label }) => {
                  if (payload !== null && active) {
                    return <div className={classes.chartTooltipLabel}>{label}</div>;
                  }
                  return null;
                }}
              />

              {topXGenotypes.map((option, index) => (
                <Bar
                  key={`distribution-bar-${index}`}
                  dataKey={option}
                  name={option}
                  stackId={0}
                  fill={getGenotypeColor(option)}
                />
              ))}
              <Bar dataKey={'Other'} stackId={0} fill={getGenotypeColor('Other')} />
            </BarChart>
          </ResponsiveContainer>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genotypesYearData, distributionGraphView, topXGenotypes, currentSliderValue]);

  return (
    <CardContent className={classes.distributionGraph}>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="GD">
          {plotChart}
        </div>
        <div className={classes.sliderCont}>
          {/* <SliderSizes callBackValue={ updateSlider} sx={{margin: '0px 10px 0px 10px'}}/> */}
          <SliderSizes value={'GD'} sx={{ margin: '0px 10px 0px 10px' }} />
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
                  {currentTooltip.genotypes.map((item, index) => {
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
              <div className={classes.noYearSelected2}>Click on a year to see detail</div>
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
              <SelectCountry />
              <div className={classes.selectWrapper}>
                <Typography variant="caption">Data view</Typography>
                <Select
                  value={distributionGraphView}
                  onChange={handleChangeDataView}
                  inputProps={{ className: classes.selectInput }}
                  MenuProps={{ classes: { list: classes.selectMenu } }}
                  disabled={organism === 'none'}
                >
                  {dataViewOptions.map((option, index) => {
                    return (
                      <MenuItem key={index + 'distribution-dataview'} value={option.value}>
                        {option.label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </div>
            </CardContent>
          </Card>
        </Box>
      )}
    </CardContent>
  );
};
