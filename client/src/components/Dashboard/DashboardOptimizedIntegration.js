import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { setOrganism } from '../../stores/slices/dashboardSlice';
import { useOptimizedDataLoading } from './OptimizedDashboard';

// Import original components (these would be your existing components)
import MainLayout from '../Elements/MainLayout/MainLayout';
import Note from '../Elements/Note/Note';
import Map from '../Elements/Map/Map';
import Graphs from '../Elements/Graphs/Graphs';
import ContinentGraphs from '../Elements/ContinentGraphs/ContinentGraphs';
import ContinentPathotypeGraphs from '../Elements/ContinentPathotypeGraphs/ContinentPathotypeGraphs';
import DownloadData from '../Elements/DownloadData/DownloadData';
import ResetButton from '../Elements/ResetButton/ResetButton';
import FloatingGlobalFilters from '../Elements/FloatingGlobalFilters/FloatingGlobalFilters';
import { OptimizedChartWrapper } from '../Charts/OptimizedCharts';

// Drop-in replacement for the existing Dashboard component
export const DashboardOptimizedIntegration = () => {
  const dispatch = useAppDispatch();
  const organism = useAppSelector(state => state.dashboard.organism);
  const mapView = useAppSelector(state => state.map.mapView);

  const {
    loadOrganismData,
    handleGlobalOverviewChange,
    loadChartData,
    isLoading
  } = useOptimizedDataLoading();

  // Load data when organism changes (same as original Dashboard)
  useEffect(() => {
    if (organism !== 'none') {
      loadOrganismData(organism);
    }
  }, [organism, loadOrganismData]);

  // Handle organism selection from URL or SelectOrganism component
  useEffect(() => {
    const getURLparam = (param) => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    };

    const organismParam = getURLparam('organism');
    if (organismParam && organismParam !== organism) {
      dispatch(setOrganism(organismParam));
    }
  }, [organism, dispatch]);

  // Example of integrating with existing components
  const handleMapViewChange = async (newMapView) => {
    // This would be called when map view changes
    await handleGlobalOverviewChange(newMapView, null);
  };

  return (
    <>
      {/* Keep existing layout components */}
      <MainLayout>
        <Note />

        {/* Optimized Map component with parallel loading */}
        <OptimizedMap onViewChange={handleMapViewChange} />

        {/* Optimized chart sections that load in parallel */}
        <OptimizedGraphs />
        <OptimizedContinentGraphs />
        <OptimizedContinentPathotypeGraphs />

        <DownloadData />
        <ResetButton />
      </MainLayout>

      {/* Optimized global filters */}
      <OptimizedFloatingGlobalFilters
        onColorByChange={handleGlobalOverviewChange}
        onDrugSelectionChange={handleGlobalOverviewChange}
      />
    </>
  );
};

// Wrapper components that use the optimized loading
const OptimizedMap = ({ onViewChange }) => {
  const organism = useAppSelector(state => state.dashboard.organism);

  return (
    <OptimizedChartWrapper
      chartType="map"
      dependencies={[organism]}
      onDataLoaded={(data) => {
        // Handle map data loading
        console.log(`Map loaded with ${data.length} points`);
      }}
    >
      <Map onViewChange={onViewChange} />
    </OptimizedChartWrapper>
  );
};

const OptimizedGraphs = () => {
  const organism = useAppSelector(state => state.dashboard.organism);

  return (
    <OptimizedChartWrapper
      chartType="genotypes"
      dependencies={[organism]}
      onDataLoaded={(data) => {
        console.log(`Genotypes chart loaded with ${data.length} points`);
      }}
    >
      <Graphs />
    </OptimizedChartWrapper>
  );
};

const OptimizedContinentGraphs = () => {
  const organism = useAppSelector(state => state.dashboard.organism);

  return (
    <OptimizedChartWrapper
      chartType="trends"
      dependencies={[organism]}
      onDataLoaded={(data) => {
        console.log(`Trends chart loaded with ${data.length} points`);
      }}
    >
      <ContinentGraphs />
    </OptimizedChartWrapper>
  );
};

const OptimizedContinentPathotypeGraphs = () => {
  const organism = useAppSelector(state => state.dashboard.organism);

  return (
    <OptimizedChartWrapper
      chartType="resistance"
      dependencies={[organism]}
      onDataLoaded={(data) => {
        console.log(`Resistance chart loaded with ${data.length} points`);
      }}
    >
      <ContinentPathotypeGraphs />
    </OptimizedChartWrapper>
  );
};

const OptimizedFloatingGlobalFilters = ({ onColorByChange, onDrugSelectionChange }) => {
  return (
    <FloatingGlobalFilters
      onColorByChange={onColorByChange}
      onDrugSelectionChange={onDrugSelectionChange}
    />
  );
};

export default DashboardOptimizedIntegration;

// Migration guide as comments:
/*
MIGRATION STEPS:

1. Replace the Dashboard import in App.js:
   FROM: import Dashboard from './components/Dashboard/Dashboard';
   TO:   import Dashboard from './components/Dashboard/DashboardOptimizedIntegration';

2. Update any components that handle global filter changes:
   - Pass onColorByChange and onDrugSelectionChange props to filter components
   - These will trigger the optimized data loading

3. Wrap existing chart components with OptimizedChartWrapper:
   - Specify chartType (map, genotypes, resistance, trends)
   - Add dependencies array for when to reload
   - Add onDataLoaded callback for custom logic

4. Test the optimization:
   - Check browser network tab to see parallel requests
   - Verify data sizes are smaller
   - Confirm filter changes only reload affected data

5. Gradual rollout:
   - Use feature flags to switch between old and new Dashboard
   - Monitor performance metrics
   - Roll back if issues arise

BACKWARDS COMPATIBILITY:
- All existing Redux stores and actions still work
- Component interfaces remain the same
- Only the data loading mechanism changes
- Fallback to original endpoints if optimized ones fail
*/
