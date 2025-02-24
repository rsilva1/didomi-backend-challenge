import { Kysely, sql } from "kysely";

const TABLE_NAME = 'users';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TABLE_NAME)
    .addColumn('id', 'uuid', (col) => col.defaultTo(sql`gen_random_uuid()`).primaryKey())
    .addColumn('email', 'varchar', (col) => col.notNull().unique())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(TABLE_NAME).execute()
}
