import type { Product, ProductFilters, ProductCategory } from "@/lib/types/product"
import { sampleProducts, productCategories } from "@/lib/data/products"
import { DatabaseProductService } from "./database-product-service"

export class ProductService {
  private static products: Product[] = sampleProducts
  private static categories: ProductCategory[] = productCategories

  // Get all products with optional filtering
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      return await DatabaseProductService.getProducts(filters)
    } catch (error) {
      console.error('Database error, falling back to static data:', error)
      // Fallback to static data if database fails
      let filteredProducts = [...this.products]

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
              product.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
          )
        }
      }

      return filteredProducts
    }
  }

  // Get featured products
  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      return await DatabaseProductService.getFeaturedProducts()
    } catch (error) {
      console.error('Database error, falling back to static data:', error)
      return this.getProducts({ featured: true })
    }
  }

  // Get product by ID
  static async getProductById(id: string): Promise<Product | null> {
    try {
      return await DatabaseProductService.getProductById(id)
    } catch (error) {
      console.error('Database error, falling back to static data:', error)
      return this.products.find((product) => product.id === id) || null
    }
  }

  // Get products by category
  static async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await this.getProducts({ category: categoryId })
  }

  // Get products by subcategory
  static async getProductsBySubcategory(subcategoryId: string): Promise<Product[]> {
    return await this.getProducts({ subcategory: subcategoryId })
  }

  // Search products
  static async searchProducts(query: string): Promise<Product[]> {
    return await this.getProducts({ search: query })
  }

  // Get all categories
  static getCategories(): ProductCategory[] {
    return [...this.categories]
  }

  // Get category by ID
  static getCategoryById(id: string): ProductCategory | undefined {
    return this.categories.find((category) => category.id === id)
  }

  // Get related products (products in same category, excluding current product)
  static getRelatedProducts(productId: string, limit = 4): Product[] {
    const product = this.getProductById(productId)
    if (!product) return []

    const relatedProducts = this.products
      .filter((p) => p.id !== productId && p.category === product.category)
      .slice(0, limit)

    return relatedProducts
  }

  // Get price range for filtering
  static getPriceRange(): { min: number; max: number } {
    const prices = this.products.map((product) => product.price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }

  // Get all unique tags
  static getAllTags(): string[] {
    const allTags = this.products.flatMap((product) => product.tags)
    return [...new Set(allTags)].sort()
  }

  // Sort products
  static sortProducts(
    products: Product[],
    sortBy: "popular" | "newest" | "top-sales" | "price-low" | "price-high",
  ): Product[] {
    // Safety check to ensure products is an array
    if (!Array.isArray(products)) {
      console.warn('ProductService.sortProducts: products is not an array:', products)
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
