.. _label-api:

==============
API Reference
==============

.. container:: justify-text

    AMRnet provides a comprehensive RESTful API for programmatic access to all antimicrobial resistance surveillance data. The API supports multiple data formats, filtering options, and authentication methods to suit different use cases.

Quick Start
===========

.. container:: justify-text

    The AMRnet API is available at ``https://api.amrnet.org`` and provides access to surveillance data for multiple organisms. All endpoints return JSON by default, with optional CSV export capabilities.

Basic Usage
-----------

.. code-block:: bash

    # Get all S. Typhi surveillance data
    curl "https://api.amrnet.org/styphi"

    # Filter by country and year range
    curl "https://api.amrnet.org/styphi?country=BGD&year_start=2020&year_end=2023"

    # Get summary statistics
    curl "https://api.amrnet.org/styphi/summary?country=IND"

Authentication
==============

.. container:: justify-text

    The AMRnet API supports multiple authentication methods depending on your usage requirements:

Public Access
-------------

.. container:: justify-text

    Basic read access to all published datasets is available without authentication. Rate limits apply:

    - **Rate Limit**: 1000 requests per hour per IP
    - **Data Limit**: 10,000 records per request
    - **Export Limit**: 50,000 records per day

.. code-block:: bash

    # No authentication required for basic access
    curl "https://api.amrnet.org/styphi?limit=1000"

API Key Authentication
----------------------

.. container:: justify-text

    For higher rate limits and bulk data access, register for a free API key at `amrnet.org/api/register <https://amrnet.org/api/register>`_.

.. code-block:: bash

    # Using API key in header (recommended)
    curl -H "X-API-Key: your_api_key_here" "https://api.amrnet.org/styphi"

    # Using API key as parameter
    curl "https://api.amrnet.org/styphi?api_key=your_api_key_here"

**API Key Benefits:**

- **Rate Limit**: 10,000 requests per hour
- **Data Limit**: 100,000 records per request
- **Export Limit**: 1,000,000 records per day
- **Priority Support**: Faster response times

OAuth2 Authentication
---------------------

.. container:: justify-text

    For institutional access and advanced features, OAuth2 authentication is available. Contact us at ``amrnetdashboard@gmail.com`` for institutional access.

Available Endpoints
===================

.. container:: justify-text

    The AMRnet API provides consistent endpoints across all supported organisms with standardized query parameters and response formats.

Organism Data Endpoints
-----------------------

.. list-table:: Supported Organisms
   :header-rows: 1
   :widths: 25 25 50

   * - Organism
     - Endpoint
     - Description
   * - *Salmonella* Typhi
     - ``/styphi``
     - Typhoid fever pathogen data
   * - *Klebsiella pneumoniae*
     - ``/kpneumo``
     - K. pneumoniae resistance data
   * - *Neisseria gonorrhoeae*
     - ``/ngono``
     - Gonorrhea pathogen data
   * - *E. coli*
     - ``/ecoli``
     - E. coli resistance patterns
   * - *E. coli* (Diarrheal)
     - ``/decoli``
     - Diarrheal E. coli strains
   * - *Shigella*
     - ``/shigella``
     - Shigella species data
   * - *Salmonella* enterica
     - ``/senterica``
     - Non-typhoidal Salmonella
   * - *S.* enterica (Invasive)
     - ``/sentericaints``
     - Invasive Salmonella strains

Base Data Access
~~~~~~~~~~~~~~~~

.. code-block:: text

    GET /api/{organism}

**Example Response:**

.. code-block:: json

    {
        "status": "success",
        "organism": "styphi",
        "total_records": 15420,
        "page": 1,
        "per_page": 100,
        "pages": 155,
        "data": [
            {
                "id": "ERR1234567",
                "country": "Bangladesh",
                "year": 2020,
                "resistance_profile": {
                    "ampicillin": "R",
                    "chloramphenicol": "S",
                    "ciprofloxacin": "I"
                },
                "genotype": "4.3.1.1",
                "collection_date": "2020-03-15",
                "source": "blood",
                "metadata": {
                    "age": 25,
                    "sex": "F",
                    "location": "Dhaka"
                }
            }
        ],
        "filters_applied": {},
        "timestamp": "2024-12-30T10:30:00Z"
    }

