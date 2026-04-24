import { test, expect } from '@playwright/test';
import { userRoutes } from '../../src/routes/user.routes';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { userRegisterPayload, adminLoginPayload } from '../../src/data/user.data';

test.describe('User API flow', () => {
  let admin_token: string;

  test.beforeAll(async () => {
    admin_token = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../.auth/admin_token.json'), 'utf8'),
    ).admin_access_token;
  });

  // Get all users
  test('Get all users', async ({ request }) => {
    const getAllUsersResponse = await request.get(
      `${process.env.API_URL}/${userRoutes.getAllUsers}`,
      {
        headers: { Authorization: `Bearer ${admin_token}` },
      },
    );

    const body = await getAllUsersResponse.json();
    expect(getAllUsersResponse.status()).toBe(200);
    expect(Array.isArray(body.data), 'data should be an array').toBe(true);
    expect(typeof body.total, 'total should be a number').toBe('number');
    expect(body.total, 'total should be >= 0').toBeGreaterThanOrEqual(0);
  });

  // Get all users — negative/edge cases
  test.describe('Get all users – negative/edge cases', () => {
    test('@USER-T001a No auth token returns 401', async ({ request }) => {
      const response = await request.get(`${process.env.API_URL}/${userRoutes.getAllUsers}`);

      expect(response.status(), 'Missing auth token should return 401').toBe(401);
      const body = await response.json();
      expect(body.message, 'Response body should contain Unauthorized message').toBe('Unauthorized');
    });

    test('@USER-T001b Invalid Bearer token returns 401', async ({ request }) => {
      const response = await request.get(`${process.env.API_URL}/${userRoutes.getAllUsers}`, {
        headers: { Authorization: 'Bearer invalid.token.value' },
      });

      expect(response.status(), 'Invalid token should return 401').toBe(401);
      const body = await response.json();
      expect(body.message, 'Response body should contain Unauthorized message').toBe('Unauthorized');
    });

    test('@USER-T001c Malformed Authorization header returns 401', async ({ request }) => {
      const response = await request.get(`${process.env.API_URL}/${userRoutes.getAllUsers}`, {
        headers: { Authorization: 'not-a-bearer-token' },
      });

      expect(response.status(), 'Malformed Authorization header should return 401').toBe(401);
      const body = await response.json();
      expect(body.message, 'Response body should contain Unauthorized message').toBe('Unauthorized');
    });

    test('@USER-T001d per_page=0 returns 400', async ({ request }) => {
      const response = await request.get(
        `${process.env.API_URL}/${userRoutes.getAllUsers}?per_page=0`,
        { headers: { Authorization: `Bearer ${admin_token}` } },
      );

      expect(response.status(), 'per_page=0 should return 400').toBe(400);
    });

    test('@USER-T001e Non-numeric per_page returns 400', async ({ request }) => {
      const response = await request.get(
        `${process.env.API_URL}/${userRoutes.getAllUsers}?per_page=abc`,
        { headers: { Authorization: `Bearer ${admin_token}` } },
      );

      expect(response.status(), 'Non-numeric per_page should return 400').toBe(400);
    });

    test('@USER-T001f Negative page number returns 400', async ({ request }) => {
      const response = await request.get(
        `${process.env.API_URL}/${userRoutes.getAllUsers}?page=-1`,
        { headers: { Authorization: `Bearer ${admin_token}` } },
      );

      expect(response.status(), 'Negative page number should return 400').toBe(400);
    });
  });

  // Register user — negative/edge cases
  test.describe('Register user – negative/edge cases', () => {
    const validBase = {
      first_name: 'Jane',
      last_name: 'Smith',
      email: `neg-${Date.now()}@example.com`,
      password: 'SuperSecure@123',
      phone: '0987654321',
      dob: '1985-06-15',
      address: {
        street: 'Street 1',
        city: 'City',
        state: 'State',
        country: 'Country',
        postal_code: '1234AA',
      },
    };

    test('@USER-T002a Missing email returns 400', async ({ request }) => {
      const response = await request.post(`${process.env.API_URL}/${userRoutes.registry}`, {
        data: { ...validBase, email: undefined },
      });

      expect(response.status(), 'Missing email should return 400').toBe(400);
    });

    test('@USER-T002b Missing password returns 400', async ({ request }) => {
      const response = await request.post(`${process.env.API_URL}/${userRoutes.registry}`, {
        data: { ...validBase, password: undefined },
      });

      expect(response.status(), 'Missing password should return 400').toBe(400);
    });

    test('@USER-T002c Missing first_name returns 400', async ({ request }) => {
      const response = await request.post(`${process.env.API_URL}/${userRoutes.registry}`, {
        data: { ...validBase, first_name: undefined },
      });

      expect(response.status(), 'Missing first_name should return 400').toBe(400);
    });

    test('@USER-T002d Missing last_name returns 400', async ({ request }) => {
      const response = await request.post(`${process.env.API_URL}/${userRoutes.registry}`, {
        data: { ...validBase, last_name: undefined },
      });

      expect(response.status(), 'Missing last_name should return 400').toBe(400);
    });

    test('@USER-T002e Invalid email format returns 400', async ({ request }) => {
      const response = await request.post(`${process.env.API_URL}/${userRoutes.registry}`, {
        data: { ...validBase, email: 'not-an-email' },
      });

      expect(response.status(), 'Invalid email format should return 400').toBe(400);
    });

    test('@USER-T002f Weak password returns 400', async ({ request }) => {
      const response = await request.post(`${process.env.API_URL}/${userRoutes.registry}`, {
        data: { ...validBase, email: `weak-pw-${Date.now()}@example.com`, password: 'weak' },
      });

      expect(response.status(), 'Weak password should return 400').toBe(400);
    });

    test('@USER-T002g Invalid dob format returns 400', async ({ request }) => {
      const response = await request.post(`${process.env.API_URL}/${userRoutes.registry}`, {
        data: { ...validBase, email: `bad-dob-${Date.now()}@example.com`, dob: '15-06-1985' },
      });

      expect(response.status(), 'Invalid dob format should return 400').toBe(400);
    });

    test('@USER-T002h Empty request body returns 400', async ({ request }) => {
      const response = await request.post(`${process.env.API_URL}/${userRoutes.registry}`, {
        data: {},
      });

      expect(response.status(), 'Empty body should return 400').toBe(400);
    });

    test('@USER-T002i Duplicate email returns 409', async ({ request }) => {
      const response = await request.post(`${process.env.API_URL}/${userRoutes.registry}`, {
        data: { ...validBase, email: adminLoginPayload.email },
      });

      expect(response.status(), 'Duplicate email should return 409').toBe(409);
    });
  });

  // Get me — negative/edge cases
  test.describe('Get me – negative/edge cases', () => {
    test('@USER-T003a No auth token returns 401', async ({ request }) => {
      const response = await request.get(`${process.env.API_URL}/${userRoutes.getMe}`);

      expect(response.status(), 'Missing auth token should return 401').toBe(401);
      const body = await response.json();
      expect(body.message, 'Response body should contain Unauthorized message').toBe('Unauthorized');
    });

    test('@USER-T003b Invalid Bearer token returns 401', async ({ request }) => {
      const response = await request.get(`${process.env.API_URL}/${userRoutes.getMe}`, {
        headers: { Authorization: 'Bearer invalid.token.value' },
      });

      expect(response.status(), 'Invalid token should return 401').toBe(401);
      const body = await response.json();
      expect(body.message, 'Response body should contain Unauthorized message').toBe('Unauthorized');
    });

    test('@USER-T003c Malformed Authorization header returns 401', async ({ request }) => {
      const response = await request.get(`${process.env.API_URL}/${userRoutes.getMe}`, {
        headers: { Authorization: 'not-a-bearer-token' },
      });

      expect(response.status(), 'Malformed Authorization header should return 401').toBe(401);
      const body = await response.json();
      expect(body.message, 'Response body should contain Unauthorized message').toBe('Unauthorized');
    });
  });

  // Register → Get current user → Delete (serial: each step depends on the previous)
  test.describe.serial('Register, verify and delete user', () => {
    let throwawayUserId: string;
    let throwawayToken: string;

    test('Register user', async ({ request }) => {
      const registerResponse = await request.post(`${process.env.API_URL}/${userRoutes.registry}`, {
        data: userRegisterPayload,
      });

      const body = await registerResponse.json();
      expect(registerResponse.status(), 'Register should return 201').toBe(201);
      expect(body.email).toBe(userRegisterPayload.email);
      throwawayUserId = body.id;

      // Login immediately to get token for the new user
      const loginResponse = await request.post(`${process.env.API_URL}/${userRoutes.login}`, {
        data: { email: userRegisterPayload.email, password: userRegisterPayload.password },
      });
      const loginBody = await loginResponse.json();
      expect(loginResponse.status(), 'Login after register should return 200').toBe(200);
      throwawayToken = loginBody.access_token;
    });

    // Get current user information
    test('Get current user information', async ({ request }) => {
      const response = await request.get(`${process.env.API_URL}/${userRoutes.getMe}`, {
        headers: { Authorization: `Bearer ${throwawayToken}` },
      });

      const body = await response.json();
      expect(response.status()).toBe(200);
      expect(body.email, 'Email should match the registered user').toBe(userRegisterPayload.email);
      expect(body.first_name).toBe(userRegisterPayload.first_name);
      expect(body.last_name).toBe(userRegisterPayload.last_name);
    });

    // Change password 
    test.describe.serial('Change password', () => {
      const newPassword = 'N3w$ecure!99';

      test('@AUTH-T008 Change password with correct current password (Happy)', async ({ request }) => {
        const response = await request.post(`${process.env.API_URL}/${userRoutes.changePassword}`, {
          headers: { Authorization: `Bearer ${throwawayToken}` },
          data: {
            current_password: userRegisterPayload.password,
            new_password: newPassword,
            new_password_confirmation: newPassword,
          },
        });
        expect(response.status(), 'Change password should return 200').toBe(200);
      });

      test('@AUTH-T008b Login with new password succeeds after change (AC-AUTH-06e)', async ({ request }) => {
        const loginResponse = await request.post(`${process.env.API_URL}/${userRoutes.login}`, {
          data: { email: userRegisterPayload.email, password: newPassword },
        });
        expect(loginResponse.status(), 'Login with new password should return 200').toBe(200);
        const body = await loginResponse.json();
        expect(body.access_token, 'New access_token should be present').toBeTruthy();
        throwawayToken = body.access_token;
      });

      test('@AUTH-T008c Change password with wrong current password returns 422 (AC-AUTH-06b)', async ({ request }) => {
        const response = await request.post(`${process.env.API_URL}/${userRoutes.changePassword}`, {
          headers: { Authorization: `Bearer ${throwawayToken}` },
          data: {
            current_password: 'WrongPassword!1',
            new_password: 'Another$ecure!1',
            new_password_confirmation: 'Another$ecure!1',
          },
        });
        expect(response.status(), 'Wrong current password should return 422').toBe(422);
      });

      test('@AUTH-T008d Mismatched new_password_confirmation returns 422 (AC-AUTH-06c)', async ({ request }) => {
        const response = await request.post(`${process.env.API_URL}/${userRoutes.changePassword}`, {
          headers: { Authorization: `Bearer ${throwawayToken}` },
          data: {
            current_password: newPassword,
            new_password: 'Match$ecure!1',
            new_password_confirmation: 'DoesNotMatch!1',
          },
        });
        expect(response.status(), 'Mismatched confirmation should return 422').toBe(422);
      });

      test('@AUTH-T008e Weak new password returns 422 (AC-AUTH-06d)', async ({ request }) => {
        const response = await request.post(`${process.env.API_URL}/${userRoutes.changePassword}`, {
          headers: { Authorization: `Bearer ${throwawayToken}` },
          data: {
            current_password: newPassword,
            new_password: 'weak',
            new_password_confirmation: 'weak',
          },
        });
        expect(response.status(), 'Weak password should return 422').toBe(422);
      });

      test('@AUTH-T008f Change password without token returns 401 (RBAC)', async ({ request }) => {
        const response = await request.post(`${process.env.API_URL}/${userRoutes.changePassword}`, {
          data: {
            current_password: newPassword,
            new_password: 'N3w$ecure!99',
            new_password_confirmation: 'N3w$ecure!99',
          },
        });
        expect(response.status(), 'No auth should return 401').toBe(401);
      });
    });

    // Forgot password — requires auth; resets password to `welcome02` (AC-AUTH-05a/05b)
    test.describe.serial('Forgot password', () => {
      test('@AUTH-T007a Registered email with valid token returns 200 and success flag (AC-AUTH-05a)', async ({ request }) => {
        const response = await request.post(`${process.env.API_URL}/${userRoutes.forgotPassword}`, {
          headers: { Authorization: `Bearer ${throwawayToken}` },
          data: { email: userRegisterPayload.email },
        });
        expect(response.status(), 'Forgot password should return 200').toBe(200);
        const body = await response.json();
        expect(body.success, 'Response should contain success: true').toBe(true);
      });

      test('@AUTH-T007b Password is now welcome02 — login confirms the reset', async ({ request }) => {
        const loginResponse = await request.post(`${process.env.API_URL}/${userRoutes.login}`, {
          data: { email: userRegisterPayload.email, password: 'welcome02' },
        });
        expect(loginResponse.status(), 'Login with reset password welcome02 should return 200').toBe(200);
        const body = await loginResponse.json();
        expect(body.access_token, 'access_token should be present after reset login').toBeTruthy();
        throwawayToken = body.access_token;
      });

      test('@AUTH-T007c No auth token returns 401', async ({ request }) => {
        const response = await request.post(`${process.env.API_URL}/${userRoutes.forgotPassword}`, {
          data: { email: userRegisterPayload.email },
        });
        expect(response.status(), 'Missing auth should return 401').toBe(401);
      });

      test('@AUTH-T007d Missing email body field returns 400', async ({ request }) => {
        const response = await request.post(`${process.env.API_URL}/${userRoutes.forgotPassword}`, {
          headers: { Authorization: `Bearer ${throwawayToken}` },
          data: {},
        });
        expect(response.status(), 'Missing email field should return 400').toBe(400);
      });
    });

    // Delete registered user
    test('Delete registered user', async ({ request }) => {
      const response = await request.delete(
        `${process.env.API_URL}/${userRoutes.userById(throwawayUserId)}`,
        { headers: { Authorization: `Bearer ${admin_token}` } },
      );
      expect(response.status(), 'Delete user should return 204').toBe(204);
    });
  });
});
