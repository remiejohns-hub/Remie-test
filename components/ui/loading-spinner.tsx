import React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
  variant?: "default" | "overlay" | "inline"
}

export function LoadingSpinner({ 
  size = "md", 
  className, 
  text,
  variant = "default" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }

  const spinner = (
    <Loader2 
      className={cn(
        "animate-spin text-accent",
        sizeClasses[size],
        className
      )} 
    />
  )

  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          {text && (
            <p className="text-muted text-sm">{text}</p>
          )}
        </div>
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          {spinner}
          {text && (
            <p className="text-muted text-sm">{text}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      {spinner}
    </div>
  )
}

// Page loading component
export function PageLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" />
        <p className="text-muted">{text}</p>
      </div>
    </div>
  )
}

// Button loading state
export function ButtonLoading({ size = "sm" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  return <LoadingSpinner size={size} className="text-current" />
}

// Skeleton loading for content
export function ContentSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-muted/20 rounded animate-pulse",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

// Product card skeleton
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="aspect-square bg-muted/20 rounded-lg animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-muted/20 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-muted/20 rounded w-1/2 animate-pulse" />
        <div className="h-6 bg-muted/20 rounded w-1/3 animate-pulse" />
      </div>
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-muted/20 rounded w-24 animate-pulse" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className={cn(
                "h-4 bg-muted/20 rounded animate-pulse",
                colIndex === 0 ? "w-32" : "w-24"
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  )
}
