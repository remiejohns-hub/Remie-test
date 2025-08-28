"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ShoppingCart, CreditCard, Eye, Trash2 } from "lucide-react"
import { useCart } from "@/lib/context/app-context-optimized"
import { CheckoutModal } from "@/components/checkout/checkout-modal"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function CartDropdown() {
  const { cart, removeFromCart } = useCart()
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const subtotal = cart.total
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleCheckoutClick = () => {
    setIsDropdownOpen(false)
    setIsCheckoutModalOpen(true)
  }

  const handleViewCartClick = () => {
    setIsDropdownOpen(false)
  }

  if (cart.items.length === 0) {
    return (
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-muted/50 transition-colors"
            aria-label="Shopping cart (empty)"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-4">
          <div className="text-center py-6">
            <ShoppingCart className="h-12 w-12 text-muted mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-1">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-4">Add some products to get started</p>
            <Link href="/products" onClick={handleViewCartClick}>
              <Button size="sm" className="w-full">
                Start Shopping
              </Button>
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-muted/50 transition-colors"
            aria-label={`Shopping cart with ${cart.itemCount} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
              {cart.itemCount}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96 p-0">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Shopping Cart</h3>
              <Badge variant="secondary">
                {cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.items.slice(0, 3).map((item) => (
                <div key={item.product.id} className="flex gap-3 p-2 hover:bg-muted/30 rounded-lg transition-colors">
                  <div className="w-12 h-12 bg-muted/20 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.images[0] || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium text-foreground">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFromCart(item.product.id)
                    }}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {cart.items.length > 3 && (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">
                    And {cart.items.length - 3} more item{cart.items.length - 3 !== 1 ? "s" : ""}...
                  </p>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">
                  {shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Link href="/cart" className="flex-1" onClick={handleViewCartClick}>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Cart
                </Button>
              </Link>
              <Button 
                size="sm" 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleCheckoutClick}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Checkout
              </Button>
            </div>

            {subtotal < 50 && (
              <div className="mt-3 p-2 bg-accent/10 rounded-lg">
                <p className="text-xs text-accent text-center">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </p>
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <CheckoutModal 
        open={isCheckoutModalOpen} 
        onOpenChange={setIsCheckoutModalOpen}
      />
    </>
  )
}

