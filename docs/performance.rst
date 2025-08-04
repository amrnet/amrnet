.. _label-performance:

Performance Optimization
=========================

.. container:: justify-text

    AMRnet has been extensively optimized to handle large genomic surveillance datasets efficiently.
    This guide covers performance considerations, optimization strategies, and deployment best practices.

Architecture Overview
---------------------

.. container:: justify-text

    AMRnet's performance optimizations span the entire application stack:

**Frontend Optimizations:**

- **Lazy Loading**: Components and data loaded on-demand
- **Virtual Scrolling**: Efficient rendering of large datasets
- **Intelligent Caching**: Browser-based storage for frequently accessed data
- **Compression**: Gzipped responses reduce transfer by up to 96%
- **Progressive Loading**: Priority-based data fetching

**Backend Optimizations:**

- **Database Indexing**: Optimized MongoDB indexes for common queries
- **Aggregation Pipelines**: Server-side data processing
- **Connection Pooling**: Efficient database connection management
- **Field Projection**: Transfer only necessary data fields
- **Parallel Processing**: Concurrent data processing for multiple requests

Load Time Improvements
----------------------

.. container:: justify-text

    Recent optimizations have dramatically improved load times across all organisms:

**Performance Benchmarks:**

.. list-table:: Load Time Improvements
   :header-rows: 1
   :widths: 25 25 25 25

   * - Organism
     - Before (seconds)
     - After (seconds)
     - Improvement
   * - K. pneumoniae
     - 7-8s (63MB)
     - 1.4s (2.3MB)
     - 81% faster
   * - E. coli
     - 21-23s (186MB)
     - 7s (13MB)
     - 70% faster
   * - D. E. coli
     - 6-15s (51MB)
     - 2s (4MB)
     - 87% faster

**Optimization Strategies:**

1. **Optimized Endpoints**: ``/api/optimized/*`` routes with minimal payloads
2. **Pagination**: Large datasets split into manageable chunks
3. **Parallel Loading**: Multiple chart sections loaded simultaneously
4. **Smart Caching**: Frequently accessed data cached locally

Database Optimization
---------------------

.. container:: justify-text

    MongoDB performance optimizations ensure fast query responses:

**Indexing Strategy:**

.. code-block:: javascript

    // Compound indexes for common query patterns
    db.ecoli_data.createIndex({ COUNTRY_ONLY: 1, YEAR: 1 })
    db.kpneumo_data.createIndex({ GENOTYPE: 1, COUNTRY_ONLY: 1 })
    db.styphi_data.createIndex({ GENOTYPE: 1, YEAR: 1, COUNTRY_ONLY: 1 })

**Aggregation Pipelines:**

.. code-block:: javascript

    // Efficient data aggregation with field projection
    db.collection.aggregate([
      { $match: { COUNTRY_ONLY: "BGD", YEAR: { $gte: 2020 } } },
      { $project: {
          COUNTRY_ONLY: 1,
          YEAR: 1,
          GENOTYPE: 1,
          RESISTANCE_PROFILE: 1,
          _id: 0
        } },
      { $group: {
          _id: { country: "$COUNTRY_ONLY", year: "$YEAR" },
          count: { $sum: 1 },
          genotypes: { $addToSet: "$GENOTYPE" }
        } }
    ])

**Connection Optimization:**

.. code-block:: javascript

    // MongoDB connection settings for production
    const mongoOptions = {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0
    };

Frontend Performance
--------------------

.. container:: justify-text

    React application optimizations for smooth user experience:

**Component Optimization:**

.. code-block:: javascript

    // Memoized components prevent unnecessary re-renders
    import React, { memo, useMemo, useCallback } from 'react';

    const OptimizedChart = memo(({ data, filters }) => {
      const processedData = useMemo(() =>
        processChartData(data, filters), [data, filters]
      );

      const handleFilterChange = useCallback((newFilter) => {
        // Debounced filter updates
        debounce(() => updateFilters(newFilter), 300);
      }, []);

      return <Chart data={processedData} onFilterChange={handleFilterChange} />;
    });

**Data Loading Optimization:**

.. code-block:: javascript

    // Parallel data loading with Promise.all
    const loadOrganismData = async (organism) => {
      const [mapData, trendsData, resistanceData] = await Promise.all([
        fetch(`/api/optimized/map/${organism}`),
        fetch(`/api/optimized/trends/${organism}`),
        fetch(`/api/optimized/resistance/${organism}`)
      ]);

      return {
        map: await mapData.json(),
        trends: await trendsData.json(),
        resistance: await resistanceData.json()
      };
    };

**Virtual Scrolling for Large Lists:**

.. code-block:: javascript

    import { FixedSizeList as List } from 'react-window';

    const LargeDataList = ({ data }) => (
      <List
        height={400}
        itemCount={data.length}
        itemSize={50}
        itemData={data}
      >
        {({ index, style, data }) => (
          <div style={style}>
            {/* Render only visible items */}
            <DataRow item={data[index]} />
          </div>
        )}
      </List>
    );

