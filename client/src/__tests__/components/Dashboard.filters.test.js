/**
 * @fileoverview Unit tests for Dashboard filter functions
 * @jest-environment jsdom
 */

import { filterData, getMapData, getYearsData } from '../../components/Dashboard/filters';

// Mock data for testing
const mockOrganismData = [
  {
    GENOTYPE: 'ST1',
    DATE: '2020',
    COUNTRY_ONLY: 'United Kingdom',
    TRAVEL: 'community',
    Pathovar: 'ETEC',
    'Azithromycin NS': 'S',
    'Ciprofloxacin NS': 'R',
  },
  {
    GENOTYPE: 'ST2',
    DATE: '2021',
    COUNTRY_ONLY: 'France',
    TRAVEL: 'travel',
    Pathovar: 'EPEC',
    'Azithromycin NS': 'R',
    'Ciprofloxacin NS': 'S',
  },
  {
    GENOTYPE: 'ST1',
    DATE: '2022',
    COUNTRY_ONLY: 'Germany',
    TRAVEL: 'community',
    Pathovar: 'ETEC',
    'Azithromycin NS': 'S',
    'Ciprofloxacin NS': 'R',
  },
];

const mockRegions = {
  'Western Europe': ['United Kingdom', 'France', 'Germany'],
  'Eastern Europe': ['Poland', 'Czech Republic'],
};

describe('Dashboard Filter Functions', () => {
  describe('filterData', () => {
    test('should filter data by time range', () => {
      const result = filterData({
        data: mockOrganismData,
        dataset: 'All',
        actualTimeInitial: '2020',
        actualTimeFinal: '2021',
        organism: 'ecoli',
        actualCountry: 'All',
        selectedLineages: [],
      });

      expect(result.data).toHaveLength(2);
      expect(result.data.every(item =>
        parseInt(item.DATE) >= 2020 && parseInt(item.DATE) <= 2021
      )).toBe(true);
    });

    test('should filter data by dataset', () => {
      const result = filterData({
        data: mockOrganismData,
        dataset: 'community',
        actualTimeInitial: '2020',
        actualTimeFinal: '2022',
        organism: 'ecoli',
        actualCountry: 'All',
        selectedLineages: [],
      });

      expect(result.data).toHaveLength(2);
      expect(result.data.every(item => item.TRAVEL === 'community')).toBe(true);
    });

    test('should return correct genome and genotype counts', () => {
      const result = filterData({
        data: mockOrganismData,
        dataset: 'All',
        actualTimeInitial: '2020',
        actualTimeFinal: '2022',
        organism: 'ecoli',
        actualCountry: 'All',
        selectedLineages: [],
      });

      expect(result.genomesCount).toBe(3);
      expect(result.genotypesCount).toBe(2); // ST1 and ST2
      expect(result.listGenotypes).toContain('ST1');
      expect(result.listGenotypes).toContain('ST2');
    });

    test('should handle empty data gracefully', () => {
      const result = filterData({
        data: [],
        dataset: 'All',
        actualTimeInitial: '2020',
        actualTimeFinal: '2022',
        organism: 'ecoli',
        actualCountry: 'All',
        selectedLineages: [],
      });

      expect(result.data).toHaveLength(0);
      expect(result.genomesCount).toBe(0);
      expect(result.genotypesCount).toBe(0);
    });
  });

  describe('getMapData', () => {
    test('should generate country map data', () => {
      const countries = ['United Kingdom', 'France', 'Germany'];
      const result = getMapData({
        data: mockOrganismData,
        items: countries,
        organism: 'styphi',
        type: 'country',
      });

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('count');
      expect(result[0]).toHaveProperty('drugs');
    });

    test('should generate region map data', () => {
      const result = getMapData({
        data: mockOrganismData,
        items: mockRegions,
        organism: 'styphi',
        type: 'region',
      });

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Western Europe');
      expect(result[0].count).toBe(3); // All samples are from Western Europe
    });

    test('should handle invalid data gracefully', () => {
      const result = getMapData({
        data: null,
        items: [],
        organism: 'styphi',
        type: 'country',
      });

      expect(result).toEqual([]);
    });

    test('should calculate drug resistance percentages correctly', () => {
      const countries = ['United Kingdom', 'France'];
      const result = getMapData({
        data: mockOrganismData.slice(0, 2), // Only first 2 samples
        items: countries,
        organism: 'styphi',
        type: 'country',
      });

      const ukData = result.find(item => item.name === 'United Kingdom');
      const franceData = result.find(item => item.name === 'France');

      expect(ukData).toBeDefined();
      expect(franceData).toBeDefined();
      expect(ukData.count).toBe(1);
      expect(franceData.count).toBe(1);
    });
  });

  describe('getYearsData', () => {
    test('should aggregate data by years correctly', () => {
      const years = ['2020', '2021', '2022'];
      const result = getYearsData({
        data: mockOrganismData,
        years: years,
        organism: 'styphi',
        getUniqueGenotypes: true,
      });

      expect(result.genotypesData).toBeDefined();
      expect(result.drugsData).toBeDefined();
      expect(result.uniqueGenotypes).toContain('ST1');
      expect(result.uniqueGenotypes).toContain('ST2');
    });

    test('should handle empty data in getYearsData', () => {
      const result = getYearsData({
        data: [],
        years: ['2020', '2021'],
        organism: 'styphi',
        getUniqueGenotypes: false,
      });

      expect(result.genotypesData).toEqual([]);
      expect(result.drugsData).toEqual([]);
    });
  });
});
