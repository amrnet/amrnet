/**
 * Robust Chunked Data Loader
 *
 * This service implements a sophisticated chunked loading strategy that:
 * 1. Loads data in small chunks to prevent freezing
 * 2. Displays partial data immediately for better UX
 * 3. Progressively enhances the display as more data loads
 * 4. Handles large datasets (E.coli, K.pneumoniae, D.E.coli) gracefully
 */

import axios from 'axios';

class ChunkedDataLoader {
  constructor() {
    this.cache = new Map();
    this.loadingState = new Map();
    this.chunkSize = 2000; // Process 2K records at a time
    this.displayChunkSize = 5000; // Display 5K records at a time
    this.maxInitialLoad = 10000; // Show first 10K records immediately
  }

  /**
   * Load organism data with chunked progressive loading
   * This prevents freezing by loading data in manageable chunks
   */
  async loadOrganismDataChunked(organism, dispatch, actions, endpoint) {
    console.log(`🧩 Starting chunked loading for ${organism}...`);

    try {
      // Step 1: Get data size and basic info first
      const summaryResponse = await axios.get(`/api/optimized/summary/${organism}`, {
        timeout: 10000
      });

      const totalDocuments = summaryResponse.data.totalDocuments || 0;
      console.log(`📊 ${organism}: ${totalDocuments} total documents to load`);

      // Step 2: Load first chunk for immediate display
      const firstChunkSize = Math.min(this.maxInitialLoad, totalDocuments);
      const firstChunkResponse = await axios.get(`/api/optimized/paginated/${organism}`, {
        params: {
          page: 1,
          limit: firstChunkSize,
          dataType: 'full'
        },
        timeout: 15000
      });

      const firstChunkData = firstChunkResponse.data.data || [];
      console.log(`✅ First chunk loaded: ${firstChunkData.length} records`);

      // Step 3: Process first chunk immediately for basic UI
      const basicData = await this.processChunkForBasicDisplay(firstChunkData, organism, dispatch, actions);

      // Step 4: Start loading remaining chunks in background
      if (totalDocuments > firstChunkSize) {
        this.loadRemainingChunksBackground(
          organism,
          firstChunkSize,
          totalDocuments,
          firstChunkData,
          dispatch,
          actions,
          basicData
        );
      }

      return {
        success: true,
        initialData: firstChunkData,
        basicData,
        isPartial: totalDocuments > firstChunkSize,
        totalDocuments,
        loadedDocuments: firstChunkData.length
      };

    } catch (error) {
      console.error(`❌ Error in chunked loading for ${organism}:`, error);
      throw error;
    }
  }

  /**
   * Process first chunk to get basic data for immediate UI display
   */
  async processChunkForBasicDisplay(chunkData, organism, dispatch, actions) {
    console.log(`🔄 Processing first chunk for basic display...`);

    // Get basic metrics from first chunk
    const countries = new Set();
    const years = new Set();
    const genotypesPreview = new Set();
    const pathovarPreview = new Set();
    const serotypePreview = new Set();

    // Quick scan of first chunk (much faster than full dataset)
    chunkData.forEach(record => {
      if (record.COUNTRY_ONLY) countries.add(record.COUNTRY_ONLY);
      if (record.DATE) years.add(record.DATE);
      if (record.GENOTYPE && genotypesPreview.size < 100) { // Limit genotypes for speed
        genotypesPreview.add(record.GENOTYPE);
      }

      // Handle organism-specific fields
      if (['ecoli', 'shige', 'decoli'].includes(organism) && record.Pathovar) {
        pathovarPreview.add(record.Pathovar);
      }
      if (['decoli', 'ecoli', 'shige'].includes(organism) && record.Serotype) {
        serotypePreview.add(record.Serotype);
      }
    });

    const basicData = {
      countries: Array.from(countries).sort(),
      years: Array.from(years).sort(),
      genotypesPreview: Array.from(genotypesPreview).sort(),
      pathovarPreview: Array.from(pathovarPreview).sort(),
      serotypePreview: Array.from(serotypePreview).sort(),
      recordCount: chunkData.length
    };

    // Dispatch basic data immediately
    dispatch(actions.setTotalGenomes(chunkData.length)); // Will be updated later
    dispatch(actions.setActualGenomes(chunkData.length));
    dispatch(actions.setYears(basicData.years));
    dispatch(actions.setCountriesForFilter(basicData.countries));

    // Set initial genotypes (limited set for speed)
    dispatch(actions.setTotalGenotypes(basicData.genotypesPreview.length));
    dispatch(actions.setActualGenotypes(basicData.genotypesPreview.length));
    dispatch(actions.setGenotypesForFilter(basicData.genotypesPreview));

    if (basicData.pathovarPreview.length > 0) {
      dispatch(actions.setPathovar(basicData.pathovarPreview));
      if (organism === 'kpneumo') {
        dispatch(actions.setSelectedLineages(['ESBL+', 'CARB+']));
      } else {
        dispatch(actions.setSelectedLineages(basicData.pathovarPreview));
      }
    }

    if (basicData.serotypePreview.length > 0) {
      dispatch(actions.setSerotype(basicData.serotypePreview));
    }

    console.log(`✅ Basic display ready with ${basicData.genotypesPreview.length} genotypes`);
    return basicData;
  }

