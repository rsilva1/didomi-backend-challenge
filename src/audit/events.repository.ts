import { Inject, Injectable } from '@nestjs/common';
import { Database } from './database/database';
import { UpdateConsentsDto } from '../consent/consents/dto/update-consents.dto';
import { NewEvents } from "./events/events-table";

@Injectable()
export class EventsRepository {
  constructor(@Inject('AUDIT_DATABASE') private readonly database: Database) {}

  async createMany(params: UpdateConsentsDto) {
    const now = new Date().toISOString();
    const newEvents: NewEvents[] = params.consents.map((consent) => ({
      user_id: params.user.id,
      consent_type: consent.id,
      allow: consent.enabled,
      created_at: now,
    }));
    await this.database
      .insertInto("consent_events")
      .values(newEvents)
      .execute()
  }
}
