**Architecture & Tech Stack:**

- **Pattern:** Modular Monolith architecture.
    
- **Language:** Java
    
- **Framework:** Spring Boot 3.5.13.
    
- **Build Tool:** Gradle (Kotlin DSL).
    
- **Database:** PostgreSQL

**Codebase Structure:**

The monolithic application is divided into heavily segregated modules:

- `admin`: Handles admin jobs, requests, user lists, and import triggers.
    
- `imdb`: Manages core movie, TV series, and person queries and filters.
    
- `importer`: Contains the core logic and pipelines (downloading, wiping, importing) for parsing gzip TSV files using PostgreSQL's COPY command via JDBC.
    
- `search`: Houses the search engine capabilities.
    
- `shared`: Contains global exception handling, security configurations (JWT filters), and internal module interfaces.
    
- `users`: Manages authentication, user profiles, and personal lists.

