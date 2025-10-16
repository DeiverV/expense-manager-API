import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export async function registerAndLogin(app: INestApplication) {
  const username = `user_${Math.random().toString(36).slice(2, 8)}`;
  const email = `${username}@mail.com`;
  const password = 'Passw0rd!';

  await request(app.getHttpServer())
    .post('/users')
    .send({ username, email, password })
    .expect(201);

  const loginRes = await request(app.getHttpServer())
    .post('/auth')
    .send({ username, password })
    .expect(200);

  const token = loginRes.body?.access_token as string;
  return {
    username,
    email,
    password,
    token,
    headers: { Authorization: `Bearer ${token}` },
  };
}


