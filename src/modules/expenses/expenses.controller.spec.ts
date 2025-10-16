import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('ExpensesController (unit)', () => {
  let controller: ExpensesController;
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    getExpensesReport: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [{ provide: ExpensesService, useValue: service }],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
  });

  it('create delega en service con userId de req', async () => {
    service.create = jest.fn().mockResolvedValue({ _id: '1' });
    const req = { user: { sub: 'uid' } };
    const dto = {
      category: 'food',
      amount: 10,
      description: 'description',
      date: null,
    };

    const res = await controller.create(dto, req);
    expect(service.create).toHaveBeenCalledWith(dto, 'uid');
    expect(res).toEqual({ _id: '1' });
  });

  it('findAll delega en service con userId de req', async () => {
    service.findAll = jest.fn().mockResolvedValue([]);
    const req = { user: { sub: 'uid' } };
    const res = await controller.findAll(req);

    expect(service.findAll).toHaveBeenCalledWith('uid');
    expect(res).toEqual([]);
  });

  it('getExpensesReport valida fechas y delega', async () => {
    service.getExpensesReport = jest.fn().mockResolvedValue({});
    const req = { user: { sub: 'uid' } };

    const start = new Date().toISOString();
    const end = new Date().toISOString();

    await controller.getExpensesReport(req, start, end);
    expect(service.getExpensesReport).toHaveBeenCalled();
  });

  it('getExpensesReport lanza BadRequest si faltan fechas', async () => {
    const req = { user: { sub: 'uid' } };

    await expect(
      controller.getExpensesReport(req, undefined, undefined),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('update delega en service', async () => {
    service.update = jest.fn().mockResolvedValue({ _id: '1', amount: 20 });
    const res = await controller.update('1', { amount: 20 });

    expect(service.update).toHaveBeenCalledWith('1', { amount: 20 });
    expect(res).toEqual({ _id: '1', amount: 20 });
  });

  it('delete delega en service', async () => {
    service.delete = jest.fn().mockResolvedValue({ acknowledged: true });
    const res = await controller.delete('1');

    expect(service.delete).toHaveBeenCalledWith('1');
    expect(res).toEqual({ acknowledged: true });
  });
});
