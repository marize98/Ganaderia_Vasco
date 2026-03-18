const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) return res.status(401).json({ message: 'Usuario no encontrado' });
        
        const validPass = bcrypt.compareSync(password, user.password);
        if (!validPass) return res.status(401).json({ message: 'Contraseña incorrecta' });
        
        const token = jwt.sign({ 
            id: user.id, 
            explotacion_id: user.explotacion_id 
        }, process.env.JWT_SECRET || 'baserri_magistral_2026', { expiresIn: '24h' });
        
        res.json({ token, user: { id: user.id, username: user.username, explotacion_id: user.explotacion_id } });
    });
});

router.post('/register', (req, res) => {
    const { username, password, explotacion_id, full_name, email } = req.body;
    
    // Validate inputs
    if (!username || !password) return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });

    db.get("SELECT id FROM users WHERE username = ?", [username], (err, existingUser) => {
        if (existingUser) return res.status(400).json({ message: 'El nombre de usuario ya está registrado' });
        
        const hashedPass = bcrypt.hashSync(password, 10);
        db.run("INSERT INTO users (username, password, explotacion_id, full_name, email) VALUES (?, ?, ?, ?, ?)", 
            [username, hashedPass, explotacion_id || 'ES480000000000', full_name || username, email || ''], function(err) {
            if (err) return res.status(500).json({ message: 'Error interno al registrar usuario' });
            res.json({ message: 'Registro completado con éxito', id: this.lastID });
        });
    });
});

router.post('/recover', (req, res) => {
    const { email } = req.body;
    res.json({ message: 'Si el correo existe, recibirás instrucciones de recuperación' });
});

module.exports = router;
