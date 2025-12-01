/**
 * Progressive Genotype Loading Service
 *
 * Handles background loading of genotypes to prevent UI freezing
 * Starts with immediate basic data and progressively loads genotypes
 */

class ProgressiveGenotypeLoader {
  constructor() {
    this.isLoading = false;
    this.loadingQueue = new Map();
    this.cache = new Map();
  }

  /**
   * Initialize immediate data (everything except genotypes)
   * This allows the UI to render immediately with 0 genotypes
   */
  extractImmediateData(responseData, regions, organism, dispatch, actions) {
    console.log('🚀 Progressive Loading: Extracting immediate data...');

    const dataLength = responseData.length;

    // Set basic genome counts immediately
    dispatch(actions.setTotalGenomes(dataLength));
    dispatch(actions.setActualGenomes(dataLength));

    // Initialize genotype counts to 0 (will be updated in background)
    dispatch(actions.setTotalGenotypes(0));
    dispatch(actions.setActualGenotypes(0));
    dispatch(actions.setGenotypesForFilter([]));

    // Get regions immediately (lightweight operation)
    const ecRegions = {};
    regions.forEach(item => {
      const region = item['Sub-region Name'];
      if (!region) return;

      if (!(region in ecRegions)) {
        ecRegions[region] = [];
      }

      const country = this.getCountryDisplayName(item['Country or Area']);
      ecRegions[region].push(country);
    });

    // Extract lightweight data immediately
    const yearsSet = new Set();
    const countriesSet = new Set();
    const PMIDSet = new Set();
    const pathovarSet = new Set();
    const serotypeSet = new Set();

    // Quick scan for non-genotype data (much faster)
    responseData.forEach(x => {
      const country = this.getCountryDisplayName(x.COUNTRY_ONLY);
      if (country !== ' ') countriesSet.add(country);

      yearsSet.add(x.DATE);
      if ('PMID' in x) PMIDSet.add(x['PMID']);

      // Extract pathotype/serotype data
      if (['sentericaints'].includes(organism)) {
        pathovarSet.add(x.SISTR1_Serovar);
      }
      if (['ecoli', 'shige', 'decoli'].includes(organism)) {
        pathovarSet.add(x.Pathovar);
      }
      if (['senterica'].includes(organism)) {
        pathovarSet.add(x['SISTR1 Serovar']);
      }
      if (['decoli', 'ecoli', 'shige'].includes(organism)) {
        serotypeSet.add(x.Serotype);
      }
    });

    const years = Array.from(yearsSet).sort();
    const countries = Array.from(countriesSet).sort();
    const PMID = Array.from(PMIDSet);
    const pathovar = Array.from(pathovarSet).sort();
    const serotype = Array.from(serotypeSet).sort();

    // Set lineages immediately
    if (pathovar.length > 0) {
      dispatch(actions.setSelectedLineages(pathovar));
    }
    if (organism === 'kpneumo') {
      dispatch(actions.setSelectedLineages(['ESBL+', 'CARB+']));
    }

    // Set immediate values (no genotypes yet)
    dispatch(actions.setYears(years));
    dispatch(actions.setCountriesForFilter(countries));
    dispatch(actions.setPMID(PMID));
    dispatch(actions.setPathovar(pathovar));
    dispatch(actions.setSerotype(serotype));

    // Set regions
    Object.keys(ecRegions).forEach(key => {
      ecRegions[key] = ecRegions[key].filter(country => countries.includes(country)).sort();
      if (ecRegions[key].length === 0) {
        delete ecRegions[key];
      }
    });

    dispatch(actions.setEconomicRegions(ecRegions));

    console.log('✅ Progressive Loading: Immediate data set (genotypes loading in background)');

    return {
      ecRegions,
      years,
      countries,
      PMID,
      pathovar,
      serotype
    };
  }

