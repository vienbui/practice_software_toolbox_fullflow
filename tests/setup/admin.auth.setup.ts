import { test, expect } from '@playwright/test';
import { userRoutes } from '../../src/routes/user.routes';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { adminLoginPayload } from '../../src/data/user.data';
import fs from 'fs';

test.describe('Setup - admin login', () => {
  test('Login with admin user', async ({ request }) => {
    
    const adminLogin = adminLoginPayload;
    const loginAdminResponse = await request.post(`${process.env.API_URL}/${userRoutes.login}`, {
        data: adminLogin
    })


    const loginAdminResponseBody = await loginAdminResponse.json();
    expect(loginAdminResponse.status(), 'Login should return 200').toBe(200);
    expect(loginAdminResponseBody.access_token, 'Login should return access token').toBeDefined();

    const adminToken = loginAdminResponseBody.access_token;

    fs.writeFileSync(
      '.auth/admin_token.json',
      JSON.stringify({
        admin_access_token: adminToken,
      }),
    );
  });
    
});
