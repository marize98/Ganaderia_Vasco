const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/authMiddleware');

// Get Farm Census
router.get('/census', auth, (req, res) => {
    const { explotacion_id } = req.user;
    db.all("SELECT * FROM animals WHERE explotacion_id = ?", [explotacion_id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error al obtener el censo' });
        res.json({ count: rows.length, animals: rows });
    });
});

// Register Birth
router.post('/birth', auth, (req, res) => {
    const { id, madre_id, tipo, sexo } = req.body;
    const { explotacion_id } = req.user;
    
    db.run("INSERT INTO animals (id, explotacion_id, tipo, estado, madre_id, sanidad) VALUES (?, ?, ?, ?, ?, ?)",
        [id, explotacion_id, tipo || 'Bovino', 'Vila', madre_id, 'Excelente'],
        (err) => {
            if (err) return res.status(500).json({ message: 'Error al registrar nacimiento' });
            res.status(201).json({ status: 'Success', message: 'Nacimiento registrado en MUGIDE' });
        }
    );
});

// Create Movement Guide
router.post('/movement', auth, (req, res) => {
    const { animal_id, origen, destino } = req.body;
    const { explotacion_id } = req.user;

    db.run("INSERT INTO movements (animal_id, origen, destino, fecha, guia_status) VALUES (?, ?, ?, ?, ?)",
        [animal_id, explotacion_id, destino, new Date().toISOString(), 'Pendiente de Validación'],
        (err) => {
            if (err) return res.status(500).json({ message: 'Error al solicitar guía' });
            res.json({ status: 'OK', message: 'Solicitud de guía enviada a la sede electrónica' });
        }
    );
});

module.exports = router;
