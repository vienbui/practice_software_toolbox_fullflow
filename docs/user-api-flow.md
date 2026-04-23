# User API Flow — Implementation Guide

## Overview

Full test coverage for the `/users` API surface. Tests run **sequentially** inside one
`test.describe` block, sharing state via variables declared at the top of the suite.

---

## API Endpoints to Cover

| # | Method | Endpoint | Auth | Tag |
|---|--------|----------|------|-----|
| 1 | GET | `/users` | Admin token | @USR-T001 |
| 2 | GET | `/users/me` | User token | @USR-T002 |
| 3 | GET | `/users/{userId}` | Admin token | @USR-T003 |
| 4 | PUT | `/users/{userId}` | User token | @USR-T004 |
| 5 | PATCH | `/users/{userId}` | User token | @USR-T005 |
| 6 | GET | `/users/search?q=` | Admin token | @USR-T006 |
| 7 | GET | `/users/refresh` | User token | @USR-T007 |
| 8 | POST | `/users/change-password` | User token | @USR-T008 |
| 9 | POST | `/users/forgot-password` | None | @USR-T009 |
| 10 | GET | `/users/logout` | User token | @USR-T010 |
| 11 | DELETE | `/users/{userId}` | Admin token | @USR-T011 |

---

## File 1 — `src/routes/user.routes.ts`

Add all missing route strings so tests never hard-code URL paths.

```typescript
export const userRoutes = {
  registry:       'users/register',
  login:          'users/login',
  forgotPassword: 'users/forgot-password',
  changePassword: 'users/change-password',
  getUser:        'users/me',
  logout:         'users/logout',
  refresh:        'users/refresh',
  searchUsers:    'users/search',
  getAllUsers:     'users',
};
```

---

## File 2 — `tests/api/user.api.spec.ts`

### Shared variables (top of `test.describe`)

```typescript
let access_token: string;
let admin_token:  string;
let userId:       string;
let userEmail:    string;
let userPassword: string;
```

---

### Step 1 — `beforeAll`

Runs once before all tests. Must:

1. Read `.auth/user.json` → extract `email`, `password`, `id`
2. Call `POST /users/login` with those credentials → extract `access_token`
3. Read `.auth/admin_token.json` → extract `admin_access_token`

> **Why login inside `beforeAll` instead of reading `token.json`?**
> `auth.api.spec.ts` and `user.api.spec.ts` run in parallel (different workers).
> There is no guarantee `token.json` exists yet when this file starts.

```
beforeAll
  ├─ fs.readFileSync('.auth/user.json')      → userEmail, userPassword, userId
  ├─ POST /users/login                       → access_token
  └─ fs.readFileSync('.auth/admin_token.json') → admin_token
```

---

### Step 2 — `@USR-T001` Get all users

```
GET /users
Headers: Authorization: Bearer <admin_token>

Assert:
  - status === 200
  - body.data is defined
  - body.data is an Array
```

---

### Step 3 — `@USR-T002` Get current user

```
GET /users/me
Headers: Authorization: Bearer <access_token>

Assert:
  - status === 200
  - body.email === userEmail
  - body.id is defined
```

---

### Step 4 — `@USR-T003` Get user by ID

```
GET /users/${userId}
Headers: Authorization: Bearer <admin_token>

Assert:
  - status === 200
  - body.id === userId
  - body.email === userEmail
```

---

### Step 5 — `@USR-T004` Update user (PUT)

Two `test.step` blocks:

```
Step A — Send update
  PUT /users/${userId}
  Headers: Authorization: Bearer <access_token>
  Body: { first_name, last_name, address: { street, city, state, country, postal_code }, phone, dob }

  Assert: status === 200

Step B — Verify update
  GET /users/me
  Headers: Authorization: Bearer <access_token>

  Assert:
    - body.first_name === value sent in Step A
    - body.last_name  === value sent in Step A
```

---

### Step 6 — `@USR-T005` Partially update user (PATCH)

Two `test.step` blocks:

