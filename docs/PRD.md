# Toolshop — Product Requirements Document

**Version:** 1.0  
**Date:** 2026-04-23  
**Author:** QA Team  
**Base URL:** `https://api.practicesoftwaretesting.com`  
**UI URL:** `https://practicesoftwaretesting.com`

---

## 1. Product Overview

**Toolshop** is an e-commerce platform specialising in tools and hardware. The system is exposed via a REST API (OAS 3.0) consumed by a companion web UI. This PRD defines all product requirements — API-level and UI-level — from which the QA team derives the test plan, test cases, and Playwright + TypeScript automation suite.

---

## 2. Actors / User Roles

| Role | Description |
|------|-------------|
| **Anonymous** | Unauthenticated visitor; can browse products, categories, brands, search, and submit contact messages |
| **Customer** | Registered and authenticated (JWT bearer token); can manage profile, cart, favourites, invoices, and messages |
| **Admin** | Elevated role; full CRUD over users, products, brands, categories, invoices, messages; access to reports |

---

## 3. Functional Domains & Requirements

### 3.1 Authentication (`/users/*`)

| ID | Method | Endpoint | Requirement |
|----|--------|----------|-------------|
| AUTH-01 | POST | `/users/register` | A new user registers with valid personal details (first_name, last_name, email, password, address, phone, dob) and receives HTTP 201 with a user object including `id` |
| AUTH-02 | POST | `/users/register` | Registration with a duplicate email returns HTTP 422 |
| AUTH-03 | POST | `/users/login` | A registered user logs in with valid credentials and receives HTTP 200 with `access_token` and `refresh_token` |
| AUTH-04 | POST | `/users/login` | Login with invalid credentials returns HTTP 401 |
| AUTH-05 | GET | `/users/refresh` | An authenticated user refreshes their token and receives a new `access_token` |
| AUTH-06 | GET | `/users/logout` | An authenticated user logs out; the token is invalidated |
| AUTH-07 | POST | `/users/forgot-password` | A user requests a password reset by email; receives HTTP 200 |
| AUTH-08 | POST | `/users/change-password` | An authenticated user changes password with valid current + new password |
| AUTH-09 | POST | `/totp/setup` + `/totp/verify` | An authenticated user sets up TOTP 2FA and verifies a code |
| AUTH-10 | any | protected endpoint | Requests to protected endpoints without a valid token return HTTP 401 |

### 3.2 User Management (`/users/*`)

| ID | Method | Endpoint | Requirement |
|----|--------|----------|-------------|
| USR-01 | GET | `/users` | Admin retrieves all users (paginated); response has `data` array |
| USR-02 | GET | `/users/search?q=` | Admin searches users by email/name; returns matching results |
| USR-03 | GET | `/users/me` | Authenticated user retrieves own profile with correct `email` and `id` |
| USR-04 | GET | `/users/{userId}` | Admin retrieves any user by ID |
| USR-05 | PUT | `/users/{userId}` | Authenticated user (or admin) fully updates their profile; changes persist |
| USR-06 | PATCH | `/users/{userId}` | Authenticated user partially updates their profile; unchanged fields unaffected |
| USR-07 | DELETE | `/users/{userId}` | Admin deletes a user; returns HTTP 204 |
| USR-08 | PUT/DELETE | `/users/{userId}` | A customer cannot modify or delete another user's account (HTTP 403) |

### 3.3 Product Catalogue (`/products/*`)

| ID | Method | Endpoint | Requirement |
|----|--------|----------|-------------|
| PROD-01 | GET | `/products` | Any user retrieves all products (paginated); response has `data` array |
| PROD-02 | GET | `/products/{productId}` | Any user retrieves a specific product with `id`, `name`, `price`, `in_stock`, `co2_rating`, `brand`, `category` |
| PROD-03 | GET | `/products/search?q=` | Any user searches products by name; returns matching results |
| PROD-04 | GET | `/products/{productId}/related` | Any user retrieves related products (array) |
| PROD-05 | POST | `/products` | Admin creates a product; returns HTTP 201 with `id` |
| PROD-06 | PUT | `/products/{productId}` | Admin fully updates a product |
| PROD-07 | PATCH | `/products/{productId}` | Admin partially updates a product |
| PROD-08 | DELETE | `/products/{productId}` | Admin deletes a product; returns HTTP 204 |
| PROD-09 | GET | `/products/{productId}` | Requesting a non-existent product returns HTTP 404 |

