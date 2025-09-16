'use client'

import { Suspense, type ComponentType, type PropsWithChildren } from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

interface DynamicWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  loading?: React.ReactNode
}

export function DynamicWrapper({ 
  children, 
  fallback = <Skeleton className="w-full h-32" />, 
  loading 
}: DynamicWrapperProps) {
  return (
    <Suspense fallback={loading || fallback}>
      {children}
    </Suspense>
  )
}

// Helper for creating dynamic components with loading states
export function createDynamicComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    loading?: ComponentType
    ssr?: boolean
  }
) {
  return dynamic(importFn, {
    loading: options?.loading || (() => <Skeleton className="w-full h-8" />),
    ssr: options?.ssr ?? true,
  })
}