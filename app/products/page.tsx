"use client"

import { Header } from "@/components/layout/header-optimized"
import { Footer } from "@/components/layout/footer"
import { ProductsPage } from "@/components/products/products-grid-optimized"

export default function ProductsPageRoute() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ProductsPage />
      <Footer />
    </div>
  )
}
