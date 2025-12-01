.. _label-security:

Security Guide
==============

.. container:: justify-text

    AMRnet implements comprehensive security measures to protect user data and ensure
    the integrity of antimicrobial resistance surveillance information. This guide
    covers security policies, best practices, and implementation details.

Security Policy
---------------

.. container:: justify-text

    AMRnet follows industry-standard security practices for web applications handling
    sensitive healthcare and research data.

Vulnerability Reporting
~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **🚨 Responsible Disclosure Process**

    If you discover a security vulnerability, please follow these steps:

    1. **DO NOT** create a public GitHub issue
    2. **Email security report** to: amrnetdashboard@gmail.com
    3. **Include detailed information**:
       - Description of the vulnerability
       - Steps to reproduce the issue
       - Potential impact assessment
       - Suggested fixes (if available)

    **Response Timeline:**

    - **24 hours**: Initial acknowledgment
    - **72 hours**: Preliminary assessment and severity classification
    - **7 days**: Detailed response with fix timeline
    - **30 days**: Target resolution for critical vulnerabilities

Supported Versions
~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    Security updates are provided for:

    .. list-table:: Version Support
       :header-rows: 1
       :widths: 50 50

       * - Version
         - Supported
       * - 1.1.x
         - ✅ Yes
       * - 1.0.x
         - ✅ Yes
       * - < 1.0
         - ❌ No

Application Security
--------------------

.. container:: justify-text

    AMRnet implements multiple layers of security controls:

Environment Security
~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Environment Variable Protection:**

    .. code-block:: bash

        # Never commit sensitive environment variables
        # Use .env.example as template, create .env locally

        # Production secrets management
        NODE_ENV=production
        MONGODB_URI=mongodb+srv://[REDACTED]
        SESSION_SECRET=[GENERATED_SECRET]

        # Security headers
        ENABLE_SECURITY_HEADERS=true
        CORS_ORIGIN=https://amrnet.org

    **Secure Configuration Example:**

    .. code-block:: javascript

        // config/security.js
        const securityConfig = {
          // HTTPS enforcement
          httpsOnly: process.env.NODE_ENV === 'production',

          // Security headers
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
              fontSrc: ["'self'", "https://fonts.gstatic.com"],
              imgSrc: ["'self'", "data:", "https:"],
              scriptSrc: ["'self'"]
            }
          },

          // Rate limiting
          rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000 // limit each IP to 1000 requests per windowMs
          }
        };

Database Security
~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **MongoDB Security Configuration:**

    .. code-block:: javascript

        // Secure MongoDB connection
        const mongoOptions = {
          useNewUrlParser: true,
          useUnifiedTopology: true,

          // Authentication
          authSource: 'admin',

          // SSL/TLS
          ssl: true,
          sslValidate: true,

          // Connection limits
          maxPoolSize: 10,
          minPoolSize: 5,

          // Timeouts
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,

          // Security options
          bufferMaxEntries: 0,
          bufferCommands: false
        };

    **Data Sanitization:**

    .. code-block:: javascript

        const sanitize = require('mongo-sanitize');
        const validator = require('validator');

        // Input sanitization middleware
        const sanitizeInput = (req, res, next) => {
          // Sanitize against NoSQL injection
          req.body = sanitize(req.body);
          req.query = sanitize(req.query);
          req.params = sanitize(req.params);

          // Additional validation
          Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
              req.query[key] = validator.escape(req.query[key]);
            }
          });

          next();
        };

API Security
~~~~~~~~~~~~

.. container:: justify-text

    **Authentication and Authorization:**

    .. code-block:: javascript

        const jwt = require('jsonwebtoken');
        const rateLimit = require('express-rate-limit');

        // API rate limiting
        const apiLimiter = rateLimit({
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 1000, // limit each IP to 1000 requests per windowMs
          message: 'Too many requests from this IP',
          standardHeaders: true,
          legacyHeaders: false,
        });

        // JWT authentication for protected endpoints
        const authenticateToken = (req, res, next) => {
          const authHeader = req.headers['authorization'];
          const token = authHeader && authHeader.split(' ')[1];

          if (!token) {
            return res.sendStatus(401);
          }

          jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
          });
        };

    **CORS Configuration:**

    .. code-block:: javascript

        const cors = require('cors');

        const corsOptions = {
          origin: function (origin, callback) {
            const allowedOrigins = [
              'https://amrnet.org',
              'https://www.amrnet.org',
              process.env.NODE_ENV === 'development' && 'http://localhost:3000'
            ].filter(Boolean);

            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error('Not allowed by CORS'));
            }
          },
          credentials: true,
          optionsSuccessStatus: 200
        };

