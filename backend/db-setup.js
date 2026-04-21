import dotenv from 'dotenv';
import pkg from 'pg';
import { stdin as input, stdout as output } from 'process';
import readline from 'readline';

const { Pool } = pkg;

dotenv.config();

const rl = readline.createInterface({ input, output });

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function createDatabase() {
  try {
    // Try to connect without password first (trust mode)
    console.log('🔍 Attempting to connect to PostgreSQL...');
    
    let dbConnected = false;
    let connectionString;
    
    // Try 1: No password (default on many Windows installations)
    try {
      const testPool = new Pool({
        connectionString: 'postgresql://postgres@localhost:5432/postgres',
      });
      const client = await testPool.connect();
      client.release();
      testPool.end();
      dbConnected = true;
      connectionString = 'postgresql://postgres@localhost:5432/postgres';
      console.log('✅ Connected without password');
    } catch (err) {
      console.log('⚠️  Password required');
      
      // Try 2: Ask for password
      const password = await question('📝 Enter PostgreSQL password (default postgres user): ');
      connectionString = `postgresql://postgres:${password}@localhost:5432/postgres`;
      
      try {
        const testPool = new Pool({ connectionString });
        const client = await testPool.connect();
        client.release();
        testPool.end();
        dbConnected = true;
        console.log('✅ Connected with password');
      } catch (err2) {
        console.error('❌ Connection failed:', err2.message);
        rl.close();
        return;
      }
    }
    
    if (!dbConnected) {
      console.error('❌ Could not connect to PostgreSQL');
      rl.close();
      return;
    }
    
    // Now create database
    const adminPool = new Pool({ connectionString });
    const client = await adminPool.connect();
    
    try {
      console.log('🔍 Checking if database exists...');
      const dbCheck = await client.query(
        "SELECT 1 FROM pg_database WHERE datname = 'attendance_db'"
      );
      
      if (dbCheck.rows.length > 0) {
        console.log('✅ Database already exists');
      } else {
        console.log('📝 Creating database...');
        await client.query('CREATE DATABASE attendance_db');
        console.log('✅ Database created successfully!');
      }
      
      console.log('\n📋 Next steps:');
      console.log('1. Update backend/.env with your database password');
      console.log('2. Run: npm run db:init');
      console.log('3. Run: npm run seed');
      
    } finally {
      client.release();
      adminPool.end();
      rl.close();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
  }
}

createDatabase();
