"use client"

import { Header } from "@/components/layout/header-optimized"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context-optimized"

export default function CartPage() {
  const { state, updateCartQuantity, removeFromCart, clearCart } = useApp()
  const { cart } = state

  const subtotal = cart.total
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-muted" />
            </div>
            <h1 className="font-serif font-black text-2xl text-foreground mb-4">Your Cart is Empty</h1>
            <p className="text-muted mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link href="/products">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Start Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-card py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/products">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
            <h1 className="font-serif font-black text-3xl text-foreground">Shopping Cart</h1>
            <p className="text-muted">
              {cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""} in your cart
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-serif font-semibold text-xl text-foreground">Cart Items</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>

              {cart.items.map((item) => (
                <Card key={item.product.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="w-full sm:w-24 h-24 bg-muted/20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <Link href={`/products/${item.product.id}`}>
                              <h3 className="font-serif font-semibold text-foreground hover:text-accent transition-colors cursor-pointer">
                                {item.product.name}
                              </h3>
                            </Link>
                            <p className="text-muted text-sm line-clamp-2">{item.product.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-destructive hover:text-destructive self-start"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted">Quantity:</span>
                            <div className="flex items-center border rounded">
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                className="px-3 py-1 hover:bg-muted transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-4 py-1 border-x min-w-[3rem] text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                className="px-3 py-1 hover:bg-muted transition-colors"
                                disabled={item.quantity >= item.product.stockQuantity}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            {item.quantity >= item.product.stockQuantity && (
                              <span className="text-xs text-destructive">Max quantity reached</span>
                            )}
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-muted">${item.product.price} each</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h2 className="font-serif font-semibold text-xl text-foreground mb-6">Order Summary</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted">Subtotal ({cart.itemCount} items)</span>
                      <span className="text-foreground">${subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted">Shipping</span>
                      <span className="text-foreground">
                        {shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted">Tax</span>
                      <span className="text-foreground">${tax.toFixed(2)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                      <span className="font-serif font-semibold text-lg text-foreground">Total</span>
                      <span className="font-serif font-semibold text-lg text-foreground">${total.toFixed(2)}</span>
                    </div>

                    {subtotal < 50 && (
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <p className="text-sm text-accent">Add ${(50 - subtotal).toFixed(2)} more for free shipping!</p>
                      </div>
                    )}

                    <Link href="/checkout" className="block">
                      <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        Proceed to Checkout
                      </Button>
                    </Link>

                    <Link href="/products" className="block">
                      <Button variant="outline" size="lg" className="w-full bg-transparent">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>

                  <Separator className="my-6" />

                  {/* Security Features */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-muted">Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-muted">Free returns within 30 days</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-muted">Customer support available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
