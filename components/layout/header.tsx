"use client"

import Link from "next/link"
import { ShoppingCart, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/hooks/use-cart"
import { ClientOnly } from "@/components/ui/client-only"
import { useState } from "react"

export function Header() {
  const { cart } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="ShopHub home" title="ShopHub - Home" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-black text-lg">S</span>
            </div>
            <span className="font-serif font-black text-xl text-foreground">ShopHub</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
            <Link 
              href="/products" 
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              aria-current={typeof window !== 'undefined' && window.location.pathname === '/products' ? 'page' : undefined}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              aria-current={typeof window !== 'undefined' && window.location.pathname === '/categories' ? 'page' : undefined}
            >
              Categories
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              aria-current={typeof window !== 'undefined' && window.location.pathname === '/about' ? 'page' : undefined}
            >
              About
            </Link>
          </nav>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden">
              <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4" role="navigation" aria-label="Mobile navigation">
                <Link 
                  href="/products" 
                  className="text-sm font-medium text-foreground hover:text-accent transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  href="/categories"
                  className="text-sm font-medium text-foreground hover:text-accent transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link 
                  href="/about" 
                  className="text-sm font-medium text-foreground hover:text-accent transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
              </nav>
            </div>
          )}
          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="h-5 w-5" />
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <ClientOnly fallback={null}>
                  {cart.itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground">
                      {cart.itemCount}
                    </Badge>
                  )}
                </ClientOnly>
              </Button>
            </Link>

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
