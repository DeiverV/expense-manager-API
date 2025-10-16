import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ExpensesService } from './expenses.service';
import { Expense } from './schemas/expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';

describe('ExpensesService (unit)', () => {
  let service: ExpensesService;
  const modelFind = jest.fn();
  const modelFindByIdAndUpdate = jest.fn();
  const modelFindByIdAndDelete = jest.fn();
  const modelConstructor = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: getModelToken(Expense.name),
          useValue: Object.assign(modelConstructor, {
            find: modelFind,
            findByIdAndUpdate: modelFindByIdAndUpdate,
            findByIdAndDelete: modelFindByIdAndDelete,
          }),
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
  });

  it('create asigna user y fecha por defecto', async () => {
    const input: CreateExpenseDto = {
      category: 'food',
      amount: 20,
      description: 'Food Desc',
      date: null,
    };

    const saved = { _id: '1', ...input, user: 'u1', date: new Date() };
    const saveMock = jest.fn().mockResolvedValue(saved);
    modelConstructor.mockImplementation(function (doc: CreateExpenseDto) {
      Object.assign(this, doc);
      this.save = saveMock;
    });

    const res = await service.create(input, 'u1');

    expect(saveMock).toHaveBeenCalled();
    expect(res.user).toBe('u1');
    expect(res.category).toBe('food');
  });

  it('findAll filtra por user', async () => {
    const docs = [{ _id: '1', user: 'u1' }];

    modelFind.mockReturnValue({ exec: jest.fn().mockResolvedValue(docs) });
    const res = await service.findAll('u1');

    expect(res).toEqual(docs);
    expect(modelFind).toHaveBeenCalledWith({ user: 'u1' });
  });

  it('getExpensesReport agrega por categoría', async () => {
    const expenses = [
      { category: 'food', amount: 10 },
      { category: 'food', amount: 20 },
      { category: 'travel', amount: 30 },
    ];
    modelFind.mockResolvedValue(expenses);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const report = await service.getExpensesReport('u1', startDate, endDate);

    expect(report.food.totalAmount).toBe(30);
    expect(report.food.totalExpenses).toBe(2);
    expect(report.food.avgExpense).toBe(15);
    expect(report.travel.totalAmount).toBe(30);
  });

  it('update delega en findByIdAndUpdate', async () => {
    const updated = { _id: '1', amount: 50 };
    modelFindByIdAndUpdate.mockResolvedValue(updated);

    const res = await service.update('1', { amount: 50 });

    expect(res).toEqual(updated);
    expect(modelFindByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      { amount: 50 },
      { new: true },
    );
  });

  it('delete delega en findByIdAndDelete', async () => {
    const deleted = { acknowledged: true };
    modelFindByIdAndDelete.mockResolvedValue(deleted);

    const res = await service.delete('1');

    expect(res).toEqual(deleted);
    expect(modelFindByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
