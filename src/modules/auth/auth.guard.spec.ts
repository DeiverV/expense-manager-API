import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';

function createContextMock(req: any, handler?: any, cls?: any) {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => handler ?? (() => {}),
    getClass: () => cls ?? class C {},
  } as any;
}

describe('AuthGuard (unit)', () => {
  let guard: AuthGuard;

  const jwtService = { verifyAsync: jest.fn() };

  const configService = {
    get: jest.fn().mockReturnValue('secret'),
  };
  const reflector = { getAllAndOverride: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: Reflector, useValue: reflector },
      ],
    }).compile();

    guard = module.get(AuthGuard);
  });

  it('permite rutas públicas', async () => {
    reflector.getAllAndOverride.mockReturnValue(true); // @Public
    const req = {};
    const ctx = createContextMock(req);

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('lanza Unauthorized si no hay token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const req = { headers: {} };
    const ctx = createContextMock(req);

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('lanza Unauthorized si el token es inválido', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const req = { headers: { authorization: 'Bearer badtoken' } };

    jwtService.verifyAsync = jest.fn().mockRejectedValue(new Error('bad'));
    const ctx = createContextMock(req);

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('acepta token válido y setea req.user', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const payload = { sub: 'uid', username: 'u' };

    jwtService.verifyAsync = jest.fn().mockResolvedValue(payload);
    const req = { headers: { authorization: 'Bearer good' }, user: null };

    const ctx = createContextMock(req);

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(req.user).toEqual(payload);
    
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('good', {
      secret: 'secret',
    });
  });
});
