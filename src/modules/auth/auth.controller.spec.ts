import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('AuthController (unit)', () => {
  let controller: AuthController;
  const service = {
    logIn: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('signIn retorna access_token en login exitoso', async () => {
    service.logIn = jest.fn().mockResolvedValue({ access_token: 'jwt' });
    const res = await controller.signIn({
      username: 'a',
      password: 'b',
    });

    expect(service.logIn).toHaveBeenCalledWith('a', 'b');
    expect(res).toEqual({ access_token: 'jwt' });
  });

  it('propaga NotFoundException', async () => {
    service.logIn = jest.fn().mockRejectedValue(new NotFoundException());

    await expect(
      controller.signIn({ username: 'x', password: 'y' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('propaga UnauthorizedException', async () => {
    service.logIn = jest.fn().mockRejectedValue(new UnauthorizedException());
    
    await expect(
      controller.signIn({ username: 'x', password: 'bad' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
