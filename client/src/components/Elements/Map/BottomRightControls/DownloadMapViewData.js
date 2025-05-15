import { Download } from '@mui/icons-material';
import { useAppSelector } from '../../../../stores/hooks';
import { variablesOptions } from '../../../../util/convergenceVariablesOptions';

export const DownloadMapViewData = ({ value }) => {
  const mapData = useAppSelector((state) => state.map.mapData);
  const prevalenceMapViewOptionsSelected = useAppSelector((state) => state.graph.prevalenceMapViewOptionsSelected);
  const customDropdownMapViewNG = useAppSelector((state) => state.graph.customDropdownMapViewNG);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const drugsYearData = useAppSelector((state) => state.graph.drugsYearData);
  const genotypesDrugsData = useAppSelector((state) => state.graph.genotypesDrugsData);
  const genotypesDrugClassesData = useAppSelector((state) => state.graph.genotypesDrugClassesData);
  const determinantsGraphDrugClass = useAppSelector((state) => state.graph.determinantsGraphDrugClass);
  const genotypesYearData = useAppSelector((state) => state.graph.genotypesYearData);
  const topXGenotype = useAppSelector((state) => state.graph.topXGenotype);
  const topXGenotypeRDWG = useAppSelector((state) => state.graph.topXGenotypeRDWG);
  const genotypesAndDrugsYearData = useAppSelector((state) => state.graph.genotypesAndDrugsYearData);
  const trendsGraphDrugClass = useAppSelector((state) => state.graph.trendsGraphDrugClass);
  const mapRegionData = useAppSelector((state) => state.map.mapRegionData);
  const actualRegion = useAppSelector((state) => state.dashboard.actualRegion);
  const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);
  const topGenesSlice = useAppSelector((state) => state.graph.topGenesSlice);
  const topGenotypeSlice = useAppSelector((state) => state.graph.topGenotypeSlice);
  const mapView = useAppSelector((state) => state.map.mapView);
  const convergenceData = useAppSelector((state) => state.graph.convergenceData);
  const convergenceGroupVariable = useAppSelector((state) => state.graph.convergenceGroupVariable);
  // const countriesForFilter = useAppSelector((state) => state.graph.countriesForFilter);
  // const economicRegions = useAppSelector((state) => state.dashboard.economicRegions);
  // const drugsRegionsData = useAppSelector((state) => state.graph.drugsRegionsData);
  const drugsCountriesData = useAppSelector((state) => state.graph.drugsCountriesData);
  const yAxisType = useAppSelector((state) => state.map.yAxisType);

  // console.log('convergenceData', convergenceData, convergenceGroupVariable);
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
    firstName = 'Diarrheagenic';
    secondName = 'E. coli';
  } else if (organism === 'sentericaints') {
    firstName = 'Invasive';
    secondName = 'non-typhoidal Salmonella';
  }

  const downloadCSV = () => {
    if (Array.isArray(mapData) && mapData.length > 0) {
      let HeaderList = ['Country', 'Total number of Count'];
      const mapViewOptionSelected =
        mapView === 'NG-MAST prevalence' ? customDropdownMapViewNG : prevalenceMapViewOptionsSelected;

      if (
        mapView === 'Genotype prevalence' ||
        mapView === 'ST prevalence' ||
        mapView === 'NG-MAST prevalence' ||
        mapView === 'Lineage prevalence'
      ) {
        mapViewOptionSelected.forEach((viewItem, index) => {
          HeaderList.push(`${viewItem}`);
          HeaderList.push(`${viewItem} %`);
        });
      } else {
        Object.keys(mapData[0]?.stats).forEach((item) => {
          if (
            (mapView === 'Resistance prevalence' &&
              (item === 'GENOTYPE' || item === 'NGMAST' || item === 'PATHOTYPE')) ||
            item === 'H58'
          ) {
            return;
          }
          // if( !item === 'H58'){
          HeaderList.push(`${item}`);
          HeaderList.push(`${item} %`);
          // }
        });
      }

      // Create CSV header row
      const headers = HeaderList.join(',');
      // Create CSV rows dynamically
      const rows = mapData
        .filter((item) => Object.keys(item).length > 0)
        .map((item) => {
          let rowData = [item.name, item.count || ''];

          if (
            mapView === 'Genotype prevalence' ||
            mapView === 'ST prevalence' ||
            mapView === 'NG-MAST prevalence' ||
            mapView === 'Lineage prevalence'
          ) {
            const GenotypeORNgmast = mapView === 'NG-MAST prevalence' ? item.stats?.NGMAST : item.stats?.GENOTYPE;
            const foundGenotypes = new Set();
            GenotypeORNgmast?.items.forEach((genotypeItem) => {
              if (mapViewOptionSelected.includes(genotypeItem.name)) {
                foundGenotypes.add(genotypeItem.name);

                const count = genotypeItem.count || 0;
                const percentage = count < 20 ? 'insufficient' : ((count / GenotypeORNgmast.sum) * 100).toFixed(2); // Prevent division by zero

                rowData.push(count);
                rowData.push(percentage);
              }
            });
            mapViewOptionSelected.forEach((headerItem) => {
              if (!foundGenotypes.has(headerItem)) {
                rowData.push(0);
                rowData.push('insufficient');
              }
            });
          } else {
            Object.keys(item.stats).forEach((key) => {
              if (
                (mapView === 'Resistance prevalence' &&
                  (key === 'GENOTYPE' || key === 'NGMAST' || key === 'PATHOTYPE')) ||
                key === 'H58'
              ) {
                return;
              }
              const stat = item.stats[key];
              if (stat) {
                const count = stat.count || 0;

                let percentage;
                if (key === 'GENOTYPE' || key === 'NGMAST' || key === 'PATHOTYPE') {
                  percentage = count < 20 ? 'insufficient' : ((count / stat.sum) * 100).toFixed(2);
                } else {
                  percentage = count < 20 ? 'insufficient' : stat.percentage;
                }
                rowData.push(count);
                rowData.push(percentage);
              } else {
                console.warn(`Missing data for key: ${key}`);
              }
            });
          }

          return rowData.join(',');
        });
      generateCSV(headers, rows, 'Map');
    } else {
      console.log('MapData is not an array or is empty', mapData);
    }
  };

  const downloadCSVForDRT = () => {
    if (Array.isArray(drugsYearData) && drugsYearData.length > 0) {
      const HeaderList = ['Region', 'Country', 'Year', 'Total Count'];

      // Dynamically build header: [drug, drug %]
      const sample = drugsYearData[0];
      const drugKeys = Object.keys(sample).filter((key) => key !== 'name' && key !== 'count');

      drugKeys.forEach((drug) => {
        HeaderList.push(drug);
        HeaderList.push(`${drug} %`);
      });

      const headers = HeaderList.join(',');

      // Build data rows
      const rows = drugsYearData
        .filter((item) => item.count >= 1) // Optional: filter low-count rows
        .map((item) => {
          const row = [actualRegion, actualCountry, item.name, item.count];
          drugKeys.forEach((drug) => {
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
    variablesOptions.forEach((item) => {
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
        (key) => key !== 'name' && key !== 'count' && key !== 'colorLabel',
      );
      // convergenceKey.forEach((item) => {
      //   HeaderList.push(item);
      // });

      const headers = HeaderList.join(',');

      // Build data rows
      const rows = convergenceData
        .filter((item) => Object.keys(item).length > 0)
        .map((item) => {
          const row = [actualRegion, actualCountry, item.name];
          // console.log('item', item);
          convergenceKey.forEach((items) => {
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
      // console.log('RFWG', genotypesDrugsData);
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
        'Sulphonamides',
        'Sulphonamides %',
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
        .filter((item) => Object.keys(item).length > 0)
        .map((item) => {
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

          const SulCount = item?.Sulphonamides || 0;
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
    // console.log('its working', value, genotypesDrugsData);
    if (
      Array.isArray(genotypesDrugClassesData[determinantsGraphDrugClass]) &&
      genotypesDrugClassesData[determinantsGraphDrugClass].length > 0
    ) {
      // console.log('RFWG', genotypesDrugClassesData[determinantsGraphDrugClass], topXGenotypeRDWG);
      let HeaderList = ['Region', 'Country', 'Name', 'Total number of Count'];

      // Dynamically add genotype headers
      if (Array.isArray(topXGenotypeRDWG) && topXGenotypeRDWG.length > 0) {
        topXGenotypeRDWG.forEach((genotype) => {
          HeaderList.push(genotype);
          HeaderList.push(`${genotype} %`);
        });
      }

      // Create CSV header row
      const headers = HeaderList.join(',');

      // Create CSV rows dynamically
      const rows = genotypesDrugClassesData[determinantsGraphDrugClass]
        .filter((item) => Object.keys(item).length > 0)
        .map((item) => {
          let rowData = [actualRegion, actualCountry, item.name, item.totalCount || ''];

          if (Array.isArray(topXGenotypeRDWG) && topXGenotypeRDWG.length > 0) {
            topXGenotypeRDWG.forEach((genotype) => {
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
      // console.log('GD', genotypesYearData, topXGenotype);

      let HeaderList = ['Region', 'Country', 'Year', 'Total number of Count'];

      // Dynamically add genotype headers
      if (Array.isArray(topXGenotype) && topXGenotype.length > 0) {
        topXGenotype.forEach((genotype) => {
          HeaderList.push(genotype);
          HeaderList.push(`${genotype} %`);
        });
      }

      // Create CSV header row
      const headers = HeaderList.join(',');

      // Create CSV rows dynamically
      const rows = genotypesYearData
        .filter((item) => Object.keys(item).length > 0)
        .map((item) => {
          let rowData = [actualRegion, actualCountry, item.name, item.count || ''];

          if (Array.isArray(topXGenotype) && topXGenotype.length > 0) {
            topXGenotype.forEach((genotype) => {
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

  // TODO
  const downloadCSVForRDT = () => {
    // console.log("its working", value, Object.keys(genotypesAndDrugsYearData), genotypesAndDrugsYearData, trendsGraphDrugClass, genotypesForFilter);

    if (genotypesAndDrugsYearData && Object.keys(genotypesAndDrugsYearData[trendsGraphDrugClass]).length > 0) {
      // console.log('RDT', genotypesAndDrugsYearData[trendsGraphDrugClass]);

      let HeaderList = ['Region', 'Country', 'Name', 'Total number of Count'];

      // Dynamically add genotype headers
      if (Array.isArray(topGenesSlice) && topGenesSlice.length > 0) {
        topGenesSlice.forEach((gen) => {
          HeaderList.push(gen);
          HeaderList.push(`${gen} %`);
        });
      }
      if (Array.isArray(topGenotypeSlice) && topGenotypeSlice.length > 0) {
        topGenotypeSlice.forEach((genotype) => {
          HeaderList.push(genotype);
          HeaderList.push(`${genotype} %`);
        });
      }

      // Create CSV header row
      const headers = HeaderList.join(',');

      // Create CSV rows dynamically
      const rows = genotypesAndDrugsYearData[trendsGraphDrugClass]
        .filter((item) => Object.keys(item).length > 0)
        .map((item) => {
          let rowData = [actualRegion, actualCountry, item.name, item.totalCount || ''];

          if (Array.isArray(topGenesSlice) && topGenesSlice.length > 0) {
            topGenesSlice.forEach((gen) => {
              const count = item?.[gen] || 0;
              const percentage = count < 20 ? '0' : ((count / item.totalCount) * 100).toFixed(2) || 0;

              rowData.push(count);
              rowData.push(percentage);
            });
          }
          if (Array.isArray(topGenotypeSlice) && topGenotypeSlice.length > 0) {
            topGenotypeSlice.forEach((genotype) => {
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

  const downloadCSVForHM = () => {
    if (Array.isArray(mapRegionData) && mapRegionData.length > 0) {
      let HeaderList = ['Region', 'Country', 'Name']; // Initial headers
      let allDrugs = new Set(); // Store unique drug names

      // Extract drug names dynamically from all items
      mapRegionData.forEach((item) => {
        if (item.stats && item.stats.GENOTYPE && item.stats.GENOTYPE.items) {
          Object.values(item.stats.GENOTYPE.items).forEach((obj) => {
            Object.keys(obj.drugs).forEach((drugName) => allDrugs.add(drugName));
          });
        }
      });

      // Add drug names along with percentage columns to the header
      allDrugs.forEach((drugName) => {
        HeaderList.push(drugName); // Drug count column
        HeaderList.push(`${drugName} %`); // Percentage column
      });

      // Create CSV rows dynamically
      const rows = mapRegionData
        .filter((item) => Object.keys(item).length > 0 && item.name === actualRegion)
        .flatMap((item) => {
          return Object.values(item.stats.GENOTYPE.items).map((obj) => {
            let rowData = [actualRegion, actualCountry, obj.name]; // Start with genotype name

            // Loop through all drugs to add count and percentage
            allDrugs.forEach((drugName) => {
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

  const downloadCSVForCVM = () => {
    // Helper: Extract clean yAxisKey and capitalize first letter
    const getYAxisKey = (type) => {
      const parts = type.split('-');
      const key = parts.length > 1 ? parts.slice(2).join('-') : type;
      return key.charAt(0).toUpperCase() + key.slice(1);
    };

    const yAxisKey = getYAxisKey(yAxisType);

    // Step 1: Get correct dataSource
    let dataSource;
    if (yAxisKey === 'Resistance' || yAxisKey === 'Genotype') {
      dataSource = mapData;
    } else {
      const matchedKey = Object.keys(drugsCountriesData || {}).find(
        (key) => key.toLowerCase() === yAxisKey.toLowerCase(),
      );
      if (matchedKey) {
        dataSource = drugsCountriesData[matchedKey];
      } else {
        console.warn('No matching key found for:', yAxisKey);
        return;
      }
    }

    const allDrugsSet = new Set();

    // Step 2: Collect unique flat drug names (exclude 'GENOTYPE', 'name', 'totalCount', etc.)
    if (yAxisKey === 'Resistance')
      dataSource.forEach((region) => {
        if (region.stats) {
          Object.entries(region.stats).forEach(([drugName, value]) => {
            if (drugName !== 'GENOTYPE' && value && typeof value === 'object' && 'count' in value) {
              allDrugsSet.add(drugName);
            }
          });
        }
      });
    else if (yAxisKey === 'Genotype') {
      dataSource.forEach((region) => {
        if (region.stats?.GENOTYPE?.items) {
          region.stats.GENOTYPE.items.forEach((item) => {
            allDrugsSet.add(item.name);
          });
        }
      });
    } else
      dataSource.forEach((entry) => {
        Object.entries(entry).forEach(([key, value]) => {
          if (key !== 'GENOTYPE' && key !== 'name' && key !== 'totalCount' && typeof value === 'number') {
            allDrugsSet.add(key);
          }
        });
      });

    const allDrugs = Array.from(allDrugsSet).sort();

    // Step 3: Prepare headers
    const headerList = ['Country', 'Total Count'];

    // if (!(yAxisKey === 'Resistance' || yAxisKey === 'Genotype')) {
    allDrugs.forEach((drug) => {
      headerList.push(drug);
      headerList.push(`${drug} %`);
    });
    // }

    const rows = [];

    // Step 4: Build rows
    dataSource.forEach((item) => {
      // const regionName = actualRegion || '';
      const country = item.name || ''; // Or region.country
      const totalCount = item.totalCount || item.count || 0;

      const row = [country, totalCount];
      // console.log('allDrugs', allDrugs);
      if (!(yAxisKey === 'Resistance' || yAxisKey === 'Genotype')) {
        allDrugs.forEach((drug) => {
          const count = item[drug] || 0;
          const percentage = totalCount ? ((count / totalCount) * 100).toFixed(2) : 0;
          row.push(count);
          row.push(percentage);
        });
      } else if (yAxisKey === 'Resistance')
        allDrugs.forEach((drug) => {
          const drugData = item.stats?.[drug];
          const count = drugData && typeof drugData.count === 'number' ? drugData.count : 0;
          const percentage = drugData && typeof drugData.percentage === 'number' ? drugData.percentage : 0;
          row.push(count);
          row.push(percentage);
        });
      else if (yAxisKey === 'Genotype') {
        allDrugs.forEach((genotype) => {
          const match = item.stats?.GENOTYPE?.items?.find((g) => g.name === genotype);
          const count = match?.count || 0;
          const percentage = totalCount ? ((count / totalCount) * 100).toFixed(2) : 0;
          row.push(count);
          row.push(percentage);
        });
      }

      rows.push(row.join(','));
    });

    // Step 5: Export CSV
    const headers = headerList.join(',');
    generateCSV(headers, rows, `Geographic Comparisons (${yAxisType})`);
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
        return downloadCSVForRDWG();
      case 'GD':
        return downloadCSVForGD();
      case 'HSG2':
        return downloadCSVForHM();
      case 'RDT':
        return downloadCSVForRDT();
      case 'CVM':
        return downloadCSVForCG();
      case 'BG':
        return downloadCSVForCVM();
      default:
        return downloadCSV();
    }
  };
  return (
    <div onClick={functionValue}>
      <Download />
    </div>
  );
};
