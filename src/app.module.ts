import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from "@nestjs/config";
import { configZodSchema } from "./config.schema";

@Module({
  imports: [ConfigModule.forRoot({
    validate: configZodSchema.parse,
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
