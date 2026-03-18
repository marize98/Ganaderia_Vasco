const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'baserri_magistral_2026';

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Failed to authenticate token' });
        req.userId = decoded.id;
        next();
    });
};

// Get Profile
router.get('/profile', verifyToken, (req, res) => {
    db.get("SELECT id, username, explotacion_id, full_name, role, email, phone FROM users WHERE id = ?", [req.userId], (err, user) => {
        if (err) {
            console.error('[DATABASE ERROR]', err.message);
            return res.status(500).json({ message: 'Database error', detail: err.message });
        }
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    });
});

// Update Profile
router.put('/profile', verifyToken, (req, res) => {
    const { full_name, phone, email } = req.body;
    db.run("UPDATE users SET full_name = ?, phone = ?, email = ? WHERE id = ?", 
        [full_name, phone, email, req.userId], function(err) {
        if (err) return res.status(500).json({ message: 'Error updating profile' });
        res.json({ message: 'Perfil actualizado magistralmente' });
    });
});

module.exports = router;
