import { Inject, Injectable } from '@nestjs/common';
import { Database } from '../database/database';
import { UpdateConsentsDto } from './dto/update-consents.dto';
import { UserConsent } from '../types';
import { ConsentsUpdate, NewConsent } from './consents-table';
import { CONSENT_DATABASE } from "../../constants";

@Injectable()
export class ConsentRepository {
  constructor(
    @Inject(CONSENT_DATABASE) private readonly database: Database,
  ) {}

  async upsertMany(user: UserConsent, params: UpdateConsentsDto) {
    const now = new Date().toISOString();

    const newConsents: NewConsent[] = params.consents
      .filter(
        (consent) =>
          user.consents.findIndex(
            (userConsent) => userConsent.id == consent.id,
          ) == -1,
      )
      .map((consent) => ({
        user_id: params.user.id,
        consent_type: consent.id,
        allow: consent.enabled,
        updated_at: now,
      }));

    const editConsents: ConsentsUpdate[] = params.consents
      .filter(
        (consent) =>
          user.consents.findIndex(
            (userConsent) => userConsent.id == consent.id,
          ) != -1,
      )
      .map((consent) => ({
        user_id: params.user.id,
        consent_type: consent.id,
        allow: consent.enabled,
        updated_at: now,
      }));

    return await this.database.transaction().execute(async (trx) => {
      const insertedConsents =
        newConsents.length > 0
          ? await trx
              .insertInto('consents')
              .values(newConsents)
              .returning(['consent_type', 'allow'])
              .execute()
          : [];
      const updatedConsents = await Promise.all(
        editConsents.map((consent) => {
          return trx
            .updateTable('consents')
            .set(consent)
            .where((eb) =>
              eb.and([
                eb('user_id', '=', consent.user_id!),
                eb('consent_type', '=', consent.consent_type!),
              ]),
            )
            .executeTakeFirst();
        }),
      );
      return [...insertedConsents, ...updatedConsents];
    });
  }
}
