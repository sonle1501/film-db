# Software Development Notes

## About this Document
This document is a log recording ideas and problem-solving approaches during the construction of the `film-db` system. For Functional Requirements, please refer to the [SRS.md](./SRS.md) document.

---

## Goal

### Utilizing Available Dataset
* **IMDb Dataset**: Leverage the rich, non-commercial data source from IMDb with millions of movies and related information (cast, directors, etc.). This dataset is updated daily.
* **TMDb API**: TMDb is also a free movie database and provides APIs to retrieve info. However, calling the API constantly is unnecessary. The system only uses TMDb API for non-mandatory tasks like fetching movie posters.

### Why film-db?
* Helps users experience a massive movie warehouse through features like smart search, adding movies to favorites lists, and discovering additional information.
* Having a complete movie database readily available makes it easy for us to expand features later without needing to integrate video/streaming data. For example: retrieving links to watch movies, updating cinema news, integrating AI, or building a movie recommendation system based on preferences...

---

## Plan

### Proof of Concept - POC
Is it possible to run an automatic pipeline to download data from IMDb and import it directly into PostgreSQL? Prepare backup plans:
* **Data download issue**: If Java cannot download from IMDb URLs due to being blocked -> The fallback solution is to download files manually via browser and use static data.
* **Data import issue**: If we cannot directly import raw TSV files -> We need to preprocess/reformat the data before pushing it into the database.

---

## Architecture & Tech Stack

* **Modular Monolith Architecture**: The system is split into modules but still deployed together.
  * *Reasoning*: Decoupling, code readability, and easier scaling. Using a Modular Monolith avoids the clutter in traditional Monolith code where everything is lumped together, while avoiding the overhead/clutter of Microservices (overengineering/overkill). We can completely scale into Microservices later if needed with this architecture.
* **Monorepo**: Helps manage all source code in a single place, making it easy to collaborate and leverage AI-assisted coding tools (agentic coding).
* **PostgreSQL**:
  * FTS - Full-Text Search
  * native Array `[]`
  * Use JDBC COPY command to speed up data ingestion.
  * Leverage Materialized Views
* **Gradle**:
  * Optimize build performance.
  * Allows writing custom plugins to share dependencies, load environment variables from config files (load env)...
  * Easy to read declarations.
  * (Maven can do these too, but Gradle is cleaner and more flexible).

---

## Software Design

Below is how I implemented specific features and solved particular technical problems:

### 1. Download & Locate Dataset

#### Sending requests to IMDb server
* Use `InputStream`, `OutputStream` combined with classes in the `net.http` package (such as `HttpClient`, `HttpRequest`, `HttpResponse`).
* Send HTTP requests to the IMDb server to download data as a stream (`InputStream`).

#### Stream writing
* Use the `try-with-resources` structure to automatically release and close the `InputStream` when finished processing the body.
* Read data block by block (chunk) into a buffer (temporarily stored in RAM) then use `OutputStream` to write directly to the hard drive.

#### Trade-offs
* *Why not read the entire file as a `String`?* Because the data file is too large; reading the whole thing into RAM will cause an OutOfMemoryError. Using stream helps process large files safely.
* *Why not use `BodyHandlers.ofFile()`?* Because we need to track the downloaded size directly to calculate and display the real-time progress bar (%) to the user.

#### Pipeline integration
* Set up a complete download pipeline.
* Run 7 separate threads to concurrently download 7 data files from IMDb.

---

### 2. Import - Copy TSV data into Postgres via Java

#### Array format & Functional Interface
* In IMDb's data, arrays are stored as comma-separated strings; for example, the movie genre column `genres` is `"Action,Drama"`. However, to copy directly into an Array-typed column in PostgreSQL, we must reformat it into Postgres's array format: `"{Action,Drama}"`.
* To solve this problem, we declare a `@FunctionalInterface` with a transformation method: `String[] format(String[] parts)`. This method takes a string array (which is the columns of a data row) and returns a reformatted string array.

