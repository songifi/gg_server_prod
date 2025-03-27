import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserResponse } from '../shared/types/user.types';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
  })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: User,
  })
  async getProfile(@CurrentUser() user: User): Promise<UserResponse> {
    const { password, emailVerificationToken, emailVerificationTokenExpires, ...result } = user;
    return result;
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: User,
  })
  @ApiBody({ type: UpdateProfileDto })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponse> {
    const updatedUser = await this.usersService.create({
      ...user,
      ...updateProfileDto,
    });

    const { password, emailVerificationToken, emailVerificationTokenExpires, ...result } = updatedUser;
    return result;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  async findOne(@Param('id') id: string): Promise<UserResponse> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const { password, emailVerificationToken, emailVerificationTokenExpires, ...result } = user;
    return result;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const updatedUser = await this.usersService.create({
      ...user,
      ...updateUserDto,
    });

    const { password, emailVerificationToken, emailVerificationTokenExpires, ...result } = updatedUser;
    return result;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [User] })
  async findAll(): Promise<UserResponse[]> {
    const users = await this.usersService.findAllUsers();
    return users.map(user => {
      const { password, emailVerificationToken, emailVerificationTokenExpires, ...result } = user;
      return result;
    });
  }
}