```
Step A — Send patch
  PATCH /users/${userId}
  Headers: Authorization: Bearer <access_token>
  Body: { first_name: 'PatchedFirst' }

  Assert: status === 200

Step B — Verify patch
  GET /users/me
  Headers: Authorization: Bearer <access_token>

  Assert: body.first_name === 'PatchedFirst'
```

---

### Step 7 — `@USR-T006` Search users

```
GET /users/search?q=<encodeURIComponent(userEmail)>
Headers: Authorization: Bearer <admin_token>

Assert:
  - status === 200
  - body is defined
```

---

### Step 8 — `@USR-T007` Refresh token

```
GET /users/refresh
Headers: Authorization: Bearer <access_token>

Assert:
  - status === 200
  - body.access_token is defined

After assert → update: access_token = body.access_token
```

> Update the shared variable so all subsequent tests use the refreshed token.

---

### Step 9 — `@USR-T008` Change password

Two `test.step` blocks. The test must restore the original password so the suite
can run again from scratch.

```
Step A — Change password
  POST /users/change-password
  Headers: Authorization: Bearer <access_token>
  Body: { current_password: userPassword, new_password: 'NewSecure@456', new_password_confirmation: 'NewSecure@456' }

  Assert: status === 200

Step B — Restore original password
  POST /users/login        → login with new password → get tempToken
  POST /users/change-password
    Headers: Authorization: Bearer <tempToken>
    Body: { current_password: 'NewSecure@456', new_password: userPassword, new_password_confirmation: userPassword }

  Assert: status === 200
```

---

### Step 10 — `@USR-T009` Forgot password

```
POST /users/forgot-password
Body: { email: userEmail }
(no Authorization header)

Assert: status === 200
```

---

### Step 11 — `@USR-T010` Logout

```
GET /users/logout
Headers: Authorization: Bearer <access_token>

Assert: status === 200
```

> Must come **before** Delete. After this the user token is invalidated,
> but `admin_token` (used for Delete) is unaffected.

---

### Step 12 — `@USR-T011` Delete user *(always last)*

```
DELETE /users/${userId}
Headers: Authorization: Bearer <admin_token>

Assert: status === 204
```

> This is destructive. If it runs early every test that reads `userId` will fail.
> Keep it as the last test in the describe block.

---

## Test structure template

```typescript
test(
  'Test name',
  { tag: ['@USR-TXXX'] },
  async ({ request }) => {
    await test.step('Step description', async () => {
      const response = await request.METHOD(`${process.env.API_URL}/...`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { ... },   // POST / PUT / PATCH only
      });
      expect(response.status(), 'Descriptive message').toBe(200);
      const body = await response.json();
      expect(body.field, 'Descriptive message').toBe(expectedValue);
    });
  },
);
```

---

## Execution order

```
beforeAll
  │
  ├─ T001  GET  /users                (admin)
  ├─ T002  GET  /users/me             (user)
  ├─ T003  GET  /users/{id}           (admin)
  ├─ T004  PUT  /users/{id}           (user)  ← writes
  ├─ T005  PATCH /users/{id}          (user)  ← writes
  ├─ T006  GET  /users/search         (admin)
  ├─ T007  GET  /users/refresh        (user)  ← updates access_token
  ├─ T008  POST /users/change-password (user) ← writes + restores
  ├─ T009  POST /users/forgot-password (none)
  ├─ T010  GET  /users/logout          (user) ← invalidates token
  └─ T011  DELETE /users/{id}          (admin) ← destructive, MUST be last
```

---

## Checklist before running

- [ ] `src/routes/user.routes.ts` has all 9 route keys
- [ ] `beforeAll` reads `user.json`, logs in, reads `admin_token.json`
- [ ] Every `expect()` has a descriptive message string
- [ ] Every test uses `test.step()` for each logical phase
- [ ] Every test has a `@USR-TXXX` tag
- [ ] `T011` (Delete) is the last test in the file
- [ ] Change-password test restores the original password in the same test
- [ ] Refresh token test updates the shared `access_token` variable
