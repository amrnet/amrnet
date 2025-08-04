import axios from 'axios';
import progressiveGenotypeLoader from './progressiveGenotypeLoader';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || '/api';

// Large dataset organisms requiring special handling
const LARGE_DATASET_ORGANISMS = ['ecoli', 'kpneumo', 'decoli'];

// Enhanced data service with parallel loading and caching
// Specifically designed to address Heroku dyno memory constraints and Atlas query optimization
class OptimizedDataService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.performanceMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      averageResponseTime: 0,
      totalDataTransferred: 0
    };

    // Organism-specific optimization strategies
    this.organismStrategies = {
      ecoli: { usePagination: true, pageSize: 5000, priorityFields: ['COUNTRY_ONLY', 'DATE', 'GENOTYPE'] },
      kpneumo: { usePagination: false, optimizedProjection: true, priorityFields: ['COUNTRY_ONLY', 'DATE', 'GENOTYPE', 'ESBL_category'] },
      decoli: { usePagination: false, optimizedProjection: true, priorityFields: ['COUNTRY_ONLY', 'DATE', 'GENOTYPE', 'ESBL_category'] }
    };
  }

  // Generate cache key
  generateCacheKey(endpoint, filters = {}) {
    return `${endpoint}_${JSON.stringify(filters)}`;
  }

  // Generic fetch with caching and Heroku-specific optimizations
  async fetchWithCache(endpoint, filters = {}, forceRefresh = false) {
    const cacheKey = this.generateCacheKey(endpoint, filters);
    const startTime = performance.now();

    // Return cached data if available and not forcing refresh
    // This reduces Heroku dyno CPU usage and Atlas query load
    if (!forceRefresh && this.cache.has(cacheKey)) {
      this.performanceMetrics.cacheHits++;
      console.log(`🎯 Cache hit for ${endpoint} - saving Heroku dyno resources`);
      return this.cache.get(cacheKey);
    }

    // Check if request is already pending (deduplication for Heroku efficiency)
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`⏳ Request already pending for ${endpoint} - preventing duplicate Atlas queries`);
      return this.pendingRequests.get(cacheKey);
    }

    // Create new request with Atlas optimization headers
    const request = this.makeRequest(endpoint, filters);
    this.pendingRequests.set(cacheKey, request);

    try {
      const result = await request;
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Cache the result to prevent future Atlas queries
      this.cache.set(cacheKey, result);
      this.pendingRequests.delete(cacheKey);

      // Update performance metrics for Heroku monitoring
      this.performanceMetrics.totalRequests++;
      this.performanceMetrics.averageResponseTime =
        (this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalRequests - 1) + responseTime) /
        this.performanceMetrics.totalRequests;

      if (Array.isArray(result)) {
        const dataSize = JSON.stringify(result).length;
        this.performanceMetrics.totalDataTransferred += dataSize;
        console.log(`📈 Atlas query completed: ${result.length} records, ${(dataSize / 1024).toFixed(2)}KB transferred`);
      }

      return result;
    } catch (error) {
      this.pendingRequests.delete(cacheKey);
      console.error(`❌ Atlas query failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Make actual HTTP request with Heroku/Atlas optimizations
  async makeRequest(endpoint, filters = {}) {
    const params = Object.keys(filters).length > 0 ? { filters: JSON.stringify(filters) } : {};

    // Add compression acceptance header for Heroku bandwidth optimization
    const headers = {
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/json'
    };

    const response = await axios.get(`${API_ENDPOINT}/${endpoint}`, {
      params,
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      // Enable compression to reduce Atlas -> Heroku transfer
      decompress: true,
      // Timeout to prevent Heroku dyno blocking on slow Atlas queries
      timeout: 30000
    });

    return response.data;
  }

  // Progressive loading with immediate UI rendering and background genotype processing
  async loadOrganismDataWithProgressiveGenotypes(organism, globalFilters = {}, dispatch, actions) {
    console.log(`🚀 Progressive loading for ${organism} - UI will render immediately...`);
    const startTime = performance.now();

    try {
      // First, get essential data that doesn't require genotype processing
      const [basicMapData, regionsData] = await Promise.all([
        this.fetchWithCache(`optimized/summary/${organism}`, globalFilters),
        this.fetchWithCache('getUNR')
      ]);

      // Start progressive genotype loading (non-blocking)
      const progressivePromise = this.loadOrganismDataWithGenotypesBackground(organism, globalFilters, dispatch, actions);

      const endTime = performance.now();
      console.log(`✅ Progressive loading initiated in ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`🎯 UI can render immediately with 0 genotypes, genotypes loading in background`);

      return {
        mapData: basicMapData,
        regionsData,
        organism,
        loadTime: endTime - startTime,
        progressivePromise, // This will resolve when genotypes are loaded
        isProgressive: true
      };
    } catch (error) {
      console.error(`❌ Error in progressive loading for ${organism}:`, error);
      throw error;
    }
  }

  // Background genotype loading that doesn't block UI
  async loadOrganismDataWithGenotypesBackground(organism, globalFilters = {}, dispatch, actions) {
    console.log(`🧬 Loading full dataset for ${organism} genotype processing...`);

    try {
      // Load full dataset for genotype processing
      const fullDataPromise = this.fetchWithCache(`optimized/map/${organism}`, globalFilters);
      const regionsPromise = this.fetchWithCache('getUNR');

      const [fullData, regionsData] = await Promise.all([fullDataPromise, regionsPromise]);

      // Use progressive genotype loader for non-blocking processing
      const result = await progressiveGenotypeLoader.progressiveDataLoad(
        fullData,
        regionsData,
        organism,
        dispatch,
        actions
      );

      console.log(`✅ Background genotype processing complete for ${organism}`);

      return {
        ...result,
        fullData,
        regionsData
      };
    } catch (error) {
      console.error(`❌ Error in background genotype loading for ${organism}:`, error);
      throw error;
    }
  }

  // Load all organism data in parallel - addresses "monolithic data dump" issue
  async loadOrganismData(organism, globalFilters = {}) {
    console.log(`🚀 Loading data for ${organism} with parallel Atlas queries (Heroku optimized)...`);
    const startTime = performance.now();

    try {
      // Check if organism needs special handling due to large dataset
      if (this.organismStrategies[organism]?.usePagination) {
        return await this.loadLargeDatasetOrganism(organism, globalFilters);
      }

      // Execute multiple optimized queries in parallel instead of single 75MB query
      const [mapData, genotypesData, resistanceData, trendsData, regionsData] = await Promise.all([
        this.fetchWithCache(`optimized/map/${organism}`, globalFilters),
        this.fetchWithCache(`optimized/genotypes/${organism}`, globalFilters),
        this.fetchWithCache(`optimized/resistance/${organism}`, globalFilters),
        this.fetchWithCache(`optimized/trends/${organism}`, globalFilters),
        this.fetchWithCache('getUNR') // Regions data
      ]);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Calculate total data size vs legacy approach
      const totalRecords = [mapData, genotypesData, resistanceData, trendsData].reduce(
        (sum, data) => sum + (Array.isArray(data) ? data.length : 0), 0
      );

      console.log(`✅ Parallel loading completed in ${totalTime.toFixed(2)}ms`);
      console.log(`📊 Loaded ${totalRecords} total records across ${5} optimized endpoints`);
      console.log(`🎯 This replaces a single 75MB+ query with targeted Atlas projections`);

      return {
        mapData,
        genotypesData,
        resistanceData,
        trendsData,
        regionsData,
        organism,
        loadTime: totalTime,
        totalRecords
      };
    } catch (error) {
      console.error(`❌ Error loading parallel data for ${organism}:`, error);
      throw error;
    }
  }

  // Special loader for large datasets (E. coli with 227k+ documents)
  async loadLargeDatasetOrganism(organism, globalFilters = {}) {
    console.log(`📦 Loading large dataset ${organism} with pagination strategy...`);
    const startTime = performance.now();

    try {
      // Get summary first to understand data volume
      const summary = await this.fetchWithCache(`optimized/summary/${organism}`, globalFilters);
      console.log(`📊 ${organism} summary: ${summary.totalDocuments} documents, estimated ${summary.estimatedPayloadMB}MB`);

      // If dataset is reasonable size, load normally
      if (summary.totalDocuments < 50000) {
        console.log(`✅ Dataset size acceptable, using standard loading...`);
        return await this.loadOrganismDataStandard(organism, globalFilters);
      }

      // For very large datasets, use paginated approach
      const strategy = this.organismStrategies[organism];
      const pageSize = strategy.pageSize || 10000;

      // Load first page for immediate display
      const firstPagePromises = [
        this.fetchWithCache(`optimized/paginated/${organism}?dataType=map&page=1&limit=${pageSize}`, globalFilters),
        this.fetchWithCache(`optimized/genotypes/${organism}`, globalFilters), // Charts can still use full data if reasonable
        this.fetchWithCache(`optimized/resistance/${organism}`, globalFilters),
        this.fetchWithCache(`optimized/trends/${organism}`, globalFilters),
        this.fetchWithCache('getUNR')
      ];

      const [paginatedMapData, genotypesData, resistanceData, trendsData, regionsData] = await Promise.all(firstPagePromises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      console.log(`✅ Large dataset loading completed in ${totalTime.toFixed(2)}ms`);
      console.log(`📦 Loaded page 1/${paginatedMapData.pagination.totalPages} for map data`);
      console.log(`🎯 Reduced payload from ~${summary.estimatedPayloadMB}MB to ~${paginatedMapData.performance.payloadSize}`);

      return {
        mapData: paginatedMapData.data,
        genotypesData,
        resistanceData,
        trendsData,
        regionsData,
        organism,
        loadTime: totalTime,
        pagination: paginatedMapData.pagination,
        totalRecords: paginatedMapData.pagination.totalCount,
        isPaginated: true
      };

    } catch (error) {
      console.error(`❌ Error loading large dataset ${organism}:`, error);
      throw error;
    }
  }

  // Standard loading method for reference
  async loadOrganismDataStandard(organism, globalFilters = {}) {
    const [mapData, genotypesData, resistanceData, trendsData, regionsData] = await Promise.all([
      this.fetchWithCache(`optimized/map/${organism}`, globalFilters),
      this.fetchWithCache(`optimized/genotypes/${organism}`, globalFilters),
      this.fetchWithCache(`optimized/resistance/${organism}`, globalFilters),
      this.fetchWithCache(`optimized/trends/${organism}`, globalFilters),
      this.fetchWithCache('getUNR')
    ]);

    const totalRecords = [mapData, genotypesData, resistanceData, trendsData].reduce(
      (sum, data) => sum + (Array.isArray(data) ? data.length : 0), 0
    );

    return {
      mapData,
      genotypesData,
      resistanceData,
      trendsData,
      regionsData,
      organism,
      totalRecords,
      isPaginated: false
    };
  }

  // Load additional pages for paginated datasets
  async loadNextPage(organism, currentPage, filters = {}) {
    const strategy = this.organismStrategies[organism];
    const pageSize = strategy?.pageSize || 10000;

    console.log(`📄 Loading page ${currentPage + 1} for ${organism}...`);

    const nextPageData = await this.fetchWithCache(
      `optimized/paginated/${organism}?dataType=map&page=${currentPage + 1}&limit=${pageSize}`,
      filters
    );

    console.log(`✅ Loaded page ${nextPageData.pagination.page}/${nextPageData.pagination.totalPages}`);
    return nextPageData;
  }

  // Load convergence data for K. pneumoniae
  async loadConvergenceData(organism, groupVariable, filters = {}) {
    if (organism !== 'kpneumo') {
      return { data: [], colourVariables: [] };
    }

    try {
      const convergenceData = await this.fetchWithCache(
        `optimized/convergence/${organism}`,
        { ...filters, groupVariable }
      );

      return convergenceData;
    } catch (error) {
      console.error('Error loading convergence data:', error);
      return { data: [], colourVariables: [] };
    }
  }

  // Load global overview filter data on demand
  async loadGlobalOverviewData(organism, colorBy, selectDrugs, filters = {}) {
    try {
      const filterData = await this.fetchWithCache(
        `optimized/filters/${organism}`,
        { ...filters, colorBy, selectDrugs },
        true // Force refresh for global overview changes
      );

      return filterData;
    } catch (error) {
      console.error('Error loading global overview data:', error);
      throw error;
    }
  }

  // Load chart-specific data in parallel
  async loadChartData(organism, chartTypes = [], filters = {}) {
    console.log(`Loading chart data for ${organism}: ${chartTypes.join(', ')}`);

    const requests = chartTypes.map(chartType => {
      switch (chartType) {
        case 'map':
          return this.fetchWithCache(`optimized/map/${organism}`, filters);
        case 'genotypes':
          return this.fetchWithCache(`optimized/genotypes/${organism}`, filters);
        case 'resistance':
          return this.fetchWithCache(`optimized/resistance/${organism}`, filters);
        case 'trends':
          return this.fetchWithCache(`optimized/trends/${organism}`, filters);
        default:
          return Promise.resolve(null);
      }
    });

    try {
      const results = await Promise.all(requests);

      return chartTypes.reduce((acc, chartType, index) => {
        acc[chartType] = results[index];
        return acc;
      }, {});
    } catch (error) {
      console.error('Error loading chart data:', error);
      throw error;
    }
  }

  // Load data with global overview changes
  async updateGlobalOverview(organism, colorBy, selectDrugs) {
    console.log(`Updating global overview: colorBy=${colorBy}, selectDrugs=${selectDrugs}`);

    try {
      // Load the updated filter data
      const filterData = await this.loadGlobalOverviewData(organism, colorBy, selectDrugs);

      // If the global overview affects other charts, load them in parallel
      const [mapData, chartData] = await Promise.all([
        this.fetchWithCache(`optimized/map/${organism}`, { colorBy, selectDrugs }, true),
        this.loadChartData(organism, ['genotypes', 'resistance'], { colorBy, selectDrugs })
      ]);

      return {
        filterData,
        mapData,
        ...chartData
      };
    } catch (error) {
      console.error('Error updating global overview:', error);
      throw error;
    }
  }

  // Clear cache for specific organism or all
  clearCache(organism = null) {
    if (organism) {
      // Clear cache entries for specific organism
      for (const key of this.cache.keys()) {
        if (key.includes(organism)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  // Get cache statistics with Heroku-specific metrics
  getCacheStats() {
    const cacheSize = this.cache.size;
    const cacheHitRate = this.performanceMetrics.totalRequests > 0
      ? (this.performanceMetrics.cacheHits / this.performanceMetrics.totalRequests * 100).toFixed(2)
      : 0;

    return {
      size: cacheSize,
      keys: Array.from(this.cache.keys()),
      pendingRequests: this.pendingRequests.size,
      // Heroku-specific metrics
      performance: {
        totalRequests: this.performanceMetrics.totalRequests,
        cacheHitRate: `${cacheHitRate}%`,
        averageResponseTime: `${this.performanceMetrics.averageResponseTime.toFixed(2)}ms`,
        totalDataTransferred: `${(this.performanceMetrics.totalDataTransferred / 1024 / 1024).toFixed(2)}MB`,
        memoryEfficiency: `${cacheSize} cached datasets preventing Atlas re-queries`
      }
    };
  }

  // Log performance summary for Heroku monitoring
  logPerformanceSummary() {
    const stats = this.getCacheStats();
    console.log('🏆 AMRnet Performance Summary (Heroku/Atlas Optimized):');
    console.log(`   📊 Cache Hit Rate: ${stats.performance.cacheHitRate}`);
    console.log(`   ⚡ Average Response: ${stats.performance.averageResponseTime}`);
    console.log(`   💾 Data Transferred: ${stats.performance.totalDataTransferred}`);
    console.log(`   🎯 Atlas Queries Saved: ${stats.performance.cacheHitRate} of requests served from cache`);
    console.log(`   🚀 Heroku Memory Efficiency: ${stats.performance.memoryEfficiency}`);
  }
}

// Create singleton instance
const optimizedDataService = new OptimizedDataService();

// Export service and helper functions
export default optimizedDataService;

// Helper function to load organism data with the new service
// This addresses the 75.9MB payload issue by routing to optimized endpoints
export const getStoreOrGenerateData = async (storeName, handleGetData, clearStore = true) => {
  // This function maintains compatibility with the existing code
  // but uses the optimized service under the hood to solve Heroku/Atlas performance issues

  const organism = storeName.split('_')[0];
  const dataType = storeName.split('_')[1];

  // Performance monitoring for Heroku dyno memory usage
  const startTime = performance.now();
  const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

  try {
    console.log(`🚀 Loading ${storeName} with optimized endpoint (Heroku/Atlas optimized)`);

    let result;

    // Route to optimized endpoints that return minimal field sets
    // This drastically reduces data transfer between Atlas and Heroku
    switch (dataType) {
      case 'map':
        result = await optimizedDataService.fetchWithCache(`optimized/map/${organism}`);
        break;
      case 'genotypes':
        result = await optimizedDataService.fetchWithCache(`optimized/genotypes/${organism}`);
        break;
      case 'resistance':
        result = await optimizedDataService.fetchWithCache(`optimized/resistance/${organism}`);
        break;
      case 'trends':
        result = await optimizedDataService.fetchWithCache(`optimized/trends/${organism}`);
        break;
      case 'convergence':
        if (organism === 'kpneumo') {
          result = await optimizedDataService.fetchWithCache(`optimized/convergence/${organism}`);
        } else {
          result = { data: [], colourVariables: [] };
        }
        break;
      case 'filters':
        // Use aggregated filter endpoint instead of full dataset
        result = await optimizedDataService.fetchWithCache(`optimized/filters/${organism}`);
        break;
      default:
        // Fall back to original function for other data types
        console.warn(`⚠️ Using legacy endpoint for ${storeName} - consider optimizing`);
        result = await handleGetData();
    }

    // Performance logging for Heroku monitoring
    const endTime = performance.now();
    const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const loadTime = endTime - startTime;
    const memoryDelta = endMemory - startMemory;

    console.log(`✅ ${storeName} loaded in ${loadTime.toFixed(2)}ms, memory delta: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);

    // Log payload size for Atlas/Heroku optimization tracking
    if (result && Array.isArray(result)) {
      console.log(`📊 Payload size: ${result.length} records (vs potential 75MB+ from legacy endpoint)`);
    }

    return result;

  } catch (error) {
    console.error(`❌ Optimized service failed for ${storeName}, falling back to original:`, error);

    // Fallback to original function with performance warning
    console.warn(`⚠️ Falling back to legacy endpoint - this may cause Heroku dyno strain`);

    try {
      return await handleGetData();
    } catch (fallbackError) {
      console.error(`❌ Fallback also failed for ${storeName}:`, fallbackError);
      throw fallbackError;
    }
  }
};

// Export utility functions
export const loadOrganismDataParallel = async (organism, globalFilters = {}) => {
  return optimizedDataService.loadOrganismData(organism, globalFilters);
};

export const updateGlobalOverviewData = async (organism, colorBy, selectDrugs) => {
  return optimizedDataService.updateGlobalOverview(organism, colorBy, selectDrugs);
};

export const loadChartDataParallel = async (organism, chartTypes, filters = {}) => {
  return optimizedDataService.loadChartData(organism, chartTypes, filters);
};

export const clearDataCache = (organism = null) => {
  optimizedDataService.clearCache(organism);
};
