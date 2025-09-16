#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests the optimizations implemented in the application
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Starting Performance Tests...\n')

// Test 1: Bundle Size Analysis
function testBundleSize() {
  console.log('📦 Testing Bundle Size...')
  
  try {
    // Check if build exists
    const buildDir = path.join(process.cwd(), '.next')
    if (!fs.existsSync(buildDir)) {
      console.log('⚠️  No build found. Running build first...')
      execSync('npm run build', { stdio: 'inherit' })
    }
    
    // Analyze bundle
    const chunksDir = path.join(buildDir, 'static', 'chunks')
    if (fs.existsSync(chunksDir)) {
      const chunks = fs.readdirSync(chunksDir)
      let totalSize = 0
      
      chunks.forEach(chunk => {
        if (chunk.endsWith('.js')) {
          const chunkPath = path.join(chunksDir, chunk)
          const stats = fs.statSync(chunkPath)
          totalSize += stats.size
          
          if (stats.size > 500 * 1024) { // Files larger than 500KB
            console.log(`⚠️  Large chunk: ${chunk} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`)
          }
        }
      })
      
      const totalMB = totalSize / 1024 / 1024
      console.log(`📊 Total bundle size: ${totalMB.toFixed(2)}MB`)
      
      if (totalMB < 2.0) {
        console.log('✅ Bundle size is within optimal range (<2MB)')
      } else if (totalMB < 2.5) {
        console.log('⚠️  Bundle size is acceptable but could be improved')
      } else {
        console.log('❌ Bundle size exceeds recommended threshold (>2.5MB)')
      }
    }
  } catch (error) {
    console.error('❌ Bundle size test failed:', error.message)
  }
  
  console.log('')
}

// Test 2: API Performance
async function testAPIPerformance() {
  console.log('🌐 Testing API Performance...')
  
  const baseUrl = process.env.TEST_URL || 'http://localhost:3000'
  const endpoints = [
    '/api/products',
    '/api/products?featured=true',
    '/api/products?category=electronics',
    '/api/products/1'
  ]
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now()
      
      // Use node-fetch or built-in fetch if available
      let response
      try {
        response = await fetch(`${baseUrl}${endpoint}`)
      } catch (fetchError) {
        // Fallback for older Node versions
        const { default: fetch } = await import('node-fetch')
        response = await fetch(`${baseUrl}${endpoint}`)
      }
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      if (response.ok) {
        const cacheStatus = response.headers.get('x-cache') || 'UNKNOWN'
        console.log(`✅ ${endpoint}: ${responseTime}ms (Cache: ${cacheStatus})`)
        
        if (responseTime > 500) {
          console.log(`⚠️  Slow response time for ${endpoint}`)
        }
      } else {
        console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Network error - ${error.message}`)
    }
  }
  
  console.log('')
}

// Test 3: Image Optimization
function testImageOptimization() {
  console.log('🖼️  Testing Image Optimization...')
  
  const publicDir = path.join(process.cwd(), 'public')
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
  
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir)
    let totalImageSize = 0
    let largeImages = []
    
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase()
      if (imageExtensions.includes(ext)) {
        const filePath = path.join(publicDir, file)
        const stats = fs.statSync(filePath)
        totalImageSize += stats.size
        
        const sizeKB = stats.size / 1024
        if (sizeKB > 500) { // Images larger than 500KB
          largeImages.push({ file, size: sizeKB })
        }
      }
    })
    
    console.log(`📊 Total image size: ${(totalImageSize / 1024 / 1024).toFixed(2)}MB`)
    
    if (largeImages.length > 0) {
      console.log('⚠️  Large images found:')
      largeImages.forEach(({ file, size }) => {
        console.log(`   - ${file}: ${size.toFixed(2)}KB`)
      })
    } else {
      console.log('✅ All images are optimally sized')
    }
  }
  
  console.log('')
}

// Test 4: Code Quality Checks
function testCodeQuality() {
  console.log('🔍 Testing Code Quality...')
  
  const checks = [
    {
      name: 'Dynamic Imports',
      file: 'lib/utils/dynamic-imports.ts',
      test: (content) => content.includes('dynamic(')
    },
    {
      name: 'Performance Monitor',
      file: 'lib/utils/performance-monitor.ts',
      test: (content) => content.includes('PerformanceObserver')
    },
    {
      name: 'Optimized Image Component',
      file: 'components/ui/optimized-image.tsx',
      test: (content) => content.includes('placeholder=')
    },
    {
      name: 'API Caching',
      file: 'app/api/products/route.ts',
      test: (content) => content.includes('productCache')
    }
  ]
  
  checks.forEach(({ name, file, test }) => {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      if (test(content)) {
        console.log(`✅ ${name}: Implemented`)
      } else {
        console.log(`❌ ${name}: Not properly implemented`)
      }
    } else {
      console.log(`❌ ${name}: File not found`)
    }
  })
  
  console.log('')
}

// Test 5: Configuration Validation
function testConfiguration() {
  console.log('⚙️  Testing Configuration...')
  
  const configPath = path.join(process.cwd(), 'next.config.mjs')
  if (fs.existsSync(configPath)) {
    const config = fs.readFileSync(configPath, 'utf8')
    
    const optimizations = [
      { name: 'Image Optimization', check: config.includes('formats:') },
      { name: 'Bundle Splitting', check: config.includes('splitChunks') },
      { name: 'Compression', check: config.includes('compress: true') },
      { name: 'Cache Headers', check: config.includes('Cache-Control') },
      { name: 'Package Optimization', check: config.includes('optimizePackageImports') }
    ]
    
    optimizations.forEach(({ name, check }) => {
      if (check) {
        console.log(`✅ ${name}: Enabled`)
      } else {
        console.log(`❌ ${name}: Not configured`)
      }
    })
  } else {
    console.log('❌ Next.js config file not found')
  }
  
  console.log('')
}

// Main test runner
async function runTests() {
  console.log('🎯 POS Digital Performance Test Suite')
  console.log('=====================================\n')
  
  testBundleSize()
  testImageOptimization()
  testCodeQuality()
  testConfiguration()
  
  // Only test API if server might be running
  if (process.env.TEST_API === 'true') {
    await testAPIPerformance()
  } else {
    console.log('🌐 API Performance: Skipped (set TEST_API=true to enable)')
    console.log('')
  }
  
  console.log('🏁 Performance tests completed!')
  console.log('\nTo run API tests:')
  console.log('1. Start the development server: npm run dev')
  console.log('2. Run: TEST_API=true node scripts/performance-test.js')
  console.log('\nTo analyze bundle in detail:')
  console.log('1. Build the app: npm run build')
  console.log('2. Run: npx webpack-bundle-analyzer .next/static/chunks/*.js')
}

// Run tests
runTests().catch(console.error)