"use client";

import { useEffect } from "react";
import useStore from "@/store";
import { Button } from "@/components/ui/button";
import { useEcommerceUser } from "@/lib/ecommerce-context";

const CartSummary = () => {
  const {
    getTotalPrice,
    getItemCount,
    initializeCart,
    loadCartFromSanity,
    saveCartToSanity,
  } = useStore();

  const { isSignedIn } = useEcommerceUser();

  useEffect(() => {
    // Initialize cart when component mounts
    const initCart = async () => {
      await initializeCart();
      await loadCartFromSanity();
    };

    initCart();
  }, []);

  useEffect(() => {
    // Sync cart with Sanity whenever cart changes
    if (isSignedIn) {
      saveCartToSanity();
    }
  }, [getTotalPrice(), isSignedIn]);

  const handleCheckout = async () => {
    // This would typically collect shipping/payment info
    const customerInfo = {
      customerName: "John Doe",
      email: "john@example.com",
      address: {
        state: "NY",
        zip: "10001",
        city: "New York",
        address: "123 Main St",
        name: "Home",
      },
      stripePaymentIntentId: "pi_test_123",
      stripeCustomerId: "cus_test_123",
      stripeCheckoutSessionId: "cs_test_123",
    };

    try {
      const order = await useStore.getState().checkout(customerInfo);
      console.log("Order created:", order);
      // Redirect to order confirmation or show success message
    } catch (error) {
      console.error("Checkout failed:", error);
      // Show error message to user
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Cart Summary</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Items:</span>
          <span className="font-medium">{getItemCount()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total:</span>
          <span className="font-medium text-lg">
            ${getTotalPrice().toFixed(2)}
          </span>
        </div>
        {isSignedIn ? (
          <Button onClick={handleCheckout} className="w-full">
            Proceed to Checkout
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              // In a real app, this would redirect to sign-in
              alert("Please sign in to checkout");
            }}
            className="w-full">
            Sign in to Checkout
          </Button>
        )}
      </div>
    </div>
  );
};

export default CartSummary;
