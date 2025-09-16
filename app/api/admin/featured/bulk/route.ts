import { NextRequest, NextResponse } from 'next/server'
import { DatabaseProductService } from '@/lib/services/database-product-service'

// POST /api/admin/featured/bulk - Bulk update featured status
export async function POST(request: NextRequest) {
  try {
    const { updates } = await request.json()
    
    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, error: 'Updates must be an array' },
        { status: 400 }
      )
    }

    // Validate each update
    for (const update of updates) {
      if (!update.id || typeof update.featured !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'Each update must have id and featured fields' },
          { status: 400 }
        )
      }
    }

    await DatabaseProductService.bulkUpdateFeatured(updates)
    
    return NextResponse.json({
      success: true,
      message: `Updated featured status for ${updates.length} products`
    })
  } catch (error) {
    console.error('Error bulk updating featured status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to bulk update featured status' },
      { status: 500 }
    )
  }
}

