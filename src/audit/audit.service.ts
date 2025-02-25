import { Injectable } from "@nestjs/common";

@Injectable()
export class AuditService {
   async createMany(params: any) {
    console.log("AuditService createMany to be implemented")
  }
}
