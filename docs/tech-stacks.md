# Film DB - Tech Stack Summary

This document provides a comprehensive overview of the technologies, frameworks, libraries, database engines, and DevOps tools used in the **Film DB** project.

---

## 1. Backend Architecture & Technologies

The backend is built as a **Modular Monolith** using the Spring Boot ecosystem, designed to separate business domains into independent modules while maintaining a single deployable artifact.

### Core Frameworks & Languages
* **Java 21**: Leveraging modern Java features (Record types, Pattern Matching, Stream API, etc.).
* **Spring Boot 3.5.13**:
  * **Spring Boot Starter Web**: For RESTful API development.
  * **Spring Boot Starter Data JPA**: Object-Relational Mapping (ORM) and repository management.
  * **Spring Boot Starter Security**: Authentication, role-based authorization, and security filters.
  * **Spring Boot Starter Actuator**: System health monitoring and metrics.
* **Gradle**: Multi-project build tool configuring independent modules. Includes custom Kotlin DSL plugins under `build-logic` for:
  * Common JVM compiler settings (`filmdb.java-common.gradle.kts`).
  * Automatic environment variable loading from `secret.env` to Gradle tasks (`filmdb.env-loader.gradle.kts`).

### Database & Migration
* **PostgreSQL 16**: Primary relational database.
  * **Full-Text Search (FTS)**: Advanced text queries via PostgreSQL's `websearch_to_tsquery` and search vectors (`tsvector`).
  * **Trigram Fuzzy Search**: Using the `pg_trgm` extension for typo-tolerant queries.
  * **Native Arrays**: Storing and querying array structures (e.g., `genres`) directly as SQL arrays.
  * **Materialized Views**: Performance caching for query operations.
  * **JDBC Bulk Ingestion**: Direct napping of files via Postgres's `COPY` command to achieve fast bulk inserts.
* **Flyway Migrations (12.3.0)**: Automatic database schema evolution, structured into modular migrations (V1 to V5).

### Key Libraries & APIs
* **Project Lombok (1.18.44)**: Reduces boilerplate code for Java boilerplate models.
* **JJWT (io.jsonwebtoken 0.13.0)**: Used for generating and verifying JSON Web Tokens (Access Tokens).
* **Springdoc OpenAPI (2.8.17)**: Automatically generates Swagger UI (`/swagger-ui/`) and OpenAPI spec (`/v3/api-docs`).
* **Spring Application Event Model**:
  * **Synchronous Events**: Sequential, transactional updates between modules.
  * **Asynchronous Events (`@Async`)**: Non-blocking processes (e.g., streaming ingestion pipeline updates to the admin module).

---

## 2. Frontend Architecture & Technologies

The frontend is a modern, single-page application built on Next.js, implementing a high-fidelity cyberpunk/terminal aesthetic.

### Core Frameworks & Language
* **Next.js 16.2.6 (App Router)**: Utilizing React Server Components (RSC) and server-client composition.
* **React 19.2.4**: Built-in state rendering and components hook model.
* **TypeScript 5**: Static analysis and strict type safety across the frontend client.

### Styling & Aesthetics
* **Tailwind CSS 4**: Modern CSS framework coupled with `@tailwindcss/postcss` for advanced compilation.
* **CSS variables / HSL theme-tailoring**: Implementing custom dark/light modes and retro cyberpunk accents (Cyan `#55ead4`, Yellow `#f3e600`, Red `#ff0055`) with geometric layout rules (sharp corners, chamfer borders, glowing micro-animations).

### Libraries & State Management
* **Zustand 5.0.13**: Lightweight client-side state management (used for storing auth tokens).
* **Axios 1.16.0**: HTTP client featuring interceptors to handle automatic silent refreshes (using JWT 401 response catchers).
* **cookies-next 6.1.1**: Client/Server cookie management.
* **React Hook Form 7.75.0** & **@hookform/resolvers 5.2.2**: Form management.
* **Zod 4.4.3**: Schema-based validation for request payloads and form submissions.
* **@tanstack/react-query 5.100.10**: Asynchronous data querying, caching, and state synchronization.
* **Lucide React 1.14.0**: Cyberpunk-compatible geometric UI icons.
* **React Hot Toast 2.6.0**: Dynamic notifications and feedback alerts.

---

## 3. DevOps, Server Architecture & Infrastructure

### Containerization & Deployment
* **Docker & Docker Compose (3.8)**: Local and production execution via separate compose files:
  * `docker-compose.yml` (Development)
  * `docker-compose.prod.yml` (Production)
* **Multi-stage Builds**: Used in both `Dockerfile.backend` and `apps/frontend/film-db-ui/Dockerfile` to compile source code and construct minimal runtime images (only copying FAT JAR files / Next.js builds).

### Network Proxying & Gateways
* **Nginx (Alpine)**: Reverse proxy, static asset handler, and security firewall.
  * **Rate Limiting**: Configured `limit_req_zone` rules for auth endpoints (10 r/s), images (50 r/s), and general APIs (20 r/s).
  * **Header Forwarding**: Preserves source client metadata using `X-Real-IP` and `X-Forwarded-For`.
* **Ngrok**: Tunneling agent exposing local docker networks to public domains for test endpoints.
* **Cloudflare WARP (caomingjun/warp)**: Intermediary proxy service container.
  * Bypasses domestic ISP blocks to external services (like the TMDb API).
  * Backend routing configured via JVM system arguments (`-Dhttp.proxyHost=warp`).

### Continuous Integration / Continuous Deployment (CI/CD)
* **GitHub Actions**: Builds development code and pushes production Docker images.
* **GitHub Container Registry (GHCR)**: Secure storage and distribution for backend/frontend Docker images.
* **Watchtower**: Automates container updates on the production server by listening to GHCR push events.
