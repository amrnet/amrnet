/* eslint-disable react-hooks/exhaustive-deps */
import { MainLayout } from '../Layout';
import { Note } from '../Elements/Note';
import { Map } from '../Elements/Map';
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
  setSerotype,
  setGenotypesForFilterDynamic,
  setColorPalleteCgST,
  setColorPalleteSublineages,
  setKOForFilterDynamic,
  setColorPalleteKO,
} from '../../stores/slices/dashboardSlice.ts';
import {
  setActualGenomesGD,
  setActualGenomesDRT,
  setActualGenomesRDT,
  setActualGenomesKOT,
} from '../../stores/slices/graphSlice';
import {
  setDataset,
  setDatasetKP,
  setMapData,
  setMapDataNoPathotype,
  setMapRegionData,
  setMapRegionDataNoPathotype,
  setMapView,
  setPosition,
} from '../../stores/slices/mapSlice.ts';
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
  setFrequenciesGraphView,
  setGenotypesAndDrugsYearData,
  setGenotypesDrugClassesData,
  setGenotypesDrugsData,
  setGenotypesYearData,
  setKODiversityData,
  setTrendsGraphDrugClass,
  setTrendsGraphView,
  setCurrentSliderValue,
  setCurrentSliderValueRD,
  setCurrentSliderValueCM,
  setMaxSliderValueCM,
  setDrugsCountriesData,
  setDrugsRegionsData,
  setCountriesYearData,
  setRegionsYearData,
  setCgSTYearData,
  setSublineagesYearData,
  setDistributionGraphVariable,
  setKOTrendsGraphView,
  setKOYearsData,
  setCurrentSliderValueKOT,
  setKOTrendsGraphPlotOption,
  setBubbleHeatmapGraphVariable,
  setBubbleKOHeatmapGraphVariable,
  setBubbleMarkersHeatmapGraphVariable,
  setBubbleKOYAxisType,
  setBubbleMarkersYAxisType,
} from '../../stores/slices/graphSlice.ts';
import {
  filterData,
  getYearsData,
  getMapData,
  getGenotypesData,
  getCountryDisplayName,
  getKODiversityData,
  getConvergenceData,
  getDrugsCountriesData,
  getKOYearsData,
  filterBrushData,
} from './filters';
import { ResetButton } from '../Elements/ResetButton/ResetButton';
import { generatePalleteForGenotypes } from '../../util/colorHelper';
import {
  drugsKP,
  defaultDrugsForDrugResistanceGraphST,
  defaultDrugsForDrugResistanceGraphNG,
  drugsINTS,
  markersDrugsKP,
  drugsECOLI,
} from '../../util/drugs';
import { useIndexedDB } from '../../context/IndexedDBContext';
import { ContinentGraphs } from '../Elements/ContinentGraphs';
import { FloatingGlobalFilters } from '../Elements/FloatingGlobalFilters';
import { ContinentPathotypeGraphs } from '../Elements/ContinentPathotypeGraphs';
import { continentPGraphCard } from '../../util/graphCards';

