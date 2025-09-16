import { NextRequest, NextResponse } from 'next/server'
import { DatabaseProductService } from '@/lib/services/database-product-service'
import type { Product } from '@/lib/types/product'

// GET /api/admin/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const inStock = searchParams.get('inStock')

    const filters: any = {}
    if (category) filters.category = category
    if (featured !== null) filters.featured = featured === 'true'
    if (search) filters.search = search
    if (inStock !== null) filters.inStock = inStock === 'true'

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

