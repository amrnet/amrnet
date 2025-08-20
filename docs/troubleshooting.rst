.. _label-troubleshooting:

Troubleshooting Guide
=====================

.. container:: justify-text

    This comprehensive troubleshooting guide covers common issues encountered when developing,
    deploying, and maintaining AMRnet. The solutions are based on real-world problems and
    their tested fixes.

Performance Issues
------------------

Slow Data Loading (2+ Minute Load Times)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Symptoms:**
    - E. coli data taking 3+ minutes to load
    - K. pneumoniae taking 2+ minutes
    - Browser freezing during data fetch
    - Large payload sizes (75MB+)

    **Diagnosis Script:**

    .. code-block:: bash

        # Test performance issues
        node scripts/organism-performance-debugger.js

    **Root Causes:**
    - Unoptimized MongoDB queries returning all fields
    - Large datasets (227K+ documents for E. coli)
    - Single monolithic API calls
    - Lack of pagination or progressive loading

    **Solutions:**

    1. **Use Optimized Endpoints:**

    .. code-block:: javascript

        // Instead of:
        const data = await axios.get('/api/getDataForEcoli'); // 186MB, 21s

        // Use:
        const data = await axios.get('/api/optimized/map/ecoli'); // 13MB, 7s

    2. **Implement Pagination for Large Datasets:**

    .. code-block:: javascript

        // For E. coli (large dataset)
        const firstPage = await axios.get('/api/optimized/paginated/ecoli?page=1&limit=5000');

        // Progressive loading
        const loadNextPage = async (page) => {
          return axios.get(`/api/optimized/paginated/ecoli?page=${page}&limit=5000`);
        };

    3. **Use Parallel Loading:**

    .. code-block:: javascript

        // Load multiple chart sections simultaneously
        const [mapData, trendsData, resistanceData] = await Promise.all([
          axios.get('/api/optimized/map/ecoli'),
          axios.get('/api/optimized/trends/ecoli'),
          axios.get('/api/optimized/resistance/ecoli')
        ]);

    **Performance Validation:**

    .. code-block:: bash

        # Test the fixes
        node scripts/real-performance-test.js

Browser Freezing on Large Datasets
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Symptoms:**
    - Browser becomes unresponsive
    - UI freezes during data processing
    - "Page Unresponsive" warnings

    **Diagnosis:**

    .. code-block:: bash

        # Test for freezing issues
        node scripts/ecoli-freeze-debugger.js

    **Solutions:**

    1. **Progressive Genotype Loading:**

    .. code-block:: javascript

        // Prevent freezing with requestIdleCallback
        const processGenotypesProgressively = (data) => {
          const batches = chunkArray(data, 1000);
          let processed = [];

          const processBatch = (batchIndex) => {
            if (batchIndex >= batches.length) {
              updateUI(processed);
              return;
            }

            requestIdleCallback(() => {
              processed = [...processed, ...batches[batchIndex]];
              processBatch(batchIndex + 1);
            });
          };

          processBatch(0);
        };

    2. **Web Workers for Heavy Processing:**

    .. code-block:: javascript

        // offload heavy data processing
        const worker = new Worker('/workers/data-processor.js');

        worker.postMessage({ data: largeDataset });
        worker.onmessage = (event) => {
          const processedData = event.data;
          updateUI(processedData);
        };

    **Validation:**

    .. code-block:: bash

        # Verify fix is working
        node scripts/post-fix-validation.js

Development Issues
------------------

ESLint Errors and Warnings
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Symptoms:**
    - Build failures due to linting errors
    - Unused variable warnings
    - Import/export errors

    **Quick Fix:**

    .. code-block:: bash

        # Automated ESLint fixes
        ./scripts/comprehensive-eslint-fix.sh

    **Manual Fixes:**

    .. code-block:: bash

        # Fix specific issues
        cd client
        npx eslint src --fix --max-warnings 200

        # For development (bypass errors)
        ESLINT_NO_DEV_ERRORS=true npm start

    **Common Issues and Fixes:**

    .. code-block:: javascript

        // Fix unused theme parameters
        // Before:
        const useStyles = makeStyles((theme) => ({
          root: { padding: 16 }
        }));

        // After:
        const useStyles = makeStyles((_theme) => ({
          root: { padding: 16 }
        }));

        // Fix unused parameters in catch blocks
        // Before:
        .catch((error) => console.log('Error occurred'))

        // After:
        .catch((_error) => console.log('Error occurred'))

