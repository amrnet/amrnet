// Helper for map color
import chroma from 'chroma-js';

export const samplesColorScale = (domain) => {
  if (domain >= 1 && domain <= 9) {
    return '#4575B4';
  } else if (domain >= 10 && domain <= 19) {
    return '#91BFDB';
  } else if (domain >= 20 && domain <= 99) {
    return '#ADDD8E';
  } else if (domain >= 100 && domain <= 299) {
    return '#FEE090';
  } else if (domain >= 300) {
    return '#FC8D59';
  }
};

export const redColorScale = (percentage) => {
  const p = percentage;
  if (p > 50) {
    return '#A20F17';
  } else if (p > 10 && p <= 50) {
    return '#DD2C24';
  } else if (p > 2 && p <= 10) {
    return '#FA694A';
  } else {
    return '#FAAD8F';
  }
};
// Heatmap cell palette. Sequential YlOrRd (4-class ColorBrewer):
// warm tan → orange → red → deep red. Starts at a saturation level that
// stays visible against white page backgrounds (avoids the near-white dead
// zone the previous ramp had around 0–15%), and text contrast is handled
// via a threshold in the heatmap components.
const HEATMAP_STOPS = ['#FDCC8A', '#FC8D59', '#E34A33', '#B30000'];

const HEATMAP_SCALE = chroma.scale(HEATMAP_STOPS).mode('lab');

export const mixColorScale = percentage => {
  const p = Math.max(0, Math.min(percentage, 100)); // Clamp between 0–100
  return HEATMAP_SCALE(p / 100).hex();
};

/**
 * Threshold above which cell text should be white (darker red background).
 * Values at/below get black text for contrast against the lighter tan/orange.
 * Keep this in sync with the palette stops above.
 */
export const HEATMAP_WHITE_TEXT_THRESHOLD = 60;

/**
 * CSS linear-gradient string for the heatmap legend bar. Kept in sync with
 * `mixColorScale` so the legend never drifts from cell colors.
 */
export const heatmapLegendGradient = () => {
  const parts = HEATMAP_STOPS.map(
    (c, i) => `${c} ${Math.round((i / (HEATMAP_STOPS.length - 1)) * 100)}%`,
  );
  // Leading grey sliver shows "no data" at the very start of the bar.
  return `linear-gradient(to right, #D3D3D3 0%, ${parts.join(', ')})`;
};

export const differentColorScale = (percentage, colour, maxValue = 100) => {
  const p = parseInt(percentage);
  let colorScale;
  // Define the color scale using chroma.scale
  switch (colour) {
    case 'red':
      colorScale = chroma.scale(['#FAAD8F', '#FA694A', '#DD2C24', '#A20F17']);
      break;
    case 'blue':
      colorScale = chroma.scale(['#B3E5FC', '#4FC3F7', '#0288D1', '#01579B']);
      break;
    case 'pink':
      colorScale = chroma.scale(['#F8BBD0', '#F06292', '#E91E63', '#880E4F']);
      break;
    case 'orange':
      colorScale = chroma.scale(['#FFE0B2', '#FFB74D', '#FB8C00', '#E65100']);
      break;
    case 'green':
      colorScale = chroma.scale(['#C8E6C9', '#81C784', '#388E3C', '#1B5E20']);
      break;
    case 'purple':
      colorScale = chroma.scale(['#E1BEE7', '#BA68C8', '#8E24AA', '#4A148C']);
      break;
    case 'brown':
      colorScale = chroma.scale(['#D7CCC8', '#A1887F', '#6D4C41', '#3E2723']);
      break;
    default:
      colorScale = chroma.scale(['#E0E0E0', '#9E9E9E', '#616161', '#212121']);
      break;
  }

  // Map the percentage to the color scale range (0 to 1)
  const normalizedPercentage = p / maxValue;

  // Use the color scale to interpolate the color based on the percentage
  const color = colorScale(normalizedPercentage).hex();

  return color;
};

export const sensitiveColorScale = (percentage) => {
  const p = parseFloat(percentage);
  if (p > 90) {
    return '#727272';
  } else if (p > 50) {
    return '#FAAD8F';
  } else if (p > 20) {
    return '#FA694A';
  } else if (p > 10) {
    return '#DD2C24';
  }
  return '#A20F17';
};
