.. _label-deployment:

Deployment Guide
================

.. container:: justify-text

    This guide covers deployment strategies for AMRnet, including local development,
    staging environments, and production deployment on various platforms.

Environment Setup
-----------------

.. container:: justify-text

    AMRnet supports multiple deployment environments with different configurations:

Development Environment
~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    For local development with hot reloading and debugging:

    .. code-block:: bash

        # Clone and setup
        git clone https://github.com/amrnet/amrnet.git
        cd amrnet

        # Install dependencies
        npm install
        cd client && npm install && cd ..

        # Environment configuration
        cp .env.example .env

    **Environment Variables (.env):**

    .. code-block:: bash

        NODE_ENV=development
        PORT=8080

        # Database
        MONGODB_URI=mongodb://localhost:27017/amrnet

        # Development settings
        REACT_APP_API_URL=http://localhost:8080/api/
        ENABLE_DEBUG_LOGS=true

    **Start Development Servers:**

    .. code-block:: bash

        # Start both backend and frontend
        npm run start:dev

        # Or individually:
        npm run start:backend  # Backend only (port 8080)
        npm run client         # Frontend only (port 3000)

Staging Environment
~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    For testing production builds locally:

    .. code-block:: bash

        # Build production bundle
        npm run build

        # Start production server
        NODE_ENV=production npm start

Production Deployment
---------------------

Heroku Deployment
~~~~~~~~~~~~~~~~~

.. container:: justify-text

    AMRnet is optimized for Heroku deployment with automatic build processes:

    **1. Heroku App Setup:**

    .. code-block:: bash

        # Install Heroku CLI and login
        heroku login

        # Create new app
        heroku create your-app-name

        # Add MongoDB Atlas add-on (or use existing Atlas cluster)
        heroku addons:create mongolab:sandbox

    **2. Environment Configuration:**

    .. code-block:: bash

        # Set environment variables
        heroku config:set NODE_ENV=production
        heroku config:set MONGODB_URI="your-mongodb-atlas-uri"
        heroku config:set REACT_APP_API_URL="https://your-app-name.herokuapp.com/api/"

    **3. Deployment:**

    .. code-block:: bash

        # Deploy to Heroku
        git add .
        git commit -m "Deploy to Heroku"
        git push heroku main

        # Monitor deployment
        heroku logs --tail

    **Heroku Configuration Files:**

    **Procfile:**

    .. code-block:: text

        web: node server.js

    **package.json (heroku-postbuild script):**

    .. code-block:: json

        {
          "scripts": {
            "heroku-postbuild": "cd client && npm install && npm run build"
          }
        }

MongoDB Atlas Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    For production database deployment:

    **1. Atlas Cluster Setup:**

    - Create MongoDB Atlas account
    - Create new cluster (M0 free tier for testing)
    - Configure network access (whitelist your IPs)
    - Create database user with read/write permissions

    **2. Connection Configuration:**

    .. code-block:: bash

        # Atlas connection string format
        MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amrnet?retryWrites=true&w=majority

    **3. Production Optimizations:**

    .. code-block:: javascript

        // config/db.js - Production MongoDB settings
        const mongoOptions = {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          maxPoolSize: 10,
          minPoolSize: 5,
          maxIdleTimeMS: 30000,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          bufferMaxEntries: 0,
          bufferCommands: false,
        };

Docker Deployment
~~~~~~~~~~~~~~~~~

