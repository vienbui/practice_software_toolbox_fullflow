# Toolshop — Test Plan

**Version:** 1.1  
**Date:** 2026-04-23  
**Project:** Toolshop API + UI Automation  
**Reference:** [PRODUCT_SPEC.md](./PRODUCT_SPEC.md)  
**Tool:** Playwright v1.x + TypeScript  
**Environment:** `https://api.practicesoftwaretesting.com` / `https://practicesoftwaretesting.com`

---

## 1. Overview

### 1.1 Feature Under Test

**Toolshop** is a full-stack e-commerce platform for hand tools, power tools, and hardware accessories. It consists of three testable surfaces:

- **REST API** — an OpenAPI 3.0 JSON API (`https://api.practicesoftwaretesting.com`) covering 17 functional domains: Authentication (incl. Social Login, Account Locking), User Management, Product Catalogue, Product Specifications, Brands, Categories, Cart, Checkout & Invoicing, Favourites, Contact & Messaging, Payment Validation, Postcode Lookup, Images, Reports, Rentals, Discounts (Geo-Location + Combination), and Product Comparison.
- **GraphQL API** — a Lighthouse-powered endpoint (`/graphql`) used exclusively by the Product Comparison feature; the GraphiQL playground is at `/graphiql`.
- **Angular SPA** — a companion single-page application (`https://practicesoftwaretesting.com`) that consumes both APIs and delivers the complete customer-facing and admin shopping experience.

The version under test is **Sprint 5** — the most feature-complete release — which adds on top of Sprints 1–4: guest checkout, PDF invoice generation, postcode lookup, full messaging, social login (Google/GitHub), account locking (HTTP 423), rental products with hourly pricing, geo-location and combination discounts, product comparison via GraphQL, an admin dashboard UI, a chat widget, and a privacy policy page.

### 1.2 Purpose of This Test Plan

This document defines the strategy, scope, priorities, and execution plan for validating that Toolshop Sprint 5 meets all requirements specified in the [Product Spec](./PRODUCT_SPEC.md). Specifically, it aims to:

1. Establish a shared understanding of **what** will be tested, **how**, and **why** across all stakeholders (QA, Engineering, Product).
2. Provide a risk-based prioritisation framework so that critical business flows are verified before less impactful areas.
3. Define the automation architecture so that every contributor writes tests consistently.
4. Set measurable entry and exit criteria to make release decisions objective and auditable.

### 1.3 Feature Flags

The following flags and environment variables must be set correctly before any test execution begins. Tests that depend on a disabled flag will produce false negatives.

| Flag / Variable | Scope | Required Value | Feature Gated |
|-----------------|-------|---------------|---------------|
| `SPRINT` | `.env` | `5` | Enables Sprint 5 API routes (guest checkout, postcode lookup, messaging, discounts, rentals) |
| `API_URL` | `.env` | `https://api.practicesoftwaretesting.com` | All REST API tests |
| `GRAPHQL_URL` | `.env` | `https://api.practicesoftwaretesting.com/graphql` | Product Comparison (GraphQL) tests |
| `UI_URL` | `.env` | `https://practicesoftwaretesting.com` | All UI tests |
| `ADMIN_EMAIL` | `.env` / CI secret | `admin@practicesoftwaretesting.com` | Admin-scoped API tests, Reports, Admin Dashboard UI |
| `ADMIN_PASSWORD` | `.env` / CI secret | `welcome01` | Admin authentication |
| Guest checkout | API server config | Enabled by default in Sprint 5 | `POST /invoices` without auth |
| PDF invoice generation | API server config | Enabled by default in Sprint 5 | `GET /invoices/{id}/download` |
| TOTP / 2FA | API server config | Optional (not enforced in Sprint 5) | TOTP tests — skip if disabled on target env |
| Social login (Google/GitHub) | OAuth app config | Configured on server | `GET /auth/social-login` — cannot be fully automated (OAuth popup); verify redirect endpoint returns 302 |
| Geo-location discount | Browser/API config | Enabled by default in Sprint 5 | Discount tests — mock/override location via Playwright `geolocation` context |
| Account locking | API server config | Enabled by default in Sprint 5 | `AUTH-10` tests — HTTP 423 after 3 failed attempts |
| Language selector | UI feature flag | EN only active in Sprint 5 | Non-EN locales are disabled; do not test |