Deployment Optimization
-----------------------

.. container:: justify-text

    Production deployment configurations for optimal performance:

**Heroku Configuration:**

.. code-block:: bash

    # Environment variables for production
    NODE_ENV=production
    MONGODB_URI=mongodb+srv://...

    # Enable compression
    ENABLE_COMPRESSION=true

    # Connection pooling
    DB_POOL_SIZE=10

    # Cache settings
    CACHE_TTL=300

**CDN Integration:**

.. code-block:: javascript

    // Static asset optimization
    const nextConfig = {
      images: {
        domains: ['cdn.amrnet.org'],
        formats: ['image/webp', 'image/avif'],
      },
      compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
      },
      experimental: {
        optimizeCss: true,
      }
    };

**Monitoring and Alerting:**

.. code-block:: javascript

    // Performance monitoring
    const performanceMonitor = {
      trackPageLoad: (pageName, loadTime) => {
        if (loadTime > 3000) {
          console.warn(`Slow page load: ${pageName} took ${loadTime}ms`);
        }
      },

      trackAPICall: (endpoint, responseTime, payloadSize) => {
        if (responseTime > 2000 || payloadSize > 5000000) {
          console.warn(`Performance issue: ${endpoint}`);
        }
      }
    };

Caching Strategies
------------------

.. container:: justify-text

    Multi-level caching for optimal performance:

**Browser Caching:**

.. code-block:: javascript

    // Service worker for offline capabilities
    const CACHE_NAME = 'amrnet-v1';
    const urlsToCache = [
      '/',
      '/static/css/main.css',
      '/static/js/main.js',
      '/api/metadata'
    ];

    self.addEventListener('fetch', event => {
      event.respondWith(
        caches.match(event.request)
          .then(response => response || fetch(event.request))
      );
    });

**Redis Caching (Optional):**

.. code-block:: javascript

    // Server-side caching for frequently accessed data
    const redis = require('redis');
    const client = redis.createClient(process.env.REDIS_URL);

    const getCachedData = async (key) => {
      const cached = await client.get(key);
      return cached ? JSON.parse(cached) : null;
    };

    const setCachedData = async (key, data, ttl = 300) => {
      await client.setex(key, ttl, JSON.stringify(data));
    };

Performance Monitoring
----------------------

.. container:: justify-text

    Real-time performance tracking and optimization:

**Client-Side Metrics:**

.. code-block:: javascript

    // Web Vitals monitoring
    import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

    const sendToAnalytics = (metric) => {
      // Send performance metrics to monitoring service
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(metric)
      });
    };

    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);

**Server-Side Monitoring:**

.. code-block:: javascript

    // Express middleware for performance tracking
    const performanceMiddleware = (req, res, next) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path}: ${duration}ms`);

        // Alert if response time exceeds threshold
        if (duration > 2000) {
          console.warn(`Slow request: ${req.path} took ${duration}ms`);
        }
      });

      next();
    };

Best Practices
--------------

.. container:: justify-text

    **Development Best Practices:**

    1. **Measure First**: Use browser dev tools to identify bottlenecks
    2. **Optimize Queries**: Use database explain plans to optimize queries
    3. **Monitor Bundle Size**: Keep JavaScript bundles under 250KB
    4. **Image Optimization**: Use modern formats (WebP, AVIF) and responsive images
    5. **Code Splitting**: Load only necessary code for each page

    **Production Best Practices:**

    1. **Enable Compression**: Use gzip/brotli compression
    2. **CDN Usage**: Serve static assets from CDN
    3. **Database Indexes**: Ensure proper indexing for all queries
    4. **Connection Pooling**: Optimize database connection pools
    5. **Performance Monitoring**: Set up alerts for performance degradation

Troubleshooting
---------------

.. container:: justify-text

    **Common Performance Issues:**

    1. **Slow Page Loads**: Check network tab for large payloads
    2. **High Memory Usage**: Use Chrome DevTools Memory tab
    3. **Database Timeouts**: Review MongoDB slow query logs
    4. **Cache Misses**: Verify cache configuration and TTL settings

    **Performance Testing:**

    .. code-block:: bash

        # Load testing with Artillery
        npm install -g artillery
        artillery quick --count 100 --num 10 https://amrnet.org

        # Bundle analysis
        npm run build
        npm run analyze

    **Monitoring Tools:**

    - Browser DevTools (Performance tab)
    - MongoDB Compass (Query performance)
    - Heroku metrics (if deployed on Heroku)
    - Web Vitals extension
    - Lighthouse CI for automated testing
