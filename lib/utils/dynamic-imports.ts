/**
 * Dynamic import utilities for better code splitting and performance
 */
import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Loading component for dynamic imports
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

// Generic loading component with skeleton
export const LoadingSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-muted/20 rounded ${className}`} />
)

// Dynamic imports for heavy components
export const DynamicAdminDashboard = dynamic(
  () => import('@/components/admin/admin-dashboard').then(mod => ({ default: mod.AdminDashboard })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const DynamicProductManagement = dynamic(
  () => import('@/components/admin/product-management').then(mod => ({ default: mod.ProductManagement })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const DynamicCheckoutModal = dynamic(
  () => import('@/components/checkout/checkout-modal').then(mod => ({ default: mod.CheckoutModal })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const DynamicProductDetailModal = dynamic(
  () => import('@/components/products/product-detail-modal').then(mod => ({ default: mod.ProductDetailModal })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const DynamicAddToCartDialog = dynamic(
  () => import('@/components/products/add-to-cart-dialog').then(mod => ({ default: mod.AddToCartDialog })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

// Chart components (heavy dependencies)
export const DynamicChart = dynamic(
  () => import('@/components/ui/chart'),
  {
    loading: () => <LoadingSkeleton className="h-64 w-full" />,
    ssr: false
  }
)

// Calendar component
export const DynamicCalendar = dynamic(
  () => import('@/components/ui/calendar'),
  {
    loading: () => <LoadingSkeleton className="h-64 w-full" />,
    ssr: false
  }
)

// Carousel component
export const DynamicCarousel = dynamic(
  () => import('@/components/ui/carousel'),
  {
    loading: () => <LoadingSkeleton className="h-48 w-full" />,
    ssr: false
  }
)

// Image magnifier (only load when needed)
export const DynamicImageMagnifier = dynamic(
  () => import('@/components/ui/image-magnifier'),
  {
    loading: () => <LoadingSkeleton className="aspect-square w-full" />,
    ssr: false
  }
)

// Command palette (search)
export const DynamicCommand = dynamic(
  () => import('@/components/ui/command'),
  {
    loading: () => <LoadingSkeleton className="h-32 w-full" />,
    ssr: false
  }
)

// Utility function to create dynamic components with custom loading
export function createDynamicComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: {
    loading?: ComponentType
    ssr?: boolean
    className?: string
  } = {}
) {
  const { loading = LoadingSpinner, ssr = true, className } = options
  
  return dynamic(importFn, {
    loading: () => loading ? <loading /> : <LoadingSkeleton className={className} />,
    ssr
  })
}

// Lazy load heavy utilities
export const lazyUtils = {
  // Date utilities
  dateFns: () => import('date-fns'),
  
  // Form validation
  zod: () => import('zod'),
  
  // Charts
  recharts: () => import('recharts'),
  
  // Form handling
  hookForm: () => import('react-hook-form'),
}

// Preload critical components
export function preloadCriticalComponents() {
  if (typeof window !== 'undefined') {
    // Preload components that are likely to be used soon
    setTimeout(() => {
      import('@/components/products/product-detail-modal')
      import('@/components/layout/cart-dropdown')
    }, 1000)
  }
}