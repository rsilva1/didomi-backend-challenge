import { Kysely } from "kysely";
import { ConsentsTable } from "../consents/consents-table";
import { UsersTable } from "../users/users-table";

interface Tables {
  users: UsersTable,
  consents: ConsentsTable,
}

export class Database extends Kysely<Tables> {}