Summary Statistics
~~~~~~~~~~~~~~~~~~

.. code-block:: text

    GET /api/{organism}/summary

**Example Response:**

.. code-block:: json

    {
        "status": "success",
        "organism": "styphi",
        "summary": {
            "total_samples": 15420,
            "countries": 45,
            "year_range": [2010, 2023],
            "resistance_rates": {
                "ampicillin": 0.75,
                "chloramphenicol": 0.23,
                "ciprofloxacin": 0.89
            },
            "genotype_distribution": {
                "4.3.1.1": 0.45,
                "4.3.1.2": 0.32,
                "2.1.7": 0.15
            },
            "geographic_distribution": {
                "Asia": 0.65,
                "Africa": 0.25,
                "Americas": 0.10
            }
        }
    }

Country-Specific Data
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: text

    GET /api/{organism}/countries/{country_code}

**Example:**

.. code-block:: bash

    curl "https://api.amrnet.org/styphi/countries/BGD"

Temporal Trends
~~~~~~~~~~~~~~~

.. code-block:: text

    GET /api/{organism}/trends

**Example Response:**

.. code-block:: json

    {
        "status": "success",
        "trends": {
            "resistance_over_time": [
                {
                    "year": 2020,
                    "ampicillin_resistance": 0.72,
                    "sample_count": 1250
                },
                {
                    "year": 2021,
                    "ampicillin_resistance": 0.75,
                    "sample_count": 1380
                }
            ]
        }
    }

Query Parameters
================

.. container:: justify-text

    All organism endpoints support consistent query parameters for filtering and customization:

Filtering Parameters
--------------------

.. list-table:: Filter Parameters
   :header-rows: 1
   :widths: 20 20 60

   * - Parameter
     - Type
     - Description
   * - ``country``
     - string
     - ISO 3166-1 alpha-3 country code (e.g., BGD, IND, USA)
   * - ``year_start``
     - integer
     - Start year for date range filtering
   * - ``year_end``
     - integer
     - End year for date range filtering
   * - ``resistance``
     - string
     - Filter by resistance to specific antibiotic
   * - ``genotype``
     - string
     - Filter by specific genotype or lineage
   * - ``source``
     - string
     - Sample source (blood, urine, stool, etc.)
   * - ``region``
     - string
     - Geographic region filter

Pagination Parameters
---------------------

.. list-table:: Pagination Parameters
   :header-rows: 1
   :widths: 20 20 60

   * - Parameter
     - Type
     - Description
   * - ``page``
     - integer
     - Page number (default: 1)
   * - ``per_page``
     - integer
     - Records per page (max: 10,000)
   * - ``limit``
     - integer
     - Total record limit
   * - ``offset``
     - integer
     - Number of records to skip

Format Parameters
-----------------

.. list-table:: Format Parameters
   :header-rows: 1
   :widths: 20 20 60

   * - Parameter
     - Type
     - Description
   * - ``format``
     - string
     - Response format: json (default), csv, tsv
   * - ``fields``
     - string
     - Comma-separated list of fields to include
   * - ``exclude``
     - string
     - Comma-separated list of fields to exclude

Example Queries
===============

.. container:: justify-text

    Here are practical examples demonstrating common API usage patterns:

Basic Filtering
---------------

.. code-block:: bash

    # Get S. Typhi data from Bangladesh in 2020-2023
    curl "https://api.amrnet.org/styphi?country=BGD&year_start=2020&year_end=2023"

    # Get ciprofloxacin-resistant samples
    curl "https://api.amrnet.org/styphi?resistance=ciprofloxacin:R"

    # Get specific genotype data
    curl "https://api.amrnet.org/styphi?genotype=4.3.1.1"

