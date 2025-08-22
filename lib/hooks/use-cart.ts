"use client"

import { useState, useEffect } from "react"
import type { Product, Cart, CartItem } from "@/lib/types/product"

const CART_STORAGE_KEY = "shophub-cart"

export function useCart() {
  const [cart, setCart] = useState<Cart>({
    items: [],
    total: 0,
    itemCount: 0,
  })
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load cart from localStorage on mount (only on client)
  useEffect(() => {
    if (!isClient) return

    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCart(parsedCart)
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [isClient])

  // Save cart to localStorage whenever it changes (only on client)
  useEffect(() => {
    if (!isClient) return
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  }, [cart, isClient])

  // Calculate totals
  const calculateTotals = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    return { total, itemCount }
  }

  // Add item to cart
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex((item) => item.product.id === product.id)

      let newItems: CartItem[]

      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = prevCart.items.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        // Add new item
        newItems = [...prevCart.items, { product, quantity }]
      }

      const { total, itemCount } = calculateTotals(newItems)

      return {
        items: newItems,
        total,
        itemCount,
      }
    })
  }

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.product.id !== productId)
      const { total, itemCount } = calculateTotals(newItems)

      return {
        items: newItems,
        total,
        itemCount,
      }
    })
  }

  // Update item quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) => (item.product.id === productId ? { ...item, quantity } : item))

      const { total, itemCount } = calculateTotals(newItems)

      return {
        items: newItems,
        total,
        itemCount,
      }
    })
  }

  // Clear cart
  const clearCart = () => {
    setCart({
      items: [],
      total: 0,
      itemCount: 0,
    })
  }

  // Check if product is in cart
  const isInCart = (productId: string) => {
    return cart.items.some((item) => item.product.id === productId)
  }

  // Get item quantity
  const getItemQuantity = (productId: string) => {
    const item = cart.items.find((item) => item.product.id === productId)
    return item ? item.quantity : 0
  }

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  }
}
