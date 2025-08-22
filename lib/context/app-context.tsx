"use client"

import React, { createContext, useContext, useReducer, useEffect } from "react"
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
  | { type: "ADD_RECENTLY_VIEWED"; payload: string }
  | { type: "ADD_SEARCH_HISTORY"; payload: string }
  | { type: "CLEAR_SEARCH_HISTORY" }
  | { type: "UPDATE_FILTERS"; payload: Partial<ProductFilters> }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_THEME"; payload: "light" | "dark" | "system" }

const initialState: AppState = {
  cart: { items: [], total: 0, itemCount: 0 },
  wishlist: [],
  recentlyViewed: [],
  searchHistory: [],
  filters: {},
  theme: "system",
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

      const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return {
        ...state,
        cart: { items: newItems, total, itemCount },
      }
    }

    case "REMOVE_FROM_CART": {
      const newItems = state.cart.items.filter((item) => item.product.id !== action.payload)
      const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

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
      const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

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
      return {
        ...state,
        wishlist: state.wishlist.includes(action.payload)
          ? state.wishlist
          : [...state.wishlist, action.payload],
      }

    case "REMOVE_FROM_WISHLIST":
      return {
        ...state,
        wishlist: state.wishlist.filter((id) => id !== action.payload),
      }

    case "ADD_RECENTLY_VIEWED":
      return {
        ...state,
        recentlyViewed: [
          action.payload,
          ...state.recentlyViewed.filter((id) => id !== action.payload),
        ].slice(0, 10),
      }

    case "ADD_SEARCH_HISTORY":
      return {
        ...state,
        searchHistory: [
          action.payload,
          ...state.searchHistory.filter((term) => term !== action.payload),
        ].slice(0, 10),
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

    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  addRecentlyViewed: (productId: string) => void
  addSearchHistory: (searchTerm: string) => void
  clearSearchHistory: () => void
  updateFilters: (filters: Partial<ProductFilters>) => void
  clearFilters: () => void
  setTheme: (theme: "light" | "dark" | "system") => void
  isInCart: (productId: string) => boolean
  isInWishlist: (productId: string) => boolean
  getCartItemQuantity: (productId: string) => number
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("shophub-app-state")
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        // Only restore safe state properties
        if (parsedState.cart && Array.isArray(parsedState.cart.items) && parsedState.cart.items.length > 0) {
          parsedState.cart.items.forEach((item: any) => {
            if (item.product && item.quantity) {
              dispatch({ type: "ADD_TO_CART", payload: { product: item.product, quantity: item.quantity } })
            }
          })
        }
        if (parsedState.wishlist && Array.isArray(parsedState.wishlist)) {
          parsedState.wishlist.forEach((id: string) => {
            if (typeof id === "string") {
              dispatch({ type: "ADD_TO_WISHLIST", payload: id })
            }
          })
        }
        if (parsedState.theme && ["light", "dark", "system"].includes(parsedState.theme)) {
          dispatch({ type: "SET_THEME", payload: parsedState.theme })
        }
      }
    } catch (error) {
      console.error("Error loading app state from localStorage:", error)
      // Clear corrupted localStorage data
      try {
        localStorage.removeItem("shophub-app-state")
      } catch (clearError) {
        console.error("Error clearing localStorage:", clearError)
      }
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("shophub-app-state", JSON.stringify(state))
  }, [state])

  const addToCart = (product: Product, quantity = 1) => {
    dispatch({ type: "ADD_TO_CART", payload: { product, quantity } })
  }

  const removeFromCart = (productId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId })
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_CART_QUANTITY", payload: { productId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const addToWishlist = (productId: string) => {
    dispatch({ type: "ADD_TO_WISHLIST", payload: productId })
  }

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: productId })
  }

  const addRecentlyViewed = (productId: string) => {
    dispatch({ type: "ADD_RECENTLY_VIEWED", payload: productId })
  }

  const addSearchHistory = (searchTerm: string) => {
    dispatch({ type: "ADD_SEARCH_HISTORY", payload: searchTerm })
  }

  const clearSearchHistory = () => {
    dispatch({ type: "CLEAR_SEARCH_HISTORY" })
  }

  const updateFilters = (filters: Partial<ProductFilters>) => {
    dispatch({ type: "UPDATE_FILTERS", payload: filters })
  }

  const clearFilters = () => {
    dispatch({ type: "CLEAR_FILTERS" })
  }

  const setTheme = (theme: "light" | "dark" | "system") => {
    dispatch({ type: "SET_THEME", payload: theme })
  }

  const isInCart = (productId: string) => {
    return state.cart.items.some((item) => item.product.id === productId)
  }

  const isInWishlist = (productId: string) => {
    return state.wishlist.includes(productId)
  }

  const getCartItemQuantity = (productId: string) => {
    const item = state.cart.items.find((item) => item.product.id === productId)
    return item ? item.quantity : 0
  }

  const value: AppContextType = {
    state,
    dispatch,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    addRecentlyViewed,
    addSearchHistory,
    clearSearchHistory,
    updateFilters,
    clearFilters,
    setTheme,
    isInCart,
    isInWishlist,
    getCartItemQuantity,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
