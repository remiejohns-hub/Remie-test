#!/usr/bin/env node

/**
 * Migration script to transfer static product data to MySQL database
 * Run with: node scripts/migrate-products.js
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

// Import static data
const { sampleProducts } = require('../lib/data/products.ts')

async function migrateProducts() {
  let connection
  
  try {
    console.log('🚀 Starting product migration...')
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig)
    console.log('✅ Connected to database')
    
    // Test connection
    await connection.ping()
    console.log('✅ Database connection verified')
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing product data...')
    await connection.execute('DELETE FROM products')
    console.log('✅ Existing data cleared')
    
    // Insert products
    console.log('📦 Inserting products...')
    let insertedCount = 0
    
    for (const product of sampleProducts) {
      try {
        await connection.execute(
          `INSERT INTO products (
            id, name, description, price, original_price, category, subcategory,
            images, rating, review_count, in_stock, stock_quantity, tags, featured,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.id,
            product.name,
            product.description,
            product.price,
            product.originalPrice || null,
            product.category,
            product.subcategory || null,
            JSON.stringify(product.images),
            product.rating,
            product.reviewCount,
            product.inStock,
            product.stockQuantity,
            JSON.stringify(product.tags),
            product.featured,
            product.createdAt,
            product.updatedAt
          ]
        )
        insertedCount++
        
      } catch (error) {
        console.error(`❌ Error inserting product ${product.id}:`, error.message)
      }
    }
    
    console.log(`✅ Inserted ${insertedCount} products`)
    
    // Verify migration
    console.log('🔍 Verifying migration...')
    const [productCount] = await connection.execute('SELECT COUNT(*) as count FROM products')
    const [featuredCount] = await connection.execute('SELECT COUNT(*) as count FROM products WHERE featured = true')
    
    console.log('📊 Migration Summary:')
    console.log(`   - Total products: ${productCount[0].count}`)
    console.log(`   - Featured products: ${featuredCount[0].count}`)
    
    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log('🔌 Database connection closed')
    }
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateProducts()
    .then(() => {
      console.log('✅ Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateProducts }

