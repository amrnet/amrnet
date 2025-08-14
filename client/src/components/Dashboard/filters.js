/**
 * @fileoverview Data filtering and processing utilities for AMRnet Dashboard
 *
 * This module contains functions for filtering, processing, and transforming
 * genomic antimicrobial resistance data for visualization purposes.
 *
 * Key functionalities:
 * - Data filtering by dataset, time range, geography, and lineages
 * - Map data generation for geographic visualization
 * - Temporal data aggregation for trend analysis
 * - Genotype and drug resistance data processing
 * - Convergence analysis for K. pneumoniae
 *
 * @author AMRnet Team
 * @version 1.1.0
 */

import { generatePalleteForGenotypes } from '../../util/colorHelper';
import { variableGraphOptions } from '../../util/convergenceVariablesOptions';
import {
  drugClassesRulesNG,
  drugClassesRulesSHIGE,
  drugClassesRulesST,
  drugRulesINTS,
  drugRulesKP,
  drugRulesKPOnlyMarkers,
  drugRulesNG,
  drugRulesST,
  statKeys,
  statKeysECOLI,
  statKeysKP,
  statKeysINTS,
  statKeysKPOnlyMarkers,
} from '../../util/drugClassesRules';
import { markersDrugsKP, drugsKP, markersDrugsSH, markersDrugsINTS} from '../../util/drugs';
import { amrLikeOrganisms } from '../../util/organismsCards';

/**
 * Filter organism data based on multiple criteria
 *
 * This function applies filtering based on dataset, time range, geographic location,
 * and organism-specific lineages. It returns filtered data along with summary statistics.
 *
 * @param {Object} params - Filter parameters
 * @param {Array} params.data - Raw organism data to filter
 * @param {string} [params.dataset='All'] - Dataset filter (All, community, travel)
 * @param {string} [params.datasetKP='All'] - K. pneumoniae specific dataset filter
 * @param {string} params.actualTimeInitial - Start year for temporal filtering
 * @param {string} params.actualTimeFinal - End year for temporal filtering
 * @param {string} params.organism - Organism identifier
 * @param {string} params.actualCountry - Country filter
 * @param {string} params.actualRegion - Economic region filter
 * @param {Object} params.economicRegions - Economic regions mapping
 * @param {Array} params.selectedLineages - Selected lineages for filtering
 * @returns {Object} Filtered data with statistics
 */
export function filterData({
  data,
  dataset,
  datasetKP,
  actualTimeInitial,
  actualTimeFinal,
  organism,
  actualCountry,
  actualRegion,
  economicRegions,
  selectedLineages,
}) {
  const checkDataset = item => dataset === 'All' || item.TRAVEL === dataset.toLowerCase();
  const checkDatasetKP = item => {
    if (datasetKP === 'All') return true;

    const columnID = statKeysKP.find(x => x.name === datasetKP).column;
    if (Array.isArray(columnID)) return columnID.some(x => item[x] !== '-');
    return item[columnID] !== '-';
  };
  const checkTime = item => {
    return item.DATE >= actualTimeInitial && item.DATE <= actualTimeFinal;
  };
  const checkLineages = item => {
    if (!['sentericaints', 'decoli', 'shige'].includes(organism)) {
      return true;
    }

    if (['sentericaints'].includes(organism)) {
      return (selectedLineages ?? []).some(selected =>
        item.SISTR1_Serovar.toLowerCase().includes(selected.toLowerCase()),
      );
    }

    return (selectedLineages ?? []).some(selected => item.Pathovar.toLowerCase().includes(selected.toLowerCase()));
  };

  let genomesCount,
    genotypesCount = 0;
  let listPMID = [];

  // Filter
  const newData = data.filter(x => checkDataset(x) && checkDatasetKP(x) && checkTime(x) && checkLineages(x));

  // Set genotypes, genomes and PMID
  if (actualRegion !== 'All') {
    const countriesForFilter = actualCountry !== 'All' ? [actualCountry] : economicRegions[actualRegion];
    const countryData = newData.filter(x => countriesForFilter.includes(getCountryDisplayName(x.COUNTRY_ONLY)));
    const genotypes = [...new Set(countryData.map(x => x.GENOTYPE))];

    genomesCount = countryData.length;
    genotypesCount = genotypes.length;
    listPMID = [...new Set(countryData.map(x => x.PMID))];
  } else {
    const genotypes = [...new Set(newData.map(x => x.GENOTYPE))];
    genomesCount = newData.length;
    genotypesCount = genotypes.length;
    listPMID = [...new Set(newData.map(x => x.PMID))];
  }

  return {
    data: newData,
    genomesCount,
    genotypesCount,
    listPMID,
  };
}

/**
 * Filter data for brush interactions across different graph types
 *
 * Applies filtering based on dataset and organism type, with time range
 * filtering specific to different graph components (GD, DRT, RDT, KOT).
 *
 * @param {Object} params - Filter parameters for brush data
 * @param {Array} params.data - Raw organism data to filter
 * @param {string} params.dataset - Dataset filter
 * @param {string} params.organism - Organism identifier
 * @param {string} params.actualCountry - Country filter
 * @param {Array} params.selectedLineages - Selected lineages for filtering
 * @param {string} params.starttimeGD - Start time for genotype distribution
 * @param {string} params.endtimeGD - End time for genotype distribution
 * @param {string} params.starttimeDRT - Start time for drug resistance trends
 * @param {string} params.endtimeDRT - End time for drug resistance trends
 * @param {string} params.starttimeRDT - Start time for resistance determinants
 * @param {string} params.endtimeRDT - End time for resistance determinants
 * @param {string} params.startTimeKOT - Start time for KO trends
 * @param {string} params.endTimeKOT - End time for KO trends
 * @returns {Object} Filtered genome counts for each graph type
 */
export function filterBrushData({
  data,
  dataset,
  organism,
  actualCountry,
  selectedLineages,
  starttimeGD,
  endtimeGD,
  starttimeDRT,
  endtimeDRT,
  starttimeRDT,
  endtimeRDT,
  startTimeKOT,
  endTimeKOT,
}) {
  const filterByDataset = item => dataset === 'All' || item.TRAVEL === dataset.toLowerCase();
  const filterByTimeRange = (item, start, end) => item.DATE >= start && item.DATE <= end;
  const filterByLineages = item => {
    if (!['sentericaints', 'decoli', 'shige'].includes(organism)) {
      return true;
    }

    if (organism === 'sentericaints') {
      return selectedLineages.includes(item.SISTR1_Serovar);
    }
    return selectedLineages.includes(item.Pathovar);
  };
  // const newData = data.filter((x) => filterByDataset(x) && filterByTimeRange(x) && filterByLineages(x));
  const filterData = (start, end) =>
    data.filter(x => filterByDataset(x) && filterByTimeRange(x, start, end) && filterByLineages(x));

  let newDataGD = filterData(starttimeGD, endtimeGD);
  let newDataDRT = filterData(starttimeDRT, endtimeDRT);
  let newDataRDT = filterData(starttimeRDT, endtimeRDT);
  let newDataKOT = filterData(startTimeKOT, endTimeKOT);
  if (actualCountry !== 'All') {
    // const filterByCountry = newData.filter((x) => getCountryDisplayName(x.COUNTRY_ONLY) === actualCountry);
    const filterByCountry = x => getCountryDisplayName(x.COUNTRY_ONLY) === actualCountry;
    newDataGD = newDataGD.filter(filterByCountry);
    newDataDRT = newDataDRT.filter(filterByCountry);
    newDataRDT = newDataRDT.filter(filterByCountry);
    newDataKOT = newDataKOT.filter(filterByCountry);
  }

  return {
    genomesCountGD: newDataGD.length,
    genomesCountDRT: newDataDRT.length,
    genomesCountRDT: newDataRDT.length,
    genomesCountKOT: newDataKOT.length,
  };
}

