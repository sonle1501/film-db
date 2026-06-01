# UI Implementation Details: Homepage Redesign (Terminal Cyberpunk System)

This document contains the implementation details for the homepage layout updates and stylistic overhaul to align with the terminal-driven cyberpunk system.

---

## User's Intent
Redesign the homepage of `film-db-ui` to support flat terminal aesthetics, replace system placeholders, set website brand titles to `FILM-DB`, move and enlarge the system terminal widget in the Hero Section above the main title, extend search bar width to 80%, remove explore/credentials buttons, exclude placeholder movie lists, layout a dual-column terminal console (ASCII art on the left, bash-style `systemctl status` report logs on the right), drag the Navigation Grid up, and unify its background color with the Hero Section under a single wrapper monitor panel. Additionally, stylize the Hero Section to simulate a sci-fi cyberpunk HUD (computer control screen) and redesign the Navigation Grid cards to keep only the title and description, enclosed in nested borders and high-density compartments.

---

## Visual Enhancements Description
We successfully refactored the homepage components from a soft glassmorphism style into a sharp, flat, dark-charcoal command-line terminal system:

1. **Monospace Display Typography**: Configured Google Font `Share Tech Mono` as the primary font-display variable (`--font-display`). Assigned uppercase styling, wide tracking, and bold weights to headings, system tags, and inputs.
2. **Hard-Edged Architecture**: Strictly applied `rounded-none` borders and `0px` border-radii across buttons, input boxes, cards, drawers, and modal containers.
3. **Cyberpunk Color Scheme (60-30-10 Rule)**:
   - **Background (60%)**: Deep Charcoal Grey (`#323232`).
   - **Neutral Elements (30%)**: Body text (`#c8c8c8`), borders/dividers (`#4a4a4a`).
   - **Interactive Accents (10%)**: Cyan highlights (`#55ead4`) for main buttons, suggestions, active tabs, and input focus; Yellow highlights (`#f3e600`) for ratings, system metrics, and specific secondary action outlines.
4. **Dual-Column ASCII Terminal Window**: Placed a large simulated terminal window above the main title in the Hero Section:
   - **Console Title Bar**: Features window controls (`MIN`, `MAX`, `CLOSE`) and system identifier `CONSOLE_LOG // TERMINAL.SYS` in Cyan.
   - **Left Column**: Custom styled `FILM-DB` ASCII art logo in Cyberpunk Cyan.
   - **Right Column**: Simulates a bash prompt `sonle@film-db:~$ systemctl status film-db` with highlighted project stats (Author, Dataset, Capacity, Theme Engine, and active green blinking `ONLINE / READY` cursor).
5. **Sci-Fi Cyberpunk HUD Style**: Added high-tech telemetry visual elements to the Hero Section:
   - **HUD Corner Brackets**: Thin cyan/white corner bounds outlining the monitor screen space.
   - **Scale Gauge Bars**: Absolute-positioned vertical scale grids on the left/right edges simulating altitude or radar signals (`00`, `25`, `50`, `75`, `99` / `MAX`, `MID`, `MIN`).
   - **Filter Compartment Panel**: Packed quick tags into a dedicated module box titled `SELECT_MODULE_INDEX // QUICK_FILTERS` with high-contrast indicator dots.
6. **Nested Border Navigation Grid Cards**: Rebuilt the layout grid using an interface compartment style:
   - **Nested Borders**: Outer `p-[3px]` inset border lacing combined with inner `border-white/5` walls.
   - **Isolated Compartments**: Segmented the card info into dedicated boxes—a split Header Box (for title and icon), a larger central description box, and a status/grid indicator bar at the bottom (`GRID // BLOCK_0X` and `SYSTEM_OK`).
   - **Removed Mock Elements**: Excluded high-density image widgets, sysCode lines, and access channel buttons to focus purely on neat titles, descriptions, and system states.
7. **Unified Background Wrapper**: Moved the absolute background scanlines, grid overlays, gradients, and vertical lines to the main parent wrapper in [page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/page.tsx). This ensures both the Hero Section and the Navigation Grid share the exact same background flow as a single integrated monitor screen.

---

## Modified UI Components & Files

### 1. [globals.css](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/globals.css)
- Configured Tailwind CSS v4 `@theme` directives with Cyberpunk Cyan/Yellow, Deep Charcoal background, flat elevated shades, and monospace displays.
- Defined `.terminal-border` utility classes with border glows and animation keyframes for cursor blinking.
- Removed Glassmorphism gradients and borders.

### 2. [layout.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/layout.tsx)
- Loaded `Share_Tech_Mono` from `next/font/google` and configured it as the `--font-display` Tailwind variable.
- Re-assigned page meta titles to match a system interface: `FILM-DB`.

### 3. [Navbar.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/layout/Navbar.tsx)
- Monospace brand logo: `FILM-DB`.
- Converted navigation links into flat block-grid tabs dividing the navbar with `1px` border lines.
- Refactored login and sign-up buttons to use sharp outlined styling with Cyan and Yellow terminal coloring.
- Implemented `showSearch={false}` logic integration to prevent search duplication on the homepage.

### 4. [HeroSection.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/home/HeroSection.tsx)
- Centered layout orientation with HUD-themed elements (brackets, scales, filters module panel).
- Added terminal title bar console wrappers around the ASCII terminal content.
- Renamed display title to `EXPLORE FILM-DB` with a gradient cross-divider detail bar.
- Widened the Search Input bar to cover `w-[80%] max-w-4xl`.
- Removed secondary explore buttons and unified with parent backgrounds.

### 5. [LiveSearchInput.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/ui/LiveSearchInput.tsx)
- Replaced the default search icon with a command-line prompt `>` character in the Hero view.
- Overhauled focus states to trigger a cyan shadow glow.
- Refactored suggestion item cards with monospaced text and sharp edges.
- Placed an outlined "EXECUTE" submit button.

### 6. [NavigationGrid.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/home/NavigationGrid.tsx)
- Implemented high-density nested compartments for navigation cells.
- Removed mock visual blueprint panels, sysCode lines, and access arrows.
- Locked title/icon, description, and status checks in discrete outline grids with active pulsing indicators.

### 7. [page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/page.tsx)
- Configured a `<main>` container with relative z-index overlays carrying the matrix scanlines and vertical guidelines spanning the entire homepage.
- Removed the old watchlist card section and mock trending carousels.

---

## Before/After Appearance Notes & Recommendations

| Aspect | Glassmorphic System (Before) | Terminal Cyberpunk System (After) |
| :--- | :--- | :--- |
| **Border Radii** | `rounded-xl` / `rounded-full` (8px–16px) | `rounded-none` (0px - Sharp edges across all views) |
| **Palette & BG** | Zinc 950 dark black backdrop | Deep Charcoal Grey `#323232` backing |
| **Accents** | Royal blue badges and buttons | Cyberpunk Cyan `#55ead4` & Yellow `#f3e600` outlines |
| **Logo** | `FilmDB` text | Monospaced title: `FILM-DB` |
| **Grid** | Standard feature details cards | 2x3 blueprint navigation cells with active layout previews |
| **Buttons & Input**| Blur backdrops with hover scale | Outlined boxes, cursor blink prompts, cyan text fills on hover |

### Recommendations for Future Views:
1. **Details View**: Extend the `1px` border grid lines to movie detail pages to maintain a consistent technical document style.
2. **Tabbed Lists**: Use similar block-tab bars for lists and profile views to stay aligned with the command menu aesthetic.