> **Note:** If `SPRINT` is set to a value other than `5`, Sprint 5 endpoints (e.g., `/postcode-lookup`, guest invoice, combination discount) will return 404 or behave unexpectedly. The CI workflow pins `SPRINT=5` via GitHub Actions secrets. Account locking tests must use a **freshly registered throwaway account** to avoid permanently locking the default `customer@` seed account.

---

## 2. Objectives

1. Validate all API endpoints behave according to the PRODUCT_SPEC.md requirements.
2. Validate all UI screens and user journeys work end-to-end in Chromium.
3. Verify role-based access control (anonymous, customer, admin) is enforced.
4. Detect regressions early via automated CI checks on every push.
5. Demonstrate senior QA skills: risk-based prioritisation, layered test strategy, and clean automation architecture.

---

## 3. Scope

### In Scope

| Layer | Coverage |
|-------|----------|
| REST API | All endpoints in PRODUCT_SPEC.md §6.1–§6.17 (17 functional domains) |
| GraphQL API | Product Comparison endpoint (`POST /graphql`) — §6.17 |
| UI | All screens in PRODUCT_SPEC.md §8.1–§8.14 (Chromium only), including Admin Dashboard and Chat Widget |
| RBAC | Anonymous / Customer / Admin enforcement, account locking (HTTP 423) |
| Negative | HTTP 401, 403, 404, 409, 422, 423 responses |
| Contract | Response schema shape (key fields), incl. discount fields in Cart/Invoice responses |
| Discounts | Geo-location discount (browser location mock) + combination discount (rental + non-rental cart) |

### Out of Scope

- Performance / load testing
- Security penetration testing
- Firefox / Safari / mobile viewports
- Social Login end-to-end OAuth flow (Google/GitHub popup — not automatable; redirect endpoint smoke-tested only)
- React Native mobile app internals

---

## 4. Impact Areas

Maps each functional domain to the test layer(s) covering it, its risk tier, and the PRODUCT_SPEC.md section from which its requirements are derived.

| Functional Area | Test Layer | Risk Tier | Spec § |
|-----------------|-----------|-----------|---------------|
| Authentication & Session | API + UI | 1 — Critical | §6.1 |
| Social Login (Google/GitHub) | API (smoke only) | 4 — Low | §6.1 / AUTH-09 |
| Account Locking + Disabled Accounts | API | 1 — Critical | §6.1 / AUTH-10 |
| User Management | API | 1 — Critical | §6.2 |
| Product Catalogue (read) | API + UI | 2 — High | §6.3 |
| Product Catalogue (write / admin) | API | 3 — Medium | §6.3 |
| Product Specifications | API | 3 — Medium | §6.4 |
| Brands | API | 3 — Medium | §6.5 |
| Categories | API | 3 — Medium | §6.6 |
| Cart (incl. combination discount) | API + UI | 1 — Critical | §6.7 |
| Checkout & Invoicing (incl. discount fields) | API + UI | 1 — Critical | §6.8 |
| Favourites | API + UI | 2 — High | §6.9 |
| Contact & Messaging | API + UI | 2 — High | §6.10 |
| Payment Validation | API | 1 — Critical | §6.11 |
| Postcode Lookup | API | 3 — Medium | §6.12 |
| Images | API | 4 — Low | §6.13 |
| Reports (Admin) | API | 3 — Medium | §6.14 |
| Rentals | API + UI | 3 — Medium | §6.15 |
| Discounts — Geo-Location | API + UI | 2 — High | §6.16.1 |
| Discounts — Combination (rental + non-rental) | API + UI | 2 — High | §6.16.2 |
| Product Comparison (GraphQL) | GraphQL + UI | 4 — Low | §6.17 |
| RBAC Enforcement | API + UI | 1–2 | §10 |
| Admin Dashboard UI (`/admin`) | UI (admin) | 3 — Medium | §8.11 |
| Rental Products Page (`/rentals`) | UI | 3 — Medium | §8.10 |
| Privacy Policy Page (`/privacy`) | UI | 4 — Low | §8.12 |
| Product Comparison Page (`/comparison`) | UI | 4 — Low | §8.13 |
| Chat Widget (global) | UI | 3 — Medium | §8.14 |

