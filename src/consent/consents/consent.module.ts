import { Module } from "@nestjs/common";
import { ConsentController } from "./consent.controller";
import { ConsentService } from "./consent.service";
import { UserRepository } from "../users/user.repository";
import { ConsentRepository } from "./consent.repository";
import { AuditService } from "../../audit/audit.service";

@Module({
  controllers: [ConsentController],
  providers: [
    ConsentService,
    UserRepository,
    ConsentRepository,
    AuditService,
  ],
})
export class ConsentModule {}
