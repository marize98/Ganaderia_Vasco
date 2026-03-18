const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./db');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const livestockRoutes = require('./routes/livestock');

app.use('/api/auth', authRoutes);
app.use('/api/livestock', livestockRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Baserri-Aditu API is operational' });
});

// Serve Frontend Assets (Monolithic Mode for 100% Operational Ease)
app.use(express.static(path.join(__dirname, '../client')));

// Fallback to index.html for SPA-style routing if needed
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
    console.log(`[BASERRI-ADITU] Server running in MAGISTRAL mode on port ${PORT}`);
});
