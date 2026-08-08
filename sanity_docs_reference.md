# Sanity Documentation Reference for Ecommerce Mutations

## Key Sanity Client Methods

### Creating Documents

```javascript
// Create a single document
await backendClient.create({
  _type: "order",
  orderNumber: "ORD-001",
  customerName: "John Doe",
  // ... other fields
});

// Create if doesn't exist (useful for carts)
await backendClient.createIfNotExists({
  _type: "order",
  _id: "cart-" + sessionId,
  // ... cart data
});
```

### Updating Documents

```javascript
// Patch/update a document
await backendClient
  .patch("document-id")
  .set({ fieldName: "new value" })
  .inc({ stock: -1 }) // Decrement stock
  .commit();

// Alternative: replace entire document
await backendClient.replace("document-id", updatedDocument);
```

### Deleting Documents

```javascript
await backendClient.delete("document-id");
```

### Transactions (for atomic operations)

```javascript
await backendClient
  .transaction()
  .create(orderDoc)
  .patch(productId, (p) => p.inc({ stock: -quantity }))
  .commit();
```

## Important Considerations

1. **Security**: Always use the backend client (with token) for mutations, never expose the token to client-side code
2. **Validation**: Sanity will validate against schema definitions
3. **Conflict Resolution**: Use transactions for related operations (order creation + stock update)
4. **ID Generation**: For client-generated IDs, use Sanity's ID format or let Sanity generate them

## Ecommerce-Specific Mutations Needed

### Cart Operations

- Create cart document
- Add/remove items from cart
- Update cart item quantities
- Delete cart

### Order Operations

- Create order from cart
- Validate stock availability
- Process payment (integrate with Stripe)
- Update order status
- Send confirmation

### Inventory Operations

- Reserve stock when added to cart
- Confirm stock when order is placed
- Release stock if cart abandoned or order cancelled

## References

- Sanity Client Docs: https://www.sanity.io/docs/http-client
- Mutations: https://www.sanity.io/docs/http-mutation
- Transactions: https://www.sanity.io/docs/http-transactions
