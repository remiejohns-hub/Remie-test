"use client"

import * as React from "react"
import { CheckCircle, ShoppingCart, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, startTransition } from "react"

interface CartToastProps {
  title: string
  description: string
  onClose?: () => void
  className?: string
}

export function CartToast({ title, description, onClose, className }: CartToastProps) {
  const router = useRouter()

  // Prefetch cart and checkout so clicking buttons is instant
  useEffect(() => {
    try {
      router.prefetch("/cart")
      router.prefetch("/checkout")
    } catch {}
  }, [router])

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full max-w-md items-start space-x-3 overflow-hidden rounded-lg border border-green-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm transition-all duration-300 dark:border-green-800 dark:bg-green-900/95",
        "animate-in slide-in-from-right-full",
        className
      )}
    >
      {/* Success Icon */}
      <div className="flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800 dark:text-green-100">
              {title}
            </p>
            <p className="mt-1 text-sm text-green-700 dark:text-green-200">
              {description}
            </p>
          </div>
          
          {/* Close Button */}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-2 h-6 w-6 p-0 text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-800"
            onClick={() => startTransition(() => router.push('/cart'))}
          >
            <ShoppingCart className="mr-1 h-3 w-3" />
            View Cart
          </Button>
          <Button
            size="sm"
            className="h-8 bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            onClick={() => startTransition(() => router.push('/checkout'))}
          >
            Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}