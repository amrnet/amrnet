export function longestVisualWidth(list) {
  if (!list.length) return 100;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = '18px Montserrat';

  return list.reduce((maxWidth, word) => {
    const width = context.measureText(word).width;
    return Math.max(maxWidth, width);
  }, 0);
}

export function truncateWord(word, maxLength = 13) {
  if (word.length > maxLength) {
    return word.substring(0, maxLength) + '...';
  }
  return word;
}

export function getRange(start, end) {
  const step = start <= end ? 1 : -1; // Handle ascending or descending
  const length = Math.abs(end - start) + 1;
  return Array.from({ length }, (_, i) => start + i * step);
}