Advanced Filtering
------------------

.. code-block:: bash

    # Multiple country filter
    curl "https://api.amrnet.org/styphi?country=BGD,IND,PAK"

    # Complex resistance pattern
    curl "https://api.amrnet.org/styphi?resistance=ampicillin:R,chloramphenicol:S"

    # Blood samples from specific region
    curl "https://api.amrnet.org/styphi?source=blood&region=South_Asia"

Data Export
-----------

.. code-block:: bash

    # Export to CSV
    curl "https://api.amrnet.org/styphi?format=csv&limit=50000" > styphi_data.csv

    # Export specific fields only
    curl "https://api.amrnet.org/styphi?fields=country,year,resistance_profile&format=csv"

    # Export with custom filename
    curl -o "bangladesh_styphi_2023.csv" \
         "https://api.amrnet.org/styphi?country=BGD&year=2023&format=csv"

Programming Examples
====================

Python Integration
------------------

.. code-block:: python

    import requests
    import pandas as pd
    import json

    class AMRnetAPI:
        def __init__(self, api_key=None):
            self.base_url = "https://api.amrnet.org"
            self.session = requests.Session()
            if api_key:
                self.session.headers.update({"X-API-Key": api_key})

        def get_data(self, organism, **filters):
            """Fetch data for specified organism with filters."""
            url = f"{self.base_url}/{organism}"
            response = self.session.get(url, params=filters)
            response.raise_for_status()
            return response.json()

        def get_summary(self, organism, **filters):
            """Get summary statistics for organism."""
            url = f"{self.base_url}/{organism}/summary"
            response = self.session.get(url, params=filters)
            response.raise_for_status()
            return response.json()

        def to_dataframe(self, data):
            """Convert API response to pandas DataFrame."""
            if 'data' in data:
                return pd.DataFrame(data['data'])
            return pd.DataFrame()

    # Example usage
    api = AMRnetAPI(api_key="your_api_key")

    # Get Bangladesh S. Typhi data from 2020-2023
    data = api.get_data(
        "styphi",
        country="BGD",
        year_start=2020,
        year_end=2023,
        limit=10000
    )

    # Convert to DataFrame for analysis
    df = api.to_dataframe(data)
    print(f"Retrieved {len(df)} samples")

    # Get summary statistics
    summary = api.get_summary("styphi", country="BGD")
    print("Resistance rates:", summary['summary']['resistance_rates'])

R Integration
-------------

.. code-block:: r

    library(httr)
    library(jsonlite)
    library(dplyr)

    # AMRnet API R client
    amrnet_get <- function(organism, ..., api_key = NULL) {
      base_url <- "https://api.amrnet.org"
      url <- paste0(base_url, "/", organism)

      # Prepare headers
      headers <- list()
      if (!is.null(api_key)) {
        headers[["X-API-Key"]] <- api_key
      }

      # Make request
      params <- list(...)
      response <- GET(url, query = params, add_headers(.headers = headers))
      stop_for_status(response)

      # Parse JSON response
      content(response, "parsed", "application/json")
    }

    # Example usage
    data <- amrnet_get("styphi",
                       country = "BGD",
                       year_start = 2020,
                       limit = 5000)

    # Convert to data frame
    df <- do.call(rbind, lapply(data$data, as.data.frame))
    cat("Retrieved", nrow(df), "samples\n")

JavaScript/Node.js Integration
------------------------------

