# Toolshop — Product Specification

| Field | Value |
|---|---|
| **Document ID** | PSC-2026-001 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Product Manager |
| **Date** | 2026-04-23 |
| **Reviewers** | Engineering Lead, QA Lead, Design Lead |
| **Approved by** | — (pending) |
| **Base API URL** | `https://api.practicesoftwaretesting.com` |
| **Base UI URL** | `https://practicesoftwaretesting.com` |
| **Swagger** | `https://api.practicesoftwaretesting.com/api/documentation` |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision & Goals](#3-product-vision--goals)
4. [User Personas](#4-user-personas)
5. [Success Metrics & KPIs](#5-success-metrics--kpis)
6. [Functional Domains — Detailed Specifications](#6-functional-domains--detailed-specifications)
   - 6.1 Authentication & Session (incl. Social Login, Account Locking)
   - 6.2 User Management
   - 6.3 Product Catalogue
   - 6.4 Product Specifications
   - 6.5 Brands
   - 6.6 Categories
   - 6.7 Cart
   - 6.8 Checkout & Invoicing
   - 6.9 Favourites
   - 6.10 Contact & Messaging
   - 6.11 Payment Validation
   - 6.12 Postcode Lookup
   - 6.13 Images
   - 6.14 Reports (Admin)
   - 6.15 Rentals
   - 6.16 Discounts (Geo-Location + Combination)
   - 6.17 Product Comparison (GraphQL)
7. [Data Model](#7-data-model)
8. [UI/UX Specifications](#8-uiux-specifications)
   - 8.1 Design Principles
   - 8.2 Global Navigation
   - 8.3 Home / Product Listing Page (`/`)
   - 8.4 Product Detail Page (`/product/{productId}`)
   - 8.5 Checkout Flow (`/checkout`)
   - 8.6 Favourites Page (`/account/favorites`)
   - 8.7 Profile Page (`/account/profile`)
   - 8.8 Contact Page (`/contact`)
   - 8.9 Category Page (`/category/:name`)
   - 8.10 Rental Products Page (`/rentals`)
   - 8.11 Admin Dashboard (`/admin`)
   - 8.12 Privacy Policy Page (`/privacy`)
   - 8.13 Product Comparison Page (`/comparison`)
   - 8.14 Chat Widget (Global)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Security Model](#10-security-model)
11. [Accessibility & Localisation](#11-accessibility--localisation)
12. [Analytics & Telemetry](#12-analytics--telemetry)
13. [API Error Contract](#13-api-error-contract)
14. [Release Phases & Roadmap](#14-release-phases--roadmap)
15. [Dependencies & Integrations](#15-dependencies--integrations)
16. [Risks & Mitigations](#16-risks--mitigations)
17. [Open Questions & Decision Log](#17-open-questions--decision-log)
18. [Glossary](#18-glossary)

---

## 1. Executive Summary

**Toolshop** is a full-stack e-commerce platform specialising in hand tools, power tools, and hardware accessories. It exposes a RESTful JSON API (OpenAPI 3.0) consumed by a companion Angular single-page application. The product is structured around sprint-based feature increments (Sprint 1 → Sprint 5), with each sprint delivering an independently deployable, hosted environment.

This document is the single source of truth for **what** the product does, **why** it does it, and **how** success is measured. It is the PM-authored input from which engineering produces the design document and QA produces the test plan and automation suite.

**Scope of this spec:** Sprint 5 (the most feature-complete version), including admin dashboard UI, social login, TOTP, rentals, discounts, chat widget, multi-language, and product comparison.  
**Out of scope:** Mobile app internals (React Native), real payment processing, inventory management.

---

## 2. Problem Statement

### 2.1 Context

Hardware retailers face increasing pressure to move catalogue and order management online. Customers expect a seamless self-service purchase journey — from browsing and filtering products to completing payment — without friction.

### 2.2 Pain Points Addressed

| Persona | Pain Point | How Toolshop Solves It |
|---|---|---|
| Consumer / DIY buyer | Difficulty finding the right tool by spec (size, rating, brand) | Faceted search: category tree, brand, price range, sustainability filter |
| Online shopper | Mistrust of unfamiliar webshops | Transparent CO₂ rating, spec sheet, related products, structured checkout |
| Power user | Re-buying the same items each season | Favourites list; previous invoices downloadable as PDF |
| Guest | Forced registration during checkout | Guest invoice flow — no account required |
| Admin / Store manager | Manual order/user management via database | Full admin CRUD via API; dashboard reports |

### 2.3 Non-Goals

- Marketplace with third-party sellers (single seller only in v1)
- Real payment processing (payment validation is simulated)
- Inventory reservation / warehouse management
- Native mobile app (companion app is out-of-scope for this spec; it shares Sprint 4 API)

---

## 3. Product Vision & Goals

### 3.1 Vision Statement

> Enable any hardware enthusiast to discover, evaluate, and purchase the right tool in under 5 minutes — from any device, with or without an account.

### 3.2 Product Goals (Sprint 5)

| # | Goal | How Measured |
|---|---|---|
| G1 | Complete end-to-end purchase journey for anonymous and authenticated users | 0 blocking defects in checkout + payment flow |
| G2 | Full CRUD admin API for all catalogue entities | All admin endpoints return correct HTTP codes |
| G3 | Role-based access control enforced at every endpoint | RBAC matrix test pass rate = 100 % |
| G4 | Automated regression suite covering all requirements | Playwright suite: ≥ 95 % requirement coverage |
| G5 | API response time SLO met for all public endpoints | p99 < 3 s (load ≤ 50 RPS) |

---

## 4. User Personas

### 4.1 Persona A — "The Weekend DIYer" (Anonymous / Customer)

| Field | Detail |
|---|---|
| **Name** | Jane Chen |
| **Age** | 34 |
| **Role** | Anonymous → Customer after registration |
| **Goal** | Find and buy a specific cordless drill that matches her eco requirements |
| **Behaviour** | Browses product grid, filters by category "Power Tools" + sustainability flag, reads spec sheet, checks price |
| **Pain** | Doesn't want to create an account just to checkout; hates multi-step forms |
| **Key journeys** | Browse → Filter → View product → Add to cart → Guest checkout |
| **Device** | Desktop Chrome |

### 4.2 Persona B — "The Loyal Customer" (Authenticated Customer)

| Field | Detail |
|---|---|
| **Name** | Marcus Bauer |
| **Age** | 45 |
| **Role** | Registered Customer |
| **Goal** | Re-order items from last season; manage saved favourites |
| **Behaviour** | Logs in, checks favourites, adds to cart, completes payment, downloads PDF invoice |
| **Pain** | Loses track of what he's bought; wants quick re-purchase |
| **Key journeys** | Login → Favourites → Cart → Authenticated checkout → Invoice PDF |
| **Device** | Desktop Chrome |

### 4.3 Persona C — "The Store Manager" (Admin)

| Field | Detail |
|---|---|
| **Name** | Sarah O'Brien |
| **Age** | 38 |
| **Role** | Admin |
| **Goal** | Maintain product catalogue, respond to customer messages, pull sales reports |
| **Behaviour** | Uses API (or admin tool) to CRUD products/brands/categories; reads reports; manages invoices |
| **Pain** | Inconsistent data if catalogue updates aren't validated; blind to sales trends |
| **Key journeys** | Admin login → Manage catalogue → Update invoice status → View reports |
| **Device** | Desktop Chrome |

### 4.4 Default Test Accounts

Pre-seeded accounts available in all hosted and local environments.

| Name | Role | Email | Password |
|---|---|---|---|
| John Doe | admin | admin@practicesoftwaretesting.com | welcome01 |
| Jane Doe | user | customer@practicesoftwaretesting.com | welcome01 |
| Jack Howe | user | customer2@practicesoftwaretesting.com | welcome01 |
| Bob Smith | user | customer3@practicesoftwaretesting.com | pass123 |

> **Note:** TOTP setup is intentionally restricted for the `customer@` and `admin@` default accounts — testers must create their own accounts to test 2FA.

---

## 5. Success Metrics & KPIs

### 5.1 Business KPIs

| Metric | Definition | Target (Sprint 5) |
|---|---|---|
| Checkout completion rate | Carts that reach "invoice created" / all carts created | ≥ 70 % |
| Guest invoice rate | Guest invoices / total invoices | ≥ 20 % |
| Favourites-to-purchase conversion | Items purchased from favourites / total favourites added | ≥ 15 % |
| Admin message response SLA | Messages with status updated within 24 h | ≥ 90 % |

### 5.2 Quality KPIs

| Metric | Target |
|---|---|
| API test pass rate (CI) | 100 % Tier 1, ≥ 98 % Tier 2 |
| UI E2E test pass rate (CI) | ≥ 95 % |
| P99 API latency (public endpoints) | < 3 000 ms |
| P99 API latency (auth-required endpoints) | < 5 000 ms |
| Zero unhandled 5xx responses in production | 0 per day |

### 5.3 OKR Alignment

**Objective:** Deliver a fully automated, production-grade e-commerce test harness by end of Q2 2026.

| Key Result | Measure |
|---|---|
| KR1 | 100 % of PRD requirements covered by at least one automated test |
| KR2 | CI pipeline green on every merge to main |
| KR3 | HTML test report generated and published for every CI run |

---

## 6. Functional Domains — Detailed Specifications

> **Convention:** Each requirement has an **ID**, **HTTP method + endpoint**, **actor(s)**, **business rules**, **request schema**, **response schema**, and **acceptance criteria** (Given / When / Then). HTTP status codes are the contract; error bodies follow the [API Error Contract](#13-api-error-contract).

---

### 6.1 Authentication & Session

**Domain prefix:** `AUTH`  
**Base path:** `/users`  
**Priority tier:** T1 (Critical)

#### Context

All protected endpoints require a valid JWT Bearer token. Tokens are short-lived. A refresh token is issued at login and can produce a new access token without re-entering credentials. TOTP (Time-based One-Time Password) is an optional second factor. Social login is available via Google and GitHub OAuth.

#### Business Rules

| ID | Rule |
|---|---|
| BR-AUTH-01 | Passwords must be ≥ 8 characters, contain at least one uppercase letter, one lowercase letter, one digit, and one special character |
| BR-AUTH-02 | Email addresses must be unique across all users |
| BR-AUTH-03 | JWT access tokens expire after 60 minutes |
| BR-AUTH-04 | The refresh token is single-use; a new refresh token is issued with each refresh |
| BR-AUTH-05 | After logout, the access token is blacklisted; the refresh token is destroyed |
| BR-AUTH-06 | Forgot-password requires authentication; it resets the account password to the fixed value `welcome02` and returns `{ "success": true }`. Unauthenticated requests return 401. |
| BR-AUTH-07 | TOTP uses HMAC-SHA1, 6-digit code, 30-second window |
| BR-AUTH-08 | After 3 consecutive failed login attempts, a customer account is locked; subsequent attempts return HTTP 423 with "Account locked, too many failed attempts. Please contact the administrator." |
| BR-AUTH-09 | Admin accounts are exempt from account locking |
| BR-AUTH-10 | A disabled account returns a login error "Account disabled." and cannot be authenticated |
| BR-AUTH-11 | Only admin can enable or disable a user account |
| BR-AUTH-12 | TOTP setup is restricted for the default test accounts (`customer@practicesoftwaretesting.com`, `admin@practicesoftwaretesting.com`) |

#### Endpoints

##### AUTH-01 — Register

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Path** | `/users/register` |
| **Auth** | None |
| **Success status** | `201 Created` |

**Request body:**

```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "password": "P@ssw0rd!",
  "address": "1 High Street",
  "city": "London",
  "state": "England",
  "country": "GB",
  "postcode": "SW1A 1AA",
  "phone": "+44 20 1234 5678",
  "dob": "1990-03-15"
}
```

**Response body (201):**

```json
{
  "id": "uuid-v4",
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "address": "1 High Street",
  "city": "London",
  "state": "England",
  "country": "GB",
  "postcode": "SW1A 1AA",
  "phone": "+44 20 1234 5678",
  "dob": "1990-03-15",
  "role": "user",
  "created_at": "2026-04-23T10:00:00Z"
}
```

**Error cases:**

| Scenario | Status | Body key |
|---|---|---|
| Duplicate email | 422 | `email` — "The email has already been taken." |
| Missing required field | 422 | field name with validation message |
| Password too weak | 422 | `password` — rule description |

**Acceptance Criteria:**

- **AC-AUTH-01a:** Given a valid unique payload → POST `/users/register` → status 201, body contains `id` (UUID) and `email` matching payload
- **AC-AUTH-01b:** Given payload with existing email → POST `/users/register` → status 422, error references `email`
- **AC-AUTH-01c:** Given payload missing `first_name` → POST `/users/register` → status 422

---

##### AUTH-02 — Login

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Path** | `/users/login` |
| **Auth** | None |
| **Success status** | `200 OK` |

**Request body:**

```json
{
  "email": "jane@example.com",
  "password": "P@ssw0rd!"
}
```

**Response body (200):**

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "eyJ..."
}
```

**Error cases:**

| Scenario | Status |
|---|---|
| Wrong password | 401 |
| Non-existent email | 401 |

**Acceptance Criteria:**

- **AC-AUTH-02a:** Valid credentials → 200, `access_token` present and non-empty
- **AC-AUTH-02b:** Wrong password → 401
- **AC-AUTH-02c:** Non-existent email → 401

---

##### AUTH-03 — Refresh Token

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/users/refresh` |
| **Auth** | `Authorization: Bearer <access_token>` |
| **Success status** | `200 OK` |

**Response body (200):** Same shape as login response with new `access_token`.

**Acceptance Criteria:**

- **AC-AUTH-03a:** Valid token → 200, new `access_token` returned
- **AC-AUTH-03b:** No token → 401

---

##### AUTH-04 — Logout

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/users/logout` |
| **Auth** | `Authorization: Bearer <access_token>` |
| **Success status** | `200 OK` |

**Acceptance Criteria:**

- **AC-AUTH-04a:** Valid token → 200, subsequent request with same token → 401

---

##### AUTH-05 — Forgot Password

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Path** | `/users/forgot-password` |
| **Auth** | `Authorization: Bearer <access_token>` (required) |
| **Success status** | `200 OK` |

> **Implementation note:** This endpoint does not send a real email. It immediately resets the account password to the fixed value `welcome02`. It is intended as a practice/test convenience rather than a production forgot-password flow.

**Request body:**

```json
{ "email": "jane@example.com" }
```

**Response body (200):**

```json
{ "success": true }
```

**Acceptance Criteria:**

- **AC-AUTH-05a:** Authenticated request with registered email → 200, `{ "success": true }`, password reset to `welcome02`
- **AC-AUTH-05b:** Login with `welcome02` succeeds after reset
- **AC-AUTH-05c:** No `Authorization` header → 401
- **AC-AUTH-05d:** Missing `email` field in body → 400

---

##### AUTH-06 — Change Password

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Path** | `/users/change-password` |
| **Auth** | `Authorization: Bearer <access_token>` |
| **Success status** | `200 OK` |

**Request body:**

```json
{
  "current_password": "P@ssw0rd!",
  "new_password": "N3w$ecure!",
  "new_password_confirmation": "N3w$ecure!"
}
```

**Acceptance Criteria:**

- **AC-AUTH-06a:** Correct current password + strong new password → 200
- **AC-AUTH-06b:** Wrong current password → 422
- **AC-AUTH-06c:** `new_password` ≠ `new_password_confirmation` → 422
- **AC-AUTH-06d:** `new_password` fails complexity (BR-AUTH-01) → 422
- **AC-AUTH-06e:** After success, login with `new_password` → 200

---

##### AUTH-07 — TOTP Setup & Verify

| Field | Value |
|---|---|
| **Methods** | `POST /totp/setup`, `POST /totp/verify` |
| **Auth** | Bearer token |
| **Priority** | T4 |

**Setup response:** Contains `qr_code_url` (data URI) and `secret` (base-32 string).

**Verify request:**

```json
{ "totp_code": "123456" }
```

**Acceptance Criteria:**

- **AC-AUTH-07a:** Setup → 200, response contains `qr_code_url` and `secret`
- **AC-AUTH-07b:** Verify with valid code generated from `secret` → 200
- **AC-AUTH-07c:** Verify with expired/wrong code → 422

---

##### AUTH-08 — TOTP Login

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Path** | `/totp/login/totp` |
| **Auth** | None (used after password verification step) |
| **Success status** | `200 OK` |
| **Priority** | T4 |

**Request body:**

```json
{ "totp_code": "123456" }
```

**Acceptance Criteria:**

- **AC-AUTH-08a:** Valid TOTP code after password step → 200, `access_token` returned
- **AC-AUTH-08b:** Invalid code → 422, "Invalid TOTP"

---

##### AUTH-09 — Social Login (Google / GitHub)

| Field | Value |
|---|---|
| **Methods** | `GET /auth/social-login`, `GET /auth/cb/google`, `GET /auth/cb/github` |
| **Auth** | None (OAuth redirect flow) |
| **Priority** | T4 |

Social login initiates an OAuth 2.0 redirect. On success, the callback endpoint returns a JWT token pair identical to the standard login response. The UI opens a popup (500 × 400 px) to complete the OAuth flow.

**Acceptance Criteria:**

- **AC-AUTH-09a:** GET `/auth/social-login?provider=google` → redirect to Google OAuth consent screen
- **AC-AUTH-09b:** Successful Google callback → 200, `access_token` returned
- **AC-AUTH-09c:** Successful GitHub callback → 200, `access_token` returned

---

##### AUTH-10 — Account Locking & Disabled Accounts

**Acceptance Criteria:**

- **AC-AUTH-10a:** 3 consecutive failed login attempts → 4th attempt returns HTTP 423 with message "Account locked, too many failed attempts. Please contact the administrator." (BR-AUTH-08)
- **AC-AUTH-10b:** Admin login is never locked regardless of failed attempts (BR-AUTH-09)
- **AC-AUTH-10c:** Login with disabled account → HTTP 401/403, message "Account disabled." (BR-AUTH-10)

---

### 6.2 User Management

**Domain prefix:** `USR`  
**Base path:** `/users`  
**Priority tier:** T1 (delete), T2 (read/update)

#### Business Rules

| ID | Rule |
|---|---|
| BR-USR-01 | A customer can only read and modify their own profile |
| BR-USR-02 | An admin can read and modify any user's profile |
| BR-USR-03 | An admin can delete any user except themselves |
| BR-USR-04 | Customer tokens attempting admin-only operations receive HTTP 403 |

#### Endpoints

##### USR-01 — List Users (Admin)

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/users` |
| **Auth** | Admin Bearer token |
| **Success status** | `200 OK` |

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | integer | Page number (default 1) |
| `per_page` | integer | Items per page (default 20, max 100) |

**Response body (200):**

```json
{
  "current_page": 1,
  "data": [ { "id": "...", "email": "...", "role": "user", ... } ],
  "total": 42,
  "per_page": 20,
  "last_page": 3
}
```

**Acceptance Criteria:**

- **AC-USR-01a:** Admin token → 200, `data` is array, `total` is integer
- **AC-USR-01b:** Customer token → 403
- **AC-USR-01c:** No token → 401

---

##### USR-02 — Search Users (Admin)

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/users/search?q={query}` |
| **Auth** | Admin Bearer token |
| **Success status** | `200 OK` |

**Acceptance Criteria:**

- **AC-USR-02a:** Admin + query matching existing email → 200, results contain matching user
- **AC-USR-02b:** Query with no matches → 200, `data` is empty array

---

##### USR-03 — Get Own Profile

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/users/me` |
| **Auth** | Customer or Admin Bearer token |
| **Success status** | `200 OK` |

**Response body (200):**

```json
{
  "id": "uuid",
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "role": "user",
  "address": "...",
  "city": "...",
  "state": "...",
  "country": "GB",
  "postcode": "...",
  "phone": "...",
  "dob": "1990-03-15"
}
```

**Acceptance Criteria:**

- **AC-USR-03a:** Valid customer token → 200, `email` matches token owner
- **AC-USR-03b:** No token → 401

---

##### USR-04 — Get User by ID (Admin)

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/users/{userId}` |
| **Auth** | Admin Bearer token |

**Acceptance Criteria:**

- **AC-USR-04a:** Admin + valid userId → 200, user object returned
- **AC-USR-04b:** Admin + non-existent userId → 404
- **AC-USR-04c:** Customer token → 403

---

##### USR-05 — Full Update User (PUT)

| Field | Value |
|---|---|
| **Method** | `PUT` |
| **Path** | `/users/{userId}` |
| **Auth** | Owner or Admin Bearer token |

**Request body:** Same shape as registration payload (all fields required for PUT).

**Acceptance Criteria:**

- **AC-USR-05a:** Owner updates own profile → 200, all fields persisted
- **AC-USR-05b:** Admin updates any user → 200
- **AC-USR-05c:** Customer updates another user → 403

---

##### USR-06 — Partial Update User (PATCH)

| Field | Value |
|---|---|
| **Method** | `PATCH` |
| **Path** | `/users/{userId}` |
| **Auth** | Owner or Admin Bearer token |

**Request body:** Any subset of profile fields.

**Acceptance Criteria:**

- **AC-USR-06a:** PATCH with only `phone` → 200, other fields unchanged
- **AC-USR-06b:** Customer patches another user → 403

---

##### USR-07 — Delete User (Admin)

| Field | Value |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/users/{userId}` |
| **Auth** | Admin Bearer token |
| **Success status** | `204 No Content` |

**Acceptance Criteria:**

- **AC-USR-07a:** Admin + valid userId → 204
- **AC-USR-07b:** Subsequent GET → 404
- **AC-USR-07c:** Customer token → 403

---

### 6.3 Product Catalogue

**Domain prefix:** `PROD`  
**Base path:** `/products`  
**Priority tier:** T2 (read), T3 (admin write)

#### Business Rules

| ID | Rule |
|---|---|
| BR-PROD-01 | All product reads are publicly accessible (no auth required) |
| BR-PROD-02 | Product create/update/delete requires admin token |
| BR-PROD-03 | `price` must be a positive decimal (max 2 decimal places) |
| BR-PROD-04 | `in_stock` is a boolean; out-of-stock products remain visible in the catalogue |
| BR-PROD-05 | `co2_rating` must be one of: `A`, `B`, `C`, `D`, `E` |
| BR-PROD-06 | `category_id` and `brand_id` must reference existing entities |
| BR-PROD-07 | Product search is case-insensitive, partial-match on `name` |

#### Endpoints

##### PROD-01 — List Products

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/products` |
| **Auth** | None |
| **Success status** | `200 OK` |

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | integer | Page number (default 1) |
| `per_page` | integer | Items per page (default 9) |
| `sort` | string | `name,asc` \| `name,desc` \| `price,asc` \| `price,desc` |
| `category_id` | UUID | Filter by category |
| `brand_id` | UUID | Filter by brand |
| `q` | string | Search query |
| `price_min` | number | Min price filter |
| `price_max` | number | Max price filter |
| `is_rental` | boolean | Filter rental products |

**Response body (200):**

```json
{
  "current_page": 1,
  "data": [
    {
      "id": "uuid",
      "name": "Bolt Cutters",
      "description": "Heavy-duty bolt cutters...",
      "price": 14.15,
      "in_stock": true,
      "co2_rating": "A",
      "brand": { "id": "uuid", "name": "Bernzomatic", "slug": "bernzomatic" },
      "category": { "id": "uuid", "name": "Cutting tools", "slug": "cutting-tools" },
      "product_image": "https://api.practicesoftwaretesting.com/uploads/..."
    }
  ],
  "total": 96,
  "per_page": 9,
  "last_page": 11
}
```

**Acceptance Criteria:**

- **AC-PROD-01a:** GET without params → 200, `data` is non-empty array, `total` > 0
- **AC-PROD-01b:** `?category_id=X` → all returned products have matching category
- **AC-PROD-01c:** `?brand_id=X` → all returned products have matching brand
- **AC-PROD-01d:** `?price_min=10&price_max=50` → all returned products within range
- **AC-PROD-01e:** Pagination: page 2 returns different set from page 1

---

##### PROD-02 — Get Product by ID

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/products/{productId}` |
| **Auth** | None |
| **Success status** | `200 OK` |

**Response body (200):** Full product object including `specs` array.

**Acceptance Criteria:**

- **AC-PROD-02a:** Valid productId → 200, response contains `id`, `name`, `price`, `in_stock`, `co2_rating`, `brand`, `category`
- **AC-PROD-02b:** Non-existent productId → 404

---

##### PROD-03 — Search Products

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/products/search?q={query}` |
| **Auth** | None |

**Acceptance Criteria:**

- **AC-PROD-03a:** Query matching product names → results contain matching products (case-insensitive)
- **AC-PROD-03b:** Query with no matches → `data` is empty array

---

##### PROD-04 — Get Related Products

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/products/{productId}/related` |
| **Auth** | None |

**Acceptance Criteria:**

- **AC-PROD-04a:** Valid productId → 200, response is array (may be empty)
- **AC-PROD-04b:** Related products share category or brand with target product

---

##### PROD-05 — Create Product (Admin)

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Path** | `/products` |
| **Auth** | Admin Bearer token |
| **Success status** | `201 Created` |

**Request body:**

```json
{
  "name": "Impact Driver Pro",
  "description": "High-torque cordless impact driver...",
  "price": 79.99,
  "in_stock": true,
  "co2_rating": "B",
  "category_id": "uuid",
  "brand_id": "uuid",
  "product_image_id": "uuid"
}
```

**Acceptance Criteria:**

- **AC-PROD-05a:** Valid payload + admin token → 201, response contains `id`
- **AC-PROD-05b:** Missing `name` → 422
- **AC-PROD-05c:** Invalid `co2_rating` value → 422
- **AC-PROD-05d:** Non-existent `category_id` → 422
- **AC-PROD-05e:** Customer token → 403

---

##### PROD-06/07 — Update Product (PUT / PATCH)

| Method | Semantics |
|---|---|
| `PUT` | Full replacement — all fields required |
| `PATCH` | Partial update — only provided fields updated |

**Acceptance Criteria:**

- **AC-PROD-06a:** Admin PUT → 200, all provided fields updated
- **AC-PROD-07a:** Admin PATCH `price` only → 200, other fields unchanged
- **AC-PROD-06b/07b:** Customer token → 403

---

##### PROD-08 — Delete Product (Admin)

| Field | Value |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/products/{productId}` |
| **Auth** | Admin Bearer token |
| **Success status** | `204 No Content` |

**Acceptance Criteria:**

- **AC-PROD-08a:** Admin + valid productId → 204
- **AC-PROD-08b:** Subsequent GET → 404
- **AC-PROD-08c:** Customer token → 403

---

### 6.4 Product Specifications

**Domain prefix:** `SPEC`  
**Base path:** `/products/{productId}/specs`  
**Priority tier:** T3

#### Business Rules

| ID | Rule |
|---|---|
| BR-SPEC-01 | `spec_unit` is optional (e.g. "kg", "mm", "V") |
| BR-SPEC-02 | Multiple specs with the same `spec_name` are allowed per product |
| BR-SPEC-03 | Specs are public-read, admin-write |

#### Endpoints

| ID | Method | Path | Auth | Status |
|---|---|---|---|---|
| SPEC-01 | GET | `/products/{productId}/specs` | None | 200 |
| SPEC-02 | GET | `/product-specs/names` | None | 200 |
| SPEC-03 | POST | `/products/{productId}/specs` | Admin | 201 |
| SPEC-04 | PUT | `/products/{productId}/specs/{specId}` | Admin | 200 |
| SPEC-05 | DELETE | `/products/{productId}/specs/{specId}` | Admin | 204 |

**SPEC-03 request body:**

```json
{
  "spec_name": "Weight",
  "spec_value": "1.2",
  "spec_unit": "kg"
}
```

**Acceptance Criteria:**

- **AC-SPEC-01:** GET specs for product → 200, array of `{ id, spec_name, spec_value, spec_unit }`
- **AC-SPEC-02:** GET names → 200, array of distinct spec names
- **AC-SPEC-03:** Admin POST → 201, spec added; subsequent GET includes new spec
- **AC-SPEC-04:** Admin PUT → 200, spec updated
- **AC-SPEC-05:** Admin DELETE → 204; subsequent GET spec list does not include deleted spec
- **AC-SPEC-06:** Customer POST → 403

---

### 6.5 Brands

**Domain prefix:** `BRAND`  
**Base path:** `/brands`  
**Priority tier:** T3

#### Business Rules

| ID | Rule |
|---|---|
| BR-BRAND-01 | `slug` must be unique, lowercase, URL-safe (alphanumeric + hyphens) |
| BR-BRAND-02 | Brands cannot be deleted if products reference them (returns 409) |

#### Endpoints

| ID | Method | Path | Auth | Status |
|---|---|---|---|---|
| BRAND-01 | GET | `/brands` | None | 200 |
| BRAND-02 | GET | `/brands/{brandId}` | None | 200 |
| BRAND-03 | GET | `/brands/search?q=` | None | 200 |
| BRAND-04 | POST | `/brands` | Admin | 201 |
| BRAND-05 | PUT | `/brands/{brandId}` | Admin | 200 |
| BRAND-06 | PATCH | `/brands/{brandId}` | Admin | 200 |
| BRAND-07 | DELETE | `/brands/{brandId}` | Admin | 204 |

**BRAND-04 request body:**

```json
{
  "name": "DeWalt",
  "slug": "dewalt"
}
```

**Response (200/201):**

```json
{
  "id": "uuid",
  "name": "DeWalt",
  "slug": "dewalt"
}
```

**Acceptance Criteria:**

- **AC-BRAND-01:** GET brands → 200, array contains `id`, `name`, `slug`
- **AC-BRAND-03:** Search partial name → matching brands returned
- **AC-BRAND-04:** Admin POST unique name+slug → 201, `id` returned
- **AC-BRAND-04b:** Duplicate slug → 422
- **AC-BRAND-07:** Admin DELETE → 204; subsequent GET → 404
- **AC-BRAND-07b:** DELETE brand with linked products → 409
- **AC-BRAND-07c:** Customer DELETE → 403

---

### 6.6 Categories

**Domain prefix:** `CAT`  
**Base path:** `/categories`  
**Priority tier:** T3

#### Business Rules

| ID | Rule |
|---|---|
| BR-CAT-01 | Categories support up to 2 levels (parent → child) |
| BR-CAT-02 | `parent_id` must reference an existing category, or be null for root |
| BR-CAT-03 | `slug` must be unique |
| BR-CAT-04 | A category with children cannot be deleted (cascade delete is disallowed) |

#### Endpoints

| ID | Method | Path | Auth | Status |
|---|---|---|---|---|
| CAT-01 | GET | `/categories` | None | 200 — flat list |
| CAT-02 | GET | `/categories/tree` | None | 200 — nested tree |
| CAT-03 | GET | `/categories/tree/{categoryId}` | None | 200 |
| CAT-04 | GET | `/categories/search?q=` | None | 200 |
| CAT-05 | POST | `/categories` | Admin | 201 |
| CAT-06 | PUT | `/categories/{id}` | Admin | 200 |
| CAT-07 | PATCH | `/categories/{id}` | Admin | 200 |
| CAT-08 | DELETE | `/categories/{id}` | Admin | 204 |

**CAT-02 response (200):**

```json
[
  {
    "id": "uuid",
    "name": "Power Tools",
    "slug": "power-tools",
    "sub_categories": [
      { "id": "uuid", "name": "Drills", "slug": "drills", "sub_categories": [] }
    ]
  }
]
```

**Acceptance Criteria:**

- **AC-CAT-01:** GET → 200, flat array with `id`, `name`, `slug`
- **AC-CAT-02:** GET tree → 200, root nodes have `sub_categories` arrays
- **AC-CAT-05:** Admin POST with `parent_id` → 201; tree shows child under parent
- **AC-CAT-08:** Delete leaf category → 204
- **AC-CAT-08b:** Delete category with children → 422 or 409 (conflict)

---

### 6.7 Cart

**Domain prefix:** `CART`  
**Base path:** `/carts`  
**Priority tier:** T1

#### Business Rules

| ID | Rule |
|---|---|
| BR-CART-01 | Cart is created per-session; one active cart per customer is the UI convention (API allows multiples) |
| BR-CART-02 | `quantity` must be ≥ 1 and ≤ available stock (if applicable) |
| BR-CART-03 | Adding a product already in the cart increases quantity |
| BR-CART-04 | Cart total = sum of (unit price × quantity) for all items |
| BR-CART-05 | Cart is soft-referenced; no auth required to create or read a cart by ID |
| BR-CART-06 | When both rental and non-rental items are present, a 15% combination discount is applied to the cart subtotal (see Section 6.16.2) |
| BR-CART-07 | On successful quantity update, the UI displays the confirmation message "Product quantity updated." |

#### Endpoints

##### CART-01 — Create Cart

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Path** | `/carts` |
| **Auth** | None (anonymous) |
| **Success status** | `201 Created` |

**Response (201):**

```json
{
  "id": "uuid",
  "created_at": "2026-04-23T10:00:00Z"
}
```

---

##### CART-02 — Add Product to Cart

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Path** | `/carts/{cartId}` |
| **Auth** | None |
| **Success status** | `200 OK` |

**Request body:**

```json
{
  "product_id": "uuid",
  "quantity": 2
}
```

**Response (200):** Full cart object with `cart_items` array.

---

##### CART-03 — Get Cart

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/carts/{cartId}` |
| **Auth** | None |

**Response (200):**

```json
{
  "id": "uuid",
  "cart_items": [
    {
      "id": "uuid",
      "product": { "id": "uuid", "name": "Bolt Cutters", "price": 14.15 },
      "quantity": 2,
      "line_total": 28.30
    }
  ],
  "total": 28.30
}
```

---

##### CART-04 — Update Item Quantity

| Field | Value |
|---|---|
| **Method** | `PUT` |
| **Path** | `/carts/{cartId}/product/quantity` |
| **Auth** | None |

**Request body:**

```json
{
  "product_id": "uuid",
  "quantity": 3
}
```

---

##### CART-05 — Remove Item

| Field | Value |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/carts/{cartId}/product/{productId}` |
| **Auth** | None |
| **Success status** | `204 No Content` |

---

##### CART-06 — Delete Entire Cart

| Field | Value |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/carts/{cartId}` |
| **Auth** | None |
| **Success status** | `204 No Content` |

---

**Acceptance Criteria:**

- **AC-CART-01:** POST `/carts` → 201, `id` returned
- **AC-CART-02:** Add product → 200, `cart_items` contains product; `total` = price × quantity
- **AC-CART-02b:** Add non-existent product → 404
- **AC-CART-03:** GET cart → 200, all added items present with correct `line_total`
- **AC-CART-04:** Update quantity → 200, `line_total` recalculated; UI shows "Product quantity updated."
- **AC-CART-04b:** quantity ≤ 0 → 422
- **AC-CART-05:** DELETE item → 204; GET cart no longer contains item
- **AC-CART-06:** DELETE cart → 204; GET cart → 404
- **AC-CART-07:** Cart with ≥ 1 rental + ≥ 1 non-rental item → response includes 15% combination discount on subtotal (BR-CART-06)
- **AC-CART-08:** Remove all rental or all non-rental items → combination discount removed from response

---

### 6.8 Checkout & Invoicing

**Domain prefix:** `INV`  
**Base path:** `/invoices`  
**Priority tier:** T1

#### Business Rules

| ID | Rule |
|---|---|
| BR-INV-01 | An invoice is created from a cart; the cart is consumed (emptied or marked used) |
| BR-INV-02 | `payment_method` must be one of: `bank-transfer`, `cash-on-delivery`, `credit-card`, `buy-now-pay-later`, `gift-card` |
| BR-INV-03 | `credit-card` requires `credit_card_number`, `expiration_date`, `cvv`, `card_holder_name` in `payment_details` |
| BR-INV-04 | `gift-card` requires `code` in `payment_details` |
| BR-INV-05 | `bank-transfer` and `cash-on-delivery` require no extra `payment_details` |
| BR-INV-06 | Guest invoices require `guest_email`, `guest_first_name`, `guest_last_name` |
| BR-INV-07 | Invoice status lifecycle: `PLACED` → `SHIPPED` → `DELIVERED` → `RETURNED` (admin-managed) |
| BR-INV-08 | PDF generation is asynchronous; client polls `/download-pdf-status` until `ready: true` |
| BR-INV-09 | A customer can only read their own invoices; admin can read all |
| BR-INV-10 | When a discount was applied, the invoice response includes `subtotal`, `discount_percentage`, `discount_amount`, and `total` |
| BR-INV-11 | PDF generation is triggered by artisan command (`invoice:generate`); auto-removed after 30 days by `invoice:remove` |

#### Endpoints

##### INV-01 — Create Invoice (Authenticated)

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Path** | `/invoices` |
| **Auth** | Customer Bearer token |
| **Success status** | `201 Created` |

**Request body:**

```json
{
  "billing_address": {
    "first_name": "Jane",
    "last_name": "Doe",
    "address": "1 High Street",
    "city": "London",
    "state": "England",
    "country": "GB",
    "postcode": "SW1A 1AA"
  },
  "payment_method": "credit-card",
  "payment_details": {
    "credit_card_number": "4111111111111111",
    "expiration_date": "12/28",
    "cvv": "123",
    "card_holder_name": "Jane Doe"
  },
  "cart_id": "uuid"
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "invoice_number": "INV-20260423-0001",
  "status": "PLACED",
  "total": 28.30,
  "billing_address": { ... },
  "payment_method": "credit-card",
  "invoicelines": [
    {
      "id": "uuid",
      "product": { "id": "uuid", "name": "Bolt Cutters", "price": 14.15 },
      "quantity": 2,
      "unit_price": 14.15,
      "line_total": 28.30
    }
  ],
  "created_at": "2026-04-23T10:00:00Z"
}
```

---

##### INV-02 — Create Guest Invoice

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Path** | `/invoices/guest` |
| **Auth** | None |

**Request body:** Same as INV-01 + `guest_email`, `guest_first_name`, `guest_last_name`.

---

##### INV-03 — List My Invoices

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/invoices` |
| **Auth** | Customer Bearer token |

**Acceptance Criteria:**

- **AC-INV-03a:** Returns only invoices belonging to the authenticated user
- **AC-INV-03b:** Admin sees all invoices

---

##### INV-05 — Get Invoice by ID

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/invoices/{invoiceId}` |
| **Auth** | Owner or Admin |

**Acceptance Criteria:**

- **AC-INV-05a:** Owner → 200, full invoice with `invoice_number`, `total`, `status`, `invoicelines`
- **AC-INV-05b:** Different customer → 403

---

##### INV-08 — Update Invoice Status (Admin)

| Field | Value |
|---|---|
| **Method** | `PUT` |
| **Path** | `/invoices/{invoiceId}/status` |
| **Auth** | Admin |

**Request body:**

```json
{ "status": "SHIPPED" }
```

**Acceptance Criteria:**

- **AC-INV-08a:** Admin updates status → 200, `status` reflects new value
- **AC-INV-08b:** Invalid status value → 422
- **AC-INV-08c:** Customer token → 403

---

##### INV-09/10 — PDF Download

| Method | Path | Description |
|---|---|---|
| GET | `/invoices/{invoice_number}/download-pdf` | Triggers PDF generation |
| GET | `/invoices/{invoice_number}/download-pdf-status` | Polls for completion |

**Status response:**

```json
{ "status": "ready", "pdf_url": "https://..." }
```

**Acceptance Criteria:**

- **AC-INV-09a:** Trigger → 200
- **AC-INV-10a:** Poll until `status: "ready"`, then `pdf_url` is a valid URL

---

**Full Invoice Flow Acceptance Criteria:**

- **AC-INV-F1:** Create cart → add product → POST `/invoices` with valid payload → 201, `invoice_number` returned
- **AC-INV-F2:** POST guest invoice → 201, no auth required
- **AC-INV-F3:** Invalid `payment_method` → 422
- **AC-INV-F4:** Missing `cart_id` → 422
- **AC-INV-F5:** Credit card missing `cvv` → 422
- **AC-INV-F6:** Invoice with discount → response includes `subtotal`, `discount_percentage`, `discount_amount`, `total` (BR-INV-10)
- **AC-INV-F7:** Line item with discount → `original_price` shown alongside `discounted_price`

---

### 6.9 Favourites

**Domain prefix:** `FAV`  
**Base path:** `/favorites`  
**Priority tier:** T2

#### Business Rules

| ID | Rule |
|---|---|
| BR-FAV-01 | Only authenticated customers can manage favourites |
| BR-FAV-02 | A product can only be added to favourites once per user (unique constraint) |
| BR-FAV-03 | Favourites are user-scoped; user A cannot see or modify user B's favourites |

#### Endpoints

| ID | Method | Path | Auth | Status |
|---|---|---|---|---|
| FAV-01 | POST | `/favorites` | Customer | 201 |
| FAV-02 | GET | `/favorites` | Customer | 200 |
| FAV-03 | GET | `/favorites/{favoriteId}` | Customer | 200 |
| FAV-04 | DELETE | `/favorites/{favoriteId}` | Customer | 204 |

**FAV-01 request:**

```json
{ "product_id": "uuid" }
```

**FAV-02 response:**

```json
[
  {
    "id": "uuid",
    "product": { "id": "uuid", "name": "Bolt Cutters", "price": 14.15 }
  }
]
```

**Acceptance Criteria:**

- **AC-FAV-01a:** Authenticated POST with valid `product_id` → 201, `id` returned
- **AC-FAV-01b:** Duplicate → 422 (or 409 — conflict)
- **AC-FAV-01c:** Non-existent `product_id` → 404
- **AC-FAV-01d:** No auth → 401
- **AC-FAV-02:** GET → 200, list of user's favourites only
- **AC-FAV-04:** DELETE → 204; subsequent GET → not in list

---

### 6.10 Contact & Messaging

**Domain prefix:** `MSG`  
**Base path:** `/messages`  
**Priority tier:** T2

#### Business Rules

| ID | Rule |
|---|---|
| BR-MSG-01 | Any visitor (no auth) can submit a contact form |
| BR-MSG-02 | Valid `subject` values: `Webmaster`, `Customer Service`, `Webshop`, `Return`, `Technical Support`, `Unknown` |
| BR-MSG-03 | Admin can reply; customer receives email reply |
| BR-MSG-04 | Message status lifecycle: `NEW` → `IN_PROGRESS` → `ON_HOLD` → `RESOLVED` |
| BR-MSG-05 | File attachments are binary uploads; max size is server-configured |
| BR-MSG-06 | Message body must be a minimum of 50 characters; shorter messages are rejected with 422 |
| BR-MSG-07 | When a logged-in user visits the contact page, first name, last name, and email are auto-filled from their profile; those fields are hidden from the form |
| BR-MSG-08 | File attachments must be `.txt` extension and exactly 0 KB in size |

#### Endpoints

| ID | Method | Path | Auth | Status |
|---|---|---|---|---|
| MSG-01 | POST | `/messages` | None | 200 |
| MSG-02 | POST | `/messages/{id}/attach-file` | Any | 200 |
| MSG-03 | GET | `/messages` | Auth | 200 |
| MSG-04 | GET | `/messages/{id}` | Admin | 200 |
| MSG-05 | POST | `/messages/{id}/reply` | Admin | 200 |
| MSG-06 | PUT | `/messages/{id}/status` | Admin | 200 |

**MSG-01 request body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Customer Service",
  "message": "I have a question about my order..."
}
```

**MSG-01 response:**

```json
{ "success": true }
```

**Acceptance Criteria:**

- **AC-MSG-01a:** Valid message → 200, `success: true`
- **AC-MSG-01b:** Invalid `subject` → 422
- **AC-MSG-01c:** Missing `email` → 422
- **AC-MSG-01d:** Message body fewer than 50 characters → 422 (BR-MSG-06)
- **AC-MSG-01e:** Logged-in user submits contact form → `name` auto-populated from profile; no manual name/email input required (BR-MSG-07)
- **AC-MSG-01f:** Attachment with non-`.txt` extension → 422, "File should have a txt extension." (BR-MSG-08)
- **AC-MSG-01g:** Attachment with size > 0 KB → 422, "File should be empty." (BR-MSG-08)
- **AC-MSG-03a:** Customer GET → only their own messages
- **AC-MSG-03b:** Admin GET → all messages
- **AC-MSG-06:** Admin PUT status → 200, status updated

---

### 6.11 Payment Validation

**Domain prefix:** `PAY`  
**Base path:** `/payment`  
**Priority tier:** T1

#### Business Rules

| ID | Rule |
|---|---|
| BR-PAY-01 | This endpoint simulates payment validation; no real charge is made |
| BR-PAY-02 | Each payment method has its own required `payment_details` fields (see table below) |
| BR-PAY-03 | `gift-card` code must start with `GC-` followed by 16 alphanumeric characters |
| BR-PAY-04 | Credit card numbers are validated against Luhn algorithm |

#### Payment Method Field Requirements

| Method | Required Fields in `payment_details` |
|---|---|
| `bank-transfer` | none |
| `cash-on-delivery` | none |
| `credit-card` | `credit_card_number`, `expiration_date` (MM/YY), `cvv` (3-4 digits), `card_holder_name` |
| `buy-now-pay-later` | none |
| `gift-card` | `code` (format: `GC-XXXXXXXXXXXXXXXX`) |

#### Endpoint

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Path** | `/payment/check` |
| **Auth** | None |
| **Success status** | `200 OK` |

**Request body:**

```json
{
  "payment_method": "credit-card",
  "payment_details": {
    "credit_card_number": "4111111111111111",
    "expiration_date": "12/28",
    "cvv": "123",
    "card_holder_name": "Jane Doe"
  }
}
```

**Response (200):**

```json
{ "message": "Payment was successful." }
```

**Acceptance Criteria:**

- **AC-PAY-01a** through **AC-PAY-05:** Each payment method with valid details → 200, `message` present
- **AC-PAY-06:** `credit-card` missing `cvv` → 422
- **AC-PAY-07:** Invalid `payment_method` value → 422
- **AC-PAY-08:** `gift-card` with wrong code format → 422

---

### 6.12 Postcode Lookup

**Domain prefix:** `POST`  
**Base path:** `/postcode-lookup`  
**Priority tier:** T3

#### Business Rules

| ID | Rule |
|---|---|
| BR-POST-01 | `country` and `postcode` are required |
| BR-POST-02 | `house_number` is optional; when provided, street-level data is returned |
| BR-POST-03 | Lookup results are used to auto-fill the billing address form in both the **registration** and **checkout** address steps |
| BR-POST-04 | The lookup fires automatically when **all three** of `country`, `postcode`, and `house_number` are populated; debounced at 300 ms on keystroke |
| BR-POST-05 | Default backend driver is `faker` (deterministic seed — same inputs always yield the same fake address, no external call); switchable to `http` driver pointing at a real or mock service |
| BR-POST-06 | When the `http` driver upstream returns a non-2xx response, the API returns `502 Bad Gateway` to the UI |

#### Endpoint

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/postcode-lookup?country={CC}&postcode={PC}&house_number={N}` |
| **Auth** | None |

**Response (200):**

```json
{
  "street": "High Street",
  "city": "London",
  "state": "England",
  "country": "GB",
  "postcode": "SW1A 1AA"
}
```

**Acceptance Criteria:**

- **AC-POST-01:** Valid country + postcode → 200, address fields populated
- **AC-POST-02:** Missing `country` → 422
- **AC-POST-03:** Missing `postcode` → 422
- **AC-POST-04:** With valid `house_number` → `street` is more specific

---

### 6.13 Images

**Domain prefix:** `IMG`  
**Base path:** `/images`  
**Priority tier:** T4

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/images` |
| **Auth** | None |

**Response (200):**

```json
[
  { "id": "uuid", "file_name": "bolt-cutters.jpg", "title": "Bolt Cutters" }
]
```

**Acceptance Criteria:**

- **AC-IMG-01:** GET → 200, array of image objects with `id` and `file_name`

---

### 6.14 Reports (Admin)

**Domain prefix:** `RPT`  
**Base path:** `/reports`  
**Priority tier:** T3

#### Business Rules

| ID | Rule |
|---|---|
| BR-RPT-01 | All report endpoints require a valid admin token |
| BR-RPT-02 | Report data reflects committed invoices only (not cancelled) |

#### Endpoints

| ID | Path | Description |
|---|---|---|
| RPT-01 | `/reports/total-sales-per-country` | Sales total grouped by country |
| RPT-02 | `/reports/top10-purchased-products` | Top 10 products by units sold |
| RPT-03 | `/reports/top10-best-selling-categories` | Top 10 categories by revenue |
| RPT-04 | `/reports/total-sales-of-years` | Yearly revenue totals |
| RPT-05 | `/reports/average-sales-per-month` | Monthly average revenue |
| RPT-06 | `/reports/average-sales-per-week` | Weekly average revenue |
| RPT-07 | `/reports/customers-by-country` | Customer count per country |

**Acceptance Criteria (all):**

- **AC-RPT-Xhappy:** Admin token → 200, response is array with numeric metric fields
- **AC-RPT-X401:** No token → 401
- **AC-RPT-X403:** Customer token → 403

---

### 6.15 Rentals

**Domain prefix:** `RENT`  
**Base path:** `/products` (filtered by `is_rental=true`)  
**Priority tier:** T3  
**Introduced:** Sprint 3

#### Context

Rental products are a subset of the product catalogue with `is_rental: true`. They are charged per-hour rather than at a fixed price. A dedicated UI page lists all rentals; the detail page shows a duration slider instead of a quantity selector.

#### Business Rules

| ID | Rule |
|---|---|
| BR-RENT-01 | Rental products have `is_rental: true` in the PRODUCT entity |
| BR-RENT-02 | The hourly rate is stored in `price`; total cost = `price × duration (hours)` |
| BR-RENT-03 | Duration is selectable from 1 to 10 hours |
| BR-RENT-04 | Rental items in the checkout cart are labelled "This is a rental item" |
| BR-RENT-05 | Rental products are visible on both the main catalogue and the `/rentals` page |

#### Endpoint

| Method | Path | Description |
|---|---|---|
| GET | `/products?is_rental=true` | List all rental products |

**Acceptance Criteria:**

- **AC-RENT-01:** GET `/products?is_rental=true` → 200, all returned products have `is_rental: true`
- **AC-RENT-02:** Rental product detail page shows duration slider (1–10 h), not quantity ± buttons
- **AC-RENT-03:** Total price displayed = hourly rate × selected duration
- **AC-RENT-04:** Rental item in cart has "This is a rental item" label

---

### 6.16 Discounts

**Domain prefix:** `DISC`  
**Priority tier:** T3  
**Introduced:** Sprint 5

#### 6.16.1 Geo-Location Discount

Discounts are applied automatically based on the customer's browser geo-location when the product is flagged as a location offer.

| City | Discount |
|---|---|
| New York | 5% |
| Mumbai | 10% |
| Tokyo | 15% |
| Amsterdam | 20% |
| London | 25% |

#### Business Rules

| ID | Rule |
|---|---|
| BR-DISC-01 | Geo-location discount applies only when the product is a location offer and the user's city matches a supported city |
| BR-DISC-02 | When a discount is applied, the original price is shown with a strikethrough and the discounted price is shown below |
| BR-DISC-03 | Discounted price is used in cart line items |

**Acceptance Criteria:**

- **AC-DISC-01:** Browser location = Amsterdam → product with location offer shows 20% discount applied
- **AC-DISC-02:** Location not in supported cities → no discount applied
- **AC-DISC-03:** Discounted product added to cart → cart line uses discounted price

#### 6.16.2 Combination Discount

An additional 15% is applied to the cart subtotal when the cart contains at least one rental item **and** at least one non-rental item simultaneously.

**Acceptance Criteria:**

- **AC-DISC-04:** Cart has ≥ 1 rental + ≥ 1 non-rental → 15% combination discount shown on cart (subtotal, discount amount, final total)
- **AC-DISC-05:** All rental or all non-rental items removed → 15% discount removed; total reverts to subtotal
- **AC-DISC-06:** Invoice with combination discount → shows subtotal, 15% discount amount, final total

---

### 6.17 Product Comparison

**Domain prefix:** `CMP`  
**Priority tier:** T4  
**Introduced:** Sprint 5  
**API:** GraphQL (not REST)

#### Context

The comparison feature uses a GraphQL API (Lighthouse) available at `/graphql`. The Angular comparison page (`/comparison`) fetches all selected products in a single round-trip using aliased queries, returning only the fields needed (id, name, price, brand, co₂_rating, specs). The GraphiQL playground is at `/graphiql`.

#### GraphQL Query Shape

```graphql
{
  p0: product(id: "uuid") { id name price brand { name } co2_rating specs { spec_name spec_value spec_unit } }
  p1: product(id: "uuid") { id name price brand { name } co2_rating specs { spec_name spec_value spec_unit } }
}
```

**Acceptance Criteria:**

- **AC-CMP-01:** POST `/graphql` with comparison query → 200, all aliased products returned in single response
- **AC-CMP-02:** Comparison page (`/comparison`) loads products side-by-side with specs, price, brand, CO₂ rating
- **AC-CMP-03:** Differences-only mode highlights fields that differ between compared products

---

## 7. Data Model

### 7.1 Entity Relationship Overview

```
USER
 ├── has many INVOICE
 ├── has many FAVORITE
 └── has many MESSAGE

CATEGORY (self-referential: parent_id)
 └── has many PRODUCT

BRAND
 └── has many PRODUCT

PRODUCT
 ├── belongs to CATEGORY
 ├── belongs to BRAND
 ├── has many PRODUCT_SPEC
 ├── has many IMAGE
 └── has many CART_ITEM

CART
 └── has many CART_ITEM → PRODUCT

INVOICE
 ├── belongs to USER (nullable for guest)
 ├── has many INVOICE_LINE → PRODUCT
 └── has BILLING_ADDRESS
```

### 7.2 Entity Schemas

#### USER

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `first_name` | varchar(64) | NOT NULL |
| `last_name` | varchar(64) | NOT NULL |
| `email` | varchar(255) | UNIQUE, NOT NULL |
| `password` | varchar(255) | Hashed (bcrypt), NOT NULL |
| `role` | enum('user','admin') | DEFAULT 'user' |
| `address` | varchar(255) | nullable |
| `city` | varchar(100) | nullable |
| `state` | varchar(100) | nullable |
| `country` | char(2) | ISO 3166-1 alpha-2, nullable |
| `postcode` | varchar(20) | nullable |
| `phone` | varchar(30) | nullable |
| `dob` | date | nullable |
| `totp_secret` | varchar(64) | nullable |
| `created_at` | timestamp | auto |
| `updated_at` | timestamp | auto |

#### PRODUCT

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `name` | varchar(255) | NOT NULL |
| `description` | text | nullable |
| `price` | decimal(10,2) | NOT NULL, > 0 |
| `in_stock` | boolean | DEFAULT true |
| `co2_rating` | enum('A','B','C','D','E') | NOT NULL |
| `is_rental` | boolean | DEFAULT false |
| `brand_id` | UUID | FK → BRAND.id |
| `category_id` | UUID | FK → CATEGORY.id |
| `product_image_id` | UUID | FK → IMAGE.id, nullable |
| `created_at` | timestamp | auto |
| `updated_at` | timestamp | auto |

#### INVOICE

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `invoice_number` | varchar(50) | UNIQUE, auto-generated |
| `user_id` | UUID | FK → USER.id, nullable (guest) |
| `guest_email` | varchar(255) | nullable |
| `guest_first_name` | varchar(64) | nullable |
| `guest_last_name` | varchar(64) | nullable |
| `status` | enum | PLACED, SHIPPED, DELIVERED, RETURNED |
| `payment_method` | varchar(50) | NOT NULL |
| `billing_country` | char(2) | NOT NULL |
| `billing_city` | varchar(100) | NOT NULL |
| `billing_postcode` | varchar(20) | NOT NULL |
| `billing_address` | varchar(255) | NOT NULL |
| `total` | decimal(10,2) | computed |
| `created_at` | timestamp | auto |

---

## 8. UI/UX Specifications

### 8.1 Design Principles

| Principle | Description |
|---|---|
| **Progressive disclosure** | Guest-first: don't gate browsing or cart behind login |
| **Clear feedback** | Every action (add to cart, remove favourite) shows a toast notification |
| **Error clarity** | Form validation messages appear inline, not in a generic alert |
| **Accessibility-first** | All interactive elements keyboard-navigable; ARIA labels on icons |
| **Responsive** | Currently scoped to desktop (≥ 1024 px); mobile deferred |

### 8.2 Global Navigation

**Selector strategy:** `data-testid` → ARIA roles → visible text.

| Element | Selector | Behaviour |
|---|---|---|
| Logo | `[data-testid="nav-logo"]` | Click → navigate to `/` |
| Categories dropdown | `[data-testid="nav-categories"]` | Hover/click → shows category tree |
| Contact link | `[data-testid="nav-contact"]` | Click → navigate to `/contact` |
| Sign in link | `[data-testid="nav-sign-in"]` (unauthenticated) | Click → `/auth/login` |
| Register link | `[data-testid="nav-register"]` | Click → `/auth/register` |
| User menu | `[data-testid="nav-user-menu"]` (authenticated) | Click → dropdown |
| Cart icon | `[data-testid="nav-cart"]` | Click → `/checkout` |
| Cart badge | `[data-testid="nav-cart-count"]` | Shows number of items in cart |
| Language selector | `[data-testid="nav-language"]` | Dropdown — DE, EN, ES, FR, NL, TR; selection updates entire UI |

### 8.3 Home / Product Listing Page (`/`)

#### Layout

```
[Top Nav]
┌─────────────────┬──────────────────────────────────────────┐
│ SIDEBAR         │ PRODUCT GRID                             │
│  Sort           │ [Card] [Card] [Card]                     │
│  Price Range    │ [Card] [Card] [Card]                     │
│  Search + Clear │ [Card] [Card] [Card]                     │
│  Categories     │ [Pagination]                             │
│  Brands         │                                          │
│  Sustainability │                                          │
└─────────────────┴──────────────────────────────────────────┘
```

#### Product Card

Each card displays:
- Product image (lazy-loaded)
- Product name (clickable → `/product/{id}`)
- CO₂ rating badge (colour-coded: A=green, B=lime, C=yellow, D=orange, E=red)
- Price (formatted: `$XX.XX`)
- "Out of stock" label in red (visible only when `in_stock: false`)

#### Sidebar Filters

| Filter | Behaviour | API parameter |
|---|---|---|
| Sort | Dropdown: Name A-Z, Name Z-A, Price Low-High, Price High-Low | `sort` |
| Price Range | Dual-handle slider; **default range $1–$100, maximum $200**; real-time update on release | `price_min`, `price_max` |
| Search | Text input + "Search" button; **minimum 3 characters, maximum 40 characters**; submitting resets all active filters; Clear removes query | `q` |
| Category | Checkbox tree (parent + children); **checking a parent checks all children**; unchecking all children unchecks the parent; multi-select | `category_id` |
| Brand | Checkbox list; multi-select | `brand_id` |
| Sustainability | Single checkbox (eco-friendly only) | filter client-side |
| Pagination | Numbered pages; previous/next | `page` |

#### UI Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| UI-PL-01 | Product listing loads on page load with default pagination | First load → grid contains ≤ 9 products; page indicator shows "1" |
| UI-PL-02 | Category filter updates grid | Select "Power Tools" → all visible products belong to that category |
| UI-PL-03 | Brand filter narrows results | Select brand → all visible products match that brand |
| UI-PL-04 | Sustainability checkbox removes non-eco products | Checked → only eco-rated products visible |
| UI-PL-05 | Price range slider filters results | Set 10–50 → all products in 10.00–50.00 range; default range is $1–$100 |
| UI-PL-06 | Search updates grid | Type "hammer" → matching products shown |
| UI-PL-06b | Search minimum length enforced | Fewer than 3 characters → search not executed, validation error shown |
| UI-PL-06c | Search maximum length enforced | Input capped at 40 characters |
| UI-PL-06d | Search resets active filters | Submit search with active category/brand filters → filters reset to default |
| UI-PL-07 | Pagination navigates pages | Click page 2 → new set of products; URL includes `?page=2` |
| UI-PL-08 | Out-of-stock label visible | Product with `in_stock: false` shows "Out of stock" red label |
| UI-PL-09 | Hierarchical category selection | Check parent category → all child checkboxes checked; uncheck all children → parent unchecked |
| UI-PL-10 | Discount display on product card | Product with active discount shows original price strikethrough and discounted price |

---

### 8.4 Product Detail Page (`/product/{productId}`)

#### Layout

```
[Breadcrumb: Home > Category > Product Name]
┌──────────────────────┬──────────────────────────────────────┐
│ Product Image        │ Product Name                         │
│                      │ Brand: [badge]  Category: [badge]    │
│                      │ Price: $XX.XX                        │
│                      │ CO₂ Rating: [A badge]                │
│                      │ Description text                     │
│                      │                                      │
│                      │ Qty: [−] [2] [+]                     │
│                      │ [Add to Cart] [Add to Favourites]    │
│                      │ [Compare]                            │
├──────────────────────┴──────────────────────────────────────┤
│ Specifications                                              │
│  Weight: 1.2 kg  |  Length: 300 mm  |  ...                  │
├─────────────────────────────────────────────────────────────┤
│ Related Products (horizontal scroll, ≤ 5)                  │
│  [Card] [Card] [Card]                                       │
└─────────────────────────────────────────────────────────────┘
```

#### Toast Notifications

| Trigger | Toast text |
|---|---|
| Add to cart (success) | "Product added to shopping cart." |
| Add to favourites (success) | "Product added to your favorites list." |
| Add to favourites (not logged in) | Redirect to `/auth/login` |

#### UI Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| UI-PD-01 | All product fields displayed | Page shows name, price, description, brand, category, CO₂ rating |
| UI-PD-01b | Discount price displayed | Product with discount shows original price with strikethrough, discounted price, and discount % badge |
| UI-PD-02 | Add to cart creates/updates cart | Click → toast "Product added to shopping cart."; cart badge increments |
| UI-PD-03 | Cart badge increments | Before: 0; after add: 1 |
| UI-PD-04 | Add to favourites (authenticated) | Click → toast "Product added to your favorites list." |
| UI-PD-04b | Add to favourites (duplicate) | Product already in favourites → toast "Product already in your favorites list." |
| UI-PD-04c | Add to favourites (unauthenticated) | Not logged in → toast "Unauthorized, can not add product to your favorite list." |
| UI-PD-05 | Add to favourites (unauthenticated — redirect) | Click → redirect to sign-in (when UX requires hard redirect) |
| UI-PD-06 | Specs table renders all key-value pairs | Table row per spec from API |
| UI-PD-07 | Related products ≤ 5 items, each clickable | Section shows 0–5 product cards; clicking any card navigates to `/product/{id}` for that product |
| UI-PD-08 | Quantity selector — default and limits | Default quantity = 1; + button increments; − button decrements (minimum 1, cannot go below 1); manual entry clamped between 1 and 999,999,999 |
| UI-PD-09 | Out-of-stock disables Add to Cart | `in_stock: false` (non-rental) → "Add to Cart" button is disabled; "Out of stock" shown in red |
| UI-PD-10 | Rental product shows duration slider | Rental product → duration slider (1–10 hours) replaces quantity ± buttons; total = hourly rate × duration |

---

### 8.5 Checkout Flow (`/checkout`)

#### Step 1 — Cart Review

| Element | Selector | Behaviour |
|---|---|---|
| Line items table | `[data-testid="cart-item"]` | Repeating rows |
| Quantity input | `[data-testid="cart-item-quantity"]` | Editable; on change → PUT `/carts/{id}/product/quantity`; toast "Product quantity updated." |
| Remove button | `[data-testid="cart-item-remove"]` | Click → DELETE item; row removed |
| Order total | `[data-testid="cart-total"]` | Updated after any change |
| Empty cart message | — | When cart is empty, shows "Your shopping cart is empty" |
| Rental label | — | Rental items show "This is a rental item" badge |
| Discount badge | — | Discounted items show discount badge; both original and discounted price displayed |
| Combination discount | — | Cart with rental + non-rental items shows subtotal, 15% discount amount, final total |
| Proceed button | `[data-testid="proceed-to-checkout"]` | Click → Step 2 or Step 3 |

#### Step 2 — Sign In (skipped if authenticated)

| Scenario | Behaviour |
|---|---|
| Guest user | Email + password form displayed |
| TOTP enabled | After valid credentials, a 6-digit TOTP input field appears; must enter valid code to proceed |
| Already logged in | Message "You are already signed in as [First Name] [Last Name]" displayed; proceed directly to Step 3 |

#### Step 3 — Billing Address

| Element | Behaviour |
|---|---|
| Country dropdown | Select country |
| Postcode input + House number | When all three (country, postcode, house number) are filled → GET `/postcode-lookup` triggered (debounced 300 ms); loading spinner; auto-fill street, city, state |
| Street / City / State / Country | Auto-filled; editable. Max lengths: Street 70, City 40, State 40, Country 40, Postcode 10 |
| Pre-fill for logged-in | Logged-in user's address from profile is pre-filled |
| Proceed button | Validates all required fields; disabled if any field empty |

#### Step 4 — Payment

| Payment Method | Required Fields |
|---|---|
| Bank Transfer | Bank name (letters+spaces); Account name (alphanumeric); Account number (digits only) |
| Cash on Delivery | No additional fields |
| Credit Card | Card number (XXXX-XXXX-XXXX-XXXX); Expiration date (MM/YYYY, must be future date); CVV (3–4 digits); Card holder name (letters+spaces) |
| Buy Now Pay Later | Monthly installments dropdown: 3, 6, 9, or 12 months |
| Gift Card | Gift card number (alphanumeric); Validation code (alphanumeric) |

Switching payment method resets the form to show the new method's fields only.

Confirm button → POST `/invoices`; on success → confirmation page with `invoice_number` + checkout confirmation email sent.

#### UI Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| UI-CO-01 | Cart shows all items with quantities and totals | Each item row shows name, qty, unit price, line total |
| UI-CO-01b | Empty cart message | No items → "Your shopping cart is empty" message displayed |
| UI-CO-01c | Quantity update confirmation | Change quantity → toast "Product quantity updated." |
| UI-CO-01d | Combination discount shown | Rental + non-rental items → cart shows subtotal, 15% discount, final total |
| UI-CO-02 | Quantity change recalculates total | Increment qty → total updates without page refresh |
| UI-CO-03 | Remove item deletes row | Click × → item row disappears; total recalculates |
| UI-CO-04 | Authenticated user skips Sign In step | Logged-in user → Step 1 → Step 3 directly |
| UI-CO-04b | TOTP prompt during checkout sign-in | TOTP-enabled user → 6-digit code input appears after valid email+password |
| UI-CO-04c | Already-signed-in message | Logged-in user at sign-in step → "You are already signed in as [First Name] [Last Name]" |
| UI-CO-04d | Address pre-filled for logged-in | Logged-in user at billing step → address fields pre-populated from profile |
| UI-CO-05 | Postcode auto-fill shows loader then populates fields | All three (country + postcode + house number) filled → spinner → street/city/state populated |
| UI-CO-06 | All 5 payment methods appear in dropdown | Dropdown has 5 options |
| UI-CO-06b | Payment method fields are dynamic | Selecting credit card → card number/expiry/CVV/holder fields appear; switching method resets fields |
| UI-CO-06c | Credit card expiration must be future date | Past expiry date → "Expiration date must be in the future." error |
| UI-CO-06d | BNPL shows installments dropdown | Buy Now Pay Later → dropdown with 3, 6, 9, 12 months |
| UI-CO-07 | Payment completes → confirmation page | Success → page shows "Thank you" + invoice number; confirmation email sent |

---

### 8.6 Favourites Page (`/account/favorites`)

**Auth required:** Customer token (storage state).

| Element | Behaviour |
|---|---|
| Favourites list | Fetched from GET `/favorites` |
| Product card | Shows image, name, description excerpt |
| Remove (×) button | DELETE `/favorites/{id}`; row removed from list |

#### UI Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| UI-FAV-01 | Favourites page lists all user's favourites | Page loads with ≥ 1 item (pre-added in setup) |
| UI-FAV-02 | Remove button deletes favourite | Click × → item removed from list |

---

### 8.7 Profile Page (`/account/profile`)

**Auth required:** Customer token.

#### Sections

**Personal Info form:** first_name, last_name, email (readonly), phone, address, postcode, city, state, country → "Update Profile" button → PUT `/users/{id}`

**Password form:**
- Current Password
- New Password (with strength meter: Weak / Fair / Good / Strong)
- Password rules: ≥ 8 chars, upper + lower, number, special char
- Confirm New Password
- "Change Password" button → POST `/users/change-password`

**TOTP Section:**
- QR code image
- Manual key (base-32 string)
- Code input (6 digits)
- "Verify TOTP" button → POST `/totp/verify`

#### UI Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| UI-PR-01 | Profile form pre-populated | Page load → fields show current user data from `GET /users/me` |
| UI-PR-02 | Update Profile persists | Submit → success message; reload → same values |
| UI-PR-03 | Password strength meter updates real-time | Type new password → meter updates without submit |
| UI-PR-04 | Change password validates complexity | Weak password → inline error; strong → submit allowed |
| UI-PR-05 | TOTP QR code displayed | QR code image visible |
| UI-PR-06 | Verify TOTP shows result | Valid code → success; invalid code → error |

---

### 8.8 Contact Page (`/contact`)

**Auth:** None required.

#### Form Fields

| Field | Type | Required | Validation |
|---|---|---|---|
| First name | Text input | Yes | Non-empty |
| Last name | Text input | Yes | Non-empty |
| Email | Email input | Yes | Valid email format |
| Subject | Dropdown | Yes | One of the values in BR-MSG-02 |
| Message | Textarea | Yes | Minimum 50 characters (BR-MSG-06) |
| File attachment | File input | No | Binary upload; MIME/size validated server-side (BR-MSG-05) |

> **Note (Sprint 1 vs Sprint 5):** The subject options differ between sprint versions. Sprint 1 exposed: *Customer service, Webmaster, Return, Payments, Warranty, Status of order*. Sprint 5 (this spec) exposes the values in BR-MSG-02.

#### Submit Behaviour

Submit → POST `/messages` → on success: confirmation text is displayed **and the form is hidden**.

#### UI Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| UI-CT-01 | Contact form is accessible | Navigate to `/contact` → form is displayed with all required fields |
| UI-CT-02 | First name and Last name are separate required fields | Both fields present; submission without either → inline validation error |
| UI-CT-03 | Email field validates format | Invalid email → inline error before submission |
| UI-CT-04 | Subject dropdown contains expected options | Dropdown lists all values from BR-MSG-02 |
| UI-CT-05 | Message minimum 50 characters enforced | Message with < 50 chars → inline error "Message must be at least 50 characters" |
| UI-CT-06 | Successful submission shows confirmation and hides form | All fields valid → submit → confirmation message displayed; form no longer visible |
| UI-CT-07 | Optional file attachment accepted | File input present; uploading a file does not prevent submission |

### 8.9 Category Page (`/category/:name`)

**Auth:** None required.  
**Sprint 1 route:** Defined in `sprint1.md` as the "Products by category" page.

#### Layout

```
[Top Nav]
[Page Title: <Category Name>]
┌──────────────────────────────────────────────────────┐
│ PRODUCT GRID                                         │
│ [Card] [Card] [Card]                                 │
│ [Card] [Card] [Card]                                 │
│ [Pagination]                                         │
└──────────────────────────────────────────────────────┘
```

The category name is displayed as the page title (heading). Only products belonging to the selected category are shown. Each product card follows the same structure as the home page grid (image, name, price, CO₂ rating badge) and is clickable, navigating to `/product/{id}`.

#### UI Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| UI-CAT-01 | Category page is displayed on navigation | Click a category name anywhere in the app → route changes to `/category/:name`; page loads |
| UI-CAT-02 | Category name shown as page heading | Page heading (h1 or equivalent) matches the selected category name |
| UI-CAT-03 | Only products from the selected category are shown | All visible product cards belong to the selected category; no products from other categories appear |
| UI-CAT-04 | Product cards navigate to detail page | Click any product card → navigated to `/product/{id}` for that product |

---

### 8.10 Rental Products Page (`/rentals`)

**Auth:** None required.  
**Introduced:** Sprint 3

Displays all products with `is_rental: true`. Each card shows product image, name, and description (truncated). Clicking a product navigates to the product detail page, which shows a duration slider instead of quantity buttons.

#### UI Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| UI-RNT-01 | Rentals page accessible | Navigate to `/rentals` → list of rental products displayed |
| UI-RNT-02 | Rental card info | Each rental shows image, name, and description |
| UI-RNT-03 | Rental detail shows duration slider | Click rental → detail page has 1–10 hour duration slider, not ± quantity buttons |
| UI-RNT-04 | Price calculated from duration | Hourly rate × selected hours = displayed total |
| UI-RNT-05 | Rental label in checkout | Rental item in cart shows "This is a rental item" |

---

### 8.11 Admin Dashboard (`/admin`)

**Auth:** Admin Bearer token required.  
**Introduced:** Sprint 5 (full admin UI)

#### Layout

The admin module is lazy-loaded at `/admin`. The dashboard landing page shows a bar chart of total sales by year and a paginated list of recent invoices.

#### Admin Pages

| Path | Page | Functionality |
|---|---|---|
| `/admin/dashboard` | Dashboard | Sales bar chart (by year) + recent invoices list |
| `/admin/products` | Products | List, create, edit, delete products (with image upload) |
| `/admin/categories` | Categories | List, create, edit, delete categories; optional parent category |
| `/admin/brands` | Brands | List, create, edit, delete brands |
| `/admin/invoices` | Orders | List all orders; view details; update status |
| `/admin/users` | Users | List, view, edit, delete user accounts; enable/disable toggle |
| `/admin/messages` | Messages | View all contact messages; reply |
| `/admin/reports` | Reports | Monthly sales, weekly sales, general statistics |
| `/admin/settings` | Settings | Postcode lookup driver configuration (local dev only) |

#### Invoice Status Values (Admin)

`AWAITING_FULFILLMENT` → `ON_HOLD` → `AWAITING_SHIPMENT` → `SHIPPED` → `COMPLETED`

#### UI Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| UI-ADM-01 | Admin login redirects to dashboard | Admin credentials → redirect to `/admin/dashboard` |
| UI-ADM-02 | Dashboard shows sales chart | `/admin/dashboard` → bar chart visible with year data |
| UI-ADM-03 | Product CRUD | Admin can create, read, update, delete products; changes persist |
| UI-ADM-04 | User enable/disable | Toggle "Enabled" on a user → user login blocked immediately when disabled |
| UI-ADM-05 | Message reply | Admin can view a message and submit a reply |
| UI-ADM-06 | Order status update | Admin can change order status; updated status reflected in customer invoice view |

---

### 8.12 Privacy Policy Page (`/privacy`)

**Auth:** None required.  
**Introduced:** Sprint 5

#### UI Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| UI-PRV-01 | Privacy policy accessible | Navigate to `/privacy` → page displays privacy policy content |
| UI-PRV-02 | Content coverage | Page covers: Google Sign-In integration, data collection, automatic data removal (hourly), third-party services, data security, and contact information |

---

### 8.13 Product Comparison Page (`/comparison`)

**Auth:** None required.  
**Introduced:** Sprint 5  
**API:** GraphQL (`/graphql` via Lighthouse)

Products are added to comparison from the detail page. The comparison page fetches all selected products in a single GraphQL round-trip using aliased queries.

#### UI Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| UI-CMP-01 | Comparison page loads selected products side-by-side | `/comparison` → products displayed in columns |
| UI-CMP-02 | Specs, price, brand, CO₂ rating shown | Each product column shows all comparable attributes |
| UI-CMP-03 | Differences-only mode | Toggle → only attributes that differ between products are shown |

---

### 8.14 Chat Widget (Global)

**Auth:** None required (works for guests and authenticated users).  
**Introduced:** Sprint 5  
**Position:** Bottom-right corner of every page

The chat widget provides guided flows for product discovery, ordering, checkout, and support without navigating away from the current page.

#### Chat Flows

| Flow | Entry | Behaviour |
|---|---|---|
| Find Product | Select "Find Product" | Enter search → up to 5 matching products shown as cards; "View Product" navigates to detail page |
| Order Product | Select "Order Product" | Search product → select quantity (1, 2, 3, 5, 10, or custom 1–999) → confirm → product added to cart |
| Checkout | Select "Checkout" | Guided checkout: cart summary → guest details (if not logged in) → address → payment → order confirmation with invoice number |
| Support | Select "Support" | Prompts for subject, message (min 50 chars), optional `.txt` attachment; if guest, also asks first name, last name, email |

#### UI Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| UI-CHAT-01 | Chat toggle visible on all pages | Toggle button present bottom-right; click opens chat window |
| UI-CHAT-02 | Menu shows 4 options | Chat window shows: Find Product, Order Product, Checkout, Support |
| UI-CHAT-03 | Find Product returns ≤ 5 results | Search in chat → at most 5 product cards shown |
| UI-CHAT-04 | Checkout through chat | Guest checkout fully completable within chat; invoice number displayed on success |
| UI-CHAT-05 | Empty cart in Checkout flow | Cart empty → "Your cart is empty" displayed |
| UI-CHAT-06 | Support flow validates message length | Message < 50 chars → validation error before submission |

---

## 9. Non-Functional Requirements

### 9.1 Performance

| Endpoint Type | SLO (p99 latency) | Baseline Load |
|---|---|---|
| Public catalogue reads (products, brands, categories) | < 1 500 ms | 50 RPS |
| Auth-required reads (cart, favourites, invoices) | < 2 000 ms | 20 RPS |
| Writes (POST/PUT/PATCH/DELETE) | < 3 000 ms | 10 RPS |
| PDF generation (async) | < 30 s (poll result) | N/A |

### 9.2 Reliability

| Metric | Target |
|---|---|
| API uptime | ≥ 99.5 % per month |
| 5xx error rate | < 0.1 % of all requests |
| Max error rate during deploy | < 1 % (rolling deploy) |

### 9.3 Scalability

- API must handle concurrent sessions without session collision
- Database connections pooled (Laravel connection pool ≥ 10)
- Stateless API (JWT); horizontal scaling supported

### 9.4 Data Retention

| Data type | Retention |
|---|---|
| User accounts | Until deleted by admin |
| Invoices | Indefinite (auditable) |
| PDF invoices | 30 days (then auto-removed by `invoice:remove` artisan job) |
| Messages | Indefinite |

---

## 10. Security Model

### 10.1 Authentication

| Mechanism | Detail |
|---|---|
| Protocol | JWT (RS256 or HS256, server-configured) |
| Access token TTL | 60 minutes |
| Refresh token TTL | 7 days (single use) |
| Token storage (client) | In-memory / `localStorage` (not cookies in SPA context) |
| HTTPS | Required for all environments |
| Social login | Google OAuth 2.0 and GitHub OAuth 2.0 (popup, 500×400 px) |
| Account locking | 3 consecutive failed login attempts → account locked (HTTP 423); admin-exempt (BR-AUTH-08/09) |
| Disabled accounts | Admin can disable a user account; login returns "Account disabled." (BR-AUTH-10/11) |

### 10.2 RBAC Matrix

| Resource | Anonymous | Customer (own) | Customer (other) | Admin |
|---|---|---|---|---|
| Browse products, brands, categories | ✅ | ✅ | ✅ | ✅ |
| Manage cart (create, read, modify) | ✅ | ✅ | ✅ | ✅ |
| Read own profile | ❌ 401 | ✅ | ❌ 403 | ✅ |
| Update own profile | ❌ 401 | ✅ | ❌ 403 | ✅ |
| Update others' profile | ❌ 401 | ❌ 403 | ❌ 403 | ✅ |
| Delete user | ❌ 401 | ❌ 403 | ❌ 403 | ✅ |
| Create/update/delete products | ❌ 401 | ❌ 403 | ❌ 403 | ✅ |
| Create/update/delete brands | ❌ 401 | ❌ 403 | ❌ 403 | ✅ |
| Create/update/delete categories | ❌ 401 | ❌ 403 | ❌ 403 | ✅ |
| Create invoice (own) | ❌ 401 | ✅ | N/A | ✅ |
| Read own invoices | ❌ 401 | ✅ | ❌ 403 | ✅ |
| Update invoice status | ❌ 401 | ❌ 403 | ❌ 403 | ✅ |
| Manage favourites (own) | ❌ 401 | ✅ | ❌ 403 | ✅ |
| Post contact message | ✅ | ✅ | ✅ | ✅ |
| Reply to messages | ❌ 401 | ❌ 403 | ❌ 403 | ✅ |
| View reports | ❌ 401 | ❌ 403 | ❌ 403 | ✅ |

### 10.3 Input Validation

- All string inputs sanitised server-side (no raw HTML stored)
- File uploads validated by MIME type; maximum size enforced
- Email uniqueness enforced at database level (unique index)
- Password complexity enforced at API level (BR-AUTH-01)

### 10.4 Error Handling

- 401 returned for all missing/expired tokens (no token type disclosure)
- 403 returned for correct token, insufficient role
- Validation errors return 422 with field-level messages (see Section 13)

---

## 11. Accessibility & Localisation

### 11.1 Accessibility (WCAG 2.1 AA)

| Requirement | Detail |
|---|---|
| Keyboard navigation | All interactive elements reachable via Tab; focus ring visible |
| ARIA labels | Icon buttons (cart, remove, close) have `aria-label` |
| Colour contrast | Minimum 4.5:1 for text; 3:1 for large text |
| Form labels | All form inputs have associated `<label>` |
| Error announcements | Form errors announced via `aria-live` region |
| Image alt text | Product images have descriptive alt text from `name` field |

### 11.2 Localisation

- **Sprint 5 scope:** Six languages supported — **English (EN), German (DE), Spanish (ES), French (FR), Dutch (NL), Turkish (TR)** via Transloco i18n
- Browser language is auto-detected on first visit; falls back to EN if unsupported
- Language preference stored in `localStorage`; persists across sessions
- Language selector in nav shows: **DE, EN, ES, FR, NL, TR**; switching updates all labels and messages instantly
- Date format: ISO 8601 (API); UI display format localised per language
- Currency: USD (API stores raw decimal; UI renders with `$` prefix)

---

## 12. Analytics & Telemetry

### 12.1 Tracked Events

| Event Name | Trigger | Properties |
|---|---|---|
| `product_viewed` | User lands on `/product/{id}` | `product_id`, `category`, `brand`, `price` |
| `product_added_to_cart` | Add to cart clicked | `product_id`, `quantity`, `cart_id` |
| `product_added_to_favourites` | Add to favourites clicked | `product_id`, `user_id` |
| `checkout_started` | User proceeds from cart step | `cart_id`, `item_count`, `cart_total` |
| `invoice_created` | POST `/invoices` returns 201 | `invoice_id`, `total`, `payment_method` |
| `search_performed` | Search submitted | `query`, `result_count` |
| `filter_applied` | Any sidebar filter changed | `filter_type`, `filter_value` |
| `message_sent` | POST `/messages` returns 200 | `subject` |

### 12.2 Session & Error Tracking

- Client-side errors (uncaught exceptions) → logged to console + error service
- API 5xx responses → server-side alarm threshold (0.1 % of requests)
- Slow API responses (> 3 s) → server-side warning log

---

## 13. API Error Contract

All error responses follow a consistent schema:

### 4xx Validation Error (422)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### 401 Unauthorised

```json
{
  "message": "Unauthenticated."
}
```

### 403 Forbidden

```json
{
  "message": "This action is unauthorized."
}
```

### 404 Not Found

```json
{
  "message": "No query results for model [Product]."
}
```

### 409 Conflict

```json
{
  "message": "The resource already exists."
}
```

### 500 Server Error

```json
{
  "message": "Server Error"
}
```

---

## 14. Release Phases & Roadmap

| Sprint | Key Deliverables | API Base URL | App URL |
|---|---|---|---|
| Sprint 1 | Product catalogue, category pages, contact form (basic) | api-v1.practicesoftwaretesting.com | v1.practicesoftwaretesting.com |
| Sprint 2 | User auth (JWT), search, invoices, favourites, messaging, payment validation, reports | api-v2.practicesoftwaretesting.com | v2.practicesoftwaretesting.com |
| Sprint 3 | Checkout flow, rental products page, GraphQL API | api-v3.practicesoftwaretesting.com | v3.practicesoftwaretesting.com |
| Sprint 4 | Login/register UI pages, account panel, PATCH endpoints, route guards, mobile app integration | api-v4.practicesoftwaretesting.com | v4.practicesoftwaretesting.com |
| Sprint 5 | Shopping cart, social login (Google/GitHub), TOTP 2FA, admin dashboard, PDF invoices, discounts (geo + combination), multi-language (6 langs), chat widget, product comparison, privacy policy, postcode lookup | api.practicesoftwaretesting.com | practicesoftwaretesting.com |
| Sprint 5 (bugs) | 90+ intentional bugs across UI, API, and accessibility; for exploratory testing practice | api-with-bugs.practicesoftwaretesting.com | with-bugs.practicesoftwaretesting.com |
| Sprint 5 (perf) | Performance-degraded middleware on key endpoints; for load/resilience testing practice | (same as Sprint 5) | (internal) |

### 14.1 Future Roadmap (Post-Sprint 5)

| Item | Priority | Notes |
|---|---|---|
| Mobile responsive UI | High | Mobile app (React Native) covers Sprint 4; web responsiveness deferred |
| Real payment processor integration | Low | Out of scope (practice app) |
| Inventory / warehouse management | Low | Out of scope |
| Product reviews & ratings | Medium | User-generated content |
| Coupon / discount codes | Medium | Extension of payment flow |
| Two-factor enforcement (mandatory admin) | High | Security hardening |
| Additional languages | Low | 6 languages shipped in Sprint 5; more can be added via Transloco |

---

## 15. Dependencies & Integrations

| Dependency | Type | Owner | Risk |
|---|---|---|---|
| Laravel 12 REST API | Backend service | testsmith-io | Low — owned codebase |
| GraphQL API (Lighthouse) | Backend service | testsmith-io | Low — owned codebase; reuses Eloquent models |
| Angular 20 SPA | Frontend | testsmith-io | Low — owned codebase |
| React Native mobile app | Mobile app | testsmith-io | Low — shares Sprint 4 API |
| MySQL / MariaDB 10.6 | Database | Docker (local), hosted (production) | Low |
| Redis (Predis) | Application caching | Docker | Low |
| MailHog / SMTP | Email testing (local) / delivery (production) | Docker / hosted | Low |
| Docker Compose | Infrastructure | DevOps | Low |
| Playwright v1.x | E2E test runner | QA team | Low |
| PHPUnit / Pest | Backend unit tests | Dev team | Low |
| GitHub Actions | CI/CD | GitHub | Low |
| Pact | Contract testing | QA team | Low |

### 15.1 External Dependencies

| Dependency | Used for | Notes |
|---|---|---|
| Postcode API / Faker driver | `/postcode-lookup` | Integrated server-side; default driver is Faker (no external call); switchable to HTTP driver |
| PDF generation | Invoice PDF | Server-side artisan command (`invoice:generate`); asynchronous; auto-removed after 30 days |
| Google OAuth 2.0 | Social login | `/auth/cb/google` callback; popup 500×400 px |
| GitHub OAuth 2.0 | Social login | `/auth/cb/github` callback |
| Transloco | i18n / multi-language | 6 languages: DE, EN, ES, FR, NL, TR |

---

## 16. Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | Shared test data mutated by parallel test workers | Medium | High | Sequential tests within `describe` blocks; unique email per run using `Date.now()` |
| R-02 | Hosted API rate limiting breaking CI | Low | Medium | CI uses `workers: 1`; add `test.setTimeout` if needed |
| R-03 | Flaky UI tests due to animations and async loading | Medium | Medium | `waitForSelector`, `toBeVisible()` with explicit timeout; no `page.waitForTimeout` |
| R-04 | Admin deletes shared product used by other tests | Low | High | Each test creates its own fixture data; teardown in `afterAll` |
| R-05 | `.auth/*.json` token files missing at test run time | Low | High | `dependencies` key in `playwright.config.ts` enforces setup order |
| R-06 | PDF generation async — poll timeout in CI | Low | Medium | Poll with retry (max 10 s, 1 s interval) before asserting `ready: true` |
| R-07 | Sprint version mismatch (`.env SPRINT` variable wrong) | Medium | High | CI workflow pins `SPRINT=5`; local dev instructions in README |
| R-08 | Password complexity rule changes between sprints | Low | Medium | Central `BR-AUTH-01` in spec; update test data file only |
| R-09 | Guest invoice not cleaned up between runs | Low | Medium | Use unique `guest_email` per run |

---

## 17. Open Questions & Decision Log

### Open Questions

| ID | Question | Owner | Due |
|---|---|---|---|
| OQ-01 | Should `PATCH /users/{userId}` allow updating `email`? (Email uniqueness check) | Engineering | Sprint 5 review |
| OQ-02 | Is there a maximum number of items per cart (UI vs API discrepancy)? | PM | Sprint 5 |
| OQ-03 | What is the exact JWT algorithm and secret rotation policy? | Security | Sprint 5 |
| OQ-04 | Should customers receive email notifications on invoice status change? | PM | Post-Sprint 5 |
| OQ-05 | Is `co2_rating` calculated or manually set by admin? | Engineering | Sprint 5 |

### Decision Log

| ID | Decision | Rationale | Date |
|---|---|---|---|
| D-01 | Use JWT (stateless) rather than session cookies | Enables stateless horizontal scaling and SPA compatibility | Sprint 0 |
| D-02 | Cart does not require authentication | Reduces friction for anonymous shoppers (guest checkout) | Sprint 2 |
| D-03 | PDF generation is asynchronous (poll-based) | PDF generation is CPU-intensive; async prevents request timeout | Sprint 4 |
| D-04 | Use Playwright for E2E (not Cypress) | Better support for API + UI combined test flows; TypeScript native | Sprint 5 |
| D-05 | Forgort-password always returns 200 regardless of email existence | Prevents user enumeration (security best practice) | Sprint 3 |
| D-06 | `co2_rating` is a 5-point enum (A–E) | Simplest implementation of sustainability indicator | Sprint 1 |

---

## 18. Glossary

| Term | Definition |
|---|---|
| **Access Token** | Short-lived JWT used to authenticate API requests |
| **Refresh Token** | Long-lived token used to obtain a new access token without re-login |
| **CO₂ Rating** | Sustainability score from A (most eco-friendly) to E (least eco-friendly) |
| **Cart** | Temporary collection of products a user intends to purchase |
| **Invoice** | Confirmed purchase record created from a cart |
| **Invoice Line** | A single product line within an invoice |
| **Favourite** | A product bookmarked by a customer for future reference |
| **Slug** | URL-safe identifier derived from a name (e.g., "dewalt" for brand "DeWalt") |
| **TOTP** | Time-based One-Time Password — 6-digit code renewed every 30 seconds |
| **RBAC** | Role-Based Access Control — permissions based on user role (anonymous, customer, admin) |
| **Guest Invoice** | An invoice created without a registered user account |
| **Sprint** | A discrete version of the Toolshop application with an incremental feature set |
| **SLO** | Service Level Objective — internal performance target |
| **p99 latency** | The 99th percentile response time — 99 % of requests complete within this time |
| **Tier 1/2/3/4** | Test priority tiers from Critical (T1) to Low (T4), per TEST_PLAN.md |
| **data-testid** | HTML attribute used as a stable, test-specific selector |

---

*Document maintained by Product Management. Engineering and QA must not modify this file directly — raise a PR for review.*

*Last reviewed: 2026-04-23 | Next review: Sprint 6 planning*
