import { Injectable } from "@nestjs/common";
import { Database } from "../database/database";
import { CreateUserDto } from "./dto/create-user";

@Injectable()
export class UserRepository {
  constructor(private readonly database: Database) {}

  async findById(userId: string) {
    return this.database
      .selectFrom('users')
      .where('id', '=', userId)
      .execute();
  }

  async create(createUserDto: CreateUserDto) {
    return this.database
      .insertInto('users')
      .values({
        email: createUserDto.email,
      })
      .returning(['id', 'email'])
      .executeTakeFirstOrThrow();
  }
}
