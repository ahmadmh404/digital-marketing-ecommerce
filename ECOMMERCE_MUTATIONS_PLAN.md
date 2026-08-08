# Ecommerce Mutations Implementation Plan

## Overview
This plan outlines the implementation of server-side mutations for ecommerce functionality in a Next.js + Sanity ecommerce application. The focus is on adding robust backend functionality for cart management, order processing, and inventory control while maintaining compatibility with the existing client-side Zustand store.

## Current State Analysis
- Client-side cart management using Zustand with localStorage persistence
- Sanity schema includes Product, Order, Category, Brand, Address entities
- Existing checkout flow uses Stripe via actions/createCheckoutSession.ts
- Clerk authentication is implemented for user identification
- No server-side mutations for cart/order persistence to Sanity

## Implementation Approach
The implementation will be done in phases, with each phase delivering measurable value and being independently testable.

## Phase 1: Foundation - Sanity Client Setup & Basic Mutations
**Goal**: Establish reliable communication with Sanity for CRUD operations

### Tasks:
1. [ ] Create mutations utility file (`sanity/lib/mutations.ts`)
2. [ ] Implement basic cart operations:
   - Create cart document
   - Read cart document
   - Update cart document
   - Delete cart document
3. [ ] Add proper error handling and TypeScript types
4. [ ] Create utility functions (order number generation, etc.)

### Success Criteria:
- [ ] Ability to create, read, update, and delete cart documents in Sanity
- [ ] Proper TypeScript typing for all mutation functions
- [ ] Basic cart CRUD operations working without errors
- [ ] No regression in existing functionality

### Files to Modify/Create:
- `sanity/lib/mutations.ts` (new)
- `lib/utils.ts` (enhanced with cn function)

## Phase 2: Cart Persistence & Order Creation
**Goal**: Enable persistent cart storage and order creation with inventory management

### Tasks:
1. [ ] Enhance Zustand store to use Sanity-backed cart
2. [ ] Implement cart synchronization logic:
   - Load cart from Sanity on initialization
   - Save cart to Sanity on changes
   - Handle conflicts between local and server state
3. [ ] Implement order creation from cart:
   - Validate stock availability
   - Create order document
   - Decrement product stock atomically
   - Clear cart after order creation
4. [ ] Add transaction support for atomic operations

### Success Criteria:
- [ ] Cart persists across sessions and page reloads via Sanity
- [ ] Cart state synchronizes between local storage and Sanity
- [ ] Orders can be created from cart with proper validation
- [ ] Inventory is correctly decremented when orders are placed
- [ ] Atomic operations prevent overselling
- [ ] Cart is cleared after successful order creation

### Files to Modify:
- `store.ts` (enhanced with Sanity integration)
- `sanity/lib/mutations.ts` (enhanced with order creation)
- `components/AddToCartButton.tsx` (enhanced for sync)

## Phase 3: User Authentication & Order Management
**Goal**: Integrate with Clerk for user-specific carts and order history

### Tasks:
1. [ ] Implement user-specific cart identification using Clerk user ID
2. [ ] Add order history retrieval for authenticated users
3. [ ] Implement order status tracking and updates
4. [ ] Add guest cart functionality for non-authenticated users

### Success Criteria:
- [ ] Authenticated users have persistent carts tied to their Clerk ID
- [ ] Guest users have session-based carts
- [ ] Order history is accessible for authenticated users
- [ ] Order status can be updated and reflected in UI
- [ ] Seamless transition from guest to authenticated user cart

### Files to Modify:
- `store.ts` (enhanced with Clerk integration)
- `sanity/lib/mutations.ts` (enhanced with user order queries)
- `lib/ecommerce-context.ts` (new)

## Phase 4: Payment Integration & Finalization
**Goal**: Complete the ecommerce flow with proper payment integration

### Tasks:
1. [ ] Integrate with existing Stripe checkout flow
2. [ ] Implement order confirmation and email notifications (if applicable)
3. [ ] Add order tracking and history pages
4. [ ] Implement cart abandonment recovery (optional)
5. [ ] Add comprehensive error handling and logging

### Success Criteria:
- [ ] Orders flow correctly from cart to Stripe checkout to completion
- [ ] Order status updates based on payment status
- [ ] Users can view their order history
- [ ] Error cases are handled gracefully
- [ ] All existing functionality continues to work

### Files to Modify:
- `app/(client)/cart/page.tsx` (enhanced for Sanity-backed checkout)
- `app/(client)/orders/page.tsx` (potential enhancement)
- `actions/createCheckoutSession.ts` (potential enhancement)

## Technical Details

### Data Models
The implementation works with existing Sanity schemas:
- **Product**: Contains stock field for inventory management
- **Order**: Represents both carts (status: pending) and completed orders
- **Address**: Used for shipping information
- **Clerk User ID**: Links orders to users

### Key Functions Implemented

#### Cart Operations
- `createCart(userId, sessionId)`: Creates or retrieves a cart
- `addItemToCart(sessionId, productId, quantity)`: Adds items to cart
- `removeItemFromCart(sessionId, productId, quantity)`: Removes items from cart
- `updateCartItemQuantity(sessionId, productId, quantity)`: Updates item quantity
- `deleteCart(sessionId)`: Deletes a cart

#### Order Operations
- `convertCartToOrder(sessionId, customerInfo)`: Main order creation function
  - Validates stock availability
  - Uses Sanity transactions for atomic operations
  - Creates order document
  - Decrements product inventory
  - Clears cart

#### User Operations
- `getUserOrders(userId)`: Retrieves order history for a user
- `updateOrderStatus(orderId, status)`: Updates order status

### Transaction Usage
All order creation operations use Sanity transactions to ensure:
- Either all operations succeed (order creation + inventory update + cart deletion)
- Or all operations are rolled back on failure
- Prevents overselling and inconsistent states

### Error Handling
- Comprehensive try/catch blocks with meaningful error messages
- Graceful fallback to client-only storage when Sanity is unavailable
- Validation of inputs and business rules (stock availability, etc.)

## Integration Points

### Existing Store Integration
The enhanced store maintains backward compatibility:
- All existing Zustand methods continue to work
- New Sanity-specific methods are added as enhancements
- Automatic initialization and synchronization
- Subscription-based auto-sync for signed-in users

### Component Integration
- AddToCartButton automatically syncs cart changes to Sanity for signed-in users
- CartPage can leverage the enhanced store methods
- New components (like CartSummary) can demonstrate the functionality

## Testing Strategy

### Unit Testing
- Test mutation functions with mocked Sanity client
- Verify cart operations work correctly
- Test transaction rollback scenarios

### Integration Testing
- Verify end-to-end cart -> order flow
- Test concurrent access scenarios
- Verify inventory correctness under load

### Manual Testing
- Add items to cart and verify persistence
- Complete checkout and verify order creation
- Check inventory decrement
- Verify order history for authenticated users
- Test guest to authenticated user transition

## Future Enhancements
- Wishlist functionality
- Saved for later items in cart
- Gift wrapping and messages
- Loyalty points integration
- Advanced inventory management (reservations, backorders)
- Multi-warehouse support
- Tax calculation integration
- Email/SMS notifications

## Conclusion
This implementation provides a solid foundation for ecommerce operations by:
1. Moving cart persistence to Sanity for reliability
2. Adding proper inventory management to prevent overselling
3. Integrating with existing Clerk authentication
4. Maintaining backward compatibility with existing code
5. Providing a clean path for future enhancements

The phased approach allows for incremental delivery and testing, ensuring each component works correctly before moving to the next phase.