//TODO: change for the mongo
// Adjust the country names to its correct name
//TODO: change for the mongo
// Adjust the country names to its correct name
function getCountryDisplayName(country) {
  const trimmed = country.trim();

  switch (trimmed) {
    case 'Democratic Republic of the Congo':
    case 'Democratic Republic of Congo':
    case 'DR Congo':
    case 'DRC':
      return 'Dem. Rep. Congo';
    case 'Republic of the Congo':
    case 'Congo Republic':
      return 'Congo';
    case 'Channel Islands':
      return 'Jersey';
    case 'Czech Republic':
      return 'Czechia';
    case 'Central African Republic':
      return 'Central African Rep.';
    case 'Ivory Coast':
    case "Cote d'Ivoire":
    case "Côte d'Ivoire":
      return "Côte d'Ivoire";
    case 'East Timor':
      return 'Timor-Leste';
    case 'State of Palestine':
      return 'Palestine';
    case 'Dominican Republic':
      return 'Dominican Rep.';
    case 'Viet Nam':
      return 'Vietnam';
    case 'Myanmar [Burma]':
      return 'Myanmar';
    case 'French Polynesia':
      return 'Fr. Polynesia';
    case 'The Netherlands':
    case 'Netherlands (Kingdom of the)':
      return 'Netherlands';
    case 'USA':
    case 'United States':
      return 'United States of America';
    case 'Cape Verde':
      return 'Cabo Verde';
    case 'Turks and Caicos Islands':
      return 'Turks and Caicos Is.';
    case 'United Kingdom (England/Wales/N. Ireland)':
    case 'United Kingdom (Scotland)':
    case 'United Kingdom of Great Britain and Northern Ireland':
    case 'Northern Ireland':
    case 'England':
    case 'Scotland':
    case 'Wales':
    case 'UK':
      return 'United Kingdom';
    case 'The Gambia':
      return 'Gambia';
    case 'Poland/Hungary':
      return 'Poland';
    case "Lao People's Democratic Republic":
      return 'Laos';
    case 'Syrian Arab Republic':
      return 'Syria';
    case 'United Republic of Tanzania':
      return 'Tanzania';
    case 'Türkiye':
      return 'Turkey';
    // case 'South Korea':
    //   return 'Republic of Korea';
    // case 'Iran':
    //   return 'Iran (Islamic Republic of)';
    default:
      return trimmed;
  }
}

// Export at the top level
export { getCountryDisplayName };

// Get specific drug count, percentage and al its types for the map component
function getMapStatsData({
  itemData,
  columnKey,
  statsKey,
  organism,
  noItems = false,
  addNames = false,
  isPan = false,
}) {
  const totalLength = itemData.length;
  const columnKeys = Array.isArray(columnKey) ? columnKey : [columnKey];
  const columnDataMap = {};
  let allDashCount = 0;
  const allDashNames = [];

  for (const item of itemData) {
    const rawValues = columnKeys.map(k => item[k]);
    const name = item.Uberstrain || item.Name || item.NAME || item['Genome Name'] || 'Unknown';

    if (rawValues.every(val => val === '-')) {
      if (isPan) {
        allDashCount += 1;
        allDashNames.push(name);
      }
      continue;
    }

    // Clean & collect gene values
    const cleanedGenes = removeChars(
      rawValues
        .filter(val => val !== '-')
        .join(';')
        .split(';'),
    );

    for (const gene of cleanedGenes) {
      const key = gene || '-';

      if (!columnDataMap[key]) {
        columnDataMap[key] = { count: 0, names: new Set() };
      }

      columnDataMap[key].count += 1;
      columnDataMap[key].names.add(name);
    }
  }

  const items = Object.entries(columnDataMap).map(([name, { count, names: _names }]) => {
    const percentage = (count / totalLength) * 100;
    return { name, count, percentage: Number(percentage.toFixed(2)) };
  });

  const statsList =
    items.filter(item => {
      if (statsKey === null) return true;

      const itemName = item.name?.toString();
      const statKeyStr = statsKey?.toString();

      if (['senterica', 'sentericaints'].includes(organism)) {
        if (Array.isArray(statsKey)) {
          return statsKey.some(k => itemName.includes(k));
        }
        return itemName.includes(statKeyStr);
      }

      return statKeyStr === '-' ? itemName !== '-' : itemName === statKeyStr;
    }) || [];

  const namesSet = new Set();
  for (const [key, { names }] of Object.entries(columnDataMap)) {
    if (statsList.find(item => item.name === key) && names) {
      for (const n of names) namesSet.add(n);
    }
  }

  const stats = {
    count: namesSet.size,
    percentage: Number(((namesSet.size / totalLength) * 100).toFixed(2)),
    names: Array.from(namesSet),
  };

  const baseReturn = {
    items,
    count: stats.count,
    percentage: stats.percentage,
  };

  if (addNames) baseReturn.names = isPan ? allDashNames : stats.names;
  if (noItems) delete baseReturn.items;
  if (isPan) {
    return {
      ...baseReturn,
      count: allDashCount,
      percentage: Number(((allDashCount / totalLength) * 100).toFixed(2)),
    };
  }

  return baseReturn;
}

const generateStats = (itemData, stats, organism, statKey, dataKey = 'GENOTYPE', noDrugs = false) => {
  const statMap = {};
  const groupedItems = {};
  const variableOptions = variableGraphOptions.filter(x => x.graph).map(x => x.mapValue);

  // Group items by dataKey value (e.g., GENOTYPE)
  for (const item of itemData) {
    const stat = item[dataKey]?.toString();
    if (!stat) continue;

    statMap[stat] = (statMap[stat] || 0) + 1;
    if (!groupedItems[stat]) groupedItems[stat] = [];
    groupedItems[stat].push(item);
  }

  const orgKey = organism in statKeys ? organism : 'others';
  stats[statKey].count = Object.keys(statMap).length;

  const items = [];

  for (const [stat, count] of Object.entries(statMap)) {
    const result = { name: stat, count };
    const dataWithGenFilter = groupedItems[stat];

    if (organism === 'kpneumo' && variableOptions.includes(statKey)) {
      result.ko = {
        O_locus: getMapStatsData({ itemData: dataWithGenFilter, columnKey: 'O_locus', statsKey: null, organism }),
        K_locus: getMapStatsData({ itemData: dataWithGenFilter, columnKey: 'K_locus', statsKey: null, organism }),
        O_type: getMapStatsData({ itemData: dataWithGenFilter, columnKey: 'O_type', statsKey: null, organism }),
      };
    }

    if (!noDrugs) {
      result.drugs = {};
      const sKeys = organism === 'kpneumo' ? statKeys[orgKey].concat(statKeysKPOnlyMarkers) : statKeys[orgKey];

      for (const { name, column, key } of sKeys) {
        const noItems = organism !== 'kpneumo' || !variableOptions.includes(statKey) || name === 'Pansusceptible';

        result.drugs[name] = getMapStatsData({
          itemData: dataWithGenFilter,
          columnKey: column, // can be string or array
          statsKey: key,
          noItems,
          organism,
        });
      }
    }

    items.push(result);
  }

  // Sort and assign
  items.sort((a, b) => b.count - a.count);
  stats[statKey].items = items;

  // Compute sum
  stats[statKey].sum = items.reduce((sum, item) => sum + (item.count || 0), 0);
};

/**
 * Generate map visualization data for countries or regions
 *
 * Processes organism data to create geographic visualization data including
 * sample counts and drug resistance statistics for map display.
 *
 * @param {Object} params - Map data parameters
 * @param {Array} params.data - Organism data array
 * @param {Array|Object} params.items - Countries array or regions object to process
 * @param {string} params.organism - Organism identifier
 * @param {string} [params.type='country'] - Type of geographic aggregation ('country' or 'region')
 * @returns {Array} Map data with resistance statistics for visualization
 */
