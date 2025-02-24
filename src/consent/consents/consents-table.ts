import { ColumnType, Generated } from "kysely";

export type ConsentsType = "email_notifications" | "sms_notifications";

export interface ConsentsTable {
  id: Generated<string>;
  user_id: string;
  consent_type: ConsentsType;
  allow: boolean;
  created_at: ColumnType<Date, string | undefined, never>
  updated_at: ColumnType<Date, string | undefined, string>
}
