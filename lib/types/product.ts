export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  subcategory?: string
  images: string[]
  rating: number
  reviewCount: number
  inStock: boolean
  stockQuantity: number
  tags: string[]
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductCategory {
  id: string
  name: string
  description: string
  image: string
  subcategories?: ProductSubcategory[]
}

export interface ProductSubcategory {
  id: string
  name: string
  description: string
  parentCategoryId: string
}

export interface ProductFilters {
  category?: string
  subcategory?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  // `featured` can be a boolean or a named feature key (e.g. "flashSale")
  featured?: boolean | string
  tags?: string[]
  search?: string
}

export interface CartItem {
  product: Product
  quantity: number
  selectedVariant?: string
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}
