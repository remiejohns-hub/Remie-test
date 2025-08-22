"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Plus, Minus } from "lucide-react"
import Link from "next/link"
import type { CartItem } from "@/lib/types/product"

interface CartItemComponentProps {
  item: CartItem
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemComponentProps) {
  return (
    <Card>
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
                onClick={() => onRemove(item.product.id)}
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
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    className="px-3 py-1 hover:bg-muted transition-colors"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-1 border-x min-w-[3rem] text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
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
                <p className="font-semibold text-foreground">${(item.product.price * item.quantity).toFixed(2)}</p>
                <p className="text-sm text-muted">${item.product.price} each</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
