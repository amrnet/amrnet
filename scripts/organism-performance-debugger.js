#!/usr/bin/env node

/**
 * Performance Debugger for K. pneumoniae, E. coli (diarrheagenic), and E. coli
 *
 * Analyzes why these organisms are taking 2+ minutes to load and identifies optimizations
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { getMongoClientOptions } from '../config/db.js';

dotenv.config();

class OrganismPerformanceDebugger {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI || process.env.DB_URL;
    this.organisms = ['kpneumo', 'ecoli', 'decoli'];
    this.dbAndCollectionNames = {
      kpneumo: { dbName: 'kpneumo', collectionName: 'amrnetdb_kpneumo' },
      ecoli: { dbName: 'ecoli', collectionName: 'amrnetdb_ecoli' },
      decoli: { dbName: 'decoli', collectionName: 'amrnetdb_decoli' },
    };
  }

  /**
   * Test data volume and structure for each organism
   */
  async analyzeDataVolume() {
    console.log('🔍 Analyzing Data Volume & Structure...\n');

    const clientOptions = getMongoClientOptions();
    const client = new MongoClient(this.mongoUri, clientOptions);
    await client.connect();

    for (const organism of this.organisms) {
      const { dbName, collectionName } = this.dbAndCollectionNames[organism];
      const collection = client.db(dbName).collection(collectionName);

      try {
        // Get basic collection stats
        const totalCount = await collection.countDocuments();
        const dashboardCount = await collection.countDocuments({
          'dashboard view': { $regex: /^include$/, $options: 'i' }
        });

        // Sample document to analyze structure
        const sampleDoc = await collection.findOne();
        const fieldCount = sampleDoc ? Object.keys(sampleDoc).length : 0;

        // Estimate document size
        const docSize = sampleDoc ? JSON.stringify(sampleDoc).length : 0;
        const estimatedTotalSize = (docSize * dashboardCount / 1024 / 1024).toFixed(2);

        console.log(`📊 ${organism.toUpperCase()} Analysis:`);
        console.log(`   📈 Total Documents: ${totalCount.toLocaleString()}`);
        console.log(`   ✅ Dashboard Documents: ${dashboardCount.toLocaleString()}`);
        console.log(`   📋 Fields per Document: ${fieldCount}`);
        console.log(`   💾 Avg Document Size: ${(docSize / 1024).toFixed(1)}KB`);
        console.log(`   🎯 Estimated Payload: ${estimatedTotalSize}MB`);

        if (estimatedTotalSize > 50) {
          console.log(`   ⚠️  WARNING: Large payload detected (${estimatedTotalSize}MB)`);
        }

        // Test query performance with current approach
        const startTime = Date.now();
        const fullResult = await collection.find({
          'dashboard view': { $regex: /^include$/, $options: 'i' }
        }).toArray();
        const fullQueryTime = Date.now() - startTime;

        console.log(`   ⏱️  Full Query Time: ${fullQueryTime}ms`);
        console.log(`   📦 Actual Payload: ${(JSON.stringify(fullResult).length / 1024 / 1024).toFixed(2)}MB\n`);

      } catch (error) {
        console.error(`❌ Error analyzing ${organism}:`, error.message);
      }
    }

    await client.close();
  }

  /**
   * Test optimized field projections for each organism
   */
  async testOptimizedQueries() {
    console.log('⚡ Testing Optimized Query Performance...\n');

    const clientOptions = getMongoClientOptions();
    const client = new MongoClient(this.mongoUri, clientOptions);
    await client.connect();

    // Define optimized projections for each organism
    const optimizedProjections = {
      kpneumo: {
        map: {
          COUNTRY_ONLY: 1,
          DATE: 1,
          GENOTYPE: 1,
          LATITUDE: 1,
          LONGITUDE: 1,
          ESBL_category: 1,
          Carbapenems_category: 1,
          _id: 0
        },
        charts: {
          COUNTRY_ONLY: 1,
          DATE: 1,
          GENOTYPE: 1,
          ESBL_category: 1,
          Carbapenems_category: 1,
          _id: 0
        }
      },
      ecoli: {
        map: {
          COUNTRY_ONLY: 1,
          DATE: 1,
          GENOTYPE: 1,
          LATITUDE: 1,
          LONGITUDE: 1,
          ESBL_category: 1,
          Fluoro_category: 1,
          _id: 0
        },
        charts: {
          COUNTRY_ONLY: 1,
          DATE: 1,
          GENOTYPE: 1,
          ESBL_category: 1,
          Fluoro_category: 1,
          _id: 0
        }
      },
      decoli: {
        map: {
          COUNTRY_ONLY: 1,
          DATE: 1,
          GENOTYPE: 1,
          LATITUDE: 1,
          LONGITUDE: 1,
          ESBL_category: 1,
          Fluoro_category: 1,
          _id: 0
        },
        charts: {
          COUNTRY_ONLY: 1,
          DATE: 1,
          GENOTYPE: 1,
          ESBL_category: 1,
          Fluoro_category: 1,
          _id: 0
        }
      }
    };

    for (const organism of this.organisms) {
      const { dbName, collectionName } = this.dbAndCollectionNames[organism];
      const collection = client.db(dbName).collection(collectionName);

      console.log(`🧪 Testing ${organism.toUpperCase()} optimizations:`);

      try {
        const query = { 'dashboard view': { $regex: /^include$/, $options: 'i' } };

        // Test map data query
        const mapStart = Date.now();
        const mapResult = await collection.find(query, {
          projection: optimizedProjections[organism].map
        }).toArray();
        const mapTime = Date.now() - mapStart;
        const mapSize = (JSON.stringify(mapResult).length / 1024 / 1024).toFixed(2);

        // Test chart data query
        const chartStart = Date.now();
        const chartResult = await collection.find(query, {
          projection: optimizedProjections[organism].charts
        }).toArray();
        const chartTime = Date.now() - chartStart;
        const chartSize = (JSON.stringify(chartResult).length / 1024 / 1024).toFixed(2);

        console.log(`   🗺️  Map Data: ${mapTime}ms, ${mapSize}MB (${mapResult.length} docs)`);
        console.log(`   📊 Chart Data: ${chartTime}ms, ${chartSize}MB (${chartResult.length} docs)`);

        // Calculate improvement
        const totalOptimizedTime = mapTime + chartTime;
        console.log(`   ✅ Total Optimized Time: ${totalOptimizedTime}ms`);
        console.log(`   💡 Potential Improvement: ${totalOptimizedTime < 5000 ? 'Excellent' : totalOptimizedTime < 15000 ? 'Good' : 'Needs more optimization'}\n`);

      } catch (error) {
        console.error(`❌ Error testing ${organism}:`, error.message);
      }
    }

    await client.close();
  }

  /**
   * Analyze field usage to identify unnecessary data
   */
  async analyzeFieldUsage() {
    console.log('🔬 Analyzing Field Usage Patterns...\n');

    const clientOptions = getMongoClientOptions();
    const client = new MongoClient(this.mongoUri, clientOptions);
    await client.connect();

    for (const organism of this.organisms) {
      const { dbName, collectionName } = this.dbAndCollectionNames[organism];
      const collection = client.db(dbName).collection(collectionName);

      try {
        console.log(`🧬 ${organism.toUpperCase()} Field Analysis:`);

        // Get a sample of documents to analyze field patterns
        const sampleDocs = await collection.find({
          'dashboard view': { $regex: /^include$/, $options: 'i' }
        }).limit(100).toArray();

        if (sampleDocs.length === 0) {
          console.log('   ⚠️  No dashboard documents found\n');
          continue;
        }

        // Analyze field usage
        const fieldStats = {};
        sampleDocs.forEach(doc => {
          Object.keys(doc).forEach(field => {
            if (!fieldStats[field]) {
              fieldStats[field] = { count: 0, hasValue: 0 };
            }
            fieldStats[field].count++;
            if (doc[field] && doc[field] !== '' && doc[field] !== 'NA') {
              fieldStats[field].hasValue++;
            }
          });
        });

        // Sort by usage and identify essential fields
        const sortedFields = Object.entries(fieldStats)
          .map(([field, stats]) => ({
            field,
            usage: (stats.hasValue / stats.count * 100).toFixed(1),
            essential: this.isEssentialField(field, organism)
          }))
          .sort((a, b) => parseFloat(b.usage) - parseFloat(a.usage));

        console.log('   📈 Top Essential Fields (by usage):');
        sortedFields
          .filter(f => f.essential && parseFloat(f.usage) > 50)
          .slice(0, 10)
          .forEach(f => console.log(`     ✅ ${f.field}: ${f.usage}% populated`));

        console.log('   🗑️  Potentially Unnecessary Fields (low usage):');
        sortedFields
          .filter(f => !f.essential && parseFloat(f.usage) < 20)
          .slice(0, 5)
          .forEach(f => console.log(`     ❌ ${f.field}: ${f.usage}% populated`));

        console.log('');

      } catch (error) {
        console.error(`❌ Error analyzing fields for ${organism}:`, error.message);
      }
    }

    await client.close();
  }

  /**
   * Check if a field is essential for dashboard functionality
   */
  isEssentialField(field, organism) {
    const essentialFields = [
      'COUNTRY_ONLY', 'DATE', 'GENOTYPE', 'LATITUDE', 'LONGITUDE',
      'ESBL_category', 'Carbapenems_category', 'Fluoro_category',
      'dashboard view', '_id'
    ];

    return essentialFields.some(essential =>
      field.toLowerCase().includes(essential.toLowerCase()) ||
      essential.toLowerCase().includes(field.toLowerCase())
    );
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    console.log('💡 OPTIMIZATION RECOMMENDATIONS:\n');

    console.log('🚀 Immediate Actions (Address 2-minute load times):');
    console.log('   1. Implement field projection for all queries');
    console.log('   2. Split large queries into parallel smaller ones');
    console.log('   3. Add database indexes on dashboard view + country + date');
    console.log('   4. Use aggregation pipelines for complex filtering');
    console.log('   5. Implement pagination for very large datasets\n');

    console.log('⚡ Performance Enhancements:');
    console.log('   1. Add Redis caching for frequently accessed data');
    console.log('   2. Implement connection pooling with 10-20 connections');
    console.log('   3. Use read preferences for secondary reads');
    console.log('   4. Compress responses with gzip/brotli');
    console.log('   5. Move Atlas cluster to same region as Heroku app\n');

    console.log('🎯 Data Optimization:');
    console.log('   1. Remove unused fields from projection');
    console.log('   2. Pre-calculate common aggregations');
    console.log('   3. Use lean queries to reduce memory usage');
    console.log('   4. Implement data archiving for old records');
    console.log('   5. Optimize data types (strings vs numbers)\n');
  }

  /**
   * Run complete performance analysis
   */
  async runAnalysis() {
    console.log('🔍 AMRnet Organism Performance Analysis');
    console.log('Debugging 2-minute load times for K. pneumoniae, E. coli (diarrheagenic), and E. coli');
    console.log('='.repeat(80) + '\n');

    await this.analyzeDataVolume();
    await this.testOptimizedQueries();
    await this.analyzeFieldUsage();
    this.generateRecommendations();

    console.log('✅ Performance analysis complete!');
    console.log('🎯 Focus on implementing field projections and parallel queries first.');
  }
}

// Run analysis if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const performanceDebugger = new OrganismPerformanceDebugger();
  performanceDebugger.runAnalysis().catch(console.error);
}

export default OrganismPerformanceDebugger;
