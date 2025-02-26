import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types";
import { AppModule } from "../src/app.module";
import * as request from 'supertest';
import { ConfigService } from "@nestjs/config";
import { AUDIT_DATABASE, CONSENT_DATABASE } from "../src/constants";
import { Database as ConsentDatabase } from "../src/consent/database/database";
import { Database as AuditDatabase } from "../src/audit/database/database";
import { createUser } from "./test-utils";

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;
  let consentDb: ConsentDatabase;
  let auditDb: AuditDatabase;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string) => ({
          CONSENT_DATABASE_URL: "postgres://postgres:postgres@127.0.0.1:5434/test-consent-db",
          AUDIT_DATABASE_URL: "postgres://postgres:postgres@127.0.0.1:5435/test-audit-db",
        }[key])
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // clear DB
    consentDb = app.get(CONSENT_DATABASE);
    await consentDb.deleteFrom('users').execute();
    auditDb = app.get(AUDIT_DATABASE);
    await auditDb.deleteFrom('consent_events').execute();
  })

  describe('/users (POST)', () => {
    it('creates and return new user with empty consents', async () => {
      const httpServer = app.getHttpServer();
      const response = await request(httpServer)
        .post('/users')
        .send({email: 'new-user@email.com'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => res.body)

      expect(response).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: "new-user@email.com",
          consents: [],
        })
      )
    })

    it('rejects repeated email', async () => {
      const httpServer = app.getHttpServer();
      await request(httpServer)
        .post('/users')
        .send({email: 'new-user@email.com'})
      const response = await request(httpServer)
        .post('/users')
        .send({email: 'new-user@email.com'})
        .expect(400)
        .then(res => res.body)
      expect(response.message).toStrictEqual(
        expect.stringMatching(/email.*already exists/i)
      )
    })
  })

  describe('/users/:userId (GET)', () => {
    let userId: string;

    beforeEach(async () => {
      userId = await createUser(consentDb, "someone@email.com")
      await consentDb
        .insertInto('consents')
        .values([
          { user_id: userId, consent_type: 'sms_notifications', allow: true },
          { user_id: userId, consent_type: 'email_notifications', allow: false },
        ]).execute()
    })

    it('returns user and consents', async () => {
      const httpServer = app.getHttpServer();
      const response = await request(httpServer)
        .get(`/users/${userId}`)
        .expect(200)
        .then(res => res.body)
      expect(response).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: "someone@email.com",
          consents: expect.arrayContaining([
            { id: 'sms_notifications', enabled: true },
            { id: 'email_notifications', enabled: false },
          ]),
        })
      )
    })

    it('rejects invalid id', async () => {
      const httpServer = app.getHttpServer();
      await request(httpServer)
        .get('/users/001')
        .expect(400)
    })

    it('rejects inexistent id', async () => {
      const httpServer = app.getHttpServer();
      await request(httpServer)
        .post('/users/4ebbb59f-f1e7-4101-adee-faa535cb96f1')
        .expect(404)
    })
  })

  describe('/users/:userId (DELETE)', () => {
    let jimId: string;
    let tomId: string;
    beforeEach(async () => {
      jimId = await createUser(consentDb, "jim@email.com")
      tomId = await createUser(consentDb, "tom@email.com")
      await consentDb
        .insertInto('consents')
        .values([
          { user_id: jimId, consent_type: 'sms_notifications', allow: true },
          { user_id: jimId, consent_type: 'email_notifications', allow: false },
          { user_id: tomId, consent_type: 'email_notifications', allow: true },
        ]).execute()
      const now = new Date().toISOString();
      await auditDb
        .insertInto('consent_events')
        .values([
          { user_id: jimId, consent_type: 'sms_notifications', allow: true, created_at: now },
          { user_id: jimId, consent_type: 'email_notifications', allow: false, created_at: now },
          { user_id: tomId, consent_type: 'email_notifications', allow: true, created_at: now },
        ]).execute()
    })

    it('deletes user and consents', async () => {
      const httpServer = app.getHttpServer();
      await request(httpServer)
        .delete(`/users/${jimId}`)
        .expect(204)
      await request(httpServer)
        .get(`/users/${jimId}`)
        .expect(404)
      const jimConsents = await consentDb
        .selectFrom('consents')
        .where('user_id', '=', jimId)
        .execute();
      expect(jimConsents).toHaveLength(0);
    })

    it('keep audit entries', async () => {
      const httpServer = app.getHttpServer();
      await request(httpServer)
        .delete(`/users/${jimId}`)
        .expect(204)
      const jimAuditConsents = await auditDb
        .selectFrom('consent_events')
        .where('user_id', '=', jimId)
        .execute();
      expect(jimAuditConsents).toHaveLength(2);
    })

    it('rejects invalid id', async () => {
      const httpServer = app.getHttpServer();
      await request(httpServer)
        .delete(`/users/jim`)
        .expect(400)
    })

    it('rejects inexistent id', async () => {
      const httpServer = app.getHttpServer();
      await request(httpServer)
        .delete(`/users/${jimId}`)
        .expect(204)
      await request(httpServer)
        .post(`/users/${jimId}`)
        .expect(404)
    })
  })
})
