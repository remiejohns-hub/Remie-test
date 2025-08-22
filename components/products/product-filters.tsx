"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { X, Filter, SlidersHorizontal, Search, Tag, Star, Package } from "lucide-react"
import { useApp } from "@/lib/context/app-context-optimized"
import { ProductService } from "@/lib/services/product-service"
import type { ProductFilters } from "@/lib/types/product"
import { cn } from "@/lib/utils"

interface ProductFiltersProps {
  className?: string
  showMobileSheet?: boolean
}

export function ProductFilters({ className, showMobileSheet = true }: ProductFiltersProps) {
  const { state, updateFilters, clearFilters } = useApp()
  
  // Ensure state.filters is always defined
  const safeFilters = state?.filters || {}
  const [localFilters, setLocalFilters] = useState<ProductFilters>(safeFilters)

  const categories = ProductService.getCategories()
  const priceRange = ProductService.getPriceRange()
  const allTags = ProductService.getAllTags()

  const activeFiltersCount = Object.values(state.filters).filter(Boolean).length

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    updateFilters(newFilters)
  }

  const handleClearFilters = () => {
    setLocalFilters({})
    clearFilters()
  }

  const handlePriceChange = (values: number[]) => {
    if (values.length === 2) {
      handleFilterChange("minPrice", values[0])
      handleFilterChange("maxPrice", values[1])
    }
  }

  const removeFilter = (key: keyof ProductFilters) => {
    const newFilters = { ...localFilters }
    delete newFilters[key]
    setLocalFilters(newFilters)
    updateFilters(newFilters)
  }

  const FilterContent = () => (
    <div className="space-y-8">
      {/* All Categories (replaced select with quick category buttons) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-accent" />
          <Label className="text-base font-semibold text-foreground">All Categories</Label>
        </div>

        <div className="mt-2">
          <ul className="text-sm space-y-2">
            <li>
              <button
                className={cn(
                  "flex items-center w-full text-left px-2 py-1 rounded",
                  localFilters.category === undefined ? "text-accent font-semibold" : "text-foreground"
                )}
                onClick={() => handleFilterChange("category", undefined)}
              >
                <span className="mr-2">▸</span>
                All Categories
              </button>
            </li>
            <li>
              <button
                className={cn(
                  "flex items-center w-full text-left px-2 py-1 rounded",
                  localFilters.category === "phone" ? "text-accent font-semibold" : "text-foreground"
                )}
                onClick={() => handleFilterChange("category", "phone")}
              >
                <span className="mr-2">▸</span>
                Phone
              </button>
            </li>
            <li>
              <button
                className={cn(
                  "flex items-center w-full text-left px-2 py-1 rounded",
                  localFilters.category === "phone-accessories" ? "text-accent font-semibold" : "text-foreground"
                )}
                onClick={() => handleFilterChange("category", "phone-accessories")}
              >
                <span className="mr-2">▸</span>
                Phone Accessories
              </button>
            </li>
            <li>
              <button
                className={cn(
                  "flex items-center w-full text-left px-2 py-1 rounded",
                  localFilters.category === "table" ? "text-accent font-semibold" : "text-foreground"
                )}
                onClick={() => handleFilterChange("category", "table")}
              >
                <span className="mr-2">▸</span>
                Table
              </button>
            </li>
            <li>
              <button
                className={cn(
                  "flex items-center w-full text-left px-2 py-1 rounded",
                  localFilters.category === "laptop" ? "text-accent font-semibold" : "text-foreground"
                )}
                onClick={() => handleFilterChange("category", "laptop")}
              >
                <span className="mr-2">▸</span>
                Laptop
              </button>
            </li>
          </ul>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Product Features - vertical list matching categories style */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-accent" />
          <Label className="text-base font-semibold text-foreground">Product Features</Label>
        </div>

        <div className="mt-2">
          <ul className="text-sm space-y-2">
            <li>
              <button
                className={cn(
                  "flex items-center w-full text-left px-2 py-1 rounded",
                  (!localFilters.featured || typeof localFilters.featured === "boolean") ? "text-accent font-semibold" : "text-foreground"
                )}
                onClick={() => handleFilterChange("featured", undefined)}
              >
                <span className="mr-2">▸</span>
                All Features
              </button>
            </li>
            <li>
              <button
                className={cn(
                  "flex items-center w-full text-left px-2 py-1 rounded",
                  localFilters.featured === "flashSale" ? "text-accent font-semibold" : "text-foreground"
                )}
                onClick={() => handleFilterChange("featured", "flashSale")}
              >
                <span className="mr-2">▸</span>
                Flash Sale
              </button>
            </li>
            <li>
              <button
                className={cn(
                  "flex items-center w-full text-left px-2 py-1 rounded",
                  localFilters.featured === "bundleDeals" ? "text-accent font-semibold" : "text-foreground"
                )}
                onClick={() => handleFilterChange("featured", "bundleDeals")}
              >
                <span className="mr-2">▸</span>
                Bundle Deals
              </button>
            </li>
            <li>
              <button
                className={cn(
                  "flex items-center w-full text-left px-2 py-1 rounded",
                  localFilters.featured === "newArrivals" ? "text-accent font-semibold" : "text-foreground"
                )}
                onClick={() => handleFilterChange("featured", "newArrivals")}
              >
                <span className="mr-2">▸</span>
                New Arrivals
              </button>
            </li>
            <li>
              <button
                className={cn(
                  "flex items-center w-full text-left px-2 py-1 rounded",
                  localFilters.featured === "trending" ? "text-accent font-semibold" : "text-foreground"
                )}
                onClick={() => handleFilterChange("featured", "trending")}
              >
                <span className="mr-2">▸</span>
                Trending
              </button>
            </li>
          </ul>
        </div>
      </div>

      <Separator className="bg-border/50" />

  {/* Price Range removed per request */}

      {/* Tags Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-accent" />
          <Label className="text-base font-semibold text-foreground">Popular Tags</Label>
      </div>
        <div className="flex flex-wrap gap-2">
          {allTags.slice(0, 12).map((tag) => (
            <Badge
              key={tag}
              variant={localFilters.tags?.includes(tag) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:scale-105",
                "px-3 py-2 text-sm font-medium",
                localFilters.tags?.includes(tag) 
                  ? "bg-accent text-accent-foreground shadow-md" 
                  : "bg-background hover:bg-accent/10 hover:border-accent/50 hover:text-accent"
              )}
              onClick={() => {
                const currentTags = localFilters.tags || []
                const newTags = currentTags.includes(tag)
                  ? currentTags.filter(t => t !== tag)
                  : [...currentTags, tag]
                handleFilterChange("tags", newTags.length > 0 ? newTags : undefined)
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <div className="pt-4">
        <Button
          variant="outline"
          onClick={handleClearFilters}
            className="w-full bg-destructive/5 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
        >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters ({activeFiltersCount})
        </Button>
        </div>
      )}
    </div>
  )

  if (showMobileSheet) {
    return (
      <>
        {/* Mobile Filter Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden bg-accent/5 border-accent/20 text-accent hover:bg-accent/10 hover:border-accent/30">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-accent text-accent-foreground">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-background">
            <SheetHeader className="border-b border-border/50 pb-4">
              <SheetTitle className="text-xl font-bold text-foreground">Filter Products</SheetTitle>
              <p className="text-sm text-muted">Refine your search results</p>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto max-h-[calc(100vh-120px)]">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Filters */}
        <div className={cn("hidden lg:block", className)}>
          <div className="sticky top-4">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-bold text-foreground">Filters</h3>
                </div>
              {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {activeFiltersCount} active
                  </Badge>
              )}
            </div>
            <FilterContent />
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 shadow-sm", className)}>
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-bold text-foreground">Filters</h3>
      </div>
      <FilterContent />
    </div>
  )
}

