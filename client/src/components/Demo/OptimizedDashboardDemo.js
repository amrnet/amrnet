import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress
} from '@mui/material';
import { useOptimizedDataLoading } from '../Dashboard/OptimizedDashboard';
import OptimizedCharts from '../Charts/OptimizedCharts';
import OptimizedMapFilters from '../Elements/Map/OptimizedMapFilters/OptimizedMapFilters';

const OptimizedDashboardDemo = () => {
  const [selectedOrganism, setSelectedOrganism] = useState('styphi');
  const [showMapFilters, setShowMapFilters] = useState(false);
  const [colorBy, setColorBy] = useState('country');
  const [selectedDrugs, setSelectedDrugs] = useState([]);

  const {
    loadOrganismData,
    handleGlobalOverviewChange,
    loadChartData,
    isLoading
  } = useOptimizedDataLoading();

  // Handle organism change
  const handleOrganismChange = async (event) => {
    const newOrganism = event.target.value;
    setSelectedOrganism(newOrganism);

    // Load data for the new organism
    await loadOrganismData(newOrganism);
  };

  // Handle global overview changes
  const handleColorByChange = async (event) => {
    const newColorBy = event.target.value;
    setColorBy(newColorBy);

    // Update data based on new color scheme
    await handleGlobalOverviewChange(newColorBy, selectedDrugs.join(','));
  };

  const handleDrugSelectionChange = async (event) => {
    const newDrugs = event.target.value;
    setSelectedDrugs(newDrugs);

    // Update data based on new drug selection
    await handleGlobalOverviewChange(colorBy, newDrugs.join(','));
  };

  // Load specific chart on demand
  const handleLoadChart = async (chartType) => {
    try {
      await loadChartData([chartType], { colorBy, drugs: selectedDrugs.join(',') });
    } catch (error) {
      console.error(`Error loading ${chartType}:`, error);
    }
  };

  const organismOptions = [
    { value: 'styphi', label: 'S. Typhi' },
    { value: 'kpneumo', label: 'K. pneumoniae' },
    { value: 'ngono', label: 'N. gonorrhoeae' },
    { value: 'ecoli', label: 'E. coli' },
    { value: 'shige', label: 'Shigella' }
  ];

  const colorByOptions = [
    { value: 'country', label: 'Country' },
    { value: 'genotype', label: 'Genotype' },
    { value: 'resistance', label: 'Resistance Profile' }
  ];

  const drugOptions = {
    styphi: ['ciprofloxacin', 'azithromycin', 'mdr', 'xdr'],
    kpneumo: ['carbapenems', 'esbl', 'colistin'],
    ngono: ['azithromycin', 'ceftriaxone', 'ciprofloxacin'],
    ecoli: ['aminoglycosides', 'beta-lactam', 'quinolone'],
    shige: ['aminoglycosides', 'beta-lactam', 'quinolone']
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        AMRnet Optimized Dashboard Demo
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Controls
          </Typography>

          <Box display="flex" gap={2} mb={2} flexWrap="wrap">
            {/* Organism Selection */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Organism</InputLabel>
              <Select
                value={selectedOrganism}
                label="Organism"
                onChange={handleOrganismChange}
                disabled={isLoading}
              >
                {organismOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Color By Selection */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Color By</InputLabel>
              <Select
                value={colorBy}
                label="Color By"
                onChange={handleColorByChange}
                disabled={isLoading}
              >
                {colorByOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Drug Selection */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Drugs</InputLabel>
              <Select
                multiple
                value={selectedDrugs}
                label="Select Drugs"
                onChange={handleDrugSelectionChange}
                disabled={isLoading}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {(drugOptions[selectedOrganism] || []).map(drug => (
                  <MenuItem key={drug} value={drug}>
                    {drug}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Map Filters Toggle */}
            <Button
              variant="outlined"
              onClick={() => setShowMapFilters(!showMapFilters)}
              disabled={isLoading}
            >
              {showMapFilters ? 'Hide' : 'Show'} Map Filters
            </Button>
          </Box>

          {/* Chart Loading Buttons */}
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              size="small"
              variant="contained"
              onClick={() => handleLoadChart('map')}
              disabled={isLoading}
            >
              Load Map
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleLoadChart('genotypes')}
              disabled={isLoading}
            >
              Load Genotypes
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleLoadChart('resistance')}
              disabled={isLoading}
            >
              Load Resistance
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleLoadChart('trends')}
              disabled={isLoading}
            >
              Load Trends
            </Button>
          </Box>

          {isLoading && (
            <Box display="flex" alignItems="center" gap={1} mt={2}>
              <CircularProgress size={20} />
              <Typography variant="body2">Loading data...</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Map Filters */}
      <OptimizedMapFilters
        showFilter={showMapFilters}
        setShowFilter={setShowMapFilters}
      />

      {/* Charts */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Charts (Loaded in Parallel)
          </Typography>
          <OptimizedCharts />
        </CardContent>
      </Card>

      {/* Performance Info */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance Benefits
          </Typography>
          <Typography variant="body2" paragraph>
            ✅ <strong>Parallel Loading:</strong> All charts load simultaneously using Promise.all
          </Typography>
          <Typography variant="body2" paragraph>
            ✅ <strong>Optimized Endpoints:</strong> Backend sends only necessary data fields
          </Typography>
          <Typography variant="body2" paragraph>
            ✅ <strong>On-Demand Filtering:</strong> Global overview changes trigger targeted API calls
          </Typography>
          <Typography variant="body2" paragraph>
            ✅ <strong>Intelligent Caching:</strong> Prevents duplicate requests for the same data
          </Typography>
          <Typography variant="body2" paragraph>
            ✅ <strong>Chart-Specific Loading:</strong> Each chart can load its data independently
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OptimizedDashboardDemo;
