"use client"

import { Header } from "@/components/layout/header-optimized"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Truck, Shield, Headphones, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useFeaturedProducts } from "@/lib/hooks/use-products-optimized"
import { ProductCard } from "@/components/products/product-card-optimized"
import { useApp } from "@/lib/context/app-context-optimized"
import { ClientOnly } from "@/components/ui/client-only"
import { Suspense, useMemo } from "react"

// Memoized feature items to prevent re-creation on every render
const featureItems = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free shipping on orders over $50. Fast and reliable delivery.",
    bgColor: "bg-[#0066cc]/10",
    hoverColor: "group-hover:bg-[#0066cc]/20",
    iconColor: "text-[#0066cc]"
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "Your payment information is safe and secure with us.",
    bgColor: "bg-accent/10",
    hoverColor: "group-hover:bg-accent/20",
    iconColor: "text-accent"
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Get help whenever you need it with our customer support.",
    bgColor: "bg-accent/10",
    hoverColor: "group-hover:bg-accent/20",
    iconColor: "text-accent"
  }
] as const

const categoryItems = [
  { name: "Electronics", icon: "📱", href: "/products?category=electronics", description: "Latest gadgets and tech" },
  { name: "Clothing", icon: "👕", href: "/products?category=clothing", description: "Fashion and accessories" },
  { name: "Furniture", icon: "🪑", href: "/products?category=furniture", description: "Home and office furniture" },
  { name: "Lifestyle", icon: "🌟", href: "/products?category=lifestyle", description: "Health and wellness" },
] as const

// Loading skeleton for featured products
function FeaturedProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-0">
            <div className="aspect-square bg-muted/20 rounded-t-lg mb-4"></div>
            <div className="p-6 space-y-3">
              <div className="h-4 bg-muted/20 rounded w-3/4"></div>
              <div className="h-4 bg-muted/20 rounded w-1/2"></div>
              <div className="h-8 bg-muted/20 rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Memoized featured products section
function FeaturedProductsSection() {
  const { products: featuredProducts, loading, error } = useFeaturedProducts()

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Failed to load featured products</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (loading) {
    return <FeaturedProductsSkeleton />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {featuredProducts.slice(0, 3).map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant="featured"
          showActions={true}
        />
      ))}
    </div>
  )
}

// Memoized features section
function FeaturesSection() {
  const features = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {featureItems.map(({ icon: Icon, title, description, bgColor, hoverColor, iconColor }) => (
        <div key={title} className="text-center space-y-4 group">
          <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto ${hoverColor} transition-colors`}>
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </div>
          <h3 className="font-serif font-semibold text-xl text-foreground">{title}</h3>
          <p className="text-muted">{description}</p>
        </div>
      ))}
    </div>
  ), [])

  return features
}

// Memoized categories section
function CategoriesSection() {
  const categories = useMemo(() => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {categoryItems.map((category) => (
        <Link key={category.name} href={category.href}>
          <Card className="group hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{category.icon}</div>
              <h3 className="font-serif font-semibold text-foreground group-hover:text-accent transition-colors mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-muted">{category.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  ), [])

  return categories
}

export default function HomePage() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-serif font-black text-lg">P</span>
                </div>
                <span className="font-serif font-black text-xl text-foreground">POS Digital</span>
              </div>
            </div>
          </div>
        </div>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted">Loading...</p>
          </div>
        </main>
      </div>
    }>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-r from-[#0066cc]/10 to-[#00a0ff]/5 py-20 overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
            <div className="container mx-auto px-4 text-center relative z-10">
              <h1 className="font-serif font-black text-4xl md:text-6xl text-foreground mb-6 leading-tight">
                Discover Amazing
                <span className="block text-[#0066cc]">Products</span>
              </h1>
              <p className="text-muted text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                Shop the latest trends and find everything you need in one place. Quality products, great prices, fast
                delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <Button size="lg" className="bg-[#0066cc] text-white hover:bg-[#0066cc]/90 group">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" size="lg">
                    Browse Categories
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <FeaturesSection />
            </div>
          </section>

          {/* Featured Products Section */}
          <section className="py-16 bg-card">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="font-serif font-black text-3xl md:text-4xl text-foreground mb-4">Featured Products</h2>
                <p className="text-muted text-lg max-w-2xl mx-auto">
                  Discover our handpicked selection of premium products
                </p>
              </div>

              <Suspense fallback={<FeaturedProductsSkeleton />}>
                <FeaturedProductsSection />
              </Suspense>

              <div className="text-center">
                <Link href="/products">
                  <Button size="lg" variant="outline" className="group">
                    View All Products
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Categories Section */}
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="font-serif font-black text-3xl md:text-4xl text-foreground mb-4">Shop by Category</h2>
                <p className="text-muted text-lg max-w-2xl mx-auto">Explore our wide range of product categories</p>
              </div>

              <CategoriesSection />
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="py-16 bg-accent/5">
            <div className="container mx-auto px-4 text-center">
              <h2 className="font-serif font-black text-3xl md:text-4xl text-foreground mb-4">Stay Updated</h2>
              <p className="text-muted text-lg mb-8 max-w-2xl mx-auto">
                Subscribe to our newsletter for exclusive offers, new product alerts, and shopping tips.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Subscribe
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </ClientOnly>
  )
}