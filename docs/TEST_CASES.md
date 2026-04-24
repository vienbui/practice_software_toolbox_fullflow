# Toolshop — Test Cases

**Version:** 2.0  
**Date:** 2026-04-23  
**Reference:** [PRODUCT_SPEC.md](./PRODUCT_SPEC.md), [TEST_PLAN.md](./TEST_PLAN.md)

---

## Notation

| Symbol | Meaning |
|---|---|
| **Story** | Functional domain / user story under test |
| **ID** | Unique identifier with feature prefix (e.g. `AUTH-T001`) |
| **Priority** | T1 = Critical, T2 = High, T3 = Medium, T4 = Low |
| **Test Type** | `Automation` = Playwright automated; `Manual` = human execution only |
| **Testing Layer** | `API Integration` = REST/GraphQL layer; `UI E2E` = Angular SPA layer |
| **Manual Result** | passed / failed / not run / **N/A** (N/A when Test Type = Automation) |
| **Automation Status** | `Automated` = script exists; `Not Automated` = pending implementation |
| **Automation Result** | passed / failed / not run / **N/A** (N/A when Test Type = Manual, or status = Not Automated) |

---

## 1. Authentication

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Authentication | AUTH-T001 | Register new user — Happy | 1. POST /users/register with unique email, first_name, last_name, password, address, phone, dob | Status 201; response has `id` and `email` matching payload | T1 | Automation | API Integration | N/A | Automated | not run | §6.1 AUTH-01 |
| Authentication | AUTH-T002 | Register — duplicate email | 1. Register a user. 2. POST /users/register with the same email | Status 422 | T1 | Automation | API Integration | N/A | Automated | not run | §6.1 |
| Authentication | AUTH-T003 | Register — missing required field | 1. POST /users/register omitting `first_name` | Status 422; field-level error returned | T1 | Automation | API Integration | N/A | Not Automated | not run | BR-AUTH-01 |
| Authentication | AUTH-T004 | Register — weak password | 1. POST /users/register with password "password" (no upper/number/special) | Status 422; password complexity error in response | T2 | Automation | API Integration | N/A | Not Automated | not run | BR-AUTH-01 |
| Authentication | AUTH-T005 | Login — valid credentials | 1. POST /users/login with registered email + correct password | Status 200; `access_token` present | T1 | Automation | API Integration | N/A | Automated | not run | §6.1 AUTH-03 |
| Authentication | AUTH-T006 | Login — invalid password | 1. POST /users/login with registered email + wrong password | Status 401 | T1 | Automation | API Integration | N/A | Automated | not run | |
| Authentication | AUTH-T007 | Login — non-existent email | 1. POST /users/login with an email that has never been registered | Status 401 | T1 | Automation | API Integration | N/A | Not Automated | not run | |
| Authentication | AUTH-T008 | Account locked after 3 failed logins | 1. Register throwaway account. 2. POST /users/login with wrong password 3× in sequence. 3. POST /users/login 4th attempt (any password) | 4th attempt returns 423; message "Account locked, too many failed attempts. Please contact the administrator." | T1 | Automation | API Integration | N/A | Not Automated | not run | BR-AUTH-08; use unique throwaway account per run |
| Authentication | AUTH-T009 | Admin exempt from account locking | 1. POST /users/login with admin email + wrong password 5×. 2. POST /users/login with correct admin credentials | Admin still logs in successfully; no 423 at any point | T1 | Automation | API Integration | N/A | Not Automated | not run | BR-AUTH-09 |
| Authentication | AUTH-T010 | Disabled account cannot login | 1. Admin toggles a user to disabled. 2. POST /users/login with that user's credentials | Status 401 or 403; message "Account disabled." | T1 | Automation | API Integration | N/A | Not Automated | not run | BR-AUTH-10; AC-AUTH-10c |
| Authentication | AUTH-T011 | Refresh token | 1. Login to get access_token. 2. GET /users/refresh with `Authorization: Bearer <token>` | Status 200; new `access_token` in response | T4 | Automation | API Integration | N/A | Automated | not run | |
| Authentication | AUTH-T012 | Logout | 1. Login to get access_token. 2. GET /users/logout with Bearer token | Status 200 | T2 | Automation | API Integration | N/A | Automated | not run | |
| Authentication | AUTH-T013 | Access protected endpoint without token | 1. GET /users/me with no Authorization header | Status 401 | T1 | Automation | API Integration | N/A | Automated | not run | |
| Authentication | AUTH-T014 | Access protected endpoint with malformed token | 1. GET /users/me with `Authorization: Bearer invalidtoken` | Status 401 | T2 | Automation | API Integration | N/A | Not Automated | not run | |
| Authentication | AUTH-T015 | Forgot password — registered email | 1. POST /users/forgot-password with `{ "email": "<registeredEmail>" }` | Status 200 | T3 | Automation | API Integration | N/A | Automated | not run | D-05 |
| Authentication | AUTH-T016 | Forgot password — non-existent email (no enumeration) | 1. POST /users/forgot-password with a made-up email | Status 200 (same as valid email — prevents enumeration) | T2 | Automation | API Integration | N/A | Not Automated | not run | D-05; BR-AUTH-07 |
| Authentication | AUTH-T017 | Change password — valid | 1. Login. 2. POST /users/change-password with `{ current_password, new_password, new_password_confirmation }`. 3. Login with new password | Step 2 returns 200; step 3 login succeeds | T2 | Automation | API Integration | N/A | Automated | not run | |
| Authentication | AUTH-T018 | Change password — wrong current password | 1. Login. 2. POST /users/change-password with incorrect `current_password` | Status 422 or 401 | T2 | Automation | API Integration | N/A | Not Automated | not run | |
| Authentication | AUTH-T019 | Change password — new passwords don't match | 1. Login. 2. POST /users/change-password with `new_password ≠ new_password_confirmation` | Status 422 | T2 | Automation | API Integration | N/A | Not Automated | not run | |
| Authentication | AUTH-T020 | Social login — Google redirect smoke | 1. GET /auth/social-login?provider=google (no auth) | Status 302; redirect URL points to Google OAuth | T4 | Automation | API Integration | N/A | Not Automated | not run | OAuth popup not automatable end-to-end; smoke only |
| Authentication | AUTH-T021 | TOTP setup and verify | 1. Login as customer. 2. GET /totp/setup. 3. Scan QR code, generate valid 6-digit code. 4. POST /totp/verify with code | QR code returned; POST verify returns 200 | T4 | Manual | API Integration | not run | N/A | N/A | Optional 2FA; skip if disabled in env |

---

## 2. User Management

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| User Management | USR-T001 | List all users — admin | 1. Login as admin. 2. GET /users | Status 200; `data` is array; `total` is integer | T2 | Automation | API Integration | N/A | Automated | not run | AC-USR-01a |
| User Management | USR-T002 | List users — customer token (RBAC) | 1. Login as customer. 2. GET /users | Status 403 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-USR-01b |
| User Management | USR-T003 | List users — no token (RBAC) | 1. GET /users with no token | Status 401 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-USR-01c |
| User Management | USR-T004 | Get current user profile | 1. Login as customer. 2. GET /users/me | Status 200; `email` matches logged-in user | T1 | Automation | API Integration | N/A | Automated | not run | |
| User Management | USR-T005 | Get user by ID — admin | 1. Login as admin. 2. GET /users/{knownUserId} | Status 200; `id` matches userId | T2 | Automation | API Integration | N/A | Automated | not run | |
| User Management | USR-T006 | Get user by non-existent ID — admin | 1. Login as admin. 2. GET /users/{randomUUID} | Status 404 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-USR-04b |
| User Management | USR-T007 | Get user by ID — customer token (RBAC) | 1. Login as customer. 2. GET /users/{anyUserId} | Status 403 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-USR-04c |
| User Management | USR-T008 | Full update user (PUT) — owner | 1. Login as customer. 2. PUT /users/{ownUserId} with updated first_name + last_name. 3. GET /users/me | Status 200; updated fields reflected in GET | T2 | Automation | API Integration | N/A | Automated | not run | AC-USR-05a |
| User Management | USR-T009 | Full update user (PUT) — customer updates other user (RBAC) | 1. Login as customer A. 2. PUT /users/{customerB_id} | Status 403 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-USR-05c |
| User Management | USR-T010 | Partial update user (PATCH) — owner | 1. Login as customer. 2. PATCH /users/{ownUserId} with `{ "first_name": "PatchedFirst" }`. 3. GET /users/me | Status 200; first_name updated; other fields unchanged | T2 | Automation | API Integration | N/A | Automated | not run | AC-USR-06a |
| User Management | USR-T011 | Partial update user (PATCH) — customer updates other user (RBAC) | 1. Login as customer A. 2. PATCH /users/{customerB_id} | Status 403 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-USR-06b |
| User Management | USR-T012 | Search users — admin, matching email | 1. Login as admin. 2. GET /users/search?q=<known_email> | Status 200; result includes matching user | T3 | Automation | API Integration | N/A | Automated | not run | AC-USR-02a |
| User Management | USR-T013 | Search users — no match | 1. Login as admin. 2. GET /users/search?q=zzznomatch | Status 200; `data` is empty array | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-USR-02b |
| User Management | USR-T014 | Delete user — admin; verify 404 | 1. Login as admin. 2. Register throwaway user. 3. DELETE /users/{userId}. 4. GET /users/{userId} | DELETE returns 204; subsequent GET returns 404 | T1 | Automation | API Integration | N/A | Automated | not run | AC-USR-07a/b |
| User Management | USR-T015 | Delete user — customer token (RBAC) | 1. Login as customer. 2. DELETE /users/{otherUserId} | Status 403 | T2 | Automation | API Integration | N/A | Automated | not run | AC-USR-07c |

