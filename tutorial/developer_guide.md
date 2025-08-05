# AMRnet Developer Guide: Adding New Organisms

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture Understanding](#architecture-understanding)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Data Requirements](#data-requirements)
6. [Frontend Configuration](#frontend-configuration)
7. [Backend Implementation](#backend-implementation)
8. [Testing and Validation](#testing-and-validation)
9. [Documentation](#documentation)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

## Overview

This comprehensive guide walks you through the process of adding a new organism to the AMRnet dashboard. AMRnet is designed with modularity in mind, allowing for systematic addition of new organisms while maintaining consistency and performance.

### Current Supported Organisms

- **Salmonella Typhi** (`styphi`) - Typhoid fever causative agent
- **Klebsiella pneumoniae** (`kpneumo`) - Healthcare-associated infections
- **Neisseria gonorrhoeae** (`ngono`) - Gonorrhea causative agent
- **Escherichia coli** (`ecoli`) - Various infections
- **Diarrheagenic E. coli** (`decoli`) - Diarrheal diseases
- **Shigella** (`shige`) - Shigellosis/dysentery
- **Salmonella enterica** (`senterica`) - Non-typhoidal Salmonella
- **Salmonella enterica (INTS)** (`sentericaints`) - Invasive non-typhoidal Salmonella

## Prerequisites

### Technical Requirements

- **Node.js** 18+ with npm/yarn
- **MongoDB** 6.0+ (local or Atlas)
- **React** 18+ knowledge
- **Express.js** familiarity
- **Git** version control

### Knowledge Requirements

- Understanding of antimicrobial resistance (AMR) data
- Familiarity with genomic surveillance datasets
- Basic bioinformatics knowledge
- JavaScript/TypeScript proficiency
- Database design principles

### Data Requirements

Before starting implementation, ensure you have:

1. **Clean, validated genomic surveillance data**
2. **Standardized antimicrobial resistance profiles**
3. **Geographic and temporal metadata**
4. **Genotype/lineage information**
5. **Quality control metrics**

## Architecture Understanding

### System Architecture

```
AMRnet System Architecture
├── Frontend (React)
│   ├── Components/
│   │   ├── Dashboard/
│   │   ├── Elements/
│   │   └── Organism-specific/
│   ├── Stores/ (Redux)
│   ├── Utils/
│   └── Services/
├── Backend (Express.js)
│   ├── Controllers/
│   ├── Models/
│   ├── Routes/
│   └── Services/
├── Database (MongoDB)
│   ├── Collections (per organism)
│   └── Indexes
└── Data Processing
    ├── CSV Importers
    ├── Data Validators
    └── Aggregation Pipelines
```

### Data Flow

1. **Data Ingestion**: CSV files → MongoDB collections
2. **Data Processing**: Aggregation pipelines → Processed datasets
3. **API Layer**: Express routes → JSON responses
4. **Frontend**: React components → Interactive visualizations
5. **User Interface**: Filters → Real-time data updates

## Step-by-Step Implementation

### Phase 1: Data Preparation

#### 1.1 Data Schema Definition

Create a standardized schema for your organism. All organisms follow this core structure:

```javascript
// Core fields required for all organisms
const coreSchema = {
  // Geographic information
  COUNTRY_ONLY: String,        // ISO country name
  REGION: String,              // Geographic region

  // Temporal information
  DATE: Number,                // Year of isolation

  // Genomic information
  GENOTYPE: String,            // Primary genotype/lineage

  // Resistance information
  [DRUG_NAME]: String,         // R/S/I for each drug

  // Metadata
  PMID: String,               // Publication identifier
  SAMPLE_ID: String,          // Unique sample identifier
}
```

#### 1.2 Organism-Specific Extensions

Define additional fields specific to your organism:

```javascript
// Example: Extended schema for Klebsiella pneumoniae
const kpneumoSchema = {
  ...coreSchema,

  // K. pneumoniae specific fields
  cgST: String,               // Core genome sequence type
  K_locus: String,            // K antigen type
  O_locus: String,            // O antigen type
  ST: String,                 // Sequence type
  Virulence_score: Number,    // Virulence scoring

  // Resistance mechanisms
  Carbapenemases: String,     // Carbapenemase genes
  ESBLs: String,             // ESBL genes
  Plasmid_Inc_types: String, // Plasmid incompatibility groups
}
```

#### 1.3 Data Validation

Implement validation rules:

```javascript
// data-validation.js
export const validateOrganismData = (data, organism) => {
  const errors = [];

  // Required fields validation
  const requiredFields = ['COUNTRY_ONLY', 'DATE', 'GENOTYPE'];
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Data type validation
  if (data.DATE && !Number.isInteger(Number(data.DATE))) {
    errors.push('DATE must be a valid year');
  }

  // Organism-specific validation
  if (organism === 'kpneumo') {
    validateKpneumoSpecific(data, errors);
  }

  return errors;
};
```

### Phase 2: Backend Implementation

#### 2.1 Database Model

Create a Mongoose model for your organism:

```javascript
// models/[organism].js
import mongoose from 'mongoose';

const organismSchema = new mongoose.Schema({
  // Core fields
  COUNTRY_ONLY: { type: String, required: true, index: true },
  DATE: { type: Number, required: true, index: true },
  GENOTYPE: { type: String, required: true, index: true },

  // Resistance data (dynamic based on organism)
  resistance: {
    type: Map,
    of: String, // R/S/I values
  },

  // Organism-specific fields
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },

  // Audit fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  collection: `${organism}_data`,
  indexes: [
    { COUNTRY_ONLY: 1, DATE: 1 },
    { GENOTYPE: 1, DATE: 1 },
    { 'resistance.Ciprofloxacin': 1 }, // Example drug index
  ]
});

export default mongoose.model(organism, organismSchema);
```

#### 2.2 Data Import Controller

Create an import function for CSV data:

```javascript
// controllers/import-[organism].js
import csv from 'csv-parser';
import fs from 'fs';
import OrganismModel from '../models/[organism].js';

export const importOrganismData = async (csvFilePath) => {
  const results = [];
  const errors = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        // Validate and transform data
        const validationErrors = validateOrganismData(data, '[organism]');

        if (validationErrors.length === 0) {
          results.push(transformDataForDatabase(data));
        } else {
          errors.push({ row: results.length + 1, errors: validationErrors });
        }
      })
      .on('end', async () => {
        try {
          // Bulk insert with error handling
          if (results.length > 0) {
            await OrganismModel.insertMany(results, { ordered: false });
          }

          resolve({
            imported: results.length,
            errors: errors.length,
            details: errors
          });
        } catch (error) {
          reject(error);
        }
      });
  });
};
```

#### 2.3 API Endpoints

Create RESTful endpoints for your organism:

```javascript
// routes/api/[organism].js
import express from 'express';
import OrganismModel from '../../models/[organism].js';
import { buildAggregationPipeline } from '../../utils/aggregation.js';

const router = express.Router();

// GET /api/[organism] - Fetch organism data with filters
router.get('/', async (req, res) => {
  try {
    const {
      country,
      year_start,
      year_end,
      genotype,
      drug,
      resistance_type,
      limit = 1000,
      offset = 0
    } = req.query;

    // Build aggregation pipeline
    const pipeline = buildAggregationPipeline({
      organism: '[organism]',
      filters: { country, year_start, year_end, genotype, drug, resistance_type },
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const data = await OrganismModel.aggregate(pipeline);
    const total = await OrganismModel.countDocuments(pipeline[0].$match || {});

    res.json({
      data,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/[organism]/summary - Get summary statistics
router.get('/summary', async (req, res) => {
  try {
    const summary = await OrganismModel.aggregate([
      {
        $group: {
          _id: null,
          totalSamples: { $sum: 1 },
          uniqueCountries: { $addToSet: '$COUNTRY_ONLY' },
          uniqueGenotypes: { $addToSet: '$GENOTYPE' },
          yearRange: {
            $push: {
              min: { $min: '$DATE' },
              max: { $max: '$DATE' }
            }
          }
        }
      },
      {
        $project: {
          totalSamples: 1,
          countryCount: { $size: '$uniqueCountries' },
          genotypeCount: { $size: '$uniqueGenotypes' },
          yearRange: { $arrayElemAt: ['$yearRange', 0] }
        }
      }
    ]);

    res.json(summary[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### Phase 3: Frontend Implementation

#### 3.1 Organism Configuration

Add your organism to the configuration:

```javascript
// src/util/organisms.js
export const organisms = {
  // ... existing organisms

  '[organism]': {
    id: '[organism]',
    name: 'Organism Full Name',
    shortName: 'Org Name',
    description: 'Brief description of the organism',

    // Visualization configuration
    defaultMapView: 'Resistance prevalence',
    defaultDrugs: ['Drug1', 'Drug2', 'Drug3'],

    // Available drugs for this organism
    drugs: [
      'Ampicillin',
      'Ciprofloxacin',
      'Ceftriaxone',
      // ... more drugs
    ],

    // Drug classes
    drugClasses: {
      'Beta-lactams': ['Ampicillin', 'Ceftriaxone'],
      'Quinolones': ['Ciprofloxacin'],
      // ... more classes
    },

    // Color schemes
    colors: {
      primary: '#1976d2',
      secondary: '#dc004e',
      genotypes: 'Set3' // ColorBrewer scheme
    },

    // Special features
    features: {
      hasConvergenceAnalysis: false,
      hasKOTypes: false,
      hasSublineages: false,
      hasCGST: false
    }
  }
};
```

#### 3.2 Redux Store Integration

Add organism-specific state management:

```javascript
// src/stores/slices/[organism]Slice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Data
  data: [],
  summary: {},

  // Filters
  selectedCountries: [],
  selectedGenotypes: [],
  selectedDrugs: [],
  yearRange: [2000, 2024],

  // UI state
  loading: false,
  error: null,

  // Organism-specific state
  // Add fields specific to your organism
};

const organismSlice = createSlice({
  name: '[organism]',
  initialState,
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateFilters: (state, action) => {
      Object.assign(state, action.payload);
    },
    resetFilters: (state) => {
      Object.assign(state, initialState);
    }
  }
});

export const {
  setData,
  setLoading,
  setError,
  updateFilters,
  resetFilters
} = organismSlice.actions;

export default organismSlice.reducer;
```

#### 3.3 Organism-Specific Components

Create components for organism-specific features:

```javascript
// src/components/Organisms/[Organism]/OrganismDashboard.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MainLayout } from '../../Layout';
import { OrganismMap } from './OrganismMap';
import { OrganismGraphs } from './OrganismGraphs';
import { OrganismFilters } from './OrganismFilters';

/**
 * Main dashboard component for [Organism]
 *
 * Features:
 * - Interactive map visualization
 * - Resistance trend graphs
 * - Advanced filtering options
 * - Data export capabilities
 */
export const OrganismDashboard = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.[organism]);

  useEffect(() => {
    // Load initial data
    dispatch(loadOrganismData());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <MainLayout>
      <OrganismFilters />
      <OrganismMap data={data} />
      <OrganismGraphs data={data} />
    </MainLayout>
  );
};
```

#### 3.4 Data Service Layer

Create services for API communication:

```javascript
// src/services/[organism]Service.js
import axios from 'axios';

const BASE_URL = '/api/[organism]';

class OrganismService {
  /**
   * Fetch organism data with filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} API response with data and pagination
   */
  async getData(filters = {}) {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          ...filters,
          limit: filters.limit || 1000,
          offset: filters.offset || 0
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch [organism] data: ${error.message}`);
    }
  }

  /**
   * Get summary statistics
   * @returns {Promise<Object>} Summary data
   */
  async getSummary() {
    try {
      const response = await axios.get(`${BASE_URL}/summary`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch [organism] summary: ${error.message}`);
    }
  }

  /**
   * Export data to CSV
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Blob>} CSV file blob
   */
  async exportData(filters = {}) {
    try {
      const response = await axios.get(`${BASE_URL}/export`, {
        params: filters,
        responseType: 'blob'
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to export [organism] data: ${error.message}`);
    }
  }
}

export default new OrganismService();
```

### Phase 4: Visualization Components

#### 4.1 Map Visualization

```javascript
// src/components/Organisms/[Organism]/OrganismMap.js
import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

/**
 * Interactive map showing resistance prevalence by country
 */
export const OrganismMap = ({ data, selectedDrug, mapView }) => {
  const colorScale = useMemo(() => {
    const values = data.map(d => d.resistanceRate);
    return scaleLinear()
      .domain([0, Math.max(...values)])
      .range(['#fee5d9', '#de2d26']);
  }, [data]);

  const processedData = useMemo(() => {
    // Process data for map visualization
    return data.reduce((acc, item) => {
      const country = item.country;
      if (!acc[country]) {
        acc[country] = {
          samples: 0,
          resistant: 0,
          resistanceRate: 0
        };
      }

      acc[country].samples += 1;
      if (item.resistance[selectedDrug] === 'R') {
        acc[country].resistant += 1;
      }

      acc[country].resistanceRate =
        (acc[country].resistant / acc[country].samples) * 100;

      return acc;
    }, {});
  }, [data, selectedDrug]);

  return (
    <div className="organism-map">
      <ComposableMap>
        <Geographies geography="/path/to/world-110m.json">
          {({ geographies }) =>
            geographies.map(geo => {
              const countryData = processedData[geo.properties.NAME];
              const fillColor = countryData
                ? colorScale(countryData.resistanceRate)
                : '#f0f0f0';

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fillColor}
                  stroke="#333"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#ff6b6b' },
                    pressed: { outline: 'none' }
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};
```

#### 4.2 Trend Graphs

```javascript
// src/components/Organisms/[Organism]/TrendGraphs.js
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * Resistance trend visualization over time
 */
export const TrendGraphs = ({ data, selectedDrugs, selectedGenotypes }) => {
  const processedData = useMemo(() => {
    // Group data by year and calculate resistance rates
    const yearlyData = {};

    data.forEach(item => {
      const year = item.year;
      if (!yearlyData[year]) {
        yearlyData[year] = {};
      }

      selectedDrugs.forEach(drug => {
        if (!yearlyData[year][drug]) {
          yearlyData[year][drug] = { total: 0, resistant: 0 };
        }

        yearlyData[year][drug].total += 1;
        if (item.resistance[drug] === 'R') {
          yearlyData[year][drug].resistant += 1;
        }
      });
    });

    // Convert to chart format
    return Object.keys(yearlyData)
      .sort()
      .map(year => {
        const yearData = { year: parseInt(year) };

        selectedDrugs.forEach(drug => {
          const drugData = yearlyData[year][drug];
          yearData[drug] = drugData
            ? (drugData.resistant / drugData.total) * 100
            : 0;
        });

        return yearData;
      });
  }, [data, selectedDrugs]);

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <div className="trend-graphs">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis
            label={{ value: 'Resistance Rate (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
            labelFormatter={(year) => `Year: ${year}`}
          />
          <Legend />

          {selectedDrugs.map((drug, index) => (
            <Line
              key={drug}
              type="monotone"
              dataKey={drug}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

### Phase 5: Testing and Validation

#### 5.1 Unit Tests

```javascript
// tests/organisms/[organism].test.js
import { validateOrganismData } from '../src/utils/validation.js';
import OrganismService from '../src/services/[organism]Service.js';

describe('[Organism] Data Validation', () => {
  test('validates required fields', () => {
    const invalidData = {
      COUNTRY_ONLY: '',
      DATE: null,
      GENOTYPE: 'ST1'
    };

    const errors = validateOrganismData(invalidData, '[organism]');
    expect(errors).toContain('Missing required field: COUNTRY_ONLY');
    expect(errors).toContain('Missing required field: DATE');
  });

  test('validates data types', () => {
    const invalidData = {
      COUNTRY_ONLY: 'USA',
      DATE: 'invalid-year',
      GENOTYPE: 'ST1'
    };

    const errors = validateOrganismData(invalidData, '[organism]');
    expect(errors).toContain('DATE must be a valid year');
  });
});

describe('[Organism] Service', () => {
  test('fetches data successfully', async () => {
    const mockData = {
      data: [{ id: 1, COUNTRY_ONLY: 'USA' }],
      pagination: { total: 1, limit: 10, offset: 0 }
    };

    jest.spyOn(axios, 'get').mockResolvedValue({ data: mockData });

    const result = await OrganismService.getData();
    expect(result).toEqual(mockData);
  });
});
```

#### 5.2 Integration Tests

```javascript
// tests/integration/[organism]-api.test.js
import request from 'supertest';
import app from '../src/app.js';

describe('[Organism] API Integration', () => {
  test('GET /api/[organism] returns data', async () => {
    const response = await request(app)
      .get('/api/[organism]')
      .query({ limit: 10 })
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('GET /api/[organism]/summary returns statistics', async () => {
    const response = await request(app)
      .get('/api/[organism]/summary')
      .expect(200);

    expect(response.body).toHaveProperty('totalSamples');
    expect(response.body).toHaveProperty('countryCount');
    expect(response.body).toHaveProperty('genotypeCount');
  });
});
```

### Phase 6: Documentation

#### 6.1 API Documentation

Create comprehensive API documentation:

```markdown
## [Organism] API Endpoints

### GET /api/[organism]

Retrieve organism data with optional filtering.

**Parameters:**
- `country` (string, optional): Filter by country ISO code
- `year_start` (integer, optional): Start year for date range
- `year_end` (integer, optional): End year for date range
- `genotype` (string, optional): Filter by genotype
- `drug` (string, optional): Filter by specific drug
- `resistance_type` (string, optional): Filter by resistance type (R/S/I)
- `limit` (integer, optional): Maximum results per page (default: 1000)
- `offset` (integer, optional): Results offset for pagination (default: 0)

**Example Request:**
```bash
GET /api/[organism]?country=USA&year_start=2020&limit=100
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "sample_001",
      "COUNTRY_ONLY": "USA",
      "DATE": 2020,
      "GENOTYPE": "ST1",
      "resistance": {
        "Ciprofloxacin": "R",
        "Ampicillin": "S"
      }
    }
  ],
  "pagination": {
    "total": 1500,
    "limit": 100,
    "offset": 0,
    "pages": 15
  }
}
```
```

#### 6.2 Component Documentation

Document React components with JSDoc:

```javascript
/**
 * [Organism] Dashboard Component
 *
 * Main dashboard interface for [organism] data visualization and analysis.
 * Provides interactive maps, trend graphs, and filtering capabilities.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.organism - Organism identifier
 * @param {Object} props.initialFilters - Initial filter state
 *
 * @example
 * <OrganismDashboard
 *   organism="[organism]"
 *   initialFilters={{ year_start: 2020 }}
 * />
 *
 * @features
 * - Real-time data filtering
 * - Interactive map visualization
 * - Exportable resistance trend graphs
 * - Responsive design for mobile/desktop
 *
 * @dependencies
 * - React 18+
 * - Redux Toolkit
 * - Recharts for data visualization
 * - React Simple Maps for geographic display
 */
```

## Data Requirements

### Essential Data Fields

All organisms must include these core fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `COUNTRY_ONLY` | String | Yes | ISO country name |
| `DATE` | Integer | Yes | Year of isolation |
| `GENOTYPE` | String | Yes | Primary genotype/lineage |
| `SAMPLE_ID` | String | Yes | Unique sample identifier |
| `PMID` | String | No | Publication reference |

### Resistance Data

Drug resistance data should follow this format:

| Drug Name | Type | Values | Description |
|-----------|------|--------|-------------|
| `Ampicillin` | String | R/S/I | Resistant/Sensitive/Intermediate |
| `Ciprofloxacin` | String | R/S/I | Resistance phenotype |
| `Ceftriaxone` | String | R/S/I | Third-generation cephalosporin |

### Data Quality Requirements

1. **Completeness**: >95% of core fields populated
2. **Consistency**: Standardized country names and drug nomenclature
3. **Accuracy**: Validated resistance calling methods
4. **Temporal Coverage**: Minimum 5 years of data
5. **Geographic Representation**: Multiple countries/regions

### Data Validation Checklist

- [ ] All required fields present
- [ ] Country names standardized (use ISO codes)
- [ ] Years within reasonable range (1990-2024)
- [ ] Resistance values limited to R/S/I
- [ ] No duplicate sample IDs
- [ ] Genotype nomenclature consistent
- [ ] Geographic coordinates accurate (if provided)

## Frontend Configuration

### Adding to Organism Selector

Update the organism cards configuration:

```javascript
// src/util/organismsCards.js
export const organismsCards = [
  // ... existing organisms
  {
    value: '[organism]',
    label: 'Organism Name',
    stringLabel: 'Full Organism Name',
    img: '/assets/organisms/[organism].jpg',
    disabled: false,
    description: 'Brief description for the card'
  }
];
```

### Drug Configuration

Define organism-specific drugs:

```javascript
// src/util/drugs.js
export const drugs[ORGANISM] = [
  'Ampicillin',
  'Ciprofloxacin',
  'Ceftriaxone',
  'Azithromycin',
  // ... add all relevant drugs
];

// Drug class groupings
export const drugClasses[ORGANISM] = {
  'Beta-lactams': ['Ampicillin', 'Ceftriaxone'],
  'Quinolones': ['Ciprofloxacin', 'Levofloxacin'],
  'Macrolides': ['Azithromycin', 'Erythromycin']
};
```

### Color Schemes

Define consistent color palettes:

```javascript
// src/util/colorHelper.js
export const organismColors = {
  '[organism]': {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#2e7d32',
    warning: '#ed6c02',
    error: '#d32f2f',

    // Resistance levels
    resistant: '#d32f2f',
    intermediate: '#ed6c02',
    sensitive: '#2e7d32',

    // Genotype palette (ColorBrewer)
    genotypes: [
      '#8dd3c7', '#ffffb3', '#bebada', '#fb8072',
      '#80b1d3', '#fdb462', '#b3de69', '#fccde5'
    ]
  }
};
```

## Backend Implementation

### Database Optimization

Create efficient indexes for your organism:

```javascript
// Database indexes for optimal query performance
const indexes = [
  // Core filtering indexes
  { 'COUNTRY_ONLY': 1, 'DATE': 1 },
  { 'GENOTYPE': 1, 'DATE': 1 },

  // Resistance-specific indexes
  { 'resistance.Ciprofloxacin': 1, 'DATE': 1 },
  { 'resistance.Ampicillin': 1, 'COUNTRY_ONLY': 1 },

  // Compound indexes for common queries
  { 'COUNTRY_ONLY': 1, 'GENOTYPE': 1, 'DATE': 1 },

  // Text search index for metadata
  { 'metadata': 'text' }
];
```

### Aggregation Pipelines

Create reusable aggregation functions:

```javascript
// utils/aggregation.js
export const buildResistanceTrendPipeline = (organism, filters) => {
  return [
    // Match stage - apply filters
    {
      $match: {
        ...buildFilterStage(filters),
        DATE: { $gte: filters.year_start, $lte: filters.year_end }
      }
    },

    // Group by year and drug
    {
      $group: {
        _id: {
          year: '$DATE',
          country: '$COUNTRY_ONLY'
        },
        samples: { $sum: 1 },
        resistantSamples: {
          $sum: {
            $cond: [
              { $eq: [`$resistance.${filters.drug}`, 'R'] },
              1,
              0
            ]
          }
        }
      }
    },

    // Calculate resistance rate
    {
      $project: {
        year: '$_id.year',
        country: '$_id.country',
        samples: 1,
        resistantSamples: 1,
        resistanceRate: {
          $multiply: [
            { $divide: ['$resistantSamples', '$samples'] },
            100
          ]
        }
      }
    },

    // Sort by year
    { $sort: { year: 1 } }
  ];
};
```

### API Rate Limiting

Implement rate limiting for API endpoints:

```javascript
// middleware/rateLimiting.js
import rateLimit from 'express-rate-limit';

export const createOrganismLimiter = (organism) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: `Too many requests for ${organism} data. Please try again later.`,
    standardHeaders: true,
    legacyHeaders: false,
  });
};
```

## Testing and Validation

### Data Quality Tests

```javascript
// tests/data-quality/[organism].test.js
describe('[Organism] Data Quality', () => {
  let sampleData;

  beforeAll(async () => {
    sampleData = await OrganismModel.find().limit(1000);
  });

  test('all samples have required fields', () => {
    const requiredFields = ['COUNTRY_ONLY', 'DATE', 'GENOTYPE'];

    sampleData.forEach((sample, index) => {
      requiredFields.forEach(field => {
        expect(sample[field]).toBeDefined();
        expect(sample[field]).not.toBe('');
      });
    });
  });

  test('resistance values are valid', () => {
    const validValues = ['R', 'S', 'I', '', null, undefined];

    sampleData.forEach(sample => {
      Object.values(sample.resistance || {}).forEach(value => {
        expect(validValues).toContain(value);
      });
    });
  });

  test('date ranges are reasonable', () => {
    const currentYear = new Date().getFullYear();

    sampleData.forEach(sample => {
      expect(sample.DATE).toBeGreaterThanOrEqual(1990);
      expect(sample.DATE).toBeLessThanOrEqual(currentYear);
    });
  });
});
```

### Performance Tests

```javascript
// tests/performance/[organism].test.js
describe('[Organism] Performance', () => {
  test('API response time under 2 seconds', async () => {
    const startTime = Date.now();

    const response = await request(app)
      .get('/api/[organism]')
      .query({ limit: 1000 });

    const responseTime = Date.now() - startTime;

    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(2000);
  });

  test('large dataset queries are efficient', async () => {
    const startTime = Date.now();

    const response = await request(app)
      .get('/api/[organism]')
      .query({
        country: 'USA',
        year_start: 2010,
        year_end: 2024,
        limit: 10000
      });

    const responseTime = Date.now() - startTime;

    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(5000);
  });
});
```

## Documentation

### ReadTheDocs Integration

Add your organism to the documentation:

```rst
.. docs/organisms/[organism].rst

[Organism] Data
===============

Overview
--------

Description of the organism, its clinical significance, and the surveillance data available in AMRnet.

Data Sources
------------

* **Primary Source**: Description of main data source
* **Sample Size**: Number of genomes/isolates
* **Geographic Coverage**: Countries and regions represented
* **Temporal Range**: Years of data collection
* **Data Quality**: Quality control measures applied

Available Visualizations
------------------------

Map View
~~~~~~~~

Interactive world map showing:

* Resistance prevalence by country
* Sample size distribution
* Temporal trends overlay

Resistance Trends
~~~~~~~~~~~~~~~~~

Time series graphs displaying:

* Annual resistance rates
* Drug-specific trends
* Genotype associations

Filter Options
--------------

Geographic Filters
~~~~~~~~~~~~~~~~~~

* **Country**: Select individual countries
* **Region**: Filter by WHO/UN regions
* **Economic Status**: Development classification

Temporal Filters
~~~~~~~~~~~~~~~~

* **Year Range**: Specify start and end years
* **Sample Period**: Group by collection periods

Biological Filters
~~~~~~~~~~~~~~~~~~

* **Genotype/Lineage**: Select specific genetic lineages
* **Resistance Profile**: Filter by drug resistance patterns
* **Sample Type**: Clinical vs. surveillance samples

API Access
----------

Programmatic access to [organism] data:

.. code-block:: bash

    # Get all data
    curl "https://api.amrnet.org/[organism]"

    # Filter by country and year
    curl "https://api.amrnet.org/[organism]?country=USA&year_start=2020"

    # Get summary statistics
    curl "https://api.amrnet.org/[organism]/summary"

Data Dictionary
---------------

Core Fields
~~~~~~~~~~~

.. list-table::
   :header-rows: 1
   :widths: 20 15 15 50

   * - Field Name
     - Data Type
     - Required
     - Description
   * - COUNTRY_ONLY
     - String
     - Yes
     - ISO country name
   * - DATE
     - Integer
     - Yes
     - Year of isolation
   * - GENOTYPE
     - String
     - Yes
     - Primary genotype/lineage

Resistance Fields
~~~~~~~~~~~~~~~~~

.. list-table::
   :header-rows: 1
   :widths: 25 15 60

   * - Drug Name
     - Values
     - Description
   * - Ampicillin
     - R/S/I
     - Beta-lactam antibiotic
   * - Ciprofloxacin
     - R/S/I
     - Fluoroquinolone antibiotic

Citation
--------

If you use [organism] data from AMRnet, please cite:

[Author et al. Title. Journal. Year. DOI]

```

## Deployment

### Environment Configuration

Update deployment configuration:

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:6.0
    environment:
      - MONGO_INITDB_DATABASE=amrnet
    volumes:
      - mongodb_data:/data/db
      - ./init-scripts/[organism]:/docker-entrypoint-initdb.d

  api:
    build: .
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/amrnet
      - [ORGANISM]_ENABLED=true
    depends_on:
      - mongodb

  frontend:
    build: ./client
    environment:
      - REACT_APP_API_URL=http://api:3000
      - REACT_APP_[ORGANISM]_ENABLED=true

volumes:
  mongodb_data:
```

### Database Migration

Create migration scripts:

```javascript
// migrations/add-[organism]-indexes.js
export async function up(db) {
  const collection = db.collection('[organism]_data');

  // Create indexes for optimal performance
  await collection.createIndex({ 'COUNTRY_ONLY': 1, 'DATE': 1 });
  await collection.createIndex({ 'GENOTYPE': 1, 'DATE': 1 });
  await collection.createIndex({ 'resistance.Ciprofloxacin': 1 });

  console.log('[Organism] indexes created successfully');
}

export async function down(db) {
  const collection = db.collection('[organism]_data');

  // Drop organism-specific indexes
  await collection.dropIndex({ 'COUNTRY_ONLY': 1, 'DATE': 1 });
  await collection.dropIndex({ 'GENOTYPE': 1, 'DATE': 1 });
  await collection.dropIndex({ 'resistance.Ciprofloxacin': 1 });

  console.log('[Organism] indexes removed');
}
```

### Feature Flags

Implement feature flags for gradual rollout:

```javascript
// config/features.js
export const featureFlags = {
  organisms: {
    '[organism]': {
      enabled: process.env.[ORGANISM]_ENABLED === 'true',
      betaUsers: process.env.[ORGANISM]_BETA_USERS?.split(',') || [],
      features: {
        advancedFiltering: true,
        dataExport: true,
        apiAccess: true
      }
    }
  }
};
```

## Troubleshooting

### Common Issues

#### 1. Data Import Failures

**Problem**: CSV import fails with validation errors

**Solutions**:
- Check data format against schema requirements
- Validate country names against ISO standards
- Ensure date fields are numeric years
- Verify drug names match expected nomenclature

#### 2. Performance Issues

**Problem**: Slow query response times

**Solutions**:
- Check database indexes are properly created
- Optimize aggregation pipelines
- Implement data pagination
- Consider data preprocessing for large datasets

#### 3. Frontend Display Issues

**Problem**: Visualizations not rendering correctly

**Solutions**:
- Verify data format matches component expectations
- Check for missing or null values in datasets
- Validate color scheme configurations
- Test with reduced datasets

### Debugging Tools

```javascript
// utils/debug.js
export const debugOrganism = async (organism) => {
  console.log(`Debugging ${organism}...`);

  // Check data availability
  const count = await OrganismModel.countDocuments();
  console.log(`Total documents: ${count}`);

  // Check index efficiency
  const indexStats = await OrganismModel.collection.indexStats();
  console.log('Index statistics:', indexStats);

  // Sample data validation
  const sample = await OrganismModel.findOne();
  const validation = validateOrganismData(sample, organism);
  console.log('Sample validation:', validation);

  // Check API endpoint
  try {
    const response = await fetch(`/api/${organism}/summary`);
    const summary = await response.json();
    console.log('API summary:', summary);
  } catch (error) {
    console.error('API test failed:', error);
  }
};
```

### Performance Monitoring

```javascript
// middleware/monitoring.js
export const organismMonitoring = (organism) => {
  return (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      console.log(`${organism} API: ${req.method} ${req.path} - ${duration}ms`);

      // Log slow queries
      if (duration > 2000) {
        console.warn(`Slow query detected for ${organism}:`, {
          method: req.method,
          path: req.path,
          query: req.query,
          duration
        });
      }
    });

    next();
  };
};
```

## Conclusion

Adding a new organism to AMRnet requires careful planning and systematic implementation across multiple layers of the application. This guide provides a comprehensive framework for:

1. **Data preparation and validation**
2. **Backend API development**
3. **Frontend visualization components**
4. **Testing and quality assurance**
5. **Documentation and deployment**

Following this guide ensures consistency with existing organisms while maintaining the high quality and performance standards of the AMRnet platform.

### Next Steps

After implementing your organism:

1. **Beta Testing**: Deploy to staging environment for internal review
2. **User Feedback**: Gather feedback from domain experts
3. **Performance Optimization**: Monitor and optimize based on usage patterns
4. **Documentation Updates**: Keep documentation current with changes
5. **Community Engagement**: Share updates with the AMRnet community

### Support

For additional support or questions:

- **GitHub Issues**: [amrnet/amrnet/issues](https://github.com/amrnet/amrnet/issues)
- **Developer Discord**: [Link to Discord channel]
- **Email**: amrnetdashboard@gmail.com
- **Documentation**: [amrnet.readthedocs.io](https://amrnet.readthedocs.io)

---

*This guide is maintained by the AMRnet development team. Last updated: August 2025*
