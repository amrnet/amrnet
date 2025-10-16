import React, { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAppSelector } from '../../../stores/hooks';
import { loadChartDataParallel } from '../../../services/optimizedDataService';

// Generic optimized chart wrapper that loads data on demand
export const OptimizedChartWrapper = ({
  chartType,
  children,
  dependencies = [],
  filters = {},
  onDataLoaded
}) => {
  const organism = useAppSelector(state => state.dashboard.organism);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Load chart data when dependencies change
  const loadData = useCallback(async () => {
    if (organism === 'none') return;

    setLoading(true);
    setError(null);

    try {
      console.log(`Loading ${chartType} chart data for ${organism}`);

      const chartData = await loadChartDataParallel(organism, [chartType], filters);
      const result = chartData[chartType];

      setData(result);
      onDataLoaded?.(result);

    } catch (err) {
      console.error(`Error loading ${chartType} data:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [organism, chartType, filters, onDataLoaded, ...dependencies]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
        <Typography variant="body2" ml={2}>
          Loading {chartType} data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error loading {chartType} data: {error}
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={3}>
        <Typography variant="body2" color="textSecondary">
          No data available for {chartType}
        </Typography>
      </Box>
    );
  }

  // Pass the loaded data to children
  return React.cloneElement(children, { data });
};

// Optimized Charts component that loads multiple charts in parallel
export const OptimizedCharts = () => {
  const organism = useAppSelector(state => state.dashboard.organism);
  const [chartsData, setChartsData] = useState({});
  const [loading, setLoading] = useState(false);

  // Load all charts data in parallel when organism changes
  useEffect(() => {
    const loadAllCharts = async () => {
      if (organism === 'none') return;

      setLoading(true);

      try {
        console.log(`Loading all charts for ${organism} in parallel...`);

        // Define which charts to load based on organism
        const chartTypes = getChartTypesForOrganism(organism);

        // Load all chart data in parallel
        const allChartsData = await loadChartDataParallel(organism, chartTypes);

        setChartsData(allChartsData);
        console.log(`Successfully loaded ${chartTypes.length} charts for ${organism}`);

      } catch (error) {
        console.error('Error loading charts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllCharts();
  }, [organism]);

  // Helper function to determine which charts to load for each organism
  const getChartTypesForOrganism = (organism) => {
    const baseCharts = ['map', 'genotypes', 'resistance', 'trends'];

    switch (organism) {
      case 'kpneumo':
        return [...baseCharts, 'convergence', 'ko'];
      case 'ngono':
        return [...baseCharts, 'ngmast'];
      case 'styphi':
        return [...baseCharts, 'drugs'];
      default:
        return baseCharts;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={5}>
        <CircularProgress size={40} />
        <Typography variant="h6" ml={2}>
          Loading charts for {organism}...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Map Chart */}
      {chartsData.map && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Geographic Distribution
          </Typography>
          <OptimizedMapChart data={chartsData.map} />
        </Box>
      )}

      {/* Genotypes Chart */}
      {chartsData.genotypes && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Genotype Distribution
          </Typography>
          <OptimizedGenotypesChart data={chartsData.genotypes} />
        </Box>
      )}

      {/* Resistance Chart */}
      {chartsData.resistance && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Resistance Patterns
          </Typography>
          <OptimizedResistanceChart data={chartsData.resistance} />
        </Box>
      )}

      {/* Trends Chart */}
      {chartsData.trends && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Temporal Trends
          </Typography>
          <OptimizedTrendsChart data={chartsData.trends} />
        </Box>
      )}

      {/* Organism-specific charts */}
      {organism === 'kpneumo' && chartsData.convergence && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Convergence Analysis
          </Typography>
          <OptimizedConvergenceChart data={chartsData.convergence} />
        </Box>
      )}
    </Box>
  );
};

// Placeholder chart components (replace with actual chart implementations)
const OptimizedMapChart = ({ data }) => (
  <Box p={2} border={1} borderColor="grey.300">
    <Typography>Map Chart - {data?.length || 0} data points</Typography>
  </Box>
);

const OptimizedGenotypesChart = ({ data }) => (
  <Box p={2} border={1} borderColor="grey.300">
    <Typography>Genotypes Chart - {data?.length || 0} data points</Typography>
  </Box>
);

const OptimizedResistanceChart = ({ data }) => (
  <Box p={2} border={1} borderColor="grey.300">
    <Typography>Resistance Chart - {data?.length || 0} data points</Typography>
  </Box>
);

const OptimizedTrendsChart = ({ data }) => (
  <Box p={2} border={1} borderColor="grey.300">
    <Typography>Trends Chart - {data?.length || 0} data points</Typography>
  </Box>
);

const OptimizedConvergenceChart = ({ data }) => (
  <Box p={2} border={1} borderColor="grey.300">
    <Typography>Convergence Chart - {data?.length || 0} data points</Typography>
  </Box>
);

export default OptimizedCharts;