export function getMapData({ data, items, organism, type = 'country' }) {
  // Add validation for required parameters
  // if (!data || !Array.isArray(data)) {
  //   console.warn('getMapData: data is not a valid array');
  //   return [];
  // }

  // if (!items || (!Array.isArray(items) && typeof items !== 'object')) {
  //   console.warn('getMapData: items is not a valid array or object');
  //   return [];
  // }

  const mapData = [];
  const formattedItems = type === 'country' ? items : Object.keys({ ...items, All: '' }).sort();
  const pallete = generatePalleteForGenotypes(formattedItems);

  // Cache getCountryDisplayName and group by country
  const countryCache = {};
  const dataByCountry = {};

  for (const entry of data) {
    const rawCountry = entry.COUNTRY_ONLY;
    const country = countryCache[rawCountry] ?? (countryCache[rawCountry] = getCountryDisplayName(rawCountry));
    if (!dataByCountry[country]) dataByCountry[country] = [];
    dataByCountry[country].push(entry);
  }

  // Convert region item lists to Sets for faster lookup
  const itemSets = {};
  if (type !== 'country') {
    for (const item of formattedItems) {
      if (item !== 'All') {
        itemSets[item] = new Set(items[item]);
      }
    }
  }

  for (const item of formattedItems) {
    let itemData;

    if (type === 'country') {
      itemData = dataByCountry[item] || [];
    } else if (item === 'All') {
      itemData = data;
    } else {
      // Merge all countries in region
      itemData = [];
      for (const country of itemSets[item]) {
        if (dataByCountry[country]) {
          itemData.push(...dataByCountry[country]);
        }
      }
    }

    if (itemData.length === 0) continue;

    const stats = {
      GENOTYPE: { items: [], count: 0 },
    };

    generateStats(itemData, stats, organism, 'GENOTYPE', 'GENOTYPE');

    if (organism === 'kpneumo') {
      stats['CGST'] = { items: [], count: 0 };
      generateStats(itemData, stats, organism, 'CGST', 'cgST');

      stats['SUBLINEAGE'] = { items: [], count: 0 };
      generateStats(itemData, stats, organism, 'SUBLINEAGE', 'Sublineage');
    }

    if (['shige', 'decoli', 'ecoli'].includes(organism)) {
      for (const key of ['O_PREV', 'OH_PREV']) {
        stats[key] = { items: [], count: 0 };
        generateStats(itemData, stats, organism, key, key === 'O_PREV' ? 'O Antigen' : 'H Antigen');
        const namesToExclude = ['-', 'NA', 'Escherichia Coli', 'Escherichia', 'uncertain'];
        stats[key].items = stats[key].items.filter(x => {
          const hasExcludedName = namesToExclude.includes(x.name);
          if (hasExcludedName) {
            stats[key].sum -= x.count;
          }

          return !hasExcludedName;
        });
        stats[key].count = stats[key].items.length;
      }
    }

    if (['shige', 'decoli', 'sentericaints', 'ecoli', 'senterica'].includes(organism)) {
      stats['PATHOTYPE'] = { items: [], count: 0 };
      const col =
        organism === 'sentericaints'
          ? 'SISTR1_Serovar'
          : organism === 'senterica'
            ? 'SISTR1 Serovar' /*'SeqSero2_Serovar'*/
            : 'Pathovar';
      generateStats(itemData, stats, organism, 'PATHOTYPE', col);
    }

    statKeys[organism in statKeys ? organism : 'others'].forEach(({ name, column, key }) => {
      stats[name] = getMapStatsData({
        itemData,
        columnKey: column,
        statsKey: key,
        addNames: type === 'country',
        noItems: name === 'Pansusceptible',
        isPan: name === 'Pansusceptible' && amrLikeOrganisms.includes(organism),
        organism,
      });
    });

    if (organism === 'ngono') {
      stats['NGMAST'] = { items: [], count: 0 };
      generateStats(itemData, stats, organism, 'NGMAST', 'NG-MAST TYPE');
    }

    mapData.push({
      name: item,
      count: itemData.length,
      stats,
      color: pallete[item],
    });
  }

  return mapData;
}

