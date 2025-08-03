import * as compressJson from 'compress-json';

export const decompressResponse = async (response) => {
  const data = await response.json();

  // Check if the response was compressed with compress-json
  const compressionType = response.headers.get('X-Compression');

  if (compressionType === 'compress-json') {
    try {
      return compressJson.decompress(data);
    } catch (error) {
      console.warn('Failed to decompress response, using as-is:', error);
      return data;
    }
  }

  return data;
};