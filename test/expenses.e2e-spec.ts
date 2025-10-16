import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createE2EApp } from './utils/e2e-app.factory';
import { startMongo, stopMongo } from './utils/mongo-memory.server';
import { registerAndLogin } from './utils/auth.helper';

describe('Expenses E2E', () => {
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

  it('CRUD + report', async () => {
    const { headers } = await registerAndLogin(app);

    const created = await request(app.getHttpServer())
      .post('/expenses')
      .set(headers)
      .send({ category: 'food', amount: 25, description: 'lunch' })
      .expect(201);

    const expense = created.body;

    const list = await request(app.getHttpServer())
      .get('/expenses')
      .set(headers)
      .expect(200);
    expect(Array.isArray(list.body)).toBe(true);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const report = await request(app.getHttpServer())
      .get('/expenses/report')
      .set(headers)
      .query({ startDate: start.toISOString(), endDate: end.toISOString() })
      .expect(200);

    expect(report.body.food.totalAmount).toBeGreaterThanOrEqual(25);

    const updated = await request(app.getHttpServer())
      .put(`/expenses/${expense._id}`)
      .set(headers)
      .send({ amount: 30 })
      .expect(200);
    expect(updated.body.amount).toBe(30);

    await request(app.getHttpServer())
      .delete(`/expenses/${expense._id}`)
      .set(headers)
      .expect(200);
  });
});


