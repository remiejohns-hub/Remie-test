"use client"

import React, { useState, useMemo, useCallback } from "react"
import { ProductCard } from "./product-card-optimized"
import { ProductFilters } from "./product-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Grid3X3, List, Grid, Filter, Search } from "lucide-react"
import { useApp } from "@/lib/context/app-context-optimized"
import { ProductService } from "@/lib/services/product-service"
import type { Product } from "@/lib/types/product"
import { cn } from "@/lib/utils"

interface ProductsGridProps {
  products: Product[]
  loading?: boolean
  showFilters?: boolean
  showSorting?: boolean
  showViewToggle?: boolean
  className?: string
  onSearch?: (searchTerm: string) => void
  searchTerm?: string
}

const ProductsGrid = React.memo(function ProductsGrid({
  products,
  loading = false,
  showFilters = true,
  showSorting = true,
  showViewToggle = true,
  className,
  onSearch,
  searchTerm = ""
}: ProductsGridProps) {
  const { state } = useApp()
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid")
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "top-sales" | "price-low">("popular")

  const sortedProducts = useMemo(() => {
    return ProductService.sortProducts(products, sortBy)
  }, [products, sortBy])

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value as any)
  }, [])

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      e.preventDefault()
      onSearch(e.currentTarget.value)
    }
  }, [onSearch])

  const sortButtons = useMemo(() => [
    { key: "popular", label: "Popular" },
    { key: "newest", label: "Latest" },
    { key: "top-sales", label: "Top Sales" },
    { key: "price-low", label: "Price" }
  ], [])

  const viewModeButtons = useMemo(() => [
    { key: "grid", icon: Grid, label: "Grid view" },
    { key: "list", icon: List, label: "List view" },
    { key: "compact", icon: Grid3X3, label: "Compact view" }
  ], [])

  if (loading) {
    return <ProductsGridSkeleton viewMode={viewMode} />
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
          <Filter className="h-12 w-12 text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
        <p className="text-muted mb-4">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Reset Filters
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-1">
            {/* Search section with label */}
            <div className="space-y-2 max-w-4xl mx-auto">
              <label htmlFor="product-search" className="block text-base font-medium text-foreground ml-4 mb-2">
                Search Product
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="product-search"
                  placeholder="Search products..."
                  defaultValue=""
                  type="search"
                  onKeyDown={handleSearchKeyDown}
                  className="pl-12 h-12 text-base w-full bg-background border border-input rounded-full shadow-sm placeholder:text-muted-foreground transition-shadow duration-200 hover:shadow-md focus:shadow-lg focus:ring-1 focus:ring-ring focus:outline-none"
                />
              </div>
            </div>
            
            {/* Sort buttons */}
            <div className="flex items-center gap-2 mt-4">
              {sortButtons.map(({ key, label }) => (
                <Button
                  key={key}
                  variant={sortBy === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSortChange(key)}
                  className={cn(
                    "rounded-full px-6",
                    sortBy === key && "bg-black text-white hover:bg-black/90"
                  )}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        {showViewToggle && (
          <div className="flex items-center border rounded-md p-1">
            {viewModeButtons.map(({ key, icon: Icon, label }) => (
              <Button
                key={key}
                variant={viewMode === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(key as any)}
                className="h-8 w-8 p-0"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div
        className={cn(
          "grid gap-6 auto-rows-fr",
          viewMode === "grid" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          viewMode === "list" && "grid-cols-1",
          viewMode === "compact" && "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        )}
      >
        {sortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant={viewMode === "compact" ? "compact" : "default"}
            className={cn(
              "h-full flex flex-col",
              viewMode === "list" ? "flex-row" : "flex-col",
              viewMode === "list" && "col-span-1"
            )}
          />
        ))}
      </div>

      {/* Load More Button (if needed) */}
      {products.length >= 20 && (
        <div className="text-center pt-8">
          <Button variant="outline" size="lg">
            Load More Products
          </Button>
        </div>
      )}
    </div>
  )
})

// Optimized Skeleton Loading Component
const ProductsGridSkeleton = React.memo(function ProductsGridSkeleton({ 
  viewMode 
}: { 
  viewMode: string 
}) {
  const skeletonCount = viewMode === "compact" ? 12 : 6

  const skeletonItems = useMemo(() => 
    Array.from({ length: skeletonCount }, (_, i) => (
      <div key={i} className="space-y-3">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      </div>
    )), [skeletonCount]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>

      <div
        className={cn(
          "grid gap-6",
          viewMode === "grid" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          viewMode === "list" && "grid-cols-1",
          viewMode === "compact" && "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        )}
      >
        {skeletonItems}
      </div>
    </div>
  )
})

// Optimized Main Products Page Component
export function ProductsPage() {
  const { state } = useApp()
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")

  // Ensure state.filters is always defined
  const filters = state?.filters || {}

  React.useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        // Remove artificial delay - load products immediately
        let filteredProducts = ProductService.getProducts(filters)
        
        // Apply search filter if search term exists
        if (searchTerm.trim()) {
          filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        }
        
        setProducts(filteredProducts || [])
      } catch (error) {
        console.error("Error loading products:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [filters, searchTerm])

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <ProductFilters />
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          <ProductsGrid
            products={products}
            loading={loading}
            showFilters={false}
            showSorting={true}
            showViewToggle={true}
            onSearch={handleSearch}
            searchTerm={searchTerm}
          />
        </main>
      </div>
    </div>
  )
}

export { ProductsGrid }