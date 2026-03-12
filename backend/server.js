const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const interestRoutes = require('./routes/interest');
const fileRoutes = require('./routes/files');

app.use('/api/interest', interestRoutes);
app.use('/api/files', fileRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SniperThink API running on port ${PORT}`);
});

module.exports = app;
