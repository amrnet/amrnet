import crypto from 'crypto';
import express from 'express';
import connectDB from '../../config/db.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// GET /api-register — Registration form
// ──────────���─────────────────────���────────────────────────────
router.get('/', (_req, res) => {
  res.send(REGISTRATION_PAGE);
});

// ────────────────────────���───────────────────────��────────────
// POST /api-register — Process registration
// ────��────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { name, email, institution, purpose } = req.body;

  if (!name || !email || !institution || !purpose) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const client = await connectDB();
    const col = client.db('amrnet_admin').collection('api_keys');

    // Check if email already registered
    const existing = await col.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.json({
        success: true,
        message: 'An API key was already issued for this email.',
        api_key: existing.api_key,
        created: existing.created_at,
      });
    }

    // Generate API key
    const apiKey = `amrnet_${crypto.randomBytes(20).toString('hex')}`;

    // Store registration
    const registration = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      institution: institution.trim(),
      purpose: purpose.trim(),
      api_key: apiKey,
      created_at: new Date().toISOString(),
      active: true,
    };

    await col.insertOne(registration);

    // Send success response
    res.json({
      success: true,
      api_key: apiKey,
      message: 'Your API key has been generated. Save it — you will need it for all API requests.',
    });
  } catch (error) {
    console.error('[API Registration] Error:', error.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ──────────────────────────────────────────────��──────────────
// GET /api-register/admin — List all registrations (protected)
// ───────────────────────────��─────────────────────────────────
router.get('/admin', async (req, res) => {
  const adminKey = req.headers['x-admin-key'] || req.query.admin_key;
  if (adminKey !== 'amrnet-admin-2026') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const client = await connectDB();
    const col = client.db('amrnet_admin').collection('api_keys');
    const registrations = await col.find({}).sort({ created_at: -1 }).toArray();
    res.json({ total: registrations.length, registrations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// ─────────────────────────────────���───────────────────────────
// Registration HTML page
// ──────────────────────────────��──────────────────────────────
const REGISTRATION_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AMRnet API — Request Access</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 520px;
      width: 100%;
      overflow: hidden;
    }
    .header {
      background: #1a237e;
      color: white;
      padding: 32px;
      text-align: center;
    }
    .header h1 { font-size: 24px; margin-bottom: 8px; }
    .header p { font-size: 14px; opacity: 0.85; line-height: 1.5; }
    .form-body { padding: 32px; }
    .field { margin-bottom: 20px; }
    .field label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #333;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .field input, .field textarea {
      width: 100%;
      padding: 12px 14px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 15px;
      transition: border-color 0.2s;
      font-family: inherit;
    }
    .field input:focus, .field textarea:focus {
      outline: none;
      border-color: #1a237e;
    }
    .field textarea { resize: vertical; min-height: 80px; }
    button {
      width: 100%;
      padding: 14px;
      background: #1a237e;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #0d47a1; }
    button:disabled { background: #9e9e9e; cursor: not-allowed; }

    .result {
      display: none;
      padding: 32px;
      text-align: center;
    }
    .result.show { display: block; }
    .result .success-icon {
      width: 64px; height: 64px;
      background: #4caf50;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 32px;
      color: white;
    }
    .result h2 { color: #2e7d32; margin-bottom: 16px; }
    .api-key-box {
      background: #f5f5f5;
      border: 2px dashed #1a237e;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      word-break: break-all;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      font-weight: 600;
      color: #1a237e;
      cursor: pointer;
      position: relative;
    }
    .api-key-box:hover { background: #e8eaf6; }
    .api-key-box .copy-hint {
      font-size: 11px;
      color: #666;
      font-weight: normal;
      font-family: -apple-system, sans-serif;
      display: block;
      margin-top: 8px;
    }
    .usage-example {
      background: #263238;
      color: #4fc3f7;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      text-align: left;
      overflow-x: auto;
      white-space: pre;
    }
    .links { margin-top: 20px; }
    .links a {
      display: inline-block;
      padding: 10px 20px;
      background: #1a237e;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      margin: 4px;
      font-size: 14px;
    }
    .links a:hover { background: #0d47a1; }
    .note {
      font-size: 12px;
      color: #666;
      margin-top: 16px;
      line-height: 1.5;
    }
    .error-msg {
      color: #d32f2f;
      font-size: 13px;
      margin-top: 8px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AMRnet Public API</h1>
      <p>Request an API key to access antimicrobial resistance genomic data programmatically across 10 bacterial pathogens and 1.6M+ genomes.</p>
    </div>

    <div class="form-body" id="formSection">
      <form id="regForm" onsubmit="return submitForm(event)">
        <div class="field">
          <label>Full Name *</label>
          <input type="text" id="name" placeholder="e.g., Dr. Jane Smith" required />
        </div>
        <div class="field">
          <label>Email Address *</label>
          <input type="email" id="email" placeholder="e.g., jane.smith@university.edu" required />
        </div>
        <div class="field">
          <label>Institution / Organisation *</label>
          <input type="text" id="institution" placeholder="e.g., London School of Hygiene & Tropical Medicine" required />
        </div>
        <div class="field">
          <label>Intended Use *</label>
          <textarea id="purpose" placeholder="Briefly describe how you plan to use the AMRnet API (e.g., research project, surveillance dashboard, teaching)" required></textarea>
        </div>
        <div class="error-msg" id="errorMsg"></div>
        <button type="submit" id="submitBtn">Request API Key</button>
      </form>
      <p class="note">
        By requesting an API key you agree to cite AMRnet in any publications using this data:<br>
        <em>Cerdeira L, et al. (2026) Nucleic Acids Research.</em>
        <a href="https://doi.org/10.1093/nar/gkaf1101" target="_blank">DOI: 10.1093/nar/gkaf1101</a>
      </p>
    </div>

    <div class="result" id="resultSection">
      <div class="success-icon">&#10003;</div>
      <h2>API Key Generated!</h2>
      <p>Your personal API key:</p>
      <div class="api-key-box" id="apiKeyDisplay" onclick="copyKey()">
        <span id="apiKeyText"></span>
        <span class="copy-hint">Click to copy</span>
      </div>
      <p style="font-size:13px; color:#d32f2f; font-weight:600;">Save this key now — you will need it for every API request.</p>

      <p style="margin-top:16px; font-size:13px; color:#333;">Example usage:</p>
      <div class="usage-example" id="usageExample"></div>

      <div class="links">
        <a href="/api-docs">View API Documentation</a>
        <a href="/">Open AMRnet Dashboard</a>
      </div>
    </div>
  </div>

  <script>
    async function submitForm(e) {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      const errorMsg = document.getElementById('errorMsg');
      btn.disabled = true;
      btn.textContent = 'Generating...';
      errorMsg.style.display = 'none';

      const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        institution: document.getElementById('institution').value,
        purpose: document.getElementById('purpose').value,
      };

      try {
        const resp = await fetch('/api-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await resp.json();

        if (result.success) {
          document.getElementById('formSection').style.display = 'none';
          document.getElementById('resultSection').classList.add('show');
          document.getElementById('apiKeyText').textContent = result.api_key;
          document.getElementById('usageExample').textContent =
            'curl -H "X-API-Key: ' + result.api_key + '" \\\\\\n  ' + window.location.origin + '/api/v1/organisms';
        } else {
          errorMsg.textContent = result.error || 'Registration failed';
          errorMsg.style.display = 'block';
          btn.disabled = false;
          btn.textContent = 'Request API Key';
        }
      } catch (err) {
        errorMsg.textContent = 'Network error. Please try again.';
        errorMsg.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Request API Key';
      }
      return false;
    }

    function copyKey() {
      const key = document.getElementById('apiKeyText').textContent;
      navigator.clipboard.writeText(key).then(() => {
        const hint = document.querySelector('.copy-hint');
        hint.textContent = 'Copied!';
        setTimeout(() => { hint.textContent = 'Click to copy'; }, 2000);
      });
    }
  </script>
</body>
</html>`;

export default router;
