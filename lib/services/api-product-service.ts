import type { Product, ProductFilters } from "@/lib/types/product"

export class ApiProductService {
  private static baseUrl = '/api/products'

  // Get all products with optional filtering
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      const params = new URLSearchParams()
      
      if (filters) {
        if (filters.category) params.append('category', filters.category)
        if (filters.subcategory) params.append('subcategory', filters.subcategory)
        if (filters.featured !== undefined) params.append('featured', filters.featured.toString())
        if (filters.search) params.append('search', filters.search)
        if (filters.inStock !== undefined) params.append('inStock', filters.inStock.toString())
        if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString())
        if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString())
        if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','))
      }

      const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch products')
      }
      
      return result.data || []
    } catch (error) {
      console.error('API error, falling back to static data:', error)
      // Fallback to static data if API fails
      const { sampleProducts } = await import('@/lib/data/products')
      return this.filterStaticProducts(sampleProducts, filters)
    }
  }

  // Get featured products
  static async getFeaturedProducts(): Promise<Product[]> {
    return this.getProducts({ featured: true })
  }

  // Get product by ID
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch product')
      }
      
      return result.data || null
    } catch (error) {
      console.error('API error, falling back to static data:', error)
      // Fallback to static data if API fails
      const { sampleProducts } = await import('@/lib/data/products')
      return sampleProducts.find(product => product.id === id) || null
    }
  }

  // Get products by category
  static async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return this.getProducts({ category: categoryId })
  }

  // Get products by subcategory
  static async getProductsBySubcategory(subcategoryId: string): Promise<Product[]> {
    return this.getProducts({ subcategory: subcategoryId })
  }

  // Search products
  static async searchProducts(query: string): Promise<Product[]> {
    return this.getProducts({ search: query })
  }

  // Helper method to filter static products (fallback)
  private static filterStaticProducts(products: Product[], filters?: ProductFilters): Product[] {
    if (!filters) return products

    let filteredProducts = [...products]

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
          product.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      )
    }

    return filteredProducts
  }

  // Sort products
  static sortProducts(
    products: Product[],
    sortBy: "popular" | "newest" | "top-sales" | "price-low" | "price-high",
  ): Product[] {
    // Safety check to ensure products is an array
    if (!Array.isArray(products)) {
      console.warn('ApiProductService.sortProducts: products is not an array:', products)
      return []
    }
    
    const sortedProducts = [...products]

    switch (sortBy) {
      case "popular":
        return sortedProducts.sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
      case "newest":
        return sortedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "top-sales":
        return sortedProducts.sort((a, b) => b.rating - a.rating) // Using rating as proxy for sales
      case "price-low":
        return sortedProducts.sort((a, b) => a.price - b.price)
      case "price-high":
        return sortedProducts.sort((a, b) => b.price - a.price)
      default:
        return sortedProducts
    }
  }
}
