/* eslint-disable react-hooks/exhaustive-deps */
import { Box, CardContent, MenuItem, Select, Typography } from '@mui/material';
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
  Brush
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setDeterminantsGraphDrugClass, setDeterminantsGraphView, setResetBool, setSliderList } from '../../../../stores/slices/graphSlice';
import { drugClassesST, drugClassesKP, drugsNG, drugClassesSH, drugClassesSA, drugClassesEC, drugsEC, drugsSE, drugsSH} from '../../../../util/drugs';
import { useEffect, useState } from 'react';
import { colorForDrugClassesKP, colorForDrugClassesST, colorForDrugClassesNG, colorForDrugClassesSA, colorForDrugClassesSH, colorForDrugClassesEC, hoverColor } from '../../../../util/colorHelper';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { SliderSizes } from '../../Slider2/SliderSizes';

const dataViewOptions = [
  { label: 'Number of genomes', value: 'number', graphLabel: 'Number of occurrences' },
  { label: 'Percentage per genotype', value: 'percentage', graphLabel: '% Genomes' }
];

export const DeterminantsGraph = () => {
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
  

  useEffect(() => {
    dispatch(setResetBool(true));
    setCurrentTooltip(null);
  }, [genotypesDrugClassesData]);

  function getDrugClasses() {
    switch (organism) {
      case 'styphi':
        return drugClassesST;
      case 'kpneumo':
        return drugClassesKP;
      case 'ngono':
        return drugsNG;
      case 'ecoli':
        return drugsEC;
      case 'shige':
        return drugsSH;
      case 'senterica':
        return drugsSE;
      default:
        return [];
    }
  }

  function getDrugClassesBars() {
    switch (organism) {
      case 'styphi':
        if(colorForDrugClassesST[determinantsGraphDrugClass] !== undefined)
        return colorForDrugClassesST[determinantsGraphDrugClass].filter((item) => topXGenotypes.includes(item.name) || item.label === "Other" || item.label === "None");
      break;
      default:
        if(colorForDrugClassesKP[determinantsGraphDrugClass] !== undefined)
        return colorForDrugClassesKP[determinantsGraphDrugClass].filter((item) => topXGenotypes.includes(item.name) || item.label === "Other" || item.label === "None");;
    }
  }

  let data = 0;
    useEffect(()=>{
      if(genotypesDrugClassesData[determinantsGraphDrugClass] !== undefined){
        data = genotypesDrugClassesData[determinantsGraphDrugClass].filter((x)=>x.totalCount>0).length;
      }
    },[genotypesDrugClassesData, determinantsGraphDrugClass])

  function getDomain() {
    return determinantsGraphView === 'number' ? undefined : [0, 100];
  }
  let determinantsGraphDrugClassData = structuredClone(genotypesDrugClassesData[determinantsGraphDrugClass] ?? []);
  useEffect(() =>{
      let mp = new Map(); //mp = total count of a genotype in database(including all years)
      // console.log("genotypesYearData", genotypesYearData)
      determinantsGraphDrugClassData.forEach(cur => {
        Object.keys(cur).forEach(it => {
          if (it !== "name" && it !== "count" && it !== "resistantCount" && it !== "totalCount") {
            if (mp.has(it)) {
              mp.set(it, mp.get(it) + cur[it]);
            } else {
              mp.set(it, cur[it]);
            }
          }
        })
      })
      const mapArray = Array.from(mp);//[key, total_count], eg: ['4.3.1.1', 1995]
      // Sort the array based on keys
      mapArray.sort((a, b) => b[1] - a[1]);
      const slicedArray = mapArray.slice(0, currentSliderValueRD).map(([key, value]) => key);
      setTopXGenotypes(slicedArray);
      // console.log("topXGenotypes",slicedArray )
  },[determinantsGraphDrugClass, currentSliderValueRD]);


  
  
  let newArray = []; //TODO: can be a global value in redux
  const exclusions = ['name', 'count', 'totalCount', 'resistantCount'];
  newArray = determinantsGraphDrugClassData.map((item) => {
    let count = 0;
    for (const key in item) {    

      if (!topXGenotypes.includes(key) && !exclusions.includes(key)) { 
        count += item[key]; //adding count of all genotypes which are not in topX
      }  
    }
    const newItem = { ...item, Other: count };
    return newItem; //return item of genotypesYearData with additional filed 'Other' to newArray
  });

  let genotypeDrugClassesDataPercentage = structuredClone(newArray);
  useEffect(()=>{
      const exclusions = ['name', 'totalCount', 'resistantCount'];
    
    genotypeDrugClassesDataPercentage = genotypeDrugClassesDataPercentage.filter((x)=>x.totalCount>0).map((item) => {
      const keys = Object.keys(item).filter((x) => !exclusions.includes(x));
      dispatch(setSliderList(keys.length));

      keys.forEach((key) => {
        ;
        item[key] = Number(((item[key] / item.totalCount) * 100).toFixed(2));
      });
      return item;
    });
  },[genotypeDrugClassesDataPercentage]);

  function getData() {
    if (determinantsGraphView === 'number') 
      return newArray;
    else
    return genotypeDrugClassesDataPercentage;
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

  function getColorForDrug(drug){
    const colorForDrugClasses = organism === 'styphi'?colorForDrugClassesST:colorForDrugClassesKP;
    const drugClassColors = colorForDrugClasses[determinantsGraphDrugClass];
    // Find the color for the specific drug from the drug class colors
    const drugColorObject = drugClassColors.find(item => drug.includes(item.name));
    const drugColor = drugColorObject ? drugColorObject.color : '#DCDCDC'; // If drugColorObject exists, extract color, otherwise set to empty string
    return drugColor;
  }

  useEffect(()=>{
    
    const data = newArray.find((item) => item.name === currentEventSelected?.activeLabel);

    if (data) {
      const currentData = structuredClone(data);
      const value = {
        name: currentData.name,
        count: currentData.totalCount,
        drugClasses: []
      };

      delete currentData.name;
      delete currentData.totalCount;
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
          color: getColorForDrug(key)
        });
        // value.drugClasses = value.drugClasses.sort((a, b) => a.label.localeCompare(b.label));
        value.drugClasses = value.drugClasses.sort((a, b) => a.label.localeCompare(b.label)).filter((item) => topXGenotypes.includes(item.label) || item.label === "Other");
      });

      setCurrentTooltip(value);
      dispatch(setResetBool(false));
    }
  },[topXGenotypes, currentEventSelected.activeLabel, currentSliderValueRD]);

  useEffect(()=>{
    if(!resetBool)
      handleClickChart(currentEventSelected);
    else{
      setCurrentTooltip(null);
      dispatch(setResetBool(true));
  }
  },[topXGenotypes,currentSliderValueRD]);

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
                cursor={data > 0 ? { fill: hoverColor }:false}
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
              <Bar
                  dataKey={"Other"}
                  stackId={0}
                  fill={'#DCDCDC'}
                />
            </BarChart>
          </ResponsiveContainer>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genotypesDrugClassesData, determinantsGraphView, determinantsGraphDrugClass, topXGenotypes]);
  return (
    <CardContent className={classes.determinantsGraph}>
      <div className={classes.selectsWrapper}>
        <div className={classes.selectWrapper}>
          <Typography variant="caption">Select drug/class</Typography>
          <Select
            value={determinantsGraphDrugClass}
            onChange={handleChangeDrugClass}
            inputProps={{ className: classes.selectInput }}
            MenuProps={{ classes: { list: classes.selectMenu } }}
            disabled={organism === 'none'}
          >
            {getDrugClasses().map((option, index) => {
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
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="RDWG">
          {plotChart}
        </div>
        <div className={classes.sliderCont} >
           <SliderSizes sx={{margin: '0px 10px 0px 10px'}}/>
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
                            backgroundColor: item.color
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
    </CardContent>
  );
};
