"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Product, Order } from "./sanity.types";
import { backendClient } from "./sanity/lib/backendClient";
import { ecommerceMutations } from "./sanity/lib/mutations";
import { useEcommerceUser } from "./lib/ecommerce-context";
import { User } from "@clerk/nextjs/server";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface StoreState {
  userId: string | null;
  initUserInfo: (userId: string | null) => void;
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  deleteCartProduct: (productId: string) => void;
  resetCart: () => void;
  getTotalPrice: () => number;
  getSubTotalPrice: () => number;
  getItemCount: (productId: string) => number;
  getGroupedItems: () => CartItem[];
  //   // favorite
  favoriteProduct: Product[];
  addToFavorite: (product: Product) => Promise<void>;
  removeFromFavorite: (productId: string) => void;
  resetFavorite: () => void;
  // Ecommerce specific
  initializeCart: () => Promise<void>;
  syncCartWithSanity: () => Promise<void>;
  saveCartToSanity: () => Promise<void>;
  loadCartFromSanity: () => Promise<void>;
  checkout: (customerInfo: any) => Promise<boolean>;
}

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      userId: null,
      initUserInfo: (userId) => {
        set((state) => ({ ...state, userId }));
      },
      items: [],
      favoriteProduct: [],
      addItem: (product) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product._id === product._id,
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product._id === product._id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          } else {
            return { items: [...state.items, { product, quantity: 1 }] };
          }
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.reduce((acc, item) => {
            if (item.product._id === productId) {
              if (item.quantity > 1) {
                acc.push({ ...item, quantity: item.quantity - 1 });
              }
            } else {
              acc.push(item);
            }
            return acc;
          }, [] as CartItem[]),
        })),
      deleteCartProduct: (productId) =>
        set((state) => ({
          items: state.items.filter(
            ({ product }) => product?._id !== productId,
          ),
        })),
      resetCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.product.price ?? 0) * item.quantity,
          0,
        );
      },
      getSubTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.price ?? 0;
          const discount = ((item.product.discount ?? 0) * price) / 100;
          const discountedPrice = price + discount;
          return total + discountedPrice * item.quantity;
        }, 0);
      },
      getItemCount: (productId) => {
        const item = get().items.find((item) => item.product._id === productId);
        return item ? item.quantity : 0;
      },
      getGroupedItems: () => get().items,
      addToFavorite: (product: Product) => {
        return new Promise<void>((resolve) => {
          set((state: StoreState) => {
            const isFavorite = state.favoriteProduct.some(
              (item) => item._id === product._id,
            );
            return {
              favoriteProduct: isFavorite
                ? state.favoriteProduct.filter(
                    (item) => item._id !== product._id,
                  )
                : [...state.favoriteProduct, { ...product }],
            };
          });
          resolve();
        });
      },
      removeFromFavorite: (productId: string) => {
        set((state: StoreState) => ({
          favoriteProduct: state.favoriteProduct.filter(
            (item) => item?._id !== productId,
          ),
        }));
      },
      resetFavorite: () => {
        set({ favoriteProduct: [] });
      },
      // Ecommerce specific methods - now using Clerk for session/user
      initializeCart: async () => {
        const userId = get().userId;

        // Generate or retrieve session ID
        let sessionId = localStorage.getItem("ecommerce-session-id");
        if (!sessionId) {
          sessionId = Math.random().toString(36).substr(2, 9);
          localStorage.setItem("ecommerce-session-id", sessionId);
        }

        if (!userId) {
          return;
        }

        try {
          // Try to load cart from Sanity first
          const sanityCart = await backendClient
            .fetch<{ _id: string; products: any[] }>(
              `*[_type == "order" && _id == $cartId][0]`,
              {
                cartId: `cart-${sessionId}`,
              },
            )
            .then((res: { _id: string; products: any[] } | null) => res)
            .catch(() => null);

          if (sanityCart && sanityCart.products) {
            // Convert Sanity cart format to local format
            const cartItems: CartItem[] = [];
            for (const item of sanityCart.products) {
              if (item.product?._ref) {
                const product = await backendClient
                  .fetch<Product>(
                    `*[_type == "product" && _id == $productId][0]`,
                    {
                      productId: item.product._ref,
                    },
                  )
                  .then((res: Product | null) => res)
                  .catch(() => null);
                if (product) {
                  cartItems.push({ product, quantity: item.quantity || 0 });
                }
              }
            }
            set({ items: cartItems });
            return;
          }

          // If no cart in Sanity, create one
          await ecommerceMutations.createCart(userId, sessionId);
        } catch (error) {
          console.error("Failed to initialize cart:", error);
          // Fall back to local storage only
        }
      },

      syncCartWithSanity: async () => {
        const { userId } = useEcommerceUser();
        let sessionId = localStorage.getItem("ecommerce-session-id");
        if (!sessionId) {
          sessionId = Math.random().toString(36).substr(2, 9);
          localStorage.setItem("ecommerce-session-id", sessionId);
        }

        try {
          const localItems = get().items;
          if (localItems.length === 0) {
            // Clear cart in Sanity if local is empty
            await backendClient.delete(`cart-${sessionId}`);
            return;
          }

          // Convert local cart to Sanity format and save
          const cartData = {
            _type: "order",
            _id: `cart-${sessionId}`,
            clerkUserId: userId, // Now using actual Clerk user ID
            status: "pending",
            products: localItems.map((item) => ({
              product: { _ref: item.product._id, _type: "reference" },
              quantity: item.quantity,
              _key: Math.random().toString(36).substr(2, 9),
            })),
            totalPrice: get().getTotalPrice(),
            currency: "USD",
            amountDiscount: 0,
            orderDate: new Date().toISOString(),
          };

          await backendClient.createIfNotExists(cartData);
        } catch (error) {
          console.error("Failed to sync cart with Sanity:", error);
        }
      },

      saveCartToSanity: async () => {
        await get().syncCartWithSanity();
      },

      loadCartFromSanity: async () => {
        let sessionId = localStorage.getItem("ecommerce-session-id");
        if (!sessionId) {
          sessionId = Math.random().toString(36).substr(2, 9);
          localStorage.setItem("ecommerce-session-id", sessionId);
        }

        try {
          const sanityCart = await backendClient
            .fetch<{ _id: string; products: any[] }>(
              `*[_type == "order" && _id == $cartId][0]`,
              {
                cartId: `cart-${sessionId}`,
              },
            )
            .then((res: { _id: string; products: any[] } | null) => res)
            .catch(() => null);

          if (sanityCart && sanityCart.products) {
            // Convert Sanity cart format to local format
            const cartItems: CartItem[] = [];
            for (const item of sanityCart.products) {
              if (item.product?._ref) {
                const product = await backendClient
                  .fetch<Product>(
                    `*[_type == "product" && _id == $productId][0]`,
                    {
                      productId: item.product._ref,
                    },
                  )
                  .then((res: Product | null) => res)
                  .catch(() => null);
                if (product) {
                  cartItems.push({ product, quantity: item.quantity || 0 });
                }
              }
            }
            set({ items: cartItems });
          }
        } catch (error) {
          console.error("Failed to load cart from Sanity:", error);
        }
      },

      checkout: async (customerInfo: any) => {
        let sessionId = localStorage.getItem("ecommerce-session-id");
        if (!sessionId) {
          sessionId = Math.random().toString(36).substr(2, 9);
          localStorage.setItem("ecommerce-session-id", sessionId);
        }

        try {
          const success = await ecommerceMutations.convertCartToOrder(
            sessionId,
            customerInfo,
          );

          if (success) {
            // Clear local cart after successful checkout
            set({ items: [] });
            return true;
          } else {
            throw new Error("Failed to create order");
          }
        } catch (error) {
          console.error("Checkout failed:", error);
          throw error;
        }
      },
    }),
    {
      name: "cart-store",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => localStorage)
          : undefined,
    },
  ),
);

export default useStore;

// Auto-initialize cart when store is used
if (typeof window !== "undefined") {
  useStore.subscribe((state) => {
    // Initialize cart on first use

    const { initializeCart } = useStore.getState();

    initializeCart().catch(console.error);
  });
}
