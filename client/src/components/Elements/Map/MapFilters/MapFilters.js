import { useStyles } from './MapFiltersMUI';
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
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setMapView } from '../../../../stores/slices/mapSlice';
import { mapLegends } from '../../../../util/mapLegends';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { darkGrey, getColorForGenotype, lightGrey } from '../../../../util/colorHelper';
import { genotypes } from '../../../../util/genotypes';
import { redColorScale, samplesColorScale, sensitiveColorScale } from '../mapColorHelper';
import { mapStatKeysKP, statKeys } from '../../../../util/drugClassesRules';
import { drugAcronymsOpposite2, ngonoSusceptibleRule } from '../../../../util/drugs';
import { setCustomDropdownMapViewNG, setPrevalenceMapViewOptionsSelected } from '../../../../stores/slices/graphSlice';
import { amrLikeOrganisms } from '../../../../util/organismsCards';

const generalSteps = ['>0 and ≤2%', '>2% and ≤10%', '>10% and ≤50%', '>50%'];
const sensitiveSteps = ['0 - 10%', '10 - 20%', '20 - 50%', '50 - 90%', '90 - 100%'];
const noSamplesSteps = ['1 - 9', '10 - 19', '20 - 99', '100 - 299', '>= 300'];
const gradientStyle = ['0.01% - 25.00% ', '25.01 - 50.00%', '50.01% - 75.00%', '75.01% - 100.00%'];
const excludedViews = [
  'Genotype prevalence',
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
  'ST prevalence',
  'NG-MAST prevalence',
  'Lineage prevalence',
  'Resistance prevalence',
];

const INFO_ICON_TEXTS = {
  decoli: 'Lineages are labelled as Pathovar (ST) and 7-locus MLST',
  kpneumo: 'Sequence type are labelled as 7-locus MLST',
  shige: 'Lineages are labelled as Species + HC400 cluster',
  sentericaints: 'Lineages are labelled as 7-locus MLST and HC150(305,1547,48,9882,728,12675,2452) cluster',
};

