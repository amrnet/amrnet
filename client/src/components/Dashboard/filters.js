import {
  drugRulesForDrugResistanceGraphST,
  drugRulesForDrugResistanceGraphNG,
  drugRulesST,
  drugRulesKP,
  drugRulesNG,
} from '../../util/drugClassesRules';
import { drugClassesRulesST, drugClassesRulesKP, drugClassesRulesNG } from '../../util/drugClassesRules';

// This filter is called after either dataset, initialYear, finalYear or country changes and if reset button is pressed.
// And it returns the data filtered by the variables said before, also the list of unique genotypes, count of genotypes
// and count of genomes.
export function filterData({ data, dataset, actualTimeInitial, actualTimeFinal, organism, actualCountry }) {
  const checkDataset = (item) => dataset === 'All' || item.TRAVEL === dataset.toLowerCase();
  const checkTime = (item) => {
    return item.DATE >= actualTimeInitial && item.DATE <= actualTimeFinal;
  };

  const newData = data.filter((x) => checkDataset(x) && checkTime(x));
  const genotypes = [...new Set(newData.map((x) => x.GENOTYPE))];

  if (organism === 'styphi') {
    genotypes.sort((a, b) => a.localeCompare(b));
  } else {
    genotypes.sort((a, b) => a - b);
  }

  let genomesCount = newData.length;
  let genotypesCount = genotypes.length;
  let listPMID = [];

  if (actualCountry !== 'All') {
    const countryData = newData.filter((x) => getCountryDisplayName(x.COUNTRY_ONLY) === actualCountry);
    genomesCount = countryData.length;
    listPMID = [...new Set(countryData.map((x) => x.PMID))];

    const countryGenotypes = [...new Set(countryData.map((x) => x.GENOTYPE))];
    genotypesCount = countryGenotypes.length;
  }

  return {
    data: newData,
    genotypes,
    genomesCount,
    genotypesCount,
    listPMID,
  };
}

//TODO: change for the mongo
// Adjust the country names to its correct name
export function getCountryDisplayName(country) {
  switch (country) {
    case 'Democratic Republic of the Congo':
      return 'Dem. Rep. Congo';
    case 'Channel Islands':
      return 'Jersey';
    case 'Czech Republic':
      return 'Czechia';
    case 'Central African Republic':
      return 'Central African Rep.';
    case 'Ivory Coast':
    case "Cote d'Ivoire":
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
    default:
      return country;
  }
}

