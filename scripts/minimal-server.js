// Minimal server to test what's causing the hang
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

console.log('Starting minimal server...');

dotenv.config();
const app = express();

console.log('Express app created');

app.use(cors());
app.use(express.json());

console.log('Middleware added');

// Health check
app.get('/api/health', (req, res) => {
  console.log('Health check called');
  res.json({ status: 'OK', message: 'Minimal server running' });
});

// Test endpoint
app.get('/api/getCollectionCounts', (req, res) => {
  console.log('Collection counts called');
  res.json({
    // styphi: "5,234",
    // kpneumo: "8,891",
    // ngono: "2,156",
    // ecoli: "12,445",
    // decoli: "3,667",
    // shige: "1,892",
    // senterica: "7,334",
    // sentericaints: "4,123"
  });
});

// Add the missing organism data endpoints
app.get('/api/getDataForSTyphi', (req, res) => {
  console.log('STyphi data called');
  res.json([
    { id: 1, organism: "S. Typhi", data: "Mock data for development" },
    { id: 2, organism: "S. Typhi", data: "Mock data for development" }
  ]);
});

app.get('/api/getDataForKpneumo', (req, res) => {
  console.log('Kpneumo data called');
  res.json([
    { id: 1, organism: "K. pneumoniae", data: "Mock data for development" }
  ]);
});

app.get('/api/getDataForNgono', (req, res) => {
  console.log('Ngono data called');
  res.json([
    { id: 1, organism: "N. gonorrhoeae", data: "Mock data for development" }
  ]);
});

app.get('/api/getDataForEcoli', (req, res) => {
  console.log('Ecoli data called');
  res.json([
    { id: 1, organism: "E. coli", data: "Mock data for development" }
  ]);
});

app.get('/api/getDataForDEcoli', (req, res) => {
  console.log('DEcoli data called');
  res.json([
    { id: 1, organism: "E. coli (diarrhoeagenic)", data: "Mock data for development" }
  ]);
});

app.get('/api/getDataForShige', (req, res) => {
  console.log('Shige data called');
  res.json([
    { id: 1, organism: "Shigella", data: "Mock data for development" }
  ]);
});

app.get('/api/getDataForSenterica', (req, res) => {
  console.log('Senterica data called');
  res.json([
    { id: 1, organism: "S. enterica", data: "Mock data for development" }
  ]);
});

app.get('/api/getDataForSentericaints', (req, res) => {
  console.log('Sentericaints data called');
  res.json([
    { id: 1, organism: "S. enterica (ints)", data: "Mock data for development" }
  ]);
});

app.get('/api/getUNR', (req, res) => {
  console.log('UNR data called');
  res.json([
    { id: 1, type: "UNR", data: "Mock data for development" }
  ]);
});

// Add the optimized endpoints that the frontend expects
app.get('/api/optimized/getDataForKpneumo', (req, res) => {
  console.log('Optimized Kpneumo data called');
  res.json({
    data: [
      {
        COUNTRY_ONLY: "United Kingdom",
        DATE: "2023",
        GENOTYPE: "ST258",
        LATITUDE: 51.5074,
        LONGITUDE: -0.1278,
        CARB_PHENO: "carbapenem-resistant"
      },
      {
        COUNTRY_ONLY: "Germany",
        DATE: "2023",
        GENOTYPE: "ST11",
        LATITUDE: 52.5200,
        LONGITUDE: 13.4050,
        CARB_PHENO: "carbapenem-susceptible"
      }
    ],
    totalCount: 2,
    page: 1,
    pageSize: 1000
  });
});

app.get('/api/optimized/getDataForEcoli', (req, res) => {
  console.log('Optimized Ecoli data called');
  res.json({
    data: [
      {
        COUNTRY_ONLY: "United States",
        DATE: "2023",
        GENOTYPE: "ST131",
        LATITUDE: 40.7128,
        LONGITUDE: -74.0060,
        cip_pheno: "ciprofloxacin-resistant"
      }
    ],
    totalCount: 1,
    page: 1,
    pageSize: 1000
  });
});

app.get('/api/optimized/getDataForDEcoli', (req, res) => {
  console.log('Optimized DEcoli data called');
  res.json({
    data: [
      {
        COUNTRY_ONLY: "Canada",
        DATE: "2023",
        GENOTYPE: "ST69",
        LATITUDE: 45.4215,
        LONGITUDE: -75.6972,
        cip_pheno: "ciprofloxacin-susceptible"
      }
    ],
    totalCount: 1,
    page: 1,
    pageSize: 1000
  });
});

const PORT = process.env.PORT || 8080;

console.log(`Attempting to start server on port ${PORT}`);

app.listen(PORT, () => {
  console.log(`✅ Minimal server running on http://localhost:${PORT}`);
});

console.log('Server setup complete');
