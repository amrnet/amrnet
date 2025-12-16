import { Clear, Close, InfoOutlined } from '@mui/icons-material';
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
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setCustomDropdownMapViewNG, setPrevalenceMapViewOptionsSelected } from '../../../../stores/slices/graphSlice';
import { setMapView } from '../../../../stores/slices/mapSlice';
import { darkGrey, lightGrey } from '../../../../util/colorHelper';
import { statKeys } from '../../../../util/drugClassesRules';
import { ciproAcronyms, drugAcronymsOpposite2, ngonoSusceptibleRule } from '../../../../util/drugs';
import { genotypes } from '../../../../util/genotypes';
import { mapLegends } from '../../../../util/mapLegends';
import { organismsWithLotsGenotypes } from '../../../../util/organismsCards';
import { redColorScale, samplesColorScale, sensitiveColorScale } from '../mapColorHelper';
import { useStyles } from './MapFiltersMUI';

const generalSteps = ['>0 and ≤2%', '>2% and ≤10%', '>10% and ≤50%', '>50%'];
const sensitiveSteps = ['0 - 10%', '10 - 20%', '20 - 50%', '50 - 90%', '90 - 100%'];
const noSamplesSteps = ['1 - 9', '10 - 19', '20 - 99', '100 - 299', '>= 300'];
const gradientStyle = ['0.01% - 25.00% ', '25.01 - 50.00%', '50.01% - 75.00%', '75.01% - 100.00%'];
const excludedViews = [
  'Genotype prevalence',
  'Serotype prevalence',
  'Pathotype prevalence',
  'O prevalence',
  'ST prevalence',
  'NG-MAST prevalence',
  'Lineage prevalence',
  // 'Resistance prevalence',
];
const mapViewsWithZeroPercentOption = [
  'CipNS',
  'CipR',
  'Azithromycin',
  'MDR',
  'XDR',
  'H58 / Non-H58',
  'ESBL',
  'Carbapenems',
  'Genotype prevalence',
  'Serotype prevalence',
  'Pathotype prevalence',
  'O prevalence',
  'ST prevalence',
  'NG-MAST prevalence',
  'Lineage prevalence',
  'Resistance prevalence',
];

const INFO_ICON_TEXT_KEYS = {
  decoli: 'dashboard.filters.plotOptions.info.decoli',
  kpneumo: 'dashboard.filters.plotOptions.info.kpneumo',
  shige: 'dashboard.filters.plotOptions.info.shige',
  sentericaints: 'dashboard.filters.plotOptions.info.sentericaints',
};

