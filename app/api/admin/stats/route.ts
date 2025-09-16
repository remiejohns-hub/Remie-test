import { NextRequest, NextResponse } from 'next/server'
import { DatabaseProductService } from '@/lib/services/database-product-service'

// GET /api/admin/stats - Get product statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await DatabaseProductService.getProductStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