---

## 5. Test Approach

The Toolshop suite follows a **risk-based, layered, shift-left** methodology.

### 5.1 Guiding Principles

| Principle | How It Is Applied |
|-----------|-------------------|
| **Risk-based** | Tests are prioritised by business impact × failure probability (Tier 1–4). Tier 1 failures block release; lower tiers are tracked but do not block. |
| **Layered (API-first)** | API tests validate contracts and business rules first. UI tests confirm the end-to-end user journey, not re-verify API logic. |
| **Shift-left** | API tests run before UI tests in the Playwright project dependency graph; failures surface at the cheapest layer. |
| **Isolated fixtures** | Each test creates and owns its own data (unique emails, dedicated products). No shared mutable state between tests. |
| **Deterministic ordering** | Within a `test.describe` block, tests run sequentially (create → read → update → delete) to share lifecycle state safely. |
| **CI-gated quality** | No merge to `main` without a green pipeline. `forbidOnly` prevents `test.only` from silently narrowing coverage. |

### 5.2 Test Layers and Responsibilities

```
┌─────────────────────────────────────────────────────┐
│  UI E2E (Playwright – Chromium)                      │
│  Full user journeys: browse → cart → checkout        │
├─────────────────────────────────────────────────────┤
│  API Integration (Playwright APIRequestContext)      │
│  Endpoint contracts, RBAC, error responses           │
├─────────────────────────────────────────────────────┤
│  Setup / Auth Fixtures                               │
│  Token acquisition, customer registration            │
└─────────────────────────────────────────────────────┘
```

### 5.3 Execution Order

```
setup (register customer)
  └─> admin-setup (login admin)
        └─> api (all API specs, workers=1 on CI)
              └─> chromium (UI specs)
```

---

## 6. Test Types

| Test Type | Description | Primary Layer | Examples |
|-----------|-------------|--------------|---------|
| **Smoke** | Confirms the environment is reachable and the most critical path is operational | API + UI | `GET /brands → 200`, home page loads |
| **Functional — Happy Path** | Valid inputs produce the expected HTTP status code, response body, and data state | API + UI | `POST /auth/login` with valid creds → 200 + JWT |
| **Functional — Negative / Error Path** | Invalid, missing, or boundary-violating inputs produce the correct error code and message | API | Wrong password → 401; duplicate email → 422 |
| **Contract** | Response payloads contain all required fields with correct types; no unexpected schema drift | API | `GET /products` response has `id`, `name`, `price`, `in_stock` |
| **RBAC / Authorization** | Role-specific access control is enforced at every protected endpoint | API + UI | Customer token on `DELETE /users/{id}` → 403 |
| **End-to-End (E2E)** | A complete user journey is exercised from first interaction to final outcome | UI | Browse → add to cart → guest checkout → invoice created |
| **Regression** | Full suite re-run after any code change to detect unintended breakages | API + UI | Entire `npx playwright test` run on every PR |
| **Data-state** | Verifies that mutations (create, update, delete) persist correctly when re-read | API | `PUT /users/{id}` → `GET /users/{id}` reflects new values |

---

## 7. Risk-Based Test Priority

Tiers are assigned based on **business impact × failure probability**.

### Tier 1 — Critical (must pass before any release)

| Domain | Justification |
|--------|--------------|
| Authentication (AUTH) | Gate to all protected functionality |
| Account Locking — HTTP 423 (AUTH-10) | Security: locks out brute-force; wrong behaviour exposes or blocks real users |
| Disabled account enforcement (AUTH-10c) | Security: disabled users must not authenticate |
| Cart + Checkout flow (CART, INV) incl. discount fields | Core revenue path; discount miscalculation = revenue loss |
| Payment validation (PAY) | Financial risk |
| User management — delete (USR-07) | Data integrity |

### Tier 2 — High (must pass before release)

