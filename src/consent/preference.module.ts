import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { configZodSchema } from "../config.schema";
import { APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { UserModule } from "./users/user.module";
import { ConsentModule } from "./consents/consent.module";

@Module({
  imports: [
    UserModule,
    ConsentModule,
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connectionUrl: configService.get('CONSENT_DATABASE_URL')!,
      })
    }),
    ConfigModule.forRoot({
      validate: configZodSchema.parse,
    }),
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    }
  ]
})
export class PreferenceModule {}
