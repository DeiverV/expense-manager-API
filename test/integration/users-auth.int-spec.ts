import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { UsersService } from '../../src/modules/users/users.service';
import { AuthService } from '../../src/modules/auth/auth.service';
import { startMongo, stopMongo } from '../utils/mongo-memory.server';

describe('Integración Users + Auth (services)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let authService: AuthService;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.MONGO_URI = await startMongo();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    usersService = app.get(UsersService);
    authService = app.get(AuthService);
  });

  afterAll(async () => {
    await app.close();
    await stopMongo();
  });

  it('crea usuario y permite login', async () => {
    const user = await usersService.create({
      username: 'intuser',
      email: 'int@mail.com',
      password: 'Passw0rd!',
    } as any);

    expect(user._id).toBeDefined();

    const logged = await authService.logIn('intuser', 'Passw0rd!');
    expect(logged.access_token).toBeDefined();
  });
});


