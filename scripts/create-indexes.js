import { MongoClient } from 'mongodb';
import { getMongoConfig } from '../config/db.js';

async function main() {
  const { uri, options } = getMongoConfig();
  const client = new MongoClient(uri, options);

  try {
    await client.connect();

    // Collections to optimize
    const targets = [
      { db: 'kpneumo', collection: 'amrnetdb_kpneumo' },
      { db: 'decoli', collection: 'amrnetdb_decoli' },
      { db: 'ecoli', collection: 'amrnetdb_ecoli' },
    ];

    for (const { db, collection } of targets) {
      const coll = client.db(db).collection(collection);
      console.log(`\nOptimizing indexes for ${db}.${collection} ...`);

      // Compound index aligning with common queries and projections
      // Filters used: { 'dashboard view': /include/i, GENOTYPE: { $ne: null } }
      // Projections frequently include COUNTRY_ONLY, DATE
      await coll.createIndex(
        { 'dashboard view': 1, GENOTYPE: 1, COUNTRY_ONLY: 1, DATE: 1 },
        { name: 'dash_genotype_country_date' },
      );

      // Helpful single-field indexes used in aggregations/filters
      await coll.createIndex({ COUNTRY_ONLY: 1 }, { name: 'country_only_1' });
      await coll.createIndex({ GENOTYPE: 1 }, { name: 'genotype_1' });
      await coll.createIndex({ DATE: 1 }, { name: 'date_1' });

      console.log(`✅ Indexes ensured for ${db}.${collection}`);
    }
  } catch (err) {
    console.error('❌ Failed to create indexes:', err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
