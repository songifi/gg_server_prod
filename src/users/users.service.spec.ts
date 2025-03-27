/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'securepassword',
      };

      const createdUser: User = {
        id: '1',
        ...createUserDto,
      } as User;

      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await usersService.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'securepassword',
      } as User;

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await usersService.findOne('1');

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await usersService.findOne('999');

      expect(result).toBeNull();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: '999' },
      });
    });
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      const users: User[] = [
        {
          id: '1',
          email: 'user1@example.com',
          username: 'user1',
          password: 'password1',
        } as User,
        {
          id: '2',
          email: 'user2@example.com',
          username: 'user2',
          password: 'password2',
        } as User,
      ];

      mockUserRepository.find.mockResolvedValue(users);

      const result = await usersService.findAllUsers();

      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('findByEmailOrUsername', () => {
    it('should return a user by email or username', async () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'securepassword',
      } as User;

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await usersService.findByEmailOrUsername(
        'test@example.com',
        'testuser',
      );

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [{ email: 'test@example.com' }, { username: 'testuser' }],
      });
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'securepassword',
      } as User;

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await usersService.findByEmail('test@example.com');

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'securepassword',
      } as User;

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await usersService.findById('1');

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('findByPasswordResetToken', () => {
    it('should return a user by password reset token', async () => {
      const users: User[] = [
        {
          id: '1',
          email: 'user1@example.com',
          username: 'user1',
          password: 'password1',
          passwordResetToken: 'token123',
        } as User,
        {
          id: '2',
          email: 'user2@example.com',
          username: 'user2',
          password: 'password2',
        } as User,
      ];

      jest.spyOn(usersService, 'findAllUsers').mockResolvedValue(users);

      const result = await usersService.findByPasswordResetToken('token123');

      expect(result).toEqual(users[0]);
    });

    it('should return null if token does not match any user', async () => {
      jest.spyOn(usersService, 'findAllUsers').mockResolvedValue([]);

      const result =
        await usersService.findByPasswordResetToken('invalid_token');

      expect(result).toBeUndefined();
    });
  });

  describe('findByRefreshToken', () => {
    it('should return a user by refresh token', async () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'securepassword',
        refreshToken: 'refresh123',
      } as User;

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await usersService.findByRefreshToken('refresh123');

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { refreshToken: 'refresh123' },
      });
    });
  });

  describe('save', () => {
    it('should save and return the user', async () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'securepassword',
      } as User;

      mockUserRepository.save.mockResolvedValue(user);

      const result = await usersService.save(user);

      expect(result).toEqual(user);
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    });
  });
});
