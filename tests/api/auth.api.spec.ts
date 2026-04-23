import { test, expect } from '@playwright/test';
import { userRoutes } from '../../src/routes/user.routes';
import fs from 'fs';
import path from 'path';

const { email, password } = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../.auth/user.json'), 'utf8'),
);

test.describe('User Authentication API flow', () => {
  test('Login', async ({ request }) => {
    const loginResponse = await request.post(`${process.env.API_URL}/${userRoutes.login}`, {
      data: { email, password },
    });

    const loginResponseBody = await loginResponse.json();
    expect(loginResponse.status(), 'Login should return 200').toBe(200);
    expect(loginResponseBody.access_token, 'Login should return access token').toBeDefined();

    const token = loginResponseBody.access_token;

    fs.writeFileSync(
      '.auth/token.json',
      JSON.stringify({
        access_token: token,
      }),
    );
  });
});