---

## 3. Products

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Products | PROD-T001 | List all products — default | 1. GET /products (no auth, no params) | Status 200; `data` array non-empty; `total` > 0; each item has `id`, `name`, `price`, `in_stock`, `co2_rating` | T2 | Automation | API Integration | N/A | Automated | not run | AC-PROD-01a |
| Products | PROD-T002 | Filter products by category_id | 1. GET /products?category_id=<known_id> | Status 200; all returned products have matching `category.id` | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-PROD-01b |
| Products | PROD-T003 | Filter products by brand_id | 1. GET /products?brand_id=<known_id> | Status 200; all returned products have matching `brand.id` | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-PROD-01c |
| Products | PROD-T004 | Filter products by price range | 1. GET /products?price_min=10&price_max=50 | Status 200; all returned products have price in [10, 50] | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-PROD-01d |
| Products | PROD-T005 | Paginate products — page 2 differs from page 1 | 1. GET /products?page=1. 2. GET /products?page=2 | Status 200 both; `data` arrays are different sets | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-PROD-01e |
| Products | PROD-T006 | Sort products by name ascending | 1. GET /products?sort=name,asc | Status 200; first product name alphabetically precedes last | T3 | Automation | API Integration | N/A | Not Automated | not run | §6.3 PROD-01 query params |
| Products | PROD-T007 | Get product by ID | 1. GET /products/{knownProductId} | Status 200; `id`, `name`, `price`, `in_stock`, `co2_rating`, `brand`, `category` all present | T2 | Automation | API Integration | N/A | Automated | not run | AC-PROD-02a |
| Products | PROD-T008 | Get non-existent product | 1. GET /products/{randomUUID} | Status 404 | T2 | Automation | API Integration | N/A | Automated | not run | AC-PROD-02b |
| Products | PROD-T009 | Search products — matching query | 1. GET /products/search?q=Hammer | Status 200; results contain products with "hammer" in name (case-insensitive) | T2 | Automation | API Integration | N/A | Automated | not run | AC-PROD-03a; BR-PROD-07 |
| Products | PROD-T010 | Search products — no match | 1. GET /products/search?q=zzznomatch | Status 200; `data` is empty array | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-PROD-03b |
| Products | PROD-T011 | Get related products | 1. GET /products/{knownProductId}/related | Status 200; response is array (may be empty) | T3 | Automation | API Integration | N/A | Automated | not run | AC-PROD-04a |
| Products | PROD-T012 | Create product — admin | 1. Login as admin. 2. POST /products with name, description, price, category_id, brand_id, co2_rating | Status 201; `id` in response | T3 | Automation | API Integration | N/A | Automated | not run | AC-PROD-05a |
| Products | PROD-T013 | Create product — missing name | 1. Login as admin. 2. POST /products without `name` field | Status 422 | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-PROD-05b |
| Products | PROD-T014 | Create product — invalid co2_rating | 1. Login as admin. 2. POST /products with co2_rating = "Z" | Status 422 | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-PROD-05c; BR-PROD-05 |
| Products | PROD-T015 | Create product — customer token (RBAC) | 1. Login as customer. 2. POST /products with valid payload | Status 403 | T2 | Automation | API Integration | N/A | Automated | not run | AC-PROD-05e |
| Products | PROD-T016 | Update product (PUT) — admin | 1. Login as admin. 2. PUT /products/{productId} with updated name | Status 200; name reflected in GET | T3 | Automation | API Integration | N/A | Automated | not run | AC-PROD-06a |
| Products | PROD-T017 | Partial update product (PATCH) — admin | 1. Login as admin. 2. PATCH /products/{productId} with `{ "price": 9.99 }` | Status 200; price updated; other fields unchanged | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-PROD-07a |
| Products | PROD-T018 | Update/Delete product — customer token (RBAC) | 1. Login as customer. 2. PUT /products/{productId} with valid payload | Status 403 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-PROD-06b/07b |
| Products | PROD-T019 | Delete product — admin; verify 404 | 1. Login as admin. 2. Create a product. 3. DELETE /products/{productId}. 4. GET /products/{productId} | DELETE returns 204; GET returns 404 | T3 | Automation | API Integration | N/A | Automated | not run | AC-PROD-08a/b |
| Products | PROD-T020 | List rental products only | 1. GET /products?is_rental=true | Status 200; all returned products have `is_rental: true` | T3 | Automation | API Integration | N/A | Not Automated | not run | §6.15 AC-RENT-01 |

---

## 4. Product Specifications

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Product Specifications | SPEC-T001 | Get specs for a product | 1. GET /products/{knownProductId}/specs | Status 200; response is array of `{ id, spec_name, spec_value, spec_unit }` | T2 | Automation | API Integration | N/A | Automated | not run | AC-SPEC-01 |
| Product Specifications | SPEC-T002 | Get all spec names | 1. GET /product-specs/names | Status 200; response is array of distinct spec name strings | T3 | Automation | API Integration | N/A | Automated | not run | AC-SPEC-02 |
| Product Specifications | SPEC-T003 | Add spec to product — admin | 1. Login as admin. 2. POST /products/{productId}/specs with `{ spec_name: "Weight", spec_value: "500", spec_unit: "g" }`. 3. GET /products/{productId}/specs | Step 2 returns 201 with `id`; step 3 includes new spec | T3 | Automation | API Integration | N/A | Automated | not run | AC-SPEC-03 |
| Product Specifications | SPEC-T004 | Update spec — admin | 1. Login as admin. 2. PUT /products/{productId}/specs/{specId} with updated spec_value | Status 200; value reflected on re-read | T3 | Automation | API Integration | N/A | Automated | not run | AC-SPEC-04 |
| Product Specifications | SPEC-T005 | Delete spec — admin; verify removed | 1. Login as admin. 2. DELETE /products/{productId}/specs/{specId}. 3. GET /products/{productId}/specs | DELETE returns 204; spec absent in GET response | T3 | Automation | API Integration | N/A | Automated | not run | AC-SPEC-05 |
| Product Specifications | SPEC-T006 | Add spec — customer token (RBAC) | 1. Login as customer. 2. POST /products/{productId}/specs with valid payload | Status 403 | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-SPEC-06 |

---

