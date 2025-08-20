import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import {
  setLoadingData,
  setMapData,
  setGenotypesData,
  setCountriesForFilter,
  setYears,
  setTotalGenomes,
  setActualGenomes
} from '../../stores/slices/dashboardSlice';
import optimizedDataService, {
  loadOrganismDataParallel,
  updateGlobalOverviewData,
  loadChartDataParallel
} from '../../services/optimizedDataService';

// Custom hook for optimized data loading
export const useOptimizedDataLoading = () => {
  const dispatch = useAppDispatch();
  const organism = useAppSelector(state => state.dashboard.organism);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial organism data in parallel
  const loadOrganismData = useCallback(async (selectedOrganism) => {
    if (selectedOrganism === 'none') return;

    setIsLoading(true);
    dispatch(setLoadingData(true));

    try {
      console.log(`Loading optimized data for ${selectedOrganism}...`);

      // Load all essential data in parallel
      const {
        mapData,
        genotypesData,
        resistanceData,
        trendsData,
        regionsData
      } = await loadOrganismDataParallel(selectedOrganism);

      // Dispatch data to store
      dispatch(setMapData(mapData));
      dispatch(setGenotypesData(genotypesData));

      // Extract and set derived data
      const countries = [...new Set(mapData.map(item => item.COUNTRY_ONLY))].filter(Boolean).sort();
      const years = [...new Set(mapData.map(item => item.DATE))].filter(Boolean).sort();

      dispatch(setCountriesForFilter(countries));
      dispatch(setYears(years));
      dispatch(setTotalGenomes(mapData.length));
      dispatch(setActualGenomes(mapData.length));

      console.log(`Successfully loaded ${mapData.length} records for ${selectedOrganism}`);

    } catch (error) {
      console.error('Error loading organism data:', error);
    } finally {
      setIsLoading(false);
      dispatch(setLoadingData(false));
    }
  }, [dispatch]);

  // Handle global overview changes (color by, select drugs)
  const handleGlobalOverviewChange = useCallback(async (colorBy, selectDrugs) => {
    if (organism === 'none') return;

    setIsLoading(true);

    try {
      console.log(`Updating global overview: colorBy=${colorBy}, selectDrugs=${selectDrugs}`);

      const updatedData = await updateGlobalOverviewData(organism, colorBy, selectDrugs);

      // Update relevant components with new data
      dispatch(setMapData(updatedData.mapData));
      if (updatedData.genotypes) {
        dispatch(setGenotypesData(updatedData.genotypes));
      }

      console.log('Global overview updated successfully');

    } catch (error) {
      console.error('Error updating global overview:', error);
    } finally {
      setIsLoading(false);
    }
  }, [organism, dispatch]);

  // Load specific charts on demand
  const loadChartData = useCallback(async (chartTypes, filters = {}) => {
    if (organism === 'none') return;

    try {
      const chartData = await loadChartDataParallel(organism, chartTypes, filters);

      // Update specific chart data in store
      Object.entries(chartData).forEach(([chartType, data]) => {
        switch (chartType) {
          case 'map':
            dispatch(setMapData(data));
            break;
          case 'genotypes':
            dispatch(setGenotypesData(data));
            break;
          // Add other chart types as needed
        }
      });

      return chartData;
    } catch (error) {
      console.error('Error loading chart data:', error);
      throw error;
    }
  }, [organism, dispatch]);

  return {
    loadOrganismData,
    handleGlobalOverviewChange,
    loadChartData,
    isLoading
  };
};

// Optimized Dashboard component
export const OptimizedDashboard = () => {
  const dispatch = useAppDispatch();
  const organism = useAppSelector(state => state.dashboard.organism);
  const { loadOrganismData, handleGlobalOverviewChange, loadChartData, isLoading } = useOptimizedDataLoading();

  // Load data when organism changes
  useEffect(() => {
    if (organism !== 'none') {
      loadOrganismData(organism);
    }
  }, [organism, loadOrganismData]);

  // Example of how to handle global overview changes
  const handleColorByChange = useCallback((newColorBy) => {
    handleGlobalOverviewChange(newColorBy, null);
  }, [handleGlobalOverviewChange]);

  const handleDrugSelectionChange = useCallback((selectedDrugs) => {
    handleGlobalOverviewChange(null, selectedDrugs);
  }, [handleGlobalOverviewChange]);

  // Example of loading specific chart data when needed
  const handleChartVisibilityChange = useCallback((chartType, isVisible) => {
    if (isVisible && !isLoading) {
      loadChartData([chartType]);
    }
  }, [loadChartData, isLoading]);

  return {
    isLoading,
    handleColorByChange,
    handleDrugSelectionChange,
    handleChartVisibilityChange,
    loadChartData
  };
};

// Export the hook and component
export default OptimizedDashboard;
