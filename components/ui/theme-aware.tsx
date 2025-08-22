'use client'

import React, { useEffect, useState } from 'react'

interface ThemeAwareProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ThemeAware({ children, fallback = null }: ThemeAwareProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // During SSR and initial hydration, render fallback to prevent mismatch
  if (!isMounted) {
    return <>{fallback}</>
  }

  // Only render children after component is mounted on client
  return <>{children}</>
}
