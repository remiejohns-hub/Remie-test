"use client"

import { useState, useEffect, useMemo } from "react"
import type { Product, ProductFilters } from "@/lib/types/product"
import { ProductService } from "@/lib/services/product-service"

export function useProducts(initialFilters?: ProductFilters) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {})
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high" | "rating" | "newest">("name")
  const [loading, setLoading] = useState(false)

  const products = useMemo(() => {
    setLoading(true)
    const filteredProducts = ProductService.getProducts(filters)
    const sortedProducts = ProductService.sortProducts(filteredProducts, sortBy)
    setLoading(false)
    return sortedProducts
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
