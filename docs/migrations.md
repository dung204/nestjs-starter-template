# Database Migrations

TypeORM provides a CLI tool to manage migrations, allowing you to create, run, and revert migrations easily. A custom script is added to wrap the TypeORM CLI commands for convenience.

## Creating a Migration

Use the following command to create a new migration file:

```bash
bun migration generate <migration-name>
```

Replace `<migration-name>` with a descriptive name for your migration. This command will generate a new migration file in the `src/base/database/migrations/` directory.

## Running Migrations

To run all pending migrations, use the following command:

```bash
bun migration run
```

If the `src/` directory is available, the command will build the project before running the migrations to ensure that the latest migration is used.

## Reverting Migrations

To revert the last executed migration, use the following command:

```bash
bun migration revert
```