"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductManagement } from "./product-management"
import { ProductStats } from "./product-stats"
import { ProductService } from "@/lib/services/product-service"
import { Product } from "@/lib/types/product"
import { Search, Plus, Filter, Grid, List, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [featuredFilter, setFeaturedFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setStockFilter("all")
    setFeaturedFilter("all")
    setSortBy("newest")
  }

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedCategory !== "all" || stockFilter !== "all" || featuredFilter !== "all" || sortBy !== "newest"

  // Get all products and categories
  const allProducts = useMemo(() => ProductService.getProducts(), [])
  const categories = useMemo(() => ProductService.getCategories(), [])

  // Get unique categories from products
  const productCategories = useMemo(() => {
    const uniqueCategories = [...new Set(allProducts.map(product => product.category))]
    return uniqueCategories.map(category => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1)
    }))
  }, [allProducts])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.tags.some(tag => tag.toLowerCase().includes(search))
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Stock filter
    if (stockFilter === "in-stock") {
      filtered = filtered.filter(product => product.inStock)
    } else if (stockFilter === "out-of-stock") {
      filtered = filtered.filter(product => !product.inStock)
    }

    // Featured filter
    if (featuredFilter === "featured") {
      filtered = filtered.filter(product => product.featured)
    } else if (featuredFilter === "not-featured") {
      filtered = filtered.filter(product => !product.featured)
    }

    // Sort products
    return ProductService.sortProducts(filtered, sortBy as any)
  }, [allProducts, searchTerm, selectedCategory, stockFilter, featuredFilter, sortBy])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif font-black text-3xl md:text-4xl text-foreground mb-2">
              Product Management
            </h1>
            <p className="text-muted text-lg">
              Manage your product catalog and inventory
            </p>
          </div>
          <Button className="bg-[#0066cc] text-white hover:bg-[#0066cc]/90 group shadow-md hover:shadow-lg transition-shadow">
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </div>

        {/* Statistics Cards */}
        <ProductStats products={allProducts} />
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#0066cc]" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 bg-white shadow-sm"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="border-2 border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 bg-white shadow-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {productCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stock Filter */}
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="border-2 border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 bg-white shadow-sm">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Featured Filter */}
            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger className="border-2 border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 bg-white shadow-sm">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="featured">Featured Only</SelectItem>
                <SelectItem value="not-featured">Not Featured</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-2 border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 bg-white shadow-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="top-sales">Top Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle and Clear Filters */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {allProducts.length} products
                {hasActiveFilters && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    Filters active: {searchTerm && 'search '}{selectedCategory !== "all" && 'category '}{stockFilter !== "all" && 'stock '}{featuredFilter !== "all" && 'featured '}{sortBy !== "newest" && 'sort'}
                  </span>
                )}
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="bg-red-50 border-2 border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400 hover:text-red-800 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View:</span>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "rounded-r-none border-r shadow-sm hover:shadow-md transition-shadow",
                    viewMode === "table" && "bg-[#0066cc] text-white shadow-md"
                  )}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "rounded-l-none shadow-sm hover:shadow-md transition-shadow",
                    viewMode === "grid" && "bg-[#0066cc] text-white shadow-md"
                  )}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Management Table/Grid */}
      <ProductManagement 
        products={filteredProducts} 
        viewMode={viewMode}
        onProductUpdate={() => {
          // This will be implemented when we add product editing functionality
          console.log("Product updated")
        }}
      />
    </div>
  )
}