export const DashboardPage = () => {
  const [data, setData] = useState([]);
  const [currentConvergenceGroupVariable, setCurrentConvergenceGroupVariable] = useState('cgST');
  // const [currentConvergenceColourVariable, setCurrentConvergenceColourVariable] = useState('DATE');
  const [currentTimeInitial, setCurrentTimeInitial] = useState('');
  const [currentTimeFinal, setCurrentTimeFinal] = useState('');

  const { hasItems, bulkAddItems, getItems } = useIndexedDB();

  const dispatch = useAppDispatch();
  const canFilterData = useAppSelector(state => state.dashboard.canFilterData);
  const organism = useAppSelector(state => state.dashboard.organism);
  const dataset = useAppSelector(state => state.map.dataset);
  const datasetKP = useAppSelector(state => state.map.datasetKP);
  const actualTimeInitial = useAppSelector(state => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector(state => state.dashboard.actualTimeFinal);
  const actualCountry = useAppSelector(state => state.dashboard.actualCountry);
  const actualRegion = useAppSelector(state => state.dashboard.actualRegion);
  const countriesForFilter = useAppSelector(state => state.graph.countriesForFilter);
  const economicRegions = useAppSelector(state => state.dashboard.economicRegions);
  const yearsForFilter = useAppSelector(state => state.dashboard.years);
  const genotypesForFilter = useAppSelector(state => state.dashboard.genotypesForFilter);
  const pathovarForFilter = useAppSelector(state => state.dashboard.pathovar);
  const serotypeForFilter = useAppSelector(state => state.dashboard.serotype);
  const selectedLineages = useAppSelector(state => state.dashboard.selectedLineages);
  const convergenceGroupVariable = useAppSelector(state => state.graph.convergenceGroupVariable);
  // const convergenceColourVariable = useAppSelector((state) => state.graph.convergenceColourVariable);
  const maxSliderValueRD = useAppSelector(state => state.graph.maxSliderValueRD);
  const endtimeGD = useAppSelector(state => state.graph.endtimeGD);
  const starttimeGD = useAppSelector(state => state.graph.starttimeGD);
  const endtimeDRT = useAppSelector(state => state.graph.endtimeDRT);
  const starttimeDRT = useAppSelector(state => state.graph.starttimeDRT);
  const starttimeRDT = useAppSelector(state => state.graph.starttimeRDT);
  const endtimeRDT = useAppSelector(state => state.graph.endtimeRDT);
  const startTimeKOT = useAppSelector(state => state.graph.startTimeKOT);
  const endTimeKOT = useAppSelector(state => state.graph.endTimeKOT);
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
          x => x.name === `${convergenceGroupVariable}_${convergenceGroupVariable}`,
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

    regions.forEach(item => {
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
    // const ngmastSet = new Set();
    const yearsSet = new Set();
    const countriesSet = new Set();
    const PMIDSet = new Set();
    const pathovarSet = new Set();
    const serotypeSet = new Set();

    responseData.forEach(x => {
      // country
      const country = getCountryDisplayName(x.COUNTRY_ONLY);
      if (country !== ' ') countriesSet.add(country);

      // genotype
      const genotypeKey = 'GENOTYPE';
      if (genotypeKey in x) {
        genotypesSet.add(x[genotypeKey]?.toString());
      }

      // year
      yearsSet.add(x.DATE);

      // others
      // if ('NG-MAST TYPE' in x) ngmastSet.add(x['NG-MAST TYPE']);
      if ('PMID' in x) PMIDSet.add(x['PMID']);

      // pathovar and serotype
      if (['sentericaints'].includes(organism)) {
        pathovarSet.add(x.SISTR1_Serovar);
      }
      if (['ecoli', 'shige', 'decoli'].includes(organism)) {
        pathovarSet.add(x.Pathovar);
      }
      if (['senterica'].includes(organism)) {
        // pathovarSet.add(x.SeqSero2_Serovar);
        pathovarSet.add(x['SISTR1 Serovar']);
      }
      if (['decoli', 'ecoli', 'shige'].includes(organism)) {
        serotypeSet.add(x.Serotype);
      }
    });

    const genotypes = Array.from(genotypesSet);
    // const ngmast = Array.from(ngmastSet);
    const years = Array.from(yearsSet);
    const countries = Array.from(countriesSet);
    const PMID = Array.from(PMIDSet);
    const pathovar = Array.from(pathovarSet);
    const serotype = Array.from(serotypeSet);

    // Sort values
    genotypes.sort((a, b) => a.localeCompare(b));
    years.sort();
    countries.sort();
    pathovar.sort();
    serotype.sort();

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
    // dispatch(setNgmast(ngmast));
    dispatch(setPathovar(pathovar));
    dispatch(setSerotype(serotype));

    // Set regions
    Object.keys(ecRegions).forEach(key => {
      ecRegions[key] = ecRegions[key].filter(country => countries.includes(country)).sort();

      if (ecRegions[key].length === 0) {
        delete ecRegions[key];
      }
    });

    dispatch(setEconomicRegions(ecRegions));

    await Promise.all([
      // Get map data
      getStoreOrGenerateData(`${organism}_map`, async () =>
        getMapData({ data: responseData, items: countries, organism }),
      ).then(mapData => {
        dispatch(setMapData(mapData));
        dispatch(setMapDataNoPathotype(mapData));
      }),

      // Get regions data
      getStoreOrGenerateData(`${organism}_map_regions`, async () =>
        getMapData({ data: responseData, items: ecRegions, organism, type: 'region' }),
      ).then(mapData => {
        dispatch(setMapRegionData(mapData));
        dispatch(setMapRegionDataNoPathotype(mapData));
      }),

      // Get genotypes data
      getStoreOrGenerateData(`${organism}_genotype`, () => {
        const dt = getGenotypesData({
          data: responseData,
          genotypes,
          organism,
          years,
          countries,
          regions: ecRegions,
          pathotypes: pathovar,
          serotypes: serotype,
        });
        return [
          dt.genotypesDrugsData,
          dt.genotypesDrugClassesData,
          dt.countriesDrugClassesData,
          dt.regionsDrugClassesData,
        ];
      }).then(([genotypesDrugsData, genotypesDrugClassesData, countriesDrugClassesData, regionsDrugClassesData]) => {
        dispatch(setGenotypesDrugsData(genotypesDrugsData));
        dispatch(setFrequenciesGraphSelectedGenotypes(genotypesDrugsData.slice(0, 5).map(x => x.name)));
        dispatch(setGenotypesDrugClassesData(genotypesDrugClassesData));
        dispatch(setCountriesYearData(countriesDrugClassesData));
        dispatch(setRegionsYearData(regionsDrugClassesData));
      }),

      // Get ngmast data
      // organism === 'ngono'
      //   ? getStoreOrGenerateData(`${organism}_ngmast`, () => {
      //       const dt = getNgmastData({ data: responseData, ngmast, organism });
      //       return [dt.ngmastDrugData, dt.ngmastDrugClassesData];
      //     }).then(([ngmastDrugData, ngmastDrugClassesData]) => {
      //       dispatch(setNgmastDrugsData(ngmastDrugData));
      //       dispatch(setCustomDropdownMapViewNG(ngmastDrugData.slice(0, 1).map(x => x.name)));
      //     })
      //   : Promise.resolve(),

      // Get years data
      getStoreOrGenerateData(`${organism}_years`, () => {
        const dt = getYearsData({
          data: responseData,
          years,
          organism,
          getUniqueGenotypes: true,
        });
        return [
          dt.genotypesData,
          dt.drugsData,
          dt.uniqueGenotypes,
          dt.genotypesAndDrugsData,
          dt.cgSTData,
          dt.sublineageData,
          dt.uniqueCgST,
          dt.uniqueSublineages,
        ];
      }).then(
        ([
          genotypesData,
          drugsData,
          uniqueGenotypes,
          genotypesAndDrugsData,
          cgSTData,
          sublineageData,
          uniqueCgST,
          uniqueSublineages,
        ]) => {
          dispatch(setGenotypesYearData(genotypesData));
          dispatch(setDrugsYearData(drugsData));
          dispatch(setGenotypesAndDrugsYearData(genotypesAndDrugsData));
          dispatch(setGenotypesForFilterDynamic(uniqueGenotypes));

          if (organism !== 'styphi') {
            // dispatch(setGenotypesForFilter(uniqueGenotypes));
            dispatch(setColorPallete(generatePalleteForGenotypes(uniqueGenotypes)));
          }

          if (organism === 'kpneumo') {
            dispatch(setCgSTYearData(cgSTData));
            dispatch(setSublineagesYearData(sublineageData));
            dispatch(setColorPalleteCgST(generatePalleteForGenotypes(uniqueCgST)));
            dispatch(setColorPalleteSublineages(generatePalleteForGenotypes(uniqueSublineages)));
          }
        },
      ),

      ['kpneumo'].includes(organism)
        ? getStoreOrGenerateData(`${organism}_ko_years`, () => {
            const dt = getKOYearsData({ data: responseData, years });
            return [dt.KOYearsData, dt.uniqueKO];
          }).then(([KOYearsData, uniqueKO]) => {
            dispatch(setKOYearsData(KOYearsData));
            dispatch(setKOForFilterDynamic(uniqueKO));
            const colorPalleteKO = {
              O_locus: generatePalleteForGenotypes(uniqueKO['O_locus']),
              K_locus: generatePalleteForGenotypes(uniqueKO['K_locus']),
              O_type: generatePalleteForGenotypes(uniqueKO['O_type']),
            };
            dispatch(setColorPalleteKO(colorPalleteKO));
          })
        : Promise.resolve(),

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
      // organism === 'kpneumo'
      //   ? getStoreOrGenerateData(`${organism}_ko`, () => {
      //       const dt = getKODiversityData({ data: responseData });
      //       return [dt.K_locus, dt.O_locus];
      //     }).then(([K_locus, O_locus]) => {
      //       dispatch(setKODiversityData({ K_locus, O_locus }));
      //     })
      //   : Promise.resolve(),

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
          }).then(convergenceData => {
            dispatch(
              setConvergenceColourPallete(
                generatePalleteForGenotypes(convergenceData.colourVariables, convergenceGroupVariable), // Generate pallete for convergence Year dropdown
              ),
            );
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
        const response = await axios.get(`/api/filters/${endpoint}`, {
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
        return response.data;
      });

      const regions = await getStoreOrGenerateData('unr', async () => {
        return (await axios.get('/api/filters/getUNR')).data;
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
          dispatch(setDatasetKP('All'));
          dispatch(setMapView('Resistance prevalence'));
          dispatch(setDrugResistanceGraphView(drugsKP));
          dispatch(setDeterminantsGraphDrugClass('Carbapenems'));
          dispatch(setTrendsGraphDrugClass('Carbapenems'));
          dispatch(setTrendsGraphView('percentage'));
          dispatch(setConvergenceGroupVariable('cgST'));
          dispatch(setConvergenceColourVariable('cgST'));
          setCurrentConvergenceGroupVariable('cgST');
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
        case 'senterica':
          dispatch(setMapView('Resistance prevalence'));
          dispatch(setDrugResistanceGraphView(drugsINTS));
          dispatch(setDeterminantsGraphDrugClass('Aminoglycosides'));
          break;
        case 'ecoli':
        case 'decoli':
        case 'shige':
          dispatch(setMapView('Resistance prevalence'));
          dispatch(setDrugResistanceGraphView(drugsECOLI));
          dispatch(setDeterminantsGraphDrugClass('Aminoglycosides'));
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
          continentP: false,
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
      dispatch(setDatasetKP('All'));
      dispatch(setActualTimeInitial(''));
      dispatch(setActualTimeFinal(''));
      dispatch(setPosition({ coordinates: [0, 0], zoom: 1 }));
      dispatch(setActualCountry('All'));
      dispatch(setActualRegion('All'));
      dispatch(setMapData([]));
      dispatch(setMapRegionDataNoPathotype([]));
      dispatch(setMapDataNoPathotype([]));
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
      dispatch(setKOTrendsGraphView('percentage'));
      dispatch(setKOTrendsGraphPlotOption('O_locus'));
      dispatch(setDistributionGraphVariable('GENOTYPE'));
      dispatch(setBubbleHeatmapGraphVariable('GENOTYPE'));
      dispatch(setBubbleKOHeatmapGraphVariable('GENOTYPE'));
      dispatch(setBubbleKOYAxisType('O_locus'));
      dispatch(setBubbleMarkersYAxisType(markersDrugsKP[0]));
      dispatch(setBubbleMarkersHeatmapGraphVariable('GENOTYPE'));
      dispatch(setConvergenceColourPallete({}));
      // dispatch(setNgmast([]));
      dispatch(setCurrentSliderValue(20));
      dispatch(setCurrentSliderValueKOT(20));
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

      dispatch(
        setConvergenceColourPallete(
          generatePalleteForGenotypes(convergenceData.colourVariables, convergenceGroupVariable),
        ), // Generate pallete for convergence Year dropdown)),
      );
      dispatch(setMaxSliderValueCM(convergenceData.colourVariables.length));
      dispatch(setConvergenceData(convergenceData.data));
    } else {
      const storeData = await getItems(organism);

      const filters = filterData({
        data: storeData,
        dataset,
        datasetKP,
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
      const filteredData = filters.data.filter(x => filteredCountries.includes(getCountryDisplayName(x.COUNTRY_ONLY)));

      dispatch(setActualGenomes(filters.genomesCount));
      dispatch(setActualGenotypes(filters.genotypesCount));
      dispatch(setListPMID(filters.listPMID));

      const mapData = getMapData({ data: filters.data, items: countriesForFilter, organism });
      dispatch(setMapData(mapData));
      const mapRegionData = getMapData({
        data: filters.data,
        items: economicRegions,
        organism,
        type: 'region',
      });
      dispatch(setMapRegionData(mapRegionData));

      if (continentPGraphCard.organisms.includes(organism)) {
        if (currentTimeInitial !== actualTimeInitial || currentTimeFinal !== actualTimeFinal) {
          dispatch(setMapDataNoPathotype(mapData));
          dispatch(setMapRegionDataNoPathotype(mapRegionData));
        }
      }

      const genotypesData = getGenotypesData({
        data: filteredData,
        genotypes: genotypesForFilter,
        organism,
        years: yearsForFilter,
        countries: countriesForFilter,
        regions: economicRegions,
        dataForGeographic: filters.data,
        pathotypes: pathovarForFilter,
        serotypes: serotypeForFilter,
      });
      dispatch(setGenotypesDrugsData(genotypesData.genotypesDrugsData));
      dispatch(setFrequenciesGraphSelectedGenotypes(genotypesData.genotypesDrugsData.slice(0, 5).map(x => x.name)));
      dispatch(setGenotypesDrugClassesData(genotypesData.genotypesDrugClassesData));
      dispatch(setCountriesYearData(genotypesData.countriesDrugClassesData));
      dispatch(setRegionsYearData(genotypesData.regionsDrugClassesData));

      const yearsData = getYearsData({
        data: filteredData,
        years: yearsForFilter,
        organism,
        getUniqueGenotypes: true,
      });
      dispatch(setGenotypesYearData(yearsData.genotypesData));
      dispatch(setDrugsYearData(yearsData.drugsData));
      dispatch(setGenotypesAndDrugsYearData(yearsData.genotypesAndDrugsData));
      dispatch(setGenotypesForFilterDynamic(yearsData.uniqueGenotypes));

      if (organism === 'kpneumo') {
        dispatch(setCgSTYearData(yearsData.cgSTData));
        dispatch(setSublineagesYearData(yearsData.sublineageData));

        const { KOYearsData, uniqueKO } = getKOYearsData({ data: filteredData, years: yearsForFilter });
        dispatch(setKOYearsData(KOYearsData));
        dispatch(setKOForFilterDynamic(uniqueKO));

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
        dispatch(
          setConvergenceColourPallete(
            generatePalleteForGenotypes(convergenceData.colourVariables, convergenceGroupVariable),
          ), // Generate pallete for convergence Year dropdown)),
        );
        dispatch(setMaxSliderValueCM(convergenceData.colourVariables.length));
        dispatch(setConvergenceData(convergenceData.data));
      }

      if (['styphi', 'kpneumo'].includes(organism)) {
        const { drugsData: drugsDataC } = getDrugsCountriesData({
          data: filteredData,
          items: countriesForFilter,
          organism,
        });
        dispatch(setDrugsCountriesData(drugsDataC));

        const { drugsData: drugsDataR } = getDrugsCountriesData({
          data: filteredData,
          items: economicRegions,
          type: 'region',
          organism,
        });
        dispatch(setDrugsRegionsData(drugsDataR));
      }
    }

    dispatch(setCanFilterData(false));
  }

  /* COMMENTED DUO TO RETURNING AN ERROR ON THE CONSOLE EVERYTIME THE WEBSITE IS OPEN, NEED TO DO A RE-EVALUACTION
  AND FIX THE FUNCTIONS THAT USED THE VARIABLES SET HERE
  THOSE VALUES ARE BEING USED ON Graphs.js ON THE Download Chart as PNG BUTTON AND ON DownloadData.js TO GENERATE
  THE PDF */
  useEffect(() => {
    if (organism === 'none')
      // To handle the error caused by this function (mentioned in above comment above)
      return; // due to passing "organism === 'none'"
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
            startTimeKOT,
            endTimeKOT,
          });
          dispatch(setActualGenomesGD(filters.genomesCountGD));
          dispatch(setActualGenomesDRT(filters.genomesCountDRT));
          dispatch(setActualGenomesRDT(filters.genomesCountRDT));
          dispatch(setActualGenomesKOT(filters.genomesCountKOT)); // Added KOT Brush genome value based on start and end Time
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchDataAndFilter();
  }, [dataset, starttimeGD, endtimeGD, starttimeDRT, endtimeDRT, starttimeRDT, endtimeRDT, startTimeKOT, endTimeKOT]);
  return (
    <>
      <MainLayout>
        <Note />
        <Map />
        {/* <SelectCountry /> */}
        <Graphs />
        <ContinentGraphs />
        <ContinentPathotypeGraphs />
        <DownloadData />
        {/* <Footer /> */}
        <ResetButton data={data} />
      </MainLayout>
      <FloatingGlobalFilters />
    </>
  );
};
