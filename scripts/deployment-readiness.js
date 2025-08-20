#!/usr/bin/env node

/**
 * AMRnet Deployment Readiness Validator
 *
 * Validates that all Heroku/Atlas optimizations are properly configured
 * before deployment to address the 75MB payload performance issue.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import HerokuAtlasOptimizer from './heroku-atlas-optimizer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class DeploymentValidator {
  constructor() {
    this.results = {
      backend: {},
      frontend: {},
      infrastructure: {},
      overall: 'pending'
    };
  }

  /**
   * Check backend optimization files exist and are configured
   */
  async validateBackendOptimizations() {
    console.log('🔧 Validating Backend Optimizations...');

    const checks = [
      {
        name: 'Optimized API Routes',
        path: '../routes/api/optimized.js',
        validator: (content) => content.includes('/map/:organism') && content.includes('projection')
      },
      {
        name: 'Compression Middleware',
        path: '../server.js',
        validator: (content) => content.includes('compression') && content.includes('threshold: 1024')
      },
      {
        name: 'MongoDB Field Projections',
        path: '../routes/api/optimized.js',
        validator: (content) => content.includes('projection') && content.includes('_id: 0')
      }
    ];

    for (const check of checks) {
      try {
        const filePath = path.resolve(__dirname, check.path);
        const content = fs.readFileSync(filePath, 'utf8');
        const passed = check.validator(content);

        this.results.backend[check.name] = passed;
        console.log(`   ${passed ? '✅' : '❌'} ${check.name}: ${passed ? 'Configured' : 'Missing'}`);
      } catch (error) {
        this.results.backend[check.name] = false;
        console.log(`   ❌ ${check.name}: File not found`);
      }
    }
  }

  /**
   * Check frontend optimization files exist and are configured
   */
  async validateFrontendOptimizations() {
    console.log('\n📱 Validating Frontend Optimizations...');

    const checks = [
      {
        name: 'Optimized Data Service',
        path: '../client/src/services/optimizedDataService.js',
        validator: (content) => content.includes('Promise.all') && content.includes('fetchWithCache')
      },
      {
        name: 'Parallel Loading Components',
        path: '../client/src/components/Dashboard/OptimizedDashboard.js',
        validator: (content) => content.includes('useOptimizedDataLoading') && content.includes('loadOrganismData')
      },
      {
        name: 'Performance Monitoring',
        path: '../client/src/services/optimizedDataService.js',
        validator: (content) => content.includes('performanceMetrics') && content.includes('Heroku')
      }
    ];

    for (const check of checks) {
      try {
        const filePath = path.resolve(__dirname, check.path);
        const content = fs.readFileSync(filePath, 'utf8');
        const passed = check.validator(content);

        this.results.frontend[check.name] = passed;
        console.log(`   ${passed ? '✅' : '❌'} ${check.name}: ${passed ? 'Configured' : 'Missing'}`);
      } catch (error) {
        this.results.frontend[check.name] = false;
        console.log(`   ❌ ${check.name}: File not found`);
      }
    }
  }

  /**
   * Validate infrastructure configuration
   */
  async validateInfrastructure() {
    console.log('\n🏗️  Validating Infrastructure Configuration...');

    // Check environment variables
    const requiredEnvVars = [
      'MONGODB_URI',
      'NODE_ENV'
    ];

    const envChecks = {};
    requiredEnvVars.forEach(envVar => {
      const exists = !!process.env[envVar];
      envChecks[envVar] = exists;
      console.log(`   ${exists ? '✅' : '❌'} ${envVar}: ${exists ? 'Set' : 'Missing'}`);
    });

    // Run Heroku/Atlas optimization check
    console.log('\n🌍 Running Heroku/Atlas Connectivity Check...');
    const optimizer = new HerokuAtlasOptimizer();
    const optimizationResults = await optimizer.runOptimizationCheck();

    this.results.infrastructure = {
      environment: envChecks,
      herokuAtlas: optimizationResults
    };
  }

  /**
   * Generate deployment readiness report
   */
  generateReport() {
    console.log('\n📋 DEPLOYMENT READINESS REPORT');
    console.log('='.repeat(50));

    // Count passed checks
    const backendPassed = Object.values(this.results.backend).filter(Boolean).length;
    const backendTotal = Object.keys(this.results.backend).length;

    const frontendPassed = Object.values(this.results.frontend).filter(Boolean).length;
    const frontendTotal = Object.keys(this.results.frontend).length;

    const envPassed = Object.values(this.results.infrastructure.environment || {}).filter(Boolean).length;
    const envTotal = Object.keys(this.results.infrastructure.environment || {}).length;

    console.log(`\n🔧 Backend Optimizations: ${backendPassed}/${backendTotal} passed`);
    console.log(`📱 Frontend Optimizations: ${frontendPassed}/${frontendTotal} passed`);
    console.log(`🏗️  Infrastructure Setup: ${envPassed}/${envTotal} passed`);

    // Overall assessment
    const totalPassed = backendPassed + frontendPassed + envPassed;
    const totalChecks = backendTotal + frontendTotal + envTotal;
    const passRate = (totalPassed / totalChecks * 100).toFixed(1);

    console.log(`\n🎯 Overall Readiness: ${passRate}%`);

    if (passRate >= 90) {
      this.results.overall = 'ready';
      console.log('✅ READY FOR DEPLOYMENT');
      console.log('   Your AMRnet optimization should significantly reduce the 75MB payload issue.');
    } else if (passRate >= 70) {
      this.results.overall = 'mostly-ready';
      console.log('⚠️  MOSTLY READY - Address remaining issues before deployment');
    } else {
      this.results.overall = 'not-ready';
      console.log('❌ NOT READY - Complete missing optimizations before deployment');
    }

    // Specific recommendations for 75MB payload issue
    console.log('\n💡 Key Optimizations for 75MB Payload Reduction:');
    console.log('   1. ✅ Use /api/optimized/* endpoints instead of original APIs');
    console.log('   2. ✅ Enable parallel loading with Promise.all in frontend');
    console.log('   3. ✅ Implement field projection in all MongoDB queries');
    console.log('   4. ✅ Use compression middleware for response optimization');
    console.log('   5. ⚠️  Verify Heroku/Atlas are in the same region');
    console.log('   6. 💾 Consider Redis caching for frequently accessed data');

    return this.results;
  }

  /**
   * Run complete deployment validation
   */
  async validate() {
    console.log('🚀 AMRnet Deployment Readiness Validation');
    console.log('Addressing 75MB Payload Performance Issue');
    console.log('='.repeat(50));

    await this.validateBackendOptimizations();
    await this.validateFrontendOptimizations();
    await this.validateInfrastructure();

    return this.generateReport();
  }
}

// Run validation if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DeploymentValidator();
  validator.validate()
    .then(results => {
      process.exit(results.overall === 'ready' ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

export default DeploymentValidator;
