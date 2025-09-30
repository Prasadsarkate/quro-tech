"use client"

import { useState, useEffect } from "react"

export type CartItem = {
  internship: string
  title: string
  duration: "1-month" | "2-months" | "custom"
  // human-readable duration label (e.g., "1 Month", "2 Months", or "Customized: 120 hrs")
  durationLabel?: string
  price: number
  customHours?: number
  customWeeks?: number
}

const KEY = "qurotech.cart"

function readCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(readCart())
  }, [])

  const addItem = (item: CartItem) => {
    const next = [...items, item]
    setItems(next)
    writeCart(next)
  }

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index)
    setItems(next)
    writeCart(next)
  }

  const clear = () => {
    setItems([])
    writeCart([])
  }

  return {
    items,
    addItem,
    removeItem,
    clear,
  }
}
