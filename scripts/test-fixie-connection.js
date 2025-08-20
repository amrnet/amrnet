#!/usr/bin/env node

/**
 * Test script to verify Fixie SOCKS5 proxy configuration for MongoDB Atlas
 * Usage: node test-fixie-connection.js
 */

import { getMongoClientOptions } from './config/db.js';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function testFixieConnection() {
  console.log('🧪 Testing Fixie SOCKS5 Proxy Configuration...\n');

  // Check environment variables
  console.log('Environment Variables:');
  console.log(`   FIXIE_URL: ${process.env.FIXIE_URL ? '✅ Set' : '❌ Not set'}`);
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Not set'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}\n`);

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is required');
    process.exit(1);
  }

  try {
    // Get MongoDB client options (with or without Fixie)
    const clientOptions = getMongoClientOptions();

    console.log('MongoDB Client Configuration:');
    if (clientOptions.proxyHost) {
      console.log(`   🔗 Proxy: ${clientOptions.proxyHost}:${clientOptions.proxyPort}`);
      console.log(`   👤 Proxy Auth: ${clientOptions.proxyUsername ? '✅ Configured' : '❌ Missing'}`);
    } else {
      console.log('   📡 Direct connection (no proxy)');
    }
    console.log(`   ⏱️  Timeout: ${clientOptions.connectTimeoutMS}ms`);
    console.log(`   🏊 Pool Size: ${clientOptions.minPoolSize}-${clientOptions.maxPoolSize}\n`);

    // Test connection
    console.log('🔍 Testing MongoDB Connection...');
    const startTime = Date.now();

    const client = new MongoClient(process.env.MONGODB_URI, clientOptions);
    await client.connect();

    const connectTime = Date.now() - startTime;
    console.log(`✅ Connection successful in ${connectTime}ms`);

    // Test a simple operation
    console.log('🧮 Testing database operation...');
    const db = client.db();
    const admin = db.admin();
    const status = await admin.ping();

    console.log('✅ Database ping successful');

    // List collections (optional)
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections in database`);

    await client.close();
    console.log('\n🎉 All tests passed! Fixie configuration is working correctly.');

  } catch (error) {
    console.error('\n❌ Connection test failed:');
    console.error(`   Error: ${error.message}`);

    if (error.message.includes('ECONNREFUSED')) {
      console.error('   💡 Hint: Check if FIXIE_URL is correctly configured');
    } else if (error.message.includes('authentication')) {
      console.error('   💡 Hint: Verify MongoDB Atlas credentials');
    } else if (error.message.includes('timeout')) {
      console.error('   💡 Hint: Check network connectivity and MongoDB Atlas IP whitelist');
    }

    process.exit(1);
  }
}

// Run the test
testFixieConnection();
