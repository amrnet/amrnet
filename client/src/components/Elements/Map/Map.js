import { ExpandLess, ExpandMore, FilterList, FilterListOff, Public } from '@mui/icons-material';
import {
  Card,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, Graticule, Sphere, ZoomableGroup } from 'react-simple-maps';
import ReactTooltip from 'react-tooltip';
import geography from '../../../assets/world-50m.json';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setActualCountry, setActualRegion, setCanFilterData } from '../../../stores/slices/dashboardSlice.ts';
import { setCollapse } from '../../../stores/slices/graphSlice';
import { setPosition, setTooltipContent } from '../../../stores/slices/mapSlice.ts';
import { darkGrey, getColorForGenotype, lightGrey, zeroCountColor, zeroPercentColor } from '../../../util/colorHelper';
import { drugAcronymsOpposite, drugAcronymsOpposite2, ngonoSusceptibleRule } from '../../../util/drugs';
import { isTouchDevice } from '../../../util/isTouchDevice';
import { BottomLeftControls } from './BottomLeftControls';
import { MapActions } from './MapActions/MapActions';
import { differentColorScale, redColorScale, samplesColorScale, sensitiveColorScale } from './mapColorHelper';
import { MapFilters } from './MapFilters/MapFilters';
import { useStyles } from './MapMUI';

const statKey = {
  MDR: 'MDR',
  'H58 / Non-H58': 'H58',
  XDR: 'XDR',
  CipNS: 'CipNS',
  CipR: 'CipR',
  Pansusceptible: 'Pansusceptible',
  ESBL: 'ESBL',
  Ciprofloxacin: 'Ciprofloxacin',
  ESBL_category: 'Ceftriaxone',
  Azithromycin: 'Azithromycin',
  //TODO check this variable
  Ceftriaxone: 'Ceftriaxone',
  Carbapenems: 'Carbapenems',
};

