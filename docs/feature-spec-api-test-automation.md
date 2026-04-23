# Feature Spec: API Test Automation Suite — Practice Software Testing Platform

**Document type:** Feature Specification  
**Status:** Draft  
**Author:** PM (Product / QA Engineering)  
**Last updated:** 2026-04-23  
**Version:** 1.0  
**Target release:** Sprint 5 coverage — Full flow  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Background & Context](#2-background--context)
3. [Problem Statement](#3-problem-statement)
4. [Goals & Non-Goals](#4-goals--non-goals)
5. [Actors & Stakeholders](#5-actors--stakeholders)
6. [User Stories](#6-user-stories)
7. [Functional Requirements & Acceptance Criteria](#7-functional-requirements--acceptance-criteria)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Technical Constraints & Assumptions](#9-technical-constraints--assumptions)
10. [Dependencies](#10-dependencies)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Success Metrics](#12-success-metrics)
13. [Out of Scope](#13-out-of-scope)
14. [Open Questions](#14-open-questions)
15. [Appendix — API Reference](#15-appendix--api-reference)

---

## 1. Executive Summary

**PW_ToolBox_FullFlow** is a Playwright-based end-to-end API test automation suite targeting the **Practice Software Testing** platform (Sprint 5 — `https://api.practicesoftwaretesting.com`). The suite validates the complete user lifecycle and authentication flows through the REST API.

The goal of this spec is to define the full scope, requirements, and acceptance criteria for building a production-quality, maintainable, and CI-ready automation suite that covers all `/users` API endpoints, authentication setup, and teardown lifecycle — as the foundation for a broader test toolbox covering the entire platform surface.

---

## 2. Background & Context

### 2.1 Target System

The **Practice Software Testing** platform (`practicesoftwaretesting.com`) is a full-stack e-commerce-style application used for practising software testing. It exposes:
- A **Laravel REST API** (`api.practicesoftwaretesting.com`) with Swagger documentation
- An **Angular frontend** (`practicesoftwaretesting.com`)
- A **Swagger UI** for API exploration (`/api/documentation`)

The platform offers multiple sprints (Sprint 1–5), each adding feature complexity. This automation suite targets **Sprint 5** — the most complete and stable version.

### 2.2 Current State

The repository (`PW_ToolBox_FullFlow`) currently contains:

| File | Purpose | Status |
|---|---|---|
| `tests/setup/auth.setup.ts` | Register a new user, save credentials to `.auth/user.json` | Implemented |
| `tests/setup/admin.auth.setup.ts` | Login as admin, save token to `.auth/admin_token.json` | Implemented |
| `tests/api/auth.api.spec.ts` | Login with user credentials, save token to `.auth/token.json` | Implemented (basic) |
| `tests/api/user.api.spec.ts` | Get all users, get specific user, delete user | Partial — 3 of 11 endpoints |
| `src/routes/user.routes.ts` | Route constants for user endpoints | Partial — 4 of 9 routes |
| `src/data/user.data.ts` | Test data: register/login/admin payloads | Implemented |
| `playwright.config.ts` | Project config: setup → api → ui pipeline | Implemented |

**Gap:** Only 3 of 11 `/users` API endpoints are covered. The full lifecycle — update, patch, search, refresh token, change password, forgot password, logout, delete — is missing test coverage and route constants.

### 2.3 Why This Matters

Without complete API test coverage:
- Regression defects on user management go undetected until manual testing
- The CI pipeline (`playwright.yml`) cannot serve as a quality gate
- Test data left behind (registered users not deleted) pollutes the shared environment between runs
- Shared-state issues (token reading order between parallel specs) cause intermittent failures

---

## 3. Problem Statement

> The current test suite covers only 27% of the `/users` API surface. Test data is not cleaned up reliably. Token sharing between parallel test files creates race conditions. Route constants are incomplete, causing test files to hard-code URL paths.

**We need** a complete, deterministic, idempotent test suite for the `/users` API that:
1. Covers 100% of documented user API endpoints
2. Manages its own test data (create → validate → destroy within each run)
3. Runs reliably in both local and CI environments without state leakage
4. Is easy to extend as new endpoints are added to the platform

---

## 4. Goals & Non-Goals

### Goals

| # | Goal |
|---|---|
| G1 | Cover all 11 `/users` API endpoints with automated assertions |
| G2 | Ensure test data (registered user) is created before tests and destroyed after |
| G3 | Eliminate token race conditions between parallel test files |
| G4 | Complete route constants in `user.routes.ts` so no test hard-codes a URL path |
| G5 | All tests are tagged, descriptive, and pass with a single `npm test` or `npm run test:api` |
| G6 | CI pipeline (`playwright.yml`) runs green on every push to main |
| G7 | Test output (HTML report) captures pass/fail state and request/response context |

### Non-Goals

| # | Non-Goal | Reason |
|---|---|---|
| NG1 | UI (browser) test coverage | Separate project phase; UI tests are scaffolded but not in scope |
| NG2 | Sprint 1–4 API coverage | Suite targets Sprint 5 only |
| NG3 | Performance / load testing | Out of scope for this functional test pass |
| NG4 | Contract (Pact) testing | Deferred to a future sprint |
| NG5 | Security / penetration testing | Out of scope; handled by separate tooling |
| NG6 | Mobile app testing | Not in scope for this automation suite |
| NG7 | Cross-browser UI testing (Firefox, Safari) | Commented out in config; deferred |

---

## 5. Actors & Stakeholders

| Actor | Role | Interest |
|---|---|---|
| **QA Engineer** | Primary user of this suite | Runs tests, extends coverage, reviews reports |
| **Dev Team** | Consumers of test results | Relies on suite as regression safety net |
| **CI/CD Pipeline** | GitHub Actions runner | Executes suite on every push; blocks merge on failure |
| **Admin user** (`admin@practicesoftwaretesting.com`) | System actor used in tests | Provides elevated access for admin-only endpoints |
| **Test user** (dynamically registered) | Ephemeral actor created per run | Represents a regular customer role |
| **Practice Software Testing API** | External system under test | Source of truth for all assertions |

---

## 6. User Stories

### Story 1 — Complete User API Coverage

> **As a QA engineer,**  
> **I want** all 11 `/users` API endpoints to have automated tests,  
> **So that** I can detect regressions across the full user management surface without manual verification.

**Acceptance criteria:** See [Section 7.1](#71-user-api-test-suite-usrt001--usrt011).

---

### Story 2 — Self-Contained Test Data Lifecycle

> **As a QA engineer,**  
> **I want** the test suite to register a fresh user before tests run and delete that user after,  
> **So that** each run is isolated, the shared environment stays clean, and tests never depend on pre-existing data.

**Acceptance criteria:** See [Section 7.2](#72-test-data-lifecycle).

---

### Story 3 — Reliable Token Management

> **As a QA engineer,**  
> **I want** each test spec to acquire its own tokens in `beforeAll` rather than reading from files written by other specs,  
> **So that** specs running in parallel (different Playwright workers) don't encounter token-not-found or stale-token errors.

**Acceptance criteria:** See [Section 7.3](#73-token-management).

---

### Story 4 — Centralised Route Constants

> **As a QA engineer,**  
> **I want** all API endpoint paths to be defined in `src/routes/user.routes.ts`,  
> **So that** if an endpoint path changes, I update it in one place only, not across every test file.

**Acceptance criteria:** See [Section 7.4](#74-route-constants).

---

### Story 5 — CI-Green Pipeline

> **As a developer or QA engineer,**  
> **I want** `npm test` (or the GitHub Actions workflow) to run the full suite and report pass/fail clearly,  
> **So that** broken builds are caught before merging and the pipeline serves as a true quality gate.

**Acceptance criteria:** See [Section 7.5](#75-ci-pipeline).

---

## 7. Functional Requirements & Acceptance Criteria

### 7.1 User API Test Suite (@USR-T001 – @USR-T011)

The file `tests/api/user.api.spec.ts` MUST implement the following tests in order inside a single `test.describe` block with `fullySerial` execution.

---

#### @USR-T001 — Get All Users

**Endpoint:** `GET /users`  
**Auth:** Admin token  
**Description:** Verify that an admin can retrieve a paginated list of all users.

| # | Assertion | Expected |
|---|---|---|
| 1 | HTTP status | `200` |
| 2 | Response body has `data` field | defined |
| 3 | `body.data` is an Array | `true` |
| 4 | `body.data.length` is greater than 0 | `>= 1` |

**Given** a valid admin token  
**When** `GET /users` is called  
**Then** the response status is 200 and `body.data` is a non-empty array

---

#### @USR-T002 — Get Current User

**Endpoint:** `GET /users/me`  
**Auth:** User token  
**Description:** Verify that the authenticated user can retrieve their own profile.

| # | Assertion | Expected |
|---|---|---|
| 1 | HTTP status | `200` |
| 2 | `body.email` | equals `userEmail` (from registration) |
| 3 | `body.id` | equals `userId` (from registration) |
| 4 | `body.first_name` | defined and not empty |

**Given** a valid user access token  
**When** `GET /users/me` is called  
**Then** the response matches the registered user's profile

---

#### @USR-T003 — Get User by ID

**Endpoint:** `GET /users/{userId}`  
**Auth:** Admin token  
**Description:** Verify that an admin can retrieve any user's profile by their ID.

| # | Assertion | Expected |
|---|---|---|
| 1 | HTTP status | `200` |
| 2 | `body.id` | equals `userId` |
| 3 | `body.email` | equals `userEmail` |

**Given** a valid admin token and a known `userId`  
**When** `GET /users/{userId}` is called  
**Then** the correct user profile is returned

---

#### @USR-T004 — Full Update User (PUT)

**Endpoint:** `PUT /users/{userId}`  
**Auth:** User token  
**Description:** Verify that the authenticated user can fully replace their profile fields.

**Step A — Send update**

| Field | Value |
|---|---|
| `first_name` | `UpdatedFirst` |
| `last_name` | `UpdatedLast` |
| `address.street` | `Updated Street 99` |
| `address.city` | `Updated City` |
| `address.state` | `Updated State` |
| `address.country` | `Updated Country` |
| `address.postal_code` | `9999ZZ` |
| `phone` | `0111222333` |
| `dob` | `1985-06-15` |

| # | Assertion | Expected |
|---|---|---|
| 1 | HTTP status | `200` |

**Step B — Verify update**

| # | Assertion | Expected |
|---|---|---|
| 1 | HTTP status of `GET /users/me` | `200` |
| 2 | `body.first_name` | `UpdatedFirst` |
| 3 | `body.last_name` | `UpdatedLast` |

**Given** a valid user token  
**When** `PUT /users/{userId}` is called with full profile payload  
**Then** the profile is updated and a subsequent GET reflects the new values

---

#### @USR-T005 — Partial Update User (PATCH)

**Endpoint:** `PATCH /users/{userId}`  
**Auth:** User token  
**Description:** Verify that the user can partially update a single field without affecting others.

**Step A — Send patch**

| Field | Value |
|---|---|
| `first_name` | `PatchedFirst` |

| # | Assertion | Expected |
|---|---|---|
| 1 | HTTP status | `200` |

**Step B — Verify patch**

| # | Assertion | Expected |
|---|---|---|
| 1 | `body.first_name` from `GET /users/me` | `PatchedFirst` |
| 2 | `body.last_name` is unchanged | equals value from T004 |

**Given** a valid user token  
**When** `PATCH /users/{userId}` is called with only `first_name`  
**Then** only `first_name` changes; all other fields remain as set by T004

---

#### @USR-T006 — Search Users

**Endpoint:** `GET /users/search?q={query}`  
**Auth:** Admin token  
**Description:** Verify that admin can search users by email query string.

| # | Assertion | Expected |
|---|---|---|
| 1 | HTTP status | `200` |
| 2 | Response body is defined | `true` |
| 3 | At least one result contains `email` matching the search query | `true` |

**Given** a valid admin token and the registered user's email  
**When** `GET /users/search?q={encodeURIComponent(userEmail)}` is called  
**Then** the response includes a result matching that email

---

#### @USR-T007 — Refresh Token

**Endpoint:** `GET /users/refresh`  
**Auth:** User token (current)  
**Description:** Verify that the user can exchange a valid token for a new one.

| # | Assertion | Expected |
|---|---|---|
| 1 | HTTP status | `200` |
| 2 | `body.access_token` | defined and non-empty |
| 3 | `body.access_token` differs from current `access_token` | `true` |

**Post-condition:** The suite-level `access_token` variable is updated to the new token. All subsequent tests MUST use this refreshed token.

**Given** a valid user token  
**When** `GET /users/refresh` is called  
**Then** a new valid token is returned and saved for subsequent tests

---

#### @USR-T008 — Change Password

**Endpoint:** `POST /users/change-password`  
**Auth:** User token  
**Description:** Verify that the user can change their password and that the original password is restored so subsequent runs succeed.

**Step A — Change password**

| Field | Value |
|---|---|
| `current_password` | `userPassword` (from registration) |
| `new_password` | `NewSecure@456` |
| `new_password_confirmation` | `NewSecure@456` |

| # | Assertion | Expected |
|---|---|---|
| 1 | HTTP status | `200` |

**Step B — Restore original password** *(idempotency requirement)*

Sub-steps:
1. `POST /users/login` with `new_password` → extract `tempToken`
2. `POST /users/change-password` with `tempToken`, changing back to `userPassword`

| # | Assertion | Expected |
|---|---|---|
| 1 | Login with new password HTTP status | `200` |
| 2 | Restore HTTP status | `200` |

**Given** the user knows their current password  
**When** password is changed and then restored  
**Then** both operations succeed and the suite is idempotent across multiple runs

---

#### @USR-T009 — Forgot Password

**Endpoint:** `POST /users/forgot-password`  
**Auth:** None (public endpoint)  
**Description:** Verify that the forgot-password flow accepts a valid email without authentication.

| # | Assertion | Expected |
|---|---|---|
| 1 | HTTP status | `200` |

**Given** no Authorization header  
**When** `POST /users/forgot-password` is called with a valid email  
**Then** the server accepts the request and returns 200

> Note: Email delivery is not asserted (no mailcatcher in CI). Only the HTTP response is verified.

---

#### @USR-T010 — Logout

**Endpoint:** `GET /users/logout`  
**Auth:** User token  
**Description:** Verify that the user can invalidate their session token.

| # | Assertion | Expected |
|---|---|---|
| 1 | HTTP status | `200` |

**Ordering constraint:** This test MUST execute before @USR-T011. After logout, the user token is invalidated. The admin token (used in T011) is unaffected.

**Given** a valid user token  
**When** `GET /users/logout` is called  
**Then** the session is invalidated and 200 is returned

---

#### @USR-T011 — Delete User *(always last)*

**Endpoint:** `DELETE /users/{userId}`  
**Auth:** Admin token  
**Description:** Verify that an admin can delete a user by ID. This is the teardown step — it MUST run last.

| # | Assertion | Expected |
|---|---|---|
| 1 | HTTP status | `204` |

**Ordering constraint:** This MUST be the final test in the describe block. Any test after this that reads `userId` will fail because the user no longer exists.

**Given** a valid admin token and a known `userId`  
**When** `DELETE /users/{userId}` is called  
**Then** the user is deleted and 204 No Content is returned

---

### 7.2 Test Data Lifecycle

| Requirement | Detail |
|---|---|
| **REQ-DL-01** | `tests/setup/auth.setup.ts` MUST register a fresh user before any API tests run |
| **REQ-DL-02** | Registration uses a timestamped email (`test-{Date.now()}@example.com`) to avoid collisions |
| **REQ-DL-03** | After registration, `email`, `password`, and `id` MUST be written to `.auth/user.json` |
| **REQ-DL-04** | `@USR-T011` (Delete) MUST always run as the final test, cleaning up the registered user |
| **REQ-DL-05** | If `@USR-T011` is skipped or fails, a manual cleanup command must be documented |
| **REQ-DL-06** | `.auth/` directory MUST be in `.gitignore` to prevent credentials from being committed |

**Acceptance criteria:**  
- Given `npm test` is run twice consecutively  
- When the suite completes both runs  
- Then the second run creates a new user and has no collisions or stale-data failures

---

### 7.3 Token Management

| Requirement | Detail |
|---|---|
| **REQ-TK-01** | `user.api.spec.ts` MUST acquire its own `access_token` via `POST /users/login` inside `beforeAll` — NOT by reading `token.json` written by `auth.api.spec.ts` |
| **REQ-TK-02** | Reason: `auth.api.spec.ts` and `user.api.spec.ts` run on different Playwright workers; `token.json` may not yet exist when `user.api.spec.ts` starts |
| **REQ-TK-03** | `admin_token` MUST be read from `.auth/admin_token.json` (written by `admin-setup` project, which is a declared dependency) |
| **REQ-TK-04** | After `@USR-T007` (Refresh), the suite-level `access_token` variable MUST be updated to the new token |
| **REQ-TK-05** | After `@USR-T010` (Logout), the user token is invalidated; no subsequent test should use it |

**Acceptance criteria:**  
- Given `user.api.spec.ts` runs without `auth.api.spec.ts` having previously written `token.json`  
- When `beforeAll` executes  
- Then it successfully logs in and sets `access_token` from the login response

---

### 7.4 Route Constants

The file `src/routes/user.routes.ts` MUST export all 9 route keys required by the test suite:

| Key | Value | Used by |
|---|---|---|
| `registry` | `users/register` | auth.setup.ts |
| `login` | `users/login` | auth.setup.ts, admin.auth.setup.ts, user.api.spec.ts (beforeAll, T008) |
| `forgotPassword` | `users/forgot-password` | user.api.spec.ts (T009) |
| `changePassword` | `users/change-password` | user.api.spec.ts (T008) |
| `getUser` | `users/me` | user.api.spec.ts (T002, T004 verify, T005 verify) |
| `logout` | `users/logout` | user.api.spec.ts (T010) |
| `refresh` | `users/refresh` | user.api.spec.ts (T007) |
| `searchUsers` | `users/search` | user.api.spec.ts (T006) |
| `getAllUsers` | `users` | user.api.spec.ts (T001) |

**REQ-RT-01:** No test file MAY hard-code a URL path string directly. All paths MUST reference `userRoutes.*`.  
**REQ-RT-02:** Dynamic segments (e.g., `users/{id}`) are assembled in the test using template literals: `` `${userRoutes.getAllUsers}/${userId}` ``

**Acceptance criteria:**  
- Given `src/routes/user.routes.ts` is updated  
- When any endpoint path is renamed on the server  
- Then updating a single key in `userRoutes` is sufficient to fix all tests referencing that endpoint

---

### 7.5 CI Pipeline

| Requirement | Detail |
|---|---|
| **REQ-CI-01** | `.github/workflows/playwright.yml` MUST run the full suite on every push and pull request |
| **REQ-CI-02** | CI MUST run `setup` and `admin-setup` projects before `api` tests (via `dependencies`) |
| **REQ-CI-03** | `workers: 1` on CI to prevent parallel workers from causing file-system race conditions on `.auth/*.json` |
| **REQ-CI-04** | `retries: 2` on CI to handle transient network failures against the remote API |
| **REQ-CI-05** | HTML report artifact MUST be uploaded on every run (pass or fail) |
| **REQ-CI-06** | `forbidOnly: true` on CI to prevent accidental `.only` leaks |
| **REQ-CI-07** | `API_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` MUST be supplied as GitHub Actions secrets or environment variables |

**Acceptance criteria:**  
- Given a commit is pushed to any branch  
- When the GitHub Actions workflow runs  
- Then all tests pass and an HTML report is uploaded as an artifact  
- AND the build is marked red if any test fails

---

## 8. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Reliability | The suite MUST be idempotent — running it twice in a row must not fail due to leftover data |
| NFR-02 | Speed | Full API suite MUST complete in under 60 seconds on a standard developer machine |
| NFR-03 | Speed | Full API suite on CI MUST complete in under 3 minutes (including setup projects) |
| NFR-04 | Maintainability | No URL paths hard-coded in test files; all routes via `userRoutes` constants |
| NFR-05 | Maintainability | All test data centralised in `src/data/user.data.ts`; no inline literals in tests |
| NFR-06 | Observability | Every `expect()` call MUST include a descriptive failure message string |
| NFR-07 | Observability | Every test MUST use `test.step()` to separate logical phases (e.g., "Send request" / "Verify response") |
| NFR-08 | Traceability | Every test MUST have a tag (`@USR-TXXX`) for filtering and reporting |
| NFR-09 | Security | `.auth/` MUST be gitignored; no credentials committed to the repo |
| NFR-10 | Security | `ADMIN_EMAIL` and `ADMIN_PASSWORD` MUST be supplied via `.env` (local) or CI secrets; never hard-coded |
| NFR-11 | Code quality | All TypeScript files MUST pass ESLint and Prettier checks (`npm run lint`, `npm run format:check`) |

---

## 9. Technical Constraints & Assumptions

| # | Constraint / Assumption |
|---|---|
| C1 | Target API is `https://api.practicesoftwaretesting.com` (Sprint 5 hosted version) |
| C2 | The API is externally hosted and outside our control — availability is not guaranteed; tests assume the API is up |
| C3 | Authentication is JWT Bearer token (`Authorization: Bearer <token>`) |
| C4 | Registration is open (no invite code); any email + password meeting policy can register |
| C5 | Password policy: minimum 8 characters, must include uppercase, lowercase, digit, and special character |
| C6 | User deletion requires an admin token; the test user cannot delete themselves |
| C7 | The `POST /users/forgot-password` endpoint triggers an email; email delivery is NOT asserted in this suite |
| C8 | Playwright project dependencies guarantee `setup` and `admin-setup` complete before `api` tests start |
| C9 | `.auth/*.json` files are ephemeral and written at runtime; they MUST NOT be committed |
| C10 | Tests run sequentially within `user.api.spec.ts` (single describe block, ordered tests) |
| C11 | Tests run in parallel across spec files (different Playwright projects) but NOT within the same spec file |

---

## 10. Dependencies

| Dependency | Type | Owner | Notes |
|---|---|---|---|
| `@playwright/test ^1.59.1` | NPM | External | Test runner; API request client |
| `dotenv ^17.4.2` | NPM | External | Loads `.env` into `process.env` |
| `typescript ^5.9.3` | NPM | External | Language toolchain |
| `Practice Software Testing API` | External system | testsmith-io | Target under test; no SLA for availability |
| `.auth/user.json` | Runtime artifact | `auth.setup.ts` | Written by setup, read by api specs |
| `.auth/admin_token.json` | Runtime artifact | `admin.auth.setup.ts` | Written by setup, read by api specs |
| GitHub Actions | CI platform | GitHub | Runs the workflow on push/PR |

---

## 11. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Remote API unavailability during CI | Medium | High | Add `retries: 2` in CI config; alert on failure via GitHub notification |
| Shared API environment data pollution | Medium | High | Use timestamped unique emails; always run T011 (delete) as teardown |
| Token race condition between parallel spec files | High | High | `user.api.spec.ts` logs in fresh in `beforeAll` instead of reading `token.json` |
| Password change test leaves suite in broken state | Low | High | T008 MUST restore original password within the same test (two-step restore) |
| Delete test runs before other tests complete | Low | Critical | Use `test.describe` with sequential ordering; T011 is always last |
| API endpoint paths change between sprints | Low | Medium | All routes centralised in `user.routes.ts`; single-point update |
| `.auth/` files accidentally committed | Low | High | `.gitignore` enforced; CI lint step can check for secrets |
| Email collision across parallel CI runs | Low | Medium | `Date.now()` timestamp in email prevents collision within same machine; add random suffix if needed |
| API rate limiting on CI | Low | Medium | `workers: 1` on CI reduces request concurrency |

---

## 12. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| **API endpoint coverage** | 100% of `/users` surface (11/11 tests) | Count passing tests with `@USR-T` tags |
| **Suite pass rate (local)** | 100% on consecutive runs (idempotency) | Run twice; second run must also be green |
| **Suite pass rate (CI)** | ≥ 95% over rolling 7-day window | GitHub Actions pass rate |
| **Execution time (local)** | < 60 seconds | `npm run test:api` wall-clock time |
| **Execution time (CI)** | < 3 minutes | GitHub Actions job duration |
| **Lint / format pass** | 0 errors | `npm run lint && npm run format:check` |
| **Zero committed credentials** | 0 secrets in git history | Git hook / CI secret scan |
| **Test traceability** | 100% of tests have a `@USR-TXXX` tag | Playwright tag report |

---

## 13. Out of Scope

The following are explicitly out of scope for this specification:

1. **UI (browser) tests** — Playwright `chromium` project is scaffolded but not in scope for this delivery
2. **Negative / error path tests** — e.g., login with wrong password returning 401, delete non-existent user returning 404 (deferred to a future negative-test spec)
3. **Sprint 1–4 API variants** — This suite targets Sprint 5 only
4. **Products, categories, cart, orders, invoices APIs** — Future specs will extend coverage to other API domains
5. **Contract (Pact) testing** — Infrastructure exists (`pact-mock-service`) but not in scope
6. **Performance / load testing** — Not part of this functional test pass
7. **Email delivery verification** — Forgot-password email not asserted
8. **Mobile app testing** — Separate tooling and out of scope

---

## 14. Open Questions

| # | Question | Owner | Due |
|---|---|---|---|
| OQ-01 | Should the suite run against Sprint 5 (stable) or `with-bugs` version on CI? | QA Lead | Pre-implementation |
| OQ-02 | Should negative test cases (4xx responses) be added to `user.api.spec.ts` or a separate file? | QA Lead | Sprint planning |
| OQ-03 | Is there a rate limit on the hosted API that would cause CI failures at `workers > 1`? | QA Lead | Pre-implementation |
| OQ-04 | Should `@USR-T009` (forgot-password) assert email delivery via MailCatcher when running locally? | QA Lead | Pre-implementation |
| OQ-05 | Should admin credentials be rotated periodically and pulled from a secrets manager? | DevOps | CI setup |
| OQ-06 | What is the retention policy for Playwright HTML report artifacts in GitHub Actions? | DevOps | CI setup |

---

## 15. Appendix — API Reference

### Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

Tokens are obtained via `POST /users/login`.

---

### `/users` Endpoint Summary

| # | Method | Path | Auth | Expected Status |
|---|---|---|---|---|
| 1 | GET | `/users` | Admin | 200 |
| 2 | GET | `/users/me` | User | 200 |
| 3 | GET | `/users/{id}` | Admin | 200 |
| 4 | PUT | `/users/{id}` | User | 200 |
| 5 | PATCH | `/users/{id}` | User | 200 |
| 6 | GET | `/users/search?q=` | Admin | 200 |
| 7 | GET | `/users/refresh` | User | 200 |
| 8 | POST | `/users/change-password` | User | 200 |
| 9 | POST | `/users/forgot-password` | None | 200 |
| 10 | GET | `/users/logout` | User | 200 |
| 11 | DELETE | `/users/{id}` | Admin | 204 |

---

### Default Accounts (Sprint 5)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@practicesoftwaretesting.com` | `welcome01` |
| User | `customer@practicesoftwaretesting.com` | `welcome01` |
| User 2 | `customer2@practicesoftwaretesting.com` | `welcome01` |
| User 3 | `customer3@practicesoftwaretesting.com` | `pass123` |

> Test suite uses dynamically registered ephemeral users, not the default accounts above (except Admin for admin token).

---

### Environment Variables

| Variable | Example | Required |
|---|---|---|
| `API_URL` | `https://api.practicesoftwaretesting.com` | Yes |
| `ADMIN_EMAIL` | `admin@practicesoftwaretesting.com` | Yes |
| `ADMIN_PASSWORD` | `welcome01` | Yes |

---

### Test Execution Commands

```bash
# Run full suite (setup + api + ui)
npm test

# Run API tests only (requires setup to have run previously)
npm run test:api

# Run setup projects only
npm run setup

# Open HTML report
npm run report

# Lint check
npm run lint

# Format check
npm run format:check
```

---

### File Structure (Target State)

```
PW_ToolBox_FullFlow/
├── .auth/                          # Runtime only — gitignored
│   ├── user.json                   # { email, password, id }
│   ├── token.json                  # { access_token }
│   └── admin_token.json            # { admin_access_token }
├── .github/
│   └── workflows/
│       └── playwright.yml          # CI pipeline
├── docs/
│   ├── user-api-flow.md            # Implementation guide
│   └── feature-spec-api-test-automation.md  # This document
├── src/
│   ├── data/
│   │   └── user.data.ts            # Test payloads
│   └── routes/
│       └── user.routes.ts          # All route constants (9 keys)
├── tests/
│   ├── setup/
│   │   ├── auth.setup.ts           # Register user → .auth/user.json
│   │   └── admin.auth.setup.ts     # Admin login → .auth/admin_token.json
│   └── api/
│       ├── auth.api.spec.ts        # Login test → .auth/token.json
│       └── user.api.spec.ts        # T001–T011 full user lifecycle
├── .env                            # Local environment variables
├── .gitignore                      # Must include .auth/
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

---

*Document end. Next steps: review with QA Lead → technical design in `design.md` → implementation in `user.api.spec.ts`.*
