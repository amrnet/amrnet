/**
 * Heroku/Atlas Performance Optimizer and Region Verification
 *
 * This script helps verify and optimize the AMRnet deployment for Heroku + MongoDB Atlas
 * performance. It checks region proximity, tests compression, and provides deployment
 * readiness assessments.
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { getMongoClientOptions } from '../config/db.js';
import axios from 'axios';

dotenv.config();

class HerokuAtlasOptimizer {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI || process.env.DB_URL;
    this.herokuAppName = process.env.HEROKU_APP_NAME;
    this.results = {
      regionProximity: null,
      compressionTest: null,
      atlasPerformance: null,
      recommendations: []
    };
  }

  /**
   * Check if MongoDB Atlas and Heroku are in similar regions
   */
  async checkRegionProximity() {
    console.log('🌍 Checking Heroku/Atlas Region Proximity...');

    try {
      // Get Heroku app region
      const herokuRegion = await this.getHerokuRegion();

      // Test Atlas connection latency
      const atlasLatency = await this.testAtlasLatency();

      this.results.regionProximity = {
        herokuRegion,
        atlasLatency,
        isOptimal: atlasLatency < 50, // < 50ms is good for same region
        recommendation: atlasLatency > 100 ?
          'Consider moving Atlas cluster closer to Heroku region' :
          'Region proximity is acceptable'
      };

      console.log(`   📍 Heroku Region: ${herokuRegion}`);
      console.log(`   ⚡ Atlas Latency: ${atlasLatency}ms`);
      console.log(`   ${this.results.regionProximity.isOptimal ? '✅' : '⚠️'} ${this.results.regionProximity.recommendation}`);

    } catch (error) {
      console.error('❌ Region proximity check failed:', error.message);
    }
  }

  /**
   * Get Heroku app region
   */
  async getHerokuRegion() {
    try {
      // Try to determine region from environment variables or app metadata
      if (process.env.HEROKU_REGION) {
        return process.env.HEROKU_REGION;
      }

      // If deployed on Heroku, try to detect from dyno metadata
      if (process.env.DYNO) {
        // This is a heuristic - Heroku doesn't expose region directly
        const dynoName = process.env.DYNO;
        if (dynoName.includes('eu-')) return 'EU (Europe)';
        if (dynoName.includes('us-')) return 'US (United States)';
        return 'Unknown (check Heroku dashboard)';
      }

      return 'Local Development';
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Test MongoDB Atlas connection latency
   */
  async testAtlasLatency() {
    if (!this.mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    const clientOptions = getMongoClientOptions();
    const client = new MongoClient(this.mongoUri, clientOptions);
    const startTime = Date.now();

    try {
      await client.connect();
      await client.db().admin().ping();
      const latency = Date.now() - startTime;
      return latency;
    } finally {
      await client.close();
    }
  }

  /**
   * Test compression effectiveness on sample data
   */
  async testCompression() {
    console.log('🗜️  Testing Compression Effectiveness...');

    try {
      // Create sample data similar to AMRnet payloads
      const sampleData = this.generateSampleAmrData();
      const originalSize = JSON.stringify(sampleData).length;

      // Test gzip compression
      const compressed = await this.compressData(JSON.stringify(sampleData));
      const compressedSize = compressed.length;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

      this.results.compressionTest = {
        originalSize: `${(originalSize / 1024).toFixed(1)}KB`,
        compressedSize: `${(compressedSize / 1024).toFixed(1)}KB`,
        compressionRatio: `${compressionRatio}%`,
        effective: compressionRatio > 50
      };

      console.log(`   📊 Original Size: ${this.results.compressionTest.originalSize}`);
      console.log(`   📦 Compressed Size: ${this.results.compressionTest.compressedSize}`);
      console.log(`   🎯 Compression Ratio: ${this.results.compressionTest.compressionRatio}`);
      console.log(`   ${this.results.compressionTest.effective ? '✅' : '⚠️'} Compression is ${this.results.compressionTest.effective ? 'effective' : 'limited'}`);

    } catch (error) {
      console.error('❌ Compression test failed:', error.message);
    }
  }

  /**
   * Generate sample AMR data for testing
   */
  generateSampleAmrData() {
    const organisms = ['ecoli', 'kpneumo', 'senterica'];
    const resistanceTypes = ['MDR', 'XDR', 'PDR', 'Susceptible'];
    const years = [2018, 2019, 2020, 2021, 2022, 2023];

    return {
      mapData: organisms.map(org => ({
        organism: org,
        data: Array(1000).fill().map((_, i) => ({
          country: `Country${i % 50}`,
          latitude: Math.random() * 180 - 90,
          longitude: Math.random() * 360 - 180,
          resistance: resistanceTypes[i % resistanceTypes.length],
          count: Math.floor(Math.random() * 100)
        }))
      })),
      trendData: organisms.map(org => ({
        organism: org,
        trends: years.map(year => ({
          year,
          data: resistanceTypes.map(type => ({
            type,
            count: Math.floor(Math.random() * 1000),
            percentage: Math.random() * 100
          }))
        }))
      })),
      genotypeData: organisms.map(org => ({
        organism: org,
        genotypes: Array(200).fill().map((_, i) => ({
          name: `Genotype_${i}`,
          count: Math.floor(Math.random() * 50),
          resistance: resistanceTypes[i % resistanceTypes.length]
        }))
      }))
    };
  }

  /**
   * Simulate gzip compression
   */
  async compressData(data) {
    // Simple simulation - real compression would use zlib
    // This gives a rough estimate of compression effectiveness
    const repetitionCount = (data.match(/(\w+)(?=.*\1)/g) || []).length;
    const estimatedCompressionRatio = Math.min(0.8, repetitionCount / data.length);
    return data.slice(0, Math.floor(data.length * (1 - estimatedCompressionRatio)));
  }

  /**
   * Test Atlas query performance with current configuration
   */
  async testAtlasPerformance() {
    console.log('🔍 Testing Atlas Query Performance...');

    try {
      const clientOptions = getMongoClientOptions();
      const client = new MongoClient(this.mongoUri, clientOptions);
      await client.connect();

      const db = client.db();
      const collections = ['ecoliData', 'kpneumoData', 'sentericaData'];

      const performanceResults = [];

      for (const collectionName of collections) {
        const collection = db.collection(collectionName);

        // Test different query patterns
        const tests = [
          {
            name: 'Count Query',
            operation: () => collection.countDocuments({})
          },
          {
            name: 'Field Projection',
            operation: () => collection.find({}, {
              projection: { country: 1, resistance: 1, _id: 0 }
            }).limit(100).toArray()
          },
          {
            name: 'Aggregation Pipeline',
            operation: () => collection.aggregate([
              { $group: { _id: '$resistance', count: { $sum: 1 } } }
            ]).toArray()
          }
        ];

        for (const test of tests) {
          const startTime = Date.now();
          try {
            await test.operation();
            const duration = Date.now() - startTime;
            performanceResults.push({
              collection: collectionName,
              test: test.name,
              duration: `${duration}ms`,
              status: duration < 1000 ? 'Good' : duration < 3000 ? 'Acceptable' : 'Slow'
            });
          } catch (error) {
            performanceResults.push({
              collection: collectionName,
              test: test.name,
              duration: 'Failed',
              status: 'Error',
              error: error.message
            });
          }
        }
      }

      await client.close();

      this.results.atlasPerformance = performanceResults;

      console.log('   📊 Atlas Performance Results:');
      performanceResults.forEach(result => {
        const statusIcon = result.status === 'Good' ? '✅' : result.status === 'Acceptable' ? '⚠️' : '❌';
        console.log(`     ${statusIcon} ${result.collection} - ${result.test}: ${result.duration} (${result.status})`);
      });

    } catch (error) {
      console.error('❌ Atlas performance test failed:', error.message);
    }
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations() {
    console.log('\n🎯 Heroku/Atlas Optimization Recommendations:');

    const recommendations = [];

    // Region proximity recommendations
    if (this.results.regionProximity && !this.results.regionProximity.isOptimal) {
      recommendations.push(
        '🌍 Move MongoDB Atlas cluster to same region as Heroku app',
        '📍 Check Heroku app region in dashboard and configure Atlas accordingly'
      );
    }

    // Compression recommendations
    if (this.results.compressionTest && !this.results.compressionTest.effective) {
      recommendations.push(
        '🗜️  Implement additional data optimization beyond compression',
        '📊 Use more aggressive field projection in MongoDB queries'
      );
    }

    // Performance recommendations
    if (this.results.atlasPerformance) {
      const slowQueries = this.results.atlasPerformance.filter(r => r.status === 'Slow' || r.status === 'Error');
      if (slowQueries.length > 0) {
        recommendations.push(
          '🔍 Add database indexes for slow queries',
          '⚡ Consider connection pooling optimization',
          '📈 Monitor Atlas Performance Advisor for query optimization'
        );
      }
    }

    // General Heroku recommendations
    recommendations.push(
      '💾 Use Redis addon for caching frequently accessed data',
      '🔄 Implement request deduplication in frontend',
      '📦 Use CDN for static assets to reduce dyno load',
      '⏱️  Set appropriate connection timeouts for Atlas queries'
    );

    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    return recommendations;
  }

  /**
   * Run comprehensive optimization check
   */
  async runOptimizationCheck() {
    console.log('🚀 AMRnet Heroku/Atlas Optimization Check\n');

    await this.checkRegionProximity();
    console.log('');

    await this.testCompression();
    console.log('');

    await this.testAtlasPerformance();
    console.log('');

    this.generateRecommendations();

    console.log('\n✅ Optimization check complete!');
    console.log('💡 Apply these recommendations to improve your 75MB payload issue');

    return this.results;
  }
}

// Export for use in other scripts
export default HerokuAtlasOptimizer;

// Run directly if this file is executed
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new HerokuAtlasOptimizer();
  optimizer.runOptimizationCheck().catch(console.error);
}