Frontend Security
~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Content Security Policy:**

    .. code-block:: html

        <!-- Security headers in HTML -->
        <meta http-equiv="Content-Security-Policy"
              content="default-src 'self';
                       script-src 'self' 'unsafe-inline';
                       style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
                       font-src 'self' https://fonts.gstatic.com;
                       img-src 'self' data: https:;">

    **XSS Prevention:**

    .. code-block:: javascript

        import DOMPurify from 'dompurify';

        // Sanitize user input before rendering
        const SafeHTML = ({ content }) => {
          const cleanHTML = DOMPurify.sanitize(content);
          return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
        };

        // Input validation
        const validateInput = (input) => {
          if (typeof input !== 'string') return false;
          if (input.length > 1000) return false;

          // Check for malicious patterns
          const maliciousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi
          ];

          return !maliciousPatterns.some(pattern => pattern.test(input));
        };

Data Privacy
------------

.. container:: justify-text

    AMRnet implements privacy-by-design principles for handling surveillance data:

Data Classification
~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Public Data:**
    - Aggregated surveillance statistics
    - Country-level prevalence data
    - Publicly available research datasets

    **Restricted Data:**
    - Individual sample identifiers (when present)
    - Detailed geographic coordinates
    - Unpublished research data

    **Prohibited Data:**
    - Personal health information (PHI)
    - Patient identifiers
    - Clinical details beyond resistance patterns

Privacy Controls
~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Data Minimization:**

    .. code-block:: javascript

        // Example: Remove sensitive fields before transmission
        const sanitizeDataForPublic = (data) => {
          return data.map(record => ({
            // Include only necessary fields
            country: record.COUNTRY_ONLY,
            year: record.YEAR,
            genotype: record.GENOTYPE,
            resistance: record.RESISTANCE_PROFILE,
            // Exclude: individual IDs, precise coordinates, etc.
          }));
        };

    **Anonymization:**

    .. code-block:: javascript

        // Geographic aggregation for privacy
        const aggregateByRegion = (data) => {
          const aggregated = {};

          data.forEach(record => {
            const region = getRegionFromCountry(record.country);
            if (!aggregated[region]) {
              aggregated[region] = {
                count: 0,
                resistanceProfiles: {}
              };
            }

            aggregated[region].count++;
            // Aggregate resistance data without individual records
          });

          return aggregated;
        };

Secure Development
------------------

.. container:: justify-text

    Security practices for development and deployment:

Code Security
~~~~~~~~~~~~~

.. container:: justify-text

    **Dependency Management:**

    .. code-block:: bash

        # Regular security audits
        npm audit

        # Update vulnerable dependencies
        npm audit fix

        # Use lock files to prevent supply chain attacks
        npm ci  # Use exact versions from package-lock.json

    **Security Linting:**

    .. code-block:: bash

        # ESLint security plugin
        npm install --save-dev eslint-plugin-security

        # .eslintrc.js
        module.exports = {
          plugins: ['security'],
          extends: ['plugin:security/recommended'],
          rules: {
            'security/detect-object-injection': 'error',
            'security/detect-non-literal-regexp': 'error',
            'security/detect-unsafe-regex': 'error'
          }
        };

Git Security
~~~~~~~~~~~~

.. container:: justify-text

    **Secure Repository Practices:**

    .. code-block:: bash

        # Git hooks for security
        # pre-commit hook
        #!/bin/sh

        # Check for secrets in commits
        git diff --cached --name-only | xargs grep -l "password\|secret\|key\|token" && {
          echo "Potential secret detected! Commit aborted."
          exit 1
        }

        # Run security linting
        npm run lint:security

    **Secrets Management:**

    .. code-block:: text

        # .gitignore - Never commit sensitive files
        .env
        .env.local
        .env.development.local
        .env.test.local
        .env.production.local

        # Security credentials
        *.pem
        *.key
        *.crt

        # Database dumps
        *.sql
        *.dump

Deployment Security
-------------------

.. container:: justify-text

    Security configurations for production deployment:

Server Security
~~~~~~~~~~~~~~~

.. container:: justify-text

    **Security Headers:**

    .. code-block:: javascript

        const helmet = require('helmet');

        app.use(helmet({
          // Content Security Policy
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
              fontSrc: ["'self'", "https://fonts.gstatic.com"],
              imgSrc: ["'self'", "data:", "https:"],
              scriptSrc: ["'self'"],
              connectSrc: ["'self'", "https://api.amrnet.org"]
            }
          },

          // Other security headers
          hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
          },

          frameguard: { action: 'deny' },
          noSniff: true,
          xssFilter: true,
          referrerPolicy: { policy: 'same-origin' }
        }));

