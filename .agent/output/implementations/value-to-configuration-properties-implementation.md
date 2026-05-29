# User's intent
The user wants to refactor all `@Value` field injections in the Java backend modular monolith. They requested replacing these annotations with modern class-based configurations, specifically using Spring Boot's `@ConfigurationProperties` bound to immutable Java `record` classes. 

Based on design feedback, they selected:
1. **Approach A:** Localized / Module-Specific configuration classes.
2. **Prefix Namespace:** Custom `app` namespace instead of legacy `spring` namespace for custom fields.
3. **Duration Binding:** `java.time.Duration` for all temporal configuration properties (JWT and refresh token expiration).

# Results

All proposed changes from the plan have been successfully implemented:

## 1. Build and Dependency Configuration
* **[libs.versions.toml](file:///s:/Coding/Projects/film-db/gradle/libs.versions.toml):** Added `spring-boot-configuration-processor` dependency definition under `[libraries]`.
* **[modules/shared/build.gradle.kts](file:///s:/Coding/Projects/film-db/modules/shared/build.gradle.kts) and [modules/importer/build.gradle.kts](file:///s:/Coding/Projects/film-db/modules/importer/build.gradle.kts):** Enabled `annotationProcessor` configuration for the configuration processor to generate property metadata during compilation.

## 2. Configuration Properties Records (Approach A)
* **[TmdbProperties.java](file:///s:/Coding/Projects/film-db/modules/shared/src/main/java/dev/sonle/filmdb/shared/config/TmdbProperties.java):** Created under package `dev.sonle.filmdb.shared.config` to bind TMDB parameters under prefix `app.tmdb`.
* **[SecurityProperties.java](file:///s:/Coding/Projects/film-db/modules/shared/src/main/java/dev/sonle/filmdb/shared/config/SecurityProperties.java):** Created under package `dev.sonle.filmdb.shared.config` to bind JWT secret key and token expirations under prefix `app.security`.
* **[ImporterProperties.java](file:///s:/Coding/Projects/film-db/modules/importer/src/main/java/dev/sonle/filmdb/importer/config/ImporterProperties.java):** Created under package `dev.sonle.filmdb.importer.config` to bind dataset pipeline location and database scripts classpath paths under prefix `app.importer`.

## 3. Annotation Scanning
* **[FilmDbApplication.java](file:///s:/Coding/Projects/film-db/apps/backend/src/main/java/dev/sonle/filmdb/app/FilmDbApplication.java):** Added `@ConfigurationPropertiesScan(basePackages = "dev.sonle.filmdb")` to register all configuration records.

## 4. Application Configuration
* **[application.yml](file:///s:/Coding/Projects/film-db/apps/backend/src/main/resources/application.yml):** Updated custom properties to reside under the clean `app.*` prefix, and added `ms` unit suffixes to ensure smooth binding to `java.time.Duration` fields (e.g. `${JWT_EXPIRATION}ms`).

## 5. Service & Controller Refactoring
* **[JwtService.java](file:///s:/Coding/Projects/film-db/modules/shared/src/main/java/dev/sonle/filmdb/shared/security/JwtService.java):** Replaced `@Value`s with `SecurityProperties` injection. Uses `.toMillis()` for jwt expiration duration.
* **[TmdbImageService.java](file:///s:/Coding/Projects/film-db/modules/shared/src/main/java/dev/sonle/filmdb/shared/utils/TmdbImageService.java):** Replaced `@Value`s with `TmdbProperties` injection.
* **[ImdbDatasetPipeline.java](file:///s:/Coding/Projects/film-db/modules/importer/src/main/java/dev/sonle/filmdb/importer/pipeline/ImdbDatasetPipeline.java):** Replaced `@Value` with `ImporterProperties` injection.
* **[ImdbImportService.java](file:///s:/Coding/Projects/film-db/modules/importer/src/main/java/dev/sonle/filmdb/importer/service/ImdbImportService.java):** Replaced `@Value` script location with `ImporterProperties`.
* **[ImdbIndexService.java](file:///s:/Coding/Projects/film-db/modules/importer/src/main/java/dev/sonle/filmdb/importer/service/ImdbIndexService.java):** Replaced `@Value` script locations with `ImporterProperties`.
* **[ImdbWiperService.java](file:///s:/Coding/Projects/film-db/modules/importer/src/main/java/dev/sonle/filmdb/importer/service/ImdbWiperService.java):** Replaced `@Value` script location with `ImporterProperties`.
* **[AuthController.java](file:///s:/Coding/Projects/film-db/modules/users/src/main/java/dev/sonle/filmdb/users/controller/AuthController.java):** Replaced `@Value` refresh token duration with `SecurityProperties` injection.
* **[RefreshTokenService.java](file:///s:/Coding/Projects/film-db/modules/users/src/main/java/dev/sonle/filmdb/users/service/RefreshTokenService.java):** Replaced `@Value` refresh expiration duration with `SecurityProperties` injection. Computes expiration using `.plus(Duration)`.
