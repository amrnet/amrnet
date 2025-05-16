/* eslint-disable react-hooks/exhaustive-deps */
import { Card, CardContent, Typography, useMediaQuery } from '@mui/material';
import { ComposableMap, Geographies, Geography, Graticule, Sphere, ZoomableGroup } from 'react-simple-maps';
import { useStyles } from './MapMUI';
import geography from '../../../assets/world-50m.json';
import { darkGrey, getColorForGenotype, lightGrey, zeroCountColor, zeroPercentColor } from '../../../util/colorHelper';
import { redColorScale, samplesColorScale, sensitiveColorScale, differentColorScale } from './mapColorHelper';
import ReactTooltip from 'react-tooltip';
import { BottomLeftControls } from './BottomLeftControls';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setPosition, setTooltipContent } from '../../../stores/slices/mapSlice.ts';
import { TopRightControls } from './TopRightControls';
import { setActualCountry, setActualRegion, setCanFilterData } from '../../../stores/slices/dashboardSlice.ts';
// import { TopLeftControls } from './TopLeftControls';
import { TopRightControls2 } from './TopRightControls2/TopRightControls2';
import { BottomRightControls } from './BottomRightControls';
import { Ngmast } from './Ng_mast/Ngmast';
import { statKeys } from '../../../util/drugClassesRules';
import { drugAcronymsOpposite, drugAcronymsOpposite2, ngonoSusceptibleRule } from '../../../util/drugs';

const statKey = {
  MDR: 'MDR',
  'H58 / Non-H58': 'H58',
  XDR: 'XDR',
  AzithR: 'AzithR',
  CipNS: 'CipNS',
  CipR: 'CipR',
  Pansusceptible: 'Pansusceptible',
  ESBL: 'ESBL',
  Ciprofloxacin: 'Ciprofloxacin',
  ESBL_category: 'Ceftriaxone',
  Azithromycin: 'Azithromycin',
  //TODO check this variable
  Ceftriaxone: 'Ceftriaxone',
  Carb: 'Carb',
};

