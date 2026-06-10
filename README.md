# film-db

This is a web application project (Next.js frontend, Spring Boot backend, and PostgreSQL database) that uses the official IMDb non-commercial dataset with a massive archive of movies and additional information

---

## Architecture & Core Features

*   **Modular Monolith**: The backend is built using a clean modular monolith approach. The codebase is split into domain-specific modules (`users`, `imdb`, `search`, `importer`, `admin`, `shared`) to keep it simple, readable, and easy to maintain, while deploying everything together as a single application.
*   **Basic CRUD & Role-Based Actions**: The system supports user registration/login and handles three roles:
    *   **Guest**: Can explore movies, TV shows, cast, crew, and additional info.
    *   **User**: Can create and edit custom lists (favorites, plan to watch, etc.) and add movies to them.
    *   **Admin**: Can trigger the data import pipeline to load the latest IMDb dataset into PostgreSQL.
*   **Custom Search Engine**: Leverages PostgreSQL's native capabilities (Full-Text Search and fuzzy matching) combined with our custom math formulas (matching score + popularity/rating boost) to create a highly accurate, smart search engine on par with IMDb's original search.

---

## Diagrams

### Software Architecture
Here is a high-level view of our Modular Monolith package structure and module dependencies:

![Software Architecture](docs/diagrams/software-architecture.png)
*Figure 1: Monorepo Modular Monolith Package Architecture*

### Deployment
Here is the system deployment setup, including the local home server, proxy gateways, and services:

![System Deployment](docs/diagrams/system-deployment.png)
*Figure 2: Production Deployment Flow with Nginx, Cloudflare WARP, and Docker*

---

## Documentation & Deep Dives

I have documented the design decisions and how I approach, solve problems while building

*   **Solved Challenges & Software Design**:
    *   **Data Pipeline (Download & Import)**: Downloads large datasets in chunked streams, and imports millions of rows to PostgreSQL.
    *   **Module Interaction**: Communication between domain modules using shared interfaces and Spring Events (both synchronous and asynchronous).
    *   **Search Engine**: Combines PostgreSQL Full-Text Search (FTS) and fuzzy matching with custom rating and popularity-based scoring formulas.
    *   **Authentication & Security**: Integrates JWT Access Tokens and Refresh token
    *   **Others**: Zero-downtime database table swaps, Exception Handling, Cloudflare WARP proxy integration, etc..

    *Read the full details in the Software Design documents:*
    *   [Software Design Docs (English)](docs/software-design-docs-en.md)
    *   [Software Design Docs (Vietnamese)](docs/software-design-docs-vn.md)

*   **Tech Stack**: See the full list of frameworks, database engines, styling tools, and libraries used across the project in [Tech Stacks](docs/tech-stacks.md).
*   **System Requirements (SRS)**: Browse the complete list of frontend and backend functional requirements in the [SRS Document](docs/SRS.md).

---

## Cyberpunk Visuals
The frontend interface features a retro-futuristic terminal cyberpunk aesthetic, using deep charcoal backgrounds, glowing borders, sharp geometric corners, and monospaced terminal styling.

Here are some screenshots of the application:

### Homepage
![Homepage](docs/screenshots/homepage.png)
*Figure 3: Cyberpunk Homepage with movie rankings and catalog*

### Movies Search & Catalog
![Movies Catalog](docs/screenshots/movies.png)
*Figure 4: Movie listing and interactive search terminal*

### Admin Data Ingestion Pipeline
![Admin Ingestion Pipeline](docs/screenshots/admin-pipeline.png)
*Figure 5: Live progress feedback of the IMDb import pipeline*

---

## Agentic Coding & AI Workflows
This repository is developed in collaboration with **Antigravity**, an agentic AI coding assistant:
*   **AI Custom Workflows**: Leveraging custom slash commands (like `/plan` for design discussions, `/code` for implementation, `/ui` for styling tweaks, and `/analyze` for review).
*   **Structured Planning**: Complex features undergo a research and design phase, yielding an `implementation_plan.md` and `task.md` tracking artifact to ensure stable, incremental progress before any code is modified.
