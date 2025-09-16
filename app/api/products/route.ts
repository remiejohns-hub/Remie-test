import { NextRequest, NextResponse } from 'next/server'
import { DatabaseProductService } from '@/lib/services/database-product-service'
import type { Product, ProductFilters } from '@/lib/types/product'

// GET /api/products - Get all products with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Build filters from query parameters
    const filters: ProductFilters = {}
    
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const inStock = searchParams.get('inStock')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const tags = searchParams.get('tags')

    if (category) filters.category = category
    if (subcategory) filters.subcategory = subcategory
    if (featured !== null) filters.featured = featured === 'true'
    if (search) filters.search = search
    if (inStock !== null) filters.inStock = inStock === 'true'
    if (minPrice) filters.minPrice = parseFloat(minPrice)
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice)
    if (tags) filters.tags = tags.split(',')

    const products = await DatabaseProductService.getProducts(filters)
    
    return NextResponse.json({
      success: true,
      data: products,
      count: products.length
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
