import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schema/user.schema';
import crypt from 'src/lib/crypt';
import { CreateUserDTO } from './dtos/user.dto';

describe('UsersService (unit)', () => {
  let service: UsersService;
  const modelFindOne = jest.fn();
  const modelConstructor = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: Object.assign(modelConstructor, { findOne: modelFindOne }),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('crea usuario con password hasheado cuando username no existe', async () => {
    type SavedUser = CreateUserDTO & { _id: string };

    modelFindOne.mockResolvedValue(null);

    const hashedPassword = 'hashed-pass';
    jest.spyOn(crypt, 'hashPassword').mockResolvedValue(hashedPassword);

    const userInput: CreateUserDTO = {
      username: 'john',
      email: 'john@mail.com',
      password: 'secret',
      age: 1,
    };

    const savedUser: SavedUser = {
      ...userInput,
      password: hashedPassword,
      _id: '1',
    };

    const saveMock = jest.fn().mockResolvedValue(savedUser);
    modelConstructor.mockImplementation(function (doc: CreateUserDTO) {
      Object.assign(this, doc);
      this.save = saveMock;
    });

    const result = await service.create(userInput);

    expect(crypt.hashPassword).toHaveBeenCalledWith(userInput.password);
    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual(savedUser);
  });

  it('lanza ConflictException si username ya existe', async () => {
    modelFindOne.mockResolvedValue({ _id: '1', username: 'john' });
    await expect(
      service.create({
        username: 'john',
        email: 'a@a.com',
        password: 'x',
      } as any),
    ).rejects.toMatchObject({ name: 'ConflictException' });
  });

  it('findOne devuelve usuario encontrado', async () => {
    const found = { _id: '1', username: 'ana' };
    modelFindOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(found) });
    const res = await service.findOne('ana');
    expect(res).toEqual(found);
    expect(modelFindOne).toHaveBeenCalledWith({ username: 'ana' });
  });
});
