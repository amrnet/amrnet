/**
 * @fileoverview Unit tests for utility helper functions
 * @jest-environment jsdom
 */

import {
  longestVisualWidth,
  truncateWord,
  getRange,
  arraysEqual
} from '../../util/helpers';

describe('Utility Helper Functions', () => {
  describe('longestVisualWidth', () => {
    test('should find the longest string by visual width', () => {
      const strings = ['short', 'medium length', 'very long string here'];
      const result = longestVisualWidth(strings);
      expect(result).toBe('very long string here');
    });

    test('should handle empty array', () => {
      const result = longestVisualWidth([]);
      expect(result).toBe('');
    });

    test('should handle single element', () => {
      const result = longestVisualWidth(['single']);
      expect(result).toBe('single');
    });

    test('should handle null/undefined values', () => {
      const strings = ['valid', null, undefined, 'another valid'];
      const result = longestVisualWidth(strings);
      expect(result).toBe('another valid');
    });
  });

  describe('truncateWord', () => {
    test('should truncate word longer than maxLength', () => {
      const result = truncateWord('verylongwordhere', 10);
      expect(result).toBe('verylongwo...');
      expect(result.length).toBe(13); // 10 + 3 dots
    });

    test('should not truncate word shorter than maxLength', () => {
      const result = truncateWord('short', 10);
      expect(result).toBe('short');
    });

    test('should use default maxLength of 13', () => {
      const longWord = 'averylongwordthatexceedsdefault';
      const result = truncateWord(longWord);
      expect(result).toBe('averylongword...');
    });

    test('should handle empty string', () => {
      const result = truncateWord('');
      expect(result).toBe('');
    });
  });

  describe('getRange', () => {
    test('should generate range from start to end', () => {
      const result = getRange(1, 5);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test('should handle single number range', () => {
      const result = getRange(3, 3);
      expect(result).toEqual([3]);
    });

    test('should handle reverse range', () => {
      const result = getRange(5, 1);
      expect(result).toEqual([]);
    });

    test('should handle negative numbers', () => {
      const result = getRange(-2, 2);
      expect(result).toEqual([-2, -1, 0, 1, 2]);
    });
  });

  describe('arraysEqual', () => {
    test('should return true for identical arrays', () => {
      const arr1 = [1, 2, 3, 'test'];
      const arr2 = [1, 2, 3, 'test'];
      expect(arraysEqual(arr1, arr2)).toBe(true);
    });

    test('should return false for different arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 4];
      expect(arraysEqual(arr1, arr2)).toBe(false);
    });

    test('should return false for arrays of different lengths', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2];
      expect(arraysEqual(arr1, arr2)).toBe(false);
    });

    test('should handle empty arrays', () => {
      expect(arraysEqual([], [])).toBe(true);
    });

    test('should handle null/undefined', () => {
      expect(arraysEqual(null, null)).toBe(true);
      expect(arraysEqual(undefined, undefined)).toBe(true);
      expect(arraysEqual(null, [])).toBe(false);
      expect(arraysEqual([], undefined)).toBe(false);
    });

    test('should handle nested arrays', () => {
      const arr1 = [[1, 2], [3, 4]];
      const arr2 = [[1, 2], [3, 4]];
      // Note: arraysEqual likely does shallow comparison
      expect(arraysEqual(arr1, arr2)).toBe(false); // Arrays contain object references
    });
  });
});
