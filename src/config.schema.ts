import { z } from 'zod';

export const configZodSchema = z.object({
  CONSENT_DATABASE_URL: z.string(),
  AUDIT_DATABASE_URL: z.string(),
});
