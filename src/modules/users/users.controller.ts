import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dtos/user.dto';
import { Public } from 'src/lib/public-route';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() user: CreateUserDTO) {
    return await this.usersService.create(user);
  }

  @Get('loggedUser')
  async getLoggedUser(@Request() req) {
    return req.user;
  }
}
