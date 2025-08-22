"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { Product, ProductFilters } from "@/lib/types/product"
import { ProductService } from "@/lib/services/product-service"

// Cache for products to avoid repeated API calls
const productCache = new Map<string, CacheEntry>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  data: Product[]
  timestamp: number
}

function getCacheKey(filters: ProductFilters): string {
  return JSON.stringify(filters)
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION
}

export function useProducts(initialFilters?: ProductFilters) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {})
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "top-sales" | "price-low" | "price-high" | "name">("popular")
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const cacheKey = getCacheKey(filters)
      const cached = productCache.get(cacheKey) as CacheEntry
      
      // Check cache first
      if (cached && isCacheValid(cached.timestamp)) {
        let sortedProducts = cached.data
        
        // Apply sorting
        if (sortBy === "name") {
          sortedProducts = [...cached.data].sort((a, b) => a.name.localeCompare(b.name))
        } else if (sortBy !== "popular") {
          sortedProducts = ProductService.sortProducts(cached.data, sortBy)
        }
        
        setProducts(sortedProducts)
        setLoading(false)
        return
      }

      // Load fresh data
      const filteredProducts = ProductService.getProducts(filters)
      
      // Cache the results
      productCache.set(cacheKey, {
        data: filteredProducts,
        timestamp: Date.now()
      })
      
      // Apply sorting
      let sortedProducts = filteredProducts
      if (sortBy === "name") {
        sortedProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name))
      } else if (sortBy !== "popular") {
        sortedProducts = ProductService.sortProducts(filteredProducts, sortBy)
      }
      
      setProducts(sortedProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters, sortBy])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const retry = useCallback(() => {
    loadProducts()
  }, [loadProducts])

  return {
    products,
    filters,
    sortBy,
    loading,
    error,
    updateFilters,
    clearFilters,
    setSortBy,
    retry,
    totalCount: products.length,
  }
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Check cache first
      const cacheKey = getCacheKey({ featured: true })
      const cached = productCache.get(cacheKey) as CacheEntry
      
      if (cached && isCacheValid(cached.timestamp)) {
        setProducts(cached.data)
        setLoading(false)
        return
      }

      // Load fresh data
      const featuredProducts = ProductService.getFeaturedProducts()
      
      // Cache the results
      productCache.set(cacheKey, {
        data: featuredProducts,
        timestamp: Date.now()
      })
      
      setProducts(featuredProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load featured products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { products, loading, error }
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | undefined>(undefined)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    try {
      const foundProduct = ProductService.getProductById(id)
      
      if (!foundProduct) {
        setError('Product not found')
        setLoading(false)
        return
      }

      // Check cache for related products
      const relatedCacheKey = `related-${id}`
      const cachedRelated = productCache.get(relatedCacheKey) as CacheEntry
      
      let related: Product[]
      if (cachedRelated && isCacheValid(cachedRelated.timestamp)) {
        related = cachedRelated.data
      } else {
        related = ProductService.getRelatedProducts(id)
        productCache.set(relatedCacheKey, {
          data: related,
          timestamp: Date.now()
        })
      }

      setProduct(foundProduct)
      setRelatedProducts(related)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product')
      setProduct(undefined)
      setRelatedProducts([])
    } finally {
      setLoading(false)
    }
  }, [id])

  return { product, relatedProducts, loading, error }
}

// Hook for search with debouncing
export function useProductSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    
    try {
      const searchResults = ProductService.searchProducts(debouncedQuery)
      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery])

  const clearSearch = useCallback(() => {
    setQuery("")
    setResults([])
  }, [])

  return {
    query,
    setQuery,
    results,
    loading,
    clearSearch
  }
}

// Clear cache utility
export function clearProductCache() {
  productCache.clear()
}