// Get specific drug count, percentage and al its types for the map component
function getMapStatsData({ countryData, columnKey, statsKey }) {
  const totalLength = countryData.length;
  const columnDataMap = countryData.reduce((acc, item) => {
    const key = item[columnKey];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const items = Object.entries(columnDataMap).map(([name, count]) => {
    const percentage = (count / totalLength) * 100;
    return { name, count, percentage: Number(percentage.toFixed(2)) };
  });

  const stats = items.find((item) => item.name === statsKey) || { count: 0, percentage: 0 };
  if (statsKey === '-') {
    const nonStatsCount = totalLength - stats.count;
    return {
      items,
      count: nonStatsCount,
      percentage: Number(((nonStatsCount / totalLength) * 100).toFixed(2)),
    };
  }

  return {
    items,
    count: stats.count,
    percentage: stats.percentage,
  };
}

// Get country data for map component, the data includes the name, count and drug stats
export function getMapData({ data, countries, organism }) {
  return countries.map((country) => {
    const countryData = data.filter((x) => getCountryDisplayName(x.COUNTRY_ONLY) === country);

    const stats = {
      GENOTYPE: { items: [], count: 0 },
      NGMAST: { items: [], count: 0 },
    };

    if (countryData.length === 0) {
      return {};
    }

    const genotypeMap = countryData.reduce((acc, item) => {
      const genotype = item.GENOTYPE;
      acc[genotype] = (acc[genotype] || 0) + 1;
      return acc;
    }, {});

    stats.GENOTYPE.count = Object.keys(genotypeMap).length;
    stats.GENOTYPE.items = Object.entries(genotypeMap)
      .map(([genotype, count]) => ({ name: genotype, count }))
      .sort((a, b) => b.count - a.count);

    if (organism === 'styphi') {
      const statKeys = [
        { name: 'H58', column: 'GENOTYPE_SIMPLE', key: 'H58' },
        { name: 'Ceftriaxone', column: 'ESBL_category', key: 'ESBL' },
        { name: 'MDR', column: 'MDR', key: 'MDR' },
        { name: 'XDR', column: 'XDR', key: 'XDR' },
        { name: 'AzithR', column: 'azith_pred_pheno', key: 'AzithR' },
        { name: 'Susceptible', column: 'amr_category', key: 'No AMR detected' },
        { name: 'CipR', column: 'cip_pred_pheno', key: 'CipR' },
        { name: 'CipNS', column: 'cip_pred_pheno', key: 'CipNS' },
      ];
      statKeys.forEach(({ name, column, key }) => {
        stats[name] = getMapStatsData({ countryData, columnKey: column, statsKey: key });
      });
    } else if (organism === 'ngono') {
      const statKeys = [
        { name: 'Susceptible', column: 'Susceptible', key: '1' },
        { name: 'Ciprofloxacin', column: 'Ciprofloxacin', key: '1' },
        { name: 'Ceftriaxone', column: 'Ceftriaxone', key: '1' },
        { name: 'Azithromycin', column: 'Azithromycin', key: '1' },
        { name: 'MDR', column: 'MDR', key: '1' },
        { name: 'XDR', column: 'XDR', key: '1' },
      ];
      statKeys.forEach(({ name, column, key }) => {
        stats[name] = getMapStatsData({ countryData, columnKey: column, statsKey: key });
      });

      const ngmastMap = countryData.reduce((acc, item) => {
        const mast = item['NG-MAST TYPE'];
        acc[mast] = (acc[mast] || 0) + 1;
        return acc;
      }, {});

      stats.NGMAST.count = Object.keys(ngmastMap).length;
      stats.NGMAST.items = Object.entries(ngmastMap)
        .map(([mast, count]) => ({ name: mast, count }))
        .sort((a, b) => b.count - a.count);
    } else if (organism === 'ecoli') {
    } else if (organism === 'decoli') {
    } else if (organism === 'shige') {
    } else {
      const statKeys = [
        { name: 'Susceptible', column: 'num_resistance_classes', key: '0' },
        { name: 'ESBL', column: 'Bla_ESBL_acquired', key: '-' },
        { name: 'Carb', column: 'Bla_Carb_acquired', key: '-' },
      ];
      statKeys.forEach(({ name, column, key }) => {
        stats[name] = getMapStatsData({ countryData, columnKey: column, statsKey: key });
      });
    }

    return {
      name: country,
      count: countryData.length,
      stats,
    };
  });
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
      const genotype = x.GENOTYPE;
      acc[genotype] = (acc[genotype] || 0) + 1;
      return acc;
    }, {});

    // Initialize drugStats
    const drugStats = {};

    if (count >= 10) {
      const calculateDrugStats = (rules) => {
        rules.forEach((rule) => {
          const drugData = yearData.filter((x) => rule.values.includes(x[rule.columnID]));
          drugStats[rule.key] = drugData.length;

          if (rule.key === 'Ciprofloxacin NS') {
            const cipRCount = yearData.filter((x) => x[rule.columnID] === 'CipR').length;
            drugStats['Ciprofloxacin R'] = cipRCount;
            drugStats['Ciprofloxacin NS'] += cipRCount;
          }
        });
      };

      if (organism === 'styphi') {
        calculateDrugStats(drugRulesST);
        calculateDrugStats(drugRulesForDrugResistanceGraphST);
      } else if (organism === 'kpneumo') {
        drugRulesKP.forEach((rule) => {
          const drugData = yearData.filter((x) => rule.columnIDs.some((id) => x[id] !== '-'));
          drugStats[rule.key] = drugData.length;
        });

        drugStats['Susceptible'] = yearData.filter((x) => x.num_resistance_classes === '0').length;

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
        calculateDrugStats(drugRulesForDrugResistanceGraphNG);
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

  return { genotypesData: genotypesData.filter((x) => x.count > 0), drugsData, uniqueGenotypes, genotypesAndDrugsData };
}

// Get data for frequencies and determinants graphs
export function getGenotypesData({ data, genotypes, organism }) {
  const genotypesDrugClassesData = {};

  if (organism === 'styphi') {
    drugRulesST.forEach((drug) => {
      if (drug.key !== 'Susceptible') {
        genotypesDrugClassesData[drug.key] = [];
      }
    });
  } else if (organism === 'ngono') {
    drugRulesNG.forEach((drug) => {
      if (drug.key !== 'Susceptible') {
        genotypesDrugClassesData[drug.key] = [];
      }
    });
  } else {
    Object.keys(drugClassesRulesKP).forEach((key) => {
      genotypesDrugClassesData[key] = [];
    });
  }

  const genotypesDrugsData = genotypes.map((genotype) => {
    const genotypeData = data.filter((x) => x.GENOTYPE === genotype);
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
          response['Ciprofloxacin R'] = genotypeData.filter((x) => x[rule.columnID] === 'CipR').length;
          response['Ciprofloxacin NS'] = response['Ciprofloxacin NS'] + response['Ciprofloxacin R'];
        }

        if (rule.key !== 'Susceptible') {
          const drugClass = { ...drugClassResponse };

          drugClassesRulesST[rule.key].forEach((classRule) => {
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
    } else if (organism === 'kpneumo') {
      drugRulesKP.forEach((rule) => {
        const drugData = genotypeData.filter((x) => rule.columnIDs.some((columnID) => x[columnID] !== '-'));
        response[rule.key] = drugData.length;
      });

      const susceptible = genotypeData.filter((x) => x.num_resistance_classes === '0');
      response['Susceptible'] = susceptible.length;

      Object.keys(drugClassesRulesKP).forEach((key) => {
        const drugClass = { ...drugClassResponse, ...getKPDrugClassData({ drugKey: key, dataToFilter: genotypeData }) };
        genotypesDrugClassesData[key].push(drugClass);
      });
    } else if (organism === 'ngono') {
      drugRulesNG.forEach((rule) => {
        const drugData = genotypeData.filter((x) => rule.values.includes(x[rule.columnID]));
        response[rule.key] = drugData.length;

        const drugClassesToInclude = ['Azithromycin'];

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
    }

    response.resistantCount = response.totalCount - response['Susceptible'];
    return response;
  });

  genotypesDrugsData.sort((a, b) => b.totalCount - a.totalCount);
  Object.keys(genotypesDrugClassesData).forEach((key) => {
    genotypesDrugClassesData[key].sort((a, b) => b.resistantCount - a.resistantCount);
    genotypesDrugClassesData[key] = genotypesDrugClassesData[key].slice(0, 10);
  });
  return { genotypesDrugsData, genotypesDrugClassesData };
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
      Susceptible: 0,
    };

    const drugClassResponse = { ...response };

    // Iterate over drug rules to calculate counts
    drugRulesNG.forEach((rule) => {
      const drugDataCount = ngmastData.filter((x) => rule.values.includes(x[rule.columnID])).length;
      response[rule.key] = drugDataCount;
    });

    // Calculate susceptible count
    response.Susceptible = ngmastData.filter((x) => x.Susceptible === '1').length;

    // Update resistant count
    response.resistantCount = response.totalCount - response.Susceptible;

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
const KO_MDR = ['ST258', 'ST307', 'ST340', 'ST512', 'ST11', 'ST15'];
const KO_HV = ['ST23', 'ST86', 'ST65', 'ST25'];

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
      MDR: 0,
      Hv: 0,
      Carbapenems: 0,
      ESBL: 0,
      'Aerobactin(iuc)': 0,
      rmpADC: 0,
      neither: 0,
    };

    diversityData.forEach((x) => {
      if (KO_MDR.includes(x.GENOTYPE.toString())) counts.MDR++;
      if (KO_HV.includes(x.GENOTYPE.toString())) counts.Hv++;
      if (x.Bla_Carb_acquired !== '-') counts.Carbapenems++;
      if (x.Bla_ESBL_acquired !== '-') counts.ESBL++;
      if (x.Aerobactin !== '-') counts['Aerobactin(iuc)']++;
      if (!['-', '-,-,-'].includes(x.RmpADC)) counts.rmpADC++;
      if (
        !KO_MDR.includes(x.GENOTYPE.toString()) &&
        !KO_HV.includes(x.GENOTYPE.toString()) &&
        x.Bla_Carb_acquired === '-' &&
        x.Bla_ESBL_acquired === '-' &&
        x.Aerobactin === '-' &&
        ['-', '-,-,-'].includes(x.RmpADC)
      ) {
        counts.neither++;
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
  const getUniqueValues = (key) => [...new Set(data.map((x) => getVariableValue(x, key)))];

  // Check if groupVariable and colourVariable are the same
  if (groupVariable === colourVariable) {
    variablesCombinations = getUniqueValues(colourVariable);
    colourVariables = variablesCombinations;
  } else {
    // Get unique values for variablesCombinations and colourVariables
    variablesCombinations = getUniqueValues(groupVariable).flatMap((groupVal) =>
      getUniqueValues(colourVariable).map((colourVal) => `${groupVal} - ${colourVal}`),
    );
    colourVariables = getUniqueValues(colourVariable);
  }

  // Map combinations to data
  const combinationDataMap = variablesCombinations.reduce((acc, combination) => {
    const [groupVal, colourVal] = combination.split(' - ');

    acc[combination] = data.filter((x) =>
      groupVariable === colourVariable
        ? getVariableValue(x, groupVariable) === combination
        : getVariableValue(x, groupVariable) === groupVal && getVariableValue(x, colourVariable) === colourVal,
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
