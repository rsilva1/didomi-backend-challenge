import { Test } from "@nestjs/testing"
import { ConsentService } from "./consent.service"
import { randomUUID } from "crypto"
import { UserRepository } from "../users/user.repository"
import { ConsentRepository } from "./consent.repository"
import { AuditService } from "../../audit/audit.service"
import { FailService } from "./fail.service"
import { InternalError } from "../../utils/errors"

describe('ConsentService', () => {
  describe('update', () => {
    let consentService: ConsentService
    let findById: jest.Mock
    let consentRepositoryUpsertMany: jest.Mock
    let auditServiceCreateMany: jest.Mock
    let failServiceOnConsentUpdateFail: jest.Mock

    beforeEach(async () => {
      findById = jest.fn()
      consentRepositoryUpsertMany = jest.fn()
      auditServiceCreateMany = jest.fn()
      failServiceOnConsentUpdateFail = jest.fn()
      const moduleFixture = await Test.createTestingModule({
        providers: [
          ConsentService,
          {
            provide: UserRepository,
            useValue: { findById }
          },
          {
            provide: ConsentRepository,
            useValue: { upsertMany: consentRepositoryUpsertMany }
          },
          {
            provide: AuditService,
            useValue: { createMany: auditServiceCreateMany }
          },
          {
            provide: FailService,
            useValue: { onConsentUpdateFail: failServiceOnConsentUpdateFail }
          }
        ]
      }).compile()

      consentService = moduleFixture.get<ConsentService>(ConsentService)
    })

    it('updates consents and create audit entries', async () => {
      const userId = randomUUID();
      const email = "someuser@email.com";
      findById.mockResolvedValue({
        id: userId,
        email,
        consents: []
      })
      consentRepositoryUpsertMany.mockResolvedValue([])
      auditServiceCreateMany.mockResolvedValue([])
      const user = await consentService.update({
        user: { id: userId },
        consents: [{ id: "sms_notifications", enabled: true }]
      })
      expect(user).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          consents: expect.any(Array),
        })
      )
      expect(consentRepositoryUpsertMany).toHaveBeenCalled()
      expect(auditServiceCreateMany).toHaveBeenCalled()
      expect(failServiceOnConsentUpdateFail).not.toHaveBeenCalled()
    })

    it('notifies fail system if fails to update consent', async () => {
      const userId = randomUUID();
      const email = "someuser@email.com";
      findById.mockResolvedValue({
        id: userId,
        email,
        consents: []
      })
      consentRepositoryUpsertMany.mockRejectedValue(new Error("unknown"))
      auditServiceCreateMany.mockResolvedValue([])
      failServiceOnConsentUpdateFail.mockResolvedValue(Promise.resolve())
      await expect(async () =>
        await consentService.update({
          user: { id: userId },
          consents: [{ id: "sms_notifications", enabled: true }]
        })
      ).rejects.toThrow(InternalError)
      expect(consentRepositoryUpsertMany).toHaveBeenCalled()
      expect(auditServiceCreateMany).toHaveBeenCalled()
      expect(failServiceOnConsentUpdateFail).toHaveBeenCalled()
    })

    it('notifies fail system if fails to update audit', async () => {
      const userId = randomUUID();
      const email = "someuser@email.com";
      findById.mockResolvedValue({
        id: userId,
        email,
        consents: []
      })
      consentRepositoryUpsertMany.mockResolvedValue([])
      auditServiceCreateMany.mockRejectedValue(new Error("unknown"))
      failServiceOnConsentUpdateFail.mockResolvedValue(Promise.resolve())
      await expect(async () =>
        await consentService.update({
          user: { id: userId },
          consents: [{ id: "sms_notifications", enabled: true }]
        })
      ).rejects.toThrow(InternalError)
      expect(consentRepositoryUpsertMany).toHaveBeenCalled()
      expect(auditServiceCreateMany).toHaveBeenCalled()
      expect(failServiceOnConsentUpdateFail).toHaveBeenCalled()
    })
  })
})
