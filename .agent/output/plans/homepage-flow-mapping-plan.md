# Plan: Homepage Flow and Project Mapping

## User's Intent
The user wants to explore the project structure and understand the navigation flow, specifically mapping the homepage elements (buttons, links) to their respective code files and destination routes.

## Project Flow Overview
The application follows a typical Next.js App Router structure with logical groupings for public and authenticated routes.

1.  **Entry Point**: `src/app/(public)/page.tsx` (Homepage)
2.  **Public Discovery**:
    - Browse Movies: `/movies` -> `src/app/(public)/movies/page.tsx`
    - Movie Details: `/movies/[id]` -> `src/app/(public)/movies/[id]/page.tsx`
    - Browse People: `/people` -> `src/app/(public)/people/page.tsx`
    - People Details: `/people/[id]` -> `src/app/(public)/people/[id]/page.tsx`
    - Search: `/search` -> `src/app/(public)/search/page.tsx`
3.  **Authentication**:
    - Login: `/login` -> `src/app/(auth)/login/page.tsx`
    - Register: `/register` -> `src/app/(auth)/register/page.tsx`
4.  **Authenticated/Dashboard**:
    - User Lists: `/lists` -> `src/app/(dashboard)/lists/page.tsx`
    - List Details: `/lists/[id]` -> `src/app/(dashboard)/lists/[id]/page.tsx`
    - User Profile: `/profile` -> `src/app/(dashboard)/profile/page.tsx`

---

## Homepage Mapping (src/app/(public)/page.tsx)

The homepage is composed of several modular components. Below is the mapping of interactive elements to their source code and targets.

### 1. Global Navigation (Navbar)
- **File**: `src/components/layout/Navbar.tsx`
- **Mapping**:
  | UI Element | Code Reference | Target Route |
  | :--- | :--- | :--- |
  | Logo (FilmDB) | `<Link href="/">` | `/` |
  | Movies Link | `<Link href="/movies">` | `/movies` |
  | People Link | `<Link href="/people">` | `/people` |
  | Lists Link | `<Link href="/lists">` | `/lists` |
  | Search Input | `<Form action="/search">` | `/search?q=...` |
  | Sign In Button | `<Link href="/login">` | `/login` |
  | Sign Up Button | `<Link href="/register">` | `/register` |

### 2. Hero Section
- **File**: `src/components/home/HeroSection.tsx`
- **Mapping**:
  | UI Element | Code Reference | Target Route |
  | :--- | :--- | :--- |
  | "Start Exploring" Button | `<Link href="/movies">` | `/movies` |
  | "Create Free Account" Button | `<Link href="/register">` | `/register` |

### 3. Trending Section
- **File**: `src/components/home/TrendingSection.tsx`
- **Mapping**:
  | UI Element | Code Reference | Target Route |
  | :--- | :--- | :--- |
  | "View all" Link | `<Link href="/trending">` | `/trending` (Note: `/trending` route currently missing in `src/app`) |
  | Movie Items | `MOCK_MOVIES.map(...)` | Renders `MovieCard` |

### 4. Movie Card
- **File**: `src/components/features/movies/MovieCard.tsx`
- **Mapping**:
  | UI Element | Code Reference | Target Route |
  | :--- | :--- | :--- |
  | Card Container | `<Link href={'/movies/${movie.id}'}>` | `/movies/[id]` |

### 5. Features Section
- **File**: `src/app/(public)/page.tsx` (Inline section)
- **Mapping**:
  - Current status: Static content highlighting features (Save for Later, Rate & Review, Share with Friends). No active links.

### 6. Global Footer
- **File**: `src/components/layout/Footer.tsx`
- **Mapping**:
  | UI Element | Target Route |
  | :--- | :--- |
  | Discover: Movies | `/movies` |
  | Discover: People | `/people` |
  | Discover: Trending | `/trending` |
  | Community: User Lists | `/lists` |
  | Community: Reviews | `/reviews` |
  | Community: Guidelines | `/guidelines` |
  | Account: Sign In | `/login` |
  | Account: Sign Up | `/register` |

---

## Evaluation of Current State
### Approach 1: Maintain Current Decoupled Structure (Recommended)
- **Pros**: Easy to manage, components are reusable, follow Atomic Design principles.
- **Cons**: Requires keeping multiple files open to understand full page flow.

### Approach 2: Centralized Route Configuration
- **Pros**: Single source of truth for all links/routes.
- **Cons**: Can become a bottleneck/overhead for a project of this size.

## Recommended Next Steps
1.  **Implement Missing Routes**: Create placeholders for `/trending`, `/reviews`, `/guidelines`, `/privacy`, and `/terms` to avoid 404s from the Footer and TrendingSection.
2.  **API Integration**: Replace mock data in `TrendingSection` with actual data from the backend.
3.  **Authentication Guard**: Implement middleware to protect `/lists` and `/profile` routes (partially handled in `src/middleware.ts` already).