### 3.4 Product Specs (`/products/{productId}/specs/*`)

| ID | Method | Endpoint | Requirement |
|----|--------|----------|-------------|
| SPEC-01 | GET | `/products/{productId}/specs` | Any user retrieves all specs for a product |
| SPEC-02 | GET | `/product-specs/names` | Any user retrieves all distinct spec names and values |
| SPEC-03 | POST | `/products/{productId}/specs` | Admin adds a spec (`spec_name`, `spec_value`, optional `spec_unit`); returns HTTP 201 |
| SPEC-04 | PUT | `/products/{productId}/specs/{specId}` | Admin updates a spec |
| SPEC-05 | DELETE | `/products/{productId}/specs/{specId}` | Admin deletes a spec; returns HTTP 204 |

### 3.5 Brands (`/brands/*`)

| ID | Method | Endpoint | Requirement |
|----|--------|----------|-------------|
| BRAND-01 | GET | `/brands` | Any user retrieves all brands (array with `id`, `name`, `slug`) |
| BRAND-02 | GET | `/brands/{brandId}` | Any user retrieves a specific brand |
| BRAND-03 | GET | `/brands/search?q=` | Any user searches brands by name |
| BRAND-04 | POST | `/brands` | Admin creates a brand (`name`, `slug`); returns HTTP 201 |
| BRAND-05 | PUT | `/brands/{brandId}` | Admin fully updates a brand |
| BRAND-06 | PATCH | `/brands/{brandId}` | Admin partially updates a brand |
| BRAND-07 | DELETE | `/brands/{brandId}` | Admin deletes a brand; returns HTTP 204 |

### 3.6 Categories (`/categories/*`)

| ID | Method | Endpoint | Requirement |
|----|--------|----------|-------------|
| CAT-01 | GET | `/categories` | Any user retrieves all categories (flat list) |
| CAT-02 | GET | `/categories/tree` | Any user retrieves the full category tree with `sub_categories` |
| CAT-03 | GET | `/categories/tree/{categoryId}` | Any user retrieves a specific category tree node |
| CAT-04 | GET | `/categories/search?q=` | Any user searches categories by name |
| CAT-05 | POST | `/categories` | Admin creates a category (`name`, `slug`, optional `parent_id`) |
| CAT-06 | PUT | `/categories/{categoryId}` | Admin fully updates a category |
| CAT-06b | PATCH | `/categories/{categoryId}` | Admin partially updates a category |
| CAT-06c | DELETE | `/categories/{categoryId}` | Admin deletes a category; returns HTTP 204 |

### 3.7 Cart (`/carts/*`)

| ID | Method | Endpoint | Requirement |
|----|--------|----------|-------------|
| CART-01 | POST | `/carts` | A customer creates a new cart; receives HTTP 201 with `id` |
| CART-02 | POST | `/carts/{id}` | A customer adds a product (`product_id`, `quantity`) to their cart; receives HTTP 200 |
| CART-03 | GET | `/carts/{cartId}` | A customer retrieves their cart with items |
| CART-04 | PUT | `/carts/{cartId}/product/quantity` | A customer updates item quantity (`product_id`, `quantity`) |
| CART-05 | DELETE | `/carts/{cartId}/product/{productId}` | A customer removes a specific product from cart; returns HTTP 204 |
| CART-06 | DELETE | `/carts/{cartId}` | A customer deletes the entire cart; returns HTTP 204 |
| CART-07 | POST | `/carts/{id}` | Adding a non-existent product returns HTTP 404 |

