# Next.js 15 Params Migration Guide

## Overview
In Next.js 15, the `params` object in dynamic route components is now a **Promise** instead of a plain object. This change requires updating how you access route parameters.

## What Changed

### Before (Next.js 14 and earlier)
```typescript
interface PageProps {
  params: {
    id: string
  }
}

export default function Page({ params }: PageProps) {
  const productId = params.id // Direct access
  // ... rest of component
}
```

### After (Next.js 15+)
```typescript
import React from 'react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function Page({ params }: PageProps) {
  const { id } = React.use(params) // Unwrap with React.use()
  // ... rest of component
}
```

## Key Changes Required

### 1. Update Type Definitions
```typescript
// OLD
params: { id: string }

// NEW
params: Promise<{ id: string }>
```

### 2. Unwrap Params with React.use()
```typescript
// OLD
const productId = params.id

// NEW
const { id } = React.use(params)
```

### 3. Import React
```typescript
import React from 'react'
// or
import { use } from 'react'
```

## Files Updated

### ✅ Fixed
- `app/products/[id]/page.tsx` - Updated to use `React.use(params)`

### 🔍 Check These Files
- Any other dynamic route files with `[param]` in the path
- Components that receive `params` as props
- Server components that access route parameters

## Migration Steps

### Step 1: Identify Dynamic Routes
Look for files in directories like:
- `app/products/[id]/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/user/[userId]/page.tsx`

### Step 2: Update Type Definitions
Change the `params` type from object to Promise:
```typescript
// Before
params: { id: string }

// After
params: Promise<{ id: string }>
```

### Step 3: Add React Import
```typescript
import React from 'react'
```

### Step 4: Unwrap Params
```typescript
// Before
const productId = params.id

// After
const { id } = React.use(params)
```

## Alternative Approaches

### Option 1: Destructure with React.use()
```typescript
const { id, slug } = React.use(params)
```

### Option 2: Use React.use() directly
```typescript
import { use } from 'react'

const { id } = use(params)
```

### Option 3: Store in variable first
```typescript
const resolvedParams = React.use(params)
const { id } = resolvedParams
```

## Benefits of This Change

1. **Better Performance**: Params are resolved asynchronously
2. **Improved SSR**: Better handling of dynamic routes
3. **Future-Proof**: Aligns with React's concurrent features
4. **Consistent API**: Matches other async patterns in Next.js

## Common Patterns

### Single Parameter
```typescript
const { id } = React.use(params)
```

### Multiple Parameters
```typescript
const { id, slug, category } = React.use(params)
```

### Nested Parameters
```typescript
const { id, variant } = React.use(params)
```

### With Search Params
```typescript
interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ category?: string }>
}

export default function Page({ params, searchParams }: PageProps) {
  const { id } = React.use(params)
  const { category } = React.use(searchParams)
  // ...
}
```

## Testing

### 1. Build the Application
```bash
npm run build
```

### 2. Check for TypeScript Errors
```bash
npm run type-check
# or
npx tsc --noEmit
```

### 3. Test Dynamic Routes
- Navigate to dynamic routes
- Check browser console for errors
- Verify parameters are correctly extracted

## Troubleshooting

### Error: "params is not defined"
- Ensure you're importing React
- Check that `params` is properly typed as Promise

### Error: "React.use is not a function"
- Make sure you're using React 18+ and Next.js 15+
- Verify the React import is correct

### TypeScript Errors
- Update all type definitions for `params`
- Ensure consistent Promise typing across components

## Future Considerations

1. **Server Components**: Consider converting to server components where possible
2. **Performance**: Take advantage of async params for better loading states
3. **Error Boundaries**: Implement proper error handling for failed param resolution
4. **Loading States**: Add loading indicators while params are being resolved

## Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React.use() Documentation](https://react.dev/reference/react/use)
- [Next.js Migration Guide](https://nextjs.org/docs/upgrading)