  /**
   * Load genotypes in background without blocking UI
   */
  async loadGenotypesInBackground(responseData, organism, dispatch, actions, immediateData) {
    if (this.isLoading) {
      console.log('⏳ Genotypes already loading...');
      return;
    }

    this.isLoading = true;
    console.log('🧬 Progressive Loading: Starting genotype extraction in background...');

    // Use requestIdleCallback for non-blocking processing
    return new Promise((resolve) => {
      const processGenotypes = (deadline) => {
        const genotypesSet = new Set();
        let processed = 0;
        const batchSize = 1000; // Process in batches

        while (processed < responseData.length && (deadline.timeRemaining() > 0 || deadline.didTimeout)) {
          const endIndex = Math.min(processed + batchSize, responseData.length);

          for (let i = processed; i < endIndex; i++) {
            const x = responseData[i];
            const genotypeKey = 'GENOTYPE';
            if (genotypeKey in x) {
              genotypesSet.add(x[genotypeKey]?.toString());
            }
          }

          processed = endIndex;

          // Update progress for large datasets
          if (responseData.length > 10000) {
            const progress = Math.round((processed / responseData.length) * 100);
            console.log(`🧬 Genotype processing: ${progress}% (${processed}/${responseData.length})`);
          }
        }

        if (processed < responseData.length) {
          // Continue processing in next idle period
          requestIdleCallback(processGenotypes, { timeout: 50 });
        } else {
          // Genotype processing complete
          const genotypes = Array.from(genotypesSet).sort((a, b) => a.localeCompare(b));

          console.log(`✅ Progressive Loading: Genotypes loaded (${genotypes.length} total)`);

          // Update Redux state with genotypes
          dispatch(actions.setTotalGenotypes(genotypes.length));
          dispatch(actions.setActualGenotypes(genotypes.length));
          dispatch(actions.setGenotypesForFilter(genotypes));

          // Generate color palette for genotypes
          if (organism !== 'styphi' && organism !== 'senterica') {
            // Import dynamically when needed
            import('../util/colorHelper').then(({ generatePalleteForGenotypes }) => {
              dispatch(actions.setColorPallete(generatePalleteForGenotypes(genotypes)));
            }).catch(console.error);
          } else if (organism === 'senterica') {
            // Import dynamically when needed
            import('../util/colorHelper').then(({ generatePalleteForGenotypes }) => {
              dispatch(actions.setColorPallete(generatePalleteForGenotypes(genotypes)));
            }).catch(console.error);
          }

          this.isLoading = false;
          resolve({
            genotypes,
            ...immediateData
          });
        }
      };

      // Start processing
      requestIdleCallback(processGenotypes, { timeout: 50 });
    });
  }

  /**
   * Progressive data loading with immediate UI rendering
   */
  async progressiveDataLoad(responseData, regions, organism, dispatch, actions) {
    // Step 1: Extract and set immediate data (non-blocking)
    const immediateData = this.extractImmediateData(responseData, regions, organism, dispatch, actions);

    // Step 2: Start genotype loading in background
    const genotypePromise = this.loadGenotypesInBackground(responseData, organism, dispatch, actions, immediateData);

    // Return immediate data so UI can render, genotypes will update when ready
    return {
      immediate: immediateData,
      genotypesPromise: genotypePromise
    };
  }

  /**
   * Helper method for country display names
   */
  getCountryDisplayName(country) {
    // Simple implementation - the actual function can be imported when needed
    return country || ' ';
  }  /**
   * Check if genotypes are still loading
   */
  isGenotypeLoading() {
    return this.isLoading;
  }

  /**
   * Get cached genotypes if available
   */
  getCachedGenotypes(organism) {
    return this.cache.get(organism);
  }

  /**
   * Cache genotypes for organism
   */
  setCachedGenotypes(organism, genotypes) {
    this.cache.set(organism, genotypes);
  }
}

// Export singleton instance
const progressiveGenotypeLoader = new ProgressiveGenotypeLoader();
export default progressiveGenotypeLoader;
