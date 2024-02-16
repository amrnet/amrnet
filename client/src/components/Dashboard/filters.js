import { drugRulesForDrugResistanceGraphST, drugRulesKP } from '../../util/drugClassesRules';
import { drugClassesRulesST, drugClassesRulesKP, drugRulesST } from '../../util/drugClassesRules';

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

  if (organism === 'typhi') {
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
    listPMID
  };
}

// Adjust the country names to its correct name
export function getCountryDisplayName(country) {
  switch (country) {
    case 'Democratic Republic of the Congo':
      return 'Dem. Rep. Congo';
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
    case 'USA':
      return 'United States of America';
    case 'Cape Verde':
      return 'Cabo Verde';
    case 'Turks and Caicos Islands':
      return 'Turks and Caicos Is.';
    case 'United Kingdom (England/Wales/N. Ireland)':
    case 'United Kingdom (Scotland)':
    case 'UK':
      return 'United Kingdom';
    case 'The Gambia':
      return 'Gambia';
    default:
      return country;
  }
}

// Get specific drug count, percentage and al its types for the map component
function getMapStatsData({ countryData, columnKey, statsKey }) {
  const data = {
    items: [],
    percentage: 0,
    count: 0
  };

  const columnData = [...new Set(countryData.map((x) => x[columnKey]))];
  data.items = columnData.map((name) => {
    const count = countryData.filter((x) => x[columnKey] === name).length;
    const percentage = Number(((count / countryData.length) * 100).toFixed(2));

    if (name === statsKey) {
      data.count = count;
      data.percentage = percentage;
    }
    return { name, count, percentage };
  });

  if (statsKey === '-') {
    data.count = countryData.length - data.count;
    data.percentage = Number(((data.count / countryData.length) * 100).toFixed(2));
  }

  return data;
}

// Get country data for map component, the data includes the name, count and drug stats
export function getMapData({ data, countries, organism }) {
  const mapData = countries.map((country) => {
    const stats = {
      GENOTYPE: {
        items: [],
        count: 0
      }
    };

    const countryData = data.filter((x) => getCountryDisplayName(x.COUNTRY_ONLY) === country);

    if (countryData.length === 0) {
      return {};
    }

    const genotypes = [...new Set(countryData.map((x) => x.GENOTYPE))];
    stats.GENOTYPE.count = genotypes.length;
    stats.GENOTYPE.items = genotypes.map((genotype) => {
      return {
        name: genotype,
        count: countryData.filter((x) => x.GENOTYPE === genotype).length
      };
    });
    stats.GENOTYPE.items.sort((a, b) => (a.count <= b.count ? 1 : -1));

    if (organism === 'typhi') {
      stats.H58 = getMapStatsData({ countryData, columnKey: 'GENOTYPE_SIMPLE', statsKey: 'H58' });
      stats.MDR = getMapStatsData({ countryData, columnKey: 'MDR', statsKey: 'MDR' });
      stats.XDR = getMapStatsData({ countryData, columnKey: 'XDR', statsKey: 'XDR' });
      stats.AzithR = getMapStatsData({ countryData, columnKey: 'azith_pred_pheno', statsKey: 'AzithR' });
      stats.Susceptible = getMapStatsData({ countryData, columnKey: 'amr_category', statsKey: 'No AMR detected' });
      stats.CipR = getMapStatsData({ countryData, columnKey: 'cip_pred_pheno', statsKey: 'CipR' });
      stats.CipNS = getMapStatsData({ countryData, columnKey: 'cip_pred_pheno', statsKey: 'CipNS' });
    } else {
      stats.Susceptible = getMapStatsData({ countryData, columnKey: 'num_resistance_classes', statsKey: '0' });
      stats.ESBL = getMapStatsData({ countryData, columnKey: 'Bla_ESBL_acquired', statsKey: '-' });
      stats.Carb = getMapStatsData({ countryData, columnKey: 'Bla_Carb_acquired', statsKey: '-' });
    }

    return {
      name: country,
      count: countryData.length,
      stats
    };
  });

  return mapData;
}

