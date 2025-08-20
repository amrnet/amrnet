/**
 * @fileoverview Unit tests for color helper functions
 * @jest-environment jsdom
 */

import { generatePalleteForGenotypes, getColorForGenotype } from '../../util/colorHelper';

describe('Color Helper Functions', () => {
  describe('generatePalleteForGenotypes', () => {
    test('should generate color palette for genotypes', () => {
      const genotypes = ['ST1', 'ST2', 'ST3', 'ST4'];
      const palette = generatePalleteForGenotypes(genotypes);

      expect(typeof palette).toBe('object');
      expect(Object.keys(palette)).toHaveLength(4);
      expect(palette['ST1']).toBeDefined();
      expect(palette['ST2']).toBeDefined();
      expect(palette['ST3']).toBeDefined();
      expect(palette['ST4']).toBeDefined();
    });

    test('should handle empty genotypes array', () => {
      const palette = generatePalleteForGenotypes([]);
      expect(typeof palette).toBe('object');
      expect(Object.keys(palette)).toHaveLength(0);
    });

    test('should generate unique colors for each genotype', () => {
      const genotypes = ['A', 'B', 'C'];
      const palette = generatePalleteForGenotypes(genotypes);

      const colors = Object.values(palette);
      const uniqueColors = [...new Set(colors)];
      expect(uniqueColors).toHaveLength(colors.length);
    });

    test('should handle special convergence variable types', () => {
      const genotypes = ['2020', '2021', '2022'];
      const palette = generatePalleteForGenotypes(genotypes, 'DATE');

      expect(Object.keys(palette)).toHaveLength(3);
      expect(palette['2020']).toBeDefined();
    });
  });

  describe('getColorForGenotype', () => {
    const mockPalette = {
      'ST1': '#FF0000',
      'ST2': '#00FF00',
      'ST3': '#0000FF',
    };

    test('should return correct color for existing genotype', () => {
      const color = getColorForGenotype('ST1', mockPalette);
      expect(color).toBe('#FF0000');
    });

    test('should return default color for non-existing genotype', () => {
      const color = getColorForGenotype('ST999', mockPalette);
      expect(color).toBeDefined();
      expect(typeof color).toBe('string');
      expect(color.startsWith('#')).toBe(true);
    });

    test('should handle empty palette', () => {
      const color = getColorForGenotype('ST1', {});
      expect(color).toBeDefined();
      expect(typeof color).toBe('string');
    });

    test('should handle null/undefined inputs', () => {
      const color1 = getColorForGenotype(null, mockPalette);
      const color2 = getColorForGenotype('ST1', null);

      expect(color1).toBeDefined();
      expect(color2).toBeDefined();
    });
  });
});
