import { Body, Controller, Post } from '@nestjs/common';
import { ConsentService } from './consent.service';
import { UpdateConsentsDto } from './dto/update-consents.dto';

@Controller('/events')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post()
  create(@Body() updateConsentsDto: UpdateConsentsDto) {
    return this.consentService.update(updateConsentsDto);
  }
}
