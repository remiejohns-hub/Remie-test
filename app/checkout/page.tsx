"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header-optimized"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/lib/context/app-context-optimized"
import { useRouter } from "next/navigation"
import { CheckoutModal } from "@/components/checkout/checkout-modal"

export default function CheckoutPage() {
  const { cart } = useCart()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Open modal immediately if cart has items
  useEffect(() => {
    if (cart.items.length > 0) {
      setIsModalOpen(true)
    }
  }, [cart.items.length])

  // Redirect to products if cart is empty
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted" />
            </div>
            <h1 className="font-serif font-black text-2xl text-foreground mb-4">Your Cart is Empty</h1>
            <p className="text-muted mb-8">Add some items to your cart before checking out.</p>
            <Link href="/products">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Start Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open)
    if (!open) {
      // Redirect to cart or products when modal is closed
      router.push('/cart')
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Link href="/cart">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cart
                </Button>
              </Link>
            </div>
            
            <h1 className="font-serif font-black text-3xl text-foreground mb-4">Checkout</h1>
            <p className="text-muted text-lg mb-8">
              Complete your purchase in our secure checkout modal.
            </p>
            
            <Button 
              size="lg" 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Open Checkout
            </Button>
          </div>
        </main>
        <Footer />
      </div>

      <CheckoutModal 
        open={isModalOpen} 
        onOpenChange={handleModalClose}
      />
    </>
  )
}
