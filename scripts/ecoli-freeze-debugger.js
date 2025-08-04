#!/usr/bin/env node

/**
 * Real-time E. coli Performance Debugger
 *
 * Tests different loading strategies to identify the freezing issue
 */

import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

class EcoliDebugger {
  constructor() {
    this.results = [];
  }

  async testEndpoint(name, url, timeout = 30000) {
    console.log(`🧪 Testing ${name}...`);
    const startTime = Date.now();

    try {
      const response = await axios.get(url, {
        timeout,
        maxContentLength: 100 * 1024 * 1024, // 100MB limit
        validateStatus: () => true
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      const size = JSON.stringify(response.data).length;
      const sizeMB = (size / 1024 / 1024).toFixed(2);

      console.log(`   ✅ ${name}: ${duration}ms, ${sizeMB}MB`);

      return {
        name,
        success: true,
        duration,
        sizeMB: parseFloat(sizeMB),
        status: response.status,
        recordCount: Array.isArray(response.data) ? response.data.length :
                     response.data.data ? response.data.data.length : 0
      };

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`   ❌ ${name}: Failed after ${duration}ms - ${error.message}`);

      return {
        name,
        success: false,
        duration,
        error: error.message,
        isTimeout: error.code === 'ECONNABORTED'
      };
    }
  }

  async runEcoliTests() {
    console.log('🔍 E. coli Performance Debugging - Identifying Freeze Issues');
    console.log('=' * 70);

    // Test 1: Summary (should be fast)
    const summary = await this.testEndpoint(
      'Summary',
      `${API_BASE}/optimized/summary/ecoli`,
      5000
    );

    // Test 2: Paginated (should be manageable)
    const paginated = await this.testEndpoint(
      'Paginated (5K docs)',
      `${API_BASE}/optimized/paginated/ecoli?page=1&limit=5000`,
      10000
    );

    // Test 3: Smaller paginated chunk
    const smallPaginated = await this.testEndpoint(
      'Small Paginated (1K docs)',
      `${API_BASE}/optimized/paginated/ecoli?page=1&limit=1000`,
      5000
    );

    // Test 4: Genotypes (chart data)
    const genotypes = await this.testEndpoint(
      'Genotypes Chart',
      `${API_BASE}/optimized/genotypes/ecoli`,
      15000
    );

    // Test 5: Full map data (this might cause the freeze)
    console.log('⚠️  Testing full map data (this might freeze)...');
    const fullMap = await this.testEndpoint(
      'Full Map Data',
      `${API_BASE}/optimized/map/ecoli`,
      30000
    );

    this.results = [summary, paginated, smallPaginated, genotypes, fullMap];

    // Analysis
    console.log('\n📊 ANALYSIS:');
    this.results.forEach(result => {
      if (result.success) {
        const status = result.duration > 10000 ? '🔴 SLOW' :
                      result.duration > 5000 ? '🟡 MODERATE' : '🟢 FAST';
        console.log(`   ${status} ${result.name}: ${result.duration}ms, ${result.sizeMB}MB, ${result.recordCount} records`);

        if (result.sizeMB > 20) {
          console.log(`      ⚠️  Large payload detected - likely cause of freezing`);
        }
        if (result.duration > 15000) {
          console.log(`      ⚠️  Slow response - might cause timeout/freeze`);
        }
      } else {
        console.log(`   ❌ ${result.name}: ${result.error}`);
        if (result.isTimeout) {
          console.log(`      💡 Timeout suggests this endpoint might freeze the frontend`);
        }
      }
    });

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');

    const problematicEndpoints = this.results.filter(r =>
      (r.success && (r.sizeMB > 15 || r.duration > 10000)) ||
      (!r.success && r.isTimeout)
    );

    if (problematicEndpoints.length > 0) {
      console.log('   🚨 Endpoints causing frontend freeze:');
      problematicEndpoints.forEach(endpoint => {
        console.log(`      - ${endpoint.name}`);
      });

      console.log('\n   🔧 Solutions:');
      console.log('      1. Force pagination for all E. coli endpoints');
      console.log('      2. Implement progressive loading (load as user scrolls)');
      console.log('      3. Add loading states and chunked rendering');
      console.log('      4. Consider virtual scrolling for large datasets');
    } else {
      console.log('   ✅ All endpoints perform acceptably');
    }

    return this.results;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const ecoliDebugger = new EcoliDebugger();
  ecoliDebugger.runEcoliTests().catch(console.error);
}

export default EcoliDebugger;
