import CartSummary from "@/components/CartSummary";

const TestCartPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Ecommerce Cart Test</h1>
      <CartSummary />
    </div>
  );
};

export default TestCartPage;