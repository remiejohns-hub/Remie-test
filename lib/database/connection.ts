import mysql from 'mysql2/promise'

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
}

// Create connection pool
let pool: mysql.Pool | null = null

export function getConnectionPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getConnectionPool().getConnection()
    await connection.ping()
    connection.release()
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Execute query with error handling
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const [rows] = await getConnectionPool().execute(query, params)
    return rows as T[]
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Execute single query (for INSERT, UPDATE, DELETE)
export async function executeSingleQuery(
  query: string,
  params: any[] = []
): Promise<mysql.ResultSetHeader> {
  try {
    const [result] = await getConnectionPool().execute(query, params)
    return result as mysql.ResultSetHeader
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Close connection pool
export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

