"use client"

import React, { useState } from "react"
import { ProductCard } from "./product-card"
import { ProductFilters, ActiveFilters } from "./product-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Grid3X3, List, Grid, Filter, Search } from "lucide-react"
import { useApp } from "@/lib/context/app-context"
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

export function ProductsGrid({
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

  const sortedProducts = React.useMemo(() => {
    return ProductService.sortProducts(products, sortBy)
  }, [products, sortBy])

  const handleSortChange = (value: string) => {
    setSortBy(value as any)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value)
    }
  }

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
              <label htmlFor="product-search" className="block text-base font-medium text-foreground ml-4 mb-2">Search Product</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="product-search"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-12 h-12 text-base w-full bg-background border border-input rounded-full shadow-sm placeholder:text-muted-foreground transition-shadow duration-200 hover:shadow-md focus:shadow-lg focus:ring-1 focus:ring-ring focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant={sortBy === "popular" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("popular")}
                className={cn(
                  "rounded-full px-6",
                  sortBy === "popular" && "bg-black text-white hover:bg-black/90"
                )}
              >
                Popular
              </Button>
              <Button
                variant={sortBy === "newest" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("newest")}
                className={cn(
                  "rounded-full px-6",
                  sortBy === "newest" && "bg-black text-white hover:bg-black/90"
                )}
              >
                Latest
              </Button>
              <Button
                variant={sortBy === "top-sales" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("top-sales")}
                className={cn(
                  "rounded-full px-6",
                  sortBy === "top-sales" && "bg-black text-white hover:bg-black/90"
                )}
              >
                Top Sales
              </Button>
              <Button
                variant={sortBy === "price-low" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("price-low")}
                className={cn(
                  "rounded-full px-6",
                  sortBy === "price-low" && "bg-black text-white hover:bg-black/90"
                )}
              >
                Price
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          {showViewToggle && (
            <div className="flex items-center border rounded-md p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "compact" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("compact")}
                className="h-8 w-8 p-0"
                aria-label="Compact view"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Sorting */}
          {/* Sorting removed per design request (Name control hidden) */}
        </div>
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
}

// Skeleton Loading Component
function ProductsGridSkeleton({ viewMode }: { viewMode: string }) {
  const skeletonCount = viewMode === "compact" ? 12 : 6

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
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Products Page Component
export function ProductsPage() {
  const { state } = useApp()
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")

  // Ensure state.filters is always defined
  const filters = state?.filters || {}

  React.useEffect(() => {
      const loadProducts = () => {
      setLoading(true)
      try {
        // Simulate API call with shorter delay
        setTimeout(() => {
          try {
            let filteredProducts = ProductService.getProducts(filters)            // Apply search filter if search term exists
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
        }, 100) // Reduced loading time for faster transitions
      } catch (error) {
        console.error("Error in loadProducts:", error)
        setProducts([])
        setLoading(false)
      }
    }

    loadProducts()
  }, [filters, searchTerm])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

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