// Get data for distribution and drug resistance graphs and, if the organism is klebsiella, the list of unique genotypes
// for the pallete and legend of the distribution graph
export function getYearsData({ data, years, organism, getUniqueGenotypes = false }) {
  const drugsData = [];
  const genotypesAndDrugsData = {};
  let uniqueGenotypes = [];
  const genotypesAndDrugsDataUniqueGenotypes = {};

  if (organism === 'klebe') {
    Object.keys(drugClassesRulesKP).forEach((key) => {
      genotypesAndDrugsData[key] = [];
      genotypesAndDrugsDataUniqueGenotypes[key] = [];
    });
  }

  const genotypesData = years.map((year) => {
    const yearData = data.filter((x) => x.DATE === year);
    const response = {
      name: year.toString(),
      count: yearData.length
    };
    let stats = {};

    if (yearData.length > 0) {
      const genotypes = [...new Set(yearData.map((x) => x.GENOTYPE))];

      stats = genotypes.reduce((accumulator, currentValue) => {
        const count = yearData.filter((x) => x.GENOTYPE === currentValue).length;
        accumulator[currentValue] = count;

        return accumulator;
      }, {});

      if (yearData.length >= 10) {
        const drugStats = {};

        if (organism === 'typhi') {
          drugRulesST.forEach((rule) => {
            const drugData = yearData.filter((x) => rule.values.includes(x[rule.columnID]));
            drugStats[rule.key] = drugData.length;

            if (rule.key === 'Ciprofloxacin NS') {
            //drugStats['Ciprofloxacin R'] = yearData.filter((x) => x[rule.columnID] === 'CipR').length;
              drugStats['Ciprofloxacin NS'] = drugStats['Ciprofloxacin NS'] + drugStats['Ciprofloxacin R'];

            }
          });

          drugRulesForDrugResistanceGraphST.forEach((rule) => {
            const drugData = yearData.filter((x) => rule.values.includes(x[rule.columnID]));
            drugStats[rule.key] = drugData.length;
          });
        } else {
          // For drugsData
          drugRulesKP.forEach((rule) => {
            const drugData = yearData.filter((x) => rule.columnIDs.some((columnID) => x[columnID] !== '-'));
            drugStats[rule.key] = drugData.length;
          });

          const susceptible = yearData.filter((x) => x.num_resistance_classes === '0');
          drugStats['Susceptible'] = susceptible.length;

          // For genotypesAndDrugsData
          Object.keys(drugClassesRulesKP).forEach((key) => {
            const filteredGenotypes = Object.fromEntries(
              Object.entries(stats)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
            );

            genotypesAndDrugsDataUniqueGenotypes[key].push.apply(
              genotypesAndDrugsDataUniqueGenotypes[key],
              Object.keys(filteredGenotypes)
            );

            const drugClass = getKPDrugClassData({ drugKey: key, dataToFilter: yearData });

            const item = { ...response, ...filteredGenotypes, ...drugClass, totalCount: response.count };
            delete item.count;

            genotypesAndDrugsData[key].push(item);
          });
        }

        drugsData.push({ ...response, ...drugStats });
      }
    }

    if (organism === 'klebe' && getUniqueGenotypes) {
      const sortedStats = Object.fromEntries(
        Object.entries(stats)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 20)
      );
      uniqueGenotypes = uniqueGenotypes.concat(Object.keys(sortedStats));

        return {
          ...response,
          ...sortedStats
        };
      }

    return {
      ...response,
      ...stats
    };
  });

  if (getUniqueGenotypes) {
    uniqueGenotypes = [...new Set(uniqueGenotypes.map((x) => x))];
    uniqueGenotypes.sort((a, b) => a - b);
  }

  Object.keys(genotypesAndDrugsDataUniqueGenotypes).forEach((key) => {
    const unique = [...new Set(genotypesAndDrugsDataUniqueGenotypes[key])];

    genotypesAndDrugsData[key].forEach((item) => {
      const keys = Object.keys(item);
      const filtered = unique.filter((x) => !keys.includes(x));
      filtered.forEach((x) => {
        item[x] = 0;
      });
    });
  });

  return { genotypesData: genotypesData.filter((x) => x.count > 0), drugsData, uniqueGenotypes, genotypesAndDrugsData };
}

