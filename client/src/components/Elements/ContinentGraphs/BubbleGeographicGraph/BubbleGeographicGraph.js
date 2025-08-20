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
import { useStyles } from './BubbleGeographicGraphMUI';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  LabelList,
} from 'recharts';
import { useAppSelector, useAppDispatch } from '../../../../stores/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { darkGrey, hoverColor } from '../../../../util/colorHelper';
import { isTouchDevice } from '../../../../util/isTouchDevice';
import { drugClassesRulesSTHeatMap, statKeys } from '../../../../util/drugClassesRules';
import { drugAcronyms, drugAcronymsOpposite, markersDrugsKP, markersDrugsSH, drugClassesNG, markersDrugsINTS} from '../../../../util/drugs';
import { mixColorScale } from '../../Map/mapColorHelper';
import { longestVisualWidth, truncateWord } from '../../../../util/helpers';
import { Clear, Close, InfoOutlined } from '@mui/icons-material';
import { setYAxisType, setYAxisTypeTrend } from '../../../../stores/slices/mapSlice';
import { organismsCards, organismsWithLotsGenotypes } from '../../../../util/organismsCards';
import { setResetBool } from '../../../../stores/slices/graphSlice';

// Dynamic trend options generator
const createTrendOptions = (organism, drugs, labelMap = {}) => {
  return drugs
    .map(drug => {
      const label = labelMap[drug] || drug;
      return {
        organism,
        key: drug,
        value: `${organism}-trends-${drug.toLowerCase()}`,
        label: label,
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));
};

const organismConfig = {
  kpneumo: {
    drugs: markersDrugsKP,
    labelMap: { 'ESBL': 'ESBLs' }
  },
  styphi: {
    drugs: Object.keys(drugClassesRulesSTHeatMap),
    labelMap: { 'Ciprofloxacin NS': 'Ciprofloxacin' }
  },
  ngono: {
    drugs: drugClassesNG,
    labelMap: {}
  },
  shige: {
    drugs: markersDrugsSH,
    labelMap: {}
  },
  ecoli: {
    drugs: markersDrugsSH,
    labelMap: {}
  },
  decoli: {
    drugs: markersDrugsSH,
    labelMap: {}
  },
  senterica: {
    drugs: markersDrugsINTS,
    labelMap: {}
  }
};

// function to get trend options for any organism
const getAllTrendOptionsForOrganism = (organism) => {
  const config = organismConfig[organism];
  
  if (!config) {
    console.warn(`No trend options configuration found for organism: ${organism}`);
    return [];
  }
  
  return createTrendOptions(organism, config.drugs, config.labelMap);
};

// Generate all trend options 
const kpTrendOptions = getAllTrendOptionsForOrganism('kpneumo');
const stTrendOptions = getAllTrendOptionsForOrganism('styphi');
const ngonoTrendOptions = getAllTrendOptionsForOrganism('ngono');
const shigeTrendOptions = getAllTrendOptionsForOrganism('shige');
const decoliTrendOptions = getAllTrendOptionsForOrganism('decoli');
const ecoliTrendOptions = getAllTrendOptionsForOrganism('ecoli');
const sentericaTrendOptions = getAllTrendOptionsForOrganism('senterica');
const sentericaintsTrendOptions = getAllTrendOptionsForOrganism('sentericaints');

const trendOptionsMap = {
  kpneumo: kpTrendOptions,
  styphi: stTrendOptions,
  ngono: ngonoTrendOptions,
  shige: shigeTrendOptions,
  decoli: decoliTrendOptions,
  ecoli: ecoliTrendOptions,
  senterica: sentericaTrendOptions,
  sentericaints: sentericaintsTrendOptions,
};


const yOptions = [
  {
    value: 'genotype',
    label: 'Genotype prevalence',
    organisms: organismsCards.map(x => x.value).filter(x => !['sentericaints', 'senterica'].includes(x)),
  },
  {
    value: 'genotype',
    label: 'Lineage prevalence',
    organisms: ['sentericaints', 'senterica'],
  },
  {
    value: 'resistance',
    label: 'Resistance prevalence',
  },
  {
    value: 'determinant',
    label: 'Resistance marker',
    // Adding market for all organisms
    organisms: ['styphi', 'kpneumo', 'ngono', 'shige', 'ecoli', 'decoli', 'senterica', 'sentericaints'],
  },
  {
    value: 'pathotype',
    label: 'Pathotype prevalence',
    organisms: ['shige', 'decoli'],
  },
  {
    value: 'serotype',
    label: 'Serotype prevalence',
    organisms: ['sentericaints', 'senterica'],
  },
].sort((a, b) => a.label.localeCompare(b.label));

export const BubbleGeographicGraph = ({ showFilter, setShowFilter }) => {
  const classes = useStyles();
  const [xAxisType, setXAxisType] = useState('country');
  const [xAxisSelected, setXAxisSelected] = useState([]);
  const [yAxisSelected, setYAxisSelected] = useState([]);
  const [genotypeSearch, setGenotypeSearch] = useState('');
  const [plotChart, setPlotChart] = useState(null);

  const dispatch = useAppDispatch();
  const organism = useAppSelector(state => state.dashboard.organism);
  const canGetData = useAppSelector(state => state.dashboard.canGetData);
  const mapData = useAppSelector(state => state.map.mapData);
  const mapRegionData = useAppSelector(state => state.map.mapRegionData);
  const economicRegions = useAppSelector(state => state.dashboard.economicRegions);
  const drugsRegionsData = useAppSelector(state => state.graph.drugsRegionsData);
  const drugsCountriesData = useAppSelector(state => state.graph.drugsCountriesData);
  const genotypesDrugClassesData = useAppSelector(state => state.graph.genotypesDrugClassesData);
  const yAxisType = useAppSelector(state => state.map.yAxisType);
  const yAxisTypeTrend = useAppSelector(state => state.map.yAxisTypeTrend);
  const loadingPDF = useAppSelector(state => state.dashboard.loadingPDF);
  const resetBool = useAppSelector(state => state.graph.resetBool);

  useEffect(() => {
    setXAxisType('country');
    dispatch(setYAxisType('resistance'));
    dispatch(setResetBool(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organism, resetBool]);
  const organismHasLotsOfGenotypes = useMemo(() => organismsWithLotsGenotypes.includes(organism), [organism]);

  const drugsData = useMemo(() => {
    return xAxisType === 'country' ? drugsCountriesData : drugsRegionsData;
  }, [drugsCountriesData, drugsRegionsData, xAxisType]);

  const resistanceOptions = useMemo(() => {
    const options = statKeys[organism] ? statKeys[organism] : statKeys['others'];
    const resistance = options.filter(option => option.resistanceView).map(option => option.name);

    const drugs = {};

    (xAxisType === 'country' ? mapData : mapRegionData)
      .filter(item => xAxisSelected.includes(item.name))
      .forEach(item => {
        const stats = item.stats;
        if (!stats) return;

        resistance.forEach(drug => {
          if (!(drug in drugs)) {
            drugs[drug] = stats[drug]?.count ?? 0;
            return;
          }

          drugs[drug] += stats[drug]?.count ?? 0;
        });
      });

    return (
      Object.entries(drugs)
        .filter(x => x[1] > 0)
        .map(x => x[0]) ?? []
    );
  }, [mapData, mapRegionData, organism, xAxisSelected, xAxisType]);

const markersOptions = useMemo(() => {
  const organismTrendOptions = getAllTrendOptionsForOrganism(organism);
  const drugKey = organismTrendOptions?.find(x => x.value === yAxisTypeTrend)?.key;

  if (!drugKey) return [];

  // Common exclusions for all organisms
  const EXCLUSIONS = new Set(['None', 'name', 'resistantCount', 'totalCount']);

  // Helper function to aggregate drug data
  const aggregateDrugs = (dataArray, filterFn = () => true) => {
    const drugs = {};

    dataArray.filter(filterFn).forEach(item => {
      Object.entries(item).forEach(([key, value]) => {
        if (EXCLUSIONS.has(key)) return;
        drugs[key] = (drugs[key] || 0) + (value || 0);
      });
    });

    return Object.entries(drugs)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  };

  // Get data source based on organism type
  const isLegacyStructure = ['kpneumo', 'styphi'].includes(organism);
  // const dataSource = isLegacyStructure 
  //   ? drugsData?.[drugKey] 
  //   : genotypesDrugClassesData[drugKey];
    const dataSource = drugsData?.[drugKey] 

  if (!dataSource) return [];

  // Apply filtering only for legacy structure
  const filterFn = isLegacyStructure 
    ? item => xAxisSelected.includes(item.name)
    : () => true;

  return aggregateDrugs(dataSource, filterFn);
}, [drugsData, genotypesDrugClassesData, xAxisSelected, yAxisTypeTrend, organism]);

  const GLPSColumn = useMemo(
    () => (['serotype', 'pathotype'].includes(yAxisType) ? 'PATHOTYPE' : 'GENOTYPE'),
    [yAxisType],
  );

  const GLPSEntries = useMemo(() => {
    const filteredData = (xAxisType === 'country' ? mapData : mapRegionData).filter(x =>
      xAxisSelected.includes(x.name),
    );
    const items = {};

    filteredData.forEach(obj => {
      obj.stats?.[GLPSColumn].items.forEach(item => {
        if (!(item.name in items)) {
          items[item.name] = item.count;
          return;
        }

        items[item.name] += item.count;
      });
    });

    return items;
  }, [GLPSColumn, mapData, mapRegionData, xAxisSelected, xAxisType]);

  const xAxisOptions = useMemo(() => {
    switch (xAxisType) {
      case 'country':
        return mapData.filter(x => x.count >= 20).sort(); // data to plot should include count greater and equal to 20
      case 'region':
        return mapRegionData.filter(x => x.count >= 20 && x.name !== 'All').sort();
      default:
        return [];
    }
  }, [mapData, mapRegionData, xAxisType]);

  const yAxisOptions = useMemo(() => {
    switch (yAxisType) {
      case 'resistance':
        return resistanceOptions;
      case 'determinant':
        return markersOptions ?? [];
      default:
        return (
          Object.entries(GLPSEntries)
            .sort((a, b) => b[1] - a[1])
            .map(x => x[0]) ?? []
        );
    }
  }, [GLPSEntries, markersOptions, resistanceOptions, yAxisType]);

  const filteredYAxisOptions = useMemo(() => {
    const filteredOptions = yAxisOptions.filter(option => option.toLowerCase().includes(genotypeSearch.toLowerCase()));

    if (yAxisType === 'serotype' ||  yAxisType === 'determinant' || (yAxisType === 'genotype' && organismHasLotsOfGenotypes)) {
      return filteredOptions.slice(0, 20);
    }

    return filteredOptions;
  }, [yAxisOptions, yAxisType, organismHasLotsOfGenotypes, genotypeSearch]);

  useEffect(() => {
    setXAxisSelected(
      (xAxisType === 'country'
        ? mapData.filter(x => x.count >= 20)
        : mapRegionData.filter(x => x.count >= 20 && x.name !== 'All')
      )
        .slice()
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(item => item.name),
    );
  }, [mapData, mapRegionData, xAxisType]);

  useEffect(() => {
    setYAxisSelected(
      ['genotype', 'serotype'].includes(yAxisType) || (yAxisType === 'determinant' && organism === 'kpneumo')
        ? yAxisOptions.slice(0, 10)
        : yAxisOptions,
    );
  }, [yAxisOptions, yAxisType, organism]);

  const yAxisWidth = useMemo(() => {
    return longestVisualWidth((xAxisSelected ?? []).map(x => (x === 'United States of America' ? 'USA' : x)));
  }, [xAxisSelected]);

  const getOptionLabel = useCallback(
    item => {
      if (!['genotype', 'serotype', 'pathotype'].includes(yAxisType)) {
        return drugAcronymsOpposite[drugAcronyms[item] ?? item] ?? item;
      }

      return `${item} (total N=${GLPSEntries[item]})`;
    },
    [GLPSEntries, yAxisType],
  );

  const yAxisLabel = useMemo(() => {
    switch (yAxisType) {
      case 'resistance':
        return 'drugs';
      case 'determinant':
        return 'markers';
      case 'genotype':
        return ['sentericaints', 'senterica'].includes(organism) ? 'lineages' : 'genotypes';
      default:
        return organism === 'sentericaints' ? 'serotypes' : 'pathotypes';
    }
  }, [organism, yAxisType]);

  function handleChangeXAxisType(event) {
    setXAxisType(event.target.value);
  }

  function handleChangeYAxisType(event) {
    const value = event.target.value;
    dispatch(setYAxisType(value));

    if (value === 'determinant') {
      const organismTrendOptions = getAllTrendOptionsForOrganism(organism);
      if (organismTrendOptions.length > 0) {
        dispatch(setYAxisTypeTrend(organismTrendOptions[0].value));
      }
    }
  }

  function handleChangeYAxisTypeTrend(event) {
    dispatch(setYAxisTypeTrend(event.target.value));
  }

  function handleChangeXAxisSelected({ event = null, all = false }) {
    if (!all) {
      const newValue = event.target.value;
      setXAxisSelected(newValue);
      return;
    }

    if (xAxisSelected.length === xAxisOptions.length) {
      setXAxisSelected([]);
      return;
    }

    setXAxisSelected(xAxisOptions.map(x => x.name));
  }

  const showSelectAll = useMemo(() => {
    return yAxisType !== 'genotype'
      ? yAxisSelected?.length !== yAxisOptions?.length
      : !organismHasLotsOfGenotypes && yAxisSelected?.length !== yAxisOptions?.length;
  }, [organismHasLotsOfGenotypes, yAxisOptions?.length, yAxisSelected?.length, yAxisType]);

  function handleChangeYAxisSelected({ event = null, all = false }) {
    const value = event?.target.value;

    if (value?.length === 1 && value[0] === undefined) {
      return;
    }

    if (!all) {
      setYAxisSelected(value);
      return;
    }

    if (
      yAxisSelected.length === filteredYAxisOptions.length ||
      yAxisSelected.some(x => !yAxisOptions.slice(0, 20).includes(x))
    ) {
      setYAxisSelected([]);
      return;
    }

    setYAxisSelected(filteredYAxisOptions?.slice());
  }

  function handleChangeSearch(event) {
    event.stopPropagation();
    setGenotypeSearch(event.target.value);
  }

  function clearSearch(event) {
    event.stopPropagation();
    setGenotypeSearch('');
  }

  function getSpace() {
    switch (organism) {
      case 'shige':
      case 'sentericaints':
      case 'decoli':
      case 'ecoli':
      case 'kpneumo':
      case 'styphi':
      case 'ngono':
        return 70;
      default:
        return 50;
    }
  }

  const getTitle = useCallback(value => {
    return drugAcronymsOpposite[value] ?? Object.keys(drugAcronyms).find(key => drugAcronyms[key] === value) ?? value;
  }, []);

  const countriesTooltipForRegion = useCallback(
    (region, stat, parent) => {
      if (xAxisType === 'country') {
        return null;
      }

      const countries = economicRegions[region];
      const item =
        organism === 'ngono' && stat === 'SUS'
          ? 'Susceptible'
          : (Object.keys(drugAcronyms).find(key => drugAcronyms[key] === stat) ?? stat);
      // const regionCount = mapRegionData.find((x) => x.name === region).count;

      const items = [];
      mapData.forEach(x => {
        const checkCountry = countries.includes(x.name);

        if (!checkCountry) {
          return;
        }

        const info = {
          countryName: x.name,
          countryCount: x.count,
        };

        if (yAxisType === 'resistance') {
          const count = x.stats?.[item]?.count || 0;

          if (count > 0) {
            info['itemCount'] = count;
            info['percentage'] = x.stats?.[item]?.percentage || 0;
            items.push(info);
          }
        }

        if (['genotype', 'serotype', 'pathotype'].includes(yAxisType)) {
          const gen = x.stats?.[GLPSColumn]?.items?.find(g => g.name === item);

          if (gen?.count > 0) {
            info['itemCount'] = gen?.count || 0;
            info['percentage'] = gen ? Number(((gen.count / x.count) * 100).toFixed(2)) : 0;
            items.push(info);
          }
        }

        if (yAxisType === 'determinant') {
          // Enhanced to support all organisms
          let count = 0;
          if (['kpneumo', 'styphi'].includes(organism)) {
            count = drugsCountriesData?.[parent]?.find(g => g.name === x.name)?.[item] || 0;
          } else {
            const relevantData = genotypesDrugClassesData[parent];
            if (relevantData) {
              count = relevantData.reduce((sum, dataItem) => sum + (dataItem[item] || 0), 0);
            }
          }

          if (count > 0) {
            info['itemCount'] = count;
            info['percentage'] = Number(((count / x.count) * 100).toFixed(2));
            items.push(info);
          }
        }
      });

      items.sort((a, b) => b.itemCount - a.itemCount);

      return (
        <div>
          <br />
          {items.slice(0, 10).map((x, index) => {
            return (
              <Typography fontSize="12px" key={`country-tooltip-${index}`}>
                <Typography component="span" fontWeight={500} fontSize="12px" display="inline">
                  {x.countryName}
                </Typography>
                {`: ${x.itemCount}/${x.countryCount} (${x.percentage}%)`}
              </Typography>
            );
          })}
        </div>
      );
    },
    [GLPSColumn, drugsCountriesData, genotypesDrugClassesData, economicRegions, mapData, organism, xAxisType, yAxisType],
  );

  const configuredMapData = useMemo(() => {
    if (yAxisSelected.length === 0) {
      return [];
    }

    return (xAxisType === 'country' ? mapData : mapRegionData)
      .filter(item => xAxisSelected.includes(item.name))
      .map(item => {
        const data = {
          name: item.name === 'United States of America' ? 'USA' : item.name,
          items: [],
        };

        if (yAxisType === 'resistance') {
          Object.entries(item.stats).forEach(([key, value]) => {
            if (resistanceOptions.includes(key) && yAxisSelected.includes(key)) {
              data.items.push({
                itemName: drugAcronyms[key] ?? key,
                percentage: value.percentage,
                count: value.count || 0,
                index: 1,
                typeName: item.name,
                total: item.count,
              });
            }
          });

          data.items.sort((a, b) => a.itemName.localeCompare(b.itemName));

          const moveToStart = name => {
            const i = data.items.findIndex(x => x.itemName === name);
            if (i >= 0) data.items.unshift(...data.items.splice(i, 1));
          };

          const moveToEnd = name => {
            const i = data.items.findIndex(x => x.itemName === name);
            if (i >= 0) data.items.push(...data.items.splice(i, 1));
          };

          if (['styphi', 'sentericaints'].includes(organism)) {
            ['CRO', 'CipR', 'CipNS'].forEach(moveToStart);
          }

          ['MDR', 'XDR', 'PAN', 'SUS'].forEach(moveToEnd);
        }

        if (['genotype', 'serotype', 'pathotype'].includes(yAxisType)) {
          yAxisSelected.forEach(selected => {
            const gen = item?.stats?.[GLPSColumn].items.find(g => g.name === selected);

            data.items.push({
              itemName: selected,
              percentage: gen ? Number(((gen.count / item.count) * 100).toFixed(2)) : 0,
              index: 1,
              typeName: item?.name,
              count: gen?.count || 0,
              total: item.count,
            });
          });
        }

        if (yAxisType === 'determinant') {
          const organismTrendOptions = getAllTrendOptionsForOrganism(organism);
          const drugKey = organismTrendOptions?.find(x => x.value === yAxisTypeTrend)?.key;
          
          if (!drugKey) return; // Early exit if no drugKey found
          
          // Helper function to calculate percentage
          const calculatePercentage = (count, total) => 
            count && total ? Number(((count / total) * 100).toFixed(2)) : 0;
          
          // Helper function to create item object
          const createItem = (drug, count, total, typeName) => ({
            itemName: drug.replaceAll(' + ', '/'),
            percentage: calculatePercentage(count, total),
            index: 1,
            typeName,
            count: count || 0,
            total: total || 0,
            parent: drugKey,
          });
          
          // Data extraction strategies
          const getDataForOrganism = () => {
              const locationData = drugsData?.[drugKey]?.find(x => x.name === item.name);
              return {
                getData: (drug) => locationData?.[drug] || 0,
                getTotal: () => locationData?.totalCount || 0
              };
          };
          
          // Select appropriate strategy
          // const isLegacy = ['kpneumo', 'styphi'].includes(organism);
          const { getData, getTotal } = getDataForOrganism();
          const totalCount = getTotal();
          
          // Process all drugs with single loop
          yAxisSelected.forEach(drug => {
            const drugCount = getData(drug);
            data.items.push(createItem(drug, drugCount, totalCount, item.name));
          });
        }

        return data;
      });
  }, [
    GLPSColumn,
    drugsData,
    genotypesDrugClassesData,
    mapData,
    mapRegionData,
    organism,
    resistanceOptions,
    xAxisSelected,
    xAxisType,
    yAxisSelected,
    yAxisType,
    yAxisTypeTrend,
  ]);
  useEffect(() => {
    if (canGetData) {
      setPlotChart(() => {
        return (
          <>
            {configuredMapData?.map((item, index) => {
              return (
                <ResponsiveContainer
                  className={classes.graphContainer}
                  key={`bubble-graph-${index}`}
                  width={yAxisWidth + 65 * yAxisSelected.length}
                  height={index === 0 ? 105 : 65}
                  style={{ paddingTop: index === 0 ? getSpace() : 0 }}
                >
                  <ScatterChart
                    cursor={isTouchDevice() ? 'default' : 'pointer'}
                    margin={{ bottom: index === 0 ? -20 : 20 }}
                  >
                    {/* For the first chart (index === 0), use interval={0} to show all labels and a custom tick renderer
                    for rotated, truncated labels. // For other charts, no custom tick renderer is used. */}
                    <XAxis
                      type="category"
                      dataKey="itemName"
                      interval={0}
                      tick={
                        index === 0
                          ? props => {
                              const title = getTitle(props.payload.value);

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
                                    {truncateWord(props.payload.value)}
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
                          const title = getTitle(payload[0]?.payload.itemName);
                          const isRegion = payload[0]?.payload.count > 0;

                          return (
                            <div
                              className={classes.chartTooltipLabel}
                              style={{
                                marginTop: index + 1 === configuredMapData.length ? -40 : index === 0 ? 40 : 0,
                              }}
                            >
                              <Typography variant="body1" fontWeight="500">
                                {payload[0]?.payload.typeName}
                              </Typography>
                              <Typography variant="caption" fontWeight="500">
                                Total: {payload[0]?.payload.total}
                              </Typography>
                              <Typography variant="body2">
                                {`${title}: ${payload[0]?.payload.count} (${payload[0]?.payload.percentage}%)`}
                              </Typography>
                              {isRegion &&
                                countriesTooltipForRegion(
                                  payload[1]?.payload.typeName,
                                  payload[0]?.payload.itemName,
                                  payload[0]?.payload.parent,
                                )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter data={item.items} shape="square">
                      {item.items.map((option, index) => (
                        <Cell
                          name={option.drug}
                          key={`bubble-cell-${index}`}
                          fill={option.percentage === 0 ? darkGrey : mixColorScale(option.percentage)}
                        />
                      ))}
                      <LabelList
                        dataKey="percentage"
                        fontSize={12}
                        content={({ x, y, value, z }) => {
                          return (
                            <text
                              x={x + 33}
                              y={y + 38}
                              textAnchor="middle"
                              fontSize={15}
                              fontWeight={600}
                              fill={value === 0 || value > 25 ? '#fff' : '#000'}
                              pointerEvents="none"
                            >
                              {value}
                            </text>
                          );
                        }}
                      />
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              );
            })}
          </>
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    configuredMapData,
    yAxisWidth,
    canGetData,
    classes,
    getTitle,
    truncateWord,
    hoverColor,
    mixColorScale,
    countriesTooltipForRegion,
  ]);

  return (
    <CardContent className={classes.bubbleGeographicGraph}>
      <div className={classes.graphWrapper}>
        {/* // BG is replaced from CVM for BubbleGeographicGraph and overflow visible for Download PDF */}
        <div className={classes.graph} style={loadingPDF ? { overflow: 'visible' } : undefined} id="BG">
          {plotChart}
        </div>
      </div>
      {(configuredMapData.length === 0 || yAxisSelected.length === 0) && (
        <Box className={classes.nothingSelected}>
          <Typography fontWeight={600}>No data to show</Typography>
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
          <Box className={classes.gradientBox} />
          <Typography fontSize="0.75rem">100%</Typography>
        </div>
      </div>
      {showFilter && (
        <Box className={classes.floatingFilter}>
          <Card elevation={3}>
            <CardContent>
              <div className={classes.titleWrapper}>
                <Typography variant="h6">Plotting options</Typography>
                <Tooltip title="Hide plotting options" placement="top">
                  <IconButton onClick={() => setShowFilter(false)}>
                    <Close fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
              <div className={classes.selectsWrapper}>
                <div className={classes.selectPreWrapper}>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">Select region/country</Typography>
                      <Tooltip title="Only show regions with N≥20 genomes." placement="top">
                        <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                      </Tooltip>
                    </div>
                    <Select
                      value={xAxisType}
                      onChange={handleChangeXAxisType}
                      inputProps={{ className: classes.selectInput }}
                      MenuProps={{ classes: { list: classes.selectMenu } }}
                      disabled={organism === 'none'}
                    >
                      <MenuItem value="country">Country</MenuItem>
                      <MenuItem value="region">Region</MenuItem>
                    </Select>
                  </div>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">Select countries/regions</Typography>
                      <Tooltip title="Navigate by typing the first letter of the country/region." placement="top">
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
                          color={xAxisSelected.length === xAxisOptions.length ? 'error' : 'primary'}
                        >
                          {xAxisSelected.length === xAxisOptions.length ? 'Clear All' : 'Select All'}
                        </Button>
                      }
                      inputProps={{ className: classes.multipleSelectInput }}
                      MenuProps={{
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      renderValue={selected => <div>{`${selected.length} of ${xAxisOptions.length} selected`}</div>}
                    >
                      {xAxisOptions.map((option, index) => (
                        <MenuItem key={`geo-x-axis-option-${index}`} value={option.name}>
                          <Checkbox checked={xAxisSelected.indexOf(option.name) > -1} />
                          <ListItemText primary={`${option.name} (total N=${option.count})`} />
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className={classes.selectPreWrapper}>
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">Columns</Typography>
                    </div>
                    <Select
                      value={yAxisType}
                      onChange={handleChangeYAxisType}
                      inputProps={{ className: classes.selectInput }}
                      MenuProps={{ classes: { list: classes.selectMenu } }}
                      disabled={organism === 'none'}
                    >
                      {yOptions
                        .filter(option => !option.organisms || option.organisms.includes(organism))
                        .map((option, index) => (
                          <MenuItem key={`y-col-option-${index}`} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                    </Select>
                  </div>
                  {yAxisType === 'determinant' && (
                    <div className={classes.selectWrapper}>
                      <div className={classes.labelWrapper}>
                        <Typography variant="caption">Select drugs</Typography>
                      </div>
                      <Select
                        value={yAxisTypeTrend}
                        onChange={handleChangeYAxisTypeTrend}
                        inputProps={{ className: classes.selectInput }}
                        MenuProps={{ classes: { list: classes.selectMenu } }}
                        disabled={organism === 'none'}
                      >
                        {trendOptionsMap[organism]?.map((option, index) => (
                          <MenuItem key={`y-${organism}-option-${index}`} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}

                      </Select>
                    </div>
                  )}
                  <div className={classes.selectWrapper}>
                    <div className={classes.labelWrapper}>
                      <Typography variant="caption">Select {yAxisLabel}</Typography>
                      {yAxisType === 'genotype' && (
                        <Tooltip
                          title={`If the total ${yAxisLabel} are too many, only the first 20 options are shown at a time`}
                          placement="top"
                        >
                          <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
                        </Tooltip>
                      )}
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
                            ? 'Clear All'
                            : 'Select 20'}
                        </Button>
                      }
                      inputProps={{ className: classes.multipleSelectInput }}
                      MenuProps={{
                        disableAutoFocusItem: true,
                        classes: { paper: classes.menuPaper, list: classes.selectMenu },
                      }}
                      renderValue={selected => (
                        <div>
                          {Array.isArray(selected) && selected.length > 0
                            ? `${selected.length} of ${yAxisOptions.length} selected`
                            : 'No options selected'}
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
                            organismHasLotsOfGenotypes && yAxisType === 'genotype' ? 'Search for more...' : 'Search...'
                          }
                          fullWidth
                          value={genotypeSearch}
                          onChange={handleChangeSearch}
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
                      {filteredYAxisOptions.map((option, index) => (
                        <MenuItem key={`geo-y-axis-option-${index}`} value={option}>
                          <Checkbox checked={yAxisSelected.indexOf(option) > -1} />
                          <ListItemText primary={getOptionLabel(option)} />
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Box>
      )}
    </CardContent>
  );
};
