import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configZodSchema } from '../config.schema';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { UserModule } from './users/user.module';
import { ConsentModule } from './consents/consent.module';
import { InternalExceptionFilter } from './internal-exception.filter';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    UserModule,
    ConsentModule,
    DatabaseModule.forRootAsync({ dbName: 'consent' }),
    ConfigModule.forRoot({
      validate: (config) => configZodSchema.parse(config),
    }),
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: InternalExceptionFilter,
    },
  ],
})
export class PreferenceModule {}
