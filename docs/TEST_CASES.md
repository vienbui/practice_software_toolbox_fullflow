# Toolshop — Test Cases

**Version:** 1.0  
**Date:** 2026-04-23  
**Format:** Given / When / Then  
**Reference:** [PRD.md](./PRD.md), [TEST_PLAN.md](./TEST_PLAN.md)

---

## Notation

- **Tag:** maps 1-to-1 with automation tag (e.g., `@BRAND-T001`)
- **PRD ID:** maps to requirement in PRD section 3 or 4
- **Priority:** T1 = Critical, T2 = High, T3 = Medium, T4 = Low (from TEST_PLAN.md)
- **Type:** Happy / Negative / RBAC

---

## 1. Authentication

### AUTH-T001 — Register new user (Happy)
**PRD:** AUTH-01 | **Priority:** T1 | **Type:** Happy

**Given** a unique email and valid registration payload (first_name, last_name, email, password, address, phone, dob)  
**When** I `POST /users/register`  
**Then** status is `201`  
**And** response body contains `id` and `email` matching the payload

---

### AUTH-T002 — Register with duplicate email (Negative)
**PRD:** AUTH-02 | **Priority:** T1 | **Type:** Negative

**Given** a user already exists with a given email  
**When** I `POST /users/register` with the same email  
**Then** status is `422`

---

### AUTH-T003 — Login with valid credentials (Happy)
**PRD:** AUTH-03 | **Priority:** T1 | **Type:** Happy

**Given** a registered user with known email and password  
**When** I `POST /users/login` with those credentials  
**Then** status is `200`  
**And** response body contains `access_token`

---

### AUTH-T004 — Login with invalid password (Negative)
**PRD:** AUTH-04 | **Priority:** T1 | **Type:** Negative

**Given** a registered user  
**When** I `POST /users/login` with a wrong password  
**Then** status is `401`

---

### AUTH-T005 — Refresh token (Happy)
**PRD:** AUTH-05 | **Priority:** T4 | **Type:** Happy

**Given** a valid `access_token`  
**When** I `GET /users/refresh` with `Authorization: Bearer <token>`  
**Then** status is `200`  
**And** response body contains a new `access_token`

---

### AUTH-T006 — Logout (Happy)
**PRD:** AUTH-06 | **Priority:** T2 | **Type:** Happy

**Given** a valid `access_token`  
**When** I `GET /users/logout` with `Authorization: Bearer <token>`  
**Then** status is `200`

---

### AUTH-T007 — Forgot password (Happy)
**PRD:** AUTH-07 | **Priority:** T3 | **Type:** Happy

**Given** a registered user email  
**When** I `POST /users/forgot-password` with `{ "email": "<userEmail>" }` (no auth)  
**Then** status is `200`

---

### AUTH-T008 — Change password (Happy)
**PRD:** AUTH-08 | **Priority:** T2 | **Type:** Happy

**Given** a valid `access_token` and the current password  
**When** I `POST /users/change-password` with `{ current_password, new_password, new_password_confirmation }`  
**Then** status is `200`  
**And** I can login with the new password

---

### AUTH-T009 — Access protected endpoint without token (RBAC)
**PRD:** AUTH-10 | **Priority:** T1 | **Type:** RBAC

**Given** no `Authorization` header  
**When** I `GET /users/me`  
**Then** status is `401`

---

## 2. User Management

### USR-T001 — Get all users (Happy)
**PRD:** USR-01 | **Priority:** T2 | **Type:** Happy

**Given** a valid admin token  
**When** I `GET /users`  
**Then** status is `200`  
**And** response body has a `data` array

---

### USR-T002 — Get current user profile (Happy)
**PRD:** USR-03 | **Priority:** T1 | **Type:** Happy

**Given** a valid user `access_token`  
**When** I `GET /users/me`  
**Then** status is `200`  
**And** `email` matches the registered email

---

### USR-T003 — Get user by ID (Admin) (Happy)
**PRD:** USR-04 | **Priority:** T2 | **Type:** Happy

**Given** a valid admin token and a known `userId`  
**When** I `GET /users/{userId}`  
**Then** status is `200`  
**And** `id` equals `userId`

---

### USR-T004 — Update user (PUT) (Happy)
**PRD:** USR-05 | **Priority:** T2 | **Type:** Happy

**Given** a valid user token and their `userId`  
**When** I `PUT /users/{userId}` with updated `first_name` and `last_name`  
**Then** status is `200`  
**And** `GET /users/me` returns the updated values

