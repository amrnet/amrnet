// Quick pagination fix for freezing organisms
import axios from 'axios';

export async function loadOrganismQuickly(organism, onProgress = () => {}) {
  console.log(`🚀 [QUICK FIX] Loading ${organism} with pagination`);

  try {
    // Step 1: Get summary
    onProgress('Getting data size...');
    const summaryResponse = await axios.get(`/api/optimized/summary/${organism}`);
    const totalDocuments = summaryResponse.data.totalDocuments;

    console.log(`📊 [QUICK FIX] ${organism} has ${totalDocuments.toLocaleString()} documents`);

    // Step 2: Use pagination for large datasets
    if (totalDocuments > 20000) {
      // Use smaller pages for extremely large datasets like E. coli
      const pageSize = totalDocuments > 200000 ? 3000 : 5000;
      const totalPages = Math.ceil(totalDocuments / pageSize);
      let allData = [];

      for (let page = 1; page <= totalPages; page++) {
        onProgress(`Loading page ${page}/${totalPages}...`);

        const response = await axios.get(`/api/optimized/paginated/${organism}`, {
          params: { page, limit: pageSize },
          timeout: 45000 // Increase timeout for large datasets
        });

        const pageData = response.data.data || [];
        allData = allData.concat(pageData);

        console.log(`📄 [QUICK FIX] Page ${page}: ${pageData.length} records (total: ${allData.length})`);

        // Prevent UI blocking - give UI more time to update for large datasets
        if (totalDocuments > 200000 && page % 1 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        } else if (page % 2 === 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      return allData;
    } else {
      // Small dataset - load normally
      onProgress('Loading data...');
      const response = await axios.get(`/api/optimized/getDataFor${organism.charAt(0).toUpperCase() + organism.slice(1)}`, {
        timeout: 60000
      });
      return response.data;
    }

  } catch (error) {
    console.error(`❌ [QUICK FIX] Error loading ${organism}:`, error);
    throw error;
  }
}
