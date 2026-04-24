/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { loadOrganismQuickly } from '../../utils/quickPaginationFix';
import { DownloadData } from '../Elements/DownloadData';
import { Map } from '../Elements/Map';
import { Note } from '../Elements/Note';
import { MainLayout } from '../Layout';
// import optimizedDataService from '../../services/optimizedDataService'; // Unused import
import { useIndexedDB } from '../../context/IndexedDBContext';
import {
  setActualCountry,
  setActualGenomes,
  setActualGenotypes,
  setActualRegion,
  setActualTimeFinal,
  setActualTimeInitial,
  setAvailableDrugs,
  setCanFilterData,
  setEconomicRegions,
  setGenotypesForFilter,
  setGenotypesForFilterDynamic,
  setKOForFilterDynamic,
  setListPMID,
  setLoadingData,
  setOrganism,
  setPathovar,
  setPMID,
  setSelectedLineages,
  setSerotype,
  setTimeFinal,
  setTimeInitial,
  setTotalGenomes,
  setTotalGenotypes,
  setYears,
  setYearsCompleteListToShowInGlobalFilter,
} from '../../stores/slices/dashboardSlice.ts';
import {
  setActualGenomesDRT,
  setActualGenomesGD,
  setActualGenomesKOT,
  setActualGenomesRDT,
  setNgmast,
  setNgMastDrugClassesData,
} from '../../stores/slices/graphSlice';
import {
  setBubbleHeatmapGraphVariable,
  setBubbleKOHeatmapGraphVariable,
  setBubbleKOYAxisType,
  setBubbleMarkersHeatmapGraphVariable,
  setBubbleMarkersYAxisType,
  setCgSTYearData,
  setCollapses,
  setConvergenceColourPallete,
  setConvergenceColourVariable,
  setConvergenceData,
  setConvergenceGroupVariable,
  setCountriesForFilter,
  setCountriesYearData,
  setCurrentSliderValue,
  setCurrentSliderValueCM,
  setCurrentSliderValueKOT,
  setCurrentSliderValueRD,
  setDeterminantsGraphDrugClass,
  setDeterminantsGraphView,
  setDistributionGraphVariable,
  setDistributionGraphView,
  setDrugResistanceGraphView,
  setDrugsCountriesData,
  setDrugsRegionsData,
  setDrugsYearData,
  setFrequenciesGraphSelectedGenotypes,
  setFrequenciesGraphView,
  setGenotypesAndDrugsYearData,
  setGenotypesDrugClassesData,
  setGenotypesDrugsData,
  setGenotypesYearData,
  setKODiversityData,
  setKOTrendsGraphPlotOption,
  setKOTrendsGraphView,
  setKOYearsData,
  setMaxSliderValueCM,
  setRawOrganismData,
  setRegionsYearData,
  setSublineagesYearData,
  setTrendsGraphDrugClass,
  setTrendsGraphView,
} from '../../stores/slices/graphSlice.ts';
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
import { generatePalleteForGenotypes } from '../../util/colorHelper';
import {
  defaultDrugsForDrugResistanceGraphNG,
  defaultDrugsForDrugResistanceGraphST,
  drugClassesNG,
  drugsECOLI,
  drugsKP,
  drugsSA,
  drugsSP,
  getDrugClasses,
  markersDrugsKP,
  markersDrugsSH,
} from '../../util/drugs';
import { isProduction } from '../../util/env';
import { getContinentGraphCard } from '../../util/graphCards';
import { AMRInsights } from '../Elements/AMRInsights';
import { ContinentGraphs } from '../Elements/ContinentGraphs';
import { FloatingGlobalFilters } from '../Elements/FloatingGlobalFilters';
import GenotypeLoadingIndicator from '../Elements/GenotypeLoadingIndicator';
import { Graphs } from '../Elements/Graphs';
import { ResetButton } from '../Elements/ResetButton/ResetButton';
import {
  filterBrushData,
  filterData,
  getConvergenceData,
  getCountryDisplayName,
  getDrugsCountriesData,
  getGenotypesData,
  getKOYearsData,
  getMapData,
  getYearsData,
} from './filters';

// The optimized data service is already imported as an instance
// No need to create a new instance

/**
 * DashboardPage - Main dashboard component for AMRnet application
 *
 * This component manages the entire dashboard interface including:
 * - Organism data loading and processing
 * - Map visualization and data filtering
 * - Graph generation and display
 * - State management for filters and selections
 *
 * Features:
 * - Progressive data loading for large datasets
 * - IndexedDB caching for performance
 * - Organism-specific configurations
 * - Real-time data filtering and updates
 *
 * @component
 * @example
 * return (
 *   <DashboardPage />
 * )
 */
