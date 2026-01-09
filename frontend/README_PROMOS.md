Promotions (Frontend)

- Admin promotions page: `/admin-promotions` (admin only)
  - Create, list, delete promos using admin token.
- Users can apply promo codes from the Cart page. The cart will call `POST /api/promos/apply` and show the new total.
- Applied promo is stored in `localStorage.appliedPromo` and included automatically when placing the order.

Notes
- The checkout flow will include `promoCode` in the order creation request; the backend will validate and apply discounts.
- Free shipping, BOGO and line-item promos can be extended later.
