# Development Setup Guide

## Prerequisites

- **Node.js**: v18.20.4 (specified in `.nvmrc`)
- **Python**: v3.12+
- **npm**: Latest version
- **Git**: Latest version

## Quick Start

### 1. Environment Setup

```bash
# Clone the repository
git clone https://github.com/amrnet/amrnet.git
cd amrnet

# Use correct Node.js version (if using nvm)
nvm use

# Install dependencies
npm ci
cd client && npm ci && cd ..

# Install Python dependencies
pip install -r requirements.txt
pip install -r docs/requirements.txt
```

### 2. Development Server

```bash
# Start development server (runs both backend and frontend)
npm run start:dev

# Or start individually:
npm run start:backend  # Backend only (port 8080)
npm run client         # Frontend only (port 3000)
```

### 3. Build for Production

```bash
# Build client application
npm run build

# Start production server
npm start
```

## Internationalization (i18n)

The application supports multiple languages:

- English (en) - Default
- French (fr)
- Spanish (es)
- Portuguese (pt)

### Translation Files

- Located in `client/locales/` and `client/src/locales/`
- JSON format with nested keys
- Automatically synchronized between directories

### Adding New Translations

1. Update `client/locales/en.json` with new keys
2. Run translation workflow or manually update other language files
3. Use `{t('key.path')}` in React components

## Code Quality

### Linting & Formatting

```bash
# Lint JavaScript/React
cd client && npm run lint

# Format code with Prettier
npm run format

# Lint Python (if configured)
python -m flake8 .
```

### Git Hooks

- Pre-commit hooks run linting and formatting
- Configured via `.editorconfig` and `.prettierrc.json`

## Database Configuration

### MongoDB Atlas with Fixie Proxy

The application supports secure MongoDB connections via Fixie SOCKS5 proxy for
production environments.

Configuration is handled in `config/db.js` with automatic proxy detection.

## Project Structure

```text
amrnet/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── locales/        # Translation files
│   │   └── ...
│   └── locales/            # Translation source files
├── config/                 # Database and app configuration
├── models/                 # Data models
├── routes/                 # API routes
├── .github/                # GitHub Actions workflows
│   └── workflows/
│       ├── ci-cd.yml      # Main CI/CD pipeline
│       ├── translate_app.yml # Auto-translation
│       └── eslint.yml     # Code quality checks
└── docs/                   # Documentation
```

## Available Scripts

### Root Level

- `npm start` - Production server
- `npm run start:dev` - Development mode
- `npm run build` - Build for production
- `npm run client` - Frontend development server

### Client Level (cd client)

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Lint code

## Environment Variables

Create `.env` file in root directory:

```env
NODE_ENV=development
PORT=8080
MONGODB_URI=your_mongodb_connection_string
FIXIE_URL=your_fixie_proxy_url (if using)
```

## Contributing

1. Follow code style defined in `.prettierrc.json` and `.eslintrc.json`
2. Add tests for new features
3. Update translations when adding UI text
4. Run linting before committing
5. Follow conventional commit messages

## Deployment

### Travis CI

Configured in `.travis.yml` for:

- Node.js 18 and Python 3.12
- Automated testing
- Build verification
- Locale file validation

### Docker

Use `.dockerignore` for optimized container builds.

### Heroku

Configured with `heroku-postbuild` script for automatic deployment.

## Troubleshooting

### Common Issues

1. **Node version mismatch**: Use `nvm use` to switch to correct version
2. **Package conflicts**: Delete `node_modules` and run `npm ci`
3. **Translation not showing**: Check locale file syntax and path
4. **Build fails**: Ensure all dependencies are installed

### Getting Help

- Check existing [GitHub Issues](https://github.com/amrnet/amrnet/issues)
- Review [Documentation](https://amrnet.readthedocs.io)
- Contact the team at <amrnetdashboard@gmail.com>
