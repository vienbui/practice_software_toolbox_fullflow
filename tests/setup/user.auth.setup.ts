import { test, expect } from '@playwright/test';
import { userRoutes } from '../../src/routes/user.routes';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import fs from 'fs';

test.describe('Setup - user login', () => {
  test('Login with test user', async ({ request }) => {
    const loginResponse = await request.post(`${process.env.API_URL}/${userRoutes.login}`, {
      data: {
        email: process.env.TEST_USER_EMAIL,
        password: process.env.TEST_USER_PASSWORD,
      },
    });

    const loginResponseBody = await loginResponse.json();
    expect(loginResponse.status(), 'Login should return 200').toBe(200);
    expect(loginResponseBody.access_token, 'Login should return access token').toBeDefined();

    fs.mkdirSync('.auth', { recursive: true });
    fs.writeFileSync(
      '.auth/token.json',
      JSON.stringify({ access_token: loginResponseBody.access_token }),
    );
  });
});
