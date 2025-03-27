import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: User = {
    id: '1',
    username: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
  };

  const mockUserResponse = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findById: jest.fn().mockResolvedValue(mockUser),
    findAllUsers: jest.fn().mockResolvedValue([mockUser]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const dto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };
    const result = await controller.create(dto);
    expect(result).toEqual(mockUser);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should get a user by ID', async () => {
    const result = await controller.findOne('1');
    expect(result).toEqual(mockUserResponse);
    expect(service.findById).toHaveBeenCalledWith('1');
  });

  it('should throw NotFoundException if user not found', async () => {
    jest.spyOn(service, 'findById').mockResolvedValueOnce(null);
    await expect(controller.findOne('2')).rejects.toThrow(NotFoundException);
  });

  it('should get all users', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockUserResponse]);
    expect(service.findAllUsers).toHaveBeenCalled();
  });

  it('should update a user', async () => {
    const dto: UpdateUserDto = { username: 'Updated User' };
    jest.spyOn(service, 'findById').mockResolvedValueOnce(mockUser);
    jest
      .spyOn(service, 'create')
      .mockResolvedValueOnce({ ...mockUser, ...dto });
    const result = await controller.update('1', dto);
    expect(result).toEqual({ ...mockUserResponse, name: 'Updated User' });
  });
});
