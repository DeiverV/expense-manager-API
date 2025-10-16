import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { ExpensesService } from '../../src/modules/expenses/expenses.service';
import { UsersService } from '../../src/modules/users/users.service';
import { startMongo, stopMongo } from '../utils/mongo-memory.server';

describe('Integración Expenses (services)', () => {
  let app: INestApplication;
  let expensesService: ExpensesService;
  let usersService: UsersService;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.MONGO_URI = await startMongo();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    expensesService = app.get(ExpensesService);
    usersService = app.get(UsersService);
  });

  afterAll(async () => {
    await app.close();
    await stopMongo();
  });

  it('crea, lista y reporta gastos por categoría', async () => {
    const user = await usersService.create({
      username: 'expuser',
      email: 'exp@mail.com',
      password: 'Passw0rd!',
      age: 30,
    });

    await expensesService.create(
      { category: 'food', amount: 10, description: '', date: null },
      user._id.toString(),
    );
    await expensesService.create(
      { category: 'food', amount: 20, description: '', date: null },
      user._id.toString(),
    );
    await expensesService.create(
      { category: 'travel', amount: 30, description: '', date: null },
      user._id.toString(),
    );

    const list = await expensesService.findAll(user._id.toString());
    expect(list.length).toBeGreaterThanOrEqual(3);

    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const report = await expensesService.getExpensesReport(
      user._id.toString(),
      startDate,
      endDate,
    );

    expect(report.food.totalAmount).toBe(30);
    expect(report.food.avgExpense).toBe(15);
    expect(report.travel.totalAmount).toBe(30);
  });
});
