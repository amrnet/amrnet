/* eslint-disable react-hooks/exhaustive-deps */
import { MainLayout } from '../Layout';
import { Note } from '../Elements/Note';
import { Map } from '../Elements/Map';
import { API_ENDPOINT } from '../../constants';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { DownloadData } from '../Elements/DownloadData';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import {
  setActualCountry,
  setActualGenomes,
  setActualGenotypes,
  setActualTimeFinal,
  setActualTimeInitial,
  setGenotypesForFilter,
  setListPMID,
  setLoadingData,
  setTimeFinal,
  setTimeInitial,
  setTotalGenomes,
  setTotalGenotypes,
  setYears,
  setPMID,
  setColorPallete,
  setCanFilterData,
  setOrganism,
  setPathovar,
  setSelectedLineages,
  setEconomicRegions,
  setActualRegion,
} from '../../stores/slices/dashboardSlice.ts';
import { setDataset, setMapData, setMapRegionData, setMapView, setPosition } from '../../stores/slices/mapSlice.ts';
import { Graphs } from '../Elements/Graphs';
import {
  setCollapses,
  setConvergenceColourPallete,
  setConvergenceColourVariable,
  setConvergenceData,
  setConvergenceGroupVariable,
  setCountriesForFilter,
  setDeterminantsGraphDrugClass,
  setDeterminantsGraphView,
  setDistributionGraphView,
  setDrugResistanceGraphView,
  setDrugsYearData,
  setFrequenciesGraphSelectedGenotypes,
  setCustomDropdownMapViewNG,
  setFrequenciesGraphView,
  setGenotypesAndDrugsYearData,
  setGenotypesDrugClassesData,
  setGenotypesDrugsData,
  setGenotypesYearData,
  setKODiversityData,
  setKODiversityGraphView,
  setTrendsGraphDrugClass,
  setTrendsGraphView,
  setCurrentSliderValue,
  setCurrentSliderValueRD,
  setCurrentSliderValueCM,
  setNgmast,
  setNgmastDrugsData,
  setMaxSliderValueCM,
  setDrugsCountriesData,
  setDrugsRegionsData,
  setCountriesYearData,
  setRegionsYearData,
  setActualGenomesGD,
  setActualGenomesDRT,
  setActualGenomesRDT,
  setGenotypesInitialDrugsData,
} from '../../stores/slices/graphSlice.ts';
import {
  filterData,
  filterBrushData,
  getYearsData,
  getMapData,
  getGenotypesData,
  getCountryDisplayName,
  getKODiversityData,
  getConvergenceData,
  getNgmastData,
  getDrugsCountriesData,
} from './filters';
import { ResetButton } from '../Elements/ResetButton/ResetButton';
import { generatePalleteForGenotypes } from '../../util/colorHelper';
import {
  drugsKP,
  defaultDrugsForDrugResistanceGraphST,
  defaultDrugsForDrugResistanceGraphNG,
  drugsINTS,
} from '../../util/drugs';
import { useIndexedDB } from '../../context/IndexedDBContext';
import { ContinentGraphs } from '../Elements/ContinentGraphs';
import { FloatingGlobalFilters } from '../Elements/FloatingGlobalFilters';