### 3.8 Favourites (`/favorites/*`)

| ID | Method | Endpoint | Requirement |
|----|--------|----------|-------------|
| FAV-01 | POST | `/favorites` | Authenticated customer adds a product (`product_id`) to favourites; receives HTTP 201 with `id` |
| FAV-02 | GET | `/favorites` | Authenticated customer retrieves all their favourites |
| FAV-03 | GET | `/favorites/{favoriteId}` | Authenticated customer retrieves a specific favourite |
| FAV-04 | DELETE | `/favorites/{favoriteId}` | Authenticated customer removes a favourite; returns HTTP 204 |

### 3.9 Invoices (`/invoices/*`)

| ID | Method | Endpoint | Requirement |
|----|--------|----------|-------------|
| INV-01 | POST | `/invoices` | Authenticated customer creates an invoice with billing address, payment_method, payment_details, cart_id |
| INV-02 | POST | `/invoices/guest` | Guest creates an invoice with additional `guest_email`, `guest_first_name`, `guest_last_name` |
| INV-03 | GET | `/invoices` | Authenticated user retrieves their own invoices |
| INV-04 | GET | `/invoices/search` | Admin searches invoices |
| INV-05 | GET | `/invoices/{invoiceId}` | Authenticated user retrieves a specific invoice with `invoice_number`, `total`, `status`, `invoicelines` |
| INV-06 | PUT | `/invoices/{invoiceId}` | Admin fully updates an invoice |
| INV-07 | PATCH | `/invoices/{invoiceId}` | Admin partially updates an invoice |
| INV-08 | PUT | `/invoices/{invoiceId}/status` | Admin updates invoice status |
| INV-09 | GET | `/invoices/{invoice_number}/download-pdf` | Authenticated user requests PDF download |
| INV-10 | GET | `/invoices/{invoice_number}/download-pdf-status` | Authenticated user checks PDF generation status |

### 3.10 Contact / Messages (`/messages/*`)

| ID | Method | Endpoint | Requirement |
|----|--------|----------|-------------|
| MSG-01 | POST | `/messages` | Any user sends a contact message (`name`, `email`, `subject`, `message`); receives HTTP 200 with `success: true` |
| MSG-02 | POST | `/messages/{messageId}/attach-file` | A user attaches a binary file to a message; receives HTTP 200 |
| MSG-03 | GET | `/messages` | Admin retrieves all messages (paginated); customer retrieves only their own |
| MSG-04 | GET | `/messages/{messageId}` | Admin retrieves a specific message (requires auth) |
| MSG-05 | POST | `/messages/{messageId}/reply` | Admin replies to a message (requires auth) |
| MSG-06 | PUT | `/messages/{messageId}/status` | Admin sets message status: `NEW`, `ON_HOLD`, `IN_PROGRESS`, `RESOLVED` |

### 3.11 Images (`/images`)

| ID | Method | Endpoint | Requirement |
|----|--------|----------|-------------|
| IMG-01 | GET | `/images` | Any user retrieves all available product images |

### 3.12 Payment (`/payment/check`)

| ID | Method | Endpoint | Requirement |
|----|--------|----------|-------------|
| PAY-01 | POST | `/payment/check` | Customer validates a payment (`payment_method`, `payment_details`); receives HTTP 200 with `message` |
| PAY-02 | POST | `/payment/check` | Supported payment methods: `bank-transfer`, `cash-on-delivery`, `credit-card`, `buy-now-pay-later`, `gift-card` |

### 3.13 Postcode Lookup (`/postcode-lookup`)

| ID | Method | Endpoint | Requirement |
|----|--------|----------|-------------|
| POST-01 | GET | `/postcode-lookup` | Any user looks up address details (`country`, `postcode`, optional `house_number`); receives `street`, `city`, `state`, `country`, `postcode` |
| POST-02 | GET | `/postcode-lookup` | Missing required `country` or `postcode` returns HTTP 422 |

### 3.14 Reports (`/reports/*`) — Admin only

