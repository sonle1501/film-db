# Plan: Project Overview and Usage Guide

## User's Intent
The user wants a comprehensive explanation of the project and guidance on how to use it, specifically requesting the use of the "plan" workflow.

## Proposed Approach
Since this is an "Explain" type request but requested via the "plan" workflow, I will structure the explanation as a roadmap for understanding and interacting with the codebase.

### 1. Architecture Overview
- **Frontend:** Next.js 14+ (App Router), React, Tailwind CSS, TypeScript.
- **Backend:** Java Spring Boot 3.5.13 (Modular Monolith) with PostgreSQL.
- **Integration:** API-driven using a modular backend (admin, imdb, users, etc.).

### 2. Functional Domains
- **Auth:** Login, Register, Profile Management.
- **IMDB:** Movie/Person/TV Series details and search.
- **Social/User:** Custom lists, movie tracking.
- **Admin:** System monitoring, import pipeline, user management.

### 3. Codebase Structure Walkthrough
- **Routing:** `src/app/` (grouped by (auth), (dashboard), (public)).
- **Components:** `src/components/` (features, home, layout, ui).
- **Agentic Layer:** `.agent/` (The core of the autonomous development setup).

### 4. Workflow Guidance (How to Use)
- **Standard Dev:** `npm install` -> `npm run dev`.
- **Agentic Dev:** Using `/plan`, `/code`, and `/analyze` for autonomous tasks.

## Results

### Project Architecture
The application follows a modern decoupled architecture. The frontend is a high-performance Next.js application that leverages the App Router for optimized rendering and routing. It communicates with a Spring Boot backend that is designed as a modular monolith, ensuring clear separation of concerns between different business domains (e.g., IMDB data vs. User management).

### Key Directories
| Path | Description |
| :--- | :--- |
| `src/app/` | Contains the page routes and layouts. |
| `src/components/` | Reusable React components. |
| `src/lib/` | API clients and utility functions. |
| `.agent/` | AI Agent configuration, rules, and knowledge base. |

### How to Use the Project
1. **Development Environment:**
   - Clone the repository.
   - Run `npm install` to install dependencies.
   - Use `npm run dev` to start the local development server.
2. **Interacting with the AI Agent:**
   - This project is optimized for AI-assisted development.
   - Use the **Plan Workflow** (`/plan`) when you want to design a new feature or analyze a complex bug.
   - Use the **Code Workflow** (`/code`) to implement changes or fixes.
   - Use the **Analyze Workflow** (`/analyze`) to review existing code or logs.
   - Refer to `.agent/reference/` for deep technical context on APIs and structures.

### Next Steps for Users
- Explore the `src/app` directory to see the page structure.
- Check `.agent/reference/backend-apis.md` to understand available data points.
- Use `/plan` for your first task to see the agent in action.
