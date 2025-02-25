import { Kysely, sql } from "kysely";

const TABLE_NAME = 'consents';
const TYPE_CONSENT_TYPES = 'consent_types';
const CONSENT_TYPES = ['email_notifications', 'sms_notifications'];

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType(TYPE_CONSENT_TYPES)
    .asEnum(CONSENT_TYPES)
    .execute();

  await db.schema
    .createTable(TABLE_NAME)
    .addColumn('id', 'uuid', (col) => col.defaultTo(sql`gen_random_uuid()`).primaryKey())
    .addColumn('user_id', 'uuid', (col) =>
      col.references('users.id').onDelete('cascade')
    )
    .addColumn('consent_type', sql`consent_types`, (col) => col.notNull())
    .addColumn('allow', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(TABLE_NAME).execute()
  await db.schema.dropType(TYPE_CONSENT_TYPES).ifExists().execute()
}
