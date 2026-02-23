/**
 * Smart Data Processing Service
 *
 * This service provides a simple but effective solution to the freezing issue:
 * 1. Load data normally (but with timeout protection)
 * 2. Process genotypes using Web Workers or batch processing
 * 3. Show meaningful progress to users
 * 4. Prevent UI blocking with smart scheduling
 */

class SmartDataProcessor {
  constructor() {
    this.processingQueue = [];
    this.isProcessing = false;
  }

  /**
   * Load data with timeout protection and smart processing
   */
  async loadDataSafely(organism, dispatch) {
    console.log(`🛡️ Loading ${organism} with timeout protection...`);

    try {
      // Map organism to correct endpoint
      const endpointMap = {
        'styphi': 'getDataForSTyphi',
        'kpneumo': 'getDataForKpneumo',
        'ngono': 'getDataForNgono',
        'ecoli': 'getDataForEcoli',
        'decoli': 'getDataForDEcoli',
        'shige': 'getDataForShige',
        'saureus': 'getDataForSaureus',
        'spneumo': 'getDataForSpneumo',
        'senterica': 'getDataForSenterica',
        'sentericaints': 'getDataForSentericaints'
      };

      const endpoint = endpointMap[organism];
      if (!endpoint) {
        throw new Error(`Unknown organism: ${organism}`);
      }

      // Step 1: Load data with aggressive timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(`/api/${endpoint}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Data loaded: ${data.length} records for ${organism}`);

      // Step 2: Process data with smart scheduling
      const processedData = await this.processDataSmart(data, organism, dispatch);

      return {
        success: true,
        data: processedData,
        totalProcessed: data.length,
        method: 'smart-processor'
      };

    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`⏰ Request timeout for ${organism} - trying fallback...`);
        return {
          success: false,
          error: 'Request timeout - please try again',
          fallback: true
        };
      }

