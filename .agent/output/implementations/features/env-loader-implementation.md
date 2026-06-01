# Custom Gradle Environment Loader Implementation

## User's intent
The user requested a way to load environment variables from an external `secret.env` file located in the root of the Gradle project, so that the Spring Boot application (and its associated tests/tasks) can access these variables when run from the terminal. The solution required creating a custom Gradle plugin and integrating it into the `apps/backend/build.gradle.kts` configuration.

## Results
We implemented a custom Gradle precompiled script plugin inside the `build-logic` project and applied it to the backend project. 

### 1. Created Custom Gradle Plugin: `filmdb.env-loader`
We created a new precompiled script plugin at [filmdb.env-loader.gradle.kts](file:///s:/Coding/Projects/film-db/build-logic/src/main/kotlin/filmdb.env-loader.gradle.kts):
- It locates the `secret.env` file in the root project directory.
- It parses the environment variables (ignoring comments and empty lines).
- It prints a message showing how many environment variables were loaded.
- It injects these environment variables into all `JavaExec` tasks (including `bootRun`) and `Test` tasks.
- It also registers them as system properties so the Gradle JVM daemon can access them if needed.

### 2. Applied Plugin to Backend Module
We modified [build.gradle.kts](file:///s:/Coding/Projects/film-db/apps/backend/build.gradle.kts) to include the new plugin:
```diff
 plugins {
     id("filmdb.java-common")
+    id("filmdb.env-loader")
     alias(libs.plugins.spring.boot)
     alias(libs.plugins.dependency.management)
 }
```

### 3. Verification
Upon running Gradle commands, the project configured successfully and printed the confirmation log:
```text
> Configure project :apps:backend
[env-loader] Loaded 9 environment variables from secret.env
```
This confirms the custom environment loader is fully functional and successfully injecting configuration values into the application's runtime context.
