import { Kysely } from 'kysely';
import { EventsTable } from '../events/events-table';

interface Tables {
  consent_events: EventsTable;
}

export class Database extends Kysely<Tables> {}
