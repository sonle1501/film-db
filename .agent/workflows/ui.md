---
description: Focus on UI enhancement, styling design, and visual polish, minimizing frontend logic changes and leaving the backend untouched.
---
# WORKFLOW: UI

**Trigger:** `/ui` slash command or UI enhancement request

## Core Objective
Enhance the visual appeal, layout, typography, animations, responsiveness, and general aesthetic quality of the user interface. Focus strictly on styling and presentation while keeping frontend application logic changes to a minimum and completely avoiding backend modifications.

## Core Principles
1. **Visual Excellence:** Follow best practices design patterns ( colors, refined typography, animations/transitions, cards, responsive grid layouts).
2. **Logic Isolation:** Keep styling improvements separated from core application logic. Do not break hooks, state management (Zustand/Query), or API flows.
3. **No Backend Impact:** Absolutely no changes to the backend APIs, schemas, controllers, or databases.
4. **Tailwind & CSS Alignment:** Utilize the project's styling setup (Tailwind CSS v4) correctly.

## Execution Steps
1. **Inspect UI Components:** Identify target React/Next.js components, pages, or layout files that require styling enhancement.
2. **Design Strategy:** Plan the visual changes (spacing, color palettes, micro-interactions, dark mode support, and typography).
3. **Enhance & Refactor Style:** Update class names, CSS files, or SVG assets. Keep JSX changes focused on structure and styling.
4. **Verify Aesthetics:** Check responsiveness, component alignment, layout consistency, and interactive states (hover, focus, active).
5. **Save plans:** Write the design plan report if user does not require implementation to`.agent/output/plans/ui-ux/<target-name>.md`.
5. **Save implementation:** Write the implementation details design report to `.agent/output/implementations/ui-ux/<target-name>.md`.
6. **Respond:** Summarize the UI changes made and link to the generated UI design document.

## Output Schema for the UI File
The generated asset MUST follow this exact structure:
- User's intent
- Visual enhancements description
- Modified UI components & files
- Before/After appearance notes or recommendations
