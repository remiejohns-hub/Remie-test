#!/usr/bin/env node

/**
 * Database setup script for XAMPP/MySQL
 * This script will:
 * 1. Create the database if it doesn't exist
 * 2. Run the schema creation
 * 3. Migrate existing product data
 * 
 * Run with: node scripts/setup-database.js
 */

const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db',
}

async function setupDatabase() {
  let connection
  
  try {
    console.log('🚀 Starting database setup...')
    
    // First, connect without specifying database to create it
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    })
    
    console.log('✅ Connected to MySQL server')
    
    // Create database if it doesn't exist
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``)
    console.log(`✅ Database '${dbConfig.database}' created/verified`)
    
    await tempConnection.end()
    
    // Now connect to the specific database
    connection = await mysql.createConnection(dbConfig)
    console.log(`✅ Connected to database '${dbConfig.database}'`)
    
    // Create products table
    console.log('📝 Creating products table...')
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        category VARCHAR(100),
        subcategory VARCHAR(100),
        images JSON,
        rating DECIMAL(3,2) DEFAULT 0.00,
        review_count INT DEFAULT 0,
        in_stock BOOLEAN DEFAULT TRUE,
        stock_quantity INT DEFAULT 0,
        tags JSON,
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_featured (featured),
        INDEX idx_in_stock (in_stock),
        INDEX idx_created_at (created_at)
      )
    `
    
    await connection.execute(createTableQuery)
    console.log('✅ Products table created successfully')
    
    // Test the connection
    await connection.ping()
    console.log('✅ Database connection test successful')
    
    // Check if we have any products
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM products')
    const productCount = rows[0].count
    
    if (productCount === 0) {
      console.log('📦 No products found, you may want to run the migration script')
      console.log('   Run: node scripts/migrate-products.js')
    } else {
      console.log(`📦 Found ${productCount} existing products`)
    }
    
    console.log('🎉 Database setup completed successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Run migration script: node scripts/migrate-products.js')
    console.log('2. Start your Next.js app: npm run dev')
    console.log('3. Visit: http://localhost:3000/admin')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log('🔌 Database connection closed')
    }
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Setup script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Setup script failed:', error)
      process.exit(1)
    })
}

module.exports = { setupDatabase }