#### Polymorphism
* Each TSV file has different columns that need formatting. For example: the file containing movie information (Movies) needs transformation at the 9th column (index 8), whereas the person/cast information file (Person) requires processing at columns 5 and 6.
* Therefore, we need to write separate formatting formulas for each data file type. However, no matter the specific formula, they all implement the same formatting interface defined above.
* Thanks to Polymorphism, at coding time, the [PostgreCopyEngine](../modules/importer/src/main/java/dev/sonle/filmdb/importer/core/PostgreCopyEngine.java) class only needs to know and call the single `format()` method. At runtime, the system will automatically call the corresponding formatting logic for each file.

#### StringBuilder
* `StringBuilder` is mutable. If we used standard `String` (immutable), the JVM would be overloaded from constantly creating new string objects on the Heap memory every time we concatenate.
* `StringBuilder` runs faster than `StringBuffer` because it doesn't carry the overhead of synchronization. This is safe because each thread handles its own task and doesn't share data.

#### Copy Command
* Use PostgreSQL's `COPY` command (Bulk Ingestion) via JDBC's `CopyManager` API. This method makes data loading significantly faster compared to regular `INSERT` commands.

---

### 3. Staging and Zero-Downtime during Import

#### Challenge
IMDb data is updated daily on their server. Consequently, the administrator (admin) also needs to update the system data frequently to sync up. However, if we update in the usual way (dropping old tables, importing new tables), the system would have to experience about 30 minutes of downtime to complete.

* **Solution**: Use Staging Tables and an Atomic Swap mechanism.

#### Pipeline Integration
All new data will be imported into temporary staging tables (`staging tables`). Once the import is complete, the system swaps table names (renaming) between staging tables and `active tables` via an SQL script [swap_staging_tables.sql](../apps/backend/src/main/resources/db/script/swap_staging_tables.sql). The entire swapping process is wrapped in a single JDBC transaction to ensure that if any error occurs, it will roll back immediately.

#### Index Handling
Indexes on staging tables are dropped before importing data, and then re-created after the import is finished and before renaming. This avoids having PostgreSQL continuously update indexes for every single row during the import process, which significantly boosts write performance.

#### Cancelling Pipeline from Client
Although not yet implemented, conceptually, we can continuously check a cancellation flag while importing data in batches, combined with `CompletableFuture.cancel()` to change state. Stopping the pipeline will be achieved by throwing an `InterruptedException`.
Essentially, this mechanism requires using active polling techniques within the processing thread.

---

### 4. Import Pipeline Monitoring System (Feedback Pipeline)

#### Challenge
When the admin triggers the pipeline, they want to track the run progress in real-time to know what percentage (%) has been processed.

#### Download Counter Mechanism
Count downloaded bytes, then send feedback every second (sending feedback per buffer size would easily cause overload).

#### Import Counter Mechanism
Since downloaded files are compressed in `.gz` format, we cannot know the exact decompressed size beforehand to calculate the percentage. Therefore, the system counts the raw bytes of the `.gz` file being decoded and copied into Postgres, and compares it against the original size of the `.gz` file.