      console.error(`❌ Error loading ${organism}:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Process data using smart batching to prevent UI freezing
   */
  async processDataSmart(data, organism, dispatch) {
    console.log(`🧠 Smart processing ${data.length} records for ${organism}...`);

    // Extract all data into organized structure
    const allGenotypes = new Set();
    const allCountries = new Set();
    const allYears = new Set();
    const allPMID = new Set();
    const allPathovar = new Set();
    const allSerotype = new Set();

    // For large datasets, use batch processing
    if (data.length > 50000) {
      await this.processBatchedData(data, organism, allGenotypes, allCountries, allYears, allPMID, allPathovar, allSerotype);
    } else {
      // For smaller datasets, process normally but with yielding
      await this.processWithYieldingData(data, organism, allGenotypes, allCountries, allYears, allPMID, allPathovar, allSerotype);
    }

    // Convert to arrays and sort
    const genotypesArray = Array.from(allGenotypes).sort();
    const countriesArray = Array.from(allCountries).sort();
    const yearsArray = Array.from(allYears).sort();
    const pmidArray = Array.from(allPMID);
    const pathovarArray = Array.from(allPathovar).sort();
    const serotypeArray = Array.from(allSerotype).sort();

    // Return processed data in expected format
    return {
      countries: countriesArray,
      years: yearsArray,
      batchSummary: {
        totalGenomes: data.length,
        actualGenomes: data.length,
        totalGenotypes: genotypesArray.length,
        actualGenotypes: genotypesArray.length,
        genotypes: genotypesArray,
        pmid: pmidArray,
        pathovar: pathovarArray,
        serotype: serotypeArray
      }
    };
  }

  /**
   * Process very large datasets in batches (without Redux dispatch)
   */
  async processBatchedData(data, organism, allGenotypes, allCountries, allYears, allPMID, allPathovar, allSerotype) {
    console.log(`📦 Batch processing ${data.length} records...`);

    const batchSize = 5000;
    const totalBatches = Math.ceil(data.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const batch = data.slice(start, end);

      this.extractDataFromBatchSimple(batch, organism, allGenotypes, allCountries, allYears, allPMID, allPathovar, allSerotype);

      // Yield control after each batch
      if (i < totalBatches - 1) {
        await new Promise(resolve => {
          if (window.requestIdleCallback) {
            requestIdleCallback(resolve);
          } else {
            setTimeout(resolve, 1);
          }
        });
      }

      // Log progress for large datasets
      if (totalBatches > 10 && i % 10 === 0) {
        console.log(`📊 Processed ${i + 1}/${totalBatches} batches...`);
      }
    }

    console.log(`✅ Batch processing complete: ${allGenotypes.size} genotypes found`);
  }

  /**
   * Process smaller datasets with periodic yielding (without Redux dispatch)
   */
  async processWithYieldingData(data, organism, allGenotypes, allCountries, allYears, allPMID, allPathovar, allSerotype) {
    console.log(`⚡ Processing ${data.length} records with yielding...`);

    const yieldInterval = 2000; // Yield every 2000 records

    for (let i = 0; i < data.length; i += yieldInterval) {
      const batch = data.slice(i, i + yieldInterval);
      this.extractDataFromBatchSimple(batch, organism, allGenotypes, allCountries, allYears, allPMID, allPathovar, allSerotype);

      // Yield control back to browser
      if (i + yieldInterval < data.length) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    console.log(`✅ Processing complete: ${allGenotypes.size} genotypes found`);
  }

  /**
   * Extract data from a batch of records (simplified version)
   */
  extractDataFromBatchSimple(batch, organism, allGenotypes, allCountries, allYears, allPMID, allPathovar, allSerotype) {
    batch.forEach(record => {
      // Country
      if (record.COUNTRY_ONLY && record.COUNTRY_ONLY !== ' ') {
        allCountries.add(record.COUNTRY_ONLY);
      }

      // Genotype
      if (record.GENOTYPE) {
        allGenotypes.add(record.GENOTYPE.toString());
      }

      // Year
      if (record.DATE) {
        allYears.add(record.DATE);
      }

      // PMID
      if (record.PMID) {
        allPMID.add(record.PMID);
      }

      // Organism-specific fields
      if (['ecoli', 'shige', 'decoli'].includes(organism) && record.Pathovar) {
        allPathovar.add(record.Pathovar);
      }

      if (['decoli', 'ecoli', 'shige'].includes(organism) && record.Serotype) {
        allSerotype.add(record.Serotype);
      }

      if (['sentericaints'].includes(organism) && record.SISTR1_Serovar) {
        allPathovar.add(record.SISTR1_Serovar);
      }

      if (['senterica'].includes(organism) && record['SISTR1 Serovar']) {
        allPathovar.add(record['SISTR1 Serovar']);
      }
    });
  }

  /**
   * Process very large datasets in batches
   */
  async processBatched(data, organism, dispatch, actions) {
    console.log(`📦 Batch processing ${data.length} records...`);

    const batchSize = 5000;
    const totalBatches = Math.ceil(data.length / batchSize);

    // Initialize with empty sets
    const allGenotypes = new Set();
    const allCountries = new Set();
    const allYears = new Set();
    const allPathovar = new Set();
    const allSerotype = new Set();

    // Process first batch immediately for quick display
    const firstBatch = data.slice(0, batchSize);
    this.extractDataFromBatch(firstBatch, organism, allGenotypes, allCountries, allYears, allPathovar, allSerotype);

    // Update UI with first batch
    this.updateUIWithData(organism, dispatch, actions, allGenotypes, allCountries, allYears, allPathovar, allSerotype, data.length);

    // Process remaining batches with yielding
    for (let i = 1; i < totalBatches; i++) {
      const batch = data.slice(i * batchSize, (i + 1) * batchSize);

      // Use requestIdleCallback or setTimeout for non-blocking processing
      await new Promise(resolve => {
        const processNextBatch = () => {
          this.extractDataFromBatch(batch, organism, allGenotypes, allCountries, allYears, allPathovar, allSerotype);

          // Update UI every few batches
          if (i % 3 === 0 || i === totalBatches - 1) {
            this.updateUIWithData(organism, dispatch, actions, allGenotypes, allCountries, allYears, allPathovar, allSerotype, data.length);
          }

          console.log(`📊 Processed batch ${i + 1}/${totalBatches} (${Math.round((i + 1) / totalBatches * 100)}%)`);
          resolve();
        };

        if (window.requestIdleCallback) {
          window.requestIdleCallback(processNextBatch, { timeout: 50 });
        } else {
          setTimeout(processNextBatch, 10);
        }
      });
    }

    console.log(`✅ Batch processing complete: ${allGenotypes.size} genotypes found`);
  }

  /**
   * Process smaller datasets with periodic yielding
   */
  async processWithYielding(data, organism, dispatch, actions) {
    console.log(`⚡ Processing ${data.length} records with yielding...`);

    const allGenotypes = new Set();
    const allCountries = new Set();
    const allYears = new Set();
    const allPathovar = new Set();
    const allSerotype = new Set();

    const yieldInterval = 2000; // Yield every 2000 records

    for (let i = 0; i < data.length; i += yieldInterval) {
      const batch = data.slice(i, i + yieldInterval);
      this.extractDataFromBatch(batch, organism, allGenotypes, allCountries, allYears, allPathovar, allSerotype);

      // Yield control back to browser
      if (i + yieldInterval < data.length) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    // Update UI with final data
    this.updateUIWithData(organism, dispatch, actions, allGenotypes, allCountries, allYears, allPathovar, allSerotype, data.length);

    console.log(`✅ Processing complete: ${allGenotypes.size} genotypes found`);
  }

  /**
   * Extract data from a batch of records
   */
  extractDataFromBatch(batch, organism, allGenotypes, allCountries, allYears, allPathovar, allSerotype) {
    batch.forEach(record => {
      // Country
      if (record.COUNTRY_ONLY && record.COUNTRY_ONLY !== ' ') {
        allCountries.add(record.COUNTRY_ONLY);
      }

      // Genotype
      if (record.GENOTYPE) {
        allGenotypes.add(record.GENOTYPE.toString());
      }

      // Year
      if (record.DATE) {
        allYears.add(record.DATE);
      }

      // Organism-specific fields
      if (['ecoli', 'shige', 'decoli'].includes(organism) && record.Pathovar) {
        allPathovar.add(record.Pathovar);
      }

      if (['decoli', 'ecoli', 'shige'].includes(organism) && record.Serotype) {
        allSerotype.add(record.Serotype);
      }

      if (['sentericaints'].includes(organism) && record.SISTR1_Serovar) {
        allPathovar.add(record.SISTR1_Serovar);
      }

      if (['senterica'].includes(organism) && record['SISTR1 Serovar']) {
        allPathovar.add(record['SISTR1 Serovar']);
      }
    });
  }

  /**
   * Update Redux state with processed data
   */
  updateUIWithData(organism, dispatch, actions, allGenotypes, allCountries, allYears, allPathovar, allSerotype, totalRecords) {
    const genotypesArray = Array.from(allGenotypes).sort();
    const countriesArray = Array.from(allCountries).sort();
    const yearsArray = Array.from(allYears).sort();
    const pathovarArray = Array.from(allPathovar).sort();
    const serotypeArray = Array.from(allSerotype).sort();

    // Update Redux state
    dispatch(actions.setTotalGenomes(totalRecords));
    dispatch(actions.setActualGenomes(totalRecords));
    dispatch(actions.setTotalGenotypes(genotypesArray.length));
    dispatch(actions.setActualGenotypes(genotypesArray.length));
    dispatch(actions.setGenotypesForFilter(genotypesArray));
    dispatch(actions.setYears(yearsArray));
    dispatch(actions.setCountriesForFilter(countriesArray));

    // Set lineages
    if (pathovarArray.length > 0) {
      dispatch(actions.setPathovar(pathovarArray));
      if (organism === 'kpneumo') {
        dispatch(actions.setSelectedLineages(['ESBL+', 'CARB+']));
      } else {
        dispatch(actions.setSelectedLineages(pathovarArray));
      }
    }

    if (serotypeArray.length > 0) {
      dispatch(actions.setSerotype(serotypeArray));
    }
  }

  /**
   * Fallback loading for when main endpoint times out
   */
  async tryFallbackLoading(organism, dispatch, actions) {
    console.log(`🔄 Trying fallback loading for ${organism}...`);

    try {
      // Try the optimized summary endpoint
      const summaryResponse = await fetch(`/api/optimized/summary/${organism}`, {
        timeout: 15000
      });

      if (summaryResponse.ok) {
        const summary = await summaryResponse.json();
        console.log(`📊 Fallback summary loaded: ${summary.totalDocuments} documents`);

        // Set basic data from summary
        dispatch(actions.setTotalGenomes(summary.totalDocuments || 0));
        dispatch(actions.setActualGenomes(summary.totalDocuments || 0));
        dispatch(actions.setTotalGenotypes(summary.genotypeCount || 0));
        dispatch(actions.setActualGenotypes(summary.genotypeCount || 0));
        dispatch(actions.setCountriesForFilter(summary.countries || []));

        // Return empty array but indicate this is fallback data
        return {
          fallback: true,
          summary: summary,
          message: 'Loaded summary data due to timeout. Some features may be limited.'
        };
      }
    } catch (fallbackError) {
      console.error('Fallback loading also failed:', fallbackError);
    }

    throw new Error(`Failed to load data for ${organism} - please try again`);
  }
}

// Export singleton instance
const smartDataProcessor = new SmartDataProcessor();
export default smartDataProcessor;
