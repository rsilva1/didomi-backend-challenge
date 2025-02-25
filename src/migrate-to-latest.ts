// based on https://kysely.dev/docs/migrations#running-migrations

import * as path from 'path';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider,
} from 'kysely';
import { ConfigService } from '@nestjs/config';
import { Database } from './consent/database/database';

const configService = new ConfigService();

type DbName = 'consent' | 'audit';

function getConnectionString(dbName: DbName) {
  const dbUrl: Record<DbName, string> = {
    consent: configService.get('CONSENT_DATABASE_URL')!,
    audit: configService.get('AUDIT_DATABASE_URL')!,
  };
  return dbUrl[dbName];
}

function getMigrationFolder(dbName: DbName) {
  const migrationFolder: Record<DbName, string> = {
    consent: 'migrations/consent',
    audit: 'migrations/audit',
  };
  // This needs to be an absolute path.
  return path.join(__dirname, migrationFolder[dbName]);
}

async function migrateToLatest(dbName: DbName) {
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: getConnectionString(dbName),
      }),
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: getMigrationFolder(dbName),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

const dbName = process.argv
  .find((arg) => arg.startsWith('--dbname'))
  ?.split('=')[1] as DbName;
console.log(`Checking migrations for database: ${dbName}.`);
migrateToLatest(dbName);
