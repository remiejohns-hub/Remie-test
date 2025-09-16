import { NextRequest, NextResponse } from 'next/server'
import { DatabaseProductService } from '@/lib/services/database-product-service'
import type { Product, ProductFilters } from '@/lib/types/product'

// In-memory cache for products
const productCache = new Map<string, { data: any; timestamp: number; etag: string }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Generate ETag for caching
function generateETag(data: any): string {
  return Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16)
}

// Check if cache is valid
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION
}

// GET /api/products - Get all products with optional filtering
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 items per page

    if (category) filters.category = category
    if (subcategory) filters.subcategory = subcategory
    if (featured !== null) filters.featured = featured === 'true'
    if (search) filters.search = search
    if (inStock !== null) filters.inStock = inStock === 'true'
    if (minPrice) filters.minPrice = parseFloat(minPrice)
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice)
    if (tags) filters.tags = tags.split(',')

    // Create cache key from filters
    const cacheKey = JSON.stringify({ ...filters, page, limit })
    const cached = productCache.get(cacheKey)
    
    // Check if we have valid cached data
    if (cached && isCacheValid(cached.timestamp)) {
      const ifNoneMatch = request.headers.get('if-none-match')
      
      if (ifNoneMatch === cached.etag) {
        return new NextResponse(null, { status: 304 })
      }
      
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'ETag': cached.etag,
          'X-Cache': 'HIT',
          'X-Response-Time': `${Date.now() - startTime}ms`
        }
      })
    }

    // Fetch products from database
    const allProducts = await DatabaseProductService.getProducts(filters)
    
    // Implement pagination
    const totalCount = allProducts.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const products = allProducts.slice(startIndex, endIndex)
    
    const responseData = {
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: endIndex < totalCount,
        hasPrev: page > 1
      },
      metadata: {
        cached: false,
        responseTime: Date.now() - startTime
      }
    }
    
    const etag = generateETag(responseData)
    
    // Cache the response
    productCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
      etag
    })
    
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'ETag': etag,
        'X-Cache': 'MISS',
        'X-Response-Time': `${Date.now() - startTime}ms`
      }
    })
    
  } catch (error) {
    console.error('Error fetching products:', error)
    
    // Return more specific error information in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error instanceof Error ? error.message : 'Unknown error'
      : 'Failed to fetch products'
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(7)
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache',
          'X-Response-Time': `${Date.now() - startTime}ms`
        }
      }
    )
  }
}

// Clear cache endpoint (for development/admin use)
export async function DELETE() {
  productCache.clear()
  return NextResponse.json({ success: true, message: 'Cache cleared' })
}
