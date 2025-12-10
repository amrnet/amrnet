// Quick pagination fix for freezing organisms
import axios from 'axios';

// Always use paginated loading for kpneumo
export async function loadOrganismQuickly(organism, onProgress = () => {}) {
  console.log(`🚀 [QUICK FIX] Loading ${organism} with pagination`);

  try {
    // Map organisms to their correct endpoint names
    const endpointMap = {
      styphi: 'STyphi',
      kpneumo: 'Kpneumo',
      ngono: 'Ngono',
      ecoli: 'Ecoli',
      decoli: 'DEcoli',
      shige: 'Shige',
      senterica: 'Senterica',
      sentericaints: 'Sentericaints',
    };

    const endpointName = endpointMap[organism] || organism;

    // Use the paginated endpoint that has proper field projections
    const pageSize = 3000;
    let allData = [];
    let page = 1;
    let hasMoreData = true;
    let metadata = null;

    while (hasMoreData) {
      onProgress(`Loading page ${page}...`);

      try {
        const response = await axios.get(`/api/getDataFor${endpointName}`, {
          params: { page, limit: pageSize },
          timeout: 60000,
        });

        const pageData = response.data.data || response.data || [];
        
        // Capture metadata from page 1 to avoid re-processing all records
        if (page === 1 && response.data.metadata) {
          metadata = response.data.metadata;
          console.log(`📊 [QUICK FIX] Got metadata for ${organism}:`, {
            years: metadata.years?.length,
            countries: metadata.countries?.length,
            genotypes: metadata.genotypes?.length,
          });
        }
        
        if (!Array.isArray(pageData) || pageData.length === 0) {
          hasMoreData = false;
          break;
        }

        allData = allData.concat(pageData);
        console.log(`📄 [QUICK FIX] Page ${page}: ${pageData.length} records (total: ${allData.length})`);

        // Check if we've got all data (response includes pagination metadata)
        if (response.data.pagination) {
          const { totalPages } = response.data.pagination;
          if (page >= totalPages) {
            hasMoreData = false;
          }
        }

        // Throttle to avoid overwhelming the server
        if (page % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        page++;
      } catch (pageError) {
        console.warn(`⚠️ [QUICK FIX] Error loading page ${page}:`, pageError);
        // If we got at least some data, return it; otherwise throw
        if (allData.length > 0) {
          console.log(`⚠️ [QUICK FIX] Returning ${allData.length} records despite page error`);
          hasMoreData = false;
        } else {
          throw pageError;
        }
      }
    }

    console.log(`✅ [QUICK FIX] Loaded total of ${allData.length} records for ${organism}`);
    
    // Return both the data and the metadata for fast initialization
    return { data: allData, metadata };
  } catch (error) {
    console.error(`❌ [QUICK FIX] Error loading ${organism}:`, error);
    throw error;
  }
}