MongoDB Connection Issues
~~~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Symptoms:**
    - "Failed to load resource: 500 Internal Server Error"
    - Connection timeouts
    - Authentication failures

    **Diagnosis:**

    .. code-block:: bash

        # Test MongoDB connection
        node scripts/test-fixie-connection.js

    **Common Solutions:**

    1. **Check Environment Variables:**

    .. code-block:: bash

        # Verify configuration
        echo $MONGODB_URI
        echo $NODE_ENV

    2. **Fix Connection String Format:**

    .. code-block:: bash

        # Correct format
        MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

    3. **Test Connection with Retry Logic:**

    .. code-block:: javascript

        const connectWithRetry = async () => {
          const maxRetries = 3;
          let retries = 0;

          while (retries < maxRetries) {
            try {
              await client.connect();
              return;
            } catch (error) {
              retries++;
              console.log(`Connection attempt ${retries} failed: ${error.message}`);
              if (retries === maxRetries) throw error;
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        };

Server Startup Issues
~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Symptoms:**
    - Server not starting on correct port
    - "EADDRINUSE" port errors
    - Import/export syntax errors

    **Solutions:**

    1. **Port Configuration:**

    .. code-block:: bash

        # Start on specific port
        PORT=8080 node server.js

    2. **Kill Existing Processes:**

    .. code-block:: bash

        # Find and kill processes using port
        lsof -ti:8080 | xargs kill -9

    3. **Use Minimal Test Server:**

    .. code-block:: bash

        # Start minimal server for testing
        node scripts/test-server.js

    **Validation:**

    .. code-block:: bash

        # Test server endpoints
        ./scripts/test-api.sh

Deployment Issues
-----------------

Heroku Deployment Failures
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Symptoms:**
    - Build failures during deployment
    - Memory limit exceeded
    - Slow response times

    **Pre-deployment Check:**

    .. code-block:: bash

        # Validate deployment readiness
        node scripts/deployment-readiness.js

    **Common Fixes:**

    1. **Environment Variables:**

    .. code-block:: bash

        # Set required variables
        heroku config:set NODE_ENV=production
        heroku config:set MONGODB_URI="your-connection-string"

    2. **Optimize for Heroku:**

    .. code-block:: bash

        # Run Heroku-specific optimizations
        node scripts/heroku-atlas-optimizer.js

    3. **Build Script Issues:**

    .. code-block:: json

        // package.json
        {
          "scripts": {
            "heroku-postbuild": "cd client && npm install && npm run build"
          }
        }

MongoDB Atlas Performance
~~~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Symptoms:**
    - High latency connections
    - Timeout errors
    - Poor query performance

    **Diagnosis:**

    .. code-block:: bash

        # Check Atlas performance
        node scripts/heroku-atlas-optimizer.js

    **Optimizations:**

    1. **Region Proximity:**
    - Ensure Heroku and Atlas are in same region
    - Use ``us-east-1`` for both services

    2. **Connection Pooling:**

    .. code-block:: javascript

        const mongoOptions = {
          maxPoolSize: 10,
          minPoolSize: 5,
          maxIdleTimeMS: 30000,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000
        };

Translation and Internationalization
------------------------------------

Translation Workflow Issues
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Symptoms:**
    - Missing translation keys
    - Translation workflow not triggering
    - JSON syntax errors

    **Validation:**

    .. code-block:: bash

        # Test translation setup
        ./scripts/test-translation-setup.sh

    **Common Fixes:**

    1. **File Structure:**

    .. code-block:: bash

        # Ensure correct structure
        client/
        ├── locales/
        │   ├── en.json
        │   ├── fr.json
        │   ├── pt.json
        │   └── es.json
        └── src/
            └── i18n.js

    2. **JSON Validation:**

    .. code-block:: bash

        # Validate JSON files
        python3 -m json.tool client/locales/en.json

    3. **GitHub Workflow:**

    .. code-block:: yaml

        # .github/workflows/translate_app.yml
        name: Auto-translate Application
        on:
          push:
            paths:
              - 'client/locales/en.json'

Code Quality Issues
-------------------

Cleanup and Maintenance
~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Symptoms:**
    - Excessive console.log statements
    - Commented-out code
    - Unused files and dependencies

    **Automated Cleanup:**

    .. code-block:: bash

        # Run comprehensive cleanup
        ./scripts/cleanup.sh

        # Code-specific cleanup
        ./scripts/cleanup_script.sh

    **Manual Cleanup:**

    .. code-block:: bash

        # Remove debugging code
        find . -name "*.js" | xargs grep -l "console.log" | head -10

        # Find commented code
        find . -name "*.js" | xargs grep -l "^[[:space:]]*//.*TODO"

Security Issues
~~~~~~~~~~~~~~~

.. container:: justify-text

    **Symptoms:**
    - Exposed credentials in repository
    - Security warnings
    - Vulnerable dependencies

    **Immediate Actions:**

    .. code-block:: bash

        # Check for exposed secrets
        git log --all --full-history -- .env*

        # Security audit
        npm audit

        # Fix vulnerabilities
        npm audit fix

    **Prevention:**

    .. code-block:: text

        # .gitignore
        .env
        .env.*
        !.env.example

Performance Optimization
------------------------

Monitoring and Validation
~~~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Real-time Monitoring:**

    .. code-block:: bash

        # Monitor performance
        node scripts/monitor-performance.js

    **Load Testing:**

    .. code-block:: bash

        # Test endpoint performance
        node scripts/test-optimized-endpoints.js

    **Performance Benchmarks:**

    .. code-block:: bash

        # Comprehensive performance test
        node scripts/test-performance.js

    **Expected Results:**
    - K. pneumoniae: <2s load time
    - E. coli: <7s with pagination
    - E. coli (diarrheagenic): <3s load time
    - Payload reduction: 60-90%

Diagnostic Scripts Reference
----------------------------

.. container:: justify-text

    **Quick Diagnostics:**

    .. code-block:: bash

        # Health check
        curl http://localhost:8080/api/health

        # Performance check
        node scripts/real-performance-test.js

        # Deployment readiness
        node scripts/deployment-readiness.js

    **Comprehensive Analysis:**

    .. code-block:: bash

        # Full performance analysis
        node scripts/organism-performance-debugger.js

        # Heroku/Atlas optimization
        node scripts/heroku-atlas-optimizer.js

        # Translation validation
        ./scripts/test-translation-setup.sh

    **Status Checks:**

    .. code-block:: bash

        # Project status
        ./scripts/status-check.sh

        # API endpoints test
        ./scripts/test-api.sh

Emergency Procedures
--------------------

Critical Performance Issues
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **If users report 2+ minute load times:**

    1. **Immediate Response:**

    .. code-block:: bash

        # Switch to optimized endpoints
        # Update frontend API calls from /api/ to /api/optimized/

    2. **Verify Fix:**

    .. code-block:: bash

        node scripts/post-fix-validation.js

    3. **Monitor Results:**

    .. code-block:: bash

        node scripts/monitor-performance.js

Server Down Emergency
~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **If server is unresponsive:**

    1. **Start Minimal Server:**

    .. code-block:: bash

        node scripts/minimal-server.js

    2. **Check Logs:**

    .. code-block:: bash

        heroku logs --tail

    3. **Restart with Fixed Configuration:**

    .. code-block:: bash

        node scripts/server-fixed.js

Getting Help
------------

.. container:: justify-text

    **When to Use Each Script:**

    - **Performance Issues**: ``organism-performance-debugger.js``
    - **Deployment Problems**: ``deployment-readiness.js``
    - **MongoDB Issues**: ``test-fixie-connection.js``
    - **Code Quality**: ``cleanup_script.sh``
    - **Translation Issues**: ``test-translation-setup.sh``

    **Community Support:**
    - GitHub Issues: https://github.com/amrnet/amrnet/issues
    - Discussions: https://github.com/amrnet/amrnet/discussions
    - Email: amrnetdashboard@gmail.com

    **Emergency Contacts:**
    - Critical bugs: GitHub Issues with "urgent" label
    - Security issues: amrnetdashboard@gmail.com
