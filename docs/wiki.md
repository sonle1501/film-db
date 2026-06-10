# Repository Wiki

Welcome to the Film DB repository wiki. This page provides a high-level overview of the repository structure, codebase layout, and links to relevant documentation to help you navigate and understand the project.

---

## 1. Documentation & References

All core documentation is located in the [docs/](./) directory:

*   **Software Design & Solved Challenges**: Deep dives into the architecture, modular communication, data import pipeline, and PostgreSQL search scoring.
    *   [Software Design Docs (English)](software-design-docs-en.md)
    *   [Software Design Docs (Vietnamese)](software-design-docs-vn.md)
*   **System Requirements (SRS)**: Complete functional and non-functional requirements for both frontend and backend.
    *   [System Requirements Specification (SRS)](SRS.md)
*   **Technology Stack**: A detailed listing of frameworks, libraries, database engines, and styling tools used in the project.
    *   [Tech Stacks](tech-stacks.md)

---

## 2. Codebase Structure

This repository is organized as a monorepo containing both the frontend and backend applications, along with modular domain libraries.

```
film-db/
├── apps/
│   ├── backend/          # Spring Boot main application entrypoint
│   └── frontend/         # Next.js React frontend application (with Tailwind CSS)
└── modules/              # Monolith domain modules (business logic)
    ├── admin/            # Admin dashboard actions & data logs
    ├── imdb/             # Core domain (movies, shows, crew, and ratings)
    ├── importer/         # IMDb dataset streaming downloader and PostgreSQL bulk importer
    ├── search/           # Full-text search and custom rating/popularity scoring
    ├── shared/           # Shared utilities, custom exceptions, and common interfaces
    └── users/            # User management, JWT auth, lists, and profiles
```

### Core Components:
*   **[apps/frontend/](../apps/frontend)**: Next.js application representing the user interface, styled using a retro-futuristic cyberpunk terminal theme.
*   **[apps/backend/](../apps/backend)**: Main Spring Boot application that aggregates all domain modules and boots the server.
*   **[modules/](../modules)**: The core business domains of the Spring Boot backend, following a **Modular Monolith** architecture. Each module exposes specific APIs and communicates via shared interfaces or Spring Events to maintain clean separation.

---

## 3. Infrastructure & Additional Configuration

The repository includes setups for deployment, local containers, CI/CD, and build automation:

*   **Docker Containerization**:
    *   [Dockerfile.backend](../Dockerfile.backend): Defines the multi-stage build process for the Spring Boot backend.
    *   [docker-compose.yml](../docker-compose.yml): Local development stack setup (database and backend services).
    *   [docker-compose.prod.yml](../docker-compose.prod.yml): Production-ready stack containing PostgreSQL, Backend, and Nginx.
    *   [docker-example.env](../docker-example.env) / [secret-example.env](../secret-example.env): Example environment configuration files (without credentials) for docker compose and local development.
*   **Nginx Reverse Proxy**:
    *   [nginx/](../nginx): Contains configuration templates for Nginx serving as a reverse proxy/load balancer, managing SSL, routing client requests, and security.
*   **CI/CD (GitHub Actions)**:
    *   [.github/workflows/](../.github/workflows):
        *   [backend-ci.yml](../.github/workflows/backend-ci.yml): Runs builds and tests on code changes to the backend or modules.
        *   [frontend-ci.yml](../.github/workflows/frontend-ci.yml): Validates, builds, and tests the Next.js frontend on code changes.
*   **Build Automation**:
    *   [build-logic/](../build-logic): Gradle convention plugins written in Kotlin DSL to share and reuse build configurations across multiple backend modules, keeping `build.gradle.kts` files clean and maintainable.

---

## 4. Notes

*   **Setting up Environments**: The actual environment files `docker.env` and `secret.env` contain sensitive credentials and are excluded from Git repository tracking via `.gitignore`. To set up your environment:
    1. Copy [docker-example.env](../docker-example.env) to `docker.env` and populate your database and API credentials.
    2. Copy [secret-example.env](../secret-example.env) to `secret.env` for local backend development/running outside of docker container environments.
