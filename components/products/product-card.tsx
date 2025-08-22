"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Star, Eye, Share2 } from "lucide-react"
import { useApp } from "@/lib/context/app-context"
import type { Product } from "@/lib/types/product"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact" | "featured"
  showActions?: boolean
  className?: string
}

export function ProductCard({ 
  product, 
  variant = "default", 
  showActions = true,
  className 
}: ProductCardProps) {
  const { addToCart, isInCart, addToWishlist, removeFromWishlist, isInWishlist, addRecentlyViewed } = useApp()
  const [imageIndex, setImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product.id)
    }
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addRecentlyViewed(product.id)
    // TODO: Implement quick view modal
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: `/products/${product.id}`,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${product.name} - ${window.location.origin}/products/${product.id}`)
    }
  }

  const isCompact = variant === "compact"
  const isFeatured = variant === "featured"

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        isFeatured && "ring-2 ring-accent/20",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`} className="block h-full">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Image Section */}
          <div className="relative aspect-square overflow-hidden bg-muted/20 flex-shrink-0">
            <Image
              src={product.images[imageIndex] || "/placeholder.svg"}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-transform duration-500",
                isHovered && "scale-105"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={isFeatured}
            />
            
            {/* Image Navigation Dots */}
            {product.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === imageIndex 
                        ? "bg-white scale-125" 
                        : "bg-white/50 hover:bg-white/75"
                    )}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setImageIndex(index)
                    }}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Quick Actions Overlay */}
            {showActions && isHovered && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-10 w-10 p-0 rounded-full bg-white/90 hover:bg-white"
                  onClick={handleQuickView}
                  aria-label="Quick view"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-10 w-10 p-0 rounded-full bg-white/90 hover:bg-white"
                  onClick={handleShare}
                  aria-label="Share product"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Sale Badge */}
            {product.originalPrice && product.originalPrice > product.price && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 left-2 bg-red-500 text-white hover:bg-red-600"
              >
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </Badge>
            )}

            {/* Stock Status */}
            {!product.inStock && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 bg-gray-500 text-white"
              >
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Content Section */}
          <div className={cn("p-4 flex-1 flex flex-col", isCompact && "p-3")}>
            {/* Category */}
            {!isCompact && (
              <Badge variant="outline" className="mb-2 text-xs">
                {product.category}
              </Badge>
            )}

            {/* Title */}
            <h3 className={cn(
              "font-semibold text-foreground mb-2 line-clamp-2",
              isCompact ? "text-sm" : "text-lg",
              isFeatured && "text-xl"
            )}>
              {product.name}
            </h3>

            {/* Description */}
            {!isCompact && (
              <p className="text-muted text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < Math.floor(product.rating) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-muted/30"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted">
                ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 mb-4">
              <span className={cn(
                "font-bold text-foreground",
                isCompact ? "text-base" : "text-xl"
              )}>
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-muted line-through text-sm">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-2 mt-auto pt-4">
                <Button
                  size={isCompact ? "sm" : "default"}
                  className={cn(
                    "flex-1",
                    isInCart(product.id) 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-accent text-accent-foreground hover:bg-accent/90"
                  )}
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isInCart(product.id)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isInCart(product.id) ? "Added" : "Add to Cart"}
                </Button>
                
                <Button
                  size={isCompact ? "sm" : "default"}
                  variant="outline"
                  className={cn(
                    "h-10 w-10 p-0",
                    isInWishlist(product.id) && "bg-red-50 border-red-200 text-red-600"
                  )}
                  onClick={handleWishlistToggle}
                  aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart 
                    className={cn(
                      "h-4 w-4",
                      isInWishlist(product.id) && "fill-current"
                    )} 
                  />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
