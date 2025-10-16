import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createE2EApp } from './utils/e2e-app.factory';
import { startMongo, stopMongo } from './utils/mongo-memory.server';

describe('Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.MONGO_URI = await startMongo();
    app = await createE2EApp();
  });

  afterAll(async () => {
    await app.close();
    await stopMongo();
  });

  it('registro + login + loggedUser', async () => {
    const rand = Math.random().toString(36).slice(2, 8);
    const user = {
      username: `e2euser_${rand}`,
      email: `e2e_${rand}@mail.com`,
      password: 'Passw0rd!',
    };

    await request(app.getHttpServer()).post('/users').send(user).expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth')
      .send({ username: user.username, password: user.password })
      .expect(200);

    const token = login.body.access_token;

    const me = await request(app.getHttpServer())
      .get('/users/loggedUser')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(me.body.username).toBeDefined();
  });
});