| ID | Method | Endpoint | Requirement |
|----|--------|----------|-------------|
| RPT-01 | GET | `/reports/total-sales-per-country` | Admin retrieves total sales grouped by country |
| RPT-02 | GET | `/reports/top10-purchased-products` | Admin retrieves top 10 purchased products |
| RPT-03 | GET | `/reports/top10-best-selling-categories` | Admin retrieves top 10 best-selling categories |
| RPT-04 | GET | `/reports/total-sales-of-years` | Admin retrieves total sales by year |
| RPT-05 | GET | `/reports/average-sales-per-month` | Admin retrieves average sales per month |
| RPT-06 | GET | `/reports/average-sales-per-week` | Admin retrieves average sales per week |
| RPT-07 | GET | `/reports/customers-by-country` | Admin retrieves customers grouped by country |
| RPT-08 | GET | any `/reports/*` | All report endpoints return HTTP 401 when accessed without a valid admin token |

---

## 4. UI Screens & Journeys

UI base URL: `https://practicesoftwaretesting.com`

### 4.1 Global Navigation (all pages)

- Logo → Home
- `Categories` dropdown
- `Contact` link → `/contact`
- User menu (unauthenticated: Sign in / Register; authenticated: user name dropdown)
  - My account → `/account`
  - My favorites → `/account/favorites`
  - My profile → `/account/profile`
  - My invoices → `/account/invoices`
  - My messages → `/account/messages`
  - Sign out
- Cart icon with item-count badge → `/checkout`
- Language selector (EN)

### 4.2 Home / Product Listing Page (`/`)

**Left sidebar:** Sort dropdown, Price Range slider (1–200), Search input + Clear, Filters by category (checkbox tree), by brand, Sustainability checkbox  
**Product grid:** cards with image, name, CO₂ rating badge (A–E), price, "Out of stock" label (red), pagination

| ID | Requirement |
|----|-------------|
| UI-PL-01 | Product listing loads paginated (default page 1) |
| UI-PL-02 | Category filter updates the grid to matching products only |
| UI-PL-03 | Brand filter narrows results to that brand |
| UI-PL-04 | Sustainability filter removes non-eco products |
| UI-PL-05 | Price range slider filters within the selected band |
| UI-PL-06 | Search triggers product search and updates the grid |
| UI-PL-07 | Pagination navigates between result pages |
| UI-PL-08 | Out-of-stock products show "Out of stock" label |

### 4.3 Product Detail Page (`/product/{productId}`)

Image, name, category/brand tags, price, CO₂ rating, description, quantity selector (−/+), Add to cart (green), Add to favourites (yellow), Compare, Specifications table, Related products carousel (≤5 items)

| ID | Requirement |
|----|-------------|
| UI-PD-01 | Product detail displays all fields (name, price, description, specs, tags) |
| UI-PD-02 | "Add to cart" creates/updates cart and shows toast "Product added to shopping cart." |
| UI-PD-03 | Cart badge increments after adding a product |
| UI-PD-04 | "Add to favourites" (authenticated) adds and shows toast "Product added to your favorites list." |
| UI-PD-05 | "Add to favourites" (unauthenticated) redirects to sign-in |
| UI-PD-06 | Specifications table renders all API spec key-value pairs |
| UI-PD-07 | Related products section shows ≤5 linked products |

### 4.4 Checkout Flow — 4 Steps (`/checkout`)

**Step 1 Cart:** line items (Item, Quantity editable, Price, Total, × remove), order total, Continue Shopping, Proceed to checkout  
**Step 2 Sign In:** login form (skipped if already authenticated)  
**Step 3 Billing Address:** Country, Postal code + House number → auto-fill via `/postcode-lookup`, Street, City, State, Proceed to checkout  
**Step 4 Payment:** dropdown (Bank Transfer, Cash on Delivery, Credit Card, Buy Now Pay Later, Gift Card), Confirm button

