import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const NewUserSchema = z.object({
  email: z.string(),
})

export class CreateUserDto extends createZodDto(NewUserSchema) {}