| Domain | Justification |
|--------|--------------|
| Product catalogue — read (PROD-01–04) | Primary shopping experience |
| Geo-location discount (DISC-01–03) | Directly affects price shown to customer; wrong discount = trust loss |
| Combination discount — rental + non-rental (DISC-04–06) | Affects cart total and invoice; revenue + customer trust impact |
| Favourites (FAV) | Key customer engagement feature |
| Contact / Messages — send (MSG-01) | Customer support channel |
| RBAC enforcement (NFR-02, NFR-03) | Security |

### Tier 3 — Medium (pass before sprint end)

| Domain | Justification |
|--------|--------------|
| Brand + Category CRUD | Catalogue management; admin use only |
| Product CRUD — write (PROD-05–08) | Admin use only |
| Product Specs CRUD | Admin use only |
| Invoice admin operations (INV-06–10) | Admin use only |
| Reports (RPT) | Reporting; no customer impact |
| Postcode lookup (POST) | Convenience feature |
| Rentals — API + UI (RENT-01–05) | New product type; customer-facing but isolated flow |
| Admin Dashboard UI (`/admin`) | Admin-only; CRUD + order status; UI layer only |
| Chat Widget — all flows (UI-CHAT-01–06) | Alternative purchase path; customer-facing but non-critical |
| Rental Products Page (`/rentals`) | Customer-facing page; depends on RENT API tests |

### Tier 4 — Low (nice-to-have)

| Domain | Justification |
|--------|--------------|
| Images (IMG) | Static reference data |
| TOTP setup + verify | Optional second factor; restricted on default accounts |
| Token refresh (AUTH-05) | Session management |
| Social Login — smoke only (AUTH-09) | OAuth popup not automatable; redirect smoke check only |
| Product Comparison — GraphQL (CMP-01–03) | GraphQL endpoint; nice-to-have comparison feature |
| Product Comparison Page (`/comparison`) | Depends on GraphQL API test |
| Privacy Policy Page (`/privacy`) | Static content; low defect risk |

---

## 8. Test Strategy

### 8.1 API Testing

Each API test file covers one domain. Tests inside a `test.describe` block run **sequentially** (ordered) to share state across a lifecycle (create → read → update → delete).

**Test types per endpoint:**

| Type | What it checks |
|------|----------------|
| Happy path | Valid inputs → expected 2xx status + response shape |
| Negative — auth | Missing/invalid token → 401 |
| Negative — auth role | Customer token on admin endpoint → 403 |
| Negative — not found | Non-existent ID → 404 |
| Negative — validation | Missing/invalid body fields → 422 |
| Negative — conflict | Duplicate creation → 409 |

**Architecture conventions:**
- Route constants: `src/routes/<domain>.routes.ts`
- Test data: `src/data/<domain>.data.ts`
- Spec files: `tests/api/<domain>.api.spec.ts`
- GraphQL spec: `tests/api/comparison.graphql.spec.ts` (uses `request.post('/graphql')` with JSON body)
- Tokens/IDs shared via `beforeAll` (login inline; read `.auth/*.json`)
- Every `expect()` carries a descriptive message
- Every logical step uses `test.step()`
- Every test has a `@TAG` annotation (e.g., `@BRAND-T001`)
- Account-locking tests use a **unique throwaway account** created per test run to avoid locking the shared seed account

### 8.2 UI Testing

UI tests run under the `chromium` Playwright project. They test complete user journeys (not individual components).

**Key journeys:**

| File | Journey | Auth state |
|------|---------|-----------|
| `product-listing.ui.spec.ts` | Filter, search, paginate products; discount badge on product card | Anonymous |
| `product-detail.ui.spec.ts` | View product, add to cart, add to favourites; discount price display; rental duration slider | Customer (storage state) |
| `checkout.ui.spec.ts` | Add to cart → checkout → payment; rental label; combination discount display | Customer |
| `favorites.ui.spec.ts` | View and remove favourites | Customer |
| `profile.ui.spec.ts` | Update profile, change password | Customer |
| `rentals.ui.spec.ts` | Browse `/rentals` page; select duration; add rental to cart | Anonymous / Customer |
| `discount.ui.spec.ts` | Geo-location discount (mocked location); combination discount with rental + non-rental cart | Customer |
| `admin.ui.spec.ts` | Login → Dashboard; CRUD product; update order status; enable/disable user; reply to message | Admin |
| `chat.ui.spec.ts` | Chat widget: Find Product; Order Product; guest Checkout flow; Support message | Anonymous / Customer |
| `comparison.ui.spec.ts` | Add products to compare; view `/comparison` page; differences-only toggle | Anonymous |

