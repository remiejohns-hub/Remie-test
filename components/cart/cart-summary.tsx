"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import type { Cart } from "@/lib/types/product"

interface CartSummaryProps {
  cart: Cart
}

export function CartSummary({ cart }: CartSummaryProps) {
  const subtotal = cart.total
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  return (
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
  )
}
