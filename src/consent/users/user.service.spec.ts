import { Provider } from "@nestjs/common";
import { Test } from "@nestjs/testing"
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { randomUUID } from "crypto";
import { CreateUserDto } from "./dto/create-user.dto";
import { EmailAlreadyExistsError } from "../../utils/errors";

describe('UserService', () => {
  let userService: UserService;
  let existsEmailFn: jest.Mock;
  let mockUserRepository: Provider;

  beforeEach(async () => {
    existsEmailFn = jest.fn().mockReturnValue(false)
    mockUserRepository = {
      provide: UserRepository,
      useValue: {
        existsEmail: existsEmailFn,
        create: (params: CreateUserDto) => Promise.resolve({
          id: randomUUID(),
          email: params.email,
          consents: [],
        })
      }
    }

    const moduleFixture = await Test.createTestingModule({
      providers: [UserService, mockUserRepository],
    }).compile();

    userService = moduleFixture.get<UserService>(UserService);
  })
  describe('create', () => {
    it('throws when given already existing email', async () => {
      existsEmailFn.mockReturnValue(true);
      await expect(async () =>
        await userService.create({ email: "someone@email.com" })
      ).rejects.toThrow(EmailAlreadyExistsError);
    })

    it('creates user', async () => {
      const user = await userService.create({ email: "someone@email.com" });
      expect(user).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: "someone@email.com",
          consents: []
        })
      )
    })
  })
})
