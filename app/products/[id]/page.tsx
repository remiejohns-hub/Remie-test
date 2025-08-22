"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/layout/header-optimized"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useProduct } from "@/lib/hooks/use-products-optimized"
import { useApp } from "@/lib/context/app-context-optimized"
import { cn } from "@/lib/utils"
import { AddToCartDialog } from "@/components/products/add-to-cart-dialog"
import { ProductCard } from "@/components/products/product-card-optimized"
import { useToast } from "@/hooks/use-toast"

interface ProductDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = React.use(params)
  const { product, relatedProducts, loading } = useProduct(id)
  const { state, addToCart, getCartItemQuantity, updateCartQuantity } = useApp()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddToCartOpen, setIsAddToCartOpen] = useState(false)
  const [currentQuantity, setCurrentQuantity] = useState(0)

  useEffect(() => {
    if (product) {
      setCurrentQuantity(getCartItemQuantity(product.id));
    }
  }, [product, getCartItemQuantity, state.cart.items]);

  const handleConfirmAddToCart = () => {
    if (!product) return;
    
    const currentQuantity = getCartItemQuantity(product.id);
    if (currentQuantity > 0) {
      updateCartQuantity(product.id, currentQuantity + quantity)
      toast({
        title: "Cart Updated!",
        description: `${product.name} quantity updated to ${currentQuantity + quantity}`,
      })
    } else {
      addToCart(product, quantity)
      toast({
        title: "Added to Cart!",
        description: `${quantity} ${quantity === 1 ? 'item' : 'items'} of ${product.name} added to your cart`,
      })
    }
    setIsAddToCartOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                <div className="aspect-square bg-muted/20 rounded-lg"></div>
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-muted/20 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-muted/20 rounded w-3/4"></div>
                <div className="h-4 bg-muted/20 rounded w-1/2"></div>
                <div className="h-20 bg-muted/20 rounded"></div>
                <div className="h-12 bg-muted/20 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="font-serif font-black text-2xl text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button>Browse All Products</Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }


  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Back Button and Breadcrumb */}
        <div className="bg-card py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.history.back()}
                className="mr-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                <span className="ml-2">Back</span>
              </Button>
            </div>
            <nav className="text-sm text-muted">
              <Link href="/" className="hover:text-[#0066cc]">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href="/products" className="hover:text-[#0066cc]">
                Products
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="container max-w-6xl mx-auto px-4 py-8">
          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="max-w-2xl mx-auto aspect-square bg-muted/20 rounded-lg overflow-hidden">
                <img
                  src={product.images[selectedImageIndex] || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                      selectedImageIndex === index ? "border-[#0066cc]" : "border-border"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className={`h-5 w-5 ${
                          j < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted">({product.reviewCount} reviews)</span>
                </div>
                <h1 className="font-serif font-black text-3xl text-foreground mb-4">{product.name}</h1>
                <p className="text-muted leading-relaxed">{product.description}</p>
              </div>

              <div className="flex items-baseline gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-foreground">${product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-base text-muted-foreground line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.originalPrice && (
                  <Badge variant="secondary" className="ml-2 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{product.reviewCount} reviews</span>
                {product.tags.length > 0 && (
                  <>
                    <span className="text-sm text-muted-foreground">•</span>
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </>
                )}
              </div>

              <Separator />

              {/* Add to Cart Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-2 hover:bg-muted"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-6 py-2 border-x text-center min-w-[4rem]">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      disabled={quantity >= product.stockQuantity}
                      className="px-3 py-2 hover:bg-muted"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted">
                    {product.stockQuantity} available
                    {product.stockQuantity < 10 && <span className="text-destructive ml-1">(Low stock!)</span>}
                  </span>
                </div>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    className="flex-1 bg-[#0066cc] text-white hover:bg-[#0066cc]/90"
                    onClick={() => setIsAddToCartOpen(true)}
                    disabled={!product.inStock || quantity <= 0}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {!product.inStock 
                      ? "Out of Stock" 
                      : "Add to Cart"
                    }
                  </Button>
                  <Button size="lg" variant="outline">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Add to Cart Dialog */}
                <AddToCartDialog
                  product={product}
                  quantity={quantity}
                  isOpen={isAddToCartOpen}
                  onClose={() => setIsAddToCartOpen(false)}
                  onConfirm={handleConfirmAddToCart}
                  onQuantityChange={setQuantity}
                  currentQuantity={currentQuantity}
                />
              </div>

              <Separator />

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-[#0066cc]" />
                  <div>
                    <p className="font-medium text-sm">Free Shipping</p>
                    <p className="text-xs text-muted">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[#0066cc]" />
                  <div>
                    <p className="font-medium text-sm">Secure Payment</p>
                    <p className="text-xs text-muted">100% protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-5 w-5 text-[#0066cc]" />
                  <div>
                    <p className="font-medium text-sm">Easy Returns</p>
                    <p className="text-xs text-muted">30-day policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section>
              <h2 className="font-serif font-black text-2xl text-foreground mb-6">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
