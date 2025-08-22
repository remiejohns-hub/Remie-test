"use client"

import React, { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useProduct } from "@/lib/hooks/use-products"
import { useCart } from "@/lib/hooks/use-cart"

interface ProductDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = React.use(params)
  const { product, relatedProducts, loading } = useProduct(id)
  const { addToCart, isInCart, getItemQuantity, updateQuantity } = useCart()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

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

  const handleAddToCart = () => {
    addToCart(product, quantity)
  }

  const currentQuantity = getItemQuantity(product.id)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-card py-4">
          <div className="container mx-auto px-4">
            <nav className="text-sm text-muted">
              <Link href="/" className="hover:text-accent">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href="/products" className="hover:text-accent">
                Products
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-muted/20 rounded-lg overflow-hidden">
                <img
                  src={product.images[selectedImageIndex] || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                      selectedImageIndex === index ? "border-accent" : "border-border"
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

              <div className="flex items-center gap-4">
                <span className="font-serif font-black text-3xl text-foreground">${product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-muted line-through text-xl">${product.originalPrice}</span>
                    <Badge className="bg-accent text-accent-foreground">
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </Badge>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Separator />

              {/* Add to Cart Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-muted">
                      -
                    </button>
                    <span className="px-4 py-2 border-x">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      className="px-3 py-2 hover:bg-muted"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-muted">
                    {product.stockQuantity} available
                    {product.stockQuantity < 10 && <span className="text-destructive ml-1">(Low stock!)</span>}
                  </span>
                </div>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {!product.inStock ? "Out of Stock" : "Add to Cart"}
                  </Button>
                  <Button size="lg" variant="outline">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                {currentQuantity > 0 && (
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <p className="text-sm text-accent font-medium">
                      {currentQuantity} item{currentQuantity !== 1 ? "s" : ""} in your cart
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium text-sm">Free Shipping</p>
                    <p className="text-xs text-muted">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium text-sm">Secure Payment</p>
                    <p className="text-xs text-muted">100% protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-5 w-5 text-accent" />
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
                  <Card key={relatedProduct.id} className="group hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-0">
                      <Link href={`/products/${relatedProduct.id}`}>
                        <div className="aspect-square bg-muted/20 rounded-t-lg mb-4 overflow-hidden cursor-pointer">
                          <img
                            src={relatedProduct.images[0] || "/placeholder.svg"}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link href={`/products/${relatedProduct.id}`}>
                          <h3 className="font-serif font-semibold text-foreground mb-2 hover:text-accent transition-colors cursor-pointer">
                            {relatedProduct.name}
                          </h3>
                        </Link>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">${relatedProduct.price}</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm text-muted">{relatedProduct.rating}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
