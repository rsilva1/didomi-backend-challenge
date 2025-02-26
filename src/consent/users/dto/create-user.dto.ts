import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
