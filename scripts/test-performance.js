#!/usr/bin/env node

// Performance testing script for AMRNet API endpoints
import fetch from 'node-fetch';
import { performance } from 'perf_hooks';

const baseURL = 'http://localhost:3000/api';

const endpoints = [
  { name: 'K. pneumoniae (Original)', url: '/getDataForKpneumo' },
  { name: 'K. pneumoniae (Optimized)', url: '/optimized/getDataForKpneumo' },
  { name: 'E. coli (Original)', url: '/getDataForEcoli' },
  { name: 'E. coli (Optimized)', url: '/optimized/getDataForEcoli' },
  { name: 'E. coli (diarrheagenic) (Original)', url: '/getDataForDEcoli' },
  { name: 'E. coli (diarrheagenic) (Optimized)', url: '/optimized/getDataForDEcoli' }
];

async function testEndpoint(endpoint) {
  const startTime = performance.now();

  try {
    console.log(`🔄 Testing ${endpoint.name}...`);

    const response = await fetch(`${baseURL}${endpoint.url}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    const dataSize = JSON.stringify(data).length;
    const records = Array.isArray(data) ? data.length : 'N/A';

    console.log(`✅ ${endpoint.name}:`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Records: ${records}`);
    console.log(`   Data Size: ${Math.round(dataSize / 1024)}KB`);
    console.log(`   Rate: ${records !== 'N/A' ? Math.round(records / (duration / 1000)) : 'N/A'} records/sec`);
    console.log('');

    return {
      name: endpoint.name,
      duration,
      records,
      dataSize,
      success: true
    };

  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    console.log(`❌ ${endpoint.name}: Failed after ${duration}ms`);
    console.log(`   Error: ${error.message}`);
    console.log('');

    return {
      name: endpoint.name,
      duration,
      records: 0,
      dataSize: 0,
      success: false,
      error: error.message
    };
  }
}

async function runPerformanceTest() {
  console.log('🚀 AMRNet API Performance Test');
  console.log('================================\n');

  const results = [];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);

    // Wait a bit between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('📊 Performance Summary');
  console.log('======================');

  results.forEach(result => {
    if (result.success) {
      console.log(`${result.name}: ${result.duration}ms (${result.records} records)`);
    } else {
      console.log(`${result.name}: FAILED - ${result.error}`);
    }
  });

  console.log('\n🏁 Test completed!');
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch(`${baseURL}/getDataForStyphi`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
console.log('Checking if server is running...');
const serverRunning = await checkServer();

if (serverRunning) {
  console.log('✅ Server detected! Starting performance test...\n');
  await runPerformanceTest();
} else {
  console.log('❌ Server not running on localhost:3000');
  console.log('Please start the server with: node server.js');
}
