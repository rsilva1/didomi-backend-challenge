import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { CONSENT_TYPES } from "../../types";

const UpdateConsentsSchema = z.object({
  user: z.object({
    id: z.string(),
  }),
  consents: z.object({
    id: z.enum(CONSENT_TYPES),
    enabled: z.boolean(),
  }).array().nonempty()
})

// tech debt
// deal with repeated consents.id in the array like:
/* "consents": [
 * {"id": "email_notifications","enabled": true}
 * {"id": "email_notifications","enabled": false}
 * {"id": "email_notifications","enabled": true}
 * {"id": "email_notifications","enabled": false}
 * ]
*/
export class UpdateConsentsDto extends createZodDto(UpdateConsentsSchema) {}