To achieve this, we use a custom class [CountingInputStream](../modules/importer/src/main/java/dev/sonle/filmdb/importer/core/CountingInputStream.java) (inheriting from Java's `FilterInputStream`) to attach a counter to the `.gz` file stream. Every time the thread reads data from the `.gz` file, the counter records the processed bytes. The system fires a progress update event after every batch of 100,000 rows is written to the database.

---

### 5. Inter-Module Communication

In this project, we employ two main communication mechanisms:
1. **Communication via a Shared Interface** located in the shared module.
2. **Communication via Events** in the shared module, following the Publisher-Listener pattern, using Spring Events.

Here are some examples:

#### Using a Shared Interface
* **Problem**: The `admin` module needs to retrieve user list and detailed information (Users).
* **Solution**:
  * Declare an interface [UserListInterface](../modules/shared/src/main/java/dev/sonle/filmdb/shared/interfaces/UserListInterface.java) in the shared module.
  * The `admin` module only needs to call methods defined in this interface.
  * The `users` module declares the class [UserListInternalController](../modules/users/src/main/java/dev/sonle/filmdb/users/controller/internal/UserListInternalController.java) to implement those methods.
  * This way, `admin` and `users` can exchange data via an intermediary interface without knowing about each other.

#### Using Synchronous Events
* **Problem**: A user submits a request to become an admin, and the `admin` module needs to receive this request for approval.
* **Solution**:
  * Declare a shared event in the shared module called [RegisterAdminEvent](../modules/shared/src/main/java/dev/sonle/filmdb/shared/event/RegisterAdminEvent.java).
  * On the `users` side, we use `ApplicationEventPublisher` to publish this event.
  * On the `admin` side, we use `@EventListener` to listen to the event and record the request info into the pending requests table (`Pending requests`).
  * This mechanism runs synchronously, sequentially, and is wrapped in the same transaction (using Spring's default Propagation).

#### Using Asynchronous Events
* **Problem**: The admin wants real-time progress updates on the running pipeline.
* **Solution**:
  * The system still publishes a shared event (like [ImportProgressEvent](../modules/shared/src/main/java/dev/sonle/filmdb/shared/event/ImportProgressEvent.java)), but this time it is processed asynchronously (async).
  * On the `admin` module, we use the [ImportJobEventListener](../modules/admin/src/main/java/dev/sonle/filmdb/admin/listener/ImportJobEventListener.java) class, marked with `@Async` and `@EventListener`, to handle the event in a new thread.
  * The `importer` module simply publishes the event when there is new progress and continues its job without waiting for the `admin` module to finish processing.
  * *Advantage*: Asynchronous processing avoids blocking threads, optimizing pipeline run performance.

---

### 6. Exception Handling Mechanism

The system features centralized error handling based on two key pillars:
* **Custom Exceptions**: Clearly categorized into two groups:
  * [BusinessException](../modules/shared/src/main/java/dev/sonle/filmdb/shared/exception/BusinessException.java): Errors due to violating software business logic (e.g., movie not found, duplicate account, etc.).
  * [AppException](../modules/shared/src/main/java/dev/sonle/filmdb/shared/exception/AppException.java): System or internal technical errors (e.g., DB connection failure, file parsing error, etc.).
* **Global Exception Handler**: Centralized handling of these custom exceptions and common system errors (such as Optimistic Locking, `DataAccessException`, unknown errors, etc.). This error handling class is marked with the `@RestControllerAdvice` annotation (see [GlobalExceptionHandler.java](../modules/shared/src/main/java/dev/sonle/filmdb/shared/exception/GlobalExceptionHandler.java)).

#### Design Principles:
* **Avoid Leaking Stack Traces**: Never return stack traces or detailed system error details to the client in production. The task of logging detailed information belongs to the classes where the errors originate.
* **Separate Business Errors and System Errors**
* **Fail-Fast Principle**: Having a centralized error structure allows classes across the system to confidently throw exceptions as soon as they detect an invalid state, without worrying about how upper layers will catch and handle them.

---

### 7. Authentication & Authorization with Spring Security

#### Challenge
Build a mechanism that is both convenient and capable of maintaining a long-term login state (Remember-Me).

* **Solution**: Combine a token pair: **Stateless JWT Access Token** (short-lived) and **Stateful UUID Refresh Token** (long-lived).

#### How it works:
* Users who register/login successfully will receive 1 Access Token and 1 Refresh Token.
* **Stateless**: The backend doesn't remember who you are. The client must attach the Access Token to the header of every HTTP request sent to the server.
* When the Access Token expires, the client automatically uses the Refresh Token to request a new Access Token. Only when the Refresh Token also expires does the user need to log in again.

#### Login and Password Matching Mechanism
* Login authentication is delegated to the `AuthenticationManager` (configured as a bean in [SecurityConfig](../modules/shared/src/main/java/dev/sonle/filmdb/shared/security/SecurityConfig.java) and injected into [AuthService](../modules/users/src/main/java/dev/sonle/filmdb/users/service/AuthService.java)).
* `AuthenticationManager` selects a provider for processing; we configure `DaoAuthenticationProvider` as the provider, which retrieves account info via `UserDetailsService` and matches passwords using `BCryptPasswordEncoder`.
* *Note*: The `encode()` method of `PasswordEncoder` hashes the raw text password to save to the database, while the `matches()` method compares the raw text password entered by the user with the hashed password stored in the DB. BCrypt is the password hashing algorithm recommended for Java.

#### JWT Generation and Verification Mechanism
* When a user logs in successfully, the `generateToken()` method in [JwtService](../modules/shared/src/main/java/dev/sonle/filmdb/shared/security/JwtService.java) extracts the `username` along with the expiration time, and encodes them to create the JWT Payload. The Signature part is signed using the secret key `JWT_SECRET`.
* Upon receiving a request from the client, the backend automatically recalculates the signature based on the received `header.payload` and compares it with the Signature in the system.
* The system authenticates directly based on the algorithm and secret key kept in RAM, without querying the database to check if the token is valid. It only queries the database when it needs to extract user information from the `username` inside the token.
* *Filter*: Use `OncePerRequestFilter` to ensure the authentication filter runs exactly once for each request entering the application. The line `filterChain.doFilter(request, response)` lets the request proceed through subsequent filters in the chain.
* The authentication state is then stored in the `SecurityContextHolder` (temporarily stored in the current thread's RAM). Downstream authorization filters read information from here to decide whether to allow access or reject the request.

#### Refresh Token Mechanism
* The Refresh Token is a random UUID string stored in the database (stateful) and can be revoked (cleared) at any time if security issues are suspected.
* This token is sent back to the client via Cookie with security flags:
  * `HttpOnly(true)`: Prevents malicious Javascript from accessing it to guard against XSS attacks.
  * `SameSite("Strict")`: Only sends the cookie if the request originates from the system's own website to protect against CSRF attacks.
  * `Secure(true)`: Only sends the cookie over HTTPS secured connections.
* The browser stores the refresh token in Cookie memory and automatically appends it to the Cookie Header when sending requests.

#### Achieving Remember-Me (Duy trì đăng nhập)
* When the Access Token expires, the client's request will return a `401 Unauthorized` error from the server.
* On the client-side, an Axios Interceptor will automatically detect the 401 error, then make a silent call to the `/api/auth/refresh` API with the `withCredentials: true` option to request a new Access Token using the HttpOnly Refresh Token Cookie.
* Once the new Access Token is retrieved, it is saved into `Zustand` (frontend RAM) for further use. This entire process happens completely in the background (silent refresh), ensuring users do not feel any interruption in their experience, even when reloading the page.

---

### 8. Smart Search Engine

#### Challenge
Build a smart movie search engine that matches the user's intent, on par with or better than the original IMDb search.

#### Core Principles:
1. Predict and find ways to maximize matching between the user's intent and returned results.
2. Rank results by Relevance Score from highest to lowest.

* **Scoring Formula**:
  $$\text{Relevance Score} = \text{Match Score} \times \text{Boost Score}$$
  * `Match Score`: How well the search keywords match the movie information in the database.
  * `Boost Score`: A priority coefficient based on popularity (vote count) and the movie's actual rating.

#### Match Score Calculation Mechanism
The keyword matching process is implemented in detail within the `searchSmart` method in [SearchRepository.java](../modules/search/src/main/java/dev/sonle/filmdb/search/repository/SearchRepository.java):

1. **Query processing**:
   Use PostgreSQL's `websearch_to_tsquery` function to convert the input keywords into an FTS query. We extract the following search formats:
   * Raw keywords (Literal Query).
   * English search keywords (`ts_q_eng`).
   * Simplified/general search keywords (`ts_q_simp`).
   * Keyword length scaling factor (`length_scale`): Maximum limit is 1.0 (achieves full points when the keyword is 10 characters or longer).
2. **Building the Search Vector in Postgres**:
   The system converts movie titles into FTS Vectors for comparison:
   * **English Search Vector** (gives higher priority weight to the primary title `primary_title` compared to the original title `original_title`): Score multiplier is `0.2`.
   * **Simple Search Vector** (keeps the raw text without attempting English translation for general searching): Score multiplier is `0.4`.
3. **Scoring and Bonus Points**:
   * English FTS match (`ts_q_eng`) with `main_search_vector`: Multiplied by `0.2`.
   * General FTS match (`ts_q_simp`) with `main_simple_search_vector`: Multiplied by `0.4`.
   * Use the `similarity` function for fuzzy search matching between raw keywords and the main title `primary_title`: Multiplied by `0.4` (helps users find movies even with minor typos).
   * **Prefix Match Bonus**: If the user inputs a keyword of 3 characters or more, and the movie title starts exactly with that keyword, add `1.0 * length_scale`.
   * **Position Match Bonus**: The earlier the keyword appears in the title, the higher the bonus points (calculated as `(1.0 / position) * length_scale`).

#### Boost Score Calculation Mechanism
This coefficient is independent of the user's search keywords, depending entirely on the actual reputation and quality of the movie to bring the best movies to the top of the results page.

* **Formula**:
  $$\text{Boost Score} = P(N) + (W(N) \times Q(R))$$
  * $P(N)$ (Popularity Score): Bonus points based on popularity (rating count $N$ - `num_votes`).
  * $W(N)$ (Weighting Gate): A factor that controls the impact of movie quality based on the number of votes.
  * $Q(R)$ (Quality Score): Quality points based on the movie rating $R$ - `average_rating`.

*Detailed Metric Evaluation:*
* **Popularity Score $P(N)$**:
  * Under 100 votes: `0.10` (highly obscure films).
  * Under 300 votes: `0.25`.
  * Under 500 votes: `0.40`.
  * Under 1,000 votes: `0.60`.
  * Under 5,000 votes: `0.80`.
  * Under 10,000 votes: `1.00`.
  * 10,000 votes and above: Bonus increases logarithmically: `1.20 + LEAST(1.8, log(10, num_votes / 10000.0) / log(10, 100.0))`. The maximum bonus is `3.0` (with the log part capped at `1.8`). The log function slows down the score increase when votes are massive (e.g., a movie with 200k votes and 300k votes won't differ much since both are already highly established).
* **Weighting Gate $W(N)$**:
  * Under 100 votes: `0.0` (films with too few votes lack reliable ratings; thus quality score doesn't contribute to the boost score).
  * Under 500 votes: `0.3`.
  * Under 5,000 votes: `0.6`.
  * 5,000 votes and above: `1.0` (rating is 100% accounted for).
* **Quality Score $Q(R)$**:
  * Rating below 3.0: `-0.20` (awful films are directly penalized to sink them; we avoid negative ones).
  * Rating below 4.0: `0.05`.
  * Rating below 5.0: `0.15`.
  * Rating 5.0 and above: `0.30` (reaches a decent/trustworthy quality level).

#### Live Search & Vietnamese Search
* **Vietnamese Search**: Leverage the vector column specifically formatted for Vietnamese (`vietnamese_search_vector` and `vietnamese_titles_concat`) for comparison.
* **Live Search**: Bypass the heavy FTS Vector processing to save resources. Instead, the system only uses `similarity` fuzzy matching (multiplier `0.5`), prefix match bonus, position bonus, and filters quickly using operators like `%` (pg_trgm fuzzy search) and `ILIKE` (case-insensitive exact match).

---

### 9. CI/CD & Home Server

#### Docker
* **Multi-stage Build**: Both frontend and backend compile using a build environment image first, then selectively copy only the final product (like the JAR file or the Next.js build directory) into the runtime image. This eliminates build junk and compilers, keeping image size minimal.
* **FAT JAR**: Java is packaged as a standalone `.jar` running independently instead of a traditional `.war` file, since Spring Boot comes with Tomcat embedded.
* **Volume Mount in Docker Compose**: Mount the PostgreSQL data directory (`pgdata`) directly from the host machine's physical drive (managed by the OS) into the container.
  * Allows the container to write data directly to the host's SSD without going through a storage driver intermediary (like `overlay2`), boosting read/write speeds.
  * When running `docker compose down` and then `up` again, the new container is re-attached to the same `pgdata` volume, preventing data loss.

#### Project Deployment Flow
The system supports two main environments:
1. **Local Development (docker-compose.yml)**: Builds images directly on the local machine and runs containers.
2. **Production (docker-compose.prod.yml)**: The process of building and pushing images to GitHub Container Registry (GHCR) is automated by GitHub Actions. On the home server, we run [Watchtower](https://github.com/containrrr/watchtower) to automatically update containers. Watchtower listens to GHCR; if a new image is pushed, it automatically pulls it down and restarts the corresponding container without requiring manual admin actions.

#### API & Routing

##### Rate Limiting
Use Nginx's `limit_req` directive with `burst=X nodelay`.
* For example, the login config: 10 requests/second (`10r/s`). Nginx processes burst requests immediately as long as the temporary queue does not exceed capacity `X` (here, 10). If requests exceed this queue limit, Nginx immediately returns a `429 Too Many Requests` instead of queuing them.

##### Real IP headers
Nginx passes `X-Real-IP` and `X-Forwarded-For` headers to the Backend. Without these configs, when request flow goes `Internet` $\rightarrow$ `Ngrok` $\rightarrow$ `Nginx` $\rightarrow$ `Backend`, the Spring Boot Backend would always see the IP address of all requests as the internal IP of the Nginx container.

##### Request Routing via Nginx
* **Requests to Frontend**: Nginx forwards to the Next.js container. From Next.js, if API data is needed, it can call the backend container directly via Docker's internal domain names (Internal Domain Names) without looping out to the public Internet.
* **Requests to API Backend**: Nginx routes directly to the Spring Boot container, which handles the request and returns the result to the client.

General Request Flow Diagram:
$$\text{Client} \xrightarrow{\text{Internet}} \text{Ngrok Server} \xrightarrow{\text{Home Server}} \text{Ngrok Container} \rightarrow \text{Nginx} \rightarrow \text{Frontend / Backend Container}$$

##### Bypassing API blocks
Some Vietnamese ISPs block direct access to the TMDb API. To solve this, our Backend does not call TMDb directly; instead, it sends requests through an intermediary container running **Cloudflare WARP** (`caomingjun/warp`).
* Configure JVM environment variables (`JAVA_TOOL_OPTIONS`) in the backend container to setup a proxy: `-Dhttp.proxyHost=warp -Dhttp.proxyPort=1080 ...`.
* Also, configure exclusions for internal network addresses via `-Dhttp.nonProxyHosts="localhost|127.0.0.1|db|frontend|backend"`.
* When Spring Boot needs to call an external API on the internet, the request is forwarded through the proxy port of the `warp` container. This container securely connects to the Cloudflare network, forwards the request to TMDb, and returns the result, completely resolving the network block issue.

---

### 10. Other Technical Solutions

* **API Versioning**: Use [WebMvcConfig](../modules/shared/src/main/java/dev/sonle/filmdb/shared/config/WebMvcConfig.java) to flexibly route and manage different API versions.
* **TMDb Poster Integration**: Use movie IDs to call the TMDb API, retrieve the corresponding poster image URL, and display it on the interface.
* **External Configuration**: Use Spring Boot's `@ConfigurationProperties` to automatically map and inject external environment variables and configuration files.
* **Custom Gradle Plugin**: Write a custom plugin [filmdb.env-loader.gradle.kts](../build-logic/src/main/kotlin/filmdb.env-loader.gradle.kts) that automatically reads `secret.env` and loads environment variables into Java/Test execution tasks. This allows developers to run the application via command line or run unit tests easily without having to load environment variables manually or depend on an IDE.
* **Modern Java approach**: Prioritize using DTOs for data transfer, use `Optional` to reduce Null Pointer Exceptions, and use `Enum`.
