"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { Product, ProductFilters } from "@/lib/types/product"
import { sampleProducts } from "@/lib/data/products"

// Cache for products to avoid repeated API calls
const productCache = new Map<string, CacheEntry>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  data: Product[]
  timestamp: number
}

// Sort products function
function sortProducts(
  products: Product[],
  sortBy: "popular" | "newest" | "top-sales" | "price-low" | "price-high"
): Product[] {
  const sortedProducts = [...products]

  switch (sortBy) {
    case "popular":
      return sortedProducts.sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
    case "newest":
      return sortedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case "top-sales":
      return sortedProducts.sort((a, b) => b.rating - a.rating)
    case "price-low":
      return sortedProducts.sort((a, b) => a.price - b.price)
    case "price-high":
      return sortedProducts.sort((a, b) => b.price - a.price)
    default:
      return sortedProducts
  }
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

      // Load fresh data from static data
      let filteredProducts = [...sampleProducts]

      // Apply filters
      if (filters) {
        if (filters.category) {
          filteredProducts = filteredProducts.filter((product) => product.category === filters.category)
        }
        if (filters.subcategory) {
          filteredProducts = filteredProducts.filter((product) => product.subcategory === filters.subcategory)
        }
        if (filters.minPrice !== undefined) {
          filteredProducts = filteredProducts.filter((product) => product.price >= filters.minPrice!)
        }
        if (filters.maxPrice !== undefined) {
          filteredProducts = filteredProducts.filter((product) => product.price <= filters.maxPrice!)
        }
        if (filters.inStock !== undefined) {
          filteredProducts = filteredProducts.filter((product) => product.inStock === filters.inStock)
        }
        if (filters.featured !== undefined) {
          filteredProducts = filteredProducts.filter((product) => product.featured === filters.featured)
        }
        if (filters.tags && filters.tags.length > 0) {
          filteredProducts = filteredProducts.filter((product) => filters.tags!.some((tag) => product.tags.includes(tag)))
        }
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase()
          filteredProducts = filteredProducts.filter(
            (product) =>
              product.name.toLowerCase().includes(searchTerm) ||
              product.description.toLowerCase().includes(searchTerm) ||
              product.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
          )
        }
      }
      
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
        sortedProducts = sortProducts(filteredProducts, sortBy)
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

      // Load fresh data from static data
      const featuredProducts = sampleProducts.filter(product => product.featured)
      
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
      const foundProduct = sampleProducts.find(product => product.id === id)
      
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
        related = sampleProducts
          .filter(p => p.id !== id && p.category === foundProduct.category)
          .slice(0, 4)
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
      const searchResults = sampleProducts.filter(product => {
        const searchTerm = debouncedQuery.toLowerCase()
        return (
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
      })
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