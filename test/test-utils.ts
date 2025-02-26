import * as request from 'supertest';
import { Database as ConsentDatabase } from "../src/consent/database/database";
import { App } from "supertest/types";

export const createUser = async (db: ConsentDatabase, email: string): Promise<string> => {
  const result = await db
    .insertInto('users')
    .values({ email })
    .returning(['id'])
    .executeTakeFirst();
  return result!.id;
}

export const requestConsentUpdate = async (
  httpServer: App,
  userId: string,
  consents: { id: string, enabled: boolean }[],
): Promise<request.Response> => {
  return await request(httpServer)
    .post('/events')
    .send({
      user: { id: userId },
      consents
    })
}