// Get data for frequencies and determinants graphs
export function getGenotypesData({ data, genotypes, organism }) {
  const genotypesDrugClassesData = {};

  if (organism === 'typhi') {
    drugRulesST.forEach((drug) => {
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
      resistantCount: 0
    };

    const drugClassResponse = {
      name: genotype,
      totalCount: genotypeData.length,
      resistantCount: 0
    };

    if (organism === 'typhi') {
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
    } else {
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
    }

    response.resistantCount = response.totalCount - response['Susceptible'];
    return response;
  });

  genotypesDrugsData.sort((a, b) => b.resistantCount - a.resistantCount);
  Object.keys(genotypesDrugClassesData).forEach((key) => {
    genotypesDrugClassesData[key].sort((a, b) => b.resistantCount - a.resistantCount);
    genotypesDrugClassesData[key] = genotypesDrugClassesData[key].slice(0, 10);
  });

  return { genotypesDrugsData, genotypesDrugClassesData };
}

const KO_MDR = ['ST258', 'ST307', 'ST340', 'ST512', 'ST11', 'ST15'];
const KO_HV = ['ST23', 'ST86', 'ST65', 'ST25'];

export function getKODiversityData({ data }) {
  const KODiversityData = {
    K_locus: [],
    O_locus: []
  };

  Object.keys(KODiversityData).forEach((key) => {
    const values = [...new Set(data.map((x) => x[key]))];

    const keyData = values.map((value) => {
      const diversityData = data.filter((x) => x[key] === value);
      const MDR = diversityData.filter((x) => KO_MDR.includes(x.GENOTYPE));
      const Hv = diversityData.filter((x) => KO_HV.includes(x.GENOTYPE));
      const Carbapenems = diversityData.filter((x) => x.Bla_Carb_acquired !== '-');
      const ESBL = diversityData.filter((x) => x.Bla_ESBL_acquired !== '-');
      const aerobactin = diversityData.filter((x) => x.Aerobactin !== '-');
      const rmpADC = diversityData.filter((x) => !['-', '-,-,-'].includes(x.RmpADC));
      const neither = diversityData.filter(
        (x) =>
          !KO_MDR.includes(x.GENOTYPE) &&
          !KO_HV.includes(x.GENOTYPE) &&
          x.Bla_Carb_acquired === '-' &&
          x.Bla_ESBL_acquired === '-' &&
          x.Aerobactin === '-' &&
          ['-', '-,-,-'].includes(x.RmpADC)
      );

      return {
        name: value,
        count: diversityData.length,
        MDR: MDR.length,
        Hv: Hv.length,
        Carbapenems: Carbapenems.length,
        ESBL: ESBL.length,
        'Aerobactin(iuc)': aerobactin.length,
        rmpADC: rmpADC.length,
        neither: neither.length
      };
    });

    KODiversityData[key] = keyData.filter((x) => !x.name.includes('unknown'));
    const unknownData = keyData.filter((x) => x.name.includes('unknown'));

    KODiversityData[key].push({
      name: 'unknown',
      count: unknownData.reduce((total, obj) => obj.count + total, 0),
      MDR: unknownData.reduce((total, obj) => obj.MDR + total, 0),
      Hv: unknownData.reduce((total, obj) => obj.Hv + total, 0),
      Carbapenems: unknownData.reduce((total, obj) => obj.Carbapenems + total, 0),
      ESBL: unknownData.reduce((total, obj) => obj.ESBL + total, 0),
      'Aerobactin(iuc)': unknownData.reduce((total, obj) => obj['Aerobactin(iuc)'] + total, 0),
      rmpADC: unknownData.reduce((total, obj) => obj.rmpADC + total, 0),
      neither: unknownData.reduce((total, obj) => obj.neither + total, 0)
    });

    KODiversityData[key].sort((a, b) => b.count - a.count);
    KODiversityData[key] = KODiversityData[key].slice(0, 20);
  });

  return KODiversityData;
}

