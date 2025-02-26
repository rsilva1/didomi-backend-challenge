import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types";
import { AppModule } from "../src/app.module";
import * as request from 'supertest';
import { ConfigService } from "@nestjs/config";
import { AUDIT_DATABASE, CONSENT_DATABASE } from "../src/constants";
import { Database as ConsentDatabase } from "../src/consent/database/database";
import { Database as AuditDatabase } from "../src/audit/database/database";
import { createUser, requestConsentUpdate } from "./test-utils";

describe('ConsentController (e2e)', () => {
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

  describe('/events (POST)', () => {
    let userId: string;

    beforeEach(async () => {
      userId = await createUser(consentDb, "user@email.com")
    })

    it("rejects empty consents array", async () => {
      const httpServer = app.getHttpServer();
      await request(httpServer)
        .post('/events')
        .send({
          user: { id: userId },
          consents: []
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
    })

    it.each([
      ["+sms", [{ id: "sms_notifications", "enabled": true }]],
      ["-sms", [{ id: "sms_notifications", "enabled": false }]],
      ["+sms-email", [
        { id: "sms_notifications", "enabled": true },
        { id: "email_notifications", "enabled": false },
      ]],
      ["+sms+email", [
        { id: "sms_notifications", "enabled": true },
        { id: "email_notifications", "enabled": true },
      ]],
    ])
      ('%s - upsert consents for user', async (_name, consents) => {
      const httpServer = app.getHttpServer();
      const response = await request(httpServer)
        .post('/events')
        .send({
          user: { id: userId },
          consents
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => res.body)

      expect(response).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: "user@email.com",
          consents,
        })
      )
    })

    it('rejects on wrong userId', async () => {
      const httpServer = app.getHttpServer();
      await request(httpServer)
        .post('/events')
        .send({
          user: { id: "f56a3782-e454-4415-9721-119b4803eff1" },
          consents: []
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
    })

    it('rejects on wrong consent id', async () => {
      const httpServer = app.getHttpServer();
      await request(httpServer)
        .post('/events')
        .send({
          user: { id: userId },
          consents: [{
            id: "letter_notification",
            enabled: true
          }]
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
    })

    it('reflects latest updates and track changes for audition', async () => {
      const httpServer = app.getHttpServer();
      await requestConsentUpdate(
        httpServer,
        userId,
        [{ id: "sms_notifications", enabled: true }]
      )
      await requestConsentUpdate(
        httpServer,
        userId,
        [
          { id: "sms_notifications", enabled: false },
          { id: "email_notifications", enabled: true },
        ]
      )
      await requestConsentUpdate(
        httpServer,
        userId,
        [
          { id: "sms_notifications", enabled: true },
        ]
      )
      const response = await request(httpServer)
        .get(`/users/${userId}`)
        .expect(200)
        .then(res => res.body)
      expect(response).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: "user@email.com",
          consents: expect.arrayContaining([
            { id: 'sms_notifications', enabled: true },
            { id: 'email_notifications', enabled: true },
          ]),
        })
      )
      const rows = await auditDb
        .selectFrom('consent_events')
        .select(['consent_type', 'allow'])
        .orderBy('created_at asc')
        .execute();
      const auditRows = rows.map(row => {
        return [row.consent_type, row.allow]
      })
      expect(auditRows).toHaveLength(4);
      expect(auditRows[0]).toStrictEqual(["sms_notifications", true]);
      expect(auditRows.slice(1, 3)).toStrictEqual(
        expect.arrayContaining([
          ["sms_notifications", false],
          ["email_notifications", true],
        ])
      );
      expect(auditRows[3]).toStrictEqual(["sms_notifications", true]);
    })
  })
})