export const DashboardPage = () => {
  const [data, setData] = useState([]);
  const [currentConvergenceGroupVariable, setCurrentConvergenceGroupVariable] = useState('DATE');
  // const [currentConvergenceColourVariable, setCurrentConvergenceColourVariable] = useState('DATE');
  const [currentTimeInitial, setCurrentTimeInitial] = useState('');
  const [currentTimeFinal, setCurrentTimeFinal] = useState('');

  const { hasItems, bulkAddItems, getItems } = useIndexedDB();

  const dispatch = useAppDispatch();
  const canFilterData = useAppSelector((state) => state.dashboard.canFilterData);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const dataset = useAppSelector((state) => state.map.dataset);
  const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);
  const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);
  const actualRegion = useAppSelector((state) => state.dashboard.actualRegion);
  const countriesForFilter = useAppSelector((state) => state.graph.countriesForFilter);
  const economicRegions = useAppSelector((state) => state.dashboard.economicRegions);
  const yearsForFilter = useAppSelector((state) => state.dashboard.years);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const selectedLineages = useAppSelector((state) => state.dashboard.selectedLineages);
  const convergenceGroupVariable = useAppSelector((state) => state.graph.convergenceGroupVariable);
  // const convergenceColourVariable = useAppSelector((state) => state.graph.convergenceColourVariable);
  const maxSliderValueRD = useAppSelector((state) => state.graph.maxSliderValueRD);
  const endtimeGD = useAppSelector((state) => state.graph.endtimeGD);
  const starttimeGD = useAppSelector((state) => state.graph.starttimeGD);
  const endtimeDRT = useAppSelector((state) => state.graph.endtimeDRT);
  const starttimeDRT = useAppSelector((state) => state.graph.starttimeDRT);
  const starttimeRDT = useAppSelector((state) => state.graph.starttimeRDT);
  const endtimeRDT = useAppSelector((state) => state.graph.endtimeRDT);
  // Get info either from indexedDB or mongoDB
  async function getStoreOrGenerateData(storeName, handleGetData, clearStore = true) {
    // Check if organism data is already in indexedDB
    const storeHasItems = await hasItems(storeName);

    if (storeHasItems) {
      const storeData = await getItems(storeName);

      if (!storeName.includes('convergence')) {
        return storeData;
      }

      if (!clearStore) {
        const convergenceObject = storeData.find(
          (x) => x.name === `${convergenceGroupVariable}_${convergenceGroupVariable}`,
        );

        if (convergenceObject) return convergenceObject;
      }
    }

    const organismData = await handleGetData();
    await bulkAddItems(storeName, storeName.includes('convergence') ? [organismData] : organismData, clearStore);

    return organismData;
  }

  // This function is only called once, after the csv is read. It gets all the static and dynamic data
  // that came from the csv file and sets all the data the organism needs to show
  async function getInfoFromData(responseData, regions) {
    const dataLength = responseData.length;

    dispatch(setTotalGenomes(dataLength));
    dispatch(setActualGenomes(dataLength));

    // Get regions
    const ecRegions = {};

    regions.forEach((item) => {
      const region = item['Sub-region Name'];

      if (!region) return;

      if (!(region in ecRegions)) {
        ecRegions[region] = [];
      }

      const country = getCountryDisplayName(item['Country or Area']);
      ecRegions[region].push(country);
    });

    // Get mapped values
    const genotypesSet = new Set();
    const ngmastSet = new Set();
    const yearsSet = new Set();
    const countriesSet = new Set();
    const PMIDSet = new Set();
    const pathovarSet = new Set();

    responseData.forEach((x) => {
      const country = getCountryDisplayName(x.COUNTRY_ONLY);
      countriesSet.add(country);
      //update here
      if (['ecoli'].includes(organism)) genotypesSet.add(x.GENOTYPE1);
      else genotypesSet.add(x.GENOTYPE);
      yearsSet.add(x.DATE);
      if ('NG-MAST TYPE' in x) ngmastSet.add(x['NG-MAST TYPE']);
      if ('PMID' in x) PMIDSet.add(x['PMID']);

      if (['sentericaints'].includes(organism)) {
        pathovarSet.add(x.SISTR1_Serovar);
      }
      if (['shige', 'decoli'].includes(organism)) {
        pathovarSet.add(x.Pathotype);
      }
      //For E. coli, we need to add the Pathovar instead of the Pathotype
      // because the Pathotype is not present in E.coli data
      // and the Pathovar is the one that is used in the database
      if (['ecoli'].includes(organism)) {
        pathovarSet.add(x.Pathovar);
      }
    });

    const genotypes = Array.from(genotypesSet);
    const ngmast = Array.from(ngmastSet);
    const years = Array.from(yearsSet);
    const countries = Array.from(countriesSet);
    const PMID = Array.from(PMIDSet);
    const pathovar = Array.from(pathovarSet);

    // Sort values
    genotypes.sort((a, b) => a.localeCompare(b));
    years.sort();
    countries.sort();
    pathovar.sort();

    if (pathovar.length > 0) {
      dispatch(setSelectedLineages(pathovar));
    }

    // Set values
    dispatch(setTotalGenotypes(genotypes.length));
    dispatch(setActualGenotypes(genotypes.length));
    dispatch(setGenotypesForFilter(genotypes));
    dispatch(setYears(years));
    dispatch(setCountriesForFilter(countries));
    dispatch(setPMID(PMID));
    dispatch(setNgmast(ngmast));
    dispatch(setPathovar(pathovar));

    // Set regions
    Object.keys(ecRegions).forEach((key) => {
      ecRegions[key] = ecRegions[key].filter((country) => countries.includes(country)).sort();

      if (ecRegions[key].length === 0) {
        delete ecRegions[key];
      }
    });

    dispatch(setEconomicRegions(ecRegions));

    await Promise.all([
      // Get map data
      getStoreOrGenerateData(`${organism}_map`, async () =>
        getMapData({ data: responseData, items: countries, organism }),
      ).then((mapData) => {
        dispatch(setMapData(mapData));
      }),

      // Get regions data
      ['styphi', 'ngono', 'kpneumo', 'shige', 'decoli', 'ecoli', 'sentericaints'].includes(organism)
        ? getStoreOrGenerateData(`${organism}_map_regions`, async () =>
            getMapData({ data: responseData, items: ecRegions, organism, type: 'region' }),
          ).then((mapData) => {
            dispatch(setMapRegionData(mapData));
          })
        : Promise.resolve(),

      // Get genotypes data
      getStoreOrGenerateData(`${organism}_genotype`, () => {
        const dt = getGenotypesData({ data: responseData, genotypes, organism, years, countries, regions: ecRegions });
        return [
          dt.genotypesDrugsData,
          dt.genotypesDrugClassesData,
          dt.countriesDrugClassesData,
          dt.regionsDrugClassesData,
        ];
      }).then(([genotypesDrugsData, genotypesDrugClassesData, countriesDrugClassesData, regionsDrugClassesData]) => {
        dispatch(setGenotypesDrugsData(genotypesDrugsData));
        dispatch(setGenotypesInitialDrugsData(genotypesDrugsData));
        dispatch(setFrequenciesGraphSelectedGenotypes(genotypesDrugsData.slice(0, 5).map((x) => x.name)));
        dispatch(setGenotypesDrugClassesData(genotypesDrugClassesData));
        dispatch(setCountriesYearData(countriesDrugClassesData));
        dispatch(setRegionsYearData(regionsDrugClassesData));
      }),

      // Get ngmast data
      organism === 'ngono'
        ? getStoreOrGenerateData(`${organism}_ngmast`, () => {
            const dt = getNgmastData({ data: responseData, ngmast, organism });
            return [dt.ngmastDrugData, dt.ngmastDrugClassesData];
          }).then(([ngmastDrugData, ngmastDrugClassesData]) => {
            dispatch(setNgmastDrugsData(ngmastDrugData));
            dispatch(setCustomDropdownMapViewNG(ngmastDrugData.slice(0, 1).map((x) => x.name)));
          })
        : Promise.resolve(),

      // Get years data
      getStoreOrGenerateData(`${organism}_years`, () => {
        const dt = getYearsData({
          data: responseData,
          years,
          organism,
          getUniqueGenotypes: organism === 'styphi' ? false : true,
        });
        return [dt.genotypesData, dt.drugsData, dt.uniqueGenotypes, dt.genotypesAndDrugsData];
      }).then(([genotypesData, drugsData, uniqueGenotypes, genotypesAndDrugsData]) => {
        dispatch(setGenotypesYearData(genotypesData));
        dispatch(setDrugsYearData(drugsData));
        dispatch(setGenotypesAndDrugsYearData(genotypesAndDrugsData));

        if (organism !== 'styphi') {
          // dispatch(setGenotypesForFilter(uniqueGenotypes));
          dispatch(setColorPallete(generatePalleteForGenotypes(uniqueGenotypes)));
        }
      }),

      // Get drugs carb and esbl data for countries
      ['styphi', 'kpneumo'].includes(organism)
        ? getStoreOrGenerateData(`${organism}_drugs_countries`, () => {
            const { drugsData } = getDrugsCountriesData({
              data: responseData,
              items: countries,
              organism,
            });
            return [drugsData];
          }).then(([drugsData]) => {
            dispatch(setDrugsCountriesData(drugsData));
          })
        : Promise.resolve(),

      // Get drugs carb and esbl data for regions
      ['styphi', 'kpneumo'].includes(organism)
        ? getStoreOrGenerateData(`${organism}_drugs_regions`, () => {
            const { drugsData } = getDrugsCountriesData({
              data: responseData,
              items: ecRegions,
              type: 'region',
              organism,
            });
            return [drugsData];
          }).then(([drugsData]) => {
            dispatch(setDrugsRegionsData(drugsData));
          })
        : Promise.resolve(),

      // Get KO diversity data
      organism === 'kpneumo'
        ? getStoreOrGenerateData(`${organism}_ko`, () => {
            const dt = getKODiversityData({ data: responseData });
            return [dt.K_locus, dt.O_locus];
          }).then(([K_locus, O_locus]) => {
            dispatch(setKODiversityData({ K_locus, O_locus }));
          })
        : Promise.resolve(),

      // Get convergence data
      organism === 'kpneumo'
        ? getStoreOrGenerateData(`${organism}_convergence`, () => {
            const dt = getConvergenceData({
              data: responseData,
              groupVariable: convergenceGroupVariable,
              colourVariable: convergenceGroupVariable,
            });
            return {
              name: `${convergenceGroupVariable}_${convergenceGroupVariable}`,
              colourVariables: dt.colourVariables,
              data: dt.data,
            };
          }).then((convergenceData) => {
            dispatch(setConvergenceColourPallete(generatePalleteForGenotypes(convergenceData.colourVariables)));
            dispatch(setMaxSliderValueCM(convergenceData.colourVariables.length));
            dispatch(setConvergenceData(convergenceData.data));
          })
        : Promise.resolve(),
    ]);
  }

  // This function gets the organism data and set specific filters accordingly to it
  async function getData({ storeName, endpoint }) {
    dispatch(setLoadingData(true));

    try {
      const organismData = await getStoreOrGenerateData(storeName, async () => {
        const response = await axios.get(`${API_ENDPOINT}filters/${endpoint}`, {
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
        return response.data;
      });

      const regions = await getStoreOrGenerateData('unr', async () => {
        return (await axios.get(`${API_ENDPOINT}filters/getUNR`)).data;
      });

      await getInfoFromData(organismData, regions);

      // Set all filters that need to be set after the data has been acquired
      dispatch(setDataset('All'));
      switch (organism) {
        case 'styphi':
          dispatch(setMapView('Resistance prevalence'));
          dispatch(setDrugResistanceGraphView(defaultDrugsForDrugResistanceGraphST));
          dispatch(setDeterminantsGraphDrugClass('Ciprofloxacin NS'));
          break;
        case 'kpneumo':
          dispatch(setMapView('Resistance prevalence'));
          dispatch(setDrugResistanceGraphView(drugsKP));
          dispatch(setDeterminantsGraphDrugClass('Carbapenems'));
          dispatch(setTrendsGraphDrugClass('Carbapenems'));
          dispatch(setKODiversityGraphView('K_locus'));
          dispatch(setTrendsGraphView('percentage'));
          dispatch(setConvergenceGroupVariable('cgST'));
          dispatch(setConvergenceColourVariable('cgST'));
          setCurrentConvergenceGroupVariable('DATE');
          // setCurrentConvergenceColourVariable('DATE');
          break;
        case 'ngono':
          dispatch(setMapView('Resistance prevalence'));
          dispatch(setDrugResistanceGraphView(defaultDrugsForDrugResistanceGraphNG));
          dispatch(setDeterminantsGraphDrugClass('Azithromycin'));
          dispatch(setTrendsGraphDrugClass('Azithromycin'));
          dispatch(setTrendsGraphView('percentage'));
          break;
        case 'sentericaints':
          dispatch(setMapView('Resistance prevalence'));
          dispatch(setDrugResistanceGraphView(drugsINTS));
          break;
        case 'ecoli':
        case 'decoli':
        case 'shige':
        case 'senterica':
          dispatch(setMapView('Resistance prevalence'));
          dispatch(setDrugResistanceGraphView(drugsINTS));
          break;
        default:
          break;
      }
    } finally {
      dispatch(setLoadingData(false));
    }
  }

  // This useEffect is called everytime the organism changes, it resets all data and filters and
  // call the function to read the specific organism csv
  useEffect(() => {
    if (organism !== 'none') {
      // Clear all that needs to be cleared
      dispatch(
        setCollapses({
          continent: false,
          all: true,
          map: true,
        }),
      );
      setData([]);
      dispatch(setGenotypesForFilter([]));
      dispatch(setTotalGenomes(0));
      dispatch(setTotalGenotypes(0));
      dispatch(setActualGenomes(0));
      dispatch(setActualGenotypes(0));
      dispatch(setDataset(''));
      dispatch(setActualTimeInitial(''));
      dispatch(setActualTimeFinal(''));
      dispatch(setPosition({ coordinates: [0, 0], zoom: 1 }));
      dispatch(setActualCountry('All'));
      dispatch(setActualRegion('All'));
      dispatch(setMapData([]));
      dispatch(setGenotypesYearData([]));
      dispatch(setDrugsYearData([]));
      dispatch(setGenotypesDrugsData([]));
      dispatch(setGenotypesDrugClassesData([]));
      dispatch(setGenotypesAndDrugsYearData([]));
      dispatch(setKODiversityData([]));
      dispatch(setConvergenceData([]));
      dispatch(setDeterminantsGraphDrugClass(''));
      dispatch(setTrendsGraphDrugClass(''));
      dispatch(setMapView(''));
      dispatch(setFrequenciesGraphView('percentage'));
      dispatch(setDeterminantsGraphView('percentage'));
      dispatch(setDistributionGraphView('percentage'));
      dispatch(setConvergenceColourPallete({}));
      dispatch(setNgmast([]));
      dispatch(setCurrentSliderValue(20));
      dispatch(setSelectedLineages([]));
      dispatch(setCurrentSliderValueRD(maxSliderValueRD));
      dispatch(setCurrentSliderValueRD(20));
      dispatch(setCurrentSliderValueCM(20));

      // Get data from organism
      switch (organism) {
        case 'styphi':
          getData({ storeName: organism, endpoint: 'getDataForSTyphi' });
          break;
        case 'kpneumo':
          getData({ storeName: organism, endpoint: 'getDataForKpneumo' });
          break;
        case 'ngono':
          getData({ storeName: organism, endpoint: 'getDataForNgono' });
          break;
        case 'ecoli':
          getData({ storeName: organism, endpoint: 'getDataForEcoli' });
          break;
        case 'decoli':
          getData({ storeName: organism, endpoint: 'getDataForDEcoli' });
          break;
        case 'shige':
          getData({ storeName: organism, endpoint: 'getDataForShige' });
          break;
        case 'senterica':
          getData({ storeName: organism, endpoint: 'getDataForSenterica' });
          break;
        case 'sentericaints':
          getData({ storeName: organism, endpoint: 'getDataForSentericaints' });
          break;
        default:
          break;
      }
    } else {
      const organismParam = getURLparam('organism');
      if (organismParam) {
        dispatch(setOrganism(organismParam));
      }
    }
  }, [organism]);

  function getURLparam(param) {
    const fragment = window.location.hash;

    if (fragment.includes('?')) {
      const queryString = fragment.split('?')[1];
      const params = new URLSearchParams(queryString);
      return params.get(param);
    }

    return null;
  }

  useEffect(() => {
    if (yearsForFilter.length > 0) {
      dispatch(setTimeInitial(yearsForFilter[0]));
      dispatch(setActualTimeInitial(yearsForFilter[0]));
      setCurrentTimeInitial(yearsForFilter[0]);
      dispatch(setTimeFinal(yearsForFilter[yearsForFilter.length - 1]));
      dispatch(setActualTimeFinal(yearsForFilter[yearsForFilter.length - 1]));
      setCurrentTimeFinal(yearsForFilter[yearsForFilter.length - 1]);
    }
  }, [yearsForFilter]);

  // This useEffect is called everytime the main filters are changed, it does not need to read the csv file again.
  // It filters accordingly to the filters give. Is also called when the reset button is pressed.
  useEffect(() => {
    if (canFilterData) {
      updateDataOnFilters();
    }
  }, [
    canFilterData,
    // canGetData,
    // dataset,
    // actualTimeInitial,
    // actualTimeFinal,
    // actualCountry,
    // convergenceGroupVariable,
    // convergenceColourVariable,
  ]);

  async function updateDataOnFilters() {
    if (organism === 'kpneumo' && convergenceGroupVariable !== currentConvergenceGroupVariable) {
      setCurrentConvergenceGroupVariable(convergenceGroupVariable);

      const convergenceData = await getStoreOrGenerateData(
        `${organism}_convergence`,
        async () => {
          const storeData = await getItems(organism);

          const dt = getConvergenceData({
            data: storeData,
            groupVariable: convergenceGroupVariable,
            colourVariable: convergenceGroupVariable,
          });
          return {
            name: `${convergenceGroupVariable}_${convergenceGroupVariable}`,
            colourVariables: dt.colourVariables,
            data: dt.data,
          };
        },
        false,
      );

      dispatch(setConvergenceColourPallete(generatePalleteForGenotypes(convergenceData.colourVariables)));
      dispatch(setMaxSliderValueCM(convergenceData.colourVariables.length));
      dispatch(setConvergenceData(convergenceData.data));
    } else {
      const storeData = await getItems(organism);

      const filters = filterData({
        data: storeData,
        dataset,
        actualTimeInitial,
        actualTimeFinal,
        organism,
        actualCountry,
        selectedLineages,
        actualRegion,
        economicRegions,
      });

      const filteredCountries =
        actualRegion === 'All'
          ? countriesForFilter
          : actualCountry !== 'All'
          ? [actualCountry]
          : economicRegions[actualRegion];
      const filteredData = filters.data.filter((x) =>
        filteredCountries.includes(getCountryDisplayName(x.COUNTRY_ONLY)),
      );

      dispatch(setActualGenomes(filters.genomesCount));
      dispatch(setActualGenotypes(filters.genotypesCount));
      dispatch(setListPMID(filters.listPMID));
      dispatch(setMapData(getMapData({ data: filters.data, items: countriesForFilter, organism })));
      dispatch(setMapRegionData(getMapData({ data: filters.data, items: economicRegions, organism, type: 'region' })));

      const genotypesData = getGenotypesData({
        data: filteredData,
        genotypes: genotypesForFilter,
        organism,
        years: yearsForFilter,
        countries: countriesForFilter,
        regions: economicRegions,
        dataForGeographic: filters.data,
      });
      dispatch(setGenotypesDrugsData(genotypesData.genotypesDrugsData));
      dispatch(setFrequenciesGraphSelectedGenotypes(genotypesData.genotypesDrugsData.slice(0, 5).map((x) => x.name)));
      dispatch(setGenotypesDrugClassesData(genotypesData.genotypesDrugClassesData));
      dispatch(setCountriesYearData(genotypesData.countriesDrugClassesData));
      dispatch(setRegionsYearData(genotypesData.regionsDrugClassesData));

      const yearsData = getYearsData({
        data: filteredData,
        years: yearsForFilter,
        organism,
      });
      dispatch(setGenotypesYearData(yearsData.genotypesData));
      dispatch(setDrugsYearData(yearsData.drugsData));
      dispatch(setGenotypesAndDrugsYearData(yearsData.genotypesAndDrugsData));

      if (organism === 'kpneumo') {
        const KODiversityData = getKODiversityData({ data: filteredData });
        dispatch(setKODiversityData(KODiversityData));

        const convergenceData = await getStoreOrGenerateData(`${organism}_convergence`, () => {
          const dt = getConvergenceData({
            data: filteredData,
            groupVariable: convergenceGroupVariable,
            colourVariable: convergenceGroupVariable,
          });
          return {
            name: `${convergenceGroupVariable}_${convergenceGroupVariable}`,
            colourVariables: dt.colourVariables,
            data: dt.data,
          };
        });
        dispatch(setConvergenceColourPallete(generatePalleteForGenotypes(convergenceData.colourVariables)));
        dispatch(setMaxSliderValueCM(convergenceData.colourVariables.length));
        dispatch(setConvergenceData(convergenceData.data));
      }

      if (['styphi', 'kpneumo'].includes(organism)) {
        if (currentTimeInitial !== actualTimeInitial || currentTimeFinal !== actualTimeFinal) {
          const { drugsData: drugsDataC } = getDrugsCountriesData({
            data: filteredData,
            items: countriesForFilter,
          });
          dispatch(setDrugsCountriesData(drugsDataC));

          const { drugsData: drugsDataR } = getDrugsCountriesData({
            data: filteredData,
            items: economicRegions,
            type: 'region',
          });
          dispatch(setDrugsRegionsData(drugsDataR));
        }
      }
    }

    dispatch(setCanFilterData(false));
  }

  useEffect(() => {
    const fetchDataAndFilter = async () => {
      try {
        const data = await getItems(organism);
        if (data.length > 0) {
          const filters = filterBrushData({
            data,
            dataset,
            actualCountry,
            starttimeGD,
            endtimeGD,
            starttimeDRT,
            endtimeDRT,
            starttimeRDT,
            endtimeRDT,
          });
          dispatch(setActualGenomesGD(filters.genomesCountGD));
          dispatch(setActualGenomesDRT(filters.genomesCountDRT));
          dispatch(setActualGenomesRDT(filters.genomesCountRDT));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDataAndFilter();
  }, [dataset, starttimeGD, endtimeGD, starttimeDRT, endtimeDRT, starttimeRDT, endtimeRDT]);

  return (
    <>
      <MainLayout>
        <Note />
        <Map />
        <ContinentGraphs />
        {/* <SelectCountry /> */}
        <Graphs />
        <DownloadData />
        {/* <Footer /> */}
        <ResetButton data={data} />
      </MainLayout>
      <FloatingGlobalFilters />
    </>
  );
};
