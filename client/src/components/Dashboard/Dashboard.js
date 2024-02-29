/* eslint-disable react-hooks/exhaustive-deps */
import { MainLayout } from '../Layout';
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
  // setColorPallete,
  setGenotypesForFilter,
  setListPMID,
  setLoadingData,
  setTimeFinal,
  setTimeInitial,
  setTotalGenomes,
  setTotalGenotypes,
  setYears,
  setPMID
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
  setNgmastDrugsData
} from '../../stores/slices/graphSlice.ts';
import {
  filterData,
  getYearsData,
  getMapData,
  getGenotypesData,
  getCountryDisplayName,
  getKODiversityData,
  getConvergenceData,
  getNgmastData
} from './filters';
import { ResetButton } from '../Elements/ResetButton/ResetButton';
import { generatePalleteForGenotypes } from '../../util/colorHelper';
import { SelectCountry } from '../Elements/SelectCountry';
import { drugsKP, defaultDrugsForDrugResistanceGraphST, drugsNG, drugsEC, drugsDEC, drugsSH, drugsSE, drugsSEINTS } from '../../util/drugs';
// import countries from '../../util/countries';

export const DashboardPage = () => {
  const [data, setData] = useState([]);
  const [currentConvergenceGroupVariable, setCurrentConvergenceGroupVariable] = useState('COUNTRY_ONLY');
  const [currentConvergenceColourVariable, setCurrentConvergenceColourVariable] = useState('DATE');

  const dispatch = useAppDispatch();
  const canGetData = useAppSelector((state) => state.dashboard.canGetData);
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

  // This function is only called once, after the csv is read. It gets all the static and dynamic data
  // that came from the csv file and sets all the data the organism needs to show
  function getInfoFromData(response) {
    const responseData = response.data;
    dispatch(setTotalGenomes(responseData.length));
    dispatch(setActualGenomes(responseData.length));
    // responseData.map(x => console.log("responseData", x['NG-MAST TYPE']));
    let ngmast;
    const genotypes = [...new Set(responseData.map((x) => x.GENOTYPE))];
    ngmast = [...new Set(responseData.map((x) => x['NG-MAST TYPE']))];
    // if (organism === 'styphi') {
      genotypes.sort((a, b) => a.localeCompare(b));
      dispatch(setGenotypesForFilter(genotypes));
    if(organism === 'ngono'){
      ngmast = [...new Set(responseData.map((x) => x['NG-MAST TYPE']))];
    }

    const years = [...new Set(responseData.map((x) => x.DATE))];
    const countries = [...new Set(responseData.map((x) => getCountryDisplayName(x.COUNTRY_ONLY)))];
    const PMID = [...new Set(responseData.map((x) => x.PMID))];

    years.sort();
    countries.sort();

    dispatch(setTotalGenotypes(genotypes.length));
    dispatch(setActualGenotypes(genotypes.length));
    dispatch(setYears(years));
    dispatch(setTimeInitial(years[0]));
    dispatch(setActualTimeInitial(years[0]));
    dispatch(setTimeFinal(years[years.length - 1]));
    dispatch(setActualTimeFinal(years[years.length - 1]));
    dispatch(setCountriesForFilter(countries));
    dispatch(setPMID(PMID));

    dispatch(setMapData(getMapData({ data: responseData, countries, organism })));

    const genotypesData = getGenotypesData({ data: responseData, genotypes, organism });
    const ngmastData = getNgmastData({ data: responseData, ngmast, organism });
    dispatch(setNgmast(ngmast));
    // const genotypeDataGreaterThanZero = genotypesData.genotypesDrugsData.filter(x => x.totalCount > 0);
    dispatch(setGenotypesDrugsData(genotypesData.genotypesDrugsData));
    dispatch(setGenotypesDrugsData2(genotypesData.genotypesDrugsData));
    dispatch(setFrequenciesGraphSelectedGenotypes(genotypesData.genotypesDrugsData.slice(0, 5).map((x) => x.name)));
    // dispatch(setCustomDropdownMapView(genotypeDataGreaterThanZero.filter(x => x.totalCount >= 20).slice(0, 1).map((x) => x.name)));
    dispatch(setCustomDropdownMapView(genotypesData.genotypesDrugsData.slice(0, 1).map((x) => x.name)));
    dispatch(setGenotypesDrugClassesData(genotypesData.genotypesDrugClassesData));
    dispatch(setNgmastDrugsData(ngmastData.ngmastDrugData));
      dispatch(setCustomDropdownMapViewNG(ngmastData.ngmastDrugData.slice(0, 1).map((x) => x.name)));

    const yearsData = getYearsData({
      data: responseData,
      years,
      organism,
      getUniqueGenotypes: true
    });

    if (organism === 'kpneumo') {
      //console.log("yearsData.uniqueGenotypes", yearsData.uniqueGenotypes)
      // dispatch(setColorPallete(generatePalleteForGenotypes(yearsData.uniqueGenotypes)));
      dispatch(setGenotypesForFilter(yearsData.uniqueGenotypes));

      const KODiversityData = getKODiversityData({ data: responseData });
      dispatch(setKODiversityData(KODiversityData));

      const convergenceData = getConvergenceData({
        data: responseData,
        groupVariable: convergenceGroupVariable,
        // colourVariable: convergenceColourVariable,
        colourVariable: convergenceGroupVariable
      });
      dispatch(setConvergenceColourPallete(generatePalleteForGenotypes(convergenceData.colourVariables)));
      dispatch(setConvergenceData(convergenceData.data));
    }
   
    if (organism === 'ngono') {
      // console.log("yearsData.uniqueGenotypes", yearsData.uniqueGenotypes)
      // dispatch(setColorPallete(generatePalleteForGenotypes(yearsData.uniqueGenotypes)));
      // dispatch(setGenotypesForFilter(yearsData.uniqueGenotypes));
      const years = [...new Set(responseData.map((x) => x.DATE))];
      const countries = [...new Set(responseData.map((x) => getCountryDisplayName(x.COUNTRY_ONLY)))];
      years.sort();
      countries.sort();

      dispatch(setTotalGenotypes(genotypes.length));
      dispatch(setActualGenotypes(genotypes.length));
      dispatch(setYears(years));
      dispatch(setTimeInitial(years[0]));
      dispatch(setActualTimeInitial(years[0]));
      dispatch(setTimeFinal(years[years.length - 1]));
      dispatch(setActualTimeFinal(years[years.length - 1]));
      dispatch(setCountriesForFilter(countries));
      console.log("NGMAST",)
      
    }

    dispatch(setGenotypesYearData(yearsData.genotypesData));
    dispatch(setDrugsYearData(yearsData.drugsData));
    dispatch(setGenotypesAndDrugsYearData(yearsData.genotypesAndDrugsData));
    // console.log("genotypesDrugsData", genotypesData.genotypesDrugsData);
    return responseData;
  }

  // This function reads the csv file and set specific filters accordingly to the current organism
  async function getData(endpoint) {
    dispatch(setLoadingData(true));

    await axios
      .get(`${API_ENDPOINT}filters/${endpoint}`)
      .then((response) => {
        const newData = getInfoFromData(response);
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
            dispatch(setDrugResistanceGraphView(drugsNG));
            dispatch(setDeterminantsGraphDrugClass('Ceftriaxone'));
            break;
          case 'ecoli':
            dispatch(setMapView('No. Samples'));
            dispatch(setDrugResistanceGraphView(drugsEC));
            break;
          case 'decoli':
            dispatch(setMapView('No. Samples'));
            dispatch(setDrugResistanceGraphView(drugsEC));
            break;
          case 'shige':
            dispatch(setMapView('No. Samples'));
            dispatch(setDrugResistanceGraphView(drugsSH));
            break;
          case 'senterica':
            dispatch(setMapView('No. Samples'));
            dispatch(setDrugResistanceGraphView(drugsSE));
            break;
          case 'sentericaints':
            dispatch(setMapView('No. Samples'));
            dispatch(setDrugResistanceGraphView(drugsSE));
            break;
          default:
            break;
        }

        setData(newData);
      })
      .finally(() => {
        dispatch(setLoadingData(false));
      });
  }

  // This useEffect is called everytime the organism changes, it resets all data and filters and
  // call the function to read the specific organism csv
  useEffect(() => {
    if (organism !== 'none') {
      // console.log('change organism');
      dispatch(
        setCollapses({
          determinants: false,
          distribution: false,
          drugResistance: false,
          frequencies: false,
          trendsKP: false,
          KODiversity: false,
          convergence: false
        })
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
      dispatch(setCurrentSliderValueRD(5));
      
      switch (organism) {
        case 'styphi':
          getData('getDataForSTyphi');
          break;
        case 'kpneumo':
          getData('getDataForKpneumo');
          break;
        case 'ngono':
          getData('getDataForNgono');
          break;
        case 'ecoli':
          getData('getDataForEcoli');
          break;
        case 'decoli':
            getData('getDataForDEcoli');
          break;
        case 'shige':
          getData('getDataForShige');
          break;
        case 'senterica':
          getData('getDataForSenterica');
          break;
        case 'sentericaints':
          getData('getDataForSentericaints');
          break;
        default:
          break;
      }
    }
  }, [organism]);

  // This useEffect is called everytime the main filters are changed, it does not need to read the csv file again.
  // It filters accordingly to the filters give. Is also called when the reset button is pressed.
  useEffect(() => {
    if (data.length > 0 && canGetData) {
      // console.log('update data', dataset, actualTimeInitial, actualTimeFinal, actualCountry);

      const filters = filterData({ data, dataset, actualTimeInitial, actualTimeFinal, organism, actualCountry });
      const filteredData = filters.data.filter(
        (x) => actualCountry === 'All' || getCountryDisplayName(x.COUNTRY_ONLY) === actualCountry
      );

      if (
        convergenceGroupVariable !== currentConvergenceGroupVariable ||
        convergenceColourVariable !== currentConvergenceColourVariable
      ) {
        // console.log('update variables', convergenceGroupVariable, convergenceColourVariable);
        setCurrentConvergenceGroupVariable(convergenceGroupVariable);
        setCurrentConvergenceColourVariable(convergenceColourVariable);

        const convergenceData = getConvergenceData({
          data: filteredData,
          groupVariable: convergenceGroupVariable,
          // colourVariable: convergenceColourVariable,
          colourVariable: convergenceGroupVariable
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
          organism
        });
        dispatch(setGenotypesDrugsData(genotypesData.genotypesDrugsData));
        // const genotypeDataGreaterThanZero = genotypesData.genotypesDrugsData.filter(x => x.totalCount > 0);
        // dispatch(setGenotypesDrugsData(genotypeDataGreaterThanZero));
        dispatch(setFrequenciesGraphSelectedGenotypes(genotypesData.genotypesDrugsData.slice(0, 5).map((x) => x.name)));
        dispatch(setGenotypesDrugClassesData(genotypesData.genotypesDrugClassesData));
        // dispatch(setCustomDropdownMapView(genotypeDataGreaterThanZero.filter(x => x.totalCount >= 20).slice(0, 1).map((x) => x.name)));
        // dispatch(setCustomDropdownMapView(genotypesData.genotypesDrugsData.slice(0, 1).map((x) => x.name)));

        const yearsData = getYearsData({
          data: filteredData,
          years: yearsForFilter,
          organism
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
            // colourVariable: convergenceColourVariable,
            colourVariable: convergenceGroupVariable
          });
          dispatch(setConvergenceColourPallete(generatePalleteForGenotypes(convergenceData.colourVariables)));
          dispatch(setConvergenceData(convergenceData.data));
        }
        // if (organism === 'ngono') {
        //   const KODiversityData = getKODiversityData({ data: filteredData });
        //   dispatch(setKODiversityData(KODiversityData));

        //   const convergenceData = getConvergenceData({
        //     data: filteredData,
        //     groupVariable: convergenceGroupVariable,
        //     // colourVariable: convergenceColourVariable,
        //     colourVariable: convergenceGroupVariable
        //   });
        //   dispatch(setConvergenceColourPallete(generatePalleteForGenotypes(convergenceData.colourVariables)));
        //   dispatch(setConvergenceData(convergenceData.data));
        // }
      }
    }
  }, [
    canGetData,
    dataset,
    actualTimeInitial,
    actualTimeFinal,
    actualCountry,
    convergenceGroupVariable,
    convergenceColourVariable
  ]);

  return (
    <MainLayout isHomePage>
      <Map />
      <SelectCountry />
      <Graphs />
      <DownloadData />
      <Footer />
      <ResetButton data={data} />
    </MainLayout>
  );
};