# User's intent
The user wants suggestions for architectural, performance, and code-quality refactorings throughout the Modular Monolith Java backend codebase. The suggestions should be structured as a plan, presenting trade-offs and best practices, and saved to `.agent/output/plans/refactor/refactor-suggestions-plan.md`.

# Results

Here are the key areas identified for refactoring across the codebase. For each area, we present the problem, trade-off analyses, and recommended best practices.

---

## 1. Data Ingestion Memory Optimization (`modules/importer`)

### Problem
In [PostgreCopyEngine.java](file:///s:/Coding/Projects/film-db/modules/importer/src/main/java/dev/sonle/filmdb/importer/core/PostgreCopyEngine.java), the copy pipeline reads raw gzip files line-by-line, formats them, and buffers them into a `StringBuilder batchBuffer`. Once the buffer reaches `BATCH_SIZE = 100,000` lines, it performs `batchBuffer.toString()` and wraps it in a `StringReader` to feed `CopyManager.copyIn()`. 

For large datasets, this causes severe memory overhead (temporary allocations of large Strings, GC thrashing, and potential Out-Of-Memory spikes under high concurrency).

### Trade-off Analysis
* **Approach A: Buffer Chunks in Memory (Current)**
  - *Pros:* Simpler to write; straightforward error handling per batch.
  - *Cons:* Heavy memory allocations. High GC overhead. Max batch size is limited by heap space.
* **Approach B: True Streaming with Piped Streams (Recommended)**
  - Use Java `PipedInputStream` and `PipedOutputStream` in separate threads, or write a custom streaming `Reader` wrapper that translates lines on the fly.
  - *Pros:* Near-zero memory footprint (data flows directly from gzip to JDBC socket in chunks). Ingestion speed is bottlenecked purely by I/O and PostgreSQL, not JVM heap.
  - *Cons:* Requires multi-threaded coordination or custom streaming reader logic, slightly increasing complexity.

---

## 2. Decouple Database Query Aliases from Services (`modules/imdb`)

### Problem
In [MovieFilterService.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/service/MovieFilterService.java), sorting paths are hardcoded as JPQL query aliases:
```java
String field = switch (sortBy) {
    case "averageRating" -> "r.averageRating"; // Couples to query alias 'r'
    case "numVotes" -> "r.numVotes";
    case "startYear" -> "m.startYear";         // Couples to query alias 'm'
    default -> null;
};
```
If a developer changes query aliases in the repository (e.g. from `r` to `rating` or `ratingEntity`), sorting breaks silently at runtime.

### Trade-off Analysis
* **Approach A: Keep JPQL String-Based Mapping (Current)**
  - *Pros:* Quick to write and simple to understand for simple queries.
  - *Cons:* Highly brittle. Breaks modular monolith service-to-repository decoupling.
* **Approach B: JPA Specification API (Recommended)**
  - Refactor queries in [MovieRepository.java](file:///s:/Coding/Projects/film-db/modules/imdb/src/main/java/dev/sonle/filmdb/imdb/repository/MovieRepository.java) to use JPA Specifications or QueryDSL.
  - *Pros:* Fully type-safe sorting and querying. Fields are mapped to JPA entity properties directly rather than specific query aliases, allowing compile-time safety.
  - *Cons:* Initial learning curve for Specification syntax and slightly more verbose codebase.

---

## 3. Exception Hierarchy Consolidation (`modules/shared`)

### Problem
The project has two distinct custom exception paths:
* `BusinessException` (using `BusinessExceptionCode` enum) for domain violations.
* `AppException` (using `AppExceptionCode` enum) for system errors.

While separating domain rules from technical issues is a good design, having two entirely distinct hierarchies with separate enums, response formats, and exception handlers in [GlobalExceptionHandler.java](file:///s:/Coding/Projects/film-db/modules/shared/src/main/java/dev/sonle/filmdb/shared/exception/GlobalExceptionHandler.java) duplicates logic.

### Trade-off Analysis
* **Approach A: Separate Exception Trees (Current)**
  - *Pros:* Hard boundary between system errors and domain logic errors.
  - *Cons:* Duplicate boilerplate classes, enums, and handler logic.
* **Approach B: Consolidated Base Exception (Recommended)**
  - Create a single base exception `BaseException` (or `DomainException`) containing an error category type (e.g., `TECHNICAL`, `BUSINESS`, `SECURITY`).
  - *Pros:* Single exception class to maintain, unified error logging format, single HTTP response builder mapping, less boilerplate.
  - *Cons:* Requires minor changes to catch/throw clauses throughout all modules.

---

## 4. Ingestion Thread Pool Configurations (`modules/admin` & `modules/importer`)

### Problem
The import pipeline runs asynchronously (`@EnableAsync` on application, triggered from `AdminJobService` or `ImportService`). However, there is no customized or dedicated thread pool defined for these large tasks, meaning they run on Spring's default simple task executor. 

Large-scale tasks like dataset ingestion should run on a bounded, dedicated thread pool to avoid starving the HTTP container threads.

### Trade-off Analysis
* **Approach A: Bounded Dedicated Thread Pool (Recommended)**
  - Configure a dedicated `ThreadPoolTaskExecutor` (e.g. `importTaskExecutor`) with bounded queue and max pool size (e.g., core size 1, max size 2) for resource intensive imports.
  - *Pros:* Prevents resource starvation. Ensures only a controlled number of heavy import jobs run concurrently.
  - *Cons:* Requires custom configuration bean setup.
* **Approach B: Virtual Threads (Java 21+)**
  - Since this project is compiled with Java 21 (configured in Gradle), we can enable Virtual Threads (`spring.threads.virtual.enabled=true`).
  - *Pros:* Zero configuration, lightweight task execution.
  - *Cons:* Virtual threads do not restrict concurrency limits out of the box, so multiple concurrent database-heavy copy streams might still overwhelm database connection pools unless rate-limited.
