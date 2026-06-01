# UI/UX Implementation Details Design Report: Cyberpunk Terminal Theme

## User's Intent
The user requested a global redesign of the Film DB frontend (`apps/frontend/film-db-ui`) to follow the cyberpunk, neo, and terminal-driven aesthetic principles outlined in [DESIGN.md](file:///s:/Coding/Projects/film-db/DESIGN.md). This includes updating authorization screens, watchlist dashboards, search catalogs, details sections, and all administrative sub-panels.

---

## Visual Enhancements Description
We applied a retro-futuristic styling system to all target surfaces and interactive states:
1. **Flat Hardware Geometry**: All interactive elements (buttons, fields, tags, table structures, modal popups) have strictly sharp edges (`rounded-none`).
2. **Technical Layout Systems**: Table headers, dashboard cards, grid blocks, and sidebar menus now leverage 1px borders (`border-white/10` or `.terminal-border`) resembling blueprints.
3. **Monospaced Hierarchy**: Headings and metadata labels use uppercase monospaced layouts with double-slash prefixes (e.g. `// SYSTEM_CONTROL_PANEL`), while descriptions use clean sans-serif for readability.
4. **Vibrant Terminal Colors (10% Accent Rule)**:
   - **Cyberpunk Cyan (`#55ead4`)**: Primary color for active states, link controls, search outlines, and successes.
   - **Cyberpunk Yellow (`#f3e600`)**: Used for rating markers, timeline active tracks, and system metrics.
   - **Cyberpunk Red (`#ff0055`)**: Denotes errors, alerts, and negative/destructive actions.
5. **Interactive Glows**: Elements transition smoothly on hover or focus using cyan and yellow shadow glows.

---

## Modified UI Components & Files

Here is the comprehensive log of files refactored during the migration:

### 1. Authorization
*   `src/app/(auth)/login/page.tsx`
*   `src/app/(auth)/register/page.tsx`

### 2. Layouts & Dashboards
*   `src/app/(dashboard)/layout.tsx`
*   `src/app/(dashboard)/lists/page.tsx`
*   `src/app/(dashboard)/lists/[id]/page.tsx`
*   `src/app/(dashboard)/profile/page.tsx`

### 3. Shared Components
*   `src/components/ui/Modal.tsx`
*   `src/components/features/lists/ListManager.tsx`
*   `src/components/features/movies/AddToListModal.tsx`
*   `src/components/features/movies/EditListItemModal.tsx`
*   `src/components/features/movies/SeasonsAndEpisodes.tsx`

### 4. Public Pages (Movies, Genres, People, & Search)
*   `src/app/(public)/movies/page.tsx`
*   `src/app/(public)/movies/genres/page.tsx`
*   `src/app/(public)/movies/[id]/page.tsx`
*   `src/app/(public)/movies/[id]/MovieSupplementaryInfoSection.tsx`
*   `src/app/(public)/people/page.tsx`
*   `src/app/(public)/people/[id]/page.tsx`
*   `src/app/(public)/search/page.tsx`

### 5. Administrative Modules
*   `src/app/admin/layout.tsx`
*   `src/app/admin/page.tsx`
*   `src/app/admin/import/page.tsx`
*   `src/app/admin/jobs/page.tsx`
*   `src/app/admin/users/page.tsx`

---

## Before/After Appearance Notes & Recommendations

| Element / View | Before Appearance | After Appearance | Styling Recommendations |
| :--- | :--- | :--- | :--- |
| **Borders & Corners** | Standard modern rounded items (`rounded-lg`, `rounded-full`). | Strictly sharp edges (`rounded-none` everywhere). | Enforce `rounded-none` on all newly added third-party widgets. |
| **Status Indicators** | Rounded pill elements. | Sharp text status badges with border glows. | Maintain HSL border matching for different states. |
| **Input Fields** | Default focus rings. | Cyan glowing borders (`focus:border-cyan-accent`). | Use uppercase placeholder texts for input grids. |
| **Action Commands** | Standard colored buttons. | Monospaced tags: `[ COMMAND ]` (e.g. `[ APPROVE ]` / `[ REJECT ]`). | Maintain square brackets on interactive control labels. |
| **Loading Indicators** | Spinner circles. | Monospaced blinking text with active cursors. | Leverage the `cursor-blink` keyframe animation from global styles. |
| **System Timeline** | Rounded bullet stages. | Monospaced step squares (`01`, `02`) with active glows. | Keep line separators muted border-white/10 to avoid clutter. |
