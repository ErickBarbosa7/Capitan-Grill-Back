const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

// 1. Crear el pool de conexión nativo
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Crear el adaptador de Prisma usando ese pool
const adapter = new PrismaPg(pool);

// 3. Pasar el adaptador al constructor de PrismaClient
const prisma = new PrismaClient({ 
  adapter,
  log: ['query', 'info', 'warn', 'error']
});

module.exports = prisma;