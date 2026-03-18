-- Baserri-ADITU Database Schema
-- Para importar manualmente desde phpMyAdmin

-- Tabla de Censo (Resumen de Explotación)
CREATE TABLE IF NOT EXISTS census (
  id INT AUTO_INCREMENT PRIMARY KEY,
  explotacion_id VARCHAR(50) NOT NULL,
  bovino INT DEFAULT 0,
  ovino INT DEFAULT 0,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Animales (Trazabilidad)
CREATE TABLE IF NOT EXISTS animals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tag_id VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('Bovino', 'Ovino') NOT NULL,
  gender ENUM('Macho', 'Hembra') NOT NULL,
  status VARCHAR(50) DEFAULT 'SANO',
  explotacion_id VARCHAR(50) NOT NULL
);

-- Tabla de Transacciones (Trámites MUGIDE)
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales para el Piloto
INSERT INTO census (explotacion_id, bovino, ovino) VALUES ('ES48020', 340, 150);

-- Animales de prueba
INSERT INTO animals (tag_id, type, gender, status, explotacion_id) VALUES 
('4589', 'Bovino', 'Hembra', 'SANO', 'ES48020'),
('0402', 'Bovino', 'Macho', 'RETENCIÓN SANITARIA', 'ES48020');
