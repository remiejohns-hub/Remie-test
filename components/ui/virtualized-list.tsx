'use client'

import { memo, useCallback, useMemo, useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
}

export const VirtualizedList = memo(<T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5
}: VirtualizedListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const visibleRange = useMemo(() => {
    const visibleItemCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(items.length - 1, startIndex + visibleItemCount + overscan * 2)
    
    return { startIndex, endIndex, visibleItemCount }
  }, [scrollTop, containerHeight, itemHeight, items.length, overscan])
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
  }, [items, visibleRange.startIndex, visibleRange.endIndex])
  
  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight
  
  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={visibleRange.startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

VirtualizedList.displayName = 'VirtualizedList'