export const MapFilters = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [genotypeSearch, setGenotypeSearch] = useState('');

  const dispatch = useAppDispatch();
  const mapView = useAppSelector((state) => state.map.mapView);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const mapData = useAppSelector((state) => state.map.mapData);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const colorPallete = useAppSelector((state) => state.dashboard.colorPallete);
  const genotypesInitialDrugsData = useAppSelector((state) => state.graph.genotypesInitialDrugsData);
  const prevalenceMapViewOptionsSelected = useAppSelector((state) => state.graph.prevalenceMapViewOptionsSelected);
  const ngmastDrugData = useAppSelector((state) => state.graph.ngmastDrugsData);
  const customDropdownMapViewNG = useAppSelector((state) => state.graph.customDropdownMapViewNG);
  const loadingMap = useAppSelector((state) => state.map.loadingMap);
  const loadingData = useAppSelector((state) => state.dashboard.loadingData);

  const isResPrevalence = useMemo(() => mapView === 'Resistance prevalence', [mapView]);
  const isNGMASTPrevalence = useMemo(() => mapView === 'NG-MAST prevalence', [mapView]);

  const optionsSelected = useMemo(() => {
    return isNGMASTPrevalence ? customDropdownMapViewNG : prevalenceMapViewOptionsSelected;
  }, [customDropdownMapViewNG, isNGMASTPrevalence, prevalenceMapViewOptionsSelected]);

  const resistanceOptions = useMemo(() => {
    const options = organism === 'kpneumo' ? mapStatKeysKP : statKeys[organism] ?? statKeys['others'];

    return options.filter(({ resistanceView }) => resistanceView).map(({ name }) => name);
  }, [organism]);

  const nonResistanceOptions = useMemo(() => {
    if (isNGMASTPrevalence) {
      return ngmastDrugData.slice(0, 20).map((data) => data.name);
    }

    return genotypesInitialDrugsData.slice(0, 20).map((data) => data.name);
  }, [genotypesInitialDrugsData, isNGMASTPrevalence, ngmastDrugData]);

  const filteredNonResistanceOptions = useMemo(() => {
    return nonResistanceOptions.filter((option) => option.toLowerCase().includes(genotypeSearch.toLowerCase()));
  }, [genotypeSearch, nonResistanceOptions]);

  useEffect(() => {
    if (isResPrevalence) {
      dispatch(setPrevalenceMapViewOptionsSelected(resistanceOptions[0] ? [resistanceOptions[0]] : []));
    } else {
      dispatch(setPrevalenceMapViewOptionsSelected(genotypesInitialDrugsData.slice(0, 1).map((x) => x.name)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genotypesInitialDrugsData, isResPrevalence, resistanceOptions]);

  useEffect(() => {
    dispatch(setCustomDropdownMapViewNG(ngmastDrugData.slice(0, 1).map((x) => x.name)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ngmastDrugData]);

  const currentMapLegends = useMemo(() => {
    return mapLegends.filter((legend) => legend.organisms.includes(organism));
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
        return 'XDR, extensively drug resistant (resistant to two of Azithromycin, Ceftriaxone, Cefixime [category I drugs], AND resistant to Penicillin, Ciprofloxacin and Spectinomycin [category II drugs])';
      default:
        return '';
    }
  }, [organism]);

  const MDRDefinition = useMemo(() => {
    switch (organism) {
      case 'styphi':
        return 'MDR, multidrug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole)';
      case 'ngono':
        return 'MDR, multidrug resistant (resistant to one of Azithromycin, Ceftriaxone, Cefixime [category I drugs], plus two or more of Penicillin, Ciprofloxacin, Spectinomycin [category II drugs])';
      default:
        return '';
    }
  }, [organism]);

  const nonResPrevalenceLabel = useMemo(() => {
    if (['sentericaints'].includes(organism)) {
      return 'lineages';
    }
    if (['kpneumo'].includes(organism)) {
      return 'STs';
    }

    return 'genotypes';
  }, [organism]);

  const nonResPrevalenceTooltip = useMemo(() => {
    const text = `Select up to 15 to display. Only show top 20 ${nonResPrevalenceLabel}.`;

    if (Object.keys(INFO_ICON_TEXTS).includes(organism)) {
      return `${INFO_ICON_TEXTS[organism]}. ${text}`;
    }

    return text;
  }, [nonResPrevalenceLabel, organism]);

  const getGenotypeColor = useCallback(
    (genotype) => {
      return organism === 'styphi' ? getColorForGenotype(genotype) : colorPallete[genotype] || '#F5F4F6';
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
    (label) => {
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
    (item) => {
      const matchingItem = (isNGMASTPrevalence ? ngmastDrugData : genotypesInitialDrugsData).find(
        (g) => g.name === item,
      );
      const totalCount = matchingItem?.totalCount ?? 0;
      const pansusceptibleCount = matchingItem?.Pansusceptible ?? 0;
      const susceptiblePercentage = totalCount > 0 ? (pansusceptibleCount / totalCount) * 100 : 0;

      if (amrLikeOrganisms.includes(organism)) {
        return `${item} (total N=${totalCount})`;
      }

      return `${item} (total N=${totalCount}, ${susceptiblePercentage.toFixed(2)}% Pansusceptible)`;
    },
    [genotypesInitialDrugsData, isNGMASTPrevalence, ngmastDrugData, organism],
  );

  const getOptionDisabled = useCallback(
    (option) => {
      return optionsSelected.length >= 15 && !optionsSelected.includes(option);
    },
    [optionsSelected],
  );

  function handleChangeMapView(event) {
    setGenotypeSearch('');
    dispatch(setMapView(event.target.value));
  }

  function handleResistanceChange(event) {
    dispatch(setPrevalenceMapViewOptionsSelected([event.target.value]));
  }

  function handleNonResistanceChange(event) {
    if (isNGMASTPrevalence) {
      dispatch(setCustomDropdownMapViewNG(event.target.value));
      return;
    }

    dispatch(setPrevalenceMapViewOptionsSelected(event.target.value));
  }

  function clearNonResSelected() {
    if (isNGMASTPrevalence) {
      dispatch(setCustomDropdownMapViewNG([]));
      return;
    }

    dispatch(setPrevalenceMapViewOptionsSelected([]));
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
            <Typography variant="h6">Plotting options</Typography>
            <Tooltip title="Hide filters" placement="top">
              <IconButton onClick={() => setShowFilter(false)}>
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
          <div className={classes.selectWrapper}>
            <div className={classes.selectPreWrapper}>
              <div className={classes.selectWrapper}>
                <div className={classes.labelWrapper}>
                  <Typography variant="caption">Colour country by</Typography>
                  <Tooltip
                    title="Percentage frequency data is shown only for countries with N≥20 genomes except 'No. Samples'"
                    placement="top"
                  >
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
                  {currentMapLegends.map((legend, index) => (
                    <MenuItem key={index + 'mapview'} value={legend.value}>
                      <Tooltip title={getLegendTitle(legend.label)} placement="top">
                        {legend.label}
                      </Tooltip>
                    </MenuItem>
                  ))}
                </Select>
                {organism !== 'none' && mapData.length > 0 && (
                  <div className={classes.legendWrapper}>
                    <div className={classes.legend}>
                      <Box className={classes.legendColorBox} style={{ backgroundColor: lightGrey }} />
                      <span className={classes.legendText}>Insufficient data</span>
                    </div>
                    {hasZeroPercentOption && (
                      <div className={classes.legend}>
                        <Box className={classes.legendColorBox} style={{ backgroundColor: darkGrey }} />
                        <span className={classes.legendText}>0%</span>
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
                        <Typography variant="caption">Select Drug</Typography>
                        <Tooltip title="Select one drug category to display its prevalence" placement="top">
                          <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                        </Tooltip>
                      </div>
                      <Select
                        value={prevalenceMapViewOptionsSelected?.[0]}
                        onChange={handleResistanceChange}
                        inputProps={{ className: classes.selectInput }}
                        MenuProps={{ classes: { list: classes.selectMenu } }}
                        disabled={organism === 'none'}
                      >
                        {resistanceOptions.map((option, index) => (
                          <MenuItem key={index + 'resistance-option'} value={option}>
                            {ngonoSusceptibleRule(option, organism) || drugAcronymsOpposite2[option] || option}
                          </MenuItem>
                        ))}
                      </Select>
                    </>
                  ) : (
                    <>
                      <div className={classes.labelWrapper}>
                        <Typography variant="caption">{`Select ${nonResPrevalenceLabel}`}</Typography>
                        <Tooltip title={nonResPrevalenceTooltip} placement="top">
                          <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                        </Tooltip>
                      </div>
                      <Select
                        multiple
                        value={optionsSelected}
                        onChange={handleNonResistanceChange}
                        displayEmpty
                        disabled={organism === 'none'}
                        endAdornment={
                          <Button
                            variant="outlined"
                            className={classes.selectButton}
                            onClick={clearNonResSelected}
                            disabled={organism === 'none' || optionsSelected.length === 0}
                            color="error"
                          >
                            Clear All
                          </Button>
                        }
                        inputProps={{ className: classes.multipleSelectInput }}
                        MenuProps={{
                          disableAutoFocusItem: true,
                          classes: { paper: classes.menuPaper, list: classes.selectMenu },
                        }}
                        renderValue={(selected) => (
                          <div>{`${selected.length} of ${nonResistanceOptions.length} selected`}</div>
                        )}
                        onClose={clearSearch}
                      >
                        <Box
                          className={classes.selectSearch}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <TextField
                            variant="standard"
                            placeholder="Search..."
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
