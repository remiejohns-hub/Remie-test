"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Product } from "@/lib/types/product"
import { Eye, Edit, Trash2, Star, StarOff, Package, PackageX } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

interface ProductManagementProps {
  products: Product[]
  viewMode: "grid" | "table"
  onProductUpdate: () => void
}

export function ProductManagement({ products, viewMode, onProductUpdate }: ProductManagementProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const toggleFeatured = (product: Product) => {
    // This will be implemented when we add product editing functionality
    console.log("Toggle featured for product:", product.id)
    onProductUpdate()
  }

  const deleteProduct = (product: Product) => {
    // This will be implemented when we add product deletion functionality
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      console.log("Delete product:", product.id)
      onProductUpdate()
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 shadow-md">
            <CardHeader className="p-0">
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <Image
                  src={product.images[0] || "/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {product.featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Badge 
                    variant={product.inStock ? "default" : "destructive"}
                    className={cn(
                      product.inStock 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    )}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#0066cc]">
                    {formatPrice(product.price)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-muted-foreground">
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{product.category}</span>
                  <span>Stock: {product.stockQuantity}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 shadow-sm hover:shadow-md transition-shadow" asChild>
                    <Link href={`/products/${product.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toggleFeatured(product)}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    {product.featured ? (
                      <StarOff className="h-4 w-4" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteProduct(product)}
                    className="text-red-600 hover:text-red-700 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products ({products.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="relative w-12 h-12 rounded-md overflow-hidden">
                      <Image
                        src={product.images[0] || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground line-clamp-1">
                        {product.name}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {product.description}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">
                          {product.rating} ({product.reviewCount})
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-[#0066cc]">
                      {formatPrice(product.price)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.inStock ? (
                        <>
                          <Package className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">
                            {product.stockQuantity}
                          </span>
                        </>
                      ) : (
                        <>
                          <PackageX className="h-4 w-4 text-red-600" />
                          <span className="text-red-600 font-medium">0</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={product.featured ? "default" : "outline"}
                      onClick={() => toggleFeatured(product)}
                      className={cn(
                        "shadow-sm hover:shadow-md transition-shadow",
                        product.featured 
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 shadow-md" 
                          : ""
                      )}
                    >
                      {product.featured ? (
                        <>
                          <Star className="h-4 w-4 mr-1 fill-current" />
                          Yes
                        </>
                      ) : (
                        <>
                          <StarOff className="h-4 w-4 mr-1" />
                          No
                        </>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(product.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" className="shadow-sm hover:shadow-md transition-shadow" asChild>
                        <Link href={`/products/${product.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteProduct(product)}
                        className="text-red-600 hover:text-red-700 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
