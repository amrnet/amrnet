/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  CardContent,
  Checkbox,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  InputAdornment,
  Card,
  IconButton,
} from '@mui/material';
import { useStyles } from './FrequenciesGraphMUI';
import { Close, InfoOutlined } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
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
  Brush,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import {
  setFrequenciesGraphSelectedGenotypes,
  setFrequenciesGraphView,
  setResetBool,
} from '../../../../stores/slices/graphSlice';
import { useEffect, useState } from 'react';
import { hoverColor } from '../../../../util/colorHelper';
import { getColorForDrug } from '../graphColorHelper';
import { drugsST, drugsKP, drugsNG } from '../../../../util/drugs';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { setCaptureRFWG } from '../../../../stores/slices/dashboardSlice';
import { SelectCountry } from '../../SelectCountry';

const dataViewOptions = [
  { label: 'Number of genomes', value: 'number' },
  { label: 'Percentage within genotype', value: 'percentage' },
];

export const FrequenciesGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [plotChart, setPlotChart] = useState(() => {});
  const [searchValue2, setSearchValue2] = useState('');

  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
  const genotypesDrugsData = useAppSelector((state) => state.graph.genotypesDrugsData);
  const frequenciesGraphView = useAppSelector((state) => state.graph.frequenciesGraphView);
  const frequenciesGraphSelectedGenotypes = useAppSelector((state) => state.graph.frequenciesGraphSelectedGenotypes);
  const resetBool = useAppSelector((state) => state.graph.resetBool);

  let data = genotypesDrugsData;
  let sumOfBarDataToShowOnPlot = 0;

  useEffect(() => {
    data = data.filter((genotype) => frequenciesGraphSelectedGenotypes.includes(genotype.name));

    // eslint-disable-next-line array-callback-return
    data.map((item) => {
      sumOfBarDataToShowOnPlot += item.totalCount;
    });
    if (frequenciesGraphSelectedGenotypes.length <= 0 || sumOfBarDataToShowOnPlot === 0) {
      dispatch(setCaptureRFWG(false));
    } else {
      dispatch(setCaptureRFWG(true));
    }
  }, [frequenciesGraphSelectedGenotypes, frequenciesGraphView]);

  useEffect(() => {
    dispatch(setResetBool(true));
    setCurrentTooltip(null);
    dispatch(setFrequenciesGraphSelectedGenotypes(genotypesDrugsData.slice(0, 5).map((x) => x.name)));
  }, [genotypesDrugsData]);

  function getSelectGenotypeLabel(genotype) {
    const percentage = Number(((genotype.Pansusceptible / genotype.totalCount) * 100).toFixed(2));

    return `${genotype.name} (total N=${
      genotype.totalCount === 0 ? 0 : `${genotype.totalCount}, ${percentage}% Pansusceptible`
    })`;
  }

  function getDomain() {
    return frequenciesGraphView === 'number' ? undefined : [0, 100];
  }

  function getDrugs() {
    if (organism === 'none') {
      return [];
    } else if (organism === 'styphi') {
      return drugsST;
    } else if (organism === 'kpneumo') {
      return drugsKP;
    } else if (organism === 'ngono') {
      return drugsNG;
    }
  }

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
        return 'Pansusceptible to class I/II drugs’ (sensitive to Azithromycin, Ceftriaxone, Ciprofloxacin, Cefixime, Penicillin, Spectinomycin)';
      default:
        return;
    }
  }

  function getData() {
    data = data.filter((genotype) => frequenciesGraphSelectedGenotypes.includes(genotype.name));

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

  // function getDataForGenotypeSelect() {
  //   // if (organism === 'styphi') {
  //     return genotypesDrugsData;
  //   // } else {
  //   //   return JSON.parse(JSON.stringify(genotypesDrugsData.slice(0, 20)));
  //   // }
  // }

  function handleClickChart(event) {
    const data = genotypesDrugsData.find((item) => item.name === event?.activeLabel);

    if (data) {
      const currentData = structuredClone(data);

      const value = {
        name: currentData.name,
        count: currentData.totalCount,
        drugs: [],
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
          fill: event.activePayload.find((x) => x.name === key).fill,
        });
        value.drugs.sort((a, b) => b.count - a.count);
      });

      setCurrentTooltip(value);
      dispatch(setResetBool(false));
    }
  }

  useEffect(() => {
    if (resetBool) {
      setCurrentTooltip(null);
      dispatch(setResetBool(true));
    }
  });

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
      target: { value },
    } = event;

    if (frequenciesGraphSelectedGenotypes.length === 7 && value.length > 7) {
      return;
    }

    if (value.length === 0) {
      setCurrentTooltip(null);
    }
    dispatch(setFrequenciesGraphSelectedGenotypes(value));
  }

  function setSearchValue(event) {
    event.preventDefault();
    setSearchValue2(event.target.value);
  }

  const filteredData = data.filter(
    (genotype) =>
      genotype.name.includes(searchValue2.toLowerCase()) || genotype.name.includes(searchValue2.toUpperCase()),
  );

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
                        if (!sumOfBarDataToShowOnPlot) return null;
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
                          <div key={`frequencies-legend-${index}`} className={classes.legendItemWrapper}>
                            <Box className={classes.colorCircle} style={{ backgroundColor: color }} />
                            <Typography variant="caption">{dataKeyElement}</Typography>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />

              <ChartTooltip
                cursor={frequenciesGraphSelectedGenotypes !== 0 ? { fill: hoverColor } : false}
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
            <div className={classes.noGenotypeSelected}>Click on a genotype to see detail</div>
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
                    className={classes.select}
                    multiple
                    value={frequenciesGraphSelectedGenotypes}
                    onChange={(event) => handleChangeSelectedGenotypes({ event })}
                    displayEmpty
                    // endAdornment={
                    //   <Button
                    //     variant="outlined"
                    //     className={classes.genotypesSelectButton}
                    //     onClick={() => handleChangeSelectedGenotypes({ all: true })}
                    //     disabled={frequenciesGraphSelectedGenotypes.length === 0}
                    //     color="error"
                    //   >
                    //     Clear All
                    //   </Button>
                    // }
                    inputProps={{ className: classes.genotypesSelectInput }}
                    MenuProps={{
                      classes: {
                        paper: classes.genotypesMenuPaper,
                        list: classes.genotypesSelectMenu,
                      },
                    }}
                    renderValue={(selected) => <div>{`Select genotypes (currently showing ${selected.length} )`}</div>}
                  >
                    <TextField
                      size="small"
                      autoFocus
                      placeholder="Type to search..."
                      label="Search genotype"
                      variant="standard"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              variant="outlined"
                              className={classes.genotypesSelectButton}
                              onClick={() => handleChangeSelectedGenotypes({ all: true })}
                              disabled={frequenciesGraphSelectedGenotypes.length === 0}
                              color="error"
                            >
                              Clear All
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ width: '98%', margin: '0% 1%' }}
                      onChange={(e) => setSearchValue(e)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    {filteredData.map((genotype, index) => (
                      <MenuItem key={`frequencies-option-${index}`} value={genotype.name}>
                        <Checkbox checked={frequenciesGraphSelectedGenotypes.indexOf(genotype.name) > -1} />
                        <ListItemText primary={getSelectGenotypeLabel(genotype)} />
                      </MenuItem>
                    ))}
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
