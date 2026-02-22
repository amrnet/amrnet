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
      { db: 'sentericaints', collection: 'ints_collection_from_enterica' },
    ];

    for (const { db, collection } of targets) {
      const coll = client.db(db).collection(collection);
      console.log(`\nOptimizing indexes for ${db}.${collection} ...`);

      if (db === 'sentericaints') {
        // Index for $lookup joins on NAME field (avoid full collection scans)
        try {
          // Drop old index if it exists with the default name
          try {
            await coll.dropIndex('NAME_1');
            console.log(`  ℹ️  Dropped old unnamed index NAME_1`);
          } catch (dropErr) {
            // Index doesn't exist, continue
          }
          await coll.createIndex({ NAME: 1 }, { name: 'name_1_lookup' });
          console.log(`✅ Indexes ensured for ${db}.${collection}`);
        } catch (indexErr) {
          console.warn(`  ⚠️  Could not ensure index (may already exist): ${indexErr.message}`);
        }
      } else {
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
    }

    console.log('\n✅ All indexes created successfully');
  } catch (err) {
    console.error('❌ Failed to create indexes:', err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