Infrastructure Security
~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **HTTPS Configuration:**

    .. code-block:: nginx

        # Nginx SSL configuration
        server {
            listen 443 ssl http2;
            server_name amrnet.org www.amrnet.org;

            ssl_certificate /path/to/certificate.crt;
            ssl_certificate_key /path/to/private.key;

            ssl_protocols TLSv1.2 TLSv1.3;
            ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
            ssl_prefer_server_ciphers off;

            # Security headers
            add_header Strict-Transport-Security "max-age=63072000" always;
            add_header X-Frame-Options DENY always;
            add_header X-Content-Type-Options nosniff always;
        }

Monitoring and Incident Response
--------------------------------

.. container:: justify-text

    Continuous security monitoring and incident response procedures:

Security Monitoring
~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Logging and Alerting:**

    .. code-block:: javascript

        const winston = require('winston');

        // Security event logging
        const securityLogger = winston.createLogger({
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
          transports: [
            new winston.transports.File({ filename: 'logs/security.log' })
          ]
        });

        // Failed authentication attempts
        const logFailedAuth = (req, ip, reason) => {
          securityLogger.warn('Failed authentication attempt', {
            ip: ip,
            userAgent: req.get('User-Agent'),
            reason: reason,
            timestamp: new Date().toISOString()
          });
        };

    **Intrusion Detection:**

    .. code-block:: javascript

        // Suspicious activity detection
        const suspiciousActivityDetector = {
          failedAttempts: new Map(),

          checkFailedLogins: (ip) => {
            const attempts = this.failedAttempts.get(ip) || 0;
            this.failedAttempts.set(ip, attempts + 1);

            if (attempts > 5) {
              // Trigger security alert
              this.triggerSecurityAlert(`Multiple failed login attempts from ${ip}`);
            }
          },

          triggerSecurityAlert: (message) => {
            securityLogger.error('Security Alert', { message });
            // Send notification to security team
          }
        };

Incident Response
~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Response Procedures:**

    1. **Detection**: Automated monitoring alerts security team
    2. **Assessment**: Determine severity and scope of incident
    3. **Containment**: Isolate affected systems if necessary
    4. **Investigation**: Analyze logs and determine root cause
    5. **Recovery**: Restore normal operations
    6. **Lessons Learned**: Update security measures based on findings

Security Testing
----------------

.. container:: justify-text

    Regular security testing ensures ongoing protection:

Automated Testing
~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Security Test Suite:**

    .. code-block:: javascript

        // __tests__/security.test.js
        describe('Security Tests', () => {
          it('should prevent SQL injection in API endpoints', async () => {
            const maliciousInput = "'; DROP TABLE users; --";
            const response = await request(app)
              .get(`/api/organisms?country=${maliciousInput}`)
              .expect(400);

            expect(response.body.error).toContain('Invalid input');
          });

          it('should enforce rate limiting', async () => {
            const requests = Array(1001).fill().map(() =>
              request(app).get('/api/organisms')
            );

            const responses = await Promise.all(requests);
            const rateLimited = responses.filter(r => r.status === 429);
            expect(rateLimited.length).toBeGreaterThan(0);
          });
        });

Penetration Testing
~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Regular Security Assessments:**

    - Quarterly vulnerability scans
    - Annual penetration testing by third-party security firms
    - Continuous security monitoring
    - Bug bounty program for responsible disclosure

Best Practices Checklist
------------------------

.. container:: justify-text

    **Development Security Checklist:**

    ✅ **Environment Security**
    - [ ] Never commit secrets to version control
    - [ ] Use secure environment variable management
    - [ ] Implement proper secret rotation

    ✅ **Application Security**
    - [ ] Input validation and sanitization
    - [ ] Output encoding to prevent XSS
    - [ ] SQL injection prevention
    - [ ] Authentication and authorization

    ✅ **Infrastructure Security**
    - [ ] HTTPS enforcement
    - [ ] Security headers implementation
    - [ ] Regular dependency updates
    - [ ] Database access controls

    ✅ **Monitoring and Response**
    - [ ] Security event logging
    - [ ] Intrusion detection systems
    - [ ] Incident response procedures
    - [ ] Regular security assessments

Contact Information
-------------------

.. container:: justify-text

    **Security Team Contact:**

    - **Email**: amrnetdashboard@gmail.com
    - **PGP Key**: Available upon request
    - **Response Time**: 24 hours for initial acknowledgment

    **For General Security Questions:**

    - **GitHub Discussions**: https://github.com/amrnet/amrnet/discussions
    - **Documentation**: https://amrnet.readthedocs.io
