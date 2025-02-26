import { Module } from '@nestjs/common';
import { ConsentController } from './consent.controller';
import { ConsentService } from './consent.service';
import { UserRepository } from '../users/user.repository';
import { ConsentRepository } from './consent.repository';
import { AuditModule } from '../../audit/audit.module';
import { FailService } from "./fail.service";

@Module({
  imports: [AuditModule],
  controllers: [ConsentController],
  providers: [
    ConsentService,
    UserRepository,
    ConsentRepository,
    FailService
  ],
})
export class ConsentModule {}
