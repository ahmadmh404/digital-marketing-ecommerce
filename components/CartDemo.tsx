"use client";

import useStore from "@/store";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useEcommerceUser } from "@/lib/ecommerce-context";

const CartDemo = () => {
  const {
    getTotalPrice,
    getItemCount,
    initializeCart,
    loadCartFromSanity,
    saveCartToSanity,
    syncCartWithSanity,
    getGroupedItems,
  } = useStore();

  const totalItems = getGroupedItems().reduce(
    (acc, curr) => acc + curr.quantity,
    0,
  );

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

  const handleAddTestItem = async () => {
    // This is just for demonstration - in reality, you'd get a real product
    console.log("Would add a test item to cart");
    // In a real implementation, you'd dispatch the addItem action from the store
  };

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
      // In a real app, you'd show a success message or redirect
      alert(`Order created successfully`);
    } catch (error: any) {
      alert(`Checkout failed: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Ecommerce Cart Demo</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Authentication Status:</span>
          <span
            className={`font-medium ${isSignedIn ? "text-green-600" : "text-red-600"}`}>
            {isSignedIn ? "Signed In" : "Signed Out"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Items in Cart:</span>
          <span className="font-medium">{totalItems}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Cart Total:</span>
          <span className="font-medium text-lg">
            ${getTotalPrice().toFixed(2)}
          </span>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleAddTestItem} variant="outline">
            Add Test Item
          </Button>
          <Button
            onClick={handleCheckout}
            className={isSignedIn ? "" : "opacity-50 cursor-not-allowed"}>
            Proceed to Checkout
          </Button>
        </div>
        {!isSignedIn && (
          <p className="text-sm text-red-500 mt-2">
            Please sign in to proceed to checkout
          </p>
        )}
      </div>
    </div>
  );
};

export default CartDemo;