.. container:: justify-text

    For containerized deployment:

    **Dockerfile:**

    .. code-block:: dockerfile

        # Multi-stage build for optimized production image
        FROM node:18-alpine AS builder

        WORKDIR /app
        COPY package*.json ./
        RUN npm ci --only=production

        # Build client
        COPY client/package*.json ./client/
        WORKDIR /app/client
        RUN npm ci --only=production
        COPY client/ .
        RUN npm run build

        # Production stage
        FROM node:18-alpine AS production

        WORKDIR /app
        COPY --from=builder /app/node_modules ./node_modules
        COPY --from=builder /app/client/build ./client/build
        COPY . .

        EXPOSE 8080
        CMD ["node", "server.js"]

    **docker-compose.yml:**

    .. code-block:: yaml

        version: '3.8'
        services:
          amrnet:
            build: .
            ports:
              - "8080:8080"
            environment:
              - NODE_ENV=production
              - MONGODB_URI=mongodb://mongo:27017/amrnet
            depends_on:
              - mongo

          mongo:
            image: mongo:6
            ports:
              - "27017:27017"
            volumes:
              - mongo_data:/data/db

        volumes:
          mongo_data:

    **Deployment Commands:**

    .. code-block:: bash

        # Build and start containers
        docker-compose up -d

        # View logs
        docker-compose logs -f amrnet

AWS Deployment
~~~~~~~~~~~~~~

.. container:: justify-text

    For AWS deployment using Elastic Beanstalk:

    **1. EB CLI Setup:**

    .. code-block:: bash

        # Install EB CLI
        pip install awsebcli

        # Initialize EB application
        eb init amrnet

        # Create environment
        eb create amrnet-production

    **2. Configuration Files:**

    **.ebextensions/01_node_command.config:**

    .. code-block:: yaml

        option_settings:
          aws:elasticbeanstalk:container:nodejs:
            NodeCommand: "node server.js"
          aws:elasticbeanstalk:application:environment:
            NODE_ENV: production

    **3. Deploy:**

    .. code-block:: bash

        # Deploy to AWS
        eb deploy

        # Monitor health
        eb health

Performance Optimization
------------------------

.. container:: justify-text

    Production deployment optimizations for better performance:

Build Optimizations
~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Client Build Configuration:**

    .. code-block:: javascript

        // client/.env.production
        GENERATE_SOURCEMAP=false
        REACT_APP_NODE_ENV=production

        // Build optimizations in package.json
        {
          "scripts": {
            "build": "react-scripts build && npm run compress",
            "compress": "gzip -k build/static/js/*.js && gzip -k build/static/css/*.css"
          }
        }

Server Optimizations
~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Express.js Production Configuration:**

    .. code-block:: javascript

        // server.js production settings
        const express = require('express');
        const compression = require('compression');
        const helmet = require('helmet');

        const app = express();

        // Security middleware
        app.use(helmet());

        // Compression middleware
        app.use(compression({
          level: 6,
          threshold: 1024,
        }));

        // Static file caching
        app.use(express.static('client/build', {
          maxAge: '1y',
          etag: false
        }));

Database Optimizations
~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **MongoDB Production Indexes:**

    .. code-block:: javascript

        // Database indexes for production
        db.ecoli_data.createIndex({ COUNTRY_ONLY: 1, YEAR: 1 });
        db.kpneumo_data.createIndex({ GENOTYPE: 1, COUNTRY_ONLY: 1 });
        db.styphi_data.createIndex({ GENOTYPE: 1, YEAR: 1, COUNTRY_ONLY: 1 });

Monitoring and Logging
----------------------

.. container:: justify-text

    Production monitoring setup for performance and error tracking:

Application Monitoring
~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Winston Logging Configuration:**

    .. code-block:: javascript

        // config/logger.js
        const winston = require('winston');

        const logger = winston.createLogger({
          level: process.env.LOG_LEVEL || 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          ),
          defaultMeta: { service: 'amrnet' },
          transports: [
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: 'logs/combined.log' }),
          ],
        });

        if (process.env.NODE_ENV !== 'production') {
          logger.add(new winston.transports.Console({
            format: winston.format.simple()
          }));
        }

    **Performance Monitoring Middleware:**

    .. code-block:: javascript

        // middleware/performance.js
        const performanceMiddleware = (req, res, next) => {
          const start = Date.now();

          res.on('finish', () => {
            const duration = Date.now() - start;
            logger.info(`${req.method} ${req.path}`, {
              duration,
              statusCode: res.statusCode,
              ip: req.ip
            });

            // Alert on slow requests
            if (duration > 2000) {
              logger.warn(`Slow request detected: ${req.path} took ${duration}ms`);
            }
          });

          next();
        };

