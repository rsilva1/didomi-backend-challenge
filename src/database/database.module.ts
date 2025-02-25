import { DynamicModule } from '@nestjs/common';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database as ConsentDatabase } from '../consent/database/database';
import { Database as AuditDatabase } from '../audit/database/database';
import { ConfigModule, ConfigService } from '@nestjs/config';

type DbName = 'consent' | 'audit';

export const CONSENT_DATABASE = 'CONSENT_DATABASE';
export const AUDIT_DATABASE = 'AUDIT_DATABASE';

export class DatabaseModule {
  static forRootAsync(options: { dbName: DbName }): DynamicModule {
    const { dbName } = options;
    const dbToken = this.getDbToken(dbName);
    return {
      module: DatabaseModule,
      global: true,
      imports: [ConfigModule],
      exports: [dbToken],
      providers: [
        {
          provide: dbToken,
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const connectionUrl =
              dbName == 'consent'
                ? configService.get<string>('CONSENT_DATABASE_URL')!
                : configService.get<string>('AUDIT_DATABASE_URL')!;

            const dialect = new PostgresDialect({
              pool: new Pool({
                connectionString: connectionUrl,
              }),
            });
            const Database =
              dbName == 'consent' ? ConsentDatabase : AuditDatabase;
            return new Database({
              dialect,
            });
          },
        },
      ],
    };
  }

  private static getDbToken(
    dbName: DbName,
  ): typeof CONSENT_DATABASE | typeof AUDIT_DATABASE {
    if (dbName == 'consent') {
      return CONSENT_DATABASE;
    } else if (dbName == 'audit') {
      return AUDIT_DATABASE;
    }
    throw new Error(`No token for ${dbName}`);
  }
}
