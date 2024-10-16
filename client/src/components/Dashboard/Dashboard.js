/* eslint-disable react-hooks/exhaustive-deps */
import { MainLayout } from '../Layout';
import { Note } from '../Elements/Note';
import { Map } from '../Elements/Map';
import { Footer } from '../Elements/Footer';
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
} from '../../stores/slices/dashboardSlice.ts';
import { setDataset, setMapData, setMapView, setPosition, setIfCustom } from '../../stores/slices/mapSlice.ts';
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
  setCustomDropdownMapView,
  setCustomDropdownMapViewNG,
  setFrequenciesGraphView,
  setGenotypesAndDrugsYearData,
  setGenotypesDrugClassesData,
  setGenotypesDrugsData,
  setGenotypesDrugsData2,
  setGenotypesYearData,
  setKODiversityData,
  setKODiversityGraphView,
  setTrendsKPGraphDrugClass,
  setTrendsKPGraphView,
  setCurrentSliderValue,
  setCurrentSliderValueRD,
  setNgmast,
  setNgmastDrugsData,
} from '../../stores/slices/graphSlice.ts';
import {
  filterData,
  getYearsData,
  getMapData,
  getGenotypesData,
  getCountryDisplayName,
  getKODiversityData,
  getConvergenceData,
  getNgmastData,
} from './filters';
import { ResetButton } from '../Elements/ResetButton/ResetButton';
import { generatePalleteForGenotypes } from '../../util/colorHelper';
import { SelectCountry } from '../Elements/SelectCountry';
import { drugsKP, defaultDrugsForDrugResistanceGraphST, defaultDrugsForDrugResistanceGraphNG } from '../../util/drugs';
import { useIndexedDB } from '../../context/IndexedDBContext';

