# Database Script Refactoring Plan

## User's intent

The user wants to refactor all database scripts and migrations.
Specifically:
1. Create a new `db2` folder in `apps/backend/src/main/resources`, keeping the old `db` folder intact.
2. Reorganize the migrations in `db2/migration` by consolidating them into logical areas:
   - `imdb` (schema, main tables, staging tables, and indexes)
   - `users` (schema, tables, and relationships)
   - `admin` (schema, audit logs, job history, job logs, and pending requests)
   - `search movie` (search schema, pg_trgm extension, and search materialized view)
3. Retain or adapt scripts in `db2/script` (for staging table index creation, dropping, wiping, and table swapping).
4. Implement a strategy to switch back and forth between index creation commands in migrations and scripts to prevent atomic swapping failures on a clean database initialization.

---

## Results

### Proposed Architectural Redesign

Currently, the DB initialization consists of 9 migration files representing incremental changes, which makes the schema setup fragmented. Additionally, the index swapping strategy in the dataset importer expects indexes to exist on both staging and active tables. On a clean database, before any import runs, the active tables lack these indexes, which causes `swap_staging_tables.sql` to fail when renaming active indexes.

We will consolidate the database setup into 4 clean, sequential migration files in the `db2/migration` folder and configure Spring Boot / Flyway to point to `db2`. We will also copy/adapt the importer scripts into `db2/script` and resolve the index initialization timing issue.

#### Index Initialization Strategy

* **Problem:** `swap_staging_tables.sql` performs:
  `ALTER INDEX imdb.idx_movie_type_year RENAME TO idx_movie_type_year_old;`
  If the active index `imdb.idx_movie_type_year` does not exist (clean database), the rename fails, blocking the import pipeline.
* **Solution (Recommended):** Define and create empty indexes for both the active tables AND the staging tables in the initial schema migration (`V1__init_imdb_schema.sql`).
  - When the app starts, both sets of tables and indexes are created.
  - When the importer runs:
    1. It drops staging indexes using `drop_staging_indexes.sql` to speed up the COPY operation.
    2. It imports data.
    3. It recreates staging indexes using `create_staging_indexes.sql`.
    4. It performs the swap using `swap_staging_tables.sql`. Since both active and staging indexes exist, the renames succeed.

#### Options & Trade-offs Analysis

| Dimension | Option A: Create Main Indexes in Migration (Recommended) | Option B: Dynamic Index Checks in SQL Scripts |
| :--- | :--- | :--- |
| **Pipeline Stability** | High. Swap scripts are simple and guaranteed to succeed on first run. | Medium. Swap script requires complex check logic. |
| **Code Complexity** | Low. Standard SQL syntax in both migrations and scripts. | High. Requires PL/pgSQL block with exception handling in `swap_staging_tables.sql`. |
| **Database Performance** | Main tables are fully indexed from day one. | Main tables remain unindexed until first import completes. |

---

### Proposed Changes

We will create a new folder `db2` containing consolidated schema migrations and copy/maintain support scripts.

#### 1. Database Migrations (`db2/migration/`)

##### [NEW] [V1__init_imdb_schema.sql](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/db2/migration/V1__init_imdb_schema.sql)
* Combine original `V1` and `V4`.
* Create `imdb` schema (implied via Flyway schemas configuration, or explicit).
* Create active tables: `person`, `movie`, `movie_alternative`, `movie_crew`, `movie_episode`, `movie_principal`, `movie_rating`.
* Create staging tables: `person_staging`, `movie_staging`, `movie_alternative_staging`, `movie_crew_staging`, `movie_episode_staging`, `movie_principal_staging`, `movie_rating_staging`.
* **Important Strategy:** Create the base indexes on both active and staging tables:
  * `idx_movie_type_year` on `imdb.movie` & `idx_movie_type_year_staging` on `imdb.movie_staging`
  * `idx_rating_votes_avg` / `_staging` on `imdb.movie_rating` / `imdb.movie_rating_staging`
  * `idx_rating_avg_votes` / `_staging` on `imdb.movie_rating` / `imdb.movie_rating_staging`
  * `idx_movie_episode_parent_season_number` / `_staging` on `imdb.movie_episode` / `imdb.movie_episode_staging`
  * `idx_movie_genres_gin` / `_staging` on `imdb.movie` / `imdb.movie_staging`

##### [NEW] [V2__init_user_schema.sql](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/db2/migration/V2__init_user_schema.sql)
* Combine original `V2` and `V9`.
* Create `users` schema.
* Create tables: `user_auth`, `refresh_token`, `user_profile`, `user_list`, `user_list_details`.
* Define foreign key relationships directly in the table definitions (or as a block at the bottom of the script) to establish immediate referential integrity.

##### [NEW] [V3__init_admin_schema.sql](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/db2/migration/V3__init_admin_schema.sql)
* Combine original `V3`, `V5`, `V7`, and `V8`.
* Create `admin` schema.
* Create `import_job_history` table (with `progress` and `current_stage` columns built-in, excluding the deprecated `logs` JSONB column).
* Create `import_job_log` table (with foreign key constraint to `import_job_history` on delete cascade).
* Create `audit_log` and `pending_request` tables (with `version` column built-in).

##### [NEW] [V4__create_movie_search.sql](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/db2/migration/V4__create_movie_search.sql)
* Replaces original `V6`.
* Create `search` schema.
* Enable `pg_trgm` extension in `public` schema.
* Create `search.movie_search` materialized view and its corresponding GIN and trigram search indexes.

---

#### 2. Importer SQL Scripts (`db2/script/`)

These scripts will be copied from `db/script` into `db2/script` to ensure `db2` is self-contained.

##### [NEW] [create_staging_indexes.sql](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/db2/script/create_staging_indexes.sql)
* Re-create GIN/B-tree indexes on `imdb.*_staging` tables after bulk loading.

##### [NEW] [drop_staging_indexes.sql](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/db2/script/drop_staging_indexes.sql)
* Drop indexes on `imdb.*_staging` tables before starting bulk data copy.

##### [NEW] [swap_staging_tables.sql](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/db2/script/swap_staging_tables.sql)
* Rename active tables/indexes to `_old`.
* Rename staging tables/indexes to active.
* Rename `_old` tables/indexes to staging.

##### [NEW] [wipe_staging_tables.sql](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/db2/script/wipe_staging_tables.sql)
* Truncate all `imdb.*_staging` tables.

---

#### 3. Configuration

##### [MODIFY] [application.yml](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/application.yml)
* Update Flyway migration path:
  `spring.flyway.locations: classpath:db2/migration`
* Update Importer scripts paths:
  `app.importer.scripts.swap-staging-tables: classpath:db2/script/swap_staging_tables.sql`
  `app.importer.scripts.drop-staging-indexes: classpath:db2/script/drop_staging_indexes.sql`
  `app.importer.scripts.create-staging-indexes: classpath:db2/script/create_staging_indexes.sql`
  `app.importer.scripts.wipe-staging-tables: classpath:db2/script/wipe_staging_tables.sql`

---

## Verification Plan

### Automated Verification
* Execute Spring Boot integration tests to ensure the database migrations compile and run correctly on setup.
* Verify that Flyway migrations execute successfully and schemas (`imdb`, `users`, `admin`, `search`) are populated with all required tables, constraints, and indexes.

### Manual Verification
* Run a clean PostgreSQL database container or drop schemas.
* Run the backend app to boot up and run migrations from the new `db2/migration` folder.
* Trigger the dataset import pipeline to verify the drop-load-create-swap cycle executes without any errors.
* Validate search functionality to confirm the materialized view was successfully populated and updated.