## 5. Brands

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Brands | BRAND-T001 | Get all brands | 1. GET /brands (no auth) | Status 200; response is array with `id`, `name`, `slug` per item | T2 | Automation | API Integration | N/A | Automated | not run | AC-BRAND-01 |
| Brands | BRAND-T002 | Get brand by ID | 1. GET /brands/{knownBrandId} | Status 200; `id` matches brandId | T3 | Automation | API Integration | N/A | Automated | not run | |
| Brands | BRAND-T003 | Get non-existent brand | 1. GET /brands/{randomUUID} | Status 404 | T3 | Automation | API Integration | N/A | Not Automated | not run | Edge: missing in original |
| Brands | BRAND-T004 | Search brands — match | 1. GET /brands/search?q=<partialName> | Status 200; matching brands returned | T3 | Automation | API Integration | N/A | Automated | not run | AC-BRAND-03 |
| Brands | BRAND-T005 | Search brands — no match | 1. GET /brands/search?q=zzznomatch | Status 200; empty array | T3 | Automation | API Integration | N/A | Not Automated | not run | Edge case |
| Brands | BRAND-T006 | Create brand — admin | 1. Login as admin. 2. POST /brands with `{ name: "Test Brand", slug: "test-brand-<timestamp>" }` | Status 201; `id` present in response | T3 | Automation | API Integration | N/A | Automated | not run | AC-BRAND-04 |
| Brands | BRAND-T007 | Create brand — duplicate slug | 1. Login as admin. 2. POST /brands. 3. POST /brands with same slug | Second POST returns 422 | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-BRAND-04b; BR-BRAND-01 |
| Brands | BRAND-T008 | Create brand — customer token (RBAC) | 1. Login as customer. 2. POST /brands with valid payload | Status 403 | T2 | Automation | API Integration | N/A | Automated | not run | |
| Brands | BRAND-T009 | Update brand (PUT) — admin | 1. Login as admin. 2. PUT /brands/{brandId} with updated name | Status 200 | T3 | Automation | API Integration | N/A | Automated | not run | |
| Brands | BRAND-T010 | Partial update brand (PATCH) — admin | 1. Login as admin. 2. PATCH /brands/{brandId} with `{ "name": "Patched Brand" }` | Status 200; name updated | T3 | Automation | API Integration | N/A | Automated | not run | |
| Brands | BRAND-T011 | Delete brand — admin; verify 404 | 1. Login as admin. 2. Create a brand with no linked products. 3. DELETE /brands/{brandId}. 4. GET /brands/{brandId} | DELETE returns 204; GET returns 404 | T3 | Automation | API Integration | N/A | Automated | not run | |
| Brands | BRAND-T012 | Delete brand with linked products (Conflict) | 1. Login as admin. 2. Find a brand with linked products. 3. DELETE /brands/{brandId} | Status 409 Conflict | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-BRAND-07b; BR-BRAND-02 |

---

## 6. Categories

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Categories | CAT-T001 | Get all categories — flat list | 1. GET /categories (no auth) | Status 200; response is flat array with `id`, `name`, `slug` | T2 | Automation | API Integration | N/A | Automated | not run | AC-CAT-01 |
| Categories | CAT-T002 | Get category tree | 1. GET /categories/tree | Status 200; root nodes have `sub_categories` arrays | T2 | Automation | API Integration | N/A | Automated | not run | AC-CAT-02 |
| Categories | CAT-T003 | Get category tree by specific ID | 1. GET /categories/tree/{knownCategoryId} | Status 200; returns tree branch from that category | T3 | Automation | API Integration | N/A | Not Automated | not run | §6.6 CAT-03 |
| Categories | CAT-T004 | Search categories | 1. GET /categories/search?q=hand | Status 200; matching categories returned | T3 | Automation | API Integration | N/A | Automated | not run | |
| Categories | CAT-T005 | Create root category — admin | 1. Login as admin. 2. POST /categories with `{ name: "Test Cat", slug: "test-cat-<ts>" }` | Status 201; `id` present | T3 | Automation | API Integration | N/A | Automated | not run | AC-CAT-05 |
| Categories | CAT-T006 | Create child category with parent_id — admin | 1. Login as admin. 2. POST /categories with valid parent_id. 3. GET /categories/tree | Status 201; tree shows child under parent | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-CAT-05; BR-CAT-02 |
| Categories | CAT-T007 | Update category (PUT) — admin | 1. Login as admin. 2. PUT /categories/{categoryId} with updated name | Status 200 | T3 | Automation | API Integration | N/A | Automated | not run | |
| Categories | CAT-T008 | Partial update category (PATCH) — admin | 1. Login as admin. 2. PATCH /categories/{categoryId} with `{ "name": "Patched" }` | Status 200; name updated | T3 | Automation | API Integration | N/A | Not Automated | not run | §6.6 CAT-07 |
| Categories | CAT-T009 | Delete leaf category — admin | 1. Login as admin. 2. Create a leaf category. 3. DELETE /categories/{categoryId} | Status 204 | T3 | Automation | API Integration | N/A | Automated | not run | AC-CAT-08 |
| Categories | CAT-T010 | Delete category with children (Conflict) | 1. Login as admin. 2. Find a parent category with children. 3. DELETE /categories/{parentId} | Status 409 or 422; cannot delete non-leaf | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-CAT-08b; BR-CAT-04 |
| Categories | CAT-T011 | Delete category — customer token (RBAC) | 1. Login as customer. 2. DELETE /categories/{anyId} | Status 403 | T3 | Automation | API Integration | N/A | Not Automated | not run | |

---

## 7. Cart

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Cart | CART-T001 | Create cart — anonymous | 1. POST /carts (no auth) | Status 201; `id` in response | T1 | Automation | API Integration | N/A | Automated | not run | AC-CART-01; BR-CART-05 |
| Cart | CART-T002 | Add product to cart | 1. Create cart. 2. POST /carts/{cartId} with `{ product_id, quantity: 2 }` | Status 200; `cart_items` contains the product; `total` = price × 2 | T1 | Automation | API Integration | N/A | Automated | not run | AC-CART-02 |
| Cart | CART-T003 | Add non-existent product to cart | 1. Create cart. 2. POST /carts/{cartId} with non-existent product_id | Status 404 | T2 | Automation | API Integration | N/A | Automated | not run | AC-CART-02b |
| Cart | CART-T004 | Retrieve cart with correct line totals | 1. Create cart. 2. Add product with quantity 3. 3. GET /carts/{cartId} | Status 200; `cart_items[0].line_total` = price × 3; `total` matches | T1 | Automation | API Integration | N/A | Automated | not run | AC-CART-03 |
| Cart | CART-T005 | Get non-existent cart | 1. GET /carts/{randomUUID} | Status 404 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-CART-06 edge |
| Cart | CART-T006 | Update item quantity | 1. Create cart and add product. 2. PUT /carts/{cartId}/product/quantity with `{ product_id, quantity: 5 }` | Status 200; `line_total` recalculated for quantity 5 | T1 | Automation | API Integration | N/A | Automated | not run | AC-CART-04 |
| Cart | CART-T007 | Update item quantity to zero or negative | 1. Create cart and add product. 2. PUT /carts/{cartId}/product/quantity with `{ product_id, quantity: 0 }` | Status 422 | T1 | Automation | API Integration | N/A | Not Automated | not run | AC-CART-04b; BR-CART-02 |
| Cart | CART-T008 | Remove product from cart | 1. Create cart and add product. 2. DELETE /carts/{cartId}/product/{productId}. 3. GET /carts/{cartId} | DELETE returns 204; product absent in subsequent GET | T1 | Automation | API Integration | N/A | Automated | not run | AC-CART-05 |
| Cart | CART-T009 | Delete entire cart | 1. Create cart with items. 2. DELETE /carts/{cartId}. 3. GET /carts/{cartId} | DELETE returns 204; GET returns 404 | T1 | Automation | API Integration | N/A | Automated | not run | AC-CART-06 |
| Cart | CART-T010 | Combination discount — rental + non-rental items | 1. Create cart. 2. Add a rental product. 3. Add a non-rental product. 4. GET /carts/{cartId} | Status 200; response includes 15% combination discount on subtotal; `discount_percentage` and `discount_amount` fields present | T2 | Automation | API Integration | N/A | Not Automated | not run | BR-CART-06; AC-CART-07 |
| Cart | CART-T011 | Combination discount removed when rental item removed | 1. Cart with rental + non-rental (discount active). 2. DELETE /carts/{cartId}/product/{rentalProductId}. 3. GET /carts/{cartId} | Discount absent; `total` equals subtotal | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-CART-08 |

---

