import { Injectable } from "@nestjs/common";

@Injectable()
export class FailService {
  async onConsentUpdateFail(params: any) {
    // might be as complex as needed
    // e.g. send logs to external service, send a slack alert
    // add a specific message to a queue, etc...
    console.error("onConsentUpdateFail: ", params);
  }
}