export const Map = () => {
  const classes = useStyles();
  const matches = useMediaQuery('(max-width:700px)');

  const dispatch = useAppDispatch();
  const position = useAppSelector((state) => state.map.position);
  const mapData = useAppSelector((state) => state.map.mapData);
  const mapRegionData = useAppSelector((state) => state.map.mapRegionData);
  const mapView = useAppSelector((state) => state.map.mapView);
  const mapColoredBy = useAppSelector((state) => state.map.mapColoredBy);
  const tooltipContent = useAppSelector((state) => state.map.tooltipContent);
  const globalOverviewLabel = useAppSelector((state) => state.dashboard.globalOverviewLabel);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const colorPallete = useAppSelector((state) => state.dashboard.colorPallete);
  const prevalenceMapViewOptionsSelected = useAppSelector((state) => state.graph.prevalenceMapViewOptionsSelected);
  const customDropdownMapViewNG = useAppSelector((state) => state.graph.customDropdownMapViewNG);
  const economicRegions = useAppSelector((state) => state.dashboard.economicRegions);

  function getGenotypeColor(genotype) {
    return organism === 'styphi' ? getColorForGenotype(genotype) : colorPallete[genotype] || '#F5F4F6';
  }

  function handleOnClick(countryData) {
    if (countryData !== undefined) {
      const country = countryData.name;
      const region = Object.keys(economicRegions).find((key) => economicRegions[key].includes(country)) ?? 'All';

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
      content: {},
      smallerThan20,
    };

    if (countryData !== undefined) {
      switch (mapView) {
        case 'No. Samples':
          let combinedPercentage;
          if (organism === 'styphi')
            combinedPercentage =
              (countryStats[statKey['CipR']].percentage || 0) + (countryStats[statKey['CipNS']].percentage || 0);
          Object.assign(tooltip, {
            content:
              organism === 'styphi'
                ? {
                    Samples: countryData.count,
                    Genotypes: countryStats.GENOTYPE.count,
                    H58: `${countryStats.H58.percentage}%`,
                    'Multidrug resistant (MDR)': `${countryStats.MDR.percentage}%`,
                    'Extensively Drug Resistant (XDR)': `${countryStats.XDR.percentage}%`,
                    AzithR: `${countryStats.AzithR.percentage}%`,
                    CipR: `${countryStats.CipR.percentage}%`,
                    CipNS: `${combinedPercentage.toFixed(2)}%`,
                    Pansusceptible: `${countryStats.Pansusceptible.percentage}%`,
                  }
                : organism === 'kpneumo'
                ? {
                    Samples: countryData.count,
                    Genotypes: countryStats.GENOTYPE.count,
                    ESBL: `${countryStats.ESBL.percentage}%`,
                    Carbapenems: `${countryStats.Carb.percentage}%`,
                    // Susceptible: `${countryStats.Susceptible.percentage}%`,
                  }
                : organism === 'ngono'
                ? {
                    Samples: countryData.count,
                    Genotypes: countryStats.GENOTYPE.count,
                    'Multidrug resistant (MDR)': `${countryStats.MDR.percentage}%`,
                    'Extensively Drug Resistant (XDR)': `${countryStats.XDR.percentage}%`,
                    Azithromycin: `${countryStats.Azithromycin.percentage}%`,
                    Ceftriaxone: `${countryStats.Ceftriaxone.percentage}%`,
                    Ciprofloxacin: `${countryStats.Ciprofloxacin.percentage}%`,
                    // Susceptible: `${countryStats.Susceptible.percentage}%`,
                  }
                : {
                    Samples: countryData.count,
                    Genotypes: countryStats.GENOTYPE.count,
                  },
          });
          break;
        case 'Dominant Genotype':
          const genotypes = countryStats.GENOTYPE.items.slice(0, 5);
          genotypes.forEach((genotype) => {
            tooltip.content[genotype.name] = genotype.count;
          });
          break;
        case 'NG-MAST prevalence':
          let percentCounterNG = 0;
          const genotypesNG = countryStats.NGMAST.items;
          let genotypesNG2 = [];
          genotypesNG.forEach((genotype) => {
            if (customDropdownMapViewNG.includes(genotype.name)) {
              // tooltip.content[genotype.name] = `${genotype.count} `;
              genotypesNG2.push(genotype);
            }
            percentCounterNG += genotype.count;
          });
          genotypesNG.forEach((genotype) => {
            if (customDropdownMapViewNG.includes(genotype.name))
              tooltip.content[genotype.name] = `${genotype.count} (${(
                (genotype.count / percentCounterNG) *
                100
              ).toFixed(2)} %)`;
          });
          if (genotypesNG2.length > 0) {
            let sumCount = 0;
            for (const genotype of genotypesNG2) {
              sumCount += genotype.count;
            }
            if (countryData.count >= 20 && genotypesNG2.length > 1)
              tooltip.content['All selected genotypes'] = `${sumCount} (${((sumCount / percentCounterNG) * 100).toFixed(
                2,
              )} %)`;
          }
          break;
        case 'Genotype prevalence':
        case 'ST prevalence':
        case 'Lineage prevalence':
          const genotypes1 = countryStats.GENOTYPE.items;
          let genotypes2 = [];
          genotypes1.forEach((genotype) => {
            if (prevalenceMapViewOptionsSelected.includes(genotype.name)) {
              genotypes2.push(genotype);
            }
          });
          genotypes1.forEach((genotype) => {
            if (prevalenceMapViewOptionsSelected.includes(genotype.name))
              tooltip.content[genotype.name] = `${genotype.count} (${(
                (genotype.count / countryStats.GENOTYPE.sum) *
                100
              ).toFixed(2)} %)`;
          });
          if (genotypes2.length > 0) {
            let sumCount = 0;
            for (const genotype of genotypes2) {
              sumCount += genotype.count;
            }
            if (countryData.count >= 20 && genotypes2.length > 1)
              tooltip.content['All selected genotypes'] = `${sumCount} (${(
                (sumCount / countryStats.GENOTYPE.sum) *
                100
              ).toFixed(2)} %)`;
          }
          break;
        case 'Resistance prevalence':
          prevalenceMapViewOptionsSelected.forEach((option) => {
            const stats = countryStats[option];
            tooltip.content[
              ngonoSusceptibleRule(option, organism) || drugAcronymsOpposite2[option] || option
            ] = `${stats.count} (${stats.percentage}%)`;
          });
          break;
        case 'H58 / Non-H58':
        case 'MDR':
        case 'Pansusceptible':
        case 'XDR':
        case 'AzithR':
        case 'Azithromycin':
        case 'Ciprofloxacin':
        case 'Ceftriaxone':
        case 'CipR':
        case 'ESBL':
        case 'ESBL_category':
        case 'Carb':
          if (showTooltip) {
            tooltip.content[mapView === 'Carb' ? 'Carbapenems' : statKey[mapView]] = {
              count: countryStats[statKey[mapView]].count,
              percentage: `${countryStats[statKey[mapView]].percentage}%`,
            };
          }
          break;
        case 'CipNS':
          if (showTooltip) {
            const combinedCount =
              (countryStats[statKey['CipR']].count || 0) + (countryStats[statKey['CipNS']].count || 0);
            const combinedPercentage =
              (countryStats[statKey['CipR']].percentage || 0) + (countryStats[statKey['CipNS']].percentage || 0);
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
      'ST prevalence',
      'Resistance prevalence',
      'No. Samples',
      'NG-MAST prevalence',
      'Lineage prevalence',
    ].includes(mapView);
  }
  // N+ to avoid long headings
  function formatSelectionList(arr, limit = 5) {
    if (arr.length <= limit) return arr.join(', ');
    return `${arr.slice(0, limit).join(', ')} +${arr.length - limit}`;
  }  

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom variant="h5" fontWeight={'bold'}>
          Global Overview of {organism === 'none' ? '' : globalOverviewLabel.label}
        </Typography>
        {mapView !== 'No. Samples' ? (
          <Typography variant="subtitle2">
            {mapView}: {drugAcronymsOpposite[formatSelectionList(prevalenceMapViewOptionsSelected)]}
          </Typography>
        ) : null}
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
              onMoveEnd={(value) => {
                handleOnMoveEnd(value);
              }}
            >
              <Sphere stroke="#E4E5E6" strokeWidth={0.5} />
              <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
              <Geographies geography={geography}>
                {({ geographies }) => {
                  return geographies.map((geo) => {
                    let countryData;

                    if (mapColoredBy === 'country') {
                      countryData = mapData.find((item) => item.name === geo.properties.NAME);
                    } else {
                      const regionKey = Object.keys(economicRegions).find((key) =>
                        economicRegions[key].includes(geo.properties.NAME),
                      );
                      countryData = mapRegionData.find((item) => item.name === regionKey);
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
                          const genotypes = countryStats.GENOTYPE.items;
                          fillColor = getGenotypeColor(genotypes[0].name);
                          break;
                        case 'NG-MAST prevalence':
                          let percentCounterNG = 0;
                          const genotypesNG = countryStats.NGMAST.items;
                          let genotypesNG2 = [];
                          genotypesNG.forEach((genotype) => {
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
                        case 'Genotype prevalence':
                        case 'Lineage prevalence':
                        case 'ST prevalence':
                          let percentCounter = 0;
                          const genotypes1 = countryStats.GENOTYPE.items;
                          let genotypes2 = [];
                          genotypes1.forEach((genotype) => {
                            if (prevalenceMapViewOptionsSelected.includes(genotype.name)) genotypes2.push(genotype);
                            percentCounter += genotype.count;
                          });

                          let sumCount = 0;

                          if (genotypes2.length > 0) {
                            for (const genotype of genotypes2) {
                              sumCount += genotype.count;
                            }
                          }
                          if (countryData.count >= 20 && genotypes2.length > 0) {
                            if (genotypes2 !== undefined) {
                              fillColor = differentColorScale(((sumCount / percentCounter) * 100).toFixed(2), 'red');
                            }
                          } else if (countryData.count >= 20) {
                            fillColor = darkGrey;
                            smallerThan20 = true;
                          }
                          break;
                        case 'Resistance prevalence':
                          if (countryData.count >= 20) {
                            const stats = statKeys[organism] ? statKeys[organism] : statKeys['others'];
                            const keys = stats
                              .filter(
                                (stat) =>
                                  stat.resistanceView === true && prevalenceMapViewOptionsSelected.includes(stat.name),
                              )
                              .map((stat) => stat.name);

                            let biggerCountItem = null;

                            keys.forEach((key) => {
                              if (biggerCountItem === null) {
                                biggerCountItem = { key, ...countryStats[key] };
                                return;
                              }

                              if (countryStats[key].count > biggerCountItem.count) {
                                biggerCountItem = { key, ...countryStats[key] };
                              }
                            });

                            if (!biggerCountItem || biggerCountItem.count === 0) {
                              fillColor = darkGrey;
                              smallerThan20 = true;
                            } else {
                              fillColor = redColorScale(biggerCountItem.percentage);
                            }
                          }
                          break;
                        case 'Pansusceptible':
                        case 'H58 / Non-H58':
                        case 'MDR':
                        case 'XDR':
                        case 'AzithR':
                        case 'Azithromycin':
                        case 'Ciprofloxacin':
                        case 'CipR':
                        case 'ESBL_category':
                        case 'Ceftriaxone':
                        case 'ESBL':
                        case 'Carb':
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
                        case 'CipNS':
                          let countCipR = countryStats[statKey['CipR']]?.count;
                          let countCipNS = countryStats[statKey['CipNS']]?.count;
                          count = countCipR + countCipNS;
                          let per =
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
          {!matches && (
            <>
              {/* <TopLeftControls /> */}
              <TopRightControls />
              {['Genotype prevalence', 'ST prevalence', 'Lineage prevalence', 'Resistance prevalence'].includes(
                mapView,
              ) ? (
                <TopRightControls2 />
              ) : mapView === 'NG-MAST prevalence' ? (
                <Ngmast />
              ) : null}
            </>
          )}
          <BottomLeftControls />
          <BottomRightControls />
        </div>
        {matches && (
          <div className={classes.topControls}>
            <TopRightControls />
            {['Genotype prevalence', 'ST prevalence', 'Lineage prevalence', 'Resistance prevalence'].includes(
              mapView,
            ) ? (
              <TopRightControls2 />
            ) : mapView === 'NG-MAST prevalence' ? (
              <Ngmast />
            ) : null}
            {/* <TopLeftControls /> */}
          </div>
        )}
        <ReactTooltip>
          {tooltipContent && (
            <div className={classes.tooltipMap}>
              <span className={classes.country}>{tooltipContent.name}</span>
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
                      <span key={`info-${index}`}>
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
      </CardContent>
    </Card>
  );
};
