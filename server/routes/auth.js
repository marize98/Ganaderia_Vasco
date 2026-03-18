const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) return res.status(401).json({ message: 'Credenciales inválidas' });
        
        const validPass = bcrypt.compareSync(password, user.password);
        if (!validPass) return res.status(401).json({ message: 'Credenciales inválidas' });
        
        const token = jwt.sign({ 
            id: user.id, 
            explotacion_id: user.explotacion_id 
        }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ token, user: { username: user.username, explotacion_id: user.explotacion_id } });
    });
});

module.exports = router;