Error Tracking
~~~~~~~~~~~~~~

.. container:: justify-text

    **Sentry Integration:**

    .. code-block:: javascript

        // Error tracking with Sentry
        const Sentry = require('@sentry/node');

        Sentry.init({
          dsn: process.env.SENTRY_DSN,
          environment: process.env.NODE_ENV,
        });

        // Error handler middleware
        app.use(Sentry.Handlers.errorHandler());

Health Checks
~~~~~~~~~~~~~

.. container:: justify-text

    **Application Health Endpoint:**

    .. code-block:: javascript

        // Health check endpoint
        app.get('/health', async (req, res) => {
          try {
            // Check database connection
            await mongoose.connection.db.admin().ping();

            res.status(200).json({
              status: 'healthy',
              timestamp: new Date().toISOString(),
              uptime: process.uptime(),
              memory: process.memoryUsage(),
              database: 'connected'
            });
          } catch (error) {
            res.status(503).json({
              status: 'unhealthy',
              error: error.message
            });
          }
        });

Backup and Recovery
-------------------

.. container:: justify-text

    Data backup strategies for production environments:

Database Backups
~~~~~~~~~~~~~~~~

.. container:: justify-text

    **MongoDB Atlas Automated Backups:**

    - Atlas provides automated backups with point-in-time recovery
    - Configure backup schedule and retention policies
    - Test backup restoration procedures regularly

    **Manual Backup Scripts:**

    .. code-block:: bash

        #!/bin/bash
        # backup-script.sh

        DATE=$(date +%Y%m%d_%H%M%S)
        BACKUP_DIR="/backups/amrnet_$DATE"

        # Create backup directory
        mkdir -p $BACKUP_DIR

        # Backup each collection
        mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR

        # Compress backup
        tar -czf "$BACKUP_DIR.tar.gz" -C /backups "amrnet_$DATE"

        # Clean up uncompressed backup
        rm -rf $BACKUP_DIR

        # Upload to cloud storage (optional)
        aws s3 cp "$BACKUP_DIR.tar.gz" s3://amrnet-backups/

Application Backups
~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Code and Configuration Backup:**

    .. code-block:: bash

        # Git-based backup strategy
        git tag -a "production-$(date +%Y%m%d)" -m "Production backup $(date)"
        git push origin --tags

Security Considerations
-----------------------

.. container:: justify-text

    Security best practices for production deployment:

Environment Security
~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Secure Environment Variables:**

    .. code-block:: bash

        # Use secure credential management
        heroku config:set MONGODB_URI="$(cat mongodb_uri.txt)"

        # Rotate credentials regularly
        heroku config:set SESSION_SECRET="$(openssl rand -base64 32)"

    **Network Security:**

    .. code-block:: javascript

        // CORS configuration
        const cors = require('cors');

        app.use(cors({
          origin: process.env.ALLOWED_ORIGINS?.split(',') || 'https://amrnet.org',
          credentials: true,
          optionsSuccessStatus: 200
        }));

Database Security
~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **MongoDB Security:**

    - Enable authentication and authorization
    - Use SSL/TLS for connections
    - Implement IP whitelisting
    - Regular security updates
    - Audit logging for database access

Troubleshooting
---------------

.. container:: justify-text

    Common deployment issues and solutions:

**Build Failures:**

.. code-block:: bash

    # Clear build cache
    rm -rf node_modules package-lock.json
    npm install

    # Frontend build issues
    cd client
    rm -rf node_modules package-lock.json build
    npm install
    npm run build

**Database Connection Issues:**

.. code-block:: bash

    # Test MongoDB connection
    mongosh "your-mongodb-uri"

    # Check network connectivity
    ping cluster.mongodb.net

**Performance Issues:**

.. code-block:: bash

    # Monitor resource usage
    heroku ps:exec
    top

    # Check logs for errors
    heroku logs --tail

**Memory Issues:**

.. code-block:: bash

    # Increase Heroku dyno size
    heroku ps:scale web=1:standard-2x

    # Check memory usage patterns
    heroku logs --source=heroku.router
