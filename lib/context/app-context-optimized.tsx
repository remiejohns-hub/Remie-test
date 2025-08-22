"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from "react"
import type { Product, Cart, CartItem, ProductFilters } from "@/lib/types/product"

interface AppState {
  cart: Cart
  wishlist: string[]
  recentlyViewed: string[]
  searchHistory: string[]
  filters: ProductFilters
  theme: "light" | "dark" | "system"
}

type AppAction =
  | { type: "ADD_TO_CART"; payload: { product: Product; quantity: number } }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_CART_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "ADD_TO_WISHLIST"; payload: string }
  | { type: "REMOVE_FROM_WISHLIST"; payload: string }
  | { type: "TOGGLE_WISHLIST"; payload: string }
  | { type: "ADD_RECENTLY_VIEWED"; payload: string }
  | { type: "ADD_SEARCH_HISTORY"; payload: string }
  | { type: "CLEAR_SEARCH_HISTORY" }
  | { type: "UPDATE_FILTERS"; payload: Partial<ProductFilters> }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_THEME"; payload: "light" | "dark" | "system" }
  | { type: "HYDRATE_STATE"; payload: Partial<AppState> }

const initialState: AppState = {
  cart: { items: [], total: 0, itemCount: 0 },
  wishlist: [],
  recentlyViewed: [],
  searchHistory: [],
  filters: {},
  theme: "system",
}

