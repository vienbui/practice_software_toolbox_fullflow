# Toolshop — Test Plan

**Version:** 1.0  
**Date:** 2026-04-23  
**Project:** Toolshop API + UI Automation  
**Reference:** [PRD.md](./PRD.md)  
**Tool:** Playwright v1.x + TypeScript  
**Environment:** `https://api.practicesoftwaretesting.com` / `https://practicesoftwaretesting.com`

---

## 1. Objectives

1. Validate all API endpoints behave according to the PRD requirements.
2. Validate all UI screens and user journeys work end-to-end in Chromium.
3. Verify role-based access control (anonymous, customer, admin) is enforced.
4. Detect regressions early via automated CI checks on every push.
5. Demonstrate senior QA skills: risk-based prioritisation, layered test strategy, and clean automation architecture.

---

## 2. Scope

### In Scope

| Layer | Coverage |
|-------|----------|
| API | All endpoints in PRD sections 3.1–3.14 |
| UI | All screens in PRD section 4 (Chromium only) |
| RBAC | Anonymous / Customer / Admin enforcement |
| Negative | HTTP 401, 403, 404, 409, 422 responses |
| Contract | Response schema shape (key fields) |

### Out of Scope

- Performance / load testing
- Security penetration testing
- Firefox / Safari / mobile viewports
- Admin-only management UI

---

## 3. Risk-Based Test Priority

Tiers are assigned based on **business impact × failure probability**.

### Tier 1 — Critical (must pass before any release)

| Domain | Justification |
|--------|--------------|
| Authentication (AUTH) | Gate to all protected functionality |
| Cart + Checkout flow (CART, INV) | Core revenue path; failure means no sales |
| Payment validation (PAY) | Financial risk |
| User management — delete (USR-07) | Data integrity |

### Tier 2 — High (must pass before release)

| Domain | Justification |
|--------|--------------|
| Product catalogue — read (PROD-01–04) | Primary shopping experience |
| Favourites (FAV) | Key customer engagement feature |
| Contact / Messages — send (MSG-01) | Customer support channel |
| RBAC enforcement (AUTH-10, NFR-02, NFR-03) | Security |

### Tier 3 — Medium (pass before sprint end)

| Domain | Justification |
|--------|--------------|
| Brand + Category CRUD | Catalogue management; admin use only |
| Product CRUD — write (PROD-05–08) | Admin use only |
| Product Specs CRUD | Admin use only |
| Invoice admin operations (INV-06–10) | Admin use only |
| Reports (RPT) | Reporting; no customer impact |
| Postcode lookup (POST) | Convenience feature |

### Tier 4 — Low (nice-to-have)

| Domain | Justification |
|--------|--------------|
| Images (IMG) | Static reference data |
| TOTP setup + verify (AUTH-09) | Optional security feature |
| Token refresh (AUTH-05) | Session management |

---

## 4. Test Strategy

### 4.1 API Testing

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
- Tokens/IDs shared via `beforeAll` (login inline; read `.auth/*.json`)
- Every `expect()` carries a descriptive message
- Every logical step uses `test.step()`
- Every test has a `@TAG` annotation (e.g., `@BRAND-T001`)

### 4.2 UI Testing

UI tests run under the `chromium` Playwright project. They test complete user journeys (not individual components).

**Key journeys:**

| File | Journey | Auth state |
|------|---------|-----------|
| `product-listing.ui.spec.ts` | Filter, search, paginate products | Anonymous |
| `product-detail.ui.spec.ts` | View product, add to cart, add to favourites | Customer (storage state) |
| `checkout.ui.spec.ts` | Add to cart → checkout → payment | Customer |
| `favorites.ui.spec.ts` | View and remove favourites | Customer |
| `profile.ui.spec.ts` | Update profile, change password | Customer |

**Selectors strategy:** prefer `data-testid` > ARIA roles > visible text > CSS (in that order).

**Assertions:** verify text content, URL, toast messages, and API side-effects (via request interception where appropriate).

### 4.3 RBAC Matrix

| Endpoint type | Anonymous | Customer | Admin |
|--------------|-----------|----------|-------|
| Read public (products, brands, categories) | ✅ | ✅ | ✅ |
| Read protected (cart, favourites, profile) | ❌ 401 | ✅ | ✅ |
| Write own data (profile, cart, favourites) | ❌ 401 | ✅ | ✅ |
| Write others' data | ❌ 401 | ❌ 403 | ✅ |
| Admin CRUD (delete product, user, brand) | ❌ 401 | ❌ 403 | ✅ |
| Reports | ❌ 401 | ❌ 403 | ✅ |

---

## 5. Test Environment

| Item | Value |
|------|-------|
| API base URL | `https://api.practicesoftwaretesting.com` |
| UI base URL | `https://practicesoftwaretesting.com` |
| Admin credentials | `admin@practicesoftwaretesting.com` / `welcome01` (via `.env`) |
| Customer credentials | Dynamically registered per test run via `auth.setup.ts` |
| `.env` file | Required locally; GitHub Actions secrets for CI |
| Playwright version | As per `package.json` |
| Node version | ≥18 |

**Setup execution order:**
```
setup (register customer)
  └─> admin-setup (login admin)
        └─> api (all API specs, parallel workers=1 on CI)
              └─> chromium (UI specs)
```

---

## 6. Entry Criteria

- [ ] `.env` is populated with `API_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- [ ] `npm install` completed; `node_modules` present
- [ ] API is reachable (`GET /brands` returns 200)
- [ ] UI is reachable (`https://practicesoftwaretesting.com` loads)

---

## 7. Exit Criteria

- [ ] All Tier 1 tests pass with 0 failures
- [ ] All Tier 2 tests pass with 0 failures
- [ ] Tier 3 tests pass or known failures are documented
- [ ] HTML report generated and reviewed
- [ ] No `test.only` left in codebase (enforced by `forbidOnly` on CI)

---

## 8. Defect Classification

| Severity | Description | Example |
|----------|-------------|---------|
| **Critical** | Blocks a user from completing a purchase | Login always returns 401 |
| **High** | Core feature broken for a role | Cart total calculated wrong |
| **Medium** | Degraded experience or admin feature broken | Search returns wrong results |
| **Low** | Cosmetic / edge case | Spec table missing one field |

---

## 9. CI Pipeline

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

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Shared test data mutated by parallel tests | Medium | High | Sequential tests in each describe block; unique emails per run |
| API rate limiting | Low | Medium | Single worker on CI; delays if needed |
| Flaky UI tests due to animation/async | Medium | Medium | Use `waitFor` / `toBeVisible` with timeout; avoid hard sleeps |
| Admin deletes shared product used in other tests | Low | High | Each test creates its own fixture data |
| `.auth/*.json` not written before spec runs | Low | High | `dependencies` config in `playwright.config.ts` |
