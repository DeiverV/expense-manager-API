import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController (unit)', () => {
  let controller: UsersController;
  const service = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('create delega en UsersService.create y retorna 201', async () => {
    service.create = jest.fn().mockResolvedValue({ _id: '1' });
    const dto = { username: 'u', email: 'e', password: 'p', age: 1 };
    const res = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ _id: '1' });
  });

  it('getLoggedUser retorna req.user', async () => {
    const req = { user: { sub: 'uid', username: 'u1' } };
    const res = await controller.getLoggedUser(req);

    expect(res).toEqual(req.user);
  });
});
