const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'baserri_magistral_2026';

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Auth failed' });
        req.userId = decoded.id;
        next();
    });
};

router.post('/sync', verifyToken, (req, res) => {
    const { intent, data } = req.body;
    console.log(`[Cognitive Sync] User ${req.userId} -> ${intent}`, data);

    let query = "";
    let params = [];
    const date = new Date().toISOString().split('T')[0];

    if (intent === 'BIRTH') {
        query = "INSERT INTO movements (animal_id, tipo, fecha, origen, destino, guia_status) VALUES (?, 'ALTA', ?, 'Nacimiento', 'Explotación', 'Firmado')";
        params = ["TX-" + Math.floor(Math.random()*1000), date];
    } else if (intent === 'MOVEMENT') {
        query = "INSERT INTO movements (animal_id, tipo, fecha, origen, destino, guia_status) VALUES (?, 'SALIDA', ?, 'Explotación', 'Matadero', 'Firmado')";
        params = [data.crotal || "ES000", date];
    }

    if (query) {
        db.run(query, params, function(err) {
            if (err) return res.status(500).json({ message: 'Sync failed' });
            res.json({ message: 'Cognitive action synced', id: this.lastID });
        });
    } else {
        res.status(400).json({ message: 'Unknown intent' });
    }
});

router.get('/census', verifyToken, (req, res) => {
    // Simulating census count
    res.json({ animals: new Array(48).fill(0) });
});

router.get('/reports', verifyToken, (req, res) => {
    db.all("SELECT * FROM movements ORDER BY id DESC LIMIT 10", [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});

module.exports = router;
