import { generatePalleteForGenotypes } from '../../util/colorHelper';
import {
  drugRulesST,
  drugRulesKP,
  drugRulesNG,
  statKeys,
  drugRulesINTS,
} from '../../util/drugClassesRules';
import {
  drugClassesRulesST,
  drugClassesRulesKP,
  drugClassesRulesNG,
} from '../../util/drugClassesRules';
import { amrLikeOrganisms } from '../../util/organismsCards';

// This filter is called after either dataset, initialYear, finalYear or country changes and if reset button is pressed.
// And it returns the data filtered by the variables said before, also the list of unique genotypes, count of genotypes
// and count of genomes.
export function filterData({
  data,
  dataset,
  actualTimeInitial,
  actualTimeFinal,
  organism,
  actualCountry,
  actualRegion,
  economicRegions,
  selectedLineages,
}) {
  const checkDataset = (item) => dataset === 'All' || item.TRAVEL === dataset.toLowerCase();
  const checkTime = (item) => {
    return item.DATE >= actualTimeInitial && item.DATE <= actualTimeFinal;
  };
  const checkLineages = (item) => {
    if (!['sentericaints', 'decoli', 'shige'].includes(organism)) {
      return true;
    }

    if (['sentericaints'].includes(organism)) {
      return (selectedLineages ?? []).some((selected) =>
        item.SISTR1_Serovar.toLowerCase().includes(selected.toLowerCase()),
      );
    }

    return (selectedLineages ?? []).some((selected) =>
      item.Pathotype.toLowerCase().includes(selected.toLowerCase()),
    );
  };
  //update here
  const newData = data.filter((x) => checkDataset(x) && checkTime(x) && checkLineages(x));
  // const genotypes = [...new Set(newData.map((x) => x.GENOTYPE))];
  const genotypes = [
    ...new Set(newData.map((x) => (organism === 'ecoli' ? x.GENOTYPE1 : x.GENOTYPE))),
  ];
  if (organism === 'styphi') {
    genotypes.sort((a, b) => a.localeCompare(b));
  } else {
    genotypes.sort((a, b) => a - b);
  }

  let genomesCount = newData.length;
  let genotypesCount = genotypes.length;
  let listPMID = [];

  if (actualRegion !== 'All') {
    const countriesForFilter =
      actualCountry !== 'All' ? [actualCountry] : economicRegions[actualRegion];
    const countryData = newData.filter((x) =>
      countriesForFilter.includes(getCountryDisplayName(x.COUNTRY_ONLY)),
    );
    genomesCount = countryData.length;
    listPMID = [...new Set(countryData.map((x) => x.PMID))];
    //changed
    // const countryGenotypes = [...new Set(countryData.map((x) => x.GENOTYPE))];
    // genotypesCount = countryGenotypes.length;
    // const countryGenotypes = [...new Set(countryData.map((x) => (organism === 'ecoli' ? x.GENOTYPE1 : x.GENOTYPE)))];
  }

  return {
    data: newData,
    genomesCount,
    genotypesCount,
    listPMID,
  };
}

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
}) {
  const filterByDataset = (item) => dataset === 'All' || item.TRAVEL === dataset.toLowerCase();
  const filterByTimeRange = (item, start, end) => item.DATE >= start && item.DATE <= end;
  const filterByLineages = (item) => {
    if (!['sentericaints', 'decoli', 'shige'].includes(organism)) {
      return true;
    }

    if (organism === 'sentericaints') {
      return selectedLineages.includes(item.serotype);
    }
    return selectedLineages.includes(item.Pathovar);
  };
  // const newData = data.filter((x) => filterByDataset(x) && filterByTimeRange(x) && filterByLineages(x));
  const filterData = (start, end) =>
    data.filter(
      (x) => filterByDataset(x) && filterByTimeRange(x, start, end) && filterByLineages(x),
    );

  let newDataGD = filterData(starttimeGD, endtimeGD);
  let newDataDRT = filterData(starttimeDRT, endtimeDRT);
  let newDataRDT = filterData(starttimeRDT, endtimeRDT);
  // console.log('newDataRDT', starttimeRDT, starttimeDRT, newDataRDT, newDataDRT);
  if (actualCountry !== 'All') {
    // const filterByCountry = newData.filter((x) => getCountryDisplayName(x.COUNTRY_ONLY) === actualCountry);
    const filterByCountry = (x) => getCountryDisplayName(x.COUNTRY_ONLY) === actualCountry;
    newDataGD = newDataGD.filter(filterByCountry);
    newDataDRT = newDataDRT.filter(filterByCountry);
    newDataRDT = newDataRDT.filter(filterByCountry);
  }

  return {
    genomesCountGD: newDataGD.length,
    genomesCountDRT: newDataDRT.length,
    genomesCountRDT: newDataRDT.length,
  };
}

