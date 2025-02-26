import { Database as ConsentDatabase } from "../src/consent/database/database";

export const createUser = async (db: ConsentDatabase, email: string): Promise<string> => {
  const result = await db
    .insertInto('users')
    .values({ email })
    .returning(['id'])
    .executeTakeFirst();
  return result!.id;
}