export const Map = () => {
  const classes = useStyles();
  const matches500 = useMediaQuery('(max-width:500px)');
  const [showFilter, setShowFilter] = useState(!matches500);

  const dispatch = useAppDispatch();
  const position = useAppSelector(state => state.map.position);
  const mapData = useAppSelector(state => state.map.mapData);
  const mapRegionData = useAppSelector(state => state.map.mapRegionData);
  const mapView = useAppSelector(state => state.map.mapView);
  const mapColoredBy = useAppSelector(state => state.map.mapColoredBy);
  const tooltipContent = useAppSelector(state => state.map.tooltipContent);
  const organism = useAppSelector(state => state.dashboard.organism);
  const colorPallete = useAppSelector(state => state.dashboard.colorPallete);
  const prevalenceMapViewOptionsSelected = useAppSelector(state => state.graph.prevalenceMapViewOptionsSelected);
  const customDropdownMapViewNG = useAppSelector(state => state.graph.customDropdownMapViewNG);
  const economicRegions = useAppSelector(state => state.dashboard.economicRegions);
  const collapses = useAppSelector(state => state.graph.collapses);
  const datasetKP = useAppSelector(state => state.map.datasetKP);
  const dataset = useAppSelector(state => state.map.dataset);
  const selectedLineages = useAppSelector(state => state.dashboard.selectedLineages);
  const pathovar = useAppSelector(state => state.dashboard.pathovar);

  const mapViewColumn = useMemo(() => {
    return mapView === 'O prevalence'
      ? 'O_PREV'
      : mapView === 'H prevalence'
        ? 'OH_PREV'
        : ['Serotype prevalence', 'Pathotype prevalence'].includes(mapView)
          ? 'PATHOTYPE'
          : 'GENOTYPE';
  }, [mapView]);

  function getGenotypeColor(genotype) {
    return organism === 'styphi' ? getColorForGenotype(genotype) : colorPallete[genotype] || '#F5F4F6';
  }

  function handleOnClick(countryData) {
    if (countryData !== undefined) {
      const country = countryData.name;
      const region = Object.keys(economicRegions).find(key => economicRegions[key].includes(country)) ?? 'All';

      dispatch(setActualRegion(region));
      dispatch(setActualCountry(country));
      dispatch(setCanFilterData(true));
    }
  }

  function handleOnMouseLeave() {
    dispatch(setTooltipContent(null));
  }

  function handleOnMouseEnter({ geo, countryStats, countryData, smallerThan20 = false, showTooltip = false }) {
    const tooltip = {
      name: countryData?.name ?? (mapColoredBy === 'country' ? geo.properties.NAME : 'No region found'),
      total: null,
      content: {},
      smallerThan20,
    };

    if (countryData !== undefined) {
      switch (mapView) {
        case 'No. Samples':
          Object.assign(tooltip, {
            content:
              organism === 'styphi'
                ? {
                    Samples: countryData?.count ?? 0,
                    Genotypes: countryStats?.GENOTYPE?.count ?? 0,
                  }
                : organism === 'kpneumo'
                  ? {
                      Samples: countryData?.count ?? 0,
                      STs: countryStats?.GENOTYPE?.count ?? 0,
                    }
                  : organism === 'ngono'
                    ? {
                        Samples: countryData?.count ?? 0,
                        Genotypes: countryStats?.GENOTYPE?.count ?? 0,
                        'NG-MAST': countryStats?.NGMAST?.count ?? 0,
                      }
                    : ['decoli', 'ecoli', 'shige'].includes(organism)
                      ? {
                          Samples: countryData?.count ?? 0,
                          Genotypes: countryStats?.GENOTYPE?.count ?? 0,
                          'O prevalence': countryStats?.O_PREV?.count ?? 0,
                          'H prevalence': countryStats?.OH_PREV?.count ?? 0,
                        }
                      : {
                          Samples: countryData?.count ?? 0,
                          [['sentericaints', 'senterica'].includes(organism) ? 'Lineages' : 'Genotypes']:
                            countryStats?.GENOTYPE?.count ?? 0,
                        },
          });
          break;
        case 'Dominant Genotype':
          {
            const items = countryStats?.GENOTYPE?.items ?? [];
            const genotypes = items.slice(0, 5);
            genotypes.forEach(genotype => {
              tooltip.content[genotype?.name ?? 'Unknown'] = genotype?.count ?? 0;
            });
          }
          break;
        case 'NG-MAST prevalence':
          {
            let percentCounterNG = 0;
            const genotypesNG = countryStats?.NGMAST?.items ?? [];
            genotypesNG.forEach(genotype => {
              percentCounterNG += genotype?.count ?? 0;
            });
            tooltip.total = percentCounterNG;
            genotypesNG.forEach(genotype => {
              if (customDropdownMapViewNG.includes(genotype?.name)) {
                const pct = percentCounterNG ? ((genotype?.count ?? 0) / percentCounterNG) * 100 : 0;
                tooltip.content[genotype?.name ?? 'Unknown'] = `${genotype?.count ?? 0} (${pct.toFixed(2)}%)`;
              }
            });
          }
          break;
        case 'Resistance prevalence':
          tooltip.total = countryData?.count ?? 0;
          if (prevalenceMapViewOptionsSelected.length === 1) {
            const drug = prevalenceMapViewOptionsSelected[0];
            const drugLabel = ngonoSusceptibleRule(drug, organism) || drugAcronymsOpposite2[drug] || drug;
            const count = countryStats?.[drug]?.count ?? 0;
            const percentage = countryStats?.[drug]?.percentage ?? 0;
            tooltip.content[drugLabel] = `${count} (${percentage}%)`;
          } else {
            const names = prevalenceMapViewOptionsSelected.reduce((acc, key, index) => {
              const list = countryStats?.[key]?.names || [];
              if (index === 0) return new Set(list);
              return new Set(list.filter(name => acc.has(name)));
            }, new Set());

            const labels = prevalenceMapViewOptionsSelected
              .map(x => ngonoSusceptibleRule(x, organism) || drugAcronymsOpposite2[x] || x)
              .join(' + ');

            const pct = tooltip.total ? Number(((names.size / tooltip.total) * 100).toFixed(2)) : 0;
            tooltip.content[labels] = `${names.size} (${pct}%)`;
          }
          break;
        case 'H58 / Non-H58':
        case 'MDR':
        case 'Pansusceptible':
        case 'XDR':
        case 'Azithromycin':
        case 'Ciprofloxacin':
        case 'Ceftriaxone':
        case 'CipR':
        case 'ESBL':
        case 'ESBL_category':
        case 'Carbapenems':
          if (showTooltip) {
            const key = statKey[mapView];
            const count = countryStats?.[key]?.count ?? 0;
            const percentage = countryStats?.[key]?.percentage ?? 0;
            tooltip.content[key] = {
              count,
              percentage: `${Number(percentage).toFixed(2)}%`,
            };
          }
          break;
        case 'CipNS':
          if (showTooltip) {
            const countR = countryStats?.[statKey['CipR']]?.count ?? 0;
            const countNS = countryStats?.[statKey['CipNS']]?.count ?? 0;
            const perR = countryStats?.[statKey['CipR']]?.percentage ?? 0;
            const perNS = countryStats?.[statKey['CipNS']]?.percentage ?? 0;
            const combinedCount = countR + countNS;
            const combinedPercentage = Number(perR) + Number(perNS);
            tooltip.content['CipNS'] = {
              count: combinedCount,
              percentage: `${combinedPercentage.toFixed(2)}%`,
            };
          }
          break;
        default:
          break;
      }
    }

    dispatch(setTooltipContent(tooltip));
  }

  function handleOnMoveEnd(value) {
    dispatch(setPosition(value));
  }

  function showPercentage() {
    return ![
      'Dominant Genotype',
      'Genotype prevalence',
      'Serotype prevalence',
      'O prevalence',
      'H prevalence',
      'Pathotype prevalence',
      'ST prevalence',
      'Resistance prevalence',
      'No. Samples',
      'NG-MAST prevalence',
      'Lineage prevalence',
    ].includes(mapView);
  }

  function handleExpandClick() {
    dispatch(setCollapse({ key: 'map', value: !collapses['map'] }));
  }

  function handleClickFilter(event) {
    event.stopPropagation();
    setShowFilter(!showFilter);
  }

  const mapViewLegend = useMemo(() => {
    if (mapView === 'No. Samples') {
      return null;
    }

    const optionsSelected =
      mapView === 'NG-MAST prevalence' ? customDropdownMapViewNG : prevalenceMapViewOptionsSelected;

    const prevalenceView = `${optionsSelected?.slice(0, 5).join(', ')}${
      optionsSelected?.length > 5 ? ` +${optionsSelected?.length - 5} other(s)` : ''
    }`;

    return `Showing: ${
      ngonoSusceptibleRule(optionsSelected.join(', '), organism) ||
      drugAcronymsOpposite[optionsSelected.join(', ')] ||
      prevalenceView
    }`;
  }, [customDropdownMapViewNG, mapView, organism, prevalenceMapViewOptionsSelected]);

  const globalOverviewLabel = useMemo(() => {
    let dataview = '';

    if (organism === 'kpneumo' && datasetKP !== 'All') {
      dataview = ` (${datasetKP === 'ESBL' ? datasetKP : 'CARB'}+)`;
    }
    if (organism === 'styphi' && dataset !== 'All') {
      dataview = ` (${dataset})`;
    }
    if (['sentericaints', 'shige', 'decoli'].includes(organism) && selectedLineages.length !== pathovar.length) {
      dataview = ` (${selectedLineages.join(', ')})`;
    }

    return `Global Overview${dataview}: ${mapView}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organism, datasetKP, dataset, selectedLineages, mapView]);

  return (
    <Card className={classes.card}>
      <CardActions
        disableSpacing
        className={classes.cardActions}
        onClick={handleExpandClick}
        style={{
          cursor: isTouchDevice() ? 'default' : 'pointer',
        }}
      >
        <div className={classes.titleWrapper}>
          <Public color="primary" />
          <div className={classes.title}>
            <Typography fontSize="18px" fontWeight="500">
              {globalOverviewLabel}
            </Typography>
            {collapses['map'] && (
              <Typography fontSize="10px" component="span">
                {mapViewLegend}
              </Typography>
            )}
          </div>
        </div>
        <div className={classes.actionsWrapper}>
          {collapses['map'] && (
            <>
              <MapActions />
              <Tooltip title={showFilter ? 'Hide Filters' : 'Show Filters'} placement="top">
                <span>
                  <IconButton color="primary" onClick={event => handleClickFilter(event)}>
                    {showFilter ? <FilterListOff /> : <FilterList />}
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}
          <IconButton>{collapses['map'] ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </div>
      </CardActions>

      <Collapse in={collapses['map']} timeout="auto">
        <CardContent className={classes.cardContent}>
          <div className={classes.mapWrapper}>
            <ComposableMap
              className={classes.composableMap}
              id="global-overview-map"
              data-tip=""
              projectionConfig={{
                rotate: [-10, 0, 0],
                scale: 210,
              }}
            >
              <ZoomableGroup
                zoom={position.zoom}
                center={position.coordinates}
                onMoveEnd={value => {
                  handleOnMoveEnd(value);
                }}
              >
                <Sphere stroke="#E4E5E6" strokeWidth={0.5} />
                <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
                <Geographies geography={geography}>
                  {({ geographies }) => {
                    return geographies.map(geo => {
                      let countryData;

                      if (mapColoredBy === 'country') {
                        countryData = mapData.find(item => item.name === geo.properties.NAME);
                      } else {
                        const regionKey = Object.keys(economicRegions).find(key =>
                          economicRegions[key].includes(geo.properties.NAME),
                        );
                        countryData = mapRegionData.find(item => item.name === regionKey);
                      }

                      const countryStats = countryData?.stats;
                      // const countryStatsNG = countryData?.statsNG;
                      let fillColor = lightGrey;
                      let smallerThan20 = false;
                      let showTooltip = false;

                      if (countryData) {
                        let count = 0;

                        switch (mapView) {
                          case 'No. Samples':
                            if (countryData.count > 0) {
                              fillColor = samplesColorScale(countryData.count);
                            } else {
                              fillColor = zeroCountColor;
                            }
                            break;
                          case 'Dominant Genotype':
                            {
                              const items = countryStats?.GENOTYPE?.items ?? [];
                              fillColor = items.length > 0 ? getGenotypeColor(items[0]?.name) : zeroPercentColor;
                            }
                            break;
                          case 'NG-MAST prevalence': {
                            let percentCounterNG = 0;
                            const genotypesNG = countryStats?.NGMAST?.items ?? [];
                            const genotypesNG2 = [];
                            genotypesNG.forEach(genotype => {
                              if (customDropdownMapViewNG.includes(genotype.name)) genotypesNG2.push(genotype);
                              percentCounterNG += genotype.count;
                            });

                            let sumCountNG = 0;

                            if (genotypesNG2.length > 0) {
                              for (const genotype of genotypesNG2) {
                                sumCountNG += genotype.count;
                              }
                            }
                            if (countryData.count >= 20 && genotypesNG2.length > 0) {
                              if (genotypesNG2 !== undefined) {
                                fillColor = differentColorScale(
                                  ((sumCountNG / percentCounterNG) * 100).toFixed(2),
                                  'red',
                                );
                              }
                            } else if (countryData.count >= 20) {
                              fillColor = darkGrey;
                              smallerThan20 = true;
                            }
                            break;
                          }
                          case 'Genotype prevalence':
                          case 'Lineage prevalence':
                          case 'ST prevalence':
                          case 'Serotype prevalence':
                          case 'Pathotype prevalence':
                          case 'O prevalence':
                          case 'H prevalence': {
                            let percentCounter = 0;
                            const genotypes1 = countryStats?.[mapViewColumn]?.items ?? [];
                            const genotypes2 = [];
                            genotypes1.forEach(genotype => {
                              if (prevalenceMapViewOptionsSelected.includes(genotype.name)) genotypes2.push(genotype);
                              percentCounter += genotype.count;
                            });

                            let sumCount = 0;

                            if (genotypes2.length > 0) {
                              for (const genotype of genotypes2) {
                                sumCount += genotype.count;
                              }
                            }
                            if (countryData.count >= 20 && genotypes2.length > 0 && percentCounter > 0) {
                              fillColor = differentColorScale(((sumCount / percentCounter) * 100).toFixed(2), 'red');
                            } else if (countryData.count >= 20) {
                              fillColor = darkGrey;
                              smallerThan20 = true;
                            }
                            break;
                          }
                          case 'Resistance prevalence': {
                            if (countryData.count >= 20) {
                              let item = null;
                              if (prevalenceMapViewOptionsSelected.length === 1) {
                                const drug = prevalenceMapViewOptionsSelected[0];

                                item = { key: drug, ...countryStats[drug] };
                              } else {
                                const names = prevalenceMapViewOptionsSelected.reduce((acc, key, index) => {
                                  const names = countryStats[key]?.names || [];
                                  if (index === 0) return new Set(names);
                                  return new Set(names.filter(name => acc.has(name)));
                                }, new Set());

                                item = {
                                  key: prevalenceMapViewOptionsSelected.join(' + '),
                                  count: names.size,
                                  percentage: Number(((names.size / countryData.count) * 100).toFixed(2)),
                                };
                              }

                              if (!item || item.count === 0) {
                                fillColor = darkGrey;
                                smallerThan20 = true;
                              } else {
                                fillColor = redColorScale(item.percentage);
                              }
                            } else {
                              smallerThan20 = true;
                            }
                            break;
                          }
                          case 'Pansusceptible':
                          case 'H58 / Non-H58':
                          case 'MDR':
                          case 'XDR':
                          case 'Azithromycin':
                          case 'Ciprofloxacin':
                          case 'CipR':
                          case 'ESBL_category':
                          case 'Ceftriaxone':
                          case 'ESBL':
                          case 'Carbapenems':
                            count = countryStats[statKey[mapView]]?.count;
                            if (countryData.count >= 20 && count > 0) {
                              if (mapView === 'Pansusceptible') {
                                fillColor = sensitiveColorScale(countryStats[statKey[mapView]].percentage);
                              } else {
                                fillColor = redColorScale(countryStats[statKey[mapView]].percentage);
                              }
                              showTooltip = true;
                            } else if (countryData.count >= 20) {
                              if (mapView === 'Pansusceptible') {
                                fillColor = zeroPercentColor;
                              } else {
                                fillColor = darkGrey;
                              }
                              smallerThan20 = true;
                            }
                            break;
                          case 'CipNS': {
                            const countCipR = countryStats[statKey['CipR']]?.count;
                            const countCipNS = countryStats[statKey['CipNS']]?.count;
                            count = countCipR + countCipNS;
                            const per =
                              countryStats[statKey['CipNS']].percentage + countryStats[statKey['CipR']].percentage;
                            if (countryData.count >= 20 && count > 0) {
                              if (mapView === 'Pansusceptible to all drugs') {
                                fillColor = sensitiveColorScale(per);
                              } else {
                                fillColor = redColorScale(per);
                              }
                              showTooltip = true;
                            } else if (countryData.count >= 20) {
                              if (mapView === 'Pansusceptible to all drugs') {
                                fillColor = zeroPercentColor;
                              } else {
                                fillColor = darkGrey;
                              }
                              smallerThan20 = true;
                            }
                            break;
                          }
                          default:
                            break;
                        }
                      }

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          cursor="pointer"
                          fill={fillColor}
                          onClick={() => handleOnClick(countryData)}
                          onMouseLeave={handleOnMouseLeave}
                          onMouseEnter={() =>
                            handleOnMouseEnter({
                              geo,
                              countryStats,
                              countryData,
                              smallerThan20,
                              showTooltip,
                            })
                          }
                          style={{
                            default: {
                              outline: 'none',
                            },
                            hover: {
                              stroke: '#607D8B',
                              strokeWidth: 1,
                              outline: 'none',
                            },
                            pressed: {
                              fill: '#FF5722',
                              stroke: '#607D8B',
                              strokeWidth: 1,
                              outline: 'none',
                            },
                          }}
                        />
                      );
                    });
                  }}
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
            <BottomLeftControls />
          </div>
          <ReactTooltip>
            {tooltipContent && (
              <div className={classes.tooltipMap}>
                <span className={classes.country}>{tooltipContent.name}</span>
                {tooltipContent.total !== null && (
                  <>
                    <span className={classes.total}>Total: {tooltipContent.total}</span>
                    <br />
                  </>
                )}
                <div className={classes.tooltipInfo}>
                  {Object.keys(tooltipContent.content).map((key, index) => {
                    return (
                      <div key={`tooltip-${index}`} className={classes.info}>
                        {mapView === 'Dominant Genotype' && (
                          <div
                            className={classes.color}
                            style={{
                              backgroundColor: getGenotypeColor(key),
                            }}
                          />
                        )}
                        <span className={classes.keyInfo} key={`info-${index}`}>
                          <span>{key}:</span>
                          {showPercentage() ? (
                            <span>{` ${tooltipContent.content[key].count} (${tooltipContent.content[key].percentage})`}</span>
                          ) : (
                            <span>{` ${tooltipContent.content[key]}`}</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                  {Object.keys(tooltipContent.content).length === 0 && (
                    <span>{tooltipContent.smallerThan20 ? '0%' : 'Insufficient data'}</span>
                  )}
                </div>
              </div>
            )}
          </ReactTooltip>
          <MapFilters showFilter={showFilter} setShowFilter={setShowFilter} />
        </CardContent>
      </Collapse>
    </Card>
  );
};
