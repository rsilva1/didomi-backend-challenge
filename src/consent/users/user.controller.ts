import { Body, Controller, Delete, Get, HttpCode, Param, Post } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user";
import { UserService } from "./user.service";

@Controller("/users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":userId")
  async get(
    @Param('userId') userId: string
  ): Promise<any> {
    return this.userService.get(userId);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Delete(":userId")
  @HttpCode(200)
  deleteUser(
    @Param('userId') userId: string
  ) {
    return this.userService.delete(userId)
  }
}