**Selectors strategy:** prefer `data-testid` > ARIA roles > visible text > CSS (in that order).

**Assertions:** verify text content, URL, toast messages, and API side-effects (via request interception where appropriate).

### 8.3 RBAC Matrix

| Endpoint type | Anonymous | Customer | Admin |
|--------------|-----------|----------|-------|
| Read public (products, brands, categories, rentals) | ✅ | ✅ | ✅ |
| Read protected (cart, favourites, profile) | ❌ 401 | ✅ | ✅ |
| Write own data (profile, cart, favourites) | ❌ 401 | ✅ | ✅ |
| Write others' data | ❌ 401 | ❌ 403 | ✅ |
| Admin CRUD (delete product, user, brand) | ❌ 401 | ❌ 403 | ✅ |
| Reports | ❌ 401 | ❌ 403 | ✅ |
| Account locking (3 failed logins) | ❌ 423 | ❌ 423 | ✅ (exempt) |
| Disabled account login | ❌ 401 | ❌ 401 | N/A |
| Admin Dashboard UI (`/admin/*`) | ❌ redirect | ❌ 403 | ✅ |
| GraphQL product comparison | ✅ | ✅ | ✅ |

---

## 9. Test Environment

| Item | Value |
|------|-------|
| API base URL | `https://api.practicesoftwaretesting.com` |
| UI base URL | `https://practicesoftwaretesting.com` |
| Admin credentials | `admin@practicesoftwaretesting.com` / `welcome01` (via `.env`) |
| Customer credentials | Dynamically registered per test run via `auth.setup.ts` |
| `.env` file | Required locally; GitHub Actions secrets for CI |
| Playwright version | As per `package.json` |
| Node version | ≥18 |

---

## 10. Entry Criteria

- [ ] `.env` is populated with `API_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- [ ] `npm install` completed; `node_modules` present
- [ ] API is reachable (`GET /brands` returns 200)
- [ ] UI is reachable (`https://practicesoftwaretesting.com` loads)

---

## 11. Exit Criteria

- [ ] All Tier 1 tests pass with 0 failures
- [ ] All Tier 2 tests pass with 0 failures
- [ ] Tier 3 tests pass or known failures are documented
- [ ] HTML report generated and reviewed
- [ ] No `test.only` left in codebase (enforced by `forbidOnly` on CI)

---

## 12. Milestones & High-Level Estimation

Estimation is in **person-days** assuming one senior QA engineer. Dates are relative to project kick-off (Week 1 = week of 2026-04-23).

> **Scope change note (v1.1):** The product spec was updated to add 3 new API domains (Rentals, Discounts, GraphQL Comparison), 2 new Tier 1 auth scenarios (account locking, disabled accounts), 5 new UI journeys, and discount fields across Cart/Invoice. Estimation has been revised accordingly (+7 days vs v1.0).

| # | Milestone | Deliverable | Effort (days) | Target Week |
|---|-----------|-------------|--------------|-------------|
| M1 | Test Plan v1.1 signed off | Approved `TEST_PLAN.md`; `TEST_CASES.md` skeleton updated | 0.5 | Week 1 |
| M2 | Tier 1 API suite complete | AUTH (incl. account locking HTTP 423, disabled accounts), CART (incl. discount fields), PAY, USR specs passing in CI | 4 | Week 2 |
| M3 | Tier 2 API suite complete | PROD (read), DISC (geo-location + combination), FAV, MSG, RBAC specs passing | 3 | Week 2–3 |
| M4 | Tier 3 API suite complete | BRAND, CAT, PROD-write, INV-admin, RPT, POST, RENT specs | 3 | Week 3 |
| M5 | Tier 4 API suite complete | IMG, TOTP, Token refresh, GraphQL CMP spec | 2 | Week 3–4 |
| M6 | UI E2E suite — Tier 1 & 2 journeys | product-listing, product-detail, checkout (incl. rental + discount), favorites, profile, discount | 4 | Week 4 |
| M7 | UI E2E suite — Tier 3 & 4 journeys | rentals, admin dashboard, chat widget, comparison, privacy | 4 | Week 5 |
| M8 | CI pipeline integrated | GitHub Actions workflow green; HTML report published; `GRAPHQL_URL` secret added | 1 | Week 5 |
| M9 | Full regression green + exit criteria met | All tiers verified; no `test.only`; sign-off document | 1 | Week 6 |

