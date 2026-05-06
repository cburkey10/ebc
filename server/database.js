const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function connectDB() {
  try {
    await sql.connect(config);
    console.log('Connected to Azure SQL');
    await createTables();
  } catch (err) {
    console.error('Database connection failed:', err);
  }
}

async function createTables() {
  await sql.query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='events' AND xtype='U')
    CREATE TABLE events (
      id INT IDENTITY PRIMARY KEY,
      companyName NVARCHAR(255),
      industry NVARCHAR(255),
      opportunities NVARCHAR(MAX),
      goal NVARCHAR(MAX),
      createdAt DATETIME DEFAULT GETDATE()
    )
  `);

  await sql.query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='attendees' AND xtype='U')
    CREATE TABLE attendees (
      id INT IDENTITY PRIMARY KEY,
      eventId INT,
      name NVARCHAR(255),
      role NVARCHAR(255),
      priorities NVARCHAR(MAX)
    )
  `);

  await sql.query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='notes' AND xtype='U')
    CREATE TABLE notes (
      id INT IDENTITY PRIMARY KEY,
      eventId INT,
      content NVARCHAR(MAX),
      createdAt DATETIME DEFAULT GETDATE()
    )
  `);

  await sql.query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='generatedContent' AND xtype='U')
    CREATE TABLE generatedContent (
      id INT IDENTITY PRIMARY KEY,
      eventId INT,
      type NVARCHAR(50),
      content NVARCHAR(MAX),
      createdAt DATETIME DEFAULT GETDATE()
    )
  `);

  console.log('Tables ready');
}

module.exports = { connectDB, sql };