function getVariableValue(dataItem, variable) {
  if (variable === 'COUNTRY_ONLY') {
    return getCountryDisplayName(dataItem[variable]);
  }

  return dataItem[variable];
}

export function getConvergenceData({ data, groupVariable, colourVariable }) {
  const convergenceData = [];
  let variablesCombinations = [];
  let colourVariables = [];

  if (groupVariable === colourVariable) {
    variablesCombinations = [...new Set(data.map((x) => getVariableValue(x, colourVariable)))];
    colourVariables = variablesCombinations;
  } else {
    variablesCombinations = [
      ...new Set(data.map((x) => `${getVariableValue(x, groupVariable)} - ${getVariableValue(x, colourVariable)}`))
    ];
    colourVariables = [...new Set(data.map((x) => getVariableValue(x, colourVariable)))];
  }

  variablesCombinations.forEach((combination) => {
    let combinedData = [];

    if (groupVariable === colourVariable) {
      combinedData = data.filter((x) => getVariableValue(x, groupVariable) === combination);
    } else {
      const variables = combination.split(' - ');
      combinedData = data.filter(
        (x) =>
          getVariableValue(x, groupVariable) === variables[0] && getVariableValue(x, colourVariable) === variables[1]
      );
    }

    const count = combinedData.length;

    const splitCombination = combination.split(' - ');
    const colorLabel = splitCombination.length > 1 ? splitCombination[1] : combination;
    convergenceData.push({
      name: combination,
      colorLabel,
      z: count,
      x: (combinedData.reduce((total, obj) => Number(obj.virulence_score) + total, 0) / count).toFixed(2),
      y: (combinedData.reduce((total, obj) => Number(obj.resistance_score) + total, 0) / count).toFixed(2)
    });
  });

  if (colourVariable === 'YEAR') {
    colourVariables.sort((a, b) => b - a);
  } else {
    colourVariables.sort((a, b) => a.localeCompare(b));
  }

  return { data: convergenceData, colourVariables };
}

// Check if a gene has a susceptible character for klebesiella drug rules for determinants graph
function isSusceptible(gene) {
  return gene.includes('*') || gene.includes('^') || gene.includes('?');
}

// Filter all genes for a specific drug class from Klebsiella and return the final object
function getKPDrugClassData({ drugKey, dataToFilter }) {
  const drugClass = {};
  const columnID = drugClassesRulesKP[drugKey];

  const resistantData = dataToFilter.filter((x) => {
    if (x[columnID] === '-') {
      return false;
    }

    const genes = x[columnID].split(';');

    if (genes.every((g) => isSusceptible(g))) {
      return false;
    }

    if (genes.length === 1) {
      if (genes[0] in drugClass) {
        drugClass[genes[0]] += 1;
      } else {
        drugClass[genes[0]] = 1;
      }
    } else {
      const resistantGenes = genes.filter((g) => !isSusceptible(g));
      resistantGenes.sort((a, b) => a.localeCompare(b));

      const name = resistantGenes.join(';').replaceAll(';', ' + ');

      if (name in drugClass) {
        drugClass[name] += 1;
      } else {
        drugClass[name] = 1;
      }
    }

    return true;
  });

  drugClass['None'] = dataToFilter.length - resistantData.length;
  drugClass.resistantCount = resistantData.length;

  return drugClass;
}
