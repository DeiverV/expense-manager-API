import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController (unit)', () => {
  let controller: AppController;
  const service = { getHello: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: service }],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('delegates to AppService.getHello()', () => {
    service.getHello = jest.fn().mockReturnValue('Hello World!');
    const res = controller.getHello();

    expect(service.getHello).toHaveBeenCalled();
    expect(res).toBe('Hello World!');
  });
});
