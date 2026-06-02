# Implementation Details: Header HUD Unification

This document details the aesthetic updates made to unify the catalog page headers, replacing default or simple header margins with the robust retro-futuristic Cyberpunk HUD styled header container first established on the movies directory page.

---

## 1. User's Intent
The user wanted to unify the UI across listing/search routes by applying the Cyberpunk Header HUD from the movies page (`/movies`) to the other directory-style pages:
- `/people`
- `/search`
- `/movies/genres`

---

## 2. Visual Enhancements Description
The following styling enhancements were implemented:
1. **Elevated Container Surface**: Replaced standard vertical spacing wrappers with `bg-surface-elevated-dark/30 border border-white/10 relative overflow-hidden`.
2. **Neon Accent Corners**: Added 4 distinct absolutely-positioned border corners in Cyberpunk Cyan (`border-cyan-accent`) in each header card to simulate an active electronic viewport interface.
3. **Monospaced Typographic Hierarchy**: Upgraded catalog main titles to standard sizing (e.g. `text-4xl md:text-5xl font-display uppercase tracking-widest text-white`).
4. **HUD Input Alignment**: Transformed the search form inputs and buttons in the people and search pages to utilize the neon interactive border class `terminal-border`, alongside background adjustments and monospace placeholders.

---

## 3. Modified UI Components & Files
The following files were modified:

- **[people/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/people/page.tsx)**:
  - Form container upgraded to include Header HUD container and corner decorations.
  - Search input box expanded with a terminal prompt layout (`> ENTER PERSON ID`), using lucide `Search` icon in Cyberpunk Cyan, and a prominent neon accent search button matching `/movies`.
  - Filter button converted to match the standard sizing and hover glowing state.

- **[search/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/search/page.tsx)**:
  - Header wrapper refactored to HUD style container.
  - Applied cyberpunk terminal border corner decorations.
  - Aligned typography size of `// SEARCH` title and spacing margins.

- **[movies/genres/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/movies/genres/page.tsx)**:
  - Upgraded standard genre banner wrapper to full HUD layout with neon Cyan corner decorations.
  - Enlarged `// EXPLORE_BY_GENRE` header font to `text-4xl md:text-5xl`.

---

## 4. Before/After Appearance Notes & Recommendations

| Page | Before State | After State (HUD Styling Applied) |
| :--- | :--- | :--- |
| **People List** | Minimal vertical spacing, low-contrast small text, simple borders. | Neon cyan border-accents on the header card, bold monospaced typography, stylized input form with prominent Cyberpunk cyan search button. |
| **Search** | Unframed header section, default fonts. | Elevated viewport container, matching `/movies` catalog visual language. |
| **Explore Genre** | Simple text blocks with standard tag icon. | Large display title with full HUD decoration lines, consistent border system, premium look. |

### Recommendation
Keep input styling consistent. Any future search filters or listing input controls should be wrapped inside elements using the `.terminal-border` utility class with a subtle transition duration of `0.2s` for glowing neon interactive states.
