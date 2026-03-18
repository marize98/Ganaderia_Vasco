const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Cognitive Layer: NLP Processor (Simplified for Pilot)
const processNLP = (text) => {
  const input = text.toLowerCase();
  
  // Entity extraction patterns (Crotal/ID, Action)
  const crotalMatch = input.match(/\d{4}/); // Matches first 4 digits
  const hasBirth = input.includes('parido') || input.includes('nacimiento') || input.includes('erditu');
  const hasMovement = input.includes('guía') || input.includes('mover') || input.includes('matadero') || input.includes('mugimendu');
  
  if (hasBirth) {
    return {
      action: 'Nacimiento',
      animal_id: crotalMatch ? crotalMatch[0] : 'Desconocido',
      type: input.includes('hembra') ? 'Hembra' : 'Macho',
      status: 'Pending Confirmation'
    };
  }
  
  if (hasMovement) {
    return {
      action: 'Movimiento',
      animal_id: crotalMatch ? crotalMatch[0] : 'Desconocido',
      destination: input.includes('matadero') ? 'Matadero' : 'Otra Explotación',
      status: 'Pending Trust Check'
    };
  }
  
  return { action: 'Unknown', raw: text };
};

// Trust Layer: Business Rules Validator
const validateTransaction = async (data) => {
  // Rule 1: Cannot move sick animals (Simulated check)
  if (data.action === 'Movimiento' && data.animal_id === '402') {
    return { valid: false, message: 'No puedo preparar esa guía porque el ternero 402 está bajo retención sanitaria.' };
  }
  
  // Rule 2: Verify census (Simulated)
  return { valid: true };
};

// API Endpoints
app.post('/api/voice/process', async (req, res) => {
  const { text } = req.body;
  const nlpResult = processNLP(text);
  
  const validation = await validateTransaction(nlpResult);
  
  res.json({
    nlp: nlpResult,
    trust: validation,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/census', async (req, res) => {
  // In a real scenario, this calls MUGIDE API
  // Here we return mock data reflecting Interfaz.jpg
  res.json({
    total: 490,
    bovino: 340,
    ovino: 150,
    alerts: [
      { id: 1, type: 'restriction', title: 'Restricción de salida activa', subtitle: 'Subexplotación A' }
    ],
    guides: [
       { id: 1, name: 'Guía 1: Matadero X', status: 'Aprobada' },
       { id: 2, name: 'Guía 2: Matadero X', status: 'Aprobada' },
       { id: 3, name: 'Guía 3: Matadero X', status: 'En curso' }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Baserri-ADITU Middleware running on port ${PORT}`);
});
