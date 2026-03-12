# Changelog

All notable changes to AMRnet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Enhanced database configuration with timeout protection helpers (getDataWithTimeout, getAggregatedDataWithTimeout, getCollectionCountWithTimeout, getConnectedClient)
- Input validation middleware for email endpoint using express-validator

### Changed

- Consolidated duplicated MongoDB connection logic across api.js and optimized.js to use shared config/db.js
- Refactored 8 duplicated MongoDB import routes into single parameterized importOrganismJsonFiles function
- Improved command execution security: migrated from exec() to execFile() with argument arrays to prevent shell injection
- Removed unnecessary configuration files: .travis.yml, webpack.config.js, ruff.toml, .eslintrc.js, .readthedocs.translations.yaml
- Extracted helper functions from route modules to centralized config/db.js for reusability

### Fixed

- Removed 8 unused/dead code files: enhanced-server.js, worker.js, processData.js, generate_file.js, filters_functions.js, useGraphWorker.js, ProgressiveDataLoader.js, paginationLoader.js
- Fixed server startup with proper database connection retry logic (exponential backoff with max 3 attempts)
- Improved code maintainability and reduced duplication across backend modules

## [1.1.1] - 2026-03-12

### Added

- Enhanced database configuration with timeout protection helpers (getDataWithTimeout, getAggregatedDataWithTimeout, getCollectionCountWithTimeout, getConnectedClient)
- Input validation middleware for email endpoint using express-validator

### Changed

- Consolidated duplicated MongoDB connection logic across api.js and optimized.js to use shared config/db.js
- Refactored 8 duplicated MongoDB import routes into single parameterized importOrganismJsonFiles function
- Improved command execution security: migrated from exec() to execFile() with argument arrays to prevent shell injection
- Removed unnecessary configuration files: .travis.yml, webpack.config.js, ruff.toml, .eslintrc.js, .readthedocs.translations.yaml
- Extracted helper functions from route modules to centralized config/db.js for reusability

### Fixed

- Removed 8 unused/dead code files: enhanced-server.js, worker.js, processData.js, generate_file.js, filters_functions.js, useGraphWorker.js, ProgressiveDataLoader.js, paginationLoader.js
- Fixed server startup with proper database connection retry logic (exponential backoff with max 3 attempts)
- Improved code maintainability and reduced duplication across backend modules

## [1.1.0] - 2024-XX-XX

### Added

- Multi-language support (English, French, Portuguese, Spanish)
- Mobile-responsive design improvements
- Enhanced data export capabilities
- API documentation and endpoints
- Performance optimizations for large datasets

### Changed

- Updated dashboard UI/UX for better accessibility
- Improved database query performance
- Enhanced error handling and user feedback

### Fixed

- CSV export encoding issues for international characters
- Map zoom performance optimizations
- Mobile device compatibility issues

## [1.0.0] - 2023-XX-XX

### Added

- Initial release of AMRnet dashboard
- Support for 6 major bacterial pathogens
- Interactive global resistance mapping
- Time-series trend analysis
- Advanced filtering capabilities
- Responsive web design
- Data export functionality

### Key Features

- **S. Typhi** surveillance data
- **K. pneumoniae** resistance tracking
- **N. gonorrhoeae** monitoring
- **E. coli** ESBL and carbapenemase detection
- **Shigella** MDR surveillance
- **Salmonella enterica** non-typhoidal monitoring

### Infrastructure

- Node.js backend with Express.js
- React frontend with modern UI components
- MongoDB database for data storage
- RESTful API architecture
- Docker containerization support

---

## Release Guidelines

### Version Numbers
- **MAJOR**: Breaking changes that require user action
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes and small improvements

### Categories
- **Added**: New features and functionality
- **Changed**: Modifications to existing features
- **Deprecated**: Features marked for future removal
- **Removed**: Features removed in this version
- **Fixed**: Bug fixes and corrections
- **Security**: Security-related changes and fixes

### Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to AMRnet and help maintain this changelog.

### Links
- [Project Repository](https://github.com/amrnet/amrnet)
- [Live Dashboard](https://www.amrnet.org)
- [Documentation](https://amrnet.readthedocs.io)
- [Issue Tracker](https://github.com/amrnet/amrnet/issues)
