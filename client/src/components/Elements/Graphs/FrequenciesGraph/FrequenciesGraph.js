/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Button, CardContent, Checkbox, ListItemText, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { useStyles } from './FrequenciesGraphMUI';
import { InfoOutlined } from '@mui/icons-material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
  Label,
  Legend,
  Brush
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setFrequenciesGraphSelectedGenotypes, setFrequenciesGraphView } from '../../../../stores/slices/graphSlice';
import { useEffect, useState } from 'react';
import { hoverColor } from '../../../../util/colorHelper';
import { getColorForDrug } from '../graphColorHelper';
import { drugsST, drugsKP } from '../../../../util/drugs';
import { isTouchDevice } from '../../../../util/isTouchDevice';

const dataViewOptions = [
  { label: 'Number of genomes', value: 'number' },
  { label: 'Percentage within genotype', value: 'percentage' }
];

export const FrequenciesGraph = () => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [plotChart, setPlotChart] = useState(() => {});

  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const genotypesDrugsData = useAppSelector((state) => state.graph.genotypesDrugsData);
  const frequenciesGraphView = useAppSelector((state) => state.graph.frequenciesGraphView);
  const frequenciesGraphSelectedGenotypes = useAppSelector((state) => state.graph.frequenciesGraphSelectedGenotypes);

  useEffect(() => {
    setCurrentTooltip(null);
  }, [genotypesDrugsData]);

  function getSelectGenotypeLabel(genotype) {
    const percentage = Number(((genotype.Susceptible / genotype.totalCount) * 100).toFixed(2));

    return `${genotype.name} (total N=${genotype.totalCount}, ${percentage}% Susceptible)`;
  }

  function getDomain() {
    return frequenciesGraphView === 'number' ? undefined : [0, 100];
  }

  function getDrugs() {
    if (organism === 'none') {
      return [];
    }
    if (organism === 'typhi') {
      return drugsST;
    }
    return drugsKP;
  }

  function getData() {
    const data = genotypesDrugsData.filter((genotype) => frequenciesGraphSelectedGenotypes.includes(genotype.name));

    if (frequenciesGraphView === 'number') {
      return data;
    }

    const exclusions = ['name', 'totalCount', 'resistantCount'];
    let genotypeDataPercentage = structuredClone(data);
    genotypeDataPercentage = genotypeDataPercentage.map((item) => {
      const keys = Object.keys(item).filter((x) => !exclusions.includes(x));

      keys.forEach((key) => {
        item[key] = Number(((item[key] / item.totalCount) * 100).toFixed(2));
      });

      return item;
    });

    return genotypeDataPercentage;
  }

  function getDataForGenotypeSelect() {
    // if (organism === 'typhi') {
      return genotypesDrugsData;
    // } else {
    //   return JSON.parse(JSON.stringify(genotypesDrugsData.slice(0, 20)));
    // }
  }

  function handleClickChart(event) {
    const data = genotypesDrugsData.find((item) => item.name === event?.activeLabel);

    if (data) {
      const currentData = structuredClone(data);

      const value = {
        name: currentData.name,
        count: currentData.totalCount,
        drugs: []
      };

      delete currentData.name;
      delete currentData.totalCount;
      delete currentData.resistantCount;

      Object.keys(currentData).forEach((key) => {
        const count = currentData[key];

        if (count === 0) {
          return;
        }

        value.drugs.push({
          label: key,
          count,
          percentage: Number(((count / value.count) * 100).toFixed(2)),
          fill: event.activePayload.find((x) => x.name === key).fill
        });
        value.drugs.sort((a, b) => b.count - a.count);
      });

      setCurrentTooltip(value);
    }
  }

  function handleChangeDataView(event) {
    dispatch(setFrequenciesGraphView(event.target.value));
  }

  function handleChangeSelectedGenotypes({ event = null, all = false }) {
    if (all) {
      dispatch(setFrequenciesGraphSelectedGenotypes([]));
      setCurrentTooltip(null);
      return;
    }

    const {
      target: { value }
    } = event;

    if (frequenciesGraphSelectedGenotypes.length === 7 && value.length > 7) {
      return;
    }

    if (value.length === 0) {
      setCurrentTooltip(null);
    }
    dispatch(setFrequenciesGraphSelectedGenotypes(value));
  }

  useEffect(() => {
    if (canGetData) {
      setPlotChart(() => {
        return (
          <ResponsiveContainer width="100%">
            <BarChart data={getData()} cursor={isTouchDevice() ? 'default' : 'pointer'} onClick={handleClickChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval="preserveStartEnd" tick={{ fontSize: 14 }} />
              <YAxis domain={getDomain()} allowDecimals={false}>
                <Label angle={-90} position="insideLeft" className={classes.graphLabel}>
                  {dataViewOptions.find((option) => option.value === frequenciesGraphView).label}
                </Label>
              </YAxis>
              {genotypesDrugsData.length > 0 && <Brush dataKey="name" height={20} stroke={'rgb(31, 187, 211)'} />}

              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className={classes.legendWrapper}>
                      {payload.map((entry, index) => {
                        const { dataKey, color } = entry;
                        return (
                          <div key={`frequencies-legend-${index}`} className={classes.legendItemWrapper}>
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
                cursor={{ fill: hoverColor }}
                content={({ payload, active, label }) => {
                  if (payload !== null && active) {
                    return <div className={classes.chartTooltipLabel}>{label}</div>;
                  }
                  return null;
                }}
              />

              {getDrugs().map((option, index) => (
                <Bar key={`frequencies-bar-${index}`} dataKey={option} fill={getColorForDrug(option)} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genotypesDrugsData, frequenciesGraphView, frequenciesGraphSelectedGenotypes]);

  return (
    <CardContent className={classes.frequenciesGraph}>
      <div className={classes.selectsWrapper}>
        <div className={classes.labelWrapper}>
          <Typography variant="caption">Data view</Typography>
          <Tooltip title="Select up to 7 genotypes" placement="top">
            <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
          </Tooltip>
        </div>
        <div className={classes.selectWrapper}>
          <Select
            value={frequenciesGraphView}
            onChange={handleChangeDataView}
            inputProps={{ className: classes.dataViewSelectInput }}
            MenuProps={{ classes: { list: classes.dataViewSelectMenu } }}
            disabled={organism === 'none'}
          >
            {dataViewOptions.map((option, index) => {
              return (
                <MenuItem key={index + 'frequencies-dataview'} value={option.value}>
                  {option.label}
                </MenuItem>
              );
            })}
          </Select>
          <Select
            multiple
            value={frequenciesGraphSelectedGenotypes}
            onChange={(event) => handleChangeSelectedGenotypes({ event })}
            displayEmpty
            disabled={organism === 'none'}
            endAdornment={
              <Button
                variant="outlined"
                className={classes.genotypesSelectButton}
                onClick={() => handleChangeSelectedGenotypes({ all: true })}
                disabled={organism === 'none' || frequenciesGraphSelectedGenotypes.length === 0}
                color="error"
              >
                CLEAR
              </Button>
            }
            inputProps={{ className: classes.genotypesSelectInput }}
            MenuProps={{ classes: { paper: classes.genotypesMenuPaper, list: classes.genotypesSelectMenu } }}
            renderValue={(selected) => (
              <div>{`${selected.length} of ${getDataForGenotypeSelect().length} selected`}</div>
            )}
          >
            {getDataForGenotypeSelect().map((genotype, index) => (
              <MenuItem key={`frequencies-option-${index}`} value={genotype.name}>
                <Checkbox checked={frequenciesGraphSelectedGenotypes.indexOf(genotype.name) > -1} />
                <ListItemText primary={getSelectGenotypeLabel(genotype)} />
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} id="RFWG">
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
                  return (
                    <div key={`tooltip-content-${index}`} className={classes.tooltipItemWrapper}>
                      <Box
                        className={classes.tooltipItemBox}
                        style={{
                          backgroundColor: item.fill
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
    </CardContent>
  );
};
