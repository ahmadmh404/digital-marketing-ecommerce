const { v4: uuidv4 } = require('uuid');

function generateOrder() {
  return {
    _id: uuidv4(),
    _type: 'order',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    orderNumber: `ORD-${Math.floor(Math.random() * 1000000)}`,
    invoice: {
      id: `INV-${Math.floor(Math.random() * 1000000)}`,
      number: `INV-${Math.floor(Math.random() * 1000000)}`,
      hosted_invoice_url: `https://example.com/invoice/${Math.floor(Math.random() * 1000000)}`
    },
    stripeCheckoutSessionId: `cs_test_${Math.random().toString(36).substring(2, 16)}`,
    stripeCustomerId: `cus_${Math.random().toString(36).substring(2, 16)}`,
    clerkUserId: `user_${Math.random().toString(36).substring(2, 16)}`,
    customerName: ['John Doe', 'Jane Smith', 'Bob Johnson'][Math.floor(Math.random() * 3)],
    email: `customer${Math.floor(Math.random() * 1000)}@example.com`,
    stripePaymentIntentId: `pi_${Math.random().toString(36).substring(2, 16)}`,
    products: [
      {
        product: {
          _type: 'reference',
          _ref: `product-${Math.floor(Math.random() * 1000)}`
        },
        quantity: Math.floor(Math.random() * 10) + 1,
        _key: Math.random().toString(36).substring(2, 10)
      }
    ],
    totalPrice: parseFloat((Math.random() * 1000).toFixed(2)),
    currency: 'USD',
    amountDiscount: parseFloat((Math.random() * 100).toFixed(2)),
    address: {
      state: ['NY', 'CA', 'TX', 'FL'][Math.floor(Math.random() * 4)],
      zip: `${Math.floor(Math.random() * 90000) + 10000}`,
      city: ['New York', 'Los Angeles', 'Chicago', 'Houston'][Math.floor(Math.random() * 4)],
      address: `${Math.floor(Math.random() * 1000)} Main St`,
      name: ['John Doe', 'Jane Smith'][Math.floor(Math.random() * 2)]
    },
    status: ['pending', 'processing', 'paid', 'shipped', 'delivered'][Math.floor(Math.random() * 5)],
    orderDate: new Date().toISOString()
  };
}

// Generate 10 orders for seeding
const orders = Array.from({ length: 10 }, generateOrder);
// Output as NDJSON
orders.forEach(order => console.log(JSON.stringify(order)));