  /**
   * Load remaining chunks in background without blocking UI
   */
  async loadRemainingChunksBackground(organism, loadedCount, totalCount, existingData, dispatch, actions, basicData) {
    console.log(`🔄 Loading remaining ${totalCount - loadedCount} records in background...`);

    try {
      const remainingCount = totalCount - loadedCount;
      const totalPages = Math.ceil(remainingCount / this.displayChunkSize);
      let allData = [...existingData];
      let currentPage = 2; // We already loaded page 1

      // Load chunks progressively
      for (let page = currentPage; page <= totalPages + 1; page++) {
        // Use requestIdleCallback to avoid blocking
        await new Promise(resolve => {
          if (window.requestIdleCallback) {
            window.requestIdleCallback(async () => {
              try {
                const chunkResponse = await axios.get(`/api/optimized/paginated/${organism}`, {
                  params: {
                    page,
                    limit: this.displayChunkSize,
                    dataType: 'full'
                  },
                  timeout: 15000
                });

                const chunkData = chunkResponse.data.data || [];
                if (chunkData.length > 0) {
                  allData = [...allData, ...chunkData];

                  // Update display every few chunks
                  if (page % 2 === 0 || page === totalPages + 1) {
                    await this.updateDisplayWithNewData(allData, organism, dispatch, actions, totalCount);
                  }

                  console.log(`📦 Loaded chunk ${page}: ${allData.length}/${totalCount} records`);
                }
              } catch (error) {
                console.error(`❌ Error loading chunk ${page}:`, error);
              }
              resolve();
            }, { timeout: 100 });
          } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(async () => {
              try {
                const chunkResponse = await axios.get(`/api/optimized/paginated/${organism}`, {
                  params: {
                    page,
                    limit: this.displayChunkSize,
                    dataType: 'full'
                  },
                  timeout: 15000
                });

                const chunkData = chunkResponse.data.data || [];
                if (chunkData.length > 0) {
                  allData = [...allData, ...chunkData];

                  if (page % 2 === 0 || page === totalPages + 1) {
                    await this.updateDisplayWithNewData(allData, organism, dispatch, actions, totalCount);
                  }

                  console.log(`📦 Loaded chunk ${page}: ${allData.length}/${totalCount} records`);
                }
              } catch (error) {
                console.error(`❌ Error loading chunk ${page}:`, error);
              }
              resolve();
            }, 100);
          }
        });

        // Small delay between chunks to keep UI responsive
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      console.log(`✅ Background loading complete: ${allData.length} total records loaded`);

    } catch (error) {
      console.error(`❌ Error in background chunk loading:`, error);
    }
  }

  /**
   * Update display with newly loaded data
   */
  async updateDisplayWithNewData(allData, organism, dispatch, actions, totalCount) {
    console.log(`🔄 Updating display with ${allData.length} records...`);

    // Process all genotypes from loaded data
    const allGenotypes = new Set();
    const allCountries = new Set();
    const allYears = new Set();
    const allPathovar = new Set();
    const allSerotype = new Set();

    // Process in smaller batches to avoid blocking
    const batchSize = 1000;
    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);

      batch.forEach(record => {
        if (record.COUNTRY_ONLY) allCountries.add(record.COUNTRY_ONLY);
        if (record.DATE) allYears.add(record.DATE);
        if (record.GENOTYPE) allGenotypes.add(record.GENOTYPE);

        if (['ecoli', 'shige', 'decoli'].includes(organism) && record.Pathovar) {
          allPathovar.add(record.Pathovar);
        }
        if (['decoli', 'ecoli', 'shige'].includes(organism) && record.Serotype) {
          allSerotype.add(record.Serotype);
        }
      });

      // Yield control back to browser
      if (i % (batchSize * 5) === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    // Update Redux state with complete data
    dispatch(actions.setTotalGenomes(allData.length));
    dispatch(actions.setActualGenomes(allData.length));
    dispatch(actions.setTotalGenotypes(allGenotypes.size));
    dispatch(actions.setActualGenotypes(allGenotypes.size));
    dispatch(actions.setGenotypesForFilter(Array.from(allGenotypes).sort()));
    dispatch(actions.setYears(Array.from(allYears).sort()));
    dispatch(actions.setCountriesForFilter(Array.from(allCountries).sort()));

    if (allPathovar.size > 0) {
      dispatch(actions.setPathovar(Array.from(allPathovar).sort()));
    }

    if (allSerotype.size > 0) {
      dispatch(actions.setSerotype(Array.from(allSerotype).sort()));
    }

    console.log(`✅ Display updated: ${allGenotypes.size} genotypes, ${allData.length}/${totalCount} records`);
  }

  /**
   * Check if organism is currently loading
   */
  isLoading(organism) {
    return this.loadingState.has(organism);
  }

  /**
   * Set loading state
   */
  setLoading(organism, loading) {
    if (loading) {
      this.loadingState.set(organism, true);
    } else {
      this.loadingState.delete(organism);
    }
  }
}

// Export singleton instance
const chunkedDataLoader = new ChunkedDataLoader();
export default chunkedDataLoader;
