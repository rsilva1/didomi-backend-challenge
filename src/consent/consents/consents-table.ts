import { ColumnType, Generated, Insertable, Updateable } from 'kysely';
import { ConsentTypes } from '../types';

export interface ConsentsTable {
  id: Generated<string>;
  user_id: string;
  consent_type: ConsentTypes;
  allow: boolean;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string>;
}

export type NewConsent = Insertable<ConsentsTable>;
export type ConsentsUpdate = Updateable<ConsentsTable>;
