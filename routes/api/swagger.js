import express from 'express';
import swaggerUi from 'swagger-ui-express';

const router = express.Router();

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'AMRnet Public API',
    version: '1.4.0',
    description: `

AMRnet is a global genomic surveillance platform for antimicrobial resistance (AMR) tracking.
This API provides programmatic access to AMR genomic data across multiple bacterial pathogens.

### Supported Organisms
- **styphi** — *Salmonella* Typhi
- **senterica** — *Salmonella enterica* (non-typhoidal)
- **sentericaints** — *Salmonella* (invasive non-typhoidal)
- **ecoli** — *Escherichia coli*
- **decoli** — Diarrhoeagenic *E. coli*
- **shige** — *Shigella* spp.
- **kpneumo** — *Klebsiella pneumoniae*
- **ngono** — *Neisseria gonorrhoeae*
- **saureus** — *Staphylococcus aureus*
- **strepneumo** — *Streptococcus pneumoniae*

### Authentication
All endpoints require an API key. Pass it via:
- **Header:** \`X-API-Key: your-api-key\`
- **Query parameter:** \`?api_key=your-api-key\`

### Data Sources
Genomic data sourced from Enterobase, Pathogenwatch, PubMLST, NCBI and WHO GLASS.

### Citation
If you use AMRnet data in your research, please cite:
>
[Cerdeira L, et al. AMRnet: a global genomic surveillance platform for antimicrobial resistance. (2026)](https://doi.org/10.1093/nar/gkaf1101)
    `,
    contact: {
      name: 'Contact - AMRnet Team',
      url: 'https://amrnet.org/#/about#team-section',
    },
    // license: {
    //   name: 'GPL-3.0',
    //   url: 'https://www.gnu.org/licenses/gpl-3.0.html',
    // },
  },
  servers: [
    {
      url: 'https://api.amrnet.org/api/v1',
      description: 'Production',
    },
    {
      url: 'https://dev.amrnet.org/api/v1',
      description: 'Development',
    },
    {
      url: '/api/v1',
      description: 'Current host (relative)',
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key passed in the X-API-Key header',
      },
      ApiKeyQuery: {
        type: 'apiKey',
        in: 'query',
        name: 'api_key',
        description: 'API key passed as a query parameter',
      },
    },
    schemas: {
      Organism: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'ecoli' },
          genomes: { type: 'integer', example: 339817 },
        },
      },
      ResistanceSummary: {
        type: 'object',
        properties: {
          organism: { type: 'string', example: 'ecoli' },
          total: { type: 'integer', example: 339817 },
          sampled: { type: 'integer', example: 50000 },
          filters: {
            type: 'object',
            properties: {
              country: { type: 'string', example: 'Brazil' },
              year_from: { type: 'string', example: '2015' },
              year_to: { type: 'string', example: '2023' },
            },
          },
          resistance: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: {
                resistant: { type: 'integer', example: 12540 },
                total: { type: 'integer', example: 50000 },
                percentage: { type: 'number', example: 25.08 },
              },
            },
          },
        },
      },
      GenomePage: {
        type: 'object',
        properties: {
          organism: { type: 'string' },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 100 },
              total: { type: 'integer', example: 339817 },
              totalPages: { type: 'integer', example: 3399 },
            },
          },
          data: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
      CountrySummary: {
        type: 'object',
        properties: {
          organism: { type: 'string' },
          total_countries: { type: 'integer', example: 85 },
          countries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                country: { type: 'string', example: 'United Kingdom' },
                genomes: { type: 'integer', example: 45230 },
                year_range: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['2010', '2011', '2022'],
                },
              },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
  security: [{ ApiKeyHeader: [] }, { ApiKeyQuery: [] }],
  paths: {
    '/organisms': {
      get: {
        tags: ['Organisms'],
        summary: 'List all available organisms',
        description: 'Returns the list of all organisms tracked by AMRnet with their genome counts.',
        responses: {
          200: {
            description: 'List of organisms',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    organisms: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Organism' },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Authentication required',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/organisms/{organism}/resistance': {
      get: {
        tags: ['Resistance'],
        summary: 'Get resistance prevalence summary',
        description:
          'Returns drug resistance prevalence for a given organism, optionally filtered by country and year range. Each drug shows the number and percentage of resistant genomes.',
        parameters: [
          {
            name: 'organism',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: [
                'styphi',
                'kpneumo',
                'ngono',
                'ecoli',
                'decoli',
                'shige',
                'senterica',
                'sentericaints',
                'saureus',
                'strepneumo',
              ],
            },
            description: 'Organism identifier',
          },
          {
            name: 'country',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by country name (e.g., Brazil, United Kingdom)',
            example: 'Brazil',
          },
          {
            name: 'year_from',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Start year (inclusive)',
            example: 2015,
          },
          {
            name: 'year_to',
            in: 'query',
            schema: { type: 'integer' },
            description: 'End year (inclusive)',
            example: 2023,
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 50000 },
            description: 'Max genomes to sample (default 50000, max 100000)',
          },
        ],
        responses: {
          200: {
            description: 'Resistance summary',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ResistanceSummary' } } },
          },
          404: { description: 'Unknown organism' },
          401: { description: 'Authentication required' },
        },
      },
    },
    '/organisms/{organism}/genomes': {
      get: {
        tags: ['Genomes'],
        summary: 'Get individual genome records',
        description:
          'Returns paginated individual genome records with genotype, country, year, and drug resistance columns. Use for detailed analysis and data mining.',
        parameters: [
          {
            name: 'organism',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: [
                'styphi',
                'kpneumo',
                'ngono',
                'ecoli',
                'decoli',
                'shige',
                'senterica',
                'sentericaints',
                'saureus',
                'strepneumo',
              ],
            },
          },
          { name: 'country', in: 'query', schema: { type: 'string' }, description: 'Filter by country' },
          {
            name: 'genotype',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by genotype (regex match)',
            example: 'ST131',
          },
          { name: 'year_from', in: 'query', schema: { type: 'integer' }, example: 2020 },
          { name: 'year_to', in: 'query', schema: { type: 'integer' }, example: 2024 },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 100, maximum: 1000 },
            description: 'Records per page (max 1000)',
          },
        ],
        responses: {
          200: {
            description: 'Paginated genome data',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/GenomePage' } } },
          },
          404: { description: 'Unknown organism' },
          401: { description: 'Authentication required' },
        },
      },
    },
    '/organisms/{organism}/countries': {
      get: {
        tags: ['Geographic'],
        summary: 'Get per-country genome summary',
        description:
          'Returns a summary of genome counts per country for the given organism, including the years covered.',
        parameters: [
          {
            name: 'organism',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: [
                'styphi',
                'kpneumo',
                'ngono',
                'ecoli',
                'decoli',
                'shige',
                'senterica',
                'sentericaints',
                'saureus',
                'strepneumo',
              ],
            },
          },
          { name: 'year_from', in: 'query', schema: { type: 'integer' } },
          { name: 'year_to', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'Country summary',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CountrySummary' } } },
          },
          404: { description: 'Unknown organism' },
          401: { description: 'Authentication required' },
        },
      },
    },
    '/organisms/{organism}/download': {
      get: {
        tags: ['Download'],
        summary: 'Download full dataset',
        description:
          'Download the complete dataset for an organism in JSON or CSV format. Large datasets may take time to generate.',
        parameters: [
          {
            name: 'organism',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: [
                'styphi',
                'kpneumo',
                'ngono',
                'ecoli',
                'decoli',
                'shige',
                'senterica',
                'sentericaints',
                'saureus',
                'strepneumo',
              ],
            },
          },
          {
            name: 'format',
            in: 'query',
            schema: { type: 'string', enum: ['json', 'csv'], default: 'json' },
            description: 'Output format',
          },
        ],
        responses: {
          200: { description: 'Full dataset file' },
          404: { description: 'Unknown organism' },
          401: { description: 'Authentication required' },
        },
      },
    },
  },
};

// Custom Swagger UI options
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { background-color: #eed7f9; }
    .swagger-ui .info .title { color: #601a7e; }
    /* Replace the default Swagger UI logo with AMRnet's */
    .swagger-ui .topbar-wrapper a img,
    .swagger-ui .topbar-wrapper svg { display: none; }
    .swagger-ui .topbar-wrapper a::before {
      content: '';
      display: inline-block;
      width: 140px;
      height: 40px;
      background-image: url('/amrnet-icon.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: left center;
    }
  `,
  customSiteTitle: 'AMRnet API Documentation',
  customfavIcon: '/amrnet-icon.png',
  swaggerOptions: {
    persistAuthorization: true,
    defaultModelsExpandDepth: -1,
  },
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument, swaggerOptions));

export default router;