.. code-block:: javascript

    const axios = require('axios');

    class AMRnetAPI {
        constructor(apiKey = null) {
            this.baseURL = 'https://api.amrnet.org';
            this.apiKey = apiKey;
        }

        async getData(organism, filters = {}) {
            const url = `${this.baseURL}/${organism}`;
            const headers = this.apiKey ? { 'X-API-Key': this.apiKey } : {};

            try {
                const response = await axios.get(url, {
                    params: filters,
                    headers: headers
                });
                return response.data;
            } catch (error) {
                throw new Error(`API request failed: ${error.message}`);
            }
        }

        async getSummary(organism, filters = {}) {
            const url = `${this.baseURL}/${organism}/summary`;
            const headers = this.apiKey ? { 'X-API-Key': this.apiKey } : {};

            const response = await axios.get(url, {
                params: filters,
                headers: headers
            });
            return response.data;
        }
    }

    // Example usage
    async function analyzeBangladeshTyphoid() {
        const api = new AMRnetAPI('your_api_key');

        try {
            const data = await api.getData('styphi', {
                country: 'BGD',
                year_start: 2020,
                year_end: 2023,
                limit: 10000
            });

            console.log(`Retrieved ${data.data.length} samples`);

            const summary = await api.getSummary('styphi', { country: 'BGD' });
            console.log('Resistance rates:', summary.summary.resistance_rates);
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    analyzeBangladeshTyphoid();

Error Handling
==============

.. container:: justify-text

    The AMRnet API uses standard HTTP status codes and provides detailed error messages to help diagnose issues:

HTTP Status Codes
-----------------

.. list-table:: Status Codes
   :header-rows: 1
   :widths: 20 80

   * - Code
     - Description
   * - ``200``
     - Success - Request completed successfully
   * - ``400``
     - Bad Request - Invalid parameters or malformed request
   * - ``401``
     - Unauthorized - Invalid or missing API key
   * - ``403``
     - Forbidden - Access denied or rate limit exceeded
   * - ``404``
     - Not Found - Endpoint or resource not found
   * - ``429``
     - Too Many Requests - Rate limit exceeded
   * - ``500``
     - Internal Server Error - Server-side error

Error Response Format
---------------------

.. code-block:: json

    {
        "status": "error",
        "error": {
            "code": "INVALID_PARAMETER",
            "message": "Invalid country code 'XX'. Must be valid ISO 3166-1 alpha-3 code.",
            "details": {
                "parameter": "country",
                "value": "XX",
                "valid_values": ["BGD", "IND", "USA", "..."]
            }
        },
        "timestamp": "2024-12-30T10:30:00Z"
    }

Common Error Scenarios
----------------------

**Invalid Country Code:**

.. code-block:: bash

    curl "https://api.amrnet.org/styphi?country=INVALID"
    # Returns 400 with list of valid country codes

**Rate Limit Exceeded:**

.. code-block:: bash

    # Too many requests without API key
    # Returns 429 with retry-after header

**Large Data Request:**

.. code-block:: bash

    curl "https://api.amrnet.org/styphi?limit=999999"
    # Returns 400 with maximum limit information

Rate Limits and Best Practices
==============================

Rate Limiting
-------------

.. container:: justify-text

    AMRnet implements rate limiting to ensure fair access and system stability:

.. list-table:: Rate Limits by Access Level
   :header-rows: 1
   :widths: 25 25 25 25

   * - Access Level
     - Requests/Hour
     - Records/Request
     - Daily Export Limit
   * - Public
     - 1,000
     - 10,000
     - 50,000
   * - API Key
     - 10,000
     - 100,000
     - 1,000,000
   * - Institutional
     - 100,000
     - 1,000,000
     - Unlimited

Best Practices
--------------

**1. Use API Keys for Regular Access:**

.. code-block:: python

    # Always use API key for applications
    headers = {"X-API-Key": "your_api_key"}

**2. Implement Proper Error Handling:**

.. code-block:: python

    import time
    from requests.exceptions import RequestException

    def safe_api_call(url, params, max_retries=3):
        for attempt in range(max_retries):
            try:
                response = requests.get(url, params=params)
                if response.status_code == 429:
                    # Rate limited - wait and retry
                    time.sleep(60)
                    continue
                response.raise_for_status()
                return response.json()
            except RequestException as e:
                if attempt == max_retries - 1:
                    raise
                time.sleep(2 ** attempt)  # Exponential backoff

**3. Use Pagination for Large Datasets:**

.. code-block:: python

    def fetch_all_data(organism, filters):
        all_data = []
        page = 1

        while True:
            response = api.get_data(
                organism,
                page=page,
                per_page=10000,
                **filters
            )

            all_data.extend(response['data'])

            if page >= response['pages']:
                break
            page += 1

        return all_data

**4. Cache Results Appropriately:**

.. code-block:: python

    import pickle
    from datetime import datetime, timedelta

    def cached_api_call(cache_file, organism, filters, cache_hours=24):
        # Check if cache exists and is recent
        try:
            with open(cache_file, 'rb') as f:
                cached_data, timestamp = pickle.load(f)

            if datetime.now() - timestamp < timedelta(hours=cache_hours):
                return cached_data
        except FileNotFoundError:
            pass

        # Fetch fresh data
        data = api.get_data(organism, **filters)

        # Cache the result
        with open(cache_file, 'wb') as f:
            pickle.dump((data, datetime.now()), f)

        return data

FARM Stack API
==============

.. container:: justify-text

    AMRnet is implementing a modern FARM (FastAPI + React + MongoDB) stack API to provide enhanced performance, real-time capabilities, and advanced analytics features.

FastAPI Backend Features
------------------------

**Real-time Data Streaming:**

.. code-block:: python

    # WebSocket endpoint for real-time updates
    from fastapi import FastAPI, WebSocket
    import asyncio

    app = FastAPI()

    @app.websocket("/ws/styphi/live")
    async def websocket_endpoint(websocket: WebSocket):
        await websocket.accept()
        while True:
            # Stream real-time resistance trend updates
            data = await get_live_resistance_data()
            await websocket.send_json(data)
            await asyncio.sleep(60)  # Update every minute

**Advanced Analytics Endpoints:**

.. code-block:: bash

    # Machine learning predictions
    curl "https://farm-api.amrnet.org/styphi/predictions/resistance_trends"

    # Statistical analysis
    curl "https://farm-api.amrnet.org/styphi/statistics/regression_analysis"

    # Geospatial clustering
    curl "https://farm-api.amrnet.org/styphi/geo/clusters"

**GraphQL Integration:**

.. code-block:: graphql

    query GetTyphoidData($country: String!, $yearRange: [Int!]!) {
        styphi(filters: {country: $country, years: $yearRange}) {
            samples {
                id
                resistanceProfile {
                    ampicillin
                    ciprofloxacin
                    ceftriaxone
                }
                genotype
                location {
                    country
                    coordinates
                }
            }
            summary {
                totalSamples
                resistanceRates
                temporalTrends
            }
        }
    }

React Frontend Components
-------------------------

**Interactive API Explorer:**

.. code-block:: javascript

    import React, { useState } from 'react';
    import { APIExplorer } from '@amrnet/react-components';

    function APIPlayground() {
        const [organism, setOrganism] = useState('styphi');
        const [filters, setFilters] = useState({});

        return (
            <APIExplorer
                organism={organism}
                filters={filters}
                onFiltersChange={setFilters}
                showCodeExamples={true}
                allowExport={true}
            />
        );
    }

**Real-time Dashboard Widgets:**

.. code-block:: javascript

    import { LiveResistanceChart } from '@amrnet/react-components';

    function LiveDashboard() {
        return (
            <div>
                <LiveResistanceChart
                    organism="styphi"
                    country="BGD"
                    updateInterval={60000}  // 1 minute
                />
            </div>
        );
    }

MongoDB Advanced Queries
------------------------

**Time-series Analytics:**

.. code-block:: javascript

    // MongoDB aggregation for temporal trends
    db.styphi.aggregate([
        {
            $match: {
                country: "BGD",
                year: { $gte: 2020 }
            }
        },
        {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month"
                },
                resistance_rate: {
                    $avg: {
                        $cond: [
                            { $eq: ["$resistance.ciprofloxacin", "R"] },
                            1, 0
                        ]
                    }
                },
                sample_count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 }
        }
    ])

