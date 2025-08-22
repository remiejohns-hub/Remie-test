"use client"

import { useState, useEffect, useMemo } from "react"
import type { Product, ProductFilters } from "@/lib/types/product"
import { ProductService } from "@/lib/services/product-service"

export function useProducts(initialFilters?: ProductFilters) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {})
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "top-sales" | "price-low" | "price-high" | "name">("popular")
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    setLoading(true)
    const filteredProducts = ProductService.getProducts(filters)
    
    // Handle "name" sorting by using "popular" and then sorting by name
    let sortedProducts = filteredProducts;
    if (sortBy === "name") {
      sortedProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy !== "popular" && sortBy !== "newest" && sortBy !== "top-sales" && sortBy !== "price-low" && sortBy !== "price-high") {
      // Fallback to popular if sortBy is not a valid option
      sortedProducts = ProductService.sortProducts(filteredProducts, "popular");
    } else {
      sortedProducts = ProductService.sortProducts(filteredProducts, sortBy);
    }
    
    setProducts(sortedProducts)
    setLoading(false)
  }, [filters, sortBy])

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  return {
    products,
    filters,
    sortBy,
    loading,
    updateFilters,
    clearFilters,
    setSortBy,
    totalCount: products.length,
  }
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const featuredProducts = ProductService.getFeaturedProducts()
    setProducts(featuredProducts)
    setLoading(false)
  }, [])

  return { products, loading }
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | undefined>(undefined)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const foundProduct = ProductService.getProductById(id)
    const related = foundProduct ? ProductService.getRelatedProducts(id) : []

    setProduct(foundProduct)
    setRelatedProducts(related)
    setLoading(false)
  }, [id])

  return { product, relatedProducts, loading }
}
