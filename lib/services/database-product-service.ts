import { executeQuery, executeSingleQuery } from '@/lib/database/connection'
import type { Product, ProductFilters } from '@/lib/types/product'

export class DatabaseProductService {
  // Get all products with optional filtering
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    let query = `
      SELECT 
        id, name, description, price, original_price, category, subcategory,
        images, rating, review_count, in_stock, stock_quantity, tags,
        featured, created_at, updated_at
      FROM products 
      ORDER BY created_at DESC
    `
    let params: any[] = []

    if (filters) {
      const conditions: string[] = []
      
      if (filters.category) {
        conditions.push('category = ?')
        params.push(filters.category)
      }
      
      if (filters.subcategory) {
        conditions.push('subcategory = ?')
        params.push(filters.subcategory)
      }
      
      if (filters.minPrice !== undefined) {
        conditions.push('price >= ?')
        params.push(filters.minPrice)
      }
      
      if (filters.maxPrice !== undefined) {
        conditions.push('price <= ?')
        params.push(filters.maxPrice)
      }
      
      if (filters.inStock !== undefined) {
        conditions.push('in_stock = ?')
        params.push(filters.inStock)
      }
      
      if (filters.featured !== undefined) {
        conditions.push('featured = ?')
        params.push(filters.featured)
      }
      
      if (filters.search) {
        conditions.push('(name LIKE ? OR description LIKE ? OR JSON_SEARCH(tags, "one", ?) IS NOT NULL)')
        const searchTerm = `%${filters.search}%`
        params.push(searchTerm, searchTerm, filters.search)
      }
      
      if (conditions.length > 0) {
        query = query.replace('ORDER BY created_at DESC', `WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`)
      }
    }

    const rows = await executeQuery(query, params)
    return this.mapRowsToProducts(rows)
  }

  // Get product by ID
  static async getProductById(id: string): Promise<Product | null> {
    const rows = await executeQuery(
      `SELECT 
        id, name, description, price, original_price, category, subcategory,
        images, rating, review_count, in_stock, stock_quantity, tags,
        featured, created_at, updated_at
      FROM products 
      WHERE id = ?`,
      [id]
    )
    if (rows.length === 0) return null
    return this.mapRowToProduct(rows[0])
  }

  // Get featured products
  static async getFeaturedProducts(): Promise<Product[]> {
    const rows = await executeQuery(
      `SELECT 
        id, name, description, price, original_price, category, subcategory,
        images, rating, review_count, in_stock, stock_quantity, tags,
        featured, created_at, updated_at
      FROM products 
      WHERE featured = true 
      ORDER BY created_at DESC`
    )
    return this.mapRowsToProducts(rows)
  }

  // Update featured status
  static async updateFeaturedStatus(id: string, featured: boolean): Promise<void> {
    await executeSingleQuery(
      'UPDATE products SET featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [featured, id]
    )
  }

  // Bulk update featured status
  static async bulkUpdateFeatured(updates: { id: string; featured: boolean }[]): Promise<void> {
    if (updates.length === 0) return

    for (const update of updates) {
      await this.updateFeaturedStatus(update.id, update.featured)
    }
  }

  // Get product statistics
  static async getProductStats(): Promise<{
    totalProducts: number
    featuredProducts: number
    inStockProducts: number
    outOfStockProducts: number
    totalCategories: number
  }> {
    const rows = await executeQuery(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN featured = true THEN 1 END) as featured_products,
        COUNT(CASE WHEN in_stock = true THEN 1 END) as in_stock_products,
        COUNT(CASE WHEN in_stock = false THEN 1 END) as out_of_stock_products,
        COUNT(DISTINCT category) as total_categories
      FROM products
    `)
    
    const stats = rows[0]
    return {
      totalProducts: stats.total_products,
      featuredProducts: stats.featured_products,
      inStockProducts: stats.in_stock_products,
      outOfStockProducts: stats.out_of_stock_products,
      totalCategories: stats.total_categories
    }
  }

  // Helper method to map database rows to Product objects
  private static mapRowsToProducts(rows: any[]): Product[] {
    return rows.map(row => this.mapRowToProduct(row))
  }

  // Helper method to map single database row to Product object
  private static mapRowToProduct(row: any): Product {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
      category: row.category,
      subcategory: row.subcategory,
      images: JSON.parse(row.images || '[]'),
      rating: parseFloat(row.rating),
      reviewCount: row.review_count,
      inStock: Boolean(row.in_stock),
      stockQuantity: row.stock_quantity,
      tags: JSON.parse(row.tags || '[]'),
      featured: Boolean(row.featured),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}

