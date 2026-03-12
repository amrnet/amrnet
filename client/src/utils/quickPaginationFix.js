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
    const CONCURRENCY = 5;
    let metadata = null;

    // Fetch page 1 first to discover totalPages and capture metadata
    onProgress(`Loading page 1...`);
    const firstResponse = await axios.get(`/api/getDataFor${endpointName}`, {
      params: { page: 1, limit: pageSize },
      timeout: 60000,
    });

    const firstPageData = firstResponse.data.data || firstResponse.data || [];
    if (firstResponse.data.metadata) {
      metadata = firstResponse.data.metadata;
      console.log(`📊 [QUICK FIX] Got metadata for ${organism}:`, {
        years: metadata.years?.length,
        countries: metadata.countries?.length,
        genotypes: metadata.genotypes?.length,
      });
    }

    const totalPages = firstResponse.data.pagination?.totalPages ?? 1;
    console.log(`📄 [QUICK FIX] Page 1/${totalPages}: ${firstPageData.length} records`);

    // Fetch remaining pages in parallel, CONCURRENCY at a time
    const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
    const extraData = new Array(remainingPages.length);

    for (let i = 0; i < remainingPages.length; i += CONCURRENCY) {
      const chunk = remainingPages.slice(i, i + CONCURRENCY);
      onProgress(`Loading pages ${chunk[0]}–${chunk[chunk.length - 1]} of ${totalPages}...`);

      const responses = await Promise.allSettled(
        chunk.map(p =>
          axios.get(`/api/getDataFor${endpointName}`, {
            params: { page: p, limit: pageSize },
            timeout: 60000,
          }),
        ),
      );

      for (let j = 0; j < responses.length; j++) {
        const result = responses[j];
        if (result.status === 'fulfilled') {
          const pageData = result.value.data.data || result.value.data || [];
          extraData[i + j] = pageData;
          console.log(`📄 [QUICK FIX] Page ${chunk[j]}/${totalPages}: ${pageData.length} records`);
        } else {
          console.warn(`⚠️ [QUICK FIX] Error loading page ${chunk[j]}:`, result.reason);
          extraData[i + j] = [];
        }
      }
    }

    const allData = [firstPageData, ...extraData].flat();
    console.log(`✅ [QUICK FIX] Loaded total of ${allData.length} records for ${organism}`);
    
    // Return both the data and the metadata for fast initialization
    return { data: allData, metadata };
  } catch (error) {
    console.error(`❌ [QUICK FIX] Error loading ${organism}:`, error);
    throw error;
  }
}