// Retrieves data for years, genotypes, drugs, and unique genotypes based on the provided parameters.
export function getYearsData({ data, years, organism, getUniqueGenotypes = false }) {
  // // Add validation for required parameters
  // if (!data || !Array.isArray(data)) {
  //   console.warn('getYearsData: data is not a valid array');
  //   return { genotypesData: [], drugsData: [], genotypesAndDrugsData: {}, uniqueGenotypes: [] };
  // }

  // if (!years || !Array.isArray(years)) {
  //   console.warn('getYearsData: years is not a valid array');
  //   return { genotypesData: [], drugsData: [], genotypesAndDrugsData: {}, uniqueGenotypes: [] };
  // }

  const drugsData = [];
  const genotypesAndDrugsData = {};
  let uniqueGenotypes = [];
  let uniqueNGMAST = [];
  let uniqueCgST = [];
  let uniqueSublineages = [];
  const genotypesAndDrugsDataUniqueGenotypes = {};
  const NGMASTData = [];
  const cgSTData = [];
  const sublineageData = [];

  // Initialize data structures based on organism type
  const initializeDataStructures = rules => {
    rules.forEach(key => {
      genotypesAndDrugsData[key] = [];
      genotypesAndDrugsDataUniqueGenotypes[key] = [];
    });
  };

  if (organism === 'kpneumo') {
    initializeDataStructures(markersDrugsKP);
  } else if (organism === 'ngono') {
    initializeDataStructures(Object.keys(drugClassesRulesNG));
  } else if (organism === 'styphi') {
    initializeDataStructures(Object.keys(drugClassesRulesST));
  } else if (organism === 'senterica' || organism === 'sentericaints') {
    initializeDataStructures(markersDrugsINTS);
  } else {
      initializeDataStructures(markersDrugsSH);
  }
  const genotypesData = years.map(year => {
    const yearData = data.filter(x => x.DATE.toString() === year.toString());
    const count = yearData.length;
    const response = { name: year, count };

    if (count === 0) return response;

    // Calculate genotype stats
    const genotypeStats = yearData.reduce((acc, x) => {
      const genotype = x.GENOTYPE;
      acc[genotype] = (acc[genotype] || 0) + 1;
      return acc;
    }, {});
    console.log("yearData", yearData)
    // Calculate other genotype stats for Klebsiella
    let cgSTStats = {};
    let sublineageStats = {};
    let NGMASTStats ={};
    if (organism === 'kpneumo') {
      cgSTStats = yearData.reduce((acc, x) => {
        const cgST = x.cgST;
        // if (cgST && cgST !== '-' && cgST !== null && cgST !== undefined && cgST !== '' && cgST.toString().trim() !== '') {
        //   acc[cgST] = (acc[cgST] || 0) + 1;
        // }
        acc[cgST] = (acc[cgST] || 0) + 1;
        return acc;
      }, {});
      cgSTData.push({ ...response, ...cgSTStats });

      sublineageStats = yearData.reduce((acc, x) => {
        const sublineage = x.Sublineage;
        // if (sublineage && sublineage !== '-' && sublineage !== null && sublineage !== undefined && sublineage !== '' && sublineage.toString().trim() !== '') {
        //   acc[sublineage] = (acc[sublineage] || 0) + 1;
        // }
        acc[sublineage] = (acc[sublineage] || 0) + 1;
        return acc;
      }, {});
      sublineageData.push({ ...response, ...sublineageStats });
    } else if (organism === 'ngono'){
      NGMASTStats = yearData.reduce((acc, x) => {
        const NGMAST = x['NG-MAST TYPE'];
        // if (cgST && cgST !== '-' && cgST !== null && cgST !== undefined && cgST !== '' && cgST.toString().trim() !== '') {
        //   acc[cgST] = (acc[cgST] || 0) + 1;
        // }
        acc[NGMAST] = (acc[NGMAST] || 0) + 1;
        return acc;
      }, {});
      NGMASTData.push({ ...response, ...NGMASTStats });
    }

    // Initialize drugStats
    const drugStats = {};

    if (count) {
      const calculateDrugStats = rules => {
        rules.forEach(rule => {
          const drugData = yearData.filter(x => {
            if ('requirements' in rule) {
              return rule.requirements.every(req =>
                req.values.some(
                  value =>
                    (amrLikeOrganisms.includes(organism) && x[req.columnID]?.includes(value)) ||
                    x[req.columnID] === value,
                ),
              );
            }

            return rule.values.some(
              value =>
                (amrLikeOrganisms.includes(organism) && x[rule.columnID]?.includes(value)) ||
                x[rule.columnID]?.toString() === value.toString(),
            );
          });
          drugStats[rule.key] = drugData.length;

          if (!amrLikeOrganisms.includes(organism) && rule.key === 'Ciprofloxacin NS') {
            const cipRCount = yearData.filter(x => x[rule.columnID] === 'CipR').length;
            drugStats['Ciprofloxacin R'] = cipRCount;
            drugStats['Ciprofloxacin NS'] += cipRCount;
          }
        });
      };

      if (organism === 'styphi') {
        calculateDrugStats(drugRulesST);
        Object.keys(drugClassesRulesST).forEach(key => {
          const filteredGenotypes = Object.entries(genotypeStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .reduce((acc, [genotype, count]) => {
              acc[genotype] = count;
              return acc;
            }, {});

          genotypesAndDrugsDataUniqueGenotypes[key].push(...Object.keys(filteredGenotypes));
          const drugClass = getDrugClassData({ columnID: key, dataToFilter: yearData, drugClassesRules:drugClassesRulesST });
          const item = { ...response, ...filteredGenotypes, ...drugClass, totalCount: count };
          delete item.count;
          genotypesAndDrugsData[key].push(item);
        });
      } else if (['senterica', 'sentericaints'].includes(organism)) {
        // calculateDrugStats(drugRulesINTS);
        statKeysINTS.forEach(drug => {
          const drugData = yearData.filter(x => {
            if (Array.isArray(drug.column)) {
              return drug.column.every(d => x[d] === '-');
            }

            return x[drug.column] !== '-';
          });
          drugStats[drug.name] = drugData.length;
        });
        
        markersDrugsINTS.forEach(key=> {
        const filteredGenotypes = Object.entries(genotypeStats)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .reduce((acc, [genotype, count]) => {
            acc[genotype] = count;
            return acc;
          }, {});

          genotypesAndDrugsDataUniqueGenotypes[key].push(...Object.keys(filteredGenotypes));

          const drugClass = getDrugClassDataINTS({ drugKey: key, dataToFilter: yearData });

          const item = { ...response, ...filteredGenotypes, ...drugClass, totalCount: count };
          delete item.count;

          genotypesAndDrugsData[key].push(item);
        });
      } else if (organism === 'kpneumo') {
        drugRulesKP.forEach(rule => {
          const drugData = yearData.filter(x => {
            if (rule.value) {
              return rule.columnIDs.every(id => x[id] === rule.value);
            }
            if (rule.every) {
              return rule.columnIDs.every(id => x[id] !== '-');
            }
            return rule.columnIDs.some(id => x[id] !== '-');
          });
          drugStats[rule.key] = drugData.length;
        });

        drugStats['Pansusceptible'] = yearData.filter(x => x.num_resistance_classes?.toString() === '0').length;

        markersDrugsKP.forEach(key => {
          const filteredGenotypes = Object.entries(genotypeStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .reduce((acc, [genotype, count]) => {
              acc[genotype] = count;
              return acc;
            }, {});

          genotypesAndDrugsDataUniqueGenotypes[key].push(...Object.keys(filteredGenotypes));

          const drugClass = getKPDrugClassData({ drugKey: key, dataToFilter: yearData });
          const item = { ...response, ...filteredGenotypes, ...drugClass, totalCount: count };
          delete item.count;

          genotypesAndDrugsData[key].push(item);
        });
      } else if (organism === 'ngono') {
        calculateDrugStats(drugRulesNG);

        Object.keys(drugClassesRulesNG).forEach(key => {
          const filteredGenotypes = Object.entries(genotypeStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .reduce((acc, [genotype, count]) => {
              acc[genotype] = count;
              return acc;
            }, {});

          genotypesAndDrugsDataUniqueGenotypes[key].push(...Object.keys(filteredGenotypes));
          const drugClass = getDrugClassData({ columnID: key, dataToFilter: yearData, drugClassesRules: drugClassesRulesNG });
          const item = { ...response, ...filteredGenotypes, ...drugClass, totalCount: count };
          delete item.count;

          genotypesAndDrugsData[key].push(item);
        });
      } else {
        statKeysECOLI.forEach(drug => {
          const drugData = yearData.filter(x => {
            if (Array.isArray(drug.column)) {
              return drug.column.every(d => x[d] === '-');
            }

            return x[drug.column] !== '-';
          });
          drugStats[drug.name] = drugData.length;
        });
        
        markersDrugsSH.forEach(key => {
          const filteredGenotypes = Object.entries(genotypeStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .reduce((acc, [genotype, count]) => {
              acc[genotype] = count;
              return acc;
            }, {});

          genotypesAndDrugsDataUniqueGenotypes[key].push(...Object.keys(filteredGenotypes));

          const drugClass = getKPDrugClassData({ drugKey: key, dataToFilter: yearData, notKP: true });
          const item = { ...response, ...filteredGenotypes, ...drugClass, totalCount: count };
          delete item.count;

          genotypesAndDrugsData[key].push(item);
        });
        
      }
      drugsData.push({ ...response, ...drugStats });
    }

    if (getUniqueGenotypes) {
      const sortedStatsGenotypes = Object.entries(genotypeStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .reduce((acc, [genotype]) => {
          acc[genotype] = genotypeStats[genotype];
          return acc;
        }, {});

      uniqueGenotypes = uniqueGenotypes.concat(Object.keys(sortedStatsGenotypes));

      if (organism === 'kpneumo') {
        const sortedStatsCgST = Object.entries(cgSTStats)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 20)
          .reduce((acc, [cgST]) => {
            acc[cgST] = cgSTStats[cgST];
            return acc;
          }, {});

        uniqueCgST = uniqueCgST.concat(Object.keys(sortedStatsCgST));

        const sortedStatsSublineages = Object.entries(sublineageStats)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 20)
          .reduce((acc, [sublineage]) => {
            acc[sublineage] = sublineageStats[sublineage];
            return acc;
          }, {});

        uniqueSublineages = uniqueSublineages.concat(Object.keys(sortedStatsSublineages));
        
      } else if (organism === 'ngono'){
          const sortedStatsNGMAST = Object.entries(NGMASTStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 20)
            .reduce((acc, [NGMAST]) => {
              acc[NGMAST] = NGMASTStats[NGMAST];
              return acc;
            }, {});

          uniqueNGMAST = uniqueNGMAST.concat(Object.keys(sortedStatsNGMAST));
      }
    }

    return { ...response, ...genotypeStats };
  });

  if (getUniqueGenotypes) {
    uniqueGenotypes = [...new Set(uniqueGenotypes)];
    uniqueCgST = [...new Set(uniqueCgST)];
    uniqueSublineages = [...new Set(uniqueSublineages)];
  }

  Object.keys(genotypesAndDrugsDataUniqueGenotypes).forEach(key => {
    const unique = [...new Set(genotypesAndDrugsDataUniqueGenotypes[key])];

    genotypesAndDrugsData[key].forEach(item => {
      unique.forEach(genotype => {
        if (!(genotype in item)) {
          item[genotype] = 0;
        }
      });
    });
  });

  return {
    genotypesData: genotypesData.filter(x => x.count > 0),
    drugsData,
    uniqueGenotypes,
    genotypesAndDrugsData,
    cgSTData,
    sublineageData,
    uniqueCgST,
    uniqueSublineages,
    NGMASTData: NGMASTData.filter(x => x.count > 0)
  };
}

export function getKOYearsData({ data, years }) {
  const KOData = { O_locus: [], K_locus: [], O_type: [] };
  const uniqueKO = { O_locus: [], K_locus: [], O_type: [] };

  const statKeys = ['O_locus', 'K_locus', 'O_type'];

  const computeStats = (items, key) => {
    const stats = items.reduce((acc, x) => {
      const val = x[key];
      if (val !== '-') {
        acc[val] = (acc[val] || 0) + 1;
      }
      return acc;
    }, {});

    const topStats = Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .reduce((acc, [item]) => {
        acc[item] = stats[item];
        return acc;
      }, {});

    return { stats, topKeys: Object.keys(topStats) };
  };

  years.forEach(year => {
    const yearData = data.filter(x => x.DATE.toString() === year.toString());
    const count = yearData.length;
    const response = { name: year, count };

    if (count === 0) {
      statKeys.forEach(key => KOData[key].push(response));
      return;
    }

    statKeys.forEach(key => {
      const { stats, topKeys } = computeStats(yearData, key);
      KOData[key].push({ ...response, ...stats });
      uniqueKO[key] = uniqueKO[key].concat(topKeys);
    });
  });

  // Deduplicate and sort
  statKeys.forEach(key => {
    uniqueKO[key] = [...new Set(uniqueKO[key])].sort();
  });

  return { KOYearsData: KOData, uniqueKO };
}

export function getDrugsCountriesData({ data, items, organism, type = 'country' }) {
  const drugsData = {};

  // Initialize data structures based on organism type
  const initializeDataStructures = rules => {
    rules.forEach(key => {
      drugsData[key] = [];
    });
  };

  // Determine applicable rules
  const isKP = organism === 'kpneumo';
  const isST = organism === 'styphi';
  const isSGono = organism === 'ngono';
  const rules = isKP
    ? markersDrugsKP
    : isST
    ? Object.keys(drugClassesRulesST)
    : isSGono
    ? Object.keys(drugClassesRulesNG)
    : statKeys[organism]?.map(drug => drug.name) || [];

  initializeDataStructures(rules);

  (type === 'country' ? items : Object.keys(items).sort()).forEach(item => {
    const itemData = data.filter(x => {
      const country = getCountryDisplayName(x.COUNTRY_ONLY);

      if (type === 'country') {
        return country === item;
      }
      return items[item].includes(country);
    });
    const count = itemData.length;
    const response = { name: item, count };

    if (count === 0) return response;

    if (count >= 10) {
      rules.forEach(key => {
        let drugClass = {};

        if (isKP) {
          drugClass = getKPDrugClassData({ drugKey: key, dataToFilter: itemData });
        } else if (isST && drugClassesRulesST[key]) {
          drugClassesRulesST[key].forEach(classRule => {
            const classRuleName = classRule.name;
            if (classRuleName === 'None') return;

            drugClass[classRuleName] = itemData.filter(x =>
              classRule.rules.every(r =>
                key === 'Pansusceptible' && !classRule.susceptible
                  ? x[r.columnID]?.toString() !== r.value.toString()
                  : x[r.columnID]?.toString() === r.value.toString()
              )
            ).length;

            if (classRule.susceptible) {
              drugClass.resistantCount = drugClass.totalCount - drugClass[classRuleName];
            }
          });
        }else if (isST && drugClassesRulesNG[key]) {
          drugClassesRulesST[key].forEach(classRule => {
            const classRuleName = classRule.name;
            if (classRuleName === 'None') return;

            drugClass[classRuleName] = itemData.filter(x =>
              classRule.rules.every(r =>
                key === 'Pansusceptible' && !classRule.susceptible
                  ? x[r.columnID]?.toString() !== r.value.toString()
                  : x[r.columnID]?.toString() === r.value.toString()
              )
            ).length;

            if (classRule.susceptible) {
              drugClass.resistantCount = drugClass.totalCount - drugClass[classRuleName];
            }
          });
        } else {
          // Handle all other organisms
          drugClass = {
            ...getDrugClassDataINTS({
              drugKey: key,
              dataToFilter: itemData,
              notINTS: ['ecoli', 'decoli','shige'].includes(organism) ? true : false,
            }),
          };
        }

        const item = { ...response, ...drugClass, totalCount: count };
        delete item.count;

        drugsData[key].push(item);
      });
    }
  });

  return { drugsData };
}

/*function getYearsLocationData({ yearData, items, rule, type = 'country', drugClassResponse, organism }) {
  const drugClass = { items: {} };

  (type === 'country' ? items : Object.keys(items).sort()).forEach(item => {
    const countryData = yearData.filter(x => {
      const country = getCountryDisplayName(x.COUNTRY_ONLY);

      if (type === 'country') {
        return country === item;
      }
      return items[item].includes(country);
    });

    const countryDrugClasses = {
      totalCount: countryData.length,
      resistantCount: 0,
    };

    if (['styphi', 'ngono'].includes(organism)) {
      (organism === 'styphi' ? drugClassesRulesST : drugClassesRulesNG)[rule.key].forEach(classRule => {
        const classRuleName = classRule.name;

        countryDrugClasses[classRuleName] = countryData.filter(x => {
          return classRule.rules.every(r =>
            rule.key === 'Pansusceptible' && !classRule.susceptible
              ? x[r.columnID]?.toString() !== r.value.toString()
              : x[r.columnID]?.toString() === r.value.toString(),
          );
        }).length;

        if (classRule.susceptible) {
          countryDrugClasses.resistantCount = countryDrugClasses.totalCount - countryDrugClasses[classRuleName];
        }
      });
    } else if (organism === 'kpneumo') {
      Object.assign(countryDrugClasses, getKPDrugClassData({ drugKey: rule, dataToFilter: countryData }));
    } else {
    }

    drugClassResponse[item] = countryDrugClasses.resistantCount;
    drugClassResponse.resistantCount += countryDrugClasses.resistantCount;
    drugClass.items[item] = { ...countryDrugClasses };
  });

  return drugClass;
}*/

// Get data for frequencies and determinants graphs
export function getGenotypesData({
  data,
  genotypes,
  pathotypes,
  serotypes,
  organism,
  years,
  countries,
  regions,
  dataForGeographic,
}) {
  // // Add validation for required parameters
  // if (!data || !Array.isArray(data)) {
  //   console.warn('getGenotypesData: data is not a valid array');
  //   return { genotypesDrugsData: [], genotypesDrugClassesData: {} };
  // }

  // if (!genotypes || !Array.isArray(genotypes)) {
  //   console.warn('getGenotypesData: genotypes is not a valid array');
  //   return { genotypesDrugsData: [], genotypesDrugClassesData: {} };
  // }

  const genotypesDrugClassesData = {};
  const countriesDrugClassesData = {};
  const regionsDrugClassesData = {};

  const organismDrugMap = {
    styphi: { list: drugRulesST, keyFn: drug => drug.key },
    ngono: { list: drugRulesNG.filter(d => d.key !== 'Pansusceptible'), keyFn: drug => drug.key },
    kpneumo: { list: markersDrugsKP, keyFn: key => key },
    senterica: { list: drugRulesINTS, keyFn: drug => drug.key },
    sentericaints: { list: drugRulesINTS, keyFn: drug => drug.key },
    ecoli: { list: statKeys['ecoli'], keyFn: drug => drug.name },
    decoli: { list: statKeys['decoli'], keyFn: drug => drug.name },
    shige: { list: statKeys['shige'], keyFn: drug => drug.name },
  };

  const config = organismDrugMap[organism];
  if (config) {
    config.list.forEach(item => {
      const key = config.keyFn(item);
      genotypesDrugClassesData[key] = [];
      // countriesDrugClassesData[key] = [];
      // regionsDrugClassesData[key] = [];
    });
  }

  // Genotypes
  const genotypesDrugsData = genotypes.map(genotype => {
    // const genotypeData = data.filter((x) => x.GENOTYPE === genotype);
    const genotypeData = data.filter(x => x.GENOTYPE?.toString() === genotype);
    const response = {
      name: genotype,
      totalCount: genotypeData.length,
      resistantCount: 0,
    };

    const drugClassResponse = {
      name: genotype,
      totalCount: genotypeData.length,
      resistantCount: 0,
    };

    if (organism === 'styphi') {
      drugRulesST.forEach(rule => {
        const drugData = genotypeData.filter(x => rule.values.map(String).includes(String(x[rule.columnID])));
        response[rule.key] = drugData.length;

        if (rule.key === 'Ciprofloxacin NS') {
          response['Ciprofloxacin R'] = genotypeData.filter(x => x[rule.columnID] === 'CipR').length;
          response['Ciprofloxacin NS'] = response['Ciprofloxacin NS'] + response['Ciprofloxacin R'];
        }

        // Only process drug classes if the rule key exists in drugClassesRulesST
        if (drugClassesRulesST[rule.key]) {
          const drugClass = { ...drugClassResponse };

          drugClassesRulesST[rule.key].forEach(classRule => {
            const classRuleName = classRule.name;

            drugClass[classRuleName] = genotypeData.filter(x => {
              return classRule.rules.every(r =>
                rule.key === 'Pansusceptible' && !classRule.susceptible
                  ? x[r.columnID]?.toString() !== r.value.toString()
                  : x[r.columnID]?.toString() === r.value.toString(),
              );
            }).length;

            if (classRule.susceptible) {
              drugClass.resistantCount = drugClass.totalCount - drugClass[classRuleName];
            }
          });

          genotypesDrugClassesData[rule.key].push(drugClass);
        }
      });
    } else if (organism === 'kpneumo') {
      drugRulesKP.forEach(rule => {
        const drugData = genotypeData.filter(x => {
          if (rule.value) {
            return rule.columnIDs.every(id => x[id] === rule.value);
          }
          if (rule.every) {
            return rule.columnIDs.every(id => x[id] !== '-');
          }
          return rule.columnIDs.some(id => x[id] !== '-');
        });
        response[rule.key] = drugData.length;
      });

      const susceptible = genotypeData.filter(x => x.num_resistance_classes?.toString() === '0');
      response['Pansusceptible'] = susceptible.length;

      markersDrugsKP.forEach(key => {
        const drugClass = {
          ...drugClassResponse,
          ...getKPDrugClassData({ drugKey: key, dataToFilter: genotypeData }),
        };
        genotypesDrugClassesData[key].push(drugClass);
      });
    } else if (organism === 'ngono') {
      drugRulesNG.forEach(rule => {
        const drugData = genotypeData.filter(x => rule.values.includes(x[rule.columnID]));
        response[rule.key] = drugData.length;

        const drugClassesToInclude = ['Azithromycin', 'Ceftriaxone', 'Cefixime'];

        if (drugClassesToInclude.includes(rule.key)) {
          const drugClass = { ...drugClassResponse };

          drugClassesRulesNG[rule.key].forEach(classRule => {
            const classRuleName = classRule.name;

            drugClass[classRuleName] = genotypeData.filter(x => {
              return classRule.rules.every(r => x[r.columnID]?.toString() === r.value.toString());
            }).length;

            if (classRule.susceptible) {
              drugClass.resistantCount = drugClass.totalCount - drugClass[classRuleName];
            }
          });
          genotypesDrugClassesData[rule.key].push(drugClass);
        }
      });
    } else if (['senterica', 'sentericaints'].includes(organism)) {
  // Drug counts for each genotype - matches getYearsData logic
    statKeysINTS.forEach(drug => {
      const drugData = genotypeData.filter(x => {
        if (Array.isArray(drug.column)) {
          return drug.column.every(d => x[d] === '-');
        }
        return x[drug.column] !== '-';
      });
      response[drug.name] = drugData.length;
    });

    // Marker counts for each genotype - matches getYearsData logic exactly
    markersDrugsINTS.forEach(key => {
      const drugClass = {
        ...drugClassResponse,
        ...getDrugClassDataINTS({ drugKey: key, dataToFilter: genotypeData }),
      };
      genotypesDrugClassesData[key].push(drugClass);
    });
    }else {
      statKeys[organism].forEach(drug => {
        const drugData = genotypeData.filter(x => {
          if (Array.isArray(drug.column)) {
            return drug.column.every(d => x[d] === '-');
          }

          return x[drug.column] !== '-';
        });
        response[drug.name] = drugData.length;

        if (drug.name !== 'Pansusceptible') {
          const drugClass = {
            ...drugClassResponse,
            ...getKPDrugClassData({ drugKey: drug.name, dataToFilter: genotypeData, notKP: true }),
          };
          genotypesDrugClassesData[drug.name].push(drugClass);
        }
      });
    }

    response.resistantCount = response.totalCount - response['Pansusceptible'];
    return response;
  });

  genotypesDrugsData.sort((a, b) => b.totalCount - a.totalCount);
  Object.keys(genotypesDrugClassesData).forEach(key => {
    genotypesDrugClassesData[key].sort((a, b) => b.resistantCount - a.resistantCount);
    genotypesDrugClassesData[key] = genotypesDrugClassesData[key].slice(0, 10);
    genotypesDrugClassesData[key].forEach(item => delete item['None']);
  });

  // Years
  // years.forEach(year => {
  //   const yearData = (dataForGeographic || data).filter(x => x.DATE.toString() === year.toString());

  //   const drugClassResponse = {
  //     name: year,
  //     totalCount: yearData.length,
  //     resistantCount: 0,
  //   };
  //   const drugClassResponseR = { ...drugClassResponse };

  //   if (organism === 'styphi') {
  //     drugRulesST.forEach(rule => {
  //       drugClassResponse.resistantCount = 0;
  //       const countryDrugClass = getYearsLocationData({
  //         drugClassResponse: drugClassResponse,
  //         items: countries,
  //         rule,
  //         yearData,
  //         organism,
  //       });
  //       countriesDrugClassesData[rule.key].push({ ...drugClassResponse, ...countryDrugClass });

  //       const regionDrugClass = getYearsLocationData({
  //         drugClassResponse: drugClassResponseR,
  //         items: regions,
  //         rule,
  //         yearData,
  //         type: 'region',
  //         organism,
  //       });
  //       regionsDrugClassesData[rule.key].push({ ...drugClassResponseR, ...regionDrugClass });
  //     });
  //   } else if (organism === 'kpneumo') {
  //     markersDrugsKP.forEach(key => {
  //       drugClassResponse.resistantCount = 0;
  //       const countryDrugClass = getYearsLocationData({
  //         drugClassResponse: drugClassResponse,
  //         items: countries,
  //         yearData,
  //         organism,
  //         rule: key,
  //       });
  //       countriesDrugClassesData[key].push({ ...drugClassResponse, ...countryDrugClass });

  //       const regionDrugClass = getYearsLocationData({
  //         drugClassResponse: drugClassResponseR,
  //         items: regions,
  //         yearData,
  //         type: 'region',
  //         organism,
  //         rule: key,
  //       });
  //       regionsDrugClassesData[key].push({ ...drugClassResponseR, ...regionDrugClass });
  //     });
  //   } else if (organism === 'ngono') {
  //     const drugClassesToInclude = ['Azithromycin', 'Ceftriaxone'];
  //     drugRulesNG.forEach(rule => {
  //       drugClassResponse.resistantCount = 0;
  //       if (drugClassesToInclude.includes(rule.key)) {
  //         const countryDrugClass = getYearsLocationData({
  //           drugClassResponse: drugClassResponse,
  //           items: countries,
  //           rule,
  //           yearData,
  //           organism,
  //         });
  //         countriesDrugClassesData[rule.key].push({ ...drugClassResponse, ...countryDrugClass });

  //         const regionDrugClass = getYearsLocationData({
  //           drugClassResponse: drugClassResponseR,
  //           items: regions,
  //           rule,
  //           yearData,
  //           type: 'region',
  //           organism,
  //         });
  //         regionsDrugClassesData[rule.key].push({ ...drugClassResponseR, ...regionDrugClass });
  //       }
  //     });
  //   } else {
  //     drugRulesINTS.forEach(rule => {
  //       drugClassResponse.resistantCount = 0;
  //       const countryDrugClass = getYearsLocationData({
  //         drugClassResponse: drugClassResponse,
  //         items: countries,
  //         rule,
  //         yearData,
  //         organism,
  //       });
  //       countriesDrugClassesData[rule.key].push({ ...drugClassResponse, ...countryDrugClass });

  //       const regionDrugClass = getYearsLocationData({
  //         drugClassResponse: drugClassResponseR,
  //         items: regions,
  //         rule,
  //         yearData,
  //         type: 'region',
  //         organism,
  //       });
  //       regionsDrugClassesData[rule.key].push({ ...drugClassResponseR, ...regionDrugClass });
  //     });
  //   }
  // });

  return {
    genotypesDrugsData,
    genotypesDrugClassesData,
    countriesDrugClassesData,
    regionsDrugClassesData,
  };
}

// Get data for NG_MAST MapView
export function getNgmastData({ data, ngmast, organism }) {
  if (organism !== 'ngono') {
    return { ngmastDrugClassesData: {}, ngmastDrugData: [] };
  }

  // // Add validation for required parameters
  // if (!data || !Array.isArray(data)) {
  //   console.warn('getNgmastData: data is not a valid array');
  //   return { ngmastDrugClassesData: {}, ngmastDrugData: [] };
  // }

  // if (!ngmast || !Array.isArray(ngmast)) {
  //   console.warn('getNgmastData: ngmast is not a valid array');
  //   return { ngmastDrugClassesData: {}, ngmastDrugData: [] };
  // }

  // Initialize ngmastDrugClassesData based on drugClassesRulesNG
  const ngmastDrugClassesData = {};
  Object.keys(drugClassesRulesNG).forEach(key => {
    ngmastDrugClassesData[key] = [];
  });

  // Prepare to collect ngmastDrugData
  const ngmastDrugData = ngmast.map(mast => {
    // Filter data for the current mast
    const ngmastData = data.filter(x => x['NG-MAST TYPE'] === mast);
    const totalCount = ngmastData.length;

    // Calculate drug rule counts
    const response = {
      name: mast,
      totalCount,
      resistantCount: 0,
      Pansusceptible: 0,
    };

    const drugClassResponse = { ...response };

    // Iterate over drug rules to calculate counts
    drugRulesNG.forEach(rule => {
      const drugDataCount = ngmastData.filter(x => rule.values.includes(x[rule.columnID])).length;
      response[rule.key] = drugDataCount;
    });

    // Calculate susceptible count
    response.Pansusceptible = ngmastData.filter(x => x.Pansusceptible === '1').length;

    // Update resistant count
    response.resistantCount = response.totalCount - response.Pansusceptible;

    // Create and push drugClass objects
    Object.keys(drugClassesRulesNG).forEach(key => {
      const drugClass = { ...drugClassResponse };
      ngmastDrugClassesData[key].push(drugClass);
    });

    return response;
  });

  // Sort ngmastDrugData based on totalCount
  ngmastDrugData.sort((a, b) => b.totalCount - a.totalCount);

  // Sort and limit ngmastDrugClassesData
  Object.keys(ngmastDrugClassesData).forEach(key => {
    ngmastDrugClassesData[key].sort((a, b) => b.resistantCount - a.resistantCount).slice(0, 10);
  });

  return { ngmastDrugClassesData, ngmastDrugData };
}

// Define KO_MDR and KO_HV arrays
// const KO_MDR = ['ST258', 'ST307', 'ST340', 'ST512', 'ST11', 'ST15'];
// const KO_HV = ['ST23', 'ST86', 'ST65', 'ST25'];

// Define getKODiversityData function
export function getKODiversityData({ data }) {
  // Add data validation
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('⚠️ [DEBUG] getKODiversityData: Invalid or empty data provided');
    return { K_locus: [], O_locus: [] };
  }

  // Initialize KODiversityData object
  const KODiversityData = {
    K_locus: [],
    O_locus: [],
  };

  // Function to calculate counts
  const calculateCounts = diversityData => {
    // // Add validation for diversityData
    // if (!Array.isArray(diversityData)) {
    //   console.warn('calculateCounts: diversityData is not an array');
    //   return { Carbapenems: 0, ESBL: 0, 'Aerobactin(iuc)': 0, rmpADC: 0, None: 0 };
    // }

    const counts = {
      // MDR: 0,
      // Hv: 0,
      Carbapenems: 0,
      ESBL: 0,
      'Aerobactin(iuc)': 0,
      rmpADC: 0,
      None: 0,
    };

    diversityData.forEach(x => {
      // if (KO_MDR.includes(x.GENOTYPE.toString())) counts.MDR++;
      // if (KO_HV.includes(x.GENOTYPE.toString())) counts.Hv++;
      if (x.Bla_Carb_acquired !== '-') counts.Carbapenems++;
      if (x.Bla_ESBL_acquired !== '-') counts.ESBL++;
      if (x.Aerobactin !== '-') counts['Aerobactin(iuc)']++;
      if (!['-', '-,-,-'].includes(x.RmpADC)) counts.rmpADC++;
      if (
        // !KO_MDR.includes(x.GENOTYPE.toString()) &&
        // !KO_HV.includes(x.GENOTYPE.toString()) &&
        x.Bla_Carb_acquired === '-' &&
        x.Bla_ESBL_acquired === '-' &&
        x.Aerobactin === '-' &&
        ['-', '-,-,-'].includes(x.RmpADC)
      ) {
        counts.None++;
      }
    });

    return counts;
  };

  // Iterate over KODiversityData keys
  Object.keys(KODiversityData).forEach(key => {
    // Get unique values for the key
    const values = [...new Set(data.map(x => x[key]))];

    // Calculate diversityData for each value
    const keyData = values.map(value => {
      const diversityData = data.filter(x => x[key] === value);
      const counts = calculateCounts(diversityData);

      // Return diversityData object
      return {
        name: value,
        count: diversityData.length,
        ...counts,
      };
    });

    // Filter out unknownData and add it to KODiversityData
    // Add validation to ensure name exists and is a string before calling includes
    // Filter out unknownData and add it to KODiversityData
    const unknownData = keyData.filter(x => x.name.includes('unknown'));
    const knownData = keyData.filter(x => !x.name.includes('unknown'));

    KODiversityData[key] = [
      ...knownData,
      {
        name: 'unknown',
        count: unknownData.reduce((total, obj) => obj.count + total, 0),
        ...Object.keys(unknownData[0] || {}).reduce((acc, key) => {
          if (key !== 'name' && key !== 'count') {
            acc[key] = unknownData.reduce((total, obj) => obj[key] + total, 0);
          }
          return acc;
        }, {}),
      },
    ];

    // Sort and limit KODiversityData
    KODiversityData[key].sort((a, b) => b.count - a.count);
    KODiversityData[key] = KODiversityData[key].slice(0, 20);
  });

  // Return KODiversityData
  return KODiversityData;
}

// Get top 50 highest items
const getUniqueValuesWithHighestCount = (data, key) => {
  // Step 1: Calculate the frequency of each unique value
  const countMap = data.reduce((acc, item) => {
    const value = getVariableValue(item, key);
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  // Step 2: Sort the unique values by their count in descending order
  const sortedByCount = Object.entries(countMap)
    .sort(([, countA], [, countB]) => countB - countA) // Sort by count in descending order
    .slice(0, 30); // Step 3: Get the top 50

  // Step 4: Return only the unique values, not their counts
  return sortedByCount.map(([value]) => value);
};

// Define getVariableValue function
function getVariableValue(dataItem, variable) {
  if (variable === 'COUNTRY_ONLY') {
    return getCountryDisplayName(dataItem[variable]);
  }

  return dataItem[variable];
}

// Define getConvergenceData function
export function getConvergenceData({ data, groupVariable, colourVariable }) {
  // Initialize convergenceData array and variablesCombinations and colourVariables arrays
  const convergenceData = [];
  let variablesCombinations = [];
  let colourVariables = [];

  // Function to get unique values
  // const getUniqueValues = (key) => [...new Set(data.map((x) => getVariableValue(x, key)))];

  // Define function for genotype or others
  const unique = getUniqueValuesWithHighestCount(data, groupVariable);

  // Check if groupVariable and colourVariable are the same
  if (groupVariable === colourVariable) {
    variablesCombinations = [...unique];
    colourVariables = [...unique];
  } else {
    // Get unique values for variablesCombinations and colourVariables
    // variablesCombinations = unique.flatMap((groupVal) =>
    //   getUniqueValues(colourVariable).map((colourVal) => `${groupVal} - ${colourVal}`),
    // );
    // colourVariables = getUniqueValues(colourVariable);
  }

  // Map combinations to data
  const combinationDataMap = variablesCombinations.reduce((acc, combination) => {
    const [groupVal, colourVal] = combination.split(' - ');

    acc[combination] = data.filter(x =>
      groupVariable === colourVariable
        ? getVariableValue(x, groupVariable)?.toString() === combination?.toString()
        : getVariableValue(x, groupVariable).toString() === groupVal.toString() &&
          getVariableValue(x, colourVariable).toString() === colourVal.toString(),
    );

    return acc;
  }, {});

  // Process each combination
  Object.keys(combinationDataMap).forEach(combination => {
    const combinedData = combinationDataMap[combination];
    const count = combinedData.length;

    if (count > 0) {
      const splitCombination = combination.split(' - ');
      const colorLabel = splitCombination.length > 1 ? splitCombination[1] : combination;
      const avgVirulenceScore = (
        combinedData.reduce((total, obj) => Number(obj.virulence_score) + total, 0) / count
      ).toFixed(2);
      const avgResistanceScore = (
        combinedData.reduce((total, obj) => Number(obj.num_resistance_classes) + total, 0) / count
      ).toFixed(2);

      convergenceData.push({
        name: combination,
        colorLabel,
        z: count,
        x: avgVirulenceScore,
        y: avgResistanceScore,
      });
    }
  });

  convergenceData.sort((a, b) => b.z - a.z);
  // Sort colourVariables based on the type of colourVariable
  colourVariables.sort((a, b) => (colourVariable === 'YEAR' ? b - a : a.localeCompare(b)));

  // Return convergenceData and colourVariables
  return { data: convergenceData, colourVariables };
}

// Define Replace function
function removeChars(genes) {
  return genes.map(gene => {
    if (gene.includes(':')) {
      return gene;
    }

    return gene
      .replace(/\..*$/, '') // Remove from . onward
      .replace(/[\^*?$]/g, ''); // Remove ^, *, ?, and $
  });
}

// Define getKPDrugClassData function
function getKPDrugClassData({ drugKey, dataToFilter, notKP = false }) {
  const drugClass = {};
  const columnIDs = [];
  const splitChar = notKP ? ',' : ';';
  let rules = {};

  if (notKP) {
    // if(ints)
    //   columnIDs.push([statKeysINTS.find(x => x.name === drugKey).column]);
    // else
    columnIDs.push([statKeysECOLI.find(x => x.name === drugKey).column]);
  } else {
    const drug = drugRulesKP.concat(drugRulesKPOnlyMarkers).find(x => x.key === drugKey);
    columnIDs.push(...drug.columnIDs);
    rules = drug;
  }
  //   const statKey = statKeysECOLI.find(x => x.name === drugKey);
  //   if (!statKey) {
  //     console.warn(`⚠️ [DEBUG] getKPDrugClassData: No statKey found for ${drugKey} in statKeysECOLI`);
  //     return { None: dataToFilter.length, resistantCount: 0 };
  //   }
  //   columnIDs.push(statKey.column);
  // } else {
  //   const drug = drugsKP.concat(drugRulesKPOnlyMarkers).find(x => x.key === drugKey);
  //   if (!drug) {
  //     console.warn(`⚠️ [DEBUG] getKPDrugClassData: No drug rule found for ${drugKey} in drugRulesKP/drugRulesKPOnlyMarkers`);
  //     return { None: dataToFilter.length, resistantCount: 0 };
  //   }
  //   if (!drug.columnIDs) {
  //     console.warn(`⚠️ [DEBUG] getKPDrugClassData: Drug rule for ${drugKey} has no columnIDs property`, drug);
  //     return { None: dataToFilter.length, resistantCount: 0 };
  //   }

  let resistantCount = 0;

  dataToFilter.forEach(x => {
    const columnsValues = columnIDs.map(id => x[id]).filter(x => !['ND'].includes(x));

    if (columnsValues.every(value => value === '-')) return;
    if (!notKP && 'value' in rules && columnsValues.every(value => value !== rules?.value)) return;
    if (!notKP && 'every' in rules && columnsValues.some(value => value === '-')) return;

    const genes = removeChars(
      columnsValues
        .filter(val => val !== '-')
        .join(splitChar)
        .split(splitChar),
    );

    resistantCount++;

    genes.forEach(gene => {
      drugClass[gene] = (drugClass[gene] || 0) + 1;
    });
  });

  drugClass['None'] = dataToFilter.length - resistantCount;
  drugClass.resistantCount = resistantCount;

  return drugClass;
}

// Define getDrugClassData function
function getDrugClassDataINTS({ drugKey, dataToFilter, notINTS = false }) {
  const drugClass = {};
  let resistantCount = 0;

  dataToFilter.forEach(x => {
    
    const foundItem = notINTS 
      ? statKeysECOLI.find(item => item.name === drugKey) 
      : statKeysINTS.find(item => item.name === drugKey);
    if (!foundItem) {
      console.warn(`Drug key "${drugKey}" not found in statKeysINTS`);
      return;
    }
    
    const columnName = foundItem.column; // Gets 'TRIMETHOPRIM'
    const value = x[columnName]; // Gets x['TRIMETHOPRIM']
    
    // Only count if value is present and not '-' or '0'
    if (value && value !== '-' && value !== '0' && value !== 'NA' && value !== 'ND') {
      resistantCount++;
      // Split multiple gene values if needed (e.g. ';' or ',' separated)
      const genes = value.split(/[;,]/).map(g => g.trim()).filter(g => g);
      genes.forEach(gene => {
        drugClass[gene] = (drugClass[gene] || 0) + 1;
      });
    }
  });

  drugClass['None'] = dataToFilter.length - resistantCount;
  drugClass.resistantCount = resistantCount;

  return drugClass;
}

function getDrugClassData({ columnID, dataToFilter, drugClassesRules }) {
  const drugClass = {};
  const genes = drugClassesRules[columnID];
  let resistantCount = 0;

  dataToFilter.forEach(x => {
    let anyGenePassed = false;
    genes.forEach(gene => {
      // Each gene has a set of rules that must ALL pass
      const rulePassed = gene.rules.every(rule => {
        // Use the correct column for each rule
        return x[rule.columnID]?.toString() === rule.value.toString();
      });

      if (rulePassed) {
        const name = gene.name;
        drugClass[name] = (drugClass[name] || 0) + 1;
        anyGenePassed = true;
      }
    });

    if (anyGenePassed) {
      resistantCount++;
    }
  });

  drugClass['None'] = dataToFilter.length - resistantCount;
  drugClass.resistantCount = resistantCount;

  return drugClass;
}

//Get Year based on Local and Travel filter
export function getYears({ data, dataset }) {
  // Filter the data based on the dataset parameter
  const filteredData = data.filter(item => {
    if (dataset === 'All') {
      return true;
    } else {
      return item.TRAVEL.toLowerCase() === dataset.toLowerCase();
    }
  });

  // Extract the unique and sorted dates from the filtered data
  const dates = Array.from(new Set(filteredData.map(item => item.DATE))).sort();

  return dates;
}