## 8. Favourites

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Favourites | FAV-T001 | Add product to favourites | 1. Login as customer. 2. POST /favorites with `{ product_id: knownProductId }` | Status 201; response has `id` and `product_id` | T2 | Automation | API Integration | N/A | Automated | not run | AC-FAV-01a |
| Favourites | FAV-T002 | Add duplicate favourite (Conflict) | 1. Login. 2. POST /favorites with same product_id twice | Second POST returns 422 or 409 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-FAV-01b; BR-FAV-02 |
| Favourites | FAV-T003 | Add non-existent product to favourites | 1. Login. 2. POST /favorites with non-existent product_id | Status 404 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-FAV-01c |
| Favourites | FAV-T004 | Add favourite — no auth (RBAC) | 1. POST /favorites with valid product_id and no token | Status 401 | T2 | Automation | API Integration | N/A | Automated | not run | AC-FAV-01d |
| Favourites | FAV-T005 | Get all favourites | 1. Login as customer. 2. GET /favorites | Status 200; response is array containing own favourites only | T2 | Automation | API Integration | N/A | Automated | not run | AC-FAV-02; BR-FAV-03 |
| Favourites | FAV-T006 | Get specific favourite | 1. Login. 2. POST /favorites. 3. GET /favorites/{favoriteId} | Status 200; `id` matches favoriteId | T3 | Automation | API Integration | N/A | Automated | not run | |
| Favourites | FAV-T007 | Remove favourite | 1. Login. 2. Add favourite. 3. DELETE /favorites/{favoriteId}. 4. GET /favorites | DELETE returns 204; item absent in GET | T2 | Automation | API Integration | N/A | Automated | not run | AC-FAV-04 |

---

## 9. Invoices

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Invoices | INV-T001 | Create invoice — authenticated, cash-on-delivery | 1. Login as customer. 2. Create cart with items. 3. POST /invoices with billing address, payment_method: "cash-on-delivery", cart_id | Status 201; response has `id`, `invoice_number`, `total`, `status: "PLACED"` | T1 | Automation | API Integration | N/A | Automated | not run | AC-INV-F1 |
| Invoices | INV-T002 | Create invoice — authenticated, credit card | 1. Login. 2. Cart with items. 3. POST /invoices with credit card details | Status 201; `invoice_number` present | T1 | Automation | API Integration | N/A | Not Automated | not run | BR-INV-03 |
| Invoices | INV-T003 | Create guest invoice | 1. Create cart. 2. POST /invoices/guest with cart_id, billing address, guest_email, guest_first_name, guest_last_name | Status 201; `id` in response; no auth required | T1 | Automation | API Integration | N/A | Automated | not run | AC-INV-F2; BR-INV-06 |
| Invoices | INV-T004 | Create invoice — invalid payment method | 1. Login. 2. Cart with items. 3. POST /invoices with payment_method: "bitcoin" | Status 422 | T1 | Automation | API Integration | N/A | Not Automated | not run | AC-INV-F3; BR-INV-02 |
| Invoices | INV-T005 | Create invoice — missing cart_id | 1. Login. 2. POST /invoices without cart_id field | Status 422 | T1 | Automation | API Integration | N/A | Not Automated | not run | AC-INV-F4 |
| Invoices | INV-T006 | Create invoice — credit card missing CVV | 1. Login. 2. Cart with items. 3. POST /invoices with credit card payload omitting `cvv` | Status 422 | T1 | Automation | API Integration | N/A | Not Automated | not run | AC-INV-F5; BR-INV-03 |
| Invoices | INV-T007 | Get own invoices | 1. Login as customer with at least one invoice. 2. GET /invoices | Status 200; `data` array; all invoices belong to logged-in user | T2 | Automation | API Integration | N/A | Automated | not run | AC-INV-03a |
| Invoices | INV-T008 | Admin sees all invoices | 1. Login as admin. 2. GET /invoices | Status 200; `data` contains invoices from multiple users | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-INV-03b |
| Invoices | INV-T009 | Get invoice by ID — owner | 1. Login as customer. 2. GET /invoices/{ownInvoiceId} | Status 200; `invoice_number`, `total`, `status`, `invoicelines` present | T2 | Automation | API Integration | N/A | Automated | not run | AC-INV-05a |
| Invoices | INV-T010 | Get invoice by ID — different customer (RBAC) | 1. Login as customer A. 2. GET /invoices/{customerB_invoiceId} | Status 403 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-INV-05b |
| Invoices | INV-T011 | Get invoices without auth (RBAC) | 1. GET /invoices with no token | Status 401 | T2 | Automation | API Integration | N/A | Automated | not run | |
| Invoices | INV-T012 | Update invoice status — admin | 1. Login as admin. 2. PUT /invoices/{invoiceId}/status with `{ status: "SHIPPED" }` | Status 200; `status` reflects "SHIPPED" on re-read | T3 | Automation | API Integration | N/A | Automated | not run | AC-INV-08a |
| Invoices | INV-T013 | Update invoice status — invalid value | 1. Login as admin. 2. PUT /invoices/{invoiceId}/status with `{ status: "INVALID" }` | Status 422 | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-INV-08b |
| Invoices | INV-T014 | Update invoice status — customer token (RBAC) | 1. Login as customer. 2. PUT /invoices/{invoiceId}/status | Status 403 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-INV-08c |
| Invoices | INV-T015 | Invoice with discount includes discount fields | 1. Create cart with geo-discount or combination-discount scenario. 2. POST /invoices | Response includes `subtotal`, `discount_percentage`, `discount_amount`, `total` | T1 | Automation | API Integration | N/A | Not Automated | not run | AC-INV-F6; BR-INV-10 |
| Invoices | INV-T016 | PDF invoice download — trigger | 1. Login. 2. GET /invoices/{invoice_number}/download-pdf | Status 200; async trigger accepted | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-INV-09a; BR-INV-08 |
| Invoices | INV-T017 | PDF invoice download — poll until ready | 1. Trigger PDF generation. 2. Poll GET /invoices/{invoice_number}/download-pdf-status until `status: "ready"` | `pdf_url` is a valid URL; poll resolves within 10 s | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-INV-10a; max retries 10 × 1 s |

---

## 10. Contact / Messages

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Contact / Messages | MSG-T001 | Send contact message — valid | 1. POST /messages with `{ name, email, subject: "Customer Service", message: "<50+ chars>" }` (no auth) | Status 200; `success: true` | T2 | Automation | API Integration | N/A | Automated | not run | AC-MSG-01a |
| Contact / Messages | MSG-T002 | Send message — invalid subject | 1. POST /messages with subject: "InvalidSubject" | Status 422 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-MSG-01b; BR-MSG-02 |
| Contact / Messages | MSG-T003 | Send message — missing email | 1. POST /messages without `email` field | Status 422 | T2 | Automation | API Integration | N/A | Automated | not run | AC-MSG-01c |
| Contact / Messages | MSG-T004 | Send message — body fewer than 50 characters | 1. POST /messages with message: "Short msg" (< 50 chars) | Status 422 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-MSG-01d; BR-MSG-06 |
| Contact / Messages | MSG-T005 | Attach non-txt file | 1. POST /messages/{id}/attach-file with a .pdf attachment | Status 422; "File should have a txt extension." | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-MSG-01f; BR-MSG-08 |
| Contact / Messages | MSG-T006 | Attach txt file with size > 0 KB | 1. POST /messages/{id}/attach-file with .txt file containing content | Status 422; "File should be empty." | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-MSG-01g; BR-MSG-08 |
| Contact / Messages | MSG-T007 | Get all messages — admin | 1. Login as admin. 2. GET /messages | Status 200; `data` array with all messages | T3 | Automation | API Integration | N/A | Automated | not run | AC-MSG-03b |
| Contact / Messages | MSG-T008 | Get messages — no token (RBAC) | 1. GET /messages with no token | Status 401 | T2 | Automation | API Integration | N/A | Automated | not run | |
| Contact / Messages | MSG-T009 | Get specific message — admin | 1. Login as admin. 2. GET /messages/{messageId} | Status 200; `id` matches messageId | T3 | Automation | API Integration | N/A | Automated | not run | |
| Contact / Messages | MSG-T010 | Admin reply to message | 1. Login as admin. 2. POST /messages/{messageId}/reply with reply text | Status 200 | T3 | Automation | API Integration | N/A | Not Automated | not run | MSG-05; AC-MSG-03 |
| Contact / Messages | MSG-T011 | Update message status — admin | 1. Login as admin. 2. PUT /messages/{messageId}/status with `{ status: "IN_PROGRESS" }` | Status 200; status updated | T3 | Automation | API Integration | N/A | Automated | not run | AC-MSG-06 |
| Contact / Messages | MSG-T012 | Update message status — invalid value | 1. Login as admin. 2. PUT /messages/{messageId}/status with `{ status: "FAKE" }` | Status 422 | T3 | Automation | API Integration | N/A | Not Automated | not run | BR-MSG-04 |

