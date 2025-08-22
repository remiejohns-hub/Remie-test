"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Star } from "lucide-react"
import { useApp } from "@/lib/context/app-context"
import type { Product } from "@/lib/types/product"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact"
  className?: string
}

export function ProductCard({ 
  product, 
  variant = "default",
  className 
}: ProductCardProps) {
  const { addToCart, isInCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp()
  const { toast } = useToast()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart`,
      variant: "default"
    })
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

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <Link href={`/products/${product.id}`} className="block h-full">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Image Section */}
          <div className="relative aspect-square overflow-hidden bg-muted/20">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Sale Badge */}
            {product.originalPrice && product.originalPrice > product.price && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600"
              >
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </Badge>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Category */}
            <Badge variant="secondary" className="mb-2 text-xs uppercase w-fit bg-gray-100 text-gray-600 hover:bg-gray-100">
              {product.category}
            </Badge>

            {/* Title */}
            <h3 className="font-medium text-foreground mb-3 line-clamp-1">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.floor(product.rating) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-muted/30"
                  )}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">
                ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-base font-semibold">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-auto">
              <Button
                className="flex-1 bg-[#0066cc] hover:bg-[#0066cc]/90 text-white"
                onClick={handleAddToCart}
                disabled={!product.inStock || isInCart(product.id)}
              >
                {isInCart(product.id) ? "Added" : "Add to Cart"}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "border-2",
                  isInWishlist(product.id) && "border-[#0066cc] text-[#0066cc]"
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
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
