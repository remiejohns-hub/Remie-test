/**
 * Performance monitoring utilities for tracking and optimizing app performance
 */

// Performance metrics tracking
interface PerformanceMetrics {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.logMetric('navigation', {
              name: entry.name,
              duration: entry.duration,
              type: entry.entryType,
              ...entry
            })
          }
        })
        navigationObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navigationObserver)

        // Observe resource loading
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 100) { // Only log slow resources
              this.logMetric('resource', {
                name: entry.name,
                duration: entry.duration,
                size: (entry as any).transferSize,
                type: entry.entryType
              })
            }
          }
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)

        // Observe paint timing
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.logMetric('paint', {
              name: entry.name,
              startTime: entry.startTime,
              type: entry.entryType
            })
          }
        })
        paintObserver.observe({ entryTypes: ['paint'] })
        this.observers.push(paintObserver)

        // Observe layout shifts (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) return // Ignore user-initiated shifts
            this.logMetric('layout-shift', {
              value: (entry as any).value,
              startTime: entry.startTime,
              sources: (entry as any).sources?.map((source: any) => ({
                node: source.node?.tagName || 'unknown',
                currentRect: source.currentRect,
                previousRect: source.previousRect
              }))
            })
          }
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)

      } catch (error) {
        console.warn('Performance observers not fully supported:', error)
      }
    }
  }

  // Start timing a custom metric
  startTiming(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    })
  }

  // End timing a custom metric
  endTiming(name: string): number | null {
    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`No timing started for "${name}"`)
      return null
    }

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    metric.endTime = endTime
    metric.duration = duration

    this.logMetric('custom', metric)
    this.metrics.delete(name)

    return duration
  }

  // Log a metric
  private logMetric(category: string, data: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${category}:`, data)
    }

    // In production, you might want to send this to an analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to analytics service
      // analytics.track('performance_metric', { category, ...data })
    }
  }

  // Get Core Web Vitals
  getCoreWebVitals(): Promise<{
    fcp?: number
    lcp?: number
    fid?: number
    cls?: number
    ttfb?: number
  }> {
    return new Promise((resolve) => {
      const vitals: any = {}

      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
      if (fcpEntry) {
        vitals.fcp = fcpEntry.startTime
      }

      // Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationEntry) {
        vitals.ttfb = navigationEntry.responseStart - navigationEntry.requestStart
      }

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            vitals.lcp = lastEntry.startTime
            lcpObserver.disconnect()
          })
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

          // Timeout after 5 seconds
          setTimeout(() => {
            lcpObserver.disconnect()
            resolve(vitals)
          }, 5000)
        } catch {
          resolve(vitals)
        }
      } else {
        resolve(vitals)
      }
    })
  }

  // Measure component render time
  measureComponent<T extends Record<string, any>>(
    componentName: string,
    props?: T
  ) {
    return {
      start: () => this.startTiming(`component-${componentName}`, { props }),
      end: () => this.endTiming(`component-${componentName}`)
    }
  }

  // Measure API call performance
  measureAPICall<T>(
    endpoint: string,
    method: string = 'GET'
  ) {
    const name = `api-${method}-${endpoint}`
    return {
      start: () => this.startTiming(name, { endpoint, method }),
      end: (response?: { status?: number; size?: number }) => {
        const duration = this.endTiming(name)
        if (response && duration) {
          this.logMetric('api', {
            endpoint,
            method,
            duration,
            status: response.status,
            size: response.size
          })
        }
        return duration
      }
    }
  }

  // Clean up observers
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics.clear()
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for measuring component performance
export function usePerformanceMonitor(componentName: string, props?: any) {
  const { start, end } = performanceMonitor.measureComponent(componentName, props)
  
  return {
    startTiming: start,
    endTiming: end,
    measureRender: (callback: () => void) => {
      start()
      callback()
      end()
    }
  }
}

// Utility function to measure async operations
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  performanceMonitor.startTiming(name, metadata)
  try {
    const result = await operation()
    performanceMonitor.endTiming(name)
    return result
  } catch (error) {
    performanceMonitor.endTiming(name)
    throw error
  }
}

// Utility to measure function execution time
export function measureSync<T>(
  name: string,
  operation: () => T,
  metadata?: Record<string, any>
): T {
  performanceMonitor.startTiming(name, metadata)
  try {
    const result = operation()
    performanceMonitor.endTiming(name)
    return result
  } catch (error) {
    performanceMonitor.endTiming(name)
    throw error
  }
}

// Bundle size analyzer (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV !== 'development') return

  // This would require webpack-bundle-analyzer in a real implementation
  console.log('Bundle analysis would require webpack-bundle-analyzer')
  console.log('Run: npx webpack-bundle-analyzer .next/static/chunks/*.js')
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) return

  const memory = (performance as any).memory
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
  }
}

// Network information monitoring
export function getNetworkInfo() {
  if (typeof window === 'undefined' || !('connection' in navigator)) return null

  const connection = (navigator as any).connection
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData
  }
}