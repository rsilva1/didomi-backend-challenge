import { Global, Module } from "@nestjs/common";
import { ConfigurableDatabaseModule, DATABASE_OPTIONS } from "./database.module-definition";
import { Database } from "./database";
import { DatabaseOptions } from "./database-options";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";

@Global()
@Module({
  exports: [Database],
  providers: [
    {
      provide: Database,
      inject: [DATABASE_OPTIONS],
      useFactory: (databaseOptions: DatabaseOptions) => {
        const dialect = new PostgresDialect({
          pool: new Pool({
            connectionString: databaseOptions.connectionUrl,
          }),
        });
        return new Database({
          dialect,
        })
      }
    }
  ]
})
export class DatabaseModule extends ConfigurableDatabaseModule {}
