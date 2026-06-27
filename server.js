const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 1. Advanced API Feature: Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { error: 'Too many requests from this IP, please try again later.' }
});

// 2. Simulated OAuth/Token Authentication Middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' });
  }
  
  const token = authHeader.split(' ')[1];
  // In a real OAuth flow, this would validate against an auth server
  if (token !== 'mock-oauth-token-123') {
    return res.status(403).json({ error: 'Forbidden: Invalid access token.' });
  }
  
  next();
};

// 3. External API Integration with Error Handling
app.get('/api/external-data', apiLimiter, requireAuth, async (req, res) => {
  try {
    // Fetching from a reliable public API (JSONPlaceholder)
    const response = await axios.get('https://jsonplaceholder.typicode.com/users');
    res.json(response.data);
  } catch (error) {
    // Advanced Error Handling
    console.error('External API Error:', error.message);
    res.status(502).json({ error: 'Bad Gateway: Failed to fetch data from external service.' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