export const DashboardPage = () => {
  const [data, setData] = useState([]);
  const [currentConvergenceGroupVariable, setCurrentConvergenceGroupVariable] = useState('cgST');
  // const [currentConvergenceColourVariable, setCurrentConvergenceColourVariable] = useState('DATE');
  const [currentTimeInitial, setCurrentTimeInitial] = useState('');
  const [currentTimeFinal, setCurrentTimeFinal] = useState('');
  const isApplyingFilters = useRef(false);
  // In-memory cache of the full organism dataset. Populated by getInfoFromData so that
  // updateDataOnFilters can skip the IndexedDB read on every filter change.
  const cachedOrganismData = useRef({ key: null, data: [] });
  const { t } = useTranslation();

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
  const colourPattern = useAppSelector(state => state.dashboard.colourPattern);
  const endtimeGD = useAppSelector(state => state.graph.endtimeGD);
  const starttimeGD = useAppSelector(state => state.graph.starttimeGD);
  const endtimeDRT = useAppSelector(state => state.graph.endtimeDRT);
  const starttimeDRT = useAppSelector(state => state.graph.starttimeDRT);
  const starttimeRDT = useAppSelector(state => state.graph.starttimeRDT);
  const endtimeRDT = useAppSelector(state => state.graph.endtimeRDT);
  const startTimeKOT = useAppSelector(state => state.graph.startTimeKOT);
  const endTimeKOT = useAppSelector(state => state.graph.endTimeKOT);
  const NGMAST = useAppSelector(state => state.graph.NGMAST);
  const genotypesAndDrugsYearData = useAppSelector(state => state.graph.genotypesAndDrugsYearData);

  // Add missing variables
  const mapView = useAppSelector(state => state.map.mapView);

  /**
   * Get info either from indexedDB or mongoDB
   *
   * @param {string} storeName - Name of the data store
   * @param {Function} handleGetData - Function to retrieve data if not cached
   * @param {boolean} clearStore - Whether to clear the store before adding new data
   * @param {boolean} backgroundWrite - When true, write to IndexedDB asynchronously without blocking the return.
   *   Use for large organism stores where cross-session caching matters but blocking the caller is not worth it.
   * @returns {Promise<any>} Retrieved or generated data
   */
  async function getStoreOrGenerateData(storeName, handleGetData, clearStore = true, backgroundWrite = false) {
    // Prefer cached data from IndexedDB when available
    try {
      if (await hasItems(storeName)) {
        const storeData = await getItems(storeName);
        // Return cached immediately for all stores, including convergence
        // Convergence consumers can pick needed object from array
        if (Array.isArray(storeData) && storeData.length > 0) {
          // If this is a convergence store we previously saved as [object],
          // unwrap and return the single object for callers that expect an object.
          if (storeName.includes('convergence')) {
            return storeData[0];
          }

          return storeData;
        }
      }
    } catch (e) {
      console.warn(`[IDB] Cache check failed for ${storeName}:`, e);
    }

    // NOTE: getInfoFromIndexedDB is implemented as a top-level helper below

    const organismData = await handleGetData();

    // If the handler already processed & stored pages into IndexedDB, it returns a sentinel
    // so we must NOT call bulkAddItems again with that sentinel.
    if (organismData === '__PROCESSED_FROM_IDB__') {
      return organismData;
    }

    const writePayload = storeName.includes('convergence') ? [organismData] : organismData;
    if (backgroundWrite) {
      // Fire-and-forget: don't block the caller. Cross-session cache will be populated in background.
      bulkAddItems(storeName, writePayload, clearStore).catch(e =>
        console.warn(`[IDB] background write failed for ${storeName}:`, e),
      );
    } else {
      try {
        await bulkAddItems(storeName, writePayload, clearStore);
      } catch (e) {
        console.warn(`[IDB] bulkAddItems failed for ${storeName}:`, e);
      }
    }

    return organismData;
  }

  // Helper to process organism data already stored in IndexedDB (used by paginated handlers)
  async function getInfoFromIndexedDB(storeName, organism) {
    try {
      const allItems = await getItems(storeName);
      const regions = await getStoreOrGenerateData(
        'unr',
        async () => {
          // Fetch UNR regions list from API (consistent with other data-load paths)
          return (await axios.get('/api/getUNR')).data;
        },
        false,
      );

      await getInfoFromData(allItems, regions);
    } catch (error) {
      console.error('Error in getInfoFromIndexedDB:', error);
      throw error;
    }
  }

  /**
   * Process and initialize data for a specific organism
   *
   * This function is called once after CSV data is loaded and sets up all the static
   * and dynamic data that the organism needs for visualization including:
   * - Genotype, country, and temporal filtering options
   * - Map data generation for countries and regions
   * - Drug resistance and convergence analysis
   * - Color palettes and visualization settings
   *
   * @param {Array} responseData - Raw organism data from CSV/API
   * @param {Array} regions - Geographic regions data
   * @returns {Promise<void>}
   */
  async function getInfoFromData(responseData, regions) {
    console.time('[getInfoFromData] total');
    const dataLength = Array.isArray(responseData) ? responseData.length : 0;

    // Cache the full dataset so updateDataOnFilters can avoid re-reading IndexedDB.
    cachedOrganismData.current = { key: organism, data: responseData };

    // Store raw data in Redux for AMR Insights graphs (GeneMap, QRDR, Serotype)
    dispatch(setRawOrganismData(Array.isArray(responseData) ? responseData : []));

    console.timeLog && console.timeLog('[getInfoFromData] total', 'start');
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

    // senterica stores MLST_Achtman instead of GENOTYPE — map it. Updated to GENOTYPE 04/26
    // sentericaints already has a pre-computed GENOTYPE field (e.g. 'iTYM ST19-L1') so skip it.
    if (organism === 'senterica') {
      try {
        const sampleSize = Math.min(responseData.length, 1000);
        let found = false;
        for (let i = 0; i < sampleSize; i++) {
          const r = responseData[i];
          if (r && r['GENOTYPE'] && `${r['GENOTYPE']}`.trim() !== '') {
            found = true;
            break;
          }
        }
        if (found) {
          responseData.forEach(r => {
            if (r && (r['GENOTYPE'] || r['GENOTYPE'] === 0)) {
              r.GENOTYPE = r['GENOTYPE'];
            }
          });
        }
      } catch (e) {
        console.warn('Error checking GENOTYPE mapping:', e);
      }
    }

    // Get mapped values
    const genotypesSet = new Set();
    const ngmastSet = new Set();
    const yearsSet = new Set();
    const countriesSet = new Set();
    const PMIDSet = new Set();
    const pathovarSet = new Set();
    const serotypeSet = new Set();

    responseData.forEach(x => {
      // country
      const country = getCountryDisplayName(x.COUNTRY_ONLY);
      if (country && country !== ' ' && country !== '') {
        countriesSet.add(country);
      }

      // genotype
      const genotypeKey = 'GENOTYPE';
      if (genotypeKey in x) {
        const g = x[genotypeKey];
        // Accept numeric 0 as a valid genotype value. Only skip null/undefined/empty-string. Fix the Total Genotype issue where many rows have GENOTYPE=0.
        if (g !== null && g !== undefined && `${g}`.trim() !== '') {
          genotypesSet.add(String(g));
        }
      }

      // year
      if (x.DATE && x.DATE !== '') {
        yearsSet.add(x.DATE);
      }

      // others
      if ('NG-MAST TYPE' in x) ngmastSet.add(x['NG-MAST TYPE']);
      if ('PMID' in x && x['PMID'] && x['PMID'] !== '') {
        PMIDSet.add(x['PMID']);
      }

      // pathovar and serotype
      if (['sentericaints'].includes(organism)) {
        if (x.seqsero2 && x.seqsero2 !== '') {
          pathovarSet.add(x.seqsero2);
        }
      }
      if (['ecoli', 'shige', 'decoli'].includes(organism)) {
        if (x.Pathovar && x.Pathovar !== '') {
          pathovarSet.add(x.Pathovar);
        }
      }
      if (['senterica'].includes(organism)) {
        if (x.seqsero2 && x.seqsero2 !== '') {
          pathovarSet.add(x.seqsero2);
        }
      }
      if (['decoli', 'ecoli', 'shige'].includes(organism)) {
        if (x.Serotype && x.Serotype !== '') {
          serotypeSet.add(x.Serotype);
        }
      }
      if (organism === 'strepneumo') {
        if (x.Serotype && x.Serotype !== '') {
          serotypeSet.add(x.Serotype);
        }
      }
    });

    // Diagnostics: check for missing or unexpected GENOTYPE values
    let missingGenotypeCount = 0;
    const genotypeExamples = new Set();
    for (let i = 0; i < Math.min(responseData.length, 5000); i++) {
      const row = responseData[i];
      if (!row) continue;
      if (!row.GENOTYPE || row.GENOTYPE === '') missingGenotypeCount++;
      else genotypeExamples.add(row.GENOTYPE?.toString());
    }

    console.time('[getInfoFromData] post-scan');
    console.timeEnd('[getInfoFromData] post-scan');
    console.log(
      `📊 [getInfoFromData] ${organism} - dataLength=${dataLength}, sampleChecked=${Math.min(responseData.length, 5000)}, missingGenotypeCount=${missingGenotypeCount}, genotypeExamplesSample=${Array.from(genotypeExamples).slice(0, 5)}`,
    );

    if (genotypeExamples.size <= 2 && dataLength > 100 && ['ecoli', 'senterica'].includes(organism)) {
      console.warn(
        `⚠️ [getInfoFromData] ${organism} has very few genotype values in the first 5k rows — dumping a small sample for inspection.`,
      );
      console.log('Sample rows (0..10):', responseData.slice(0, 10));
      if (organism === 'senterica' && responseData.length > 0) {
        console.log('🔍 Field names in first row:', Object.keys(responseData[0]));
      }
    }

    let genotypes = Array.from(genotypesSet).filter(Boolean);

    // If no GENOTYPE values found (common for Salmonella / senterica), try to auto-detect
    if (genotypes.length === 0 && responseData.length > 0) {
      try {
        console.warn(`🕵️ [getInfoFromData] No 'GENOTYPE' values detected for ${organism}, attempting auto-detect`);
        const sampleSize = Math.min(responseData.length, 5000);
        const fieldCounts = {};
        for (let i = 0; i < sampleSize; i++) {
          const row = responseData[i];
          if (!row || typeof row !== 'object') continue;
          Object.keys(row).forEach(k => {
            if (!fieldCounts[k]) fieldCounts[k] = new Set();
            const v = row[k];
            if (v !== null && v !== undefined && `${v}`.trim() !== '') fieldCounts[k].add(`${v}`);
          });
        }

        // Convert sets to sizes, filter out obvious non-genotype fields
        const excludeFields = new Set(['ID', 'id', '_id']);

        // If there is any field that looks like an MLST field, prefer it
        const mlstCandidate = Object.keys(fieldCounts).find(k => /mlst/i.test(k));
        const fieldSizes = Object.entries(fieldCounts)
          .map(([k, s]) => ({ k, size: s.size }))
          .filter(f => !excludeFields.has(f.k) && f.size > 1)
          // Exclude fields that are almost-unique per row (likely an identifier)
          .filter(f => f.size < Math.max(2, Math.floor(sampleSize * 0.9)))
          .sort((a, b) => b.size - a.size);

        if (mlstCandidate && fieldCounts[mlstCandidate] && fieldCounts[mlstCandidate].size > 1) {
          fieldSizes.unshift({ k: mlstCandidate, size: fieldCounts[mlstCandidate].size });
        }

        if (fieldSizes.length > 0) {
          const top = fieldSizes[0];
          console.log(`🕵️ [getInfoFromData] Auto-detected genotype-like field: ${top.k} (unique=${top.size})`);
          // Re-populate genotypesSet from this field
          for (let i = 0; i < responseData.length; i++) {
            const r = responseData[i];
            if (!r) continue;
            const v = r[top.k];
            if (v !== null && v !== undefined && `${v}`.trim() !== '') genotypesSet.add(`${v}`);
          }
        } else {
          console.warn(`🕵️ [getInfoFromData] Auto-detect found no suitable genotype-like field for ${organism}`);
        }
      } catch (e) {
        console.error('Error during genotype auto-detect:', e);
      }

      // refresh genotypes array safely (avoid push.apply with very large arrays)
      genotypes = Array.from(genotypesSet).filter(Boolean);
    }
    const ngmast = Array.from(ngmastSet);
    const years = Array.from(yearsSet).filter(Boolean);
    const countries = Array.from(countriesSet).filter(Boolean);
    const PMID = Array.from(PMIDSet).filter(Boolean);
    const pathovar = Array.from(pathovarSet).filter(Boolean);
    const serotype = Array.from(serotypeSet).filter(Boolean);

    // Sort values
    genotypes.sort((a, b) => a.localeCompare(b));
    ngmast.sort((a, b) => a.localeCompare(b));
    years.sort();
    countries.sort();
    pathovar.sort();
    serotype.sort();

    if (pathovar.length > 0) {
      dispatch(setSelectedLineages(pathovar));
    }
    if (organism === 'kpneumo') {
      dispatch(setSelectedLineages(['ESBL+', 'CARB+']));
    }

    // Set values
    dispatch(setTotalGenotypes(genotypes.length));
    dispatch(setActualGenotypes(genotypes.length));
    dispatch(setGenotypesForFilter(genotypes));
    dispatch(setYears(years));
    dispatch(setYearsCompleteListToShowInGlobalFilter(years));
    dispatch(setCountriesForFilter(countries));
    dispatch(setPMID(PMID));
    dispatch(setNgmast(ngmast));
    dispatch(setPathovar(pathovar));
    dispatch(setSerotype(serotype));

    // Set available drugs based on organism
    const organismDrugMap = {
      styphi: defaultDrugsForDrugResistanceGraphST,
      ngono: defaultDrugsForDrugResistanceGraphNG,
      kpneumo: drugsKP,
      senterica: drugsECOLI,
      sentericaints: drugsECOLI,
      ecoli: drugsECOLI,
      decoli: drugsECOLI,
      shige: drugsECOLI,
      saureus: drugsSA,
      strepneumo: drugsSP,
    };

    const availableDrugs = organismDrugMap[organism] || [];
    dispatch(setAvailableDrugs(availableDrugs));

    // Set regions
    Object.keys(ecRegions).forEach(key => {
      ecRegions[key] = ecRegions[key].filter(country => countries.includes(country)).sort();

      if (ecRegions[key].length === 0) {
        delete ecRegions[key];
      }
    });

    dispatch(setEconomicRegions(ecRegions));
    console.time('[getInfoFromData] heavy');
    await Promise.all([
      // Get map data
      getStoreOrGenerateData(`${organism}_map_v3`, async () =>
        getMapData({ data: responseData, items: countries, organism }),
      ).then(mapData => {
        dispatch(setMapData(mapData));
        dispatch(setMapDataNoPathotype(mapData));
      }),

      // Get regions data
      getStoreOrGenerateData(`${organism}_map_regions_v3`, async () =>
        getMapData({ data: responseData, items: ecRegions, organism, type: 'region' }),
      ).then(mapData => {
        dispatch(setMapRegionData(mapData));
        dispatch(setMapRegionDataNoPathotype(mapData));
      }),

      // Get genotypes data
      // Use versioned key for organisms with marker-level genotype breakdown to bust stale cache
      getStoreOrGenerateData(`${organism}_genotype_v4`, () => {
        const dt = getGenotypesData({
          data: responseData,
          genotypes,
          organism,
          years,
          countries,
          regions: ecRegions,
          pathotypes: pathovar,
          serotypes: serotype,
          ngmast,
        });
        return [
          dt.genotypesDrugsData,
          dt.genotypesDrugClassesData,
          dt.countriesDrugClassesData,
          dt.regionsDrugClassesData,
          dt.ngMastDrugClassesData,
        ];
      }).then(
        ([
          genotypesDrugsData,
          genotypesDrugClassesData,
          countriesDrugClassesData,
          regionsDrugClassesData,
          ngMastDrugClassesData,
        ]) => {
          const safeGenotypesDrugsData = Array.isArray(genotypesDrugsData) ? genotypesDrugsData : [];
          dispatch(setGenotypesDrugsData(safeGenotypesDrugsData));
          dispatch(setFrequenciesGraphSelectedGenotypes(safeGenotypesDrugsData.slice(0, 5).map(x => x.name)));
          dispatch(setGenotypesDrugClassesData(genotypesDrugClassesData));
          dispatch(setCountriesYearData(countriesDrugClassesData));
          dispatch(setRegionsYearData(regionsDrugClassesData));
          dispatch(setNgMastDrugClassesData(ngMastDrugClassesData));
        },
      ),

      // Get ngmast data
      // organism === 'ngono'
      //   ? getStoreOrGenerateData(`${organism}_ngmast`, () => {
      // const dt = getNgmastData({ data: responseData, ngmast, organism });
      //       return [dt.ngmastDrugData, dt.ngmastDrugClassesData];
      //     }).then(([ngmastDrugData, ngmastDrugClassesData]) => {
      //       dispatch(setNgmastDrugsData(ngmastDrugData));
      //       dispatch(setCustomDropdownMapViewNG(ngmastDrugData.slice(0, 1).map(x => x.name)));
      //     })
      //   : Promise.resolve(),

      // Get years data (v2: new drug column format for ecoli-like organisms)
      getStoreOrGenerateData(`${organism}_years_v3`, () => {
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
          dt.uniqueNGMAST,
          dt.NGMASTData,
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
          uniqueNGMAST,
          NGMASTData,
        ]) => {
          const safeGenotypesData = Array.isArray(genotypesData) ? genotypesData : [];
          const safeDrugsData = Array.isArray(drugsData) ? drugsData : [];
          const safeGenotypesAndDrugsData =
            genotypesAndDrugsData && typeof genotypesAndDrugsData === 'object' ? genotypesAndDrugsData : {};
          const safeUniqueGenotypes = Array.isArray(uniqueGenotypes) ? uniqueGenotypes : [];

          dispatch(setGenotypesYearData(safeGenotypesData));
          dispatch(setDrugsYearData(safeDrugsData));
          dispatch(setGenotypesAndDrugsYearData(safeGenotypesAndDrugsData));
          dispatch(setGenotypesForFilterDynamic(safeUniqueGenotypes));
          // Only set color palette for non-paginated organisms
          // Paginated organisms (kpneumo, decoli, ecoli) will have their color palette
          // set by the progressiveGenotypeLoader after all data is processed
          // let paletteSource = genotypes.slice(0, 100);

          // if (organism === 'senterica') {
          //   paletteSource = uniqueGenotypes;
          // }
          // dispatch(setColorPallete(generatePalleteForGenotypes(uniqueGenotypes)));

          if (organism === 'kpneumo') {
            dispatch(setCgSTYearData(cgSTData));
            dispatch(setSublineagesYearData(sublineageData));
            // dispatch(setColorPalleteCgST(generatePalleteForGenotypes(uniqueCgST)));
            // dispatch(setColorPalleteSublineages(generatePalleteForGenotypes(uniqueSublineages)));
          } else if (organism === 'ngono') {
            dispatch(setCgSTYearData(NGMASTData));
            // dispatch(setColorPalleteCgST(generatePalleteForGenotypes(uniqueNGMAST)));
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
            // const colorPalleteKO = {
            //   O_locus: generatePalleteForGenotypes(uniqueKO['O_locus']),
            //   K_locus: generatePalleteForGenotypes(uniqueKO['K_locus']),
            //   O_type: generatePalleteForGenotypes(uniqueKO['O_type']),
            // };
            // dispatch(setColorPalleteKO(colorPalleteKO));
          })
        : Promise.resolve(),

      // Get drugs carb and esbl data for countries
      // Use versioned cache key for organisms with marker-level breakdown to bust stale cache
      // !['styphi', 'kpneumo'].includes(organism)
      getStoreOrGenerateData(
        `${organism}_drugs_countries_v4`,
        () => {
          const { drugsData } = getDrugsCountriesData({
            data: responseData,
            items: countries,
            organism,
          });
          return [drugsData];
        },
      ).then(([drugsData]) => {
        dispatch(setDrugsCountriesData(drugsData));
      }),
      // : Promise.resolve(),

      // Get drugs carb and esbl data for regions
      // ['styphi', 'kpneumo'].includes(organism)
      getStoreOrGenerateData(
        `${organism}_drugs_regions_v4`,
        () => {
          const { drugsData } = getDrugsCountriesData({
            data: responseData,
            items: ecRegions,
            type: 'region',
            organism,
          });
          return [drugsData];
        },
      ).then(([drugsData]) => {
        dispatch(setDrugsRegionsData(drugsData));
      }),
      // : Promise.resolve(),

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
            // Safely handle convergenceData and its colourVariables
            if (
              convergenceData &&
              Array.isArray(convergenceData.colourVariables) &&
              convergenceData.colourVariables.length > 0
            ) {
              // dispatch(
              //   setConvergenceColourPallete(
              //     generatePalleteForGenotypes(convergenceData.colourVariables, convergenceGroupVariable, colourPattern), // Generate pallete for convergence Year dropdown
              //   ),
              // );
              dispatch(setMaxSliderValueCM(convergenceData.colourVariables.length));
              dispatch(setConvergenceData(convergenceData.data));
            } else {
              // Ensure we have safe defaults
              dispatch(setMaxSliderValueCM(0));
              dispatch(setConvergenceData([]));
            }
          })
        : Promise.resolve(),
    ]);
    console.timeEnd('[getInfoFromData] heavy');
    console.timeEnd('[getInfoFromData] total');
  }

  /**
   * Load organism data using pagination to prevent browser freezing
   *
   * This method is optimized for large datasets (kpneumo, ecoli, decoli)
   * that can cause browser performance issues when loaded all at once.
   *
   * @param {string} organism - Organism identifier (e.g., 'kpneumo', 'ecoli')
   * @returns {Promise<void>}
   */
  async function getDataWithPagination(organism) {
    dispatch(setLoadingData(true));
    const startTime = performance.now();

    try {
      const organismData = await loadOrganismQuickly(organism, message => {
        // Progress message logging removed for production
      });

      // Store organism data in IndexedDB
      await bulkAddItems(organism, organismData);

      // Get regions data
      const regions = await getStoreOrGenerateData('unr', async () => {
        return (await axios.get('/api/getUNR')).data;
      });

      // Seed essential UI quickly with a small sample to avoid freezing
      try {
        const sample = Array.isArray(organismData) ? organismData.slice(0, 1000) : [];
        if (sample.length > 0) {
          await loadEssentialGraphData(sample, organism, regions);
        }
      } catch (e) {
        console.warn('[QUICK SEED] loadEssentialGraphData failed:', e);
      }

      // Process the data (full)
      await getInfoFromData(organismData, regions);

      // Set organism-specific configurations
      dispatch(setDataset('All'));
      setOrganismSpecificConfig(organism, true); // true = isPaginated
      // Enable filtering pipeline so graphs update on initial/tab load
      dispatch(setCanFilterData(true));

      const endTime = performance.now();
    } catch (error) {
      console.error(`Error loading ${organism}:`, error);
      // Fallback to original method
      const endpoint =
        organism === 'kpneumo' ? 'getDataForKpneumo' : organism === 'ecoli' ? 'getDataForEcoli' : 'getDataForDEcoli';
      getData({ storeName: organism, endpoint });
    } finally {
      dispatch(setLoadingData(false));
    }
  }

  // Quick fix for freezing organisms using pagination
  async function getDataQuick(organism) {
    dispatch(setLoadingData(true));
    const startTime = performance.now();

    try {
      console.log(`🚀 [QUICK FIX] Starting quick load for ${organism}`);

      let organismData = null;
      let metadata = null;

      const result = await getStoreOrGenerateData(
        organism,
        async () => {
          console.log(`🌐 [CLIENT] Fetching from loadOrganismQuickly`);
          const apiStartTime = performance.now();

          const response = await loadOrganismQuickly(organism, message => {
            console.log(`⏳ [QUICK FIX] ${message}`);
          });

          const apiEndTime = performance.now();
          const apiDuration = Math.round(apiEndTime - apiStartTime);
          const dataSize = JSON.stringify(response).length;

          console.log(
            `📈 [CLIENT] API Response: ${apiDuration}ms, ${Math.round(dataSize / 1024)}KB, ${response.data.length} records`,
          );

          return response;
        },
        true,
        true,
      ); // clearStore=true, backgroundWrite=true

      // Extract data and metadata from result
      if (result && typeof result === 'object' && result.data) {
        // Result is { data: [...], metadata: {...} }
        organismData = result.data;
        metadata = result.metadata;
      } else {
        // Fallback for legacy format
        organismData = result;
        metadata = null;
      }

      // CRITICAL FIX: Store organism data in IndexedDB (was missing)
      // console.log(`💾 [QUICK FIX] Storing ${organism} data in IndexedDB (${organismData.length} records)`);
      // await bulkAddItems(organism, organismData);

      // Get regions data
      const regions = await getStoreOrGenerateData('unr', async () => {
        return (await axios.get('/api/getUNR')).data;
      });

      // Seed essential UI quickly with a small sample to avoid freezing
      try {
        const sample = Array.isArray(organismData) ? organismData.slice(0, 1000) : [];
        if (sample.length > 0) {
          await loadEssentialGraphData(sample, organism, regions);
        }
      } catch (e) {
        console.warn('[QUICK SEED] loadEssentialGraphData failed:', e);
      }

      // Process the data (full)
      await getInfoFromData(organismData, regions);

      // Set organism configs
      dispatch(setDataset('All'));
      setOrganismSpecificConfig(organism, true); // true = isPaginated

      // CRITICAL: Initialize filter values before enabling filter pipeline
      // Use server-provided metadata if available (much faster), otherwise compute from data
      let years = [];
      let countries = [];

      if (metadata && metadata.years && metadata.countries) {
        years = metadata.years;
        countries = metadata.countries;
        console.log(`⚡ [QUICK FIX] Using server metadata: ${years.length} years, ${countries.length} countries`);
      } else {
        // Fallback: compute from data (slower but handles all organisms)
        years = Array.from(
          new Set((Array.isArray(organismData) ? organismData : []).map(x => x.DATE).filter(Boolean)),
        ).sort();
        countries = Array.from(
          new Set((Array.isArray(organismData) ? organismData : []).map(x => x.COUNTRY_ONLY).filter(Boolean)),
        ).sort();
        console.log(`⏳ [QUICK FIX] Computed from data: ${years.length} years, ${countries.length} countries`);
      }

      if (years.length > 0) {
        dispatch(setActualTimeInitial(years[0]));
        dispatch(setActualTimeFinal(years[years.length - 1]));
      }

      if (countries.length > 0) {
        dispatch(setActualCountry(countries.length > 0 ? 'All' : ''));
        dispatch(setActualRegion('All'));
      }

      // Enable filtering pipeline so graphs update on initial/tab load
      dispatch(setCanFilterData(true));

      const endTime = performance.now();
      console.log(`✅ [QUICK FIX] ${organism} loaded in ${Math.round(endTime - startTime)}ms`);
    } catch (error) {
      console.error(`❌ [QUICK FIX] Error loading ${organism}:`, error);
      // Fallback to original
      const endpointMap = {
        kpneumo: 'getDataForKpneumo',
        ecoli: 'getDataForEcoli',
        decoli: 'getDataForDEcoli',
        ngono: 'getDataForNgono',
        saureus: 'getDataForSaureus',
        strepneumo: 'getDataForStrepneumo',
      };
      const endpoint = endpointMap[organism];
      if (endpoint) {
        getData({ storeName: organism, endpoint });
      }
    } finally {
      dispatch(setLoadingData(false));
    }
  }

  // Optimized data loading for ngono - FULL DATASET (entire collection)
  async function getDataOptimized({ storeName, endpoint }) {
    dispatch(setLoadingData(true));

    try {
      // Load the ENTIRE collection for ngono - no limits, no chunking
      const response = await axios.get(`/api/${endpoint}`, {
        timeout: 120000, // 2 minute timeout for very large datasets
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      const fullData = response.data; // Complete dataset

      // Store the complete dataset in IndexedDB
      await bulkAddItems(storeName, fullData);

      // Get regions data
      const regions = await getStoreOrGenerateData('unr', async () => {
        return (await axios.get('/api/getUNR')).data;
      });

      // Process the ENTIRE dataset at once (as required by ngono)
      await getInfoFromData(fullData, regions);

      // Set organism configurations
      dispatch(setDataset('All'));
      setOrganismSpecificConfig(storeName, false); // Not paginated - full dataset
    } catch (error) {
      // Fallback to original method if optimized loading fails
      getData({ storeName, endpoint });
    } finally {
      dispatch(setLoadingData(false));
    }
  }

  // Progressive data loading to prevent browser freezing
  async function getDataProgressive(organism) {
    const clientStartTime = performance.now();
    dispatch(setLoadingData(true));

    try {
      console.log(`� [PROGRESSIVE] Starting progressive load for ${organism}`);

      // Temporary placeholder - ProgressiveDataLoader not implemented
      const ProgressiveDataLoader = class {
        async loadOrganismData() {
          throw new Error('Progressive loading not implemented yet');
        }
      };

      const loader = new ProgressiveDataLoader();

      await loader.loadOrganismData(organism, {
        onProgress: progress => {
          console.log(`⏳ [PROGRESSIVE] ${progress.stage}: ${progress.message} (${progress.percentage}%)`);

          // Update UI with partial data as it loads
          if (progress.data) {
            if (progress.data.mapData) {
              // Load map data immediately - DISABLED: getMapData function call parameters mismatch
              /*
              const mapData = getMapData({
                data: progress.data.mapData,
                mapView: mapView,
                genotypesForFilter: genotypesForFilter,
                drugsForFilter: drugsForFilter,
                actualTimeInitial: actualTimeInitial,
                actualTimeFinal: actualTimeFinal,
                actualCountry: actualCountry,
                actualRegion: actualRegion,
                actualDataset: actualDataset,
                sampleSizeThreshold: sampleSizeThreshold
              });
              dispatch(setMapData(mapData));
              */
              console.log(`🗺️ [PROGRESSIVE] Map data updated with ${progress.data.mapData.length} records`);
            }

            if (progress.data.partialData) {
              // Update filters and UI with partial data
              const currentData = progress.data.partialData;
              updateFiltersWithData(currentData);
              console.log(`� [PROGRESSIVE] UI updated with ${currentData.length} records`);
            }
          }
        },

        onComplete: async result => {
          console.log(`✅ [PROGRESSIVE] Complete! ${result.totalRecords} records loaded`);

          // Get regions data
          const regions = await getStoreOrGenerateData('unr', async () => {
            return (await axios.get('/api/getUNR')).data;
          });

          // Final data processing
          await getInfoFromData(result.data, regions);

          const clientEndTime = performance.now();
          const totalDuration = Math.round(clientEndTime - clientStartTime);
          console.log(`✅ [PROGRESSIVE] Total loading time for ${organism}: ${totalDuration}ms`);
        },

        onError: error => {
          console.error(`❌ [PROGRESSIVE] Error loading ${organism}:`, error);
          // Fallback to original loading method
          console.log(`🔄 [PROGRESSIVE] Falling back to original loading method...`);
          getData({ storeName: organism, endpoint: getEndpointForOrganism(organism) });
        },
      });

      // Set organism-specific configurations
      dispatch(setDataset('All'));
      setOrganismSpecificConfig(organism, false); // false = not paginated
    } catch (error) {
      console.error(`❌ [PROGRESSIVE] Error in progressive loading:`, error);
      // Fallback to original method
      getData({ storeName: organism, endpoint: getEndpointForOrganism(organism) });
    } finally {
      dispatch(setLoadingData(false));
    }
  }

  // Helper function to get endpoint for organism
  function getEndpointForOrganism(organism) {
    const endpoints = {
      styphi: 'getDataForSTyphi',
      kpneumo: 'optimized/getDataForKpneumo',
      ngono: 'getDataForNgono',
      ecoli: 'optimized/getDataForEcoli',
      decoli: 'optimized/getDataForDEcoli',
      shige: 'getDataForShige',
      senterica: 'getDataForSenterica',
      sentericaints: 'getDataForSentericaints',
    };
    return endpoints[organism] || 'getDataForSTyphi';
  }

  // Helper function to update filters with partial data
  function updateFiltersWithData(data) {
    if (!data || data.length === 0) return;

    // Extract basic filter data
    const countries = [...new Set(data.map(item => item.Country || item.COUNTRY_ONLY).filter(Boolean))];
    const years = [...new Set(data.map(item => item.Year || item.DATE).filter(Boolean))];
    const genotypes = [...new Set(data.map(item => item.GENOTYPE).filter(Boolean))];

    // Update Redux state with partial data
    dispatch(setCountriesForFilter(countries.sort()));
    dispatch(setYears(years.sort()));
    dispatch(setGenotypesForFilter(genotypes.sort()));
  }

  /**
   * Configure organism-specific settings for visualization
   *
   * Sets appropriate defaults for each organism including:
   * - Map view mode (sample count vs resistance prevalence)
   * - Drug resistance graph selections
   * - Determinants graph drug classes
   *
   * @param {string} organism - Organism identifier
   * @param {boolean} isPaginated - Whether organism uses paginated loading
   */
  function setOrganismSpecificConfig(organism, isPaginated = false) {
    dispatch(setMapView('Resistance prevalence'));

    switch (organism) {
      case 'styphi':
        if (!isPaginated) {
          dispatch(setDrugResistanceGraphView(defaultDrugsForDrugResistanceGraphST));
        }
        dispatch(setDeterminantsGraphDrugClass('Ciprofloxacin'));
        dispatch(setTrendsGraphDrugClass('Ciprofloxacin'));
        dispatch(setBubbleMarkersYAxisType('Ciprofloxacin'));
        break;
      case 'kpneumo':
        // dispatch(setDatasetKP('All'));
        // Don't set drug selection for paginated organisms - let auto-selection effect handle it
        if (!isPaginated) {
          dispatch(setDrugResistanceGraphView(markersDrugsKP));
          dispatch(setTrendsGraphView('percentage'));
          dispatch(setConvergenceGroupVariable('cgST'));
          dispatch(setConvergenceColourVariable('cgST'));
          dispatch(setCurrentConvergenceGroupVariable('cgST'));
          dispatch(setBubbleMarkersYAxisType(markersDrugsKP[0]));
        }
        dispatch(setTrendsGraphDrugClass('ESBL'));
        dispatch(setDistributionGraphView('percentage'));
        dispatch(setDistributionGraphVariable('GENOTYPE'));
        dispatch(setKOTrendsGraphView('percentage'));
        dispatch(setKOTrendsGraphPlotOption('K_locus'));
        dispatch(setBubbleHeatmapGraphVariable('GENOTYPE'));
        dispatch(setBubbleKOHeatmapGraphVariable('GENOTYPE'));
        dispatch(setBubbleMarkersHeatmapGraphVariable('GENOTYPE'));
        dispatch(setBubbleKOYAxisType('K_locus'));
        // dispatch(setBubbleMarkersYAxisType('K_locus'));
        dispatch(setDeterminantsGraphDrugClass('Carbapenems'));
        dispatch(setTrendsGraphDrugClass('Carbapenems'));
        dispatch(setBubbleMarkersYAxisType('Carbapenems'));
        break;
      case 'ngono':
        if (!isPaginated) {
          dispatch(setDrugResistanceGraphView(defaultDrugsForDrugResistanceGraphNG));
        }
        dispatch(setDeterminantsGraphDrugClass('Azithromycin'));
        dispatch(setTrendsGraphDrugClass('Azithromycin'));
        dispatch(setTrendsGraphView('percentage'));
        dispatch(setBubbleMarkersYAxisType(drugClassesNG[0]));
        dispatch(setDistributionGraphVariable('GENOTYPE'));
        dispatch(setBubbleMarkersHeatmapGraphVariable('GENOTYPE'));
        dispatch(setBubbleHeatmapGraphVariable('GENOTYPE'));
        break;
      case 'sentericaints':
      case 'senterica':
        if (!isPaginated) {
          dispatch(setDrugResistanceGraphView(drugsECOLI));
        }
        dispatch(setDeterminantsGraphDrugClass(getDrugClasses(organism)[0]));
        dispatch(setTrendsGraphDrugClass(getDrugClasses(organism)[0]));
        dispatch(setBubbleMarkersYAxisType(getDrugClasses(organism)[0]));
        break;
      case 'ecoli':
        dispatch(setTrendsGraphDrugClass('Aminoglycosides'));
        dispatch(setBubbleMarkersYAxisType(markersDrugsSH[0]));
        dispatch(setDeterminantsGraphDrugClass('Aminoglycosides'));
        break;
      case 'decoli':
        dispatch(setDrugResistanceGraphView(drugsECOLI));
        dispatch(setDeterminantsGraphDrugClass('Aminoglycosides'));
        dispatch(setTrendsGraphDrugClass('Aminoglycosides'));
        dispatch(setBubbleMarkersYAxisType(markersDrugsSH[0]));
        break;
      case 'shige':
        // Default drug-class pickers for the AMR Markers / AMR by Genotype
        // panels need to fire unconditionally — those panels have no
        // auto-selection useEffect, so without this they'd render empty
        // when the user lands on shige. Same pattern as kpneumo above.
        dispatch(setDeterminantsGraphDrugClass('Aminoglycosides'));
        dispatch(setTrendsGraphDrugClass('Aminoglycosides'));
        dispatch(setBubbleMarkersYAxisType(markersDrugsSH[0]));
        // The AMR Trends line chart has its own auto-select effect for
        // paginated organisms — skip the synchronous drug-list dispatch
        // for shige when paginated to avoid a double-set / flicker race.
        if (!isPaginated) {
          dispatch(setDrugResistanceGraphView(drugsECOLI));
        }
        break;
      case 'saureus':
        dispatch(setDrugResistanceGraphView(drugsSA));
        dispatch(setDeterminantsGraphDrugClass(getDrugClasses(organism)[0]));
        dispatch(setTrendsGraphDrugClass(getDrugClasses(organism)[0]));
        dispatch(setBubbleMarkersYAxisType(drugsSA.filter(x => x !== 'Pansusceptible')[0]));
        break;
      case 'strepneumo':
        dispatch(setDrugResistanceGraphView(drugsSP));
        dispatch(setDeterminantsGraphDrugClass(getDrugClasses(organism)[0]));
        dispatch(setTrendsGraphDrugClass(getDrugClasses(organism)[0]));
        dispatch(setBubbleMarkersYAxisType(drugsSP.filter(x => x !== 'Pansusceptible')[0]));
        break;
      default:
        break;
    }
  }

  // Original getData function kept as fallback
  async function getData({ storeName, endpoint }) {
    const clientStartTime = performance.now();
    dispatch(setLoadingData(true));

    try {
      console.log(`📊 [CLIENT] Loading data for ${storeName} using endpoint: ${endpoint}...`);

      // backgroundWrite=true: IDB write is fire-and-forget so getInfoFromData can start immediately.
      const organismData = await getStoreOrGenerateData(
        storeName,
        async () => {
          console.log(`🌐 [CLIENT] Fetching from API: /api/${endpoint}`);
          const apiStartTime = performance.now();

          // First request (page 1 or full response)
          const firstResp = await axios.get(`/api/${endpoint}`, {
            params: { page: 1, limit: 5000 },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          });

          const apiEndTime = performance.now();
          const apiDuration = Math.round(apiEndTime - apiStartTime);
          const payload = firstResp.data;

          // If the endpoint is paginated (returns { data, pagination }), fetch and store all pages
          if (payload && payload.pagination && Array.isArray(payload.data)) {
            const { pagination } = payload;
            const pageLimit = pagination.limit || 5000;
            const totalPages = pagination.totalPages || Math.ceil((pagination.totalDocuments || 0) / pageLimit);

            // Store first chunk (clear store)
            if (Array.isArray(payload.data)) {
              // eslint-disable-next-line no-await-in-loop
              await bulkAddItems(storeName, payload.data, true);
            }

            // Fetch remaining pages sequentially to avoid resource pressure
            if (totalPages > 1) {
              for (let p = 2; p <= totalPages; p++) {
                // eslint-disable-next-line no-await-in-loop
                const r = await axios.get(`/api/${endpoint}`, {
                  params: { page: p, limit: pageLimit },
                  maxContentLength: Infinity,
                  maxBodyLength: Infinity,
                });

                if (r && r.data && Array.isArray(r.data.data)) {
                  const chunk = r.data.data;
                  // eslint-disable-next-line no-await-in-loop
                  await bulkAddItems(storeName, chunk, false);
                }
              }
            }

            console.log(
              `📈 [CLIENT] API Response (paginated -> stored): ${apiDuration}ms, pages fetched: ${totalPages}`,
            );

            // Signal that data was processed from IndexedDB and no further in-memory processing is required
            return '__PROCESSED_FROM_IDB__';
          }

          // Non-paginated handling: normalize payload to array
          const organismData = Array.isArray(payload)
            ? payload
            : payload && Array.isArray(payload.data)
              ? payload.data
              : [];
          const dataSize = JSON.stringify(payload).length;
          const recordCount = Array.isArray(payload)
            ? payload.length
            : payload && Array.isArray(payload.data)
              ? payload.data.length
              : 0;

          console.log(
            `📈 [CLIENT] API Response: ${apiDuration}ms, ${Math.round(dataSize / 1024)}KB, ${recordCount} records`,
          );

          return organismData;
        },
        true,
        true,
      ); // clearStore=true, backgroundWrite=true

      if (organismData === '__PROCESSED_FROM_IDB__') {
        // Data was fetched and stored into IndexedDB by the handler. Process from IDB in batches.
        const regions = await getStoreOrGenerateData('unr', async () => {
          return (await axios.get('/api/getUNR')).data;
        });

        const dataProcessingStart = performance.now();
        await getInfoFromIndexedDB(storeName, organism);
        const dataProcessingEnd = performance.now();
        console.log(`⚙️ [CLIENT] Data processing from IDB: ${Math.round(dataProcessingEnd - dataProcessingStart)}ms`);

        // Set organism-specific configurations for paginated flow
        dispatch(setDataset('All'));
        setOrganismSpecificConfig(organism, true); // true = paginated
        // Enable filtering pipeline so graphs update on initial/tab load
        dispatch(setCanFilterData(true));
      } else {
        const regions = await getStoreOrGenerateData('unr', async () => {
          return (await axios.get('/api/getUNR')).data;
        });

        // Seed essential UI quickly with a small sample to avoid freezing
        try {
          const sample = Array.isArray(organismData) ? organismData.slice(0, 1000) : [];
          if (sample.length > 0) {
            await loadEssentialGraphData(sample, storeName, regions);
          }
        } catch (e) {
          console.warn('[QUICK SEED] loadEssentialGraphData failed:', e);
        }

        const dataProcessingStart = performance.now();
        await getInfoFromData(organismData, regions);
        const dataProcessingEnd = performance.now();

        console.log(`⚙️ [CLIENT] Data processing: ${Math.round(dataProcessingEnd - dataProcessingStart)}ms`);

        // Set organism-specific configurations
        dispatch(setDataset('All'));
        setOrganismSpecificConfig(organism, false); // false = not paginated
        // Enable filtering pipeline so graphs update on initial/tab load
        dispatch(setCanFilterData(true));
      }

      const clientEndTime = performance.now();
      const totalDuration = Math.round(clientEndTime - clientStartTime);
      console.log(`✅ [CLIENT] Total loading time for ${storeName}: ${totalDuration}ms`);
    } catch (error) {
      console.error('❌ [CLIENT] Error in getData:', error);
    } finally {
      dispatch(setLoadingData(false));
    }
  }

  // Load essential graph data for immediate display (lightweight operations)
  const loadEssentialGraphData = async (partialData, organism, ecRegions) => {
    try {
      console.log(`📊 Loading essential graph data with ${partialData.length} records...`);

      // Generate basic map data from first chunk
      const mapData = getMapData({
        data: partialData,
        items: Object.keys(ecRegions),
        organism,
      });

      dispatch(setMapData(mapData));
      dispatch(setMapDataNoPathotype(mapData));

      // Generate basic region map data
      const mapRegionData = getMapData({
        data: partialData,
        items: ecRegions,
        organism,
        type: 'region',
      });

      dispatch(setMapRegionData(mapRegionData));
      dispatch(setMapRegionDataNoPathotype(mapRegionData));

      console.log(`✅ Essential graph data loaded`);
    } catch (error) {
      console.error('Error in loadEssentialGraphData:', error);
    }
  };

  // This useEffect is called everytime the organism changes, it resets all data and filters and
  // call the function to read the specific organism csv
  const previousOrganism = useRef('none');
  const hasLoadedData = useRef(false);
  useEffect(() => {
    if (organism !== 'none') {
      const isOrganismChange = previousOrganism.current !== organism;
      const needsInitialLoad = !hasLoadedData.current;
      previousOrganism.current = organism;

      // Clear state only if switching organisms, not on initial mount or reopen
      if (isOrganismChange && !needsInitialLoad) {
        cachedOrganismData.current = { key: null, data: [] };
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
        // Don't clear these - let them persist until new data loads:
        // dispatch(setGenotypesYearData([]));
        // dispatch(setDrugsYearData([]));
        dispatch(setGenotypesDrugsData([]));
        dispatch(setGenotypesDrugClassesData([]));
        // dispatch(setGenotypesAndDrugsYearData({}));
        dispatch(setKODiversityData([]));
        dispatch(setConvergenceData([]));
        dispatch(setDeterminantsGraphDrugClass(''));
        // dispatch(setTrendsGraphDrugClass(''));
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

        dispatch(setBubbleMarkersHeatmapGraphVariable('GENOTYPE'));
        dispatch(setConvergenceColourPallete({}));
        // dispatch(setNgmast([]));
        dispatch(setCurrentSliderValue(20));
        dispatch(setCurrentSliderValueKOT(20));
        dispatch(setSelectedLineages([]));
        dispatch(setCurrentSliderValueRD(maxSliderValueRD));
        dispatch(setCurrentSliderValueRD(20));
        dispatch(setCurrentSliderValueCM(20));
      }

      // Mark that we've attempted to load data for this session
      hasLoadedData.current = true;

      // Always load data (on mount, organism change, or reopen) to ensure cache is loaded
      switch (organism) {
        case 'styphi':
          getData({ storeName: organism, endpoint: 'getDataForSTyphi' });
          break;
        case 'kpneumo':
          console.log('🚀 QUICK FIX: Using pagination for K. pneumoniae');
          getDataQuick(organism);
          break;
        case 'ngono':
          // NGONO requires full dataset for proper rendering - use optimized bulk loading
          getData({ storeName: organism, endpoint: 'getDataForNgono' });
          break;
        case 'ecoli':
          getDataQuick(organism);
          break;
        case 'decoli':
          getDataQuick(organism);
          break;
        case 'shige':
          getData({ storeName: organism, endpoint: 'getDataForShige' });
          break;
        case 'senterica':
          getDataQuick(organism);
          break;
        case 'sentericaints':
          getData({ storeName: organism, endpoint: 'getDataForSentericaints' });
          break;
        case 'saureus':
          getDataQuick(organism);
          break;
        case 'strepneumo':
          getDataQuick(organism);
          break;
        default:
          break;
      }

      // SAFETY FALLBACK: Always set drug options for paginated organisms
      // This ensures dropdowns have options even if data loading fails
      const organismDrugMap = {
        styphi: defaultDrugsForDrugResistanceGraphST,
        ngono: defaultDrugsForDrugResistanceGraphNG,
        kpneumo: drugsKP,
        senterica: drugsECOLI,
        sentericaints: drugsECOLI,
        ecoli: drugsECOLI,
        decoli: drugsECOLI,
        shige: drugsECOLI,
        saureus: drugsSA,
        strepneumo: drugsSP,
      };

      const fallbackDrugs = organismDrugMap[organism] || [];
      if (fallbackDrugs.length > 0) {
        console.log(`🔧 [FALLBACK] Setting fallback drugs for ${organism}:`, fallbackDrugs);
        dispatch(setAvailableDrugs(fallbackDrugs));
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

  // Ensure data is loaded when component mounts with an organism already selected
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (!initialLoadDone.current && organism !== 'none') {
      initialLoadDone.current = true;
      // Check if we need to load data for this organism
      const checkAndLoad = async () => {
        try {
          const hasCache = await hasItems(organism);
          if (hasCache) {
            console.log(`📦 Found cache for ${organism}, will load via normal flow`);
          }
        } catch (e) {
          console.warn('Cache check failed:', e);
        }
      };
      checkAndLoad();
    }
  }, []);

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
    if (isApplyingFilters.current) {
      console.debug('[Dashboard] updateDataOnFilters: already running, skipping concurrent call');
      return;
    }
    isApplyingFilters.current = true;
    console.debug('[Dashboard] updateDataOnFilters: start');
    // Use in-memory cache when available — avoids reading all records from IndexedDB on every filter change.
    const storeData =
      cachedOrganismData.current.key === organism && cachedOrganismData.current.data.length > 0
        ? cachedOrganismData.current.data
        : await getItems(organism);

    if (organism === 'kpneumo' && convergenceGroupVariable !== currentConvergenceGroupVariable) {
      setCurrentConvergenceGroupVariable(convergenceGroupVariable);

      const convergenceData = await getStoreOrGenerateData(
        `${organism}_convergence`,
        async () => {
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

      if (
        convergenceData &&
        Array.isArray(convergenceData.colourVariables) &&
        convergenceData.colourVariables.length > 0
      ) {
        dispatch(
          setConvergenceColourPallete(
            generatePalleteForGenotypes(convergenceData.colourVariables, convergenceGroupVariable, colourPattern),
          ),
        );
        dispatch(setMaxSliderValueCM(convergenceData.colourVariables.length));
        dispatch(setConvergenceData(convergenceData.data));
      }
    } else {
      // When all lineages are selected, pass [] so filterData treats it as "no filter"
      const effectiveLineages =
        selectedLineages?.length > 0 && selectedLineages.length < pathovarForFilter.length ? selectedLineages : [];

      const filters = filterData({
        data: storeData,
        dataset,
        datasetKP,
        actualTimeInitial,
        actualTimeFinal,
        organism,
        actualCountry,
        selectedLineages: effectiveLineages,
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
      // Update raw organism data for AMR Insights graphs with filtered data
      dispatch(setRawOrganismData(filteredData));
      const uniqueDates = [...new Set(filteredData.map(x => x.DATE))].sort(); // Get unique years from the filtered data
      dispatch(setYears(uniqueDates)); // to Set the years for the Global Filters based on Datasets and lineages
      dispatch(setActualGenomes(filters.genomesCount));
      dispatch(setActualGenotypes(filters.genotypesCount));
      // console.log('genotypes.length filtered', filters.genotypesCount);

      dispatch(setListPMID(filters.listPMID));

      // Build query params for server-side /yearly aggregation endpoint.
      // When a country/region filter is active, extract the raw COUNTRY_ONLY values from
      // already-filtered IndexedDB records so the server can apply the same restriction
      // without needing the client-side name-normalisation function.
      const rawCountriesParam =
        actualRegion !== 'All' || actualCountry !== 'All'
          ? [...new Set(filteredData.map(x => x.COUNTRY_ONLY))].join(',')
          : null;

      const aggParams = {
        ...(actualTimeInitial && { dateFrom: actualTimeInitial }),
        ...(actualTimeFinal && { dateTo: actualTimeFinal }),
        ...(dataset !== 'All' && { dataset }),
        ...(rawCountriesParam && { countries: rawCountriesParam }),
        // Only send lineage params when a specific subset is selected (not all).
        // When "All" is selected, selectedLineages === pathovarForFilter (all values); skip filter.
        ...(['ecoli', 'decoli', 'shige'].includes(organism) &&
          selectedLineages?.length > 0 &&
          selectedLineages.length < pathovarForFilter.length && { pathotype: selectedLineages.join(',') }),
        ...(organism === 'sentericaints' &&
          selectedLineages?.length > 0 &&
          selectedLineages.length < pathovarForFilter.length && { serotype: selectedLineages.join(',') }),
      };

      // senterica: IndexedDB records lack GENOTYPE (stored as GENOTYPE — map it here
      // so getYearsData sees the correct GENOTYPE values.
      // sentericaints: GENOTYPE is already stored in the collection; no mapping needed.
      if (organism === 'senterica' && filteredData.length > 0) {
        filteredData.forEach(r => {
          if (r && !r.GENOTYPE && (r['GENOTYPE'] || r['GENOTYPE'] === 0)) {
            r.GENOTYPE = r['GENOTYPE'];
          }
        });
      }

      // Prepare data in parallel - back to Promise.all for speed
      const [
        mapData,
        mapRegionData,
        genotypesData,
        yearlyServerResponse, // server-side agg (drugsData, genotypesData, uniqueGenotypes)
        genotypesServerResponse, // server-side agg (genotypesDrugsData)
        yearsData, // client-side getYearsData (genotypesAndDrugsData + kp/ng-specific)
        koData,
        // koDiversityData,
        convergenceData,
        drugsCountriesData,
        drugsRegionsData,
      ] = await Promise.all([
        Promise.resolve(getMapData({ data: filters.data, items: countriesForFilter, organism })),
        Promise.resolve(getMapData({ data: filters.data, items: economicRegions, organism, type: 'region' })),
        Promise.resolve(
          getGenotypesData({
            data: filteredData,
            genotypes: genotypesForFilter,
            organism,
            years: yearsForFilter,
            countries: countriesForFilter,
            regions: economicRegions,
            dataForGeographic: filters.data,
            pathotypes: pathovarForFilter,
            serotypes: serotypeForFilter,
            ngmast: NGMAST,
          }),
        ),
        // Server-side aggregation: faster drug/genotype yearly counts (MongoDB pipeline).
        // Resolves to null on error so the client result below is used as fallback.
        axios.get(`/api/agg/${organism}/yearly`, { params: aggParams }).catch(err => {
          console.warn(`[agg/${organism}/yearly] Server call failed, using client data:`, err.message);
          return null;
        }),
        // Server-side aggregation: per-genotype drug counts for AMR BY GENOTYPE chart.
        // Resolves to null on error so the client getGenotypesData result is used as fallback.
        axios.get(`/api/agg/${organism}/genotypes`, { params: aggParams }).catch(err => {
          console.warn(`[agg/${organism}/genotypes] Server call failed, using client data:`, err.message);
          return null;
        }),
        // Client-side getYearsData: still required for genotypesAndDrugsData (AMR MARKER TRENDS)
        // and organism-specific yearly fields (kpneumo cgST/Sublineage, ngono NG-MAST TYPE).
        // Runs in parallel with the server call — no extra wall-clock cost.
        Promise.resolve(
          getYearsData({
            data: filteredData,
            years: yearsForFilter,
            organism,
            getUniqueGenotypes: true,
          }),
        ),
        organism === 'kpneumo' && Array.isArray(yearsForFilter) && yearsForFilter.length > 0
          ? Promise.resolve(getKOYearsData({ data: filteredData, years: yearsForFilter }))
          : Promise.resolve({ KOYearsData: [], uniqueKO: { O_locus: [], K_locus: [], O_type: [] } }),
        // organism === 'kpneumo' ? Promise.resolve(getKODiversityData({ data: filteredData })) : Promise.resolve([]),
        organism === 'kpneumo'
          ? Promise.resolve(
              (() => {
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
              })(),
            )
          : Promise.resolve({ data: [], colourVariables: [] }),
        // Geographic Comparisons (BubbleGeographicGraph), RadarProfile, and the
        // ATB correlation plot compare countries/regions against each other and
        // must always see the FULL set of countries — not just those inside the
        // summary plots' geo selection. Use `filters.data` here (which applies
        // time/dataset/datasetKP/lineages filters) instead of `filteredData`
        // (which additionally restricts to actualCountry / actualRegion).
        Promise.resolve(getDrugsCountriesData({ data: filters.data, items: countriesForFilter, organism })),
        Promise.resolve(
          getDrugsCountriesData({ data: filters.data, items: economicRegions, type: 'region', organism }),
        ),
      ]);

      // Prefer server results for drugsData / genotypesData / uniqueGenotypes when valid.
      // Fall back to client getYearsData results when the server call failed or returned empty data.
      const serverYd = yearlyServerResponse?.data;
      const serverOk = Array.isArray(serverYd?.drugsData) && serverYd.drugsData.length > 0;

      const finalGenotypesData = serverOk ? serverYd.genotypesData : (yearsData.genotypesData ?? []);
      // Prefer server drugsData when available (matches the fallback pattern
      // used for genotypesData / uniqueGenotypes above). The server-side
      // MongoDB aggregation is substantially faster than client-side yearly
      // aggregation for large organisms (senterica 500k+ genomes, ecoli 300k+).
      const finalDrugsData = serverOk ? serverYd.drugsData : (yearsData.drugsData ?? []);
      const finalUniqueGenotypes = serverOk ? serverYd.uniqueGenotypes : (yearsData.uniqueGenotypes ?? []);

      // Dispatch map data
      dispatch(setMapData(mapData));
      dispatch(setMapRegionData(mapRegionData));
      if (
        getContinentGraphCard(t).organisms.includes(organism) &&
        (currentTimeInitial !== actualTimeInitial || currentTimeFinal !== actualTimeFinal)
      ) {
        dispatch(setMapDataNoPathotype(mapData));
        dispatch(setMapRegionDataNoPathotype(mapRegionData));
      }

      // Prefer server result for genotypesDrugsData (AMR BY GENOTYPE).
      // Server returns { name, count, [drug]: n } — map count → totalCount for FrequenciesGraph.
      // Fall back to client getGenotypesData result when the server call failed or returned empty.
      const serverGd = genotypesServerResponse?.data?.genotypesData;
      const serverGdOk = Array.isArray(serverGd) && serverGd.length > 0;
      const finalGenotypesDrugsData = serverGdOk
        ? serverGd.map(({ count, ...rest }) => ({ ...rest, totalCount: count }))
        : (genotypesData.genotypesDrugsData ?? []);

      // Dispatch genotypes and time-based data
      dispatch(setGenotypesDrugsData(finalGenotypesDrugsData));
      dispatch(setFrequenciesGraphSelectedGenotypes(finalGenotypesDrugsData.slice(0, 5).map(x => x.name)));
      dispatch(setGenotypesDrugClassesData(genotypesData.genotypesDrugClassesData));
      dispatch(setCountriesYearData(genotypesData.countriesDrugClassesData));
      dispatch(setRegionsYearData(genotypesData.regionsDrugClassesData));
      dispatch(setNgMastDrugClassesData(genotypesData.ngMastDrugClassesData));

      // Dispatch yearly trends data (server preferred, client fallback)
      dispatch(setGenotypesYearData(finalGenotypesData));
      dispatch(setDrugsYearData(finalDrugsData));
      dispatch(setGenotypesForFilterDynamic(finalUniqueGenotypes));
      // genotypesAndDrugsData powers AMR MARKER TRENDS — always use client result
      dispatch(setGenotypesAndDrugsYearData(yearsData.genotypesAndDrugsData));

      // Dispatch KO and convergence data (kpneumo only)
      if (organism === 'kpneumo') {
        dispatch(setCgSTYearData(yearsData.cgSTData));
        dispatch(setSublineagesYearData(yearsData.sublineageData));

        dispatch(setKOYearsData(koData.KOYearsData));
        dispatch(setKOForFilterDynamic(koData.uniqueKO));
        // dispatch(setKODiversityData(koDiversityData));

        if (
          convergenceData &&
          Array.isArray(convergenceData.colourVariables) &&
          convergenceData.colourVariables.length > 0
        ) {
          dispatch(
            setConvergenceColourPallete(
              generatePalleteForGenotypes(convergenceData.colourVariables, convergenceGroupVariable, colourPattern),
            ),
          );
          dispatch(setMaxSliderValueCM(convergenceData.colourVariables.length));
          dispatch(setConvergenceData(convergenceData.data));
        }
      } else if (organism === 'ngono') {
        dispatch(setCgSTYearData(yearsData.NGMASTData));
      }

      // Dispatch drug countries resistance data for all organisms.
      // Without this, ecoli/decoli/shige/senterica/sentericaints were stuck
      // on the initial-load snapshot (computed from the raw unfiltered data),
      // so time / dataset / lineage filter changes never reached the
      // Geographic Comparisons / Radar / ATB-correlation plots.
      dispatch(setDrugsCountriesData(drugsCountriesData.drugsData));
      dispatch(setDrugsRegionsData(drugsRegionsData.drugsData));
    }

    dispatch(setCanFilterData(false));
    isApplyingFilters.current = false;
    console.debug('[Dashboard] updateDataOnFilters: end');
  }

  /* COMMENTED DUE TO RETURNING AN ERROR ON THE CONSOLE EVERYTIME THE WEBSITE IS OPEN, NEED TO DO A RE-EVALUATION
  AND FIX THE FUNCTIONS THAT USED THE VARIABLES SET HERE
  THOSE VALUES ARE BEING USED ON Graphs.js ON THE Download Chart as PNG BUTTON AND ON DownloadData.js TO GENERATE
  THE PDF */
  useEffect(() => {
    if (organism === 'none') {
      // To handle the error caused by this function (mentioned in above comment above)
      return; // due to passing "organism === 'none'"
    }
    const fetchDataAndFilter = async () => {
      try {
        const data =
          cachedOrganismData.current.key === organism && cachedOrganismData.current.data.length > 0
            ? cachedOrganismData.current.data
            : await getItems(organism);
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
        {/* AMR Insights tab is dev-only until validated for production. */}
        {!isProduction() && <AMRInsights />}
        {/* <ContinentPathotypeGraphs /> */}
        <DownloadData />
        {/* <Footer /> */}
        <ResetButton data={data} />
      </MainLayout>
      <FloatingGlobalFilters />
      <GenotypeLoadingIndicator />
    </>
  );
};
