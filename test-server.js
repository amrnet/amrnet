// Temporary test server without MongoDB
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Test endpoint without MongoDB
app.get('/api/getCollectionCounts', (req, res) => {
  console.log('Test endpoint called');
  res.json({
    styphi: "1,000",
    kpneumo: "2,000",
    ngono: "500",
    ecoli: "3,000",
    decoli: "1,500",
    shige: "800",
    senterica: "1,200",
    sentericaints: "900"
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server is running' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Test server started on http://localhost:${PORT}`);
});
