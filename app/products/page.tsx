"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductsPage } from "@/components/products/products-grid"

export default function ProductsPageRoute() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ProductsPage />
      <Footer />
    </div>
  )
}
