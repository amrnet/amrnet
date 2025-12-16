import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Select,
  Typography,
  CircularProgress
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setMapView } from '../../../../stores/slices/mapSlice';
import { updateGlobalOverviewData } from '../../../../services/optimizedDataService';
import { useTranslation } from 'react-i18next';

export const OptimizedMapFilters = ({ showFilter, setShowFilter }) => {
  const dispatch = useAppDispatch();
  const organism = useAppSelector(state => state.dashboard.organism);
  const mapView = useAppSelector(state => state.map.mapView);
  const availableDrugs = useAppSelector(state => state.dashboard.availableDrugs);
  const [loading, setLoading] = useState(false);
  const [availableOptions, setAvailableOptions] = useState({
    colorBy: [],
    drugs: []
  });
  const { t } = useTranslation();

  // Load initial filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      if (organism === 'none') return;

      setLoading(true);
      try {
        // Load available options for this organism
        const response = await fetch(`/api/optimized/filters/${organism}/options`);
        const options = await response.json();
        setAvailableOptions(options);
      } catch (error) {
        console.error('Error loading filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, [organism]);

  // Handle color by country change
  const handleColorByChange = useCallback(async (event) => {
    const newColorBy = event.target.value;
    setLoading(true);

    try {
      console.log(`Updating map view with colorBy: ${newColorBy}`);

      // Load updated data for the new color scheme
      const updatedData = await updateGlobalOverviewData(organism, newColorBy, null);

      // Update map view
      dispatch(setMapView(newColorBy));

      // The data service will handle updating the relevant stores
      console.log('Map view updated successfully');

    } catch (error) {
      console.error('Error updating color by:', error);
    } finally {
      setLoading(false);
    }
  }, [organism, dispatch]);

  // Handle drug selection change
  const handleDrugSelectionChange = useCallback(async (event) => {
    const selectedDrugs = event.target.value;
    setLoading(true);

    try {
      console.log(`Updating drug selection: ${selectedDrugs}`);

      // Load updated data for the new drug selection
      const updatedData = await updateGlobalOverviewData(organism, null, selectedDrugs);

      // The data service will handle updating the relevant stores
      console.log('Drug selection updated successfully');

    } catch (error) {
      console.error('Error updating drug selection:', error);
    } finally {
      setLoading(false);
    }
  }, [organism]);

  // Get color by options based on organism
  const getColorByOptions = () => {
    switch (organism) {
      case 'styphi':
        return [
          { value: 'country', label: 'Country' },
          { value: 'genotype', label: 'Genotype' },
          { value: 'resistance', label: 'Resistance Profile' }
        ];
      case 'kpneumo':
        return [
          { value: 'country', label: 'Country' },
          { value: 'genotype', label: 'Genotype' },
          { value: 'cgst', label: 'cgST' },
          { value: 'sublineage', label: 'Sublineage' }
        ];
      case 'decoli':
      case 'ecoli':
        return [
          { value: 'country', label: 'Country' },
          { value: 'genotype', label: 'Genotype' },
          { value: 'pathotype', label: 'Pathotype' },
          { value: 'serotype', label: 'Serotype' }
        ];
      case 'shige':
        return [
          { value: 'country', label: 'Country' },
          { value: 'genotype', label: 'Genotype' },
          { value: 'pathotype', label: 'Pathotype' }
        ];
      default:
        return [
          { value: 'country', label: 'Country' },
          { value: 'genotype', label: 'Genotype' }
        ];
    }
  };

  // Get drug options based on organism
  const getDrugOptions = () => {
    console.log(`🔧 [DEBUG] getDrugOptions called for ${organism}, availableDrugs:`, availableDrugs);

    // Use Redux store availableDrugs if available
    if (availableDrugs && availableDrugs.length > 0) {
      return availableDrugs.map(drug => ({
        value: drug.toLowerCase().replace(/[^a-z0-9]/gi, ''),
        label: drug
      }));
    }

    // Fallback to hardcoded options
    switch (organism) {
      case 'styphi':
        return [
          { value: 'ciprofloxacin', label: 'Ciprofloxacin' },
          { value: 'azithromycin', label: 'Azithromycin' },
          { value: 'mdr', label: 'MDR' },
          { value: 'xdr', label: 'XDR' }
        ];
      case 'kpneumo':
        return [
          { value: 'carbapenems', label: 'Carbapenems' },
          { value: 'esbl', label: 'ESBL' },
          { value: 'colistin', label: 'Colistin' }
        ];
      default:
        return [];
    }
  };

  if (!showFilter) return null;

  return (
    <Card style={{ position: 'absolute', top: 10, right: 10, minWidth: 300, zIndex: 1000 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('dashboard.filters.optimized.title')}
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" mb={2}>
            <CircularProgress size={20} />
          </Box>
        )}

        {/* Color Country By */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            {t('dashboard.filters.optimized.colorBy')}
          </Typography>
          <Select
            fullWidth
            value={mapView}
            onChange={handleColorByChange}
            disabled={loading}
            size="small"
          >
            {getColorByOptions().map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Select Drugs */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            {t('dashboard.filters.optimized.selectDrugs')}
          </Typography>
          <Select
            fullWidth
            multiple
            onChange={handleDrugSelectionChange}
            disabled={loading}
            size="small"
            displayEmpty
            renderValue={(selected) =>
              selected.length === 0
                ? t('dashboard.filters.optimized.allDrugs')
                : t('dashboard.filters.optimized.selectedCount', { count: selected.length })
            }
          >
            {getDrugOptions().map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowFilter(false)}
            fullWidth
          >
            {t('dashboard.filters.optimized.close')}
          </Button>
      </CardContent>
    </Card>
  );
};

export default OptimizedMapFilters;
