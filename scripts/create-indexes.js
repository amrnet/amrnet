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
      { db: 'shige', collection: 'amrnetdb_shige' },
      { db: 'styphi', collection: 'amrnetdb_styphi' },
      { db: 'ngono', collection: 'amrnetdb_ngono' },
      { db: 'senterica', collection: 'amrnetdb_senterica' },
      { db: 'sentericaints', collection: 'amrnetdb_ints' },
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
        // Compound index for the genotype/country breakdown pipelines.
        // Used by /api/agg/:organism/genotypes and the per-year genotype
        // breakdown stage of /yearly.
        await coll.createIndex(
          { 'dashboard view': 1, GENOTYPE: 1, COUNTRY_ONLY: 1, DATE: 1 },
          { name: 'dash_genotype_country_date' },
        );

        // Compound index for the yearly aggregation. The leading
        // `dashboard view: 'include'` equality + DATE range cover the
        // hot $match for /api/agg/:organism/yearly without forcing a
        // FETCH-back to filter out the 71% of rows marked 'exclude'.
        await coll.createIndex(
          { 'dashboard view': 1, DATE: 1 },
          { name: 'dash_date' },
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
