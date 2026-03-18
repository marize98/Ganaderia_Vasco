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

// Serve Frontend if in production (PWA)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client')));
}

app.listen(PORT, () => {
    console.log(`[BASERRI-ADITU] Server running ultra plus mode on port ${PORT}`);
});
