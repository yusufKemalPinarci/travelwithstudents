const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test database connection (non-blocking)
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('⚠️  Database connection failed:', error.message);
    console.error('⚠️  Server will start but database operations will fail until connection is established');
    console.error('💡 Please configure your MySQL database and update the DATABASE_URL in .env');
  });

module.exports = prisma;
