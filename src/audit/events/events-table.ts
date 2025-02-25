import { ColumnType, Generated, Insertable } from 'kysely';
import { ConsentTypes } from '../../consent/types';

export interface EventsTable {
  id: Generated<string>;
  user_id: string;
  consent_type: ConsentTypes;
  allow: boolean;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, never, never>;
}

export type NewEvents = Insertable<EventsTable>;
