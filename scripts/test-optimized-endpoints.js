#!/usr/bin/env node

/**
 * Test the new optimized endpoints performance
 */

import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

async function testOptimizedEndpoints() {
  console.log('🧪 Testing New Optimized Endpoints Performance\n');

  const organisms = ['kpneumo', 'ecoli', 'decoli'];

  for (const organism of organisms) {
    console.log(`🔬 Testing ${organism.toUpperCase()}:`);

    try {
      // Test summary endpoint
      const summaryStart = Date.now();
      const summaryResponse = await axios.get(`${API_BASE}/optimized/summary/${organism}`);
      const summaryTime = Date.now() - summaryStart;

      console.log(`   📊 Summary: ${summaryTime}ms - ${summaryResponse.data.totalDocuments} docs, ~${summaryResponse.data.estimatedPayloadMB}MB`);

      // Test paginated endpoint for large datasets
      if (summaryResponse.data.totalDocuments > 50000) {
        const paginatedStart = Date.now();
        const paginatedResponse = await axios.get(`${API_BASE}/optimized/paginated/${organism}?page=1&limit=5000&dataType=map`);
        const paginatedTime = Date.now() - paginatedStart;

        console.log(`   📄 Paginated (5K docs): ${paginatedTime}ms - ${paginatedResponse.data.performance.payloadSize}`);
        console.log(`   📈 Total pages available: ${paginatedResponse.data.pagination.totalPages}`);
      }

      // Test optimized map endpoint
      const mapStart = Date.now();
      const mapResponse = await axios.get(`${API_BASE}/optimized/map/${organism}`);
      const mapTime = Date.now() - mapStart;
      const mapSize = (JSON.stringify(mapResponse.data).length / 1024 / 1024).toFixed(2);

      console.log(`   🗺️  Map: ${mapTime}ms - ${mapSize}MB (${mapResponse.data.length} docs)`);

      // Test optimized chart endpoints
      const chartStart = Date.now();
      const [genotypesResponse, resistanceResponse] = await Promise.all([
        axios.get(`${API_BASE}/optimized/genotypes/${organism}`),
        axios.get(`${API_BASE}/optimized/resistance/${organism}`)
      ]);
      const chartTime = Date.now() - chartStart;

      const chartSize = ((JSON.stringify(genotypesResponse.data).length + JSON.stringify(resistanceResponse.data).length) / 1024 / 1024).toFixed(2);

      console.log(`   📊 Charts (parallel): ${chartTime}ms - ${chartSize}MB`);

      console.log('');

    } catch (error) {
      console.error(`   ❌ Error testing ${organism}:`, error.message);
    }
  }
}

testOptimizedEndpoints().catch(console.error);