export const MapFilters = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [genotypeSearch, setGenotypeSearch] = useState('');

  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const mapView = useAppSelector(state => state.map.mapView);
  const organism = useAppSelector(state => state.dashboard.organism);
  const mapData = useAppSelector(state => state.map.mapData);
  const genotypesForFilter = useAppSelector(state => state.dashboard.genotypesForFilter);
  const colorPallete = useAppSelector(state => state.dashboard.colorPallete);
  const prevalenceMapViewOptionsSelected = useAppSelector(state => state.graph.prevalenceMapViewOptionsSelected);
  const customDropdownMapViewNG = useAppSelector(state => state.graph.customDropdownMapViewNG);
  const loadingMap = useAppSelector(state => state.map.loadingMap);
  const loadingData = useAppSelector(state => state.dashboard.loadingData);

  const isResPrevalence = useMemo(() => mapView === 'Resistance prevalence', [mapView]);
  const isNGMASTPrevalence = useMemo(() => mapView === 'NG-MAST prevalence', [mapView]);
  const isPathSerPrevalence = useMemo(
    () => ['Serotype prevalence', 'Pathotype prevalence'].includes(mapView),
    [mapView],
  );
  const isOPrevalence = useMemo(() => mapView === 'O prevalence', [mapView]);
  const isOHPrevalence = useMemo(() => mapView === 'H prevalence', [mapView]);

  const organismHasLotsOfGenotypes = useMemo(() => organismsWithLotsGenotypes.includes(organism), [organism]);

  const GLNPSEntries = useMemo(() => {
    const column = isNGMASTPrevalence
      ? 'NGMAST'
      : isPathSerPrevalence
        ? 'PATHOTYPE'
        : isOPrevalence
          ? 'O_PREV'
          : isOHPrevalence
            ? 'OH_PREV'
            : 'GENOTYPE';
    const items = {};

    mapData.forEach(obj => {
      const itemList = obj.stats?.[column]?.items || [];

      itemList.forEach(({ name, count, drugs }) => {
        if (!items[name]) {
          items[name] = { totalCount: 0, Pansusceptible: 0 };
        }

        items[name].totalCount += count;
        items[name].Pansusceptible += drugs?.Pansusceptible?.count || drugs?.Susceptible?.count || 0;
      });
    });

    return items;
  }, [isNGMASTPrevalence, isPathSerPrevalence, isOPrevalence, isOHPrevalence, mapData]);

  const optionsSelected = useMemo(() => {
    return isNGMASTPrevalence ? customDropdownMapViewNG : prevalenceMapViewOptionsSelected;
  }, [customDropdownMapViewNG, isNGMASTPrevalence, prevalenceMapViewOptionsSelected]);

  const resistanceOptions = useMemo(() => {
    const options = statKeys?.[organism] ?? statKeys?.['others'] ?? [];
    const filteredOptions = options
      .filter(({ resistanceView, name }) => resistanceView && name !== 'Pansusceptible')
      .map(({ name }) => name);

    if (organism === 'ngono') {
      filteredOptions.splice(5, 0, ...['XDR', 'MDR']);
    }

    return filteredOptions;
  }, [organism]);

  const nonResistanceOptions = useMemo(() => {
    return Object.entries(GLNPSEntries)
      .sort(([, a], [, b]) => b.totalCount - a.totalCount)
      .map(([key]) => key);
  }, [GLNPSEntries]);

  const filteredNonResistanceOptions = useMemo(() => {
    const filteredOptions = nonResistanceOptions.filter(option =>
      option.toLowerCase().includes(genotypeSearch.toLowerCase()),
    );

    if (
      (isPathSerPrevalence && organism !== 'senterica') ||
      (!organismHasLotsOfGenotypes && !isOPrevalence && !isOHPrevalence)
    ) {
      return filteredOptions;
    }

    return filteredOptions.slice(0, 20);
  }, [
    genotypeSearch,
    isOHPrevalence,
    isOPrevalence,
    isPathSerPrevalence,
    nonResistanceOptions,
    organism,
    organismHasLotsOfGenotypes,
  ]);

  useEffect(() => {
    if (isResPrevalence) {
      switch (organism) {
        case 'kpneumo':
          dispatch(setPrevalenceMapViewOptionsSelected(['Carbapenems']));
          break;
        case 'ecoli':
          dispatch(setPrevalenceMapViewOptionsSelected(['ESBL']));
          break;
        case 'styphi':
          dispatch(setPrevalenceMapViewOptionsSelected(['CipR']));
          break;
        case 'sentericaints':
        case 'senterica':
          dispatch(setPrevalenceMapViewOptionsSelected(['Ciprofloxacin NS']));
          break;
        default:
          dispatch(setPrevalenceMapViewOptionsSelected(['Ciprofloxacin']));
          break;
      }
      return;
    }

    if (isNGMASTPrevalence) {
      dispatch(setCustomDropdownMapViewNG(nonResistanceOptions[0] ? [nonResistanceOptions[0]] : []));
    }

    dispatch(setPrevalenceMapViewOptionsSelected(nonResistanceOptions[0] ? [nonResistanceOptions[0]] : []));
  }, [dispatch, isNGMASTPrevalence, isResPrevalence, nonResistanceOptions, resistanceOptions, organism]);

  const currentMapLegends = useMemo(() => {
    return mapLegends.filter(legend => legend.organisms.includes(organism));
  }, [organism]);

  const hasZeroPercentOption = useMemo(() => {
    return mapViewsWithZeroPercentOption.includes(mapView);
  }, [mapView]);

  const steps = useMemo(() => {
    switch (mapView) {
      case 'Pansusceptible':
        return sensitiveSteps;
      case 'No. Samples':
        return noSamplesSteps;
      case 'Dominant Genotype':
        return organism === 'styphi' ? genotypes : genotypesForFilter;
      case 'NG-MAST prevalence':
      case 'Genotype prevalence':
      case 'Serotype prevalence':
      case 'Pathotype prevalence':
      case 'O prevalence':
      case 'Lineage prevalence':
        return gradientStyle;
      case '':
        return [];
      default:
        return generalSteps;
    }
  }, [genotypesForFilter, mapView, organism]);

  const XDRDefinition = useMemo(() => {
    switch (organism) {
      case 'styphi':
        return 'XDR, extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone)';
      case 'ngono':
        return 'XDR, extensively drug resistant (resistant to two of Azithromycin, Ceftriaxone, Cefixime [category I drugs], AND resistant to Benzylpenicillin, Ciprofloxacin and Spectinomycin [category II drugs])';
      default:
        return '';
    }
  }, [organism]);

  const MDRDefinition = useMemo(() => {
    switch (organism) {
      case 'styphi':
        return 'MDR, multidrug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)';
      case 'ngono':
        return 'MDR, multidrug resistant (resistant to one of Azithromycin, Ceftriaxone, Cefixime [category I drugs], plus two or more of Benzylpenicillin, Ciprofloxacin, Spectinomycin [category II drugs])';
      default:
        return '';
    }
  }, [organism]);

  const nonResPrevalenceLabelKey = useMemo(() => {
    if (isOPrevalence) {
      return 'O';
    }

    if (isOHPrevalence) {
      return 'H';
    }

    if (isPathSerPrevalence) {
      return organism === 'senterica' ? 'serotypes' : 'pathotypes';
    }

    if (isNGMASTPrevalence) {
      return 'NGMAST';
    }

    if (['sentericaints', 'senterica'].includes(organism)) {
      return 'lineages';
    }
    if (['kpneumo'].includes(organism)) {
      return 'STs';
    }

    return 'genotypes';
  }, [isOPrevalence, isOHPrevalence, isPathSerPrevalence, isNGMASTPrevalence, organism]);

  const nonResPrevalenceLabel = t(`dashboard.filters.plotOptions.labels.${nonResPrevalenceLabelKey}`);

  const nonResPrevalenceTooltip = useMemo(() => {
    const baseTooltip = t('dashboard.filters.plotOptions.nonResTooltip', {
      label: nonResPrevalenceLabel,
    });
    const infoTextKey = INFO_ICON_TEXT_KEYS[organism];
    const infoText = infoTextKey ? t(infoTextKey) : '';

    if (!isOPrevalence && !isOHPrevalence && infoText) {
      return `${infoText}. ${baseTooltip}`;
    }

    return baseTooltip;
  }, [isOHPrevalence, isOPrevalence, nonResPrevalenceLabel, organism, t]);

  const getGenotypeColor = useCallback(
    genotype => {
      return colorPallete[genotype] || '#F5F4F6';
    },
    [colorPallete, organism],
  );

  const getStepBoxColor = useCallback(
    (step, index) => {
      switch (mapView) {
        case 'Pansusceptible':
          const aux = ['10', '20', '50', '90', '100'];
          return sensitiveColorScale(aux[index]);
        case 'No. Samples': {
          const aux = [1, 10, 20, 100, 300];
          return samplesColorScale(aux[index]);
        }
        case 'Dominant Genotype':
          return getGenotypeColor(step);
        default:
          const aux3 = ['0.01', '2.01', '10.01', '50.01'];
          return redColorScale(aux3[index]);
      }
    },
    [getGenotypeColor, mapView],
  );

  const getLegendTitle = useCallback(
    label => {
      switch (label) {
        case 'Extensively drug resistant (XDR)':
          return XDRDefinition;
        case 'Multidrug resistant (MDR)':
          return MDRDefinition;
        default:
          return null;
      }
    },
    [MDRDefinition, XDRDefinition],
  );

  const getNonResOptionLabel = useCallback(
    item => {
      const matchingItem = GLNPSEntries[item];

      const totalCount = matchingItem?.totalCount ?? 0;
      const pansusceptibleCount = matchingItem?.Pansusceptible ?? 0;
      const susceptiblePercentage = totalCount > 0 ? (pansusceptibleCount / totalCount) * 100 : 0;

      // if (amrLikeOrganisms.includes(organism)) {
      //   return `${item} (total N=${totalCount})`;
      // }

      return `${item} (total N=${totalCount}, ${susceptiblePercentage.toFixed(2)}% Pansusceptible)`;
    },
    [GLNPSEntries],
  );

  const getOptionDisabled = useCallback(
    option => {
      return optionsSelected.length >= 20 && !optionsSelected.includes(option);
    },
    [optionsSelected],
  );

  function handleChangeMapView(event) {
    setGenotypeSearch('');
    dispatch(setMapView(event.target.value));
  }

  function handleResistanceChange({ event = null, all = false }) {
    const value = event?.target.value;

    if (value?.length === 1 && value[0] === undefined) {
      return;
    }

    if (!all) {
      dispatch(setPrevalenceMapViewOptionsSelected(value));
      return;
    }

    if (resistanceOptions.length === prevalenceMapViewOptionsSelected.length) {
      dispatch(setPrevalenceMapViewOptionsSelected([]));
      return;
    }

    dispatch(setPrevalenceMapViewOptionsSelected(resistanceOptions));
  }

  const currentOptions = useMemo(
    () => (organismHasLotsOfGenotypes ? nonResistanceOptions : filteredNonResistanceOptions),
    [filteredNonResistanceOptions, nonResistanceOptions, organismHasLotsOfGenotypes],
  );

  function handleNonResistanceChange({ event = null, all = false }) {
    const value = event?.target.value;

    if (value?.length === 1 && value[0] === undefined) {
      return;
    }

    if (!all) {
      if (isNGMASTPrevalence) {
        dispatch(setCustomDropdownMapViewNG(value));
        return;
      }

      dispatch(setPrevalenceMapViewOptionsSelected(value));
      return;
    }

    if (currentOptions.length === optionsSelected.length) {
      dispatch(isNGMASTPrevalence ? setCustomDropdownMapViewNG([]) : setPrevalenceMapViewOptionsSelected([]));
      return;
    }

    dispatch(
      isNGMASTPrevalence
        ? setCustomDropdownMapViewNG(currentOptions)
        : setPrevalenceMapViewOptionsSelected(currentOptions),
    );
  }

  function hangleChangeSearch(event) {
    event.stopPropagation();
    setGenotypeSearch(event.target.value);
  }

  function clearSearch(event) {
    event.stopPropagation();
    setGenotypeSearch('');
  }

  if (!showFilter || loadingMap || loadingData) {
    return null;
  }

  return (
    <Box className={classes.floatingFilter}>
      <Card elevation={3}>
        <CardContent>
          <div className={classes.titleWrapper}>
            <Typography variant="h6">{t('dashboard.filters.plotOptions.title')}</Typography>
            <Tooltip title={t('dashboard.filters.plotOptions.hideTooltip')} placement="top">
              <IconButton onClick={() => setShowFilter(false)}>
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
          <div className={classes.selectWrapper}>
            <div className={classes.selectPreWrapper}>
              <div className={classes.selectWrapper}>
                <div className={classes.labelWrapper}>
                  <Typography variant="caption">{t('dashboard.filters.plotOptions.colorBy')}</Typography>
                  <Tooltip title={t('dashboard.filters.plotOptions.percentageTooltip')} placement="top">
                    <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                  </Tooltip>
                </div>
                <Select
                  value={mapView}
                  onChange={handleChangeMapView}
                  inputProps={{ className: classes.selectInput }}
                  MenuProps={{ classes: { list: classes.selectMenu } }}
                  disabled={organism === 'none'}
                >
                  {currentMapLegends.map((legend, index) => {
                    const tooltipTitle = getLegendTitle(legend.label);
                    return (
                      <MenuItem key={index + 'mapview'} value={legend.value}>
                        {tooltipTitle ? (
                          <Tooltip title={tooltipTitle} placement="top">
                            <span>{legend.label}</span>
                          </Tooltip>
                        ) : (
                          legend.label
                        )}
                      </MenuItem>
                    );
                  })}
                </Select>
                {organism !== 'none' && mapData.length > 0 && (
                  <div className={classes.legendWrapper}>
                    <div className={classes.legend}>
                      <Box className={classes.legendColorBox} style={{ backgroundColor: lightGrey }} />
                      <span className={classes.legendText}>{t('dashboard.legend.insufficientData')}</span>
                    </div>
                    {hasZeroPercentOption && (
                      <div className={classes.legend}>
                        <Box className={classes.legendColorBox} style={{ backgroundColor: darkGrey }} />
                        <span className={classes.legendText}>{t('dashboard.legend.zeroPercent')}</span>
                      </div>
                    )}
                    {excludedViews.includes(mapView) ? (
                      <div key={`step-1`} className={classes.legend}>
                        <Box
                          className={classes.legendColorBox}
                          style={{
                            height: '50px',
                            marginTop: '2px',
                            backgroundImage: 'linear-gradient( #FAAD8F, #FA694A, #DD2C24, #A20F17)',
                          }}
                        />
                        <span className={classes.legendText}>
                          <div style={{ textAlign: 'left', height: '50px' }}>
                            <div>1%</div>
                            <br />
                            <br />
                            <div>100%</div>
                          </div>
                        </span>
                      </div>
                    ) : (
                      steps.map((step, index) => (
                        <div key={`step-${index}`} className={classes.legend}>
                          <Box
                            className={classes.legendColorBox}
                            style={{
                              backgroundColor: getStepBoxColor(step, index),
                              // mapView === 'Resistance prevalence' ? getColorForDrug(step) : getStepBoxColor(step, index),
                            }}
                          />
                          <span className={classes.legendText}>{step}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {mapView !== 'No. Samples' && (
                <div className={classes.selectWrapper}>
                  {mapView === 'Resistance prevalence' ? (
                    <>
                      <div className={classes.labelWrapper}>
                        <Typography variant="caption">{t('dashboard.filters.plotOptions.selectDrugs')}</Typography>
                        <Tooltip title={t('dashboard.filters.plotOptions.chooseDrugsTooltip')} placement="top">
                          <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                        </Tooltip>
                      </div>
                      <Select
                        multiple
                        value={prevalenceMapViewOptionsSelected}
                        onChange={event => handleResistanceChange({ event })}
                        displayEmpty
                        disabled={organism === 'none'}
                        endAdornment={
                          <Button
                            variant="outlined"
                            className={classes.selectButton}
                            onClick={() => handleResistanceChange({ all: true })}
                            disabled={organism === 'none'}
                            color={
                              resistanceOptions.length === prevalenceMapViewOptionsSelected.length ? 'error' : 'primary'
                            }
                          >
                            {resistanceOptions.length === prevalenceMapViewOptionsSelected.length
                              ? t('dashboard.filters.plotOptions.clearAll')
                              : t('dashboard.filters.plotOptions.selectAll')}
                          </Button>
                        }
                        inputProps={{ className: classes.multipleSelectInput }}
                        MenuProps={{
                          disableAutoFocusItem: true,
                          classes: { paper: classes.menuPaper, list: classes.selectMenu },
                        }}
                        renderValue={selected => (
                          <div>
                            {t('dashboard.filters.plotOptions.selectedCount', {
                              count: selected.length,
                              total: resistanceOptions.length,
                            })}
                          </div>
                        )}
                      >
                        {resistanceOptions.map((option, index) => (
                          <MenuItem key={index + 'resistance-option'} value={option}>
                            <Checkbox checked={prevalenceMapViewOptionsSelected.indexOf(option) > -1} />
                            <ListItemText
                              primary={
                                ciproAcronyms[option] ||
                                ngonoSusceptibleRule(option, organism) ||
                                drugAcronymsOpposite2[option] ||
                                option
                              }
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </>
                  ) : (
                    <>
                      <div className={classes.labelWrapper}>
                        <Typography variant="caption">
                          {t('dashboard.filters.plotOptions.selectLabel', { label: nonResPrevalenceLabel })}
                        </Typography>
                        {!isPathSerPrevalence && (
                          <Tooltip title={nonResPrevalenceTooltip} placement="top">
                            <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                          </Tooltip>
                        )}
                      </div>
                      <Select
                        multiple
                        value={optionsSelected}
                        onChange={event => handleNonResistanceChange({ event })}
                        displayEmpty
                        disabled={organism === 'none'}
                        endAdornment={
                          <Button
                            variant="outlined"
                            className={classes.selectButton}
                            onClick={() => handleNonResistanceChange({ all: true })}
                            disabled={organism === 'none'}
                            color={currentOptions.length === optionsSelected.length ? 'error' : 'primary'}
                          >
                            {currentOptions.length === optionsSelected.length
                              ? t('dashboard.filters.plotOptions.clearAll')
                              : t('dashboard.filters.plotOptions.selectAll')}
                          </Button>
                        }
                        inputProps={{ className: classes.multipleSelectInput }}
                        MenuProps={{
                          disableAutoFocusItem: true,
                          classes: { paper: classes.menuPaper, list: classes.selectMenu },
                        }}
                        renderValue={selected => (
                          <div>
                            {t('dashboard.filters.plotOptions.selectedCount', {
                              count: selected.length,
                              total: nonResistanceOptions.length,
                            })}
                          </div>
                        )}
                        onClose={clearSearch}
                      >
                        <Box
                          className={classes.selectSearch}
                          onClick={e => e.stopPropagation()}
                          onKeyDown={e => e.stopPropagation()}
                        >
                          <TextField
                            variant="standard"
                            placeholder={
                              organismHasLotsOfGenotypes
                                ? t('dashboard.filters.plotOptions.searchMore')
                                : t('dashboard.filters.plotOptions.search')
                            }
                            fullWidth
                            value={genotypeSearch}
                            onChange={hangleChangeSearch}
                            InputProps={
                              genotypeSearch === ''
                                ? undefined
                                : {
                                    endAdornment: (
                                      <IconButton size="small" onClick={clearSearch}>
                                        <Clear />
                                      </IconButton>
                                    ),
                                  }
                            }
                          />
                        </Box>
                        {filteredNonResistanceOptions.map((option, index) => (
                          <MenuItem key={`non-res-option-${index}`} value={option} disabled={getOptionDisabled(option)}>
                            <Checkbox checked={optionsSelected.indexOf(option) > -1} />
                            <ListItemText primary={getNonResOptionLabel(option)} />
                          </MenuItem>
                        ))}
                      </Select>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Box>
  );
};
