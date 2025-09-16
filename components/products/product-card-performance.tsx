'use client'

import { memo, useCallback, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { Icon } from '@/components/ui/icon'
import { useApp } from '@/lib/context/app-context-optimized'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types/product'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'featured'
  showActions?: boolean
  className?: string
  priority?: boolean
}

export const ProductCard = memo<ProductCardProps>(({
  product,
  variant = 'default',
  showActions = true,
  className,
  priority = false,
}) => {
  const { addToCart, toggleWishlist, isInWishlist, isInCart } = useApp()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAddingToCart) return
    
    setIsAddingToCart(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 200)) // Simulate API call
      addToCart(product, 1)
    } finally {
      setIsAddingToCart(false)
    }
  }, [addToCart, product, isAddingToCart])

  const handleToggleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
  }, [toggleWishlist, product.id])

  const isWishlisted = isInWishlist(product.id)
  const inCart = isInCart(product.id)
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const cardClasses = cn(
    'group relative overflow-hidden transition-all duration-300 hover:shadow-lg',
    variant === 'compact' && 'h-auto',
    variant === 'featured' && 'border-2 border-primary/20',
    className
  )

  const imageSize = variant === 'compact' ? { width: 200, height: 200 } : { width: 300, height: 300 }

  return (
    <Card className={cardClasses}>
      <Link href={`/products/${product.id}`} className="block">
        <CardContent className="p-0 relative">
          {/* Discount Badge */}
          {hasDiscount && (
            <Badge 
              className="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground"
              variant="destructive"
            >
              -{discountPercentage}%
            </Badge>
          )}

          {/* Wishlist Button */}
          {showActions && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity',
                'bg-background/80 backdrop-blur-sm hover:bg-background',
                isWishlisted && 'opacity-100 text-destructive'
              )}
              onClick={handleToggleWishlist}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Icon 
                name="heart" 
                className={cn('h-4 w-4', isWishlisted && 'fill-current')} 
              />
            </Button>
          )}

          {/* Product Image */}
          <div className="aspect-square relative overflow-hidden">
            <OptimizedImage
              src={imageError ? '/placeholder.svg' : product.images[0]}
              alt={product.name}
              fill
              className="group-hover:scale-105 transition-transform duration-300"
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-2">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon
                      key={i}
                      name="star"
                      className={cn(
                        'h-3 w-3',
                        i < Math.floor(product.rating!)
                          ? 'text-yellow-400 fill-current'
                          : 'text-muted-foreground'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount || 0})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">
                ${product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.originalPrice!.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            {!product.inStock && (
              <Badge variant="secondary" className="text-xs">
                Out of Stock
              </Badge>
            )}
          </div>
        </CardContent>

        {/* Actions */}
        {showActions && (
          <CardFooter className="p-4 pt-0">
            <Button
              className={cn(
                'w-full transition-all duration-200',
                inCart && 'bg-green-600 hover:bg-green-700'
              )}
              disabled={!product.inStock || isAddingToCart}
              onClick={handleAddToCart}
            >
              {isAddingToCart ? (
                <>
                  <Icon name="loader" className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : inCart ? (
                <>
                  <Icon name="shopping-cart" className="mr-2 h-4 w-4" />
                  In Cart
                </>
              ) : (
                <>
                  <Icon name="shopping-cart" className="mr-2 h-4 w-4" />
                  Add to Cart
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Link>
    </Card>
  )
})

ProductCard.displayName = 'ProductCard'