---

## 11. Payment Validation

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Payment | PAY-T001 | Cash on delivery — valid | 1. POST /payment/check with `{ payment_method: "cash-on-delivery", payment_details: {} }` | Status 200; `message` present | T1 | Automation | API Integration | N/A | Automated | not run | AC-PAY-01 |
| Payment | PAY-T002 | Credit card — valid | 1. POST /payment/check with credit card number 4111111111111111, expiration_date, cvv, card_holder_name | Status 200 | T1 | Automation | API Integration | N/A | Automated | not run | AC-PAY-02; BR-PAY-04 Luhn valid |
| Payment | PAY-T003 | Bank transfer — valid | 1. POST /payment/check with `{ payment_method: "bank-transfer", payment_details: {} }` | Status 200 | T2 | Automation | API Integration | N/A | Automated | not run | |
| Payment | PAY-T004 | Buy now pay later — valid | 1. POST /payment/check with `{ payment_method: "buy-now-pay-later", payment_details: {} }` | Status 200 | T1 | Automation | API Integration | N/A | Not Automated | not run | §6.11 |
| Payment | PAY-T005 | Gift card — valid format | 1. POST /payment/check with `{ payment_method: "gift-card", payment_details: { code: "GC-ABCDEF1234567890" } }` | Status 200 | T1 | Automation | API Integration | N/A | Not Automated | not run | BR-PAY-03 |
| Payment | PAY-T006 | Credit card — missing CVV | 1. POST /payment/check with credit card payload omitting `cvv` | Status 422 | T1 | Automation | API Integration | N/A | Not Automated | not run | AC-PAY-06 |
| Payment | PAY-T007 | Invalid payment method | 1. POST /payment/check with `{ payment_method: "bitcoin" }` | Status 422 | T1 | Automation | API Integration | N/A | Not Automated | not run | AC-PAY-07 |
| Payment | PAY-T008 | Gift card — wrong code format | 1. POST /payment/check with `{ payment_method: "gift-card", payment_details: { code: "WRONGFORMAT" } }` | Status 422 | T1 | Automation | API Integration | N/A | Not Automated | not run | AC-PAY-08; BR-PAY-03 |
| Payment | PAY-T009 | Credit card — fails Luhn check | 1. POST /payment/check with invalid card number "1234567890123456" | Status 422 | T2 | Automation | API Integration | N/A | Not Automated | not run | BR-PAY-04 |

---

## 12. Postcode Lookup

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Postcode Lookup | POST-T001 | Valid postcode lookup | 1. GET /postcode-lookup?country=NL&postcode=1234AA&house_number=10 | Status 200; response has `street`, `city`, `state` | T3 | Automation | API Integration | N/A | Automated | not run | AC-POST-01 |
| Postcode Lookup | POST-T002 | Missing country | 1. GET /postcode-lookup?postcode=1234AA | Status 422 | T3 | Automation | API Integration | N/A | Automated | not run | AC-POST-02 |
| Postcode Lookup | POST-T003 | Missing postcode | 1. GET /postcode-lookup?country=NL | Status 422 | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-POST-03 |
| Postcode Lookup | POST-T004 | With house_number returns specific street | 1. GET /postcode-lookup?country=NL&postcode=1234AA&house_number=10. 2. GET /postcode-lookup?country=NL&postcode=1234AA (no house number) | Step 1 returns more specific street data than step 2 | T3 | Automation | API Integration | N/A | Not Automated | not run | AC-POST-04; BR-POST-02 |

---

## 13. Images

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Images | IMG-T001 | List images | 1. GET /images (no auth) | Status 200; response is array; each item has `id` and `file_name` | T4 | Automation | API Integration | N/A | Not Automated | not run | AC-IMG-01; §6.13 |

---

## 14. Reports

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Reports | RPT-T001 | Total sales per country — admin | 1. Login as admin. 2. GET /reports/total-sales-per-country | Status 200; response is array with numeric metric fields | T3 | Automation | API Integration | N/A | Automated | not run | |
| Reports | RPT-T002 | Top 10 purchased products — admin | 1. Login as admin. 2. GET /reports/top10-purchased-products | Status 200; array with product data | T3 | Automation | API Integration | N/A | Automated | not run | |
| Reports | RPT-T003 | Top 10 best-selling categories — admin | 1. Login as admin. 2. GET /reports/top10-best-selling-categories | Status 200 | T3 | Automation | API Integration | N/A | Automated | not run | |
| Reports | RPT-T004 | Total sales of years — admin | 1. Login as admin. 2. GET /reports/total-sales-of-years | Status 200 | T3 | Automation | API Integration | N/A | Automated | not run | |
| Reports | RPT-T005 | Average sales per month — admin | 1. Login as admin. 2. GET /reports/average-sales-per-month | Status 200 | T3 | Automation | API Integration | N/A | Automated | not run | |
| Reports | RPT-T006 | Average sales per week — admin | 1. Login as admin. 2. GET /reports/average-sales-per-week | Status 200 | T3 | Automation | API Integration | N/A | Automated | not run | |
| Reports | RPT-T007 | Customers by country — admin | 1. Login as admin. 2. GET /reports/customers-by-country | Status 200 | T3 | Automation | API Integration | N/A | Automated | not run | |
| Reports | RPT-T008 | Reports — no token (RBAC) | 1. GET /reports/total-sales-per-country with no token | Status 401 | T2 | Automation | API Integration | N/A | Automated | not run | |
| Reports | RPT-T009 | Reports — customer token (RBAC) | 1. Login as customer. 2. GET /reports/total-sales-per-country | Status 403 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-RPT-X403; missing in v1 |

---

## 15. Rentals

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Rentals | RENT-T001 | List rental products via API filter | 1. GET /products?is_rental=true | Status 200; all returned products have `is_rental: true` | T3 | Automation | API Integration | N/A | Not Automated | not run | §6.15 AC-RENT-01 |
| Rentals | RENT-T002 | Rental product — zero regular products in is_rental filter | 1. GET /products?is_rental=false. 2. Confirm none of the page-1 results have is_rental: true | Status 200; no rental products mixed in | T3 | Automation | API Integration | N/A | Not Automated | not run | Edge case |
| Rentals | RENT-T003 | Rental product detail shows duration slider | 1. Navigate to detail page of a known rental product | Duration slider (1–10 hours) visible; quantity ± buttons absent | T3 | Automation | UI E2E | N/A | Not Automated | not run | AC-RENT-02; §8.10 UI-RNT-03 |
| Rentals | RENT-T004 | Rental price calculation from duration | 1. On rental product detail, move slider to 5 hours | Displayed price = hourly_rate × 5 | T3 | Automation | UI E2E | N/A | Not Automated | not run | AC-RENT-03; BR-RENT-02 |
| Rentals | RENT-T005 | Rental item label in cart | 1. Add rental product to cart. 2. Navigate to /checkout | Cart item row shows "This is a rental item" label | T3 | Automation | UI E2E | N/A | Not Automated | not run | AC-RENT-04; BR-RENT-04 |

---