// Active Filters Display Component
export function ActiveFilters() {
  const { state, updateFilters } = useApp()

  // Ensure state.filters is always defined
  const safeFilters = state?.filters || {}
  
  const activeFilters = Object.entries(safeFilters).filter(([_, value]) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== ""
  })

  if (activeFilters.length === 0) return null

  const removeFilter = (key: string, val?: any) => {
    const newFilters = { ...safeFilters }
    if (key === "tags" && typeof val === "string") {
      const currentTags = newFilters.tags || []
      const newTags = currentTags.filter((tag) => tag !== val)
      newFilters.tags = newTags.length > 0 ? newTags : undefined
    } else {
      delete newFilters[key as keyof ProductFilters]
    }
    updateFilters(newFilters)
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-muted mr-2">Active filters:</span>
      {activeFilters.map(([key, value]) => {
        // Handle tags array
        if (key === "tags" && Array.isArray(value)) {
          return value.map((tag) => (
            <Badge
              key={`${key}-${tag}`}
              variant="secondary"
              className="flex items-center gap-1 bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 transition-colors"
            >
              {tag}
              <button
                onClick={() => removeFilter(key, tag)}
                className="ml-1 hover:bg-accent/30 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${tag} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        }

        // Handle price filters
        if ((key === "minPrice" || key === "maxPrice") && typeof value === "number") {
          const displayValue = key === "minPrice" ? `$${value}+` : `$${value}-`
          return (
            <Badge
              key={key}
              variant="secondary"
              className="flex items-center gap-1 bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 transition-colors"
            >
              {displayValue}
              <button
                onClick={() => removeFilter(key)}
                className="ml-1 hover:bg-accent/30 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${key} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )
        }

        // Handle other filters
        if (typeof value === "string" || typeof value === "boolean" || typeof value === "number") {
        return (
          <Badge
            key={key}
            variant="secondary"
              className="flex items-center gap-1 bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 transition-colors"
          >
            {String(value)}
            <button
                onClick={() => removeFilter(key)}
                className="ml-1 hover:bg-accent/30 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${key} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )
        }

        return null
      })}
    </div>
  )
}
