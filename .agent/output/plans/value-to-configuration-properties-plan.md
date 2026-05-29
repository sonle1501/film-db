# User's intent
The user wants to refactor all `@Value` field injections in the Java backend modular monolith. They approved replacing these annotations with modern class-based configurations, specifically using Spring Boot's `@ConfigurationProperties` bound to immutable Java `record` classes. 

Based on design feedback, the user selected:
* **Approach A:** Localized / Module-Specific configurations.
* **Prefix Namespace:** Custom `app` namespace (moving away from legacy `spring` namespace for custom properties).
* **Duration Binding:** `java.time.Duration` for all temporal configuration properties (like JWT and refresh token expiration).

# Results

## 1. Finalized Architectural Design

We will implement **Approach A (Localized/Module-Specific Config)**. Configuration properties are grouped logically and defined in the module that owns them. Since `shared` is a dependency of other modules, properties used across multiple modules (such as Security properties) or in utility services inside `shared` will be placed in `dev.sonle.filmdb.shared.config`. Module-specific configurations (such as Dataset and script locations) will be placed in `dev.sonle.filmdb.importer.config`.

### Namespace Shift & Property Consolidation
All custom configurations are moved to the `app.*` namespace. We consolidate the JWT expiration and refresh token expiration under `app.security.jwt`.

The new property mappings in `application.yml` will be:
* `spring.security.jwt.secret-key` -> `app.security.jwt.secret-key`
* `spring.security.jwt.expiration` -> `app.security.jwt.expiration`
* `spring.security.refresh-token` / `application.security.jwt.refresh-expiration` -> `app.security.jwt.refresh-expiration`
* `spring.dataset.location` -> `app.importer.dataset.location`
* `app.tmdb.bearer-token` -> `app.tmdb.bearer-token` (unchanged prefix)
* `app.tmdb.image-base-url` -> `app.tmdb.image-base-url` (unchanged prefix)

---

## 2. Structured Configurations (Records)

### 2.1. Shared Module Configurations
Defined under package `dev.sonle.filmdb.shared.config`:

#### `TmdbProperties.java`
```java
package dev.sonle.filmdb.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "app.tmdb")
public record TmdbProperties(
    String bearerToken,
    @DefaultValue("https://image.tmdb.org/t/p/w500") String imageBaseUrl
) {}
```

#### `SecurityProperties.java`
```java
package dev.sonle.filmdb.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.time.Duration;

@ConfigurationProperties(prefix = "app.security")
public record SecurityProperties(
    Jwt jwt
) {
    public record Jwt(
        String secretKey,
        Duration expiration,
        Duration refreshExpiration
    ) {}
}
```

### 2.2. Importer Module Configuration
Defined under package `dev.sonle.filmdb.importer.config`:

#### `ImporterProperties.java`
```java
package dev.sonle.filmdb.importer.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.core.io.Resource;

@ConfigurationProperties(prefix = "app.importer")
public record ImporterProperties(
    Dataset dataset,
    Scripts scripts
) {
    public record Dataset(
        @DefaultValue("dataset/") String location
    ) {}

    public record Scripts(
        @DefaultValue("classpath:db/script/swap_staging_tables.sql") Resource swapStagingTables,
        @DefaultValue("classpath:db/script/drop_staging_indexes.sql") Resource dropStagingIndexes,
        @DefaultValue("classpath:db/script/create_staging_indexes.sql") Resource createStagingIndexes,
        @DefaultValue("classpath:db/script/wipe_staging_tables.sql") Resource wipeStagingTables
    ) {}
}
```

---

## 3. Step-by-Step Refactoring Roadmap

### Step 1: Update Build Files
Add `spring-boot-configuration-processor` to enable configuration metadata generation and compilation.
* Update `gradle/libs.versions.toml` with `spring-boot-configuration-processor`.
* Include `annotationProcessor(libs.spring-boot-configuration-processor)` in:
  - `modules/shared/build.gradle.kts`
  - `modules/importer/build.gradle.kts`

### Step 2: Update application.yml
Define configurations under the custom `app` namespace with unit suffixes (`ms`) so they bind successfully to `java.time.Duration`:
```yaml
app:
  security:
    jwt:
      secret-key: ${JWT_SECRET}
      expiration: ${JWT_EXPIRATION}ms
      refresh-expiration: ${REFRESH_TOKEN_EXPIRATION}ms
  tmdb:
    bearer-token: ${TMDB_BEARER_TOKEN:}
    image-base-url: https://image.tmdb.org/t/p/w500
  importer:
    dataset:
      location: dataset/
```

### Step 3: Enable Annotation Scan
Annotate the main class `FilmDbApplication.java` with `@ConfigurationPropertiesScan(basePackages = "dev.sonle.filmdb")` to scan all modular config classes automatically.

### Step 4: Write Configuration Record Files
Create the three configuration record classes:
* `dev.sonle.filmdb.shared.config.TmdbProperties`
* `dev.sonle.filmdb.shared.config.SecurityProperties`
* `dev.sonle.filmdb.importer.config.ImporterProperties`

### Step 5: Refactor Class Injections
* **`JwtService.java`**: Inject `SecurityProperties`. Retrieve values using `securityProperties.jwt().secretKey()` and `securityProperties.jwt().expiration().toMillis()`.
* **`TmdbImageService.java`**: Inject `TmdbProperties`. Retrieve values via `tmdbProperties.bearerToken()` and `tmdbProperties.imageBaseUrl()`.
* **`ImdbDatasetPipeline.java`**: Inject `ImporterProperties`. Retrieve dataset directory with `importerProperties.dataset().location()`.
* **`ImdbImportService.java`**: Inject `ImporterProperties`. Load `importerProperties.scripts().swapStagingTables()`.
* **`ImdbIndexService.java`**: Inject `ImporterProperties`. Load `importerProperties.scripts().dropStagingIndexes()` and `createStagingIndexes()`.
* **`ImdbWiperService.java`**: Inject `ImporterProperties`. Load `importerProperties.scripts().wipeStagingTables()`.
* **`AuthController.java`**: Inject `SecurityProperties`. Pass `securityProperties.jwt().refreshExpiration().toMillis()` to cookie configuration.
* **`RefreshTokenService.java`**: Inject `SecurityProperties`. Set the expiration time using `Instant.now().plus(securityProperties.jwt().refreshExpiration())`.

### Step 6: Validate the Changes
Run compilation and start the application server to verify that all properties bind correctly.