## 16. Discounts

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Discounts | DISC-T001 | Geo-location discount — Amsterdam (20%) applied | 1. Set Playwright geolocation context to Amsterdam coordinates. 2. Navigate to a product with location-offer flag | Product shows original price with strikethrough; discounted price = original × 0.80 | T2 | Automation | UI E2E | N/A | Not Automated | not run | AC-DISC-01; BR-DISC-01/02 |
| Discounts | DISC-T002 | Geo-location discount — unsupported city = no discount | 1. Set geolocation to a city not in the supported list (e.g. Berlin). 2. Navigate to location-offer product | Full original price shown; no discount badge | T2 | Automation | UI E2E | N/A | Not Automated | not run | AC-DISC-02 |
| Discounts | DISC-T003 | Geo-location discount applies to cart line | 1. Apply geo-discount (Amsterdam). 2. Add discounted product to cart via API. 3. GET /carts/{cartId} | `cart_items[0].line_total` uses the discounted price | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-DISC-03; BR-DISC-03 |
| Discounts | DISC-T004 | Combination discount — rental + non-rental in API cart | 1. POST /carts. 2. Add rental product. 3. Add non-rental product. 4. GET /carts/{cartId} | Response includes `discount_percentage: 15`, `discount_amount`, `total` = subtotal × 0.85 | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-DISC-04; §6.16.2 |
| Discounts | DISC-T005 | Combination discount removed on clearing rental items | 1. Cart with rental + non-rental (combo discount active). 2. Remove rental item. 3. GET /carts/{cartId} | Discount fields absent; `total` = subtotal | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-DISC-05 |
| Discounts | DISC-T006 | Invoice with combination discount includes all fields | 1. Cart with rental + non-rental. 2. POST /invoices | Response includes `subtotal`, `discount_percentage`, `discount_amount`, `total` | T2 | Automation | API Integration | N/A | Not Automated | not run | AC-DISC-06; BR-INV-10 |
| Discounts | DISC-T007 | Discount badge shown on product listing card | 1. Set geo-location to London. 2. Navigate to home page | Product card for location-offer product shows original price strikethrough + discounted price | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-PL-10; BR-DISC-02 |
| Discounts | DISC-T008 | Combination discount shown in checkout Step 1 | 1. Login. 2. Add rental + non-rental product. 3. Navigate to /checkout | Checkout cart view shows subtotal, 15% discount amount, final total | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-CO-01d; §8.5 |

---

## 17. Product Comparison (GraphQL)

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Product Comparison | CMP-T001 | GraphQL query returns all aliased products | 1. POST /graphql with aliased query for 2 known productIds | Status 200; both `p0` and `p1` objects in response with `id`, `name`, `price`, `brand`, `co2_rating`, `specs` | T4 | Automation | API Integration | N/A | Not Automated | not run | AC-CMP-01; §6.17 |
| Product Comparison | CMP-T002 | GraphQL query — invalid product ID | 1. POST /graphql with one valid and one non-existent productId | Response includes null or error for invalid alias; valid alias returns data | T4 | Automation | API Integration | N/A | Not Automated | not run | Edge case |
| Product Comparison | CMP-T003 | Comparison page loads products side-by-side | 1. Add 2 products to comparison from detail pages. 2. Navigate to /comparison | Products displayed in side-by-side columns; each shows name, price, brand, CO₂ rating, specs | T4 | Automation | UI E2E | N/A | Not Automated | not run | AC-CMP-02; UI-CMP-01/02 |
| Product Comparison | CMP-T004 | Differences-only toggle hides matching attributes | 1. On /comparison page with 2 products that share some specs. 2. Toggle differences-only mode | Only attributes that differ between products are visible; identical rows hidden | T4 | Automation | UI E2E | N/A | Not Automated | not run | AC-CMP-03; UI-CMP-03 |

---

## 18. UI — Product Listing Page

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UI — Product Listing | UI-PL-T001 | Product listing loads with pagination | 1. Navigate to `https://practicesoftwaretesting.com` | Product cards visible (≤ 9); pagination controls present; page indicator shows "1" | T2 | Automation | UI E2E | N/A | Automated | not run | UI-PL-01 |
| UI — Product Listing | UI-PL-T002 | Filter by category | 1. On home page, check "Hammer" category checkbox | Only products in Hammer category displayed | T2 | Automation | UI E2E | N/A | Automated | not run | UI-PL-02 |
| UI — Product Listing | UI-PL-T003 | Filter by brand | 1. Check a brand checkbox in sidebar | All visible products belong to selected brand | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-PL-03 |
| UI — Product Listing | UI-PL-T004 | Sustainability filter | 1. Check "Sustainability" checkbox | Only eco-rated (A/B) products visible | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-PL-04 |
| UI — Product Listing | UI-PL-T005 | Price range filter | 1. Set price slider to range $10–$50 | All visible products priced between $10.00 and $50.00 | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-PL-05 |
| UI — Product Listing | UI-PL-T006 | Search updates product grid | 1. Type "Pliers" in search input. 2. Click Search | Grid shows only products matching "Pliers" | T2 | Automation | UI E2E | N/A | Automated | not run | UI-PL-06 |
| UI — Product Listing | UI-PL-T007 | Search — fewer than 3 characters not submitted | 1. Type "Pl" (2 chars) in search. 2. Click Search | Search not executed; validation error shown | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-PL-06b |
| UI — Product Listing | UI-PL-T008 | Search — resets active filters | 1. Apply category + brand filters. 2. Enter search term and submit | Category and brand filters reset to default; only search results shown | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-PL-06d |
| UI — Product Listing | UI-PL-T009 | Pagination navigates pages | 1. Click page "2" in pagination | New set of products loaded; URL includes `?page=2` | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-PL-07 |
| UI — Product Listing | UI-PL-T010 | Out-of-stock label visible | 1. Find or create a product with `in_stock: false`. 2. View product listing | "Out of stock" red label shown on that product card | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-PL-08 |
| UI — Product Listing | UI-PL-T011 | Hierarchical category selection — parent checks all children | 1. Check a parent category with child checkboxes | All child checkboxes automatically checked | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-PL-09 |
| UI — Product Listing | UI-PL-T012 | Discount displayed on product card | 1. Set geo-location to Amsterdam. 2. View product listing | Location-offer product card shows strikethrough original price and discounted price | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-PL-10 |

---

## 19. UI — Product Detail Page

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UI — Product Detail | UI-PD-T001 | Product detail displays all fields | 1. Click on a product from listing | Name, price, description, brand, category, CO₂ rating, specifications table all visible | T2 | Automation | UI E2E | N/A | Automated | not run | UI-PD-01 |
| UI — Product Detail | UI-PD-T002 | Add to cart shows toast and increments badge | 1. On product detail page. 2. Click "Add to Cart" | Toast "Product added to shopping cart." appears; cart badge increments by 1 | T1 | Automation | UI E2E | N/A | Automated | not run | UI-PD-02/03 |
| UI — Product Detail | UI-PD-T003 | Add to favourites — authenticated | 1. Login. 2. Navigate to product detail. 3. Click "Add to Favourites" | Toast "Product added to your favorites list." appears | T2 | Automation | UI E2E | N/A | Automated | not run | UI-PD-04 |
| UI — Product Detail | UI-PD-T004 | Add duplicate favourite shows distinct toast | 1. Login. 2. Add product to favourites. 3. Click "Add to Favourites" again | Toast "Product already in your favorites list." appears | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-PD-04b |
| UI — Product Detail | UI-PD-T005 | Add to favourites — unauthenticated | 1. Not logged in. 2. Click "Add to Favourites" | Toast "Unauthorized, can not add product to your favorite list." or redirect to sign-in | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-PD-04c/05 |
| UI — Product Detail | UI-PD-T006 | Discount price display on detail page | 1. Set geo-location to London. 2. Open detail for location-offer product | Original price shown with strikethrough; discounted price shown below; discount % badge visible | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-PD-01b |
| UI — Product Detail | UI-PD-T007 | Quantity selector — minimum 1 enforced | 1. On product detail, click "−" when quantity = 1 | Quantity stays at 1; cannot decrement below 1 | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-PD-08 |
| UI — Product Detail | UI-PD-T008 | Out-of-stock disables Add to Cart | 1. Navigate to a non-rental product with `in_stock: false` | "Add to Cart" button is disabled; "Out of stock" shown in red | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-PD-09 |
| UI — Product Detail | UI-PD-T009 | Rental product shows duration slider, not quantity buttons | 1. Navigate to a rental product detail page | Duration slider (1–10 hours) visible; +/− quantity buttons absent | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-PD-10 |
| UI — Product Detail | UI-PD-T010 | Related products section — clickable | 1. On product detail, observe related products section. 2. Click one related product | Section shows ≤ 5 cards; clicking navigates to `/product/{id}` | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-PD-07 |

---

