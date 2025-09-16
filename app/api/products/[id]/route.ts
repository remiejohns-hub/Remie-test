import { NextRequest, NextResponse } from 'next/server'
import { DatabaseProductService } from '@/lib/services/database-product-service'

// In-memory cache for individual products
const productCache = new Map<string, { data: any; timestamp: number; etag: string }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes (longer for individual products)

// Generate ETag for caching
function generateETag(data: any): string {
  return Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16)
}

// Check if cache is valid
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION
}

// GET /api/products/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()
  const productId = params.id
  
  // Validate product ID
  if (!productId || productId.trim() === '') {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Product ID is required',
        timestamp: new Date().toISOString()
      },
      { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache',
          'X-Response-Time': `${Date.now() - startTime}ms`
        }
      }
    )
  }
  
  try {
    // Check cache first
    const cached = productCache.get(productId)
    
    if (cached && isCacheValid(cached.timestamp)) {
      const ifNoneMatch = request.headers.get('if-none-match')
      
      if (ifNoneMatch === cached.etag) {
        return new NextResponse(null, { status: 304 })
      }
      
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
          'ETag': cached.etag,
          'X-Cache': 'HIT',
          'X-Response-Time': `${Date.now() - startTime}ms`
        }
      })
    }

    // Fetch product from database
    const product = await DatabaseProductService.getProductById(productId)
    
    if (!product) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product not found',
          productId,
          timestamp: new Date().toISOString()
        },
        { 
          status: 404,
          headers: {
            'Cache-Control': 'public, s-maxage=60', // Cache 404s for 1 minute
            'X-Response-Time': `${Date.now() - startTime}ms`
          }
        }
      )
    }
    
    // Get related products (same category, excluding current product)
    const relatedProducts = await DatabaseProductService.getProducts({
      category: product.category,
      featured: false // Don't limit to featured for related products
    })
    
    const filteredRelated = relatedProducts
      .filter(p => p.id !== productId)
      .slice(0, 4) // Limit to 4 related products
    
    const responseData = {
      success: true,
      data: {
        ...product,
        relatedProducts: filteredRelated
      },
      metadata: {
        cached: false,
        responseTime: Date.now() - startTime,
        relatedCount: filteredRelated.length
      }
    }
    
    const etag = generateETag(responseData)
    
    // Cache the response
    productCache.set(productId, {
      data: responseData,
      timestamp: Date.now(),
      etag
    })
    
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        'ETag': etag,
        'X-Cache': 'MISS',
        'X-Response-Time': `${Date.now() - startTime}ms`
      }
    })
    
  } catch (error) {
    console.error('Error fetching product:', error)
    
    // Return more specific error information in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error instanceof Error ? error.message : 'Unknown error'
      : 'Failed to fetch product'
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        productId,
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

// Clear individual product cache
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = params.id
  
  if (productCache.has(productId)) {
    productCache.delete(productId)
    return NextResponse.json({ 
      success: true, 
      message: `Cache cleared for product ${productId}` 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: `No cache found for product ${productId}` 
  }, { status: 404 })
}
