import { Injectable } from "@nestjs/common";
import { UpdateConsentsDto } from "./dto/update-consents.dto";
import { UserRepository } from "../users/user.repository";
import { ConsentRepository } from "./consent.repository";
import { UserConsent } from "../types";
import { AuditService } from "../../audit/audit.service";

@Injectable()
export class ConsentService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly consentRepository: ConsentRepository,
    private readonly auditService: AuditService,
  ) {}

  // we audit (save) the whole operation, even if part of it may not update current "enabled"
  // distributed transaction x single DB design x "fire and forget" approach
  async update(params: UpdateConsentsDto): Promise<UserConsent> {
    const userId = params.user.id;
    const user = await this.userRepository.findById(userId);

    const [
      preferencesResult,
      auditResult,
    ] = await Promise.allSettled([
      this.consentRepository.upsertMany(user, params),
      this.auditService.createMany(params),
    ])

    if (preferencesResult.status == "rejected" || auditResult.status == "rejected") {
      // rollback somehow
    }

    return this.userRepository.findById(userId);
  }
}
