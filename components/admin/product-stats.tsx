"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Product } from "@/lib/types/product"
import { Package, Star, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import { useMemo } from "react"

interface ProductStatsProps {
  products: Product[]
}

export function ProductStats({ products }: ProductStatsProps) {
  const stats = useMemo(() => {
    const totalProducts = products.length
    const featuredProducts = products.filter(p => p.featured).length
    const inStockProducts = products.filter(p => p.inStock).length
    const outOfStockProducts = products.filter(p => !p.inStock).length
    
    // Get unique categories
    const categories = [...new Set(products.map(p => p.category))].length
    
    // Calculate average rating
    const averageRating = products.length > 0 
      ? products.reduce((sum, p) => sum + p.rating, 0) / products.length 
      : 0

    // Get recent products (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentProducts = products.filter(p => 
      new Date(p.createdAt) > sevenDaysAgo
    ).length

    return {
      totalProducts,
      featuredProducts,
      inStockProducts,
      outOfStockProducts,
      categories,
      averageRating,
      recentProducts
    }
  }, [products])

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-[#0066cc]",
      bgColor: "bg-[#0066cc]/10",
      description: "All products in catalog"
    },
    {
      title: "Categories",
      value: stats.categories,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Product categories"
    },
    {
      title: "In Stock",
      value: stats.inStockProducts,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Available products"
    },
    {
      title: "Featured",
      value: stats.featuredProducts,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      description: "Featured products"
    },
    {
      title: "Out of Stock",
      value: stats.outOfStockProducts,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Need restocking"
    },
    {
      title: "Recent",
      value: stats.recentProducts,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Added this week"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
