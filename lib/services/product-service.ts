import type { Product, ProductFilters, ProductCategory } from "@/lib/types/product"
import { sampleProducts, productCategories } from "@/lib/data/products"

export class ProductService {
  private static products: Product[] = sampleProducts
  private static categories: ProductCategory[] = productCategories

  // Get all products with optional filtering
  static getProducts(filters?: ProductFilters): Product[] {
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

  // Get featured products
  static getFeaturedProducts(): Product[] {
    return this.getProducts({ featured: true })
  }

  // Get product by ID
  static getProductById(id: string): Product | undefined {
    return this.products.find((product) => product.id === id)
  }

  // Get products by category
  static getProductsByCategory(categoryId: string): Product[] {
    return this.getProducts({ category: categoryId })
  }

  // Get products by subcategory
  static getProductsBySubcategory(subcategoryId: string): Product[] {
    return this.getProducts({ subcategory: subcategoryId })
  }

  // Search products
  static searchProducts(query: string): Product[] {
    return this.getProducts({ search: query })
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
    sortBy: "popular" | "newest" | "top-sales" | "price-low",
  ): Product[] {
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
      default:
        return sortedProducts
    }
  }
}