// Optimized cart calculations
function calculateCartTotals(items: CartItem[]): { total: number; itemCount: number } {
  let total = 0
  let itemCount = 0
  
  for (const item of items) {
    total += item.product.price * item.quantity
    itemCount += item.quantity
  }
  
  return { total, itemCount }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { product, quantity } = action.payload
      const existingItemIndex = state.cart.items.findIndex(
        (item) => item.product.id === product.id
      )

      let newItems: CartItem[]
      if (existingItemIndex >= 0) {
        newItems = state.cart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        newItems = [...state.cart.items, { product, quantity }]
      }

      const { total, itemCount } = calculateCartTotals(newItems)

      return {
        ...state,
        cart: { items: newItems, total, itemCount },
      }
    }

    case "REMOVE_FROM_CART": {
      const newItems = state.cart.items.filter((item) => item.product.id !== action.payload)
      const { total, itemCount } = calculateCartTotals(newItems)

      return {
        ...state,
        cart: { items: newItems, total, itemCount },
      }
    }

    case "UPDATE_CART_QUANTITY": {
      const { productId, quantity } = action.payload
      if (quantity <= 0) {
        return appReducer(state, { type: "REMOVE_FROM_CART", payload: productId })
      }

      const newItems = state.cart.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
      const { total, itemCount } = calculateCartTotals(newItems)

      return {
        ...state,
        cart: { items: newItems, total, itemCount },
      }
    }

    case "CLEAR_CART":
      return {
        ...state,
        cart: { items: [], total: 0, itemCount: 0 },
      }

    case "ADD_TO_WISHLIST":
      if (state.wishlist.includes(action.payload)) {
        return state
      }
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload],
      }

    case "REMOVE_FROM_WISHLIST":
      return {
        ...state,
        wishlist: state.wishlist.filter((id) => id !== action.payload),
      }

    case "TOGGLE_WISHLIST":
      return {
        ...state,
        wishlist: state.wishlist.includes(action.payload)
          ? state.wishlist.filter((id) => id !== action.payload)
          : [...state.wishlist, action.payload],
      }

    case "ADD_RECENTLY_VIEWED": {
      const filtered = state.recentlyViewed.filter((id) => id !== action.payload)
      return {
        ...state,
        recentlyViewed: [action.payload, ...filtered].slice(0, 10),
      }
    }

    case "ADD_SEARCH_HISTORY": {
      const filtered = state.searchHistory.filter((term) => term !== action.payload)
      return {
        ...state,
        searchHistory: [action.payload, ...filtered].slice(0, 10),
      }
    }

    case "CLEAR_SEARCH_HISTORY":
      return {
        ...state,
        searchHistory: [],
      }

    case "UPDATE_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      }

    case "CLEAR_FILTERS":
      return {
        ...state,
        filters: {},
      }

    case "SET_THEME":
      return {
        ...state,
        theme: action.payload,
      }

    case "HYDRATE_STATE":
      return {
        ...state,
        ...action.payload,
      }

    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  // Cart actions
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  getCartItemQuantity: (productId: string) => number
  // Wishlist actions
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  toggleWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  // Other actions
  addRecentlyViewed: (productId: string) => void
  addSearchHistory: (searchTerm: string) => void
  clearSearchHistory: () => void
  updateFilters: (filters: Partial<ProductFilters>) => void
  clearFilters: () => void
  setTheme: (theme: "light" | "dark" | "system") => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEY = "shophub-app-state"

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY)
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        
        // Validate and hydrate state safely
        const hydrateData: Partial<AppState> = {}
        
        if (parsedState.cart && Array.isArray(parsedState.cart.items)) {
          const { total, itemCount } = calculateCartTotals(parsedState.cart.items)
          hydrateData.cart = {
            items: parsedState.cart.items,
            total,
            itemCount
          }
        }
        
        if (Array.isArray(parsedState.wishlist)) {
          hydrateData.wishlist = parsedState.wishlist.filter((id: any) => typeof id === "string")
        }
        
        if (Array.isArray(parsedState.recentlyViewed)) {
          hydrateData.recentlyViewed = parsedState.recentlyViewed.filter((id: any) => typeof id === "string").slice(0, 10)
        }
        
        if (Array.isArray(parsedState.searchHistory)) {
          hydrateData.searchHistory = parsedState.searchHistory.filter((term: any) => typeof term === "string").slice(0, 10)
        }
        
        if (parsedState.theme && ["light", "dark", "system"].includes(parsedState.theme)) {
          hydrateData.theme = parsedState.theme
        }
        
        if (parsedState.filters && typeof parsedState.filters === "object") {
          hydrateData.filters = parsedState.filters
        }
        
        dispatch({ type: "HYDRATE_STATE", payload: hydrateData })
      }
    } catch (error) {
      console.error("Error loading app state from localStorage:", error)
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (clearError) {
        console.error("Error clearing localStorage:", clearError)
      }
    }
  }, [])

  // Debounced save to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (error) {
        console.error("Error saving app state to localStorage:", error)
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [state])

  // Memoized action creators
  const addToCart = useCallback((product: Product, quantity = 1) => {
    dispatch({ type: "ADD_TO_CART", payload: { product, quantity } })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId })
  }, [])

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_CART_QUANTITY", payload: { productId, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" })
  }, [])

  const addToWishlist = useCallback((productId: string) => {
    dispatch({ type: "ADD_TO_WISHLIST", payload: productId })
  }, [])

  const removeFromWishlist = useCallback((productId: string) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: productId })
  }, [])

  const toggleWishlist = useCallback((productId: string) => {
    dispatch({ type: "TOGGLE_WISHLIST", payload: productId })
  }, [])

  const addRecentlyViewed = useCallback((productId: string) => {
    dispatch({ type: "ADD_RECENTLY_VIEWED", payload: productId })
  }, [])

  const addSearchHistory = useCallback((searchTerm: string) => {
    if (searchTerm.trim()) {
      dispatch({ type: "ADD_SEARCH_HISTORY", payload: searchTerm.trim() })
    }
  }, [])

  const clearSearchHistory = useCallback(() => {
    dispatch({ type: "CLEAR_SEARCH_HISTORY" })
  }, [])

  const updateFilters = useCallback((filters: Partial<ProductFilters>) => {
    dispatch({ type: "UPDATE_FILTERS", payload: filters })
  }, [])

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" })
  }, [])

  const setTheme = useCallback((theme: "light" | "dark" | "system") => {
    dispatch({ type: "SET_THEME", payload: theme })
  }, [])

  // Memoized selectors
  const isInCart = useCallback((productId: string) => {
    return state.cart.items.some((item) => item.product.id === productId)
  }, [state.cart.items])

  const isInWishlist = useCallback((productId: string) => {
    return state.wishlist.includes(productId)
  }, [state.wishlist])

  const getCartItemQuantity = useCallback((productId: string) => {
    const item = state.cart.items.find((item) => item.product.id === productId)
    return item ? item.quantity : 0
  }, [state.cart.items])

  const value = useMemo<AppContextType>(() => ({
    state,
    dispatch,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    addRecentlyViewed,
    addSearchHistory,
    clearSearchHistory,
    updateFilters,
    clearFilters,
    setTheme,
    isInCart,
    isInWishlist,
    getCartItemQuantity,
  }), [
    state,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    addRecentlyViewed,
    addSearchHistory,
    clearSearchHistory,
    updateFilters,
    clearFilters,
    setTheme,
    isInCart,
    isInWishlist,
    getCartItemQuantity,
  ])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

// Optimized cart hook that uses the app context
export function useCart() {
  const { state, addToCart, removeFromCart, updateCartQuantity, clearCart, isInCart, getCartItemQuantity } = useApp()
  
  return {
    cart: state.cart,
    addToCart,
    removeFromCart,
    updateQuantity: updateCartQuantity,
    clearCart,
    isInCart,
    getItemQuantity: getCartItemQuantity,
  }
}