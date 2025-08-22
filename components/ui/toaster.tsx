"use client"

import { useToast } from "@/hooks/use-toast"
import { CheckCircle, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useRouter } from "next/navigation"
import { useEffect, startTransition } from "react"

export function Toaster() {
  const { toasts } = useToast()
  const router = useRouter()

  // Prefetch high-traffic routes to make navigation instant from toast actions
  useEffect(() => {
    try {
      router.prefetch("/cart")
      router.prefetch("/checkout")
    } catch {}
  }, [router])

  return (
    <ToastProvider duration={2000}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const isCartToast = title?.toString().includes("Cart") || title?.toString().includes("Added")
        
        return (
          <Toast key={id} {...props} variant={isCartToast ? "success" : "default"}>
            <div className="flex items-start space-x-3 w-full">
              {/* Success Icon for cart notifications */}
              {isCartToast && (
                <div className="flex-shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="grid gap-1">
                  {title && <ToastTitle className="text-xs font-semibold">{title}</ToastTitle>}
                  {description && (
                    <ToastDescription className="text-xs opacity-90">{description}</ToastDescription>
                  )}
                </div>
                
                {/* Action Buttons for cart notifications */}
                {isCartToast && (
                  <div className="mt-2 flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs px-2 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-800"
                      onClick={() => startTransition(() => router.push('/cart'))}
                    >
                      <ShoppingCart className="mr-1 h-3 w-3" />
                      View Cart
                    </Button>
                    <Button
                      size="sm"
                      className="h-6 text-xs px-2 bg-[#0066cc] text-white hover:bg-[#0066cc]/90 dark:bg-[#0066cc] dark:hover:bg-[#0066cc]/90"
                      onClick={() => startTransition(() => router.push('/checkout'))}
                    >
                      Checkout
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
