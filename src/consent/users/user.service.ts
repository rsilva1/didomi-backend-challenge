import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { EmailAlreadyExistsError } from "../../utils/errors";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async get(userId: string) {
    return this.userRepository.findById(userId);
  }

  async create(createUserDto: CreateUserDto) {
    if (await this.userRepository.existsEmail(createUserDto.email)) {
      throw new EmailAlreadyExistsError(createUserDto.email);
    }
    return this.userRepository.create(createUserDto);
  }

  delete(userId: string) {
    return this.userRepository.delete(userId);
  }
}
