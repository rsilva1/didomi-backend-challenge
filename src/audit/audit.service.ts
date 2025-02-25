import { Injectable } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { UpdateConsentsDto } from '../consent/consents/dto/update-consents.dto';

@Injectable()
export class AuditService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async createMany(params: UpdateConsentsDto) {
    return this.eventsRepository.createMany(params);
  }
}
