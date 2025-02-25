import { Inject, Injectable } from '@nestjs/common';
import { Database } from '../database/database';
import { CreateUserDto } from './dto/create-user.dto';
import { invariant } from '../../utils/utils';
import { UserDeletionError, UserNotFoundError } from '../../utils/errors';
import { Consent, UserConsent } from '../types';

@Injectable()
export class UserRepository {
  constructor(
    @Inject('CONSENT_DATABASE') private readonly database: Database,
  ) {}

  async findById(userId: string): Promise<UserConsent> {
    const rows = await this.database
      .selectFrom('users')
      .where('users.id', '=', userId)
      .leftJoin('consents', 'consents.user_id', 'users.id')
      .select([
        'users.id as id',
        'users.email as email',
        'consents.consent_type as consent_id',
        'consents.allow as enabled',
      ])
      .execute();

    invariant(rows.length > 0, UserNotFoundError, userId);

    const consents: Consent[] = rows
      .filter((row) => !!row.consent_id)
      .map((row) => ({
        id: row.consent_id!,
        enabled: row.enabled!,
      }));
    return {
      id: rows[0].id,
      email: rows[0].email,
      consents,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<UserConsent> {
    const row = await this.database
      .insertInto('users')
      .values({
        email: createUserDto.email,
      })
      .returning(['id', 'email'])
      .executeTakeFirstOrThrow();

    return {
      ...row,
      consents: [],
    };
  }

  async delete(userId: string): Promise<void> {
    const result = await this.database
      .deleteFrom('users')
      .where('id', '=', userId)
      .executeTakeFirst();

    invariant(result.numDeletedRows == BigInt(1), UserDeletionError, userId);
  }
}
