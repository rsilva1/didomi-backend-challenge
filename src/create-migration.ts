import * as path from 'path';
import { promises as fs } from 'fs';

type DbName = 'consent' | 'audit';

function createdAt() {
  const now = new Date();
  return now.toISOString().replaceAll(/T|Z|-|:|\./g, '');
}

function getMigrationFolder(dbName: DbName) {
  const migrationFolder: Record<DbName, string> = {
    consent: 'migrations/consent',
    audit: 'migrations/audit',
  };
  // This needs to be an absolute path.
  return path.join(__dirname, migrationFolder[dbName]);
}

async function createMigrationFile(dbName: DbName, name: string) {
  const filepath = path.join(
    getMigrationFolder(dbName),
    `${createdAt()}-${name}.ts`,
  );
  fs.writeFile(filepath, '', { flag: 'w' })
    .then(() => console.log(`Succesfully created file ${filepath}`))
    .catch((err) => console.log('Error: ', err));
}

const dbName = process.argv
  .find((arg) => arg.startsWith('--dbname'))
  ?.split('=')[1] as DbName;
const name = process.argv
  .find((arg) => arg.startsWith('--name'))
  ?.split('=')[1] as string;
createMigrationFile(dbName, name);
