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

export const mixColorScale = (percentage) => {
  const p = Math.max(0, Math.min(percentage, 100)); // Clamp between 0–100

  // Define custom color bands and transition points
  const domain = [0, 20, 100];
  const colors = [
    '#FFE0B2', // light orange
    '#DD2C24', // red
    '#0288D1', // deep blue
  ];

  // Create a continuous interpolated color scale
  const colorScale = chroma.scale(colors).domain(domain).mode('lab');

  return colorScale(p).hex();
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
