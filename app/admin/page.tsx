"use client"

import { useState, useEffect } from 'react'
import type { Product } from '@/lib/types/product'

interface ProductStatsData {
  totalProducts: number
  featuredProducts: number
  inStockProducts: number
  outOfStockProducts: number
  totalCategories: number
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<ProductStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'featured'>('overview')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load products and stats in parallel
      const [productsData, statsData] = await Promise.all([
        fetch('/api/admin/products').then(res => res.json()),
        fetch('/api/admin/stats').then(res => res.json())
      ])

      if (productsData.success) {
        setProducts(productsData.data)
      } else {
        throw new Error(productsData.error || 'Failed to load products')
      }

      if (statsData.success) {
        setStats(statsData.data)
      } else {
        throw new Error(statsData.error || 'Failed to load stats')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeatured = async (productId: string, currentFeatured: boolean) => {
    try {
      const response = await fetch('/api/admin/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, featured: !currentFeatured })
      })

      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, featured: !currentFeatured } : p
        ))
        // Reload stats
        loadData()
      } else {
        throw new Error(result.error || 'Failed to update featured status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update featured status')
    }
  }

  const handleBulkFeaturedUpdate = async (featured: boolean) => {
    if (selectedProducts.size === 0) return
    
    try {
      const updates = Array.from(selectedProducts).map(id => ({ id, featured }))
      const response = await fetch('/api/admin/featured/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      })

      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setProducts(prev => prev.map(p => {
          const update = updates.find(u => u.id === p.id)
          return update ? { ...p, featured: update.featured } : p
        }))
        setSelectedProducts(new Set())
        // Reload stats
        loadData()
      } else {
        throw new Error(result.error || 'Failed to update featured status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update featured status')
    }
  }

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.category))).sort()
  
  // Filter products based on selected category and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredProducts = filteredProducts.filter(p => p.featured)
  const nonFeaturedProducts = filteredProducts.filter(p => !p.featured)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your featured products</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'featured'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Featured Products
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && stats && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-500 rounded-lg p-3 text-white text-2xl">📦</div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-yellow-500 rounded-lg p-3 text-white text-2xl">⭐</div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Featured Products</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.featuredProducts}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-green-500 rounded-lg p-3 text-white text-2xl">✅</div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">In Stock</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.inStockProducts}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-red-500 rounded-lg p-3 text-white text-2xl">❌</div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.outOfStockProducts}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-purple-500 rounded-lg p-3 text-white text-2xl">📁</div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Categories</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    All Products ({filteredProducts.length})
                  </h2>
                  {selectedProducts.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {selectedProducts.size} selected
                      </span>
                      <button
                        onClick={() => handleBulkFeaturedUpdate(true)}
                        className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                      >
                        Mark as Featured
                      </button>
                      <button
                        onClick={() => handleBulkFeaturedUpdate(false)}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                      >
                        Remove from Featured
                      </button>
                      <button
                        onClick={() => setSelectedProducts(new Set())}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Filter Controls */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Category Filter */}
                  <div className="sm:w-48">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Clear Filters */}
                  {(selectedCategory !== 'all' || searchTerm !== '') && (
                    <button
                      onClick={() => {
                        setSelectedCategory('all')
                        setSearchTerm('')
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm text-gray-600">Select all products</span>
                  </label>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600">
                      {searchTerm || selectedCategory !== 'all' 
                        ? 'Try adjusting your search or filter criteria.' 
                        : 'No products available.'}
                    </p>
                    {(searchTerm || selectedCategory !== 'all') && (
                      <button
                        onClick={() => {
                          setSelectedCategory('all')
                          setSearchTerm('')
                        }}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded border-gray-300"
                        />
                        <button
                          onClick={() => handleToggleFeatured(product.id, product.featured)}
                          className={`text-2xl ${
                            product.featured ? 'text-yellow-500' : 'text-gray-300'
                          } hover:text-yellow-500`}
                        >
                          {product.featured ? '⭐' : '☆'}
                        </button>
                      </div>
                      
                      <div className="flex items-center mb-3">
                        <img
                          className="h-16 w-16 rounded-lg object-cover mr-3"
                          src={product.images[0] || '/placeholder.svg'}
                          alt={product.name}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {product.category}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded-full ${
                          product.inStock 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <span>⭐ {product.rating}</span>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'featured' && (
            <div className="space-y-6">
              {/* Filter Controls for Featured Tab */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Featured Products ({featuredProducts.length})
                  </h2>
                  
                  {/* Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search featured products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    {/* Category Filter */}
                    <div className="sm:w-48">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Clear Filters */}
                    {(selectedCategory !== 'all' || searchTerm !== '') && (
                      <button
                        onClick={() => {
                          setSelectedCategory('all')
                          setSearchTerm('')
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Featured Products */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Featured Products ({featuredProducts.length})
                  </h2>
                </div>

                {featuredProducts.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="text-gray-400 text-6xl mb-4">⭐</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Featured Products</h3>
                    <p className="text-gray-600">Select products from the "All Products" tab to feature them.</p>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {featuredProducts.map((product) => (
                        <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-4"></div>
                            <button
                              onClick={() => handleToggleFeatured(product.id, product.featured)}
                              className="text-yellow-500 text-2xl hover:text-yellow-600"
                            >
                              ⭐
                            </button>
                          </div>
                          
                          <div className="flex items-center mb-3">
                            <img
                              className="h-16 w-16 rounded-lg object-cover mr-3"
                              src={product.images[0] || '/placeholder.svg'}
                              alt={product.name}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-500 truncate">
                                {product.category}
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                ${product.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded-full ${
                              product.inStock 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                            <span>⭐ {product.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Available Products */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Available Products ({nonFeaturedProducts.length})
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Click the star icon to add products to featured section
                  </p>
                </div>

                {nonFeaturedProducts.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All Products Featured</h3>
                    <p className="text-gray-600">All your products are currently featured.</p>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {nonFeaturedProducts.map((product) => (
                        <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-4"></div>
                            <button
                              onClick={() => handleToggleFeatured(product.id, product.featured)}
                              className="text-gray-300 text-2xl hover:text-yellow-500"
                            >
                              ☆
                            </button>
                          </div>
                          
                          <div className="flex items-center mb-3">
                            <img
                              className="h-16 w-16 rounded-lg object-cover mr-3"
                              src={product.images[0] || '/placeholder.svg'}
                              alt={product.name}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-500 truncate">
                                {product.category}
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                ${product.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded-full ${
                              product.inStock 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                            <span>⭐ {product.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}