| ID | Requirement |
|----|-------------|
| UI-CO-01 | Cart step shows all items with editable quantities and correct totals |
| UI-CO-02 | Updating quantity recalculates totals via API |
| UI-CO-03 | Removing an item deletes the row via API |
| UI-CO-04 | Authenticated user skips Sign In step |
| UI-CO-05 | Postcode + house number triggers address auto-fill with loading indicator |
| UI-CO-06 | Payment step presents all 5 payment methods |
| UI-CO-07 | Completing payment creates an invoice and shows confirmation |

### 4.5 My Account Page (`/account`)

Navigation hub with links: Favorites, Profile, Invoices, Messages

### 4.6 Favourites Page (`/account/favorites`)

List of favourited products (image, name, description excerpt) with × remove button per item

| ID | Requirement |
|----|-------------|
| UI-FAV-01 | Favourites page lists all authenticated user's favourited products |
| UI-FAV-02 | × button deletes the favourite and removes the row from the list |

### 4.7 Profile Page (`/account/profile`)

**Personal info:** First name, Last name, Email, Phone, Street, Postal code, City, State, Country, Update Profile button  
**Password:** Current Password, New Password (with strength meter + rules: ≥8 chars, upper+lower, number, special char), Confirm New Password, Change Password button  
**TOTP:** QR code, manual key, code input, Verify TOTP button

| ID | Requirement |
|----|-------------|
| UI-PR-01 | Profile form pre-populated with current user data from `GET /users/me` |
| UI-PR-02 | Update Profile submits `PUT /users/{userId}` and shows success confirmation |
| UI-PR-03 | Password strength meter updates in real time |
| UI-PR-04 | Change Password validates complexity rules before submission |
| UI-PR-05 | Profile page displays TOTP QR code and manual key |
| UI-PR-06 | Verify TOTP submits code and shows result |

---

## 5. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | All API responses return within 3 seconds under normal load |
| NFR-02 | All protected endpoints reject requests with expired or missing tokens (HTTP 401) |
| NFR-03 | All admin-only endpoints reject non-admin tokens (HTTP 403) |
| NFR-04 | Input validation errors return HTTP 422 with a descriptive error body |
| NFR-05 | The API uses HTTPS exclusively |

---

## 6. Scope

**In scope:**
- All API domains (sections 3.1–3.14)
- All UI screens (section 4)
- RBAC validation (API + UI)
- Happy-path and negative/boundary scenarios

**Out of scope:**
- Performance / load testing
- Security penetration testing
- Cross-browser (Firefox, Safari, mobile — deferred)
- Admin-only web UI

---

## 7. Automation Baseline

```
tests/
  setup/
    auth.setup.ts          ← register user → .auth/user.json
    admin.auth.setup.ts    ← admin login → .auth/admin_token.json
  api/
    auth.api.spec.ts       ← login → .auth/token.json
    user.api.spec.ts       ← GET /users/me, DELETE /users/{id}
    brand.api.spec.ts      ← full brand CRUD (to be implemented)
    category.api.spec.ts   ← full category CRUD (to be implemented)
    product.api.spec.ts    ← full product CRUD + specs (to be implemented)
    cart.api.spec.ts       ← full cart flow (to be implemented)
    favorite.api.spec.ts   ← full favourite flow (to be implemented)
    invoice.api.spec.ts    ← full invoice flow (to be implemented)
    contact.api.spec.ts    ← full contact/message flow (to be implemented)
    report.api.spec.ts     ← all report endpoints (to be implemented)
  ui/
    product-listing.ui.spec.ts  ← filter, search, pagination (to be implemented)
    product-detail.ui.spec.ts   ← add to cart, add to favourites (to be implemented)
    checkout.ui.spec.ts         ← 4-step checkout flow (to be implemented)
    favorites.ui.spec.ts        ← favourites management (to be implemented)
    profile.ui.spec.ts          ← profile update, password, TOTP (to be implemented)
src/
  routes/   ← one file per domain
  data/     ← one file per domain
```

**Execution order:** `setup` → `admin-setup` → `api` (parallel) → `chromium` (UI)
