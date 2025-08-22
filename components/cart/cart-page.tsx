"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useApp } from "@/lib/context/app-context"
import { cn } from "@/lib/utils"

export function CartPage() {
  const { state, updateCartQuantity, removeFromCart, clearCart } = useApp()
  const { cart } = state

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateCartQuantity(productId, newQuantity)
    }
  }

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId)
  }

  const handleClearCart = () => {
    clearCart()
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted mb-8">
            Looks like you haven't added any products to your cart yet. Start shopping to fill it up!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Start Shopping
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg">
                Continue Browsing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/products">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
        <Separator orientation="vertical" className="h-6" />
        <h1 className="text-2xl font-bold text-foreground">Shopping Cart</h1>
        <Badge variant="secondary" className="ml-auto">
          {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.product.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Product Image */}
                  <div className="w-24 h-24 md:w-32 md:h-32 relative flex-shrink-0">
                    <Image
                      src={item.product.images[0] || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 96px, 128px"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground line-clamp-2">
                            {item.product.name}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="text-muted hover:text-destructive h-8 w-8 p-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {item.product.category}
                          </Badge>
                          {!item.product.inStock && (
                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                              Out of Stock
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 p-0 hover:bg-muted"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value)
                                if (!isNaN(value) && value > 0) {
                                  handleQuantityChange(item.product.id, value)
                                }
                              }}
                              className="w-16 h-8 text-center border-0 focus:ring-0"
                              min="1"
                              max={item.product.stockQuantity}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stockQuantity}
                              className="h-8 w-8 p-0 hover:bg-muted"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="text-sm text-muted">
                            Stock: {item.product.stockQuantity}
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </div>
                        {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                          <div className="text-sm text-muted line-through">
                            ${(item.product.originalPrice * item.quantity).toFixed(2)}
                          </div>
                        )}
                        <div className="text-sm text-muted">
                          ${item.product.price.toFixed(2)} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Cart Actions */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handleClearCart}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Clear Cart
            </Button>
            <Link href="/products">
              <Button variant="outline">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary Items */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className={cart.total >= 50 ? "text-green-600" : "text-muted"}>
                    {cart.total >= 50 ? "Free" : "$5.99"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${(cart.total * 0.08).toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>${(cart.total + (cart.total >= 50 ? 0 : 5.99) + (cart.total * 0.08)).toFixed(2)}</span>
              </div>

              {/* Free Shipping Notice */}
              {cart.total < 50 && (
                <div className="text-sm text-muted text-center p-3 bg-muted/20 rounded-md">
                  Add ${(50 - cart.total).toFixed(2)} more for free shipping!
                </div>
              )}

              {/* Checkout Button */}
              <Link href="/checkout" className="block">
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>
              </Link>

              {/* Security Notice */}
              <div className="text-xs text-muted text-center">
                🔒 Secure checkout powered by Stripe
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
