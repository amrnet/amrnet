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
  setColorPallete,
  setGenotypesForFilter,
  setListPMID,
  setLoadingData,
  setTimeFinal,
  setTimeInitial,
  setTotalGenomes,
  setTotalGenotypes,
  setYears
} from '../../stores/slices/dashboardSlice.ts';
import { setDataset, setMapData, setMapView, setPosition } from '../../stores/slices/mapSlice.ts';
import { Graphs } from '../Elements/Graphs';
import {
  setCollapses,
  setCountriesForFilter,
  setDeterminantsGraphDrugClass,
  setDrugResistanceGraphView,
  setDrugsYearData,
  setFrequenciesGraphSelectedGenotypes,
  setGenotypesAndDrugsYearData,
  setGenotypesDrugClassesData,
  setGenotypesDrugsData,
  setGenotypesYearData,
  setTrendsKPGraphDrugClass
} from '../../stores/slices/graphSlice.ts';
import { filterData, getYearsData, getMapData, getGenotypesData, getCountryDisplayName } from './filters';
import { ResetButton } from '../Elements/ResetButton/ResetButton';
import { generatePalleteForGenotypes } from '../../util/colorHelper';
import { SelectCountry } from '../Elements/SelectCountry';
import { drugsST, drugsKP } from '../../util/drugs';

export const DashboardPage = () => {
  const [data, setData] = useState([]);

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

  // This function is only called once, after the csv is read. It gets all the static and dynamic data
  // that came from the csv file and sets all the data the organism needs to show
  function getInfoFromData(response) {
    const responseData = response.data;
    dispatch(setTotalGenomes(responseData.length));
    dispatch(setActualGenomes(responseData.length));

    const genotypes = [...new Set(responseData.map((x) => x.GENOTYPE))];
    if (organism === 'typhi') {
      genotypes.sort((a, b) => a.localeCompare(b));
      dispatch(setGenotypesForFilter(genotypes));
    }

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

    dispatch(setMapData(getMapData({ data: responseData, countries, organism })));

    const genotypesData = getGenotypesData({ data: responseData, genotypes, actualCountry, organism });
    dispatch(setGenotypesDrugsData(genotypesData.genotypesDrugsData));
    dispatch(setFrequenciesGraphSelectedGenotypes(genotypesData.genotypesDrugsData.slice(0, 5).map((x) => x.name)));
    dispatch(setGenotypesDrugClassesData(genotypesData.genotypesDrugClassesData));

    const yearsData = getYearsData({
      data: responseData,
      years,
      actualCountry,
      organism,
      getUniqueGenotypes: true
    });

    if (organism === 'klebe') {
      dispatch(setColorPallete(generatePalleteForGenotypes(yearsData.uniqueGenotypes)));
      dispatch(setGenotypesForFilter(yearsData.uniqueGenotypes));
    }

    dispatch(setGenotypesYearData(yearsData.genotypesData));
    dispatch(setDrugsYearData(yearsData.drugsData));
    dispatch(setGenotypesAndDrugsYearData(yearsData.genotypesAndDrugsData));

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
          case 'typhi':
            dispatch(setMapView('CipNS'));
            dispatch(setDrugResistanceGraphView(drugsST));
            dispatch(setDeterminantsGraphDrugClass('Fluoroquinolones (CipNS)'));
            break;
          case 'klebe':
            dispatch(setMapView('No. Samples'));
            dispatch(setDrugResistanceGraphView(drugsKP));
            dispatch(setDeterminantsGraphDrugClass('Carbapenems'));
            dispatch(setTrendsKPGraphDrugClass('Carbapenems'));
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
      console.log('change organism');
      dispatch(
        setCollapses({
          determinants: false,
          distribution: false,
          drugResistance: false,
          frequencies: false,
          trendsKP: false
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
      dispatch(setDeterminantsGraphDrugClass(''));
      dispatch(setTrendsKPGraphDrugClass(''));
      dispatch(setMapView(''));

      switch (organism) {
        case 'typhi':
          getData('getDataFromCSV');
          break;
        case 'klebe':
          getData('getDataFromCSVKlebe');
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
      console.log('update data', dataset, actualTimeInitial, actualTimeFinal, actualCountry);

      const filters = filterData({ data, dataset, actualTimeInitial, actualTimeFinal, organism, actualCountry });
      dispatch(setActualGenomes(filters.genomesCount));
      dispatch(setActualGenotypes(filters.genotypesCount));
      dispatch(setListPMID(filters.listPMID));

      dispatch(setMapData(getMapData({ data: filters.data, countries: countriesForFilter, organism })));

      const genotypesData = getGenotypesData({
        data: filters.data,
        genotypes: genotypesForFilter,
        actualCountry,
        organism
      });
      dispatch(setGenotypesDrugsData(genotypesData.genotypesDrugsData));
      dispatch(setFrequenciesGraphSelectedGenotypes(genotypesData.genotypesDrugsData.slice(0, 5).map((x) => x.name)));
      dispatch(setGenotypesDrugClassesData(genotypesData.genotypesDrugClassesData));

      const yearsData = getYearsData({
        data: filters.data,
        years: yearsForFilter,
        actualCountry,
        organism
      });
      dispatch(setGenotypesYearData(yearsData.genotypesData));
      dispatch(setDrugsYearData(yearsData.drugsData));
      dispatch(setGenotypesAndDrugsYearData(yearsData.genotypesAndDrugsData));
    }
  }, [canGetData, dataset, actualTimeInitial, actualTimeFinal, actualCountry]);

  return (
    <MainLayout isHomePage>
      <Map />
      <SelectCountry />
      <Graphs />
      <DownloadData />
      <Footer />
      <ResetButton />
    </MainLayout>
  );
};
