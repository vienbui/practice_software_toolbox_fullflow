import { test, expect } from '@playwright/test';
import { userRoutes } from '../../src/routes/user.routes';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { userRegisterPayload } from '../../src/data/user.data';
import fs from 'fs';

test.describe('Setup - Register user', () => {
  test('Register user', async ({ request }) => {
    // 1. Register User
    const UserRegisterPayload = userRegisterPayload;

    const registerResponse = await request.post(`${process.env.API_URL}/${userRoutes.registry}`, {
      data: UserRegisterPayload,
    });

    const registerResponseBody = await registerResponse.json();
    expect(registerResponse.status(), ' Register user should be successful with status 201').toBe(
      201,
    );
    expect(registerResponseBody.email).toBe(UserRegisterPayload.email);
    console.log(registerResponseBody);

    fs.mkdirSync('.auth', { recursive: true });

    fs.writeFileSync(
      '.auth/user.json',
      JSON.stringify({
        email: UserRegisterPayload.email,
        password: UserRegisterPayload.password,
      }),
    );
  });
});
