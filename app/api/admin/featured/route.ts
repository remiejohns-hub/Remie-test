import { NextRequest, NextResponse } from 'next/server'
import { DatabaseProductService } from '@/lib/services/database-product-service'

// GET /api/admin/featured - Get featured products
export async function GET(request: NextRequest) {
  try {
    const featuredProducts = await DatabaseProductService.getFeaturedProducts()
    
    return NextResponse.json({
      success: true,
      data: featuredProducts,
      count: featuredProducts.length
    })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured products' },
      { status: 500 }
    )
  }
}

// POST /api/admin/featured - Set featured status for a product
export async function POST(request: NextRequest) {
  try {
    const { productId, featured } = await request.json()
    
    if (!productId || typeof featured !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: productId, featured' },
        { status: 400 }
      )
    }

    await DatabaseProductService.updateFeaturedStatus(productId, featured)
    
    return NextResponse.json({
      success: true,
      message: `Product ${featured ? 'added to' : 'removed from'} featured products`
    })
  } catch (error) {
    console.error('Error updating featured status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update featured status' },
      { status: 500 }
    )
  }
}

