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
const userRoutes = require('./routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/livestock', require('./routes/livestock'));

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Baserri-Aditu API is operational' });
});

// Serve Frontend Assets (Monolithic Mode for 100% Operational Ease)
app.use(express.static(path.join(__dirname, '../client')));

// Fallback to index.html for SPA-style routing
app.get('*', (req, res, next) => {
    // If it looks like a request for an API or a static file (has an extension), don't serve index.html
    if (req.path.startsWith('/api') || req.path.includes('.')) {
        return res.status(404).json({ message: 'Resource not found' });
    }
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
    console.log(`[BASERRI-ADITU] Server running in MAGISTRAL mode on port ${PORT}`);
});
