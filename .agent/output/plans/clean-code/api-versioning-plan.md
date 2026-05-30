# User's intent
The user wants to refactor the REST API endpoint mappings in the Java backend modular monolith. Currently, the controllers define URLs with hardcoded prefixes (like `@RequestMapping("/api/v1/...")`). The goal is to make the API version prefix reusable, easily changeable (e.g. to `v2`), and configurable externally (e.g., in `application.yml` or environment variables).

The plan should be saved to `.agent/output/plans/refactor/api-versioning-plan.md`.

# Results

## 1. Trade-off Analysis: Implementation Strategies

### Approach A: Spring `PathMatchConfigurer` + Custom `@VersionedApi` Annotation (Recommended)
We create a custom annotation `@VersionedApi` and configure a Spring Boot `WebMvcConfigurer` to dynamically prepend `/api/${app.api.version:v1}` to any controller class annotated with it.

- **Pros:**
  - **No Path Duplication:** Controllers only specify their relative resource paths (e.g. `@RequestMapping("/imdb/film")` instead of `/api/v1/imdb/film`).
  - **Single Source of Version Configuration:** Changing the API version is done in a single property (`app.api.version`) in `application.yml` or using an environment variable.
  - **Highly Selective:** Allows us to easily exclude non-versioned controllers (e.g. `/api/auth` or `/api/admin` if preferred) by omitting the annotation.
- **Cons:**
  - The full URL path is not explicitly written in the controller source code.

### Approach B: Property Placeholders in Controller `@RequestMapping`
We use Spring's property placeholder resolution directly in each controller class (e.g., `@RequestMapping("${app.api.prefix:api/v1}/imdb/film")`).

- **Pros:**
  - **Explicit Paths:** The full path pattern is visible in the controller class annotation.
  - **Simple:** No need to define custom configuration classes or annotations.
- **Cons:**
  - **Boilerplate & Repetitive:** Every controller has to repeat the placeholder string.
  - **High Coupling:** If the property name or path pattern changes, all controllers must be edited.

---

## 2. Trade-off Analysis: Versioning Scope

### Option 1: Selective versioning (Recommended)
Only version public resource APIs (`imdb`, `search`, user profiles/lists), while keeping administration (`/api/admin`) and auth (`/api/auth`) constant.

- **Pros:**
  - Standard REST industry practice: authentication endpoints and internal admin operations are usually decoupled from general API versioning.
  - Fewer endpoints impacted if public data model changes.
- **Cons:**
  - Different URL root prefix structures.

### Option 2: Universal versioning
Version *all* endpoints in the monolithic application, including auth and admin operations (e.g. `/api/v1/auth`, `/api/v1/admin`).

- **Pros:**
  - Full consistency across all controllers.
- **Cons:**
  - Unnecessary changes to simple authentication/admin routes.

---

## 3. Recommended Design

We recommend **Approach A (PathMatchConfigurer + `@VersionedApi`)** combined with **Option 1 (Selective Versioning)**.

### 3.1. Version Property in YAML
Define the configuration property in `application.yml`:
```yaml
app:
  api:
    version: v1
```

### 3.2. Custom Annotation
Create a custom marker annotation in the `shared` module:
```java
package dev.sonle.filmdb.shared.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface VersionedApi {}
```

### 3.3. WebMvcConfigurer Configuration
Add a configuration class in `shared` module config package:
```java
package dev.sonle.filmdb.shared.config;

import dev.sonle.filmdb.shared.annotation.VersionedApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.HandlerTypePredicate;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.api.version:v1}")
    private String apiVersion;

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.addPathPrefix(
            "/api/" + apiVersion,
            HandlerTypePredicate.forAnnotation(VersionedApi.class)
        );
    }
}
```

---

## 4. Proposed Refactoring Steps

1. **Add Marker Annotation:** Create `dev.sonle.filmdb.shared.annotation.VersionedApi`.
2. **Add Path Prefix Configuration:** Create `dev.sonle.filmdb.shared.config.WebMvcConfig`.
3. **Define Version Variable:** Add `app.api.version: v1` to `application.yml`.
4. **Refactor Controllers:**
   - Add `@VersionedApi` to all target controllers.
   - Remove `/api/v1` from `@RequestMapping` paths.
   
#### Targeted Controllers:
* [GenreController.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/controller/GenreController.java) (`/api/v1/imdb/genres` -> `/imdb/genres`)
* [MovieController.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/controller/MovieController.java) (`/api/v1/imdb/film` -> `/imdb/film`)
* [MovieListController.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/controller/MovieListController.java) (`/api/v1/imdb/listfilm` -> `/imdb/listfilm`)
* [PersonController.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/controller/PersonController.java) (`/api/v1/imdb/person` -> `/imdb/person`)
* [TvSeriesController.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/controller/TvSeriesController.java) (`/api/v1/imdb/tvseries` -> `/imdb/tvseries`)
* [SearchController.java](file:///s:/Coding/Projects/film-db/modules/search/src/main/java/dev/sonle/filmdb/search/api/SearchController.java) (`/api/v1/search` -> `/search`)
* [UserController.java](file:///s:/Coding/Projects/film-db/modules/users/src/main/java/dev/sonle/filmdb/users/controller/UserController.java) (`/api/v1/user/profile` -> `/user/profile`)
* [UserListController.java](file:///s:/Coding/Projects/film-db/modules/users/src/main/java/dev/sonle/filmdb/users/controller/UserListController.java) (`api/v1/users/lists` -> `/users/lists`)
* [UserListDetailsController.java](file:///s:/Coding/Projects/film-db/modules/users/src/main/java/dev/sonle/filmdb/users/controller/UserListDetailsController.java) (`api/v1/users/lists` -> `/users/lists`)
