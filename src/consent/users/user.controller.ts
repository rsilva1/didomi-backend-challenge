import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { uuidSchema } from '../types';

@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  async get(
    @Param('userId', new ZodValidationPipe(uuidSchema)) userId: string,
  ): Promise<any> {
    return this.userService.get(userId);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Delete(':userId')
  @HttpCode(204)
  deleteUser(
    @Param('userId', new ZodValidationPipe(uuidSchema)) userId: string,
  ) {
    return this.userService.delete(userId);
  }
}
