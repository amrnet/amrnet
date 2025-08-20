// Progressive Data Loader - Prevents browser freezing by loading data in chunks
import axios from 'axios';

class ProgressiveDataLoader {
  constructor() {
    this.onProgress = null;
    this.onComplete = null;
    this.onError = null;
  }

  async loadOrganismData(organism, callbacks = {}) {
    this.onProgress = callbacks.onProgress || (() => {});
    this.onComplete = callbacks.onComplete || (() => {});
    this.onError = callbacks.onError || (() => {});

    try {
      console.log(`🔄 [PROGRESSIVE] Starting progressive load for ${organism}`);

      // Step 1: Get summary first (instant feedback)
      this.onProgress({
        stage: 'summary',
        message: 'Loading summary...',
        percentage: 10
      });

      const summaryResponse = await axios.get(`/api/optimized/summary/${organism}`);
      const { totalDocuments } = summaryResponse.data;

      console.log(`📊 [PROGRESSIVE] ${organism} has ${totalDocuments.toLocaleString()} total documents`);

      // Step 2: Load essential map data first (small, fast)
      this.onProgress({
        stage: 'map',
        message: 'Loading map data...',
        percentage: 25
      });

      const mapResponse = await axios.get(`/api/optimized/map/${organism}`);

      this.onProgress({
        stage: 'map_complete',
        message: 'Map data loaded',
        percentage: 40,
        data: {
          mapData: mapResponse.data,
          summary: summaryResponse.data
        }
      });

      // Step 3: Determine loading strategy based on dataset size
      if (totalDocuments > 50000) {
        // Large datasets: Use pagination
        await this.loadLargeDatasetProgressive(organism, totalDocuments);
      } else {
        // Smaller datasets: Load all at once
        await this.loadSmallDataset(organism);
      }

    } catch (error) {
      console.error(`❌ [PROGRESSIVE] Error loading ${organism}:`, error);
      this.onError(error);
    }
  }

  async loadLargeDatasetProgressive(organism, totalDocuments) {
    console.log(`📦 [PROGRESSIVE] Loading large dataset for ${organism} progressively`);

    const pageSize = 5000; // Load 5K records at a time
    const totalPages = Math.ceil(totalDocuments / pageSize);
    let allData = [];

    for (let page = 1; page <= totalPages; page++) {
      this.onProgress({
        stage: 'data_loading',
        message: `Loading batch ${page}/${totalPages}...`,
        percentage: 40 + (page / totalPages * 50),
        currentRecords: allData.length,
        totalRecords: totalDocuments
      });

      try {
        const response = await axios.get(`/api/optimized/paginated/${organism}`, {
          params: { page, limit: pageSize },
          timeout: 30000
        });

        const batch = response.data.data || [];
        allData = allData.concat(batch);

        // Update UI with current batch (progressive rendering)
        this.onProgress({
          stage: 'data_batch',
          message: `Loaded ${allData.length.toLocaleString()} of ${totalDocuments.toLocaleString()} records`,
          percentage: 40 + (page / totalPages * 50),
          data: {
            partialData: allData,
            isComplete: page === totalPages,
            batch: batch
          }
        });

        // Small delay to prevent UI blocking
        await new Promise(resolve => setTimeout(resolve, 10));

      } catch (error) {
        console.error(`❌ [PROGRESSIVE] Error loading page ${page}:`, error);
        // Continue with next page instead of failing completely
      }
    }

    this.onComplete({
      data: allData,
      totalRecords: allData.length,
      message: `Successfully loaded ${allData.length.toLocaleString()} records`
    });
  }

  async loadSmallDataset(organism) {
    console.log(`📦 [PROGRESSIVE] Loading small dataset for ${organism} at once`);

    this.onProgress({
      stage: 'data_loading',
      message: 'Loading full dataset...',
      percentage: 60
    });

    // For smaller datasets, we can use the optimized full endpoints
    const response = await axios.get(`/api/optimized/getDataFor${organism.charAt(0).toUpperCase() + organism.slice(1)}`, {
      timeout: 60000
    });

    this.onProgress({
      stage: 'data_processing',
      message: 'Processing data...',
      percentage: 90
    });

    this.onComplete({
      data: response.data,
      totalRecords: response.data.length,
      message: `Successfully loaded ${response.data.length.toLocaleString()} records`
    });
  }
}

export default ProgressiveDataLoader;
