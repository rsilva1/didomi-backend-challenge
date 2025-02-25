import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { DatabaseModule } from '../database/database.module';
import { EventsRepository } from './events.repository';

@Module({
  imports: [DatabaseModule.forRootAsync({ dbName: 'audit' })],
  providers: [AuditService, EventsRepository],
  exports: [AuditService],
})
export class AuditModule {}
