const express = require('express');
const router = express.Router();
const db = require('../db');

// Get Census
router.get('/census', (req, res) => {
    const explId = req.headers['explotacion_id'] || 'ES481230009876';
    db.all("SELECT * FROM animals WHERE explotacion_id = ?", [explId], (err, rows) => {
        res.json({ animals: rows });
    });
});

// Get Reports/Movements
router.get('/reports', (req, res) => {
    db.all("SELECT * FROM movements ORDER BY fecha DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
