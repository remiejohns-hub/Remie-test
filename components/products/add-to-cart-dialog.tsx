"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Product } from "@/lib/types/product"
import { ShoppingCart, Minus, Plus } from "lucide-react"

interface AddToCartDialogProps {
  product: Product
  quantity: number
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onQuantityChange: (quantity: number) => void
  currentQuantity: number
}

export function AddToCartDialog({
  product,
  quantity,
  isOpen,
  onClose,
  onConfirm,
  onQuantityChange,
  currentQuantity
}: AddToCartDialogProps) {
  const totalPrice = product.price * quantity

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Cart</DialogTitle>
          <DialogDescription>
            Review your selection before adding to cart
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Product Preview */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted/20">
              <img 
                src={product.images[0] || "/placeholder.svg"} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{product.name}</h3>
              <p className="text-sm text-muted-foreground">${product.price}</p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-3 py-2 hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-6 py-2 border-x text-center min-w-[4rem]">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onQuantityChange(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity}
                  className="px-3 py-2 hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {product.stockQuantity} available
              </span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-2 bg-muted/10 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Price per item</span>
              <span>${product.price}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Quantity</span>
              <span>{quantity}</span>
            </div>
            {currentQuantity > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Already in cart</span>
                <span>{currentQuantity}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-[#0066cc] text-white hover:bg-[#0066cc]/90">
            <ShoppingCart className="h-4 w-4 mr-2" />
            {currentQuantity > 0 ? "Update Cart" : "Add to Cart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
