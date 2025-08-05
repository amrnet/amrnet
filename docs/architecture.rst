Dashboard Architecture
====================

AMRnet is built using a modern, scalable MERN stack architecture designed to handle large-scale genomic surveillance data. This page provides both high-level overview and detailed component architecture diagrams.

Architecture Overview
-------------------

AMRnet employs a four-layer architecture optimized for performance, scalability, and user experience:

1. **Data Sources & Ingestion** - Automated harvesting from public genomic databases
2. **Data Lake & Processing** - Harmonization and quality control in MongoDB Atlas
3. **Application Layer** - MERN stack with optimized APIs and interactive React frontend
4. **User Access** - Multi-modal access via web interface and RESTful API

Interactive Architecture Diagrams
--------------------------------

We provide two complementary views of the AMRnet architecture:

Macro Architecture View
~~~~~~~~~~~~~~~~~~~~~~

The macro view provides a high-level overview of the four main architectural layers:

.. raw:: html

   <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
     <p style="margin-bottom: 10px;"><strong>📊 Macro Architecture View</strong></p>
     <p style="margin-bottom: 15px; color: #6c757d;">High-level overview of the four main architectural layers with technology stack details.</p>
     <a href="_static/amrnet_architecture_macro.html" target="_blank" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: 500;">
       🔍 View Macro Architecture
     </a>
   </div>

Detailed Component View
~~~~~~~~~~~~~~~~~~~~~~

The expanded view shows detailed data flow and individual components:

.. raw:: html

   <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
     <p style="margin-bottom: 10px;"><strong>🔬 Detailed Component View</strong></p>
     <p style="margin-bottom: 15px; color: #6c757d;">Comprehensive data pipeline with all components, data sources, and processing stages.</p>
     <a href="_static/amrnet_architecture_expand.html" target="_blank" style="display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: 500;">
       🔍 View Detailed Architecture
     </a>
   </div>

Platform Capabilities
--------------------

Technical Performance
~~~~~~~~~~~~~~~~~~~~

AMRnet delivers enterprise-grade performance with significant optimizations:

* **70-87% faster load times** through advanced optimization techniques
* **90% payload compression** reducing bandwidth requirements
* **Real-time data synchronization** with automated updates
* **10,000+ API requests per hour** capacity

Data Coverage
~~~~~~~~~~~~

Our platform provides comprehensive AMR surveillance data:

* **8 pathogen species** from major public databases
* **500,000+ genomic records** with AMR predictions
* **75+ countries** represented in the global dataset
* **4 languages** supported (English, Spanish, French, Portuguese)

Architecture Components
----------------------

Frontend Layer
~~~~~~~~~~~~~

**React 18 Application**
  Modern React application with hooks, state management, and optimized rendering

**Interactive Visualizations**
  Charts, maps, and trend analysis using D3.js integration

**Multi-language Support**
  Complete internationalization with professional medical translation

**Responsive Design**
  Mobile-first approach with progressive web app capabilities

Backend Layer
~~~~~~~~~~~~

**Node.js v18.20.4 Server**
  Express.js server with optimized endpoints and comprehensive middleware

**RESTful API**
  Full-featured API with rate limiting, authentication, and detailed documentation

**Performance Engine**
  Advanced optimization including pagination, compression, and intelligent caching

**Security Framework**
  Helmet security, CORS protection, API authentication, and OAuth2 support

Database Layer
~~~~~~~~~~~~~

**MongoDB Atlas**
  Cloud-hosted MongoDB with automated backups and horizontal scaling

**Organism Collections**
  Specialized collections for 8 major AMR organisms with optimized schemas

**Performance Indexes**
  Compound indexes optimized for geographic, temporal, and genotype queries

**Aggregation Pipeline**
  Server-side processing for efficient data filtering and analysis

Infrastructure Layer
~~~~~~~~~~~~~~~~~~~

**Heroku Platform**
  Cloud deployment with auto-scaling and continuous integration

**Fixie Proxy Service**
  Secure database connections through SOCKS5 proxy

**AWS S3 Storage**
  Data export storage and backup with public access capabilities

**CI/CD Pipeline**
  Automated testing, building, and deployment through GitHub Actions

Data Sources Integration
-----------------------

Public Genomic Databases
~~~~~~~~~~~~~~~~~~~~~~~

**Pathogenwatch**
  * Salmonella Typhi with AMR predictions
  * Klebsiella pneumoniae surveillance data
  * Neisseria gonorrhoeae resistance profiles

**Enterobase**
  * Escherichia coli with hierarchical clustering
  * Shigella species surveillance
  * Salmonella enterica global dataset

Automated Data Harvesting
~~~~~~~~~~~~~~~~~~~~~~~~~

**Spyder Robot**
  Custom web scraping tool for automated genomic data extraction

**Data Ingestion APIs**
  RESTful endpoints for programmatic data retrieval and processing

**Quality Control Pipeline**
  Automated validation, harmonization, and metadata standardization

Performance Optimizations
-------------------------

The AMRnet platform incorporates numerous performance enhancements:

Data Optimization
~~~~~~~~~~~~~~~~

* **Optimized API endpoints** (``/api/optimized/*``) with parallel processing
* **Field projection** to minimize data transfer
* **Aggregation pipelines** for server-side computation
* **Connection pooling** for database efficiency

Frontend Optimization
~~~~~~~~~~~~~~~~~~~~

* **Code splitting** and lazy loading for faster initial loads
* **Service workers** for offline functionality
* **Compression** algorithms reducing payload sizes
* **Progressive web app** features for mobile experience

Deployment Features
~~~~~~~~~~~~~~~~~~

* **Auto-scaling** based on traffic demands
* **Health monitoring** with automated alerts
* **Performance tracking** and analytics
* **Error logging** with Sentry integration

Quality Assurance
-----------------

Our architecture ensures data quality and system reliability:

Data Quality
~~~~~~~~~~~

* **Source validation** from trusted genomic databases
* **Harmonization** of country names, regions, and date formats
* **Deduplication** algorithms preventing data redundancy
* **Version control** maintaining data provenance

System Reliability
~~~~~~~~~~~~~~~~~

* **Automated testing** with comprehensive test suites
* **Continuous monitoring** of system performance
* **Backup strategies** ensuring data protection
* **Security auditing** with regular vulnerability assessments

Future Architecture Plans
-------------------------

Planned enhancements to the AMRnet architecture include:

* **Machine learning integration** for predictive AMR modeling
* **Real-time alerts** for emerging resistance patterns
* **Enhanced visualization** with 3D geographic modeling
* **Blockchain integration** for data provenance and sharing
* **Federated learning** capabilities for distributed AMR analysis

For technical implementation details, please see our `GitHub repository <https://github.com/amrnet/amrnet>`_ and `API documentation <api.html>`_.
