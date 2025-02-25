import { Kysely, sql } from "kysely";

const TABLE_NAME = 'consent_events';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TABLE_NAME)
    .addColumn('id', 'uuid', (col) => col.defaultTo(sql`gen_random_uuid()`).primaryKey())
    .addColumn('user_id', 'uuid', (col) => col.notNull())
    .addColumn('consent_type', 'varchar', (col) => col.notNull())
    .addColumn('allow', 'boolean', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex(`${TABLE_NAME}_user_id_index`)
    .on(TABLE_NAME)
    .column('user_id')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(TABLE_NAME).execute()
}