**Total:** ~22.5 person-days (~4.5 two-week sprints, or ~3 sprints with 2 QA engineers in parallel from M4)

### Estimation Assumptions

- REST API suite averages **8–12 tests per domain** (happy path + negatives + RBAC); account-locking suite needs throwaway account per run (+0.5 days setup).
- Discount tests require Playwright `geolocation` context override for geo-location discount; combination discount uses standard cart API calls.
- GraphQL spec uses `request.post('/graphql')` with JSON body — no special library needed (+0.5 days vs REST domain).
- UI suite averages **6–10 assertions per journey**; chat widget and admin dashboard are the most complex (+1 day each vs a standard journey).
- CI setup adds `GRAPHQL_URL` secret and no other greenfield DevOps work (~0.5 days delta).
- Ramp-up / context-switching time (~15 %) is embedded in individual milestone estimates.
- Social login is **not** fully automated (OAuth popup): only the redirect initiation endpoint is smoke-checked in M4 (-1 day vs full automation).
- Any blocker (environment outage, spec ambiguity) may shift M4–M7 by ±1 day; escalate after 2-day outage.

---

## 13. Defect Classification

| Severity | Description | Example |
|----------|-------------|---------|
| **Critical** | Blocks a user from completing a purchase | Login always returns 401 |
| **High** | Core feature broken for a role | Cart total calculated wrong |
| **Medium** | Degraded experience or admin feature broken | Search returns wrong results |
| **Low** | Cosmetic / edge case | Spec table missing one field |

---

## 14. CI Pipeline

**File:** `.github/workflows/playwright.yml`

**Trigger:** push to any branch + pull request  
**Steps:**
1. `npm ci`
2. `npx playwright install --with-deps chromium`
3. Set `API_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` from GitHub secrets
4. `npx playwright test`
5. Upload HTML report as artifact

**Configuration:** `workers: 1` on CI (`process.env.CI`), `retries: 2`

---

## 15. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Shared test data mutated by parallel tests | Medium | High | Sequential tests in each describe block; unique emails per run |
| API rate limiting | Low | Medium | Single worker on CI; delays if needed |
| Flaky UI tests due to animation/async | Medium | Medium | Use `waitFor` / `toBeVisible` with timeout; avoid hard sleeps |
| Admin deletes shared product used in other tests | Low | High | Each test creates its own fixture data |
| `.auth/*.json` not written before spec runs | Low | High | `dependencies` config in `playwright.config.ts` |
| Environment outage shifts M4–M7 | Low | Medium | Milestone estimates include 15 % buffer; escalate after 2-day outage |
| Account-locking test permanently locks shared seed account | High | High | Use a throwaway account registered per test run; never run locking tests against `customer@` seed |
| Geo-location discount not triggering (browser permission denied) | Medium | High | Override via Playwright `geolocation` context option in `playwright.config.ts`; assert discount via API response, not just UI |
| Social Login OAuth popup cannot be automated end-to-end | High | Low | Agreed out-of-scope (popup flow); smoke-test redirect initiation only |
| GraphQL schema changes break comparison tests | Low | Medium | Pin expected fields in contract assertion; run GraphQL spec in CI same as REST |
| Chat widget state reset between chat flows causes flakiness | Medium | Medium | Reset chat state by closing and reopening widget between each flow; use explicit `waitForSelector` on chat window |
| Admin Dashboard lazy-loading causes UI test timeout | Low | Medium | Increase `actionTimeout` for admin spec; wait for dashboard chart element before proceeding |
