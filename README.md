## Description

Preference Center

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

Copy `.env.example` into `.env`

```bash
cp .env.example .env
```

Then, start up database instances

```bash
docker-compose -f docker-compose.dev.yml up
```

Run the migrations
```bash
pnpm migrate:consent
pnpm migrate:audit
```

(if needed to change ports in `docker-compose.dev.yml`, edit the `.env` accordingly)

Run the application:

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

```

## Run tests

Start database instances for tests:

```bash
docker-compose -f docker-compose.test.yml up
```

Once the containers are up, apply the migrations:

```bash
pnpm test:e2e:prepare
```

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