export const DashboardPage = () => {
  const [data, setData] = useState([]);
  const [currentConvergenceGroupVariable, setCurrentConvergenceGroupVariable] = useState('COUNTRY_ONLY');
  const [currentConvergenceColourVariable, setCurrentConvergenceColourVariable] = useState('DATE');

  const { hasItems, bulkAddItems, getItems } = useIndexedDB();

  const dispatch = useAppDispatch();
  const canFilterData = useAppSelector((state) => state.dashboard.canFilterData);
  const organism = useAppSelector((state) => state.dashboard.organism);
  const dataset = useAppSelector((state) => state.map.dataset);
  const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);
  const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);
  const countriesForFilter = useAppSelector((state) => state.graph.countriesForFilter);
  const yearsForFilter = useAppSelector((state) => state.dashboard.years);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const convergenceGroupVariable = useAppSelector((state) => state.graph.convergenceGroupVariable);
  const convergenceColourVariable = useAppSelector((state) => state.graph.convergenceColourVariable);
  const maxSliderValueRD = useAppSelector((state) => state.graph.maxSliderValueRD);

  // Get info either from indexedDB or mongoDB
  async function getStoreOrGenerateData(storeName, handleGetData) {
    let organismData = [];

    // Check if organism data is already in indexedDB
    const storeHasItems = await hasItems(storeName);

    // If it is then use it, if not then get it from database
    if (storeHasItems) {
      const storeData = await getItems(storeName);
      organismData = storeData;
    } else {
      organismData = await handleGetData();
      await bulkAddItems(storeName, organismData);
    }

    return organismData;
  }

  // This function is only called once, after the csv is read. It gets all the static and dynamic data
  // that came from the csv file and sets all the data the organism needs to show
  async function getInfoFromData(responseData) {
    const dataLength = responseData.length;

    dispatch(setTotalGenomes(dataLength));
    dispatch(setActualGenomes(dataLength));

    // Get mapped values
    const genotypesSet = new Set();
    const ngmastSet = new Set();
    const yearsSet = new Set();
    const countriesSet = new Set();
    const PMIDSet = new Set();

    responseData.forEach((x) => {
      genotypesSet.add(x.GENOTYPE);
      ngmastSet.add(x['NG-MAST TYPE']);
      yearsSet.add(x.DATE);
      countriesSet.add(getCountryDisplayName(x.COUNTRY_ONLY));
      PMIDSet.add(x.PMID);
    });

    const genotypes = Array.from(genotypesSet);
    const ngmast = Array.from(ngmastSet);
    const years = Array.from(yearsSet);
    const countries = Array.from(countriesSet);
    const PMID = Array.from(PMIDSet);

    // Sort values
    genotypes.sort((a, b) => a.localeCompare(b));
    years.sort();
    countries.sort();

    // Set values
    dispatch(setTotalGenotypes(genotypes.length));
    dispatch(setActualGenotypes(genotypes.length));
    if (organism === 'styphi') {
      dispatch(setGenotypesForFilter(genotypes));
    }
    dispatch(setYears(years));
    dispatch(setCountriesForFilter(countries));
    dispatch(setPMID(PMID));
    dispatch(setNgmast(ngmast));

    await Promise.all([
      // Get map data
      getStoreOrGenerateData(`${organism}_map`, async () =>
        getMapData({ data: responseData, countries, organism }),
      ).then((mapData) => {
        dispatch(setMapData(mapData));
      }),

      // Get genotypes data
      getStoreOrGenerateData(`${organism}_genotype`, () => {
        const dt = getGenotypesData({ data: responseData, genotypes, organism });
        return [dt.genotypesDrugsData, dt.genotypesDrugClassesData];
      }).then(([genotypesDrugsData, genotypesDrugClassesData]) => {
        dispatch(setGenotypesDrugsData(genotypesDrugsData));
        dispatch(setGenotypesDrugsData2(genotypesDrugsData));
        dispatch(setFrequenciesGraphSelectedGenotypes(genotypesDrugsData.slice(0, 5).map((x) => x.name)));
        dispatch(setCustomDropdownMapView(genotypesDrugsData.slice(0, 1).map((x) => x.name)));
        dispatch(setGenotypesDrugClassesData(genotypesDrugClassesData));
      }),

      // Get ngmast data
      getStoreOrGenerateData(`${organism}_ngmast`, () => {
        const dt = getNgmastData({ data: responseData, ngmast, organism });
        return [dt.ngmastDrugData, dt.ngmastDrugClassesData];
      }).then(([ngmastDrugData, ngmastDrugClassesData]) => {
        dispatch(setNgmastDrugsData(ngmastDrugData));
        dispatch(setCustomDropdownMapViewNG(ngmastDrugData.slice(0, 1).map((x) => x.name)));
      }),

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
          dispatch(setGenotypesForFilter(uniqueGenotypes));
          dispatch(setColorPallete(generatePalleteForGenotypes(uniqueGenotypes)));
        }
      }),

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
            return [dt.colourVariables, ...dt.data];
          }).then((convergenceData) => {
            const convergenceColourVariables = convergenceData.shift();
            dispatch(setConvergenceColourPallete(generatePalleteForGenotypes(convergenceColourVariables)));
            dispatch(setConvergenceData(convergenceData));
          })
        : Promise.resolve(),
    ]);
  }

  // This function gets the organism data and set specific filters accordingly to it
  async function getData({ storeName, endpoint }) {
    dispatch(setLoadingData(true));

    try {
      const organismData = await getStoreOrGenerateData(storeName, async () => {
        const response = await axios.get(`${API_ENDPOINT}filters/${endpoint}`);
        return response.data;
      });

      await getInfoFromData(organismData);

      // Set all filters that need to be set after the data has been acquired
      dispatch(setDataset('All'));
      switch (organism) {
        case 'styphi':
          dispatch(setMapView('CipNS'));
          dispatch(setDrugResistanceGraphView(defaultDrugsForDrugResistanceGraphST));
          dispatch(setDeterminantsGraphDrugClass('Ciprofloxacin NS'));
          break;
        case 'kpneumo':
          dispatch(setMapView('No. Samples'));
          dispatch(setDrugResistanceGraphView(drugsKP));
          dispatch(setDeterminantsGraphDrugClass('Carbapenems'));
          dispatch(setTrendsKPGraphDrugClass('Carbapenems'));
          dispatch(setKODiversityGraphView('K_locus'));
          dispatch(setTrendsKPGraphView('number'));
          dispatch(setConvergenceGroupVariable('COUNTRY_ONLY'));
          dispatch(setConvergenceColourVariable('DATE'));
          setCurrentConvergenceGroupVariable('COUNTRY_ONLY');
          setCurrentConvergenceColourVariable('DATE');
          break;
        case 'ngono':
          dispatch(setMapView('No. Samples'));
          dispatch(setDrugResistanceGraphView(defaultDrugsForDrugResistanceGraphNG));
          dispatch(setDeterminantsGraphDrugClass('Azithromycin'));
          break;
        case 'ecoli':
        case 'decoli':
        case 'shige':
        case 'senterica':
        case 'sentericaints':
          dispatch(setMapView('No. Samples'));
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
          determinants: false,
          distribution: false,
          drugResistance: false,
          frequencies: false,
          trendsKP: false,
          KODiversity: false,
          convergence: false,
        }),
      );
      setData([]);
      dispatch(setDataset(''));
      dispatch(setActualTimeInitial(''));
      dispatch(setActualTimeFinal(''));
      dispatch(setPosition({ coordinates: [0, 0], zoom: 1 }));
      dispatch(setActualCountry('All'));
      dispatch(setMapData([]));
      dispatch(setGenotypesYearData([]));
      dispatch(setDrugsYearData([]));
      dispatch(setGenotypesDrugsData([]));
      dispatch(setGenotypesDrugClassesData([]));
      dispatch(setGenotypesAndDrugsYearData([]));
      dispatch(setKODiversityData([]));
      dispatch(setConvergenceData([]));
      dispatch(setDeterminantsGraphDrugClass(''));
      dispatch(setTrendsKPGraphDrugClass(''));
      dispatch(setMapView(''));
      dispatch(setFrequenciesGraphView('percentage'));
      dispatch(setDeterminantsGraphView('percentage'));
      dispatch(setDistributionGraphView('number'));
      dispatch(setConvergenceColourPallete({}));
      dispatch(setIfCustom(false));
      dispatch(setNgmast([]));
      dispatch(setCurrentSliderValue(20));
      if (organism === 'ngono') dispatch(setCurrentSliderValueRD(maxSliderValueRD));
      else dispatch(setCurrentSliderValueRD(5));

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
    }
  }, [organism]);

  useEffect(() => {
    if (yearsForFilter.length > 0) {
      dispatch(setTimeInitial(yearsForFilter[0]));
      dispatch(setActualTimeInitial(yearsForFilter[0]));
      dispatch(setTimeFinal(yearsForFilter[yearsForFilter.length - 1]));
      dispatch(setActualTimeFinal(yearsForFilter[yearsForFilter.length - 1]));
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
    const storeData = await getItems(organism);

    const filters = filterData({
      data: storeData,
      dataset,
      actualTimeInitial,
      actualTimeFinal,
      organism,
      actualCountry,
    });
    const filteredData = filters.data.filter(
      (x) => actualCountry === 'All' || getCountryDisplayName(x.COUNTRY_ONLY) === actualCountry,
    );

    if (
      convergenceGroupVariable !== currentConvergenceGroupVariable ||
      convergenceColourVariable !== currentConvergenceColourVariable
    ) {
      setCurrentConvergenceColourVariable(convergenceColourVariable);

      const convergenceData = getConvergenceData({
        data: filteredData,
        groupVariable: convergenceGroupVariable,
        colourVariable: convergenceGroupVariable,
      });
      dispatch(setConvergenceColourPallete(generatePalleteForGenotypes(convergenceData.colourVariables)));
      dispatch(setConvergenceData(convergenceData.data));
    } else {
      dispatch(setActualGenomes(filters.genomesCount));
      dispatch(setActualGenotypes(filters.genotypesCount));
      dispatch(setListPMID(filters.listPMID));
      dispatch(setMapData(getMapData({ data: filters.data, countries: countriesForFilter, organism })));

      const genotypesData = getGenotypesData({
        data: filteredData,
        genotypes: genotypesForFilter,
        organism,
      });
      dispatch(setGenotypesDrugsData(genotypesData.genotypesDrugsData));
      dispatch(setFrequenciesGraphSelectedGenotypes(genotypesData.genotypesDrugsData.slice(0, 5).map((x) => x.name)));
      dispatch(setGenotypesDrugClassesData(genotypesData.genotypesDrugClassesData));

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

        const convergenceData = getConvergenceData({
          data: filteredData,
          groupVariable: convergenceGroupVariable,
          colourVariable: convergenceGroupVariable,
        });
        dispatch(setConvergenceColourPallete(generatePalleteForGenotypes(convergenceData.colourVariables)));
        dispatch(setConvergenceData(convergenceData.data));
      }
    }

    dispatch(setCanFilterData(false));
  }

  return (
    <MainLayout isHomePage>
      <Note />
      <Map />
      <SelectCountry />
      <Graphs />
      <DownloadData />
      <Footer />
      <ResetButton data={data} />
    </MainLayout>
  );
};