**Geospatial Analysis:**

.. code-block:: javascript

    // Find samples within geographic radius
    db.styphi.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [90.4125, 23.8103],  // Dhaka coordinates
                    50 / 3963.2  // 50 miles radius
                ]
            }
        }
    })

Support and Resources
=====================

.. container:: justify-text

    Get help and connect with the AMRnet developer community:

Documentation Resources
-----------------------

- **📖 User Guide**: Comprehensive dashboard usage instructions
- **🛠️ Developer Guide**: Contributing and adding new organisms
- **📊 Data Dictionary**: Complete field definitions and schemas
- **🎓 Tutorials**: Step-by-step integration examples

Community Support
-----------------

- **💬 GitHub Discussions**: `github.com/amrnet/amrnet/discussions <https://github.com/amrnet/amrnet/discussions>`_
- **🐛 Issue Tracker**: `github.com/amrnet/amrnet/issues <https://github.com/amrnet/amrnet/issues>`_
- **📧 Email Support**: amrnetdashboard@gmail.com
- **📋 API Status**: `status.amrnet.org <https://status.amrnet.org>`_

Professional Services
---------------------

.. container:: justify-text

    For organizations requiring custom integration support, training, or enterprise features:

- **🏢 Enterprise API Access**: Higher rate limits and SLA guarantees
- **🎓 Training Workshops**: API integration and AMR data analysis
- **🔧 Custom Development**: Tailored solutions and private deployments
- **📊 Consulting Services**: AMR surveillance strategy and implementation