//TODO: change for the mongo
// Adjust the country names to its correct name
export function getCountryDisplayName(country) {
  switch (country) {
    case 'Democratic Republic of the Congo':
    case 'Democratic Republic of Congo':
    case 'Republic of the Congo':
    case 'DR Congo':
      return 'Dem. Rep. Congo';
    case 'Channel Islands':
      return 'Jersey';
    case 'Czech Republic':
      return 'Czechia';
    case 'Central African Republic':
      return 'Central African Rep.';
    case 'Ivory Coast':
    case "Cote d'Ivoire":
    case 'Côte d’Ivoire':
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
      return country;
  }
}

// Get specific drug count, percentage and al its types for the map component
function getMapStatsData({ itemData, columnKey, statsKey, noItems = false, organism }) {
  const totalLength = itemData.length;
  const columnDataMap = itemData.reduce((acc, item) => {
    const rawKey = item[columnKey];
    const key = rawKey === undefined ? '-' : rawKey;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const items = Object.entries(columnDataMap).map(([name, count]) => {
    const percentage = (count / totalLength) * 100;
    return { name, count, percentage: Number(percentage.toFixed(2)) };
  });

  const statsList = items.filter((item) => {
    if (amrLikeOrganisms.includes(organism)) {
      if (Array.isArray(statsKey)) {
        return statsKey.some((x) => item.name?.includes(x));
      }

      return item.name?.includes(statsKey);
    }

    return item.name === statsKey;
  }) || { count: 0, percentage: 0 };

  const stats = {
    count: statsList.reduce((sum, item) => sum + item.count, 0),
    percentage: Number(statsList.reduce((sum, item) => sum + item.percentage, 0).toFixed(2)),
  };

  if (statsKey === '-' && columnKey !== 'QUINOLONE') {
    const nonStatsCount = totalLength - stats.count;

    if (noItems) {
      return {
        count: nonStatsCount,
        percentage: Number(((nonStatsCount / totalLength) * 100).toFixed(2)),
      };
    }

    return {
      items,
      count: nonStatsCount,
      percentage: Number(((nonStatsCount / totalLength) * 100).toFixed(2)),
    };
  }

  if (noItems) {
    return {
      count: stats.count,
      percentage: stats.percentage,
    };
  }

  return {
    items,
    count: stats.count,
    percentage: stats.percentage,
  };
}

// Get country data for map component, the data includes the name, count and drug stats
export function getMapData({ data, items, organism, type = 'country' }) {
  const mapData = [];
  const formattedItems = type === 'country' ? items : Object.keys({ ...items, All: '' }).sort();
  const pallete = generatePalleteForGenotypes(formattedItems);

  // if (type !== 'country') {
  //   data.forEach((x) => {
  //     const country = getCountryDisplayName(x.COUNTRY_ONLY);

  //     const isPartOfRegion = formattedItems
  //       .filter((y) => y !== 'All')
  //       .some((item) => {
  //         return items[item].includes(country);
  //       });

  //     if (!isPartOfRegion) {
  //       console.log(country);
  //     }
  //   });
  // }

  formattedItems.forEach((item) => {
    const itemData = data.filter((x) => {
      const country = getCountryDisplayName(x.COUNTRY_ONLY);

      if (type === 'country') {
        return country === item;
      }

      if (item === 'All') {
        return true;
      }

      return items[item].includes(country);
    });

    if (itemData.length === 0) {
      return;
    }

    const stats = {
      GENOTYPE: { items: [], count: 0 },
    };

    const generateStats = (statKey, dataKey = 'GENOTYPE') => {
      const statMap = itemData.reduce((acc, item) => {
        // changed here
        // const stat = item[dataKey];
        const stat = item[dataKey];
        acc[stat] = (acc[stat] || 0) + 1;
        return acc;
      }, {});

      stats[statKey].count = Object.keys(statMap).length;
      stats[statKey].items = Object.entries(statMap)
        .map(([stat, count]) => {
          const result = { name: stat.toString(), count, drugs: {} };
          const dataWithGenFilter = itemData.filter(
            (x) => x[dataKey].toString() === stat.toString(),
          );

          statKeys[organism in statKeys ? organism : 'others'].forEach(({ name, column, key }) => {
            if (Array.isArray(column)) {
              const count = dataWithGenFilter.filter((x) =>
                column.some((id) => x[id] !== '-'),
              ).length;
              result.drugs[name] = {
                items: [],
                count,
                percentage: Number(((count / dataWithGenFilter.length) * 100).toFixed(2)),
              };
            } else {
              result.drugs[name] = getMapStatsData({
                itemData: dataWithGenFilter,
                columnKey: column,
                statsKey: key,
                noItems: !['Carbapenems', 'ESBL'].includes(name),
                organism,
              });
            }
          });
          return result;
        })
        .sort((a, b) => b.count - a.count);
      stats[statKey].sum = stats[statKey].items.reduce((sum, item) => {
        return sum + (item.count || 0); // Add the count of each item to the sum
      }, 0);
    };

    // Genotype
    generateStats('GENOTYPE', organism === 'ecoli' ? 'GENOTYPE1' : 'GENOTYPE');

    // Serotype (other type)
    if (['shige', 'decoli', 'ecoli'].includes(organism)) {
      stats['SEROTYPE'] = { items: [], count: 0 };
      generateStats('SEROTYPE', 'Serotype');
    }

    // Pathotype / Serotype
    if (['shige', 'decoli', 'sentericaints', 'ecoli', 'senterica'].includes(organism)) {
      stats['PATHOTYPE'] = { items: [], count: 0 };
      generateStats(
        'PATHOTYPE',
        organism === 'ecoli'
          ? 'Pathovar'
          : organism === 'sentericaints'
          ? 'SISTR1_Serovar'
          : organism === 'senterica'
          ? 'SeqSero2_Serovar'
          : 'Pathotype',
      );
    }

    // Other stats
    statKeys[organism in statKeys ? organism : 'others'].forEach(({ name, column, key }) => {
      if (Array.isArray(column)) {
        const count = itemData.filter((x) => {
          if (name === 'Pansusceptible') {
            return column.every((id) => x[id] === key);
          }

          return column.some((id) => x[id] !== '-');
        }).length;
        stats[name] = {
          items: [],
          count,
          percentage: Number(((count / data.length) * 100).toFixed(2)),
        };
      } else {
        stats[name] = getMapStatsData({
          itemData,
          columnKey: column,
          statsKey: key,
          organism,
        });
      }
    });

    // NGMAST
    if (organism === 'ngono') {
      stats['NGMAST'] = { items: [], count: 0 };

      const ngmastMap = itemData.reduce((acc, item) => {
        const mast = item['NG-MAST TYPE'];
        acc[mast] = (acc[mast] || 0) + 1;
        return acc;
      }, {});

      stats.NGMAST.count = Object.keys(ngmastMap).length;
      stats.NGMAST.items = Object.entries(ngmastMap)
        .map(([mast, count]) => ({ name: mast, count }))
        .sort((a, b) => b.count - a.count);
      stats.NGMAST.sum = stats.NGMAST.items.reduce((sum, item) => {
        return sum + (item.count || 0); // Add the count of each item to the sum
      }, 0);
    }

    mapData.push({
      name: item,
      count: itemData.length,
      stats,
      color: pallete[item],
    });
  });

  return mapData;
}

// Retrieves data for years, genotypes, drugs, and unique genotypes based on the provided parameters.
export function getYearsData({ data, years, organism, getUniqueGenotypes = false }) {
  const drugsData = [];
  const genotypesAndDrugsData = {};
  let uniqueGenotypes = [];
  const genotypesAndDrugsDataUniqueGenotypes = {};

  // Initialize data structures based on organism type
  const initializeDataStructures = (rules) => {
    Object.keys(rules).forEach((key) => {
      genotypesAndDrugsData[key] = [];
      genotypesAndDrugsDataUniqueGenotypes[key] = [];
    });
  };

  if (organism === 'kpneumo') {
    initializeDataStructures(drugClassesRulesKP);
  } else if (organism === 'ngono') {
    initializeDataStructures(drugClassesRulesNG);
  }

  const genotypesData = years.map((year) => {
    const yearData = data.filter((x) => x.DATE.toString() === year.toString());
    const count = yearData.length;
    const response = { name: year, count };

    if (count === 0) return response;

    // Calculate genotype stats
    const genotypeStats = yearData.reduce((acc, x) => {
      // const genotype = x.GENOTYPE;
      const genotype = organism === 'ecoli' ? x.GENOTYPE1 : x.GENOTYPE;
      acc[genotype] = (acc[genotype] || 0) + 1;
      return acc;
    }, {});

    // Initialize drugStats
    const drugStats = {};

    if (count) {
      const calculateDrugStats = (rules) => {
        rules.forEach((rule) => {
          const drugData = yearData.filter((x) => {
            if ('requirements' in rule) {
              return rule.requirements.every((req) =>
                req.values.some(
                  (value) =>
                    (amrLikeOrganisms.includes(organism) && x[req.columnID]?.includes(value)) ||
                    x[req.columnID] === value,
                ),
              );
            }

            return rule.values.some(
              (value) =>
                (amrLikeOrganisms.includes(organism) && x[rule.columnID]?.includes(value)) ||
                x[rule.columnID] === value,
            );
          });
          drugStats[rule.key] = drugData.length;

          if (!amrLikeOrganisms.includes(organism) && rule.key === 'Ciprofloxacin NS') {
            const cipRCount = yearData.filter((x) => x[rule.columnID] === 'CipR').length;
            drugStats['Ciprofloxacin R'] = cipRCount;
            drugStats['Ciprofloxacin NS'] += cipRCount;
          }
        });
      };

      if (organism === 'styphi') {
        calculateDrugStats(drugRulesST);
      } else if (amrLikeOrganisms.includes(organism)) {
        calculateDrugStats(drugRulesINTS);
      } else if (organism === 'kpneumo') {
        drugRulesKP.forEach((rule) => {
          const drugData = yearData.filter((x) => rule.columnIDs.some((id) => x[id] !== '-'));
          drugStats[rule.key] = drugData.length;
        });

        drugStats['Pansusceptible'] = yearData.filter(
          (x) => x.num_resistance_classes === '0',
        ).length;

        Object.keys(drugClassesRulesKP).forEach((key) => {
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

        Object.keys(drugClassesRulesNG).forEach((key) => {
          const filteredGenotypes = Object.entries(genotypeStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .reduce((acc, [genotype, count]) => {
              acc[genotype] = count;
              return acc;
            }, {});

          genotypesAndDrugsDataUniqueGenotypes[key].push(...Object.keys(filteredGenotypes));

          const drugClass = getNGDrugClassData({ columnID: key, dataToFilter: yearData });
          const item = { ...response, ...filteredGenotypes, ...drugClass, totalCount: count };
          delete item.count;

          genotypesAndDrugsData[key].push(item);
        });
      }

      drugsData.push({ ...response, ...drugStats });
    }

    if (getUniqueGenotypes) {
      const sortedStats = Object.entries(genotypeStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .reduce((acc, [genotype]) => {
          acc[genotype] = genotypeStats[genotype];
          return acc;
        }, {});

      uniqueGenotypes = uniqueGenotypes.concat(Object.keys(sortedStats));
    }

    return { ...response, ...genotypeStats };
  });

  if (getUniqueGenotypes) {
    uniqueGenotypes = [...new Set(uniqueGenotypes)].sort();
  }

  Object.keys(genotypesAndDrugsDataUniqueGenotypes).forEach((key) => {
    const unique = [...new Set(genotypesAndDrugsDataUniqueGenotypes[key])];

    genotypesAndDrugsData[key].forEach((item) => {
      unique.forEach((genotype) => {
        if (!(genotype in item)) {
          item[genotype] = 0;
        }
      });
    });
  });

  return {
    genotypesData: genotypesData.filter((x) => x.count > 0),
    drugsData,
    uniqueGenotypes,
    genotypesAndDrugsData,
  };
}

export function getDrugsCountriesData({ data, items, organism, type = 'country' }) {
  const drugsData = {};

  // Initialize data structures based on organism type
  const initializeDataStructures = (rules) => {
    Object.keys(rules).forEach((key) => {
      drugsData[key] = [];
    });
  };

  const rules = organism === 'kpneumo' ? drugClassesRulesKP : drugClassesRulesST;

  initializeDataStructures(rules);

  (type === 'country' ? items : Object.keys(items).sort()).forEach((item) => {
    const itemData = data.filter((x) => {
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
      Object.keys(rules).forEach((key) => {
        let drugClass = {};

        if (organism === 'kpneumo') {
          drugClass = getKPDrugClassData({ drugKey: key, dataToFilter: itemData });
        }

        if (organism === 'styphi') {
          drugClassesRulesST[key].forEach((classRule) => {
            const classRuleName = classRule.name;

            if (classRuleName === 'None') {
              return;
            }

            drugClass[classRuleName] = itemData.filter((x) => {
              return classRule.rules.every((r) =>
                key === 'Pansusceptible' && !classRule.susceptible
                  ? x[r.columnID] !== r.value
                  : x[r.columnID] === r.value,
              );
            }).length;

            if (classRule.susceptible) {
              drugClass.resistantCount = drugClass.totalCount - drugClass[classRuleName];
            }
          });
        }

        const item = { ...response, ...drugClass, totalCount: count };
        delete item.count;

        drugsData[key].push(item);
      });
    }
  });

  return { drugsData };
}

function getYearsLocationData({
  yearData,
  items,
  rule,
  type = 'country',
  drugClassResponse,
  organism,
}) {
  const drugClass = { items: {} };

  (type === 'country' ? items : Object.keys(items).sort()).forEach((item) => {
    const countryData = yearData.filter((x) => {
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
      (organism === 'styphi' ? drugClassesRulesST : drugClassesRulesNG)[rule.key].forEach(
        (classRule) => {
          const classRuleName = classRule.name;

          countryDrugClasses[classRuleName] = countryData.filter((x) => {
            return classRule.rules.every((r) =>
              rule.key === 'Pansusceptible' && !classRule.susceptible
                ? x[r.columnID] !== r.value
                : x[r.columnID] === r.value,
            );
          }).length;

          if (classRule.susceptible) {
            countryDrugClasses.resistantCount =
              countryDrugClasses.totalCount - countryDrugClasses[classRuleName];
          }
        },
      );
    } else if (organism === 'kpneumo') {
      Object.assign(
        countryDrugClasses,
        getKPDrugClassData({ drugKey: rule, dataToFilter: countryData }),
      );
    } else {
    }

    drugClassResponse[item] = countryDrugClasses.resistantCount;
    drugClassResponse.resistantCount += countryDrugClasses.resistantCount;
    drugClass.items[item] = { ...countryDrugClasses };
  });

  return drugClass;
}

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
  const genotypesDrugClassesData = {};
  const countriesDrugClassesData = {};
  const regionsDrugClassesData = {};

  if (organism === 'styphi') {
    drugRulesST.forEach((drug) => {
      genotypesDrugClassesData[drug.key] = [];
      countriesDrugClassesData[drug.key] = [];
      regionsDrugClassesData[drug.key] = [];
    });
  } else if (organism === 'ngono') {
    drugRulesNG.forEach((drug) => {
      if (drug.key !== 'Pansusceptible') {
        genotypesDrugClassesData[drug.key] = [];
        countriesDrugClassesData[drug.key] = [];
        regionsDrugClassesData[drug.key] = [];
      }
    });
  } else if (organism === 'kpneumo') {
    Object.keys(drugClassesRulesKP).forEach((key) => {
      genotypesDrugClassesData[key] = [];
      countriesDrugClassesData[key] = [];
      regionsDrugClassesData[key] = [];
    });
  } else {
    drugRulesINTS.forEach((drug) => {
      genotypesDrugClassesData[drug.key] = [];
      countriesDrugClassesData[drug.key] = [];
      regionsDrugClassesData[drug.key] = [];
    });
  }

  // Genotypes
  const genotypesDrugsData = genotypes.map((genotype) => {
    // const genotypeData = data.filter((x) => x.GENOTYPE === genotype);
    const genotypeData = data.filter(
      (x) => (organism === 'ecoli' ? x.GENOTYPE1 : x.GENOTYPE).toString() === genotype,
    );
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
      drugRulesST.forEach((rule) => {
        const drugData = genotypeData.filter((x) => rule.values.includes(x[rule.columnID]));
        response[rule.key] = drugData.length;

        if (rule.key === 'Ciprofloxacin NS') {
          response['Ciprofloxacin R'] = genotypeData.filter(
            (x) => x[rule.columnID] === 'CipR',
          ).length;
          response['Ciprofloxacin NS'] = response['Ciprofloxacin NS'] + response['Ciprofloxacin R'];
        }

        const drugClass = { ...drugClassResponse };

        drugClassesRulesST[rule.key].forEach((classRule) => {
          const classRuleName = classRule.name;

          drugClass[classRuleName] = genotypeData.filter((x) => {
            return classRule.rules.every((r) =>
              rule.key === 'Pansusceptible' && !classRule.susceptible
                ? x[r.columnID] !== r.value
                : x[r.columnID] === r.value,
            );
          }).length;

          if (classRule.susceptible) {
            drugClass.resistantCount = drugClass.totalCount - drugClass[classRuleName];
          }
        });

        genotypesDrugClassesData[rule.key].push(drugClass);
      });
    } else if (organism === 'kpneumo') {
      drugRulesKP.forEach((rule) => {
        const drugData = genotypeData.filter((x) =>
          rule.columnIDs.some((columnID) => x[columnID] !== '-'),
        );
        response[rule.key] = drugData.length;
      });

      const susceptible = genotypeData.filter((x) => x.num_resistance_classes === '0');
      response['Pansusceptible'] = susceptible.length;

      Object.keys(drugClassesRulesKP).forEach((key) => {
        const drugClass = {
          ...drugClassResponse,
          ...getKPDrugClassData({ drugKey: key, dataToFilter: genotypeData }),
        };
        genotypesDrugClassesData[key].push(drugClass);
      });
    } else if (organism === 'ngono') {
      drugRulesNG.forEach((rule) => {
        const drugData = genotypeData.filter((x) => rule.values.includes(x[rule.columnID]));
        response[rule.key] = drugData.length;

        const drugClassesToInclude = ['Azithromycin', 'Ceftriaxone'];

        if (drugClassesToInclude.includes(rule.key)) {
          const drugClass = { ...drugClassResponse };

          drugClassesRulesNG[rule.key].forEach((classRule) => {
            const classRuleName = classRule.name;

            drugClass[classRuleName] = genotypeData.filter((x) => {
              return classRule.rules.every((r) => x[r.columnID] === r.value);
            }).length;

            if (classRule.susceptible) {
              drugClass.resistantCount = drugClass.totalCount - drugClass[classRuleName];
            }
          });
          genotypesDrugClassesData[rule.key].push(drugClass);
        }
      });
    } else if (amrLikeOrganisms.includes(organism)) {
      drugRulesINTS.forEach((rule) => {
        const drugData = genotypeData.filter((x) => {
          if ('requirements' in rule) {
            return rule.requirements.every((req) =>
              req.values.some(
                (value) =>
                  (amrLikeOrganisms.includes(organism) && x[req.columnID]?.includes(value)) ||
                  x[req.columnID] === value,
              ),
            );
          }

          return rule.values.some(
            (value) =>
              (amrLikeOrganisms.includes(organism) && x[rule.columnID]?.includes(value)) ||
              x[rule.columnID] === value,
          );
        });
        response[rule.key] = drugData.length;
      });
    }

    response.resistantCount = response.totalCount - response['Pansusceptible'];
    return response;
  });

  genotypesDrugsData.sort((a, b) => b.totalCount - a.totalCount);
  Object.keys(genotypesDrugClassesData).forEach((key) => {
    genotypesDrugClassesData[key].sort((a, b) => b.resistantCount - a.resistantCount);
    genotypesDrugClassesData[key] = genotypesDrugClassesData[key].slice(0, 10);
  });

  // Pathotypes
  const pathotypesDrugsData = !['senterica', 'ecoli'].includes(organism)
    ? []
    : pathotypes.map((pathotype) => {
        // const genotypeData = data.filter((x) => x.GENOTYPE === genotype);
        const column = organism === 'ecoli' ? 'Pathovar' : 'SeqSero2_Serovar';
        const pathotypeData = data.filter((x) => x[column] === pathotype);
        const response = {
          name: pathotype,
          totalCount: pathotypeData.length,
          resistantCount: 0,
        };

        drugRulesINTS.forEach((rule) => {
          const drugData = pathotypeData.filter((x) => {
            if ('requirements' in rule) {
              return rule.requirements.every((req) =>
                req.values.some(
                  (value) =>
                    (amrLikeOrganisms.includes(organism) && x[req.columnID]?.includes(value)) ||
                    x[req.columnID] === value,
                ),
              );
            }

            return rule.values.some(
              (value) =>
                (amrLikeOrganisms.includes(organism) && x[rule.columnID]?.includes(value)) ||
                x[rule.columnID] === value,
            );
          });
          response[rule.key] = drugData.length;
        });

        response.resistantCount = response.totalCount - response['Pansusceptible'];
        return response;
      });
  pathotypesDrugsData.sort((a, b) => b.totalCount - a.totalCount);

  const serotypesDrugsData = !['decoli', 'ecoli', 'shige'].includes(organism)
    ? []
    : serotypes.map((serotype) => {
        const column = 'Serotype';
        const excludedValues = ['NA', 'Escherichia Coli', 'Escherichia'];

        const serotypeData = data.filter((x) =>
          x[column] === serotype && !excludedValues.includes(x[column])
        );
        const response = {
          name: serotype,
          totalCount: serotypeData.length,
          resistantCount: 0,
        };

        drugRulesINTS.forEach((rule) => {
          const drugData = serotypeData.filter((x) => {
            if ('requirements' in rule) {
              return rule.requirements.every((req) =>
                req.values.some(
                  (value) =>
                    (amrLikeOrganisms.includes(organism) && x[req.columnID]?.includes(value)) ||
                    x[req.columnID] === value,
                ),
              );
            }

            return rule.values.some(
              (value) =>
                (amrLikeOrganisms.includes(organism) && x[rule.columnID]?.includes(value)) ||
                x[rule.columnID] === value,
            );
          });
          response[rule.key] = drugData.length;
        });

        response.resistantCount = response.totalCount - response['Pansusceptible'];
        return response;
      });
  serotypesDrugsData.sort((a, b) => b.totalCount - a.totalCount);

  // Years
  years.forEach((year) => {
    const yearData = (dataForGeographic || data).filter(
      (x) => x.DATE.toString() === year.toString(),
    );

    const drugClassResponse = {
      name: year,
      totalCount: yearData.length,
      resistantCount: 0,
    };
    const drugClassResponseR = { ...drugClassResponse };

    if (organism === 'styphi') {
      drugRulesST.forEach((rule) => {
        drugClassResponse.resistantCount = 0;
        const countryDrugClass = getYearsLocationData({
          drugClassResponse: drugClassResponse,
          items: countries,
          rule,
          yearData,
          organism,
        });
        countriesDrugClassesData[rule.key].push({ ...drugClassResponse, ...countryDrugClass });

        const regionDrugClass = getYearsLocationData({
          drugClassResponse: drugClassResponseR,
          items: regions,
          rule,
          yearData,
          type: 'region',
          organism,
        });
        regionsDrugClassesData[rule.key].push({ ...drugClassResponseR, ...regionDrugClass });
      });
    } else if (organism === 'kpneumo') {
      Object.keys(drugClassesRulesKP).forEach((key) => {
        drugClassResponse.resistantCount = 0;
        const countryDrugClass = getYearsLocationData({
          drugClassResponse: drugClassResponse,
          items: countries,
          yearData,
          organism,
          rule: key,
        });
        countriesDrugClassesData[key].push({ ...drugClassResponse, ...countryDrugClass });

        const regionDrugClass = getYearsLocationData({
          drugClassResponse: drugClassResponseR,
          items: regions,
          yearData,
          type: 'region',
          organism,
          rule: key,
        });
        regionsDrugClassesData[key].push({ ...drugClassResponseR, ...regionDrugClass });
      });
    } else if (organism === 'ngono') {
      const drugClassesToInclude = ['Azithromycin', 'Ceftriaxone'];
      drugRulesNG.forEach((rule) => {
        drugClassResponse.resistantCount = 0;
        if (drugClassesToInclude.includes(rule.key)) {
          const countryDrugClass = getYearsLocationData({
            drugClassResponse: drugClassResponse,
            items: countries,
            rule,
            yearData,
            organism,
          });
          countriesDrugClassesData[rule.key].push({ ...drugClassResponse, ...countryDrugClass });

          const regionDrugClass = getYearsLocationData({
            drugClassResponse: drugClassResponseR,
            items: regions,
            rule,
            yearData,
            type: 'region',
            organism,
          });
          regionsDrugClassesData[rule.key].push({ ...drugClassResponseR, ...regionDrugClass });
        }
      });
    } else {
      drugRulesINTS.forEach((rule) => {
        drugClassResponse.resistantCount = 0;
        const countryDrugClass = getYearsLocationData({
          drugClassResponse: drugClassResponse,
          items: countries,
          rule,
          yearData,
          organism,
        });
        countriesDrugClassesData[rule.key].push({ ...drugClassResponse, ...countryDrugClass });

        const regionDrugClass = getYearsLocationData({
          drugClassResponse: drugClassResponseR,
          items: regions,
          rule,
          yearData,
          type: 'region',
          organism,
        });
        regionsDrugClassesData[rule.key].push({ ...drugClassResponseR, ...regionDrugClass });
      });
    }
  });

  return {
    genotypesDrugsData,
    pathotypesDrugsData,
    serotypesDrugsData,
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

  // Initialize ngmastDrugClassesData based on drugClassesRulesNG
  const ngmastDrugClassesData = {};
  Object.keys(drugClassesRulesNG).forEach((key) => {
    ngmastDrugClassesData[key] = [];
  });

  // Prepare to collect ngmastDrugData
  const ngmastDrugData = ngmast.map((mast) => {
    // Filter data for the current mast
    const ngmastData = data.filter((x) => x['NG-MAST TYPE'] === mast);
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
    drugRulesNG.forEach((rule) => {
      const drugDataCount = ngmastData.filter((x) => rule.values.includes(x[rule.columnID])).length;
      response[rule.key] = drugDataCount;
    });

    // Calculate susceptible count
    response.Pansusceptible = ngmastData.filter((x) => x.Pansusceptible === '1').length;

    // Update resistant count
    response.resistantCount = response.totalCount - response.Pansusceptible;

    // Create and push drugClass objects
    Object.keys(drugClassesRulesNG).forEach((key) => {
      const drugClass = { ...drugClassResponse };
      ngmastDrugClassesData[key].push(drugClass);
    });

    return response;
  });

  // Sort ngmastDrugData based on totalCount
  ngmastDrugData.sort((a, b) => b.totalCount - a.totalCount);

  // Sort and limit ngmastDrugClassesData
  Object.keys(ngmastDrugClassesData).forEach((key) => {
    ngmastDrugClassesData[key].sort((a, b) => b.resistantCount - a.resistantCount).slice(0, 10);
  });

  return { ngmastDrugClassesData, ngmastDrugData };
}

// Define KO_MDR and KO_HV arrays
// const KO_MDR = ['ST258', 'ST307', 'ST340', 'ST512', 'ST11', 'ST15'];
// const KO_HV = ['ST23', 'ST86', 'ST65', 'ST25'];

// Define getKODiversityData function
export function getKODiversityData({ data }) {
  // Initialize KODiversityData object
  const KODiversityData = {
    K_locus: [],
    O_locus: [],
  };

  // Function to calculate counts
  const calculateCounts = (diversityData) => {
    const counts = {
      // MDR: 0,
      // Hv: 0,
      Carbapenems: 0,
      ESBL: 0,
      'Aerobactin(iuc)': 0,
      rmpADC: 0,
      None: 0,
    };

    diversityData.forEach((x) => {
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
  Object.keys(KODiversityData).forEach((key) => {
    // Get unique values for the key
    const values = [...new Set(data.map((x) => x[key]))];

    // Calculate diversityData for each value
    const keyData = values.map((value) => {
      const diversityData = data.filter((x) => x[key] === value);
      const counts = calculateCounts(diversityData);

      // Return diversityData object
      return {
        name: value,
        count: diversityData.length,
        ...counts,
      };
    });

    // Filter out unknownData and add it to KODiversityData
    const unknownData = keyData.filter((x) => x.name.includes('unknown'));
    const knownData = keyData.filter((x) => !x.name.includes('unknown'));

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

    acc[combination] = data.filter((x) =>
      groupVariable === colourVariable
        ? getVariableValue(x, groupVariable) === combination
        : getVariableValue(x, groupVariable) === groupVal &&
          getVariableValue(x, colourVariable) === colourVal,
    );

    return acc;
  }, {});

  // Process each combination
  Object.keys(combinationDataMap).forEach((combination) => {
    const combinedData = combinationDataMap[combination];
    const count = combinedData.length;

    if (count > 0) {
      const splitCombination = combination.split(' - ');
      const colorLabel = splitCombination.length > 1 ? splitCombination[1] : combination;
      const avgVirulenceScore = (
        combinedData.reduce((total, obj) => Number(obj.virulence_score) + total, 0) / count
      ).toFixed(2);
      const avgResistanceScore = (
        combinedData.reduce((total, obj) => Number(obj.resistance_score) + total, 0) / count
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

// Define isSusceptible function
function isSusceptible(gene) {
  return /[*^?]/.test(gene);
}

// Define getKPDrugClassData function
function getKPDrugClassData({ drugKey, dataToFilter }) {
  const drugClass = {};
  const columnID = drugClassesRulesKP[drugKey];
  let resistantCount = 0;

  dataToFilter.forEach((x) => {
    const columnValue = x[columnID];

    if (columnValue === '-') return;

    const genes = columnValue.split(';');
    const susceptibleGenes = genes.filter(isSusceptible);

    if (susceptibleGenes.length === genes.length) return;

    resistantCount++;

    if (genes.length === 1) {
      drugClass[genes[0]] = (drugClass[genes[0]] || 0) + 1;
    } else {
      const resistantGenes = genes.filter((g) => !isSusceptible(g)).sort();
      const name = resistantGenes.join(' + ');
      drugClass[name] = (drugClass[name] || 0) + 1;
    }
  });

  drugClass['None'] = dataToFilter.length - resistantCount;
  drugClass.resistantCount = resistantCount;

  return drugClass;
}

// Define getNGDrugClassData function
function getNGDrugClassData({ columnID, dataToFilter }) {
  const drugClass = {};
  const genes = drugClassesRulesNG[columnID];
  let resistantCount = 0;

  dataToFilter.forEach((x) => {
    const columnValue = x[columnID];

    if (columnValue === '0') return;

    resistantCount++;

    genes.forEach((gene) => {
      let rulePassed = true;

      for (let i = 0; i < gene.rules.length; i++) {
        const { columnID, value } = gene.rules[i];
        if (x[columnID] !== value) {
          rulePassed = false;
          break;
        }
      }

      if (rulePassed) {
        const name = gene.name;
        drugClass[name] = (drugClass[name] || 0) + 1;
      }
    });
  });

  drugClass['None'] = dataToFilter.length - resistantCount;
  drugClass.resistantCount = resistantCount;

  return drugClass;
}

//Get Year based on Local and Travel filter
export function getYears({ data, dataset }) {
  // Filter the data based on the dataset parameter
  const filteredData = data.filter((item) => {
    if (dataset === 'All') {
      return true;
    } else {
      return item.TRAVEL.toLowerCase() === dataset.toLowerCase();
    }
  });

  // Extract the unique and sorted dates from the filtered data
  const dates = Array.from(new Set(filteredData.map((item) => item.DATE))).sort();

  return dates;
}
