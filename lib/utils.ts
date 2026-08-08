import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine classes with tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a unique order number
 * Format: ORD-{timestamp}-{random}
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().substr(-6);
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Format price as currency
 */
export function formatPrice(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(
  price: number,
  discountPercent: number,
): number {
  return (price * discountPercent) / 100;
}

/**
 * Calculate price after discount
 */
export function calculateDiscountedPrice(
  price: number,
  discountPercent: number,
): number {
  return price - calculateDiscount(price, discountPercent);
}

/**
 * Validate if product is in stock
 */
export function isInStock(stock: number, quantity: number = 1): boolean {
  return stock >= quantity;
}

/**
 * Get stock status message
 */
export function getStockStatusMessage(
  stock: number,
  quantity: number = 1,
): string {
  if (stock === 0) return "Out of Stock";
  if (stock < quantity) return `Only ${stock} left in stock`;
  return "In Stock";
}