Contact our enterprise team at ``amrnetdashboard@gmail.com`` for more information.

Changelog and Versioning
========================

.. container:: justify-text

    The AMRnet API follows semantic versioning. Major version changes may include breaking changes, while minor versions add features with backward compatibility.

Current Version: v2.1.0
-----------------------

**New Features:**
- FARM stack implementation with FastAPI backend
- Real-time WebSocket endpoints for live data streaming
- GraphQL API support for flexible queries
- Enhanced geospatial analysis capabilities
- Machine learning prediction endpoints

**Improvements:**
- 40% faster response times with async processing
- Improved error messages with detailed diagnostics
- Enhanced rate limiting with burst capacity
- Better caching for frequently accessed data

**Bug Fixes:**
- Fixed pagination issues with large datasets
- Resolved timezone handling in date filters
- Corrected resistance rate calculations for specific genotypes

Version History
---------------

- **v2.1.0** (2024-12-30): FARM stack implementation, real-time features
- **v2.0.0** (2024-06-15): Major API redesign with consistent endpoints
- **v1.5.2** (2024-03-10): Enhanced filtering and export capabilities
- **v1.5.0** (2024-01-20): Added summary statistics endpoints
- **v1.4.1** (2023-11-05): Performance improvements and bug fixes
- **v1.4.0** (2023-09-15): OAuth2 authentication support
- **v1.3.0** (2023-07-01): API key authentication system
- **v1.2.0** (2023-04-10): CSV export functionality
- **v1.1.0** (2023-02-01): Pagination and advanced filtering
- **v1.0.0** (2023-01-01): Initial public API release

Migration Guides
----------------

**Migrating from v1.x to v2.x:**

.. code-block:: python

    # v1.x (deprecated)
    response = requests.get("https://api.amrnet.org/data/styphi")

    # v2.x (current)
    response = requests.get("https://api.amrnet.org/styphi")

**Breaking Changes in v2.0:**
- Endpoint structure simplified (``/data/{organism}`` → ``/{organism}``)
- Response format standardized across all endpoints
- Date filtering uses ``year_start``/``year_end`` instead of ``date_from``/``date_to``
- Resistance values standardized (R/I/S instead of numeric codes)

Deprecation Notice
------------------

.. warning::

    **v1.x API endpoints will be deprecated on June 30, 2025.** Please migrate to v2.x endpoints before this date. Legacy endpoints will continue to work until December 31, 2025, after which they will be permanently removed.
