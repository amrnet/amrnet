import { Download } from '@mui/icons-material';
import { useAppSelector } from '../../../../stores/hooks';
import { variableGraphOptions, variablesOptions } from '../../../../util/convergenceVariablesOptions';
import { drugAcronymsOpposite, ngonoSusceptibleRule } from '../../../../util/drugs';

export const DownloadMapViewData = ({ value }) => {
  const mapData = useAppSelector(state => state.map.mapData);
  const prevalenceMapViewOptionsSelected = useAppSelector(state => state.graph.prevalenceMapViewOptionsSelected);
  const customDropdownMapViewNG = useAppSelector(state => state.graph.customDropdownMapViewNG);
  const organism = useAppSelector(state => state.dashboard.organism);
  const drugsYearData = useAppSelector(state => state.graph.drugsYearData);
  const genotypesDrugsData = useAppSelector(state => state.graph.genotypesDrugsData);
  const genotypesDrugClassesData = useAppSelector(state => state.graph.genotypesDrugClassesData);
  const determinantsGraphDrugClass = useAppSelector(state => state.graph.determinantsGraphDrugClass);
  const genotypesYearData = useAppSelector(state => state.graph.genotypesYearData);
  const topXGenotype = useAppSelector(state => state.graph.topXGenotype);
  const topXGenotypeRDWG = useAppSelector(state => state.graph.topXGenotypeRDWG);
  const genotypesAndDrugsYearData = useAppSelector(state => state.graph.genotypesAndDrugsYearData);
  const trendsGraphDrugClass = useAppSelector(state => state.graph.trendsGraphDrugClass);
  const mapRegionData = useAppSelector(state => state.map.mapRegionData);
  const actualRegion = useAppSelector(state => state.dashboard.actualRegion);
  const actualCountry = useAppSelector(state => state.dashboard.actualCountry);
  const topGenesSlice = useAppSelector(state => state.graph.topGenesSlice);
  const topGenotypeSlice = useAppSelector(state => state.graph.topGenotypeSlice);
  const mapView = useAppSelector(state => state.map.mapView);
  const convergenceData = useAppSelector(state => state.graph.convergenceData);
  const convergenceGroupVariable = useAppSelector(state => state.graph.convergenceGroupVariable);
  const drugsCountriesData = useAppSelector(state => state.graph.drugsCountriesData);
  const yAxisType = useAppSelector(state => state.map.yAxisType);
  const yAxisTypeTrend = useAppSelector(state => state.map.yAxisTypeTrend);
  const KOYearsData = useAppSelector(state => state.graph.KOYearsData);
  const KOTrendsGraphPlotOption = useAppSelector(state => state.graph.KOTrendsGraphPlotOption);
  const topXKO = useAppSelector(state => state.graph.topXKO);
  const bubbleHeatmapGraphVariable = useAppSelector(state => state.graph.bubbleHeatmapGraphVariable);
  const bubbleKOHeatmapGraphVariable = useAppSelector(state => state.graph.bubbleKOHeatmapGraphVariable);
  const bubbleKOYAxisType = useAppSelector(state => state.graph.bubbleKOYAxisType);
  const bubbleMarkersHeatmapGraphVariable = useAppSelector(state => state.graph.bubbleMarkersHeatmapGraphVariable);
  const bubbleMarkersYAxisType = useAppSelector(state => state.graph.bubbleMarkersYAxisType);

  let firstName, secondName;
  if (organism === 'styphi') {
    firstName = 'Salmonella';
    secondName = 'Typhi';
  } else if (organism === 'kpneumo') {
    firstName = 'Klebsiella';
    secondName = 'pneumoniae';
  } else if (organism === 'ngono') {
    firstName = 'Neisseria';
    secondName = 'gonorrhoeae';
  } else if (organism === 'shige') {
    firstName = 'Shigella';
    secondName = '+ EIEC';
  } else if (organism === 'decoli') {
    firstName = 'Escherichia coli';
    secondName = '(diarrheagenic)';
  } else if (organism === 'ecoli') {
    firstName = 'Escherichia';
    secondName = 'coli';
  } else if (organism === 'sentericaints') {
    firstName = 'Salmonella';
    secondName = '(invasive non-typhoidal)';
  } else {
    firstName = 'Salmonella enterica';
    secondName = '(non-typhoidal)';
  }

  const downloadCSV = () => {
    if (!Array.isArray(mapData) || mapData.length === 0) {
      console.log('MapData is not an array or is empty', mapData);
      return;
    }

    let HeaderList = ['Country', 'Total number of Count'];

    const isPathotypeLikeView = ['Serotype prevalence', 'Pathotype prevalence'].includes(mapView);
    const isOPrevLikeView = mapView === 'O prevalence';
    const isOHPrevLikeView = mapView === 'OH prevalence';
    // const isGenotypeLikeView = [
    //   'Genotype prevalence',
    //   'ST prevalence',
    //   'NG-MAST prevalence',
    //   'Lineage prevalence',
    // ].includes(mapView);

    const mapViewOptionSelected =
      mapView === 'NG-MAST prevalence' ? customDropdownMapViewNG : prevalenceMapViewOptionsSelected;

    // Step 1: Build header
    if(mapView !== 'No. Samples' && mapView !== 'Resistance prevalence')
      mapViewOptionSelected.forEach(name => HeaderList.push(name, `${name} %`));

    const nonResColums = ['GENOTYPE', 'NGMAST', 'PATHOTYPE', 'O_PREV', 'OH_PREV'];
    
    Object.keys(mapData[0]?.stats || {}).forEach(key => {
      if ((mapView === 'Resistance prevalence' && nonResColums.includes(key)) || key === 'H58') return;
      const itemLabel = ngonoSusceptibleRule(key, organism) || drugAcronymsOpposite[key] || key;
      HeaderList.push(itemLabel, `${itemLabel} %`);
    });

    // Step 3: Helper function to get count/percentage safely
    const getStatValues = (itemsArray, sum, headerItem) => {
      const statItem = itemsArray.find(x => x.name === headerItem);
      const count = statItem?.count || 0;
      const percentage = sum ? ((count / sum) * 100).toFixed(2) : '0.00';
      return [count, percentage];
    };

    // Step 4: Generate rows
    const rows = mapData
      .filter(item => Object.keys(item).length > 0 && item.count >= 20)
      .map(item => {
        const rowData = [item.name, item.count || ''];
        const stats = item.stats || {};

        const data =
          mapView === 'NG-MAST prevalence'
            ? stats.NGMAST
            : isPathotypeLikeView
            ? stats.PATHOTYPE
            : isOPrevLikeView
            ? stats.O_PREV
            : isOHPrevLikeView
            ? stats.OH_PREV
            : stats.GENOTYPE;
        const items = data?.items || [];
        const sum = data?.sum || 0;
        const foundGenotypes = items.map(x => x.name);

        const allHeaders = mapViewOptionSelected;
        if(mapView !== 'No. Samples' && mapView !== 'Resistance prevalence')
          allHeaders.forEach(headerItem => {
            if (!foundGenotypes.includes(headerItem)) {
              rowData.push(0, 0);
            } else {
              rowData.push(...getStatValues(items, sum, headerItem));
            }
          });

        Object.entries(stats).forEach(([key, stat]) => {
          if ((mapView === 'Resistance prevalence' && nonResColums.includes(key)) || key === 'H58') return;

          if (!stat) return rowData.push(0, 0);

          const count = stat.count || 0;
          const percentage = nonResColums.includes(key)
            ? stat.sum
              ? ((count / stat.sum) * 100).toFixed(2)
              : '0.00'
            : stat.percentage ?? '0.00';

          rowData.push(count, percentage);
        });

        return rowData.join(',');
      });

    const headers = HeaderList.join(',');
    generateCSV(headers, rows, 'Map');
  };

  const downloadCSVForDRT = () => {
    if (Array.isArray(drugsYearData) && drugsYearData.length > 0) {
      const HeaderList = ['Region', 'Country', 'Year', 'Total Count'];

      // Dynamically build header: [drug, drug %]
      const sample = drugsYearData[0];
      const drugKeys = Object.keys(sample).filter(key => key !== 'name' && key !== 'count');

      drugKeys.forEach(drug => {
        const itemLabel = ngonoSusceptibleRule(drug, organism);
        HeaderList.push(itemLabel || drug);
        HeaderList.push(`${itemLabel || drug} %`);
      });

      const headers = HeaderList.join(',');

      // Build data rows
      const rows = drugsYearData
        .filter(item => item.count >= 1 && item.count >= 10) //Filter data which is used to plot and include count greater and equal to 10 on AMR Trends
        .map(item => {
          const row = [actualRegion, actualCountry, item.name, item.count];
          drugKeys.forEach(drug => {
            const count = item[drug] || 0;
            const percentage =
              // count < 20 ? 'insufficient' : ((count / (stat.sum)) * 100).toFixed(2);
              count < 20 ? '0' : ((count / item.count) * 100).toFixed(2);
            // item.count > 0 ? ((count / item.count) * 100).toFixed(2) : 'insufficient';
            row.push(count);
            row.push(percentage);
          });
          return row.join(',');
        });

      generateCSV(headers, rows, 'AMR_Trends');
    } else {
      console.log('drugsYearData is not an array or is empty', drugsYearData);
    }
  };

  const downloadCSVForCG = () => {
    let convergenceGroupVariableName;
    variablesOptions.forEach(item => {
      if (item.value === convergenceGroupVariable) {
        convergenceGroupVariableName = item.label;
      }
    });
    if (Object.keys(convergenceData) && convergenceData.length > 0) {
      const HeaderList = [
        'Region',
        'Country',
        convergenceGroupVariableName,
        'Total Count',
        'Mean virulence score',
        'Mean resistance score',
      ];

      // Dynamically build header: [drug, drug %]
      const sample = convergenceData[0];
      const convergenceKey = Object.keys(sample).filter(
        key => key !== 'name' && key !== 'count' && key !== 'colorLabel',
      );
      // convergenceKey.forEach((item) => {
      //   HeaderList.push(item);
      // });

      const headers = HeaderList.join(',');

      // Build data rows
      const rows = convergenceData
        .filter(item => Object.keys(item).length > 0)
        .map(item => {
          const row = [actualRegion, actualCountry, item.name];
          convergenceKey.forEach(items => {
            const count = item[items] || 0;
            row.push(count);
          });
          return row.join(',');
        });

      generateCSV(headers, rows, 'AMR/Virulence Trends');
    } else {
      console.log('drugsYearData is not an array or is empty', drugsYearData);
    }
  };

  const downloadCSVForRFWG = () => {
    if (Array.isArray(genotypesDrugsData) && genotypesDrugsData.length > 0) {
      const HeaderList = [
        'Genotype',
        'Total number of Count',
        'Ampicillin/Amoxicillin',
        'Ampicillin/Amoxicillin %',
        'Azithromycin',
        'Azithromycin %',
        'Ceftriaxone',
        'Ceftriaxone %',
        'Chloramphenicol',
        'Chloramphenicol %',
        'Ciprofloxacin NS',
        'Ciprofloxacin NS %',
        'Ciprofloxacin R',
        'Ciprofloxacin R %',
        'MDR',
        'MDR %',
        'Pansusceptible',
        'Pansusceptible %',
        'Sulfonamides',
        'Sulfonamides %',
        'Tetracyclines',
        'Tetracyclines %',
        'Trimethoprim',
        'Trimethoprim %',
        'Trimethoprim-sulfamethoxazole',
        'Trimethoprim-sulfamethoxazole %',
        'XDR',
        'XDR %',
        'Resistant Count',
      ];

      // Create CSV header row
      const headers = HeaderList.join(',');

      // Create CSV rows
      const rows = genotypesDrugsData
        .filter(item => Object.keys(item).length > 0)
        .map(item => {
          const AMPCount = item?.['Ampicillin/Amoxicillin'] || 0;
          const AMPPerCount = AMPCount < 20 ? '0' : ((AMPCount / item.totalCount) * 100).toFixed(2) || 0;

          const AzithCount = item?.Azithromycin || 0;
          const AzithPerCount = AzithCount < 20 ? '0' : ((AzithCount / item.totalCount) * 100).toFixed(2) || 0;

          const CROCount = item?.Ceftriaxone || 0;
          const CROPerCount = CROCount < 20 ? '0' : ((CROCount / item.totalCount) * 100).toFixed(2) || 0;

          const ChlCount = item?.Chloramphenicol || 0;
          const ChlPerCount = ChlCount < 20 ? '0' : ((ChlCount / item.totalCount) * 100).toFixed(2) || 0;

          const CipNSCount = item?.['Ciprofloxacin NS'] || 0;
          const CipNSPerCount = CipNSCount < 20 ? '0' : ((CipNSCount / item.totalCount) * 100).toFixed(2) || 0;

          const CipRCount = item?.['Ciprofloxacin R'] || 0;
          const CipRPerCount = CipRCount < 20 ? '0' : ((CipRCount / item.totalCount) * 100).toFixed(2) || 0;

          const MDRCount = item?.MDR || 0;
          const MDRPerCount = MDRCount < 20 ? '0' : ((MDRCount / item.totalCount) * 100).toFixed(2) || 0;

          const PanCount = item?.Pansusceptible || 0;
          const PanPerCount = PanCount < 20 ? '0' : ((PanCount / item.totalCount) * 100).toFixed(2) || 0;

          const SulCount = item?.Sulfonamides || 0;
          const SulPerCount = SulCount < 20 ? '0' : ((SulCount / item.totalCount) * 100).toFixed(2) || 0;

          const TetCount = item?.Tetracyclines || 0;
          const TetPerCount = TetCount < 20 ? '0' : ((TetCount / item.totalCount) * 100).toFixed(2) || 0;

          const TriCount = item?.Trimethoprim || 0;
          const TriPerCount = TriCount < 20 ? '0' : ((TriCount / item.totalCount) * 100).toFixed(2) || 0;

          const TriSulCount = item?.['Trimethoprim-sulfamethoxazole'] || 0;
          const TriSulPerCount = TriSulCount < 20 ? '0' : ((TriSulCount / item.totalCount) * 100).toFixed(2) || 0;

          const XDRCount = item?.XDR || 0;
          const XDRPerCount = XDRCount < 20 ? '0' : ((XDRCount / item.totalCount) * 100).toFixed(2) || 0;

          return [
            item.name,
            item.totalCount || '',
            AMPCount,
            AMPPerCount,
            AzithCount,
            AzithPerCount,
            CROCount,
            CROPerCount,
            ChlCount,
            ChlPerCount,
            CipNSCount,
            CipNSPerCount,
            CipRCount,
            CipRPerCount,
            MDRCount,
            MDRPerCount,
            PanCount,
            PanPerCount,
            SulCount,
            SulPerCount,
            TetCount,
            TetPerCount,
            TriCount,
            TriPerCount,
            TriSulCount,
            TriSulPerCount,
            XDRCount,
            XDRPerCount,
            item.resistantCount,
          ].join(',');
        });

      generateCSV(headers, rows, 'ARM frequency');
    } else {
      console.log('genotypesDrugsData is not an array or is empty', genotypesDrugsData);
    }
  };

  const downloadCSVForRDWG = () => {
    if (
      Array.isArray(genotypesDrugClassesData[determinantsGraphDrugClass]) &&
      genotypesDrugClassesData[determinantsGraphDrugClass].length > 0
    ) {
      let HeaderList = ['Region', 'Country', 'Name', 'Total number of Count'];

      // Dynamically add genotype headers
      if (Array.isArray(topXGenotypeRDWG) && topXGenotypeRDWG.length > 0) {
        topXGenotypeRDWG.forEach(genotype => {
          HeaderList.push(genotype);
          HeaderList.push(`${genotype} %`);
        });
      }

      // Create CSV header row
      const headers = HeaderList.join(',');

      // Create CSV rows dynamically
      const rows = genotypesDrugClassesData[determinantsGraphDrugClass]
        .filter(item => Object.keys(item).length > 0)
        .map(item => {
          let rowData = [actualRegion, actualCountry, item.name, item.totalCount || ''];

          if (Array.isArray(topXGenotypeRDWG) && topXGenotypeRDWG.length > 0) {
            topXGenotypeRDWG.forEach(genotype => {
              const count = item?.[genotype] || 0;
              const percentage = count < 20 ? '0' : ((count / item.totalCount) * 100).toFixed(2) || 0;

              rowData.push(count);
              rowData.push(percentage);
            });
          }

          return rowData.join(',');
        });

      generateCSV(headers, rows, `AMR markers by genotype (${determinantsGraphDrugClass})`);
    } else {
      console.log('drugsYearData is not an array or is empty', drugsYearData);
    }
  };

  const downloadCSVForGD = () => {
    if (Array.isArray(genotypesYearData) && genotypesYearData.length > 0) {
      let HeaderList = ['Region', 'Country', 'Year', 'Total number of Count'];

      // Dynamically add genotype headers
      if (Array.isArray(topXGenotype) && topXGenotype.length > 0) {
        topXGenotype.forEach(genotype => {
          HeaderList.push(genotype);
          HeaderList.push(`${genotype} %`);
        });
      }

      // Create CSV header row
      const headers = HeaderList.join(',');

      // Create CSV rows dynamically
      const rows = genotypesYearData
        .filter(item => Object.keys(item).length > 0)
        .map(item => {
          let rowData = [actualRegion, actualCountry, item.name, item.count || ''];

          if (Array.isArray(topXGenotype) && topXGenotype.length > 0) {
            topXGenotype.forEach(genotype => {
              const count = item?.[genotype] || 0;
              const percentage = count < 20 ? '0' : ((count / item.count) * 100).toFixed(2) || 0;

              rowData.push(count);
              rowData.push(percentage);
            });
          }

          return rowData.join(',');
        });

      generateCSV(headers, rows, 'Genotype trends');
    } else {
      console.log('genotypesYearData is not an array or is empty', genotypesYearData);
    }
  };

  const downloadCSVForKOT = () => {
    const data = KOYearsData[KOTrendsGraphPlotOption];

    if (Array.isArray(data) && data.length > 0) {
      let HeaderList = ['Region', 'Country', 'Year', 'Total number of Count'];

      // Dynamically add genotype headers
      if (Array.isArray(topXKO) && topXKO.length > 0) {
        topXKO.forEach(item => {
          HeaderList.push(item);
          HeaderList.push(`${item} %`);
        });
      }

      // Create CSV header row
      const headers = HeaderList.join(',');

      // Create CSV rows dynamically
      const rows = data
        .filter(item => Object.keys(item).length > 0)
        .map(item => {
          let rowData = [actualRegion, actualCountry, item.name, item.count || ''];

          if (Array.isArray(topXKO) && topXKO.length > 0) {
            topXKO.forEach(ko => {
              const count = item?.[ko] || 0;
              const percentage = count < 20 ? '0' : ((count / item.count) * 100).toFixed(2) || 0;

              rowData.push(count);
              rowData.push(percentage);
            });
          }

          return rowData.join(',');
        });

      generateCSV(headers, rows, 'KO trends');
    } else {
      console.log('KOYearsData is not an array or is empty', data);
    }
  };

  // TODO
  const downloadCSVForRDT = () => {
    if (genotypesAndDrugsYearData && Object.keys(genotypesAndDrugsYearData[trendsGraphDrugClass]).length > 0) {
      let HeaderList = ['Region', 'Country', 'Name', 'Total number of Count'];

      // Dynamically add genotype headers
      if (Array.isArray(topGenesSlice) && topGenesSlice.length > 0) {
        topGenesSlice.forEach(gen => {
          HeaderList.push(gen);
          HeaderList.push(`${gen} %`);
        });
      }
      if (Array.isArray(topGenotypeSlice) && topGenotypeSlice.length > 0) {
        topGenotypeSlice.forEach(genotype => {
          HeaderList.push(genotype);
          HeaderList.push(`${genotype} %`);
        });
      }

      // Create CSV header row
      const headers = HeaderList.join(',');

      // Create CSV rows dynamically
      const rows = genotypesAndDrugsYearData[trendsGraphDrugClass]
        .filter(item => Object.keys(item).length > 0 && item.totalCount >= 10) //Filter data which is used to plot and include count greater and equal to 10 (Bla for Kleb and Marker for N.Gono)
        .map(item => {
          let rowData = [actualRegion, actualCountry, item.name, item.totalCount || ''];

          if (Array.isArray(topGenesSlice) && topGenesSlice.length > 0) {
            topGenesSlice.forEach(gen => {
              const count = item?.[gen] || 0;
              const percentage = count < 20 ? '0' : ((count / item.totalCount) * 100).toFixed(2) || 0;

              rowData.push(count);
              rowData.push(percentage);
            });
          }
          if (Array.isArray(topGenotypeSlice) && topGenotypeSlice.length > 0) {
            topGenotypeSlice.forEach(genotype => {
              const count = item?.[genotype] || 0;
              const percentage = count < 20 ? '0' : ((count / item.totalCount) * 100).toFixed(2) || 0;

              rowData.push(count);
              rowData.push(percentage);
            });
          }

          return rowData.join(',');
        });

      generateCSV(headers, rows, 'AMR Markers');
    } else {
      console.log('genotypesAndDrugsYearData is empty or not an object', genotypesAndDrugsYearData);
    }
  };

  const downloadCSVForHM = compName => {
    let COMPARISON;
    if (compName === 'BHP') {
      COMPARISON = 'PATHOTYPE';
    } else {
      if (organism === 'kpneumo') {
        COMPARISON = variableGraphOptions.find(x => x.value === bubbleHeatmapGraphVariable).mapValue;
      } else {
        COMPARISON = 'GENOTYPE';
      }
    }
    if (Array.isArray(mapRegionData) && mapRegionData.length > 0) {
      let HeaderList = ['Region', 'Country', 'Name']; // Initial headers
      let allDrugs = new Set(); // Store unique drug names
      // Extract drug names dynamically from all items
      mapRegionData.forEach(item => {
        if (item.stats && item.stats[COMPARISON] && item.stats[COMPARISON].items) {
          Object.values(item.stats[COMPARISON].items).forEach(obj => {
            Object.keys(obj.drugs).forEach(drugName => allDrugs.add(drugName));
          });
        }
      });
      const sortedDrugs = Array.from(allDrugs).sort((a, b) => {
        if (a === 'Pansusceptible') return 1; // always move 'Pansusceptible' down
        if (b === 'Pansusceptible') return -1; // always move 'Pansusceptible' down
        return a.localeCompare(b); // alphabetical sort
      });

      // Add drug names along with percentage columns to the header
      sortedDrugs.forEach(drugName => {
        const itemLabel = ngonoSusceptibleRule(drugName, organism);
        HeaderList.push(itemLabel || drugName); // Drug count column
        HeaderList.push(`${itemLabel || drugName} %`); // Percentage column
      });

      // Create CSV rows dynamically
      const rows = mapRegionData
        .filter(item => Object.keys(item).length > 0 && item.name === actualRegion)
        .flatMap(item => {
          return Object.values(item.stats[COMPARISON].items).map(obj => {
            let rowData = [actualRegion, actualCountry, obj.name]; // Start with genotype name

            // Loop through all drugs to add count and percentage
            sortedDrugs.forEach(drugName => {
              const drugData = obj.drugs[drugName] || { count: 0, percentage: 0 };
              rowData.push(drugData.count); // Drug count
              rowData.push(drugData.percentage); // Drug percentage
            });

            return rowData.join(',');
          });
        });

      // Create CSV header row
      let headers = HeaderList.join(',');

      generateCSV(headers, rows, `AMR by genotype for (${actualRegion})`);
    } else {
      console.log('mapRegionData is not an array or is empty', mapRegionData);
    }
  };

  function getUniqueNames(data, key, yAxis) {
    const seen = new Set();

    for (let i = 0; i < data.length; i++) {
      const items = data[i][key]?.[yAxis]?.items;
      if (!items) continue;

      for (let j = 0; j < items.length; j++) {
        const name = items[j].name;
        if (name) {
          seen.add(name);
        }
      }
    }

    return [...seen];
  }

  const downloadCSVForBKOH = () => {
    const COMPARISON = variableGraphOptions.find(x => x.value === bubbleKOHeatmapGraphVariable).mapValue;
    const data =
      actualCountry === 'All'
        ? mapRegionData.find(x => x.name === actualRegion)
        : mapData.find(x => x.name === actualCountry);

    if (data) {
      const headers = ['Region', 'Country', 'Name']; // Initial headers
      const uniqueValues = getUniqueNames(data?.stats?.[COMPARISON]?.items || [], 'ko', bubbleKOYAxisType);
      uniqueValues.sort();

      // Add items names along with percentage columns to the header
      uniqueValues.forEach(value => {
        headers.push(value); // Count column
        headers.push(`${value} %`); // Percentage column
      });

      // Create CSV rows dynamically
      const rows = [data].flatMap(item => {
        return Object.values(item.stats[COMPARISON].items).map(obj => {
          const rowData = [actualRegion, actualCountry, obj.name]; // Start with genotype name

          // Loop through all drugs to add count and percentage
          uniqueValues.forEach(value => {
            const data = obj.ko[bubbleKOYAxisType].items.find(x => x.name === value) || { count: 0, percentage: 0 };
            rowData.push(data.count); // Count
            rowData.push(data.percentage); // Percentage
          });
          return rowData.join(',');
        });
      });

      // Create CSV header row
      generateCSV(headers.join(','), rows, `KO by genotype for (${actualRegion}-${actualCountry})`);
    } else {
      console.log('data was not found', data);
    }
  };

  const downloadCSVForBAMRH = () => {
    const COMPARISON = variableGraphOptions.find(x => x.value === bubbleMarkersHeatmapGraphVariable).mapValue;
    const data =
      actualCountry === 'All'
        ? mapRegionData.find(x => x.name === actualRegion)
        : mapData.find(x => x.name === actualCountry);

    if (data) {
      const headers = ['Region', 'Country', 'Name']; // Initial headers
      const uniqueValues = getUniqueNames(data?.stats?.[COMPARISON]?.items || [], 'drugs', bubbleMarkersYAxisType);
      uniqueValues.sort();

      // Add items names along with percentage columns to the header
      uniqueValues.forEach(value => {
        headers.push(value); // Count column
        headers.push(`${value} %`); // Percentage column
      });

      // Create CSV rows dynamically
      const rows = [data].flatMap(item => {
        return Object.values(item.stats[COMPARISON].items).map(obj => {
          const rowData = [actualRegion, actualCountry, obj.name]; // Start with genotype name

          // Loop through all drugs to add count and percentage
          uniqueValues.forEach(value => {
            const data = obj.drugs[bubbleMarkersYAxisType].items.find(x => x.name === value) || {
              count: 0,
              percentage: 0,
            };
            rowData.push(data.count); // Count
            rowData.push(data.percentage); // Percentage
          });
          return rowData.join(',');
        });
      });

      // Create CSV header row
      generateCSV(headers.join(','), rows, `AMR markers by genotype for (${actualRegion}-${actualCountry})`);
    } else {
      console.log('data was not found', data);
    }
  };

  const downloadCSVForBG = () => {
    // Rename the function used to Download BubbleGeographicGraph HeatMap
    // Helper: Extract clean yAxisKey and capitalize first letter
    const getYAxisKey = type => {
      const parts = type.split('-');
      const key = parts.length > 1 ? parts.slice(2).join('-') : type;
      return key.charAt(0).toUpperCase() + key.slice(1);
    };

    // Step 1: Get correct dataSource
    let dataSource;
    if (['resistance', 'genotype', 'pathotype', 'serotype'].includes(yAxisType)) {
      dataSource = mapData;
    } else {
      const yAxisTrendKey = getYAxisKey(yAxisTypeTrend);
      const matchedKey = Object.keys(drugsCountriesData || {}).find(
        key => key.toLowerCase() === yAxisTrendKey.toLowerCase(),
      );

      if (!matchedKey) {
        console.warn('No matching key found for:', yAxisTrendKey);
        return;
      }

      dataSource = drugsCountriesData[matchedKey];
    }

    let allDrugsSet = new Set();

    // Step 2: Collect unique flat drug names (exclude 'GENOTYPE', 'name', 'totalCount', etc.)
    if (yAxisType === 'resistance') {
      dataSource.forEach(region => {
        if (region.stats) {
          Object.entries(region.stats).forEach(([drugName, value]) => {
            if (drugName !== 'GENOTYPE' && value && typeof value === 'object' && 'count' in value) {
              allDrugsSet.add(drugName);
            }
          });
        }
      });
    } else if (yAxisType === 'genotype') {
      dataSource.forEach(region => {
        if (region.stats?.GENOTYPE?.items) {
          region.stats.GENOTYPE.items.forEach(item => {
            allDrugsSet.add(item.name);
          });
        }
      });
    } else if (['pathotype', 'serotype'].includes(yAxisType)) {
      dataSource.forEach(region => {
        if (region.stats?.PATHOTYPE?.items) {
          region.stats.PATHOTYPE.items.forEach(item => {
            allDrugsSet.add(item.name);
          });
        }
      });
    } else
      dataSource.forEach(entry => {
        Object.entries(entry).forEach(([key, value]) => {
          if (key !== 'GENOTYPE' && key !== 'name' && key !== 'totalCount' && typeof value === 'number') {
            allDrugsSet.add(key);
          }
        });
      });

    const allDrugs = Array.from(allDrugsSet).sort();
    // const allDrugs = Array.from(allDrugsSet).sort((a, b) => {
    //   if (a === 'Pansusceptible') return 1; // always move 'Pansusceptible' down
    //   if (b === 'Pansusceptible') return -1; // always move 'Pansusceptible' down
    //   return a.localeCompare(b); // alphabetical sort
    // });

    // Step 3: Prepare headers
    const headerList = ['Country', 'Total Count'];

    // if (!(yAxisKey === 'Resistance' || yAxisKey === 'Genotype')) {

    allDrugs.forEach(drug => {
      const itemLabel = ngonoSusceptibleRule(drug, organism);
      // headerList.push(itemLabel, `${itemLabel} %`);
      headerList.push(itemLabel || drug);
      headerList.push(`${itemLabel || drug} %`);
    });
    // }

    const rows = [];

    // Step 4: Build rows
    dataSource.forEach(item => {
      // const regionName = actualRegion || '';
      if (item.totalCount < 20 || item.count < 20) return; //Filter data which is used to plot and include count greater and equal to 20 in Heatmap (geo comp)
      const country = item.name || ''; // Or region.country
      const totalCount = item.totalCount || item.count || 0;

      const row = [country, totalCount];
      if (yAxisType === 'resistance')
        allDrugs.forEach(drug => {
          const drugData = item.stats?.[drug];
          const count = drugData && typeof drugData.count === 'number' ? drugData.count : 0;
          const percentage = drugData && typeof drugData.percentage === 'number' ? drugData.percentage : 0;
          row.push(count);
          row.push(percentage);
        });
      else if (yAxisType === 'genotype') {
        allDrugs.forEach(genotype => {
          const match = item.stats?.GENOTYPE?.items?.find(g => g.name === genotype);
          const count = match?.count || 0;
          const percentage = totalCount ? ((count / totalCount) * 100).toFixed(2) : 0;
          row.push(count);
          row.push(percentage);
        });
      } else if (['pathotype', 'serotype'].includes(yAxisType)) {
        allDrugs.forEach(pathotype => {
          const match = item.stats?.PATHOTYPE?.items?.find(g => g.name === pathotype);
          const count = match?.count || 0;
          const percentage = totalCount ? ((count / totalCount) * 100).toFixed(2) : 0;
          row.push(count);
          row.push(percentage);
        });
      } else {
        allDrugs.forEach(drug => {
          const count = item[drug] || 0;
          const percentage = totalCount ? ((count / totalCount) * 100).toFixed(2) : 0;
          row.push(count);
          row.push(percentage);
        });
      }

      rows.push(row.join(','));
    });

    // Step 5: Export CSV
    const headers = headerList.join(',');
    generateCSV(
      headers,
      rows,
      `Geographic Comparisons (${yAxisType}${yAxisType === 'determinant' ? '-' + yAxisTypeTrend : ''})`,
    );
  };

  function generateCSV(headers, rows, name) {
    // Combine header and rows into CSV content
    const csvContent = [headers, ...rows].join('\n');

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a link to download the Blob as a file
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${firstName} ${secondName} ${name} data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  const functionValue = () => {
    switch (value) {
      case 'DRT':
        return downloadCSVForDRT();
      case 'RFWG':
        return downloadCSVForRFWG();
      case 'RDWG':
        return downloadCSVForRDWG('HSG2');
      case 'GD':
        return downloadCSVForGD();
      case 'KOT':
        return downloadCSVForKOT();
      case 'HSG2':
        return downloadCSVForHM();
      case 'BKOH':
        return downloadCSVForBKOH();
      case 'BAMRH':
        return downloadCSVForBAMRH();
      case 'RDT':
        return downloadCSVForRDT();
      case 'convergence-graph': // convergence graph plot was missing the download data
        return downloadCSVForCG();
      case 'BG':
        return downloadCSVForBG(); // Rename the function used to Download BubbleGeographicGraph HeatMap
      case 'BHP': // Pathotype HeatMap
        return downloadCSVForHM('BHP'); // Rename the function used to Download BubbleGeographicGraph HeatMap
      default:
        return downloadCSV();
    }
  };
  return (
    <Download
      onClick={e => {
        e.stopPropagation();
        functionValue();
      }}
    />
  );
};
