"use client"

import React, { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageMagnifierProps {
  src: string
  alt: string
  width?: number
  height?: number
  magnifierSize?: number
  zoomLevel?: number
  className?: string
  imageClassName?: string
}

export function ImageMagnifier({
  src,
  alt,
  width = 400,
  height = 400,
  magnifierSize = 150,
  zoomLevel = 3,
  className,
  imageClassName
}: ImageMagnifierProps) {
  const [isMagnifying, setIsMagnifying] = useState(false)
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate magnifier position
    const magnifierX = x - magnifierSize / 2
    const magnifierY = y - magnifierSize / 2

    // Calculate mouse position relative to image
    const imageX = (x / rect.width) * 100
    const imageY = (y / rect.height) * 100

    setMagnifierPosition({ x: magnifierX, y: magnifierY })
    setMousePosition({ x: imageX, y: imageY })
  }, [magnifierSize])

  const handleMouseEnter = () => {
    setIsMagnifying(true)
  }

  const handleMouseLeave = () => {
    setIsMagnifying(false)
  }

  return (
    <div className={cn("relative", className)}>
      {/* Main Image Container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ width, height }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          ref={imageRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "object-cover transition-transform duration-200",
            imageClassName
          )}
        />

        {/* Magnifier Lens */}
        {isMagnifying && (
          <div
            className="absolute pointer-events-none border-2 border-white shadow-lg rounded-full overflow-hidden"
            style={{
              width: magnifierSize,
              height: magnifierSize,
              left: magnifierPosition.x,
              top: magnifierPosition.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: `${width * zoomLevel}px ${height * zoomLevel}px`,
                backgroundPosition: `${-mousePosition.x * zoomLevel + magnifierSize / 2}px ${-mousePosition.y * zoomLevel + magnifierSize / 2}px`,
                backgroundRepeat: 'no-repeat'
              }}
            />
          </div>
        )}
      </div>

      {/* Magnified View (Optional - shows in separate area) */}
      {isMagnifying && (
        <div
          className="absolute left-full ml-4 top-0 border border-gray-200 rounded-lg overflow-hidden shadow-xl bg-white"
          style={{
            width: magnifierSize * 1.5,
            height: magnifierSize * 1.5,
            zIndex: 20
          }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: `${width * zoomLevel}px ${height * zoomLevel}px`,
              backgroundPosition: `${-mousePosition.x * zoomLevel + (magnifierSize * 1.5) / 2}px ${-mousePosition.y * zoomLevel + (magnifierSize * 1.5) / 2}px`,
              backgroundRepeat: 'no-repeat'
            }}
          />
        </div>
      )}
    </div>
  )
}



