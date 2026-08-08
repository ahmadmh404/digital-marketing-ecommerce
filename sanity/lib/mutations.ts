import { generateOrderNumber } from "../../lib/utils";
import type {
  Product,
  Order,
  MY_ORDERS_QUERY_RESULT,
} from "../../sanity.types";
import { backendClient } from "./backendClient";

/**
 * Mutations for ecommerce operations
 */

export const ecommerceMutations = {
  /**
   * Create a new cart for a user/session
   */
  createCart: async (userId: string | null, sessionId: string) => {
    const cartData = {
      _type: "order",
      _id: `cart-${sessionId}`,
      clerkUserId: userId || null,
      status: "pending", // Using pending as cart status
      products: [],
      totalPrice: 0,
      currency: "USD",
      amountDiscount: 0,
      orderDate: new Date().toISOString(),
    };

    return await backendClient.createIfNotExists(cartData);
  },

  /**
   * Add item to cart
   */
  addItemToCart: async (
    sessionId: string,
    productId: string,
    quantity: number = 1,
  ) => {
    // First get current cart
    const cart = await backendClient
      .fetch<{ _id: string; products: any[] }>(
        `*[_type == "order" && _id == $cartId][0]`,
        {
          cartId: `cart-${sessionId}`,
        },
      )
      .then((res: { _id: string; products: any[] } | null) => res)
      .catch(() => null);

    if (!cart) {
      throw new Error("Cart not found");
    }

    // Get product details
    const product = await backendClient
      .fetch<Product>(`*[_type == "product" && _id == $productId][0]`, {
        productId,
      })
      .then((res: Product | null) => res)
      .catch(() => null);

    if (!product) {
      throw new Error("Product not found");
    }

    // Check if item already in cart
    const existingItemIndex = cart.products.findIndex(
      (item: any) => item.product?._ref === productId,
    );

    let updatedProducts;
    if (existingItemIndex >= 0) {
      // Update quantity
      updatedProducts = [...cart.products];
      updatedProducts[existingItemIndex] = {
        ...updatedProducts[existingItemIndex],
        quantity: (updatedProducts[existingItemIndex].quantity || 0) + quantity,
      };
    } else {
      // Add new item
      updatedProducts = [
        ...cart.products,
        {
          product: { _ref: productId, _type: "reference" },
          quantity,
          _key: Math.random().toString(36).substr(2, 9),
        },
      ];
    }

    // Calculate new total
    const totalPrice = await Promise.all(
      updatedProducts.map(async (item: any) => {
        if (!item.product?._ref) return 0;
        const product = await backendClient
          .fetch<Product>(`*[_type == "product" && _id == $productId][0]`, {
            productId: item.product._ref,
          })
          .then((res: Product | null) => res)
          .catch(() => null);
        return (product?.price || 0) * (item.quantity || 0);
      }),
    ).then((prices: number[]) =>
      prices.reduce((sum: number, price: number) => sum + price, 0),
    );

    // Update cart
    return await backendClient
      .patch(`cart-${sessionId}`)
      .set({
        products: updatedProducts,
        totalPrice,
      })
      .commit();
  },

  /**
   * Remove item from cart
   */
  removeItemFromCart: async (
    sessionId: string,
    productId: string,
    quantityToRemove: number = 1,
  ) => {
    const cart = await backendClient
      .fetch<{ _id: string; products: any[] }>(
        `*[_type == "order" && _id == $cartId][0]`,
        {
          cartId: `cart-${sessionId}`,
        },
      )
      .then((res) => res)
      .catch(() => null);

    if (!cart) {
      throw new Error("Cart not found");
    }

    const existingItemIndex = cart.products.findIndex(
      (item: any) => item.product?._ref === productId,
    );

    if (existingItemIndex < 0) {
      throw new Error("Item not found in cart");
    }

    const updatedProducts = [...cart.products];
    const item = updatedProducts[existingItemIndex];

    if ((item.quantity || 0) <= quantityToRemove) {
      // Remove item completely
      updatedProducts.splice(existingItemIndex, 1);
    } else {
      // Decrease quantity
      updatedProducts[existingItemIndex] = {
        ...item,
        quantity: (item.quantity || 0) - quantityToRemove,
      };
    }

    // Get product price for total calculation
    const product = await backendClient
      .fetch<Product>(`*[_type == "product" && _id == $productId][0]`, {
        productId,
      })
      .then((res: Product | null) => res)
      .catch(() => null);

    // Calculate new total
    const totalPrice = await Promise.all(
      updatedProducts.map(async (item: any) => {
        if (!item.product?._ref) return 0;
        const product = await backendClient
          .fetch<Product>(`*[_type == "product" && _id == $productId][0]`, {
            productId: item.product._ref,
          })
          .then((res) => res)
          .catch(() => null);
        return (product?.price || 0) * (item.quantity || 0);
      }),
    ).then((prices: number[]) =>
      prices.reduce((sum: number, price: number) => sum + price, 0),
    );

    return await backendClient
      .patch(`cart-${sessionId}`)
      .set({
        products: updatedProducts,
        totalPrice,
      })
      .commit();
  },

  /**
   * Update cart item quantity
   */
  updateCartItemQuantity: async (
    sessionId: string,
    productId: string,
    quantity: number,
  ) => {
    if (quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }

    const cart = await backendClient
      .fetch<{ _id: string; products: any[] }>(
        `*[_type == "order" && _id == $cartId][0]`,
        {
          cartId: `cart-${sessionId}`,
        },
      )
      .then((res) => res)
      .catch(() => null);

    if (!cart) {
      throw new Error("Cart not found");
    }

    const existingItemIndex = cart.products.findIndex(
      (item: any) => item.product?._ref === productId,
    );

    if (existingItemIndex < 0 && quantity > 0) {
      // Item doesn't exist but we want to add it
      return await ecommerceMutations.addItemToCart(
        sessionId,
        productId,
        quantity,
      );
    }

    if (quantity === 0) {
      // Remove item
      return await ecommerceMutations.removeItemFromCart(
        sessionId,
        productId,
        999,
      ); // Large number to ensure removal
    }

    // Update quantity
    const updatedProducts = [...cart.products];
    if (existingItemIndex >= 0) {
      updatedProducts[existingItemIndex] = {
        ...updatedProducts[existingItemIndex],
        quantity,
      };
    }

    // Calculate new total
    const totalPrice = await Promise.all(
      updatedProducts.map(async (item: any) => {
        if (!item.product?._ref) return 0;
        const product = await backendClient
          .fetch<Product>(`*[_type == "product" && _id == $productId][0]`, {
            productId: item.product._ref,
          })
          .then((res) => res)
          .catch(() => null);
        return (product?.price || 0) * (item.quantity || 0);
      }),
    ).then((prices: number[]) =>
      prices.reduce((sum: number, price: number) => sum + price, 0),
    );

    return await backendClient
      .patch(`cart-${sessionId}`)
      .set({
        products: updatedProducts,
        totalPrice,
      })
      .commit();
  },

  /**
   * Delete cart
   */
  deleteCart: async (sessionId: string) => {
    return await backendClient.delete(`cart-${sessionId}`);
  },

  /**
   * Convert cart to order
   */
  convertCartToOrder: async (
    sessionId: string,
    customerInfo: {
      customerName: string;
      email: string;
      address: {
        state: string;
        zip: string;
        city: string;
        address: string;
        name: string;
      };
      stripePaymentIntentId: string;
      stripeCustomerId: string;
      stripeCheckoutSessionId?: string;
    },
  ) => {
    // Start transaction for atomic operation
    const transaction = backendClient.transaction();

    // Get cart
    const cart = await backendClient
      .fetch<{ _id: string; clerkUserId: string | null; products: any[] }>(
        `*[_type == "order" && _id == $cartId][0]`,
        {
          cartId: `cart-${sessionId}`,
        },
      )
      .then(
        (
          res: {
            _id: string;
            clerkUserId: string | null;
            products: any[];
          } | null,
        ) => res,
      )
      .catch(() => null);

    if (!cart) {
      throw new Error("Cart not found");
    }

    if (!cart.products || cart.products.length === 0) {
      throw new Error("Cart is empty");
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Validate stock and prepare order products
    const orderProducts = await Promise.all(
      cart.products.map(async (item: any) => {
        if (!item.product?._ref) {
          throw new Error("Invalid product reference");
        }

        const product = await backendClient
          .fetch<Product>(`*[_type == "product" && _id == $productId][0]`, {
            productId: item.product._ref,
          })
          .then((res: Product | null) => res)
          .catch(() => null);

        if (!product) {
          throw new Error(`Product not found: ${item.product._ref}`);
        }

        if ((product.stock || 0) < (item.quantity || 0)) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${
              product.stock || 0
            }, Requested: ${item.quantity || 0}`,
          );
        }

        return {
          product: { _ref: item.product._ref, _type: "reference" },
          quantity: item.quantity,
          _key: item._key || Math.random().toString(36).substr(2, 9),
        };
      }),
    );

    // Calculate totals
    const totalPrice = await Promise.all(
      orderProducts.map(async (item: any) => {
        if (!item.product?._ref) return 0;
        const product = await backendClient
          .fetch<Product>(`*[_type == "product" && _id == $productId][0]`, {
            productId: item.product._ref,
          })
          .then((res) => res)
          .catch(() => null);
        return (product?.price || 0) * (item.quantity || 0);
      }),
    ).then((prices: number[]) =>
      prices.reduce((sum: number, price: number) => sum + price, 0),
    );

    // Create order document
    const orderData = {
      _type: "order",
      orderNumber,
      clerkUserId: cart.clerkUserId || null,
      customerName: customerInfo.customerName,
      email: customerInfo.email,
      stripePaymentIntentId: customerInfo.stripePaymentIntentId,
      stripeCustomerId: customerInfo.stripeCustomerId,
      stripeCheckoutSessionId: customerInfo.stripeCheckoutSessionId,
      products: orderProducts,
      totalPrice,
      currency: "USD",
      amountDiscount: 0, // Could be calculated from cart discounts
      address: customerInfo.address,
      status: "paid", // Assuming payment is processed
      orderDate: new Date().toISOString(),
    };

    // Add order creation to transaction
    transaction.create(orderData);

    // Add stock updates to transaction
    orderProducts.forEach((item: any) => {
      if (item.product?._ref && item.quantity) {
        transaction.patch(item.product._ref, (product: any) =>
          product.inc({ stock: -item.quantity }),
        );
      }
    });

    // Delete cart after successful order creation
    transaction.delete(`cart-${sessionId}`);

    // Commit transaction
    await transaction.commit();
    return true;
  },

  /**
   * Get user's cart
   */
  getCart: async (sessionId: string) => {
    return await backendClient
      .fetch<{ _id: string; products: any[] }>(
        `*[_type == "order" && _id == $cartId][0]`,
        {
          cartId: `cart-${sessionId}`,
        },
      )
      .then((res: { _id: string; products: any[] } | null) => res)
      .catch(() => null);
  },

  /**
   * Get user's orders
   */
  getUserOrders: async (userId: string) => {
    return await backendClient.fetch<MY_ORDERS_QUERY_RESULT>(
      `*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc)`,
      { userId },
    );
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId: string, status: Order["status"]) => {
    return await backendClient.patch(orderId).set({ status }).commit();
  },
};

export default ecommerceMutations;