## 20. UI — Checkout Flow

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UI — Checkout | UI-CO-T001 | Full authenticated checkout (Happy) | 1. Login. 2. Add product to cart. 3. Navigate to /checkout. 4. Proceed through Steps 1→3→4. 5. Select "Cash on Delivery". 6. Confirm | Invoice created; confirmation page shows "Thank you" + invoice number | T1 | Automation | UI E2E | N/A | Automated | not run | UI-CO-07 |
| UI — Checkout | UI-CO-T002 | Empty cart message in Step 1 | 1. Login with empty cart. 2. Navigate to /checkout | "Your shopping cart is empty" message displayed | T1 | Automation | UI E2E | N/A | Not Automated | not run | UI-CO-01b |
| UI — Checkout | UI-CO-T003 | Quantity update shows toast | 1. In checkout Step 1, change item quantity | Toast "Product quantity updated." appears; order total recalculates | T1 | Automation | UI E2E | N/A | Not Automated | not run | UI-CO-01c; BR-CART-07 |
| UI — Checkout | UI-CO-T004 | Remove item from checkout cart | 1. In checkout Step 1, click remove (×) on an item | Item row disappears; total recalculates | T1 | Automation | UI E2E | N/A | Not Automated | not run | UI-CO-03 |
| UI — Checkout | UI-CO-T005 | Authenticated user skips sign-in step | 1. Login. 2. Proceed from Step 1 | Navigation goes directly from Step 1 to Step 3 (billing); Step 2 is skipped | T1 | Automation | UI E2E | N/A | Not Automated | not run | UI-CO-04 |
| UI — Checkout | UI-CO-T006 | Guest checkout — sign-in step shown | 1. Not logged in. 2. Add item to cart. 3. Navigate to /checkout and proceed | Step 2 (Sign In) is shown with email + password fields | T1 | Automation | UI E2E | N/A | Not Automated | not run | |
| UI — Checkout | UI-CO-T007 | Already-signed-in message in sign-in step | 1. Login. 2. Navigate to checkout sign-in step URL directly | Message "You are already signed in as [First Name] [Last Name]" displayed | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-CO-04c |
| UI — Checkout | UI-CO-T008 | Billing address pre-filled for logged-in user | 1. Login. 2. Reach billing address step | Address fields pre-populated from user profile | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-CO-04d |
| UI — Checkout | UI-CO-T009 | Postcode auto-fill triggers on all 3 fields | 1. In billing step, fill country + postcode + house number | Spinner shown; street, city, state auto-filled after debounce | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-CO-05; BR-POST-04 |
| UI — Checkout | UI-CO-T010 | All 5 payment methods shown | 1. Reach Step 4 (Payment) | Dropdown shows: Bank Transfer, Cash on Delivery, Credit Card, Buy Now Pay Later, Gift Card | T1 | Automation | UI E2E | N/A | Not Automated | not run | UI-CO-06 |
| UI — Checkout | UI-CO-T011 | Credit card fields are dynamic | 1. Select "Credit Card" in payment step | Card number, expiry, CVV, holder name fields appear | T1 | Automation | UI E2E | N/A | Not Automated | not run | UI-CO-06b |
| UI — Checkout | UI-CO-T012 | Credit card — past expiry date rejected | 1. Select "Credit Card". 2. Enter expiration date in the past | Inline error "Expiration date must be in the future." | T1 | Automation | UI E2E | N/A | Not Automated | not run | UI-CO-06c |
| UI — Checkout | UI-CO-T013 | Buy Now Pay Later — installments dropdown | 1. Select "Buy Now Pay Later" | Dropdown with options 3, 6, 9, 12 months shown | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-CO-06d |
| UI — Checkout | UI-CO-T014 | Combination discount shown in checkout cart | 1. Login. 2. Add rental + non-rental items. 3. Go to /checkout Step 1 | Subtotal, 15% discount line, and final total all displayed | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-CO-01d |
| UI — Checkout | UI-CO-T015 | Rental item labelled in checkout | 1. Add rental product to cart. 2. View /checkout Step 1 | Rental item row shows "This is a rental item" badge | T3 | Automation | UI E2E | N/A | Not Automated | not run | §8.5 |

---

## 21. UI — Favourites Page

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UI — Favourites | UI-FAV-T001 | Favourites page lists added products | 1. Login. 2. Pre-add a product to favourites. 3. Navigate to /account/favorites | Product appears in favourites list | T2 | Automation | UI E2E | N/A | Automated | not run | UI-FAV-01 |
| UI — Favourites | UI-FAV-T002 | Remove favourite from list | 1. On favourites page with ≥ 1 item. 2. Click × button | Item removed from list immediately | T2 | Automation | UI E2E | N/A | Automated | not run | UI-FAV-02 |
| UI — Favourites | UI-FAV-T003 | Empty favourites page | 1. Login with no favourites added. 2. Navigate to /account/favorites | Empty state message or empty list displayed; no errors | T3 | Manual | UI E2E | not run | N/A | N/A | Edge: empty state |

---

## 22. UI — Profile Page

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UI — Profile | UI-PR-T001 | Profile form pre-populated | 1. Login. 2. Navigate to /account/profile | All form fields show current user data (name, email, address) | T2 | Automation | UI E2E | N/A | Automated | not run | UI-PR-01 |
| UI — Profile | UI-PR-T002 | Update profile persists | 1. On profile page, change first_name. 2. Click "Update Profile". 3. Reload page | Success confirmation shown; updated name persists after reload | T2 | Automation | UI E2E | N/A | Automated | not run | UI-PR-02 |
| UI — Profile | UI-PR-T003 | Password strength meter updates in real-time | 1. On profile page, type a new password in the "New Password" field | Meter shows Weak / Fair / Good / Strong without submitting | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-PR-03 |
| UI — Profile | UI-PR-T004 | Change password flow | 1. Login. 2. On profile page, fill current + new + confirm passwords. 3. Submit. 4. Login with new password | Success message shown; login with new password succeeds | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-PR-04 |
| UI — Profile | UI-PR-T005 | TOTP QR code visible | 1. Login. 2. Navigate to /account/profile TOTP section | QR code image and manual key displayed | T4 | Manual | UI E2E | not run | N/A | N/A | UI-PR-05; skip if TOTP disabled in env |

---

## 23. UI — Contact Page

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UI — Contact | UI-CT-T001 | Contact form accessible | 1. Navigate to /contact | Form displayed with: First name, Last name, Email, Subject, Message, optional File attachment | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-CT-01 |
| UI — Contact | UI-CT-T002 | Required fields validation — empty submission | 1. Navigate to /contact. 2. Click submit without filling any field | Inline validation errors shown for all required fields | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-CT-02 |
| UI — Contact | UI-CT-T003 | Email field validates format | 1. Enter "notanemail" in email field. 2. Attempt submit | Inline error shown for invalid email format | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-CT-03 |
| UI — Contact | UI-CT-T004 | Subject dropdown options | 1. Open subject dropdown | Options include all BR-MSG-02 values: Webmaster, Customer Service, Webshop, Return, Technical Support, Unknown | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-CT-04 |
| UI — Contact | UI-CT-T005 | Message minimum 50 characters enforced | 1. Fill all fields. 2. Enter message "Short" (< 50 chars). 3. Submit | Inline error "Message must be at least 50 characters" | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-CT-05; BR-MSG-06 |
| UI — Contact | UI-CT-T006 | Successful submission shows confirmation and hides form | 1. Fill all fields correctly (message ≥ 50 chars). 2. Submit | Confirmation message displayed; form no longer visible | T2 | Automation | UI E2E | N/A | Not Automated | not run | UI-CT-06 |
| UI — Contact | UI-CT-T007 | Optional file attachment accepted | 1. Fill all fields. 2. Attach a 0 KB .txt file. 3. Submit | Submission succeeds; file attachment does not block submit | T3 | Manual | UI E2E | not run | N/A | N/A | UI-CT-07; BR-MSG-08 |

---

## 24. UI — Category Page

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UI — Category | UI-CAT-T001 | Category page navigates on category click | 1. Click any category name (e.g. in nav or home sidebar) | URL changes to /category/:name; page loads | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-CAT-01 |
| UI — Category | UI-CAT-T002 | Category name shown as page heading | 1. Navigate to /category/power-tools | Page heading (h1 or equivalent) reads "Power Tools" | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-CAT-02 |
| UI — Category | UI-CAT-T003 | Only selected category products shown | 1. Navigate to a specific category page | All visible product cards belong to that category; no products from other categories | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-CAT-03 |
| UI — Category | UI-CAT-T004 | Product card navigates to detail | 1. On category page, click a product card | Navigates to /product/{id} for that product | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-CAT-04 |

---

