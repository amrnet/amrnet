/* eslint-disable no-undef */
// Import filter functions
import { getYearsData, getGenotypesData, getDrugsCountriesData, getKOYearsData } from '../components/Dashboard/filters';

// Listen for messages from the main thread
self.onmessage = async (event) => {
  const { type, payload, jobId } = event.data;

  try {
    let result;

    switch (type) {
      case 'COMPUTE_YEARS_DATA':
        result = getYearsData(payload);
        break;

      case 'COMPUTE_GENOTYPES_DATA':
        result = getGenotypesData(payload);
        break;

      case 'COMPUTE_DRUGS_COUNTRIES_DATA':
        result = getDrugsCountriesData(payload);
        break;

      case 'COMPUTE_KO_YEARS_DATA':
        result = getKOYearsData(payload);
        break;

      default:
        throw new Error(`Unknown job type: ${type}`);
    }

    // Send result back to main thread
    self.postMessage({
      jobId,
      type: 'RESULT',
      success: true,
      data: result,
    });
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      jobId,
      type: 'ERROR',
      success: false,
      error: error.message,
    });
  }
};

export {};