---

### USR-T005 — Partially update user (PATCH) (Happy)
**PRD:** USR-06 | **Priority:** T2 | **Type:** Happy

**Given** a valid user token and their `userId`  
**When** I `PATCH /users/{userId}` with `{ "first_name": "PatchedFirst" }`  
**Then** status is `200`  
**And** `GET /users/me` returns `first_name === "PatchedFirst"`

---

### USR-T006 — Search users (Admin) (Happy)
**PRD:** USR-02 | **Priority:** T3 | **Type:** Happy

**Given** a valid admin token and a known user email  
**When** I `GET /users/search?q=<email>`  
**Then** status is `200`

---

### USR-T007 — Delete user (Admin) (Happy)
**PRD:** USR-07 | **Priority:** T1 | **Type:** Happy

**Given** a valid admin token and a target `userId`  
**When** I `DELETE /users/{userId}`  
**Then** status is `204`

---

### USR-T008 — Customer cannot delete another user (RBAC)
**PRD:** USR-08 | **Priority:** T2 | **Type:** RBAC

**Given** a valid customer `access_token`  
**When** I `DELETE /users/{otherUserId}` (a different user's ID)  
**Then** status is `403`

---

## 3. Products

### PROD-T001 — Get all products (Happy)
**PRD:** PROD-01 | **Priority:** T2 | **Type:** Happy

**Given** no authentication  
**When** I `GET /products`  
**Then** status is `200`  
**And** response body has a `data` array with product objects

---

### PROD-T002 — Get product by ID (Happy)
**PRD:** PROD-02 | **Priority:** T2 | **Type:** Happy

**Given** a known `productId`  
**When** I `GET /products/{productId}`  
**Then** status is `200`  
**And** `id` matches `productId`  
**And** `name`, `price`, `in_stock`, `co2_rating` are defined

---

### PROD-T003 — Search products (Happy)
**PRD:** PROD-03 | **Priority:** T2 | **Type:** Happy

**Given** a search term known to match at least one product (e.g., "Hammer")  
**When** I `GET /products/search?q=Hammer`  
**Then** status is `200`  
**And** response has data

---

### PROD-T004 — Get related products (Happy)
**PRD:** PROD-04 | **Priority:** T3 | **Type:** Happy

**Given** a known `productId`  
**When** I `GET /products/{productId}/related`  
**Then** status is `200`  
**And** response is an array

---

### PROD-T005 — Create product (Admin) (Happy)
**PRD:** PROD-05 | **Priority:** T3 | **Type:** Happy

**Given** a valid admin token and a valid product payload  
**When** I `POST /products` with name, description, price, category_id, brand_id  
**Then** status is `201`  
**And** response has `id`

---

### PROD-T006 — Create product without admin token (RBAC)
**PRD:** PROD-05 | **Priority:** T2 | **Type:** RBAC

**Given** a customer `access_token` (or no token)  
**When** I `POST /products` with a valid payload  
**Then** status is `403` (or `401`)

---

### PROD-T007 — Update product (PUT) (Admin) (Happy)
**PRD:** PROD-06 | **Priority:** T3 | **Type:** Happy

**Given** a valid admin token and a `productId` created in PROD-T005  
**When** I `PUT /products/{productId}` with updated `name`  
**Then** status is `200`

---

### PROD-T008 — Delete product (Admin) (Happy)
**PRD:** PROD-08 | **Priority:** T3 | **Type:** Happy

**Given** a valid admin token and a `productId` created in PROD-T005  
**When** I `DELETE /products/{productId}`  
**Then** status is `204`

---

### PROD-T009 — Get non-existent product (Negative)
**PRD:** PROD-09 | **Priority:** T2 | **Type:** Negative

**Given** a non-existent product ID  
**When** I `GET /products/non-existent-id`  
**Then** status is `404`

---

## 4. Product Specs

### SPEC-T001 — Get specs for a product (Happy)
**PRD:** SPEC-01 | **Priority:** T2 | **Type:** Happy

**Given** a known `productId`  
**When** I `GET /products/{productId}/specs`  
**Then** status is `200`  
**And** response is an array

---

### SPEC-T002 — Get all spec names (Happy)
**PRD:** SPEC-02 | **Priority:** T3 | **Type:** Happy

**When** I `GET /product-specs/names`  
**Then** status is `200`

---

### SPEC-T003 — Add spec to product (Admin) (Happy)
**PRD:** SPEC-03 | **Priority:** T3 | **Type:** Happy

**Given** admin token, a `productId`, and `{ product_id, spec_name: "Weight", spec_value: "500", spec_unit: "g" }`  
**When** I `POST /products/{productId}/specs`  
**Then** status is `201`  
**And** response has `id`

---

### SPEC-T004 — Update spec (Admin) (Happy)
**PRD:** SPEC-04 | **Priority:** T3 | **Type:** Happy

**Given** admin token, `productId`, and `specId` created in SPEC-T003  
**When** I `PUT /products/{productId}/specs/{specId}` with updated `spec_value`  
**Then** status is `200`

---

### SPEC-T005 — Delete spec (Admin) (Happy)
**PRD:** SPEC-05 | **Priority:** T3 | **Type:** Happy

**Given** admin token, `productId`, and `specId`  
**When** I `DELETE /products/{productId}/specs/{specId}`  
**Then** status is `204`

---

## 5. Brands

### BRAND-T001 — Get all brands (Happy)
**PRD:** BRAND-01 | **Priority:** T2 | **Type:** Happy

**When** I `GET /brands`  
**Then** status is `200`  
**And** response is an array with `id`, `name`, `slug`

---

### BRAND-T002 — Get brand by ID (Happy)
**PRD:** BRAND-02 | **Priority:** T3 | **Type:** Happy

**Given** a known `brandId`  
**When** I `GET /brands/{brandId}`  
**Then** status is `200`  
**And** `id` matches `brandId`

---

### BRAND-T003 — Search brands (Happy)
**PRD:** BRAND-03 | **Priority:** T3 | **Type:** Happy

**Given** a search term  
**When** I `GET /brands/search?q=<term>`  
**Then** status is `200`

---

### BRAND-T004 — Create brand (Admin) (Happy)
**PRD:** BRAND-04 | **Priority:** T3 | **Type:** Happy

**Given** admin token and `{ name: "Test Brand", slug: "test-brand" }`  
**When** I `POST /brands`  
**Then** status is `201`  
**And** `id` is defined

---

### BRAND-T005 — Update brand (PUT) (Admin) (Happy)
**PRD:** BRAND-05 | **Priority:** T3 | **Type:** Happy

**Given** admin token and `brandId` from BRAND-T004  
**When** I `PUT /brands/{brandId}` with updated `name`  
**Then** status is `200`

---

### BRAND-T006 — Partially update brand (PATCH) (Admin) (Happy)
**PRD:** BRAND-06 | **Priority:** T3 | **Type:** Happy

**Given** admin token and `brandId`  
**When** I `PATCH /brands/{brandId}` with `{ "name": "Patched Brand" }`  
**Then** status is `200`

---

### BRAND-T007 — Delete brand (Admin) (Happy)
**PRD:** BRAND-07 | **Priority:** T3 | **Type:** Happy

**Given** admin token and `brandId`  
**When** I `DELETE /brands/{brandId}`  
**Then** status is `204`

---

### BRAND-T008 — Create brand without admin token (RBAC)
**PRD:** BRAND-04 | **Priority:** T2 | **Type:** RBAC

**Given** a customer token  
**When** I `POST /brands` with a valid payload  
**Then** status is `403`

---

## 6. Categories

### CAT-T001 — Get all categories (Happy)
**PRD:** CAT-01 | **Priority:** T2 | **Type:** Happy

**When** I `GET /categories`  
**Then** status is `200`  
**And** response is an array

---

### CAT-T002 — Get category tree (Happy)
**PRD:** CAT-02 | **Priority:** T2 | **Type:** Happy

**When** I `GET /categories/tree`  
**Then** status is `200`  
**And** each item may have `sub_categories`

---

### CAT-T003 — Search categories (Happy)
**PRD:** CAT-04 | **Priority:** T3 | **Type:** Happy

**When** I `GET /categories/search?q=hand`  
**Then** status is `200`

---

### CAT-T004 — Create category (Admin) (Happy)
**PRD:** CAT-05 | **Priority:** T3 | **Type:** Happy

**Given** admin token and `{ name: "Test Category", slug: "test-category" }`  
**When** I `POST /categories`  
**Then** status is `201`  
**And** `id` is defined

---

### CAT-T005 — Update category (PUT) (Admin) (Happy)
**PRD:** CAT-06 | **Priority:** T3 | **Type:** Happy

**Given** admin token and `categoryId`  
**When** I `PUT /categories/{categoryId}` with updated `name`  
**Then** status is `200`

---

### CAT-T006 — Delete category (Admin) (Happy)
**PRD:** CAT-06c | **Priority:** T3 | **Type:** Happy

**Given** admin token and `categoryId`  
**When** I `DELETE /categories/{categoryId}`  
**Then** status is `204`

---

## 7. Cart

### CART-T001 — Create cart (Happy)
**PRD:** CART-01 | **Priority:** T1 | **Type:** Happy

**When** I `POST /carts` (no auth required)  
**Then** status is `201`  
**And** response has `id`

---

### CART-T002 — Add item to cart (Happy)
**PRD:** CART-02 | **Priority:** T1 | **Type:** Happy

**Given** a `cartId` and a known `productId`  
**When** I `POST /carts/{cartId}` with `{ product_id, quantity: 2 }`  
**Then** status is `200`

---

### CART-T003 — Retrieve cart (Happy)
**PRD:** CART-03 | **Priority:** T1 | **Type:** Happy

**Given** a `cartId` with at least one item  
**When** I `GET /carts/{cartId}`  
**Then** status is `200`  
**And** response has `id`

---

### CART-T004 — Update item quantity (Happy)
**PRD:** CART-04 | **Priority:** T1 | **Type:** Happy

**Given** a `cartId` and a `productId` in the cart  
**When** I `PUT /carts/{cartId}/product/quantity` with `{ product_id, quantity: 5 }`  
**Then** status is `200`

---

### CART-T005 — Remove product from cart (Happy)
**PRD:** CART-05 | **Priority:** T1 | **Type:** Happy

**Given** a `cartId` and a `productId` in the cart  
**When** I `DELETE /carts/{cartId}/product/{productId}`  
**Then** status is `204`

---

### CART-T006 — Delete entire cart (Happy)
**PRD:** CART-06 | **Priority:** T1 | **Type:** Happy

**Given** a `cartId`  
**When** I `DELETE /carts/{cartId}`  
**Then** status is `204`

---

### CART-T007 — Add non-existent product to cart (Negative)
**PRD:** CART-07 | **Priority:** T2 | **Type:** Negative

**Given** a `cartId`  
**When** I `POST /carts/{cartId}` with `product_id: "non-existent-id"`  
**Then** status is `404`

---

## 8. Favourites

### FAV-T001 — Add product to favourites (Happy)
**PRD:** FAV-01 | **Priority:** T2 | **Type:** Happy

**Given** a valid user token and a known `productId`  
**When** I `POST /favorites` with `{ product_id: productId }`  
**Then** status is `201`  
**And** response has `id` and `product_id`

---

### FAV-T002 — Get all favourites (Happy)
**PRD:** FAV-02 | **Priority:** T2 | **Type:** Happy

**Given** a valid user token  
**When** I `GET /favorites`  
**Then** status is `200`  
**And** response is an array

---

### FAV-T003 — Get specific favourite (Happy)
**PRD:** FAV-03 | **Priority:** T3 | **Type:** Happy

**Given** a valid user token and a `favoriteId`  
**When** I `GET /favorites/{favoriteId}`  
**Then** status is `200`  
**And** `id` matches `favoriteId`

---

### FAV-T004 — Remove favourite (Happy)
**PRD:** FAV-04 | **Priority:** T2 | **Type:** Happy

**Given** a valid user token and a `favoriteId`  
**When** I `DELETE /favorites/{favoriteId}`  
**Then** status is `204`

---

### FAV-T005 — Add favourite without auth (RBAC)
**PRD:** FAV-01 | **Priority:** T2 | **Type:** RBAC

**Given** no Authorization header  
**When** I `POST /favorites` with a valid `product_id`  
**Then** status is `401`

---

## 9. Invoices

### INV-T001 — Create invoice (authenticated) (Happy)
**PRD:** INV-01 | **Priority:** T1 | **Type:** Happy

**Given** a valid user token, a `cartId` with items, and billing + payment details  
**When** I `POST /invoices` with full payload  
**Then** status is `200` (or `201`)  
**And** response has `id`, `invoice_number`, `total`

---

### INV-T002 — Create guest invoice (Happy)
**PRD:** INV-02 | **Priority:** T1 | **Type:** Happy

**Given** a `cartId` and guest details (`guest_email`, `guest_first_name`, `guest_last_name`)  
**When** I `POST /invoices/guest`  
**Then** status is `200`  
**And** response has `id`

---

### INV-T003 — Get own invoices (Happy)
**PRD:** INV-03 | **Priority:** T2 | **Type:** Happy

**Given** a user with at least one invoice  
**When** I `GET /invoices` with user token  
**Then** status is `200`  
**And** response has `data` array

---

### INV-T004 — Get invoice by ID (Happy)
**PRD:** INV-05 | **Priority:** T2 | **Type:** Happy

**Given** a user token and a `invoiceId`  
**When** I `GET /invoices/{invoiceId}`  
**Then** status is `200`  
**And** `invoice_number`, `total`, `status` are defined

---

### INV-T005 — Update invoice status (Admin) (Happy)
**PRD:** INV-08 | **Priority:** T3 | **Type:** Happy

**Given** admin token and `invoiceId`  
**When** I `PUT /invoices/{invoiceId}/status` with updated status  
**Then** status is `200`

---

### INV-T006 — Get invoices without auth (RBAC)
**PRD:** INV-03 | **Priority:** T2 | **Type:** RBAC

**Given** no token  
**When** I `GET /invoices`  
**Then** status is `401`

---

## 10. Contact / Messages

### MSG-T001 — Send contact message (Happy)
**PRD:** MSG-01 | **Priority:** T2 | **Type:** Happy

**Given** a payload with `name`, `email`, `subject`, `message`  
**When** I `POST /messages` (no auth)  
**Then** status is `200`  
**And** `success` is `true`

---

### MSG-T002 — Send message missing required field (Negative)
**PRD:** MSG-01 | **Priority:** T2 | **Type:** Negative

**Given** a payload missing `message`  
**When** I `POST /messages`  
**Then** status is `422`

---

### MSG-T003 — Get all messages (Admin) (Happy)
**PRD:** MSG-03 | **Priority:** T3 | **Type:** Happy

**Given** admin token  
**When** I `GET /messages`  
**Then** status is `200`  
**And** response has `data` array

---

### MSG-T004 — Get specific message (Admin) (Happy)
**PRD:** MSG-04 | **Priority:** T3 | **Type:** Happy

**Given** admin token and a `messageId`  
**When** I `GET /messages/{messageId}`  
**Then** status is `200`  
**And** `id` matches `messageId`

---

### MSG-T005 — Update message status (Admin) (Happy)
**PRD:** MSG-06 | **Priority:** T3 | **Type:** Happy

**Given** admin token and `messageId`  
**When** I `PUT /messages/{messageId}/status` with `{ status: "IN_PROGRESS" }`  
**Then** status is `200`

---

### MSG-T006 — Get messages without auth (RBAC)
**PRD:** MSG-03 | **Priority:** T2 | **Type:** RBAC

**Given** no token  
**When** I `GET /messages`  
**Then** status is `401`

---

## 11. Payment

### PAY-T001 — Check payment (cash on delivery) (Happy)
**PRD:** PAY-01 | **Priority:** T1 | **Type:** Happy

**When** I `POST /payment/check` with `{ payment_method: "cash-on-delivery", payment_details: {} }`  
**Then** status is `200`  
**And** response has `message`

---

### PAY-T002 — Check payment (credit card) (Happy)
**PRD:** PAY-02 | **Priority:** T1 | **Type:** Happy

**When** I `POST /payment/check` with credit card details  
**Then** status is `200`

---

### PAY-T003 — Check payment (bank transfer) (Happy)
**PRD:** PAY-02 | **Priority:** T2 | **Type:** Happy

**When** I `POST /payment/check` with bank transfer details  
**Then** status is `200`

---

## 12. Postcode Lookup

### POST-T001 — Valid postcode lookup (Happy)
**PRD:** POST-01 | **Priority:** T3 | **Type:** Happy

**When** I `GET /postcode-lookup?country=NL&postcode=1234AA&house_number=10`  
**Then** status is `200`  
**And** response has `street`, `city`, `state`

---

### POST-T002 — Missing country returns 422 (Negative)
**PRD:** POST-02 | **Priority:** T3 | **Type:** Negative

**When** I `GET /postcode-lookup?postcode=1234AA` (no country)  
**Then** status is `422`

---

## 13. Reports

### RPT-T001 — Get total sales per country (Admin) (Happy)
**PRD:** RPT-01 | **Priority:** T3 | **Type:** Happy

**Given** admin token  
**When** I `GET /reports/total-sales-per-country`  
**Then** status is `200`

---

### RPT-T002 — Get top 10 purchased products (Admin) (Happy)
**PRD:** RPT-02 | **Priority:** T3 | **Type:** Happy

**Given** admin token  
**When** I `GET /reports/top10-purchased-products`  
**Then** status is `200`

---

### RPT-T003 — Get top 10 best-selling categories (Admin) (Happy)
**PRD:** RPT-03 | **Priority:** T3 | **Type:** Happy

**Given** admin token  
**When** I `GET /reports/top10-best-selling-categories`  
**Then** status is `200`

---

### RPT-T004–T007 — Other report endpoints (Admin) (Happy)
**PRD:** RPT-04–07 | **Priority:** T3 | **Type:** Happy

**Given** admin token  
**When** I `GET /reports/<endpoint>` for each of:
- `/reports/total-sales-of-years`
- `/reports/average-sales-per-month`
- `/reports/average-sales-per-week`
- `/reports/customers-by-country`  

**Then** status is `200`

---

### RPT-T008 — Access reports without admin token (RBAC)
**PRD:** RPT-08 | **Priority:** T2 | **Type:** RBAC

**Given** no token  
**When** I `GET /reports/total-sales-per-country`  
**Then** status is `401`

---

## 14. UI Test Cases

### UI-PL-T001 — Product listing loads (Happy)
**PRD:** UI-PL-01 | **Priority:** T2

**Given** I navigate to `https://practicesoftwaretesting.com`  
**When** the page loads  
**Then** product cards are visible  
**And** pagination controls are present

---

### UI-PL-T002 — Filter by category (Happy)
**PRD:** UI-PL-02 | **Priority:** T2

**Given** the product listing page  
**When** I check the "Hammer" category checkbox  
**Then** only products in the Hammer category are shown

---

### UI-PL-T003 — Search for a product (Happy)
**PRD:** UI-PL-06 | **Priority:** T2

**Given** the product listing page  
**When** I type "Pliers" in the search input and click Search  
**Then** the grid shows only products matching "Pliers"

---

### UI-PD-T001 — Product detail displays correctly (Happy)
**PRD:** UI-PD-01 | **Priority:** T2

**Given** I click on a product from the listing  
**When** the detail page loads  
**Then** name, price, description, CO₂ rating, and specifications table are visible

---

### UI-PD-T002 — Add to cart shows toast (Happy)
**PRD:** UI-PD-02 | **Priority:** T1

**Given** I am on a product detail page  
**When** I click "Add to cart"  
**Then** a toast "Product added to shopping cart." appears  
**And** the cart badge increments

---

### UI-PD-T003 — Add to favourites (authenticated) (Happy)
**PRD:** UI-PD-04 | **Priority:** T2

**Given** I am logged in and on a product detail page  
**When** I click "Add to favourites"  
**Then** a toast "Product added to your favorites list." appears

---

### UI-CO-T001 — Full checkout flow (Happy)
**PRD:** UI-CO-01–07 | **Priority:** T1

**Given** I am logged in and have a product in my cart  
**When** I navigate to `/checkout`  
**Then** Step 1 shows the cart item with correct price  
**When** I click "Proceed to checkout"  
**Then** Step 3 (Billing Address) is shown (Step 2 skipped for authenticated user)  
**When** I enter country, postcode, and house number  
**Then** street, city, state are auto-filled  
**When** I click "Proceed to checkout"  
**Then** Step 4 (Payment) is shown with 5 payment methods  
**When** I select "Cash on Delivery" and confirm  
**Then** an invoice is created and confirmation is shown

---

### UI-FAV-T001 — Favourites page lists products (Happy)
**PRD:** UI-FAV-01 | **Priority:** T2

**Given** I am logged in and have favourited at least one product  
**When** I navigate to `/account/favorites`  
**Then** the product appears in the list

---

### UI-FAV-T002 — Remove favourite (Happy)
**PRD:** UI-FAV-02 | **Priority:** T2

**Given** I am on the favourites page with at least one item  
**When** I click the × button  
**Then** the item is removed from the list

---

### UI-PR-T001 — Profile pre-populated (Happy)
**PRD:** UI-PR-01 | **Priority:** T2

**Given** I am logged in  
**When** I navigate to `/account/profile`  
**Then** the form is pre-populated with my current name, email, and address

---

### UI-PR-T002 — Update profile (Happy)
**PRD:** UI-PR-02 | **Priority:** T2

**Given** I am on the profile page  
**When** I change the first name and click "Update Profile"  
**Then** a success confirmation is shown  
**And** the updated name persists on reload
