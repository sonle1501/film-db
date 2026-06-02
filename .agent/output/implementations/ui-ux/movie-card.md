# UI/UX Implementation Report: Movie Card Redesign

## User's Intent
The user wanted to enhance the movie item grid elements to be larger, styled in a cyberpunk aesthetic, and have improved legibility for the metadata (score, genre, and year). The specific requests included:
- Enlarging the `MovieCard` instances.
- Moving the rating/score value off the poster image.
- Displaying the count of votes (`numVotes`) on each card.
- Improving the general readability and visual layout of the score, genre, and year.

## Visual Enhancements Description
- **Geometric Rigor**: Kept strictly rectangular edges (`rounded-none`) to align with the retro-futuristic terminal philosophy in `DESIGN.md`.
- **Card Sizing**: Shifted grid column classes in search, listings, lists, and trending pages to show 1 fewer column on larger screen sizes, naturally increasing the card dimensions by 20-25%.
- **Poster Overlay Cleanup**: Removed the absolute rating tag from the top right of the poster to clear visual clutter, replacing it with a neon bottom border glow animation on hover.
- **Hierarchical Monospace Typography**: Positioned all core metrics in monospace fonts inside two neat, border-separated rows under the poster image:
  - **Row 1**: Displays year inside clean brackets `[ YYYY ]` and the genre name as a small outline cyan badge.
  - **Row 2**: Features rating as a Cyberpunk Yellow star-icon badge, and votes as a technical indicator `VTS // [Abbreviated Value]` (e.g. `VTS // 124.5K`).
- **Interactive Micro-Animations**:
  - The card shifts vertically (`hover:-translate-y-1`) on hover.
  - The card borders glow with Cyberpunk Cyan on hover (`box-shadow: 0 0 12px rgba(85,234,212,0.3)`).
  - The movie title transitions from white to glowing cyan.
  - The poster scales up slightly, and a thin neon bottom underline slides in from the left on hover.

## Modified UI Components & Files
1. **[MovieCard.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/features/movies/MovieCard.tsx)**: Added typescript properties and redesigned JSX markup and styles.
2. **[page.tsx (movies page)](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/movies/page.tsx)**: Enlarged cards via grid columns and mapped `votes: item.numVotes`.
3. **[page.tsx (genres page)](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/movies/genres/page.tsx)**: Mapped `votes: item.numVotes`.
4. **[page.tsx (search page)](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(public)/search/page.tsx)**: Enlarged cards and mapped `votes: movie.numVotes`.
5. **[page.tsx (list-details page)](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/(dashboard)/lists/[id]/page.tsx)**: Enlarged cards, typed map return as `MovieProps` and mapped `votes: data.numVotes`.
6. **[TrendingSection.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/components/home/TrendingSection.tsx)**: Adjusted columns and injected mock vote counts.

## Before/After Appearance Notes & Recommendations
- **Before**: Rating overlay on top of the image poster; small, closely packed details (year and genre) at the bottom; no vote counts displayed; maximum 5 cards horizontally on desktop.
- **After**: Larger cards with clean grid column sizing; poster is clear of elements; rating and vote counts are clearly labeled in an organized technical console style below the poster; hover states glow bright cyan with translation animations.
- **Recommendation**: To keep the retro-futuristic style consistent, utilize the `VTS // [Value]` format or `[ YYYY ]` brackets for other data list items throughout the app.
