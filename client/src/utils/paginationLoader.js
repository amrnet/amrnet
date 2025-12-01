// Simple pagination fix for slow organisms
import axios from 'axios';

export async function loadOrganismWithPagination(organism, dispatch, callbacks = {}) {
  const { onProgress = () => {}, onComplete = () => {} } = callbacks;

  console.log(`🔄 [PAGINATION] Loading ${organism} with pagination to prevent freezing`);

  try {
    // Step 1: Get total count
    onProgress({ message: 'Getting data size...', percentage: 10 });
    const summaryResponse = await axios.get(`/api/optimized/summary/${organism}`);
    const totalDocuments = summaryResponse.data.totalDocuments;

    console.log(`📊 [PAGINATION] ${organism} has ${totalDocuments.toLocaleString()} documents`);

    // Step 2: Load in pages if large dataset
    if (totalDocuments > 20000) {
      console.log(`📦 [PAGINATION] Using pagination for large dataset`);

      const pageSize = 5000;
      const totalPages = Math.ceil(totalDocuments / pageSize);
      let allData = [];

      for (let page = 1; page <= totalPages; page++) {
        onProgress({
          message: `Loading page ${page}/${totalPages}...`,
          percentage: 10 + (page / totalPages * 80),
          currentRecords: allData.length,
          totalRecords: totalDocuments
        });

        const response = await axios.get(`/api/optimized/paginated/${organism}`, {
          params: { page, limit: pageSize },
          timeout: 30000
        });

        const pageData = response.data.data || [];
        allData = allData.concat(pageData);

        console.log(`📄 [PAGINATION] Loaded page ${page}: ${pageData.length} records (total: ${allData.length})`);

        // Small delay to prevent UI blocking
        if (page % 2 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      onComplete({ data: allData, totalRecords: allData.length });
      return allData;

    } else {
      // Small dataset - load normally
      console.log(`📦 [PAGINATION] Small dataset, loading normally`);
      onProgress({ message: 'Loading data...', percentage: 50 });

      const response = await axios.get(`/api/optimized/getDataFor${organism.charAt(0).toUpperCase() + organism.slice(1)}`, {
        timeout: 60000
      });

      onComplete({ data: response.data, totalRecords: response.data.length });
      return response.data;
    }

  } catch (error) {
    console.error(`❌ [PAGINATION] Error loading ${organism}:`, error);
    throw error;
  }
}
