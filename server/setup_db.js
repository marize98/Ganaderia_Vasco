const mysql = require('mysql2/promise');
require('dotenv').config();

const setup = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  console.log('Connected to database. Setting up tables...');

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS census (
      id INT AUTO_INCREMENT PRIMARY KEY,
      explotacion_id VARCHAR(50) NOT NULL,
      bovino INT DEFAULT 0,
      ovino INT DEFAULT 0,
      last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS animals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tag_id VARCHAR(50) UNIQUE NOT NULL,
      type ENUM('Bovino', 'Ovino') NOT NULL,
      gender ENUM('Macho', 'Hembra') NOT NULL,
      status VARCHAR(50) DEFAULT 'SANO',
      explotacion_id VARCHAR(50) NOT NULL
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      animal_id INT,
      type VARCHAR(50) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert initial data for the dashboard
  await connection.execute(`
    INSERT INTO census (explotacion_id, bovino, ovino) 
    SELECT 'ES48020', 340, 150
    WHERE NOT EXISTS (SELECT 1 FROM census WHERE explotacion_id = 'ES48020')
  `);

  console.log('Database setup complete.');
  process.exit(0);
};

setup().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
