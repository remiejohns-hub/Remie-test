"use client"

import Image from "next/image"
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  aspectRatio?: "square" | "video" | "auto"
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  quality = 75,
  placeholder = "empty",
  blurDataURL,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  onLoad,
  onError,
  fallbackSrc = "/placeholder.svg",
  aspectRatio = "auto"
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
    }
    onError?.()
  }, [onError, imgSrc, fallbackSrc])

  // Generate optimized blur placeholder
  const generateBlurDataURL = useCallback((width: number, height: number) => {
    if (blurDataURL) return blurDataURL
    
    // Create a simple base64 blur placeholder
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#f3f4f6')
      gradient.addColorStop(1, '#e5e7eb')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      return canvas.toDataURL()
    }
    
    return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
  }, [blurDataURL])

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: ""
  }[aspectRatio]

  return (
    <div className={cn(
      "relative overflow-hidden",
      aspectRatioClass,
      className
    )}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted/20 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={placeholder === "blur" ? generateBlurDataURL(width || 400, height || 400) : undefined}
        sizes={sizes}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          hasError && "opacity-50"
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
          <span className="text-xs text-muted-foreground">Failed to load image</span>
        </div>
      )}
    </div>
  )
}

// Prebuilt variants for common use cases
export function ProductImage({ 
  src, 
  alt, 
  className,
  priority = false 
}: { 
  src: string
  alt: string
  className?: string
  priority?: boolean 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      aspectRatio="square"
      className={className}
      priority={priority}
      quality={80}
      placeholder="blur"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}

export function HeroImage({ 
  src, 
  alt, 
  className 
}: { 
  src: string
  alt: string
  className?: string 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      aspectRatio="video"
      className={className}
      priority
      quality={90}
      placeholder="blur"
      sizes="100vw"
    />
  )
}

export function AvatarImage({ 
  src, 
  alt, 
  size = 40 
}: { 
  src: string
  alt: string
  size?: number 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full"
      quality={85}
      placeholder="blur"
      sizes={`${size}px`}
    />
  )
}