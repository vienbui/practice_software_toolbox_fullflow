import { test, expect } from '@playwright/test';
import { userRoutes } from '../../src/routes/user.routes';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import fs from 'fs';

test.describe('User API flow', () => {
  let access_token: string;

  test.beforeAll(async ({ request }) => {
    access_token = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../.auth/token.json'), 'utf8'),
    );

    test(' Get User', async ({ request }) => {
      const getUserResponse = await request.get(`${process.env.API_URL}/${userRoutes.getUser}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const getUserResponseBody = await getUserResponse.json();
      console.log(getUserResponseBody);
      console.log(getUserResponse.status());
      expect(getUserResponse.status()).toBe(200);
    });
  });
});