## 25. UI — Rental Products Page

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UI — Rentals | UI-RNT-T001 | Rentals page accessible and shows products | 1. Navigate to /rentals | List of rental products displayed; each has image, name, description | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-RNT-01/02 |
| UI — Rentals | UI-RNT-T002 | Rental detail shows duration slider | 1. On /rentals, click a product | Detail page shows duration slider (1–10 hours); no ± quantity buttons | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-RNT-03 |
| UI — Rentals | UI-RNT-T003 | Rental price calculated from duration | 1. On rental detail, drag slider to 7 hours | Displayed total = hourly_rate × 7 | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-RNT-04; BR-RENT-02 |
| UI — Rentals | UI-RNT-T004 | Add rental to cart and see label | 1. On rental detail, set duration, click Add to Cart. 2. Navigate to /checkout | Cart row shows rental item with "This is a rental item" label | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-RNT-05 |

---

## 26. UI — Admin Dashboard

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UI — Admin Dashboard | UI-ADM-T001 | Admin login redirects to dashboard | 1. Navigate to /auth/login. 2. Enter admin credentials. 3. Submit | Redirect to /admin/dashboard | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-ADM-01 |
| UI — Admin Dashboard | UI-ADM-T002 | Dashboard shows sales chart | 1. Login as admin. 2. Navigate to /admin/dashboard | Bar chart visible with year-based sales data; recent invoices list present | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-ADM-02 |
| UI — Admin Dashboard | UI-ADM-T003 | Non-admin cannot access /admin | 1. Login as customer. 2. Navigate to /admin/dashboard | Redirect to login or 403 page; dashboard not accessible | T3 | Automation | UI E2E | N/A | Not Automated | not run | §8.3 RBAC matrix |
| UI — Admin Dashboard | UI-ADM-T004 | Admin product CRUD | 1. Login as admin. 2. Navigate to /admin/products. 3. Create product. 4. Edit name. 5. Delete product | Each operation succeeds; changes persist in list | T3 | Manual | UI E2E | not run | N/A | N/A | UI-ADM-03 |
| UI — Admin Dashboard | UI-ADM-T005 | Admin user enable/disable | 1. Login as admin. 2. Navigate to /admin/users. 3. Disable a user. 4. Attempt login as that user | User disabled; login blocked immediately | T3 | Manual | UI E2E | not run | N/A | N/A | UI-ADM-04; BR-AUTH-10 |
| UI — Admin Dashboard | UI-ADM-T006 | Admin reply to message | 1. Login as admin. 2. Navigate to /admin/messages. 3. Open a message. 4. Submit a reply | Reply submitted successfully; message status updates | T3 | Manual | UI E2E | not run | N/A | N/A | UI-ADM-05 |
| UI — Admin Dashboard | UI-ADM-T007 | Admin update order status | 1. Login as admin. 2. Navigate to /admin/invoices. 3. Change an order status (e.g. PLACED → SHIPPED) | Status updated; reflected in customer invoice view | T3 | Manual | UI E2E | not run | N/A | N/A | UI-ADM-06 |

---

## 27. UI — Privacy Policy Page

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UI — Privacy Policy | UI-PRV-T001 | Privacy policy page accessible | 1. Navigate to /privacy (no auth) | Page loads; privacy policy content visible | T4 | Automation | UI E2E | N/A | Not Automated | not run | UI-PRV-01 |
| UI — Privacy Policy | UI-PRV-T002 | Content covers required topics | 1. On /privacy, scroll through page | Content mentions: Google Sign-In, data collection, automatic removal, third-party services, data security, contact info | T4 | Manual | UI E2E | not run | N/A | N/A | UI-PRV-02 |

---

## 28. UI — Product Comparison Page

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UI — Comparison | UI-CMP-T001 | Add products to compare and navigate | 1. On product detail, click "Compare" for 2 products. 2. Navigate to /comparison | Both products displayed side-by-side | T4 | Automation | UI E2E | N/A | Not Automated | not run | UI-CMP-01 |
| UI — Comparison | UI-CMP-T002 | Comparison columns show all attributes | 1. On /comparison with 2 products | Each column shows name, price, brand, CO₂ rating, specs table | T4 | Automation | UI E2E | N/A | Not Automated | not run | UI-CMP-02 |
| UI — Comparison | UI-CMP-T003 | Differences-only toggle | 1. On /comparison, click "Show differences only" | Rows with identical values hidden; only differing attributes remain | T4 | Automation | UI E2E | N/A | Not Automated | not run | UI-CMP-03 |

---

## 29. UI — Chat Widget

| Story | ID | Test Case | Steps | Expected Result | Priority | Test Type | Testing Layer | Manual Result | Automation Status | Automation Result | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UI — Chat Widget | UI-CHAT-T001 | Chat toggle visible on all pages | 1. Navigate to home page | Chat toggle button present at bottom-right; click opens chat window | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-CHAT-01 |
| UI — Chat Widget | UI-CHAT-T002 | Chat menu shows 4 flow options | 1. Open chat window | Menu displays: Find Product, Order Product, Checkout, Support | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-CHAT-02 |
| UI — Chat Widget | UI-CHAT-T003 | Find Product returns ≤ 5 results | 1. Open chat. 2. Select "Find Product". 3. Enter search term | At most 5 product cards shown; each has "View Product" button | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-CHAT-03 |
| UI — Chat Widget | UI-CHAT-T004 | Guest checkout via chat | 1. Open chat. 2. Select "Checkout". 3. Complete cart → guest details → address → payment | Invoice number shown on success | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-CHAT-04 |
| UI — Chat Widget | UI-CHAT-T005 | Empty cart shown in chat checkout | 1. Open chat with empty cart. 2. Select "Checkout" | "Your cart is empty" message displayed | T3 | Manual | UI E2E | not run | N/A | N/A | UI-CHAT-05 |
| UI — Chat Widget | UI-CHAT-T006 | Support flow validates message length | 1. Open chat. 2. Select "Support". 3. Enter message shorter than 50 chars. 4. Submit | Validation error shown; submission blocked | T3 | Automation | UI E2E | N/A | Not Automated | not run | UI-CHAT-06; BR-MSG-06 |
| UI — Chat Widget | UI-CHAT-T007 | Order Product via chat | 1. Open chat. 2. Select "Order Product". 3. Search for product. 4. Select quantity. 5. Confirm | Product added to cart; confirmation shown in chat | T3 | Automation | UI E2E | N/A | Not Automated | not run | §8.14 |

---

## Summary

| Story | Total Tests | Automated | Not Automated | Manual |
|---|---|---|---|---|
| Authentication | 21 | 8 | 12 | 1 |
| User Management | 15 | 7 | 8 | 0 |
| Products | 20 | 8 | 12 | 0 |
| Product Specifications | 6 | 5 | 1 | 0 |
| Brands | 12 | 7 | 5 | 0 |
| Categories | 11 | 5 | 6 | 0 |
| Cart | 11 | 6 | 5 | 0 |
| Favourites | 7 | 5 | 2 | 0 |
| Invoices | 17 | 5 | 12 | 0 |
| Contact / Messages | 12 | 5 | 6 | 1 |
| Payment Validation | 9 | 3 | 6 | 0 |
| Postcode Lookup | 4 | 2 | 2 | 0 |
| Images | 1 | 0 | 1 | 0 |
| Reports | 9 | 7 | 2 | 0 |
| Rentals | 5 | 0 | 3 | 0 |
| Discounts | 8 | 0 | 8 | 0 |
| Product Comparison (GraphQL) | 4 | 0 | 3 | 0 |
| UI — Product Listing | 12 | 2 | 10 | 0 |
| UI — Product Detail | 10 | 3 | 7 | 0 |
| UI — Checkout | 15 | 1 | 14 | 0 |
| UI — Favourites | 3 | 2 | 0 | 1 |
| UI — Profile | 5 | 2 | 2 | 1 |
| UI — Contact | 7 | 0 | 5 | 2 |
| UI — Category | 4 | 0 | 4 | 0 |
| UI — Rentals | 4 | 0 | 4 | 0 |
| UI — Admin Dashboard | 7 | 2 | 1 | 4 |
| UI — Privacy Policy | 2 | 0 | 1 | 1 |
| UI — Comparison | 3 | 0 | 3 | 0 |
| UI — Chat Widget | 7 | 0 | 6 | 1 |
| **TOTAL** | **257** | **85** | **151** | **12** |

---

*Document maintained by QA. Version 2.0 reflects full Sprint 5 scope from PRODUCT_SPEC.md v1.0.0 and TEST_PLAN.md v1.1.*  
*Last reviewed: 2026-04-23 | Supersedes: TEST_CASES.md v1.0*
