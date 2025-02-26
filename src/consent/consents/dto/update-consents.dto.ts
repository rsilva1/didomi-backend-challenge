import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CONSENT_TYPES } from '../../types';

const UpdateConsentsSchema = z.object({
  user: z.object({
    id: z.string().uuid({ message: 'Invalid id' }),
  }),
  consents: z
    .object({
      id: z.enum(CONSENT_TYPES),
      enabled: z.boolean(),
    })
    .array()
    .nonempty()
    .refine((data) => {
      const uniqueIds = new Set(data.map((consent) => consent.id));
      return uniqueIds.size == data.length;
    }, {
      message: "consent id must be unique"
    }),
});

export class UpdateConsentsDto extends createZodDto(UpdateConsentsSchema) {}
