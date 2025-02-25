import { Module } from '@nestjs/common';
import { PreferenceModule } from './consent/preference.module';

@Module({
  imports: [PreferenceModule],
})
export class AppModule {}
