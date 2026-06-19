import { Clear, InfoOutlined } from '@mui/icons-material';
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
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Cell,
  Tooltip as ChartTooltip,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setResetBool } from '../../../../stores/slices/graphSlice';
import { darkGrey, hoverColor } from '../../../../util/colorHelper';
import { drugAcronyms, drugAcronymsOpposite, getDrugClasses } from '../../../../util/drugs';
import { longestVisualWidth, truncateWord } from '../../../../util/helpers';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { heatmapLegendGradient, heatmapTextColor, mixColorScale } from '../../Map/mapColorHelper';
import { PlottingOptionsHeader } from '../../Shared/PlottingOptionsHeader';
import { PlottingOptionsPanel } from '../../Shared/PlottingOptionsPanel';
import { useStyles } from '../BubbleMarkersHeatmapGraph/BubbleMarkersHeatmapGraphMUI';
import { useTranslation } from 'react-i18next';

export const BubbleMarkersPathotypeHeatmapGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [xAxisSelected, setXAxisSelected] = useState([]);
  const [yAxisSelected, setYAxisSelected] = useState([]);
  const [pathotypeSearch, setPathotypeSearch] = useState('');
  const [markerSearch, setMarkerSearch] = useState('');
  const [plotChart, setPlotChart] = useState(() => {});
  const [regionSelected, setRegionSelected] = useState('All');
  const [countrySelected, setCountrySelected] = useState('All');
  const [yAxisType, setYAxisType] = useState('');

  const organism = useAppSelector(state => state.dashboard.organism);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const canFilterData = useAppSelector(state => state.dashboard.canFilterData);
  const loadingPDF = useAppSelector(state => state.dashboard.loadingPDF);
  const mapData = useAppSelector(state => state.map.mapDataNoPathotype);
  const mapRegionData = useAppSelector(state => state.map.mapRegionDataNoPathotype);
  const economicRegions = useAppSelector(state => state.dashboard.economicRegions);
  const countriesForFilter = useAppSelector(state => state.graph.countriesForFilter);
  const pathotypesDrugClassesData = useAppSelector(state => state.graph.pathotypesDrugClassesData);
  const resetBool = useAppSelector(state => state.graph.resetBool);

  const selectedCRData = useMemo(() => {
    return (countrySelected !== 'All' ? mapData : mapRegionData).find(
      x => x.name === (countrySelected !== 'All' ? countrySelected : regionSelected),
    );
  }, [countrySelected, mapData, mapRegionData, regionSelected]);

  const xAxisOptions = useMemo(() => {
    return selectedCRData?.stats?.PATHOTYPE?.items?.map(x => x.name) ?? [];
  }, [selectedCRData]);

  const filteredXAxisOptions = useMemo(() => {
    return xAxisOptions.filter(opt => opt.toLowerCase().includes(pathotypeSearch.toLowerCase()));
  }, [xAxisOptions, pathotypeSearch]);

  const drugClasses = useMemo(() => getDrugClasses(organism), [organism]);

  const currentDrugClass = useMemo(() => {
    if (yAxisType && drugClasses.includes(yAxisType)) return yAxisType;
    return drugClasses[0] ?? '';
  }, [yAxisType, drugClasses]);

  const yAxisOptions = useMemo(() => {
    if (!currentDrugClass || !pathotypesDrugClassesData[currentDrugClass]) return [];
    const exclusions = ['name', 'totalCount', 'resistantCount', 'count', 'newTotalCount', 'Other', 'None'];
    const totals = {};
    pathotypesDrugClassesData[currentDrugClass].forEach(item => {
      Object.keys(item).forEach(key => {
        if (!exclusions.includes(key)) {
          totals[key] = (totals[key] || 0) + (item[key] || 0);
        }
      });
    });
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k)
      .filter(k => k !== '-');
  }, [currentDrugClass, pathotypesDrugClassesData]);

  const filteredYAxisOptions = useMemo(() => {
    return yAxisOptions
      .filter(opt => opt.toLowerCase().includes(markerSearch.toLowerCase()))
      .slice(0, 20);
  }, [yAxisOptions, markerSearch]);

  const filteredRegions = useMemo(() => {
    return mapRegionData
      .filter(x => x.count >= 20 && x.name !== 'All')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [mapRegionData]);

  const filteredCountries = useMemo(() => {
    const countries = regionSelected === 'All' ? countriesForFilter : economicRegions[regionSelected];
    return mapData
      .filter(x => countries?.includes(x.name))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [countriesForFilter, economicRegions, mapData, regionSelected]);

  useEffect(() => {
    setXAxisSelected(xAxisOptions.slice(0, 10));
  }, [xAxisOptions]);

  useEffect(() => {
    setYAxisSelected(yAxisOptions.slice(0, 10));
  }, [yAxisOptions]);

  useEffect(() => {
    if (!yAxisType && drugClasses.length > 0) setYAxisType(drugClasses[0]);
  }, [drugClasses, yAxisType]);

  useEffect(() => {
    if (resetBool) {
      setRegionSelected('All');
      setCountrySelected('All');
      setXAxisSelected(xAxisOptions.slice(0, 10));
      setYAxisSelected(yAxisOptions.slice(0, 10));
      dispatch(setResetBool(false));
    }
  }, [resetBool, xAxisOptions, yAxisOptions, dispatch]);

  const yAxisWidth = useMemo(() => longestVisualWidth(xAxisSelected ?? []), [xAxisSelected]);

  const getOptionLabel = useCallback(
    item => {
      const total = selectedCRData?.stats?.PATHOTYPE?.items?.find(x => x.name === item)?.count ?? 0;
      return `${item} (total N=${total})`;
    },
    [selectedCRData],
  );

  const configuredMapData = useMemo(() => {
    if (!currentDrugClass || yAxisSelected.length === 0 || !pathotypesDrugClassesData[currentDrugClass]) return [];
    const data = pathotypesDrugClassesData[currentDrugClass];
    return xAxisSelected.map(xName => {
      const item = data.find(d => d.name === xName);
      const itemData = { name: xName, items: [] };
      yAxisSelected.forEach(option => {
        const count = item ? item[option] || 0 : 0;
        const total = item ? item.totalCount || 0 : 0;
        const percentage = total ? Number(((count / total) * 100).toFixed(2)) : 0;
        itemData.items.push({ itemName: option, percentage, count, index: 1, typeName: xName, total });
      });
      return itemData;
    });
  }, [currentDrugClass, pathotypesDrugClassesData, xAxisSelected, yAxisSelected]);

  useEffect(() => {
    if (!canGetData) return;
    setPlotChart(() => (
      <>
        {configuredMapData.map((item, index) => (
          <ResponsiveContainer
            key={`pathotype-heatmap-${index}`}
            width={yAxisWidth + 65 * yAxisSelected.length}
            height={index === 0 ? 105 : 65}
            style={{ paddingTop: index === 0 ? 70 : 0 }}
          >
            <ScatterChart cursor={isTouchDevice() ? 'default' : 'pointer'} margin={{ bottom: index === 0 ? -20 : 20 }}>
              <XAxis
                type="category"
                dataKey="itemName"
                interval={0}
                tick={
                  index === 0
                    ? props => {
                        const title = props.payload.value;
                        return (
                          <Tooltip title={title} placement="top">
                            <text
                              x={props.x}
                              y={props.y}
                              fontSize="14px"
                              dy={-10}
                              textAnchor="start"
                              transform={`rotate(-45, ${props.x}, ${props.y})`}
                              fill="rgb(128,128,128)"
                            >
                              {truncateWord(title)}
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
              <ZAxis type="number" dataKey="percentage" range={[3500, 3500]} />
              <ChartTooltip
                cursor={{ fill: hoverColor }}
                wrapperStyle={{ zIndex: 100 }}
                offset={40}
                content={({ payload, active }) => {
                  if (payload !== null && active) {
                    const title = payload[0]?.payload.itemName;
                    return (
                      <div
                        className={classes.chartTooltipLabel}
                        style={{
                          marginTop: index + 1 === configuredMapData.length ? -40 : index === 0 ? 40 : 0,
                        }}
                      >
                        <Typography variant="body1" fontWeight="500">{payload[0]?.payload.typeName}</Typography>
                        <Typography variant="caption" fontWeight="500">{t('common.total', { total: payload[0]?.payload.total })}</Typography>
                        <Typography variant="body2">{`${title}: ${payload[0]?.payload.count} (${payload[0]?.payload.percentage}%)`}</Typography>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={item.items} shape="square">
                {item.items.map((option, i) => (
                  <Cell
                    name={option.itemName}
                    key={`pathotype-cell-${i}`}
                    fill={option.percentage === 0 ? darkGrey : mixColorScale(option.percentage)}
                  />
                ))}
                <LabelList
                  dataKey="percentage"
                  fontSize={12}
                  content={({ x, y, value }) => (
                    <text
                      x={x + 33}
                      y={y + 38}
                      textAnchor="middle"
                      fontSize={15}
                      fontWeight={600}
                      fill={heatmapTextColor(value)}
                      pointerEvents="none"
                    >
                      {value}
                    </text>
                  )}
                />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        ))}
      </>
    ));
  }, [configuredMapData, yAxisWidth, canGetData]);

  function handleChangeRegion(event) {
    setCountrySelected('All');
    setRegionSelected(event.target.value);
  }

  function handleChangeCountry(event) {
    const country = event.target.value;
    if (!(regionSelected !== 'All' && country === 'All')) {
      const region = Object.keys(economicRegions).find(k => economicRegions[k].includes(country)) ?? 'All';
      setRegionSelected(region);
    }
    setCountrySelected(country);
  }

  function handleChangeXAxisSelected({ event = null, all = false }) {
    const value = event?.target.value;
    if (value?.length === 1 && value[0] === undefined) return;
    if (!all) { setXAxisSelected(value); return; }
    if (xAxisSelected.length === filteredXAxisOptions.length) { setXAxisSelected([]); return; }
    setXAxisSelected(filteredXAxisOptions.slice());
  }

  function handleChangeYAxisSelected({ event = null, all = false }) {
    const value = event?.target.value;
    if (!all) { setYAxisSelected(value); return; }
    if (yAxisSelected.length === filteredYAxisOptions.length) { setYAxisSelected([]); return; }
    setYAxisSelected(filteredYAxisOptions.slice());
  }

  return (
    <CardContent className={classes.bubbleMarkersHeatmapGraph}>
      <div className={classes.graphWrapper}>
        <div className={classes.graph} style={loadingPDF ? { overflow: 'visible' } : undefined} id="BAMRPH">
          {plotChart}
        </div>
      </div>
      {yAxisSelected.length === 0 && (
        <Box className={classes.nothingSelected}>
          <Typography fontWeight={600}>{t('common.noDataToShow')}</Typography>
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
          <Box className={classes.gradientBox} style={{ backgroundImage: heatmapLegendGradient() }} />
          <Typography fontSize="0.75rem">100%</Typography>
        </div>
      </div>
      <PlottingOptionsPanel show={showFilter && !canFilterData} className={classes.floatingFilter}>
          <Card elevation={3}>
            <CardContent>
              <PlottingOptionsHeader onClose={() => setShowFilter(false)} className={classes.titleWrapper} />
              <div className={classes.selectsWrapper}>
                <div className={classes.selectPreWrapper}>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">{t('common.selectRegion')}</Typography>
                      <Tooltip title={t('common.n20RegionsTooltip')} placement="top">
                        <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                      </Tooltip>
                    </div>
                    <Select
                      value={regionSelected}
                      onChange={handleChangeRegion}
                      inputProps={{ className: classes.selectInput }}
                      MenuProps={{ classes: { paper: classes.menuPaper, list: classes.selectMenu } }}
                      disabled={organism === 'none'}
                      renderValue={selected => selected === 'All' ? t('common.allRegions') : selected}
                    >
                      <MenuItem value="All">{t('common.allRegions')}</MenuItem>
                      {filteredRegions.map((region, i) => (
                        <MenuItem key={i + 'reg'} value={region.name}>{region.name} (total N={region.count})</MenuItem>
                      ))}
                    </Select>
                  </div>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">{t('common.selectCountry')}</Typography>
                    </div>
                    <Select
                      value={countrySelected}
                      onChange={handleChangeCountry}
                      inputProps={{ className: classes.selectInput }}
                      MenuProps={{ classes: { paper: classes.menuPaper, list: classes.selectMenu } }}
                      disabled={organism === 'none'}
                      renderValue={selected =>
                        selected === 'All' ? (regionSelected !== 'All' ? t('common.allCountriesInRegion') : t('common.allCountries')) : selected
                      }
                    >
                      <MenuItem value="All">
                        {regionSelected !== 'All' ? t('common.allCountriesInRegion') : t('common.allCountries')}
                      </MenuItem>
                      {filteredCountries.map((country, i) => (
                        <MenuItem key={i + 'cty'} value={country.name}>{country.name} (total N={country.count})</MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className={classes.selectPreWrapper}>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">{t('common.selectPathotype')}</Typography>
                      <Tooltip title={t('common.pathotypeTooltip')} placement="top">
                        <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                      </Tooltip>
                    </div>
                    <Select
                      multiple
                      value={xAxisSelected}
                      onChange={event => handleChangeXAxisSelected({ event })}
                      displayEmpty
                      disabled={organism === 'none'}
                      endAdornment={
                        <Button
                          variant="outlined"
                          className={classes.selectButton}
                          onClick={() => handleChangeXAxisSelected({ all: true })}
                          disabled={organism === 'none'}
                          color={xAxisSelected.length === filteredXAxisOptions.length ? 'error' : 'primary'}
                        >
                          {xAxisSelected.length === filteredXAxisOptions.length ? t('common.clearAll') : t('common.selectAll')}
                        </Button>
                      }
                      inputProps={{ className: classes.multipleSelectInput }}
                      MenuProps={{
                        disableAutoFocusItem: true,
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      renderValue={selected => <div>{`${t('common.selectedOfTotal', { selected: selected?.length ?? 0, total: xAxisOptions?.length ?? 0 })}`}</div>}
                      onClose={() => setPathotypeSearch('')}
                    >
                      <Box className={classes.selectSearch} onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <TextField
                          variant="standard"
                          placeholder={t('common.search')}
                          fullWidth
                          value={pathotypeSearch}
                          onChange={e => { e.stopPropagation(); setPathotypeSearch(e.target.value); }}
                          InputProps={
                            pathotypeSearch === ''
                              ? undefined
                              : { endAdornment: <IconButton size="small" onClick={e => { e.stopPropagation(); setPathotypeSearch(''); }}><Clear /></IconButton> }
                          }
                        />
                      </Box>
                      {filteredXAxisOptions.map((option, i) => (
                        <MenuItem key={`pathotype-x-${i}`} value={option}>
                          <Checkbox checked={xAxisSelected.indexOf(option) > -1} />
                          <ListItemText primary={getOptionLabel(option)} />
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className={classes.selectPreWrapper}>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">{t('common.selectDrug')}</Typography>
                    </div>
                    <Select
                      value={currentDrugClass}
                      onChange={e => setYAxisType(e.target.value)}
                      inputProps={{ className: classes.selectInput }}
                      MenuProps={{ classes: { list: classes.selectMenu } }}
                      disabled={organism === 'none'}
                    >
                      {drugClasses
                        .filter(opt =>
                          !['ecoli', 'decoli', 'shige', 'senterica', 'sentericaints'].includes(organism) ||
                          (opt !== 'Ciprofloxacin NS' && opt !== 'Ciprofloxacin R'),
                        )
                        .map((option, i) => (
                          <MenuItem key={`pathotype-drug-${i}`} value={option}>
                            {drugAcronymsOpposite[drugAcronyms[option] ?? option] ?? option}
                          </MenuItem>
                        ))}
                    </Select>
                  </div>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">{t('common.selectMarkers')}</Typography>
                      <Tooltip title={t('common.markersTooltip')} placement="top">
                        <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                      </Tooltip>
                    </div>
                    <Select
                      multiple
                      value={yAxisSelected}
                      onChange={event => handleChangeYAxisSelected({ event })}
                      displayEmpty
                      disabled={organism === 'none'}
                      endAdornment={
                        <Button
                          variant="outlined"
                          className={classes.selectButton}
                          onClick={() => handleChangeYAxisSelected({ all: true })}
                          disabled={organism === 'none'}
                          color={
                            yAxisSelected.length === filteredYAxisOptions.length ||
                            yAxisSelected.some(x => !yAxisOptions.slice(0, 20).includes(x))
                              ? 'error'
                              : 'primary'
                          }
                        >
                          {yAxisSelected.length === filteredYAxisOptions.length ||
                          yAxisSelected.some(x => !yAxisOptions.slice(0, 20).includes(x))
                            ? t('common.clearAll')
                            : t('common.select20')}
                        </Button>
                      }
                      inputProps={{ className: classes.multipleSelectInput }}
                      MenuProps={{
                        disableAutoFocusItem: true,
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      renderValue={selected => <div>{t('common.selectedOfTotal', { selected: selected?.length ?? 0, total: yAxisOptions.length })}</div>}
                      onClose={() => setMarkerSearch('')}
                    >
                      <Box className={classes.selectSearch} onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <TextField
                          variant="standard"
                          placeholder={t('common.search')}
                          fullWidth
                          value={markerSearch}
                          onChange={e => { e.stopPropagation(); setMarkerSearch(e.target.value); }}
                          InputProps={
                            markerSearch === ''
                              ? undefined
                              : { endAdornment: <IconButton size="small" onClick={e => { e.stopPropagation(); setMarkerSearch(''); }}><Clear /></IconButton> }
                          }
                        />
                      </Box>
                      {filteredYAxisOptions.map((option, i) => (
                        <MenuItem key={`pathotype-marker-${i}`} value={option}>
                          <Checkbox checked={yAxisSelected.indexOf(option) > -1} />
                          <ListItemText primary={option} />
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </PlottingOptionsPanel>
    </CardContent>
  );
};
