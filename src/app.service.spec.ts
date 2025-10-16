import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AppService } from './app.service';

describe('App Service (unit)', () => {
  let service: AppService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('El servicio devuelve "Hello World!"', async () => {
    const result = service.getHello();
    expect(result).toBe('Hello World!');
  });
});
