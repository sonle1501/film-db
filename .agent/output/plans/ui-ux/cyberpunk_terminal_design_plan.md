# UI-UX Design Plan: Terminal-Driven Cyberpunk Interface Refinement

## User's Intent
The user requested a design plan to shift the application's aesthetic from the previous Glassmorphism layout to the new **Terminal-Driven Cyberpunk Interface Refinement** styling. This includes updating the rules at [DESIGN.md](file:///s:/Coding/Projects/film-db/.agent/rules/DESIGN.md), outlining the frontend implementation plan, and updating the design system in Stitch MCP. No coding implementation is required at this stage.

---

## Visual Enhancements Description
We are migrating the entire visual experience to a vintage-cyberpunk terminal feel that honors raw cinema data. Key styling enhancements include:

### 1. Typography & Grid Architecture
- **Monospace Focus**: Use `Share Tech Mono` for all headings, labels, metrics, states, and buttons to give a command-line look.
- **Readable Body Text**: Retain `Space Grotesk` or `Inter` for plot summaries/plots to prevent eye fatigue from monospace spacing.
- **Sharp Hard-Edges**: Set all border radii to `0px` (disable `rounded-xl`, `rounded-full`, etc.).
- **Visual Dividers**: Solid `1px` lines resembling grid lines from engineering blueprints (`#4a4a4a`).

### 2. Palette (60-30-10 Rule)
- **Background (60%)**: `#323232` (dark charcoal gray).
- **Secondary/Neutral (30%)**: `#c8c8c8` (text body) and `#4a4a4a` (borders/dividers).
- **Accent Highlighting (10%)**:
  - **Cyan (`#55ead4`)**: User navigation, interactive active/hover states, input focus, buttons.
  - **Yellow (`#f3e600`)**: Data points, IMDb score badges, rankings, user role tags.

### 3. Interactive Dynamics (Animations)
- **Pulse/Blink Cursor**: Adding an input prefix `> _` with a 500ms blinking cursor animation.
- **Neon Hover Glows**: Active and hovered elements change border color to Cyan with a subtle 5px blur box shadow (`rgba(85,234,212,0.4)`).
- **Inverted Buttons**: Outlined Cyan buttons fill completely with Cyan text, shifting background color on hover to `#323232` instantly.

---

## Modified UI Components & Files
The proposed frontend changes will be localized to the following core style and component sheets:

1. **Global Configuration Sheets**:
   - [globals.css](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/globals.css): Replace Glassmorphic variables with Cyberpunk variables. Remove base roundness defaults. Add `@keyframes blink` and `.cursor-blink`.
   - [layout.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/layout.tsx): Replace Google Font `Outfit` with `Share Tech Mono` (`--font-display`). Import `Space Grotesk` or keep `Inter` for (`--font-sans`).

2. **Core Layout Elements**:
   - [Navbar.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/layout/Navbar.tsx):
     - Update branding logo to monospace text `[ FILM_DB // SYS_v1.0 ]`.
     - Refactor navigation tabs into flat rectangular menu items.
     - Redesign the Sign In button as outlined Cyan and Sign Up button as outlined Yellow.
   - [Footer.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/layout/Footer.tsx): Include technical render information, server uptime log simulation (`SERVER_STATUS: ONLINE // RENDER_TIME: 0.042s`), and data attribution.

3. **Homepage Sections**:
   - [HeroSection.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/home/HeroSection.tsx):
     - Remove background glow images/radial circles. Replace with sharp matrix grid overlays or abstract technical blueprint lines.
     - Correct title string count: *"Over 10+ million titles and 100+ million data points, powered by official IMDb core datasets."*
     - Update central search input with prompt prefix `> _` and blink cursor.
     - Add Filter Tags beneath search bar as toggles (`[TOP_250_RATED]`, etc.) switching to Yellow `#f3e600` when active.
   - [TrendingSection.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/home/TrendingSection.tsx) & [MovieCard.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/features/movies/MovieCard.tsx):
     - Remove card rounding and shadows. Replace with flat `#3a3a3a` background cards.
     - Add Y-axis transition `translate-y-[-2px]` on hover.
     - Implement `text-overflow: ellipsis` on titles with horizontal marquee scroll animation on hover.
     - Change movie rating stars to Neon Yellow `#f3e600` badges with sharp corners.

4. **Modals & Inputs**:
   - [Modal.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/ui/Modal.tsx): Re-style with `rounded-none`, `#323232` background fill, `border-cyan-500` glow outline, and sharp corner closing buttons.

---

## Before/After Appearance Notes or Recommendations

| Component | Glassmorphism (Before) | Cyberpunk Refinement (After) |
| :--- | :--- | :--- |
| **Borders** | Rounded corners (8px–16px), transparent overlay | Hard sharp edges (0px), solid `1px` lines |
| **Brand Logo** | Styling: `FilmDB` (with blue DB) | Styling: `[ FILM_DB // SYS_v1.0 ]` in monospace |
| **Primary Color** | Royal Blue / Blue-600 (`#3b82f6`) | Cyberpunk Neon Cyan (`#55ead4`) |
| **Accent Badges** | Gold/Yellow stars on dark capsules | Solid Neon Yellow (`#f3e600`) sharp badges |
| **Hover Effects** | Translucent glass hover / scale up | Cyan fill inversion, terminal cursor blink, glow |
| **Search Input** | Soft rounded box with backdrop blur | Outlined box, prefix pointer `> _` with blink cursor |

### Design Optimization Recommendations
1. **Prevent Monospace Fatigue**: Do not use `Share Tech Mono` for plot/cast description copy. Keep descriptions styled with `Space Grotesk` or `Inter` to retain optimal spacing and reading speeds.
2. **Layout Shifts**: Ensure border hover states don't change size (e.g. going from `0px` border to `1px` border causes elements to shift). Always set a static border (`border border-transparent` or `border border-neutral-700`) and only transition the color.
3. **Ellipsis vs Marquee**: When names/titles overflow, truncate with `ellipsis` first and run marquee scroll on hover so layouts are not stretched by extremely long strings.
