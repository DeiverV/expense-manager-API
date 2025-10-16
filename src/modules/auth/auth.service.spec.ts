import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import crypt from 'src/lib/crypt';
import { JwtService } from '@nestjs/jwt';

describe('AuthService (unit)', () => {
  let service: AuthService;

  const usersService = {
    findOne: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('lanza NotFoundException si usuario no existe', async () => {
    usersService.findOne.mockResolvedValue(null);

    await expect(service.logIn('nope', 'x')).rejects.toMatchObject({
      name: 'NotFoundException',
    });
  });

  it('lanza UnauthorizedException si password incorrecto', async () => {
    usersService.findOne.mockResolvedValue({
      _id: '1',
      username: 'john',
      email: 'john@mail.com',
      password: 'hash',
    });

    jest.spyOn(crypt, 'isMatchPassword').mockResolvedValue(false);
    await expect(service.logIn('john', 'bad')).rejects.toMatchObject({
      name: 'UnauthorizedException',
    });
  });

  it('retorna access_token si credenciales correctas', async () => {
    usersService.findOne.mockResolvedValue({
      _id: '1',
      username: 'john',
      email: 'john@mail.com',
      password: 'hash',
    });

    jest.spyOn(crypt, 'isMatchPassword').mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('jwt-token');

    const res = await service.logIn('john', 'ok');
    expect(res).toEqual({ access_token: 'jwt-token' });
    
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: '1',
      username: 'john',
      email: 'john@mail.com',
    });
  });
});
