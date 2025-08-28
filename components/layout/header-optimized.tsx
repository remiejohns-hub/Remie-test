"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/context/app-context-optimized"
import { ClientOnly } from "@/components/ui/client-only"
import { CartDropdown } from "@/components/layout/cart-dropdown"
import { cn } from "@/lib/utils"
import { useState, useCallback, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"

const navigationItems = [
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" }
] as const

export function Header() {
  const { cart } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Prefetch cart/checkout to make navigation instant
  useEffect(() => {
    try {
      router.prefetch("/cart")
      router.prefetch("/checkout")
    } catch {}
  }, [router])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  // Memoize navigation links to prevent unnecessary re-renders
  const desktopNavigation = useMemo(() => (
    <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
      {navigationItems.map(({ href, label }) => (
        <Link 
          key={href}
          href={href} 
          className={cn(
            "text-sm font-medium transition-colors",
            pathname === href
              ? "text-[#0066cc] font-semibold"
              : "text-foreground hover:text-[#0066cc]"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  ), [pathname])

  const mobileNavigation = useMemo(() => (
    isMobileMenuOpen && (
      <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden">
        <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4" role="navigation" aria-label="Mobile navigation">
          {navigationItems.map(({ href, label }) => (
            <Link 
              key={href}
              href={href} 
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === href
                  ? "text-accent font-semibold"
                  : "text-foreground hover:text-accent"
              )}
              onClick={closeMobileMenu}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    )
  ), [isMobileMenuOpen, pathname, closeMobileMenu])

  // Cart dropdown component wrapped in ClientOnly for better SSR
  const cartComponent = useMemo(() => (
    <ClientOnly fallback={
      <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 transition-colors">
        <div className="h-5 w-5" />
      </Button>
    }>
      <CartDropdown />
    </ClientOnly>
  ), [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            aria-label="POS Digital home" 
            title="POS Digital - Home" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-lg bg-[#0066cc] flex items-center justify-center">
              <span className="text-white font-serif font-black text-lg">P</span>
            </div>
            <span className="font-serif font-black text-xl text-foreground">POS Digital</span>
          </Link>

          {/* Desktop Navigation */}
          {desktopNavigation}
          
          {/* Mobile Navigation */}
          {mobileNavigation}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex hover:bg-muted/50 transition-colors"
              aria-label="User account"
            >
              <User className="h-5 w-5" />
            </Button>

            {cartComponent}

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden hover:bg-muted/50 transition-colors"
              onClick={toggleMobileMenu}
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