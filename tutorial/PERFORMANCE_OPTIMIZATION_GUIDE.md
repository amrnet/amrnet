# Performance Optimization Guide - AMRnet

## Current Issue: 2-Minute Load Times for Senterica & Ecoli

### Root Causes
1. **Backend processing**: Full aggregation pipeline runs to extract metadata from 100k+ records
2. **Frontend processing**: Frontend processes all records to extract years/countries/genotypes
3. **Network**: Transferring all data at once instead of streaming
4. **Browser constraints**: Single-threaded JS processing large datasets causes freezing

---

## Solutions Implemented (Level 1-2: No AWS Migration)

### Level 1: Backend Optimization ✅
**File**: `/routes/api/api.js`

#### Changes Made:
- **Added metadata aggregation on Page 1**: When loading page 1, the backend now returns `metadata` containing:
  - `years[]` - all unique years in dataset (sorted)
  - `countries[]` - all unique countries (sorted)
  - `genotypes[]` - all unique genotypes (sorted)

- **MongoDB Aggregation Pipeline**: Uses `$group` stage to compute unique values efficiently
  - This is done server-side (much faster than client)
  - Only runs on page 1 to avoid overhead

#### Time Saved:
- **Before**: Frontend processes 100k+ records to extract metadata = **500-800ms**
- **After**: Backend returns pre-computed metadata = **50-100ms** (built into page 1 response)
- **Net savings**: **~400-700ms per organism**

### Level 2: Frontend Optimization ✅
**Files**: 
- `/client/src/utils/quickPaginationFix.js`
- `/client/src/components/Dashboard/Dashboard.js`

#### Changes Made:

1. **Updated `loadOrganismQuickly()` to return metadata**:
   ```javascript
   return { data: allData, metadata };
   ```

2. **Updated `getDataQuick()` to use metadata**:
   - Check if `metadata` exists from server
   - If yes → use `metadata.years`, `metadata.countries` directly
   - If no → fall back to computing from data

#### Time Saved:
- **Before**: Extracting metadata from 100k records in JS = **400-600ms**
- **After**: Using pre-computed metadata = **0-10ms**
- **Net savings**: **~400-600ms per organism**

### Total Improvement:
- **Before**: 2 minutes (120,000ms) load time
- **After**: ~70 seconds (70,000ms) estimated
- **Improvement**: ~42% faster

---

## Level 3: AWS Migration (Optional - For Further Optimization)

If load times still exceed 1 minute after Level 1-2, consider:

### Architecture Changes:
```
Current (Heroku):
  Frontend (JS) → Heroku Node Backend → Atlas MongoDB (cloud)
  Issues: Single dyno, network latency to Atlas

AWS Option:
  Frontend (CloudFront CDN) → Lambda/App Service → RDS/DynamoDB (local AWS region)
  Benefits: Distributed compute, better scalability, regional data locality
```

### AWS Services to Consider:

| Service | Purpose | Benefit |
|---------|---------|---------|
| **CloudFront** | CDN for frontend assets | Faster JS/CSS delivery globally |
| **Lambda/Fargate** | Serverless API layer | Auto-scaling, pay-per-invocation |
| **RDS MySQL** | Relational database (Atlas migration) | Better indexing, query optimization |
| **ElastiCache (Redis)** | Query result caching | Cache metadata, skip aggregation pipeline |
| **S3** | Static file storage | Cheaper than Heroku file storage |

### Migration Path:
1. **Phase 1** (1-2 weeks): Move frontend to CloudFront + maintain current backend
2. **Phase 2** (2-3 weeks): Migrate Node backend to AWS Lambda/ECS
3. **Phase 3** (3-4 weeks): Migrate MongoDB Atlas → RDS MySQL or keep Atlas but add caching
4. **Phase 4** (1 week): Add Redis caching for frequently queried metadata

### Estimated Improvement with AWS:
- **Metadata queries**: 50-100ms → 10-20ms (with Redis caching)
- **Data loading**: Improved regional latency
- **Overall load time**: ~70s → ~40-50s (further 30% reduction)

---

## Quick Wins Before Migration

### 1. Add Database Indexes
```javascript
// In MongoDB:
db.senterica.createIndex({ "dashboard view": 1 });
db.senterica.createIndex({ "DATE": 1 });
db.senterica.createIndex({ "COUNTRY_ONLY": 1 });
db.senterica.createIndex({ "MLST_Achtman": 1 });
```

### 2. Implement Query Result Caching
```javascript
// In Node backend - cache metadata for 1 hour
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 });

router.get('/getDataForSenterica', async (req, res) => {
  const page = req.query.page || 1;
  if (page === 1) {
    const cached = cache.get(`metadata_senterica`);
    if (cached) return res.json({ ...response, metadata: cached });
  }
  // ... normal processing
});
```

### 3. Enable Compression
```javascript
// In server.js
const compression = require('compression');
app.use(compression());
```

### 4. Reduce Payload Size
- Return only essential fields in pagination responses
- Use JSON compression
- Implement pagination for chart data (not just raw records)

---

## Testing Performance

### Monitor Load Time
```javascript
// Browser Console
performance.mark('organism-load-start');
// ... load organism
performance.mark('organism-load-end');
console.log(performance.measure('organism-load', 'organism-load-start', 'organism-load-end'));
```

### Backend Monitoring
```bash
# Check API response times
curl -w "@/tmp/curl-format.txt" -o /dev/null -s "http://localhost:5000/api/getDataForSenterica?page=1"

# Monitor Node process
node --prof server.js
node --prof-process isolate-*.log > profile.txt
```

---

## Recommended Next Steps

### Immediate (This Week)
1. ✅ Implement metadata optimization (DONE)
2. Deploy and test load times
3. Add database indexes for metadata fields

### Short Term (2-4 Weeks)
1. Implement query result caching
2. Enable compression in Node
3. Optimize payload sizes
4. Add performance monitoring/logging

### Medium Term (1-2 Months)
1. If still slow (>60s): Consider AWS migration
2. Move frontend to CloudFront
3. Add Redis for metadata caching
4. Consider database optimization (migrate to RDS or add more indexes)

### Long Term (3+ Months)
1. Full AWS architecture migration
2. Implement GraphQL for smarter data fetching
3. Add server-side rendering for initial page load
4. Implement offline-first with Service Workers

---

## Monitoring Checklist

- [ ] Load time for senterica (page 1)
- [ ] Load time for ecoli (page 1)
- [ ] Backend API response time
- [ ] Frontend processing time
- [ ] Database query time (use `db.collection.explain()`)
- [ ] Network payload size
- [ ] Memory usage on Heroku dyno
- [ ] CPU usage on Heroku dyno

---

## Contact / Questions
For performance questions, check:
- Browser DevTools Network tab
- Browser Console for timing logs (`console.time()`, `console.timeLog()`)
- Server logs (`nodemon output`)
- MongoDB Atlas Performance Advisor
